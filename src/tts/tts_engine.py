import asyncio
import hashlib
import json
import os
import re
import site
import subprocess
import sys
import numpy as np


def _register_nvidia_cuda_dlls():
    """Ensure pip-installed NVIDIA cuBLAS/cuDNN DLLs are on PATH for RTX GPU acceleration."""
    try:
        candidates = []
        for sp in site.getsitepackages():
            nvidia_root = os.path.join(sp, "nvidia")
            if os.path.isdir(nvidia_root):
                for sub in os.listdir(nvidia_root):
                    bin_dir = os.path.join(nvidia_root, sub, "bin")
                    if os.path.isdir(bin_dir):
                        candidates.append(bin_dir)
        if candidates:
            os.environ["PATH"] = os.pathsep.join(candidates) + os.pathsep + os.environ.get("PATH", "")
            if hasattr(os, "add_dll_directory"):
                for d in candidates:
                    try:
                        os.add_dll_directory(d)
                    except Exception:
                        pass
    except Exception:
        pass


_register_nvidia_cuda_dlls()


ZEROTTS_BUILTIN_VOICES = {
    "giong_mau",
    "giahuy",
    "huuduc",
    "quangminh",
    "tiendat",
    "maichi",
    "baotrang",
    "kimoanh",
    "hamy"
}


def get_audio_duration(file_path: str) -> float:
    """Get exact audio duration in seconds using ffprobe."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        file_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0


def parse_rate_to_atempo(rate_str: str) -> float:
    """Convert '+8%' or '-5%' or '1.08' to an ffmpeg atempo multiplier [0.5, 2.0]."""
    if not rate_str:
        return 1.0
    s = str(rate_str).strip()
    m = re.match(r"^([+-]?\d+(?:\.\d+)?)%$", s)
    if m:
        pct = float(m.group(1))
        return max(0.6, min(1.8, 1.0 + pct / 100.0))
    try:
        val = float(s)
        if 0.5 <= val <= 2.0:
            return val
    except ValueError:
        pass
    return 1.0


def chunk_words_for_karaoke(words_timing: list, max_words_per_chunk: int = 5) -> list:
    """
    Group word timings into short 1-line karaoke chunks (4-6 words per chunk)
    just like the reference video where Vietnamese subtitles show one short uppercase
    line at a time while words highlight in yellow.
    """
    chunks = []
    if not words_timing:
        return chunks

    current_chunk = []
    for w in words_timing:
        current_chunk.append(w)
        text = w.get("word", "")
        ends_punct = any(text.endswith(p) for p in [",", ".", "!", "?", ":", ";", "…"])
        if len(current_chunk) >= max_words_per_chunk or (ends_punct and len(current_chunk) >= 3):
            chunks.append({
                "start": current_chunk[0]["start"],
                "end": current_chunk[-1]["end"],
                "text": " ".join(item["word"] for item in current_chunk),
                "words": current_chunk
            })
            current_chunk = []

    if current_chunk:
        chunks.append({
            "start": current_chunk[0]["start"],
            "end": current_chunk[-1]["end"],
            "text": " ".join(item["word"] for item in current_chunk),
            "words": current_chunk
        })

    return chunks


def is_zerotts_or_cloned_voice(voice: str) -> bool:
    """Return True if voice refers to a ZeroTTS / cloned voice rather than Edge-TTS."""
    if not voice:
        return False
    v = voice.strip()
    if v.startswith("zerotts:") or v.startswith("clone:"):
        return True
    if v.lower() in ZEROTTS_BUILTIN_VOICES:
        return True
    # Check if a voice pack exists in project voices/ or ~/.zerotts/voices/
    proj_voices = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "voices"))
    if os.path.exists(os.path.join(proj_voices, v, "voice.npz")):
        return True
    if os.path.exists(os.path.join(os.path.expanduser("~/.zerotts/voices"), v, "voice.npz")):
        return True
    if os.path.isfile(v):
        return True
    return False


def align_words_with_whisper(whisper_model, audio_path: str, text: str, audio_dur: float) -> list:
    """
    Extract accurate word-by-word timestamps from synthesized audio using faster-whisper
    and map them cleanly onto the exact Vietnamese tokens of `text`.
    """
    raw_tokens = [t for t in text.strip().split() if t]
    if not raw_tokens:
        return []

    detected = []
    if whisper_model:
        try:
            segments, _ = whisper_model.transcribe(
                audio_path,
                language="vi",
                word_timestamps=True,
                condition_on_previous_text=False
            )
            for seg in segments:
                for w in (seg.words or []):
                    detected.append({
                        "start": max(0.0, float(w.start)),
                        "end": min(audio_dur, max(float(w.end), float(w.start) + 0.06))
                    })
        except Exception:
            detected = []

    # If whisper was unavailable, use acoustic energy + punctuation-weighted alignment
    if not detected and audio_dur > 0:
        weights = []
        for tok in raw_tokens:
            w = max(1.0, len(tok.strip(",.!?:;…\"'")) * 0.22 + 0.55)
            if any(tok.endswith(p) for p in [",", ":", ";"]):
                w += 0.45
            elif any(tok.endswith(p) for p in [".", "!", "?", "…"]):
                w += 0.65
            weights.append(w)
        total_w = sum(weights) or 1.0
        cur = 0.0
        result = []
        for i, tok in enumerate(raw_tokens):
            dur_w = (weights[i] / total_w) * audio_dur
            st = round(cur, 4)
            en = round(min(audio_dur, cur + dur_w), 4)
            result.append({
                "word": tok,
                "start": st,
                "end": en,
                "duration": round(max(0.06, en - st), 4)
            })
            cur += dur_w
        return result

    n_tok = len(raw_tokens)
    n_det = len(detected)

    if n_det == 0:
        step = max(audio_dur / max(n_tok, 1), 0.08)
        return [
            {
                "word": tok,
                "start": round(i * step, 4),
                "end": round(min(audio_dur, (i + 1) * step), 4),
                "duration": round(step, 4)
            }
            for i, tok in enumerate(raw_tokens)
        ]

    if n_det == n_tok:
        result = []
        for i, tok in enumerate(raw_tokens):
            st = round(detected[i]["start"], 4)
            en = round(max(st + 0.06, detected[i]["end"]), 4)
            result.append({
                "word": tok,
                "start": st,
                "end": en,
                "duration": round(en - st, 4)
            })
        return result

    # Interpolate smoothly across detected word boundaries when token count differs slightly
    result = []
    for i, tok in enumerate(raw_tokens):
        pos0 = (i / float(n_tok)) * n_det
        pos1 = ((i + 1) / float(n_tok)) * n_det
        idx0 = min(n_det - 1, int(np.floor(pos0)))
        idx1 = min(n_det - 1, max(idx0, int(np.ceil(pos1)) - 1))
        st = round(detected[idx0]["start"], 4)
        en = round(max(st + 0.07, detected[idx1]["end"]), 4)
        result.append({
            "word": tok,
            "start": st,
            "end": en,
            "duration": round(en - st, 4)
        })
    return result


class ClonedVoiceEngine:
    """Lazy-initialized ZeroTTS + Faster-Whisper engine for local AI Voice Cloning."""

    def __init__(self):
        self.tts = None
        self.whisper = None
        self.proj_voices_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "voices")
        )

    def ensure_loaded(self):
        if self.whisper is None:
            try:
                import ctranslate2
                from faster_whisper import WhisperModel
                if ctranslate2.get_cuda_device_count() > 0:
                    try:
                        self.whisper = WhisperModel("base", device="cuda", compute_type="float16")
                    except Exception:
                        self.whisper = WhisperModel("base", device="cpu", compute_type="int8", cpu_threads=4)
                else:
                    self.whisper = WhisperModel("base", device="cpu", compute_type="int8", cpu_threads=4)
            except Exception:
                self.whisper = False
        if self.tts is None:
            import onnxruntime as ort
            from zerotts import ZeroTTS, resolve_model_dir
            model_dir = str(resolve_model_dir("zeroweight-ai/ZeroTTS"))
            avail = ort.get_available_providers()
            preferred = []
            for p in ("CUDAExecutionProvider", "DmlExecutionProvider", "CPUExecutionProvider"):
                if p in avail:
                    preferred.append(p)
            if not preferred:
                preferred = ["CPUExecutionProvider"]
            try:
                self.tts = ZeroTTS(model_dir, providers=preferred, intra_op_num_threads=4)
            except Exception:
                self.tts = ZeroTTS(model_dir, providers=["CPUExecutionProvider"], intra_op_num_threads=4)
            if os.path.isdir(self.proj_voices_dir):
                try:
                    self.tts.add_voices(self.proj_voices_dir)
                except Exception:
                    pass

    def resolve_voice_arg(self, voice_str: str, voice_sample: str = None):
        self.ensure_loaded()
        if voice_sample and os.path.isfile(voice_sample):
            from voice_cloner import extract_clean_voice_embedding
            custom_id = "custom_" + hashlib.md5(os.path.abspath(voice_sample).encode()).hexdigest()[:8]
            npz_path = os.path.join(self.proj_voices_dir, custom_id, "voice.npz")
            if not os.path.exists(npz_path):
                extract_clean_voice_embedding(voice_sample, voice_name=custom_id)
            return np.load(npz_path)["voice_emb"]

        v = voice_str.strip()
        for prefix in ("zerotts:", "clone:"):
            if v.startswith(prefix):
                v = v[len(prefix):].strip()

        if os.path.isfile(v):
            from voice_cloner import extract_clean_voice_embedding
            custom_id = "custom_" + hashlib.md5(os.path.abspath(v).encode()).hexdigest()[:8]
            npz_path = os.path.join(self.proj_voices_dir, custom_id, "voice.npz")
            if not os.path.exists(npz_path):
                extract_clean_voice_embedding(v, voice_name=custom_id)
            return np.load(npz_path)["voice_emb"]

        # Check project voices/<v>/voice.npz first
        local_npz = os.path.join(self.proj_voices_dir, v, "voice.npz")
        if os.path.exists(local_npz):
            return np.load(local_npz)["voice_emb"]

        return v

    def synthesize_segment(
        self,
        text: str,
        voice: str,
        rate: str,
        out_mp3: str,
        voice_sample: str = None
    ) -> list:
        self.ensure_loaded()
        voice_target = self.resolve_voice_arg(voice, voice_sample=voice_sample)

        raw_wav = out_mp3 + ".raw.wav"
        audio = self.tts.synthesize(
            text,
            voice=voice_target,
            cfg_scale=1.0,
            audio_temperature=0.78,
            audio_repetition_penalty=1.2
        )
        self.tts.save_audio(audio, raw_wav)

        atempo = parse_rate_to_atempo(rate)
        af_filters = [
            "areverse",
            "silenceremove=start_periods=1:start_silence=0.06:start_threshold=-48dB",
            "areverse"
        ]
        if abs(atempo - 1.0) > 0.01:
            af_filters.append(f"atempo={atempo:.3f}")

        subprocess.run([
            "ffmpeg", "-y", "-i", raw_wav,
            "-af", ",".join(af_filters),
            "-ar", "44100", "-ac", "2", "-b:a", "192k",
            out_mp3
        ], capture_output=True, check=True)

        try:
            os.remove(raw_wav)
        except OSError:
            pass

        dur = get_audio_duration(out_mp3)
        return align_words_with_whisper(self.whisper, out_mp3, text, dur)


async def synthesize_segment_edge_tts(text: str, voice: str, rate: str, pitch: str, out_mp3: str):
    """Synthesize a single segment with edge-tts with automatic retry."""
    import edge_tts

    word_boundaries = []
    last_err = None
    for attempt in range(5):
        try:
            word_boundaries = []
            communicate = edge_tts.Communicate(
                text=text,
                voice=voice,
                rate=rate,
                pitch=pitch,
                boundary="WordBoundary"
            )
            with open(out_mp3, "wb") as f:
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        start_sec = chunk["offset"] / 10_000_000.0
                        dur_sec = chunk["duration"] / 10_000_000.0
                        word_boundaries.append({
                            "word": chunk["text"],
                            "start": round(start_sec, 4),
                            "end": round(start_sec + max(dur_sec, 0.08), 4),
                            "duration": round(max(dur_sec, 0.08), 4)
                        })
            if os.path.exists(out_mp3) and os.path.getsize(out_mp3) > 100:
                last_err = None
                break
        except Exception as e:
            last_err = e
            await asyncio.sleep(1.0 * (attempt + 1))

    if last_err is not None and (not os.path.exists(out_mp3) or os.path.getsize(out_mp3) < 100):
        raise last_err

    raw_tokens = [t for t in text.strip().split() if t]
    if len(raw_tokens) == len(word_boundaries):
        for i, tok in enumerate(raw_tokens):
            word_boundaries[i]["word"] = tok

    return word_boundaries


async def process_project(input_json_path: str, output_dir: str):
    with open(input_json_path, "r", encoding="utf-8") as f:
        project = json.load(f)

    os.makedirs(output_dir, exist_ok=True)
    segments_dir = os.path.join(output_dir, "segments")
    os.makedirs(segments_dir, exist_ok=True)

    voice = project.get("voice", "giong_mau")
    voice_sample = project.get("voiceSample", "")
    rate = project.get("rate", "+8%")
    pitch = project.get("pitch", "+0Hz")
    pause_between = float(project.get("pauseBetweenSegments", 0.06))
    outro_duration = float(project.get("outroDuration", 3.5))

    use_cloned = bool(voice_sample) or is_zerotts_or_cloned_voice(voice)
    cloned_engine = ClonedVoiceEngine() if use_cloned else None

    segments = project.get("segments", [])
    enriched_segments = []
    concat_files = []

    current_time = 0.0

    # Generate silent pause file if pause_between > 0
    silence_mp3 = os.path.join(segments_dir, "silence.mp3")
    if pause_between > 0:
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", "anullsrc=r=44100:cl=stereo",
            "-t", str(pause_between),
            "-q:a", "4", silence_mp3
        ], capture_output=True)

    for idx, seg in enumerate(segments):
        vi_text = seg.get("vi", "").strip()
        if not vi_text:
            continue

        seg_mp3 = os.path.join(segments_dir, f"seg_{idx:03d}.mp3")
        seg_meta_json = seg_mp3 + ".meta.json"
        cache_sig = f"{vi_text}|{voice}|{voice_sample}|{rate}|{pitch}"

        words = None
        if os.path.exists(seg_mp3) and os.path.getsize(seg_mp3) > 200 and os.path.exists(seg_meta_json):
            try:
                with open(seg_meta_json, "r", encoding="utf-8") as mf:
                    cached = json.load(mf)
                if cached.get("sig") == cache_sig and cached.get("words"):
                    words = cached["words"]
            except Exception:
                words = None

        if words is None:
            if use_cloned:
                words = cloned_engine.synthesize_segment(
                    vi_text,
                    voice=voice,
                    rate=rate,
                    out_mp3=seg_mp3,
                    voice_sample=voice_sample
                )
            else:
                words = await synthesize_segment_edge_tts(vi_text, voice, rate, pitch, seg_mp3)
                await asyncio.sleep(0.35)

            with open(seg_meta_json, "w", encoding="utf-8") as mf:
                json.dump({"sig": cache_sig, "words": words}, mf, ensure_ascii=False)

        dur = get_audio_duration(seg_mp3)

        # Fallback if word boundaries are empty
        if not words and vi_text:
            tokens = vi_text.split()
            step = max(dur / max(len(tokens), 1), 0.1)
            for i, tok in enumerate(tokens):
                words.append({
                    "word": tok,
                    "start": round(i * step, 4),
                    "end": round((i + 1) * step, 4),
                    "duration": round(step, 4)
                })

        # Shift word timings by current_time
        shifted_words = []
        for w in words:
            shifted_words.append({
                "word": w["word"],
                "start": round(current_time + w["start"], 4),
                "end": round(current_time + w["end"], 4),
                "duration": w["duration"]
            })

        # Close small gaps between consecutive words for smooth karaoke highlight
        for i in range(len(shifted_words) - 1):
            if shifted_words[i + 1]["start"] - shifted_words[i]["end"] < 0.25:
                shifted_words[i]["end"] = shifted_words[i + 1]["start"]

        karaoke_chunks = chunk_words_for_karaoke(shifted_words, max_words_per_chunk=5)

        seg_start = round(current_time, 4)
        seg_end = round(current_time + dur, 4)

        enriched_seg = {
            **seg,
            "index": idx,
            "startTime": seg_start,
            "endTime": seg_end,
            "duration": round(dur, 4),
            "words": shifted_words,
            "karaokeChunks": karaoke_chunks
        }
        enriched_segments.append(enriched_seg)
        concat_files.append(seg_mp3)

        current_time += dur
        if pause_between > 0 and idx < len(segments) - 1:
            concat_files.append(silence_mp3)
            current_time += pause_between

    # Add silent outro if configured
    if outro_duration > 0:
        outro_mp3 = os.path.join(segments_dir, "outro_silence.mp3")
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", "anullsrc=r=44100:cl=stereo",
            "-t", str(outro_duration),
            "-q:a", "4", outro_mp3
        ], capture_output=True)
        concat_files.append(outro_mp3)

        enriched_segments.append({
            "index": len(enriched_segments),
            "vi": "",
            "en": "",
            "receipt": "",
            "scene": project.get("outroScene", "tank_outro"),
            "camera": project.get("outroCamera", "final_tank_zoom"),
            "startTime": round(current_time, 4),
            "endTime": round(current_time + outro_duration, 4),
            "duration": round(outro_duration, 4),
            "words": [],
            "karaokeChunks": [],
            "isOutro": True
        })
        current_time += outro_duration

    # Concatenate all audio files into voiceover.mp3
    concat_list_path = os.path.join(segments_dir, "concat_list.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for file_path in concat_files:
            escaped = file_path.replace("\\", "/")
            f.write(f"file '{escaped}'\n")

    final_audio_path = os.path.join(output_dir, "voiceover.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list_path,
        "-ar", "44100", "-ac", "2", "-b:a", "192k",
        final_audio_path
    ], capture_output=True)

    total_duration = get_audio_duration(final_audio_path) or current_time

    timeline = {
        "title": project.get("title", "TƯ DUY DÀI HẠN"),
        "watermark": project.get("watermark", ""),
        "voice": voice,
        "rate": rate,
        "pitch": pitch,
        "width": project.get("width", 1080),
        "height": project.get("height", 1920),
        "fps": project.get("fps", 30),
        "totalDuration": round(total_duration, 4),
        "audioPath": final_audio_path,
        "segments": enriched_segments
    }

    timeline_path = os.path.join(output_dir, "timeline.json")
    with open(timeline_path, "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)

    print(json.dumps({
        "status": "ok",
        "timelinePath": timeline_path,
        "audioPath": final_audio_path,
        "totalDuration": timeline["totalDuration"],
        "segmentCount": len(enriched_segments)
    }))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python tts_engine.py <input_project.json> <output_dir>")
        sys.exit(1)
    asyncio.run(process_project(sys.argv[1], sys.argv[2]))

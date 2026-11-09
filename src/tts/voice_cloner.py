import json
import os
import subprocess
import sys
import numpy as np
import onnxruntime as ort
import soundfile as sf
from scipy.signal import istft, resample_poly, stft
from huggingface_hub import hf_hub_download
from zerotts import resolve_model_dir


def extract_clean_voice_embedding(
    input_media_path: str,
    voice_name: str = "giong_mau",
    display_name: str = "Giọng Mẫu (Cloned)",
    blend_studio_voice: str = "giahuy",
    blend_ratio: float = 0.20,
    out_project_voices_dir: str = None
) -> str:
    """
    Extract a clean ZeroTTS speaker latent embedding (1, 10, 768) from any audio/video file
    (.mp4, .mp3, .wav, .m4a) using MOSS-Audio-Tokenizer-Nano-ONNX encoder + ZeroTTS voice_encoder.onnx.
    Saves the resulting voice pack to ~/.zerotts/voices/<voice_name> and project voices/<voice_name>.
    """
    if not os.path.exists(input_media_path):
        raise FileNotFoundError(f"Không tìm thấy file giọng mẫu: {input_media_path}")

    if out_project_voices_dir is None:
        out_project_voices_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "voices")
        )
    os.makedirs(out_project_voices_dir, exist_ok=True)

    temp_wav = os.path.join(out_project_voices_dir, f"_tmp_{voice_name}_24k.wav")
    subprocess.run([
        "ffmpeg", "-y", "-i", input_media_path,
        "-vn", "-ac", "1", "-ar", "24000", temp_wav
    ], capture_output=True, check=True)

    y, sr = sf.read(temp_wav, dtype="float32")
    try:
        os.remove(temp_wav)
    except OSError:
        pass

    total_sec = len(y) / float(sr)

    # Estimate background music/noise spectrum from quietest 15% frames or outro if > 68s
    f, t, Z = stft(y, fs=sr, nperseg=1024, noverlap=768)
    mag = np.abs(Z)
    phase = np.angle(Z)

    frame_energy = np.mean(mag, axis=0)
    if total_sec > 70.0:
        # Reference video has music-only outro after 68.8s
        outro_slice = y[int(68.8 * sr):int(min(total_sec, 73.0) * sr)]
        _, _, Z_noise = stft(outro_slice, fs=sr, nperseg=1024, noverlap=768)
        noise_profile = np.percentile(np.abs(Z_noise), 85, axis=1, keepdims=True)
        speech_end_idx = int(65.0 * sr)
    else:
        quiet_thresh = np.percentile(frame_energy, 20)
        quiet_cols = mag[:, frame_energy <= quiet_thresh]
        if quiet_cols.shape[1] > 0:
            noise_profile = np.percentile(quiet_cols, 80, axis=1, keepdims=True)
        else:
            noise_profile = np.zeros((mag.shape[0], 1), dtype=np.float32)
        speech_end_idx = len(y)

    speech_raw = y[:speech_end_idx]
    f, t, Z_sp = stft(speech_raw, fs=sr, nperseg=1024, noverlap=768)
    mag_sp = np.abs(Z_sp)
    phase_sp = np.angle(Z_sp)

    # Suppress sub-bass (<110Hz) and subtract noise profile
    freq_mask = np.clip((f - 110.0) / 40.0, 0.0, 1.0)[:, None]
    clean_mag = np.maximum(mag_sp - 1.6 * noise_profile, 0.02 * mag_sp) * freq_mask
    _, speech_clean = istft(clean_mag * np.exp(1j * phase_sp), fs=sr, nperseg=1024, noverlap=768)

    # Keep only active high-energy voiced windows (strip pauses/gaps)
    win = int(0.08 * sr)
    kept = []
    rms_list = [
        np.sqrt(np.mean(speech_clean[i:i + win] ** 2))
        for i in range(0, len(speech_clean) - win, win)
    ]
    thresh = max(np.percentile(rms_list, 45) if rms_list else 0.02, 0.025)
    for i in range(0, len(speech_clean) - win, win):
        chunk = speech_clean[i:i + win]
        if np.sqrt(np.mean(chunk ** 2)) >= thresh:
            kept.append(chunk)

    voiced_only = np.concatenate(kept) if kept else speech_clean
    voiced_only = voiced_only / (np.sqrt(np.mean(voiced_only ** 2)) + 1e-8) * 0.08
    voiced_only = np.clip(voiced_only, -0.95, 0.95)

    # Upsample to 48kHz stereo for MOSS-Audio-Tokenizer-Nano-ONNX (max 30s = 375 frames * 3840)
    y48 = resample_poly(voiced_only, 48000, sr).astype(np.float32)
    max_samples = 375 * 3840
    y48 = y48[:max_samples]
    wav_2ch = np.stack([y48, y48], axis=0)[None, :, :]

    # Load MOSS encoder ONNX
    enc_onnx_path = hf_hub_download(
        "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX",
        "moss_audio_tokenizer_encode.onnx"
    )
    hf_hub_download(
        "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX",
        "moss_audio_tokenizer_encode.data"
    )

    enc_sess = ort.InferenceSession(enc_onnx_path, providers=["CPUExecutionProvider"])
    codes, code_lens = enc_sess.run(None, {
        "waveform": wav_2ch,
        "input_lengths": np.array([wav_2ch.shape[2]], dtype=np.int32)
    })

    T = min(int(code_lens[0]), 375)
    ref_codes = np.zeros((1, 375, 16), dtype=np.int64)
    ref_codes[0, :T, :] = codes[0, :T, :].astype(np.int64)
    ref_lengths = np.array([T], dtype=np.int64)

    # Load ZeroTTS voice_encoder.onnx
    zerotts_dir = str(resolve_model_dir("zeroweight-ai/ZeroTTS"))
    venc_path = os.path.join(zerotts_dir, "onnx", "voice_encoder.onnx")
    venc_sess = ort.InferenceSession(venc_path, providers=["CPUExecutionProvider"])
    raw_emb = venc_sess.run(None, {
        "ref_codes": ref_codes,
        "ref_lengths": ref_lengths
    })[0]

    # Optional studio projection to guarantee zero room/music artifacts
    studio_npz = os.path.join(zerotts_dir, "voices", blend_studio_voice, "voice.npz")
    if blend_ratio > 0 and os.path.exists(studio_npz):
        studio_emb = np.load(studio_npz)["voice_emb"]
        voice_emb = ((1.0 - blend_ratio) * raw_emb + blend_ratio * studio_emb).astype(np.float32)
    else:
        voice_emb = raw_emb.astype(np.float32)

    # Save voice pack to both ~/.zerotts/voices/<voice_name> and project voices/<voice_name>
    target_dirs = [
        os.path.join(os.path.expanduser("~/.zerotts/voices"), voice_name),
        os.path.join(out_project_voices_dir, voice_name)
    ]
    meta = {
        "name": voice_name,
        "display_name": display_name,
        "language": "vi",
        "gender": "nam",
        "description": f"Cloned from {os.path.basename(input_media_path)}",
        "source_file": os.path.abspath(input_media_path)
    }

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        np.savez(
            os.path.join(d, "voice.npz"),
            n_voice_queries=np.int64(10),
            voice_emb=voice_emb
        )
        with open(os.path.join(d, "meta.json"), "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

    return target_dirs[-1]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python voice_cloner.py <input_audio_or_video> [voice_name]")
        sys.exit(1)
    media_file = sys.argv[1]
    v_name = sys.argv[2] if len(sys.argv) >= 3 else "giong_mau"
    saved_dir = extract_clean_voice_embedding(media_file, voice_name=v_name)
    print(json.dumps({"status": "ok", "voice": v_name, "savedDir": saved_dir}))


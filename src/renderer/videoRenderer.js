const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');

let _encoderConfig = null;
function resolveFfmpegEncoder() {
  if (_encoderConfig !== null) return _encoderConfig;

  const candidates = [];
  try {
    const pyRes = spawnSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], {
      encoding: 'utf-8'
    });
    const p = (pyRes.stdout || '').trim();
    if (p && fs.existsSync(p) && !candidates.includes(p)) {
      candidates.push(p);
    }
  } catch (_) {}
  candidates.push('ffmpeg');

  for (const bin of candidates) {
    for (const preset of ['hq', 'p4', 'fast']) {
      try {
        const probe = spawnSync(
          bin,
          [
            '-hide_banner',
            '-f', 'lavfi',
            '-i', 'color=c=black:s=256x256:d=0.1',
            '-frames:v', '1',
            '-c:v', 'h264_nvenc',
            '-preset', preset,
            '-pix_fmt', 'yuv420p',
            '-f', 'null',
            '-'
          ],
          { encoding: 'utf-8' }
        );
        if (probe.status === 0) {
          _encoderConfig = {
            ffmpegBin: bin,
            useNvenc: true,
            codecArgs: [
              '-c:v', 'h264_nvenc',
              '-preset', preset,
              '-rc', 'vbr',
              '-cq', '19',
              '-b:v', '8M',
              '-maxrate', '14M',
              '-bufsize', '20M',
              '-pix_fmt', 'yuv420p'
            ]
          };
          return _encoderConfig;
        }
      } catch (_) {}
    }
  }

  _encoderConfig = {
    ffmpegBin: 'ffmpeg',
    useNvenc: false,
    codecArgs: [
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-threads', '4',
      '-pix_fmt', 'yuv420p'
    ]
  };
  return _encoderConfig;
}

function findBrowserExecutable() {
  const candidates = [
    process.env.VIDEO_BROWSER_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error('Không tìm thấy trình duyệt Chrome hoặc Microsoft Edge để render WebGL 3D.');
}

/**
 * Run Python edge-tts engine to synthesize voiceover & word-level karaoke timeline.
 */
function generateTTSAndTimeline(projectData, workDir) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(workDir, { recursive: true });
    const projectJsonPath = path.join(workDir, 'project_input.json');
    fs.writeFileSync(projectJsonPath, JSON.stringify(projectData, null, 2), 'utf-8');

    const pyScript = path.join(__dirname, '..', 'tts', 'tts_engine.py');
    const proc = spawn('python', [pyScript, projectJsonPath, workDir], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', reject);

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`TTS Engine failed (exit ${code}): ${stderr || stdout}`));
      }
      try {
        const timelinePath = path.join(workDir, 'timeline.json');
        const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
        resolve(timeline);
      } catch (err) {
        reject(new Error(`Failed to parse timeline.json: ${err.message}\n${stdout}\n${stderr}`));
      }
    });
  });
}

/**
 * Render the 3D scene + 2D overlay + TTS audio into an H.264 MP4 file.
 */
async function renderVideoMP4({
  timeline,
  serverUrl,
  outputMp4Path,
  onProgress = () => {}
}) {
  const width = timeline.width || 1080;
  const height = timeline.height || 1920;
  const fps = timeline.fps || 30;
  const totalDuration = timeline.totalDuration || 10;
  const totalFrames = Math.ceil(totalDuration * fps);

  fs.mkdirSync(path.dirname(outputMp4Path), { recursive: true });

  onProgress({ stage: 'browser', percent: 5, message: 'Khởi tạo bộ dựng video...' });

  const executablePath = findBrowserExecutable();
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      '--enable-gpu',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-webgl',
      '--enable-webgl2-compute-context',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
      '--enable-accelerated-2d-canvas',
      '--force-high-performance-gpu',
      '--ignore-gpu-blocklist',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${width},${height}`
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(`${serverUrl}/render_frame.html`, { waitUntil: 'networkidle0' });
    await page.waitForFunction('window.__RENDERER_READY__ === true', { timeout: 15000 });

    await page.evaluate((tl) => {
      window.initTimeline(tl);
    }, timeline);

    const { ffmpegBin, useNvenc, codecArgs } = resolveFfmpegEncoder();
    onProgress({
      stage: 'render',
      percent: 10,
      message: `Đang kết xuất ${totalFrames} khung hình bằng ${useNvenc ? 'NVIDIA NVENC' : 'CPU'} (0%)...`
    });

    // Spawn ffmpeg to encode piped JPEG frames + voiceover.mp3 into H.264 MP4
    const ffmpegArgs = [
      '-y',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-r', String(fps),
      '-i', '-',
      '-i', timeline.audioPath,
      ...codecArgs,
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '44100',
      '-shortest',
      '-movflags', '+faststart',
      outputMp4Path
    ];

    const ffmpegProc = spawn(ffmpegBin, ffmpegArgs, {
      stdio: ['pipe', 'ignore', 'pipe']
    });

    let ffmpegErr = '';
    ffmpegProc.stderr.on('data', (d) => {
      ffmpegErr += d.toString();
    });

    const ffmpegDone = new Promise((resolve, reject) => {
      ffmpegProc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}: ${ffmpegErr.slice(-600)}`));
      });
      ffmpegProc.on('error', reject);
    });

    const batchSize = 8;
    for (let f = 0; f < totalFrames; f += batchSize) {
      const times = [];
      for (let k = 0; k < batchSize && (f + k) < totalFrames; k++) {
        times.push((f + k) / fps);
      }

      // Render batch of frames inside browser and return base64 JPEGs
      const base64Frames = await page.evaluate((timeList) => {
        const out = [];
        const canvas = document.getElementById('outputCanvas');
        for (let i = 0; i < timeList.length; i++) {
          window.renderFrameAt(timeList[i]);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
          out.push(dataUrl.split(',')[1]);
        }
        return out;
      }, times);

      for (const b64 of base64Frames) {
        const buf = Buffer.from(b64, 'base64');
        const canWrite = ffmpegProc.stdin.write(buf);
        if (!canWrite) {
          await new Promise((r) => ffmpegProc.stdin.once('drain', r));
        }
      }

      const doneFrames = Math.min(totalFrames, f + batchSize);
      const pct = 10 + Math.round((doneFrames / totalFrames) * 86);
      if (f % (batchSize * 3) === 0 || doneFrames === totalFrames) {
        onProgress({
          stage: 'render',
          percent: pct,
          frame: doneFrames,
          totalFrames,
          message: `Đang render hình ảnh & phụ đề: ${doneFrames}/${totalFrames} frames (${Math.round((doneFrames / totalFrames) * 100)}%)`
        });
      }
    }

    ffmpegProc.stdin.end();
    await ffmpegDone;

    onProgress({ stage: 'done', percent: 100, message: 'Hoàn tất xuất video MP4!' });
    return outputMp4Path;
  } finally {
    await browser.close();
  }
}

module.exports = {
  findBrowserExecutable,
  generateTTSAndTimeline,
  renderVideoMP4
};


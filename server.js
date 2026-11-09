const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PRESETS, autoDirectFromScript } = require('./src/agent/sceneDirector');
const { generateTTSAndTimeline, renderVideoMP4 } = require('./src/renderer/videoRenderer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules', 'three', 'build')));
app.use('/output', express.static(path.join(__dirname, 'output')));

const renderJobs = new Map();

// Get presets
app.get('/api/presets', (req, res) => {
  res.json(Object.values(PRESETS));
});

app.get('/api/presets/:id', (req, res) => {
  const preset = PRESETS[req.params.id] || PRESETS['tien-di-dau-roi'];
  res.json(preset);
});

// AI Auto-Director endpoint: convert raw Vietnamese script into 3D storyboard + English subtitles + Receipt cards
app.post('/api/auto-direct', async (req, res) => {
  try {
    const { rawScript, title, watermark, voice, rate } = req.body;
    const project = await autoDirectFromScript(rawScript || '', {
      title,
      watermark,
      voice,
      rate
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Synthesize TTS Voiceover & Word-level Karaoke Timeline
app.post('/api/tts', async (req, res) => {
  try {
    const project = req.body.project || PRESETS['tien-di-dau-roi'];
    const workDir = path.join(__dirname, 'output', 'preview_tts');
    const timeline = await generateTTSAndTimeline(project, workDir);
    res.json({
      timeline,
      audioUrl: '/output/preview_tts/voiceover.mp3'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start full MP4 Render Job (TTS + 3D WebGL + Subtitles -> MP4)
app.post('/api/render', (req, res) => {
  const project = req.body.project || PRESETS['tien-di-dau-roi'];
  const jobId = 'job_' + Date.now();
  const jobDir = path.join(__dirname, 'output', jobId);
  const outMp4Name = `video_${jobId}.mp4`;
  const outputMp4Path = path.join(jobDir, outMp4Name);

  const jobState = {
    jobId,
    status: 'running',
    percent: 2,
    message: 'Đang tạo giọng đọc AI (TTS) & căn chỉnh phụ đề Karaoke...',
    videoUrl: null,
    audioUrl: null,
    timeline: null,
    error: null
  };
  renderJobs.set(jobId, jobState);
  res.json({ jobId });

  (async () => {
    try {
      const timeline = await generateTTSAndTimeline(project, jobDir);
      jobState.timeline = timeline;
      jobState.audioUrl = `/output/${jobId}/voiceover.mp3`;
      jobState.percent = 12;
      jobState.message = 'Đã tạo xong giọng đọc AI. Bắt đầu kết xuất cảnh 3D...';

      await renderVideoMP4({
        timeline,
        serverUrl: `http://localhost:${PORT}`,
        outputMp4Path,
        onProgress: (prog) => {
          jobState.percent = prog.percent;
          jobState.message = prog.message;
        }
      });

      // Also copy to output/latest.mp4 for easy access
      const latestPath = path.join(__dirname, 'output', 'latest.mp4');
      fs.copyFileSync(outputMp4Path, latestPath);

      jobState.status = 'done';
      jobState.percent = 100;
      jobState.message = 'Hoàn tất xuất video MP4!';
      jobState.videoUrl = `/output/${jobId}/${outMp4Name}`;
    } catch (err) {
      jobState.status = 'error';
      jobState.error = err.message;
      jobState.message = 'Lỗi: ' + err.message;
    }
  })();
});

app.get('/api/render/:jobId', (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Không tìm thấy tiến trình render' });
  res.json(job);
});

function startServer(port = PORT) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`🚀 3D Video AI Agent Studio đang chạy tại: http://localhost:${port}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer(PORT);
}

module.exports = { app, startServer };


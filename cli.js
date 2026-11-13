#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PRESETS, autoDirectFromScript } = require('./src/agent/sceneDirector');
const { generateTTSAndTimeline, renderVideoMP4 } = require('./src/renderer/videoRenderer');
const { startServer } = require('./src/renderer/assetServer');
const { validateProject } = require('./src/agent/validateProject');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else if (!args.command) {
      args.command = a;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const cmd = args.command || 'help';

  if (cmd === 'help' || args.help) {
    console.log(`
🎬 Video Story Director — CLI / skill, không có Web Studio

Cách dùng:
  1. Trích xuất / nhân bản giọng mẫu mới từ bất kỳ file âm thanh/video nào (.mp4, .mp3, .wav):
     node cli.js clone-voice --audio path/to/sample.mp4 --name ten_giong_moi

  2. Render từ file cấu hình phân cảnh (.json) (mặc định dùng giọng mẫu "giong_mau"):
     node cli.js render --project projects/tu_duy_dai_han.json --output output/tu_duy_dai_han.mp4

  3. Render kèm file giọng mẫu trực tiếp:
     node cli.js render --project projects/tu_duy_dai_han.json --voice-sample path/to/sample.mp4 --output output/video.mp4

  4. Render từ file kịch bản văn bản tiếng Việt bất kỳ (.txt):
     node cli.js render --script my_script.txt --title "TƯ DUY DÀI HẠN" --voice giong_mau --output output/custom.mp4

  5. Kiểm tra storyboard trước khi tạo TTS:
     node cli.js validate --project examples/gap-go.json

  AI viết project theo SKILL.md. --script chỉ là bộ chọn cảnh 3D cũ theo từ khóa.
`);
    process.exit(0);
  }

  if (!['render', 'validate', 'clone-voice'].includes(cmd)) throw new Error(`Lệnh không hỗ trợ: ${cmd}`);

  if (cmd === 'clone-voice') {
    const audioPath = args.audio || args['voice-sample'];
    const voiceName = args.name || args.voice || 'giong_mau';
    if (!audioPath) {
      console.error('❌ Vui lòng truyền đường dẫn file âm thanh/video mẫu qua --audio <đường_dẫn>');
      process.exit(1);
    }
    const clonerPy = path.join(__dirname, 'src', 'tts', 'voice_cloner.py');
    console.log(`🎙️ Đang tách lọc giọng nói sạch và mã hóa gói giọng mẫu "${voiceName}" từ: ${audioPath}...`);
    const res = spawnSync('python', [clonerPy, path.resolve(audioPath), voiceName], {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    if (res.status !== 0) {
      console.error('❌ Nhân bản giọng mẫu thất bại.');
      process.exit(1);
    }
    console.log(`✅ Đã lưu gói giọng mẫu "${voiceName}" vào thư mục voices/${voiceName}/voice.npz!`);
    process.exit(0);
  }

  let project = null;
  if (args.project) {
    project = JSON.parse(fs.readFileSync(path.resolve(args.project), 'utf-8'));
  } else if (args.script) {
    const rawText = fs.readFileSync(path.resolve(args.script), 'utf-8');
    console.log('Bản nháp 3D theo từ khóa; AI cần biên tập storyboard trước khi dùng làm video cuối.');
    project = await autoDirectFromScript(rawText, {
      title: args.title || 'TƯ DUY DÀI HẠN',
      watermark: args.watermark !== undefined ? args.watermark : '',
      voice: args.voice || 'vi-VN-NamMinhNeural',
      rate: args.rate || '+8%'
    });
  } else {
    if (!args.preset) throw new Error('Cần --project, --script hoặc --preset; đọc SKILL.md để dựng theo chủ đề.');
    if (!PRESETS[args.preset]) throw new Error(`Preset không tồn tại: ${args.preset}`);
    project = JSON.parse(JSON.stringify(PRESETS[args.preset]));
  }

  // Cho phép ghi đè voice, voiceSample, rate, pitch, title, watermark từ tham số dòng lệnh cho mọi chế độ
  if (args.title !== undefined) project.title = args.title;
  if (args.watermark !== undefined) project.watermark = args.watermark;
  if (args.voice) project.voice = args.voice;
  if (args['voice-sample']) project.voiceSample = path.resolve(args['voice-sample']);
  if (args.rate) project.rate = args.rate;
  if (args.pitch) project.pitch = args.pitch;

  // Optional limit segments for quick test
  if (args.maxSegments) {
    if (!Number.isInteger(Number(args.maxSegments)) || Number(args.maxSegments) < 1) throw new Error('maxSegments phải là số nguyên dương');
    project.segments = project.segments.slice(0, Number(args.maxSegments));
    project.outroDuration = args.outroDuration !== undefined ? Number(args.outroDuration) : 1.5;
  }

  validateProject(project);
  if (cmd === 'validate') { console.log(`Hợp lệ: ${project.segments.length} phân cảnh.`); return; }

  const outMp4 = path.resolve(args.output || path.join(__dirname, 'output', 'video.mp4'));
  const workDir = path.join(path.dirname(outMp4), '.work_' + path.basename(outMp4, '.mp4'));

  console.log(`🎙️ [1/2] Đang tạo giọng đọc AI (${project.voice}) & căn chỉnh phụ đề Karaoke...`);
  const timeline = await generateTTSAndTimeline(project, workDir);
  console.log(`✅ Đã tạo xong âm thanh (${timeline.totalDuration}s, ${timeline.segments.length} phân cảnh).`);

  const server = await startServer(Number(args.port || 0));

  try {
    console.log(`🎬 [2/2] Đang kết xuất hình ảnh & phụ đề ra file: ${outMp4}`);
    await renderVideoMP4({
      timeline,
      serverUrl: `http://127.0.0.1:${server.address().port}`,
      outputMp4Path: outMp4,
      onProgress: (p) => {
        if (p.stage === 'render' || p.stage === 'done') {
          process.stdout.write(`\r   ⏳ ${p.message}          `);
        }
      }
    });
    console.log(`\n🎉 Hoàn tất! File video MP4 đã lưu tại: ${outMp4}`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('\n❌ Lỗi:', err.message);
  process.exit(1);
});


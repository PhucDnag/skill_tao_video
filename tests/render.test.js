const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const puppeteer = require('puppeteer-core');
const {startServer} = require('../src/renderer/assetServer');
const {validateProject} = require('../src/agent/validateProject');
const {findBrowserExecutable, renderVideoMP4} = require('../src/renderer/videoRenderer');
const example = require('../examples/gap-go.json');

test('authored projects validate; unsupported objects and timing fail early', () => {
  for (const file of fs.readdirSync(path.join(__dirname,'../examples'))) {
    if (file.endsWith('.json')) validateProject(JSON.parse(fs.readFileSync(path.join(__dirname,'../examples',file),'utf8')));
  }
  for (const file of fs.readdirSync(path.join(__dirname,'../projects'))) {
    if (file.endsWith('.json')) validateProject(JSON.parse(fs.readFileSync(path.join(__dirname,'../projects',file),'utf8')));
  }
  const bad = structuredClone(example);
  bad.segments[0].visual.objects[0].kind = 'imaginary-asset';
  assert.throws(() => validateProject(bad), /unsupported kind/);
  bad.segments[0].visual.objects[0] = {id:'a',kind:'circle',keyframes:[{at:.8},{at:.2}]};
  assert.throws(() => validateProject(bad), /keyframe/);
});

test('private renderer draws deterministic topic scenes and exports a playable MP4', {timeout:120000}, async () => {
  const out = path.join(__dirname,'../output/qa');
  fs.mkdirSync(out,{recursive:true});
  const server = await startServer();
  const url = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    assert.equal((await fetch(url + '/')).status,404);
    assert.equal((await fetch(url + '/api/presets')).status,404);
    assert.equal((await fetch(url + '/%2e%2e%2fpackage.json')).status,403);
    assert.equal((await fetch(url + '/vendor/three/three.module.js')).status,200);
    browser = await puppeteer.launch({executablePath:findBrowserExecutable(),headless:true});
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url+'/render_frame.html');
    await page.waitForFunction('window.__RENDERER_READY__ === true');
    const timeline = {...example,width:640,height:360,fps:8,totalDuration:2,fadeOutDuration:0,
      segments: example.segments.slice(0,2).map((s,i)=>({...s,startTime:i,endTime:i+1,words:s.vi.split(/\s+/).map((word,j,a)=>({word,start:i+j/a.length,end:i+(j+1)/a.length}))}))};
    await page.evaluate(t => window.initTimeline(t),timeline);
    async function frame(t) {
      return page.evaluate(time => { window.renderFrameAt(time); return document.getElementById('outputCanvas').toDataURL('image/png').split(',')[1]; },t);
    }
    const first = await frame(0), moved = await frame(.8), second = await frame(1.8);
    assert.notEqual(first,moved,'the subjects must move');
    assert.notEqual(moved,second,'the new semantic beat must change composition');
    assert.equal(moved,await frame(.8),'out-of-order frame rendering must be deterministic');
    fs.writeFileSync(path.join(out,'landscape.png'),Buffer.from(moved,'base64'));
    fs.writeFileSync(path.join(out,'cards.png'),Buffer.from(second,'base64'));
    await page.evaluate(t => window.initTimeline({...t,width:360,height:640}),timeline);
    fs.writeFileSync(path.join(out,'portrait.png'),Buffer.from(await frame(.8),'base64'));
    await page.evaluate(() => window.initTimeline({width:320,height:568,totalDuration:1,segments:[{vi:'Kiểm tra cảnh cũ',scene:'tank_intro',camera:'orbit_tank_close',startTime:0,endTime:1}]}));
    await frame(.5);
    const legacy = {layoutMode:'neon-story-stage',style:'phatbieulungtung',visualTheme:'bright',segments:[{vi:'Không có niềm vui rõ rệt',caption:'không niềm vui',captionY:.25,captionBeats:[{text:'không niềm vui',startRatio:0,endRatio:1}],scene:'neon_city_street_home',camera:'ken_burns_street_walk'}]};
    await page.evaluate(p=>window.initTimeline({...p,width:640,height:360,totalDuration:2,fadeInDuration:0,fadeOutDuration:0,segments:[{...p.segments[0],startTime:0,endTime:2,words:[{word:'không',start:0,end:.5},{word:'niềm',start:.5,end:1},{word:'vui',start:1,end:2}]}]}),legacy);
    fs.writeFileSync(path.join(out,'legacy-bright-subtitles.png'),Buffer.from(await frame(.75),'base64'));
    const actual = await page.evaluate(() => {
      const c = document.getElementById('outputCanvas').getContext('2d');
      const calls = [], original = c.fillText;
      c.fillText = function(text,x,y,...args) { calls.push({text,y,color:this.fillStyle}); return original.call(this,text,x,y,...args); };
      try { window.renderFrameAt(.75); } finally { c.fillText = original; }
      return {calls,pixel:Array.from(c.getImageData(2,2,1,1).data)};
    });
    assert.deepEqual(actual.calls.map(c=>c.text),['KHÔNG','NIỀM','VUI'],'legacy captions must not replace spoken words');
    assert.ok(actual.calls.every(c=>c.y>360*.8),'subtitles must stay below the scene');
    assert.equal(actual.calls[1].color,'#ffd600');
    assert.ok(actual.pixel.slice(0,3).every(v=>v>150),'neon layout must not override bright background');
    assert.deepEqual(errors,[]);
    await browser.close(); browser = null;
    const audio = path.join(out,'silence.wav');
    const result = spawnSync('ffmpeg',['-y','-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-t','2',audio],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    const mp4 = path.join(out,'smoke.mp4');
    await renderVideoMP4({timeline:{...timeline,audioPath:audio},serverUrl:url,outputMp4Path:mp4});
    const probe = spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',mp4],{encoding:'utf8'});
    assert.equal(probe.status,0,probe.stderr);
    const info = JSON.parse(probe.stdout);
    const video = info.streams.find(s=>s.codec_type==='video');
    assert.equal(video.codec_name,'h264'); assert.equal(video.width,640); assert.equal(video.height,360);
    assert.equal(info.streams.find(s=>s.codec_type==='audio').codec_name,'aac');
    assert.ok(Math.abs(Number(info.format.duration)-2)<.25);
  } finally { if(browser) await browser.close(); await new Promise(resolve=>server.close(resolve)); }
});

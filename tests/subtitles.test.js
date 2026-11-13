const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const scope = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/renderer/assets/js/subtitles.js'),'utf8'),scope);
function draw(time, seg) {
  const drawn=[];
  const ctx={save(){},restore(){},beginPath(){},roundRect(){},fill(){},measureText:t=>({width:t.length*10}),fillText(text,x,y){drawn.push({text,x,y,color:this.fillStyle});}};
  scope.window.drawVideoSubtitles(ctx,time,seg,640,360);
  return drawn;
}
test('Vietnamese uppercase stays below scene; yellow follows only the spoken word',()=>{
  const seg={startTime:0,endTime:2,vi:'sống tử tế',caption:'WRONG CAPTION',words:[{word:'sống',start:0,end:.4},{word:'tử',start:.5,end:.8},{word:'tế',start:.8,end:1.2}]};
  const first=draw(.2,seg), next=draw(.6,seg);
  assert.deepEqual(first.map(t=>t.text),['SỐNG','TỬ','TẾ']);
  assert.deepEqual(first.map(t=>t.color),['#ffd600','#ffffff','#ffffff']);
  assert.deepEqual(next.map(t=>t.color),['#ffffff','#ffd600','#ffffff']);
  assert.ok(first.every(t=>t.y>360*.8 && t.y<360*.97));
  assert.equal(draw(.45,seg).length,0,'silence must not highlight a stale word');
  assert.equal(draw(2,seg).length,0);
  assert.equal(draw(.2,{...seg,hideCaption:true}).length,0);
});
test('missing word alignment never fabricates karaoke',()=>{
  const text=draw(.2,{startTime:0,endTime:1,vi:'chưa có timing'});
  assert.deepEqual(text.map(t=>t.text),['CHƯA','CÓ','TIMING']);
  assert.ok(text.every(t=>t.color==='#ffffff'));
});

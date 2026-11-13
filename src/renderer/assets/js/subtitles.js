(function (global) {
  // One subtitle contract for all render modes. Never invent word timing here.
  function drawSubtitles(ctx, time, seg, width, height) {
    if (!seg || seg.isOutro || seg.hideCaption || time < seg.startTime || time >= seg.endTime) return;
    const words = (seg.words || []).filter(w => Number.isFinite(w.start) && Number.isFinite(w.end));
    let tokens;
    if (words.length) {
      const index = words.findIndex(w => time >= w.start && time < w.end);
      if (index < 0) return;
      const first = Math.floor(index / 5) * 5;
      tokens = words.slice(first, first + 5).map(w => ({text:w.word.toLocaleUpperCase('vi-VN'), active:time >= w.start && time < w.end}));
    } else {
      // Missing alignment is visible as plain subtitles, never fake karaoke.
      tokens = String(seg.vi || '').split(/\s+/).filter(Boolean).map(text => ({text:text.toLocaleUpperCase('vi-VN'),active:false}));
    }
    if (!tokens.length) return;
    ctx.save();
    let size = Math.min(width, height) * .048;
    let lines, gap;
    do {
      ctx.font = `800 ${size}px "Segoe UI", Arial, sans-serif`;
      gap = ctx.measureText(' ').width;
      lines = [[]]; let used = 0;
      for (const token of tokens) {
        const item = {...token, width:ctx.measureText(token.text).width};
        if (used && used + gap + item.width > width * .84) { lines.push([]); used = 0; }
        lines[lines.length-1].push(item); used += (used ? gap : 0) + item.width;
      }
      if (lines.length <= 2) break;
      size *= .9;
    } while (size > Math.min(width,height)*.018);
    const lineHeight = size * 1.35;
    const top = height * .91 - (lines.length - 1) * lineHeight;
    const widths = lines.map(line => line.reduce((n,t)=>n+t.width,0)+Math.max(0,line.length-1)*gap);
    const boxWidth = Math.max(...widths) + size;
    ctx.fillStyle = 'rgba(24, 32, 44, 0.88)';
    ctx.beginPath(); ctx.roundRect((width-boxWidth)/2,top-size*.8,boxWidth,lineHeight*lines.length+size*.25,size*.3); ctx.fill();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    lines.forEach((line,i) => {
      let x = (width-widths[i])/2;
      for (const token of line) {
        ctx.fillStyle = token.active ? '#ffd600' : '#ffffff';
        ctx.fillText(token.text,x,top+i*lineHeight); x += token.width + gap;
      }
    });
    ctx.restore();
  }
  global.drawVideoSubtitles = drawSubtitles;
})(window);

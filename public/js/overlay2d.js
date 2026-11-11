/**
 * 2D Composite & UI Overlay Engine
 * Combines the 16:9 3D WebGL canvas into the 9:16 vertical video frame (576x1024 or 1080x1920)
 * and renders:
 * 1. Top & Bottom black letterbox bars
 * 2. Top main title ("TIỀN ĐI ĐÂU RỒI !?")
 * 3. Top-right scrolling marquee watermark ("Nội dung thuộc hệ sinh thái kênh A&BMoney")
 * 4. Top-left jagged-edge RECEIPT callout card with word-by-word animation & red Bio arrow
 * 5. Top-left Disclaimer banner (dark box with red left border)
 * 6. Bottom Dual Subtitles:
 *    - Line 1: Vietnamese uppercase bold Karaoke (yellow #ffd600 active words, white #ffffff upcoming)
 *    - Line 2: English translation subtitle underneath
 */
(function (global) {
  class VideoOverlayComposer {
    constructor(outputCanvas, glCanvas, width = 576, height = 1024) {
      this.canvas = outputCanvas;
      this.ctx = outputCanvas.getContext('2d');
      this.glCanvas = glCanvas;
      this.resize(width, height);
    }

    resize(width, height, timeline = null) {
      this.width = width;
      this.height = height;
      this.canvas.width = width;
      this.canvas.height = height;
      this.scale = Math.min(width, height) / 576; // Supports both 16:9 (1016x576/1920x1080) & 9:16 (1080x1920)

      const isFullBleed =
        (timeline && (timeline.layoutMode === 'neon-story-stage' || timeline.style === 'phatbieulungtung')) ||
        width >= height;

      if (isFullBleed) {
        this.stageWidth = width;
        this.stageHeight = height;
        this.stageTop = 0;
        this.stageBottom = height;
      } else {
        // 16:9 stage metrics inside 9:16 vertical frame
        this.stageWidth = width;
        this.stageHeight = Math.round((width * 9) / 16); // 324 at 576w
        this.stageTop = Math.round(height * 0.328);      // 336 at 1024h
        this.stageBottom = this.stageTop + this.stageHeight;
      }
    }

    renderComposite(timeSec, timeline) {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const s = this.scale;

      const isNeonStory =
        timeline && (timeline.layoutMode === 'neon-story-stage' || timeline.style === 'phatbieulungtung');

      if (isNeonStory) {
        this._renderNeonStoryComposite(ctx, timeSec, timeline, w, h, s);
        return;
      }

      // 1. Fill full 9:16 black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // 2. Draw 16:9 3D WebGL stage in the middle
      ctx.drawImage(
        this.glCanvas,
        0,
        0,
        this.glCanvas.width,
        this.glCanvas.height,
        0,
        this.stageTop,
        this.stageWidth,
        this.stageHeight
      );

      // Subtle vignette at top & bottom of 16:9 stage
      const topGrad = ctx.createLinearGradient(0, this.stageTop, 0, this.stageTop + 42 * s);
      topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, this.stageTop, w, 42 * s);

      const botGrad = ctx.createLinearGradient(0, this.stageBottom - 88 * s, 0, this.stageBottom);
      botGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      botGrad.addColorStop(1, 'rgba(0, 0, 0, 0.82)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, this.stageBottom - 88 * s, w, 88 * s);

      // 3. Draw Top Static Title (auto-scales font size if title is long)
      const title = (timeline && timeline.title) || 'TIỀN ĐI ĐÂU RỒI !?';
      ctx.save();
      let titleFontSize = Math.round(28 * s);
      ctx.font = `700 ${titleFontSize}px "Segoe UI", Arial, sans-serif`;
      while (ctx.measureText(title).width > w * 0.90 && titleFontSize > Math.round(16 * s)) {
        titleFontSize -= 1;
        ctx.font = `700 ${titleFontSize}px "Segoe UI", Arial, sans-serif`;
      }
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, w / 2, Math.round(282 * s));
      ctx.restore();

      // 4. Draw Top-Right Scrolling Watermark inside 16:9 stage ONLY if watermark is non-empty
      const watermark = timeline && typeof timeline.watermark === 'string' ? timeline.watermark.trim() : '';
      if (watermark) {
        this._drawScrollingWatermark(ctx, timeSec, watermark, s);
      }

      // Find active segment at timeSec
      const activeSeg = this._findActiveSegment(timeSec, timeline);
      if (!activeSeg) return;

      const segDuration = Math.max(0.1, activeSeg.endTime - activeSeg.startTime);
      const segProgress = Math.max(0, Math.min(1, (timeSec - activeSeg.startTime) / segDuration));

      // 5. Draw Top-Left Disclaimer Box OR Receipt Callout Card
      if (activeSeg.disclaimer) {
        this._drawDisclaimerCard(ctx, activeSeg.disclaimer, segProgress, s);
      } else if (activeSeg.receipt && activeSeg.receipt.trim()) {
        this._drawReceiptCard(ctx, activeSeg.receipt, timeSec, activeSeg, segProgress, s);
      }

      // 6. Draw Bottom Dual Subtitles (Vietnamese Karaoke + English)
      if (!activeSeg.isOutro && activeSeg.vi) {
        this._drawSubtitles(ctx, timeSec, activeSeg, s);
      }
    }

    _renderNeonStoryComposite(ctx, timeSec, timeline, w, h, s) {
      // 1. Full-frame dark stage draw
      ctx.fillStyle = '#0D0F18';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(
        this.glCanvas,
        0,
        0,
        this.glCanvas.width,
        this.glCanvas.height,
        0,
        0,
        w,
        h
      );

      // 2. Persistent Top-Center Hollow White-Outlined Watermark ("PHAT BIEU LUNG TUNG")
      const watermark = timeline && typeof timeline.watermark === 'string' ? timeline.watermark.trim() : '';
      if (watermark) {
        this._drawTopCenterOutlineWatermark(ctx, watermark, w, h, s);
      }

      const activeSeg = this._findActiveSegment(timeSec, timeline);
      if (activeSeg) {
        const segDuration = Math.max(0.1, activeSeg.endTime - activeSeg.startTime);
        const segProgress = Math.max(0, Math.min(1, (timeSec - activeSeg.startTime) / segDuration));

        // 3. Optional Glowing Neon-Pink Chapter Pill Badge (e.g. "NỖI SỢ ĐÁM ĐÔNG")
        if (activeSeg.topicBadge && activeSeg.topicBadge.trim()) {
          this._drawNeonTopicPill(ctx, activeSeg.topicBadge.trim(), w, h, s);
        }

        // 4. Condensed Kinetic Caption (Single-line Bold Italic White in upper-middle negative space)
        if (!activeSeg.isOutro && !activeSeg.hideCaption) {
          this._drawCondensedKineticCaption(ctx, timeSec, activeSeg, segProgress, w, h, s);
        }
      }

      // 5. Smooth Fade-In / Cross-Dissolve Dip / Fade-To-Black transitions
      let blackAlpha = 0;
      const fadeInDur = timeline.fadeInDuration !== undefined ? Number(timeline.fadeInDuration) : 0.45;
      const fadeOutDur = timeline.fadeOutDuration !== undefined ? Number(timeline.fadeOutDuration) : 0.95;
      const crossfadeDur = timeline.crossfadeDuration !== undefined ? Number(timeline.crossfadeDuration) : 0.16;
      const totalDur = timeline.totalDuration || 10;

      if (fadeInDur > 0 && timeSec < fadeInDur) {
        blackAlpha = Math.max(blackAlpha, 1 - timeSec / fadeInDur);
      }
      if (fadeOutDur > 0 && timeSec > totalDur - fadeOutDur) {
        blackAlpha = Math.max(blackAlpha, Math.min(1, (timeSec - (totalDur - fadeOutDur)) / fadeOutDur));
      }
      if (crossfadeDur > 0 && timeline.segments && timeline.segments.length > 1) {
        for (let i = 1; i < timeline.segments.length; i++) {
          const prev = timeline.segments[i - 1];
          const curr = timeline.segments[i];
          if (prev.scene !== curr.scene) {
            const boundary = curr.startTime;
            const dist = Math.abs(timeSec - boundary);
            if (dist < crossfadeDur * 0.5) {
              const dip = 1 - dist / (crossfadeDur * 0.5);
              blackAlpha = Math.max(blackAlpha, dip * 0.55);
            }
          }
        }
      }
      if (blackAlpha > 0.005) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, blackAlpha).toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }
    }

    _drawTopCenterOutlineWatermark(ctx, text, w, h, s) {
      ctx.save();
      const wmText = text.toUpperCase();
      let fontSize = Math.round((w > h ? 17 : 22) * s);
      ctx.font = `900 ${fontSize}px "Arial Rounded MT Bold", "Segoe UI", Arial, sans-serif`;
      while (ctx.measureText(wmText).width > w * 0.65 && fontSize > 12 * s) {
        fontSize -= 1;
        ctx.font = `900 ${fontSize}px "Arial Rounded MT Bold", "Segoe UI", Arial, sans-serif`;
      }
      const wmY = Math.round(h * (w > h ? 0.045 : 0.04));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.lineWidth = Math.max(1.5, 2.1 * s);
      ctx.fillStyle = 'rgba(13, 15, 24, 0.72)';
      ctx.strokeText(wmText, w / 2, wmY);
      ctx.fillText(wmText, w / 2, wmY);
      ctx.restore();
    }

    _drawNeonTopicPill(ctx, text, w, h, s) {
      ctx.save();
      const label = text.toUpperCase();
      const fontSize = Math.round((w > h ? 16 : 19) * s);
      ctx.font = `800 ${fontSize}px "Segoe UI", Arial, sans-serif`;
      const textW = ctx.measureText(label).width;
      const padX = 22 * s;
      const pillW = Math.min(w * 0.85, textW + padX * 2);
      const pillH = Math.round(fontSize * 1.95);
      const pillX = (w - pillW) / 2;
      const pillY = Math.round(h * (w > h ? 0.21 : 0.19)) - pillH / 2;
      const rad = pillH / 2;

      ctx.shadowColor = '#ff5ca8';
      ctx.shadowBlur = 16 * s;
      ctx.fillStyle = 'rgba(165, 72, 127, 0.45)';
      ctx.strokeStyle = '#ff5ca8';
      ctx.lineWidth = 2.2 * s;

      ctx.beginPath();
      ctx.moveTo(pillX + rad, pillY);
      ctx.lineTo(pillX + pillW - rad, pillY);
      ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + rad);
      ctx.lineTo(pillX + pillW, pillY + pillH - rad);
      ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - rad, pillY + pillH);
      ctx.lineTo(pillX + rad, pillY + pillH);
      ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - rad);
      ctx.lineTo(pillX, pillY + rad);
      ctx.quadraticCurveTo(pillX, pillY, pillX + rad, pillY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 6 * s;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, w / 2, pillY + pillH / 2 + 1 * s);
      ctx.restore();
    }

    _drawCondensedKineticCaption(ctx, timeSec, activeSeg, segProgress, w, h, s) {
      let displayText = '';
      let yRatio = activeSeg.captionY !== undefined ? Number(activeSeg.captionY) : (w > h ? 0.34 : 0.30);

      if (Array.isArray(activeSeg.captionBeats) && activeSeg.captionBeats.length > 0) {
        const beats = activeSeg.captionBeats;
        let chosen = beats[0];
        for (let i = 0; i < beats.length; i++) {
          const b = beats[i];
          if (typeof b === 'string') {
            const sr = i / beats.length;
            const er = (i + 1) / beats.length;
            if (segProgress >= sr && segProgress <= er + 0.001) {
              chosen = b;
              break;
            }
          } else if (b && typeof b === 'object') {
            const sr = b.startRatio !== undefined ? b.startRatio : i / beats.length;
            const er = b.endRatio !== undefined ? b.endRatio : (i + 1) / beats.length;
            if (segProgress >= sr && segProgress <= er + 0.001) {
              chosen = b;
              break;
            }
          }
        }
        if (typeof chosen === 'string') {
          displayText = chosen;
        } else if (chosen && typeof chosen === 'object') {
          displayText = chosen.text || '';
          if (chosen.yRatio !== undefined) yRatio = chosen.yRatio;
        }
      } else if (activeSeg.caption && activeSeg.caption.trim()) {
        displayText = activeSeg.caption.trim();
      } else if (activeSeg.vi) {
        // Fallback auto-condense if raw script lacks explicit `caption`
        const raw = activeSeg.vi.trim().replace(/[.!?…]+$/, '');
        const words = raw.split(/\s+/);
        if (words.length <= 8) {
          displayText = raw.toLowerCase();
        } else {
          // Pick the clause currently spoken based on progress
          const clauses = raw.split(/[,;:—–-]+/).map((c) => c.trim()).filter(Boolean);
          if (clauses.length > 1) {
            const idx = Math.min(clauses.length - 1, Math.floor(segProgress * clauses.length));
            displayText = clauses[idx].split(/\s+/).slice(0, 8).join(' ').toLowerCase();
          } else {
            displayText = words.slice(0, 7).join(' ').toLowerCase();
          }
        }
      }

      if (!displayText) return;

      // Clamp to safe upper-middle empty negative space away from TikTok bottom chrome
      const safeY = Math.round(Math.min(0.68, Math.max(0.14, yRatio)) * h);
      const maxW = w * 0.86;

      ctx.save();
      let fontSize = Math.round((w > h ? 22 : 25) * s);
      ctx.font = `italic 800 ${fontSize}px "Segoe UI", "Montserrat", Arial, sans-serif`;
      while (ctx.measureText(displayText).width > maxW && fontSize > 13 * s) {
        fontSize -= 1;
        ctx.font = `italic 800 ${fontSize}px "Segoe UI", "Montserrat", Arial, sans-serif`;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
      ctx.shadowBlur = 10 * s;
      ctx.shadowOffsetY = 2 * s;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.90)';
      ctx.lineWidth = Math.max(2.0, 3.2 * s);
      ctx.strokeText(displayText, w / 2, safeY);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(displayText, w / 2, safeY);
      ctx.restore();
    }

    _findActiveSegment(timeSec, timeline) {
      if (!timeline || !Array.isArray(timeline.segments)) return null;
      for (const seg of timeline.segments) {
        if (timeSec >= seg.startTime && timeSec <= seg.endTime + 0.05) {
          return seg;
        }
      }
      return timeline.segments[timeline.segments.length - 1] || null;
    }

    _drawScrollingWatermark(ctx, timeSec, text, s) {
      const boxW = 240 * s;
      const boxH = 22 * s;
      const boxX = this.width - boxW - 8 * s;
      const boxY = this.stageTop + 8 * s;

      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      ctx.font = `600 ${Math.round(8.5 * s)}px "Segoe UI", Arial, sans-serif`;
      ctx.textBaseline = 'middle';
      const textWidth = ctx.measureText(text).width;
      const itemSpan = textWidth + 55 * s;
      const speed = 34 * s; // px per second
      const offset = (timeSec * speed) % itemSpan;

      for (let i = -1; i <= 2; i++) {
        const drawX = boxX + boxW - offset + i * itemSpan;
        const centerY = boxY + boxH / 2;

        // Small glowing orange/brown coin sphere icon before text
        const iconR = 5.2 * s;
        const iconX = drawX - 11 * s;
        const grad = ctx.createRadialGradient(
          iconX - 1.5 * s,
          centerY - 1.5 * s,
          1 * s,
          iconX,
          centerY,
          iconR
        );
        grad.addColorStop(0, '#ff9e5e');
        grad.addColorStop(0.6, '#b84a1d');
        grad.addColorStop(1, '#541b07');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(iconX, centerY, iconR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.textAlign = 'left';
        ctx.fillText(text, drawX, centerY);
      }
      ctx.restore();
    }

    _drawReceiptCard(ctx, rawReceipt, timeSec, activeSeg, segProgress, s) {
      // Support multiple sub-receipts separated by "|" within one segment
      const parts = rawReceipt.split('|').map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return;

      const partIdx = Math.min(parts.length - 1, Math.floor(segProgress * parts.length));
      const localProgress = (segProgress * parts.length) - partIdx;
      const currentText = parts[partIdx];

      // Slide-in / fade-out animation at edges
      let slideX = 0;
      if (localProgress < 0.08) {
        const t = localProgress / 0.08;
        slideX = -(1 - t) * 40 * s;
      }

      // Indented inward (34 * s) so TikTok's mobile edge crop never clips the Receipt card
      const cardX = 34 * s + slideX;
      const cardY = this.stageTop + 26 * s;
      const cardW = 192 * s;
      const cardH = 68 * s;
      const toothCount = 17;
      const toothW = cardW / toothCount;
      const toothH = 5.5 * s;

      ctx.save();

      // Drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 10 * s;
      ctx.shadowOffsetY = 4 * s;

      // Receipt paper shape with saw-tooth bottom edge
      ctx.beginPath();
      ctx.moveTo(cardX, cardY);
      ctx.lineTo(cardX + cardW, cardY);
      ctx.lineTo(cardX + cardW, cardY + cardH);

      for (let i = toothCount; i >= 1; i--) {
        const txMid = cardX + (i - 0.5) * toothW;
        const txLeft = cardX + (i - 1) * toothW;
        ctx.lineTo(txMid, cardY + cardH - toothH);
        ctx.lineTo(txLeft, cardY + cardH);
      }
      ctx.closePath();

      const paperGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
      paperGrad.addColorStop(0, '#f6f0e4');
      paperGrad.addColorStop(1, '#ebe2d1');
      ctx.fillStyle = paperGrad;
      ctx.fill();

      // Reset shadow for text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Header: "RECEIPT" left and "01-23" right
      ctx.font = `600 ${Math.round(6.5 * s)}px "Consolas", "Courier New", monospace`;
      ctx.fillStyle = '#9b8e7e';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillText('RECEIPT', cardX + 9 * s, cardY + 5 * s);
      ctx.textAlign = 'right';
      ctx.fillText('01-23', cardX + cardW - 9 * s, cardY + 5 * s);

      // Thin divider line
      ctx.strokeStyle = 'rgba(130, 110, 90, 0.35)';
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(cardX + 8 * s, cardY + 15 * s);
      ctx.lineTo(cardX + cardW - 8 * s, cardY + 15 * s);
      ctx.stroke();

      // Check if it's the special "Link ở Bio ↓" callout
      const hasBioArrow = currentText.includes('↓') || currentText.toLowerCase().includes('link ở bio');
      const cleanText = currentText.replace('↓', '').trim();

      // Word-by-word typing reveal inside receipt
      const words = cleanText.split(/\s+/);
      const revealRatio = Math.min(1, localProgress / 0.55);
      const visibleCount = Math.max(1, Math.ceil(words.length * revealRatio));
      const visibleWords = words.slice(0, visibleCount).join(' ');

      ctx.fillStyle = '#3d1c0a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      if (hasBioArrow) {
        ctx.font = `800 ${Math.round(17 * s)}px "Segoe UI", Arial, sans-serif`;
        ctx.fillText(visibleWords, cardX + 10 * s, cardY + 25 * s);

        // Draw bold red downward arrow on the right side of the receipt
        const arrowX = cardX + cardW - 24 * s;
        const arrowTop = cardY + 21 * s;
        const arrowBot = cardY + 46 * s;
        const bounce = Math.sin(timeSec * 8) * 2 * s;

        ctx.strokeStyle = '#d8231a';
        ctx.lineWidth = 3 * s;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowTop + bounce);
        ctx.lineTo(arrowX, arrowBot + bounce);
        ctx.moveTo(arrowX - 6.5 * s, arrowBot - 6.5 * s + bounce);
        ctx.lineTo(arrowX, arrowBot + bounce);
        ctx.lineTo(arrowX + 6.5 * s, arrowBot - 6.5 * s + bounce);
        ctx.stroke();
      } else {
        // Wrap receipt text cleanly into 1 or 2 lines
        ctx.font = `800 ${Math.round(14.5 * s)}px "Segoe UI", Arial, sans-serif`;
        const maxTextW = cardW - 20 * s;
        const lines = this._wrapText(ctx, visibleWords, maxTextW);
        const startY = lines.length === 1 ? cardY + 27 * s : cardY + 20 * s;
        lines.slice(0, 2).forEach((line, idx) => {
          ctx.fillText(line, cardX + 10 * s, startY + idx * 17.5 * s);
        });
      }

      ctx.restore();
    }

    _drawDisclaimerCard(ctx, disclaimerText, segProgress, s) {
      const cardX = 34 * s;
      const cardY = this.stageTop + 26 * s;
      const cardW = 245 * s;
      const cardH = 44 * s;

      ctx.save();
      ctx.fillStyle = 'rgba(14, 17, 20, 0.88)';
      ctx.fillRect(cardX, cardY, cardW, cardH);

      // Red vertical bar on the left
      ctx.fillStyle = '#e52521';
      ctx.fillRect(cardX, cardY, 3.5 * s, cardH);

      ctx.font = `600 ${Math.round(9.8 * s)}px "Segoe UI", Arial, sans-serif`;
      ctx.fillStyle = '#f2f4f7';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const lines = disclaimerText.split('\n');
      lines.forEach((line, idx) => {
        ctx.fillText(line.trim(), cardX + 10 * s, cardY + 9 * s + idx * 14 * s);
      });
      ctx.restore();
    }

    _drawSubtitles(ctx, timeSec, activeSeg, s) {
      // Find active karaoke chunk (4-6 words) for the Vietnamese line
      const chunks = activeSeg.karaokeChunks || [];
      let activeChunk = chunks[0] || null;
      for (const ch of chunks) {
        if (timeSec >= ch.start - 0.05 && timeSec <= ch.end + 0.15) {
          activeChunk = ch;
          break;
        }
        if (timeSec > ch.end) {
          activeChunk = ch;
        }
      }

      const centerX = this.width / 2;
      const safeMaxW = this.width * 0.88; // Keep 6% margin on left/right for TikTok safe zone
      const viY = this.stageBottom - 44 * s;
      const enY = this.stageBottom - 17 * s;

      // 1. Draw Vietnamese Uppercase Karaoke Line (larger size + auto-fit within TikTok safe zone)
      if (activeChunk && Array.isArray(activeChunk.words) && activeChunk.words.length > 0) {
        ctx.save();
        let viFontSize = Math.round(18.5 * s);
        ctx.font = `900 ${viFontSize}px "Segoe UI Black", "Arial Black", Impact, sans-serif`;
        ctx.textBaseline = 'middle';

        const wordItems = activeChunk.words.map((w) => ({
          text: w.word.toUpperCase(),
          start: w.start,
          end: w.end
        }));

        let spaceWidth = ctx.measureText(' ').width * 1.05;
        let totalLineWidth = 0;
        const measureChunkWidth = () => {
          spaceWidth = ctx.measureText(' ').width * 1.05;
          totalLineWidth = 0;
          wordItems.forEach((item, idx) => {
            item.width = ctx.measureText(item.text).width;
            totalLineWidth += item.width;
            if (idx < wordItems.length - 1) totalLineWidth += spaceWidth;
          });
        };
        measureChunkWidth();

        while (totalLineWidth > safeMaxW && viFontSize > Math.round(13 * s)) {
          viFontSize -= 1;
          ctx.font = `900 ${viFontSize}px "Segoe UI Black", "Arial Black", Impact, sans-serif`;
          measureChunkWidth();
        }

        let cursorX = centerX - totalLineWidth / 2;
        wordItems.forEach((item) => {
          // A word is highlighted in yellow if spoken up to current time within the active phrase
          const isHighlighted = timeSec >= item.start - 0.04;

          ctx.textAlign = 'left';
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;

          // Strong black stroke for high contrast
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.94)';
          ctx.lineWidth = 4.4 * s;
          ctx.strokeText(item.text, cursorX, viY);

          if (isHighlighted) {
            ctx.shadowColor = 'rgba(255, 215, 0, 0.55)';
            ctx.shadowBlur = 7 * s;
            ctx.fillStyle = '#ffda1a';
          } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowBlur = 3.5 * s;
            ctx.fillStyle = '#ffffff';
          }

          ctx.fillText(item.text, cursorX, viY);
          cursorX += item.width + spaceWidth;
        });

        ctx.restore();
      }

      // 2. Draw English Subtitle Line below Vietnamese (larger & clearer)
      if (activeSeg.en) {
        ctx.save();
        let enFontSize = Math.round(13.2 * s);
        ctx.font = `600 ${enFontSize}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';

        // If the English sentence is long, split it into two halves synchronized with segment progress
        let enText = activeSeg.en.trim();
        if (enText.length > 58) {
          const words = enText.split(/\s+/);
          const mid = Math.ceil(words.length / 2);
          const segDur = Math.max(0.1, activeSeg.endTime - activeSeg.startTime);
          const p = (timeSec - activeSeg.startTime) / segDur;
          enText = p < 0.52 ? words.slice(0, mid).join(' ') : words.slice(mid).join(' ');
        }

        while (ctx.measureText(enText).width > safeMaxW && enFontSize > Math.round(9.5 * s)) {
          enFontSize -= 1;
          ctx.font = `600 ${enFontSize}px "Segoe UI", Arial, sans-serif`;
        }

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.94)';
        ctx.lineWidth = 3.4 * s;
        ctx.strokeText(enText, centerX, enY);

        ctx.fillStyle = '#f5f8fa';
        ctx.fillText(enText, centerX, enY);
        ctx.restore();
      }
    }

    _wrapText(ctx, text, maxWidth) {
      const words = text.split(/\s+/);
      const lines = [];
      let current = '';

      for (const w of words) {
        const test = current ? `${current} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = w;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    }
  }

  global.VideoOverlayComposer = VideoOverlayComposer;
})(window);


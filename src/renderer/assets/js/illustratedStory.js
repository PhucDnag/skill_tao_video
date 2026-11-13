/* Deterministic Canvas scenes: authored objects and keyframes, with expressive 2D cartoon characters & rich environments. */
(function (global) {
  const clamp = n => Math.max(0, Math.min(1, n));

  function stateAt(object, progress) {
    const base = { x: 0.5, y: 0.5, w: 0.18, h: 0.28, scale: 1, rotation: 0, opacity: 1, ...object };
    const frames = [{ ...base, at: 0 }];
    for (const key of object.keyframes || []) frames.push({ ...frames[frames.length - 1], ...key });
    let left = frames[0], right = left;
    for (const frame of frames.slice(1)) {
      if (frame.at <= progress) left = frame;
      else { right = frame; break; }
      right = left;
    }
    const raw = right.at > left.at ? clamp((progress - left.at) / (right.at - left.at)) : 0;
    const t = raw * raw * (3 - 2 * raw);
    const result = { ...left };
    for (const k of ['x', 'y', 'w', 'h', 'scale', 'rotation', 'opacity']) {
      if (typeof left[k] === 'number' && typeof right[k] === 'number') {
        result[k] = left[k] + (right[k] - left[k]) * t;
      }
    }
    return result;
  }

  class IllustratedStory {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
    }

    text(text, x, y, width, size, color = '#263449') {
      const c = this.ctx;
      c.font = `600 ${size}px "Segoe UI", Arial, sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = color;
      const lines = [];
      let line = '';
      for (const word of String(text).split(/\s+/)) {
        const next = line ? line + ' ' + word : word;
        if (line && c.measureText(next).width > width) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);
      lines.forEach((s, i) => c.fillText(s, x, y + (i - (lines.length - 1) / 2) * size * 1.3, width));
    }

    // --- Helper: Draw @phatbieulungtung 2D Cartoon Character (Multi-Hair, Multi-Outfit, Multi-Pose) ---
    drawCartoonHero(c, ow, oh, unit, o, time) {
      const mood = o.mood || 'tired'; // 'tired' | 'closed' | 'smile' | 'happy' | 'sad' | 'tear' | 'surprised' | 'determined' | 'backview'
      const pose = o.pose || 'stand'; // 'stand' | 'walk' | 'sit_bus' | 'lean_rail' | 'sit_desk' | 'sit_bench' | 'sit_bed' | 'look_up' | 'hold_coffee' | 'hold_phone' | 'wave' | 'ghost' | 'backview'
      const hair = o.hair || 'spiky'; // 'spiky' | 'smooth' | 'female_long' | 'female_ponytail' | 'curly' | 'cap'
      const outfit = o.outfit || 'coat_scarf'; // 'coat_scarf' | 'hoodie' | 'sweater' | 'shirt_tie' | 'tshirt'
      const gender = o.gender || (hair.startsWith('female') ? 'female' : 'male');
      const isGhost = pose === 'ghost' || o.role === 'ghost';
      const isBackview = mood === 'backview' || pose === 'backview';

      c.save();
      if (isGhost) {
        c.globalAlpha *= 0.42;
      }

      const strokeCol = '#1a1a1a';
      const lineWidth = Math.max(1.8, unit * 0.0055);
      c.strokeStyle = strokeCol;
      c.lineWidth = lineWidth;
      c.lineCap = 'round';
      c.lineJoin = 'round';

      const headR = Math.min(ow * 0.38, oh * 0.28);
      const headY = -oh * 0.26;

      // 1. Legs & Shoes
      const isSitting = pose === 'sit_desk' || pose === 'lean_rail' || pose === 'sit_bus' || pose === 'sit_bed';
      if (!isSitting) {
        const legW = ow * 0.11;
        const legH = oh * 0.32;
        const legY = oh * 0.25;
        const isWalking = pose === 'walk';
        const walkPhase = isWalking ? Math.sin((time || 0) * 8) : 0;

        [-1, 1].forEach((dir, idx) => {
          const lx = dir * ow * 0.14;
          const legShiftY = isWalking ? (idx === 0 ? walkPhase : -walkPhase) * unit * 0.015 : 0;
          const legShiftX = isWalking ? (idx === 0 ? -walkPhase : walkPhase) * unit * 0.02 : 0;

          c.fillStyle = isGhost ? '#57606f' : (o.pantsColor || '#2f3542');
          c.beginPath();
          c.roundRect(lx - legW / 2 + legShiftX, legY + legShiftY, legW, legH, unit * 0.01);
          c.fill();
          c.stroke();

          // Shoes
          c.fillStyle = isGhost ? '#a4b0be' : (o.shoeColor || '#f1f2f6');
          c.beginPath();
          c.roundRect(lx - legW * 0.7 + legShiftX, legY + legH + legShiftY - unit * 0.015, legW * 1.4, unit * 0.026, unit * 0.01);
          c.fill();
          c.stroke();
        });
      } else if (pose === 'sit_bench') {
        const legW = ow * 0.11;
        const legH = oh * 0.26;
        const legY = oh * 0.28;
        c.fillStyle = isGhost ? '#57606f' : (o.pantsColor || '#2f3542');
        [-ow * 0.14, ow * 0.14].forEach(lx => {
          c.beginPath();
          c.roundRect(lx - legW / 2, legY, legW, legH, unit * 0.01);
          c.fill();
          c.stroke();
          c.fillStyle = isGhost ? '#a4b0be' : (o.shoeColor || '#f1f2f6');
          c.beginPath();
          c.roundRect(lx - legW * 0.7, legY + legH - unit * 0.015, legW * 1.4, unit * 0.024, unit * 0.01);
          c.fill();
          c.stroke();
        });
      }

      // 2. Torso & Clothes
      const bodyW = ow * 0.58;
      const bodyH = oh * 0.42;
      const bodyY = -oh * 0.04;
      const clothesCol = isGhost ? '#747d8c' : (o.clothesColor || o.color || '#57606f');
      c.fillStyle = clothesCol;
      c.beginPath();
      c.roundRect(-bodyW / 2, bodyY, bodyW, bodyH, unit * 0.025);
      c.fill();
      c.stroke();

      if (!isBackview) {
        if (outfit === 'coat_scarf') {
          c.strokeStyle = 'rgba(26,26,26,0.6)';
          c.lineWidth = Math.max(1.2, unit * 0.0035);
          c.beginPath();
          c.moveTo(-bodyW * 0.2, bodyY);
          c.lineTo(-bodyW * 0.08, bodyY + bodyH * 0.5);
          c.lineTo(-bodyW * 0.08, bodyY + bodyH);
          c.moveTo(bodyW * 0.2, bodyY);
          c.lineTo(bodyW * 0.08, bodyY + bodyH * 0.5);
          c.lineTo(bodyW * 0.08, bodyY + bodyH);
          c.stroke();

          c.fillStyle = '#f1f2f6';
          [-bodyW * 0.15, bodyW * 0.15].forEach(bx => {
            [bodyY + bodyH * 0.45, bodyY + bodyH * 0.72].forEach(by => {
              c.beginPath();
              c.arc(bx, by, unit * 0.005, 0, Math.PI * 2);
              c.fill();
              c.stroke();
            });
          });
        } else if (outfit === 'hoodie') {
          c.fillStyle = 'rgba(0,0,0,0.12)';
          c.beginPath();
          c.roundRect(-bodyW * 0.32, bodyY + bodyH * 0.55, bodyW * 0.64, bodyH * 0.38, unit * 0.015);
          c.fill();
          c.stroke();
          c.strokeStyle = '#f1f2f6';
          c.lineWidth = Math.max(1.5, unit * 0.003);
          [-bodyW * 0.1, bodyW * 0.1].forEach(dx => {
            c.beginPath();
            c.moveTo(dx, bodyY + unit * 0.02);
            c.lineTo(dx, bodyY + bodyH * 0.35);
            c.stroke();
            c.beginPath();
            c.arc(dx, bodyY + bodyH * 0.36, unit * 0.004, 0, Math.PI * 2);
            c.fill();
          });
        } else if (outfit === 'sweater') {
          c.strokeStyle = 'rgba(0,0,0,0.18)';
          c.lineWidth = Math.max(1.2, unit * 0.003);
          for (let r = 1; r <= 3; r++) {
            c.beginPath();
            c.moveTo(-bodyW * 0.35, bodyY + bodyH * 0.28 * r);
            c.lineTo(bodyW * 0.35, bodyY + bodyH * 0.28 * r);
            c.stroke();
          }
        } else if (outfit === 'shirt_tie') {
          c.fillStyle = '#ffffff';
          c.beginPath();
          c.moveTo(-bodyW * 0.18, bodyY);
          c.lineTo(0, bodyY + bodyH * 0.22);
          c.lineTo(0, bodyY);
          c.closePath();
          c.fill();
          c.stroke();
          c.beginPath();
          c.moveTo(bodyW * 0.18, bodyY);
          c.lineTo(0, bodyY + bodyH * 0.22);
          c.lineTo(0, bodyY);
          c.closePath();
          c.fill();
          c.stroke();
          c.fillStyle = o.tieColor || '#eb3b5a';
          c.beginPath();
          c.moveTo(0, bodyY + bodyH * 0.18);
          c.lineTo(-bodyW * 0.07, bodyY + bodyH * 0.28);
          c.lineTo(-bodyW * 0.08, bodyY + bodyH * 0.75);
          c.lineTo(0, bodyY + bodyH * 0.85);
          c.lineTo(bodyW * 0.08, bodyY + bodyH * 0.75);
          c.lineTo(bodyW * 0.07, bodyY + bodyH * 0.28);
          c.closePath();
          c.fill();
          c.stroke();
        }
        c.strokeStyle = strokeCol;
        c.lineWidth = lineWidth;
      }

      // 3. Arms & Accessories
      const armSwing = pose === 'walk' ? Math.sin((time || 0) * 8) * (unit * 0.03) : 0;
      if (pose === 'wave') {
        c.beginPath();
        c.moveTo(-bodyW * 0.45, bodyY + bodyH * 0.1);
        c.lineTo(-bodyW * 0.65, bodyY + bodyH * 0.55);
        c.stroke();
        c.beginPath();
        c.moveTo(bodyW * 0.45, bodyY + bodyH * 0.1);
        c.lineTo(bodyW * 0.7, bodyY - bodyH * 0.15);
        c.lineTo(bodyW * 0.65, bodyY - bodyH * 0.45);
        c.stroke();
      } else if (pose === 'lean_rail') {
        c.beginPath();
        c.moveTo(-bodyW * 0.45, bodyY + bodyH * 0.15);
        c.lineTo(-bodyW * 0.35, bodyY + bodyH * 0.7);
        c.moveTo(bodyW * 0.45, bodyY + bodyH * 0.15);
        c.lineTo(bodyW * 0.35, bodyY + bodyH * 0.7);
        c.stroke();
      } else if (pose === 'hold_coffee') {
        c.beginPath();
        c.moveTo(-bodyW * 0.45, bodyY + bodyH * 0.1);
        c.lineTo(-bodyW * 0.58, bodyY + bodyH * 0.65);
        c.stroke();
        const cupX = bodyW * 0.38;
        const cupY = bodyY + bodyH * 0.45;
        c.beginPath();
        c.moveTo(bodyW * 0.45, bodyY + bodyH * 0.1);
        c.lineTo(cupX + unit * 0.02, cupY);
        c.stroke();
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.roundRect(cupX - unit * 0.025, cupY - unit * 0.035, unit * 0.05, unit * 0.065, unit * 0.008);
        c.fill();
        c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.6)';
        c.lineWidth = 1.5;
        c.beginPath();
        const steamPhase = Math.sin((time || 0) * 4) * 5;
        c.moveTo(cupX, cupY - unit * 0.04);
        c.quadraticCurveTo(cupX + steamPhase, cupY - unit * 0.07, cupX, cupY - unit * 0.1);
        c.stroke();
        c.strokeStyle = strokeCol;
        c.lineWidth = lineWidth;
      } else if (pose === 'hold_phone') {
        c.beginPath();
        c.moveTo(-bodyW * 0.45, bodyY + bodyH * 0.1);
        c.lineTo(-bodyW * 0.58, bodyY + bodyH * 0.65);
        c.stroke();
        const phX = bodyW * 0.35;
        const phY = bodyY + bodyH * 0.48;
        c.beginPath();
        c.moveTo(bodyW * 0.45, bodyY + bodyH * 0.1);
        c.lineTo(phX, phY);
        c.stroke();
        c.fillStyle = '#2f3542';
        c.fillRect(phX - unit * 0.015, phY - unit * 0.03, unit * 0.03, unit * 0.05);
        c.strokeRect(phX - unit * 0.015, phY - unit * 0.03, unit * 0.03, unit * 0.05);
        c.fillStyle = '#70a1ff';
        c.fillRect(phX - unit * 0.012, phY - unit * 0.026, unit * 0.024, unit * 0.042);
      } else {
        [-1, 1].forEach((dir, idx) => {
          const swing = (idx === 0 ? armSwing : -armSwing);
          c.beginPath();
          c.moveTo(dir * bodyW * 0.45, bodyY + bodyH * 0.1);
          c.lineTo(dir * bodyW * 0.58, bodyY + bodyH * 0.65 + swing);
          c.stroke();
          c.fillStyle = isGhost ? '#ced6e0' : (o.skin || '#f3d9c1');
          c.beginPath();
          c.arc(dir * bodyW * 0.58, bodyY + bodyH * 0.68 + swing, unit * 0.016, 0, Math.PI * 2);
          c.fill();
          c.stroke();
        });
      }

      // 4. Head & Ears
      c.fillStyle = isGhost ? '#ced6e0' : (o.skin || '#f3d9c1');
      [-headR * 0.95, headR * 0.95].forEach(ex => {
        c.beginPath();
        c.arc(ex, headY, headR * 0.22, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      });
      c.beginPath();
      c.arc(0, headY, headR, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // 5. Hair Styles
      const hairCol = isGhost ? '#57606f' : (o.hairColor || '#2d221e');
      c.fillStyle = hairCol;

      if (hair === 'smooth') {
        c.beginPath();
        c.arc(0, headY - headR * 0.15, headR * 1.05, Math.PI * 0.85, Math.PI * 2.15);
        if (isBackview) {
          c.lineTo(headR * 0.95, headY + headR * 0.7);
          c.lineTo(-headR * 0.95, headY + headR * 0.7);
        } else {
          c.lineTo(headR * 0.85, headY - headR * 0.1);
          c.quadraticCurveTo(headR * 0.2, headY - headR * 0.4, -headR * 0.3, headY - headR * 0.15);
          c.lineTo(-headR * 0.85, headY - headR * 0.1);
        }
        c.closePath();
        c.fill();
        c.stroke();
      } else if (hair === 'female_long') {
        c.beginPath();
        c.arc(0, headY - headR * 0.15, headR * 1.1, Math.PI * 0.85, Math.PI * 2.15);
        c.lineTo(headR * 1.15, headY + headR * 1.6);
        c.lineTo(headR * 0.85, headY + headR * 1.6);
        c.lineTo(headR * 0.7, headY + headR * 0.4);
        if (!isBackview) {
          c.quadraticCurveTo(0, headY - headR * 0.35, -headR * 0.7, headY + headR * 0.4);
        }
        c.lineTo(-headR * 0.85, headY + headR * 1.6);
        c.lineTo(-headR * 1.15, headY + headR * 1.6);
        c.closePath();
        c.fill();
        c.stroke();
      } else if (hair === 'female_ponytail') {
        c.beginPath();
        c.arc(0, headY - headR * 0.15, headR * 1.05, Math.PI * 0.85, Math.PI * 2.15);
        c.closePath();
        c.fill();
        c.stroke();
        const ponyX = headR * 0.9;
        const ponyY = headY - headR * 0.65;
        c.fillStyle = o.tieColor || '#eb3b5a';
        c.beginPath();
        c.arc(ponyX, ponyY, unit * 0.012, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.fillStyle = hairCol;
        c.beginPath();
        c.moveTo(ponyX, ponyY);
        c.quadraticCurveTo(ponyX + headR * 0.8, ponyY + headR * 0.2, ponyX + headR * 0.6, ponyY + headR * 1.2);
        c.quadraticCurveTo(ponyX + headR * 0.4, ponyY + headR * 0.8, ponyX, ponyY);
        c.closePath();
        c.fill();
        c.stroke();
      } else if (hair === 'curly') {
        c.beginPath();
        for (let a = 0; a < 8; a++) {
          const ang = Math.PI * 0.9 + a * (Math.PI * 1.2 / 7);
          const cx = Math.cos(ang) * headR * 1.1;
          const cy = headY + Math.sin(ang) * headR * 1.1;
          c.arc(cx, cy, headR * 0.28, 0, Math.PI * 2);
        }
        c.fill();
        c.stroke();
      } else if (hair === 'cap') {
        c.fillStyle = o.capColor || '#e55039';
        c.beginPath();
        c.arc(0, headY - headR * 0.15, headR * 1.08, Math.PI * 0.9, Math.PI * 2.1);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#2f3542';
        c.beginPath();
        c.roundRect(headR * 0.2, headY - headR * 0.3, headR * 1.1, unit * 0.02, unit * 0.008);
        c.fill();
        c.stroke();
      } else {
        c.beginPath();
        const hairSpikes = [
          [-headR * 0.98, headY - headR * 0.1],
          [-headR * 1.05, headY - headR * 0.5],
          [-headR * 0.85, headY - headR * 0.52],
          [-headR * 0.88, headY - headR * 0.92],
          [-headR * 0.55, headY - headR * 0.85],
          [-headR * 0.45, headY - headR * 1.18],
          [-headR * 0.15, headY - headR * 0.95],
          [0, headY - headR * 1.25],
          [headR * 0.18, headY - headR * 0.95],
          [headR * 0.45, headY - headR * 1.18],
          [headR * 0.58, headY - headR * 0.85],
          [headR * 0.88, headY - headR * 0.92],
          [headR * 0.85, headY - headR * 0.52],
          [headR * 1.05, headY - headR * 0.5],
          [headR * 0.98, headY - headR * 0.1]
        ];
        c.moveTo(hairSpikes[0][0], hairSpikes[0][1]);
        for (let i = 1; i < hairSpikes.length; i++) c.lineTo(hairSpikes[i][0], hairSpikes[i][1]);
        if (isBackview) {
          c.lineTo(0, headY + headR * 0.85);
        } else {
          c.lineTo(headR * 0.72, headY - headR * 0.2);
          c.lineTo(headR * 0.4, headY - headR * 0.35);
          c.lineTo(headR * 0.2, headY - headR * 0.15);
          c.lineTo(0, headY - headR * 0.4);
          c.lineTo(-headR * 0.2, headY - headR * 0.15);
          c.lineTo(-headR * 0.4, headY - headR * 0.35);
          c.lineTo(-headR * 0.72, headY - headR * 0.2);
        }
        c.closePath();
        c.fill();
        c.stroke();
      }

      // 6. Facial Expressions (if not backview)
      if (!isBackview) {
        const eyeSpacing = headR * 0.42;
        const eyeY = headY + headR * 0.08;

        if (gender === 'female') {
          c.fillStyle = 'rgba(255, 107, 129, 0.35)';
          [-eyeSpacing * 1.15, eyeSpacing * 1.15].forEach(cx => {
            c.beginPath();
            c.ellipse(cx, eyeY + headR * 0.22, headR * 0.18, headR * 0.1, 0, 0, Math.PI * 2);
            c.fill();
          });
        }

        if (mood === 'closed') {
          [-eyeSpacing, eyeSpacing].forEach(ex => {
            c.beginPath();
            c.arc(ex, eyeY, headR * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
            c.stroke();
          });
        } else {
          c.strokeStyle = '#2d221e';
          c.lineWidth = Math.max(1.5, unit * 0.004);
          [-eyeSpacing, eyeSpacing].forEach((ex, idx) => {
            const tilt = (idx === 0 ? 1 : -1) * (mood === 'sad' || mood === 'tear' ? -0.1 : (mood === 'determined' ? 0.12 : 0.06));
            c.beginPath();
            c.moveTo(ex - headR * 0.18, eyeY - headR * 0.32 + tilt * headR);
            c.lineTo(ex + headR * 0.18, eyeY - headR * 0.32 - tilt * headR);
            c.stroke();
          });

          c.strokeStyle = strokeCol;
          c.lineWidth = lineWidth;
          [-eyeSpacing, eyeSpacing].forEach(ex => {
            c.fillStyle = '#ffffff';
            c.beginPath();
            c.arc(ex, eyeY, headR * 0.22, 0, Math.PI * 2);
            c.fill();
            c.stroke();

            c.fillStyle = isGhost ? '#57606f' : '#222222';
            c.beginPath();
            c.arc(ex, eyeY, headR * 0.11, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = '#ffffff';
            c.beginPath();
            c.arc(ex + headR * 0.04, eyeY - headR * 0.04, headR * 0.035, 0, Math.PI * 2);
            c.fill();

            if (gender === 'female') {
              c.beginPath();
              c.moveTo(ex + headR * 0.16, eyeY - headR * 0.14);
              c.lineTo(ex + headR * 0.26, eyeY - headR * 0.22);
              c.stroke();
            }

            if (mood === 'tired' || mood === 'sad') {
              c.fillStyle = isGhost ? '#a4b0be' : (o.skin || '#f3d9c1');
              c.beginPath();
              c.arc(ex, eyeY, headR * 0.22, Math.PI, Math.PI * 2);
              c.closePath();
              c.fill();
              c.stroke();

              c.strokeStyle = 'rgba(74, 52, 60, 0.45)';
              c.lineWidth = Math.max(1.0, unit * 0.0028);
              c.beginPath();
              c.arc(ex, eyeY + headR * 0.1, headR * 0.2, 0.2 * Math.PI, 0.8 * Math.PI);
              c.stroke();
              c.strokeStyle = strokeCol;
              c.lineWidth = lineWidth;
            }
          });

          if (mood === 'tear') {
            c.fillStyle = 'rgba(112, 161, 255, 0.85)';
            c.beginPath();
            c.ellipse(eyeSpacing * 0.9, eyeY + headR * 0.35, unit * 0.006, unit * 0.012, 0, 0, Math.PI * 2);
            c.fill();
          }

          c.beginPath();
          if (mood === 'happy' || mood === 'smile') {
            c.arc(0, headY + headR * 0.45, headR * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
          } else if (mood === 'surprised') {
            c.ellipse(0, headY + headR * 0.52, headR * 0.1, headR * 0.14, 0, 0, Math.PI * 2);
          } else {
            c.moveTo(-headR * 0.15, headY + headR * 0.52);
            c.lineTo(headR * 0.15, headY + headR * 0.52);
          }
          c.stroke();
        }

        if (o.accessory === 'glasses' || o.glasses) {
          c.strokeStyle = '#2f3542';
          c.lineWidth = Math.max(1.8, unit * 0.004);
          [-eyeSpacing, eyeSpacing].forEach(gx => {
            c.beginPath();
            c.arc(gx, eyeY, headR * 0.3, 0, Math.PI * 2);
            c.stroke();
          });
          c.beginPath();
          c.moveTo(-eyeSpacing + headR * 0.3, eyeY);
          c.lineTo(eyeSpacing - headR * 0.3, eyeY);
          c.stroke();
          c.strokeStyle = strokeCol;
          c.lineWidth = lineWidth;
        }
      }

      // 7. Scarf
      const hasScarf = o.scarf !== false && o.scarf !== 'none' && (Boolean(o.scarf) || outfit === 'coat_scarf');
      if (hasScarf) {
        const scarfCol = typeof o.scarf === 'string' ? o.scarf : (isGhost ? '#e84118' : '#d63031');
        c.fillStyle = scarfCol;
        const scarfY = headY + headR * 0.88;
        c.beginPath();
        c.roundRect(-bodyW * 0.42, scarfY - unit * 0.015, bodyW * 0.84, unit * 0.055, unit * 0.02);
        c.fill();
        c.stroke();

        c.beginPath();
        c.roundRect(-bodyW * 0.25, scarfY + unit * 0.03, bodyW * 0.22, oh * 0.22, unit * 0.012);
        c.fill();
        c.stroke();

        c.strokeStyle = 'rgba(26,26,26,0.7)';
        c.lineWidth = Math.max(1.0, unit * 0.0025);
        for (let f = 0; f < 4; f++) {
          const fx = -bodyW * 0.23 + f * (bodyW * 0.06);
          c.beginPath();
          c.moveTo(fx, scarfY + unit * 0.03 + oh * 0.2);
          c.lineTo(fx, scarfY + unit * 0.03 + oh * 0.235);
          c.stroke();
        }
      }

      c.restore();
    }

    // --- Helper: Draw 2D City Street Scene ---
    drawCityStreet(c, w, h, unit, o, time) {
      c.save();
      // Sky backdrop
      const skyGrad = c.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#576574');
      skyGrad.addColorStop(0.55, '#8395a7');
      skyGrad.addColorStop(1, '#c8d6e5');
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, w, h);

      // Distant building silhouettes
      c.fillStyle = 'rgba(47, 53, 66, 0.35)';
      const distH = h * 0.42;
      for (let i = 0; i < 9; i++) {
        const bx = i * (w * 0.12);
        const bw = w * 0.14;
        const bh = distH + Math.sin(i * 3.7) * (h * 0.08);
        c.fillRect(bx, h * 0.58 - bh, bw, bh);
      }

      // Main Street Pastel Townhouses (Dãy nhà phố 2D màu pastel)
      const groundY = h * 0.72;
      const houses = [
        { color: '#fed330', roof: '#b71540', w: 0.16, h: 0.48, x: 0.0 },
        { color: '#fd9644', roof: '#e55039', w: 0.18, h: 0.42, x: 0.16 },
        { color: '#f7b731', roof: '#4b6584', w: 0.18, h: 0.54, x: 0.34 },
        { color: '#2bcbba', roof: '#20bf6b', w: 0.17, h: 0.44, x: 0.52 },
        { color: '#fd9644', roof: '#eb3b5a', w: 0.18, h: 0.46, x: 0.69 },
        { color: '#fed330', roof: '#b71540', w: 0.17, h: 0.52, x: 0.87 }
      ];

      houses.forEach(house => {
        const hx = house.x * w;
        const hw = house.w * w;
        const hh = house.h * h;
        const hy = groundY - hh;

        // House body
        c.fillStyle = house.color;
        c.strokeStyle = '#1e272e';
        c.lineWidth = Math.max(1.8, unit * 0.0045);
        c.fillRect(hx, hy, hw, hh);
        c.strokeRect(hx, hy, hw, hh);

        // Roof
        c.fillStyle = house.roof;
        c.fillRect(hx - 2, hy, hw + 4, unit * 0.028);
        c.strokeRect(hx - 2, hy, hw + 4, unit * 0.028);

        // Windows (2-4 windows per house)
        c.fillStyle = '#485460';
        const winW = hw * 0.32;
        const winH = hh * 0.22;
        [hx + hw * 0.12, hx + hw * 0.56].forEach(wx => {
          c.fillRect(wx, hy + hh * 0.15, winW, winH);
          c.strokeRect(wx, hy + hh * 0.15, winW, winH);
        });

        // Ground Floor Roll-up Door / Shop Gate
        c.fillStyle = '#718093';
        const gateW = hw * 0.65;
        const gateH = hh * 0.42;
        const gx = hx + (hw - gateW) / 2;
        const gy = groundY - gateH;
        c.fillRect(gx, gy, gateW, gateH);
        c.strokeRect(gx, gy, gateW, gateH);
      });

      // Street Lamp (Cột đèn đường tỏa ánh sáng vàng)
      const lampX = w * 0.22;
      const lampY = groundY;
      c.strokeStyle = '#2f3542';
      c.lineWidth = Math.max(2.5, unit * 0.006);
      c.beginPath();
      c.moveTo(lampX, lampY);
      c.lineTo(lampX, lampY - h * 0.42);
      c.arc(lampX + unit * 0.04, lampY - h * 0.42, unit * 0.04, Math.PI, Math.PI * 1.5);
      c.stroke();

      // Lamp Bulb & Warm Radial Glow
      const bulbX = lampX + unit * 0.04;
      const bulbY = lampY - h * 0.42;
      const glowGrad = c.createRadialGradient(bulbX, bulbY, 2, bulbX, bulbY, unit * 0.18);
      glowGrad.addColorStop(0, 'rgba(255, 242, 0, 0.95)');
      glowGrad.addColorStop(0.35, 'rgba(254, 202, 87, 0.45)');
      glowGrad.addColorStop(1, 'rgba(254, 202, 87, 0)');
      c.fillStyle = glowGrad;
      c.beginPath();
      c.arc(bulbX, bulbY, unit * 0.18, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#fff200';
      c.beginPath();
      c.arc(bulbX, bulbY, unit * 0.02, 0, Math.PI * 2);
      c.fill();

      // Bare Tree with Red Leaves (Cây khô vài lá đỏ bên phải)
      const treeX = w * 0.82;
      c.strokeStyle = '#4b382a';
      c.lineWidth = Math.max(3.5, unit * 0.009);
      c.beginPath();
      c.moveTo(treeX, groundY);
      c.lineTo(treeX, groundY - h * 0.35);
      c.lineTo(treeX - w * 0.04, groundY - h * 0.46);
      c.moveTo(treeX, groundY - h * 0.28);
      c.lineTo(treeX + w * 0.05, groundY - h * 0.42);
      c.stroke();

      // Red leaves
      c.fillStyle = '#eb3b5a';
      [
        [treeX - w * 0.03, groundY - h * 0.44],
        [treeX - w * 0.045, groundY - h * 0.48],
        [treeX + w * 0.04, groundY - h * 0.4],
        [treeX + w * 0.06, groundY - h * 0.43]
      ].forEach(([lx, ly]) => {
        c.beginPath();
        c.arc(lx, ly, unit * 0.008, 0, Math.PI * 2);
        c.fill();
      });

      // Ground Pavement & Sidewalk
      c.fillStyle = '#718093';
      c.fillRect(0, groundY, w, h - groundY);
      c.strokeStyle = '#2f3542';
      c.lineWidth = Math.max(2.0, unit * 0.005);
      c.beginPath();
      c.moveTo(0, groundY);
      c.lineTo(w, groundY);
      c.stroke();

      // Bicycle with back cargo box (Xe đạp chở thùng bánh bao)
      const bikeX = w * 0.18;
      const bikeY = groundY - unit * 0.05;
      c.strokeStyle = '#20bf6b';
      c.lineWidth = Math.max(1.5, unit * 0.0035);
      // Wheels
      c.beginPath();
      c.arc(bikeX - unit * 0.05, bikeY + unit * 0.025, unit * 0.03, 0, Math.PI * 2);
      c.arc(bikeX + unit * 0.05, bikeY + unit * 0.025, unit * 0.03, 0, Math.PI * 2);
      c.stroke();
      // Cargo box
      c.fillStyle = '#d1ccc0';
      c.fillRect(bikeX - unit * 0.08, bikeY - unit * 0.04, unit * 0.05, unit * 0.045);
      c.strokeRect(bikeX - unit * 0.08, bikeY - unit * 0.04, unit * 0.05, unit * 0.045);

      // Walking Pedestrian Silhouettes (Bóng người đi bộ mờ ảo)
      const timeOffset = (time || 0) * 0.05;
      [0.38, 0.62].forEach((pxBase, idx) => {
        const px = ((pxBase + timeOffset * (idx === 0 ? 1 : -1)) % 1.0) * w;
        const py = groundY - unit * 0.16;
        c.fillStyle = 'rgba(74, 85, 104, 0.45)';
        c.beginPath();
        c.arc(px, py - unit * 0.06, unit * 0.025, 0, Math.PI * 2);
        c.fill();
        c.fillRect(px - unit * 0.02, py - unit * 0.03, unit * 0.04, unit * 0.1);
      });

      // Floating Mist / Fog Rings (Lớp sương mờ bay nhẹ)
      c.fillStyle = 'rgba(255, 255, 255, 0.18)';
      for (let m = 0; m < 3; m++) {
        const mx = (w * 0.2 + m * (w * 0.3) + Math.sin((time || 0) * 0.8 + m) * 20);
        const my = groundY - h * 0.22 + m * 15;
        c.beginPath();
        c.ellipse(mx, my, w * 0.22, h * 0.06, 0, 0, Math.PI * 2);
        c.fill();
      }

      c.restore();
    }

    // --- Helper: Draw Subway / Night Bus Window Scene ---
    drawSubwayWindow(c, w, h, unit, o, time) {
      c.save();
      // Subway interior wall
      c.fillStyle = '#dcdde1';
      c.fillRect(0, 0, w, h);

      // Large train window frame
      const winX = w * 0.08;
      const winY = h * 0.14;
      const winW = w * 0.84;
      const winH = h * 0.52;

      // Dark night sky through window
      c.save();
      c.beginPath();
      c.roundRect(winX, winY, winW, winH, unit * 0.03);
      c.clip();

      const nightGrad = c.createLinearGradient(0, winY, 0, winY + winH);
      nightGrad.addColorStop(0, '#0c1023');
      nightGrad.addColorStop(1, '#1e272e');
      c.fillStyle = nightGrad;
      c.fillRect(winX, winY, winW, winH);

      // Distant skyline passing by with parallax lights
      const scroll = ((time || 0) * 35) % (w * 0.6);
      c.fillStyle = '#111424';
      for (let i = -1; i < 14; i++) {
        const bx = winX + i * (w * 0.07) - scroll;
        const bw = w * 0.065;
        const bh = winH * (0.45 + (Math.sin(i * 4.3) + 1) * 0.25);
        c.fillRect(bx, winY + winH - bh, bw, bh);

        // Lit yellow office windows
        c.fillStyle = '#fbc531';
        for (let r = 0; r < 4; r++) {
          for (let col = 0; col < 2; col++) {
            if ((i + r + col) % 3 === 0) {
              c.fillRect(bx + col * (bw * 0.4) + bw * 0.15, winY + winH - bh + r * 18 + 10, bw * 0.25, 8);
            }
          }
        }
        c.fillStyle = '#111424';
      }

      // Horizontal red light streaks across the night
      c.strokeStyle = 'rgba(235, 59, 90, 0.45)';
      c.lineWidth = 2.5;
      [-10, 20].forEach(dy => {
        c.beginPath();
        c.moveTo(winX, winY + winH * 0.4 + dy);
        c.lineTo(winX + winW, winY + winH * 0.4 + dy);
        c.stroke();
      });

      c.restore();

      // Window Glass Border & Center Pillar
      c.strokeStyle = '#2f3542';
      c.lineWidth = Math.max(3.0, unit * 0.007);
      c.beginPath();
      c.roundRect(winX, winY, winW, winH, unit * 0.03);
      c.stroke();
      c.beginPath();
      c.moveTo(w / 2, winY);
      c.lineTo(w / 2, winY + winH);
      c.stroke();

      // Overhead Handrails & Hanging Straps
      c.strokeStyle = '#718093';
      c.lineWidth = Math.max(2.5, unit * 0.005);
      c.beginPath();
      c.moveTo(winX, winY - unit * 0.03);
      c.lineTo(winX + winW, winY - unit * 0.03);
      c.stroke();

      for (let s = 1; s <= 5; s++) {
        const sx = winX + s * (winW / 6);
        c.beginPath();
        c.moveTo(sx, winY - unit * 0.03);
        c.lineTo(sx, winY + unit * 0.02);
        c.stroke();
        c.beginPath();
        c.arc(sx, winY + unit * 0.045, unit * 0.022, 0, Math.PI * 2);
        c.stroke();
      }

      // Blue Cushioned Passenger Seat Bar
      const seatY = h * 0.64;
      c.fillStyle = '#3867d6';
      c.strokeStyle = '#1e272e';
      c.fillRect(0, seatY, w, h * 0.09);
      c.strokeRect(0, seatY, w, h * 0.09);

      // Foreground Seat Partition Barrier
      const barY = h * 0.72;
      c.fillStyle = '#4b7bec';
      c.fillRect(0, barY, w, h * 0.16);
      c.strokeRect(0, barY, w, h * 0.16);

      c.restore();
    }

    // --- Helper: Draw Overpass Balcony Night Scene ---
    drawOverpassNight(c, w, h, unit, o, time) {
      c.save();
      // Night Sky
      const skyGrad = c.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0a0d18');
      skyGrad.addColorStop(0.6, '#181b29');
      skyGrad.addColorStop(1, '#2c3042');
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, w, h);

      // Skyline Buildings
      const groundY = h * 0.75;
      c.fillStyle = '#0f111c';
      for (let i = 0; i < 18; i++) {
        const bx = i * (w * 0.06);
        const bw = w * 0.055;
        const bh = h * (0.28 + (Math.sin(i * 2.8) + 1) * 0.18);
        c.fillRect(bx, groundY - bh, bw, bh);

        // Windows
        c.fillStyle = '#e5b842';
        for (let r = 0; r < 5; r++) {
          if ((i * 3 + r) % 2 === 0) {
            c.fillRect(bx + bw * 0.3, groundY - bh + r * 14 + 10, bw * 0.4, 5);
          }
        }
        c.fillStyle = '#0f111c';
      }

      // Highway / Expressway below
      c.fillStyle = '#141724';
      c.fillRect(0, groundY - h * 0.2, w, h * 0.2);

      // Yellow Dashed Center Line
      c.strokeStyle = '#e5b842';
      c.lineWidth = 2.5;
      c.setLineDash([16, 14]);
      c.beginPath();
      c.moveTo(0, groundY - h * 0.1);
      c.lineTo(w, groundY - h * 0.1);
      c.stroke();
      c.setLineDash([]);

      // Moving Traffic Headlights (White, heading right) & Taillights (Red, heading left)
      const t = (time || 0) * 80;
      for (let k = 0; k < 9; k++) {
        // Red taillights
        const rx = (w - (t + k * 160)) % (w + 100);
        const ry = groundY - h * 0.14;
        c.fillStyle = 'rgba(235, 59, 90, 0.85)';
        c.shadowColor = '#eb3b5a';
        c.shadowBlur = 10;
        c.beginPath();
        c.ellipse(rx, ry, 12, 4, 0, 0, Math.PI * 2);
        c.ellipse(rx + 18, ry, 12, 4, 0, 0, Math.PI * 2);
        c.fill();

        // White headlights
        const wx = (t * 1.2 + k * 180) % (w + 100);
        const wy = groundY - h * 0.06;
        c.fillStyle = 'rgba(255, 255, 255, 0.9)';
        c.shadowColor = '#ffffff';
        c.shadowBlur = 12;
        c.beginPath();
        c.ellipse(wx, wy, 14, 5, 0, 0, Math.PI * 2);
        c.ellipse(wx + 22, wy, 14, 5, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.shadowBlur = 0;

      // Overpass Metal Railing (Lan can cầu vượt kim loại)
      const railY = h * 0.78;
      c.fillStyle = '#2f3542';
      c.strokeStyle = '#1e272e';
      c.lineWidth = Math.max(3.0, unit * 0.007);
      // Top horizontal rail
      c.fillRect(0, railY, w, unit * 0.04);
      c.strokeRect(0, railY, w, unit * 0.04);
      // Vertical bars
      for (let b = 0; b < 24; b++) {
        const bx = b * (w / 23);
        c.fillRect(bx - 3, railY + unit * 0.04, 6, h - (railY + unit * 0.04));
        c.strokeRect(bx - 3, railY + unit * 0.04, 6, h - (railY + unit * 0.04));
      }

      c.restore();
    }

    // --- Helper: Draw Desk & Floor Lamp Room Scene ---
    drawDeskRoom(c, w, h, unit, o, time) {
      c.save();
      // Room dark backdrop
      c.fillStyle = '#1e272e';
      c.fillRect(0, 0, w, h);

      // Floor Lamp Warm Radial Glow (Đèn cây tỏa quầng sáng vàng dịu)
      const lampX = w * 0.42;
      const lampY = h * 0.45;
      const lampGlow = c.createRadialGradient(lampX, lampY, 10, lampX, lampY, unit * 0.45);
      lampGlow.addColorStop(0, 'rgba(255, 234, 167, 0.85)');
      lampGlow.addColorStop(0.45, 'rgba(253, 203, 110, 0.35)');
      lampGlow.addColorStop(1, 'rgba(30, 39, 46, 0)');
      c.fillStyle = lampGlow;
      c.beginPath();
      c.arc(lampX, lampY, unit * 0.45, 0, Math.PI * 2);
      c.fill();

      // Floor Lamp Stand & Cone Shade
      c.strokeStyle = '#2d3436';
      c.lineWidth = Math.max(2.5, unit * 0.006);
      c.beginPath();
      c.moveTo(lampX, h * 0.78);
      c.lineTo(lampX, lampY);
      c.stroke();
      // Lamp Base
      c.fillRect(lampX - unit * 0.04, h * 0.77, unit * 0.08, unit * 0.015);
      // Lamp Shade
      c.fillStyle = '#ffeaa7';
      c.beginPath();
      c.moveTo(lampX - unit * 0.06, lampY);
      c.lineTo(lampX + unit * 0.06, lampY);
      c.lineTo(lampX + unit * 0.08, lampY + unit * 0.09);
      c.lineTo(lampX - unit * 0.08, lampY + unit * 0.09);
      c.closePath();
      c.fill();
      c.stroke();

      // Slightly Ajar Wooden Door on Right (Cánh cửa phòng hé mở)
      const doorX = w * 0.78;
      const doorY = h * 0.28;
      const doorW = w * 0.16;
      const doorH = h * 0.52;
      c.fillStyle = '#634027';
      c.strokeStyle = '#1e272e';
      c.lineWidth = Math.max(2.5, unit * 0.005);
      c.fillRect(doorX, doorY, doorW, doorH);
      c.strokeRect(doorX, doorY, doorW, doorH);
      // Door knob
      c.fillStyle = '#f1c40f';
      c.beginPath();
      c.arc(doorX + doorW * 0.15, doorY + doorH * 0.5, unit * 0.01, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Work Desk in Foreground
      const deskY = h * 0.72;
      c.fillStyle = '#2d3436';
      c.fillRect(0, deskY, w * 0.55, h - deskY);
      c.strokeRect(0, deskY, w * 0.55, h - deskY);

      // Laptop on Desk
      const lapX = w * 0.22;
      const lapY = deskY - unit * 0.08;
      c.fillStyle = '#747d8c';
      c.fillRect(lapX, lapY, unit * 0.12, unit * 0.08);
      c.strokeRect(lapX, lapY, unit * 0.12, unit * 0.08);
      // Glowing Laptop Screen
      c.fillStyle = '#70a1ff';
      c.fillRect(lapX + 3, lapY + 3, unit * 0.12 - 6, unit * 0.08 - 6);

      c.restore();
    }

    // --- Helper: Draw Party / Night Festival Scene ---
    drawPartyNight(c, w, h, unit, o, time) {
      c.save();
      // Night Festive Sky
      const skyGrad = c.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#101426');
      skyGrad.addColorStop(1, '#25293e');
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, w, h);

      // Hanging String Fairy Lights (Dây đèn tròn vàng treo võng lung linh)
      c.strokeStyle = 'rgba(255,255,255,0.4)';
      c.lineWidth = 1.8;
      const lightY = h * 0.22;
      c.beginPath();
      c.moveTo(0, lightY);
      c.quadraticCurveTo(w * 0.5, lightY + 28, w, lightY);
      c.stroke();

      for (let b = 1; b <= 18; b++) {
        const bx = b * (w / 19);
        const curve = Math.sin((b / 19) * Math.PI) * 28;
        const by = lightY + curve;

        // Glowing bulb
        const pulse = 1.0 + Math.sin((time || 0) * 3 + b) * 0.15;
        const bGrad = c.createRadialGradient(bx, by, 1, bx, by, unit * 0.03 * pulse);
        bGrad.addColorStop(0, '#ffffff');
        bGrad.addColorStop(0.35, '#fbc531');
        bGrad.addColorStop(1, 'rgba(251, 197, 49, 0)');
        c.fillStyle = bGrad;
        c.beginPath();
        c.arc(bx, by, unit * 0.03 * pulse, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#fbc531';
        c.beginPath();
        c.arc(bx, by, unit * 0.01, 0, Math.PI * 2);
        c.fill();
      }

      // Exhibition Art Frames on Left and Right
      [[w * 0.08, h * 0.42], [w * 0.78, h * 0.42]].forEach(([fx, fy]) => {
        c.fillStyle = '#2f3542';
        c.strokeStyle = '#1e272e';
        c.lineWidth = Math.max(2.5, unit * 0.005);
        c.fillRect(fx, fy, w * 0.15, h * 0.28);
        c.strokeRect(fx, fy, w * 0.15, h * 0.28);

        // Art canvas inside
        c.fillStyle = '#fed330';
        c.fillRect(fx + 6, fy + 6, w * 0.15 - 12, h * 0.28 - 12);
      });

      // Background Trees with Fairy Sparkles
      [w * 0.3, w * 0.7].forEach(tx => {
        c.strokeStyle = '#353b48';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(tx, h * 0.78);
        c.lineTo(tx, h * 0.4);
        c.lineTo(tx - 25, h * 0.32);
        c.moveTo(tx, h * 0.5);
        c.lineTo(tx + 25, h * 0.34);
        c.stroke();
      });

      // Thought Bubble on Top Right
      const bubX = w * 0.72;
      const bubY = h * 0.24;
      c.fillStyle = 'rgba(220, 221, 225, 0.75)';
      c.strokeStyle = '#1e272e';
      c.lineWidth = 2.0;
      c.beginPath();
      c.ellipse(bubX, bubY, unit * 0.12, unit * 0.075, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      // Little bubble dots
      [[bubX - unit * 0.07, bubY + unit * 0.08, unit * 0.018], [bubX - unit * 0.09, bubY + unit * 0.12, unit * 0.012]].forEach(([cx, cy, cr]) => {
        c.beginPath();
        c.arc(cx, cy, cr, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      });

      // Crowd silhouettes in background
      const groundY = h * 0.78;
      for (let p = 0; p < 7; p++) {
        const px = w * 0.18 + p * (w * 0.11);
        const py = groundY - unit * 0.14;
        c.fillStyle = 'rgba(74, 85, 104, 0.45)';
        c.beginPath();
        c.arc(px, py - unit * 0.05, unit * 0.024, 0, Math.PI * 2);
        c.fill();
        c.fillRect(px - unit * 0.02, py - unit * 0.025, unit * 0.04, unit * 0.09);
      }

      c.restore();
    }

    // --- Helper: Draw Window Sunrise Horizon Scene ---
    drawWindowSunrise(c, w, h, unit, o, time) {
      c.save();
      // Dark room wall framing window
      c.fillStyle = '#1e272e';
      c.fillRect(0, 0, w, h);

      // Large 4-pane window centered
      const winX = w * 0.22;
      const winY = h * 0.08;
      const winW = w * 0.56;
      const winH = h * 0.65;

      c.save();
      c.beginPath();
      c.rect(winX, winY, winW, winH);
      c.clip();

      // Sky Sunrise Gradient (Tím -> Đỏ cam -> Vàng)
      const sunGrad = c.createLinearGradient(0, winY, 0, winY + winH);
      sunGrad.addColorStop(0, '#2c2c54');
      sunGrad.addColorStop(0.35, '#b33939');
      sunGrad.addColorStop(0.65, '#cd6133');
      sunGrad.addColorStop(1, '#f7b731');
      c.fillStyle = sunGrad;
      c.fillRect(winX, winY, winW, winH);

      // Radiant Sun Rays (Nan quạt ánh sáng tỏa lên từ mặt trời)
      const sunX = winX + winW * 0.5;
      const sunY = winY + winH * 0.68;
      c.fillStyle = 'rgba(255, 234, 167, 0.25)';
      for (let r = -4; r <= 4; r++) {
        c.beginPath();
        c.moveTo(sunX, sunY);
        c.lineTo(sunX + r * (winW * 0.15) - winW * 0.06, winY);
        c.lineTo(sunX + r * (winW * 0.15) + winW * 0.06, winY);
        c.closePath();
        c.fill();
      }

      // Sun Core (Mặt trời hình tròn vàng rực)
      const sunR = unit * 0.11;
      const sunCoreGrad = c.createRadialGradient(sunX, sunY, 5, sunX, sunY, sunR * 1.5);
      sunCoreGrad.addColorStop(0, '#ffffff');
      sunCoreGrad.addColorStop(0.45, '#fff200');
      sunCoreGrad.addColorStop(1, 'rgba(255, 177, 66, 0)');
      c.fillStyle = sunCoreGrad;
      c.beginPath();
      c.arc(sunX, sunY, sunR * 1.5, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(sunX, sunY, sunR * 0.65, 0, Math.PI * 2);
      c.fill();

      // Rolling Distant Hills / Mountains (Đồi núi uốn lượn)
      c.fillStyle = '#78281f';
      c.beginPath();
      c.moveTo(winX, winY + winH);
      c.quadraticCurveTo(winX + winW * 0.35, winY + winH * 0.72, winX + winW * 0.6, winY + winH * 0.85);
      c.quadraticCurveTo(winX + winW * 0.85, winY + winH * 0.75, winX + winW, winY + winH * 0.82);
      c.lineTo(winX + winW, winY + winH);
      c.closePath();
      c.fill();

      // Foreground Hills
      c.fillStyle = '#4c1a17';
      c.beginPath();
      c.moveTo(winX, winY + winH);
      c.quadraticCurveTo(winX + winW * 0.25, winY + winH * 0.84, winX + winW * 0.5, winY + winH);
      c.closePath();
      c.fill();

      // Floating Dust Motes / Sparkles (Hạt bụi sáng bay lơ lửng)
      c.fillStyle = 'rgba(255, 255, 255, 0.65)';
      for (let s = 0; s < 14; s++) {
        const sx = winX + (Math.sin(s * 7.3 + (time || 0) * 0.5) * 0.45 + 0.5) * winW;
        const sy = winY + ((s * 17) % 70) * (winH / 100);
        c.beginPath();
        c.arc(sx, sy, 1.8, 0, Math.PI * 2);
        c.fill();
      }

      c.restore();

      // 4-Pane Window Frame
      c.strokeStyle = '#000000';
      c.lineWidth = Math.max(4.0, unit * 0.009);
      c.strokeRect(winX, winY, winW, winH);
      // Crossbars
      c.beginPath();
      c.moveTo(winX + winW / 2, winY);
      c.lineTo(winX + winW / 2, winY + winH);
      c.moveTo(winX, winY + winH * 0.5);
      c.lineTo(winX + winW, winY + winH * 0.5);
      c.stroke();

      // Window Sill (Bậu cửa sổ)
      c.fillStyle = '#2d3436';
      c.fillRect(winX - unit * 0.03, winY + winH, winW + unit * 0.06, unit * 0.03);
      c.strokeRect(winX - unit * 0.03, winY + winH, winW + unit * 0.06, unit * 0.03);

      c.restore();
    }

    // --- Helper: Draw Rain Cafe / Coffee Shop Window Scene ---
    drawRainCafe(c, w, h, unit, o, time) {
      c.save();
      // Outside rainy moody backdrop
      const rainGrad = c.createLinearGradient(0, 0, 0, h);
      rainGrad.addColorStop(0, '#2c3e50');
      rainGrad.addColorStop(0.7, '#34495e');
      rainGrad.addColorStop(1, '#1e272e');
      c.fillStyle = rainGrad;
      c.fillRect(0, 0, w, h);

      // Blurred distant city lights & neon shop signs through wet window
      const neonColors = ['#ff7675', '#74b9ff', '#ffeaa7', '#a29bfe'];
      for (let i = 0; i < 12; i++) {
        const nx = ((i * 137) % (w - 100)) + 50;
        const ny = ((i * 79) % (h * 0.5)) + h * 0.15;
        const col = neonColors[i % neonColors.length];
        c.fillStyle = col;
        c.globalAlpha = 0.25;
        c.beginPath();
        c.arc(nx, ny, unit * 0.08, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1.0;

      // Diagonal rain streaks outside
      c.strokeStyle = 'rgba(223, 230, 233, 0.35)';
      c.lineWidth = 1.5;
      for (let r = 0; r < 60; r++) {
        const rx = ((r * 43 + (time || 0) * 350) % (w + 100)) - 50;
        const ry = (r * 31 + (time || 0) * 800) % (h * 0.7);
        c.beginPath();
        c.moveTo(rx, ry);
        c.lineTo(rx - 12, ry + 22);
        c.stroke();
      }

      // Vertical water droplets sliding down window glass
      c.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let d = 0; d < 25; d++) {
        const dx = (d * 53) % w;
        const dy = ((time || 0) * (30 + (d % 5) * 15) + d * 80) % (h * 0.7);
        c.beginPath();
        c.ellipse(dx, dy, unit * 0.003, unit * 0.012, 0, 0, Math.PI * 2);
        c.fill();
      }

      // Cozy Interior Wooden Window Sill & Countertop
      const counterY = h * 0.7;
      c.fillStyle = '#4a2f1c';
      c.fillRect(0, counterY, w, h - counterY);
      c.strokeStyle = '#1e272e';
      c.lineWidth = Math.max(2.5, unit * 0.006);
      c.strokeRect(0, counterY, w, h - counterY);
      // Counter top highlight edge
      c.fillStyle = '#6b4423';
      c.fillRect(0, counterY, w, unit * 0.025);

      // Hanging Industrial Cafe Pendant Lamp
      const lampX = w * 0.25;
      const lampY = h * 0.28;
      c.strokeStyle = '#1e272e';
      c.lineWidth = 2.0;
      c.beginPath();
      c.moveTo(lampX, 0);
      c.lineTo(lampX, lampY);
      c.stroke();
      // Lamp Shade
      c.fillStyle = '#2d3436';
      c.beginPath();
      c.arc(lampX, lampY, unit * 0.07, Math.PI, 0);
      c.closePath();
      c.fill();
      c.stroke();
      // Warm Light Glow
      const glow = c.createRadialGradient(lampX, lampY + 5, 2, lampX, lampY + 5, unit * 0.35);
      glow.addColorStop(0, 'rgba(255, 234, 167, 0.85)');
      glow.addColorStop(0.4, 'rgba(253, 203, 110, 0.3)');
      glow.addColorStop(1, 'rgba(253, 203, 110, 0)');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(lampX, lampY + 5, unit * 0.35, 0, Math.PI * 2);
      c.fill();

      // Steaming Ceramic Coffee Mug on Counter
      const mugX = w * 0.75;
      const mugY = counterY - unit * 0.02;
      const mugW = unit * 0.07;
      const mugH = unit * 0.085;
      c.fillStyle = '#f5f6fa';
      c.beginPath();
      c.roundRect(mugX, mugY - mugH, mugW, mugH, unit * 0.01);
      c.fill();
      c.stroke();
      // Mug handle
      c.beginPath();
      c.arc(mugX + mugW + unit * 0.012, mugY - mugH * 0.5, unit * 0.022, -Math.PI * 0.4, Math.PI * 0.4);
      c.stroke();
      // Steam swirls
      c.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      c.lineWidth = 2.0;
      for (let s = 0; s < 2; s++) {
        const sx = mugX + mugW * 0.35 + s * unit * 0.025;
        const phase = Math.sin((time || 0) * 3 + s) * (unit * 0.01);
        c.beginPath();
        c.moveTo(sx, mugY - mugH - 5);
        c.quadraticCurveTo(sx + phase, mugY - mugH - unit * 0.05, sx - phase, mugY - mugH - unit * 0.1);
        c.stroke();
      }

      c.restore();
    }

    // --- Helper: Draw Autumn Park with Bench & Falling Leaves ---
    drawParkAutumn(c, w, h, unit, o, time) {
      c.save();
      // Warm golden autumn sky
      const skyGrad = c.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#f8a5c2');
      skyGrad.addColorStop(0.45, '#f7d794');
      skyGrad.addColorStop(1, '#f5cd79');
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, w, h);

      // Distant rolling park hills
      c.fillStyle = '#e58e26';
      c.beginPath();
      c.moveTo(0, h * 0.75);
      c.quadraticCurveTo(w * 0.35, h * 0.62, w * 0.7, h * 0.72);
      c.quadraticCurveTo(w * 0.88, h * 0.76, w, h * 0.7);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();

      // Foreground grass lawn
      const groundY = h * 0.74;
      c.fillStyle = '#b7791f';
      c.fillRect(0, groundY, w, h - groundY);
      c.strokeStyle = '#1e272e';
      c.lineWidth = Math.max(2.0, unit * 0.005);
      c.strokeRect(0, groundY, w, h - groundY);

      // Winding Stone Pathway
      c.fillStyle = '#d2dae2';
      c.beginPath();
      c.moveTo(w * 0.45, groundY);
      c.quadraticCurveTo(w * 0.52, groundY + (h - groundY) * 0.5, w * 0.4, h);
      c.lineTo(w * 0.65, h);
      c.quadraticCurveTo(w * 0.68, groundY + (h - groundY) * 0.5, w * 0.55, groundY);
      c.closePath();
      c.fill();
      c.stroke();

      // Majestic Autumn Tree with Golden Foliage on Right
      const treeX = w * 0.85;
      c.fillStyle = '#5c3d2e';
      c.beginPath();
      c.moveTo(treeX - unit * 0.03, groundY + 10);
      c.lineTo(treeX - unit * 0.02, groundY - h * 0.38);
      c.lineTo(treeX + unit * 0.02, groundY - h * 0.38);
      c.lineTo(treeX + unit * 0.03, groundY + 10);
      c.closePath();
      c.fill();
      c.stroke();

      // Foliage puff balls in warm shades
      const folColors = ['#e55039', '#eb2f06', '#f6b93b', '#fa983a'];
      [
        [treeX, groundY - h * 0.48, unit * 0.16, folColors[0]],
        [treeX - unit * 0.1, groundY - h * 0.42, unit * 0.13, folColors[1]],
        [treeX + unit * 0.1, groundY - h * 0.44, unit * 0.14, folColors[2]],
        [treeX - unit * 0.04, groundY - h * 0.56, unit * 0.12, folColors[3]],
        [treeX + unit * 0.05, groundY - h * 0.55, unit * 0.11, folColors[0]]
      ].forEach(([fx, fy, fr, col]) => {
        c.fillStyle = col;
        c.beginPath();
        c.arc(fx, fy, fr, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      });

      // Classic Park Bench on Left
      const benchX = w * 0.28;
      const benchY = groundY - unit * 0.04;
      const benchW = w * 0.26;
      // Slats (warm wood)
      c.fillStyle = '#d35400';
      c.fillRect(benchX, benchY, benchW, unit * 0.02);
      c.strokeRect(benchX, benchY, benchW, unit * 0.02);
      c.fillRect(benchX, benchY - unit * 0.06, benchW, unit * 0.03);
      c.strokeRect(benchX, benchY - unit * 0.06, benchW, unit * 0.03);
      // Bench cast iron legs & backrest posts
      c.strokeStyle = '#2d3436';
      c.lineWidth = 3;
      [benchX + unit * 0.02, benchX + benchW - unit * 0.02].forEach(bx => {
        c.beginPath();
        c.moveTo(bx, benchY - unit * 0.07);
        c.lineTo(bx, groundY + unit * 0.03);
        c.stroke();
      });

      // Vintage Black Lamppost
      const postX = w * 0.12;
      c.strokeStyle = '#2f3542';
      c.lineWidth = 3.5;
      c.beginPath();
      c.moveTo(postX, groundY + 10);
      c.lineTo(postX, groundY - h * 0.45);
      c.stroke();
      // Lantern
      c.fillStyle = '#ffeaa7';
      c.fillRect(postX - unit * 0.03, groundY - h * 0.48, unit * 0.06, unit * 0.06);
      c.strokeRect(postX - unit * 0.03, groundY - h * 0.48, unit * 0.06, unit * 0.06);

      // Falling Autumn Leaves Fluttering
      const leafColors = ['#e55039', '#f6b93b', '#fa983a', '#e58e26'];
      for (let l = 0; l < 16; l++) {
        const lx = ((l * 83 - (time || 0) * 45) % w + w) % w;
        const ly = ((l * 47 + (time || 0) * 60) % (h * 0.8)) + h * 0.1;
        const rot = (time || 0) * 2 + l;
        c.save();
        c.translate(lx, ly);
        c.rotate(rot);
        c.fillStyle = leafColors[l % leafColors.length];
        c.beginPath();
        c.ellipse(0, 0, unit * 0.014, unit * 0.007, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.restore();
      }

      c.restore();
    }

    // --- Helper: Draw Crossroads / Winding Journey Scene ---
    drawCrossroads(c, w, h, unit, o, time) {
      c.save();
      // Expansive sky
      const skyGrad = c.createLinearGradient(0, 0, 0, h * 0.6);
      skyGrad.addColorStop(0, '#74b9ff');
      skyGrad.addColorStop(0.7, '#dfe6e9');
      skyGrad.addColorStop(1, '#ffeaa7');
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, w, h);

      // Distant mountain ranges
      c.fillStyle = '#a29bfe';
      c.beginPath();
      c.moveTo(0, h * 0.55);
      c.lineTo(w * 0.25, h * 0.35);
      c.lineTo(w * 0.5, h * 0.52);
      c.lineTo(w * 0.75, h * 0.38);
      c.lineTo(w, h * 0.5);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();

      // Green & Golden Countryside Rolling Hills
      c.fillStyle = '#2ed573';
      c.beginPath();
      c.moveTo(0, h * 0.52);
      c.quadraticCurveTo(w * 0.4, h * 0.45, w, h * 0.55);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();

      // Forking Crossroads (Con đường rẽ 2 ngả)
      c.fillStyle = '#f1f2f6';
      c.strokeStyle = '#1e272e';
      c.lineWidth = Math.max(2.5, unit * 0.005);
      // Main trunk coming up from bottom center
      c.beginPath();
      c.moveTo(w * 0.38, h);
      c.lineTo(w * 0.46, h * 0.68);
      // Left branch leading into mountains
      c.quadraticCurveTo(w * 0.3, h * 0.62, w * 0.15, h * 0.52);
      c.lineTo(w * 0.22, h * 0.51);
      c.quadraticCurveTo(w * 0.35, h * 0.58, w * 0.5, h * 0.64);
      // Right branch leading to horizon
      c.quadraticCurveTo(w * 0.68, h * 0.58, w * 0.85, h * 0.52);
      c.lineTo(w * 0.92, h * 0.53);
      c.quadraticCurveTo(w * 0.72, h * 0.62, w * 0.54, h * 0.68);
      c.lineTo(w * 0.62, h);
      c.closePath();
      c.fill();
      c.stroke();

      // Wooden Signpost at Intersection
      const postX = w * 0.5;
      const postY = h * 0.65;
      c.fillStyle = '#795548';
      c.fillRect(postX - unit * 0.012, postY - unit * 0.15, unit * 0.024, unit * 0.15);
      c.strokeRect(postX - unit * 0.012, postY - unit * 0.15, unit * 0.024, unit * 0.15);
      // Left arrow sign
      c.fillStyle = '#d7ccc8';
      c.beginPath();
      c.moveTo(postX - unit * 0.1, postY - unit * 0.14);
      c.lineTo(postX - unit * 0.13, postY - unit * 0.115);
      c.lineTo(postX - unit * 0.1, postY - unit * 0.09);
      c.lineTo(postX + unit * 0.02, postY - unit * 0.09);
      c.lineTo(postX + unit * 0.02, postY - unit * 0.14);
      c.closePath();
      c.fill();
      c.stroke();
      // Right arrow sign
      c.beginPath();
      c.moveTo(postX - unit * 0.02, postY - unit * 0.08);
      c.lineTo(postX + unit * 0.1, postY - unit * 0.08);
      c.lineTo(postX + unit * 0.13, postY - unit * 0.055);
      c.lineTo(postX + unit * 0.1, postY - unit * 0.03);
      c.lineTo(postX - unit * 0.02, postY - unit * 0.03);
      c.closePath();
      c.fill();
      c.stroke();

      // Floating dandelion puffs drifting across sky
      c.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let p = 0; p < 12; p++) {
        const px = ((p * 97 + (time || 0) * 40) % (w + 100)) - 50;
        const py = (p * 59 + Math.sin((time || 0) * 2 + p) * 15) % (h * 0.6);
        c.beginPath();
        c.arc(px, py, unit * 0.005, 0, Math.PI * 2);
        c.fill();
      }

      c.restore();
    }

    // --- Helper: Draw Bedroom Night Scene ---
    drawBedroomNight(c, w, h, unit, o, time) {
      c.save();
      // Dark quiet bedroom walls
      c.fillStyle = '#0f172a';
      c.fillRect(0, 0, w, h);

      // Window on top left with moon and stars
      const winX = w * 0.12;
      const winY = h * 0.12;
      const winW = w * 0.28;
      const winH = h * 0.42;
      c.save();
      c.beginPath();
      c.rect(winX, winY, winW, winH);
      c.clip();
      // Night sky through window
      c.fillStyle = '#020617';
      c.fillRect(winX, winY, winW, winH);
      // Crescent Moon
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.arc(winX + winW * 0.65, winY + winH * 0.35, unit * 0.05, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#020617';
      c.beginPath();
      c.arc(winX + winW * 0.65 - unit * 0.018, winY + winH * 0.35 - unit * 0.01, unit * 0.045, 0, Math.PI * 2);
      c.fill();
      // Window panes cross
      c.restore();
      c.strokeStyle = '#334155';
      c.lineWidth = 4;
      c.strokeRect(winX, winY, winW, winH);
      c.beginPath();
      c.moveTo(winX + winW / 2, winY);
      c.lineTo(winX + winW / 2, winY + winH);
      c.moveTo(winX, winY + winH / 2);
      c.lineTo(winX + winW, winY + winH / 2);
      c.stroke();

      // Cozy Bed in Foreground Right
      const bedX = w * 0.48;
      const bedY = h * 0.58;
      const bedW = w * 0.45;
      const bedH = h * 0.32;
      // Headboard
      c.fillStyle = '#475569';
      c.strokeStyle = '#1e293b';
      c.lineWidth = 3;
      c.fillRect(bedX, bedY - unit * 0.12, bedW * 0.22, unit * 0.24);
      c.strokeRect(bedX, bedY - unit * 0.12, bedW * 0.22, unit * 0.24);
      // Mattress & Duvet
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.roundRect(bedX + unit * 0.02, bedY, bedW, bedH, unit * 0.02);
      c.fill();
      c.stroke();
      // Pillow
      c.fillStyle = '#f8fafc';
      c.beginPath();
      c.roundRect(bedX + unit * 0.04, bedY + unit * 0.02, unit * 0.12, unit * 0.08, unit * 0.015);
      c.fill();
      c.stroke();

      // Nightstand with glowing digital clock
      const standX = w * 0.36;
      const standY = h * 0.65;
      c.fillStyle = '#334155';
      c.fillRect(standX, standY, unit * 0.1, h - standY);
      c.strokeRect(standX, standY, unit * 0.1, h - standY);
      // Clock
      c.fillStyle = '#020617';
      c.fillRect(standX + unit * 0.015, standY - unit * 0.04, unit * 0.07, unit * 0.035);
      c.strokeRect(standX + unit * 0.015, standY - unit * 0.04, unit * 0.07, unit * 0.035);
      // Glowing green numbers (02:15)
      c.fillStyle = '#4ade80';
      c.font = `700 ${unit * 0.018}px monospace`;
      c.textAlign = 'center';
      c.fillText('02:15', standX + unit * 0.05, standY - unit * 0.018);

      c.restore();
    }

    // --- Helper: Draw Rooftop Stars & Horizon Scene ---
    drawRooftopStars(c, w, h, unit, o, time) {
      c.save();
      // Vast Starry Midnight Sky
      const nightGrad = c.createLinearGradient(0, 0, 0, h);
      nightGrad.addColorStop(0, '#090a0f');
      nightGrad.addColorStop(0.5, '#1b1b2f');
      nightGrad.addColorStop(1, '#162447');
      c.fillStyle = nightGrad;
      c.fillRect(0, 0, w, h);

      // 40+ Twinkling Stars
      for (let s = 0; s < 45; s++) {
        const sx = ((s * 109) % w);
        const sy = ((s * 61) % (h * 0.65));
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin((time || 0) * 2 + s));
        c.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        c.beginPath();
        c.arc(sx, sy, unit * (0.002 + (s % 3) * 0.0015), 0, Math.PI * 2);
        c.fill();
      }

      // Shooting Star (Sao băng) gliding across sky periodically
      const shootTime = ((time || 0) * 0.8) % 4.0;
      if (shootTime < 1.2) {
        const stX = w * 0.2 + shootTime * w * 0.5;
        const stY = h * 0.1 + shootTime * h * 0.2;
        const stLen = unit * 0.18;
        const shootGrad = c.createLinearGradient(stX - stLen, stY - stLen * 0.4, stX, stY);
        shootGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shootGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
        c.strokeStyle = shootGrad;
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(stX - stLen, stY - stLen * 0.4);
        c.lineTo(stX, stY);
        c.stroke();
      }

      // Crescent Moon with Soft Halo
      const moonX = w * 0.82;
      const moonY = h * 0.2;
      const moonGlow = c.createRadialGradient(moonX, moonY, 10, moonX, moonY, unit * 0.15);
      moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      moonGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
      c.fillStyle = moonGlow;
      c.beginPath();
      c.arc(moonX, moonY, unit * 0.15, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.arc(moonX, moonY, unit * 0.06, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#1b1b2f';
      c.beginPath();
      c.arc(moonX - unit * 0.022, moonY - unit * 0.015, unit * 0.055, 0, Math.PI * 2);
      c.fill();

      // Distant City Skyline with warm window bokeh
      const cityY = h * 0.7;
      c.fillStyle = '#0f141d';
      for (let b = 0; b < 14; b++) {
        const bx = b * (w / 13);
        const bw = w / 12;
        const bh = unit * (0.15 + ((b * 7) % 11) * 0.015);
        c.fillRect(bx, cityY - bh, bw, bh + (h - cityY));
        // Yellow office windows
        c.fillStyle = '#f59e0b';
        c.globalAlpha = 0.35;
        for (let r = 0; r < 3; r++) {
          c.fillRect(bx + bw * 0.25, cityY - bh + r * 14 + 10, bw * 0.5, 6);
        }
        c.globalAlpha = 1.0;
        c.fillStyle = '#0f141d';
      }

      // Rooftop Concrete Parapet Ledge in Foreground
      const ledgeY = h * 0.78;
      c.fillStyle = '#262626';
      c.fillRect(0, ledgeY, w, h - ledgeY);
      c.strokeStyle = '#171717';
      c.lineWidth = 3;
      c.strokeRect(0, ledgeY, w, h - ledgeY);
      // Safety Railing
      c.strokeStyle = '#525252';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(0, ledgeY - unit * 0.06);
      c.lineTo(w, ledgeY - unit * 0.06);
      c.stroke();
      for (let r = 0; r < 18; r++) {
        const rx = r * (w / 17);
        c.beginPath();
        c.moveTo(rx, ledgeY - unit * 0.06);
        c.lineTo(rx, ledgeY);
        c.stroke();
      }

      c.restore();
    }

    // --- Helper: Draw Nature Rolling Hill with Lone Majestic Tree ---
    drawNatureHill(c, w, h, unit, o, time) {
      c.save();
      // Fresh azure sky gradient
      const skyGrad = c.createLinearGradient(0, 0, 0, h * 0.6);
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.65, '#bae6fd');
      skyGrad.addColorStop(1, '#fef08a');
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, w, h);

      // Drifting Puffy White Clouds
      c.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let cl = 0; cl < 4; cl++) {
        const cx = ((cl * 280 + (time || 0) * 15) % (w + 200)) - 100;
        const cy = h * 0.15 + cl * 25;
        c.beginPath();
        c.arc(cx, cy, unit * 0.045, 0, Math.PI * 2);
        c.arc(cx + unit * 0.035, cy - unit * 0.015, unit * 0.05, 0, Math.PI * 2);
        c.arc(cx + unit * 0.07, cy, unit * 0.04, 0, Math.PI * 2);
        c.fill();
      }

      // Distant Birds in V-formation
      c.strokeStyle = '#0369a1';
      c.lineWidth = 2;
      [
        [w * 0.35, h * 0.22],
        [w * 0.38, h * 0.2],
        [w * 0.41, h * 0.23]
      ].forEach(([bx, by]) => {
        c.beginPath();
        c.arc(bx - 6, by, 6, Math.PI, 0);
        c.arc(bx + 6, by, 6, Math.PI, 0);
        c.stroke();
      });

      // Rolling Green Hill Silhouette
      c.fillStyle = '#22c55e';
      c.beginPath();
      c.moveTo(0, h * 0.65);
      c.quadraticCurveTo(w * 0.35, h * 0.52, w * 0.7, h * 0.6);
      c.quadraticCurveTo(w * 0.88, h * 0.64, w, h * 0.58);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();
      c.strokeStyle = '#15803d';
      c.lineWidth = 3;
      c.stroke();

      // Foreground Grassy Lawn
      c.fillStyle = '#16a34a';
      c.beginPath();
      c.moveTo(0, h * 0.72);
      c.quadraticCurveTo(w * 0.5, h * 0.66, w, h * 0.76);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();

      // Solitary Grand Oak Tree atop Crest
      const treeX = w * 0.38;
      const treeY = h * 0.55;
      // Trunk
      c.fillStyle = '#78350f';
      c.beginPath();
      c.moveTo(treeX - unit * 0.025, treeY + unit * 0.08);
      c.lineTo(treeX - unit * 0.015, treeY - unit * 0.12);
      c.lineTo(treeX + unit * 0.015, treeY - unit * 0.12);
      c.lineTo(treeX + unit * 0.025, treeY + unit * 0.08);
      c.closePath();
      c.fill();
      c.stroke();
      // Lush Green Canopy Puff Balls
      const leafCols = ['#15803d', '#16a34a', '#22c55e', '#4ade80'];
      [
        [treeX, treeY - unit * 0.22, unit * 0.14, leafCols[0]],
        [treeX - unit * 0.08, treeY - unit * 0.16, unit * 0.11, leafCols[1]],
        [treeX + unit * 0.08, treeY - unit * 0.17, unit * 0.12, leafCols[2]],
        [treeX, treeY - unit * 0.28, unit * 0.1, leafCols[3]]
      ].forEach(([fx, fy, fr, col]) => {
        c.fillStyle = col;
        c.beginPath();
        c.arc(fx, fy, fr, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      });

      // Wildflowers dotting the grass
      const flowerCols = ['#f43f5e', '#eab308', '#ec4899', '#ffffff'];
      for (let fl = 0; fl < 18; fl++) {
        const fx = (fl * 73) % w;
        const fy = h * 0.75 + ((fl * 31) % (h * 0.2));
        c.fillStyle = flowerCols[fl % flowerCols.length];
        c.beginPath();
        c.arc(fx, fy, unit * 0.005, 0, Math.PI * 2);
        c.fill();
      }

      c.restore();
    }

    // --- Helper: Draw Beach Sunset / Ocean Horizon Scene ---
    drawBeachSunset(c, w, h, unit, o, time) {
      c.save();
      // Dramatic sunset sky (violet -> crimson -> amber)
      const sunGrad = c.createLinearGradient(0, 0, 0, h * 0.6);
      sunGrad.addColorStop(0, '#581c87');
      sunGrad.addColorStop(0.35, '#be123c');
      sunGrad.addColorStop(0.7, '#f97316');
      sunGrad.addColorStop(1, '#fde047');
      c.fillStyle = sunGrad;
      c.fillRect(0, 0, w, h);

      // Setting Sun on Sea Horizon
      const sunX = w * 0.5;
      const sunY = h * 0.58;
      const sunR = unit * 0.12;
      c.fillStyle = '#fffbeb';
      c.beginPath();
      c.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      c.fill();

      // Calm Deep Ocean Waters
      const seaY = h * 0.58;
      const oceanGrad = c.createLinearGradient(0, seaY, 0, h * 0.82);
      oceanGrad.addColorStop(0, '#0369a1');
      oceanGrad.addColorStop(1, '#0c4a6e');
      c.fillStyle = oceanGrad;
      c.fillRect(0, seaY, w, h * 0.82 - seaY);

      // Shimmering Golden Sunset Reflection Path on Water
      c.fillStyle = 'rgba(254, 240, 138, 0.45)';
      for (let r = 0; r < 14; r++) {
        const ry = seaY + r * 11 + 6;
        const rw = unit * (0.05 + r * 0.035 + Math.sin((time || 0) * 3 + r) * 0.015);
        c.beginPath();
        c.ellipse(sunX, ry, rw, 3, 0, 0, Math.PI * 2);
        c.fill();
      }

      // Rolling Gentle Shoreline Cartoon Waves
      const waveY = h * 0.78;
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.moveTo(0, waveY);
      for (let x = 0; x <= w; x += 40) {
        const wy = waveY + Math.sin(x * 0.03 + (time || 0) * 4) * 8;
        c.lineTo(x, wy);
      }
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();

      // Warm Golden Sandy Beach in Foreground
      const sandY = h * 0.8;
      c.fillStyle = '#fde68a';
      c.fillRect(0, sandY, w, h - sandY);
      c.strokeStyle = '#d97706';
      c.lineWidth = 2.5;
      c.strokeRect(0, sandY, w, h - sandY);

      // Distant Sailing Boat Silhouette
      const boatX = w * 0.8;
      const boatY = seaY - unit * 0.02;
      c.fillStyle = '#0f172a';
      c.beginPath();
      c.moveTo(boatX - unit * 0.03, boatY);
      c.lineTo(boatX + unit * 0.03, boatY);
      c.lineTo(boatX + unit * 0.015, boatY + unit * 0.015);
      c.lineTo(boatX - unit * 0.02, boatY + unit * 0.015);
      c.closePath();
      c.fill();
      // Sail
      c.beginPath();
      c.moveTo(boatX, boatY);
      c.lineTo(boatX, boatY - unit * 0.045);
      c.lineTo(boatX + unit * 0.025, boatY);
      c.closePath();
      c.fill();

      c.restore();
    }

    // --- Helper: Draw Late Night Corporate Office Desk Scene ---
    drawOfficeDesk(c, w, h, unit, o, time) {
      c.save();
      // Office interior dark wall
      c.fillStyle = '#111827';
      c.fillRect(0, 0, w, h);

      // Massive panoramic office window showing illuminated skyscrapers
      const winX = w * 0.1;
      const winY = h * 0.08;
      const winW = w * 0.8;
      const winH = h * 0.58;
      c.save();
      c.beginPath();
      c.rect(winX, winY, winW, winH);
      c.clip();
      // Night city background
      c.fillStyle = '#030712';
      c.fillRect(winX, winY, winW, winH);
      // Skyscraper towers
      for (let b = 0; b < 10; b++) {
        const bx = winX + b * (winW / 9.5);
        const bw = winW * 0.11;
        const bh = winH * (0.5 + ((b * 5) % 9) * 0.05);
        c.fillStyle = '#1f2937';
        c.fillRect(bx, winY + winH - bh, bw, bh);
        // Windows
        c.fillStyle = '#fbbf24';
        c.globalAlpha = 0.35;
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 2; col++) {
            c.fillRect(bx + col * 20 + 8, winY + winH - bh + row * 16 + 10, 12, 6);
          }
        }
        c.globalAlpha = 1.0;
      }
      c.restore();
      c.strokeStyle = '#374151';
      c.lineWidth = 4;
      c.strokeRect(winX, winY, winW, winH);

      // Office Desk in Foreground
      const deskY = h * 0.7;
      c.fillStyle = '#1e293b';
      c.fillRect(0, deskY, w, h - deskY);
      c.strokeStyle = '#0f172a';
      c.lineWidth = 3;
      c.strokeRect(0, deskY, w, h - deskY);

      // Glowing Laptop Screen on Desk
      const lapX = w * 0.28;
      const lapY = deskY - unit * 0.12;
      const lapW = unit * 0.16;
      const lapH = unit * 0.11;
      c.fillStyle = '#94a3b8';
      c.fillRect(lapX, lapY, lapW, lapH);
      c.strokeRect(lapX, lapY, lapW, lapH);
      // Screen glow casting on desk
      c.fillStyle = '#38bdf8';
      c.fillRect(lapX + 4, lapY + 4, lapW - 8, lapH - 8);
      // Code / Bar chart lines on screen
      c.fillStyle = '#ffffff';
      for (let l = 0; l < 4; l++) {
        c.fillRect(lapX + 10, lapY + 12 + l * 12, (lapW - 20) * (0.4 + l * 0.15), 4);
      }

      // Paperwork Document Stacks
      const docX = w * 0.72;
      const docY = deskY - unit * 0.05;
      c.fillStyle = '#f1f5f9';
      c.fillRect(docX, docY, unit * 0.1, unit * 0.05);
      c.strokeRect(docX, docY, unit * 0.1, unit * 0.05);
      c.fillStyle = '#e2e8f0';
      c.fillRect(docX + 5, docY - 4, unit * 0.1, 4);

      // Paper takeaway coffee cup with sipping lid
      const cofX = w * 0.58;
      const cofY = deskY - unit * 0.06;
      c.fillStyle = '#ffffff';
      c.fillRect(cofX, cofY, unit * 0.04, unit * 0.06);
      c.strokeRect(cofX, cofY, unit * 0.04, unit * 0.06);
      c.fillStyle = '#22c55e';
      c.fillRect(cofX, cofY + unit * 0.02, unit * 0.04, unit * 0.015);

      c.restore();
    }

    // --- Helper: Draw Cozy Home Kitchen Dining Scene ---
    drawCozyKitchen(c, w, h, unit, o, time) {
      c.save();
      // Warm homely kitchen walls
      c.fillStyle = '#fef3c7';
      c.fillRect(0, 0, w, h);

      // Warm wooden kitchen shelves with spice jars & ceramic bowls
      const shelfY = h * 0.25;
      c.fillStyle = '#b45309';
      c.fillRect(w * 0.15, shelfY, w * 0.7, unit * 0.02);
      c.strokeRect(w * 0.15, shelfY, w * 0.7, unit * 0.02);
      // Ceramic jars
      const jarCols = ['#0284c7', '#ea580c', '#16a34a'];
      for (let j = 0; j < 5; j++) {
        c.fillStyle = jarCols[j % jarCols.length];
        c.fillRect(w * 0.2 + j * (w * 0.12), shelfY - unit * 0.05, unit * 0.035, unit * 0.05);
        c.strokeRect(w * 0.2 + j * (w * 0.12), shelfY - unit * 0.05, unit * 0.035, unit * 0.05);
      }

      // Warm Pendant Dining Lamp spreading amber dome of light
      const lampX = w * 0.5;
      const lampY = h * 0.32;
      c.strokeStyle = '#78350f';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(lampX, 0);
      c.lineTo(lampX, lampY);
      c.stroke();
      // Cone Shade
      c.fillStyle = '#f59e0b';
      c.beginPath();
      c.arc(lampX, lampY, unit * 0.08, Math.PI, 0);
      c.closePath();
      c.fill();
      c.stroke();
      // Radial Warm Glow
      const glow = c.createRadialGradient(lampX, lampY + 10, 5, lampX, lampY + 10, unit * 0.45);
      glow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      glow.addColorStop(0.5, 'rgba(251, 191, 36, 0.3)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(lampX, lampY + 10, unit * 0.45, 0, Math.PI * 2);
      c.fill();

      // Dining Table in Foreground
      const tableY = h * 0.68;
      c.fillStyle = '#78350f';
      c.fillRect(0, tableY, w, h - tableY);
      c.strokeStyle = '#451a03';
      c.lineWidth = 3;
      c.strokeRect(0, tableY, w, h - tableY);

      // Steaming Soup Pot / Rice Bowls
      const potX = w * 0.5;
      const potY = tableY - unit * 0.02;
      c.fillStyle = '#f8fafc';
      c.beginPath();
      c.arc(potX, potY, unit * 0.075, 0, Math.PI);
      c.closePath();
      c.fill();
      c.stroke();
      // Steam clouds rising
      c.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      c.lineWidth = 2.5;
      for (let s = 0; s < 3; s++) {
        const sx = potX - unit * 0.03 + s * unit * 0.03;
        const phase = Math.sin((time || 0) * 3 + s) * 8;
        c.beginPath();
        c.moveTo(sx, potY - 10);
        c.quadraticCurveTo(sx + phase, potY - unit * 0.08, sx - phase, potY - unit * 0.16);
        c.stroke();
      }

      c.restore();
    }

    // --- Helper: Draw Philosophical Clock / Time Passage Scene ---
    drawClockTime(c, w, h, unit, o, time) {
      c.save();
      // Deep twilight contemplative gradient
      const timeGrad = c.createLinearGradient(0, 0, 0, h);
      timeGrad.addColorStop(0, '#0f172a');
      timeGrad.addColorStop(0.6, '#1e293b');
      timeGrad.addColorStop(1, '#0f172a');
      c.fillStyle = timeGrad;
      c.fillRect(0, 0, w, h);

      // Huge Roman Numeral Clock Face in Background
      const clockX = w * 0.5;
      const clockY = h * 0.45;
      const clockR = unit * 0.38;
      c.strokeStyle = 'rgba(203, 213, 225, 0.25)';
      c.lineWidth = Math.max(3.0, unit * 0.008);
      c.beginPath();
      c.arc(clockX, clockY, clockR, 0, Math.PI * 2);
      c.stroke();

      // Rotating Clock Hands
      const secAngle = ((time || 0) * 1.5) % (Math.PI * 2);
      const minAngle = ((time || 0) * 0.15) % (Math.PI * 2);
      c.strokeStyle = 'rgba(254, 240, 138, 0.7)';
      c.lineWidth = 3.5;
      c.beginPath();
      c.moveTo(clockX, clockY);
      c.lineTo(clockX + Math.cos(secAngle) * clockR * 0.85, clockY + Math.sin(secAngle) * clockR * 0.85);
      c.stroke();
      c.lineWidth = 5.0;
      c.beginPath();
      c.moveTo(clockX, clockY);
      c.lineTo(clockX + Math.cos(minAngle) * clockR * 0.6, clockY + Math.sin(minAngle) * clockR * 0.6);
      c.stroke();

      // Glowing Center Hourglass
      this.drawHourglass(c, clockX, clockY + unit * 0.05, unit * 0.16, unit * 0.28, unit, time);

      // Drifting calendar sheet silhouettes fluttering in wind
      c.fillStyle = 'rgba(241, 245, 249, 0.2)';
      for (let cal = 0; cal < 8; cal++) {
        const calX = ((cal * 163 + (time || 0) * 45) % (w + 100)) - 50;
        const calY = ((cal * 97 + (time || 0) * 35) % h);
        c.save();
        c.translate(calX, calY);
        c.rotate((time || 0) + cal);
        c.fillRect(-unit * 0.025, -unit * 0.035, unit * 0.05, unit * 0.07);
        c.restore();
      }

      c.restore();
    }


    // --- Helper: Draw Hourglass Scene ---
    drawHourglass(c, ow, oh, unit, o, time) {
      c.save();
      // Glow
      const glow = c.createRadialGradient(0, 0, 5, 0, 0, Math.max(ow, oh) * 0.8);
      glow.addColorStop(0, 'rgba(255, 234, 167, 0.7)');
      glow.addColorStop(0.5, 'rgba(253, 203, 110, 0.2)');
      glow.addColorStop(1, 'rgba(253, 203, 110, 0)');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, 0, Math.max(ow, oh) * 0.8, 0, Math.PI * 2);
      c.fill();

      // Top and Bottom wooden caps
      c.fillStyle = '#573d26';
      c.strokeStyle = '#1e272e';
      c.lineWidth = Math.max(2.0, unit * 0.005);
      [-oh * 0.45, oh * 0.38].forEach(cy => {
        c.fillRect(-ow * 0.45, cy, ow * 0.9, oh * 0.08);
        c.strokeRect(-ow * 0.45, cy, ow * 0.9, oh * 0.08);
      });

      // Glass bulbs
      c.fillStyle = 'rgba(220, 221, 225, 0.35)';
      c.beginPath();
      c.moveTo(-ow * 0.38, -oh * 0.37);
      c.lineTo(ow * 0.38, -oh * 0.37);
      c.lineTo(0, 0);
      c.lineTo(ow * 0.38, oh * 0.38);
      c.lineTo(-ow * 0.38, oh * 0.38);
      c.lineTo(0, 0);
      c.closePath();
      c.fill();
      c.stroke();

      // Golden Sand
      c.fillStyle = '#f1c40f';
      // Bottom sand mound
      c.beginPath();
      c.moveTo(-ow * 0.3, oh * 0.37);
      c.lineTo(ow * 0.3, oh * 0.37);
      c.lineTo(0, oh * 0.15);
      c.closePath();
      c.fill();
      // Falling sand stream
      c.strokeStyle = '#f1c40f';
      c.lineWidth = 2.0;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, oh * 0.2);
      c.stroke();

      c.restore();
    }

    object(o, p, w, h, time) {
      const c = this.ctx;
      const s = stateAt(o, p);
      const unit = Math.min(w, h);
      let ow = s.w * w;
      let oh = s.h * h;

      c.save();
      c.translate(s.x * w, s.y * h);
      c.rotate((s.rotation * Math.PI) / 180);
      c.scale(s.scale, s.scale);
      c.globalAlpha = s.opacity;

      // Handle full-canvas background environment objects
      if (o.kind === 'city_street') {
        c.restore();
        this.drawCityStreet(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'subway_window' || o.kind === 'bus_window') {
        c.restore();
        this.drawSubwayWindow(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'overpass_night') {
        c.restore();
        this.drawOverpassNight(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'desk_room') {
        c.restore();
        this.drawDeskRoom(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'party_night') {
        c.restore();
        this.drawPartyNight(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'window_sunrise') {
        c.restore();
        this.drawWindowSunrise(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'rain_cafe') {
        c.restore();
        this.drawRainCafe(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'park_autumn') {
        c.restore();
        this.drawParkAutumn(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'crossroads') {
        c.restore();
        this.drawCrossroads(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'bedroom_night') {
        c.restore();
        this.drawBedroomNight(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'rooftop_stars') {
        c.restore();
        this.drawRooftopStars(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'nature_hill') {
        c.restore();
        this.drawNatureHill(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'beach_sunset') {
        c.restore();
        this.drawBeachSunset(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'office_desk') {
        c.restore();
        this.drawOfficeDesk(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'cozy_kitchen') {
        c.restore();
        this.drawCozyKitchen(c, w, h, unit, o, time);
        return;
      }
      if (o.kind === 'clock_time') {
        c.restore();
        this.drawClockTime(c, w, h, unit, o, time);
        return;
      }

      // Discrete foreground objects
      c.fillStyle = o.color || '#efbc64';
      c.strokeStyle = o.stroke || '#ece0d2';
      c.lineWidth = unit * 0.005;
      c.lineCap = 'round';
      c.lineJoin = 'round';

      const circle = (x, y, r) => {
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      };

      if (o.kind === 'person') {
        oh = Math.min(oh, ow * 2.8);
        ow = Math.min(ow, oh * 0.6);

        // Check if @phatbieulungtung cartoon character requested or default enhanced
        const isCartoon = o.style === 'phatbieulungtung' || o.role === 'hero' || o.hair || o.scarf !== undefined || o.mood;
        if (isCartoon) {
          this.drawCartoonHero(c, ow, oh, unit, o, time);
        } else {
          // Backward-compatible minimal mannequin person
          c.beginPath();
          c.roundRect(-ow * 0.3, -oh * 0.05, ow * 0.6, oh * 0.38, unit * 0.025);
          c.fill();
          c.stroke();
          c.fillStyle = o.skin || '#f1d5b2';
          circle(0, -oh * 0.23, Math.min(ow * 0.27, oh * 0.19));
          c.fillStyle = '#252127';
          for (const x of [-ow * 0.08, ow * 0.08]) {
            c.beginPath();
            c.arc(x, -oh * 0.25, unit * 0.004, 0, Math.PI * 2);
            c.fill();
          }
          c.beginPath();
          c.arc(0, -oh * 0.22, ow * 0.08, 0, Math.PI);
          c.strokeStyle = '#56413e';
          c.lineWidth = unit * 0.003;
          c.stroke();
          c.strokeStyle = o.stroke || '#ece0d2';
          c.lineWidth = unit * 0.005;
          c.beginPath();
          c.moveTo(-ow * 0.16, oh * 0.33);
          c.lineTo(-ow * 0.22, oh * 0.5);
          c.moveTo(ow * 0.16, oh * 0.33);
          c.lineTo(ow * 0.22, oh * 0.5);
          c.moveTo(-ow * 0.3, 0);
          c.lineTo(-ow * 0.48, oh * 0.2);
          c.moveTo(ow * 0.3, 0);
          c.lineTo(ow * 0.48, o.pose === 'wave' ? -oh * 0.3 : oh * 0.2);
          c.stroke();
        }
      } else if (o.kind === 'hourglass') {
        this.drawHourglass(c, ow, oh, unit, o, time);
      } else if (o.kind === 'heart') {
        ow = oh = Math.min(ow, oh);
        c.fillStyle = o.color || '#eb3b5a';
        c.strokeStyle = o.stroke || '#1e272e';
        c.lineWidth = Math.max(2.0, unit * 0.0055);
        c.beginPath();
        c.moveTo(0, oh * 0.4);
        c.bezierCurveTo(-ow * 0.9, -oh * 0.05, -ow * 0.4, -oh * 0.65, 0, -oh * 0.2);
        c.bezierCurveTo(ow * 0.4, -oh * 0.65, ow * 0.9, -oh * 0.05, 0, oh * 0.4);
        c.fill();
        c.stroke();
      } else if (o.kind === 'speech') {
        c.beginPath();
        c.roundRect(-ow / 2, -oh / 2, ow, oh * 0.8, unit * 0.02);
        c.fill();
        c.stroke();
        c.beginPath();
        c.moveTo(-ow * 0.2, oh * 0.3);
        c.lineTo(-ow * 0.3, oh * 0.5);
        c.lineTo(0, oh * 0.3);
        c.fill();
        c.stroke();
      } else if (o.kind === 'book') {
        c.beginPath();
        c.roundRect(-ow / 2, -oh / 2, ow, oh, unit * 0.012);
        c.fill();
        c.stroke();
        c.beginPath();
        c.moveTo(0, -oh / 2);
        c.lineTo(0, oh / 2);
        for (let j = 0; j < 3; j++) {
          const y = -oh * 0.25 + j * oh * 0.2;
          c.moveTo(-ow * 0.38, y);
          c.lineTo(-ow * 0.1, y);
          c.moveTo(ow * 0.1, y);
          c.lineTo(ow * 0.38, y);
        }
        c.stroke();
      } else if (o.kind === 'circle') {
        circle(0, 0, Math.min(ow, oh) / 2);
      } else if (o.kind === 'line') {
        c.beginPath();
        c.moveTo(-ow / 2, -oh / 2);
        c.lineTo(ow / 2, oh / 2);
        c.stroke();
      } else if (o.kind === 'card' || o.kind === 'rect') {
        if (o.kind === 'card') {
          c.fillStyle = o.color || 'rgba(30, 39, 46, 0.85)';
          c.strokeStyle = o.stroke || '#485460';
          c.lineWidth = Math.max(1.8, unit * 0.004);
        }
        c.beginPath();
        c.roundRect(-ow / 2, -oh / 2, ow, oh, unit * 0.025);
        c.fill();
        c.stroke();

        // Optional embedded card icon
        if (o.cardIcon === 'hands_heart') {
          // Two cupped hands holding a heart
          c.fillStyle = '#f3d9c1';
          c.strokeStyle = '#1e272e';
          [-ow * 0.12, ow * 0.12].forEach(hx => {
            c.beginPath();
            c.arc(hx, -oh * 0.08, unit * 0.035, 0, Math.PI * 2);
            c.fill();
            c.stroke();
          });
          // Small heart
          c.fillStyle = '#eb3b5a';
          c.beginPath();
          c.moveTo(0, -oh * 0.12);
          c.bezierCurveTo(-unit * 0.03, -oh * 0.22, -unit * 0.015, -oh * 0.28, 0, -oh * 0.2);
          c.bezierCurveTo(unit * 0.015, -oh * 0.28, unit * 0.03, -oh * 0.22, 0, -oh * 0.12);
          c.fill();
          c.stroke();
        } else if (o.cardIcon === 'caring_circle') {
          // Yellow circle with heart inside
          c.fillStyle = '#fed330';
          c.strokeStyle = '#1e272e';
          c.beginPath();
          c.arc(0, -oh * 0.12, unit * 0.055, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.fillStyle = '#ffffff';
          c.beginPath();
          c.moveTo(0, -oh * 0.07);
          c.bezierCurveTo(-unit * 0.03, -oh * 0.16, -unit * 0.015, -oh * 0.21, 0, -oh * 0.14);
          c.bezierCurveTo(unit * 0.015, -oh * 0.21, unit * 0.03, -oh * 0.16, 0, -oh * 0.07);
          c.fill();
          c.stroke();
        }
      }

      if (o.text) {
        this.text(o.text, 0, o.kind === 'person' ? oh * 0.7 : (o.cardIcon ? oh * 0.28 : 0), ow * 0.88, unit * (o.fontSize || 0.032), o.textColor || '#ffffff');
      }
      c.restore();
    }

    // --- Helper: Draw Top-Center Bubble Cartoon Watermark ("PHAT BIEU LUNG TUNG") ---
    drawBubbleWatermark(c, w, h, unit, text) {
      const wmText = String(text || '').trim().toUpperCase();
      if (!wmText) return;
      c.save();
      const fontSize = Math.round(unit * 0.042);
      c.font = `900 ${fontSize}px "Arial Rounded MT Bold", "Montserrat", "Segoe UI", Arial, sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.lineJoin = 'round';
      c.miterLimit = 2;

      const wmY = Math.round(h * 0.058);

      // Soft drop shadow
      c.shadowColor = 'rgba(0, 0, 0, 0.45)';
      c.shadowBlur = 8;
      c.shadowOffsetY = 2;

      // Outer clean white outline
      c.strokeStyle = '#ffffff';
      c.lineWidth = Math.max(2.2, unit * 0.0055);
      c.strokeText(wmText, w / 2, wmY);

      // Inner hollow semi-translucent dark fill
      c.fillStyle = 'rgba(26, 32, 44, 0.35)';
      c.fillText(wmText, w / 2, wmY);

      c.restore();
    }

    render(time, timeline, seg, progress) {
      const c = this.ctx;
      const w = timeline.width || 1280;
      const h = timeline.height || 720;
      const unit = Math.min(w, h);

      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }

      const visual = seg?.visual || {};

      // 1. Default background fill
      c.fillStyle = visual.background || timeline.background || '#eef5fa';
      c.fillRect(0, 0, w, h);

      // 2. Render all objects in this segment
      for (const o of visual.objects || []) {
        this.object(o, progress, w, h, time);
      }

      // 3. Segment heading (if present)
      if (visual.heading) {
        this.text(visual.heading, w * 0.5, h * 0.16, w * 0.84, unit * 0.05);
      }

      // 4. Watermark: only drawn if explicitly provided non-empty watermark string
      const watermark = typeof timeline.watermark === 'string' ? timeline.watermark.trim() : '';
      if (watermark) {
        this.drawBubbleWatermark(c, w, h, unit, watermark);
      }

      // 5. Shared Subtitle Contract (Bottom Uppercase Subtitles with yellow active word)
      global.drawVideoSubtitles(c, time, seg, w, h);

      // 6. Fade-In and Fade-Out
      const fadeIn = timeline.fadeInDuration || 0;
      const fadeOut = timeline.fadeOutDuration || 0;
      const alpha = Math.max(
        fadeIn ? 1 - clamp(time / fadeIn) : 0,
        fadeOut ? 1 - clamp((timeline.totalDuration - time) / fadeOut) : 0
      );
      if (alpha > 0) {
        c.fillStyle = `rgba(0,0,0,${alpha})`;
        c.fillRect(0, 0, w, h);
      }
    }
  }

  global.IllustratedStory = IllustratedStory;
})(window);

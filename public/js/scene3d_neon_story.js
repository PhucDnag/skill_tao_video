/**
 * Neon-Story-Stage Extension for MetaphorScene3D ("@phatbieulungtung" style)
 * Modular file keeping scene3d.js lightweight while providing:
 * - _createStoryPuppet3D (cartoon red-scarf hero, NPCs, zipper/shock/bulb/heart props)
 * - 9 Dark-Mode Neon-Wireframe & Stage Environments (bedroom, theater, emotional void,
 *   classroom, party room, night office, night park, city street, sunrise ocean horizon)
 * - Ken Burns camera drift & dynamic sub-beat mood controllers
 */
(function (global) {
  const THREE = global.THREE;

  function createColorGlowTexture(c0, c1, c2) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    grad.addColorStop(0, c0);
    grad.addColorStop(0.3, c1);
    grad.addColorStop(0.65, c2);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }

  class _NeonStoryStageMixin {

    /**
     * Create a @phatbieulungtung-style expressive Story Puppet (2D-cartoon feel in 3D)
     * with dark coat, signature red scarf, 1:2.4 chibi proportions, modular face mood,
     * zipper mouth, shock ticks, glowing lightbulb, floating heart, and phone pose.
     */
    _createStoryPuppet3D({
      role = 'hero', // 'hero' | 'colleague' | 'crush' | 'silhouette' | 'backview'
      mood = 'happy', // 'scared' | 'stressed' | 'tired' | 'blush' | 'zipper' | 'happy' | 'confident'
      scale = 1.0,
      hasScarf = true,
      hasShockTicks = false,
      hasLightbulb = false,
      hasHeartAbove = false,
      holdingPhone = false
    } = {}) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      if (role === 'silhouette') {
        const silMat = new THREE.MeshBasicMaterial({ color: 0x131422 });
        const rimMat = new THREE.MeshBasicMaterial({ color: 0x2c324a, side: THREE.BackSide });
        const bodyGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.55, 20);
        const body = new THREE.Mesh(bodyGeo, silMat);
        body.position.y = 0.28;
        group.add(body);
        const bodyRim = new THREE.Mesh(bodyGeo, rimMat);
        bodyRim.scale.set(1.05, 1.03, 1.05);
        bodyRim.position.copy(body.position);
        group.add(bodyRim);

        const headGeo = new THREE.SphereGeometry(0.22, 24, 24);
        const head = new THREE.Mesh(headGeo, silMat);
        head.position.y = 0.72;
        group.add(head);
        const headRim = new THREE.Mesh(headGeo, rimMat);
        headRim.scale.set(1.06, 1.06, 1.06);
        headRim.position.copy(head.position);
        group.add(headRim);
        return group;
      }

      const skinColor = 0xe8d5c4;
      const hairColor = 0x42332c;
      let coatColor = 0x3d424b;
      let pantsColor = 0x2e3038;
      let shoeColor = 0x4a3525;

      if (role === 'colleague') {
        coatColor = 0x2b7a78;
        pantsColor = 0x252830;
        shoeColor = 0xf1f5f9;
        hasScarf = false;
      } else if (role === 'crush') {
        coatColor = 0xc86d8a;
        pantsColor = 0x4e6a96;
        shoeColor = 0xf1f5f9;
        hasScarf = false;
      }

      const coatMat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.65, metalness: 0.08 });
      const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.55 });
      const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.6 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.5 });
      const outlineMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide });

      // Legs & Shoes
      [-0.12, 0.12].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.064, 0.55, 12), pantsMat);
        leg.position.set(lx, 0.30, 0);
        group.add(leg);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.085, 0.23), shoeMat);
        shoe.position.set(lx, 0.042, 0.03);
        group.add(shoe);
      });

      // Double-breasted Coat Torso + Outline
      const torsoGeo = new THREE.CylinderGeometry(0.22, 0.27, 0.66, 16);
      const torso = new THREE.Mesh(torsoGeo, coatMat);
      torso.position.set(0, 0.88, 0);
      group.add(torso);
      const torsoOutline = new THREE.Mesh(torsoGeo, outlineMat);
      torsoOutline.scale.set(1.06, 1.03, 1.06);
      torsoOutline.position.copy(torso.position);
      group.add(torsoOutline);

      // Two columns of 3 grey buttons for protagonist coat
      if (role === 'hero' || role === 'backview') {
        const btnMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
        [-0.07, 0.07].forEach((bx) => {
          [0.72, 0.85, 0.98].forEach((by) => {
            const btn = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), btnMat);
            btn.position.set(bx, by, 0.24);
            group.add(btn);
          });
        });
      }

      // Signature Bright Red Scarf (#C83232) looped around neck
      if (hasScarf) {
        const scarfMat = new THREE.MeshStandardMaterial({
          color: 0xc83232,
          emissive: 0x7f1d1d,
          emissiveIntensity: 0.25,
          roughness: 0.5
        });
        const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.065, 12, 24), scarfMat);
        scarfRing.rotation.x = Math.PI / 2;
        scarfRing.position.set(0, 1.21, 0.01);
        group.add(scarfRing);

        const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.34, 0.05), scarfMat);
        scarfTail.position.set(0.11, 1.04, 0.22);
        scarfTail.rotation.z = -0.14;
        group.add(scarfTail);
      }

      // Articulated Arms
      const armL = new THREE.Group();
      armL.position.set(-0.29, 1.15, 0);
      const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.058, 0.48, 12), coatMat);
      sleeveL.position.y = -0.22;
      armL.add(sleeveL);
      const handL = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), skinMat);
      handL.position.y = -0.47;
      armL.add(handL);
      group.add(armL);

      const armR = new THREE.Group();
      armR.position.set(0.29, 1.15, 0);
      const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.058, 0.48, 12), coatMat);
      sleeveR.position.y = -0.22;
      armR.add(sleeveR);
      const handR = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), skinMat);
      handR.position.y = -0.47;
      armR.add(handR);
      group.add(armR);

      if (holdingPhone) {
        armR.rotation.x = -0.95;
        armR.rotation.z = 0.25;
        const phone = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.22, 0.02),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        phone.position.set(0, -0.52, 0.06);
        armR.add(phone);
      }

      // Big 1:2.4 Chibi Head with cartoon black outline
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.56, 0);
      const headGeo = new THREE.SphereGeometry(0.32, 24, 24);
      const headSphere = new THREE.Mesh(headGeo, skinMat);
      headGroup.add(headSphere);
      const headOutline = new THREE.Mesh(headGeo, outlineMat);
      headOutline.scale.set(1.045, 1.045, 1.045);
      headGroup.add(headOutline);

      // Spiky dark-brown cartoon hair (#42332C)
      const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.64),
        hairMat
      );
      hairCap.position.set(0, 0.03, -0.02);
      headGroup.add(hairCap);

      [-0.20, -0.08, 0.04, 0.16, 0.24].forEach((bx, idx) => {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 6), hairMat);
        spike.position.set(bx, 0.24, 0.16);
        spike.rotation.x = 0.45;
        spike.rotation.z = (idx - 2) * 0.24;
        headGroup.add(spike);
      });

      if (role !== 'backview') {
        const fCanvas = document.createElement('canvas');
        fCanvas.width = 256;
        fCanvas.height = 256;
        const fCtx = fCanvas.getContext('2d');
        fCtx.clearRect(0, 0, 256, 256);

        // Cheek blush (stronger for blush/scared/crush)
        const blushAlpha = mood === 'blush' ? 0.72 : 0.38;
        fCtx.fillStyle = `rgba(244, 63, 94, ${blushAlpha})`;
        [72, 184].forEach((bx) => {
          fCtx.beginPath();
          fCtx.ellipse(bx, 152, 24, 12, 0, 0, Math.PI * 2);
          fCtx.fill();
        });

        fCtx.strokeStyle = '#111111';
        fCtx.fillStyle = '#111111';
        fCtx.lineCap = 'round';

        if (mood === 'stressed') {
          // "><" stressed squint eyes
          fCtx.lineWidth = 8;
          fCtx.beginPath();
          fCtx.moveTo(64, 102); fCtx.lineTo(100, 118); fCtx.lineTo(64, 134);
          fCtx.moveTo(192, 102); fCtx.lineTo(156, 118); fCtx.lineTo(192, 134);
          fCtx.stroke();
        } else if (mood === 'tired') {
          // Half-closed drooping eyes
          fCtx.lineWidth = 6;
          [86, 170].forEach((ex) => {
            fCtx.fillStyle = '#ffffff';
            fCtx.beginPath();
            fCtx.arc(ex, 118, 22, 0, Math.PI);
            fCtx.fill();
            fCtx.stroke();
            fCtx.fillStyle = '#111111';
            fCtx.beginPath();
            fCtx.arc(ex, 122, 8, 0, Math.PI * 2);
            fCtx.fill();
          });
        } else {
          // Big expressive cartoon oval eyes (wide when scared/blush, bright when happy)
          const eyeR = mood === 'scared' ? 26 : 22;
          [86, 170].forEach((ex) => {
            fCtx.fillStyle = '#ffffff';
            fCtx.lineWidth = 5;
            fCtx.beginPath();
            fCtx.ellipse(ex, 116, eyeR * 0.88, eyeR * 1.05, 0, 0, Math.PI * 2);
            fCtx.fill();
            fCtx.stroke();

            const pupilR = mood === 'scared' ? 7 : 11;
            fCtx.fillStyle = '#111111';
            fCtx.beginPath();
            fCtx.arc(ex, 118, pupilR, 0, Math.PI * 2);
            fCtx.fill();

            fCtx.fillStyle = '#ffffff';
            fCtx.beginPath();
            fCtx.arc(ex - 4, 112, 3.8, 0, Math.PI * 2);
            fCtx.fill();
          });
        }

        // Mouth variations including horizontal blue zipper!
        if (mood === 'zipper') {
          fCtx.fillStyle = '#38bdf8';
          fCtx.strokeStyle = '#0f172a';
          fCtx.lineWidth = 4;
          fCtx.fillRect(88, 162, 80, 22);
          fCtx.strokeRect(88, 162, 80, 22);
          // Zipper teeth + pull tab
          fCtx.beginPath();
          for (let tx = 98; tx < 164; tx += 10) {
            fCtx.moveTo(tx, 162);
            fCtx.lineTo(tx, 184);
          }
          fCtx.stroke();
          fCtx.fillStyle = '#7dd3fc';
          fCtx.fillRect(168, 166, 18, 14);
        } else if (mood === 'scared' || mood === 'stressed') {
          fCtx.lineWidth = 6;
          fCtx.strokeStyle = '#111111';
          fCtx.beginPath();
          fCtx.moveTo(106, 174);
          fCtx.quadraticCurveTo(117, 164, 128, 174);
          fCtx.quadraticCurveTo(139, 184, 150, 174);
          fCtx.stroke();
        } else {
          fCtx.lineWidth = 6;
          fCtx.strokeStyle = '#111111';
          fCtx.beginPath();
          fCtx.arc(128, 160, 18, Math.PI * 0.14, Math.PI * 0.86);
          fCtx.stroke();
        }

        const faceTex = new THREE.CanvasTexture(fCanvas);
        const facePlane = new THREE.Mesh(
          new THREE.PlaneGeometry(0.48, 0.48),
          new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false })
        );
        facePlane.position.set(0, -0.02, 0.315);
        headGroup.add(facePlane);
      } else {
        // Full back-of-head hair coverage for over-the-shoulder / backview shots
        const backHair = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), hairMat);
        backHair.position.set(0, 0.02, -0.02);
        headGroup.add(backHair);
      }

      // Optional Shock Ticks (\|/) above head
      let shockGroup = null;
      if (hasShockTicks) {
        shockGroup = new THREE.Group();
        shockGroup.position.set(0, 0.48, 0.05);
        const tickMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        [-0.22, 0, 0.22].forEach((tx, idx) => {
          const tick = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.03), tickMat);
          tick.position.set(tx, 0, 0);
          tick.rotation.z = (1 - idx) * 0.42;
          shockGroup.add(tick);
        });
        headGroup.add(shockGroup);
      }

      // Optional Golden Lightbulb above head
      let bulbGroup = null;
      if (hasLightbulb) {
        bulbGroup = new THREE.Group();
        bulbGroup.position.set(0, 0.62, 0);
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xfde047 })
        );
        bulbGroup.add(bulb);
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.06, 0.09, 12),
          new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
        );
        base.position.y = -0.17;
        bulbGroup.add(base);
        if (this.glowTex) {
          const halo = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: this.glowTex,
              transparent: true,
              opacity: 0.9,
              depthWrite: false,
              blending: THREE.AdditiveBlending
            })
          );
          halo.scale.set(0.95, 0.95, 1);
          bulbGroup.add(halo);
        }
        headGroup.add(bulbGroup);
      }

      // Optional Floating Pink Heart above head
      let heartAboveGroup = null;
      if (hasHeartAbove) {
        heartAboveGroup = new THREE.Group();
        heartAboveGroup.position.set(0, 0.62, 0);
        const hm = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.16, 1),
          new THREE.MeshBasicMaterial({ color: 0xf472b6 })
        );
        heartAboveGroup.add(hm);
        if (this.roseGlowTex) {
          const halo = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: this.roseGlowTex,
              transparent: true,
              opacity: 0.9,
              depthWrite: false,
              blending: THREE.AdditiveBlending
            })
          );
          halo.scale.set(1.05, 1.05, 1);
          heartAboveGroup.add(halo);
        }
        headGroup.add(heartAboveGroup);
      }

      group.add(headGroup);
      group.userData = { armL, armR, headGroup, shockGroup, bulbGroup, heartAboveGroup };
      return group;
    }

    /**
     * Create a translucent dark speech / chat / thought bubble pill (#1C2030 w/ #8890A8 border)
     * with pointer tail, matching the chat/thought bubbles of @phatbieulungtung.
     */
    _createStoryBubbleMesh({
      text = '',
      tailDir = 'down-left', // 'down-left' | 'down-right' | 'none'
      widthWorld = 1.65,
      heightWorld = 0.56,
      bgColor = 'rgba(28, 32, 48, 0.90)',
      borderColor = '#8890a8',
      textColor = '#ffffff',
      italic = true
    } = {}) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = Math.round(512 * (heightWorld / widthWorld));
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const tailH = tailDir === 'none' ? 8 : 26;
      const boxH = h - tailH - 12;
      const rad = Math.min(28, boxH * 0.42);

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(12 + rad, 10);
      ctx.lineTo(w - 12 - rad, 10);
      ctx.quadraticCurveTo(w - 12, 10, w - 12, 10 + rad);
      ctx.lineTo(w - 12, 10 + boxH - rad);
      ctx.quadraticCurveTo(w - 12, 10 + boxH, w - 12 - rad, 10 + boxH);
      if (tailDir === 'down-right') {
        ctx.lineTo(w * 0.78, 10 + boxH);
        ctx.lineTo(w * 0.85, h - 6);
        ctx.lineTo(w * 0.68, 10 + boxH);
      } else if (tailDir === 'down-left') {
        ctx.lineTo(w * 0.32, 10 + boxH);
        ctx.lineTo(w * 0.16, h - 6);
        ctx.lineTo(w * 0.22, 10 + boxH);
      }
      ctx.lineTo(12 + rad, 10 + boxH);
      ctx.quadraticCurveTo(12, 10 + boxH, 12, 10 + boxH - rad);
      ctx.lineTo(12, 10 + rad);
      ctx.quadraticCurveTo(12, 10, 12 + rad, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      let fontSize = 40;
      const fontPrefix = italic ? 'italic 700' : '700';
      ctx.font = `${fontPrefix} ${fontSize}px "Segoe UI", Arial, sans-serif`;
      while (ctx.measureText(text).width > w - 56 && fontSize > 20) {
        fontSize -= 2;
        ctx.font = `${fontPrefix} ${fontSize}px "Segoe UI", Arial, sans-serif`;
      }
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, 10 + boxH / 2 + 2);
      ctx.restore();

      const tex = new THREE.CanvasTexture(canvas);
      return new THREE.Mesh(
        new THREE.PlaneGeometry(widthWorld, heightWorld),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
      );
    }

    /**
     * Create a white speech pill containing a messy pink tangled scribble (mental confusion metaphor).
     */
    _createScribbleBubbleMesh(widthWorld = 1.55, heightWorld = 0.72) {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(14, 14, w - 28, h - 48, 36) : ctx.rect(14, 14, w - 28, h - 48);
      ctx.fill();
      ctx.stroke();

      // Tangled pink scribble coil inside
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const sx = 65 + t * 340 + Math.sin(t * 28) * 26;
        const sy = 96 + Math.cos(t * 34) * 32;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      return new THREE.Mesh(
        new THREE.PlaneGeometry(widthWorld, heightWorld),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
    }

    /**
     * Create glowing thin neon-wireframe box outline (used for dark-mode architectural rooms/streets).
     */
    _createNeonWireBox(w, h, d, colorHex = 0x38bdf8, opacity = 0.82) {
      const geo = new THREE.BoxGeometry(w, h, d);
      const edges = new THREE.EdgesGeometry(geo);
      const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity });
      return new THREE.LineSegments(edges, mat);
    }

    /**
     * Create translucent volumetric spotlight cone.
     */
    _createSpotlightCone(topR = 0.18, botR = 1.65, height = 4.2, colorHex = 0xfef3c7, opacity = 0.14) {
      const geo = new THREE.CylinderGeometry(topR, botR, height, 32, 1, true);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      return new THREE.Mesh(geo, mat);
    }

    _buildNeonStoryStageMetaphors() {
      if (this._neonStoryBuilt) return;
      this._neonStoryBuilt = true;
      const makeColorHalo = (tex, scale = 1.6, opacity = 0.85) => {
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          })
        );
        sp.scale.set(scale, scale, 1);
        return sp;
      };
      const makeRadialBackdrop = (group, colorHex, y = 2.0, z = -3.2, scale = 9.0) => {
        const cTex = createColorGlowTexture(
          'rgba(255,255,255,0.45)',
          colorHex,
          'rgba(13,15,24,0.0)'
        );
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: cTex, transparent: true, opacity: 0.72, depthWrite: false })
        );
        sp.position.set(0, y, z);
        sp.scale.set(scale * 1.4, scale, 1);
        group.add(sp);
      };

      const addStarDust = (group, count = 26) => {
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.45 });
        const dotGeo = new THREE.SphereGeometry(0.02, 6, 6);
        for (let i = 0; i < count; i++) {
          const m = new THREE.Mesh(dotGeo, dotMat);
          m.position.set((Math.sin(i * 7.3) * 4.8), 0.5 + (i % 7) * 0.65, -2.5 + (i % 3) * 0.4);
          group.add(m);
        }
      };

      // =========================================================================
      // 109. SCENE: neon_wireframe_bedroom (x = 1980, z = 12)
      // Dark neon-wireframe bedroom: bookshelf w/ rainbow spines, starry window,
      // desk+laptop, bed, fairy lights, character texting w/ 3 stacked chat replies!
      // =========================================================================
      this.neonBedroomGroup = new THREE.Group();
      this.neonBedroomGroup.position.set(1980, 0, 12);
      this.scene.add(this.neonBedroomGroup);
      makeRadialBackdrop(this.neonBedroomGroup, 'rgba(59, 40, 70, 0.65)', 2.1, -3.0, 9.0);

      // Bedroom wireframe back floor line
      this.neonBedroomGroup.add(this._createNeonWireBox(10.5, 0.04, 5.2, 0x334155, 0.5));

      // Yellow-framed starry window center-left
      const winFrame = this._createNeonWireBox(1.8, 1.35, 0.05, 0xfacc15, 0.85);
      winFrame.position.set(-1.3, 2.35, -1.8);
      this.neonBedroomGroup.add(winFrame);

      // Multicolor fairy lights string across top
      const fairyCols = [0xf43f5e, 0xfacc15, 0x38bdf8, 0x10b981, 0xc084fc];
      for (let f = 0; f < 11; f++) {
        const fx = -3.8 + f * 0.76;
        const fy = 3.55 - Math.sin((f / 10) * Math.PI) * 0.25;
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 8),
          new THREE.MeshBasicMaterial({ color: fairyCols[f % fairyCols.length] })
        );
        bulb.position.set(fx, fy, -1.6);
        this.neonBedroomGroup.add(bulb);
      }

      // Wireframe Bookshelf on far left w/ colorful rainbow book spines
      const shelf = this._createNeonWireBox(1.1, 2.1, 0.35, 0x38bdf8, 0.65);
      shelf.position.set(-3.3, 1.1, -1.4);
      this.neonBedroomGroup.add(shelf);
      [0xf43f5e, 0xfbbf24, 0x10b981, 0x38bdf8, 0xc084fc].forEach((bc, bi) => {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.34, 0.2),
          new THREE.MeshBasicMaterial({ color: bc })
        );
        book.position.set(-3.55 + bi * 0.14, 1.35, -1.4);
        this.neonBedroomGroup.add(book);
      });

      // Desk with laptop + Cyan Bed on right
      const desk = this._createNeonWireBox(1.4, 0.75, 0.6, 0x94a3b8, 0.75);
      desk.position.set(-1.4, 0.38, -1.1);
      this.neonBedroomGroup.add(desk);
      const laptop = this._createNeonWireBox(0.55, 0.35, 0.05, 0x38bdf8, 0.95);
      laptop.position.set(-1.4, 0.92, -1.1);
      this.neonBedroomGroup.add(laptop);

      const bed = this._createNeonWireBox(2.2, 0.55, 1.0, 0x22d3ee, 0.72);
      bed.position.set(2.4, 0.32, -1.1);
      this.neonBedroomGroup.add(bed);

      // Hero holding phone in center
      this.neonBedroomChar = this._createStoryPuppet3D({
        role: 'hero',
        mood: 'happy',
        scale: 1.05,
        holdingPhone: true,
        hasLightbulb: true
      });
      if (this.neonBedroomChar.userData.bulbGroup) this.neonBedroomChar.userData.bulbGroup.visible = false;
      this.neonBedroomChar.position.set(-0.2, 0.05, 0.3);
      this.neonBedroomGroup.add(this.neonBedroomChar);

      // 3 Stacked translucent chat replies on right
      ['haha', 'chuẩn luôn', 'đỉnh thật'].forEach((txt, idx) => {
        const cb = this._createStoryBubbleMesh({
          text: txt,
          tailDir: 'down-left',
          widthWorld: 1.35,
          heightWorld: 0.44
        });
        cb.position.set(1.05, 1.05 + idx * 0.48, 0.35);
        this.neonBedroomGroup.add(cb);
        this.neonBedroomChatStack.push(cb);
      });

      // Floating yellow envelope icon beside character (clear of upper subtitle zone)
      this.neonBedroomMail = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.2, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      this.neonBedroomMail.position.set(-0.72, 1.65, 0.35);
      this.neonBedroomGroup.add(this.neonBedroomMail);

      this.neonBedroomTimeBubble = this._createStoryBubbleMesh({
        text: '22:00 → 01:30',
        tailDir: 'down-left',
        widthWorld: 1.65,
        heightWorld: 0.46,
        borderColor: '#f43f5e'
      });
      this.neonBedroomTimeBubble.position.set(1.05, 1.85, 0.35);
      this.neonBedroomTimeBubble.visible = false;
      this.neonBedroomGroup.add(this.neonBedroomTimeBubble);

      this.neonBedroomStudyBook = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.08, 0.38),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      this.neonBedroomStudyBook.position.set(-1.4, 0.78, -1.0);
      this.neonBedroomStudyBook.visible = false;
      this.neonBedroomGroup.add(this.neonBedroomStudyBook);

      this.neonBedroomStudyGlow = this._createSpotlightCone(0.12, 0.75, 1.1, 0xfde047, 0.22);
      this.neonBedroomStudyGlow.position.set(-1.4, 1.32, -1.0);
      this.neonBedroomStudyGlow.visible = false;
      this.neonBedroomGroup.add(this.neonBedroomStudyGlow);

      this.neonBedroomWaitingBubble = this._createStoryBubbleMesh({
        text: 'đang chờ tin nhắn...',
        tailDir: 'down-left',
        widthWorld: 1.95,
        heightWorld: 0.46,
        borderColor: '#f472b6'
      });
      this.neonBedroomWaitingBubble.position.set(1.05, 1.85, 0.35);
      this.neonBedroomWaitingBubble.visible = false;
      this.neonBedroomGroup.add(this.neonBedroomWaitingBubble);

      // =========================================================================
      // 110. SCENE: neon_theater_stage (x = 1998, z = 12)
      // Burgundy velvet curtains w/ gold trim, top spotlight cone, mic stand,
      // foreground audience silhouettes (pink staring eyes -> calm -> golden ':)')
      // + breathing ring + 3-bullet outline note card + confetti arch!
      // =========================================================================
      this.neonStageGroup = new THREE.Group();
      this.neonStageGroup.position.set(1998, 0, 12);
      this.scene.add(this.neonStageGroup);
      makeRadialBackdrop(this.neonStageGroup, 'rgba(61, 50, 36, 0.65)', 1.8, -3.0, 10.0);

      // Burgundy Curtains Left & Right (#54202D) w/ Gold Trim (#C9A85C)
      const curtainMat = new THREE.MeshStandardMaterial({ color: 0x54202d, roughness: 0.75 });
      const goldTrimMat = new THREE.MeshBasicMaterial({ color: 0xc9a85c });
      [-4.2, 4.2].forEach((cx) => {
        const curt = new THREE.Mesh(new THREE.BoxGeometry(1.9, 5.2, 0.4), curtainMat);
        curt.position.set(cx, 2.5, -1.6);
        this.neonStageGroup.add(curt);
        const trim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.2, 0.44), goldTrimMat);
        trim.position.set(cx > 0 ? cx - 0.95 : cx + 0.95, 2.5, -1.6);
        this.neonStageGroup.add(trim);
      });

      // Top Spotlight Cone + Stage Floor Highlight Disc
      this.neonStageSpotlight = this._createSpotlightCone(0.22, 2.1, 4.8, 0xfef3c7, 0.16);
      this.neonStageSpotlight.position.set(0, 2.4, 0.1);
      this.neonStageGroup.add(this.neonStageSpotlight);

      const stageFloorSpot = new THREE.Mesh(
        new THREE.CircleGeometry(1.85, 36),
        new THREE.MeshBasicMaterial({ color: 0x31333a, transparent: true, opacity: 0.7 })
      );
      stageFloorSpot.rotation.x = -Math.PI / 2;
      stageFloorSpot.position.set(0, 0.02, 0.15);
      this.neonStageGroup.add(stageFloorSpot);

      this.neonStageHero = this._createStoryPuppet3D({
        role: 'hero',
        mood: 'scared',
        scale: 1.05
      });
      this.neonStageHero.position.set(0, 0.04, 0.15);
      this.neonStageGroup.add(this.neonStageHero);

      // Optional Mic Stand
      this.neonStageMic = new THREE.Group();
      this.neonStageMic.position.set(0.45, 0.04, 0.35);
      const micPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 1.18, 8), goldTrimMat);
      micPole.position.y = 0.59;
      this.neonStageMic.add(micPole);
      const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), new THREE.MeshBasicMaterial({ color: 0x94a3b8 }));
      micHead.position.y = 1.22;
      this.neonStageMic.add(micHead);
      this.neonStageGroup.add(this.neonStageMic);

      // Expanding Cyan Breathing Ring around speaker
      this.neonStageBreathingRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.025, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.78 })
      );
      this.neonStageBreathingRing.position.set(0, 1.25, 0.05);
      this.neonStageGroup.add(this.neonStageBreathingRing);

      // Golden 3-Bullet Outline Note Card
      const cardCanv = document.createElement('canvas');
      cardCanv.width = 256;
      cardCanv.height = 320;
      const cc = cardCanv.getContext('2d');
      cc.fillStyle = 'rgba(21, 24, 39, 0.9)';
      cc.strokeStyle = '#facc15';
      cc.lineWidth = 6;
      cc.fillRect(16, 16, 224, 288);
      cc.strokeRect(16, 16, 224, 288);
      cc.fillStyle = '#facc15';
      [85, 160, 235].forEach((ly) => {
        cc.beginPath(); cc.arc(54, ly, 10, 0, Math.PI * 2); cc.fill();
        cc.fillRect(80, ly - 5, 130, 10);
      });
      this.neonStageNoteCard = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 1.15),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cardCanv), transparent: true })
      );
      this.neonStageNoteCard.position.set(-1.35, 1.45, 0.3);
      this.neonStageGroup.add(this.neonStageNoteCard);

      // Foreground Audience Silhouettes + Staring Pink Eyes + Friendly Golden ':)'
      for (let a = -4; a <= 4; a++) {
        const sil = this._createStoryPuppet3D({ role: 'silhouette', scale: 0.92 });
        sil.position.set(a * 0.95, -0.35, 2.35 + (Math.abs(a) % 2) * 0.25);
        this.neonStageGroup.add(sil);

        // Pair of staring pink dots
        const eyePair = new THREE.Group();
        eyePair.position.set(a * 0.95, 0.34, 2.65);
        [-0.07, 0.07].forEach((ox) => {
          const pd = new THREE.Mesh(
            new THREE.SphereGeometry(0.032, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff5ca8 })
          );
          pd.position.x = ox;
          eyePair.add(pd);
        });
        this.neonStageGroup.add(eyePair);
        this.neonAudiencePinkEyes.push(eyePair);
      }

      // Single Glowing Golden ':)' Face inside audience
      const smileCanv = document.createElement('canvas');
      smileCanv.width = 128; smileCanv.height = 128;
      const sc = smileCanv.getContext('2d');
      sc.fillStyle = '#facc15';
      sc.beginPath(); sc.arc(64, 64, 54, 0, Math.PI * 2); sc.fill();
      sc.fillStyle = '#0f172a';
      sc.beginPath(); sc.arc(46, 52, 7, 0, Math.PI * 2); sc.arc(82, 52, 7, 0, Math.PI * 2); sc.fill();
      sc.strokeStyle = '#0f172a'; sc.lineWidth = 7;
      sc.beginPath(); sc.arc(64, 68, 24, 0.15 * Math.PI, 0.85 * Math.PI); sc.stroke();
      this.neonAudienceFriendlySmile = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.42),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(smileCanv), transparent: true })
      );
      this.neonAudienceFriendlySmile.position.set(0.95, 0.56, 2.85);
      this.neonStageGroup.add(this.neonAudienceFriendlySmile);

      // Celebratory multicolor confetti dots arch
      const confCols = [0xff5ca8, 0xfacc15, 0x38bdf8, 0x45d97d, 0xc084fc];
      for (let c = 0; c < 18; c++) {
        const ang = (c / 17) * Math.PI;
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 8),
          new THREE.MeshBasicMaterial({ color: confCols[c % confCols.length] })
        );
        dot.position.set(Math.cos(ang) * 2.1, 0.8 + Math.sin(ang) * 1.9, 0.25);
        this.neonStageGroup.add(dot);
        this.neonAudienceConfetti.push(dot);
      }

      // =========================================================================
      // 111. SCENE: neon_emotional_void (x = 2016, z = 12)
      // Minimal dark void supporting sub-modes (`voidMode`):
      // 'symptoms' (heart + flying docs), 'zipper' (mouth zipper),
      // 'empathy_bubbles' (heart + 3 stacked fear thoughts), 'equalizer_vs_fear'
      // =========================================================================
      this.neonVoidGroup = new THREE.Group();
      this.neonVoidGroup.position.set(2016, 0, 12);
      this.scene.add(this.neonVoidGroup);
      makeRadialBackdrop(this.neonVoidGroup, 'rgba(59, 40, 70, 0.7)', 1.8, -3.0, 9.5);
      addStarDust(this.neonVoidGroup, 30);

      // Symptom group
      this.neonVoidSymptomChar = this._createStoryPuppet3D({
        role: 'hero',
        mood: 'stressed',
        scale: 1.08,
        hasShockTicks: true
      });
      this.neonVoidSymptomChar.position.set(0, 0.1, 0.2);
      this.neonVoidGroup.add(this.neonVoidSymptomChar);

      // Pulsing neon-red heart outline ("tim đập nhanh")
      const hCanv = document.createElement('canvas');
      hCanv.width = 256; hCanv.height = 256;
      const hc = hCanv.getContext('2d');
      hc.clearRect(0, 0, 256, 256);
      hc.shadowColor = '#f43f5e';
      hc.shadowBlur = 18;
      hc.strokeStyle = '#fb7185';
      hc.fillStyle = 'rgba(244, 63, 94, 0.16)';
      hc.lineWidth = 10;
      hc.beginPath();
      hc.moveTo(128, 210);
      hc.bezierCurveTo(28, 145, 24, 68, 78, 52);
      hc.bezierCurveTo(108, 44, 124, 68, 128, 86);
      hc.bezierCurveTo(132, 68, 148, 44, 178, 52);
      hc.bezierCurveTo(232, 68, 228, 145, 128, 210);
      hc.closePath();
      hc.fill();
      hc.stroke();
      this.neonVoidHeart = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.95),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(hCanv), transparent: true, depthWrite: false })
      );
      this.neonVoidHeart.position.set(-1.18, 1.55, 0.35);
      this.neonVoidGroup.add(this.neonVoidHeart);

      // Neon Hourglass for 'future_leak'
      this.neonVoidHourglass = new THREE.Group();
      this.neonVoidHourglass.position.set(-1.18, 1.55, 0.35);
      const hgTop = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true }));
      hgTop.rotation.x = Math.PI;
      hgTop.position.y = 0.22;
      this.neonVoidHourglass.add(hgTop);
      const hgBot = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true }));
      hgBot.position.y = -0.22;
      this.neonVoidHourglass.add(hgBot);
      this.neonVoidHourglass.visible = false;
      this.neonVoidGroup.add(this.neonVoidHourglass);

      for (let d = 0; d < 4; d++) {
        const doc = new THREE.Mesh(
          new THREE.PlaneGeometry(0.28, 0.36),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
        );
        doc.position.set(0.85 + d * 0.25, 1.35 + d * 0.22, 0.2);
        this.neonVoidGroup.add(doc);
        this.neonVoidDocs.push(doc);
      }

      // Zipper silence character
      this.neonVoidZipperChar = this._createStoryPuppet3D({
        role: 'hero',
        mood: 'zipper',
        scale: 1.12
      });
      this.neonVoidZipperChar.position.set(0, 0.1, 0.2);
      this.neonVoidGroup.add(this.neonVoidZipperChar);

      // Empathy Heart + 3 Stacked Thought Bubbles
      this.neonVoidEmpathyChar = this._createStoryPuppet3D({
        role: 'hero',
        mood: 'blush',
        scale: 1.05,
        hasHeartAbove: true
      });
      this.neonVoidEmpathyChar.position.set(-0.65, 0.1, 0.2);
      this.neonVoidGroup.add(this.neonVoidEmpathyChar);

      ['sợ nói sai', 'sợ làm phiền', 'sợ người khác thất vọng'].forEach((t, idx) => {
        const eb = this._createStoryBubbleMesh({
          text: t,
          tailDir: 'down-left',
          widthWorld: 2.05,
          heightWorld: 0.46
        });
        eb.position.set(0.85, 1.75 - idx * 0.48, 0.35);
        this.neonVoidGroup.add(eb);
        this.neonVoidEmpathyBubbles.push(eb);
      });

      this.neonVoidComfortBubbles = [];
      ['mai làm cũng được', 'nghỉ thêm 5 phút', 'chưa cần vội đâu'].forEach((t, idx) => {
        const cb = this._createStoryBubbleMesh({
          text: t,
          tailDir: 'down-left',
          widthWorld: 2.05,
          heightWorld: 0.46,
          borderColor: '#fbbf24'
        });
        cb.position.set(0.85, 1.75 - idx * 0.48, 0.35);
        cb.visible = false;
        this.neonVoidGroup.add(cb);
        this.neonVoidComfortBubbles.push(cb);
      });

      this.neonVoidHurtBubbles = [];
      ['lời nói vô tình', 'một lần thất hứa', 'không được trân trọng'].forEach((t, idx) => {
        const hb = this._createStoryBubbleMesh({
          text: t,
          tailDir: 'down-left',
          widthWorld: 2.15,
          heightWorld: 0.46,
          borderColor: '#f43f5e'
        });
        hb.position.set(0.9, 1.75 - idx * 0.48, 0.35);
        hb.visible = false;
        this.neonVoidGroup.add(hb);
        this.neonVoidHurtBubbles.push(hb);
      });

      // Cracked Invisible Heart ("vết thương không chảy máu" & "Kintsugi")
      const chCanv = document.createElement('canvas');
      chCanv.width = 256; chCanv.height = 256;
      const chc = chCanv.getContext('2d');
      chc.shadowColor = '#f43f5e'; chc.shadowBlur = 16;
      chc.strokeStyle = '#fb7185'; chc.fillStyle = 'rgba(244, 63, 94, 0.22)'; chc.lineWidth = 9;
      chc.beginPath();
      chc.moveTo(128, 210);
      chc.bezierCurveTo(28, 145, 24, 68, 78, 52);
      chc.bezierCurveTo(108, 44, 124, 68, 128, 86);
      chc.bezierCurveTo(132, 68, 148, 44, 178, 52);
      chc.bezierCurveTo(232, 68, 228, 145, 128, 210);
      chc.closePath(); chc.fill(); chc.stroke();
      // Jagged crack line inside heart
      chc.strokeStyle = '#fde047'; chc.lineWidth = 6;
      chc.beginPath();
      chc.moveTo(128, 88); chc.lineTo(110, 118); chc.lineTo(142, 144); chc.lineTo(124, 198);
      chc.stroke();
      this.neonVoidCrackedHeart = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, 1.15),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(chCanv), transparent: true, depthWrite: false })
      );
      this.neonVoidCrackedHeart.position.set(1.08, 1.48, 0.35);
      this.neonVoidCrackedHeart.visible = false;
      this.neonVoidGroup.add(this.neonVoidCrackedHeart);

      // Guarded Wall / Shield cage for fear of opening up
      this.neonVoidGuardShield = new THREE.Group();
      this.neonVoidGuardShield.position.set(-0.65, 1.25, 0.2);
      const shieldFrame = this._createNeonWireBox(1.25, 2.25, 0.95, 0x38bdf8, 0.85);
      this.neonVoidGuardShield.add(shieldFrame);
      const shieldRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.025, 12, 36),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
      );
      this.neonVoidGuardShield.add(shieldRing);
      this.neonVoidGuardShield.visible = false;
      this.neonVoidGroup.add(this.neonVoidGuardShield);

      // Sincere Whole Glowing Heart ("yêu chân thành chưa bao giờ sai")
      const shCanv = document.createElement('canvas');
      shCanv.width = 256; shCanv.height = 256;
      const shc = shCanv.getContext('2d');
      shc.shadowColor = '#f472b6'; shc.shadowBlur = 22;
      shc.strokeStyle = '#f9a8d4'; shc.fillStyle = 'rgba(244, 114, 182, 0.45)'; shc.lineWidth = 9;
      shc.beginPath();
      shc.moveTo(128, 210);
      shc.bezierCurveTo(28, 145, 24, 68, 78, 52);
      shc.bezierCurveTo(108, 44, 124, 68, 128, 86);
      shc.bezierCurveTo(132, 68, 148, 44, 178, 52);
      shc.bezierCurveTo(232, 68, 228, 145, 128, 210);
      shc.closePath(); shc.fill(); shc.stroke();
      this.neonVoidSincereHeart = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, 1.15),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shCanv), transparent: true, depthWrite: false })
      );
      this.neonVoidSincereHeart.position.set(0.95, 1.48, 0.35);
      this.neonVoidSincereHeart.visible = false;
      this.neonVoidGroup.add(this.neonVoidSincereHeart);

      // Equalizer Voice Bars vs Shrinking Fear Blob
      for (let b = 0; b < 7; b++) {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.6, 0.14),
          new THREE.MeshBasicMaterial({ color: 0x45d97d })
        );
        bar.position.set(-1.35 + b * 0.22, 0.85, 0.2);
        this.neonVoidGroup.add(bar);
        this.neonVoidEqualizerBars.push(bar);
      }
      this.neonVoidFearBlob = new THREE.Group();
      this.neonVoidFearBlob.position.set(1.0, 1.15, 0.2);
      const blobCore = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.45, 1),
        new THREE.MeshStandardMaterial({ color: 0x3b0764, emissive: 0x1e1b4b, roughness: 0.7 })
      );
      this.neonVoidFearBlob.add(blobCore);
      [-0.12, 0.12].forEach((ex) => {
        const reye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        reye.position.set(ex, 0.08, 0.42);
        this.neonVoidFearBlob.add(reye);
      });
      this.neonVoidGroup.add(this.neonVoidFearBlob);

      // =========================================================================
      // 112. SCENE: neon_classroom_stage (x = 2034, z = 12)
      // Chalkboard (#1F2F2B w/ #45D97D double neon border), window, foreground desks
      // =========================================================================
      this.neonClassroomGroup = new THREE.Group();
      this.neonClassroomGroup.position.set(2034, 0, 12);
      this.scene.add(this.neonClassroomGroup);
      makeRadialBackdrop(this.neonClassroomGroup, 'rgba(25, 43, 66, 0.65)', 2.0, -3.2, 9.5);

      const boardBg = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 1.65),
        new THREE.MeshBasicMaterial({ color: 0x1f2f2b })
      );
      boardBg.position.set(0, 1.95, -1.35);
      this.neonClassroomGroup.add(boardBg);
      const boardRim = this._createNeonWireBox(3.48, 1.72, 0.05, 0x45d97d, 0.9);
      boardRim.position.set(0, 1.95, -1.35);
      this.neonClassroomGroup.add(boardRim);

      const classWin = this._createNeonWireBox(1.5, 1.35, 0.05, 0x38bdf8, 0.72);
      classWin.position.set(-3.2, 2.25, -1.35);
      this.neonClassroomGroup.add(classWin);

      for (let d = -2; d <= 2; d++) {
        const deskBox = this._createNeonWireBox(0.9, 0.45, 0.45, 0x475569, 0.75);
        deskBox.position.set(d * 1.35, 0.22, 1.85);
        this.neonClassroomGroup.add(deskBox);
      }

      this.neonClassroomHero = this._createStoryPuppet3D({
        role: 'hero',
        mood: 'blush',
        scale: 1.05
      });
      this.neonClassroomHero.position.set(0, 0.05, -0.35);
      this.neonClassroomGroup.add(this.neonClassroomHero);

      this.neonClassroomBubble = this._createStoryBubbleMesh({
        text: '...',
        tailDir: 'down-left',
        widthWorld: 0.85,
        heightWorld: 0.42
      });
      this.neonClassroomBubble.position.set(0.95, 2.05, -0.2);
      this.neonClassroomGroup.add(this.neonClassroomBubble);

      // =========================================================================
      // 113. SCENE: neon_party_room (x = 2052, z = 12)
      // Dual starry windows w/ amber lights, 4 NPCs socializing center, Hero hidden corner left
      // =========================================================================
      this.neonPartyGroup = new THREE.Group();
      this.neonPartyGroup.position.set(2052, 0, 12);
      this.scene.add(this.neonPartyGroup);
      makeRadialBackdrop(this.neonPartyGroup, 'rgba(61, 50, 36, 0.7)', 2.0, -3.2, 9.5);

      [-2.1, 2.1].forEach((wx) => {
        const pw = this._createNeonWireBox(1.6, 1.35, 0.05, 0xfbbf24, 0.75);
        pw.position.set(wx, 2.35, -1.6);
        this.neonPartyGroup.add(pw);
        const warmCone = this._createSpotlightCone(0.15, 0.9, 2.6, 0xfde68a, 0.14);
        warmCone.position.set(wx * 1.45, 1.35, -1.0);
        this.neonPartyGroup.add(warmCone);
      });

      [-0.4, 0.45, 1.35, 2.1].forEach((nx, i) => {
        const npc = this._createStoryPuppet3D({
          role: i % 2 === 0 ? 'colleague' : 'crush',
          mood: 'happy',
          scale: 0.98
        });
        npc.position.set(nx, 0.04, -0.2 + (i % 2) * 0.25);
        this.neonPartyGroup.add(npc);
      });

      this.neonPartyHero = this._createStoryPuppet3D({
        role: 'hero',
        mood: 'tired',
        scale: 1.02
      });
      this.neonPartyHero.position.set(-2.25, 0.04, 0.25);
      this.neonPartyGroup.add(this.neonPartyHero);

      // =========================================================================
      // 114. SCENE: neon_office_meeting (x = 2070, z = 12)
      // Cyan grid city window, golden presentation chart board, boss + rushed/confident hero
      // =========================================================================
      this.neonOfficeGroup = new THREE.Group();
      this.neonOfficeGroup.position.set(2070, 0, 12);
      this.scene.add(this.neonOfficeGroup);
      makeRadialBackdrop(this.neonOfficeGroup, 'rgba(25, 43, 66, 0.7)', 2.0, -3.2, 9.5);

      const officeWin = this._createNeonWireBox(3.8, 1.8, 0.05, 0x38bdf8, 0.7);
      officeWin.position.set(-1.5, 2.2, -1.7);
      this.neonOfficeGroup.add(officeWin);

      const chartFrame = this._createNeonWireBox(1.85, 1.25, 0.05, 0xfacc15, 0.85);
      chartFrame.position.set(1.9, 2.0, -1.4);
      this.neonOfficeGroup.add(chartFrame);

      const officeDesk = this._createNeonWireBox(2.8, 0.55, 0.8, 0x64748b, 0.75);
      officeDesk.position.set(0, 0.28, -0.35);
      this.neonOfficeGroup.add(officeDesk);

      const bossNpc = this._createStoryPuppet3D({ role: 'colleague', mood: 'happy', scale: 1.02 });
      bossNpc.position.set(-0.95, 0.04, 0.2);
      this.neonOfficeGroup.add(bossNpc);

      this.neonOfficeHero = this._createStoryPuppet3D({ role: 'hero', mood: 'stressed', scale: 1.02 });
      this.neonOfficeHero.position.set(0.85, 0.04, 0.2);
      this.neonOfficeGroup.add(this.neonOfficeHero);

      this.neonOfficeRushedBubble = this._createStoryBubbleMesh({
        text: 'dạ-em-làm-xong-rồi-ạ',
        tailDir: 'down-right',
        widthWorld: 2.25,
        heightWorld: 0.48
      });
      this.neonOfficeRushedBubble.position.set(0.35, 2.22, 0.35);
      this.neonOfficeGroup.add(this.neonOfficeRushedBubble);

      this.neonOfficeConfidentBubble = this._createStoryBubbleMesh({
        text: 'em có ý này...',
        tailDir: 'down-right',
        widthWorld: 1.85,
        heightWorld: 0.48
      });
      this.neonOfficeConfidentBubble.position.set(0.35, 2.22, 0.35);
      this.neonOfficeGroup.add(this.neonOfficeConfidentBubble);

      this.neonOfficeActionBubble = this._createStoryBubbleMesh({
        text: 'bắt đầu ngay!',
        tailDir: 'down-right',
        widthWorld: 1.75,
        heightWorld: 0.48,
        borderColor: '#45d97d'
      });
      this.neonOfficeActionBubble.position.set(0.35, 2.22, 0.35);
      this.neonOfficeActionBubble.visible = false;
      this.neonOfficeGroup.add(this.neonOfficeActionBubble);

      // =========================================================================
      // 115. SCENE: neon_night_park_crush (x = 2088, z = 12)
      // Full moon, cherry blossom tree, cyan fountain, hero + crush + tangled scribble bubble
      // =========================================================================
      this.neonParkGroup = new THREE.Group();
      this.neonParkGroup.position.set(2088, 0, 12);
      this.scene.add(this.neonParkGroup);
      makeRadialBackdrop(this.neonParkGroup, 'rgba(59, 40, 70, 0.68)', 2.1, -3.2, 9.5);

      const parkMoon = new THREE.Mesh(
        new THREE.CircleGeometry(0.45, 24),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      parkMoon.position.set(2.4, 3.2, -2.2);
      this.neonParkGroup.add(parkMoon);

      const sakuraTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xf472b6, wireframe: true, transparent: true, opacity: 0.48 })
      );
      sakuraTop.position.set(-2.3, 2.1, -1.2);
      this.neonParkGroup.add(sakuraTop);

      const parkBench = this._createNeonWireBox(1.6, 0.45, 0.5, 0x38bdf8, 0.72);
      parkBench.position.set(0, 0.22, -0.5);
      this.neonParkGroup.add(parkBench);

      this.neonParkHero = this._createStoryPuppet3D({ role: 'hero', mood: 'blush', scale: 1.05 });
      this.neonParkHero.position.set(-0.65, 0.04, 0.25);
      this.neonParkGroup.add(this.neonParkHero);

      const crushNpc = this._createStoryPuppet3D({ role: 'crush', mood: 'happy', scale: 1.05 });
      crushNpc.position.set(0.65, 0.04, 0.25);
      this.neonParkGroup.add(crushNpc);

      this.neonParkScribbleBubble = this._createScribbleBubbleMesh(1.45, 0.65);
      this.neonParkScribbleBubble.position.set(-0.65, 2.38, 0.35);
      this.neonParkGroup.add(this.neonParkScribbleBubble);

      // =========================================================================
      // 116. SCENE: neon_city_street_home (x = 2106, z = 12)
      // Neon street signs ("NHÀ SÁCH", "QUÁN NHẬU", "TIỆM HOA", "HOME"),
      // warm streetlamp, nervous walk / lightbulb / confident greet!
      // =========================================================================
      this.neonStreetGroup = new THREE.Group();
      this.neonStreetGroup.position.set(2106, 0, 12);
      this.scene.add(this.neonStreetGroup);
      makeRadialBackdrop(this.neonStreetGroup, 'rgba(61, 50, 36, 0.68)', 2.0, -3.2, 9.5);

      const signSpecs = [
        { text: 'NHÀ SÁCH', color: '#facc15', x: -2.8, y: 2.35 },
        { text: 'QUÁN NHẬU', color: '#fb923c', x: -0.6, y: 2.45 },
        { text: 'TIỆM HOA', color: '#c084fc', x: 1.6, y: 2.35 },
        { text: 'HOME', color: '#38bdf8', x: 3.3, y: 2.45 }
      ];
      signSpecs.forEach((sg) => {
        const bldg = this._createNeonWireBox(1.6, 2.6, 0.8, 0x334155, 0.55);
        bldg.position.set(sg.x, 1.3, -1.6);
        this.neonStreetGroup.add(bldg);
        const pill = this._create3DNeonBadge({
          text: sg.text,
          borderColor: sg.color,
          widthWorld: 1.25,
          heightWorld: 0.4
        });
        pill.position.set(sg.x, sg.y, -1.1);
        this.neonStreetGroup.add(pill);
      });

      this.neonStreetHero = this._createStoryPuppet3D({
        role: 'hero',
        mood: 'happy',
        scale: 1.05,
        hasLightbulb: true
      });
      this.neonStreetHero.position.set(-0.5, 0.04, 0.25);
      this.neonStreetGroup.add(this.neonStreetHero);

      const streetNpc = this._createStoryPuppet3D({ role: 'colleague', mood: 'happy', scale: 1.02 });
      streetNpc.position.set(0.85, 0.04, 0.25);
      this.neonStreetGroup.add(streetNpc);

      this.neonStreetNervousBubble = this._createStoryBubbleMesh({
        text: 'ờ... à...',
        tailDir: 'down-left',
        widthWorld: 1.25,
        heightWorld: 0.44
      });
      this.neonStreetNervousBubble.position.set(-0.5, 2.28, 0.35);
      this.neonStreetGroup.add(this.neonStreetNervousBubble);

      this.neonStreetConfidentBubble = this._createStoryBubbleMesh({
        text: 'chào bạn!',
        tailDir: 'down-left',
        widthWorld: 1.35,
        heightWorld: 0.44
      });
      this.neonStreetConfidentBubble.position.set(-0.5, 2.28, 0.35);
      this.neonStreetGroup.add(this.neonStreetConfidentBubble);

      // =========================================================================
      // 117. SCENE: sunrise_ocean_horizon (x = 2124, z = 12)
      // Dramatic back-of-head over-the-shoulder perspective facing golden rising sun
      // (#F2BE77) over ocean (#2B3B54) w/ warm sand (#C3A47E) & clean sky breather
      // =========================================================================
      this.sunriseOceanGroup = new THREE.Group();
      this.sunriseOceanGroup.position.set(2124, 0, 12);
      this.scene.add(this.sunriseOceanGroup);

      // Gradient Sunset/Sunrise Sky backdrop (#3E3F54 -> #FFF5CE)
      const skyCanv = document.createElement('canvas');
      skyCanv.width = 512; skyCanv.height = 512;
      const skc = skyCanv.getContext('2d');
      const skGrad = skc.createLinearGradient(0, 0, 0, 512);
      skGrad.addColorStop(0.0, '#1e2235');
      skGrad.addColorStop(0.45, '#3e3f54');
      skGrad.addColorStop(0.82, '#e29f66');
      skGrad.addColorStop(1.0, '#fff5ce');
      skc.fillStyle = skGrad;
      skc.fillRect(0, 0, 512, 512);
      const skyPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 8),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(skyCanv) })
      );
      skyPlane.position.set(0, 3.6, -4.5);
      this.sunriseOceanGroup.add(skyPlane);

      // Ocean Water (#2B3B54) & Warm Sand (#C3A47E)
      const oceanPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 4.5),
        new THREE.MeshBasicMaterial({ color: 0x2b3b54 })
      );
      oceanPlane.rotation.x = -Math.PI / 2;
      oceanPlane.position.set(0, 0.02, -1.8);
      this.sunriseOceanGroup.add(oceanPlane);

      const sandPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 4.5),
        new THREE.MeshBasicMaterial({ color: 0xc3a47e })
      );
      sandPlane.rotation.x = -Math.PI / 2;
      sandPlane.position.set(0, 0.03, 2.6);
      this.sunriseOceanGroup.add(sandPlane);

      // Rising Golden Sun (#F2BE77) + warm glow + reflection bars on ocean
      this.sunriseOceanSun = new THREE.Mesh(
        new THREE.CircleGeometry(1.05, 36),
        new THREE.MeshBasicMaterial({ color: 0xf2be77 })
      );
      this.sunriseOceanSun.position.set(0.35, 1.05, -4.0);
      this.sunriseOceanSun.add(makeColorHalo(this.glowTex, 4.2, 0.85));
      this.sunriseOceanGroup.add(this.sunriseOceanSun);

      for (let r = 0; r < 6; r++) {
        const refl = new THREE.Mesh(
          new THREE.BoxGeometry(1.6 - r * 0.18, 0.02, 0.14),
          new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.82 - r * 0.09 })
        );
        refl.position.set(0.35, 0.05, -3.2 + r * 0.48);
        this.sunriseOceanGroup.add(refl);
        this.sunriseOceanRays.push(refl);
      }

      // Over-the-shoulder back-view Hero watching sunrise horizon (turned away from camera)
      const backHero = this._createStoryPuppet3D({
        role: 'backview',
        scale: 1.48,
        hasScarf: true
      });
      backHero.rotation.y = Math.PI;
      backHero.position.set(-1.05, -0.58, 2.25);
      this.sunriseOceanGroup.add(backHero);
    }


    _ensureNeonStoryBuilt() {
      if (this._neonStoryBuilt) return;
      this._neonStoryBuilt = true;
      this._buildNeonStoryStageMetaphors();
    }

    _getNeonStoryPalette() {
      return {
        neon_wireframe_bedroom: 0x0f1017,
        neon_theater_stage: 0x151827,
        neon_emotional_void: 0x0d0f18,
        neon_classroom_stage: 0x10141c,
        neon_party_room: 0x11121d,
        neon_office_meeting: 0x0f1522,
        neon_night_park_crush: 0x0d101c,
        neon_city_street_home: 0x0f1019,
        sunrise_ocean_horizon: 0x1e2235
      };
    }

    _setNeonStoryVisibility(sceneType, activeSegment) {
      const isNeonStoryScene = [
        'neon_wireframe_bedroom',
        'neon_theater_stage',
        'neon_emotional_void',
        'neon_classroom_stage',
        'neon_party_room',
        'neon_office_meeting',
        'neon_night_park_crush',
        'neon_city_street_home',
        'sunrise_ocean_horizon'
      ].includes(sceneType);

      if (isNeonStoryScene) {
        this._ensureNeonStoryBuilt();
      }

      if (this.neonBedroomGroup) this.neonBedroomGroup.visible = sceneType === 'neon_wireframe_bedroom';
      if (this.neonStageGroup) this.neonStageGroup.visible = sceneType === 'neon_theater_stage';
      if (this.neonVoidGroup) this.neonVoidGroup.visible = sceneType === 'neon_emotional_void';
      if (this.neonClassroomGroup) this.neonClassroomGroup.visible = sceneType === 'neon_classroom_stage';
      if (this.neonPartyGroup) this.neonPartyGroup.visible = sceneType === 'neon_party_room';
      if (this.neonOfficeGroup) this.neonOfficeGroup.visible = sceneType === 'neon_office_meeting';
      if (this.neonParkGroup) this.neonParkGroup.visible = sceneType === 'neon_night_park_crush';
      if (this.neonStreetGroup) this.neonStreetGroup.visible = sceneType === 'neon_city_street_home';
      if (this.sunriseOceanGroup) this.sunriseOceanGroup.visible = sceneType === 'sunrise_ocean_horizon';

      if (this.floorMesh) {
        this.floorMesh.visible = !(isNeonStoryScene || (activeSegment && activeSegment.hideFloorGrid));
      }
    }

    _getNeonStoryCameraTarget(cameraPreset, p, timeSec) {
      switch (cameraPreset) {
        // --- Ken Burns & Narrative Camera Presets for @phatbieulungtung Neon Story Stage ---
        case 'ken_burns_bedroom_static':
          return {
            pos: new THREE.Vector3(1980.0, 2.05, 19.6 - p * 0.35),
            look: new THREE.Vector3(1980.0, 1.85, 12.0)
          };

        case 'ken_burns_stage_pullback':
          // Smooth ~1%/sec Ken Burns pull-back so speaker feels smaller against audience
          return {
            pos: new THREE.Vector3(1998.0, 1.95 + p * 0.15, 19.0 + p * 1.45),
            look: new THREE.Vector3(1998.0, 1.65, 12.2)
          };

        case 'ken_burns_stage_pushin':
          return {
            pos: new THREE.Vector3(1998.0, 2.05 - p * 0.12, 20.2 - p * 1.35),
            look: new THREE.Vector3(1998.0, 1.65, 12.2)
          };

        case 'ken_burns_void_drift':
          return {
            pos: new THREE.Vector3(2016.0 + Math.sin(p * 0.6 - 0.3) * 0.35, 1.95, 19.4 - p * 0.65),
            look: new THREE.Vector3(2016.0, 1.65, 12.0)
          };

        case 'ken_burns_classroom_pan':
          return {
            pos: new THREE.Vector3(2033.7 + p * 0.6, 2.05, 19.6 - p * 0.45),
            look: new THREE.Vector3(2034.0, 1.75, 12.0)
          };

        case 'ken_burns_party_corner':
          return {
            pos: new THREE.Vector3(2052.0 - p * 0.65, 2.0, 19.8 - p * 0.5),
            look: new THREE.Vector3(2051.5, 1.68, 12.0)
          };

        case 'ken_burns_office_push':
          return {
            pos: new THREE.Vector3(2070.0, 2.0, 19.8 - p * 0.75),
            look: new THREE.Vector3(2070.0, 1.72, 12.0)
          };

        case 'ken_burns_park_couple':
          return {
            pos: new THREE.Vector3(2088.0 + Math.sin(p * 0.5) * 0.3, 2.05, 19.8 - p * 0.6),
            look: new THREE.Vector3(2088.0, 1.72, 12.0)
          };

        case 'ken_burns_street_walk':
          return {
            pos: new THREE.Vector3(2105.6 + p * 0.8, 2.05, 19.8 - p * 0.55),
            look: new THREE.Vector3(2106.0, 1.75, 12.0)
          };

        case 'sunrise_backview_horizon':
          return {
            pos: new THREE.Vector3(2124.0, 1.65 + p * 0.08, 17.8 - p * 0.45),
            look: new THREE.Vector3(2124.0, 1.45 + p * 0.1, 8.0)
          };


        default:
          return null;
      }
    }

    _updateNeonStoryStage(timeSec, activeSegment, segProgress, sceneType) {
      if (!this._neonStoryBuilt) return;

      // 109. Neon Wireframe Bedroom — dynamic stageMood ('chat' | 'phone_trap' | 'study_focus' | 'empty_plans' | 'lonely_night' | 'waiting_message')
      const bMood = (activeSegment && activeSegment.stageMood) || 'chat';
      if (this.neonBedroomChar) {
        this.neonBedroomChar.position.y = 0.05 + Math.sin(timeSec * 2.2) * 0.03;
        if (this.neonBedroomChar.userData.bulbGroup) {
          this.neonBedroomChar.userData.bulbGroup.visible = bMood === 'study_focus';
        }
      }
      this.neonBedroomChatStack.forEach((cb, idx) => {
        if (bMood === 'chat') {
          const appear = segProgress > idx * 0.25 ? 1 : 0.001;
          cb.visible = true;
          cb.scale.set(appear, appear, appear);
          cb.position.y = 1.05 + idx * 0.48 + Math.sin(timeSec * 2.0 + idx) * 0.025;
        } else {
          cb.visible = false;
        }
      });
      if (this.neonBedroomMail) {
        this.neonBedroomMail.visible = bMood === 'chat' || bMood === 'waiting_message';
        this.neonBedroomMail.position.y = 1.65 + Math.sin(timeSec * 2.5) * 0.08;
        this.neonBedroomMail.rotation.z = Math.sin(timeSec * 1.8) * 0.12;
      }
      if (this.neonBedroomTimeBubble) {
        this.neonBedroomTimeBubble.visible = bMood === 'phone_trap';
        this.neonBedroomTimeBubble.position.y = 1.85 + Math.sin(timeSec * 2.2) * 0.04;
      }
      if (this.neonBedroomWaitingBubble) {
        this.neonBedroomWaitingBubble.visible = bMood === 'waiting_message';
        this.neonBedroomWaitingBubble.position.y = 1.85 + Math.sin(timeSec * 2.2) * 0.04;
      }
      if (this.neonBedroomStudyBook) {
        this.neonBedroomStudyBook.visible = bMood === 'study_focus' || bMood === 'empty_plans';
        if (this.neonBedroomStudyGlow) {
          this.neonBedroomStudyGlow.visible = bMood === 'study_focus';
        }
      }

      // 110. Neon Theater Stage — dynamic crowdMode & stageMood
      const crowdMode = (activeSegment && activeSegment.crowdMode) || 'pink_eyes';
      const stageMood = (activeSegment && activeSegment.stageMood) || 'solo';
      this.neonAudiencePinkEyes.forEach((ep, idx) => {
        ep.visible = crowdMode === 'pink_eyes';
        const pScale = 1.0 + Math.sin(timeSec * 4.0 + idx) * 0.15;
        ep.scale.set(pScale, pScale, 1);
      });
      if (this.neonAudienceFriendlySmile) {
        this.neonAudienceFriendlySmile.visible = crowdMode === 'friendly_smile';
        const sPulse = 1.0 + Math.sin(timeSec * 2.5) * 0.08;
        this.neonAudienceFriendlySmile.scale.set(sPulse, sPulse, 1);
      }
      this.neonAudienceConfetti.forEach((dot, idx) => {
        dot.visible = crowdMode === 'confetti' || stageMood === 'confetti';
        const ang = (idx / 17) * Math.PI;
        dot.position.y = 0.85 + Math.sin(ang) * 1.85 + Math.sin(timeSec * 3.5 + idx) * 0.12;
      });
      if (this.neonStageMic) {
        this.neonStageMic.visible = ['mic', 'breathing', 'notecard', 'confident', 'confetti'].includes(stageMood);
      }
      if (this.neonStageBreathingRing) {
        this.neonStageBreathingRing.visible = stageMood === 'breathing';
        const br = 0.85 + (0.5 - 0.5 * Math.cos(timeSec * 1.6)) * 0.55;
        this.neonStageBreathingRing.scale.set(br, br, 1);
      }
      if (this.neonStageNoteCard) {
        this.neonStageNoteCard.visible = stageMood === 'notecard';
        this.neonStageNoteCard.position.y = 1.45 + Math.sin(timeSec * 2.0) * 0.04;
      }
      if (this.neonStageHero) {
        this.neonStageHero.position.y = 0.04 + Math.sin(timeSec * 2.2) * 0.025;
        this.neonStageHero.position.x = stageMood === 'solo' ? Math.sin(timeSec * 24.0) * 0.015 : 0;
      }

      // 111. Neon Emotional Void — voidMode controller
      const voidMode = (activeSegment && activeSegment.voidMode) || 'symptoms';
      if (this.neonVoidSymptomChar) {
        const showSymp = ['symptoms', 'future_leak', 'time_kintsugi'].includes(voidMode);
        this.neonVoidSymptomChar.visible = showSymp;
        this.neonVoidSymptomChar.position.x = voidMode === 'time_kintsugi' ? -0.35 : 0;
      }
      if (this.neonVoidHeart) {
        this.neonVoidHeart.visible = voidMode === 'symptoms';
        const hb = 1.0 + Math.abs(Math.sin(timeSec * 6.5)) * 0.25;
        this.neonVoidHeart.scale.set(hb, hb, hb);
      }
      if (this.neonVoidHourglass) {
        this.neonVoidHourglass.visible = voidMode === 'future_leak' || voidMode === 'time_kintsugi';
        this.neonVoidHourglass.position.x = voidMode === 'time_kintsugi' ? -1.45 : -1.18;
        this.neonVoidHourglass.rotation.y = timeSec * 0.7;
        this.neonVoidHourglass.position.y = 1.55 + Math.sin(timeSec * 2.0) * 0.05;
      }
      this.neonVoidDocs.forEach((doc, idx) => {
        doc.visible = voidMode === 'symptoms' || voidMode === 'future_leak';
        doc.position.y = 1.35 + idx * 0.2 + segProgress * 0.75 + Math.sin(timeSec * 2.0 + idx) * 0.06;
        doc.material.opacity = Math.max(0.1, 0.85 - segProgress * 0.65);
      });
      if (this.neonVoidZipperChar) {
        this.neonVoidZipperChar.visible = voidMode === 'zipper';
        this.neonVoidZipperChar.position.y = 0.1 + Math.sin(timeSec * 1.8) * 0.025;
      }
      if (this.neonVoidEmpathyChar) {
        const showEmp = [
          'empathy_bubbles',
          'comfort_bubbles',
          'hurt_bubbles',
          'cracked_heart',
          'guarded_wall',
          'sincere_heart'
        ].includes(voidMode);
        this.neonVoidEmpathyChar.visible = showEmp;
        this.neonVoidEmpathyChar.position.y = 0.1 + Math.sin(timeSec * 2.0) * 0.03;
        if (this.neonVoidEmpathyChar.userData.heartAboveGroup) {
          this.neonVoidEmpathyChar.userData.heartAboveGroup.visible =
            voidMode === 'empathy_bubbles' || voidMode === 'comfort_bubbles' || voidMode === 'sincere_heart';
        }
      }
      this.neonVoidEmpathyBubbles.forEach((eb, idx) => {
        eb.visible = voidMode === 'empathy_bubbles';
        const showB = segProgress >= idx * 0.25 ? 1 : 0.001;
        eb.scale.set(showB, showB, showB);
      });
      this.neonVoidComfortBubbles.forEach((cb, idx) => {
        cb.visible = voidMode === 'comfort_bubbles';
        const showC = segProgress >= idx * 0.22 ? 1 : 0.001;
        cb.scale.set(showC, showC, showC);
      });
      if (this.neonVoidHurtBubbles) {
        this.neonVoidHurtBubbles.forEach((hb, idx) => {
          hb.visible = voidMode === 'hurt_bubbles';
          const showH = segProgress >= idx * 0.24 ? 1 : 0.001;
          hb.scale.set(showH, showH, showH);
        });
      }
      if (this.neonVoidCrackedHeart) {
        this.neonVoidCrackedHeart.visible = voidMode === 'cracked_heart' || voidMode === 'time_kintsugi';
        const chBeat = 1.0 + Math.sin(timeSec * 2.8) * 0.06;
        this.neonVoidCrackedHeart.scale.set(chBeat, chBeat, 1);
      }
      if (this.neonVoidGuardShield) {
        this.neonVoidGuardShield.visible = voidMode === 'guarded_wall';
        const gsScale = 1.0 + Math.sin(timeSec * 1.8) * 0.03;
        this.neonVoidGuardShield.scale.set(gsScale, gsScale, gsScale);
      }
      if (this.neonVoidSincereHeart) {
        this.neonVoidSincereHeart.visible = voidMode === 'sincere_heart';
        const shBeat = 1.0 + Math.sin(timeSec * 3.0) * 0.08;
        this.neonVoidSincereHeart.scale.set(shBeat, shBeat, 1);
      }
      this.neonVoidEqualizerBars.forEach((bar, idx) => {
        bar.visible = voidMode === 'equalizer_vs_fear';
        const grow = 0.65 + segProgress * 1.35 + Math.abs(Math.sin(timeSec * 5.0 + idx * 0.7)) * 0.55;
        bar.scale.set(1, grow, 1);
        bar.position.y = 0.55 + grow * 0.3;
      });
      if (this.neonVoidFearBlob) {
        this.neonVoidFearBlob.visible = voidMode === 'equalizer_vs_fear';
        const shrink = Math.max(0.32, 1.25 - segProgress * 0.78);
        this.neonVoidFearBlob.scale.set(shrink, shrink, shrink);
        this.neonVoidFearBlob.position.y = 1.15 + Math.sin(timeSec * 3.0) * 0.05;
      }

      // 112. Neon Classroom Stage animation
      if (this.neonClassroomHero) {
        const cMood = (activeSegment && activeSegment.stageMood) || 'shy';
        this.neonClassroomHero.position.y = 0.05 + Math.sin(timeSec * 2.0) * 0.03;
        if (this.neonClassroomHero.userData.armR) {
          this.neonClassroomHero.userData.armR.rotation.z = cMood === 'confident' ? 2.45 : 0;
        }
        if (this.neonClassroomBubble) {
          this.neonClassroomBubble.visible = cMood === 'shy';
        }
      }

      // 113. Neon Party Room idle bob
      if (this.neonPartyHero) {
        this.neonPartyHero.position.y = 0.04 + Math.sin(timeSec * 1.8) * 0.025;
      }

      // 114. Neon Office Meeting animation ('rushed' | 'confident' | 'idle_watch' | 'confident_action')
      if (this.neonOfficeHero) {
        const oMood = (activeSegment && activeSegment.stageMood) || 'rushed';
        this.neonOfficeHero.position.y = 0.04 + Math.sin(timeSec * 2.2) * 0.03;
        if (this.neonOfficeHero.userData.armR) {
          this.neonOfficeHero.userData.armR.rotation.z = oMood === 'confident_action' ? 2.35 : 0;
        }
        if (this.neonOfficeRushedBubble) this.neonOfficeRushedBubble.visible = oMood === 'rushed';
        if (this.neonOfficeConfidentBubble) this.neonOfficeConfidentBubble.visible = oMood === 'confident';
        if (this.neonOfficeActionBubble) this.neonOfficeActionBubble.visible = oMood === 'confident_action';
      }

      // 115. Neon Night Park Crush animation
      const pMood = (activeSegment && activeSegment.stageMood) || 'confused';
      if (this.neonParkHero) {
        this.neonParkHero.position.y = 0.04 + Math.sin(timeSec * 2.0) * 0.03;
      }
      if (this.neonParkScribbleBubble) {
        this.neonParkScribbleBubble.visible = pMood !== 'open_heart';
        this.neonParkScribbleBubble.rotation.z = Math.sin(timeSec * 4.5) * 0.04;
        this.neonParkScribbleBubble.position.y = 2.38 + Math.sin(timeSec * 2.4) * 0.04;
      }

      // 116. Neon City Street & Home animation ('nervous_walk' | 'lightbulb_home' | 'confident_greet' | 'regret_walk' | 'confident_run')
      if (this.neonStreetHero) {
        const sMood = (activeSegment && activeSegment.stageMood) || 'nervous_walk';
        this.neonStreetHero.position.y = 0.04 + Math.abs(Math.sin(timeSec * 3.5)) * 0.04;
        if (this.neonStreetNervousBubble) this.neonStreetNervousBubble.visible = sMood === 'nervous_walk';
        if (this.neonStreetConfidentBubble) this.neonStreetConfidentBubble.visible = sMood === 'confident_greet';
        if (this.neonStreetHero.userData.bulbGroup) {
          this.neonStreetHero.userData.bulbGroup.visible = sMood === 'lightbulb_home';
        }
      }

      // 117. Sunrise Ocean Horizon gentle rise
      if (this.sunriseOceanSun) {
        this.sunriseOceanSun.position.y = 0.95 + segProgress * 0.25;
      }
      this.sunriseOceanRays.forEach((refl, idx) => {
        refl.scale.x = 1.0 + Math.sin(timeSec * 2.2 + idx) * 0.14;
      });
    }

  }

  if (global.MetaphorScene3D) {
    for (const key of Object.getOwnPropertyNames(_NeonStoryStageMixin.prototype)) {
      if (key !== 'constructor') {
        global.MetaphorScene3D.prototype[key] = _NeonStoryStageMixin.prototype[key];
      }
    }
  }
})(window);

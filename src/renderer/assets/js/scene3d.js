/**
 * 3D Metaphor Scene Engine (Three.js)
 * Recreates the exact dark-mode glowing 3D visual style of the reference video:
 * - Dark grid floor with subtle reflection & atmospheric fog
 * - Translucent glass tanks (start & end) with glowing coins accumulating inside
 * - Long modular glass pipe with periodic rings & support pillars
 * - Stream of glowing golden-white coins flowing & tumbling inside the pipe
 * - Red leakage valves underneath the pipe emitting falling coins, red sparks & cutter blades
 * - Floating white locator pins above the pipe ("Bản đồ định vị dòng tiền")
 * - Rotating Golden Ship's Helm ("Bánh lái tài chính") with glowing concentric rings
 * - 3D Smartphone with animated touch-screen ripple rings ("Vài cú chạm màn hình")
 * - Additional 3D Metaphor islands: Growth Bar Chart, Balance Scale, Time Gears, Wealth Vault
 */
(function (global) {
  const THREE = global.THREE;

  function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 252, 225, 1.0)');
    grad.addColorStop(0.25, 'rgba(255, 238, 165, 0.65)');
    grad.addColorStop(0.55, 'rgba(220, 195, 110, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }

  function createRedGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 120, 100, 1.0)');
    grad.addColorStop(0.3, 'rgba(255, 35, 35, 0.7)');
    grad.addColorStop(0.65, 'rgba(180, 10, 10, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }

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

  function createGridTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#090b0c';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle sub-grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Main grid lines
    ctx.strokeStyle = 'rgba(210, 225, 220, 0.11)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(60, 60);
    return tex;
  }

  class MetaphorScene3D {
    constructor(canvas, width = 576, height = 324) {
      this.canvas = canvas;
      this.width = width;
      this.height = height;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(1);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.18;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x060809);
      this.scene.fog = new THREE.FogExp2(0x060809, 0.014);

      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 250);

      this.glowTex = createGlowTexture();
      this.redGlowTex = createRedGlowTexture();
      this.cyanGlowTex = createColorGlowTexture(
        'rgba(224, 248, 255, 1.0)',
        'rgba(56, 189, 248, 0.72)',
        'rgba(14, 116, 144, 0.22)'
      );
      this.emeraldGlowTex = createColorGlowTexture(
        'rgba(210, 255, 238, 1.0)',
        'rgba(16, 185, 129, 0.72)',
        'rgba(6, 95, 70, 0.22)'
      );
      this.violetGlowTex = createColorGlowTexture(
        'rgba(245, 230, 255, 1.0)',
        'rgba(192, 132, 252, 0.72)',
        'rgba(107, 33, 168, 0.22)'
      );
      this.roseGlowTex = createColorGlowTexture(
        'rgba(255, 228, 242, 1.0)',
        'rgba(244, 114, 182, 0.72)',
        'rgba(157, 23, 77, 0.22)'
      );

      this.pipeCoins = [];
      this.leakDrops = [];
      this.redParticles = [];
      this.cutterBlades = [];
      this.locatorPins = [];
      this.tankIntroCoins = [];
      this.tankOutroCoins = [];
      this.phoneRipples = [];
      this.gears = [];
      this.chartBars = [];
      this.hourglassDrops = [];
      this.hourglassRings = [];
      this.dominoes = [];
      this.bridgeCoins = [];
      this.shortTermDrops = [];
      this.candleFlames = [];
      this.candleEmbers = [];
      this.fallingLeaves = [];
      this.homePendulum = null;
      this.vanishingPlanks = [];
      this.memoryStardust = [];
      this.cagedDreams = [];
      this.presentRipples = [];
      this.presentCore = null;
      this.clockMinuteHand = null;
      this.clockHourHand = null;
      this.loopRunner = null;
      this.thiefDrops = [];
      this.thiefRings = [];
      this.actionRunner = null;
      this.hesitationRings = [];
      this.bookPages = [];

      // Letting-Go ("Buông Bỏ") diverse multi-colored 3D scene elements
      this.chainedSoulCore = null;
      this.chainedBurdens = [];
      this.sisyphusBoulder = null;
      this.sisyphusFreeOrb = null;
      this.thornyGripRings = [];
      this.thornyPainWaves = [];
      this.thornyBloodDrops = [];
      this.bloomLotusGroup = null;
      this.morphingPetals = [];
      this.acceptanceRings = [];
      this.butterflies = [];
      this.shatteredBars = [];
      this.closingBronzeDoor = null;
      this.openingEmeraldDoorL = null;
      this.openingEmeraldDoorR = null;
      this.portalTraveler = null;
      this.compassRings = [];
      this.compassNeedle = null;
      this.openHandL = null;
      this.openHandR = null;
      this.dawnLotus = null;
      this.fallingOldShards = [];
      this.dawnOrbitOrbs = [];

      // Power-of-Silence ("Sức Mạnh Của Sự Im Lặng") diverse multi-colored 3D scene elements
      this.noisyCore = null;
      this.noisyArrows = [];
      this.noisySoundRings = [];
      this.chessClashSparks = [];
      this.peaceStoryBook = null;
      this.mountainStormRings = [];
      this.mountainSnowOrbs = [];
      this.turbulentWaves = [];
      this.calmMirrorRipples = [];
      this.lakeBottomLotus = null;
      this.emotionSpikes = [];
      this.zenSphereRings = [];
      this.jadeDomeShield = null;
      this.deflectedDarts = [];
      this.innerSanctuaryTree = null;
      this.truthChimeBell = null;
      this.actionPillars = [];
      this.silentSpireTiers = [];
      this.silentConstellationOrbs = [];

      // Only-Can-Love ("Có Những Người, Chỉ Có Thể Thương") diverse multi-colored 3D scene elements
      this.unsentChatBubble = null;
      this.sharedPlanetCore = null;
      this.twinOrbitMoons = [];
      this.divergingGems = [];
      this.unfinishedRoofShards = [];
      this.vinylDisc = null;
      this.vinylNotes = [];
      this.dimmingScreenGlow = null;
      this.paperBoats = [];
      this.loveToTreePetals = [];
      this.peaceBridgeSouls = [];
      this.peaceLanterns = [];
      this.stillLovingHeart = null;
      this.parallelTravelerL = null;
      this.parallelTravelerR = null;

      // Imperfect-Love ("Tình Yêu Đẹp Nhất Không Phải Là Tìm Được Người Hoàn Hảo") 3D elements
      this.earthBillionsGlobe = null;
      this.destinedSoulPair = [];
      this.fadingIllusionTokens = [];
      this.sweetBeginningIcons = [];
      this.stormMisunderstandingRings = [];
      this.stormRainDrops = [];
      this.empathySadnessCore = null;
      this.kintsugiHeart = null;
      this.listeningWaves = [];
      this.ephemeralFireworks = [];
      this.lighthouseBeam = null;
      this.mutualEnergyOrbs = [];
      this.imperfectHalfL = null;
      this.imperfectHalfR = null;
      this.ordinaryWalkCouple = null;
      this.ordinaryLanternOrbs = [];

      // Work-Pressure ("Áp Lực Công Việc – Đằng Sau Hai Chữ 'Ổn Mà'") 3D elements
      this.silentBedSoul = null;
      this.tiredBatteryRings = [];
      this.dawnCommuters = [];
      this.deadlineClockHands = [];
      this.deadlineStormRings = [];
      this.billTablets = [];
      this.familyHopeOrbs = [];
      this.perseveringWalker = null;
      this.smilingMaskFront = null;
      this.hiddenSleeplessTears = [];
      this.unresolvedMazeBlocks = [];
      this.mazeWalkerSoul = null;
      this.partingMachineGears = [];
      this.beatingHumanHeart = null;
      this.essentialCheckStars = [];
      this.mosaicLifeTiles = [];
      this.identityWorthCore = null;
      this.rechargeEnergyRings = [];
      this.sanctuaryCareOrbs = [];
      this.selfLoveHeartCrown = null;
      this.lifeGardenPetals = [];

      // Storm-Resilience ("Đừng Sợ Những Ngày Giông Bão") 3D elements
      this.mudLotusBloom = null;
      this.forgedDiamondCore = null;
      this.diamondPressureRings = [];
      this.risingResilientSoul = null;
      this.endlessRainShafts = [];
      this.selfDoubtRings = [];
      this.seedSproutCore = null;
      this.mightyTreeCanopyOrbs = [];
      this.stormSailingShip = null;
      this.oceanStormWaves = [];
      this.resiliencePhoenixCore = null;
      this.goldenScarRings = [];
      this.mountainClimberSoul = null;
      this.horizonSummitStar = null;
      this.partingStormCloudL = null;
      this.partingStormCloudR = null;
      this.eternalBlueSkyCore = null;
      this.proudStormFlower = null;
      this.tempestWindRibbons = [];

      // Precious-Before-Lost ("Đừng Để Đến Khi Mất Đi, Ta Mới Hiểu Điều Gì Là Quý Giá") 3D elements
      this.slippingTreasureChar = null;
      this.slippingHeartGem = null;
      this.slippingBadges = [];
      this.youthPhoneChar = null;
      this.waitingParentsGroup = null;
      this.youthMissedBadges = [];
      this.lossCardTrain = null;
      this.lossCardTears = [];
      this.lossCardWords = [];
      this.mirageRunnerChar = null;
      this.mirageFloatingIcons = [];
      this.checklistCards3D = [];
      this.checklistHeroChar = null;
      this.cherishNowChars = [];
      this.cherishProgressDots = [];
      this.silentTimePages = [];
      this.silentTimeChar = null;
      this.droppedExistBlock = null;
      this.trulyLivingChar = null;
      this.sunriseRaysGroup = null;

      // Judge-Not-By-Possessions ("Đừng Vội Đánh Giá Một Người Qua Những Gì Họ Đang Có") 3D elements
      this.surfaceJudgeCharL = null;
      this.surfaceJudgeCharR = null;
      this.surfaceScaleBeam = null;
      this.surfaceMagnifier = null;
      this.hastyLabelsCards = [];
      this.icebergFloatingLake = null;
      this.calmPersonChar = null;
      this.hiddenScarsMesh = null;
      this.twoStartRunners = [];
      this.heavyBackpackMesh = null;
      this.uniqueClockHands = [];
      this.timelineRings = [];
      this.deepRootsTree = null;
      this.deepRootSprouts = [];
      this.slingshotBowMesh = null;
      this.preppingArcherChar = null;
      this.perseveranceHeroChar = null;
      this.valueStepsBadges = [];
      this.empathyWalkHero = null;
      this.empathyHorizonGateway = null;

      // Personal-Responsibility ("Trách Nhiệm Cá Nhân Đối Với Tương Lai") 3D elements
      this.selfReflectionChar = null;
      this.selfMirrorMesh = null;
      this.blameArrows = [];
      this.blameShield = null;
      this.blameChar = null;
      this.victimCageMesh = null;
      this.victimChar = null;
      this.pastShadowMesh = null;
      this.presentHeroChar = null;
      this.solitaryPillar = null;
      this.solitaryRings = [];
      this.solitaryChar = null;
      this.firmHelmMesh = null;
      this.captainChar = null;
      this.goldenKeyMesh = null;
      this.futurePortalGateway = null;
      this.keyBearerChar = null;
      this.mountainClimberChar = null;
      this.summitStarMesh = null;
      this.brickBridgeBlocks = [];
      this.bridgeBuilderChar = null;
      this.heroCrownMesh = null;
      this.ownHeroChar = null;
      this.destinySunriseArch = null;
      this.destinyMasterChar = null;

      // Self-Conquest ("Chiến Thắng Bản Thân") 3D elements
      this.arenaClashPillars = [];
      this.pedestalPodiumL = null;
      this.pedestalPodiumR = null;
      this.innerShadowChar = null;
      this.innerLightChar = null;
      this.lazyAlarmClock = null;
      this.lazyComfortPillow = null;
      this.transientTrophy = null;
      this.innerFreedomCrown = null;
      this.dawnAwakeningChar = null;
      this.dawnSunSphere = null;
      this.focusedBookMesh = null;
      this.focusedDumbbellMesh = null;
      this.dimPhoneScrollMesh = null;
      this.zenWaterSphere = null;
      this.rageFlameMesh = null;
      this.yesterdayGhostChar = null;
      this.todayProgressChar = null;
      this.willpowerAnvilDiamond = null;
      this.willpowerForgeSparks = [];
      this.selfConquestGateway = null;
      this.selfConquestHeroChar = null;

      // Neon-Story-Stage ("@phatbieulungtung" style) elements
      this.neonBedroomChar = null;
      this.neonBedroomChatStack = [];
      this.neonBedroomMail = null;
      this.neonStageHero = null;
      this.neonStageSpotlight = null;
      this.neonStageMic = null;
      this.neonStageBreathingRing = null;
      this.neonStageNoteCard = null;
      this.neonAudiencePinkEyes = [];
      this.neonAudienceFriendlySmile = null;
      this.neonAudienceConfetti = [];
      this.neonVoidHeart = null;
      this.neonVoidDocs = [];
      this.neonVoidSymptomChar = null;
      this.neonVoidZipperChar = null;
      this.neonVoidEmpathyChar = null;
      this.neonVoidEmpathyBubbles = [];
      this.neonVoidEqualizerBars = [];
      this.neonVoidFearBlob = null;
      this.neonVoidNaturalPair = [];
      this.neonClassroomHero = null;
      this.neonClassroomBubble = null;
      this.neonPartyHero = null;
      this.neonOfficeHero = null;
      this.neonOfficeRushedBubble = null;
      this.neonOfficeConfidentBubble = null;
      this.neonParkHero = null;
      this.neonParkScribbleBubble = null;
      this.neonStreetHero = null;
      this.neonStreetNervousBubble = null;
      this.neonStreetConfidentBubble = null;
      this.neonStreetLightbulb = null;
      this.sunriseOceanSun = null;
      this.sunriseOceanRays = [];

      this._buildLighting();
      this._buildFloor();
      this._buildStartTank();
      this._buildPipeSystem();
      this._buildHelmAndPhone();
      this._buildExtraMetaphors();
      this._buildLettingGoMetaphors();
      this._buildPowerOfSilenceMetaphors();
      this._buildOnlyCanLoveMetaphors();
      this._buildImperfectLoveMetaphors();
      this._buildWorkPressureMetaphors();
      this._buildStormResilienceMetaphors();
      this._buildPreciousBeforeLostMetaphors();
      this._buildJudgeNotByPossessionsMetaphors();
      this._buildPersonalResponsibilityMetaphors();
      this._buildSelfConquestMetaphors();
      if (this._buildNeonStoryStageMetaphors) this._buildNeonStoryStageMetaphors();

      this.currentCamPos = new THREE.Vector3(0, 4, 12);
      this.currentLookAt = new THREE.Vector3(0, 2, 0);
    }

    resize(width, height) {
      this.width = width;
      this.height = height;
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    _buildLighting() {
      const ambient = new THREE.AmbientLight(0xdbe6e0, 0.65);
      this.scene.add(ambient);

      const dirLight1 = new THREE.DirectionalLight(0xfff4d2, 1.5);
      dirLight1.position.set(15, 30, 25);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x88bbaa, 0.7);
      dirLight2.position.set(-20, 15, -15);
      this.scene.add(dirLight2);

      // Warm point lights along the pipe
      for (let x = 0; x <= 75; x += 15) {
        const pl = new THREE.PointLight(0xffea9f, 1.1, 18);
        pl.position.set(x, 3.8, 1.5);
        this.scene.add(pl);
      }

      // Dedicated point lights for extra 3D metaphor islands (z = 12)
      [45, 60, 75, 90, 105, 122, 142, 162, 180, 198, 216, 234, 252, 270, 288, 306, 324, 342].forEach((mx) => {
        const ml = new THREE.PointLight(0xffea9f, 1.5, 22);
        ml.position.set(mx, 5.2, 15.0);
        this.scene.add(ml);
      });
    }

    _buildFloor() {
      const gridTex = createGridTexture();
      gridTex.repeat.set(500, 380);
      const floorGeo = new THREE.PlaneGeometry(3600, 2400);
      const floorMat = new THREE.MeshStandardMaterial({
        map: gridTex,
        roughness: 0.45,
        metalness: 0.25
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(1000, 0, 0);
      this.floorMesh = floor;
      this.scene.add(floor);
    }

    _createGlassMaterial(opacity = 0.22, tint = 0xcfe8dc) {
      return new THREE.MeshPhysicalMaterial({
        color: tint,
        transparent: true,
        opacity: opacity,
        roughness: 0.12,
        metalness: 0.08,
        reflectivity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false
      });
    }

    _createCoinMesh(radius = 0.42, thickness = 0.11, withHalo = true) {
      const group = new THREE.Group();
      const geo = new THREE.CylinderGeometry(radius, radius, thickness, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xfff6d6,
        emissive: 0xffe494,
        emissiveIntensity: 0.82,
        roughness: 0.18,
        metalness: 0.45
      });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);

      if (withHalo) {
        const spriteMat = new THREE.SpriteMaterial({
          map: this.glowTex,
          color: 0xffeea8,
          transparent: true,
          opacity: 0.62,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(radius * 4.5, radius * 4.5, 1);
        group.add(sprite);
      }
      return group;
    }

    _buildStartTank() {
      // Main glass tank located at x = -4.2, z = 0
      this.tankGroup = new THREE.Group();
      this.tankGroup.position.set(-4.2, 0, 0);
      this.scene.add(this.tankGroup);

      const tankRadius = 3.2;
      const tankHeight = 3.1;

      // Base disc (olive/greenish glowing pad like 00:00 in reference video)
      const baseGeo = new THREE.CylinderGeometry(tankRadius, tankRadius, 0.14, 48);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x566347,
        emissive: 0x22291a,
        roughness: 0.4,
        metalness: 0.3
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.08;
      this.tankGroup.add(baseMesh);

      // Translucent glass cylinder wall
      const wallGeo = new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 48, 1, true);
      const wallMat = this._createGlassMaterial(0.2, 0xd8eee2);
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.y = tankHeight / 2 + 0.08;
      this.tankGroup.add(wallMesh);

      // Top bright rim torus
      const rimGeo = new THREE.TorusGeometry(tankRadius, 0.045, 16, 64);
      const rimMat = new THREE.MeshBasicMaterial({
        color: 0xdff5ea,
        transparent: true,
        opacity: 0.75
      });
      const topRim = new THREE.Mesh(rimGeo, rimMat);
      topRim.rotation.x = Math.PI / 2;
      topRim.position.y = tankHeight + 0.08;
      this.tankGroup.add(topRim);

      // Sparse coins for Intro (00:00 - 00:04: "còn vài trăm nghìn")
      this.introCoinsGroup = new THREE.Group();
      this.tankGroup.add(this.introCoinsGroup);
      const sparseCoords = [
        [-0.9, 0.22, -0.3],
        [-0.3, 0.22, 0.4],
        [0.45, 0.22, -0.4],
        [0.85, 0.22, 0.35],
        [1.7, 0.22, 0.1]
      ];
      sparseCoords.forEach(([cx, cy, cz]) => {
        const c = this._createCoinMesh(0.32, 0.08, true);
        c.position.set(cx, cy, cz);
        c.rotation.set(0.05, Math.random() * Math.PI, 0.03);
        this.introCoinsGroup.add(c);
        this.tankIntroCoins.push(c);
      });

      // Full pile of glowing coins for Outro (01:09 - 01:13)
      this.outroCoinsGroup = new THREE.Group();
      this.tankGroup.add(this.outroCoinsGroup);
      for (let i = 0; i < 68; i++) {
        const angle = (i * 2.39996); // golden angle spiral
        const r = Math.sqrt(i / 68) * 2.35;
        const layer = Math.floor(i / 22);
        const c = this._createCoinMesh(0.34, 0.09, i % 2 === 0);
        c.position.set(
          Math.cos(angle) * r,
          0.2 + layer * 0.12 + (Math.random() * 0.06),
          Math.sin(angle) * r
        );
        c.rotation.set(
          (Math.random() - 0.5) * 0.25,
          Math.random() * Math.PI,
          (Math.random() - 0.5) * 0.25
        );
        this.outroCoinsGroup.add(c);
        this.tankOutroCoins.push(c);
      }
    }

    _buildPipeSystem() {
      // Long glass tube stretching from x = -1.2 to x = 82 along y = 2.25, z = 0
      this.pipeGroup = new THREE.Group();
      this.scene.add(this.pipeGroup);

      const pipeStart = -1.2;
      const pipeEnd = 82;
      const pipeLen = pipeEnd - pipeStart;
      const pipeY = 2.25;
      const pipeRadius = 0.62;

      // Main glass cylinder
      const tubeGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLen, 32, 1, true);
      const tubeMat = this._createGlassMaterial(0.18, 0xd4ece0);
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.rotation.z = Math.PI / 2;
      tubeMesh.position.set(pipeStart + pipeLen / 2, pipeY, 0);
      this.pipeGroup.add(tubeMesh);

      // Periodic glass connector rings, support pillars, leak valves & locator flags
      const ringGeo = new THREE.CylinderGeometry(pipeRadius * 1.12, pipeRadius * 1.12, 0.26, 32, 1, true);
      const ringEdgeGeo = new THREE.TorusGeometry(pipeRadius * 1.12, 0.035, 12, 36);
      const ringMat = this._createGlassMaterial(0.36, 0xe2f5ec);
      const ringEdgeMat = new THREE.MeshBasicMaterial({
        color: 0xe6fff2,
        transparent: true,
        opacity: 0.65
      });

      const pillarGeo = new THREE.BoxGeometry(0.28, pipeY - 0.55, 0.28);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x1a1e21,
        roughness: 0.5,
        metalness: 0.6
      });

      const redLightGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a });

      for (let x = -1.0; x <= 80; x += 3.2) {
        // Glass coupler ring
        const rGroup = new THREE.Group();
        rGroup.position.set(x, pipeY, 0);
        const rCyl = new THREE.Mesh(ringGeo, ringMat);
        rCyl.rotation.z = Math.PI / 2;
        rGroup.add(rCyl);

        const edge1 = new THREE.Mesh(ringEdgeGeo, ringEdgeMat);
        edge1.rotation.y = Math.PI / 2;
        edge1.position.x = -0.13;
        rGroup.add(edge1);

        const edge2 = new THREE.Mesh(ringEdgeGeo, ringEdgeMat);
        edge2.rotation.y = Math.PI / 2;
        edge2.position.x = 0.13;
        rGroup.add(edge2);

        this.pipeGroup.add(rGroup);

        // Support pillar every segment after tank
        if (x >= 2.0) {
          const pillar = new THREE.Mesh(pillarGeo, pillarMat);
          pillar.position.set(x, (pipeY - 0.55) / 2, 0);
          this.pipeGroup.add(pillar);

          // Red indicator light on pillar
          const redDot = new THREE.Mesh(redLightGeo, redLightMat);
          redDot.position.set(x, pipeY - 0.85, 0.18);
          this.pipeGroup.add(redDot);

          const redSprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: this.redGlowTex,
              color: 0xff2222,
              transparent: true,
              opacity: 0.75,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            })
          );
          redSprite.scale.set(1.1, 1.1, 1);
          redSprite.position.set(x, pipeY - 0.85, 0.22);
          this.pipeGroup.add(redSprite);

          // Red cutter blades inside/around leak rings (for 00:39 "gặm nhấm từng giờ")
          const cutterGroup = new THREE.Group();
          cutterGroup.position.set(x, pipeY, 0);
          const bladeGeo = new THREE.BoxGeometry(0.06, 0.48, 0.22);
          const bladeMat = new THREE.MeshStandardMaterial({
            color: 0xe53935,
            emissive: 0xb71c1c,
            emissiveIntensity: 0.65,
            roughness: 0.3
          });
          for (let b = 0; b < 3; b++) {
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            const ang = (b * Math.PI * 2) / 3;
            blade.position.set(0, Math.cos(ang) * 0.55, Math.sin(ang) * 0.55);
            blade.rotation.x = ang;
            cutterGroup.add(blade);
          }
          cutterGroup.visible = false;
          this.pipeGroup.add(cutterGroup);
          this.cutterBlades.push(cutterGroup);

          // Floating locator flag/pin above pipe (for 00:43 "Bản đồ định vị dòng tiền")
          const pinGroup = new THREE.Group();
          pinGroup.position.set(x, pipeY + 0.9, 0);
          const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8);
          const stemMat = new THREE.MeshBasicMaterial({ color: 0xdde5e9 });
          const stem = new THREE.Mesh(stemGeo, stemMat);
          stem.position.y = 0.7;
          pinGroup.add(stem);

          const diamondGeo = new THREE.OctahedronGeometry(0.32, 0);
          const diamondMat = new THREE.MeshBasicMaterial({ color: 0xf4f7f9 });
          const diamond = new THREE.Mesh(diamondGeo, diamondMat);
          diamond.scale.set(1.1, 1.35, 0.25);
          diamond.position.y = 1.55;
          pinGroup.add(diamond);

          pinGroup.visible = false;
          this.pipeGroup.add(pinGroup);
          this.locatorPins.push(pinGroup);
        }
      }

      // Flowing coins inside the pipe
      const numPipeCoins = 155;
      for (let i = 0; i < numPipeCoins; i++) {
        const coin = this._createCoinMesh(0.36, 0.09, true);
        this.pipeGroup.add(coin);
        this.pipeCoins.push({
          mesh: coin,
          baseOffset: (i / numPipeCoins) * pipeLen,
          rotSpeedX: 1.5 + (i % 5) * 0.45,
          rotSpeedY: 1.1 + (i % 7) * 0.35,
          rotSpeedZ: 0.8 + (i % 3) * 0.5,
          radialOffset: ((i % 9) - 4) * 0.045,
          phase: i * 0.73
        });
      }

      // Leaking coins & red spark particles falling from leak points
      const leakXPositions = [8.6, 15.0, 21.4, 27.8, 34.2, 40.6, 47.0, 53.4];
      leakXPositions.forEach((lx, idx) => {
        for (let k = 0; k < 4; k++) {
          const dropCoin = this._createCoinMesh(0.3, 0.08, true);
          this.pipeGroup.add(dropCoin);
          this.leakDrops.push({
            mesh: dropCoin,
            x: lx + (k - 1.5) * 0.14,
            baseY: pipeY - 0.2,
            phase: idx * 0.6 + k * 0.38
          });
        }
      });

      // Red spark particles around the pipe leaks (00:28 - 00:34)
      this.redParticlesGroup = new THREE.Group();
      this.scene.add(this.redParticlesGroup);
      for (let i = 0; i < 120; i++) {
        const spMat = new THREE.SpriteMaterial({
          map: this.redGlowTex,
          color: i % 3 === 0 ? 0xff5252 : 0xff1744,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const sp = new THREE.Sprite(spMat);
        const s = 0.22 + (i % 5) * 0.09;
        sp.scale.set(s, s, 1);
        this.redParticlesGroup.add(sp);
        this.redParticles.push({
          sprite: sp,
          baseX: 6 + (i / 120) * 55,
          baseY: pipeY + ((i % 11) - 5) * 0.22,
          baseZ: ((i % 7) - 3) * 0.28,
          speedY: 0.7 + (i % 5) * 0.35,
          phase: i * 0.41
        });
      }
    }

    _buildHelmAndPhone() {
      // Golden Ship's Steering Wheel ("Bánh lái tài chính" at 00:49 - 01:04)
      // Placed at x = 26, y = 2.6, z = 4.2 (right in front of the glowing coin pipe!)
      this.helmGroup = new THREE.Group();
      this.helmGroup.position.set(26.0, 2.55, 4.2);
      this.scene.add(this.helmGroup);

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffdf78,
        emissive: 0xd49b1a,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.85
      });

      const brightGoldMat = new THREE.MeshBasicMaterial({
        color: 0xfff3b8,
        transparent: true,
        opacity: 0.85
      });

      this.helmWheel = new THREE.Group();
      this.helmGroup.add(this.helmWheel);

      // Main wheel torus rim
      const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.13, 20, 64), goldMat);
      this.helmWheel.add(wheelRim);

      // Inner hub
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 24), goldMat);
      hub.rotation.x = Math.PI / 2;
      this.helmWheel.add(hub);

      // 8 spokes + outer handles
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const spokeGroup = new THREE.Group();
        spokeGroup.rotation.z = angle;

        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 3.1, 12), goldMat);
        spokeGroup.add(spoke);

        // Outer handle peg
        const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.05, 0.48, 12), goldMat);
        peg.position.y = 1.82;
        spokeGroup.add(peg);

        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), brightGoldMat);
        tip.position.y = 2.06;
        spokeGroup.add(tip);

        this.helmWheel.add(spokeGroup);
      }

      // Outer glowing concentric holographic rings around the helm (like 01:01 in reference video)
      const outerRing1 = new THREE.Mesh(
        new THREE.RingGeometry(2.18, 2.24, 64),
        new THREE.MeshBasicMaterial({ color: 0xffe89e, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
      );
      this.helmGroup.add(outerRing1);

      // Dashed / segmented outer ring
      for (let i = 0; i < 4; i++) {
        const arc = new THREE.Mesh(
          new THREE.RingGeometry(2.38, 2.48, 32, 1, i * Math.PI * 0.5 + 0.15, Math.PI * 0.32),
          new THREE.MeshBasicMaterial({ color: 0xfff2c2, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
        );
        this.helmGroup.add(arc);
      }

      // Soft golden glow sprite behind the helm
      const helmGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.glowTex,
          color: 0xffd56b,
          transparent: true,
          opacity: 0.48,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      helmGlow.scale.set(6.5, 6.5, 1);
      this.helmGroup.add(helmGlow);

      // 3D Smartphone with Touch Ripples ("Vài cú chạm màn hình" at 00:53 - 01:02)
      // Placed at x = 29.8, y = 1.65, z = 4.3
      this.phoneGroup = new THREE.Group();
      this.phoneGroup.position.set(29.8, 1.65, 4.3);
      this.phoneGroup.rotation.set(-0.22, -0.25, 0.08);
      this.scene.add(this.phoneGroup);

      // Phone body frame
      const bodyGeo = new THREE.BoxGeometry(1.55, 2.95, 0.12);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x16191c,
        roughness: 0.3,
        metalness: 0.8
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      this.phoneGroup.add(bodyMesh);

      // Illuminated mint-green screen (exact match to 00:54 in reference video)
      const screenGeo = new THREE.PlaneGeometry(1.42, 2.78);
      const screenMat = new THREE.MeshBasicMaterial({
        color: 0x8cb89a
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.z = 0.065;
      this.phoneGroup.add(screenMesh);

      // Touch ripple rings on the screen
      for (let r = 0; r < 2; r++) {
        const rippleGeo = new THREE.RingGeometry(0.18, 0.23, 36);
        const rippleMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ripple = new THREE.Mesh(rippleGeo, rippleMat);
        ripple.position.set(0.18, 0.25, 0.072);
        this.phoneGroup.add(ripple);
        this.phoneRipples.push(ripple);
      }
    }

    _buildExtraMetaphors() {
      // 1. 3D Rising Growth Bar Chart & Compound Curve (at x = 45, z = 12)
      this.chartGroup = new THREE.Group();
      this.chartGroup.position.set(45, 0, 12);
      this.scene.add(this.chartGroup);

      const barMat = new THREE.MeshStandardMaterial({
        color: 0xffdf78,
        emissive: 0xc88a12,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.7
      });

      const heights = [0.8, 1.3, 2.0, 3.1, 4.6, 6.5];
      heights.forEach((h, i) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.75, h, 0.75), barMat);
        bar.position.set((i - 2.5) * 1.25, h / 2, 0);
        this.chartGroup.add(bar);
        this.chartBars.push({ mesh: bar, targetH: h });

        const topCoin = this._createCoinMesh(0.35, 0.09, true);
        topCoin.position.set((i - 2.5) * 1.25, h + 0.35, 0);
        this.chartGroup.add(topCoin);
      });

      // 2. 3D Golden Balance Scale (at x = 60, z = 12)
      this.scaleGroup = new THREE.Group();
      this.scaleGroup.position.set(60, 0, 12);
      this.scene.add(this.scaleGroup);

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffdf78,
        emissive: 0xb87d14,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.8
      });

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.35, 3.8, 20), goldMat);
      pillar.position.y = 1.9;
      this.scaleGroup.add(pillar);

      this.scaleBeam = new THREE.Group();
      this.scaleBeam.position.y = 3.6;
      this.scaleGroup.add(this.scaleBeam);

      const beam = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.14, 0.14), goldMat);
      this.scaleBeam.add(beam);

      const leftPan = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 0.18, 24), goldMat);
      leftPan.position.set(-2.1, -1.2, 0);
      this.scaleBeam.add(leftPan);

      const rightPan = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 0.18, 24), goldMat);
      rightPan.position.set(2.1, -1.2, 0);
      this.scaleBeam.add(rightPan);

      // 3. 3D Interlocking Golden Time Gears (at x = 75, z = 12)
      this.gearsGroup = new THREE.Group();
      this.gearsGroup.position.set(75, 2.6, 12);
      this.scene.add(this.gearsGroup);

      const makeGear = (radius, teeth, speed) => {
        const g = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.18, 16, 48), goldMat);
        g.add(ring);
        for (let t = 0; t < teeth; t++) {
          const ang = (t * Math.PI * 2) / teeth;
          const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.22), goldMat);
          tooth.position.set(Math.cos(ang) * (radius + 0.18), Math.sin(ang) * (radius + 0.18), 0);
          tooth.rotation.z = ang;
          g.add(tooth);
        }
        this.gears.push({ mesh: g, speed });
        return g;
      };

      const gear1 = makeGear(1.4, 12, 0.7);
      gear1.position.set(-1.1, 0.2, 0);
      this.gearsGroup.add(gear1);

      const gear2 = makeGear(1.0, 9, -0.98);
      gear2.position.set(1.35, -0.5, 0);
      this.gearsGroup.add(gear2);

      // 4. 3D Glowing Wealth Vault Safe (at x = 90, z = 12)
      this.vaultGroup = new THREE.Group();
      this.vaultGroup.position.set(90, 2.0, 12);
      this.scene.add(this.vaultGroup);

      const vaultBox = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 3.4, 3.0),
        new THREE.MeshStandardMaterial({ color: 0x1c2226, roughness: 0.3, metalness: 0.85 })
      );
      this.vaultGroup.add(vaultBox);

      const vaultDoor = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.14, 16, 48), goldMat);
      vaultDoor.position.z = 1.56;
      this.vaultGroup.add(vaultDoor);
      this.vaultWheel = new THREE.Group();
      this.vaultWheel.position.z = 1.62;
      for (let s = 0; s < 6; s++) {
        const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 12), goldMat);
        sp.rotation.z = (s * Math.PI) / 3;
        this.vaultWheel.add(sp);
      }
      this.vaultGroup.add(this.vaultWheel);

      // Surrounding glowing coin piles around the vault for long-term wealth outro
      for (let i = 0; i < 28; i++) {
        const ang = (i / 28) * Math.PI * 2;
        const rad = 2.4 + (i % 3) * 0.55;
        const c = this._createCoinMesh(0.34, 0.09, i % 2 === 0);
        c.position.set(Math.cos(ang) * rad, -1.8 + (i % 4) * 0.12, Math.sin(ang) * rad + 0.6);
        this.vaultGroup.add(c);
      }

      // 5. 3D Celestial Hourglass of Long-Term Patience (at x = 105, z = 12)
      this.hourglassGroup = new THREE.Group();
      this.hourglassGroup.position.set(105, 0, 12);
      this.scene.add(this.hourglassGroup);

      const glassBulbMat = this._createGlassMaterial(0.26, 0xdff5ea);
      const topCap = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.22, 36), goldMat);
      topCap.position.y = 4.9;
      this.hourglassGroup.add(topCap);

      const botCap = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.22, 36), goldMat);
      botCap.position.y = 0.2;
      this.hourglassGroup.add(botCap);

      // 4 Golden frame pillars
      for (let p = 0; p < 4; p++) {
        const a = (p * Math.PI) / 2 + Math.PI / 4;
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.7, 12), goldMat);
        rod.position.set(Math.cos(a) * 1.55, 2.55, Math.sin(a) * 1.55);
        this.hourglassGroup.add(rod);
      }

      // Upper and lower glass cones
      const upperCone = new THREE.Mesh(new THREE.ConeGeometry(1.45, 2.2, 36, 1, true), glassBulbMat);
      upperCone.rotation.x = Math.PI;
      upperCone.position.y = 3.7;
      this.hourglassGroup.add(upperCone);

      const lowerCone = new THREE.Mesh(new THREE.ConeGeometry(1.45, 2.2, 36, 1, true), glassBulbMat);
      lowerCone.position.y = 1.4;
      this.hourglassGroup.add(lowerCone);

      // Rotating celestial golden rings around the hourglass
      for (let r = 0; r < 2; r++) {
        const cRing = new THREE.Mesh(
          new THREE.TorusGeometry(2.45 + r * 0.45, 0.045, 16, 64),
          goldMat
        );
        cRing.position.y = 2.55;
        cRing.rotation.x = r === 0 ? 0.45 : -0.5;
        this.hourglassGroup.add(cRing);
        this.hourglassRings.push(cRing);
      }

      // Trickling coins inside hourglass + base accumulation
      for (let i = 0; i < 16; i++) {
        const hc = this._createCoinMesh(0.24, 0.07, true);
        this.hourglassGroup.add(hc);
        this.hourglassDrops.push({ mesh: hc, phase: i / 16 });
      }
      for (let i = 0; i < 18; i++) {
        const ang = i * 2.1;
        const rad = Math.sqrt(i / 18) * 1.05;
        const baseC = this._createCoinMesh(0.28, 0.08, i % 3 === 0);
        baseC.position.set(Math.cos(ang) * rad, 0.38 + (i % 4) * 0.09, Math.sin(ang) * rad);
        this.hourglassGroup.add(baseC);
      }

      // 6. 3D Exponential Domino Chain (at x = 122, z = 12)
      this.dominoGroup = new THREE.Group();
      this.dominoGroup.position.set(122, 0, 12);
      this.scene.add(this.dominoGroup);

      const numDominoes = 11;
      for (let i = 0; i < numDominoes; i++) {
        const h = 0.55 * Math.pow(1.26, i); // Grows exponentially from 0.55 to ~5.6
        const w = 0.22 + i * 0.025;
        const d = 0.55 + i * 0.09;
        const domPivot = new THREE.Group();
        const xPos = (i - 5) * 1.15;
        const zPos = Math.sin(i * 0.25) * 0.7;
        domPivot.position.set(xPos, 0.05, zPos);

        const domMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), goldMat);
        domMesh.position.y = h / 2;
        domPivot.add(domMesh);

        const topGlow = this._createCoinMesh(0.22 + i * 0.02, 0.06, true);
        topGlow.position.y = h + 0.28;
        domPivot.add(topGlow);

        this.dominoGroup.add(domPivot);
        this.dominoes.push({ pivot: domPivot, index: i, height: h });
      }

      // 7. 3D Two Paths Divergence: Short-Term Trap vs Long-Term Golden Bridge (at x = 142, z = 12)
      this.twoPathsGroup = new THREE.Group();
      this.twoPathsGroup.position.set(142, 0, 12);
      this.scene.add(this.twoPathsGroup);

      const redTrapMat = new THREE.MeshStandardMaterial({
        color: 0xff3b30,
        emissive: 0xb71c1c,
        emissiveIntensity: 0.65,
        roughness: 0.35
      });

      // Short-term red path (angles forward-right and breaks off)
      for (let i = 0; i < 6; i++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 1.1), redTrapMat);
        slab.position.set(-3.2 + i * 1.05, 1.2 - (i > 3 ? (i - 3) * 0.35 : 0), 1.6 + i * 0.35);
        if (i >= 4) slab.rotation.z = -0.35 * (i - 3);
        this.twoPathsGroup.add(slab);
      }
      // Falling coins off the broken short-term path
      for (let i = 0; i < 10; i++) {
        const sc = this._createCoinMesh(0.28, 0.08, true);
        this.twoPathsGroup.add(sc);
        this.shortTermDrops.push({ mesh: sc, phase: i / 10 });
      }

      // Long-term ascending golden staircase bridge (climbs steadily up and left-back)
      for (let i = 0; i < 12; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.16, 1.25), goldMat);
        step.position.set(-3.2 + i * 0.95, 1.2 + i * 0.42, -0.5 - i * 0.22);
        this.twoPathsGroup.add(step);

        const bc = this._createCoinMesh(0.32, 0.08, true);
        this.twoPathsGroup.add(bc);
        this.bridgeCoins.push({ mesh: bc, stepIndex: i, phase: i / 12 });
      }

      // 8. 3D Lifeline Candles of Parents & Child (at x = 162, z = 12)
      this.candlesGroup = new THREE.Group();
      this.candlesGroup.position.set(162, 0, 12);
      this.scene.add(this.candlesGroup);

      const candlePedestal = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.24, 48), goldMat);
      candlePedestal.position.y = 0.12;
      this.candlesGroup.add(candlePedestal);

      const waxAmberMat = new THREE.MeshPhysicalMaterial({
        color: 0xffdfa0,
        emissive: 0xd98218,
        emissiveIntensity: 0.42,
        transparent: true,
        opacity: 0.88,
        roughness: 0.22,
        metalness: 0.1
      });

      const candleSpecs = [
        { x: -1.35, z: -0.15, h: 1.85, r: 0.46, isParent: true },  // Father candle
        { x: -0.15, z: 0.2, h: 1.55, r: 0.44, isParent: true },  // Mother candle
        { x: 1.45, z: -0.1, h: 3.35, r: 0.50, isParent: false }  // Child candle (tall & strong)
      ];

      candleSpecs.forEach((cs, idx) => {
        const cHolder = new THREE.Mesh(new THREE.CylinderGeometry(cs.r * 1.25, cs.r * 1.4, 0.22, 28), goldMat);
        cHolder.position.set(cs.x, 0.32, cs.z);
        this.candlesGroup.add(cHolder);

        const cBody = new THREE.Mesh(new THREE.CylinderGeometry(cs.r * 0.92, cs.r, cs.h, 32), waxAmberMat);
        cBody.position.set(cs.x, 0.42 + cs.h / 2, cs.z);
        this.candlesGroup.add(cBody);

        const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), goldMat);
        wick.position.set(cs.x, 0.42 + cs.h + 0.1, cs.z);
        this.candlesGroup.add(wick);

        const flameGroup = new THREE.Group();
        flameGroup.position.set(cs.x, 0.42 + cs.h + 0.34, cs.z);
        const flameCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.58, 20),
          new THREE.MeshBasicMaterial({ color: 0xfff5c0 })
        );
        flameGroup.add(flameCone);

        const flameHalo = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.glowTex,
            color: cs.isParent ? 0xffb84d : 0xffee99,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        flameHalo.scale.set(2.2, 2.6, 1);
        flameGroup.add(flameHalo);
        this.candlesGroup.add(flameGroup);
        this.candleFlames.push({ group: flameGroup, baseY: 0.42 + cs.h + 0.34, phase: idx * 1.7, isParent: cs.isParent });
      });

      // Rising warm golden memory embers from parents' candles
      for (let i = 0; i < 20; i++) {
        const em = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.glowTex,
            color: 0xffcf70,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        em.scale.set(0.45, 0.45, 1);
        this.candlesGroup.add(em);
        this.candleEmbers.push({
          sprite: em,
          baseX: (i % 2 === 0 ? -1.35 : -0.15) + ((i % 5) - 2) * 0.12,
          baseZ: (i % 2 === 0 ? -0.15 : 0.2) + ((i % 3) - 1) * 0.12,
          baseY: 2.3,
          phase: i / 20
        });
      }

      // 9. 3D Warm Home Dining Table & Two Waiting Chairs (at x = 180, z = 12)
      this.homeTableGroup = new THREE.Group();
      this.homeTableGroup.position.set(180, 0, 12);
      this.scene.add(this.homeTableGroup);

      // Warm floor rug ring
      const rugRing = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.85, 48), goldMat);
      rugRing.rotation.x = -Math.PI / 2;
      rugRing.position.y = 0.03;
      this.homeTableGroup.add(rugRing);

      // Round dining table (central pillar + glass/gold top)
      const tablePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.45, 1.45, 24), goldMat);
      tablePillar.position.y = 0.72;
      this.homeTableGroup.add(tablePillar);

      const tableTopRim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.08, 16, 48), goldMat);
      tableTopRim.rotation.x = Math.PI / 2;
      tableTopRim.position.y = 1.45;
      this.homeTableGroup.add(tableTopRim);

      const tableTopGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.06, 48), glassBulbMat);
      tableTopGlass.position.y = 1.45;
      this.homeTableGroup.add(tableTopGlass);

      // Warm bowls on the table + central warm soup pot
      const centerPot = this._createCoinMesh(0.42, 0.26, true);
      centerPot.position.set(0, 1.62, 0);
      this.homeTableGroup.add(centerPot);

      const bowlPositions = [
        { x: -0.85, z: -0.45 }, // Father's bowl
        { x: -0.35, z: -0.95 }, // Mother's bowl
        { x: 0.95, z: 0.45 }   // Child's waiting bowl across the table
      ];
      bowlPositions.forEach((bp) => {
        const bowl = this._createCoinMesh(0.24, 0.14, true);
        bowl.position.set(bp.x, 1.56, bp.z);
        this.homeTableGroup.add(bowl);
      });

      // Helper to build a stylized 3D chair
      const makeChair = (x, z, rotY, isWaitingGlow) => {
        const ch = new THREE.Group();
        ch.position.set(x, 0, z);
        ch.rotation.y = rotY;
        const seatMat = isWaitingGlow ? glassBulbMat : goldMat;
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.09, 0.75), seatMat);
        seat.position.y = 0.85;
        ch.add(seat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.08), seatMat);
        back.position.set(0, 1.4, -0.34);
        ch.add(back);
        [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 10), goldMat);
          leg.position.set(lx, 0.425, lz);
          ch.add(leg);
        });
        return ch;
      };

      // Father & Mother chairs sitting close together on the left/back
      this.homeTableGroup.add(makeChair(-1.85, -0.85, Math.PI * 0.32, false));
      this.homeTableGroup.add(makeChair(-0.75, -1.95, Math.PI * 0.12, false));
      // Child's empty chair pulled slightly back on the right
      this.emptyChair = makeChair(2.15, 0.95, -Math.PI * 0.65, true);
      this.homeTableGroup.add(this.emptyChair);

      // Hanging warm pendant lamp above the table
      this.homePendulum = new THREE.Group();
      this.homePendulum.position.set(0, 4.8, 0);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8), goldMat);
      cord.position.y = -0.8;
      this.homePendulum.add(cord);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.45, 32, 1, true), goldMat);
      shade.position.y = -1.6;
      this.homePendulum.add(shade);
      const bulbGlow = this._createCoinMesh(0.25, 0.2, true);
      bulbGlow.position.y = -1.72;
      this.homePendulum.add(bulbGlow);
      this.homeTableGroup.add(this.homePendulum);

      // 10. 3D Golden Family Tree with Falling Autumn Leaves (at x = 198, z = 12)
      this.treeGroup = new THREE.Group();
      this.treeGroup.position.set(198, 0, 12);
      this.scene.add(this.treeGroup);

      // Concentric glowing root rings on the ground
      for (let r = 0; r < 3; r++) {
        const rootRing = new THREE.Mesh(new THREE.TorusGeometry(1.4 + r * 0.85, 0.04, 12, 48), goldMat);
        rootRing.rotation.x = Math.PI / 2;
        rootRing.position.y = 0.06;
        this.treeGroup.add(rootRing);
      }

      // Sculptural trunk & branches
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.55, 2.8, 24), goldMat);
      trunk.position.y = 1.4;
      this.treeGroup.add(trunk);

      const branchAngles = [
        { rx: 0.45, rz: 0.55, y: 2.5, len: 1.9 },
        { rx: -0.4, rz: -0.6, y: 2.6, len: 2.0 },
        { rx: 0.5, rz: -0.35, y: 2.7, len: 1.75 },
        { rx: -0.45, rz: 0.4, y: 2.4, len: 1.85 },
        { rx: 0.15, rz: 0.15, y: 2.9, len: 1.6 }
      ];
      branchAngles.forEach((b) => {
        const br = new THREE.Group();
        br.position.set(0, b.y, 0);
        br.rotation.set(b.rx, 0, b.rz);
        const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, b.len, 14), goldMat);
        bMesh.position.y = b.len / 2;
        br.add(bMesh);
        this.treeGroup.add(br);
      });

      // Canopy of glowing golden leaves
      for (let i = 0; i < 26; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 26);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const rad = 1.55 + (i % 3) * 0.32;
        const lx = Math.sin(phi) * Math.cos(theta) * rad * 1.25;
        const ly = 3.55 + Math.cos(phi) * rad * 0.75;
        const lz = Math.sin(phi) * Math.sin(theta) * rad;
        if (ly > 2.3) {
          const leaf = this._createCoinMesh(0.26, 0.05, i % 2 === 0);
          leaf.position.set(lx, ly, lz);
          leaf.rotation.set(Math.sin(i), i * 0.5, Math.cos(i) * 0.6);
          this.treeGroup.add(leaf);
        }
      }

      // Drifting / falling golden leaves representing passing years & remaining visits
      for (let i = 0; i < 18; i++) {
        const fl = this._createCoinMesh(0.24, 0.04, true);
        this.treeGroup.add(fl);
        this.fallingLeaves.push({
          mesh: fl,
          baseX: ((i % 7) - 3) * 0.72,
          baseZ: ((i % 5) - 2) * 0.65,
          phase: i / 18
        });
      }

      // 11. 3D Vanishing Bridge of Untouched Tomorrows ("Những ngày mai không bao giờ chạm tới") (at x = 216, z = 12)
      this.vanishingBridgeGroup = new THREE.Group();
      this.vanishingBridgeGroup.position.set(216, 0, 12);
      this.scene.add(this.vanishingBridgeGroup);

      // Distant glowing horizon portal ("Ngày mai")
      const horizonPortal = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.09, 20, 64), goldMat);
      horizonPortal.position.set(3.8, 2.75, -1.2);
      horizonPortal.rotation.y = -0.35;
      this.vanishingBridgeGroup.add(horizonPortal);

      const portalGlow = this._createCoinMesh(0.65, 0.12, true);
      portalGlow.position.set(3.8, 2.75, -1.2);
      portalGlow.rotation.x = Math.PI / 2;
      this.vanishingBridgeGroup.add(portalGlow);

      // Bridge planks: first 4 solid, next 8 fragmenting and drifting upward/apart
      for (let i = 0; i < 12; i++) {
        const isFragmenting = i >= 4;
        const pMat = isFragmenting ? glassBulbMat : goldMat;
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 1.45), pMat);
        const bx = -3.8 + i * 0.68;
        const by = 1.15 + i * 0.14;
        const bz = 0.8 - i * 0.16;
        plank.position.set(bx, by, bz);
        this.vanishingBridgeGroup.add(plank);
        if (isFragmenting) {
          this.vanishingPlanks.push({
            mesh: plank,
            baseX: bx,
            baseY: by,
            baseZ: bz,
            index: i - 4
          });
        }
      }

      // Traveler light orb standing at the edge of the solid bridge
      const travelerOrb = this._createCoinMesh(0.38, 0.18, true);
      travelerOrb.position.set(-1.6, 1.85, 0.25);
      this.vanishingBridgeGroup.add(travelerOrb);

      // 12. 3D Memory Silhouette Frames & Rising Stardust ("Chỉ còn tồn tại trong ký ức") (at x = 234, z = 12)
      this.memoryFramesGroup = new THREE.Group();
      this.memoryFramesGroup.position.set(234, 0, 12);
      this.scene.add(this.memoryFramesGroup);

      const buildPortalFrame = (fx, fz, isDissolving) => {
        const fg = new THREE.Group();
        fg.position.set(fx, 0, fz);
        const fMat = isDissolving ? glassBulbMat : goldMat;
        const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.4, 0.14), fMat);
        leftPost.position.set(-0.95, 1.7, 0);
        fg.add(leftPost);
        const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.4, 0.14), fMat);
        rightPost.position.set(0.95, 1.7, 0);
        fg.add(rightPost);
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.14, 0.14), fMat);
        topBar.position.set(0, 3.4, 0);
        fg.add(topBar);
        const botBar = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.14, 0.24), goldMat);
        botBar.position.set(0, 0.08, 0);
        fg.add(botBar);

        if (!isDissolving) {
          // Warm glowing human-like silhouette (body cylinder + glowing head sphere)
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 1.55, 24), waxAmberMat);
          body.position.set(0, 1.05, 0);
          fg.add(body);
          const head = this._createCoinMesh(0.28, 0.28, true);
          head.position.set(0, 2.15, 0);
          fg.add(head);
        }
        return fg;
      };

      this.memoryFramesGroup.add(buildPortalFrame(-2.4, -0.3, false));
      this.memoryFramesGroup.add(buildPortalFrame(0.0, 0.0, false));
      this.memoryFramesGroup.add(buildPortalFrame(2.4, 0.2, true));

      // Dissolving stardust particles rising out of the 3rd memory frame
      for (let i = 0; i < 26; i++) {
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.glowTex,
            color: 0xffe494,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        sp.scale.set(0.48, 0.48, 1);
        this.memoryFramesGroup.add(sp);
        this.memoryStardust.push({
          sprite: sp,
          baseX: 2.4 + ((i % 5) - 2) * 0.22,
          baseY: 0.7 + (i % 6) * 0.25,
          baseZ: 0.2 + ((i % 3) - 1) * 0.15,
          phase: i / 26
        });
      }

      // 13. 3D Locked Glass Cage of Unspoken Words & Unlived Dreams ("Mắc kẹt trong lòng • Ước mơ trên trang giấy") (at x = 252, z = 12)
      this.glassCageGroup = new THREE.Group();
      this.glassCageGroup.position.set(252, 0, 12);
      this.scene.add(this.glassCageGroup);

      const cageBase = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 0.25, 40), goldMat);
      cageBase.position.y = 0.125;
      this.glassCageGroup.add(cageBase);

      const cageTop = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.2, 40), goldMat);
      cageTop.position.y = 3.85;
      this.glassCageGroup.add(cageTop);

      const cageGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 3.6, 36, 1, true), glassBulbMat);
      cageGlass.position.y = 2.0;
      this.glassCageGroup.add(cageGlass);

      // 10 Vertical golden cage bars
      for (let b = 0; b < 10; b++) {
        const ang = (b * Math.PI * 2) / 10;
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 3.65, 10), goldMat);
        bar.position.set(Math.cos(ang) * 1.92, 2.0, Math.sin(ang) * 1.92);
        this.glassCageGroup.add(bar);
      }

      // Pulsing golden heart-core & floating paper-scroll dreams trapped inside the cage
      for (let i = 0; i < 9; i++) {
        const orb = this._createCoinMesh(i === 0 ? 0.52 : 0.24, i === 0 ? 0.22 : 0.06, true);
        this.glassCageGroup.add(orb);
        this.cagedDreams.push({ mesh: orb, index: i, phase: i / 9 });
      }

      // 14. 3D Past - Radiant Present - Hazy Future Trinity ("Hiện tại mới là thứ duy nhất mình đang có") (at x = 270, z = 12)
      this.presentTrinityGroup = new THREE.Group();
      this.presentTrinityGroup.position.set(270, 0, 12);
      this.scene.add(this.presentTrinityGroup);

      const dimSlateMat = new THREE.MeshStandardMaterial({
        color: 0x2a3238,
        roughness: 0.6,
        metalness: 0.4
      });

      // Left pedestal: Faded Past
      const pastPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 1.1, 28), dimSlateMat);
      pastPillar.position.set(-2.9, 0.55, -0.4);
      this.presentTrinityGroup.add(pastPillar);
      const pastRing = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 12, 36), glassBulbMat);
      pastRing.position.set(-2.9, 2.0, -0.4);
      pastRing.rotation.z = 0.4;
      this.presentTrinityGroup.add(pastRing);

      // Right pedestal: Distant Hazy Future
      const futurePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 1.1, 28), dimSlateMat);
      futurePillar.position.set(2.9, 0.55, -0.4);
      this.presentTrinityGroup.add(futurePillar);
      const futureRing = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 12, 36), glassBulbMat);
      futureRing.position.set(2.9, 2.0, -0.4);
      futureRing.rotation.z = -0.4;
      this.presentTrinityGroup.add(futureRing);

      // Center pedestal: The Radiant Present ("Hiện tại")
      const nowPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.35, 1.65, 36), goldMat);
      nowPillar.position.set(0, 0.825, 0.3);
      this.presentTrinityGroup.add(nowPillar);

      this.presentCore = new THREE.Group();
      this.presentCore.position.set(0, 2.85, 0.3);
      const sunCore = this._createCoinMesh(0.68, 0.32, true);
      sunCore.rotation.x = Math.PI / 2;
      this.presentCore.add(sunCore);

      for (let r = 0; r < 3; r++) {
        const orbitR = new THREE.Mesh(new THREE.TorusGeometry(1.15 + r * 0.38, 0.045, 16, 48), goldMat);
        orbitR.rotation.set(r * 0.6, r * 0.4, 0);
        this.presentCore.add(orbitR);
        this.presentRipples.push(orbitR);
      }
      this.presentTrinityGroup.add(this.presentCore);

      // 15. 3D Procrastination Loop Clock ("Một ngày, một tuần, một năm... vẫn đứng ở nơi bắt đầu") (at x = 288, z = 12)
      this.clockLoopGroup = new THREE.Group();
      this.clockLoopGroup.position.set(288, 0, 12);
      this.scene.add(this.clockLoopGroup);

      const clockRim = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.1, 16, 64), goldMat);
      clockRim.rotation.x = Math.PI / 2;
      clockRim.position.y = 0.35;
      this.clockLoopGroup.add(clockRim);

      const clockInnerRim = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.045, 12, 48), glassBulbMat);
      clockInnerRim.rotation.x = Math.PI / 2;
      clockInnerRim.position.y = 0.35;
      this.clockLoopGroup.add(clockInnerRim);

      // 12 Hour tick pillars around the clock dial
      for (let h = 0; h < 12; h++) {
        const ang = (h * Math.PI * 2) / 12;
        const isStartMarker = h === 0;
        const tick = new THREE.Mesh(
          new THREE.BoxGeometry(isStartMarker ? 0.24 : 0.12, isStartMarker ? 0.55 : 0.25, 0.36),
          isStartMarker ? redTrapMat : goldMat
        );
        tick.position.set(Math.sin(ang) * 2.35, 0.38, Math.cos(ang) * 2.35);
        tick.rotation.y = ang;
        this.clockLoopGroup.add(tick);
      }

      // Central clock hub & spinning hands
      const clockHub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.65, 24), goldMat);
      clockHub.position.y = 0.35;
      this.clockLoopGroup.add(clockHub);

      this.clockMinuteHand = new THREE.Group();
      this.clockMinuteHand.position.y = 0.55;
      const mHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 2.1), goldMat);
      mHandMesh.position.z = 0.95;
      this.clockMinuteHand.add(mHandMesh);
      this.clockLoopGroup.add(this.clockMinuteHand);

      this.clockHourHand = new THREE.Group();
      this.clockHourHand.position.y = 0.64;
      const hHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 1.45), redTrapMat);
      hHandMesh.position.z = 0.62;
      this.clockHourHand.add(hHandMesh);
      this.clockLoopGroup.add(this.clockHourHand);

      // Glowing runner orb circling endlessly on the clock track
      this.loopRunner = this._createCoinMesh(0.36, 0.22, true);
      this.clockLoopGroup.add(this.loopRunner);

      // 16. 3D Silent Thief Draining Opportunities & Dreams ("Âm thầm đánh cắp từng cơ hội, từng ước mơ") (at x = 306, z = 12)
      this.thiefGroup = new THREE.Group();
      this.thiefGroup.position.set(306, 0, 12);
      this.scene.add(this.thiefGroup);

      // Central glass column of opportunities
      const oppTank = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 3.6, 36, 1, true), glassBulbMat);
      oppTank.position.y = 2.0;
      this.thiefGroup.add(oppTank);

      const oppCapTop = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.07, 14, 48), goldMat);
      oppCapTop.rotation.x = Math.PI / 2;
      oppCapTop.position.y = 3.8;
      this.thiefGroup.add(oppCapTop);

      // Crimson siphon rings draining the column
      for (let r = 0; r < 3; r++) {
        const sRing = new THREE.Mesh(new THREE.TorusGeometry(1.75 + r * 0.35, 0.055, 14, 48), redTrapMat);
        sRing.position.y = 1.3 + r * 0.85;
        this.thiefGroup.add(sRing);
        this.thiefRings.push(sRing);
      }

      // Golden opportunity orbs being siphoned downward into red sparks
      for (let i = 0; i < 18; i++) {
        const orb = this._createCoinMesh(0.26, 0.08, true);
        this.thiefGroup.add(orb);
        this.thiefDrops.push({ mesh: orb, index: i, phase: i / 18 });
      }

      // 17. 3D Two Runners Starting From Zero ("Hai người cùng bắt đầu từ con số 0") (at x = 324, z = 12)
      this.twoRunnersGroup = new THREE.Group();
      this.twoRunnersGroup.position.set(324, 0, 12);
      this.scene.add(this.twoRunnersGroup);

      // Glowing "0" Starting Line Gate on the left
      const startLineBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 4.8), goldMat);
      startLineBar.position.set(-3.6, 0.06, 0);
      this.twoRunnersGroup.add(startLineBar);

      const zeroArch = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 16, 40), goldMat);
      zeroArch.position.set(-3.6, 1.4, -1.35);
      zeroArch.rotation.y = Math.PI / 2;
      this.twoRunnersGroup.add(zeroArch);

      // Track 1 (Back/Left z = -1.35): Consistent Action — 14 ascending golden steps reaching far ahead
      for (let i = 0; i < 14; i++) {
        const stepH = 0.18 + i * 0.26;
        const stepBlock = new THREE.Mesh(new THREE.BoxGeometry(0.52, stepH, 1.15), goldMat);
        stepBlock.position.set(-2.9 + i * 0.68, stepH / 2, -1.35);
        this.twoRunnersGroup.add(stepBlock);
      }
      this.actionRunner = this._createCoinMesh(0.4, 0.2, true);
      this.twoRunnersGroup.add(this.actionRunner);

      // Track 2 (Front/Right z = 1.45): Procrastinator still stuck at the starting line waiting for perfection
      const stuckPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.22, 28), redTrapMat);
      stuckPedestal.position.set(-3.4, 0.11, 1.45);
      this.twoRunnersGroup.add(stuckPedestal);

      const stuckRunner = this._createCoinMesh(0.34, 0.16, true);
      stuckRunner.position.set(-3.4, 0.85, 1.45);
      this.twoRunnersGroup.add(stuckRunner);

      for (let r = 0; r < 2; r++) {
        const hRing = new THREE.Mesh(new THREE.TorusGeometry(0.85 + r * 0.28, 0.04, 12, 36), redTrapMat);
        hRing.position.set(-3.4, 0.95, 1.45);
        this.twoRunnersGroup.add(hRing);
        this.hesitationRings.push(hRing);
      }

      // 18. 3D Open Glowing Book & Small Daily Steps ("Đọc một trang sách • Bước đi nhỏ bé") (at x = 342, z = 12)
      this.bookStepsGroup = new THREE.Group();
      this.bookStepsGroup.position.set(342, 0, 12);
      this.scene.add(this.bookStepsGroup);

      // Sculptural open golden book on the left
      const bookStand = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.55, 1.1, 24), goldMat);
      bookStand.position.set(-2.2, 0.55, 0.4);
      this.bookStepsGroup.add(bookStand);

      const leftPage = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.1, 1.65), goldMat);
      leftPage.position.set(-2.78, 1.22, 0.4);
      leftPage.rotation.z = 0.24;
      this.bookStepsGroup.add(leftPage);

      const rightPage = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.1, 1.65), goldMat);
      rightPage.position.set(-1.62, 1.22, 0.4);
      rightPage.rotation.z = -0.24;
      this.bookStepsGroup.add(rightPage);

      // Rising glowing pages / micro-habits ascending into golden stepping stones on the right
      for (let i = 0; i < 9; i++) {
        const pg = this._createCoinMesh(0.32 + i * 0.02, 0.07, true);
        this.bookStepsGroup.add(pg);
        this.bookPages.push({ mesh: pg, index: i, phase: i / 9 });
      }
    }

    /**
     * Build 8 diverse, richly colored, multi-material 3D dioramas for "Buông Bỏ" (Letting Go)
     * Uses distinct color palettes (Sapphire Cyan, Rose Pink, Amethyst Violet, Molten Orange,
     * Obsidian Slate, Emerald Green, Ruby Crimson, Porcelain Ice-Blue) + per-scene colored lighting.
     */
    _buildLettingGoMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25,
        reflectivity: 0.95
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.5,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const magmaOrangeMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xc2410c,
        emissiveIntensity: 0.6,
        roughness: 0.32,
        metalness: 0.45
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const slateStoneMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.75,
        metalness: 0.22
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.28,
        roughness: 0.16,
        metalness: 0.35
      });
      const crimsonThornMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        emissive: 0x9f1239,
        emissiveIntensity: 0.62,
        roughness: 0.24,
        metalness: 0.55
      });
      const burgundyRopeMat = new THREE.MeshStandardMaterial({
        color: 0x881337,
        emissive: 0x4c0519,
        emissiveIntensity: 0.35,
        roughness: 0.5,
        metalness: 0.3
      });
      const bronzeDoorMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        emissive: 0x78350f,
        emissiveIntensity: 0.3,
        roughness: 0.35,
        metalness: 0.78
      });
      const royalBlueMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.75
      });
      const sunriseGoldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8
      });

      const makeColorHalo = (tex, scale = 1.6, opacity = 0.85) => {
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        sp.scale.set(scale, scale, 1);
        return sp;
      };

      // =========================================================================
      // 19. SCENE: chained_heavy_anchors (at x = 360, z = 12)
      // "Càng cố giữ càng mệt mỏi: Mối quan hệ rạn nứt • Công việc đánh mất mình • Giấc mơ quá lâu"
      // Palette: Sapphire Cyan Core + Rose-Pink Broken Heart + Gunmetal Work Cage + Amethyst Mirage
      // =========================================================================
      this.chainedAnchorsGroup = new THREE.Group();
      this.chainedAnchorsGroup.position.set(360, 0, 12);
      this.scene.add(this.chainedAnchorsGroup);

      const light19A = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light19A.position.set(0, 4.2, 2.5);
      this.chainedAnchorsGroup.add(light19A);
      const light19B = new THREE.PointLight(0xf43f5e, 1.6, 14);
      light19B.position.set(-2.8, 2.0, 2.0);
      this.chainedAnchorsGroup.add(light19B);
      const light19C = new THREE.PointLight(0xc084fc, 1.6, 14);
      light19C.position.set(2.8, 2.0, 2.0);
      this.chainedAnchorsGroup.add(light19C);

      // Central levitating Sapphire Soul Octahedron being pulled down
      this.chainedSoulCore = new THREE.Group();
      this.chainedSoulCore.position.set(0, 2.9, 0);
      const soulOcta = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 1), cyanCrystalMat);
      this.chainedSoulCore.add(soulOcta);
      const soulRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 14, 42), porcelainBlueMat);
      this.chainedSoulCore.add(soulRing1);
      const soulRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.03, 14, 42), royalBlueMat);
      soulRing2.rotation.x = Math.PI / 2;
      this.chainedSoulCore.add(soulRing2);
      this.chainedSoulCore.add(makeColorHalo(this.cyanGlowTex, 2.6, 0.9));
      this.chainedAnchorsGroup.add(this.chainedSoulCore);

      // Burden 1 (Left): Fractured Rose-Quartz Heart/Crystal ("Mối quan hệ không còn như trước")
      const burdenHeart = new THREE.Group();
      burdenHeart.position.set(-2.35, 1.05, 0.45);
      const heartLeft = new THREE.Mesh(new THREE.DodecahedronGeometry(0.58, 0), roseQuartzMat);
      heartLeft.position.set(-0.28, 0.1, 0);
      heartLeft.rotation.z = 0.32;
      burdenHeart.add(heartLeft);
      const heartRight = new THREE.Mesh(new THREE.DodecahedronGeometry(0.54, 0), sakuraPinkMat);
      heartRight.position.set(0.32, -0.08, 0.1);
      heartRight.rotation.z = -0.38;
      burdenHeart.add(heartRight);
      burdenHeart.add(makeColorHalo(this.roseGlowTex, 1.9, 0.75));
      this.chainedAnchorsGroup.add(burdenHeart);
      this.chainedBurdens.push({ group: burdenHeart, baseY: 1.05, phase: 0 });

      // Burden 2 (Center-Front): Heavy Gunmetal Work Briefcase/Cage ("Công việc đánh mất chính mình")
      const burdenWork = new THREE.Group();
      burdenWork.position.set(0, 0.85, 1.85);
      const workCube = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.92, 0.65), darkSteelMat);
      burdenWork.add(workCube);
      const workHandle = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.055, 12, 24, Math.PI), darkSteelMat);
      workHandle.position.y = 0.46;
      burdenWork.add(workHandle);
      const trappedSpark = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), cyanCrystalMat);
      trappedSpark.position.z = 0.36;
      burdenWork.add(trappedSpark);
      this.chainedAnchorsGroup.add(burdenWork);
      this.chainedBurdens.push({ group: burdenWork, baseY: 0.85, phase: 2.1 });

      // Burden 3 (Right): Faded Amethyst Dream Crescent ("Giấc mơ theo đuổi quá lâu")
      const burdenDream = new THREE.Group();
      burdenDream.position.set(2.35, 1.15, 0.45);
      const dreamCrescent = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.16, 16, 36, Math.PI * 1.45), amethystMat);
      dreamCrescent.rotation.z = 0.6;
      burdenDream.add(dreamCrescent);
      const dreamStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), amethystMat);
      dreamStar.position.set(0.15, 0.1, 0);
      burdenDream.add(dreamStar);
      burdenDream.add(makeColorHalo(this.violetGlowTex, 2.0, 0.8));
      this.chainedAnchorsGroup.add(burdenDream);
      this.chainedBurdens.push({ group: burdenDream, baseY: 1.15, phase: 4.2 });

      // Interlocking chains connecting the 3 burdens to the central soul crystal
      const anchorTargets = [
        new THREE.Vector3(-2.35, 1.15, 0.45),
        new THREE.Vector3(0, 0.95, 1.85),
        new THREE.Vector3(2.35, 1.25, 0.45)
      ];
      anchorTargets.forEach((target) => {
        const start = new THREE.Vector3(0, 2.75, 0);
        for (let step = 1; step <= 6; step++) {
          const t = step / 7;
          const pos = new THREE.Vector3().lerpVectors(start, target, t);
          const link = new THREE.Mesh(
            new THREE.TorusGeometry(0.16, 0.042, 10, 22),
            step % 2 === 0 ? darkSteelMat : crimsonThornMat
          );
          link.position.copy(pos);
          link.rotation.set(step * 0.8, t * 2.0, step * 1.2);
          this.chainedAnchorsGroup.add(link);
        }
      });

      // =========================================================================
      // 20. SCENE: endless_sisyphus_wall (at x = 378, z = 12)
      // "Kiên trì mù quáng húc vào bức tường đá vs Dũng khí buông bỏ để bay lên lối Ngọc Lục Bảo"
      // Palette: Molten Orange Boulder & Obsidian Cracked Wall vs Emerald-Cyan Ascending Sanctuary
      // =========================================================================
      this.sisyphusWallGroup = new THREE.Group();
      this.sisyphusWallGroup.position.set(378, 0, 12);
      this.scene.add(this.sisyphusWallGroup);

      const light20A = new THREE.PointLight(0xf97316, 2.1, 18);
      light20A.position.set(-1.5, 3.5, 2.5);
      this.sisyphusWallGroup.add(light20A);
      const light20B = new THREE.PointLight(0x10b981, 2.2, 18);
      light20B.position.set(2.5, 4.0, 2.5);
      this.sisyphusWallGroup.add(light20B);

      // Steep dark ramp on the left leading into an impenetrable obsidian wall
      const rampMesh = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.28, 1.8), darkSteelMat);
      rampMesh.position.set(-2.2, 1.15, 0);
      rampMesh.rotation.z = 0.42;
      this.sisyphusWallGroup.add(rampMesh);

      // Impenetrable Monolith Wall with glowing magma fissures at x = -0.2
      const monolithWall = new THREE.Mesh(new THREE.BoxGeometry(0.85, 4.8, 2.9), slateStoneMat);
      monolithWall.position.set(-0.2, 2.4, 0);
      this.sisyphusWallGroup.add(monolithWall);

      for (let c = 0; c < 4; c++) {
        const crackBar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 1.8 - c * 0.25), magmaOrangeMat);
        crackBar.position.set(-0.2, 1.2 + c * 0.85, (c % 2 === 0 ? 0.2 : -0.2));
        crackBar.rotation.x = (c - 1.5) * 0.25;
        this.sisyphusWallGroup.add(crackBar);
      }

      // Molten Amber-Orange Boulder straining against the wall
      this.sisyphusBoulder = new THREE.Group();
      const boulderMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.74, 1), magmaOrangeMat);
      this.sisyphusBoulder.add(boulderMesh);
      const boulderCage = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.05, 12, 32), darkSteelMat);
      this.sisyphusBoulder.add(boulderCage);
      this.sisyphusBoulder.add(makeColorHalo(this.redGlowTex, 2.2, 0.85));
      this.sisyphusWallGroup.add(this.sisyphusBoulder);

      // Right side: Ascending Emerald & Cyan Floating Sanctuary Steps ("Dũng khí buông bỏ")
      for (let s = 0; s < 7; s++) {
        const ang = s * 0.42;
        const stepPad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.58 - s * 0.03, 0.45 - s * 0.03, 0.16, 6),
          s % 2 === 0 ? emeraldMat : cyanCrystalMat
        );
        stepPad.position.set(0.85 + s * 0.58, 0.65 + s * 0.52, Math.sin(ang) * 1.1);
        this.sisyphusWallGroup.add(stepPad);
      }

      this.sisyphusFreeOrb = new THREE.Group();
      const freeCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 1), emeraldMat);
      this.sisyphusFreeOrb.add(freeCore);
      const freeRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 12, 36), cyanCrystalMat);
      this.sisyphusFreeOrb.add(freeRing);
      this.sisyphusFreeOrb.add(makeColorHalo(this.emeraldGlowTex, 2.1, 0.9));
      this.sisyphusWallGroup.add(this.sisyphusFreeOrb);

      // =========================================================================
      // 21. SCENE: thorny_crimson_rope (at x = 396, z = 12)
      // "Nắm chặt sợi dây đầy gai: Càng cố giữ, bàn tay càng đau"
      // Palette: Deep Burgundy-Crimson Rope + Ruby Conical Thorns + Porcelain-Blue Grip Clamps
      // =========================================================================
      this.thornyRopeGroup = new THREE.Group();
      this.thornyRopeGroup.position.set(396, 0, 12);
      this.scene.add(this.thornyRopeGroup);

      const light21A = new THREE.PointLight(0xf43f5e, 2.4, 18);
      light21A.position.set(0, 3.2, 2.8);
      this.thornyRopeGroup.add(light21A);
      const light21B = new THREE.PointLight(0x38bdf8, 1.8, 16);
      light21B.position.set(0, 4.0, -2.0);
      this.thornyRopeGroup.add(light21B);

      // Braided multi-strand crimson rope stretched horizontally across x = -3.8..3.8 at y = 2.2
      for (let strand = 0; strand < 3; strand++) {
        const pts = [];
        for (let i = 0; i <= 48; i++) {
          const u = i / 48;
          const rx = -3.8 + u * 7.6;
          const twist = u * Math.PI * 10 + (strand * Math.PI * 2) / 3;
          const ry = 2.2 + Math.sin(twist) * 0.14;
          const rz = Math.cos(twist) * 0.14;
          pts.push(new THREE.Vector3(rx, ry, rz));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const strandGeo = new THREE.TubeGeometry(curve, 64, 0.11, 12, false);
        const strandMesh = new THREE.Mesh(
          strandGeo,
          strand === 0 ? crimsonThornMat : burgundyRopeMat
        );
        this.thornyRopeGroup.add(strandMesh);
      }

      // 44 Sharp 3D Ruby Conical Thorns protruding along the rope
      for (let t = 0; t < 44; t++) {
        const tx = -3.4 + (t / 43) * 6.8;
        const tAng = t * 1.65;
        const thorn = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.46, 8), crimsonThornMat);
        const dirY = Math.sin(tAng);
        const dirZ = Math.cos(tAng);
        thorn.position.set(tx, 2.2 + dirY * 0.28, dirZ * 0.28);
        thorn.rotation.x = Math.atan2(dirZ, dirY);
        this.thornyRopeGroup.add(thorn);
      }

      // 5 Sculpted Porcelain-Ice-Blue Finger Clamps gripping the center of the thorny rope
      for (let f = 0; f < 5; f++) {
        const fx = -0.92 + f * 0.46;
        const fingerGroup = new THREE.Group();
        fingerGroup.position.set(fx, 2.2, 0);

        // Upper & lower articulated porcelain-blue grip arcs
        const upperPhalanx = new THREE.Mesh(
          new THREE.TorusGeometry(0.46, 0.085, 16, 32, Math.PI * 1.25),
          porcelainBlueMat
        );
        upperPhalanx.rotation.y = Math.PI / 2;
        upperPhalanx.rotation.z = f % 2 === 0 ? 0.2 : -0.2;
        fingerGroup.add(upperPhalanx);

        const jointRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.52, 0.035, 12, 28),
          cyanCrystalMat
        );
        jointRing.rotation.y = Math.PI / 2;
        fingerGroup.add(jointRing);

        this.thornyRopeGroup.add(fingerGroup);
        this.thornyGripRings.push({ group: fingerGroup, index: f });
      }

      // Pulsing Crimson-Magenta Pain Shockwave Rings around the grip
      for (let w = 0; w < 3; w++) {
        const waveRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.65 + w * 0.35, 0.035, 14, 48),
           roseQuartzMat
        );
        waveRing.position.set(0, 2.2, 0);
        waveRing.rotation.y = Math.PI / 2;
        this.thornyRopeGroup.add(waveRing);
        this.thornyPainWaves.push(waveRing);
      }

      // Falling ruby pain droplets underneath the grip
      for (let d = 0; d < 12; d++) {
        const drop = new THREE.Group();
        const dropMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), crimsonThornMat);
        drop.add(dropMesh);
        drop.add(makeColorHalo(this.roseGlowTex, 0.75, 0.85));
        this.thornyRopeGroup.add(drop);
        this.thornyBloodDrops.push({
          group: drop,
          baseX: -0.9 + (d % 5) * 0.45,
          phase: d / 12
        });
      }

      // =========================================================================
      // 22. SCENE: bloom_to_stone_burden (at x = 414, z = 12)
      // "Từng khiến bạn hạnh phúc (Hoa Sen Hồng Sakura), nay hóa thành gánh nặng đá xám"
      // Palette: Sakura Pink & Warm Coral Lotus -> Frost Cyan Bridge -> Heavy Slate Stone Blocks
      // =========================================================================
      this.bloomStoneGroup = new THREE.Group();
      this.bloomStoneGroup.position.set(414, 0, 12);
      this.scene.add(this.bloomStoneGroup);

      const light22A = new THREE.PointLight(0xf472b6, 2.2, 16);
      light22A.position.set(-2.2, 3.6, 2.5);
      this.bloomStoneGroup.add(light22A);
      const light22B = new THREE.PointLight(0x38bdf8, 2.0, 16);
      light22B.position.set(2.2, 3.6, 2.5);
      this.bloomStoneGroup.add(light22B);

      // Left pedestal: Blooming Sakura-Pink 3D Lotus ("Từng khiến bạn hạnh phúc")
      const lotusPedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.45, 32), porcelainBlueMat);
      lotusPedestal.position.set(-2.2, 0.225, 0);
      this.bloomStoneGroup.add(lotusPedestal);

      this.bloomLotusGroup = new THREE.Group();
      this.bloomLotusGroup.position.set(-2.2, 1.45, 0);
      const lotusCore = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), sunriseGoldMat);
      this.bloomLotusGroup.add(lotusCore);
      this.bloomLotusGroup.add(makeColorHalo(this.roseGlowTex, 2.5, 0.85));

      for (let layer = 0; layer < 2; layer++) {
        const count = layer === 0 ? 8 : 10;
        for (let p = 0; p < count; p++) {
          const ang = (p / count) * Math.PI * 2 + layer * 0.3;
          const petal = new THREE.Mesh(
            new THREE.ConeGeometry(0.26, 0.85, 6),
            layer === 0 ? sakuraPinkMat : roseQuartzMat
          );
          const rad = 0.42 + layer * 0.28;
          petal.position.set(Math.cos(ang) * rad, 0.15 - layer * 0.1, Math.sin(ang) * rad);
          petal.rotation.z = -Math.cos(ang) * (0.65 + layer * 0.35);
          petal.rotation.x = Math.sin(ang) * (0.65 + layer * 0.35);
          this.bloomLotusGroup.add(petal);
        }
      }
      this.bloomStoneGroup.add(this.bloomLotusGroup);

      // Right platform: Weighed down by heavy dark slate stone boulders ("Trở thành gánh nặng")
      const stonePlatform = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.6, 0.35, 8), darkSteelMat);
      stonePlatform.position.set(2.1, 0.18, 0);
      this.bloomStoneGroup.add(stonePlatform);

      const stoneCoords = [
        [1.7, 0.72, -0.2, 0.56],
        [2.45, 0.68, 0.25, 0.52],
        [2.05, 0.75, 0.45, 0.48],
        [2.1, 1.32, 0.05, 0.58],
        [1.85, 1.78, -0.1, 0.42]
      ];
      stoneCoords.forEach(([sx, sy, sz, sr]) => {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(sr, 0), slateStoneMat);
        rock.position.set(sx, sy, sz);
        rock.rotation.set(sx, sy, sz);
        this.bloomStoneGroup.add(rock);
      });

      // Rotating Ice-Blue Rings of Courage & Acceptance around the stone burden
      for (let r = 0; r < 2; r++) {
        const accRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.55 + r * 0.32, 0.045, 14, 48),
          cyanCrystalMat
        );
        accRing.position.set(2.1, 1.25, 0);
        this.bloomStoneGroup.add(accRing);
        this.acceptanceRings.push(accRing);
      }

      // Morphing stream between left lotus and right stone pile
      for (let m = 0; m < 10; m++) {
        const isStone = m >= 5;
        const mMesh = new THREE.Mesh(
          isStone ? new THREE.DodecahedronGeometry(0.22, 0) : new THREE.OctahedronGeometry(0.2, 0),
          isStone ? slateStoneMat : sakuraPinkMat
        );
        this.bloomStoneGroup.add(mMesh);
        this.morphingPetals.push({ mesh: mMesh, index: m, phase: m / 10 });
      }

      // =========================================================================
      // 23. SCENE: shattered_cage_butterflies (at x = 432, z = 12)
      // "Buông bỏ không phải yếu đuối • Tự giải thoát mình khỏi những điều không còn phù hợp"
      // Palette: Emerald-Gold Foundation + Shattering Steel Cage + Flock of Cyan/Violet/Pink 3D Butterflies
      // =========================================================================
      this.butterflyCageGroup = new THREE.Group();
      this.butterflyCageGroup.position.set(432, 0, 12);
      this.scene.add(this.butterflyCageGroup);

      const light23A = new THREE.PointLight(0x22d3ee, 2.3, 18);
      light23A.position.set(0, 4.2, 2.5);
      this.butterflyCageGroup.add(light23A);
      const light23B = new THREE.PointLight(0xc084fc, 2.0, 18);
      light23B.position.set(1.8, 3.5, -1.5);
      this.butterflyCageGroup.add(light23B);

      // Illuminated Emerald & Gold Foundation Pedestal ("Những cố gắng trước đây không vô nghĩa")
      const baseStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.1, 0.28, 32), emeraldMat);
      baseStep1.position.y = 0.14;
      this.butterflyCageGroup.add(baseStep1);
      const baseStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.65, 0.26, 32), sunriseGoldMat);
      baseStep2.position.y = 0.41;
      this.butterflyCageGroup.add(baseStep2);

      // Lower cage bars + shattering upper bars drifting outward
      for (let b = 0; b < 12; b++) {
        const ang = (b / 12) * Math.PI * 2;
        const bx = Math.cos(ang) * 1.32;
        const bz = Math.sin(ang) * 1.32;
        const lowerBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.35, 10), darkSteelMat);
        lowerBar.position.set(bx, 1.2, bz);
        this.butterflyCageGroup.add(lowerBar);

        const shardBar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.85, 0.09), darkSteelMat);
        this.butterflyCageGroup.add(shardBar);
        this.shatteredBars.push({
          mesh: shardBar,
          baseX: bx,
          baseY: 2.35,
          baseZ: bz,
          ang,
          index: b
        });
      }

      // 14 Animated 3D Geometric Butterflies in Cyan, Amethyst Violet, Emerald, and Sakura Pink
      const wingMats = [cyanCrystalMat, amethystMat, emeraldMat, sakuraPinkMat];
      for (let i = 0; i < 14; i++) {
        const bfly = new THREE.Group();
        const wMat = wingMats[i % wingMats.length];
        const haloTex = [this.cyanGlowTex, this.violetGlowTex, this.emeraldGlowTex, this.roseGlowTex][i % 4];

        const leftWingPivot = new THREE.Group();
        const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 3), wMat);
        leftWing.rotation.z = Math.PI / 2;
        leftWing.position.x = -0.18;
        leftWingPivot.add(leftWing);
        bfly.add(leftWingPivot);

        const rightWingPivot = new THREE.Group();
        const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 3), wMat);
        rightWing.rotation.z = -Math.PI / 2;
        rightWing.position.x = 0.18;
        rightWingPivot.add(rightWing);
        bfly.add(rightWingPivot);

        bfly.add(makeColorHalo(haloTex, 1.15, 0.8));
        this.butterflyCageGroup.add(bfly);
        this.butterflies.push({
          group: bfly,
          leftWing: leftWingPivot,
          rightWing: rightWingPivot,
          index: i,
          phase: i / 14
        });
      }

      // =========================================================================
      // 24. SCENE: closing_door_emerald_portal (at x = 450, z = 12)
      // "Cánh cửa cũ khép lại (Đồng Nâu) để mở ra hành trình mới rực rỡ (Cổng Ngọc Lục Bảo & Lam Ngọc)"
      // Palette: Warm Bronze Closing Door vs Lush Emerald & Sky-Cyan Open Portal + Crystal Trees
      // =========================================================================
      this.emeraldPortalGroup = new THREE.Group();
      this.emeraldPortalGroup.position.set(450, 0, 12);
      this.scene.add(this.emeraldPortalGroup);

      const light24A = new THREE.PointLight(0x10b981, 2.5, 20);
      light24A.position.set(1.8, 3.8, 2.5);
      this.emeraldPortalGroup.add(light24A);
      const light24B = new THREE.PointLight(0x38bdf8, 2.0, 18);
      light24B.position.set(3.2, 3.0, -2.0);
      this.emeraldPortalGroup.add(light24B);

      // Left: Old Bronze Door Frame & Closing Door Panel at x = -2.3
      const oldFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.2, 0.22), bronzeDoorMat);
      oldFrameL.position.set(-3.05, 1.6, 0.3);
      this.emeraldPortalGroup.add(oldFrameL);
      const oldFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.2, 0.22), bronzeDoorMat);
      oldFrameR.position.set(-1.55, 1.6, 0.3);
      this.emeraldPortalGroup.add(oldFrameR);
      const oldFrameTop = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.24, 0.26), bronzeDoorMat);
      oldFrameTop.position.set(-2.3, 3.2, 0.3);
      this.emeraldPortalGroup.add(oldFrameTop);

      this.closingBronzeDoor = new THREE.Group();
      this.closingBronzeDoor.position.set(-3.0, 1.6, 0.3);
      const oldDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.0, 0.12), bronzeDoorMat);
      oldDoorPanel.position.x = 0.7;
      this.closingBronzeDoor.add(oldDoorPanel);
      this.emeraldPortalGroup.add(this.closingBronzeDoor);

      // Right: Grand Luminous Emerald & Sky-Cyan Archway Portal at x = 1.35
      const portalArch = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.12, 18, 48, Math.PI), emeraldMat);
      portalArch.position.set(1.35, 1.8, 0.2);
      this.emeraldPortalGroup.add(portalArch);

      const portalPillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.85, 16), emeraldMat);
      portalPillarL.position.set(1.35 - 1.85, 0.92, 0.2);
      this.emeraldPortalGroup.add(portalPillarL);
      const portalPillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.85, 16), emeraldMat);
      portalPillarR.position.set(1.35 + 1.85, 0.92, 0.2);
      this.emeraldPortalGroup.add(portalPillarR);

      // Double translucent cyan-emerald portal doors swinging wide open
      const glassEmeraldMat = this._createGlassMaterial(0.36, 0x34d399);
      this.openingEmeraldDoorL = new THREE.Group();
      this.openingEmeraldDoorL.position.set(1.35 - 1.75, 1.5, 0.2);
      const doorLeafL = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.8, 0.08), glassEmeraldMat);
      doorLeafL.position.x = 0.82;
      this.openingEmeraldDoorL.add(doorLeafL);
      this.emeraldPortalGroup.add(this.openingEmeraldDoorL);

      this.openingEmeraldDoorR = new THREE.Group();
      this.openingEmeraldDoorR.position.set(1.35 + 1.75, 1.5, 0.2);
      const doorLeafR = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.8, 0.08), glassEmeraldMat);
      doorLeafR.position.x = -0.82;
      this.openingEmeraldDoorR.add(doorLeafR);
      this.emeraldPortalGroup.add(this.openingEmeraldDoorR);

      // Ascending Emerald & Sky-Cyan Path with Crystal Trees behind the open portal
      for (let s = 0; s < 8; s++) {
        const stepStone = new THREE.Mesh(
          new THREE.BoxGeometry(1.35 - s * 0.06, 0.16, 0.62),
          s % 2 === 0 ? emeraldMat : cyanCrystalMat
        );
        stepStone.position.set(1.35 + s * 0.28, 0.15 + s * 0.34, -0.3 - s * 0.78);
        this.emeraldPortalGroup.add(stepStone);

        if (s % 2 === 1) {
          const treeSide = s % 4 === 1 ? -1.25 : 1.25;
          const crystalTree = new THREE.Group();
          crystalTree.position.set(1.35 + s * 0.28 + treeSide, 0.25 + s * 0.34, -0.3 - s * 0.78);
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.65, 8), sunriseGoldMat);
          trunk.position.y = 0.32;
          crystalTree.add(trunk);
          const crown = new THREE.Mesh(
            new THREE.ConeGeometry(0.38, 0.95, 6),
            s === 1 || s === 5 ? emeraldMat : cyanCrystalMat
          );
          crown.position.y = 0.95;
          crystalTree.add(crown);
          crystalTree.add(makeColorHalo(s === 1 || s === 5 ? this.emeraldGlowTex : this.cyanGlowTex, 1.4, 0.75));
          this.emeraldPortalGroup.add(crystalTree);
        }
      }

      this.portalTraveler = new THREE.Group();
      const travSphere = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 1), porcelainBlueMat);
      this.portalTraveler.add(travSphere);
      this.portalTraveler.add(makeColorHalo(this.cyanGlowTex, 1.8, 0.9));
      this.emeraldPortalGroup.add(this.portalTraveler);

      // =========================================================================
      // 25. SCENE: crossroads_compass_maturity (at x = 468, z = 12)
      // "Kiên trì là bản lĩnh khi đi đúng hướng • Biết dừng lại đúng lúc là trưởng thành"
      // Palette: Royal Sapphire Blue + Neon Teal + Sunrise Gold Celestial Compass + Red Precipice Shield
      // =========================================================================
      this.compassCrossroadsGroup = new THREE.Group();
      this.compassCrossroadsGroup.position.set(468, 0, 12);
      this.scene.add(this.compassCrossroadsGroup);

      const light25A = new THREE.PointLight(0x3b82f6, 2.3, 18);
      light25A.position.set(-1.5, 4.0, 2.5);
      this.compassCrossroadsGroup.add(light25A);
      const light25B = new THREE.PointLight(0xfbbf24, 2.0, 18);
      light25B.position.set(1.5, 4.0, 2.5);
      this.compassCrossroadsGroup.add(light25B);

      // Multi-ring 3D Celestial Compass in the center
      const compassBase = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 0.26, 36), royalBlueMat);
      compassBase.position.set(0, 0.13, 0.8);
      this.compassCrossroadsGroup.add(compassBase);

      const cRingMats = [royalBlueMat, emeraldMat, sunriseGoldMat];
      for (let r = 0; r < 3; r++) {
        const cRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.35 - r * 0.25, 0.055, 16, 48),
          cRingMats[r]
        );
        cRing.position.set(0, 1.75, 0.8);
        this.compassCrossroadsGroup.add(cRing);
        this.compassRings.push(cRing);
      }

      this.compassNeedle = new THREE.Group();
      this.compassNeedle.position.set(0, 1.75, 0.8);
      const needleNorth = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.95, 8), cyanCrystalMat);
      needleNorth.position.y = 0.48;
      this.compassNeedle.add(needleNorth);
      const needleSouth = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.95, 8), roseQuartzMat);
      needleSouth.rotation.z = Math.PI;
      needleSouth.position.y = -0.48;
      this.compassNeedle.add(needleSouth);
      this.compassNeedle.add(makeColorHalo(this.cyanGlowTex, 2.1, 0.85));
      this.compassCrossroadsGroup.add(this.compassNeedle);

      // Right branch: Red danger cliff halted by a luminous Cyan Brake Shield ("Biết dừng lại đúng lúc")
      for (let i = 0; i < 4; i++) {
        const redStep = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.8), crimsonThornMat);
        redStep.position.set(1.4 + i * 0.65, 0.45 - i * 0.06, 0.8);
        this.compassCrossroadsGroup.add(redStep);
      }
      const stopShield = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.1, 6), cyanCrystalMat);
      stopShield.rotation.z = Math.PI / 2;
      stopShield.position.set(3.45, 0.95, 0.8);
      this.compassCrossroadsGroup.add(stopShield);

      // Left branch: Ascending Royal-Blue & Gold Bridge ("Kiên trì khi đi đúng hướng")
      for (let i = 0; i < 7; i++) {
        const rightWayStep = new THREE.Mesh(
          new THREE.BoxGeometry(0.72, 0.16, 0.95),
          i % 2 === 0 ? royalBlueMat : sunriseGoldMat
        );
        rightWayStep.position.set(-1.35 - i * 0.62, 0.55 + i * 0.36, 0.4 - i * 0.35);
        this.compassCrossroadsGroup.add(rightWayStep);
      }

      // =========================================================================
      // 26. SCENE: open_hands_new_dawn (at x = 486, z = 12)
      // "Đôi tay buông bỏ điều đã cũ để đón nhận điều tốt đẹp đang chờ phía trước"
      // Palette: Pearl-Cyan Sculpted Open Hands + Multi-Colored Dawn Lotus (Pink/Gold/Cyan/Emerald/Violet)
      // =========================================================================
      this.openHandsDawnGroup = new THREE.Group();
      this.openHandsDawnGroup.position.set(486, 0, 12);
      this.scene.add(this.openHandsDawnGroup);

      const light26A = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light26A.position.set(-2.0, 3.8, 2.5);
      this.openHandsDawnGroup.add(light26A);
      const light26B = new THREE.PointLight(0xf472b6, 2.2, 18);
      light26B.position.set(2.0, 3.8, 2.5);
      this.openHandsDawnGroup.add(light26B);
      const light26C = new THREE.PointLight(0xfbbf24, 2.0, 18);
      light26C.position.set(0, 4.5, 1.5);
      this.openHandsDawnGroup.add(light26C);

      // Build Left & Right Sculpted Open Palms (cupping upward and opening outward)
      const buildSculptedHand = (isLeft) => {
        const dir = isLeft ? -1 : 1;
        const handGroup = new THREE.Group();
        handGroup.position.set(dir * 0.95, 1.45, 0.2);

        const palm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.18, 1.05), porcelainBlueMat);
        palm.rotation.z = dir * 0.22;
        handGroup.add(palm);

        const wristCuff = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 12, 28), cyanCrystalMat);
        wristCuff.position.set(-dir * 0.48, -0.22, 0.25);
        wristCuff.rotation.y = Math.PI / 2;
        handGroup.add(wristCuff);

        // 5 splayed sculpted fingers opening gently
        for (let f = 0; f < 5; f++) {
          const fZ = -0.42 + f * 0.21;
          const fLen = f === 2 ? 0.85 : f === 1 || f === 3 ? 0.76 : 0.62;
          const finger = new THREE.Mesh(
            new THREE.CylinderGeometry(0.065, 0.085, fLen, 12),
            porcelainBlueMat
          );
          finger.position.set(dir * (0.68 + fLen * 0.35), 0.15, fZ);
          finger.rotation.z = dir * 1.18;
          finger.rotation.y = (f - 2) * 0.12 * dir;
          handGroup.add(finger);
        }
        return handGroup;
      };

      this.openHandL = buildSculptedHand(true);
      this.openHandR = buildSculptedHand(false);
      this.openHandsDawnGroup.add(this.openHandL);
      this.openHandsDawnGroup.add(this.openHandR);

      // Dry gray-amber shards/leaves falling away underneath the open hands ("Buông những điều đã cũ")
      for (let s = 0; s < 10; s++) {
        const oldShard = new THREE.Mesh(
          new THREE.ConeGeometry(0.16, 0.32, 4),
          s % 2 === 0 ? slateStoneMat : bronzeDoorMat
        );
        this.openHandsDawnGroup.add(oldShard);
        this.fallingOldShards.push({
          mesh: oldShard,
          baseX: -1.3 + (s % 5) * 0.65,
          baseZ: (s % 2 === 0 ? 0.25 : -0.25),
          phase: s / 10
        });
      }

      // Multi-Colored Blooming Dawn Lotus & Starlight Sphere descending into the open palms
      this.dawnLotus = new THREE.Group();
      this.dawnLotus.position.set(0, 2.75, 0.15);

      const dawnCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 2), sunriseGoldMat);
      this.dawnLotus.add(dawnCore);
      this.dawnLotus.add(makeColorHalo(this.glowTex, 2.8, 0.9));

      const petalPalette = [sakuraPinkMat, cyanCrystalMat, emeraldMat, amethystMat, sunriseGoldMat];
      for (let ring = 0; ring < 3; ring++) {
        const pCount = 8 + ring * 2;
        for (let p = 0; p < pCount; p++) {
          const ang = (p / pCount) * Math.PI * 2 + ring * 0.25;
          const pMat = petalPalette[(p + ring) % petalPalette.length];
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.78, 6), pMat);
          const rad = 0.45 + ring * 0.28;
          petal.position.set(Math.cos(ang) * rad, 0.1 - ring * 0.08, Math.sin(ang) * rad);
          petal.rotation.z = -Math.cos(ang) * (0.62 + ring * 0.28);
          petal.rotation.x = Math.sin(ang) * (0.62 + ring * 0.28);
          this.dawnLotus.add(petal);
        }
      }
      this.openHandsDawnGroup.add(this.dawnLotus);

      // Orbiting multi-colored blessing orbs around the Dawn Lotus
      const orbTexList = [this.cyanGlowTex, this.roseGlowTex, this.emeraldGlowTex, this.violetGlowTex, this.glowTex];
      for (let o = 0; o < 10; o++) {
        const orbGroup = new THREE.Group();
        const orbMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.14, 1),
          petalPalette[o % petalPalette.length]
        );
        orbGroup.add(orbMesh);
        orbGroup.add(makeColorHalo(orbTexList[o % orbTexList.length], 0.95, 0.85));
        this.openHandsDawnGroup.add(orbGroup);
        this.dawnOrbitOrbs.push({ group: orbGroup, index: o, phase: o / 10 });
      }
    }

    /**
     * Build 8 diverse, richly colored, multi-material 3D dioramas for "Sức Mạnh Của Sự Im Lặng"
     */
    _buildPowerOfSilenceMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25,
        reflectivity: 0.95
      });
      const deepOceanMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.45,
        roughness: 0.14,
        metalness: 0.3
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const magmaOrangeMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xc2410c,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.45
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });
      const royalBlueMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.75
      });
      const sunriseGoldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8
      });

      const makeColorHalo = (tex, scale = 1.6, opacity = 0.85) => {
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        sp.scale.set(scale, scale, 1);
        return sp;
      };

      // =========================================================================
      // 27. SCENE: noisy_echo_arrows (at x = 504, z = 12)
      // "Mệt mỏi vì giải thích, thanh minh, đánh giá, coi thường"
      // Palette: Porcelain-Cyan Core surrounded by Crimson, Orange & Violet Megaphones/Judgment Arrows
      // =========================================================================
      this.noisyEchoGroup = new THREE.Group();
      this.noisyEchoGroup.position.set(504, 0, 12);
      this.scene.add(this.noisyEchoGroup);

      const light27A = new THREE.PointLight(0xf43f5e, 2.2, 18);
      light27A.position.set(-2.2, 3.8, 2.5);
      this.noisyEchoGroup.add(light27A);
      const light27B = new THREE.PointLight(0x38bdf8, 2.0, 16);
      light27B.position.set(0, 3.0, 2.0);
      this.noisyEchoGroup.add(light27B);
      const light27C = new THREE.PointLight(0xc084fc, 2.0, 18);
      light27C.position.set(2.2, 3.8, 2.5);
      this.noisyEchoGroup.add(light27C);

      // Central exhausted Porcelain-Cyan Soul Core trying to explain itself
      this.noisyCore = new THREE.Group();
      this.noisyCore.position.set(0, 2.2, 0);
      const coreSphere = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 2), porcelainBlueMat);
      this.noisyCore.add(coreSphere);
      const coreShield = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.04, 14, 42), cyanCrystalMat);
      this.noisyCore.add(coreShield);
      this.noisyCore.add(makeColorHalo(this.cyanGlowTex, 2.3, 0.85));
      this.noisyEchoGroup.add(this.noisyCore);

      // Chaotic soundwave rings clashing around the core
      const ringColors = [roseQuartzMat, magmaOrangeMat, amethystMat];
      for (let r = 0; r < 3; r++) {
        const sRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.35 + r * 0.38, 0.045, 14, 48),
          ringColors[r]
        );
        sRing.position.set(0, 2.2, 0);
        this.noisyEchoGroup.add(sRing);
        this.noisySoundRings.push(sRing);
      }

      // 12 Orbiting Megaphone Cones & Sharp Judgment Arrows pointing inward at the core
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const arrowGroup = new THREE.Group();
        const aMat = ringColors[i % 3];
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.68, 6), aMat);
        cone.rotation.z = Math.PI / 2;
        arrowGroup.add(cone);
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 0.45, 6), darkSteelMat);
        tail.rotation.z = Math.PI / 2;
        tail.position.x = 0.45;
        arrowGroup.add(tail);
        this.noisyEchoGroup.add(arrowGroup);
        this.noisyArrows.push({
          group: arrowGroup,
          baseAng: ang,
          baseY: 1.55 + (i % 3) * 0.65,
          index: i
        });
      }

      // =========================================================================
      // 28. SCENE: chessboard_peace_crown (at x = 522, z = 12)
      // "Không phải cuộc tranh luận nào cũng cần người thắng • Không phải ai cũng cần hiểu câu chuyện của bạn"
      // Palette: Obsidian & Crimson-Orange Battle Chessboard vs Sapphire-Amethyst Private Story Sanctuary
      // =========================================================================
      this.chessPeaceGroup = new THREE.Group();
      this.chessPeaceGroup.position.set(522, 0, 12);
      this.scene.add(this.chessPeaceGroup);

      const light28A = new THREE.PointLight(0xf97316, 2.0, 16);
      light28A.position.set(-2.2, 3.5, 2.5);
      this.chessPeaceGroup.add(light28A);
      const light28B = new THREE.PointLight(0x38bdf8, 2.4, 18);
      light28B.position.set(2.0, 3.8, 2.5);
      this.chessPeaceGroup.add(light28B);

      // Left: Tilted 3D Chessboard Arena of Endless Arguments at x = -1.9
      const boardGroup = new THREE.Group();
      boardGroup.position.set(-1.95, 1.05, 0.2);
      boardGroup.rotation.z = -0.15;
      boardGroup.rotation.x = 0.18;

      for (let gx = -2; gx <= 1; gx++) {
        for (let gz = -2; gz <= 1; gz++) {
          const tile = new THREE.Mesh(
            new THREE.BoxGeometry(0.58, 0.12, 0.58),
            (gx + gz) % 2 === 0 ? darkSteelMat : roseQuartzMat
          );
          tile.position.set((gx + 0.5) * 0.6, 0, (gz + 0.5) * 0.6);
          boardGroup.add(tile);
        }
      }

      // Two clashing red & orange battle pieces leaning into each other
      const pieceA = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.05, 8), roseQuartzMat);
      pieceA.position.set(-0.45, 0.58, 0);
      pieceA.rotation.z = -0.35;
      boardGroup.add(pieceA);

      const pieceB = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.05, 8), magmaOrangeMat);
      pieceB.position.set(0.45, 0.58, 0);
      pieceB.rotation.z = 0.35;
      boardGroup.add(pieceB);

      this.chessPeaceGroup.add(boardGroup);

      for (let s = 0; s < 6; s++) {
        const spMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), magmaOrangeMat);
        this.chessPeaceGroup.add(spMesh);
        this.chessClashSparks.push({ mesh: spMesh, index: s, phase: s / 6 });
      }

      // Right: Elevated Sapphire & Amethyst Sanctuary holding your Private Crystal Story Book
      const peacePedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.45, 0.42, 32), royalBlueMat);
      peacePedestal.position.set(2.05, 0.21, -0.1);
      this.chessPeaceGroup.add(peacePedestal);

      this.peaceStoryBook = new THREE.Group();
      this.peaceStoryBook.position.set(2.05, 1.85, -0.1);
      const bookCoverL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.32, 0.14), amethystMat);
      bookCoverL.position.x = -0.12;
      bookCoverL.rotation.y = 0.25;
      this.peaceStoryBook.add(bookCoverL);
      const bookCoverR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.32, 0.14), cyanCrystalMat);
      bookCoverR.position.x = 0.12;
      bookCoverR.rotation.y = -0.25;
      this.peaceStoryBook.add(bookCoverR);
      const crownRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.045, 14, 42), sunriseGoldMat);
      this.peaceStoryBook.add(crownRing);
      this.peaceStoryBook.add(makeColorHalo(this.cyanGlowTex, 2.5, 0.88));
      this.chessPeaceGroup.add(this.peaceStoryBook);

      // =========================================================================
      // 29. SCENE: silent_mountain_fortress (at x = 540, z = 12)
      // "Trẻ nghĩ im lặng là yếu đuối • Trưởng thành nhận ra im lặng là bản lĩnh"
      // Palette: Faceted Emerald-Sapphire-Snow Crystal Mountain standing unshaken amid Crimson Storm Rings
      // =========================================================================
      this.silentMountainGroup = new THREE.Group();
      this.silentMountainGroup.position.set(540, 0, 12);
      this.scene.add(this.silentMountainGroup);

      const light29A = new THREE.PointLight(0x38bdf8, 2.5, 20);
      light29A.position.set(0, 4.8, 2.8);
      this.silentMountainGroup.add(light29A);
      const light29B = new THREE.PointLight(0x10b981, 2.0, 18);
      light29B.position.set(-2.5, 3.0, 2.0);
      this.silentMountainGroup.add(light29B);

      // Central towering Faceted Crystal Mountain Peak
      const mainPeak = new THREE.Mesh(new THREE.ConeGeometry(1.85, 3.9, 6), deepOceanMat);
      mainPeak.position.set(0, 1.95, 0);
      this.silentMountainGroup.add(mainPeak);

      const snowCap = new THREE.Mesh(new THREE.ConeGeometry(0.88, 1.65, 6), porcelainBlueMat);
      snowCap.position.set(0, 3.12, 0);
      snowCap.rotation.y = 0.05;
      this.silentMountainGroup.add(snowCap);
      const peakHalo = makeColorHalo(this.cyanGlowTex, 2.8, 0.85);
      peakHalo.position.set(0, 3.6, 0);
      this.silentMountainGroup.add(peakHalo);

      // Flanking Emerald & Royal-Blue secondary crystal ridges
      const ridgeL = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.45, 5), emeraldMat);
      ridgeL.position.set(-1.55, 1.22, 0.45);
      ridgeL.rotation.z = 0.12;
      this.silentMountainGroup.add(ridgeL);

      const ridgeR = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.25, 5), royalBlueMat);
      ridgeR.position.set(1.5, 1.12, 0.35);
      ridgeR.rotation.z = -0.12;
      this.silentMountainGroup.add(ridgeR);

      // Swirling Crimson & Violet Storm Vortex Rings whipping harmlessly around the mountain base
      for (let r = 0; r < 3; r++) {
        const stormRing = new THREE.Mesh(
          new THREE.TorusGeometry(2.25 + r * 0.45, 0.05, 14, 48),
          r % 2 === 0 ? roseQuartzMat : amethystMat
        );
        stormRing.position.set(0, 1.15 + r * 0.55, 0);
        this.silentMountainGroup.add(stormRing);
        this.mountainStormRings.push(stormRing);
      }

      for (let i = 0; i < 8; i++) {
        const snowOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), cyanCrystalMat);
        this.silentMountainGroup.add(snowOrb);
        this.mountainSnowOrbs.push({ mesh: snowOrb, index: i, phase: i / 8 });
      }

      // =========================================================================
      // 30. SCENE: rippling_to_crystal_lake (at x = 558, z = 12)
      // "Mặt hồ xao động chẳng thấy gì bên dưới vs Mặt hồ lắng xuống trong suốt"
      // Palette: Turbulent Violet-Red Waves on Left vs Crystal-Clear Aquamarine Mirror Lake & Lotus Pearl on Right
      // =========================================================================
      this.crystalLakeGroup = new THREE.Group();
      this.crystalLakeGroup.position.set(558, 0, 12);
      this.scene.add(this.crystalLakeGroup);

      const light30A = new THREE.PointLight(0x38bdf8, 2.6, 20);
      light30A.position.set(1.8, 4.2, 2.5);
      this.crystalLakeGroup.add(light30A);
      const light30B = new THREE.PointLight(0x10b981, 2.2, 18);
      light30B.position.set(2.0, 2.0, 2.0);
      this.crystalLakeGroup.add(light30B);

      // Left Basin (x = -2.1): Turbulent Choppy Water Waves obscuring what's underneath
      const leftBasinRim = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.08, 16, 48), darkSteelMat);
      leftBasinRim.rotation.x = Math.PI / 2;
      leftBasinRim.position.set(-2.1, 1.35, 0);
      this.crystalLakeGroup.add(leftBasinRim);

      for (let w = 0; w < 10; w++) {
        const waveShard = new THREE.Mesh(
          new THREE.ConeGeometry(0.28, 0.65, 5),
          w % 2 === 0 ? amethystMat : roseQuartzMat
        );
        this.crystalLakeGroup.add(waveShard);
        this.turbulentWaves.push({
          mesh: waveShard,
          baseX: -2.1 + Math.cos((w / 10) * Math.PI * 2) * (0.45 + (w % 3) * 0.35),
          baseZ: Math.sin((w / 10) * Math.PI * 2) * (0.45 + (w % 3) * 0.35),
          index: w
        });
      }

      // Right Basin (x = 1.85): Serene Transparent Mirror Lake revealing a Glowing Underwater Lotus & Pearl
      const rightBasinRim = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.09, 16, 48), emeraldMat);
      rightBasinRim.rotation.x = Math.PI / 2;
      rightBasinRim.position.set(1.85, 1.45, 0);
      this.crystalLakeGroup.add(rightBasinRim);

      const waterMirrorSurface = new THREE.Mesh(
        new THREE.CylinderGeometry(1.9, 1.9, 0.06, 48),
        this._createGlassMaterial(0.28, 0x38bdf8)
      );
      waterMirrorSurface.position.set(1.85, 1.42, 0);
      this.crystalLakeGroup.add(waterMirrorSurface);

      for (let r = 0; r < 3; r++) {
        const calmRip = new THREE.Mesh(
          new THREE.TorusGeometry(0.55 + r * 0.42, 0.025, 12, 48),
          cyanCrystalMat
        );
        calmRip.rotation.x = Math.PI / 2;
        calmRip.position.set(1.85, 1.46, 0);
        this.crystalLakeGroup.add(calmRip);
        this.calmMirrorRipples.push(calmRip);
      }

      // Glowing Submerged Crystal Lotus & Pearl visible clearly beneath the calm lake surface
      this.lakeBottomLotus = new THREE.Group();
      this.lakeBottomLotus.position.set(1.85, 0.55, 0);
      const pearlCore = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24), sunriseGoldMat);
      this.lakeBottomLotus.add(pearlCore);
      this.lakeBottomLotus.add(makeColorHalo(this.cyanGlowTex, 2.4, 0.9));

      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2;
        const uPetal = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.72, 6),
          p % 2 === 0 ? sakuraPinkMat : emeraldMat
        );
        uPetal.position.set(Math.cos(ang) * 0.48, 0.08, Math.sin(ang) * 0.48);
        uPetal.rotation.z = -Math.cos(ang) * 0.7;
        uPetal.rotation.x = Math.sin(ang) * 0.7;
        this.lakeBottomLotus.add(uPetal);
      }
      this.crystalLakeGroup.add(this.lakeBottomLotus);

      // =========================================================================
      // 31. SCENE: impulsive_fire_to_zen_sphere (at x = 576, z = 12)
      // "Khi bị cảm xúc chi phối dễ nói lời hối tiếc • Chỉ cần dừng lại một chút để tâm trí bình tĩnh"
      // Palette: Spiked Magma-Crimson Emotion Core -> Cyan Pause Arch -> Levitating Mint/Rose/Sapphire Zen Sphere
      // =========================================================================
      this.emotionZenGroup = new THREE.Group();
      this.emotionZenGroup.position.set(576, 0, 12);
      this.scene.add(this.emotionZenGroup);

      const light31A = new THREE.PointLight(0xf43f5e, 2.2, 16);
      light31A.position.set(-2.3, 3.5, 2.5);
      this.emotionZenGroup.add(light31A);
      const light31B = new THREE.PointLight(0x38bdf8, 2.4, 18);
      light31B.position.set(2.1, 3.8, 2.5);
      this.emotionZenGroup.add(light31B);

      // Left: Volatile Spiked Red-Orange Emotion Core ("Bị cảm xúc chi phối")
      const fireCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), magmaOrangeMat);
      fireCore.position.set(-2.25, 2.0, 0);
      this.emotionZenGroup.add(fireCore);
      const fireHalo = makeColorHalo(this.redGlowTex, 2.2, 0.85);
      fireHalo.position.set(-2.25, 2.0, 0);
      this.emotionZenGroup.add(fireHalo);

      for (let s = 0; s < 10; s++) {
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.14, 0.58, 5),
          s % 2 === 0 ? roseQuartzMat : magmaOrangeMat
        );
        this.emotionZenGroup.add(spike);
        this.emotionSpikes.push({ mesh: spike, index: s, phase: s / 10 });
      }

      // Center: Glowing Porcelain-Cyan "Pause" Gate ("Chỉ cần dừng lại một chút")
      const pauseBarL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.35), porcelainBlueMat);
      pauseBarL.position.set(-0.25, 1.9, 0);
      this.emotionZenGroup.add(pauseBarL);
      const pauseBarR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.35), porcelainBlueMat);
      pauseBarR.position.set(0.25, 1.9, 0);
      this.emotionZenGroup.add(pauseBarR);

      // Right: Harmonious Zen Sphere of Cyan, Emerald & Sakura-Rose Rings ("Chẳng đáng để bận tâm")
      const zenCore = new THREE.Mesh(new THREE.SphereGeometry(0.48, 28, 28), cyanCrystalMat);
      zenCore.position.set(2.2, 2.05, 0);
      this.emotionZenGroup.add(zenCore);
      const zenHalo = makeColorHalo(this.emeraldGlowTex, 2.5, 0.85);
      zenHalo.position.set(2.2, 2.05, 0);
      this.emotionZenGroup.add(zenHalo);

      const zMats = [emeraldMat, sakuraPinkMat, cyanCrystalMat];
      for (let r = 0; r < 3; r++) {
        const zRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.88 + r * 0.28, 0.04, 16, 48),
          zMats[r]
        );
        zRing.position.set(2.2, 2.05, 0);
        this.emotionZenGroup.add(zRing);
        this.zenSphereRings.push(zRing);
      }

      // =========================================================================
      // 32. SCENE: jade_shield_inner_garden (at x = 594, z = 12)
      // "Không cần đáp trả mọi lời chỉ trích • Không đánh mất sự bình yên vì tranh cãi vô nghĩa"
      // Palette: Emerald-Cyan Geodesic Dome Shield protecting a Blooming Sakura-Gold Sanctuary from Red Darts
      // =========================================================================
      this.jadeShieldGroup = new THREE.Group();
      this.jadeShieldGroup.position.set(594, 0, 12);
      this.scene.add(this.jadeShieldGroup);

      const light32A = new THREE.PointLight(0x10b981, 2.4, 18);
      light32A.position.set(0, 4.2, 2.5);
      this.jadeShieldGroup.add(light32A);
      const light32B = new THREE.PointLight(0xf472b6, 2.0, 16);
      light32B.position.set(0, 2.2, 2.0);
      this.jadeShieldGroup.add(light32B);

      // Inner Sanctuary Base & Blooming Sakura-Gold Bonsai/Lotus Tree inside the dome
      const gardenBase = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 0.32, 32), emeraldMat);
      gardenBase.position.y = 0.16;
      this.jadeShieldGroup.add(gardenBase);

      this.innerSanctuaryTree = new THREE.Group();
      this.innerSanctuaryTree.position.set(0, 0.32, 0);
      const sTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.25, 12), sunriseGoldMat);
      sTrunk.position.y = 0.62;
      this.innerSanctuaryTree.add(sTrunk);

      const canopyPositions = [
        [0, 1.55, 0, 0.52, sakuraPinkMat],
        [-0.48, 1.28, 0.2, 0.38, cyanCrystalMat],
        [0.48, 1.32, -0.15, 0.4, sakuraPinkMat],
        [0, 1.25, 0.45, 0.36, sunriseGoldMat]
      ];
      canopyPositions.forEach(([cx, cy, cz, cr, cMat]) => {
        const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 1), cMat);
        crown.position.set(cx, cy, cz);
        this.innerSanctuaryTree.add(crown);
      });
      const gardenHalo = makeColorHalo(this.roseGlowTex, 2.4, 0.85);
      gardenHalo.position.y = 1.45;
      this.innerSanctuaryTree.add(gardenHalo);
      this.jadeShieldGroup.add(this.innerSanctuaryTree);

      // Protective Translucent Emerald-Cyan Geodesic Dome Shield
      this.jadeDomeShield = new THREE.Group();
      this.jadeDomeShield.position.set(0, 1.55, 0);
      const domeGlass = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.85, 1),
        this._createGlassMaterial(0.24, 0x34d399)
      );
      this.jadeDomeShield.add(domeGlass);
      const domeRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.04, 14, 48), emeraldMat);
      this.jadeDomeShield.add(domeRing1);
      const domeRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.04, 14, 48), cyanCrystalMat);
      domeRing2.rotation.x = Math.PI / 2;
      this.jadeDomeShield.add(domeRing2);
      this.jadeShieldGroup.add(this.jadeDomeShield);

      // Incoming Red & Violet Criticism Darts deflecting harmlessly off the dome
      for (let d = 0; d < 10; d++) {
        const dart = new THREE.Mesh(
          new THREE.ConeGeometry(0.14, 0.52, 5),
          d % 2 === 0 ? roseQuartzMat : amethystMat
        );
        this.jadeShieldGroup.add(dart);
        this.deflectedDarts.push({ mesh: dart, index: d, phase: d / 10 });
      }

      // =========================================================================
      // 33. SCENE: voice_and_action_scale (at x = 612, z = 12)
      // "Biết khi nào nên lên tiếng, khi nào để hành động trả lời • Chọn điều xứng đáng với thời gian & năng lượng"
      // Palette: Cyan-Gold Resonance Bell of Truth + Ascending Emerald & Royal-Blue Action Columns
      // =========================================================================
      this.voiceActionGroup = new THREE.Group();
      this.voiceActionGroup.position.set(612, 0, 12);
      this.scene.add(this.voiceActionGroup);

      const light33A = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light33A.position.set(-2.0, 3.8, 2.5);
      this.voiceActionGroup.add(light33A);
      const light33B = new THREE.PointLight(0x10b981, 2.3, 18);
      light33B.position.set(2.0, 4.0, 2.5);
      this.voiceActionGroup.add(light33B);

      // Left: Resonant Cyan & Gold Bell of Truth ("Biết khi nào nên lên tiếng")
      const bellStand = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.08, 16, 40, Math.PI), royalBlueMat);
      bellStand.position.set(-1.95, 1.35, 0);
      this.voiceActionGroup.add(bellStand);

      this.truthChimeBell = new THREE.Group();
      this.truthChimeBell.position.set(-1.95, 2.45, 0);
      const bellBody = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.95, 24), sunriseGoldMat);
      bellBody.position.y = -0.45;
      this.truthChimeBell.add(bellBody);
      const bellRim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.055, 12, 32), cyanCrystalMat);
      bellRim.rotation.x = Math.PI / 2;
      bellRim.position.y = -0.92;
      this.truthChimeBell.add(bellRim);
      this.truthChimeBell.add(makeColorHalo(this.cyanGlowTex, 2.1, 0.85));
      this.voiceActionGroup.add(this.truthChimeBell);

      // Right: 6 Ascending Emerald, Sapphire & Gold Action Pillars ("Để hành động trả lời")
      const pMats = [emeraldMat, cyanCrystalMat, royalBlueMat, amethystMat, sakuraPinkMat, sunriseGoldMat];
      for (let p = 0; p < 6; p++) {
        const baseH = 0.75 + p * 0.45;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.36, baseH, 6),
          pMats[p]
        );
        pillar.position.set(0.35 + p * 0.65, baseH / 2, (p % 2 === 0 ? 0.2 : -0.2));
        this.voiceActionGroup.add(pillar);
        this.actionPillars.push({ mesh: pillar, baseH, index: p });
      }

      // =========================================================================
      // 34. SCENE: silent_monument_constellation (at x = 630, z = 12)
      // "Câu trả lời mạnh mẽ nhất nằm ở cách bạn sống, hành động và những gì bạn âm thầm đạt được"
      // Palette: Grand Multi-Colored Crystalline Spire (Sapphire, Emerald, Amethyst, Rose, Gold) + Star Crown
      // =========================================================================
      this.silentMonumentGroup = new THREE.Group();
      this.silentMonumentGroup.position.set(630, 0, 12);
      this.scene.add(this.silentMonumentGroup);

      const light34A = new THREE.PointLight(0x38bdf8, 2.4, 20);
      light34A.position.set(-2.2, 4.2, 2.8);
      this.silentMonumentGroup.add(light34A);
      const light34B = new THREE.PointLight(0xfbbf24, 2.5, 20);
      light34B.position.set(0, 5.0, 2.5);
      this.silentMonumentGroup.add(light34B);
      const light34C = new THREE.PointLight(0xc084fc, 2.2, 20);
      light34C.position.set(2.2, 4.2, 2.8);
      this.silentMonumentGroup.add(light34C);

      // 6 Concentric Crystalline Monument Tiers rising into a radiant Star Crown
      const tierMats = [royalBlueMat, emeraldMat, cyanCrystalMat, amethystMat, sakuraPinkMat, sunriseGoldMat];
      for (let t = 0; t < 6; t++) {
        const rad = 1.95 - t * 0.26;
        const tierMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(rad * 0.86, rad, 0.42, 6),
          tierMats[t]
        );
        tierMesh.position.set(0, 0.22 + t * 0.46, 0);
        this.silentMonumentGroup.add(tierMesh);
        this.silentSpireTiers.push({ mesh: tierMesh, index: t, baseY: 0.22 + t * 0.46 });
      }

      // Summit Crown Star at the top of the silent monument
      const summitStar = new THREE.Group();
      summitStar.position.set(0, 3.45, 0);
      const starOcta = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 1), sunriseGoldMat);
      summitStar.add(starOcta);
      const starRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.045, 16, 48), cyanCrystalMat);
      summitStar.add(starRing1);
      const starRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.04, 16, 48), sakuraPinkMat);
      starRing2.rotation.x = Math.PI / 2;
      summitStar.add(starRing2);
      summitStar.add(makeColorHalo(this.glowTex, 3.0, 0.95));
      this.silentMonumentGroup.add(summitStar);
      this.silentSpireTiers.push({ mesh: summitStar, index: 6, baseY: 3.45, isCrown: true });

      // Orbiting Constellation Stars around the Monument of Silent Achievement
      const starHalos = [this.cyanGlowTex, this.emeraldGlowTex, this.violetGlowTex, this.roseGlowTex, this.glowTex];
      for (let c = 0; c < 12; c++) {
        const cOrb = new THREE.Group();
        const cMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.16, 0),
          tierMats[c % tierMats.length]
        );
        cOrb.add(cMesh);
        cOrb.add(makeColorHalo(starHalos[c % starHalos.length], 1.05, 0.85));
        this.silentMonumentGroup.add(cOrb);
        this.silentConstellationOrbs.push({ group: cOrb, index: c, phase: c / 12 });
      }
    }

    /**
     * Build 8 diverse, richly colored, multi-material 3D dioramas for "Có Những Người, Chỉ Có Thể Thương…"
     */
    _buildOnlyCanLoveMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25,
        reflectivity: 0.95
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.35,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });
      const royalBlueMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.75
      });
      const sunriseGoldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8
      });

      const makeColorHalo = (tex, scale = 1.6, opacity = 0.85) => {
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        sp.scale.set(scale, scale, 1);
        return sp;
      };

      // =========================================================================
      // 35. SCENE: midnight_phone_planet (at x = 648, z = 12)
      // "Nhớ một người nhưng chẳng còn lý do nhắn tin • Người từng là cả thế giới, thức đến tận khuya"
      // Palette: Midnight Smartphone + Unsent Sakura-Pink Chat Bubble + Rose-Cyan Shared Planet & Twin Moons
      // =========================================================================
      this.midnightPlanetGroup = new THREE.Group();
      this.midnightPlanetGroup.position.set(648, 0, 12);
      this.scene.add(this.midnightPlanetGroup);

      const light35A = new THREE.PointLight(0xf472b6, 2.3, 18);
      light35A.position.set(-2.0, 3.8, 2.5);
      this.midnightPlanetGroup.add(light35A);
      const light35B = new THREE.PointLight(0x38bdf8, 2.3, 18);
      light35B.position.set(2.0, 3.8, 2.5);
      this.midnightPlanetGroup.add(light35B);

      // Left: Midnight Smartphone with Unsent Floating Chat Bubble ("Chẳng còn lý do nhắn tin")
      const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 2.45), darkSteelMat);
      phoneBody.position.set(-2.05, 1.05, 0.2);
      phoneBody.rotation.x = 0.38;
      phoneBody.rotation.z = -0.15;
      this.midnightPlanetGroup.add(phoneBody);

      const phoneScreen = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.04, 2.25), royalBlueMat);
      phoneScreen.position.set(-2.05, 1.12, 0.2);
      phoneScreen.rotation.x = 0.38;
      phoneScreen.rotation.z = -0.15;
      this.midnightPlanetGroup.add(phoneScreen);

      this.unsentChatBubble = new THREE.Group();
      this.unsentChatBubble.position.set(-1.95, 2.25, 0.15);
      const bubbleBox = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.52, 0.18), sakuraPinkMat);
      this.unsentChatBubble.add(bubbleBox);
      for (let d = -1; d <= 1; d++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), porcelainBlueMat);
        dot.position.set(d * 0.28, 0, 0.12);
        this.unsentChatBubble.add(dot);
      }
      this.unsentChatBubble.add(makeColorHalo(this.roseGlowTex, 2.0, 0.85));
      this.midnightPlanetGroup.add(this.unsentChatBubble);

      // Right: Shared Mini-Planet ("Từng là cả thế giới của bạn") with Crescent Moon & 2 Orbiting Souls
      this.sharedPlanetCore = new THREE.Group();
      this.sharedPlanetCore.position.set(1.85, 2.15, 0);
      const planetSphere = new THREE.Mesh(new THREE.SphereGeometry(0.78, 32, 32), amethystMat);
      this.sharedPlanetCore.add(planetSphere);
      const planetRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.045, 16, 48), cyanCrystalMat);
      planetRing1.rotation.x = 1.15;
      planetRing1.rotation.y = 0.35;
      this.sharedPlanetCore.add(planetRing1);
      const planetRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.035, 16, 48), sakuraPinkMat);
      planetRing2.rotation.x = -1.05;
      this.sharedPlanetCore.add(planetRing2);
      const nightCrescent = new THREE.Mesh(
        new THREE.TorusGeometry(0.45, 0.11, 14, 32, Math.PI * 1.35),
        sunriseGoldMat
      );
      nightCrescent.position.set(0.65, 1.05, 0);
      nightCrescent.rotation.z = 0.6;
      this.sharedPlanetCore.add(nightCrescent);
      this.sharedPlanetCore.add(makeColorHalo(this.violetGlowTex, 2.8, 0.85));
      this.midnightPlanetGroup.add(this.sharedPlanetCore);

      for (let m = 0; m < 2; m++) {
        const moonGroup = new THREE.Group();
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 20, 20),
          m === 0 ? cyanCrystalMat : roseQuartzMat
        );
        moonGroup.add(moonMesh);
        moonGroup.add(makeColorHalo(m === 0 ? this.cyanGlowTex : this.roseGlowTex, 1.15, 0.85));
        this.midnightPlanetGroup.add(moonGroup);
        this.twinOrbitMoons.push({ group: moonGroup, index: m });
      }

      // =========================================================================
      // 36. SCENE: diverging_twin_galaxies (at x = 666, z = 12)
      // "Hai người từng biết tất cả về nhau, cuối cùng lại trở thành hai người xa lạ"
      // Palette: Intertwined Sakura-Pink & Sapphire-Cyan Spiral Bridges parting into separate worlds
      // =========================================================================
      this.divergingGalaxiesGroup = new THREE.Group();
      this.divergingGalaxiesGroup.position.set(666, 0, 12);
      this.scene.add(this.divergingGalaxiesGroup);

      const light36A = new THREE.PointLight(0xf472b6, 2.2, 18);
      light36A.position.set(-2.2, 3.8, 2.5);
      this.divergingGalaxiesGroup.add(light36A);
      const light36B = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light36B.position.set(2.2, 3.8, 2.5);
      this.divergingGalaxiesGroup.add(light36B);

      // Build two pathways that start intertwined on the left and diverge wide apart on the right
      for (let step = 0; step < 14; step++) {
        const u = step / 13;
        const px = -3.4 + u * 6.8;
        const sep = u < 0.35 ? Math.sin(u * Math.PI * 6) * 0.35 : 0.25 + Math.pow(u - 0.35, 1.35) * 3.6;

        const stonePink = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.52), sakuraPinkMat);
        stonePink.position.set(px, 0.65 + u * 1.45, -sep);
        this.divergingGalaxiesGroup.add(stonePink);

        const stoneCyan = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.52), cyanCrystalMat);
        stoneCyan.position.set(px, 0.65 + u * 1.45, sep);
        this.divergingGalaxiesGroup.add(stoneCyan);
      }

      // Floating Memory Gems ("Nhớ họ thích ăn gì, sợ điều gì, giận dỗi ra sao")
      const gemMats = [sunriseGoldMat, emeraldMat, amethystMat, roseQuartzMat, cyanCrystalMat];
      for (let g = 0; g < 10; g++) {
        const gemMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.24, 0),
          gemMats[g % gemMats.length]
        );
        this.divergingGalaxiesGroup.add(gemMesh);
        this.divergingGems.push({ mesh: gemMesh, index: g, phase: g / 10 });
      }

      // =========================================================================
      // 37. SCENE: unfinished_dream_house (at x = 684, z = 12)
      // "Phải học cách sống thiếu một người trong mọi dự định tương lai • Mái nhà nhỏ & lời hứa bỏ ngỏ"
      // Palette: Warm Gold & Emerald Left Half vs Dissolving Cyan-Rose Blueprint Wireframe Right Half
      // =========================================================================
      this.dreamHouseGroup = new THREE.Group();
      this.dreamHouseGroup.position.set(684, 0, 12);
      this.scene.add(this.dreamHouseGroup);

      const light37A = new THREE.PointLight(0xfbbf24, 2.2, 18);
      light37A.position.set(-1.8, 3.8, 2.5);
      this.dreamHouseGroup.add(light37A);
      const light37B = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light37B.position.set(1.8, 3.8, 2.5);
      this.dreamHouseGroup.add(light37B);

      const houseBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.24, 2.6), darkSteelMat);
      houseBase.position.set(0, 0.12, 0);
      this.dreamHouseGroup.add(houseBase);

      // Left half of the house: Warm Gold & Emerald solid walls + roof ("Đã từng nghĩ sẽ cùng xây mái nhà nhỏ")
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.85, 1.85), emeraldMat);
      leftWall.position.set(-0.92, 1.15, 0);
      this.dreamHouseGroup.add(leftWall);

      const warmWindow = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.62, 1.92), sunriseGoldMat);
      warmWindow.position.set(-1.05, 1.25, 0);
      this.dreamHouseGroup.add(warmWindow);

      const leftRoof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.18, 2.15), sunriseGoldMat);
      leftRoof.position.set(-0.85, 2.48, 0);
      leftRoof.rotation.z = 0.58;
      this.dreamHouseGroup.add(leftRoof);

      // Right half of the house: Unfinished Translucent Blueprint Wireframe dissolving into shards
      const rightFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 1.85, 1.85),
        this._createGlassMaterial(0.18, 0x38bdf8)
      );
      rightFrame.position.set(0.92, 1.15, 0);
      this.dreamHouseGroup.add(rightFrame);

      // Empty promise ring on the right side where the other person no longer stands
      const emptyPromiseRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.045, 14, 40), roseQuartzMat);
      emptyPromiseRing.rotation.x = Math.PI / 2;
      emptyPromiseRing.position.set(1.15, 0.32, 0.65);
      this.dreamHouseGroup.add(emptyPromiseRing);

      // Floating unfinished roof & wall crystal bricks drifting away on the right
      const shardMats = [cyanCrystalMat, sakuraPinkMat, amethystMat];
      for (let s = 0; s < 12; s++) {
        const brick = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 0.16, 0.38),
          shardMats[s % 3]
        );
        this.dreamHouseGroup.add(brick);
        this.unfinishedRoofShards.push({
          mesh: brick,
          baseX: 0.45 + (s % 4) * 0.45,
          baseY: 1.85 + Math.floor(s / 4) * 0.42,
          baseZ: ((s % 3) - 1) * 0.55,
          index: s
        });
      }

      // =========================================================================
      // 38. SCENE: vinyl_melody_dimming_screen (at x = 702, z = 12)
      // "Đêm vô tình nghe lại bài hát cũ, ký ức ùa về • Muốn nhắn 'Dạo này em thế nào?' rồi tắt màn hình"
      // Palette: Spinning Amethyst-Rose-Cyan Vinyl Record + Dimming Smartphone Monolith
      // =========================================================================
      this.vinylPhoneGroup = new THREE.Group();
      this.vinylPhoneGroup.position.set(702, 0, 12);
      this.scene.add(this.vinylPhoneGroup);

      const light38A = new THREE.PointLight(0xc084fc, 2.3, 18);
      light38A.position.set(-1.8, 3.8, 2.5);
      this.vinylPhoneGroup.add(light38A);
      const light38B = new THREE.PointLight(0x38bdf8, 2.1, 18);
      light38B.position.set(2.0, 3.5, 2.5);
      this.vinylPhoneGroup.add(light38B);

      // Left: Spinning 3D Vinyl Record of Old Memories ("Nghe lại một bài hát cũ")
      this.vinylDisc = new THREE.Group();
      this.vinylDisc.position.set(-1.75, 1.65, 0);
      this.vinylDisc.rotation.x = 0.45;
      this.vinylDisc.rotation.z = -0.18;

      const discBody = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.08, 48), darkSteelMat);
      this.vinylDisc.add(discBody);
      const discLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.1, 32), roseQuartzMat);
      this.vinylDisc.add(discLabel);

      const grooveMats = [amethystMat, cyanCrystalMat, sakuraPinkMat];
      for (let g = 0; g < 3; g++) {
        const groove = new THREE.Mesh(
          new THREE.TorusGeometry(0.78 + g * 0.28, 0.025, 12, 48),
          grooveMats[g]
        );
        groove.rotation.x = Math.PI / 2;
        groove.position.y = 0.05;
        this.vinylDisc.add(groove);
      }
      this.vinylPhoneGroup.add(this.vinylDisc);

      // Rising musical memory crystals above the spinning vinyl
      for (let n = 0; n < 10; n++) {
        const noteOrb = new THREE.Group();
        const nMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.18, 0),
          grooveMats[n % 3]
        );
        noteOrb.add(nMesh);
        noteOrb.add(makeColorHalo(n % 2 === 0 ? this.violetGlowTex : this.roseGlowTex, 1.0, 0.8));
        this.vinylPhoneGroup.add(noteOrb);
        this.vinylNotes.push({ group: noteOrb, index: n, phase: n / 10 });
      }

      // Right: Vertical Smartphone Monolith dimming its screen ("Lặng lẽ tắt màn hình")
      const uprightPhone = new THREE.Mesh(new THREE.BoxGeometry(1.42, 2.65, 0.16), darkSteelMat);
      uprightPhone.position.set(2.05, 1.65, 0);
      uprightPhone.rotation.y = -0.28;
      this.vinylPhoneGroup.add(uprightPhone);

      this.dimmingScreenGlow = new THREE.Mesh(
        new THREE.BoxGeometry(1.26, 2.38, 0.04),
        cyanCrystalMat
      );
      this.dimmingScreenGlow.position.set(2.02, 1.65, 0.08);
      this.dimmingScreenGlow.rotation.y = -0.28;
      this.vinylPhoneGroup.add(this.dimmingScreenGlow);

      // =========================================================================
      // 39. SCENE: paper_boats_star_river (at x = 720, z = 12)
      // "Không phải nỗi nhớ nào cũng cần được gửi đi • Không phải tình yêu nào cũng đi đến cuối cùng"
      // Palette: Bioluminescent Cyan Star-River + Drifting Pink, Gold & Amethyst Origami Paper Boats
      // =========================================================================
      this.paperBoatsGroup = new THREE.Group();
      this.paperBoatsGroup.position.set(720, 0, 12);
      this.scene.add(this.paperBoatsGroup);

      const light39A = new THREE.PointLight(0x38bdf8, 2.4, 20);
      light39A.position.set(0, 3.8, 2.5);
      this.paperBoatsGroup.add(light39A);
      const light39B = new THREE.PointLight(0xf472b6, 2.2, 18);
      light39B.position.set(1.5, 3.2, 2.0);
      this.paperBoatsGroup.add(light39B);

      // Glowing Turquoise Star-River bed curving across the floor
      for (let r = 0; r < 16; r++) {
        const u = r / 15;
        const rx = -3.8 + u * 7.6;
        const rz = Math.sin(u * Math.PI * 2) * 0.85;
        const riverWave = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.06, 1.85),
          r % 2 === 0 ? cyanCrystalMat : royalBlueMat
        );
        riverWave.position.set(rx, 0.08, rz);
        riverWave.rotation.y = Math.cos(u * Math.PI * 2) * 0.25;
        this.paperBoatsGroup.add(riverWave);
      }

      // 8 Origami Paper Boats & Sky Lanterns drifting and rising into the starry night
      const boatMats = [sakuraPinkMat, sunriseGoldMat, amethystMat, emeraldMat];
      const boatHalos = [this.roseGlowTex, this.glowTex, this.violetGlowTex, this.emeraldGlowTex];
      for (let b = 0; b < 8; b++) {
        const boat = new THREE.Group();
        const bMat = boatMats[b % 4];
        const hull = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.28, 4), bMat);
        hull.rotation.x = Math.PI;
        hull.scale.set(1.6, 1, 0.75);
        boat.add(hull);
        const sail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.45, 3), porcelainBlueMat);
        sail.position.y = 0.22;
        boat.add(sail);
        boat.add(makeColorHalo(boatHalos[b % 4], 1.45, 0.85));
        this.paperBoatsGroup.add(boat);
        this.paperBoats.push({ group: boat, index: b, phase: b / 8 });
      }

      // =========================================================================
      // 40. SCENE: rose_bloom_crystal_tree (at x = 738, z = 12)
      // "Có những người xuất hiện để dạy ta cách yêu thương • Rồi rời đi để dạy ta cách trưởng thành"
      // Palette: Crimson-Rose Heart Flower on Left feeding a Majestic Emerald & Sapphire Tree of Maturity on Right
      // =========================================================================
      this.roseTreeGroup = new THREE.Group();
      this.roseTreeGroup.position.set(738, 0, 12);
      this.scene.add(this.roseTreeGroup);

      const light40A = new THREE.PointLight(0xf43f5e, 2.3, 18);
      light40A.position.set(-2.2, 3.6, 2.5);
      this.roseTreeGroup.add(light40A);
      const light40B = new THREE.PointLight(0x10b981, 2.4, 18);
      light40B.position.set(2.0, 4.2, 2.5);
      this.roseTreeGroup.add(light40B);

      // Left: Blooming Crimson-Rose Flower of Love ("Dạy chúng ta cách yêu thương")
      const roseStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.35, 12), emeraldMat);
      roseStem.position.set(-2.15, 0.68, 0);
      this.roseTreeGroup.add(roseStem);

      const roseHead = new THREE.Group();
      roseHead.position.set(-2.15, 1.55, 0);
      const roseCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), roseQuartzMat);
      roseHead.add(roseCore);
      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2;
        const rPetal = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.65, 5), sakuraPinkMat);
        rPetal.position.set(Math.cos(ang) * 0.42, 0.1, Math.sin(ang) * 0.42);
        rPetal.rotation.z = -Math.cos(ang) * 0.65;
        rPetal.rotation.x = Math.sin(ang) * 0.65;
        roseHead.add(rPetal);
      }
      roseHead.add(makeColorHalo(this.roseGlowTex, 2.3, 0.85));
      this.roseTreeGroup.add(roseHead);

      // Right: Tall Crystal Tree of Maturity in Emerald, Sapphire & Gold ("Rời đi để dạy ta trưởng thành")
      const matTreeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.36, 2.1, 12), sunriseGoldMat);
      matTreeTrunk.position.set(1.85, 1.05, 0);
      this.roseTreeGroup.add(matTreeTrunk);

      const treeCrowns = [
        [1.85, 2.55, 0, 0.72, emeraldMat],
        [1.15, 2.15, 0.25, 0.52, cyanCrystalMat],
        [2.55, 2.2, -0.2, 0.54, royalBlueMat],
        [1.85, 3.25, 0, 0.55, porcelainBlueMat],
        [1.45, 2.8, -0.35, 0.46, amethystMat]
      ];
      treeCrowns.forEach(([tx, ty, tz, tr, tMat]) => {
        const crownNode = new THREE.Mesh(new THREE.OctahedronGeometry(tr, 1), tMat);
        crownNode.position.set(tx, ty, tz);
        this.roseTreeGroup.add(crownNode);
      });
      const treeHalo = makeColorHalo(this.emeraldGlowTex, 3.0, 0.85);
      treeHalo.position.set(1.85, 2.6, 0);
      this.roseTreeGroup.add(treeHalo);

      // Flowing petals from the Rose of Love into the Tree of Maturity
      for (let i = 0; i < 10; i++) {
        const petal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.16, 0),
          i < 5 ? sakuraPinkMat : emeraldMat
        );
        this.roseTreeGroup.add(petal);
        this.loveToTreePetals.push({ mesh: petal, index: i, phase: i / 10 });
      }

      // =========================================================================
      // 41. SCENE: two_peaceful_lantern_bridges (at x = 756, z = 12)
      // "Nếu một ngày vô tình gặp lại, mong cả hai đều đã tìm được bình yên • Chỉ mỉm cười vì đã từng có nhau"
      // Palette: Two Graceful Emerald & Sapphire Arched Bridges + Floating Warm Gratitude Lanterns
      // =========================================================================
      this.peaceBridgesGroup = new THREE.Group();
      this.peaceBridgesGroup.position.set(756, 0, 12);
      this.scene.add(this.peaceBridgesGroup);

      const light41A = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light41A.position.set(-1.5, 3.8, 2.5);
      this.peaceBridgesGroup.add(light41A);
      const light41B = new THREE.PointLight(0xfbbf24, 2.3, 18);
      light41B.position.set(1.5, 3.8, 2.5);
      this.peaceBridgesGroup.add(light41B);

      // Two serene arched bridges crossing gracefully in calm harmony
      for (let b = 0; b < 2; b++) {
        const zOff = b === 0 ? -0.65 : 0.65;
        const bMat = b === 0 ? cyanCrystalMat : emeraldMat;
        for (let s = 0; s < 11; s++) {
          const u = s / 10;
          const bx = -3.0 + u * 6.0;
          const by = 0.35 + Math.sin(u * Math.PI) * 1.45;
          const plank = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.72), bMat);
          plank.position.set(bx, by, zOff);
          this.peaceBridgesGroup.add(plank);
        }

        const soulGroup = new THREE.Group();
        const soulSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 24, 24),
          b === 0 ? porcelainBlueMat : sakuraPinkMat
        );
        soulGroup.add(soulSphere);
        soulGroup.add(makeColorHalo(b === 0 ? this.cyanGlowTex : this.roseGlowTex, 1.5, 0.9));
        this.peaceBridgesGroup.add(soulGroup);
        this.peaceBridgeSouls.push({ group: soulGroup, index: b, zOff });
      }

      // 8 Floating Warm Gratitude Sky Lanterns rising around the bridges
      for (let l = 0; l < 8; l++) {
        const lantern = new THREE.Group();
        const lBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.14, 0.38, 8),
          l % 2 === 0 ? sunriseGoldMat : sakuraPinkMat
        );
        lantern.add(lBody);
        lantern.add(makeColorHalo(this.glowTex, 1.25, 0.85));
        this.peaceBridgesGroup.add(lantern);
        this.peaceLanterns.push({
          group: lantern,
          baseX: -2.6 + (l % 4) * 1.75,
          baseZ: l < 4 ? -1.4 : 1.4,
          phase: l / 8
        });
      }

      // =========================================================================
      // 42. SCENE: parallel_stars_still_loving (at x = 774, z = 12)
      // "Điều buồn nhất không phải là hết yêu • Mà là vẫn còn thương nhưng chẳng thể cùng nhau đi tiếp"
      // Palette: Two Parallel Starlight Roads (Rose-Amethyst & Sapphire-Emerald) + Glowing Heart Between Them
      // =========================================================================
      this.parallelStarsGroup = new THREE.Group();
      this.parallelStarsGroup.position.set(774, 0, 12);
      this.scene.add(this.parallelStarsGroup);

      const light42A = new THREE.PointLight(0xf43f5e, 2.5, 20);
      light42A.position.set(0, 3.8, 2.5);
      this.parallelStarsGroup.add(light42A);
      const light42B = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light42B.position.set(-2.2, 3.5, 2.0);
      this.parallelStarsGroup.add(light42B);
      const light42C = new THREE.PointLight(0xc084fc, 2.2, 18);
      light42C.position.set(2.2, 3.5, 2.0);
      this.parallelStarsGroup.add(light42C);

      // Two parallel starlight pathways stretching into the horizon side-by-side without ever meeting
      for (let i = 0; i < 12; i++) {
        const u = i / 11;
        const stepY = 0.25 + u * 2.15;
        const stepZ = 2.2 - u * 5.8;

        const leftStep = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.14, 0.38),
          i % 2 === 0 ? cyanCrystalMat : emeraldMat
        );
        leftStep.position.set(-1.65, stepY, stepZ);
        this.parallelStarsGroup.add(leftStep);

        const rightStep = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.14, 0.38),
          i % 2 === 0 ? sakuraPinkMat : amethystMat
        );
        rightStep.position.set(1.65, stepY, stepZ);
        this.parallelStarsGroup.add(rightStep);
      }

      // Two travelers moving forward on their separate parallel roads
      this.parallelTravelerL = new THREE.Group();
      this.parallelTravelerL.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), cyanCrystalMat));
      this.parallelTravelerL.add(makeColorHalo(this.cyanGlowTex, 1.6, 0.9));
      this.parallelStarsGroup.add(this.parallelTravelerL);

      this.parallelTravelerR = new THREE.Group();
      this.parallelTravelerR.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), sakuraPinkMat));
      this.parallelTravelerR.add(makeColorHalo(this.roseGlowTex, 1.6, 0.9));
      this.parallelStarsGroup.add(this.parallelTravelerR);

      // Central Glowing Heart-Crystal suspended between the two parallel tracks ("Vẫn còn thương…")
      this.stillLovingHeart = new THREE.Group();
      this.stillLovingHeart.position.set(0, 2.15, -0.4);
      const heartCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 1), roseQuartzMat);
      this.stillLovingHeart.add(heartCore);
      const heartRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.04, 16, 48), sunriseGoldMat);
      this.stillLovingHeart.add(heartRing1);
      const heartRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.035, 16, 48), sakuraPinkMat);
      heartRing2.rotation.x = Math.PI / 2;
      this.stillLovingHeart.add(heartRing2);
      this.stillLovingHeart.add(makeColorHalo(this.roseGlowTex, 2.8, 0.92));
      this.parallelStarsGroup.add(this.stillLovingHeart);
    }

    /**
     * Build 9 diverse, richly colored, multi-material 3D dioramas for
     * "Tình Yêu Đẹp Nhất Không Phải Là Tìm Được Người Hoàn Hảo"
     */
    _buildImperfectLoveMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25,
        reflectivity: 0.95
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const magmaOrangeMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xc2410c,
        emissiveIntensity: 0.58,
        roughness: 0.3,
        metalness: 0.45
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });
      const royalBlueMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.75
      });
      const sunriseGoldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.52,
        roughness: 0.2,
        metalness: 0.82
      });

      const makeColorHalo = (tex, scale = 1.6, opacity = 0.85) => {
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        sp.scale.set(scale, scale, 1);
        return sp;
      };

      // =========================================================================
      // 43. SCENE: earth_billions_two_souls (at x = 792, z = 12)
      // "Giữa hàng tỷ người trên thế giới, điều gì khiến hai người ở lại bên nhau?"
      // Palette: Sapphire-Emerald Globe + Galaxy of Billions + Two Converging Souls (Rose & Cyan)
      // =========================================================================
      this.earthBillionsGroup = new THREE.Group();
      this.earthBillionsGroup.position.set(792, 0, 12);
      this.scene.add(this.earthBillionsGroup);

      const light43A = new THREE.PointLight(0x38bdf8, 2.4, 20);
      light43A.position.set(-2.0, 4.0, 2.5);
      this.earthBillionsGroup.add(light43A);
      const light43B = new THREE.PointLight(0xf472b6, 2.4, 20);
      light43B.position.set(2.0, 4.0, 2.5);
      this.earthBillionsGroup.add(light43B);

      this.earthBillionsGlobe = new THREE.Group();
      this.earthBillionsGlobe.position.set(0, 1.55, 0);
      const globeSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 2), royalBlueMat);
      this.earthBillionsGlobe.add(globeSphere);
      const eqRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.035, 14, 48), emeraldMat);
      eqRing1.rotation.x = 1.25;
      this.earthBillionsGlobe.add(eqRing1);
      const eqRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.03, 14, 48), cyanCrystalMat);
      eqRing2.rotation.x = -1.1;
      eqRing2.rotation.y = 0.4;
      this.earthBillionsGlobe.add(eqRing2);
      this.earthBillionsGroup.add(this.earthBillionsGlobe);

      // Two destined souls (Cyan & Sakura Pink) rising above the globe into a shared golden ring
      const sharedOrbit = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 14, 48), sunriseGoldMat);
      sharedOrbit.position.set(0, 3.15, 0);
      sharedOrbit.rotation.x = Math.PI / 2.2;
      this.earthBillionsGroup.add(sharedOrbit);

      for (let s = 0; s < 2; s++) {
        const soul = new THREE.Group();
        const sMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.32, 1),
          s === 0 ? cyanCrystalMat : sakuraPinkMat
        );
        soul.add(sMesh);
        soul.add(makeColorHalo(s === 0 ? this.cyanGlowTex : this.roseGlowTex, 1.65, 0.9));
        this.earthBillionsGroup.add(soul);
        this.destinedSoulPair.push({ group: soul, index: s });
      }

      // Superficial illusions drifting away below (mirror frame = looks, coin = money, pink bubble = sweet talk)
      const illusionMats = [amethystMat, sunriseGoldMat, sakuraPinkMat];
      for (let i = 0; i < 9; i++) {
        const token = new THREE.Mesh(
          i % 3 === 0
            ? new THREE.TorusGeometry(0.24, 0.04, 10, 24)
            : i % 3 === 1
            ? new THREE.CylinderGeometry(0.22, 0.22, 0.07, 20)
            : new THREE.OctahedronGeometry(0.2, 0),
          illusionMats[i % 3]
        );
        this.earthBillionsGroup.add(token);
        this.fadingIllusionTokens.push({ mesh: token, index: i, phase: i / 9 });
      }

      // =========================================================================
      // 44. SCENE: sweet_beginnings_constellation (at x = 810, z = 12)
      // "Lúc mới bắt đầu: tin nhắn chúc ngủ ngon, cuộc gọi tận khuya, cái nắm tay, lời hứa"
      // Palette: Warm Gold Crescent Moon + Rose-Cyan Romance Bridge + Floating Sweet Icons
      // =========================================================================
      this.sweetBeginningsGroup = new THREE.Group();
      this.sweetBeginningsGroup.position.set(810, 0, 12);
      this.scene.add(this.sweetBeginningsGroup);

      const light44A = new THREE.PointLight(0xf472b6, 2.3, 18);
      light44A.position.set(-1.8, 3.8, 2.5);
      this.sweetBeginningsGroup.add(light44A);
      const light44B = new THREE.PointLight(0xfbbf24, 2.3, 18);
      light44B.position.set(1.8, 4.0, 2.5);
      this.sweetBeginningsGroup.add(light44B);

      // Romantic arched bridge where two souls stand close together under a Golden Moon
      for (let i = 0; i < 9; i++) {
        const u = i / 8;
        const bx = -2.4 + u * 4.8;
        const by = 0.25 + Math.sin(u * Math.PI) * 1.1;
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(0.52, 0.14, 1.15),
          i % 2 === 0 ? sakuraPinkMat : cyanCrystalMat
        );
        step.position.set(bx, by, 0);
        this.sweetBeginningsGroup.add(step);
      }

      const coupleL = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), cyanCrystalMat);
      coupleL.position.set(-0.38, 1.75, 0);
      this.sweetBeginningsGroup.add(coupleL);
      const coupleR = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), sakuraPinkMat);
      coupleR.position.set(0.38, 1.75, 0);
      this.sweetBeginningsGroup.add(coupleR);

      // Interlocking Golden Rings of Promise & Crescent Moon overhead
      const moonArch = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.14, 16, 40, Math.PI * 1.35),
        sunriseGoldMat
      );
      moonArch.position.set(0, 3.25, -0.3);
      moonArch.rotation.z = 0.55;
      this.sweetBeginningsGroup.add(moonArch);

      const iconMats = [cyanCrystalMat, sakuraPinkMat, amethystMat, emeraldMat];
      for (let k = 0; k < 8; k++) {
        const iconGroup = new THREE.Group();
        const mesh = new THREE.Mesh(
          k % 2 === 0 ? new THREE.BoxGeometry(0.52, 0.32, 0.12) : new THREE.TorusGeometry(0.24, 0.05, 12, 28),
          iconMats[k % 4]
        );
        iconGroup.add(mesh);
        iconGroup.add(makeColorHalo(k % 2 === 0 ? this.cyanGlowTex : this.roseGlowTex, 1.15, 0.8));
        this.sweetBeginningsGroup.add(iconGroup);
        this.sweetBeginningIcons.push({ group: iconGroup, index: k, phase: k / 8 });
      }

      // =========================================================================
      // 45. SCENE: thorny_storm_imperfect_days (at x = 828, z = 12)
      // "Thử thách vào những ngày chẳng còn dễ thương: mệt mỏi, cáu giận, bất đồng, hiểu lầm"
      // Palette: Dark Storm Cloud & Crimson Lightning on Left + Tangled Violet/Amber Knot in Center
      // =========================================================================
      this.stormImperfectGroup = new THREE.Group();
      this.stormImperfectGroup.position.set(828, 0, 12);
      this.scene.add(this.stormImperfectGroup);

      const light45A = new THREE.PointLight(0xf43f5e, 2.3, 18);
      light45A.position.set(-2.0, 3.8, 2.5);
      this.stormImperfectGroup.add(light45A);
      const light45B = new THREE.PointLight(0xc084fc, 2.2, 18);
      light45B.position.set(2.0, 3.8, 2.5);
      this.stormImperfectGroup.add(light45B);

      // Two separated stone platforms with a rift between them
      const platL = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.35, 0.45, 7), darkSteelMat);
      platL.position.set(-2.2, 0.22, 0);
      this.stormImperfectGroup.add(platL);

      const platR = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.35, 0.45, 7), darkSteelMat);
      platR.position.set(2.2, 0.22, 0);
      this.stormImperfectGroup.add(platR);

      // Left figure under a dark storm cloud & crimson lightning ("Mệt mỏi, cáu giận, im lặng")
      const tiredSoulL = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), cyanCrystalMat);
      tiredSoulL.position.set(-2.2, 0.95, 0);
      this.stormImperfectGroup.add(tiredSoulL);

      const stormCloud = new THREE.Group();
      stormCloud.position.set(-2.2, 2.55, 0);
      [[-0.35, 0, 0, 0.45], [0.35, 0.05, 0, 0.42], [0, 0.22, 0.1, 0.52]].forEach(([cx, cy, cz, cr]) => {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 1), darkSteelMat);
        puff.position.set(cx, cy, cz);
        stormCloud.add(puff);
      });
      this.stormImperfectGroup.add(stormCloud);

      for (let r = 0; r < 8; r++) {
        const drop = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 5), roseQuartzMat);
        this.stormImperfectGroup.add(drop);
        this.stormRainDrops.push({ mesh: drop, baseX: -2.6 + (r % 4) * 0.28, phase: r / 8 });
      }

      // Center: Tangled Gyroscopic Knot of Misunderstandings ("Bất đồng quan điểm, hiểu lầm")
      const knotMats = [roseQuartzMat, magmaOrangeMat, amethystMat, cyanCrystalMat];
      for (let k = 0; k < 4; k++) {
        const kRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.95 + (k % 2) * 0.22, 0.045, 14, 48),
          knotMats[k]
        );
        kRing.position.set(0.2, 1.85, 0);
        this.stormImperfectGroup.add(kRing);
        this.stormMisunderstandingRings.push(kRing);
      }

      // =========================================================================
      // 46. SCENE: smile_mask_to_kintsugi_heart (at x = 846, z = 12)
      // "Thấu hiểu nỗi buồn phía sau nụ cười • Hai người biết nhận lỗi, thay đổi và trưởng thành"
      // Palette: Sunburst Smile revealing Sapphire Tear Core + Rose/Cyan Kintsugi Heart mended with Gold
      // =========================================================================
      this.kintsugiHeartGroup = new THREE.Group();
      this.kintsugiHeartGroup.position.set(846, 0, 12);
      this.scene.add(this.kintsugiHeartGroup);

      const light46A = new THREE.PointLight(0x38bdf8, 2.3, 18);
      light46A.position.set(-2.0, 3.8, 2.5);
      this.kintsugiHeartGroup.add(light46A);
      const light46B = new THREE.PointLight(0xfbbf24, 2.5, 18);
      light46B.position.set(2.0, 3.8, 2.5);
      this.kintsugiHeartGroup.add(light46B);

      // Left: Golden-Pink Sunburst Halo parting to reveal a Sapphire Sadness Tear Core inside
      this.empathySadnessCore = new THREE.Group();
      this.empathySadnessCore.position.set(-1.95, 1.95, 0);
      const tearCore = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.85, 16), cyanCrystalMat);
      tearCore.position.y = 0.1;
      this.empathySadnessCore.add(tearCore);
      const outerSmileArcL = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.07, 14, 32, Math.PI * 0.85),
        sunriseGoldMat
      );
      outerSmileArcL.rotation.z = Math.PI * 0.6;
      this.empathySadnessCore.add(outerSmileArcL);
      const outerSmileArcR = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.07, 14, 32, Math.PI * 0.85),
        sakuraPinkMat
      );
      outerSmileArcR.rotation.z = -Math.PI * 0.4;
      this.empathySadnessCore.add(outerSmileArcR);
      this.empathySadnessCore.add(makeColorHalo(this.cyanGlowTex, 2.2, 0.85));
      this.kintsugiHeartGroup.add(this.empathySadnessCore);

      // Right: 3D Kintsugi Crystal Heart (Rose & Cyan imperfect halves mended by glowing Golden Seams)
      this.kintsugiHeart = new THREE.Group();
      this.kintsugiHeart.position.set(1.85, 2.05, 0);

      const kHalfL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 0), roseQuartzMat);
      kHalfL.position.set(-0.26, 0.05, 0);
      kHalfL.rotation.z = 0.25;
      this.kintsugiHeart.add(kHalfL);

      const kHalfR = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 0), cyanCrystalMat);
      kHalfR.position.set(0.26, -0.05, 0);
      kHalfR.rotation.z = -0.25;
      this.kintsugiHeart.add(kHalfR);

      // Golden Kintsugi mending seams & rings binding the two imperfect halves together
      const goldSeam = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.06, 16, 42), sunriseGoldMat);
      goldSeam.rotation.y = Math.PI / 2;
      this.kintsugiHeart.add(goldSeam);
      const goldOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.04, 14, 48), emeraldMat);
      goldOrbit.rotation.x = Math.PI / 3;
      this.kintsugiHeart.add(goldOrbit);
      this.kintsugiHeart.add(makeColorHalo(this.glowTex, 2.8, 0.92));
      this.kintsugiHeartGroup.add(this.kintsugiHeart);

      // =========================================================================
      // 47. SCENE: listening_bridge_table (at x = 864, z = 12)
      // "Sau những bất đồng, cả hai vẫn muốn ngồi lại, lắng nghe và tìm cách hiểu nhau hơn"
      // Palette: Emerald-Pearl Round Table + Warm Pendant Lamp + Harmonious Cyan/Pink Sound Ripples
      // =========================================================================
      this.listeningTableGroup = new THREE.Group();
      this.listeningTableGroup.position.set(864, 0, 12);
      this.scene.add(this.listeningTableGroup);

      const light47A = new THREE.PointLight(0x10b981, 2.3, 18);
      light47A.position.set(0, 3.8, 2.5);
      this.listeningTableGroup.add(light47A);
      const light47B = new THREE.PointLight(0xf472b6, 2.0, 16);
      light47B.position.set(0, 2.5, 2.0);
      this.listeningTableGroup.add(light47B);

      // Round Table of Dialogue & Understanding
      const tablePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.45, 1.15, 24), sunriseGoldMat);
      tablePillar.position.y = 0.58;
      this.listeningTableGroup.add(tablePillar);
      const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.12, 36), emeraldMat);
      tableTop.position.y = 1.18;
      this.listeningTableGroup.add(tableTop);

      // Two Crystal Souls seated across from each other in calm conversation
      const listenerL = new THREE.Group();
      listenerL.position.set(-1.35, 1.75, 0);
      listenerL.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), cyanCrystalMat));
      listenerL.add(makeColorHalo(this.cyanGlowTex, 1.6, 0.85));
      this.listeningTableGroup.add(listenerL);

      const listenerR = new THREE.Group();
      listenerR.position.set(1.35, 1.75, 0);
      listenerR.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), sakuraPinkMat));
      listenerR.add(makeColorHalo(this.roseGlowTex, 1.6, 0.85));
      this.listeningTableGroup.add(listenerR);

      // Intersecting gentle soundwave rings of active listening over the table
      const waveMats = [cyanCrystalMat, sakuraPinkMat, emeraldMat, sunriseGoldMat];
      for (let w = 0; w < 4; w++) {
        const wRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.45 + w * 0.25, 0.035, 14, 48),
          waveMats[w]
        );
        wRing.position.set(0, 1.85, 0);
        this.listeningTableGroup.add(wRing);
        this.listeningWaves.push(wRing);
      }

      // =========================================================================
      // 48. SCENE: fireworks_vs_storm_lighthouse (at x = 882, z = 12)
      // "Không cần lúc nào cũng rực rỡ như pháo hoa • Chỉ là ngọn đèn nhỏ soi sáng qua những ngày giông bão"
      // Palette: Fading Magenta Fireworks on Left vs Steadfast Golden-Teal Lighthouse Sanctuary on Right
      // =========================================================================
      this.lighthouseGroup = new THREE.Group();
      this.lighthouseGroup.position.set(882, 0, 12);
      this.scene.add(this.lighthouseGroup);

      const light48A = new THREE.PointLight(0xc084fc, 2.0, 16);
      light48A.position.set(-2.2, 3.8, 2.5);
      this.lighthouseGroup.add(light48A);
      const light48B = new THREE.PointLight(0xfbbf24, 2.6, 20);
      light48B.position.set(1.8, 4.0, 2.5);
      this.lighthouseGroup.add(light48B);

      // Left: Ephemeral Bursting Fireworks that quickly fade ("Không cần lúc nào cũng như pháo hoa")
      for (let f = 0; f < 10; f++) {
        const spark = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.16, 0),
          f % 2 === 0 ? amethystMat : roseQuartzMat
        );
        this.lighthouseGroup.add(spark);
        this.ephemeralFireworks.push({ mesh: spark, index: f, phase: f / 10 });
      }

      // Right: Warm Steadfast Lighthouse & Safe Haven Dome ("Ngọn đèn nhỏ soi sáng qua giông bão")
      const lhBase = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.55, 0.42, 12), royalBlueMat);
      lhBase.position.set(1.65, 0.21, 0);
      this.lighthouseGroup.add(lhBase);

      const lhTower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.62, 2.35, 16), porcelainBlueMat);
      lhTower.position.set(1.65, 1.58, 0);
      this.lighthouseGroup.add(lhTower);

      const lhLanternRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.55, 16), sunriseGoldMat);
      lhLanternRoom.position.set(1.65, 2.95, 0);
      this.lighthouseGroup.add(lhLanternRoom);
      const lhHalo = makeColorHalo(this.glowTex, 3.0, 0.95);
      lhHalo.position.set(1.65, 2.95, 0);
      this.lighthouseGroup.add(lhHalo);

      const lhRoof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.55, 16), emeraldMat);
      lhRoof.position.set(1.65, 3.48, 0);
      this.lighthouseGroup.add(lhRoof);

      this.lighthouseBeam = new THREE.Group();
      this.lighthouseBeam.position.set(1.65, 2.95, 0);
      const beamCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.95, 2.6, 24, 1, true),
        this._createGlassMaterial(0.22, 0xfbbf24)
      );
      beamCone.rotation.z = Math.PI / 2.4;
      beamCone.position.set(-1.15, -0.45, 0);
      this.lighthouseBeam.add(beamCone);
      this.lighthouseGroup.add(this.lighthouseBeam);

      // =========================================================================
      // 49. SCENE: balanced_pillars_mutual_respect (at x = 900, z = 12)
      // "Tình yêu xứng đáng phải có sự tôn trọng, chân thành và cố gắng từ cả hai phía"
      // Palette: Twin Columns (Sapphire-Cyan & Sakura-Amethyst) supporting an Emerald-Gold Arch
      // =========================================================================
      this.mutualRespectGroup = new THREE.Group();
      this.mutualRespectGroup.position.set(900, 0, 12);
      this.scene.add(this.mutualRespectGroup);

      const light49A = new THREE.PointLight(0x38bdf8, 2.3, 18);
      light49A.position.set(-2.0, 3.8, 2.5);
      this.mutualRespectGroup.add(light49A);
      const light49B = new THREE.PointLight(0xf472b6, 2.3, 18);
      light49B.position.set(2.0, 3.8, 2.5);
      this.mutualRespectGroup.add(light49B);

      const colL = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 2.4, 16), cyanCrystalMat);
      colL.position.set(-1.55, 1.2, 0);
      this.mutualRespectGroup.add(colL);

      const colR = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 2.4, 16), sakuraPinkMat);
      colR.position.set(1.55, 1.2, 0);
      this.mutualRespectGroup.add(colR);

      const mutualArch = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.14, 16, 48, Math.PI),
        emeraldMat
      );
      mutualArch.position.set(0, 2.35, 0);
      this.mutualRespectGroup.add(mutualArch);

      const keystone = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 1), sunriseGoldMat);
      keystone.position.set(0, 3.9, 0);
      this.mutualRespectGroup.add(keystone);
      const ksHalo = makeColorHalo(this.glowTex, 2.4, 0.9);
      ksHalo.position.set(0, 3.9, 0);
      this.mutualRespectGroup.add(ksHalo);

      // Two-way flowing energy orbs rising equally from both pillars into the keystone
      for (let e = 0; e < 10; e++) {
        const isLeft = e % 2 === 0;
        const eOrb = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.16, 0),
          isLeft ? cyanCrystalMat : sakuraPinkMat
        );
        this.mutualRespectGroup.add(eOrb);
        this.mutualEnergyOrbs.push({ mesh: eOrb, isLeft, phase: e / 10 });
      }

      // =========================================================================
      // 50. SCENE: two_imperfect_puzzle_spheres (at x = 918, z = 12)
      // "Hai con người không hoàn hảo vẫn lựa chọn thấu hiểu, yêu thương và cùng trở thành phiên bản tốt hơn"
      // Palette: Two Incomplete Crescent Hemispheres (Cyan-Emerald & Pink-Gold) Completing Each Other
      // =========================================================================
      this.imperfectPuzzleGroup = new THREE.Group();
      this.imperfectPuzzleGroup.position.set(918, 0, 12);
      this.scene.add(this.imperfectPuzzleGroup);

      const light50A = new THREE.PointLight(0x10b981, 2.3, 18);
      light50A.position.set(-2.0, 4.0, 2.5);
      this.imperfectPuzzleGroup.add(light50A);
      const light50B = new THREE.PointLight(0xf472b6, 2.3, 18);
      light50B.position.set(2.0, 4.0, 2.5);
      this.imperfectPuzzleGroup.add(light50B);

      // Multi-colored pedestal steps of daily growth ("Phiên bản tốt hơn mỗi ngày")
      const stepMats = [royalBlueMat, emeraldMat, amethystMat, sunriseGoldMat];
      for (let s = 0; s < 4; s++) {
        const pDisk = new THREE.Mesh(
          new THREE.CylinderGeometry(1.75 - s * 0.28, 1.9 - s * 0.28, 0.22, 32),
          stepMats[s]
        );
        pDisk.position.y = 0.11 + s * 0.22;
        this.imperfectPuzzleGroup.add(pDisk);
      }

      // Left Imperfect Crescent Half (Cyan & Emerald)
      this.imperfectHalfL = new THREE.Group();
      this.imperfectHalfL.position.set(-0.35, 2.25, 0);
      const arcL = new THREE.Mesh(
        new THREE.TorusGeometry(0.92, 0.26, 18, 40, Math.PI * 1.15),
        cyanCrystalMat
      );
      arcL.rotation.z = Math.PI * 0.42;
      this.imperfectHalfL.add(arcL);
      const innerGemL = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), emeraldMat);
      innerGemL.position.x = -0.25;
      this.imperfectHalfL.add(innerGemL);
      this.imperfectHalfL.add(makeColorHalo(this.cyanGlowTex, 2.3, 0.85));
      this.imperfectPuzzleGroup.add(this.imperfectHalfL);

      // Right Imperfect Crescent Half (Sakura Pink & Sunrise Gold)
      this.imperfectHalfR = new THREE.Group();
      this.imperfectHalfR.position.set(0.35, 2.25, 0);
      const arcR = new THREE.Mesh(
        new THREE.TorusGeometry(0.92, 0.26, 18, 40, Math.PI * 1.15),
        sakuraPinkMat
      );
      arcR.rotation.z = -Math.PI * 0.58;
      this.imperfectHalfR.add(arcR);
      const innerGemR = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), sunriseGoldMat);
      innerGemR.position.x = 0.25;
      this.imperfectHalfR.add(innerGemR);
      this.imperfectHalfR.add(makeColorHalo(this.roseGlowTex, 2.3, 0.85));
      this.imperfectPuzzleGroup.add(this.imperfectHalfR);

      // =========================================================================
      // 51. SCENE: ordinary_days_starlight_walk (at x = 936, z = 12)
      // "Tìm được người muốn cùng mình đi qua những ngày bình thường nhất đã là điều vô cùng đáng quý"
      // Palette: Lantern-Lit Emerald & Gold Boulevard + Sakura & Cyan Trees + Couple Walking Together
      // =========================================================================
      this.ordinaryDaysGroup = new THREE.Group();
      this.ordinaryDaysGroup.position.set(936, 0, 12);
      this.scene.add(this.ordinaryDaysGroup);

      const light51A = new THREE.PointLight(0xfbbf24, 2.4, 20);
      light51A.position.set(0, 4.2, 2.5);
      this.ordinaryDaysGroup.add(light51A);
      const light51B = new THREE.PointLight(0xf472b6, 2.2, 18);
      light51B.position.set(-2.2, 3.5, 1.5);
      this.ordinaryDaysGroup.add(light51B);
      const light51C = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light51C.position.set(2.2, 3.5, 1.5);
      this.ordinaryDaysGroup.add(light51C);

      // Winding Cobblestone-Crystal Path of Ordinary Days leading to a Sunrise Horizon Arch
      for (let i = 0; i < 12; i++) {
        const u = i / 11;
        const pz = 2.4 - u * 5.8;
        const py = 0.12 + u * 1.45;
        const roadTile = new THREE.Mesh(
          new THREE.BoxGeometry(1.75 - u * 0.35, 0.14, 0.42),
          i % 2 === 0 ? emeraldMat : royalBlueMat
        );
        roadTile.position.set(0, py, pz);
        this.ordinaryDaysGroup.add(roadTile);

        if (i % 3 === 1) {
          [-1.45, 1.45].forEach((sideX, sIdx) => {
            const tree = new THREE.Group();
            tree.position.set(sideX, py, pz);
            const tTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.75, 8), sunriseGoldMat);
            tTrunk.position.y = 0.38;
            tree.add(tTrunk);
            const tCrown = new THREE.Mesh(
              new THREE.OctahedronGeometry(0.42, 1),
              sIdx === 0 ? sakuraPinkMat : cyanCrystalMat
            );
            tCrown.position.y = 0.95;
            tree.add(tCrown);
            tree.add(makeColorHalo(sIdx === 0 ? this.roseGlowTex : this.cyanGlowTex, 1.45, 0.8));
            this.ordinaryDaysGroup.add(tree);
          });
        }
      }

      // Sunrise Horizon Arch at the end of the path
      const horizonArch = new THREE.Mesh(
        new THREE.TorusGeometry(1.65, 0.1, 16, 48, Math.PI),
        sunriseGoldMat
      );
      horizonArch.position.set(0, 1.65, -3.5);
      this.ordinaryDaysGroup.add(horizonArch);

      // Two Souls walking side-by-side along the path
      this.ordinaryWalkCouple = new THREE.Group();
      const walkerL = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), cyanCrystalMat);
      walkerL.position.x = -0.36;
      this.ordinaryWalkCouple.add(walkerL);
      const walkerR = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), sakuraPinkMat);
      walkerR.position.x = 0.36;
      this.ordinaryWalkCouple.add(walkerR);
      const handLink = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 12, 32), sunriseGoldMat);
      handLink.rotation.x = Math.PI / 2;
      this.ordinaryWalkCouple.add(handLink);
      this.ordinaryWalkCouple.add(makeColorHalo(this.glowTex, 2.2, 0.9));
      this.ordinaryDaysGroup.add(this.ordinaryWalkCouple);

      // Floating warm firefly lanterns along the boulevard
      for (let f = 0; f < 10; f++) {
        const fOrb = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.13, 0),
          f % 2 === 0 ? sunriseGoldMat : amethystMat
        );
        this.ordinaryDaysGroup.add(fOrb);
        this.ordinaryLanternOrbs.push({ mesh: fOrb, index: f, phase: f / 10 });
      }
    }

    /**
     * Build 9 diverse, richly colored, multi-material 3D dioramas for
     * "Áp Lực Công Việc – Đằng Sau Hai Chữ 'Ổn Mà'" (scenes 52..60 at x = 954..1098, z = 12)
     */
    _buildWorkPressureMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25,
        reflectivity: 0.95
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const magmaOrangeMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xc2410c,
        emissiveIntensity: 0.58,
        roughness: 0.3,
        metalness: 0.45
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });
      const royalBlueMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.55
      });
      const sunriseGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.62,
        roughness: 0.14,
        metalness: 0.65
      });

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

      // =========================================================================
      // 52. SCENE: silent_bed_dropped_bag (at x = 954, z = 12)
      // "Trở về nhà sau một ngày làm việc dài… Đặt chiếc túi xuống, ngồi lặng im trên giường"
      // Palette: Midnight Indigo Room, Amethyst Bed, Dropped Amber Briefcase, Dim Cyan Soul
      // =========================================================================
      this.silentBedGroup = new THREE.Group();
      this.silentBedGroup.position.set(954, 0, 12);
      this.scene.add(this.silentBedGroup);

      const light52A = new THREE.PointLight(0x38bdf8, 2.0, 18);
      light52A.position.set(-1.5, 4.0, 2.0);
      this.silentBedGroup.add(light52A);
      const light52B = new THREE.PointLight(0xc084fc, 1.8, 18);
      light52B.position.set(1.8, 3.2, 1.5);
      this.silentBedGroup.add(light52B);

      // Bedroom platform & tall night window frame
      const roomBase = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.22, 4.0), darkSteelMat);
      roomBase.position.set(0, 0.11, 0);
      this.silentBedGroup.add(roomBase);

      const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.12), royalBlueMat);
      windowFrame.position.set(-1.2, 2.2, -1.75);
      this.silentBedGroup.add(windowFrame);

      // Bed frame & soft mattress
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.42, 1.85), darkSteelMat);
      bedFrame.position.set(0.85, 0.42, -0.25);
      this.silentBedGroup.add(bedFrame);
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.28, 1.72), amethystMat);
      mattress.position.set(0.85, 0.75, -0.25);
      this.silentBedGroup.add(mattress);
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.35, 1.85), royalBlueMat);
      headboard.position.set(2.05, 0.95, -0.25);
      this.silentBedGroup.add(headboard);

      // Dropped work bag / briefcase on the floor beside the bed
      const droppedBag = new THREE.Group();
      droppedBag.position.set(-1.15, 0.42, 0.85);
      droppedBag.rotation.set(0.35, 0.42, -0.48);
      const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.62, 0.26), magmaOrangeMat);
      droppedBag.add(bagBody);
      const bagHandle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 10, 24, Math.PI), sunriseGoldMat);
      bagHandle.position.y = 0.32;
      droppedBag.add(bagHandle);
      this.silentBedGroup.add(droppedBag);

      // Exhausted Soul sitting silently on the edge of the bed
      this.silentBedSoul = new THREE.Group();
      this.silentBedSoul.position.set(0.35, 1.38, 0.42);
      const tiredBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.72, 16), porcelainBlueMat);
      tiredBody.rotation.x = 0.22;
      this.silentBedSoul.add(tiredBody);
      const tiredHead = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 1), cyanCrystalMat);
      tiredHead.position.set(0, 0.56, 0.14);
      tiredHead.rotation.x = 0.35;
      this.silentBedSoul.add(tiredHead);
      this.silentBedSoul.add(makeColorHalo(this.cyanGlowTex, 1.8, 0.65));
      this.silentBedGroup.add(this.silentBedSoul);

      // Low-energy / heavy exhaustion rings hovering above the soul
      for (let r = 0; r < 3; r++) {
        const tRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.55 + r * 0.26, 0.025, 12, 36),
          r % 2 === 0 ? amethystMat : roseQuartzMat
        );
        tRing.position.set(0.35, 2.35 + r * 0.22, 0.42);
        tRing.rotation.x = Math.PI / 2;
        this.silentBedGroup.add(tRing);
        this.tiredBatteryRings.push(tRing);
      }

      // =========================================================================
      // 53. SCENE: dawn_rush_deadline_storm (at x = 972, z = 12)
      // "Sáng thức dậy khi trời còn chưa sáng. Chen chúc dòng người… Cuộc họp kéo dài, deadline liên tục"
      // Palette: Pre-Dawn Royal Blue, Rushing Cyan/Gold Commuters, Magma-Red Deadline Clocks & Violet Blocks
      // =========================================================================
      this.dawnRushGroup = new THREE.Group();
      this.dawnRushGroup.position.set(972, 0, 12);
      this.scene.add(this.dawnRushGroup);

      const light53A = new THREE.PointLight(0xf97316, 2.5, 20);
      light53A.position.set(1.5, 4.2, 2.0);
      this.dawnRushGroup.add(light53A);
      const light53B = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light53B.position.set(-2.0, 3.5, 2.0);
      this.dawnRushGroup.add(light53B);

      // Central Office Tower Monolith
      const officeTower = new THREE.Mesh(new THREE.BoxGeometry(1.65, 3.6, 1.45), darkSteelMat);
      officeTower.position.set(1.15, 1.8, -0.35);
      this.dawnRushGroup.add(officeTower);

      // Glowing office windows grid
      for (let wy = 0; wy < 5; wy++) {
        for (let wx = -1; wx <= 1; wx++) {
          const winMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.34, 0.05),
            (wy + wx) % 2 === 0 ? cyanCrystalMat : sunriseGoldMat
          );
          winMesh.position.set(1.15 + wx * 0.44, 0.65 + wy * 0.62, 0.39);
          this.dawnRushGroup.add(winMesh);
        }
      }

      // Rushing Commuters stream on the left bridge
      for (let c = 0; c < 12; c++) {
        const comm = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.18, 0),
          c % 3 === 0 ? cyanCrystalMat : c % 3 === 1 ? amethystMat : porcelainBlueMat
        );
        this.dawnRushGroup.add(comm);
        this.dawnCommuters.push({ mesh: comm, index: c, phase: c / 12 });
      }

      // Giant Deadline Clock & Swirling Pressure Vortex around the office tower
      const deadlineClock = new THREE.Group();
      deadlineClock.position.set(1.15, 2.45, 0.75);
      const clockRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.06, 16, 48), magmaOrangeMat);
      deadlineClock.add(clockRing);
      const hand1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.06), roseQuartzMat);
      hand1.position.y = 0.35;
      const handPivot1 = new THREE.Group();
      handPivot1.add(hand1);
      deadlineClock.add(handPivot1);
      const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.58, 0.06), sunriseGoldMat);
      hand2.position.y = 0.24;
      const handPivot2 = new THREE.Group();
      handPivot2.add(hand2);
      deadlineClock.add(handPivot2);
      this.deadlineClockHands.push(handPivot1, handPivot2);
      deadlineClock.add(makeColorHalo(this.redGlowTex, 2.6, 0.85));
      this.dawnRushGroup.add(deadlineClock);

      // Swirling Expectation & Meeting Rings
      for (let sr = 0; sr < 3; sr++) {
        const sRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.85 + sr * 0.35, 0.035, 14, 48),
          sr === 0 ? roseQuartzMat : sr === 1 ? amethystMat : magmaOrangeMat
        );
        sRing.position.set(1.15, 2.2, -0.15);
        this.dawnRushGroup.add(sRing);
        this.deadlineStormRings.push(sRing);
      }

      // =========================================================================
      // 54. SCENE: bills_and_family_expectations (at x = 990, z = 12)
      // "Muốn dừng lại một chút… Nhưng nhớ đến tiền nhà, hóa đơn và những người đặt hy vọng vào mình"
      // Palette: Coral-Orange Invoices (Left), Warm Rose-Gold Family Hope Orbs (Right), Emerald Forward Path
      // =========================================================================
      this.billsFamilyGroup = new THREE.Group();
      this.billsFamilyGroup.position.set(990, 0, 12);
      this.scene.add(this.billsFamilyGroup);

      const light54A = new THREE.PointLight(0xfbbf24, 2.4, 20);
      light54A.position.set(1.6, 4.0, 2.2);
      this.billsFamilyGroup.add(light54A);
      const light54B = new THREE.PointLight(0xf43f5e, 2.1, 18);
      light54B.position.set(-1.8, 3.5, 2.0);
      this.billsFamilyGroup.add(light54B);
      const light54C = new THREE.PointLight(0x10b981, 2.0, 18);
      light54C.position.set(0, 2.5, 2.5);
      this.billsFamilyGroup.add(light54C);

      // Ascending Emerald & Gold Path of Perseverance
      for (let s = 0; s < 9; s++) {
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.15, 0.16, 0.45),
          s % 2 === 0 ? emeraldMat : royalBlueMat
        );
        stepMesh.position.set(0, 0.15 + s * 0.24, 1.8 - s * 0.55);
        this.billsFamilyGroup.add(stepMesh);
      }

      // Left side: Floating Invoice / Rent / Bill Tablets
      for (let b = 0; b < 5; b++) {
        const billGroup = new THREE.Group();
        const tablet = new THREE.Mesh(
          new THREE.BoxGeometry(0.68, 0.88, 0.08),
          b % 2 === 0 ? magmaOrangeMat : roseQuartzMat
        );
        billGroup.add(tablet);
        const lineBar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.1), sunriseGoldMat);
        lineBar.position.y = 0.18;
        billGroup.add(lineBar);
        this.billsFamilyGroup.add(billGroup);
        this.billTablets.push({ group: billGroup, index: b, phase: b / 5 });
      }

      // Right side: Warm Golden & Rose-Pink Family Hope Orbs
      for (let h = 0; h < 6; h++) {
        const hopeGroup = new THREE.Group();
        const hopeCore = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.28, 1),
          h % 2 === 0 ? sunriseGoldMat : sakuraPinkMat
        );
        hopeGroup.add(hopeCore);
        hopeGroup.add(makeColorHalo(h % 2 === 0 ? this.glowTex : this.roseGlowTex, 1.35, 0.85));
        this.billsFamilyGroup.add(hopeGroup);
        this.familyHopeOrbs.push({ group: hopeGroup, index: h, phase: h / 6 });
      }

      // Traveler Soul rising and continuing along the path
      this.perseveringWalker = new THREE.Group();
      const pCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), cyanCrystalMat);
      this.perseveringWalker.add(pCore);
      this.perseveringWalker.add(makeColorHalo(this.cyanGlowTex, 1.9, 0.9));
      this.billsFamilyGroup.add(this.perseveringWalker);

      // =========================================================================
      // 55. SCENE: smiling_mask_hidden_tears (at x = 1008, z = 12)
      // "Mỉm cười trả lời: 'Ổn mà.' Đằng sau hai chữ ấy là bao nhiêu đêm mất ngủ, cảm xúc giấu kín"
      // Palette: Bright Sunrise-Gold Smiling Mask in Front vs Sapphire Tears & Amethyst Vortex Behind
      // =========================================================================
      this.smilingMaskGroup = new THREE.Group();
      this.smilingMaskGroup.position.set(1008, 0, 12);
      this.scene.add(this.smilingMaskGroup);

      const light55A = new THREE.PointLight(0xfbbf24, 2.4, 18);
      light55A.position.set(0, 3.5, 3.2);
      this.smilingMaskGroup.add(light55A);
      const light55B = new THREE.PointLight(0x38bdf8, 2.4, 18);
      light55B.position.set(-1.5, 3.5, -2.5);
      this.smilingMaskGroup.add(light55B);
      const light55C = new THREE.PointLight(0xc084fc, 2.2, 18);
      light55C.position.set(1.5, 3.0, -2.5);
      this.smilingMaskGroup.add(light55C);

      // Pedestal
      const maskPedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.15, 0.28, 36), darkSteelMat);
      maskPedestal.position.y = 0.14;
      this.smilingMaskGroup.add(maskPedestal);

      // Front: Bright Golden-Porcelain Smiling Mask ("Ổn mà")
      this.smilingMaskFront = new THREE.Group();
      this.smilingMaskFront.position.set(0, 2.15, 0.75);
      const maskShield = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 0.85, 1.65, 24, 1, false, -Math.PI * 0.42, Math.PI * 0.84),
        sunriseGoldMat
      );
      this.smilingMaskFront.add(maskShield);
      // Smiling arc & eyes on the mask
      const smileArc = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.055, 12, 32, Math.PI),
        sakuraPinkMat
      );
      smileArc.rotation.z = Math.PI;
      smileArc.position.set(0, -0.15, 1.02);
      this.smilingMaskFront.add(smileArc);
      [-0.34, 0.34].forEach((ex) => {
        const eyeArc = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 10, 24, Math.PI), cyanCrystalMat);
        eyeArc.position.set(ex, 0.25, 1.0);
        this.smilingMaskFront.add(eyeArc);
      });
      this.smilingMaskFront.add(makeColorHalo(this.glowTex, 2.6, 0.85));
      this.smilingMaskGroup.add(this.smilingMaskFront);

      // Behind the mask: Sleepless Crescent Moon, Dark-Violet Emotional Vortex & Falling Sapphire Tears
      const hiddenCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 1), amethystMat);
      hiddenCore.position.set(0, 2.15, -0.65);
      this.smilingMaskGroup.add(hiddenCore);

      for (let t = 0; t < 14; t++) {
        const tearDrop = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.16, 0),
          t % 3 === 0 ? cyanCrystalMat : t % 3 === 1 ? amethystMat : roseQuartzMat
        );
        this.smilingMaskGroup.add(tearDrop);
        this.hiddenSleeplessTears.push({ mesh: tearDrop, index: t, phase: t / 14 });
      }

      // =========================================================================
      // 56. SCENE: walking_through_unresolved_maze (at x = 1026, z = 12)
      // "Trưởng thành là học cách bước tiếp, ngay cả khi trong lòng có quá nhiều điều chưa thể giải quyết"
      // Palette: Shifting Amethyst/Royal-Blue Unresolved Labyrinth Blocks + Emerald/Gold Forward Bridge
      // =========================================================================
      this.unresolvedMazeGroup = new THREE.Group();
      this.unresolvedMazeGroup.position.set(1026, 0, 12);
      this.scene.add(this.unresolvedMazeGroup);

      const light56A = new THREE.PointLight(0x10b981, 2.4, 20);
      light56A.position.set(0, 4.0, 2.0);
      this.unresolvedMazeGroup.add(light56A);
      const light56B = new THREE.PointLight(0xc084fc, 2.2, 18);
      light56B.position.set(-2.2, 3.2, 1.0);
      this.unresolvedMazeGroup.add(light56B);
      const light56C = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light56C.position.set(2.2, 3.2, 1.0);
      this.unresolvedMazeGroup.add(light56C);

      // Glowing straight Emerald & Gold walkway cutting through the maze
      const straightBridge = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.18, 6.2), emeraldMat);
      straightBridge.position.set(0, 0.45, -0.4);
      this.unresolvedMazeGroup.add(straightBridge);

      // Shifting Unresolved Puzzle Monoliths & Tangled Rings on both sides of the bridge
      for (let m = 0; m < 10; m++) {
        const side = m % 2 === 0 ? -1 : 1;
        const mz = 2.0 - Math.floor(m / 2) * 1.15;
        const block = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 1.45 + (m % 3) * 0.45, 0.65),
          m % 3 === 0 ? amethystMat : m % 3 === 1 ? royalBlueMat : roseQuartzMat
        );
        const baseX = side * (1.45 + (m % 2) * 0.55);
        const baseY = 1.15 + (m % 3) * 0.35;
        block.position.set(baseX, baseY, mz);
        this.unresolvedMazeGroup.add(block);
        this.unresolvedMazeBlocks.push({ mesh: block, baseX, baseY, baseZ: mz, index: m, phase: m / 10 });
      }

      // Mature Soul walking steadily forward along the emerald bridge
      this.mazeWalkerSoul = new THREE.Group();
      const mwCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), sunriseGoldMat);
      this.mazeWalkerSoul.add(mwCore);
      const mwRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 12, 36), cyanCrystalMat);
      mwRing.rotation.x = Math.PI / 2;
      this.mazeWalkerSoul.add(mwRing);
      this.mazeWalkerSoul.add(makeColorHalo(this.glowTex, 2.1, 0.9));
      this.unresolvedMazeGroup.add(this.mazeWalkerSoul);

      // =========================================================================
      // 57. SCENE: not_a_machine_human_heart (at x = 1044, z = 12)
      // "Bạn không phải một cỗ máy… Không cần lúc nào cũng phải năng suất… Chỉ cần hoàn thành việc cần thiết"
      // Palette: Parting Steel/Orange Machine Gears + Warm Beating Rose-Quartz Heart + Emerald Stars
      // =========================================================================
      this.notMachineGroup = new THREE.Group();
      this.notMachineGroup.position.set(1044, 0, 12);
      this.scene.add(this.notMachineGroup);

      const light57A = new THREE.PointLight(0xf43f5e, 2.6, 20);
      light57A.position.set(0, 4.0, 2.5);
      this.notMachineGroup.add(light57A);
      const light57B = new THREE.PointLight(0x10b981, 2.2, 18);
      light57B.position.set(-2.0, 3.2, 1.5);
      this.notMachineGroup.add(light57B);
      const light57C = new THREE.PointLight(0xfbbf24, 2.2, 18);
      light57C.position.set(2.0, 3.2, 1.5);
      this.notMachineGroup.add(light57C);

      // Left & Right Heavy Machine Cogs parting open
      [-1, 1].forEach((dir, gIdx) => {
        const gearGroup = new THREE.Group();
        gearGroup.position.set(dir * 1.75, 2.15, -0.2);
        const gearRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.18, 16, 32), darkSteelMat);
        gearGroup.add(gearRing);
        for (let t = 0; t < 8; t++) {
          const ang = (t / 8) * Math.PI * 2;
          const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.22), magmaOrangeMat);
          tooth.position.set(Math.cos(ang) * 1.18, Math.sin(ang) * 1.18, 0);
          tooth.rotation.z = ang;
          gearGroup.add(tooth);
        }
        this.notMachineGroup.add(gearGroup);
        this.partingMachineGears.push({ group: gearGroup, dir, index: gIdx });
      });

      // Center: Warm Beating Human Heart Crystal (Rose-Quartz & Sakura Pink)
      this.beatingHumanHeart = new THREE.Group();
      this.beatingHumanHeart.position.set(0, 2.15, 0.25);
      const heartCenter = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 2), roseQuartzMat);
      this.beatingHumanHeart.add(heartCenter);
      const heartAura1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 16, 48), sakuraPinkMat);
      this.beatingHumanHeart.add(heartAura1);
      const heartAura2 = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.035, 16, 48), sunriseGoldMat);
      heartAura2.rotation.y = Math.PI / 2;
      this.beatingHumanHeart.add(heartAura2);
      this.beatingHumanHeart.add(makeColorHalo(this.roseGlowTex, 3.1, 0.95));
      this.notMachineGroup.add(this.beatingHumanHeart);

      // Floating Emerald & Cyan Essential Checkmark Jewels around the heart
      for (let c = 0; c < 6; c++) {
        const star = new THREE.Group();
        const sGem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.24, 1),
          c % 2 === 0 ? emeraldMat : cyanCrystalMat
        );
        star.add(sGem);
        star.add(makeColorHalo(c % 2 === 0 ? this.emeraldGlowTex : this.cyanGlowTex, 1.2, 0.85));
        this.notMachineGroup.add(star);
        this.essentialCheckStars.push({ group: star, index: c, phase: c / 6 });
      }

      // =========================================================================
      // 58. SCENE: bad_day_not_failed_life (at x = 1062, z = 12)
      // "Đừng để một ngày tồi tệ khiến bạn nghĩ cả cuộc đời thất bại… Công việc không phải toàn bộ con người bạn"
      // Palette: 1 Small Stormy Tile vs Vast Multi-Colored Mosaic of Life & Radiant Diamond Identity Core
      // =========================================================================
      this.badDayMosaicGroup = new THREE.Group();
      this.badDayMosaicGroup.position.set(1062, 0, 12);
      this.scene.add(this.badDayMosaicGroup);

      const light58A = new THREE.PointLight(0x38bdf8, 2.5, 20);
      light58A.position.set(0, 4.5, 2.5);
      this.badDayMosaicGroup.add(light58A);
      const light58B = new THREE.PointLight(0xfbbf24, 2.3, 18);
      light58B.position.set(2.0, 3.5, 1.5);
      this.badDayMosaicGroup.add(light58B);
      const light58C = new THREE.PointLight(0xf472b6, 2.2, 18);
      light58C.position.set(-2.0, 3.5, 1.5);
      this.badDayMosaicGroup.add(light58C);

      // Circular Mosaic of Life Tiles (1 dark stormy tile vs 23 vibrant multi-colored tiles)
      const mosaicMats = [emeraldMat, cyanCrystalMat, sunriseGoldMat, sakuraPinkMat, amethystMat, royalBlueMat];
      for (let t = 0; t < 24; t++) {
        const ang = (t / 24) * Math.PI * 2;
        const ringIdx = t % 2;
        const rad = ringIdx === 0 ? 1.55 : 2.35;
        const isBadDayTile = t === 0;
        const tileMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.58, isBadDayTile ? 0.14 : 0.26, 0.58),
          isBadDayTile ? magmaOrangeMat : mosaicMats[t % mosaicMats.length]
        );
        const tx = Math.cos(ang) * rad;
        const tz = Math.sin(ang) * rad;
        tileMesh.position.set(tx, 0.35, tz);
        this.badDayMosaicGroup.add(tileMesh);
        this.mosaicLifeTiles.push({ mesh: tileMesh, baseX: tx, baseZ: tz, isBadDayTile, index: t, phase: t / 24 });
      }

      // Central Multifaceted Identity & Self-Worth Core rising proudly above the mosaic
      this.identityWorthCore = new THREE.Group();
      this.identityWorthCore.position.set(0, 2.35, 0);
      const diamondCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.78, 1), cyanCrystalMat);
      this.identityWorthCore.add(diamondCore);
      const goldOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.045, 16, 48), sunriseGoldMat);
      goldOrbit.rotation.x = Math.PI / 3;
      this.identityWorthCore.add(goldOrbit);
      const roseOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.04, 16, 48), sakuraPinkMat);
      roseOrbit.rotation.y = Math.PI / 3;
      this.identityWorthCore.add(roseOrbit);
      this.identityWorthCore.add(makeColorHalo(this.cyanGlowTex, 3.2, 0.92));
      this.badDayMosaicGroup.add(this.identityWorthCore);

      // =========================================================================
      // 59. SCENE: rest_recharge_sanctuary (at x = 1080, z = 12)
      // "Cho phép bản thân nghỉ ngơi… Ăn bữa cơm ngon, ngủ giấc sâu, gọi người thương… Lấy lại sức lực"
      // Palette: Emerald Recharging Crystal Pillar + Golden Crescent Moon + Warm Meal Bowl + Rose Call Wave
      // =========================================================================
      this.restSanctuaryGroup = new THREE.Group();
      this.restSanctuaryGroup.position.set(1080, 0, 12);
      this.scene.add(this.restSanctuaryGroup);

      const light59A = new THREE.PointLight(0x10b981, 2.6, 20);
      light59A.position.set(0, 4.2, 2.5);
      this.restSanctuaryGroup.add(light59A);
      const light59B = new THREE.PointLight(0xfbbf24, 2.3, 18);
      light59B.position.set(-2.0, 3.2, 1.5);
      this.restSanctuaryGroup.add(light59B);
      const light59C = new THREE.PointLight(0xf472b6, 2.3, 18);
      light59C.position.set(2.0, 3.2, 1.5);
      this.restSanctuaryGroup.add(light59C);

      // Sanctuary Base
      const sancBase = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.6, 0.28, 36), royalBlueMat);
      sancBase.position.y = 0.14;
      this.restSanctuaryGroup.add(sancBase);

      // Central Soul Recharging Crystal Pillar
      const batteryShell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 2.4, 24, 1, true),
        porcelainBlueMat
      );
      batteryShell.position.set(0, 1.55, 0);
      this.restSanctuaryGroup.add(batteryShell);

      const batteryCore = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 2.1, 20), emeraldMat);
      batteryCore.position.set(0, 1.5, 0);
      this.restSanctuaryGroup.add(batteryCore);

      // Rising Emerald & Gold Recharge Rings inside/around the pillar
      for (let r = 0; r < 5; r++) {
        const eRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.76, 0.045, 14, 40),
          r % 2 === 0 ? emeraldMat : sunriseGoldMat
        );
        eRing.rotation.x = Math.PI / 2;
        this.restSanctuaryGroup.add(eRing);
        this.rechargeEnergyRings.push({ mesh: eRing, index: r, phase: r / 5 });
      }

      // Orbiting Self-Care Icons (Warm Meal Bowl, Deep Sleep Crescent Moon, Loved One Heart Call, Peace Lotus)
      const careMats = [sunriseGoldMat, cyanCrystalMat, roseQuartzMat, amethystMat];
      const careTexs = [this.glowTex, this.cyanGlowTex, this.roseGlowTex, this.violetGlowTex];
      for (let k = 0; k < 4; k++) {
        const careOrb = new THREE.Group();
        const mesh =
          k === 1
            ? new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.1, 14, 32, Math.PI * 1.35), careMats[k])
            : new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), careMats[k]);
        careOrb.add(mesh);
        careOrb.add(makeColorHalo(careTexs[k], 1.55, 0.9));
        this.restSanctuaryGroup.add(careOrb);
        this.sanctuaryCareOrbs.push({ group: careOrb, index: k, phase: k / 4 });
      }

      // =========================================================================
      // 60. SCENE: work_for_life_love_yourself (at x = 1098, z = 12)
      // "Đi làm để xây dựng cuộc sống tốt đẹp hơn… Cảm ơn bạn vì đã cố gắng… Đừng quên yêu thương chính mình"
      // Palette: Blooming Multi-Colored Life Garden + Rose-Quartz & Sunrise-Gold Self-Love Heart Crown
      // =========================================================================
      this.loveYourselfGroup = new THREE.Group();
      this.loveYourselfGroup.position.set(1098, 0, 12);
      this.scene.add(this.loveYourselfGroup);

      const light60A = new THREE.PointLight(0xfbbf24, 2.6, 22);
      light60A.position.set(0, 4.5, 2.8);
      this.loveYourselfGroup.add(light60A);
      const light60B = new THREE.PointLight(0xf472b6, 2.4, 20);
      light60B.position.set(-2.2, 3.5, 1.8);
      this.loveYourselfGroup.add(light60B);
      const light60C = new THREE.PointLight(0x10b981, 2.4, 20);
      light60C.position.set(2.2, 3.5, 1.8);
      this.loveYourselfGroup.add(light60C);

      // Stepped Sanctuary Platform of a Beautiful Life
      const lifeTier1 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 0.26, 40), emeraldMat);
      lifeTier1.position.y = 0.13;
      this.loveYourselfGroup.add(lifeTier1);
      const lifeTier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.0, 0.24, 36), royalBlueMat);
      lifeTier2.position.y = 0.38;
      this.loveYourselfGroup.add(lifeTier2);

      // Four Blooming Crystal Trees around the Life Garden (Sakura Pink, Cyan, Gold, Amethyst)
      const treeColors = [sakuraPinkMat, cyanCrystalMat, sunriseGoldMat, amethystMat];
      const treeHalos = [this.roseGlowTex, this.cyanGlowTex, this.glowTex, this.violetGlowTex];
      for (let tr = 0; tr < 4; tr++) {
        const ang = (tr / 4) * Math.PI * 2 + Math.PI / 4;
        const tx = Math.cos(ang) * 1.95;
        const tz = Math.sin(ang) * 1.55;
        const tGroup = new THREE.Group();
        tGroup.position.set(tx, 0.26, tz);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.85, 8), sunriseGoldMat);
        trunk.position.y = 0.42;
        tGroup.add(trunk);
        const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 1), treeColors[tr]);
        crown.position.y = 1.05;
        tGroup.add(crown);
        tGroup.add(makeColorHalo(treeHalos[tr], 1.55, 0.85));
        this.loveYourselfGroup.add(tGroup);
      }

      // Central Self-Love & Gratitude Heart-Crown ("Cảm ơn bạn vì đã cố gắng đến tận bây giờ")
      this.selfLoveHeartCrown = new THREE.Group();
      this.selfLoveHeartCrown.position.set(0, 2.35, 0);
      const heartGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 2), roseQuartzMat);
      this.selfLoveHeartCrown.add(heartGem);
      const crownRing = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.055, 16, 48), sunriseGoldMat);
      crownRing.rotation.x = Math.PI / 2.4;
      this.selfLoveHeartCrown.add(crownRing);
      const emeraldHaloRing = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.04, 16, 48), emeraldMat);
      emeraldHaloRing.rotation.y = Math.PI / 3;
      this.selfLoveHeartCrown.add(emeraldHaloRing);
      this.selfLoveHeartCrown.add(makeColorHalo(this.roseGlowTex, 3.4, 0.95));
      this.loveYourselfGroup.add(this.selfLoveHeartCrown);

      // Rising Multi-Colored Blossom Petals of Appreciation
      for (let p = 0; p < 14; p++) {
        const petal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.15, 0),
          treeColors[p % treeColors.length]
        );
        this.loveYourselfGroup.add(petal);
        this.lifeGardenPetals.push({ mesh: petal, index: p, phase: p / 14 });
      }
    }

    /**
     * Build 9 diverse, richly colored, multi-material 3D dioramas for
     * "Đừng Sợ Những Ngày Giông Bão" (scenes 61..69 at x = 1116..1260, z = 12)
     */
    _buildStormResilienceMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25,
        reflectivity: 0.95
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const magmaOrangeMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xc2410c,
        emissiveIntensity: 0.58,
        roughness: 0.3,
        metalness: 0.45
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });
      const royalBlueMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.55
      });
      const sunriseGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.62,
        roughness: 0.14,
        metalness: 0.65
      });

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

      // =========================================================================
      // 61. SCENE: lotus_mud_diamond_pressure (at x = 1116, z = 12)
      // "Đóa sen tinh khiết vươn mình từ bùn lầy… Kim cương rực rỡ qua áp lực khắc nghiệt của lòng đất"
      // Palette: Sakura-Pink & Emerald Lotus on Left + Cyan/Gold Diamond inside Magma Tectonic Rings on Right
      // =========================================================================
      this.lotusDiamondGroup = new THREE.Group();
      this.lotusDiamondGroup.position.set(1116, 0, 12);
      this.scene.add(this.lotusDiamondGroup);

      const light61A = new THREE.PointLight(0xf472b6, 2.5, 20);
      light61A.position.set(-1.8, 3.8, 2.2);
      this.lotusDiamondGroup.add(light61A);
      const light61B = new THREE.PointLight(0x38bdf8, 2.6, 20);
      light61B.position.set(1.8, 3.8, 2.2);
      this.lotusDiamondGroup.add(light61B);

      // Left: Dark Mud Basin & Pure Blooming Sakura-Porcelain Lotus on Emerald Lily Pad
      const mudBasin = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.65, 0.28, 32), darkSteelMat);
      mudBasin.position.set(-1.75, 0.14, 0);
      this.lotusDiamondGroup.add(mudBasin);

      const lilyPad = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.08, 28), emeraldMat);
      lilyPad.position.set(-1.75, 0.32, 0);
      this.lotusDiamondGroup.add(lilyPad);

      this.mudLotusBloom = new THREE.Group();
      this.mudLotusBloom.position.set(-1.75, 1.35, 0);
      const lotusStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 1.1, 12), emeraldMat);
      lotusStem.position.y = -0.5;
      this.mudLotusBloom.add(lotusStem);
      const lotusCenter = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 1), sunriseGoldMat);
      this.mudLotusBloom.add(lotusCenter);
      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2;
        const petal = new THREE.Mesh(
          new THREE.ConeGeometry(0.26, 0.78, 6),
          p % 2 === 0 ? sakuraPinkMat : porcelainBlueMat
        );
        petal.position.set(Math.cos(ang) * 0.45, 0.12, Math.sin(ang) * 0.45);
        petal.rotation.z = -Math.cos(ang) * 0.65;
        petal.rotation.x = Math.sin(ang) * 0.65;
        this.mudLotusBloom.add(petal);
      }
      this.mudLotusBloom.add(makeColorHalo(this.roseGlowTex, 2.5, 0.9));
      this.lotusDiamondGroup.add(this.mudLotusBloom);

      // Right: Tectonic Earth Pressure Anvils & Radiant Cyan-Gold Diamond Core
      const anvilBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.45, 0.65, 8), darkSteelMat);
      anvilBottom.position.set(1.75, 0.32, 0);
      this.lotusDiamondGroup.add(anvilBottom);

      this.forgedDiamondCore = new THREE.Group();
      this.forgedDiamondCore.position.set(1.75, 2.05, 0);
      const diamondMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 1), cyanCrystalMat);
      this.forgedDiamondCore.add(diamondMesh);
      this.forgedDiamondCore.add(makeColorHalo(this.cyanGlowTex, 2.8, 0.95));
      this.lotusDiamondGroup.add(this.forgedDiamondCore);

      for (let r = 0; r < 3; r++) {
        const pRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.02 + r * 0.24, 0.04, 14, 42),
          r === 0 ? magmaOrangeMat : r === 1 ? sunriseGoldMat : roseQuartzMat
        );
        pRing.position.set(1.75, 2.05, 0);
        this.lotusDiamondGroup.add(pRing);
        this.diamondPressureRings.push(pRing);
      }

      // =========================================================================
      // 62. SCENE: rising_from_stumble_steps (at x = 1134, z = 12)
      // "Sinh ra không phải để chưa từng vấp ngã, mà để học cách đứng dậy sau mỗi lần tưởng không thể bước tiếp"
      // Palette: Fractured Slate Step with Golden Kintsugi Lines + Ascending Emerald/Cyan/Gold Stairway
      // =========================================================================
      this.risingStepsGroup = new THREE.Group();
      this.risingStepsGroup.position.set(1134, 0, 12);
      this.scene.add(this.risingStepsGroup);

      const light62A = new THREE.PointLight(0xfbbf24, 2.5, 20);
      light62A.position.set(0, 4.2, 2.2);
      this.risingStepsGroup.add(light62A);
      const light62B = new THREE.PointLight(0x10b981, 2.3, 18);
      light62B.position.set(2.0, 3.5, 1.5);
      this.risingStepsGroup.add(light62B);

      // Fractured Kintsugi Valley Platform where the stumble happened
      const crackedPlateL = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.24, 1.65), darkSteelMat);
      crackedPlateL.position.set(-2.35, 0.22, 0.65);
      crackedPlateL.rotation.z = -0.14;
      this.risingStepsGroup.add(crackedPlateL);
      const goldCrackSeam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 1.72), sunriseGoldMat);
      goldCrackSeam.position.set(-1.62, 0.28, 0.65);
      this.risingStepsGroup.add(goldCrackSeam);

      // Ascending Multi-Colored Stairway of Rising Up
      const stepPalette = [royalBlueMat, cyanCrystalMat, emeraldMat, amethystMat, sakuraPinkMat, sunriseGoldMat];
      for (let s = 0; s < 9; s++) {
        const stMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.22, 1.25),
          stepPalette[s % stepPalette.length]
        );
        stMesh.position.set(-1.1 + s * 0.58, 0.42 + s * 0.34, 0.45 - s * 0.28);
        this.risingStepsGroup.add(stMesh);
      }

      // Resilient Soul rising up and climbing the steps
      this.risingResilientSoul = new THREE.Group();
      const rsCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 1), sunriseGoldMat);
      this.risingResilientSoul.add(rsCore);
      const rsAura = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 14, 36), cyanCrystalMat);
      rsAura.rotation.x = Math.PI / 2;
      this.risingResilientSoul.add(rsAura);
      this.risingResilientSoul.add(makeColorHalo(this.glowTex, 2.2, 0.92));
      this.risingStepsGroup.add(this.risingResilientSoul);

      // =========================================================================
      // 63. SCENE: endless_rain_high_walls (at x = 1152, z = 12)
      // "Cơn mưa dài bất tận… Cố gắng chẳng ai công nhận, chân thành bị tổn thương… Bức tường trước mắt"
      // Palette: Sapphire Rain Shafts, Rose-Quartz Bruised Heart, Towering Dark/Crimson Walls & Amethyst Doubt
      // =========================================================================
      this.rainWallsGroup = new THREE.Group();
      this.rainWallsGroup.position.set(1152, 0, 12);
      this.scene.add(this.rainWallsGroup);

      const light63A = new THREE.PointLight(0x38bdf8, 2.3, 20);
      light63A.position.set(-1.5, 4.5, 2.0);
      this.rainWallsGroup.add(light63A);
      const light63B = new THREE.PointLight(0xf43f5e, 2.4, 18);
      light63B.position.set(1.5, 3.5, 2.0);
      this.rainWallsGroup.add(light63B);

      // Towering Obstacle Walls blocking the path
      for (let w = 0; w < 3; w++) {
        const wallMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.15, 2.5 + w * 0.65, 0.42),
          w === 1 ? roseQuartzMat : darkSteelMat
        );
        wallMesh.position.set(0.55 + w * 1.05, (2.5 + w * 0.65) / 2, -0.35 - w * 0.45);
        this.rainWallsGroup.add(wallMesh);
      }

      // Sincere Heart & Dream Orb standing before the walls in the rain
      const sincereHeart = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 1), sakuraPinkMat);
      sincereHeart.position.set(-1.25, 1.55, 0.35);
      this.rainWallsGroup.add(sincereHeart);

      for (let d = 0; d < 2; d++) {
        const doubtRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.82 + d * 0.25, 0.035, 12, 36),
          d === 0 ? amethystMat : magmaOrangeMat
        );
        doubtRing.position.set(-1.25, 1.55, 0.35);
        this.rainWallsGroup.add(doubtRing);
        this.selfDoubtRings.push(doubtRing);
      }

      // Falling Endless Rain Shafts
      for (let r = 0; r < 18; r++) {
        const drop = new THREE.Mesh(
          new THREE.CylinderGeometry(0.022, 0.022, 0.52, 6),
          r % 2 === 0 ? cyanCrystalMat : royalBlueMat
        );
        const rx = -2.6 + (r % 9) * 0.65;
        const rz = -0.8 + Math.floor(r / 9) * 1.4;
        this.rainWallsGroup.add(drop);
        this.endlessRainShafts.push({ mesh: drop, baseX: rx, baseZ: rz, phase: r / 18 });
      }

      // =========================================================================
      // 64. SCENE: seed_breaks_shell_mighty_tree (at x = 1170, z = 12)
      // "Một hạt giống muốn trở thành cây đại thụ, trước hết phải đủ can đảm phá vỡ lớp vỏ bao bọc"
      // Palette: Cracked Amber Seed Shell with Emerald Sprout (Left) -> Towering Multi-Colored Tree (Right)
      // =========================================================================
      this.seedTreeGroup = new THREE.Group();
      this.seedTreeGroup.position.set(1170, 0, 12);
      this.scene.add(this.seedTreeGroup);

      const light64A = new THREE.PointLight(0x10b981, 2.5, 20);
      light64A.position.set(-1.5, 3.8, 2.2);
      this.seedTreeGroup.add(light64A);
      const light64B = new THREE.PointLight(0xfbbf24, 2.6, 20);
      light64B.position.set(1.8, 4.2, 2.2);
      this.seedTreeGroup.add(light64B);

      // Left: Breaking Seed Shell & Glowing Emerald Sprout
      const shellHalfL = new THREE.Mesh(
        new THREE.TorusGeometry(0.62, 0.18, 14, 28, Math.PI),
        magmaOrangeMat
      );
      shellHalfL.position.set(-2.35, 0.85, 0);
      shellHalfL.rotation.z = Math.PI * 0.65;
      this.seedTreeGroup.add(shellHalfL);

      const shellHalfR = new THREE.Mesh(
        new THREE.TorusGeometry(0.62, 0.18, 14, 28, Math.PI),
        magmaOrangeMat
      );
      shellHalfR.position.set(-1.45, 0.85, 0);
      shellHalfR.rotation.z = -Math.PI * 0.65;
      this.seedTreeGroup.add(shellHalfR);

      this.seedSproutCore = new THREE.Group();
      this.seedSproutCore.position.set(-1.9, 1.35, 0);
      const sproutGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), emeraldMat);
      this.seedSproutCore.add(sproutGem);
      this.seedSproutCore.add(makeColorHalo(this.emeraldGlowTex, 2.0, 0.9));
      this.seedTreeGroup.add(this.seedSproutCore);

      // Right: Mighty Ancient Tree of Growth (Golden Trunk + Multi-Colored Crystal Canopy)
      const mightyTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.52, 2.45, 14), sunriseGoldMat);
      mightyTrunk.position.set(1.55, 1.22, -0.2);
      this.seedTreeGroup.add(mightyTrunk);

      const canopyColors = [emeraldMat, cyanCrystalMat, sakuraPinkMat, sunriseGoldMat, amethystMat];
      const canopyHalos = [this.emeraldGlowTex, this.cyanGlowTex, this.roseGlowTex, this.glowTex, this.violetGlowTex];
      for (let c = 0; c < 9; c++) {
        const ang = (c / 9) * Math.PI * 2;
        const rad = c === 0 ? 0 : 0.95 + (c % 2) * 0.35;
        const cy = c === 0 ? 3.25 : 2.55 + (c % 3) * 0.32;
        const cx = 1.55 + Math.cos(ang) * rad;
        const cz = -0.2 + Math.sin(ang) * rad * 0.75;
        const cOrb = new THREE.Group();
        cOrb.position.set(cx, cy, cz);
        cOrb.add(new THREE.Mesh(new THREE.OctahedronGeometry(c === 0 ? 0.62 : 0.44, 1), canopyColors[c % 5]));
        cOrb.add(makeColorHalo(canopyHalos[c % 5], 1.65, 0.85));
        this.seedTreeGroup.add(cOrb);
        this.mightyTreeCanopyOrbs.push({ group: cOrb, baseY: cy, index: c });
      }

      // =========================================================================
      // 65. SCENE: ship_sailing_stormy_ocean (at x = 1188, z = 12)
      // "Một con thuyền muốn khám phá đại dương, không thể mãi neo mình trong vùng nước lặng"
      // Palette: Golden-Hull & Cyan-Sail 3D Ship braving Royal-Blue/Emerald Waves & Violet Storm Rings
      // =========================================================================
      this.stormShipGroup = new THREE.Group();
      this.stormShipGroup.position.set(1188, 0, 12);
      this.scene.add(this.stormShipGroup);

      const light65A = new THREE.PointLight(0x38bdf8, 2.6, 20);
      light65A.position.set(0, 4.2, 2.5);
      this.stormShipGroup.add(light65A);
      const light65B = new THREE.PointLight(0xfbbf24, 2.4, 18);
      light65B.position.set(1.5, 3.2, 1.8);
      this.stormShipGroup.add(light65B);

      // Dynamic Ocean Wave Ribs
      for (let w = 0; w < 12; w++) {
        const waveMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.48, 0.38, 3.2),
          w % 3 === 0 ? cyanCrystalMat : w % 3 === 1 ? royalBlueMat : emeraldMat
        );
        const wx = -2.75 + w * 0.5;
        waveMesh.position.set(wx, 0.25, 0);
        this.stormShipGroup.add(waveMesh);
        this.oceanStormWaves.push({ mesh: waveMesh, baseX: wx, index: w });
      }

      // Courageous 3D Ship with Golden Hull & Glowing Sails
      this.stormSailingShip = new THREE.Group();
      this.stormSailingShip.position.set(0.25, 1.15, 0.15);
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.35, 2.1, 8), sunriseGoldMat);
      hull.rotation.z = Math.PI / 2;
      hull.scale.set(0.55, 1.0, 0.65);
      this.stormSailingShip.add(hull);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.95, 10), porcelainBlueMat);
      mast.position.y = 0.95;
      this.stormSailingShip.add(mast);
      const mainSail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.85, 1.35, 16, 1, false, -Math.PI * 0.35, Math.PI * 0.7),
        cyanCrystalMat
      );
      mainSail.position.set(0.1, 1.05, 0);
      mainSail.rotation.y = Math.PI / 2;
      this.stormSailingShip.add(mainSail);
      const topFlag = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 4), roseQuartzMat);
      topFlag.rotation.z = -Math.PI / 2;
      topFlag.position.set(-0.22, 1.92, 0);
      this.stormSailingShip.add(topFlag);
      this.stormSailingShip.add(makeColorHalo(this.cyanGlowTex, 2.8, 0.9));
      this.stormShipGroup.add(this.stormSailingShip);

      // =========================================================================
      // 66. SCENE: resilience_light_in_darkness (at x = 1206, z = 12)
      // "Resilience – sức mạnh phục hồi sau nghịch cảnh… Đừng xấu hổ vì những vết sẹo của mình"
      // Palette: Dark Abyss Columns + Rose-Quartz & Emerald Core with Glowing Golden Kintsugi Scar Seams
      // =========================================================================
      this.resilienceScarsGroup = new THREE.Group();
      this.resilienceScarsGroup.position.set(1206, 0, 12);
      this.scene.add(this.resilienceScarsGroup);

      const light66A = new THREE.PointLight(0xfbbf24, 2.7, 20);
      light66A.position.set(0, 4.2, 2.5);
      this.resilienceScarsGroup.add(light66A);
      const light66B = new THREE.PointLight(0xf43f5e, 2.4, 18);
      light66B.position.set(-2.0, 3.2, 1.5);
      this.resilienceScarsGroup.add(light66B);
      const light66C = new THREE.PointLight(0x10b981, 2.3, 18);
      light66C.position.set(2.0, 3.2, 1.5);
      this.resilienceScarsGroup.add(light66C);

      // Dark Shadow Monoliths around the perimeter being pushed back by the inner light
      for (let s = 0; s < 6; s++) {
        const ang = (s / 6) * Math.PI * 2 + 0.3;
        const shadowPillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.35, 0.55), darkSteelMat);
        shadowPillar.position.set(Math.cos(ang) * 2.35, 1.18, Math.sin(ang) * 1.95);
        this.resilienceScarsGroup.add(shadowPillar);
      }

      // Central Resilience Core with Golden Kintsugi Scar Seams ("Mỗi vết sẹo là một minh chứng")
      this.resiliencePhoenixCore = new THREE.Group();
      this.resiliencePhoenixCore.position.set(0, 2.2, 0);
      const coreSphere = new THREE.Mesh(new THREE.OctahedronGeometry(0.82, 2), roseQuartzMat);
      this.resiliencePhoenixCore.add(coreSphere);
      this.resiliencePhoenixCore.add(makeColorHalo(this.glowTex, 3.4, 0.95));
      this.resilienceScarsGroup.add(this.resiliencePhoenixCore);

      // Intersecting Golden & Emerald Scar Rings of Honor
      for (let k = 0; k < 4; k++) {
        const scarRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.92 + k * 0.16, 0.045, 16, 48),
          k % 2 === 0 ? sunriseGoldMat : emeraldMat
        );
        scarRing.position.set(0, 2.2, 0);
        this.resilienceScarsGroup.add(scarRing);
        this.goldenScarRings.push(scarRing);
      }

      // =========================================================================
      // 67. SCENE: rugged_mountain_new_horizon (at x = 1224, z = 12)
      // "Chính những con đường gập ghềnh nhất lại đưa chúng ta đến những chân trời mới… Hãy cứ kiên trì"
      // Palette: Winding Multi-Colored Mountain Ridge climbing to a Blazing Horizon Star Portal
      // =========================================================================
      this.ruggedHorizonGroup = new THREE.Group();
      this.ruggedHorizonGroup.position.set(1224, 0, 12);
      this.scene.add(this.ruggedHorizonGroup);

      const light67A = new THREE.PointLight(0xfbbf24, 2.6, 22);
      light67A.position.set(1.8, 4.5, 2.0);
      this.ruggedHorizonGroup.add(light67A);
      const light67B = new THREE.PointLight(0xc084fc, 2.3, 18);
      light67B.position.set(-1.8, 3.2, 2.0);
      this.ruggedHorizonGroup.add(light67B);

      // Rugged, jagged mountain crags rising from left to right toward a high summit
      const cragMats = [amethystMat, royalBlueMat, emeraldMat, cyanCrystalMat, sakuraPinkMat, sunriseGoldMat];
      for (let c = 0; c < 10; c++) {
        const u = c / 9;
        const cx = -2.8 + u * 5.2;
        const cy = 0.25 + Math.pow(u, 1.25) * 2.45;
        const cz = 1.2 - u * 2.2 + (c % 2 === 0 ? 0.22 : -0.22);
        const crag = new THREE.Mesh(
          new THREE.ConeGeometry(0.55, 0.85 + u * 0.75, 6),
          cragMats[c % cragMats.length]
        );
        crag.position.set(cx, cy * 0.5, cz);
        this.ruggedHorizonGroup.add(crag);
      }

      // Climber Soul ascending the rugged ridge
      this.mountainClimberSoul = new THREE.Group();
      this.mountainClimberSoul.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 1), cyanCrystalMat));
      this.mountainClimberSoul.add(makeColorHalo(this.cyanGlowTex, 1.85, 0.9));
      this.ruggedHorizonGroup.add(this.mountainClimberSoul);

      // Summit Horizon Arch & Blazing Star of Faith at the peak
      this.horizonSummitStar = new THREE.Group();
      this.horizonSummitStar.position.set(2.4, 3.15, -1.0);
      this.horizonSummitStar.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 1), sunriseGoldMat));
      const summitHaloRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 16, 48), sakuraPinkMat);
      this.horizonSummitStar.add(summitHaloRing);
      this.horizonSummitStar.add(makeColorHalo(this.glowTex, 3.2, 0.95));
      this.ruggedHorizonGroup.add(this.horizonSummitStar);

      // =========================================================================
      // 68. SCENE: blue_sky_beyond_storm_clouds (at x = 1242, z = 12)
      // "Bầu trời không vì một cơn giông mà đánh mất màu xanh. Con người không vì thất bại mất đi giá trị"
      // Palette: Parting Violet/Slate Storm Clouds revealing a Brilliant Cyan Sky Dome & Golden Worth Core
      // =========================================================================
      this.blueSkyStormGroup = new THREE.Group();
      this.blueSkyStormGroup.position.set(1242, 0, 12);
      this.scene.add(this.blueSkyStormGroup);

      const light68A = new THREE.PointLight(0x38bdf8, 2.8, 22);
      light68A.position.set(0, 4.5, 2.5);
      this.blueSkyStormGroup.add(light68A);
      const light68B = new THREE.PointLight(0xfbbf24, 2.4, 18);
      light68B.position.set(0, 2.5, 2.8);
      this.blueSkyStormGroup.add(light68B);

      // Radiant Azure/Cyan Sky Arch & Unshakeable Diamond-Gold Core of Self-Worth
      const skyArch = new THREE.Mesh(
        new THREE.TorusGeometry(2.15, 0.12, 18, 56, Math.PI),
        cyanCrystalMat
      );
      skyArch.position.set(0, 1.25, -0.5);
      this.blueSkyStormGroup.add(skyArch);

      this.eternalBlueSkyCore = new THREE.Group();
      this.eternalBlueSkyCore.position.set(0, 2.25, -0.15);
      this.eternalBlueSkyCore.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 1), sunriseGoldMat));
      const skyOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.045, 16, 48), cyanCrystalMat);
      skyOrbit.rotation.x = Math.PI / 3;
      this.eternalBlueSkyCore.add(skyOrbit);
      this.eternalBlueSkyCore.add(makeColorHalo(this.cyanGlowTex, 3.4, 0.95));
      this.blueSkyStormGroup.add(this.eternalBlueSkyCore);

      // Left & Right Parting Storm Cloud Clusters
      this.partingStormCloudL = new THREE.Group();
      this.partingStormCloudL.position.set(-1.65, 2.35, 0.45);
      for (let cl = 0; cl < 4; cl++) {
        const puff = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.45, 1),
          cl % 2 === 0 ? amethystMat : darkSteelMat
        );
        puff.position.set((cl - 1.5) * 0.38, (cl % 2) * 0.25, 0);
        this.partingStormCloudL.add(puff);
      }
      this.blueSkyStormGroup.add(this.partingStormCloudL);

      this.partingStormCloudR = new THREE.Group();
      this.partingStormCloudR.position.set(1.65, 2.35, 0.45);
      for (let cr = 0; cr < 4; cr++) {
        const puff = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.45, 1),
          cr % 2 === 0 ? amethystMat : darkSteelMat
        );
        puff.position.set((cr - 1.5) * 0.38, (cr % 2) * 0.25, 0);
        this.partingStormCloudR.add(puff);
      }
      this.blueSkyStormGroup.add(this.partingStormCloudR);

      // =========================================================================
      // 69. SCENE: proud_flower_blooming_in_storm (at x = 1260, z = 12)
      // "Trở thành một đóa hoa kiêu hãnh, nở rộ ngay giữa những tháng ngày giông bão"
      // Palette: Majestic Multi-Layered Rose/Sakura/Gold/Emerald Blossom blooming proudly amid Storm Winds
      // =========================================================================
      this.proudFlowerGroup = new THREE.Group();
      this.proudFlowerGroup.position.set(1260, 0, 12);
      this.scene.add(this.proudFlowerGroup);

      const light69A = new THREE.PointLight(0xf43f5e, 2.7, 22);
      light69A.position.set(0, 4.4, 2.8);
      this.proudFlowerGroup.add(light69A);
      const light69B = new THREE.PointLight(0xfbbf24, 2.5, 20);
      light69B.position.set(-2.0, 3.5, 1.8);
      this.proudFlowerGroup.add(light69B);
      const light69C = new THREE.PointLight(0x38bdf8, 2.4, 20);
      light69C.position.set(2.0, 3.5, 1.8);
      this.proudFlowerGroup.add(light69C);

      // Rocky Crag Pedestal
      const cragBase = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.25, 0.65, 10), darkSteelMat);
      cragBase.position.y = 0.32;
      this.proudFlowerGroup.add(cragBase);

      // Stem & Emerald Leaves
      const flowerStem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.65, 12), emeraldMat);
      flowerStem.position.set(0, 1.35, 0);
      this.proudFlowerGroup.add(flowerStem);

      // Proud Multi-Layered Blossom Crown
      this.proudStormFlower = new THREE.Group();
      this.proudStormFlower.position.set(0, 2.35, 0);
      const flowerHeart = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 2), sunriseGoldMat);
      this.proudStormFlower.add(flowerHeart);

      for (let layer = 0; layer < 2; layer++) {
        const count = layer === 0 ? 8 : 10;
        const rad = layer === 0 ? 0.58 : 0.92;
        for (let p = 0; p < count; p++) {
          const ang = (p / count) * Math.PI * 2 + layer * 0.3;
          const petalMesh = new THREE.Mesh(
            new THREE.ConeGeometry(0.28, 0.85, 6),
            layer === 0
              ? p % 2 === 0
                ? roseQuartzMat
                : sakuraPinkMat
              : p % 2 === 0
              ? amethystMat
              : cyanCrystalMat
          );
          petalMesh.position.set(Math.cos(ang) * rad, 0.1 - layer * 0.12, Math.sin(ang) * rad);
          petalMesh.rotation.z = -Math.cos(ang) * (0.75 + layer * 0.25);
          petalMesh.rotation.x = Math.sin(ang) * (0.75 + layer * 0.25);
          this.proudStormFlower.add(petalMesh);
        }
      }
      this.proudStormFlower.add(makeColorHalo(this.roseGlowTex, 3.5, 0.95));
      this.proudFlowerGroup.add(this.proudStormFlower);

      // Swirling Tempest Wind Ribbons around the proud flower
      for (let w = 0; w < 3; w++) {
        const windRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.75 + w * 0.32, 0.035, 14, 48, Math.PI * 1.45),
          w === 0 ? cyanCrystalMat : w === 1 ? amethystMat : sunriseGoldMat
        );
        windRing.position.set(0, 1.95 + w * 0.25, 0);
        this.proudFlowerGroup.add(windRing);
        this.tempestWindRibbons.push(windRing);
      }
    }

    /**
     * Create a stylized 3D human character with expressive face, anime chibi hair,
     * cute ears, sweater collar, articulated arms (armL, armR), and legs with shoes.
     */
    _createStylizedCharacter3D({
      shirtColor = 0x8b5a2b,
      hairColor = 0x3b2818,
      skinColor = 0xf8d7b8,
      mood = 'sad',
      scale = 1.0,
      hasHeart = false
    } = {}) {
      const group = new THREE.Group();
      group.scale.set(scale, scale, scale);

      const skinMat = new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.38,
        metalness: 0.05
      });
      const shirtMat = new THREE.MeshStandardMaterial({
        color: shirtColor,
        emissive: shirtColor,
        emissiveIntensity: 0.22,
        roughness: 0.35,
        metalness: 0.12
      });
      const collarMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.05
      });
      const pantsMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.55,
        metalness: 0.1
      });
      const shoeMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: 0x94a3b8,
        emissiveIntensity: 0.2,
        roughness: 0.25
      });
      const shoeSoleMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.5
      });
      const hairMat = new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.42,
        metalness: 0.12
      });

      // Legs & White Sneakers with dark sole
      [-0.14, 0.14].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.078, 0.62, 12), pantsMat);
        leg.position.set(lx, 0.36, 0);
        group.add(leg);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.26), shoeMat);
        shoe.position.set(lx, 0.05, 0.04);
        group.add(shoe);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.025, 0.27), shoeSoleMat);
        sole.position.set(lx, 0.012, 0.04);
        group.add(sole);
      });

      // Torso (Sweater / Jacket)
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.68, 0.28), shirtMat);
      torso.position.set(0, 1.0, 0);
      group.add(torso);

      // White collar trim at sweater neckline
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.038, 12, 24), collarMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 1.34, 0);
      group.add(collar);

      // Articulated Arms
      const armL = new THREE.Group();
      armL.position.set(-0.32, 1.28, 0);
      const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.52, 12), shirtMat);
      sleeveL.position.y = -0.24;
      armL.add(sleeveL);
      const handL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), skinMat);
      handL.position.y = -0.52;
      armL.add(handL);
      group.add(armL);

      const armR = new THREE.Group();
      armR.position.set(0.32, 1.28, 0);
      const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.52, 12), shirtMat);
      sleeveR.position.y = -0.24;
      armR.add(sleeveR);
      const handR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), skinMat);
      handR.position.y = -0.52;
      armR.add(handR);
      group.add(armR);

      // Head with high-DPI expressive face canvas on front
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.64, 0);
      const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.29, 24, 24), skinMat);
      headGroup.add(headSphere);

      // Cute chibi ears on left and right
      [-0.29, 0.29].forEach((ex) => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), skinMat);
        ear.position.set(ex, 0, 0.02);
        headGroup.add(ear);
      });

      // Expressive face plate (256x256 high-res canvas)
      const fCanvas = document.createElement('canvas');
      fCanvas.width = 256;
      fCanvas.height = 256;
      const fCtx = fCanvas.getContext('2d');
      fCtx.clearRect(0, 0, 256, 256);

      // Soft cute cheek blush
      fCtx.fillStyle = 'rgba(251, 113, 133, 0.42)';
      [82, 174].forEach((bx) => {
        fCtx.beginPath();
        fCtx.ellipse(bx, 150, 20, 11, 0, 0, Math.PI * 2);
        fCtx.fill();
      });

      // Eyes (Large Chibi / Anime with double highlights)
      fCtx.fillStyle = '#ffffff';
      fCtx.strokeStyle = '#1e293b';
      fCtx.lineWidth = 5;
      [86, 170].forEach((ex) => {
        fCtx.beginPath();
        fCtx.arc(ex, 116, 22, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.stroke();

        // Iris / Pupil with deep blue-slate gradient
        const irisGrad = fCtx.createRadialGradient(ex, 114, 3, ex, 118, 14);
        irisGrad.addColorStop(0, '#0f172a');
        irisGrad.addColorStop(1, '#1e3a8a');
        fCtx.fillStyle = irisGrad;
        fCtx.beginPath();
        fCtx.arc(ex, mood === 'sad' ? 120 : 116, 12, 0, Math.PI * 2);
        fCtx.fill();

        // Specular highlight 1 (top-left)
        fCtx.fillStyle = '#ffffff';
        fCtx.beginPath();
        fCtx.arc(ex - 4, 110, 4.5, 0, Math.PI * 2);
        fCtx.fill();

        // Specular highlight 2 (bottom-right)
        fCtx.beginPath();
        fCtx.arc(ex + 4, 122, 2.2, 0, Math.PI * 2);
        fCtx.fill();

        if (mood === 'sad') {
          // Subtle tear glimmer in the lower corner of the eye
          fCtx.fillStyle = 'rgba(125, 211, 252, 0.85)';
          fCtx.beginPath();
          fCtx.arc(ex, 132, 3.2, 0, Math.PI * 2);
          fCtx.fill();
        }
      });

      // Eyebrows & Mouth based on mood
      fCtx.strokeStyle = '#1e293b';
      fCtx.lineWidth = 6;
      fCtx.lineCap = 'round';
      if (mood === 'sad') {
        // Expressive sad downturned eyebrows
        fCtx.beginPath();
        fCtx.moveTo(64, 94);
        fCtx.lineTo(106, 82);
        fCtx.moveTo(192, 94);
        fCtx.lineTo(150, 82);
        fCtx.stroke();

        // Soft trembling pout mouth
        fCtx.beginPath();
        fCtx.arc(128, 186, 18, Math.PI * 1.15, Math.PI * 1.85);
        fCtx.stroke();
      } else {
        // Gentle happy curved eyebrows
        fCtx.beginPath();
        fCtx.moveTo(66, 84);
        fCtx.lineTo(108, 84);
        fCtx.moveTo(150, 84);
        fCtx.lineTo(192, 84);
        fCtx.stroke();

        // Warm genuine smile
        fCtx.beginPath();
        fCtx.arc(128, 154, 20, Math.PI * 0.12, Math.PI * 0.88);
        fCtx.stroke();
      }

      const faceTex = new THREE.CanvasTexture(fCanvas);
      const facePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.46, 0.46),
        new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false })
      );
      facePlane.position.set(0, -0.02, 0.285);
      headGroup.add(facePlane);

      // Stylized layered hair cap + cute curved bangs (replaces bare cones!)
      const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.31, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
        hairMat
      );
      hairCap.position.set(0, 0.03, -0.02);
      headGroup.add(hairCap);

      // Layered front bangs & stylish tufts
      [-0.18, -0.06, 0.06, 0.18].forEach((bx, i) => {
        const bang = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 6), hairMat);
        bang.position.set(bx, 0.22, 0.18);
        bang.rotation.x = 0.55;
        bang.rotation.z = (i - 1.5) * 0.22;
        headGroup.add(bang);
      });

      // Side hair locks framing face
      [-0.26, 0.26].forEach((sx, idx) => {
        const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.02, 0.28, 8), hairMat);
        lock.position.set(sx, 0.05, 0.1);
        lock.rotation.z = idx === 0 ? 0.25 : -0.25;
        headGroup.add(lock);
      });

      group.add(headGroup);

      // Optional glowing pink heart held on chest
      if (hasHeart) {
        const heartMat = new THREE.MeshPhysicalMaterial({
          color: 0xf472b6,
          emissive: 0xdb2777,
          emissiveIntensity: 0.68,
          roughness: 0.15,
          metalness: 0.1
        });
        const chestHeart = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 1), heartMat);
        chestHeart.position.set(0, 1.05, 0.24);
        group.add(chestHeart);

        // Soft halo sprite for the held heart
        if (this.roseGlowTex) {
          const heartHalo = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: this.roseGlowTex,
              transparent: true,
              opacity: 0.75,
              depthWrite: false,
              blending: THREE.AdditiveBlending
            })
          );
          heartHalo.scale.set(1.15, 1.15, 1);
          heartHalo.position.set(0, 1.05, 0.24);
          group.add(heartHalo);
        }

        armL.rotation.z = 0.58;
        armL.rotation.x = -0.45;
        armR.rotation.z = -0.58;
        armR.rotation.x = -0.45;
      }

      group.userData = { armL, armR, headGroup };
      return group;
    }

    /**
     * Create a crisp 3D floating neon callout badge, speech bubble, or checklist card
     * with automatic font fitting so Vietnamese typography never clips!
     */
    _create3DNeonBadge({
      text = '',
      subText = '',
      borderColor = '#c084fc',
      bgColor = 'rgba(15, 23, 42, 0.88)',
      textColor = '#ffffff',
      mark = '', // 'X' | 'CHECK' | ''
      widthWorld = 2.1,
      heightWorld = 0.62
    } = {}) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = Math.round(512 * (heightWorld / widthWorld));
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const r = Math.min(26, h * 0.26);

      ctx.clearRect(0, 0, w, h);

      // Outer neon glow & rounded rect
      ctx.save();
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(r + 10, 10);
      ctx.lineTo(w - r - 10, 10);
      ctx.quadraticCurveTo(w - 10, 10, w - 10, r + 10);
      ctx.lineTo(w - 10, h - r - 10);
      ctx.quadraticCurveTo(w - 10, h - 10, w - r - 10, h - 10);
      ctx.lineTo(r + 10, h - 10);
      ctx.quadraticCurveTo(10, h - 10, 10, h - r - 10);
      ctx.lineTo(10, r + 10);
      ctx.quadraticCurveTo(10, 10, r + 10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Auto-fit text: measure and scale font so Vietnamese text never overflows!
      let fontSize = subText ? 30 : 34;
      ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
      const maxTextWidth = w - (mark ? 110 : 44);
      while (ctx.measureText(text).width > maxTextWidth && fontSize > 18) {
        fontSize -= 2;
        ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
      }

      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';
      ctx.textAlign = mark ? 'left' : 'center';
      const textX = mark ? 34 : w / 2;
      const textY = subText ? h * 0.38 : h * 0.5;
      ctx.fillText(text, textX, textY);

      if (subText) {
        let subSize = 24;
        ctx.font = `600 ${subSize}px "Segoe UI", Arial, sans-serif`;
        while (ctx.measureText(subText).width > maxTextWidth && subSize > 15) {
          subSize -= 2;
          ctx.font = `600 ${subSize}px "Segoe UI", Arial, sans-serif`;
        }
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(subText, textX, h * 0.72);
      }

      if (mark === 'X') {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        const mx = w - 50;
        const my = h / 2;
        ctx.beginPath();
        ctx.moveTo(mx - 15, my - 15);
        ctx.lineTo(mx + 15, my + 15);
        ctx.moveTo(mx + 15, my - 15);
        ctx.lineTo(mx - 15, my + 15);
        ctx.stroke();
      } else if (mark === 'CHECK') {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const mx = w - 50;
        const my = h / 2;
        ctx.beginPath();
        ctx.moveTo(mx - 17, my + 2);
        ctx.lineTo(mx - 4, my + 15);
        ctx.lineTo(mx + 19, my - 13);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide
      });
      return new THREE.Mesh(new THREE.PlaneGeometry(widthWorld, heightWorld), mat);
    }

    /**
     * Build 8 rich, character-driven & storyboard-driven 3D dioramas for
     * "ĐỪNG ĐỂ ĐẾN KHI MẤT ĐI, TA MỚI HIỂU ĐIỀU GÌ LÀ QUÝ GIÁ" (scenes 70..77 at x = 1278..1404, z = 12)
     */
    _buildPreciousBeforeLostMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const sunriseGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.62,
        roughness: 0.14,
        metalness: 0.65
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });

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

      // Helper: build a glowing circular stage pedestal with concentric neon rings
      const makeStagePedestal = (group, radius = 2.4, ringColorMat = sunriseGoldMat) => {
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius + 0.18, 0.14, 36),
          new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: 0x1e293b,
            emissiveIntensity: 0.3,
            roughness: 0.35,
            metalness: 0.7
          })
        );
        base.position.y = 0.07;
        group.add(base);

        const outerRing = new THREE.Mesh(
          new THREE.TorusGeometry(radius + 0.02, 0.032, 12, 48),
          ringColorMat
        );
        outerRing.rotation.x = Math.PI / 2;
        outerRing.position.y = 0.14;
        group.add(outerRing);

        const innerRing = new THREE.Mesh(
          new THREE.TorusGeometry(radius * 0.65, 0.022, 12, 48),
          porcelainBlueMat
        );
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = 0.142;
        group.add(innerRing);
      };

      // =========================================================================
      // 70. SCENE: slipping_treasure_from_hand (at x = 1278, z = 12)
      // "Chúng ta thường chỉ nhận ra giá trị của một điều gì đó khi nó không còn thuộc về mình"
      // Visual: Stylized Chibi reaching out toward a glowing Heart-Gem slipping away
      // =========================================================================
      this.slippingTreasureGroup = new THREE.Group();
      this.slippingTreasureGroup.position.set(1278, 0, 12);
      this.scene.add(this.slippingTreasureGroup);
      makeStagePedestal(this.slippingTreasureGroup, 2.35, sunriseGoldMat);

      const light70A = new THREE.PointLight(0xf472b6, 2.5, 20);
      light70A.position.set(1.2, 3.8, 2.5);
      this.slippingTreasureGroup.add(light70A);
      const light70B = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light70B.position.set(-1.2, 3.5, 2.2);
      this.slippingTreasureGroup.add(light70B);

      // Center-left character reaching with right arm
      this.slippingTreasureChar = this._createStylizedCharacter3D({
        shirtColor: 0x9a5b32,
        hairColor: 0x3b2818,
        mood: 'sad',
        scale: 1.15
      });
      this.slippingTreasureChar.position.set(-0.72, 0.14, 0.1);
      this.slippingTreasureChar.userData.armR.rotation.z = -1.25;
      this.slippingTreasureGroup.add(this.slippingTreasureChar);

      // Glowing Heart-Gem & Ring slipping away to the right
      this.slippingHeartGem = new THREE.Group();
      this.slippingHeartGem.position.set(0.82, 1.65, 0);
      this.slippingHeartGem.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 1), roseQuartzMat));
      this.slippingHeartGem.add(new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.038, 16, 42), sunriseGoldMat));
      this.slippingHeartGem.add(makeColorHalo(this.roseGlowTex, 2.4, 0.92));
      this.slippingTreasureGroup.add(this.slippingHeartGem);

      const badge70A = this._create3DNeonBadge({
        text: 'khi đang có: vô tâm',
        borderColor: '#94a3b8',
        textColor: '#cbd5e1',
        widthWorld: 1.95,
        heightWorld: 0.52
      });
      badge70A.position.set(-0.72, 2.45, 0.1);
      this.slippingTreasureGroup.add(badge70A);

      const badge70B = this._create3DNeonBadge({
        text: 'khi mất đi: quý giá',
        borderColor: '#f472b6',
        textColor: '#fbcfe8',
        widthWorld: 1.95,
        heightWorld: 0.52
      });
      badge70B.position.set(0.82, 2.55, 0);
      this.slippingTreasureGroup.add(badge70B);
      this.slippingBadges.push(badge70A, badge70B);

      // =========================================================================
      // 71. SCENE: youth_illusion_missed_family (at x = 1296, z = 12)
      // "Khi còn trẻ, ta nghĩ thời gian là vô tận. Trì hoãn cuộc gọi cho cha mẹ, bỏ lỡ bữa cơm gia đình..."
      // Visual: Young Character with Glowing Phone on Left + Elderly Parents at Warm Dinner Table on Right
      // =========================================================================
      this.youthMissedFamilyGroup = new THREE.Group();
      this.youthMissedFamilyGroup.position.set(1296, 0, 12);
      this.scene.add(this.youthMissedFamilyGroup);
      makeStagePedestal(this.youthMissedFamilyGroup, 2.45, porcelainBlueMat);

      const light71A = new THREE.PointLight(0xfbbf24, 2.6, 20);
      light71A.position.set(1.2, 3.8, 2.2);
      this.youthMissedFamilyGroup.add(light71A);
      const light71B = new THREE.PointLight(0x38bdf8, 2.2, 18);
      light71B.position.set(-1.2, 3.5, 2.2);
      this.youthMissedFamilyGroup.add(light71B);

      // Left: Young Character looking at glowing phone
      this.youthPhoneChar = this._createStylizedCharacter3D({
        shirtColor: 0x3b82f6,
        hairColor: 0x27272a,
        mood: 'happy',
        scale: 1.08
      });
      this.youthPhoneChar.position.set(-0.82, 0.14, 0.15);
      this.youthPhoneChar.userData.armR.rotation.z = -0.75;
      this.youthPhoneChar.userData.armR.rotation.x = -0.45;

      // Small glowing phone held in right hand
      const phoneModel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.02), darkSteelMat);
      phoneModel.position.set(0.12, -0.46, 0.15);
      const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.2), cyanCrystalMat);
      phoneScreen.position.set(0.12, -0.46, 0.165);
      this.youthPhoneChar.userData.armR.add(phoneModel);
      this.youthPhoneChar.userData.armR.add(phoneScreen);
      this.youthMissedFamilyGroup.add(this.youthPhoneChar);

      const badge71Phone = this._create3DNeonBadge({
        text: 'để ngày mai gọi...',
        subText: 'Cuộc gọi nhỡ: Cha Mẹ',
        borderColor: '#38bdf8',
        widthWorld: 2.15,
        heightWorld: 0.68
      });
      badge71Phone.position.set(-0.82, 2.42, 0.15);
      this.youthMissedFamilyGroup.add(badge71Phone);

      // Right: Warm Family Dinner Table with Silver-Haired Father & Mother waiting
      this.waitingParentsGroup = new THREE.Group();
      this.waitingParentsGroup.position.set(0.78, 0, 0);

      const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 32), sunriseGoldMat);
      tableTop.position.y = 0.88;
      this.waitingParentsGroup.add(tableTop);
      const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.88, 16), darkSteelMat);
      tableLeg.position.y = 0.44;
      this.waitingParentsGroup.add(tableLeg);

      // Steaming bowls / teacups on table
      [-0.22, 0.22].forEach((tx) => {
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.08, 12), porcelainBlueMat);
        bowl.position.set(tx, 0.96, 0);
        this.waitingParentsGroup.add(bowl);
      });

      const fatherChar = this._createStylizedCharacter3D({
        shirtColor: 0x475569,
        hairColor: 0xd4d4d8,
        mood: 'sad',
        scale: 0.9
      });
      fatherChar.position.set(-0.62, 0.14, -0.15);
      this.waitingParentsGroup.add(fatherChar);

      const motherChar = this._createStylizedCharacter3D({
        shirtColor: 0xbe185d,
        hairColor: 0xe4e4e7,
        mood: 'sad',
        scale: 0.86
      });
      motherChar.position.set(0.62, 0.14, -0.15);
      this.waitingParentsGroup.add(motherChar);

      const badge71Table = this._create3DNeonBadge({
        text: 'thời gian ≠ vô tận',
        borderColor: '#fbbf24',
        textColor: '#fde68a',
        widthWorld: 2.05,
        heightWorld: 0.52
      });
      badge71Table.position.set(0, 2.42, 0);
      this.waitingParentsGroup.add(badge71Table);
      this.youthMissedFamilyGroup.add(this.waitingParentsGroup);
      this.youthMissedBadges.push(badge71Phone, badge71Table);

      // =========================================================================
      // 72. SCENE: three_irreversible_losses_cards (at x = 1314, z = 12)
      // "Người hôm nay ngồi cạnh mai thành ký ức | Cơ hội chỉ xuất hiện 1 lần | Lời xin lỗi không còn ai nghe"
      // Visual: 3 Framed 3D Storyboard Cards side-by-side (Fitted cleanly for 9:16 vertical view!)
      // =========================================================================
      this.threeLossesGroup = new THREE.Group();
      this.threeLossesGroup.position.set(1314, 0, 12);
      this.scene.add(this.threeLossesGroup);
      makeStagePedestal(this.threeLossesGroup, 2.45, amethystMat);

      const light72A = new THREE.PointLight(0x38bdf8, 2.5, 22);
      light72A.position.set(0, 4.2, 3.0);
      this.threeLossesGroup.add(light72A);

      // Offsets tuned to comfortably fit inside the 9:16 vertical camera frame
      const cardOffsets = [-1.18, 0, 1.18];
      const cardLabels = ['người thành ký ức', 'cơ hội vụt qua', 'lời xin lỗi muộn'];
      const cardColors = ['#38bdf8', '#fbbf24', '#c084fc'];

      cardOffsets.forEach((cx, idx) => {
        const frameGroup = new THREE.Group();
        frameGroup.position.set(cx, 1.75, 0);

        // Glowing rounded frame border
        const frameBorder = new THREE.Mesh(
          new THREE.BoxGeometry(1.08, 1.45, 0.06),
          new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: idx === 0 ? 0x0284c7 : idx === 1 ? 0xd97706 : 0x7e22ce,
            emissiveIntensity: 0.35,
            roughness: 0.25
          })
        );
        frameGroup.add(frameBorder);

        // Inner backdrop panel
        const frameBackdrop = new THREE.Mesh(
          new THREE.PlaneGeometry(1.02, 1.38),
          new THREE.MeshBasicMaterial({
            color: idx === 0 ? 0x0c4a6e : idx === 1 ? 0x78350f : 0x4c1d95
          })
        );
        frameBackdrop.position.z = 0.035;
        frameGroup.add(frameBackdrop);

        // Bottom caption label under each frame
        const capBadge = this._create3DNeonBadge({
          text: cardLabels[idx],
          borderColor: cardColors[idx],
          widthWorld: 1.1,
          heightWorld: 0.36
        });
        capBadge.position.set(0, -0.96, 0.06);
        frameGroup.add(capBadge);

        if (idx === 0) {
          // Frame 1: Doorway + departing figure + teardrop particles
          const doorOutline = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.95, 0.04), porcelainBlueMat);
          doorOutline.position.set(-0.05, -0.05, 0.05);
          frameGroup.add(doorOutline);

          const departChar = this._createStylizedCharacter3D({
            shirtColor: 0xf472b6,
            mood: 'sad',
            scale: 0.48
          });
          departChar.position.set(0.16, -0.52, 0.08);
          frameGroup.add(departChar);

          for (let t = 0; t < 3; t++) {
            const tear = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), cyanCrystalMat);
            frameGroup.add(tear);
            this.lossCardTears.push({ mesh: tear, index: t });
          }
        } else if (idx === 1) {
          // Frame 2: 3D Illuminated Train with 3 golden windows moving along rail
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.03, 0.04), porcelainBlueMat);
          rail.position.set(0, -0.25, 0.06);
          frameGroup.add(rail);

          this.lossCardTrain = new THREE.Group();
          this.lossCardTrain.position.set(0, -0.05, 0.08);
          const trainBody = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.34, 0.08), darkSteelMat);
          this.lossCardTrain.add(trainBody);
          [-0.22, 0, 0.22].forEach((wx) => {
            const win = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.09), sunriseGoldMat);
            win.position.x = wx;
            this.lossCardTrain.add(win);
          });
          frameGroup.add(this.lossCardTrain);
        } else {
          // Frame 3: Speech bubble "..." with floating words drifting away
          const bubbleBox = this._create3DNeonBadge({
            text: '. . .',
            borderColor: '#94a3b8',
            widthWorld: 0.72,
            heightWorld: 0.38
          });
          bubbleBox.position.set(0, -0.15, 0.06);
          frameGroup.add(bubbleBox);

          ['lời', 'xin', 'lỗi'].forEach((wText, wIdx) => {
            const wPlane = this._create3DNeonBadge({
              text: wText,
              borderColor: '#c084fc',
              widthWorld: 0.42,
              heightWorld: 0.24
            });
            frameGroup.add(wPlane);
            this.lossCardWords.push({ mesh: wPlane, index: wIdx });
          });
        }

        this.threeLossesGroup.add(frameGroup);
      });

      // =========================================================================
      // 73. SCENE: chasing_distant_mirage_vs_home (at x = 1332, z = 12)
      // "Mải miết chạy theo những thứ xa xôi mà quên mất những điều bình dị đang hiện diện trước mắt"
      // Visual: Character chasing glittering Mirage on Right, leaving Warm Simple Love on Left
      // =========================================================================
      this.mirageVsHomeGroup = new THREE.Group();
      this.mirageVsHomeGroup.position.set(1332, 0, 12);
      this.scene.add(this.mirageVsHomeGroup);
      makeStagePedestal(this.mirageVsHomeGroup, 2.45, emeraldMat);

      const light73A = new THREE.PointLight(0xfbbf24, 2.5, 20);
      light73A.position.set(1.2, 4.0, 2.2);
      this.mirageVsHomeGroup.add(light73A);
      const light73B = new THREE.PointLight(0x10b981, 2.3, 18);
      light73B.position.set(-1.2, 3.5, 2.2);
      this.mirageVsHomeGroup.add(light73B);

      // Left: Warm Simple Sanctuary with Loved One holding a glowing Heart
      const homePad = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.1, 32), emeraldMat);
      homePad.position.set(-0.85, 0.12, 0);
      this.mirageVsHomeGroup.add(homePad);

      const lovedChar = this._createStylizedCharacter3D({
        shirtColor: 0xec4899,
        hairColor: 0x4b2a1a,
        mood: 'sad',
        scale: 1.0,
        hasHeart: true
      });
      lovedChar.position.set(-0.85, 0.18, 0);
      this.mirageVsHomeGroup.add(lovedChar);

      const badge73Home = this._create3DNeonBadge({
        text: 'bình dị trước mắt',
        borderColor: '#10b981',
        textColor: '#a7f3d0',
        widthWorld: 1.85,
        heightWorld: 0.48
      });
      badge73Home.position.set(-0.85, 2.35, 0);
      this.mirageVsHomeGroup.add(badge73Home);

      // Center: Character running toward the right mirage
      this.mirageRunnerChar = this._createStylizedCharacter3D({
        shirtColor: 0x9a5b32,
        mood: 'happy',
        scale: 1.05
      });
      this.mirageRunnerChar.position.set(0.05, 0.14, 0.15);
      this.mirageRunnerChar.rotation.y = 0.45;
      this.mirageVsHomeGroup.add(this.mirageRunnerChar);

      // Right: Towering Golden Mirage of Money, Status & Admiration
      const statusTower = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.35, 0.65), sunriseGoldMat);
      statusTower.position.set(0.95, 1.25, -0.15);
      this.mirageVsHomeGroup.add(statusTower);

      ['tiền bạc', 'địa vị cao', 'ngưỡng mộ'].forEach((label, idx) => {
        const mBadge = this._create3DNeonBadge({
          text: label,
          borderColor: '#fbbf24',
          textColor: '#fde68a',
          widthWorld: 1.35,
          heightWorld: 0.42
        });
        this.mirageVsHomeGroup.add(mBadge);
        this.mirageFloatingIcons.push({ mesh: mBadge, index: idx });
      });

      // =========================================================================
      // 74. SCENE: true_success_checklist_balance (at x = 1350, z = 12)
      // "Thành công lớn nhất không phải là sở hữu được bao nhiêu, mà là không đánh mất những điều quan trọng"
      // Visual: Hero holding Heart on Left + 3 Animated 3D Checklist Cards on Right
      // =========================================================================
      this.trueSuccessChecklistGroup = new THREE.Group();
      this.trueSuccessChecklistGroup.position.set(1350, 0, 12);
      this.scene.add(this.trueSuccessChecklistGroup);
      makeStagePedestal(this.trueSuccessChecklistGroup, 2.45, sunriseGoldMat);

      const light74A = new THREE.PointLight(0xf472b6, 2.5, 20);
      light74A.position.set(-1.2, 3.8, 2.5);
      this.trueSuccessChecklistGroup.add(light74A);
      const light74B = new THREE.PointLight(0x10b981, 2.5, 20);
      light74B.position.set(1.2, 3.8, 2.5);
      this.trueSuccessChecklistGroup.add(light74B);

      // Left: Character holding a glowing Heart inside a warm Golden aura circle
      const auraCircle = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.02, 48), sunriseGoldMat);
      auraCircle.position.set(-0.75, 1.15, -0.1);
      this.trueSuccessChecklistGroup.add(auraCircle);

      this.checklistHeroChar = this._createStylizedCharacter3D({
        shirtColor: 0x9a5b32,
        mood: 'happy',
        scale: 1.12,
        hasHeart: true
      });
      this.checklistHeroChar.position.set(-0.75, 0.14, 0.05);
      this.trueSuccessChecklistGroup.add(this.checklistHeroChar);

      // Right: 3 Stacked 3D Checklist Cards (2 Red X + 1 Green Check)
      const checkItems = [
        { text: 'sở hữu thật nhiều tài sản', mark: 'X', border: '#f43f5e' },
        { text: 'đánh đổi sức khỏe, người thân', mark: 'X', border: '#f43f5e' },
        { text: 'giữ trọn điều quan trọng nhất', mark: 'CHECK', border: '#10b981' }
      ];
      checkItems.forEach((item, idx) => {
        const card = this._create3DNeonBadge({
          text: item.text,
          borderColor: item.border,
          mark: item.mark,
          widthWorld: 2.35,
          heightWorld: 0.52
        });
        card.position.set(0.68, 2.15 - idx * 0.62, 0.08);
        this.trueSuccessChecklistGroup.add(card);
        this.checklistCards3D.push({ mesh: card, baseY: 2.15 - idx * 0.62, index: idx });
      });

      // =========================================================================
      // 75. SCENE: cherish_parents_and_loved_ones_now (at x = 1368, z = 12)
      // "Đừng đợi đến khi cha mẹ già đi mới học cách quan tâm. Đừng đợi người rời xa… Đừng đợi tuổi trẻ qua đi"
      // Visual: 3D Family & Youth Reunion with 5 Pink Progress Dots ("một hành trình yêu thương ngay hôm nay")
      // =========================================================================
      this.cherishNowGroup = new THREE.Group();
      this.cherishNowGroup.position.set(1368, 0, 12);
      this.scene.add(this.cherishNowGroup);
      makeStagePedestal(this.cherishNowGroup, 2.55, emeraldMat);

      const light75A = new THREE.PointLight(0xfbbf24, 2.6, 22);
      light75A.position.set(0, 4.2, 2.8);
      this.cherishNowGroup.add(light75A);

      // Center Hero Character + Elderly Parents on Left + Loved One on Right (compact spacing)
      const heroNow = this._createStylizedCharacter3D({
        shirtColor: 0x0284c7,
        mood: 'happy',
        scale: 1.08,
        hasHeart: true
      });
      heroNow.position.set(0, 0.14, 0.15);
      this.cherishNowGroup.add(heroNow);

      const parentNow = this._createStylizedCharacter3D({
        shirtColor: 0x475569,
        hairColor: 0xe2e8f0,
        mood: 'happy',
        scale: 0.98
      });
      parentNow.position.set(-0.72, 0.14, 0);
      this.cherishNowGroup.add(parentNow);

      const partnerNow = this._createStylizedCharacter3D({
        shirtColor: 0xdb2777,
        mood: 'happy',
        scale: 0.98
      });
      partnerNow.position.set(0.72, 0.14, 0);
      this.cherishNowGroup.add(partnerNow);
      this.cherishNowChars.push(heroNow, parentNow, partnerNow);

      // 5 Glowing Progress Dots above
      for (let d = 0; d < 5; d++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), sakuraPinkMat);
        dot.position.set(-0.7 + d * 0.35, 2.45, 0.15);
        this.cherishNowGroup.add(dot);
        this.cherishProgressDots.push(dot);
      }

      const badge75 = this._create3DNeonBadge({
        text: 'yêu thương & sống ngay hôm nay',
        borderColor: '#f472b6',
        textColor: '#fce7f3',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge75.position.set(0, 2.95, 0.15);
      this.cherishNowGroup.add(badge75);

      // =========================================================================
      // 76. SCENE: silent_river_of_time_hourglass (at x = 1386, z = 12)
      // "Thời gian không lấy đi mọi thứ trong một khoảnh khắc. Nó chỉ lặng lẽ trôi qua... mãi không quay về"
      // Visual: Monumental 3D Hourglass + Drifting Calendar Pages + Character watching time flow
      // =========================================================================
      this.silentTimeGroup = new THREE.Group();
      this.silentTimeGroup.position.set(1386, 0, 12);
      this.scene.add(this.silentTimeGroup);
      makeStagePedestal(this.silentTimeGroup, 2.45, cyanCrystalMat);

      const light76A = new THREE.PointLight(0xc084fc, 2.5, 20);
      light76A.position.set(1.0, 4.0, 2.5);
      this.silentTimeGroup.add(light76A);
      const light76B = new THREE.PointLight(0x38bdf8, 2.4, 20);
      light76B.position.set(-1.0, 3.5, 2.2);
      this.silentTimeGroup.add(light76B);

      this.silentTimeChar = this._createStylizedCharacter3D({
        shirtColor: 0x9a5b32,
        mood: 'sad',
        scale: 1.12
      });
      this.silentTimeChar.position.set(-0.78, 0.14, 0.15);
      this.silentTimeGroup.add(this.silentTimeChar);

      // Giant Glowing Hourglass in the center-right
      const hgTop = new THREE.Mesh(new THREE.ConeGeometry(0.78, 1.05, 24, 1, true), cyanCrystalMat);
      hgTop.position.set(0.65, 2.05, 0);
      hgTop.rotation.x = Math.PI;
      this.silentTimeGroup.add(hgTop);

      const hgBot = new THREE.Mesh(new THREE.ConeGeometry(0.78, 1.05, 24, 1, true), amethystMat);
      hgBot.position.set(0.65, 0.95, 0);
      this.silentTimeGroup.add(hgBot);

      const hgRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.038, 16, 48), sunriseGoldMat);
      hgRing.position.set(0.65, 1.5, 0);
      this.silentTimeGroup.add(hgRing);

      // Drifting Calendar / Memory Pages floating away
      const pageLabels = ['tuổi trẻ', 'ngày tháng', 'cơ hội', 'ký ức'];
      for (let p = 0; p < 4; p++) {
        const pageMesh = this._create3DNeonBadge({
          text: pageLabels[p],
          borderColor: p % 2 === 0 ? '#38bdf8' : '#c084fc',
          widthWorld: 1.15,
          heightWorld: 0.38
        });
        this.silentTimeGroup.add(pageMesh);
        this.silentTimePages.push({ mesh: pageMesh, index: p, phase: p / 4 });
      }

      // =========================================================================
      // 77. SCENE: existing_vs_truly_living_awakening (at x = 1404, z = 12)
      // "Không phải hối tiếc vì đã có quá nhiều ngày tồn tại, nhưng lại quá ít ngày thực sự sống"
      // Visual: Dropping the heavy "chỉ tồn tại" stone block on Left + Character stepping into Golden Sunrise Horizon
      // =========================================================================
      this.trulyLivingGroup = new THREE.Group();
      this.trulyLivingGroup.position.set(1404, 0, 12);
      this.scene.add(this.trulyLivingGroup);
      makeStagePedestal(this.trulyLivingGroup, 2.55, sunriseGoldMat);

      const light77A = new THREE.PointLight(0xfbbf24, 2.8, 22);
      light77A.position.set(1.2, 4.2, 2.5);
      this.trulyLivingGroup.add(light77A);
      const light77B = new THREE.PointLight(0x10b981, 2.4, 20);
      light77B.position.set(-1.2, 3.5, 2.2);
      this.trulyLivingGroup.add(light77B);

      // Left: Heavy burden block ("chỉ tồn tại") dropped onto the ground
      this.droppedExistBlock = this._create3DNeonBadge({
        text: 'chỉ tồn tại',
        subText: 'thôi mang hối tiếc',
        borderColor: '#94a3b8',
        bgColor: 'rgba(68, 52, 38, 0.92)',
        widthWorld: 1.55,
        heightWorld: 0.95
      });
      this.droppedExistBlock.position.set(-0.85, 0.58, 0.15);
      this.droppedExistBlock.rotation.z = 0.22;
      this.trulyLivingGroup.add(this.droppedExistBlock);

      // Center: Joyful Awakened Character with glowing Heart
      this.trulyLivingChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        hairColor: 0x3b2818,
        mood: 'happy',
        scale: 1.15,
        hasHeart: true
      });
      this.trulyLivingChar.position.set(0.12, 0.14, 0.25);
      this.trulyLivingGroup.add(this.trulyLivingChar);

      // Right / Background: Golden Sunrise Horizon & Radiant Sun Core
      this.sunriseRaysGroup = new THREE.Group();
      this.sunriseRaysGroup.position.set(0.92, 1.85, -0.45);
      this.sunriseRaysGroup.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 2), sunriseGoldMat));
      const sunRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.042, 16, 48), sakuraPinkMat);
      this.sunriseRaysGroup.add(sunRing1);
      const sunRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.035, 16, 48), cyanCrystalMat);
      sunRing2.rotation.x = Math.PI / 3;
      this.sunriseRaysGroup.add(sunRing2);
      this.sunriseRaysGroup.add(makeColorHalo(this.glowTex, 3.2, 0.95));
      this.trulyLivingGroup.add(this.sunriseRaysGroup);

      const badge77Live = this._create3DNeonBadge({
        text: 'thực sự sống trọn từng ngày',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        widthWorld: 2.55,
        heightWorld: 0.52
      });
      badge77Live.position.set(0.25, 2.55, 0.15);
      this.trulyLivingGroup.add(badge77Live);
    }

    /**
     * Build 9 rich, character-driven & metaphor-driven 3D dioramas for
     * "ĐỪNG VỘI ĐÁNH GIÁ MỘT NGƯỜI QUA NHỮNG GÌ HỌ ĐANG CÓ" (scenes 78..86 at x = 1422..1566, z = 12)
     */
    _buildJudgeNotByPossessionsMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const sunriseGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.62,
        roughness: 0.14,
        metalness: 0.65
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });

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

      const makeStagePedestal = (group, radius = 2.45, ringColorMat = sunriseGoldMat) => {
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius + 0.18, 0.14, 36),
          new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: 0x1e293b,
            emissiveIntensity: 0.3,
            roughness: 0.35,
            metalness: 0.7
          })
        );
        base.position.y = 0.07;
        group.add(base);

        const outerRing = new THREE.Mesh(
          new THREE.TorusGeometry(radius + 0.02, 0.032, 12, 48),
          ringColorMat
        );
        outerRing.rotation.x = Math.PI / 2;
        outerRing.position.y = 0.14;
        group.add(outerRing);

        const innerRing = new THREE.Mesh(
          new THREE.TorusGeometry(radius * 0.65, 0.022, 12, 48),
          porcelainBlueMat
        );
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = 0.142;
        group.add(innerRing);
      };

      // =========================================================================
      // 78. SCENE: surface_judgment_scale_illusion (at x = 1422, z = 12)
      // "Có một sai lầm mà rất nhiều người mắc phải: Dùng những gì người khác đang có để đánh giá giá trị"
      // Visual: Tilting Judgment Scale + Magnifying Glass + Flashy Gold vs Deep Inner Diamond
      // =========================================================================
      this.surfaceJudgmentGroup = new THREE.Group();
      this.surfaceJudgmentGroup.position.set(1422, 0, 12);
      this.scene.add(this.surfaceJudgmentGroup);
      makeStagePedestal(this.surfaceJudgmentGroup, 2.45, sunriseGoldMat);

      const light78A = new THREE.PointLight(0xfbbf24, 2.5, 20);
      light78A.position.set(1.2, 3.8, 2.5);
      this.surfaceJudgmentGroup.add(light78A);
      const light78B = new THREE.PointLight(0x38bdf8, 2.3, 18);
      light78B.position.set(-1.2, 3.5, 2.2);
      this.surfaceJudgmentGroup.add(light78B);

      // Tilting Scale Beam
      this.surfaceScaleBeam = new THREE.Group();
      this.surfaceScaleBeam.position.set(0, 1.85, 0);

      const scaleBasePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.85, 16), darkSteelMat);
      scaleBasePillar.position.set(0, 0.92, 0);
      this.surfaceJudgmentGroup.add(scaleBasePillar);

      const beamBar = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 0.08), sunriseGoldMat);
      this.surfaceScaleBeam.add(beamBar);

      // Left pan: Flashy golden money bag + coins (surface wealth)
      const panLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.06, 24), darkSteelMat);
      panLeft.position.set(-0.95, -0.45, 0);
      this.surfaceScaleBeam.add(panLeft);
      const goldBag = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), sunriseGoldMat);
      goldBag.position.set(-0.95, -0.22, 0);
      this.surfaceScaleBeam.add(goldBag);

      // Right pan: Simple Chibi Character with glowing inner cyan diamond
      const panRight = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.06, 24), darkSteelMat);
      panRight.position.set(0.95, -0.45, 0);
      this.surfaceScaleBeam.add(panRight);
      const innerDiamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 1), cyanCrystalMat);
      innerDiamond.position.set(0.95, -0.18, 0);
      innerDiamond.add(makeColorHalo(this.cyanGlowTex, 1.5, 0.85));
      this.surfaceScaleBeam.add(innerDiamond);

      this.surfaceJudgmentGroup.add(this.surfaceScaleBeam);

      // Floating golden magnifying glass inspecting the gold pan
      this.surfaceMagnifier = new THREE.Group();
      this.surfaceMagnifier.position.set(-0.95, 2.35, 0.25);
      const magRim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 12, 32), sunriseGoldMat);
      this.surfaceMagnifier.add(magRim);
      const magHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8), darkSteelMat);
      magHandle.position.set(0.24, -0.24, 0);
      magHandle.rotation.z = -Math.PI / 4;
      this.surfaceMagnifier.add(magHandle);
      this.surfaceJudgmentGroup.add(this.surfaceMagnifier);

      // Character standing on stage
      this.surfaceJudgeCharR = this._createStylizedCharacter3D({
        shirtColor: 0x9a5b32,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      this.surfaceJudgeCharR.position.set(0.72, 0.14, 0.1);
      this.surfaceJudgmentGroup.add(this.surfaceJudgeCharR);

      const badge78A = this._create3DNeonBadge({
        text: 'đánh giá qua tài sản',
        borderColor: '#f43f5e',
        mark: 'X',
        widthWorld: 2.15,
        heightWorld: 0.52
      });
      badge78A.position.set(-0.75, 2.45, 0.1);
      this.surfaceJudgmentGroup.add(badge78A);

      const badge78B = this._create3DNeonBadge({
        text: 'giá trị thực bên trong',
        borderColor: '#10b981',
        mark: 'CHECK',
        widthWorld: 2.15,
        heightWorld: 0.52
      });
      badge78B.position.set(0.75, 2.45, 0.1);
      this.surfaceJudgmentGroup.add(badge78B);

      // =========================================================================
      // 79. SCENE: three_hasty_labels_cards (at x = 1440, z = 12)
      // "Thấy chưa thành công -> kém cỏi | Thấy sống giản dị -> tầm thường | Thấy chật vật -> thất bại"
      // Visual: 3 Framed 3D Storyboard Cards displaying the 3 premature labels
      // =========================================================================
      this.threeLabelsGroup = new THREE.Group();
      this.threeLabelsGroup.position.set(1440, 0, 12);
      this.scene.add(this.threeLabelsGroup);
      makeStagePedestal(this.threeLabelsGroup, 2.45, amethystMat);

      const light79A = new THREE.PointLight(0xc084fc, 2.5, 20);
      light79A.position.set(0, 4.0, 2.8);
      this.threeLabelsGroup.add(light79A);

      const labelOffsets = [-1.18, 0, 1.18];
      const labelTitles = ['chưa thành công: kém cỏi?', 'sống giản dị: tầm thường?', 'đang chật vật: thất bại?'];
      const labelBorders = ['#38bdf8', '#fbbf24', '#f43f5e'];

      labelOffsets.forEach((lx, idx) => {
        const cardGroup = new THREE.Group();
        cardGroup.position.set(lx, 1.75, 0);

        const cardFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.08, 1.45, 0.06),
          new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: idx === 0 ? 0x0284c7 : idx === 1 ? 0xd97706 : 0xbe123c,
            emissiveIntensity: 0.35,
            roughness: 0.25
          })
        );
        cardGroup.add(cardFrame);

        const cardBackdrop = new THREE.Mesh(
          new THREE.PlaneGeometry(1.02, 1.38),
          new THREE.MeshBasicMaterial({
            color: idx === 0 ? 0x0c4a6e : idx === 1 ? 0x78350f : 0x881337
          })
        );
        cardBackdrop.position.z = 0.035;
        cardGroup.add(cardBackdrop);

        if (idx === 0) {
          // Frame 1: Person quietly studying by night lamp (accumulating inner power)
          const lampMesh = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 12), sunriseGoldMat);
          lampMesh.position.set(-0.25, 0.1, 0.06);
          cardGroup.add(lampMesh);
          const studentChar = this._createStylizedCharacter3D({
            shirtColor: 0x3b82f6,
            mood: 'happy',
            scale: 0.46
          });
          studentChar.position.set(0.15, -0.52, 0.08);
          cardGroup.add(studentChar);
        } else if (idx === 1) {
          // Frame 2: Person drinking green tea with tranquil zen spirit
          const teaCup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.1, 12), emeraldMat);
          teaCup.position.set(0, -0.15, 0.08);
          cardGroup.add(teaCup);
          const simpleChar = this._createStylizedCharacter3D({
            shirtColor: 0x059669,
            mood: 'happy',
            scale: 0.46
          });
          simpleChar.position.set(0, -0.52, 0.08);
          cardGroup.add(simpleChar);
        } else {
          // Frame 3: Resilient person wiping sweat, rising with a backpack
          const struggleChar = this._createStylizedCharacter3D({
            shirtColor: 0xe11d48,
            mood: 'sad',
            scale: 0.46
          });
          struggleChar.position.set(0, -0.52, 0.08);
          cardGroup.add(struggleChar);
        }

        const bottomBadge = this._create3DNeonBadge({
          text: labelTitles[idx],
          borderColor: labelBorders[idx],
          widthWorld: 1.1,
          heightWorld: 0.38
        });
        bottomBadge.position.set(0, -0.98, 0.06);
        cardGroup.add(bottomBadge);

        this.threeLabelsGroup.add(cardGroup);
        this.hastyLabelsCards.push(cardGroup);
      });

      // =========================================================================
      // 80. SCENE: calm_surface_hidden_tempest (at x = 1458, z = 12)
      // "Nhưng chúng ta đâu biết được phía sau sự bình lặng ấy là bao nhiêu giông bão mà họ đã đi qua"
      // Visual: Iceberg Metaphor — Calm water surface on top, forged golden scars & tempest roots beneath
      // =========================================================================
      this.hiddenTempestGroup = new THREE.Group();
      this.hiddenTempestGroup.position.set(1458, 0, 12);
      this.scene.add(this.hiddenTempestGroup);
      makeStagePedestal(this.hiddenTempestGroup, 2.45, cyanCrystalMat);

      const light80A = new THREE.PointLight(0x38bdf8, 2.5, 20);
      light80A.position.set(0, 4.0, 2.5);
      this.hiddenTempestGroup.add(light80A);

      // Translucent cyan water plane dividing above and below
      const waterDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 2.1, 0.04, 32),
        new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          transmission: 0.82,
          opacity: 0.85,
          transparent: true,
          roughness: 0.1
        })
      );
      waterDisc.position.y = 1.05;
      this.hiddenTempestGroup.add(waterDisc);

      // Above water: Serene Chibi character holding glowing heart
      this.calmPersonChar = this._createStylizedCharacter3D({
        shirtColor: 0x0284c7,
        mood: 'happy',
        scale: 1.08,
        hasHeart: true
      });
      this.calmPersonChar.position.set(0, 1.05, 0.15);
      this.hiddenTempestGroup.add(this.calmPersonChar);

      // Below water: Deep mountain iceberg rock with glowing gold Kintsugi scars
      this.hiddenScarsMesh = new THREE.Group();
      this.hiddenScarsMesh.position.set(0, 0.45, 0);

      const deepRock = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.45, 8), darkSteelMat);
      deepRock.rotation.x = Math.PI;
      this.hiddenScarsMesh.add(deepRock);

      // 3 Golden scar rings of honor
      for (let s = 0; s < 3; s++) {
        const scarRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.65 + s * 0.28, 0.035, 12, 32),
          sunriseGoldMat
        );
        scarRing.rotation.x = Math.PI / 2;
        scarRing.position.y = -0.2 - s * 0.25;
        this.hiddenScarsMesh.add(scarRing);
      }
      this.hiddenTempestGroup.add(this.hiddenScarsMesh);

      const badge80A = this._create3DNeonBadge({
        text: 'bình lặng phía trên',
        borderColor: '#38bdf8',
        textColor: '#e0f2fe',
        widthWorld: 2.15,
        heightWorld: 0.52
      });
      badge80A.position.set(-0.75, 2.45, 0.15);
      this.hiddenTempestGroup.add(badge80A);

      const badge80B = this._create3DNeonBadge({
        text: 'bao giông bão đã đi qua',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        widthWorld: 2.15,
        heightWorld: 0.52
      });
      badge80B.position.set(0.75, 2.45, 0.15);
      this.hiddenTempestGroup.add(badge80B);

      // =========================================================================
      // 81. SCENE: two_starting_lines_backpack (at x = 1476, z = 12)
      // "Có người xuất phát từ vạch đích... Có người phải gánh vác cả gia đình, tự tìm con đường bắt đầu"
      // Visual: Split Starting Line — Golden Cushion vs Heavy Backpack climbing uphill
      // =========================================================================
      this.twoStartingLinesGroup = new THREE.Group();
      this.twoStartingLinesGroup.position.set(1476, 0, 12);
      this.scene.add(this.twoStartingLinesGroup);
      makeStagePedestal(this.twoStartingLinesGroup, 2.45, sunriseGoldMat);

      const light81A = new THREE.PointLight(0xfbbf24, 2.5, 20);
      light81A.position.set(-1.2, 3.8, 2.5);
      this.twoStartingLinesGroup.add(light81A);
      const light81B = new THREE.PointLight(0xf43f5e, 2.3, 20);
      light81B.position.set(1.2, 3.8, 2.5);
      this.twoStartingLinesGroup.add(light81B);

      // Left: Character on Golden Carpet / Finish line banner
      const goldCarpet = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 1.45), sunriseGoldMat);
      goldCarpet.position.set(-0.78, 0.14, 0);
      this.twoStartingLinesGroup.add(goldCarpet);

      const runnerA = this._createStylizedCharacter3D({
        shirtColor: 0xf59e0b,
        mood: 'happy',
        scale: 1.05
      });
      runnerA.position.set(-0.78, 0.16, 0.1);
      this.twoStartingLinesGroup.add(runnerA);

      // Right: Character climbing rugged steps with a heavy rock backpack on back
      const ruggedRamp = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 1.45), darkSteelMat);
      ruggedRamp.position.set(0.78, 0.28, 0);
      ruggedRamp.rotation.x = -0.15;
      this.twoStartingLinesGroup.add(ruggedRamp);

      const runnerB = this._createStylizedCharacter3D({
        shirtColor: 0x9a5b32,
        mood: 'sad',
        scale: 1.05
      });
      runnerB.position.set(0.78, 0.42, 0.1);

      // Heavy rock backpack strapped to back
      this.heavyBackpackMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), darkSteelMat);
      this.heavyBackpackMesh.position.set(0, 1.05, -0.25);
      runnerB.add(this.heavyBackpackMesh);

      this.twoStartingLinesGroup.add(runnerB);
      this.twoStartRunners.push(runnerA, runnerB);

      const badge81A = this._create3DNeonBadge({
        text: 'sinh ra ở vạch đích',
        borderColor: '#fbbf24',
        widthWorld: 2.05,
        heightWorld: 0.52
      });
      badge81A.position.set(-0.78, 2.45, 0.1);
      this.twoStartingLinesGroup.add(badge81A);

      const badge81B = this._create3DNeonBadge({
        text: 'gánh vác tự mở lối',
        borderColor: '#f43f5e',
        widthWorld: 2.05,
        heightWorld: 0.52
      });
      badge81B.position.set(0.78, 2.45, 0.1);
      this.twoStartingLinesGroup.add(badge81B);

      // =========================================================================
      // 82. SCENE: own_clock_unique_timeline (at x = 1494, z = 12)
      // "Cuộc đời không phải cuộc đua... Lấy thước đo người khác chẳng khác nào lấy đồng hồ họ đo giờ mình"
      // Visual: Two Giant Starlight Clocks ticking in independent Time Zones (A & B)
      // =========================================================================
      this.ownTimelineGroup = new THREE.Group();
      this.ownTimelineGroup.position.set(1494, 0, 12);
      this.scene.add(this.ownTimelineGroup);
      makeStagePedestal(this.ownTimelineGroup, 2.45, cyanCrystalMat);

      const light82A = new THREE.PointLight(0x38bdf8, 2.5, 20);
      light82A.position.set(0, 4.0, 2.5);
      this.ownTimelineGroup.add(light82A);

      // Clock 1 on left (Gold) vs Clock 2 on right (Cyan)
      [-0.82, 0.82].forEach((cx, idx) => {
        const clockGroup = new THREE.Group();
        clockGroup.position.set(cx, 1.65, 0);

        const clockDial = new THREE.Mesh(
          new THREE.CylinderGeometry(0.55, 0.55, 0.06, 32),
          idx === 0 ? sunriseGoldMat : cyanCrystalMat
        );
        clockDial.rotation.x = Math.PI / 2;
        clockGroup.add(clockDial);

        const clockRim = new THREE.Mesh(
          new THREE.TorusGeometry(0.58, 0.035, 12, 36),
          idx === 0 ? porcelainBlueMat : sunriseGoldMat
        );
        clockGroup.add(clockRim);

        // Moving Clock Hands
        const handHour = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.02), darkSteelMat);
        handHour.position.y = 0.12;
        const pivotHour = new THREE.Group();
        pivotHour.add(handHour);
        pivotHour.position.z = 0.04;
        clockGroup.add(pivotHour);

        const handMin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 0.02), darkSteelMat);
        handMin.position.y = 0.16;
        const pivotMin = new THREE.Group();
        pivotMin.add(handMin);
        pivotMin.position.z = 0.05;
        clockGroup.add(pivotMin);

        this.uniqueClockHands.push({ pivotHour, pivotMin, speed: idx === 0 ? 1.0 : 1.4 });
        this.ownTimelineGroup.add(clockGroup);
      });

      // Character standing peacefully in center
      const timelineChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      timelineChar.position.set(0, 0.14, 0.2);
      this.ownTimelineGroup.add(timelineChar);

      const badge82 = this._create3DNeonBadge({
        text: 'chiếc đồng hồ của chính mình',
        borderColor: '#38bdf8',
        textColor: '#e0f2fe',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge82.position.set(0, 2.55, 0.15);
      this.ownTimelineGroup.add(badge82);

      // =========================================================================
      // 83. SCENE: tree_deep_roots_underground (at x = 1512, z = 12)
      // "Một cái cây không thể lớn lên sau một đêm, con người không thể định nghĩa bởi một giai đoạn khó khăn"
      // Visual: Mighty Crystal Tree above + Deep Golden Roots reaching deep into bedrock below
      // =========================================================================
      this.deepRootsTreeGroup = new THREE.Group();
      this.deepRootsTreeGroup.position.set(1512, 0, 12);
      this.scene.add(this.deepRootsTreeGroup);
      makeStagePedestal(this.deepRootsTreeGroup, 2.45, emeraldMat);

      const light83A = new THREE.PointLight(0x10b981, 2.6, 20);
      light83A.position.set(0, 4.2, 2.5);
      this.deepRootsTreeGroup.add(light83A);

      // Mighty Tree Trunk & Foliage
      this.deepRootsTree = new THREE.Group();
      this.deepRootsTree.position.set(0, 0.14, 0);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 1.45, 12), darkSteelMat);
      trunk.position.y = 0.72;
      this.deepRootsTree.add(trunk);

      // 3 Emerald Canopy spheres
      const canopyM = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), emeraldMat);
      canopyM.position.set(0, 1.65, 0);
      this.deepRootsTree.add(canopyM);
      const canopyL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), sakuraPinkMat);
      canopyL.position.set(-0.45, 1.45, 0.1);
      this.deepRootsTree.add(canopyL);
      const canopyR = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), cyanCrystalMat);
      canopyR.position.set(0.45, 1.45, 0.1);
      this.deepRootsTree.add(canopyR);

      // Deep branching golden roots below ground
      for (let r = 0; r < 5; r++) {
        const rootBranch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.02, 0.65, 8),
          sunriseGoldMat
        );
        rootBranch.position.set((r - 2) * 0.28, -0.25, 0.05);
        rootBranch.rotation.z = (r - 2) * 0.25;
        this.deepRootsTree.add(rootBranch);
        this.deepRootSprouts.push(rootBranch);
      }
      this.deepRootsTreeGroup.add(this.deepRootsTree);

      const badge83A = this._create3DNeonBadge({
        text: 'cây lớn cần đâm rễ sâu',
        borderColor: '#10b981',
        widthWorld: 2.15,
        heightWorld: 0.52
      });
      badge83A.position.set(-0.75, 2.45, 0.1);
      this.deepRootsTreeGroup.add(badge83A);

      const badge83B = this._create3DNeonBadge({
        text: 'khó khăn chỉ là giai đoạn',
        borderColor: '#fbbf24',
        widthWorld: 2.15,
        heightWorld: 0.52
      });
      badge83B.position.set(0.75, 2.45, 0.1);
      this.deepRootsTreeGroup.add(badge83B);

      // =========================================================================
      // 84. SCENE: silent_preparation_slingshot_run (at x = 1530, z = 12)
      // "Đừng coi thường người ở phía sau... Họ đang âm thầm chuẩn bị cho một hành trình rất xa"
      // Visual: Glowing Elastic Slingshot Arch pulling back for a monumental launch
      // =========================================================================
      this.slingshotPrepGroup = new THREE.Group();
      this.slingshotPrepGroup.position.set(1530, 0, 12);
      this.scene.add(this.slingshotPrepGroup);
      makeStagePedestal(this.slingshotPrepGroup, 2.45, amethystMat);

      const light84A = new THREE.PointLight(0xc084fc, 2.5, 20);
      light84A.position.set(0, 4.0, 2.5);
      this.slingshotPrepGroup.add(light84A);

      // Giant Slingshot Arch pillars
      this.slingshotBowMesh = new THREE.Group();
      this.slingshotBowMesh.position.set(0.65, 1.25, 0);

      const archPoleL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.85, 12), sunriseGoldMat);
      archPoleL.position.set(-0.65, 0, 0);
      this.slingshotBowMesh.add(archPoleL);

      const archPoleR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.85, 12), sunriseGoldMat);
      archPoleR.position.set(0.65, 0, 0);
      this.slingshotBowMesh.add(archPoleR);

      // Elastic energy beam pulled back
      const elasticBand = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 12, 32, Math.PI), sakuraPinkMat);
      elasticBand.position.set(0, 0.35, -0.45);
      elasticBand.rotation.x = Math.PI / 2;
      this.slingshotBowMesh.add(elasticBand);
      this.slingshotPrepGroup.add(this.slingshotBowMesh);

      // Character leaning back, getting ready to spring forward
      this.preppingArcherChar = this._createStylizedCharacter3D({
        shirtColor: 0x9a5b32,
        mood: 'happy',
        scale: 1.08,
        hasHeart: true
      });
      this.preppingArcherChar.position.set(-0.65, 0.14, 0.15);
      this.preppingArcherChar.rotation.y = 0.55;
      this.slingshotPrepGroup.add(this.preppingArcherChar);

      const badge84 = this._create3DNeonBadge({
        text: 'lùi bước để bay vạn dặm',
        borderColor: '#c084fc',
        textColor: '#f3e8ff',
        mark: 'CHECK',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge84.position.set(0, 2.55, 0.15);
      this.slingshotPrepGroup.add(badge84);

      // =========================================================================
      // 85. SCENE: value_in_perseverance_climb (at x = 1548, z = 12)
      // "Giá trị của một con người không nằm ở việc họ đang đứng ở đâu, mà ở cách họ nỗ lực bước tiếp"
      // Visual: Rising 7 Honor Steps with blooming lotus footprint & hero climbing upwards
      // =========================================================================
      this.valuePerseveranceGroup = new THREE.Group();
      this.valuePerseveranceGroup.position.set(1548, 0, 12);
      this.scene.add(this.valuePerseveranceGroup);
      makeStagePedestal(this.valuePerseveranceGroup, 2.45, emeraldMat);

      const light85A = new THREE.PointLight(0xfbbf24, 2.6, 20);
      light85A.position.set(0, 4.2, 2.5);
      this.valuePerseveranceGroup.add(light85A);

      // 5 Rising Crystal Steps from Left to Right
      for (let st = 0; st < 5; st++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(0.72, 0.12, 0.72),
          st % 2 === 0 ? sunriseGoldMat : emeraldMat
        );
        step.position.set(-1.0 + st * 0.5, 0.2 + st * 0.35, 0);
        this.valuePerseveranceGroup.add(step);

        // Blooming footprint flower on each step
        const stepLotus = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 1), sakuraPinkMat);
        stepLotus.position.set(-1.0 + st * 0.5, 0.3 + st * 0.35, 0.15);
        this.valuePerseveranceGroup.add(stepLotus);
      }

      this.perseveranceHeroChar = this._createStylizedCharacter3D({
        shirtColor: 0x0284c7,
        mood: 'happy',
        scale: 1.08,
        hasHeart: true
      });
      this.perseveranceHeroChar.position.set(0.12, 0.95, 0.1);
      this.valuePerseveranceGroup.add(this.perseveranceHeroChar);

      const badge85 = this._create3DNeonBadge({
        text: 'giá trị = nỗ lực bước tiếp',
        borderColor: '#10b981',
        textColor: '#d1fae5',
        mark: 'CHECK',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge85.position.set(0, 2.55, 0.15);
      this.valuePerseveranceGroup.add(badge85);

      // =========================================================================
      // 86. SCENE: empathy_walk_horizon_outro (at x = 1566, z = 12)
      // "Đừng vội phán xét một hành trình khi bạn chưa từng bước đi trên con đường của họ"
      // Visual: Empathy Portal Archway opening to Golden Sunrise Horizon + Open Heart Hero
      // =========================================================================
      this.empathyWalkGroup = new THREE.Group();
      this.empathyWalkGroup.position.set(1566, 0, 12);
      this.scene.add(this.empathyWalkGroup);
      makeStagePedestal(this.empathyWalkGroup, 2.55, sunriseGoldMat);

      const light86A = new THREE.PointLight(0xfbbf24, 2.8, 22);
      light86A.position.set(0, 4.2, 2.5);
      this.empathyWalkGroup.add(light86A);

      // Golden Archway Portal
      this.empathyHorizonGateway = new THREE.Group();
      this.empathyHorizonGateway.position.set(0.85, 1.65, -0.4);

      const archRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.045, 16, 48), sunriseGoldMat);
      this.empathyHorizonGateway.add(archRing1);
      const archRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.035, 16, 48), sakuraPinkMat);
      archRing2.rotation.x = Math.PI / 4;
      this.empathyHorizonGateway.add(archRing2);

      const sunCore86 = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 2), sunriseGoldMat);
      this.empathyHorizonGateway.add(sunCore86);
      this.empathyHorizonGateway.add(makeColorHalo(this.glowTex, 3.2, 0.95));
      this.empathyWalkGroup.add(this.empathyHorizonGateway);

      this.empathyWalkHero = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.15,
        hasHeart: true
      });
      this.empathyWalkHero.position.set(0.12, 0.14, 0.2);
      this.empathyWalkGroup.add(this.empathyWalkHero);

      const badge86 = this._create3DNeonBadge({
        text: 'thấu cảm & trân trọng mọi hành trình',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge86.position.set(0.2, 2.55, 0.15);
      this.empathyWalkGroup.add(badge86);
    }

    _buildPersonalResponsibilityMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const sunriseGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.62,
        roughness: 0.14,
        metalness: 0.65
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });

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

      const makeStagePedestal = (group, radius = 2.45, ringColorMat = sunriseGoldMat) => {
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius + 0.18, 0.14, 36),
          new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: 0x1e293b,
            emissiveIntensity: 0.3,
            roughness: 0.35,
            metalness: 0.7
          })
        );
        base.position.y = 0.07;
        group.add(base);

        const outerRing = new THREE.Mesh(
          new THREE.TorusGeometry(radius + 0.02, 0.032, 12, 48),
          ringColorMat
        );
        outerRing.rotation.x = Math.PI / 2;
        outerRing.position.y = 0.14;
        group.add(outerRing);

        const innerRing = new THREE.Mesh(
          new THREE.TorusGeometry(radius * 0.65, 0.022, 12, 48),
          porcelainBlueMat
        );
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = 0.142;
        group.add(innerRing);
      };

      // =========================================================================
      // 87. SCENE: self_reflection_mirror_pause (at x = 1584, z = 12)
      // "Có bao giờ bạn ngồi lại và tự hỏi: Tại sao cuộc sống của mình lại thành ra như thế này?"
      // Visual: Character pausing peacefully before a glowing oval Mirror of Truth
      // =========================================================================
      this.selfReflectionGroup = new THREE.Group();
      this.selfReflectionGroup.position.set(1584, 0, 12);
      this.scene.add(this.selfReflectionGroup);
      makeStagePedestal(this.selfReflectionGroup, 2.45, cyanCrystalMat);

      const light87A = new THREE.PointLight(0x38bdf8, 2.6, 20);
      light87A.position.set(0, 4.0, 2.5);
      this.selfReflectionGroup.add(light87A);

      // Oval Mirror of Truth
      this.selfMirrorMesh = new THREE.Group();
      this.selfMirrorMesh.position.set(0, 1.65, 0);

      const mirrorFrame = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.045, 16, 48),
        sunriseGoldMat
      );
      mirrorFrame.scale.set(0.75, 1.25, 1.0);
      this.selfMirrorMesh.add(mirrorFrame);

      const mirrorGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.62, 0.62, 0.02, 32),
        porcelainBlueMat
      );
      mirrorGlass.rotation.x = Math.PI / 2;
      mirrorGlass.scale.set(1.0, 1.0, 1.65);
      this.selfMirrorMesh.add(mirrorGlass);
      this.selfMirrorMesh.add(makeColorHalo(this.cyanGlowTex, 2.2, 0.75));
      this.selfReflectionGroup.add(this.selfMirrorMesh);

      // Character sitting/standing thoughtfully
      this.selfReflectionChar = this._createStylizedCharacter3D({
        shirtColor: 0x0284c7,
        mood: 'happy',
        scale: 1.08,
        hasHeart: true
      });
      this.selfReflectionChar.position.set(0, 0.14, 0.35);
      this.selfReflectionGroup.add(this.selfReflectionChar);

      const badge87 = this._create3DNeonBadge({
        text: 'tự soi chiếu cuộc đời',
        borderColor: '#38bdf8',
        textColor: '#e0f2fe',
        widthWorld: 2.65,
        heightWorld: 0.52
      });
      badge87.position.set(0, 2.55, 0.15);
      this.selfReflectionGroup.add(badge87);

      // =========================================================================
      // 88. SCENE: blame_pointing_arrows_vs_mirror (at x = 1602, z = 12)
      // "Chúng ta rất dễ đổ lỗi cho hoàn cảnh, xuất phát điểm, số phận hay một ai đó..."
      // Visual: Pointing outward Red Arrows of Blame colliding with a central Awakening Shield
      // =========================================================================
      this.blameArrowsGroup = new THREE.Group();
      this.blameArrowsGroup.position.set(1602, 0, 12);
      this.scene.add(this.blameArrowsGroup);
      makeStagePedestal(this.blameArrowsGroup, 2.45, roseQuartzMat);

      const light88A = new THREE.PointLight(0xf43f5e, 2.6, 20);
      light88A.position.set(0, 4.0, 2.5);
      this.blameArrowsGroup.add(light88A);

      // Central Protective Crystal Shield
      this.blameShield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.06, 24),
        amethystMat
      );
      this.blameShield.rotation.x = Math.PI / 2;
      this.blameShield.position.set(0, 1.55, 0);
      this.blameArrowsGroup.add(this.blameShield);

      // 6 Pointing Outward Blame Arrows
      for (let i = 0; i < 6; i++) {
        const arrowGroup = new THREE.Group();
        const ang = (i / 6) * Math.PI * 2;
        arrowGroup.position.set(Math.cos(ang) * 1.15, 1.55 + Math.sin(ang) * 0.45, 0);
        arrowGroup.rotation.z = ang - Math.PI / 2;

        const arrowShaft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), roseQuartzMat);
        arrowShaft.position.y = -0.15;
        arrowGroup.add(arrowShaft);

        const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 12), sunriseGoldMat);
        arrowHead.position.y = 0.15;
        arrowGroup.add(arrowHead);

        this.blameArrowsGroup.add(arrowGroup);
        this.blameArrows.push(arrowGroup);
      }

      this.blameChar = this._createStylizedCharacter3D({
        shirtColor: 0x9333ea,
        mood: 'sad',
        scale: 1.05
      });
      this.blameChar.position.set(0, 0.14, 0.25);
      this.blameArrowsGroup.add(this.blameChar);

      const badge88 = this._create3DNeonBadge({
        text: 'ngừng đổ lỗi cho ngoại cảnh',
        borderColor: '#f43f5e',
        textColor: '#ffe4e6',
        mark: 'X',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge88.position.set(0, 2.55, 0.15);
      this.blameArrowsGroup.add(badge88);

      // =========================================================================
      // 89. SCENE: victim_comfort_cage_breaking (at x = 1620, z = 12)
      // "Đổ lỗi là dễ nhất... coi mình là nạn nhân thì không cần cố gắng thay đổi"
      // Visual: Gray Comfort Cage Bars shattering with Golden Breakthrough Sparks
      // =========================================================================
      this.victimCageGroup = new THREE.Group();
      this.victimCageGroup.position.set(1620, 0, 12);
      this.scene.add(this.victimCageGroup);
      makeStagePedestal(this.victimCageGroup, 2.45, sunriseGoldMat);

      const light89A = new THREE.PointLight(0xfbbf24, 2.6, 20);
      light89A.position.set(0, 4.0, 2.5);
      this.victimCageGroup.add(light89A);

      // Cracking Comfort Cage
      this.victimCageMesh = new THREE.Group();
      this.victimCageMesh.position.set(0, 1.45, 0);

      for (let b = 0; b < 6; b++) {
        const barAngle = (b / 6) * Math.PI * 2;
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.85, 12), darkSteelMat);
        bar.position.set(Math.cos(barAngle) * 0.85, 0, Math.sin(barAngle) * 0.85);
        this.victimCageMesh.add(bar);
      }
      const cageRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 24), darkSteelMat);
      cageRoof.position.y = 0.95;
      this.victimCageMesh.add(cageRoof);

      this.victimCageGroup.add(this.victimCageMesh);

      this.victimChar = this._createStylizedCharacter3D({
        shirtColor: 0xd97706,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      this.victimChar.position.set(0, 0.14, 0.15);
      this.victimCageGroup.add(this.victimChar);

      const badge89 = this._create3DNeonBadge({
        text: 'thoát khỏi bẫy tâm lý nạn nhân',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge89.position.set(0, 2.55, 0.15);
      this.victimCageGroup.add(badge89);

      // =========================================================================
      // 90. SCENE: past_shadow_today_burden (at x = 1638, z = 12)
      // "Dù quá khứ có bất công, người chịu hậu quả của hôm nay chỉ là chính bạn"
      // Visual: Fading Past Shadow drifting back while Resilient Present Hero stands upright
      // =========================================================================
      this.pastShadowGroup = new THREE.Group();
      this.pastShadowGroup.position.set(1638, 0, 12);
      this.scene.add(this.pastShadowGroup);
      makeStagePedestal(this.pastShadowGroup, 2.45, emeraldMat);

      const light90A = new THREE.PointLight(0x10b981, 2.6, 20);
      light90A.position.set(0, 4.0, 2.5);
      this.pastShadowGroup.add(light90A);

      // Fading Smoky Past Shadow Mesh
      this.pastShadowMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.65, 0),
        new THREE.MeshStandardMaterial({
          color: 0x334155,
          emissive: 0x1e293b,
          transparent: true,
          opacity: 0.45,
          roughness: 0.8
        })
      );
      this.pastShadowMesh.position.set(-0.75, 1.45, -0.6);
      this.pastShadowGroup.add(this.pastShadowMesh);

      // Present Hero standing firm with glowing heart
      this.presentHeroChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.08,
        hasHeart: true
      });
      this.presentHeroChar.position.set(0.45, 0.14, 0.2);
      this.pastShadowGroup.add(this.presentHeroChar);

      const badge90 = this._create3DNeonBadge({
        text: 'bạn chịu trách nhiệm hôm nay',
        borderColor: '#10b981',
        textColor: '#d1fae5',
        mark: 'CHECK',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge90.position.set(0, 2.55, 0.15);
      this.pastShadowGroup.add(badge90);

      // =========================================================================
      // 91. SCENE: solitary_standing_pillar_strength (at x = 1656, z = 12)
      // "Cha mẹ không sống thay, bạn bè không gánh vác, không ai có nghĩa vụ giải cứu bạn"
      // Visual: Solitary Crystal Pillar standing high & firm with concentric neon aura rings
      // =========================================================================
      this.solitaryPillarGroup = new THREE.Group();
      this.solitaryPillarGroup.position.set(1656, 0, 12);
      this.scene.add(this.solitaryPillarGroup);
      makeStagePedestal(this.solitaryPillarGroup, 2.45, amethystMat);

      const light91A = new THREE.PointLight(0xc084fc, 2.6, 20);
      light91A.position.set(0, 4.0, 2.5);
      this.solitaryPillarGroup.add(light91A);

      // Central Solitary Pillar
      this.solitaryPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.72, 1.25, 24),
        porcelainBlueMat
      );
      this.solitaryPillar.position.set(0, 0.68, 0);
      this.solitaryPillarGroup.add(this.solitaryPillar);

      // 3 Concentric energy rings
      for (let r = 0; r < 3; r++) {
        const sRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.95 + r * 0.35, 0.025, 12, 36),
          r === 0 ? sunriseGoldMat : r === 1 ? amethystMat : cyanCrystalMat
        );
        sRing.rotation.x = Math.PI / 2;
        sRing.position.y = 0.5 + r * 0.35;
        this.solitaryPillarGroup.add(sRing);
        this.solitaryRings.push(sRing);
      }

      this.solitaryChar = this._createStylizedCharacter3D({
        shirtColor: 0x7e22ce,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      this.solitaryChar.position.set(0, 1.32, 0.1);
      this.solitaryPillarGroup.add(this.solitaryChar);

      const badge91 = this._create3DNeonBadge({
        text: 'không ai đến giải cứu cuộc đời bạn',
        borderColor: '#c084fc',
        textColor: '#f3e8ff',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge91.position.set(0, 2.65, 0.15);
      this.solitaryPillarGroup.add(badge91);

      // =========================================================================
      // 92. SCENE: ocean_ship_firm_helm_hands (at x = 1674, z = 12)
      // "Cuộc đời là con tàu: Trao bánh lái cho người khác, bạn không có quyền phàn nàn bão giông"
      // Visual: Giant Golden Ship Helm firmly gripped by resolute Captain Hero
      // =========================================================================
      this.firmHelmGroup = new THREE.Group();
      this.firmHelmGroup.position.set(1674, 0, 12);
      this.scene.add(this.firmHelmGroup);
      makeStagePedestal(this.firmHelmGroup, 2.45, sunriseGoldMat);

      const light92A = new THREE.PointLight(0xfbbf24, 2.8, 20);
      light92A.position.set(0, 4.0, 2.5);
      this.firmHelmGroup.add(light92A);

      // Giant Golden Ship Helm
      this.firmHelmMesh = new THREE.Group();
      this.firmHelmMesh.position.set(0, 1.45, 0.05);

      const helmOuter = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.045, 16, 40), sunriseGoldMat);
      this.firmHelmMesh.add(helmOuter);
      const helmHub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), darkSteelMat);
      helmHub.rotation.x = Math.PI / 2;
      this.firmHelmMesh.add(helmHub);

      // 8 Spokes
      for (let s = 0; s < 8; s++) {
        const spk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.65, 8), sunriseGoldMat);
        spk.rotation.z = (s / 8) * Math.PI;
        this.firmHelmMesh.add(spk);
      }
      this.firmHelmMesh.add(makeColorHalo(this.glowTex, 2.2, 0.85));
      this.firmHelmGroup.add(this.firmHelmMesh);

      this.captainChar = this._createStylizedCharacter3D({
        shirtColor: 0x0284c7,
        mood: 'happy',
        scale: 1.08,
        hasHeart: true
      });
      this.captainChar.position.set(0, 0.14, 0.35);
      this.firmHelmGroup.add(this.captainChar);

      const badge92 = this._create3DNeonBadge({
        text: 'tự nắm chặt bánh lái cuộc đời',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge92.position.set(0, 2.55, 0.15);
      this.firmHelmGroup.add(badge92);

      // =========================================================================
      // 93. SCENE: golden_key_future_portal (at x = 1692, z = 12)
      // "Chiếc chìa khóa mở ra cánh cửa tương lai vốn luôn nằm trong tay bạn..."
      // Visual: Floating Glowing Golden Master Key opening an Emerald Future Gateway
      // =========================================================================
      this.goldenKeyGroup = new THREE.Group();
      this.goldenKeyGroup.position.set(1692, 0, 12);
      this.scene.add(this.goldenKeyGroup);
      makeStagePedestal(this.goldenKeyGroup, 2.45, cyanCrystalMat);

      const light93A = new THREE.PointLight(0x38bdf8, 2.6, 20);
      light93A.position.set(0, 4.0, 2.5);
      this.goldenKeyGroup.add(light93A);

      // Emerald Future Gateway Arch
      this.futurePortalGateway = new THREE.Group();
      this.futurePortalGateway.position.set(0.65, 1.45, -0.2);

      const portalArch = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.045, 16, 36, Math.PI), emeraldMat);
      portalArch.rotation.z = Math.PI;
      this.futurePortalGateway.add(portalArch);
      this.goldenKeyGroup.add(this.futurePortalGateway);

      // Giant Glowing Golden Key
      this.goldenKeyMesh = new THREE.Group();
      this.goldenKeyMesh.position.set(-0.45, 1.55, 0.1);

      const keyBow = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 12, 24), sunriseGoldMat);
      this.goldenKeyMesh.add(keyBow);
      const keyStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 8), sunriseGoldMat);
      keyStem.position.set(0.35, 0, 0);
      keyStem.rotation.z = Math.PI / 2;
      this.goldenKeyMesh.add(keyStem);

      const keyBit1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), sunriseGoldMat);
      keyBit1.position.set(0.55, -0.07, 0);
      this.goldenKeyMesh.add(keyBit1);
      const keyBit2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), sunriseGoldMat);
      keyBit2.position.set(0.65, -0.09, 0);
      this.goldenKeyMesh.add(keyBit2);

      this.goldenKeyMesh.add(makeColorHalo(this.glowTex, 1.8, 0.9));
      this.goldenKeyGroup.add(this.goldenKeyMesh);

      this.keyBearerChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      this.keyBearerChar.position.set(-0.45, 0.14, 0.25);
      this.goldenKeyGroup.add(this.keyBearerChar);

      const badge93 = this._create3DNeonBadge({
        text: 'chìa khóa tương lai trong tay bạn',
        borderColor: '#38bdf8',
        textColor: '#e0f2fe',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge93.position.set(0, 2.55, 0.15);
      this.goldenKeyGroup.add(badge93);

      // =========================================================================
      // 94. SCENE: origin_valley_to_summit_peak (at x = 1710, z = 12)
      // "Hoàn cảnh quyết định nơi bắt đầu, thái độ & trách nhiệm quyết định nơi dừng chân"
      // Visual: Ascending Mountain Ridge from Low Valley to Glowing Summit Star
      // =========================================================================
      this.valleySummitGroup = new THREE.Group();
      this.valleySummitGroup.position.set(1710, 0, 12);
      this.scene.add(this.valleySummitGroup);
      makeStagePedestal(this.valleySummitGroup, 2.45, emeraldMat);

      const light94A = new THREE.PointLight(0x10b981, 2.6, 20);
      light94A.position.set(0, 4.0, 2.5);
      this.valleySummitGroup.add(light94A);

      // Low start block on left vs high summit on right
      const startRock = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, 0.75), darkSteelMat);
      startRock.position.set(-0.85, 0.2, 0);
      this.valleySummitGroup.add(startRock);

      const summitPeak = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.45, 16), emeraldMat);
      summitPeak.position.set(0.85, 0.85, 0);
      this.valleySummitGroup.add(summitPeak);

      // Glowing Summit Star
      this.summitStarMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), sunriseGoldMat);
      this.summitStarMesh.position.set(0.85, 1.75, 0);
      this.summitStarMesh.add(makeColorHalo(this.glowTex, 1.6, 0.85));
      this.valleySummitGroup.add(this.summitStarMesh);

      this.mountainClimberChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      this.mountainClimberChar.position.set(-0.15, 0.35, 0.15);
      this.valleySummitGroup.add(this.mountainClimberChar);

      const badge94 = this._create3DNeonBadge({
        text: 'thái độ quyết định đỉnh cao',
        borderColor: '#10b981',
        textColor: '#d1fae5',
        mark: 'CHECK',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge94.position.set(0, 2.55, 0.15);
      this.valleySummitGroup.add(badge94);

      // =========================================================================
      // 95. SCENE: brick_by_brick_golden_bridge (at x = 1728, z = 12)
      // "Mỗi thói quen nhỏ, mỗi quyết định, mỗi lần không bỏ cuộc là viên gạch xây ngày mai"
      // Visual: 5 Interlocking Crystal Bricks forming a sturdy bridge over the void
      // =========================================================================
      this.brickBridgeGroup = new THREE.Group();
      this.brickBridgeGroup.position.set(1728, 0, 12);
      this.scene.add(this.brickBridgeGroup);
      makeStagePedestal(this.brickBridgeGroup, 2.45, sakuraPinkMat);

      const light95A = new THREE.PointLight(0xf472b6, 2.6, 20);
      light95A.position.set(0, 4.0, 2.5);
      this.brickBridgeGroup.add(light95A);

      for (let bk = 0; bk < 5; bk++) {
        const brick = new THREE.Mesh(
          new THREE.BoxGeometry(0.52, 0.14, 0.52),
          bk % 2 === 0 ? sunriseGoldMat : cyanCrystalMat
        );
        brick.position.set(-1.0 + bk * 0.5, 0.35 + bk * 0.18, 0);
        this.brickBridgeGroup.add(brick);
        this.brickBridgeBlocks.push(brick);

        // Small glowing habit token on each brick
        const habitGlow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), sakuraPinkMat);
        habitGlow.position.set(-1.0 + bk * 0.5, 0.48 + bk * 0.18, 0);
        this.brickBridgeGroup.add(habitGlow);
      }

      this.bridgeBuilderChar = this._createStylizedCharacter3D({
        shirtColor: 0xdb2777,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      this.bridgeBuilderChar.position.set(-0.15, 0.82, 0.1);
      this.brickBridgeGroup.add(this.bridgeBuilderChar);

      const badge95 = this._create3DNeonBadge({
        text: 'từng thói quen nhỏ xây ngày mai',
        borderColor: '#f472b6',
        textColor: '#fce7f3',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge95.position.set(0, 2.55, 0.15);
      this.brickBridgeGroup.add(badge95);

      // =========================================================================
      // 96. SCENE: own_hero_crown_awakening (at x = 1746, z = 12)
      // "Đừng chờ đợi phép màu... Hãy là người hùng của chính cuộc đời mình"
      // Visual: Hero Crown of Courage descending upon character's head with Radiant Heart
      // =========================================================================
      this.ownHeroGroup = new THREE.Group();
      this.ownHeroGroup.position.set(1746, 0, 12);
      this.scene.add(this.ownHeroGroup);
      makeStagePedestal(this.ownHeroGroup, 2.45, sunriseGoldMat);

      const light96A = new THREE.PointLight(0xfbbf24, 2.8, 20);
      light96A.position.set(0, 4.0, 2.5);
      this.ownHeroGroup.add(light96A);

      // Glowing Golden Crown
      this.heroCrownMesh = new THREE.Group();
      this.heroCrownMesh.position.set(0, 1.85, 0.1);

      const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 12, 32), sunriseGoldMat);
      crownRing.rotation.x = Math.PI / 2;
      this.heroCrownMesh.add(crownRing);

      for (let p = 0; p < 5; p++) {
        const peak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), sunriseGoldMat);
        const ang = (p / 5) * Math.PI * 2;
        peak.position.set(Math.cos(ang) * 0.3, 0.08, Math.sin(ang) * 0.3);
        this.heroCrownMesh.add(peak);
      }
      this.heroCrownMesh.add(makeColorHalo(this.glowTex, 1.9, 0.9));
      this.ownHeroGroup.add(this.heroCrownMesh);

      this.ownHeroChar = this._createStylizedCharacter3D({
        shirtColor: 0xf59e0b,
        mood: 'happy',
        scale: 1.12,
        hasHeart: true
      });
      this.ownHeroChar.position.set(0, 0.14, 0.15);
      this.ownHeroGroup.add(this.ownHeroChar);

      const badge96 = this._create3DNeonBadge({
        text: 'hãy là người hùng của chính mình',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge96.position.set(0, 2.55, 0.15);
      this.ownHeroGroup.add(badge96);

      // =========================================================================
      // 97. SCENE: destiny_master_sunrise_outro (at x = 1764, z = 12)
      // "Ngày bạn dám nhận 100% trách nhiệm là ngày bạn nắm giữ vận mệnh của chính mình"
      // Visual: Massive Radiant Golden Sun Portal Archway with Master of Destiny in open embrace
      // =========================================================================
      this.destinySunriseGroup = new THREE.Group();
      this.destinySunriseGroup.position.set(1764, 0, 12);
      this.scene.add(this.destinySunriseGroup);
      makeStagePedestal(this.destinySunriseGroup, 2.55, sunriseGoldMat);

      const light97A = new THREE.PointLight(0xfbbf24, 3.0, 24);
      light97A.position.set(0, 4.2, 2.5);
      this.destinySunriseGroup.add(light97A);

      // Radiant Sun Archway
      this.destinySunriseArch = new THREE.Group();
      this.destinySunriseArch.position.set(0.65, 1.65, -0.4);

      const sunRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.045, 16, 48), sunriseGoldMat);
      this.destinySunriseArch.add(sunRing1);
      const sunRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.035, 16, 48), sakuraPinkMat);
      sunRing2.rotation.x = Math.PI / 4;
      this.destinySunriseArch.add(sunRing2);

      const sunCore97 = new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 2), sunriseGoldMat);
      this.destinySunriseArch.add(sunCore97);
      this.destinySunriseArch.add(makeColorHalo(this.glowTex, 3.5, 0.95));
      this.destinySunriseGroup.add(this.destinySunriseArch);

      this.destinyMasterChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.15,
        hasHeart: true
      });
      this.destinyMasterChar.position.set(0.12, 0.14, 0.2);
      this.destinySunriseGroup.add(this.destinyMasterChar);

      const badge97 = this._create3DNeonBadge({
        text: '100% trách nhiệm = làm chủ số phận',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge97.position.set(0.2, 2.55, 0.15);
      this.destinySunriseGroup.add(badge97);
    }

    _buildSelfConquestMetaphors() {
      const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        roughness: 0.12,
        metalness: 0.25
      });
      const roseQuartzMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        emissive: 0xbe123c,
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.2
      });
      const sakuraPinkMat = new THREE.MeshPhysicalMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.48,
        roughness: 0.2,
        metalness: 0.15
      });
      const amethystMat = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.52,
        roughness: 0.16,
        metalness: 0.3
      });
      const emeraldMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.55,
        roughness: 0.15,
        metalness: 0.28
      });
      const sunriseGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.62,
        roughness: 0.14,
        metalness: 0.65
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x0f172a,
        emissiveIntensity: 0.25,
        roughness: 0.38,
        metalness: 0.82
      });
      const porcelainBlueMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        metalness: 0.35
      });

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

      const makeStagePedestal = (group, radius = 2.45, ringColorMat = sunriseGoldMat) => {
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius + 0.18, 0.14, 36),
          new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: 0x1e293b,
            emissiveIntensity: 0.3,
            roughness: 0.35,
            metalness: 0.7
          })
        );
        base.position.y = 0.07;
        group.add(base);

        const outerRing = new THREE.Mesh(
          new THREE.TorusGeometry(radius + 0.02, 0.032, 12, 48),
          ringColorMat
        );
        outerRing.rotation.x = Math.PI / 2;
        outerRing.position.y = 0.14;
        group.add(outerRing);

        const innerRing = new THREE.Mesh(
          new THREE.TorusGeometry(radius * 0.65, 0.022, 12, 48),
          porcelainBlueMat
        );
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = 0.142;
        group.add(innerRing);
      };

      // =========================================================================
      // 98. SCENE: outward_battle_arena_illusion (at x = 1782, z = 12)
      // "Trong cuộc đời, chúng ta thường mải miết tìm cách chiến thắng người khác..."
      // Visual: Two clashing external duel pillars emitting sparks vs central contemplating hero
      // =========================================================================
      this.outwardArenaGroup = new THREE.Group();
      this.outwardArenaGroup.position.set(1782, 0, 12);
      this.scene.add(this.outwardArenaGroup);
      makeStagePedestal(this.outwardArenaGroup, 2.45, roseQuartzMat);

      const light98A = new THREE.PointLight(0xf43f5e, 2.6, 20);
      light98A.position.set(0, 4.0, 2.5);
      this.outwardArenaGroup.add(light98A);

      // Two clashing stone pillars with clashing energy
      [-0.85, 0.85].forEach((px, idx) => {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 1.65, 0.35),
          idx === 0 ? roseQuartzMat : sunriseGoldMat
        );
        pillar.position.set(px, 0.85, 0);
        this.outwardArenaGroup.add(pillar);
        this.arenaClashPillars.push(pillar);
      });

      const arenaChar = this._createStylizedCharacter3D({
        shirtColor: 0x0284c7,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      arenaChar.position.set(0, 0.14, 0.35);
      this.outwardArenaGroup.add(arenaChar);

      const badge98 = this._create3DNeonBadge({
        text: 'cuộc chiến bên ngoài',
        borderColor: '#f43f5e',
        textColor: '#ffe4e6',
        widthWorld: 2.65,
        heightWorld: 0.52
      });
      badge98.position.set(0, 2.55, 0.15);
      this.outwardArenaGroup.add(badge98);

      // =========================================================================
      // 99. SCENE: comparison_pedestals_clash (at x = 1800, z = 12)
      // "Muốn giỏi hơn đồng nghiệp, giàu hơn bạn bè, chứng minh mình vượt trội..."
      // Visual: Two wobbling competition podiums competing for height with gold badges
      // =========================================================================
      this.comparisonPodiumsGroup = new THREE.Group();
      this.comparisonPodiumsGroup.position.set(1800, 0, 12);
      this.scene.add(this.comparisonPodiumsGroup);
      makeStagePedestal(this.comparisonPodiumsGroup, 2.45, sunriseGoldMat);

      const light99A = new THREE.PointLight(0xfbbf24, 2.6, 20);
      light99A.position.set(0, 4.0, 2.5);
      this.comparisonPodiumsGroup.add(light99A);

      this.pedestalPodiumL = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.85, 20), darkSteelMat);
      this.pedestalPodiumL.position.set(-0.75, 0.48, 0);
      this.comparisonPodiumsGroup.add(this.pedestalPodiumL);

      this.pedestalPodiumR = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 1.15, 20), sunriseGoldMat);
      this.pedestalPodiumR.position.set(0.75, 0.62, 0);
      this.comparisonPodiumsGroup.add(this.pedestalPodiumR);

      const podiumChar = this._createStylizedCharacter3D({
        shirtColor: 0xd97706,
        mood: 'sad',
        scale: 1.02
      });
      podiumChar.position.set(-0.75, 0.95, 0.1);
      this.comparisonPodiumsGroup.add(podiumChar);

      const badge99 = this._create3DNeonBadge({
        text: 'bẫy so sánh hơn thua',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        mark: 'X',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge99.position.set(0, 2.55, 0.15);
      this.comparisonPodiumsGroup.add(badge99);

      // =========================================================================
      // 100. SCENE: inner_shadow_confrontation (at x = 1818, z = 12)
      // "Nhưng kẻ thù lớn nhất cản bước bạn chưa bao giờ là một ai khác..."
      // Visual: Glowing Hero standing face to face with their own smoky inner Shadow
      // =========================================================================
      this.innerShadowGroup = new THREE.Group();
      this.innerShadowGroup.position.set(1818, 0, 12);
      this.scene.add(this.innerShadowGroup);
      makeStagePedestal(this.innerShadowGroup, 2.45, amethystMat);

      const light100A = new THREE.PointLight(0xa855f7, 2.6, 20);
      light100A.position.set(0, 4.0, 2.5);
      this.innerShadowGroup.add(light100A);

      // Light Hero on left
      this.innerLightChar = this._createStylizedCharacter3D({
        shirtColor: 0x0284c7,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      this.innerLightChar.position.set(-0.65, 0.14, 0.2);
      this.innerShadowGroup.add(this.innerLightChar);

      // Shadow on right (dark smoky silhouette)
      this.innerShadowChar = this._createStylizedCharacter3D({
        shirtColor: 0x334155,
        mood: 'sad',
        scale: 1.05
      });
      this.innerShadowChar.position.set(0.65, 0.14, 0.2);
      this.innerShadowChar.rotation.y = -0.55;
      this.innerShadowGroup.add(this.innerShadowChar);

      const badge100 = this._create3DNeonBadge({
        text: 'kẻ thù lớn nhất bên trong',
        borderColor: '#a855f7',
        textColor: '#f3e8ff',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge100.position.set(0, 2.55, 0.15);
      this.innerShadowGroup.add(badge100);

      // =========================================================================
      // 101. SCENE: lazy_whisper_comfort_pillow (at x = 1836, z = 12)
      // "Đó là tiếng nói lười biếng thêm 5 phút, nỗi sợ thì thầm, sự dễ dãi..."
      // Visual: Soft comfort pillow floating vs red pulsing alarm clock
      // =========================================================================
      this.lazyWhisperGroup = new THREE.Group();
      this.lazyWhisperGroup.position.set(1836, 0, 12);
      this.scene.add(this.lazyWhisperGroup);
      makeStagePedestal(this.lazyWhisperGroup, 2.45, roseQuartzMat);

      const light101A = new THREE.PointLight(0xf43f5e, 2.6, 20);
      light101A.position.set(0, 4.0, 2.5);
      this.lazyWhisperGroup.add(light101A);

      // Soft Floating Comfort Pillow on left
      this.lazyComfortPillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.35, 0.65),
        porcelainBlueMat
      );
      this.lazyComfortPillow.position.set(-0.75, 1.35, 0);
      this.lazyWhisperGroup.add(this.lazyComfortPillow);

      // Red Ringing Alarm Clock on right
      this.lazyAlarmClock = new THREE.Group();
      this.lazyAlarmClock.position.set(0.75, 1.35, 0);

      const clockBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.15, 24), roseQuartzMat);
      clockBody.rotation.x = Math.PI / 2;
      this.lazyAlarmClock.add(clockBody);

      const bellL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), sunriseGoldMat);
      bellL.position.set(-0.28, 0.35, 0);
      this.lazyAlarmClock.add(bellL);
      const bellR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), sunriseGoldMat);
      bellR.position.set(0.28, 0.35, 0);
      this.lazyAlarmClock.add(bellR);
      this.lazyWhisperGroup.add(this.lazyAlarmClock);

      const badge101 = this._create3DNeonBadge({
        text: 'tiếng nói của sự trì hoãn',
        borderColor: '#f43f5e',
        textColor: '#ffe4e6',
        mark: 'X',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge101.position.set(0, 2.55, 0.15);
      this.lazyWhisperGroup.add(badge101);

      // =========================================================================
      // 102. SCENE: trophy_vs_inner_crown (at x = 1854, z = 12)
      // "Chiến thắng người khác là kiêu hãnh nhất thời, chiến thắng mình là bản lĩnh thực sự"
      // Visual: Fading external trophy vs Radiant Inner Emerald Crown & Glowing Heart
      // =========================================================================
      this.trophyCrownGroup = new THREE.Group();
      this.trophyCrownGroup.position.set(1854, 0, 12);
      this.scene.add(this.trophyCrownGroup);
      makeStagePedestal(this.trophyCrownGroup, 2.45, emeraldMat);

      const light102A = new THREE.PointLight(0x10b981, 2.6, 20);
      light102A.position.set(0, 4.0, 2.5);
      this.trophyCrownGroup.add(light102A);

      // Fading Trophy on left
      this.transientTrophy = new THREE.Group();
      this.transientTrophy.position.set(-0.75, 1.45, 0);

      const cupBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.12, 16), darkSteelMat);
      this.transientTrophy.add(cupBase);
      const cupStem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12), sunriseGoldMat);
      cupStem.position.y = 0.22;
      this.transientTrophy.add(cupStem);
      const cupBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.15, 0.45, 16), sunriseGoldMat);
      cupBowl.position.y = 0.55;
      this.transientTrophy.add(cupBowl);
      this.trophyCrownGroup.add(this.transientTrophy);

      // Inner Emerald Crown on right
      this.innerFreedomCrown = new THREE.Group();
      this.innerFreedomCrown.position.set(0.75, 1.55, 0);

      const crownTorus = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 12, 32), emeraldMat);
      crownTorus.rotation.x = Math.PI / 2;
      this.innerFreedomCrown.add(crownTorus);

      for (let c = 0; c < 5; c++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), emeraldMat);
        const ca = (c / 5) * Math.PI * 2;
        spike.position.set(Math.cos(ca) * 0.32, 0.09, Math.sin(ca) * 0.32);
        this.innerFreedomCrown.add(spike);
      }
      this.innerFreedomCrown.add(makeColorHalo(this.cyanGlowTex, 1.8, 0.85));
      this.trophyCrownGroup.add(this.innerFreedomCrown);

      const crownChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      crownChar.position.set(0.75, 0.14, 0.15);
      this.trophyCrownGroup.add(crownChar);

      const badge102 = this._create3DNeonBadge({
        text: 'bản lĩnh & tự do thực sự',
        borderColor: '#10b981',
        textColor: '#d1fae5',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge102.position.set(0, 2.55, 0.15);
      this.trophyCrownGroup.add(badge102);

      // =========================================================================
      // 103. SCENE: dawn_discipline_awakening (at x = 1872, z = 12)
      // "Đó là khi bạn chọn rời khỏi giường ấm lúc bình minh khi người khác còn đang ngủ"
      // Visual: Rising Golden Sun Sphere with energetic hero stepping forth at dawn
      // =========================================================================
      this.dawnDisciplineGroup = new THREE.Group();
      this.dawnDisciplineGroup.position.set(1872, 0, 12);
      this.scene.add(this.dawnDisciplineGroup);
      makeStagePedestal(this.dawnDisciplineGroup, 2.45, cyanCrystalMat);

      const light103A = new THREE.PointLight(0x38bdf8, 2.8, 20);
      light103A.position.set(0, 4.0, 2.5);
      this.dawnDisciplineGroup.add(light103A);

      // Rising Sun Sphere behind
      this.dawnSunSphere = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), sunriseGoldMat);
      this.dawnSunSphere.position.set(0, 1.75, -0.6);
      this.dawnSunSphere.add(makeColorHalo(this.glowTex, 2.6, 0.9));
      this.dawnDisciplineGroup.add(this.dawnSunSphere);

      this.dawnAwakeningChar = this._createStylizedCharacter3D({
        shirtColor: 0x0284c7,
        mood: 'happy',
        scale: 1.08,
        hasHeart: true
      });
      this.dawnAwakeningChar.position.set(0, 0.14, 0.25);
      this.dawnDisciplineGroup.add(this.dawnAwakeningChar);

      const badge103 = this._create3DNeonBadge({
        text: 'kỷ luật lúc bình minh',
        borderColor: '#38bdf8',
        textColor: '#e0f2fe',
        mark: 'CHECK',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge103.position.set(0, 2.55, 0.15);
      this.dawnDisciplineGroup.add(badge103);

      // =========================================================================
      // 104. SCENE: book_and_dumbbell_vs_scroll (at x = 1890, z = 12)
      // "Chọn đọc một trang sách, tập một bài thể dục, thay vì lướt màn hình vô bổ"
      // Visual: Glowing open book & dumbbell of growth vs dim flickering smartphone
      // =========================================================================
      this.focusChoiceGroup = new THREE.Group();
      this.focusChoiceGroup.position.set(1890, 0, 12);
      this.scene.add(this.focusChoiceGroup);
      makeStagePedestal(this.focusChoiceGroup, 2.45, sakuraPinkMat);

      const light104A = new THREE.PointLight(0xf472b6, 2.6, 20);
      light104A.position.set(0, 4.0, 2.5);
      this.focusChoiceGroup.add(light104A);

      // Dim phone on left
      this.dimPhoneScrollMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.65, 0.05), darkSteelMat);
      this.dimPhoneScrollMesh.position.set(-0.85, 1.35, 0);
      this.focusChoiceGroup.add(this.dimPhoneScrollMesh);

      // Glowing Book & Dumbbell on right
      this.focusedBookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.08), sakuraPinkMat);
      this.focusedBookMesh.position.set(0.45, 1.45, 0);
      this.focusedBookMesh.rotation.x = -0.35;
      this.focusChoiceGroup.add(this.focusedBookMesh);

      this.focusedDumbbellMesh = new THREE.Group();
      this.focusedDumbbellMesh.position.set(0.85, 0.85, 0);
      const dbBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), darkSteelMat);
      dbBar.rotation.z = Math.PI / 2;
      this.focusedDumbbellMesh.add(dbBar);
      const dbPlateL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 16), sunriseGoldMat);
      dbPlateL.position.x = -0.22;
      dbPlateL.rotation.z = Math.PI / 2;
      this.focusedDumbbellMesh.add(dbPlateL);
      const dbPlateR = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 16), sunriseGoldMat);
      dbPlateR.position.x = 0.22;
      dbPlateR.rotation.z = Math.PI / 2;
      this.focusedDumbbellMesh.add(dbPlateR);
      this.focusChoiceGroup.add(this.focusedDumbbellMesh);

      const badge104 = this._create3DNeonBadge({
        text: 'lựa chọn sự tập trung',
        borderColor: '#f472b6',
        textColor: '#fce7f3',
        mark: 'CHECK',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge104.position.set(0, 2.55, 0.15);
      this.focusChoiceGroup.add(badge104);

      // =========================================================================
      // 105. SCENE: flame_to_zen_water_sphere (at x = 1908, z = 12)
      // "Kiểm soát cơn giận khi bị khiêu khích, giữ tâm thế bình thản giữa xáo động"
      // Visual: Impulsive Red Flame transmuting into a Tranquil Crystal Water Sphere
      // =========================================================================
      this.flameZenWaterGroup = new THREE.Group();
      this.flameZenWaterGroup.position.set(1908, 0, 12);
      this.scene.add(this.flameZenWaterGroup);
      makeStagePedestal(this.flameZenWaterGroup, 2.45, cyanCrystalMat);

      const light105A = new THREE.PointLight(0x0284c7, 2.6, 20);
      light105A.position.set(0, 4.0, 2.5);
      this.flameZenWaterGroup.add(light105A);

      // Red Flame on left
      this.rageFlameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.85, 12), roseQuartzMat);
      this.rageFlameMesh.position.set(-0.75, 1.45, 0);
      this.flameZenWaterGroup.add(this.rageFlameMesh);

      // Zen Water Sphere on right
      this.zenWaterSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 24, 24),
        new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          transmission: 0.85,
          opacity: 0.85,
          transparent: true,
          roughness: 0.1
        })
      );
      this.zenWaterSphere.position.set(0.75, 1.45, 0);
      this.zenWaterSphere.add(makeColorHalo(this.cyanGlowTex, 1.8, 0.85));
      this.flameZenWaterGroup.add(this.zenWaterSphere);

      const zenChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.05,
        hasHeart: true
      });
      zenChar.position.set(0, 0.14, 0.25);
      this.flameZenWaterGroup.add(zenChar);

      const badge105 = this._create3DNeonBadge({
        text: 'làm chủ cảm xúc nội tâm',
        borderColor: '#0284c7',
        textColor: '#e0f2fe',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge105.position.set(0, 2.55, 0.15);
      this.flameZenWaterGroup.add(badge105);

      // =========================================================================
      // 106. SCENE: two_versions_self_progress (at x = 1926, z = 12)
      // "Không cần chạy đua với ai, chỉ cần hôm nay kiên định hơn hôm qua một chút"
      // Visual: Yesterday Ghost staying back while Today Radiant Hero steps ahead
      // =========================================================================
      this.twoVersionsGroup = new THREE.Group();
      this.twoVersionsGroup.position.set(1926, 0, 12);
      this.scene.add(this.twoVersionsGroup);
      makeStagePedestal(this.twoVersionsGroup, 2.45, emeraldMat);

      const light106A = new THREE.PointLight(0x10b981, 2.6, 20);
      light106A.position.set(0, 4.0, 2.5);
      this.twoVersionsGroup.add(light106A);

      // Yesterday silhouette standing back
      this.yesterdayGhostChar = this._createStylizedCharacter3D({
        shirtColor: 0x475569,
        mood: 'sad',
        scale: 0.95
      });
      this.yesterdayGhostChar.position.set(-0.65, 0.14, -0.4);
      this.twoVersionsGroup.add(this.yesterdayGhostChar);

      // Today progressing Hero stepping ahead
      this.todayProgressChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.1,
        hasHeart: true
      });
      this.todayProgressChar.position.set(0.45, 0.14, 0.3);
      this.twoVersionsGroup.add(this.todayProgressChar);

      const badge106 = this._create3DNeonBadge({
        text: 'tốt hơn chính mình hôm qua',
        borderColor: '#10b981',
        textColor: '#d1fae5',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge106.position.set(0, 2.55, 0.15);
      this.twoVersionsGroup.add(badge106);

      // =========================================================================
      // 107. SCENE: forging_willpower_diamond (at x = 1944, z = 12)
      // "Mỗi lần nói 'Không' với sự lười biếng, bạn thắng một trận đánh vô hình vĩ đại"
      // Visual: Willpower Anvil Diamond struck with Golden Spark Orbs of resilience
      // =========================================================================
      this.forgingDiamondGroup = new THREE.Group();
      this.forgingDiamondGroup.position.set(1944, 0, 12);
      this.scene.add(this.forgingDiamondGroup);
      makeStagePedestal(this.forgingDiamondGroup, 2.45, sunriseGoldMat);

      const light107A = new THREE.PointLight(0xfbbf24, 2.8, 20);
      light107A.position.set(0, 4.0, 2.5);
      this.forgingDiamondGroup.add(light107A);

      // Golden Anvil Stand
      const anvilBase = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.85), darkSteelMat);
      anvilBase.position.set(0, 0.35, 0);
      this.forgingDiamondGroup.add(anvilBase);

      // Glowing Diamond of Willpower
      this.willpowerAnvilDiamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 1), cyanCrystalMat);
      this.willpowerAnvilDiamond.position.set(0, 1.25, 0);
      this.willpowerAnvilDiamond.add(makeColorHalo(this.cyanGlowTex, 2.2, 0.9));
      this.forgingDiamondGroup.add(this.willpowerAnvilDiamond);

      // 4 Golden Forge Sparks
      for (let s = 0; s < 4; s++) {
        const spk = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), sunriseGoldMat);
        const sa = (s / 4) * Math.PI * 2;
        spk.position.set(Math.cos(sa) * 0.75, 1.25 + Math.sin(sa) * 0.35, 0);
        this.forgingDiamondGroup.add(spk);
        this.willpowerForgeSparks.push(spk);
      }

      const badge107 = this._create3DNeonBadge({
        text: 'tôi luyện kim cương ý chí',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        mark: 'CHECK',
        widthWorld: 2.75,
        heightWorld: 0.52
      });
      badge107.position.set(0, 2.55, 0.15);
      this.forgingDiamondGroup.add(badge107);

      // =========================================================================
      // 108. SCENE: self_conquest_triumph_outro (at x = 1962, z = 12)
      // "Chinh phục ngàn quân làm nên dũng tướng, chinh phục chính mình tạo nên vĩ nhân"
      // Visual: Monumental Triumph Archway with Master Hero in glorious sunrise embrace
      // =========================================================================
      this.selfConquestGroup = new THREE.Group();
      this.selfConquestGroup.position.set(1962, 0, 12);
      this.scene.add(this.selfConquestGroup);
      makeStagePedestal(this.selfConquestGroup, 2.55, sunriseGoldMat);

      const light108A = new THREE.PointLight(0xfbbf24, 3.2, 24);
      light108A.position.set(0, 4.2, 2.5);
      this.selfConquestGroup.add(light108A);

      // Grand Triumph Archway
      this.selfConquestGateway = new THREE.Group();
      this.selfConquestGateway.position.set(0.65, 1.65, -0.4);

      const triumphRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.05, 16, 48), sunriseGoldMat);
      this.selfConquestGateway.add(triumphRing1);
      const triumphRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.035, 16, 48), emeraldMat);
      triumphRing2.rotation.x = Math.PI / 4;
      this.selfConquestGateway.add(triumphRing2);

      const triumphSunCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 2), sunriseGoldMat);
      this.selfConquestGateway.add(triumphSunCore);
      this.selfConquestGateway.add(makeColorHalo(this.glowTex, 3.8, 0.95));
      this.selfConquestGroup.add(this.selfConquestGateway);

      this.selfConquestHeroChar = this._createStylizedCharacter3D({
        shirtColor: 0x059669,
        mood: 'happy',
        scale: 1.15,
        hasHeart: true
      });
      this.selfConquestHeroChar.position.set(0.12, 0.14, 0.2);
      this.selfConquestGroup.add(this.selfConquestHeroChar);

      const badge108 = this._create3DNeonBadge({
        text: 'chiến thắng bản thân vĩ đại nhất',
        borderColor: '#fbbf24',
        textColor: '#fef08a',
        mark: 'CHECK',
        widthWorld: 2.85,
        heightWorld: 0.52
      });
      badge108.position.set(0.2, 2.55, 0.15);
      this.selfConquestGroup.add(badge108);
    }

    /**
     * Compute target camera position & lookAt based on camera preset and local segment progress (0..1)
     */
    _getCameraTarget(cameraPreset, segProgress, timeSec) {
      const p = Math.max(0, Math.min(1, segProgress));

      switch (cameraPreset) {
        case 'orbit_tank_close':
          return {
            pos: new THREE.Vector3(-4.2 + p * 0.8, 2.65 - p * 0.2, 7.6 - p * 0.9),
            look: new THREE.Vector3(-3.3 + p * 0.6, 1.35, 0)
          };

        case 'pan_tank_to_pipe':
          return {
            pos: new THREE.Vector3(-3.0 + p * 4.2, 2.4, 6.2 - p * 1.2),
            look: new THREE.Vector3(-1.5 + p * 5.5, 1.9, 0)
          };

        case 'track_pipe_forward':
          return {
            pos: new THREE.Vector3(3.0 + p * 6.5, 2.55, 4.6),
            look: new THREE.Vector3(9.5 + p * 8.0, 2.15, 0)
          };

        case 'track_pipe_wide':
          return {
            pos: new THREE.Vector3(8.0 + p * 6.0, 2.35, 5.2),
            look: new THREE.Vector3(16.0 + p * 7.0, 2.1, 0)
          };

        case 'approach_leak_valve':
          return {
            pos: new THREE.Vector3(12.0 + p * 2.5, 2.1 - p * 0.35, 3.6 - p * 1.1),
            look: new THREE.Vector3(15.0, 1.95 - p * 0.3, 0)
          };

        case 'under_pipe_leak':
          return {
            pos: new THREE.Vector3(13.8 + p * 0.8, 1.45, 2.35),
            look: new THREE.Vector3(15.2, 1.85, 0)
          };

        case 'track_pipe_medium':
          return {
            pos: new THREE.Vector3(15.0 + p * 5.0, 2.5, 4.4),
            look: new THREE.Vector3(21.0 + p * 6.0, 2.15, 0)
          };

        case 'track_pipe_reverse':
          return {
            pos: new THREE.Vector3(28.0 - p * 5.0, 2.3, 3.8),
            look: new THREE.Vector3(19.0 - p * 5.0, 2.05, 0)
          };

        case 'closeup_pipe_rings':
          return {
            pos: new THREE.Vector3(18.5 + p * 3.0, 2.3, 2.75),
            look: new THREE.Vector3(21.5 + p * 3.5, 2.2, 0)
          };

        case 'closeup_pipe_smooth':
          return {
            pos: new THREE.Vector3(21.5 + p * 3.5, 2.35, 2.55),
            look: new THREE.Vector3(24.5 + p * 3.5, 2.22, 0)
          };

        case 'low_angle_red_leaks':
          return {
            pos: new THREE.Vector3(24.0 + p * 4.5, 1.75, 3.3),
            look: new THREE.Vector3(31.0 + p * 5.0, 2.15, 0)
          };

        case 'pan_red_leaks':
          return {
            pos: new THREE.Vector3(28.5 + p * 4.5, 1.95, 3.4),
            look: new THREE.Vector3(35.0 + p * 5.0, 2.15, 0)
          };

        case 'closeup_tumbling_coins':
          return {
            pos: new THREE.Vector3(31.0 + p * 4.0, 2.3, 2.35),
            look: new THREE.Vector3(33.5 + p * 4.0, 2.25, 0)
          };

        case 'closeup_red_blades':
          return {
            pos: new THREE.Vector3(35.8 + p * 2.2, 2.15, 2.25),
            look: new THREE.Vector3(37.4 + p * 2.2, 2.25, 0)
          };

        case 'high_angle_map':
          return {
            pos: new THREE.Vector3(26.0 + p * 4.0, 12.5 + p * 1.5, 14.5),
            look: new THREE.Vector3(30.0 + p * 3.0, 2.2, 0)
          };

        case 'hero_helm_front':
          return {
            pos: new THREE.Vector3(24.8 + p * 1.2, 2.55, 8.6 - p * 0.4),
            look: new THREE.Vector3(26.2 + p * 0.8, 2.5, 3.8)
          };

        case 'macro_phone_screen':
          return {
            pos: new THREE.Vector3(28.9 + p * 0.6, 1.85, 8.2 - p * 0.5),
            look: new THREE.Vector3(29.6, 1.65, 4.0)
          };

        case 'helm_and_phone_wide':
          return {
            pos: new THREE.Vector3(26.8 - p * 0.8, 2.45, 9.2),
            look: new THREE.Vector3(27.2 - p * 0.6, 2.35, 3.8)
          };

        case 'wide_pullback_pipe':
          return {
            pos: new THREE.Vector3(22.0 - p * 12.0, 4.8 + p * 1.2, 11.5 + p * 2.0),
            look: new THREE.Vector3(14.0 - p * 10.0, 2.1, 0)
          };

        case 'final_tank_zoom':
          return {
            pos: new THREE.Vector3(2.0 - p * 4.2, 4.2 - p * 1.5, 10.0 - p * 3.8),
            look: new THREE.Vector3(-3.8, 1.1, 0)
          };

        case 'orbit_chart_rise':
          return {
            pos: new THREE.Vector3(45.0 + Math.sin(p * 0.8) * 3.0, 3.6 + p * 1.2, 21.5 - p * 1.5),
            look: new THREE.Vector3(45.5, 2.8, 12.0)
          };

        case 'orbit_scale':
          return {
            pos: new THREE.Vector3(60.0 + Math.sin(p * 0.7) * 2.5, 2.8, 19.5),
            look: new THREE.Vector3(60.0, 2.2, 12.0)
          };

        case 'orbit_gears':
          return {
            pos: new THREE.Vector3(75.0 + Math.cos(p * 0.8) * 2.0, 2.7, 18.2),
            look: new THREE.Vector3(75.0, 2.5, 12.0)
          };

        case 'orbit_vault':
          return {
            pos: new THREE.Vector3(90.0 + Math.sin(p * 0.8) * 2.5, 2.4, 19.5 - p * 1.2),
            look: new THREE.Vector3(90.0, 2.0, 12.0)
          };

        case 'vault_zoom_outro':
          return {
            pos: new THREE.Vector3(92.2 - p * 2.2, 3.6 - p * 1.1, 21.0 - p * 3.2),
            look: new THREE.Vector3(90.0, 1.85, 12.2)
          };

        case 'orbit_hourglass_close':
          return {
            pos: new THREE.Vector3(105.0 + Math.sin(p * 1.1 - 0.5) * 3.2, 2.8 + p * 0.6, 19.2 - p * 1.1),
            look: new THREE.Vector3(105.0, 2.5, 12.0)
          };

        case 'hourglass_top_down':
          return {
            pos: new THREE.Vector3(103.2 + p * 3.0, 5.2 - p * 1.5, 17.8),
            look: new THREE.Vector3(105.0, 2.3, 12.0)
          };

        case 'track_domino_arc':
          return {
            pos: new THREE.Vector3(116.5 + p * 8.5, 2.2 + p * 2.0, 18.8 + p * 0.8),
            look: new THREE.Vector3(119.0 + p * 8.0, 1.4 + p * 1.8, 12.0)
          };

        case 'low_angle_domino_giant':
          return {
            pos: new THREE.Vector3(124.2 + p * 2.2, 1.4 + p * 1.0, 17.5 - p * 0.8),
            look: new THREE.Vector3(126.8, 3.2 + p * 0.8, 12.0)
          };

        case 'fork_two_paths':
          return {
            pos: new THREE.Vector3(137.5 + p * 3.5, 4.4 - p * 0.6, 20.5 - p * 1.5),
            look: new THREE.Vector3(142.5 + p * 1.5, 1.8, 12.2)
          };

        case 'climb_golden_bridge':
          return {
            pos: new THREE.Vector3(139.5 + p * 5.5, 2.4 + p * 2.4, 17.2 - p * 1.2),
            look: new THREE.Vector3(144.5 + p * 3.5, 3.2 + p * 2.2, 10.2)
          };

        case 'chart_low_hero':
          return {
            pos: new THREE.Vector3(42.5 + p * 4.5, 1.8 + p * 2.2, 18.5 - p * 1.0),
            look: new THREE.Vector3(46.2, 3.2 + p * 1.2, 12.0)
          };

        case 'orbit_candles_warm':
          return {
            pos: new THREE.Vector3(162.0 + Math.sin(p * 1.0 - 0.5) * 3.1, 2.35 + p * 0.35, 18.6 - p * 0.9),
            look: new THREE.Vector3(161.9, 1.95, 12.0)
          };

        case 'candles_closeup_flame':
          return {
            pos: new THREE.Vector3(160.2 + p * 1.8, 2.55 - p * 0.25, 16.4 - p * 0.7),
            look: new THREE.Vector3(161.3 + p * 0.6, 2.15, 12.0)
          };

        case 'orbit_home_table':
          return {
            pos: new THREE.Vector3(180.0 + Math.sin(p * 0.9 - 0.4) * 3.4, 2.65 - p * 0.2, 18.8 - p * 1.1),
            look: new THREE.Vector3(180.0, 1.65, 12.0)
          };

        case 'pullback_lonely_table':
          return {
            pos: new THREE.Vector3(180.5 + p * 1.5, 2.3 + p * 1.6, 16.8 + p * 3.2),
            look: new THREE.Vector3(179.8, 1.55, 12.0)
          };

        case 'orbit_golden_tree':
          return {
            pos: new THREE.Vector3(198.0 + Math.sin(p * 1.0 - 0.5) * 3.8, 2.75 + p * 0.4, 20.2 - p * 1.2),
            look: new THREE.Vector3(198.0, 2.6, 12.0)
          };

        case 'low_angle_tree_leaves':
          return {
            pos: new THREE.Vector3(196.2 + p * 2.8, 1.35 + p * 0.8, 17.5 - p * 0.8),
            look: new THREE.Vector3(198.0, 2.95, 12.0)
          };

        case 'tree_outro_warm':
          return {
            pos: new THREE.Vector3(198.0 + Math.sin(p * 0.6) * 1.8, 2.8 - p * 0.4, 20.5 - p * 2.5),
            look: new THREE.Vector3(198.0, 2.45, 12.0)
          };

        case 'approach_vanishing_bridge':
          return {
            pos: new THREE.Vector3(211.5 + p * 3.2, 2.55 + p * 0.4, 17.8 - p * 1.2),
            look: new THREE.Vector3(217.5 + p * 1.5, 2.25, 11.4)
          };

        case 'orbit_vanishing_horizon':
          return {
            pos: new THREE.Vector3(216.0 + Math.sin(p * 0.9 - 0.4) * 3.6, 3.1 - p * 0.3, 19.2 - p * 1.2),
            look: new THREE.Vector3(217.2, 2.35, 11.5)
          };

        case 'orbit_memory_frames':
          return {
            pos: new THREE.Vector3(232.2 + p * 3.8, 2.45 + p * 0.3, 18.8 - p * 1.0),
            look: new THREE.Vector3(234.4 + p * 1.2, 2.0, 12.0)
          };

        case 'closeup_memory_stardust':
          return {
            pos: new THREE.Vector3(235.0 + p * 1.4, 2.15 + p * 0.5, 16.8 - p * 0.8),
            look: new THREE.Vector3(236.2, 2.35 + p * 0.4, 12.2)
          };

        case 'orbit_glass_cage':
          return {
            pos: new THREE.Vector3(252.0 + Math.sin(p * 1.0 - 0.5) * 3.4, 2.55 + p * 0.3, 18.8 - p * 1.0),
            look: new THREE.Vector3(252.0, 2.1, 12.0)
          };

        case 'closeup_caged_dream':
          return {
            pos: new THREE.Vector3(250.8 + p * 2.2, 2.15 + p * 0.35, 16.5 - p * 0.8),
            look: new THREE.Vector3(252.0, 2.15, 12.0)
          };

        case 'pan_past_to_present':
          return {
            pos: new THREE.Vector3(267.2 + p * 3.8, 2.65 + p * 0.25, 19.2 - p * 1.4),
            look: new THREE.Vector3(268.5 + p * 2.0, 2.35, 12.1)
          };

        case 'hero_present_moment':
          return {
            pos: new THREE.Vector3(270.0 + Math.sin(p * 0.8 - 0.4) * 2.6, 2.55 + p * 0.3, 17.6 - p * 1.2),
            look: new THREE.Vector3(270.0, 2.55, 12.3)
          };

        case 'orbit_clock_loop':
          return {
            pos: new THREE.Vector3(288.0 + Math.sin(p * 1.1 - 0.5) * 3.4, 3.65 - p * 0.4, 18.4 - p * 1.0),
            look: new THREE.Vector3(288.0, 0.65, 12.0)
          };

        case 'high_angle_clock_trap':
          return {
            pos: new THREE.Vector3(287.2 + p * 1.8, 5.2 - p * 0.8, 17.2 - p * 0.8),
            look: new THREE.Vector3(288.0, 0.45, 12.0)
          };

        case 'orbit_silent_thief':
          return {
            pos: new THREE.Vector3(306.0 + Math.sin(p * 1.0 - 0.5) * 3.4, 2.55 + p * 0.3, 18.8 - p * 1.0),
            look: new THREE.Vector3(306.0, 2.0, 12.0)
          };

        case 'closeup_draining_dreams':
          return {
            pos: new THREE.Vector3(304.8 + p * 2.2, 2.05 + p * 0.4, 16.6 - p * 0.7),
            look: new THREE.Vector3(306.0, 1.95, 12.0)
          };

        case 'two_runners_start':
          return {
            pos: new THREE.Vector3(319.2 + p * 3.5, 3.45 - p * 0.3, 19.6 - p * 1.2),
            look: new THREE.Vector3(322.5 + p * 2.5, 1.45, 12.0)
          };

        case 'track_runner_ahead':
          return {
            pos: new THREE.Vector3(321.5 + p * 5.2, 2.4 + p * 1.5, 18.2 - p * 1.2),
            look: new THREE.Vector3(325.0 + p * 3.5, 2.1 + p * 1.2, 10.8)
          };

        case 'frozen_at_start_line':
          return {
            pos: new THREE.Vector3(319.5 + p * 2.0, 2.15 + p * 0.3, 17.5 - p * 0.8),
            look: new THREE.Vector3(321.5 + p * 1.5, 1.25, 12.8)
          };

        case 'orbit_glowing_book':
          return {
            pos: new THREE.Vector3(339.2 + p * 3.5, 2.45 + p * 0.4, 18.4 - p * 1.0),
            look: new THREE.Vector3(341.2 + p * 1.5, 1.85, 12.0)
          };

        case 'book_to_rising_steps':
          return {
            pos: new THREE.Vector3(340.5 + p * 4.2, 2.25 + p * 1.2, 18.2 - p * 1.0),
            look: new THREE.Vector3(342.5 + p * 2.5, 2.25 + p * 0.8, 12.0)
          };

        case 'orbit_chained_soul':
          return {
            pos: new THREE.Vector3(360.0 + Math.sin(p * 1.0 - 0.5) * 3.6, 2.95 - p * 0.3, 18.8 - p * 1.1),
            look: new THREE.Vector3(360.0, 2.15, 12.2)
          };

        case 'pan_three_burdens':
          return {
            pos: new THREE.Vector3(357.6 + p * 4.8, 2.35 + p * 0.25, 18.2 - p * 0.8),
            look: new THREE.Vector3(358.2 + p * 3.6, 1.55, 12.4)
          };

        case 'push_against_wall':
          return {
            pos: new THREE.Vector3(374.8 + p * 2.4, 2.45 + p * 0.35, 18.2 - p * 1.0),
            look: new THREE.Vector3(376.8 + p * 0.8, 1.95, 12.0)
          };

        case 'reveal_courage_detachment':
          return {
            pos: new THREE.Vector3(376.5 + p * 4.2, 2.55 + p * 0.8, 18.6 - p * 1.0),
            look: new THREE.Vector3(378.2 + p * 2.5, 2.25 + p * 0.6, 12.0)
          };

        case 'false_treasure_mirage':
          return {
            pos: new THREE.Vector3(379.5 - p * 2.0, 3.4 - p * 0.4, 18.8 - p * 1.2),
            look: new THREE.Vector3(378.2, 2.15, 12.0)
          };

        case 'macro_thorny_rope':
          return {
            pos: new THREE.Vector3(394.2 + p * 3.2, 2.65 - p * 0.2, 16.8 - p * 0.9),
            look: new THREE.Vector3(395.6 + p * 0.8, 2.15, 12.0)
          };

        case 'orbit_bleeding_grip':
          return {
            pos: new THREE.Vector3(396.0 + Math.sin(p * 1.1 - 0.5) * 3.2, 2.35 - p * 0.25, 17.5 - p * 1.0),
            look: new THREE.Vector3(396.0, 2.05, 12.0)
          };

        case 'pan_bloom_to_burden':
          return {
            pos: new THREE.Vector3(411.5 + p * 4.6, 2.65 - p * 0.2, 18.4 - p * 1.0),
            look: new THREE.Vector3(412.2 + p * 3.6, 1.45, 12.0)
          };

        case 'orbit_acceptance_mirror':
          return {
            pos: new THREE.Vector3(415.2 + Math.sin(p * 0.9 - 0.3) * 2.8, 2.55 + p * 0.3, 17.8 - p * 1.0),
            look: new THREE.Vector3(415.4, 1.35, 12.0)
          };

        case 'cage_foundation_strength':
          return {
            pos: new THREE.Vector3(432.0 + Math.sin(p * 1.0 - 0.5) * 3.5, 2.25 + p * 0.4, 18.6 - p * 1.0),
            look: new THREE.Vector3(432.0, 1.75, 12.0)
          };

        case 'ascend_free_spirits':
          return {
            pos: new THREE.Vector3(431.2 + p * 2.2, 2.15 + p * 1.4, 18.2 - p * 1.2),
            look: new THREE.Vector3(432.0, 2.35 + p * 1.2, 12.0)
          };

        case 'door_closes_portal_opens':
          return {
            pos: new THREE.Vector3(447.2 + p * 4.5, 2.45 + p * 0.25, 18.8 - p * 1.2),
            look: new THREE.Vector3(448.0 + p * 3.4, 1.75, 11.8)
          };

        case 'walk_emerald_journey':
          return {
            pos: new THREE.Vector3(451.2 + p * 1.4, 2.35 + p * 0.9, 17.2 - p * 2.6),
            look: new THREE.Vector3(451.6 + p * 0.8, 1.85 + p * 0.7, 9.5 - p * 2.0)
          };

        case 'hero_compass_crossroads':
          return {
            pos: new THREE.Vector3(468.0 + Math.sin(p * 1.0 - 0.5) * 3.6, 2.95 - p * 0.25, 18.8 - p * 1.2),
            look: new THREE.Vector3(468.0, 1.65, 12.2)
          };

        case 'open_hands_release_old':
          return {
            pos: new THREE.Vector3(486.0 + Math.sin(p * 1.0 - 0.5) * 3.4, 2.65 + p * 0.35, 18.4 - p * 1.2),
            look: new THREE.Vector3(486.0, 2.05, 12.1)
          };

        case 'sunrise_lotus_outro':
          return {
            pos: new THREE.Vector3(486.0 + Math.sin(p * 0.7) * 2.0, 2.85 - p * 0.25, 17.4 - p * 1.6),
            look: new THREE.Vector3(486.0, 2.25, 12.15)
          };

        case 'orbit_noisy_judgment':
          return {
            pos: new THREE.Vector3(504.0 + Math.sin(p * 1.1 - 0.5) * 3.5, 2.75 - p * 0.25, 18.5 - p * 1.0),
            look: new THREE.Vector3(504.0, 2.15, 12.0)
          };

        case 'closeup_clashing_echoes':
          return {
            pos: new THREE.Vector3(502.8 + p * 2.4, 2.35 + p * 0.3, 16.9 - p * 0.8),
            look: new THREE.Vector3(504.0, 2.2, 12.0)
          };

        case 'leave_battle_board':
          return {
            pos: new THREE.Vector3(519.4 + p * 4.4, 2.55 - p * 0.2, 18.6 - p * 1.0),
            look: new THREE.Vector3(520.2 + p * 3.6, 1.45, 12.0)
          };

        case 'orbit_private_story_book':
          return {
            pos: new THREE.Vector3(523.8 + Math.sin(p * 0.9 - 0.3) * 2.6, 2.45 + p * 0.25, 17.6 - p * 1.0),
            look: new THREE.Vector3(524.0, 1.75, 11.9)
          };

        case 'storm_around_peak':
          return {
            pos: new THREE.Vector3(540.0 + Math.sin(p * 1.1 - 0.5) * 4.2, 2.65 + p * 0.5, 19.2 - p * 1.2),
            look: new THREE.Vector3(540.0, 1.95, 12.0)
          };

        case 'hero_silent_mountain':
          return {
            pos: new THREE.Vector3(538.8 + p * 2.4, 1.85 + p * 1.2, 17.8 - p * 1.2),
            look: new THREE.Vector3(540.0, 2.65 + p * 0.4, 12.0)
          };

        case 'turbulent_lake_waves':
          return {
            pos: new THREE.Vector3(555.2 + p * 2.2, 3.15 - p * 0.3, 18.2 - p * 1.0),
            look: new THREE.Vector3(556.0 + p * 1.2, 1.35, 12.0)
          };

        case 'clear_mirror_lake_depth':
          return {
            pos: new THREE.Vector3(558.8 + p * 1.8, 2.85 - p * 0.5, 17.8 - p * 1.2),
            look: new THREE.Vector3(559.8, 0.95, 12.0)
          };

        case 'emotion_fire_shards':
          return {
            pos: new THREE.Vector3(573.2 + p * 2.6, 2.55 - p * 0.2, 18.2 - p * 1.0),
            look: new THREE.Vector3(574.0 + p * 1.8, 1.95, 12.0)
          };

        case 'pause_zen_clarity':
          return {
            pos: new THREE.Vector3(575.5 + p * 3.2, 2.45 + p * 0.25, 18.0 - p * 1.0),
            look: new THREE.Vector3(576.8 + p * 1.4, 2.0, 12.0)
          };

        case 'deflect_criticism_dome':
          return {
            pos: new THREE.Vector3(594.0 + Math.sin(p * 1.1 - 0.5) * 3.8, 2.75 - p * 0.2, 18.8 - p * 1.0),
            look: new THREE.Vector3(594.0, 1.65, 12.0)
          };

        case 'orbit_inner_peace_sanctuary':
          return {
            pos: new THREE.Vector3(594.0 + Math.sin(p * 0.9 - 0.3) * 2.6, 2.25 + p * 0.2, 17.2 - p * 1.0),
            look: new THREE.Vector3(594.0, 1.55, 12.0)
          };

        case 'voice_and_action_harmony':
          return {
            pos: new THREE.Vector3(609.2 + p * 4.5, 2.65 + p * 0.3, 18.8 - p * 1.0),
            look: new THREE.Vector3(610.2 + p * 3.4, 1.85, 12.0)
          };

        case 'energy_time_focus':
          return {
            pos: new THREE.Vector3(612.2 + p * 2.6, 2.45 + p * 0.8, 18.2 - p * 1.2),
            look: new THREE.Vector3(613.4 + p * 1.2, 2.05 + p * 0.5, 12.0)
          };

        case 'rise_silent_monument':
          return {
            pos: new THREE.Vector3(630.0 + Math.sin(p * 1.0 - 0.5) * 3.8, 2.15 + p * 1.1, 18.8 - p * 1.0),
            look: new THREE.Vector3(630.0, 1.85 + p * 0.8, 12.0)
          };

        case 'summit_constellation_achievement':
          return {
            pos: new THREE.Vector3(630.0 + Math.cos(p * 0.9 - 0.4) * 3.2, 3.25 + p * 0.5, 18.0 - p * 1.2),
            look: new THREE.Vector3(630.0, 2.85, 12.0)
          };

        case 'silent_crown_outro':
          return {
            pos: new THREE.Vector3(630.0 + Math.sin(p * 0.6) * 2.2, 3.45 - p * 0.2, 17.5 - p * 1.5),
            look: new THREE.Vector3(630.0, 2.95, 12.0)
          };

        case 'phone_unsent_message':
          return {
            pos: new THREE.Vector3(645.2 + p * 2.6, 2.65 - p * 0.2, 17.8 - p * 0.8),
            look: new THREE.Vector3(646.2 + p * 1.6, 1.85, 12.1)
          };

        case 'orbit_shared_world_midnight':
          return {
            pos: new THREE.Vector3(648.8 + Math.sin(p * 1.0 - 0.3) * 3.2, 2.55 + p * 0.3, 18.4 - p * 1.0),
            look: new THREE.Vector3(649.4, 2.05, 12.0)
          };

        case 'fading_chat_stranger':
          return {
            pos: new THREE.Vector3(647.5 - p * 1.5, 2.35 + p * 0.5, 17.6 + p * 1.2),
            look: new THREE.Vector3(648.0, 1.95, 12.0)
          };

        case 'twin_spirals_parting':
          return {
            pos: new THREE.Vector3(663.2 + p * 4.5, 2.85 + p * 0.4, 18.8 - p * 1.2),
            look: new THREE.Vector3(664.5 + p * 3.2, 1.55, 12.0)
          };

        case 'orbit_memory_fragments_afar':
          return {
            pos: new THREE.Vector3(666.0 + Math.sin(p * 1.0 - 0.5) * 3.6, 2.65 - p * 0.2, 18.4 - p * 1.0),
            look: new THREE.Vector3(666.5, 1.65, 12.0)
          };

        case 'unfinished_future_blueprint':
          return {
            pos: new THREE.Vector3(684.0 + Math.sin(p * 1.0 - 0.5) * 3.8, 2.75 - p * 0.2, 18.8 - p * 1.0),
            look: new THREE.Vector3(684.0, 1.55, 12.0)
          };

        case 'warm_dream_home_together':
          return {
            pos: new THREE.Vector3(681.8 + p * 3.2, 2.35 + p * 0.25, 17.8 - p * 0.8),
            look: new THREE.Vector3(683.4 + p * 1.2, 1.55, 12.0)
          };

        case 'empty_side_broken_promise':
          return {
            pos: new THREE.Vector3(684.6 + p * 1.8, 2.15 + p * 0.4, 17.4 - p * 0.8),
            look: new THREE.Vector3(685.0, 1.35, 12.2)
          };

        case 'spinning_vinyl_memories':
          return {
            pos: new THREE.Vector3(699.4 + p * 2.8, 2.65 - p * 0.2, 18.0 - p * 1.0),
            look: new THREE.Vector3(700.4 + p * 1.4, 1.75, 12.0)
          };

        case 'dimming_phone_screen_night':
          return {
            pos: new THREE.Vector3(701.8 + p * 2.2, 2.35 - p * 0.15, 17.6 - p * 0.8),
            look: new THREE.Vector3(703.4, 1.65, 12.0)
          };

        case 'drift_paper_boats_river':
          return {
            pos: new THREE.Vector3(717.5 + p * 4.5, 2.55 + p * 0.3, 18.4 - p * 1.2),
            look: new THREE.Vector3(719.0 + p * 2.5, 1.45, 12.0)
          };

        case 'love_rose_to_maturity_tree':
          return {
            pos: new THREE.Vector3(735.4 + p * 4.6, 2.55 + p * 0.35, 18.6 - p * 1.0),
            look: new THREE.Vector3(736.5 + p * 3.2, 1.85, 12.0)
          };

        case 'crossing_peaceful_bridges':
          return {
            pos: new THREE.Vector3(753.5 + p * 4.5, 2.65 - p * 0.2, 18.6 - p * 1.0),
            look: new THREE.Vector3(755.0 + p * 2.0, 1.45, 12.0)
          };

        case 'warm_gratitude_lanterns':
          return {
            pos: new THREE.Vector3(756.0 + Math.sin(p * 0.9 - 0.4) * 3.4, 2.35 + p * 0.5, 18.0 - p * 1.0),
            look: new THREE.Vector3(756.0, 1.85, 12.0)
          };

        case 'still_glowing_heart_between':
          return {
            pos: new THREE.Vector3(774.0 + Math.sin(p * 1.0 - 0.5) * 3.4, 2.55 + p * 0.25, 18.4 - p * 1.2),
            look: new THREE.Vector3(774.0, 1.85, 11.6)
          };

        case 'parallel_roads_forever':
          return {
            pos: new THREE.Vector3(774.0 + Math.cos(p * 0.8 - 0.4) * 2.8, 2.85 + p * 0.6, 18.8 - p * 1.6),
            look: new THREE.Vector3(774.0, 1.75 + p * 0.3, 10.5 - p * 1.0)
          };

        case 'parallel_stars_outro':
          return {
            pos: new THREE.Vector3(774.0 + Math.sin(p * 0.6) * 2.2, 2.75 - p * 0.2, 17.6 - p * 1.4),
            look: new THREE.Vector3(774.0, 2.05, 11.4)
          };

        case 'globe_billions_two_souls':
          return {
            pos: new THREE.Vector3(792.0 + Math.sin(p * 1.0 - 0.5) * 3.8, 2.85 + p * 0.4, 18.8 - p * 1.0),
            look: new THREE.Vector3(792.0, 2.25, 12.0)
          };

        case 'illusions_fade_away':
          return {
            pos: new THREE.Vector3(790.2 + p * 3.6, 2.45 + p * 0.5, 17.8 - p * 0.8),
            look: new THREE.Vector3(792.0, 2.35, 12.0)
          };

        case 'sweet_start_bridge':
          return {
            pos: new THREE.Vector3(807.5 + p * 4.5, 2.45 + p * 0.3, 18.4 - p * 1.0),
            look: new THREE.Vector3(809.2 + p * 1.6, 1.85, 12.0)
          };

        case 'orbit_late_night_promises':
          return {
            pos: new THREE.Vector3(810.0 + Math.sin(p * 1.0 - 0.4) * 3.2, 2.75 - p * 0.2, 17.8 - p * 1.0),
            look: new THREE.Vector3(810.0, 2.15, 12.0)
          };

        case 'storm_test_of_love':
          return {
            pos: new THREE.Vector3(825.2 + p * 4.5, 2.65 - p * 0.2, 18.8 - p * 1.0),
            look: new THREE.Vector3(826.5 + p * 2.5, 1.65, 12.0)
          };

        case 'exhausted_silent_cloud':
          return {
            pos: new THREE.Vector3(825.0 + p * 2.2, 2.35 + p * 0.2, 17.4 - p * 0.8),
            look: new THREE.Vector3(826.2 + p * 0.8, 1.65, 12.0)
          };

        case 'tangled_knot_misunderstanding':
          return {
            pos: new THREE.Vector3(827.2 + p * 2.4, 2.45 - p * 0.15, 17.6 - p * 0.9),
            look: new THREE.Vector3(828.2, 1.85, 12.0)
          };

        case 'embrace_hidden_sadness':
          return {
            pos: new THREE.Vector3(843.2 + p * 3.2, 2.55 - p * 0.2, 18.2 - p * 1.0),
            look: new THREE.Vector3(844.5 + p * 2.0, 1.95, 12.0)
          };

        case 'kintsugi_mending_together':
          return {
            pos: new THREE.Vector3(846.4 + Math.sin(p * 0.9 - 0.3) * 2.8, 2.45 + p * 0.25, 17.8 - p * 1.0),
            look: new THREE.Vector3(847.5, 2.05, 12.0)
          };

        case 'beyond_arguments_table':
          return {
            pos: new THREE.Vector3(861.5 + p * 4.5, 2.65 - p * 0.2, 18.4 - p * 1.0),
            look: new THREE.Vector3(863.2 + p * 1.6, 1.65, 12.0)
          };

        case 'orbit_listening_harmony':
          return {
            pos: new THREE.Vector3(864.0 + Math.sin(p * 1.0 - 0.5) * 3.2, 2.45 + p * 0.25, 17.6 - p * 1.0),
            look: new THREE.Vector3(864.0, 1.75, 12.0)
          };

        case 'ephemeral_fireworks_to_lantern':
          return {
            pos: new THREE.Vector3(879.2 + p * 4.8, 2.75 - p * 0.2, 18.8 - p * 1.0),
            look: new THREE.Vector3(880.5 + p * 3.0, 2.15, 12.0)
          };

        case 'warm_lighthouse_shelter':
          return {
            pos: new THREE.Vector3(882.4 + Math.sin(p * 0.9 - 0.3) * 3.0, 2.55 + p * 0.3, 18.0 - p * 1.0),
            look: new THREE.Vector3(883.2, 2.15, 12.0)
          };

        case 'cherish_imperfect_goodness':
          return {
            pos: new THREE.Vector3(897.5 + p * 4.5, 2.65 + p * 0.25, 18.6 - p * 1.0),
            look: new THREE.Vector3(899.2 + p * 1.6, 2.05, 12.0)
          };

        case 'mutual_pillars_respect':
          return {
            pos: new THREE.Vector3(900.0 + Math.sin(p * 0.9 - 0.4) * 3.4, 2.55 + p * 0.4, 18.0 - p * 1.0),
            look: new THREE.Vector3(900.0, 2.25, 12.0)
          };

        case 'build_peaceful_foundation':
          return {
            pos: new THREE.Vector3(915.5 + p * 4.5, 2.45 + p * 0.35, 18.4 - p * 1.0),
            look: new THREE.Vector3(917.2 + p * 1.6, 1.85, 12.0)
          };

        case 'imperfect_halves_complete_sphere':
          return {
            pos: new THREE.Vector3(918.0 + Math.sin(p * 1.0 - 0.5) * 3.2, 2.65 + p * 0.25, 17.8 - p * 1.0),
            look: new THREE.Vector3(918.0, 2.15, 12.0)
          };

        case 'walk_ordinary_days_together':
          return {
            pos: new THREE.Vector3(936.0 + Math.sin(p * 0.9 - 0.4) * 2.8, 2.55 + p * 0.4, 18.6 - p * 1.6),
            look: new THREE.Vector3(936.0, 1.55 + p * 0.3, 11.2 - p * 1.2)
          };

        case 'ordinary_days_horizon_outro':
          return {
            pos: new THREE.Vector3(936.0 + Math.sin(p * 0.6) * 2.0, 2.65 - p * 0.2, 17.4 - p * 1.5),
            look: new THREE.Vector3(936.0, 1.75, 10.2)
          };

        case 'exhausted_room_return':
          return {
            pos: new THREE.Vector3(952.2 + p * 3.4, 2.55 - p * 0.2, 18.2 - p * 1.0),
            look: new THREE.Vector3(953.8 + p * 0.6, 1.35, 12.1)
          };

        case 'silent_bed_dim_aura':
          return {
            pos: new THREE.Vector3(954.4 + Math.sin(p * 0.9 - 0.3) * 2.6, 2.35 + p * 0.2, 17.4 - p * 1.0),
            look: new THREE.Vector3(954.35, 1.55, 12.2)
          };

        case 'dawn_crowd_rush_office':
          return {
            pos: new THREE.Vector3(969.5 + p * 4.5, 2.65 + p * 0.3, 18.6 - p * 1.0),
            look: new THREE.Vector3(971.2 + p * 2.0, 1.85, 12.0)
          };

        case 'vortex_deadlines_meetings':
          return {
            pos: new THREE.Vector3(973.1 + Math.sin(p * 1.1 - 0.4) * 3.2, 2.75 - p * 0.2, 18.0 - p * 1.0),
            look: new THREE.Vector3(973.15, 2.25, 12.1)
          };

        case 'bills_and_family_hope_step':
          return {
            pos: new THREE.Vector3(988.2 + p * 3.6, 2.65 + p * 0.35, 18.6 - p * 1.2),
            look: new THREE.Vector3(990.0, 1.75 + p * 0.2, 11.8)
          };

        case 'front_smiling_mask_okay':
          return {
            pos: new THREE.Vector3(1006.8 + p * 2.4, 2.35 + p * 0.15, 17.8 - p * 0.8),
            look: new THREE.Vector3(1008.0, 2.1, 12.6)
          };

        case 'behind_mask_sleepless_storm':
          return {
            pos: new THREE.Vector3(1008.0 + Math.sin(p * 1.2 - 0.5) * 3.8, 2.65 + p * 0.3, 17.6 - p * 1.2),
            look: new THREE.Vector3(1008.0, 2.05, 11.4)
          };

        case 'walk_through_unresolved_labyrinth':
          return {
            pos: new THREE.Vector3(1026.0 + Math.sin(p * 0.9 - 0.4) * 3.2, 2.75 + p * 0.35, 18.6 - p * 1.4),
            look: new THREE.Vector3(1026.0, 1.65, 11.6 - p * 0.8)
          };

        case 'gears_break_to_human_heart':
          return {
            pos: new THREE.Vector3(1042.2 + p * 3.6, 2.55 + p * 0.2, 18.4 - p * 1.0),
            look: new THREE.Vector3(1044.0, 2.15, 12.1)
          };

        case 'step_off_comparison_podium':
          return {
            pos: new THREE.Vector3(1044.0 + Math.sin(p * 1.0 - 0.5) * 3.4, 2.65 - p * 0.2, 18.0 - p * 1.0),
            look: new THREE.Vector3(1044.0, 2.15, 12.2)
          };

        case 'warm_essential_checkmarks':
          return {
            pos: new THREE.Vector3(1043.2 + p * 1.8, 2.35 + p * 0.3, 17.2 - p * 0.8),
            look: new THREE.Vector3(1044.0, 2.15, 12.2)
          };

        case 'zoom_out_one_storm_tile':
          return {
            pos: new THREE.Vector3(1063.4 - p * 1.8, 1.95 + p * 1.1, 16.5 + p * 2.2),
            look: new THREE.Vector3(1062.4 - p * 0.4, 1.45 + p * 0.6, 12.0)
          };

        case 'orbit_radiant_identity_mosaic':
          return {
            pos: new THREE.Vector3(1062.0 + Math.sin(p * 1.0 - 0.5) * 3.6, 2.85 + p * 0.3, 18.6 - p * 1.0),
            look: new THREE.Vector3(1062.0, 2.05, 12.0)
          };

        case 'cozy_rest_meal_sleep_call':
          return {
            pos: new THREE.Vector3(1078.2 + p * 3.6, 2.65 - p * 0.2, 18.4 - p * 1.0),
            look: new THREE.Vector3(1080.0, 1.85, 12.0)
          };

        case 'soul_battery_emerald_recharge':
          return {
            pos: new THREE.Vector3(1080.0 + Math.sin(p * 0.9 - 0.4) * 3.2, 2.45 + p * 0.4, 17.8 - p * 1.0),
            look: new THREE.Vector3(1080.0, 1.95, 12.0)
          };

        case 'work_builds_blooming_life':
          return {
            pos: new THREE.Vector3(1096.0 + p * 4.0, 2.65 + p * 0.3, 18.8 - p * 1.0),
            look: new THREE.Vector3(1098.0, 1.85, 12.0)
          };

        case 'gratitude_crown_of_effort':
          return {
            pos: new THREE.Vector3(1098.0 + Math.sin(p * 1.0 - 0.5) * 3.4, 2.65 + p * 0.25, 18.2 - p * 1.0),
            look: new THREE.Vector3(1098.0, 2.25, 12.0)
          };

        case 'love_yourself_sunrise_heart':
          return {
            pos: new THREE.Vector3(1098.0 + Math.cos(p * 0.8 - 0.4) * 2.8, 2.55 + p * 0.3, 17.6 - p * 1.0),
            look: new THREE.Vector3(1098.0, 2.3, 12.0)
          };

        case 'self_love_dawn_outro':
          return {
            pos: new THREE.Vector3(1098.0 + Math.sin(p * 0.6) * 2.0, 2.75 - p * 0.2, 17.2 - p * 1.4),
            look: new THREE.Vector3(1098.0, 2.25, 12.0)
          };

        case 'lotus_mud_to_diamond_core':
          return {
            pos: new THREE.Vector3(1113.5 + p * 5.0, 2.55 + p * 0.25, 18.6 - p * 1.0),
            look: new THREE.Vector3(1114.4 + p * 3.2, 1.75, 12.0)
          };

        case 'orbit_forged_beauty_duality':
          return {
            pos: new THREE.Vector3(1116.0 + Math.sin(p * 1.0 - 0.5) * 3.8, 2.75 - p * 0.2, 18.4 - p * 1.0),
            look: new THREE.Vector3(1116.0, 1.85, 12.0)
          };

        case 'rise_from_cracked_step':
          return {
            pos: new THREE.Vector3(1131.5 + p * 4.8, 2.35 + p * 1.1, 18.4 - p * 1.2),
            look: new THREE.Vector3(1132.5 + p * 3.2, 1.45 + p * 0.9, 12.0)
          };

        case 'endless_rain_bruised_heart':
          return {
            pos: new THREE.Vector3(1149.8 + p * 2.4, 2.55 - p * 0.2, 18.0 - p * 0.8),
            look: new THREE.Vector3(1150.8 + p * 1.2, 1.65, 12.1)
          };

        case 'towering_reality_walls_doubt':
          return {
            pos: new THREE.Vector3(1151.2 + p * 2.8, 2.45 + p * 0.4, 18.6 - p * 1.0),
            look: new THREE.Vector3(1152.5, 1.95, 11.8)
          };

        case 'seed_shell_to_mighty_tree':
          return {
            pos: new THREE.Vector3(1167.4 + p * 4.8, 2.35 + p * 0.6, 18.8 - p * 1.0),
            look: new THREE.Vector3(1168.4 + p * 3.2, 1.75 + p * 0.5, 12.0)
          };

        case 'ship_braving_storm_waves':
          return {
            pos: new THREE.Vector3(1188.0 + Math.sin(p * 1.1 - 0.5) * 3.6, 2.65 + p * 0.25, 18.6 - p * 1.2),
            look: new THREE.Vector3(1188.2, 1.75, 12.0)
          };

        case 'resilience_phoenix_light_core':
          return {
            pos: new THREE.Vector3(1204.2 + p * 3.6, 2.55 + p * 0.25, 18.4 - p * 1.0),
            look: new THREE.Vector3(1206.0, 2.15, 12.0)
          };

        case 'golden_scars_armor_of_hope':
          return {
            pos: new THREE.Vector3(1206.0 + Math.sin(p * 1.0 - 0.4) * 3.2, 2.45 + p * 0.3, 17.6 - p * 1.0),
            look: new THREE.Vector3(1206.0, 2.2, 12.0)
          };

        case 'rugged_climb_to_horizon':
          return {
            pos: new THREE.Vector3(1221.2 + p * 4.6, 2.35 + p * 1.1, 18.6 - p * 1.2),
            look: new THREE.Vector3(1222.5 + p * 3.2, 1.65 + p * 0.8, 11.8)
          };

        case 'distant_summit_star_faith':
          return {
            pos: new THREE.Vector3(1224.2 + Math.sin(p * 0.9 - 0.3) * 3.2, 2.85 + p * 0.4, 18.0 - p * 1.2),
            look: new THREE.Vector3(1225.4, 2.55, 11.4)
          };

        case 'parting_storm_eternal_blue_sky':
          return {
            pos: new THREE.Vector3(1242.0 + Math.sin(p * 1.0 - 0.5) * 3.4, 2.65 + p * 0.3, 18.4 - p * 1.2),
            look: new THREE.Vector3(1242.0, 2.15, 12.0)
          };

        case 'unpaved_windy_road':
          return {
            pos: new THREE.Vector3(1258.0 + p * 3.6, 2.55 - p * 0.15, 18.6 - p * 1.0),
            look: new THREE.Vector3(1260.0, 1.95, 12.0)
          };

        case 'proud_blossom_in_tempest':
          return {
            pos: new THREE.Vector3(1260.0 + Math.sin(p * 1.0 - 0.5) * 3.2, 2.65 + p * 0.25, 17.8 - p * 1.0),
            look: new THREE.Vector3(1260.0, 2.25, 12.0)
          };

        case 'storm_blossom_crown_outro':
          return {
            pos: new THREE.Vector3(1260.0 + Math.sin(p * 0.6) * 2.0, 2.75 - p * 0.2, 17.2 - p * 1.4),
            look: new THREE.Vector3(1260.0, 2.3, 12.0)
          };

        case 'slipping_treasure_reach':
          return {
            pos: new THREE.Vector3(1278.0 + Math.sin(p * 0.7 - 0.35) * 0.9, 2.15 + p * 0.15, 18.5 - p * 0.5),
            look: new THREE.Vector3(1278.0, 1.75, 12.0)
          };

        case 'missed_call_to_waiting_parents':
          return {
            pos: new THREE.Vector3(1295.4 + p * 0.8, 2.25 + p * 0.1, 18.6 - p * 0.5),
            look: new THREE.Vector3(1296.0, 1.65, 12.0)
          };

        case 'unpredictable_life_table':
          return {
            pos: new THREE.Vector3(1296.0 + Math.sin(p * 0.8 - 0.4) * 0.8, 2.25 + p * 0.1, 18.2 - p * 0.5),
            look: new THREE.Vector3(1296.0, 1.7, 12.0)
          };

        case 'pan_three_irreversible_cards':
          return {
            pos: new THREE.Vector3(1312.8 + p * 2.4, 2.15 + p * 0.1, 18.2 - p * 0.5),
            look: new THREE.Vector3(1314.0, 1.7, 12.0)
          };

        case 'focus_train_and_late_apology':
          return {
            pos: new THREE.Vector3(1314.0 + Math.sin(p * 0.7) * 0.8, 2.15, 17.8 - p * 0.5),
            look: new THREE.Vector3(1314.0, 1.7, 12.0)
          };

        case 'chasing_mirage_forget_simple':
          return {
            pos: new THREE.Vector3(1331.4 + p * 1.2, 2.15 + p * 0.1, 18.4 - p * 0.5),
            look: new THREE.Vector3(1332.0, 1.65, 12.0)
          };

        case 'money_status_mirage_tower':
          return {
            pos: new THREE.Vector3(1332.0 + Math.sin(p * 0.8 - 0.4) * 0.8, 2.25 + p * 0.15, 18.0 - p * 0.5),
            look: new THREE.Vector3(1332.0, 1.75, 12.0)
          };

        case 'true_success_checklist_reveal':
          return {
            pos: new THREE.Vector3(1350.0 + Math.sin(p * 0.6 - 0.3) * 0.7, 2.15 + p * 0.1, 18.2 - p * 0.5),
            look: new THREE.Vector3(1350.0, 1.65, 12.0)
          };

        case 'cherish_parents_loved_ones_now':
          return {
            pos: new THREE.Vector3(1368.0 + Math.sin(p * 0.6 - 0.3) * 0.7, 2.15 + p * 0.1, 18.2 - p * 0.5),
            look: new THREE.Vector3(1368.0, 1.65, 12.0)
          };

        case 'live_youth_dream_today':
          return {
            pos: new THREE.Vector3(1368.0 + Math.sin(p * 0.8 - 0.4) * 0.8, 2.25 + p * 0.1, 17.8 - p * 0.5),
            look: new THREE.Vector3(1368.0, 1.7, 12.0)
          };

        case 'silent_hourglass_pages_drift':
          return {
            pos: new THREE.Vector3(1386.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1386.0, 1.7, 12.0)
          };

        case 'drop_regret_truly_live_sunrise':
          return {
            pos: new THREE.Vector3(1404.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.4 - p * 0.6),
            look: new THREE.Vector3(1404.0, 1.7, 12.0)
          };

        case 'truly_living_horizon_outro':
          return {
            pos: new THREE.Vector3(1404.0 + Math.sin(p * 0.5) * 0.9, 2.3 - p * 0.1, 17.6 - p * 0.8),
            look: new THREE.Vector3(1404.0, 1.85, 11.6)
          };

        case 'judge_surface_magnifier':
          return {
            pos: new THREE.Vector3(1422.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.4 - p * 0.5),
            look: new THREE.Vector3(1422.0, 1.7, 12.0)
          };

        case 'pan_three_hasty_labels':
          return {
            pos: new THREE.Vector3(1438.8 + p * 2.4, 2.15 + p * 0.1, 18.2 - p * 0.5),
            look: new THREE.Vector3(1440.0, 1.7, 12.0)
          };

        case 'focus_three_labels_detail':
          return {
            pos: new THREE.Vector3(1440.0 + Math.sin(p * 0.7) * 0.8, 2.15, 17.8 - p * 0.5),
            look: new THREE.Vector3(1440.0, 1.7, 12.0)
          };

        case 'iceberg_calm_to_deep_tempest':
          return {
            pos: new THREE.Vector3(1458.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1458.0, 1.65, 12.0)
          };

        case 'two_starting_lines_contrast':
          return {
            pos: new THREE.Vector3(1476.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.1, 18.4 - p * 0.5),
            look: new THREE.Vector3(1476.0, 1.7, 12.0)
          };

        case 'own_clock_timeline_orbit':
          return {
            pos: new THREE.Vector3(1494.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1494.0, 1.7, 12.0)
          };

        case 'deep_roots_beneath_soil':
          return {
            pos: new THREE.Vector3(1512.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.4 - p * 0.5),
            look: new THREE.Vector3(1512.0, 1.7, 12.0)
          };

        case 'slingshot_launch_prep':
          return {
            pos: new THREE.Vector3(1530.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1530.0, 1.7, 12.0)
          };

        case 'value_in_perseverance_steps':
          return {
            pos: new THREE.Vector3(1548.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1548.0, 1.7, 12.0)
          };

        case 'empathy_horizon_walk_outro':
          return {
            pos: new THREE.Vector3(1566.0 + Math.sin(p * 0.5) * 0.9, 2.3 - p * 0.1, 17.6 - p * 0.8),
            look: new THREE.Vector3(1566.0, 1.85, 11.6)
          };

        case 'self_reflection_mirror_orbit':
          return {
            pos: new THREE.Vector3(1584.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1584.0, 1.7, 12.0)
          };

        case 'blame_pointing_arrows_pan':
          return {
            pos: new THREE.Vector3(1602.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.1, 18.4 - p * 0.5),
            look: new THREE.Vector3(1602.0, 1.7, 12.0)
          };

        case 'victim_cage_closeup_break':
          return {
            pos: new THREE.Vector3(1620.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1620.0, 1.7, 12.0)
          };

        case 'past_shadow_today_contrast':
          return {
            pos: new THREE.Vector3(1638.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.15, 18.4 - p * 0.5),
            look: new THREE.Vector3(1638.0, 1.7, 12.0)
          };

        case 'solitary_pillar_strength_orbit':
          return {
            pos: new THREE.Vector3(1656.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.25 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1656.0, 1.75, 12.0)
          };

        case 'firm_helm_steering_hero':
          return {
            pos: new THREE.Vector3(1674.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1674.0, 1.7, 12.0)
          };

        case 'golden_key_unlock_portal':
          return {
            pos: new THREE.Vector3(1692.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1692.0, 1.7, 12.0)
          };

        case 'valley_to_summit_pan':
          return {
            pos: new THREE.Vector3(1710.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.25 + p * 0.15, 18.4 - p * 0.5),
            look: new THREE.Vector3(1710.0, 1.7, 12.0)
          };

        case 'brick_by_brick_bridge_track':
          return {
            pos: new THREE.Vector3(1728.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1728.0, 1.7, 12.0)
          };

        case 'own_hero_awakening_orbit':
          return {
            pos: new THREE.Vector3(1746.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.25 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1746.0, 1.75, 12.0)
          };

        case 'destiny_master_sunrise_outro':
          return {
            pos: new THREE.Vector3(1764.0 + Math.sin(p * 0.5) * 0.9, 2.3 - p * 0.1, 17.6 - p * 0.8),
            look: new THREE.Vector3(1764.0, 1.85, 11.6)
          };

        case 'outward_battle_arena_pan':
          return {
            pos: new THREE.Vector3(1782.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1782.0, 1.7, 12.0)
          };

        case 'comparison_pedestals_orbit':
          return {
            pos: new THREE.Vector3(1800.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.1, 18.4 - p * 0.5),
            look: new THREE.Vector3(1800.0, 1.7, 12.0)
          };

        case 'inner_shadow_closeup_face':
          return {
            pos: new THREE.Vector3(1818.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1818.0, 1.7, 12.0)
          };

        case 'comfort_pillow_to_alarm':
          return {
            pos: new THREE.Vector3(1836.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.15, 18.4 - p * 0.5),
            look: new THREE.Vector3(1836.0, 1.7, 12.0)
          };

        case 'trophy_vs_crown_contrast':
          return {
            pos: new THREE.Vector3(1854.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.25 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1854.0, 1.75, 12.0)
          };

        case 'dawn_discipline_track_rise':
          return {
            pos: new THREE.Vector3(1872.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.15 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1872.0, 1.7, 12.0)
          };

        case 'book_dumbbell_orbit':
          return {
            pos: new THREE.Vector3(1890.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1890.0, 1.7, 12.0)
          };

        case 'flame_to_zen_water_pan':
          return {
            pos: new THREE.Vector3(1908.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.25 + p * 0.15, 18.4 - p * 0.5),
            look: new THREE.Vector3(1908.0, 1.7, 12.0)
          };

        case 'two_versions_progress_track':
          return {
            pos: new THREE.Vector3(1926.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.2 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1926.0, 1.7, 12.0)
          };

        case 'forging_willpower_orbit':
          return {
            pos: new THREE.Vector3(1944.0 + Math.sin(p * 0.7 - 0.35) * 0.8, 2.25 + p * 0.15, 18.2 - p * 0.5),
            look: new THREE.Vector3(1944.0, 1.75, 12.0)
          };

        case 'self_conquest_sunrise_outro':
          return {
            pos: new THREE.Vector3(1962.0 + Math.sin(p * 0.5) * 0.9, 2.3 - p * 0.1, 17.6 - p * 0.8),
            look: new THREE.Vector3(1962.0, 1.85, 11.6)
          };

        default:
          if (this._getNeonStoryCameraTarget) {
            const neonCam = this._getNeonStoryCameraTarget(cameraPreset, p, timeSec);
            if (neonCam) return neonCam;
          }
          return {
            pos: new THREE.Vector3(10.0 + (timeSec % 20), 2.5, 5.0),
            look: new THREE.Vector3(15.0 + (timeSec % 20), 2.2, 0)
          };
      }
    }

    /**
     * Render exact deterministic state at `timeSec`
     */
    renderAtTime(timeSec, activeSegment, segProgress) {
      const sceneType = activeSegment ? activeSegment.scene : 'pipe_flow';
      const cameraPreset = activeSegment ? activeSegment.camera : 'track_pipe_forward';

      // Toggle visibility of scene-specific elements
      const isPipeOrTankScene = [
        'tank_intro',
        'tank_to_pipe',
        'pipe_flow',
        'pipe_flow_leaks',
        'leak_closeup',
        'leak_particles_heavy',
        'leak_cutters',
        'leak_pins_map',
        'pipe_overview',
        'tank_outro',
        'helm_phone_combo'
      ].includes(sceneType);
      this.tankGroup.visible = isPipeOrTankScene;
      this.pipeGroup.visible = isPipeOrTankScene;

      const isOutro = sceneType === 'tank_outro' || cameraPreset === 'final_tank_zoom';
      this.introCoinsGroup.visible = !isOutro;
      this.outroCoinsGroup.visible = isOutro;

      const showHelm = ['golden_helm', 'helm_phone_combo', 'pipe_overview'].includes(sceneType);
      this.helmGroup.visible = showHelm;

      const showPhone = ['phone_tap', 'helm_phone_combo'].includes(sceneType);
      this.phoneGroup.visible = showPhone;

      // Isolate active 3D island so neighboring islands never appear at frame edges
      if (this.chartGroup) this.chartGroup.visible = sceneType === 'growth_chart';
      if (this.scaleGroup) this.scaleGroup.visible = sceneType === 'balance_scale';
      if (this.gearsGroup) this.gearsGroup.visible = sceneType === 'time_gears';
      if (this.vaultGroup) this.vaultGroup.visible = sceneType === 'vault_safe';
      if (this.hourglassGroup) this.hourglassGroup.visible = sceneType === 'hourglass_time';
      if (this.dominoGroup) this.dominoGroup.visible = sceneType === 'domino_chain';
      if (this.twoPathsGroup) this.twoPathsGroup.visible = sceneType === 'two_paths_bridge';
      if (this.candlesGroup) this.candlesGroup.visible = sceneType === 'lifeline_candles';
      if (this.homeTableGroup) this.homeTableGroup.visible = sceneType === 'empty_home_table';
      if (this.treeGroup) this.treeGroup.visible = sceneType === 'calendar_tree_leaves';
      if (this.vanishingBridgeGroup) this.vanishingBridgeGroup.visible = sceneType === 'vanishing_bridge';
      if (this.memoryFramesGroup) this.memoryFramesGroup.visible = sceneType === 'memory_silhouette_frames';
      if (this.glassCageGroup) this.glassCageGroup.visible = sceneType === 'locked_glass_cage';
      if (this.presentTrinityGroup) this.presentTrinityGroup.visible = sceneType === 'past_present_future_trinity';
      if (this.clockLoopGroup) this.clockLoopGroup.visible = sceneType === 'procrastination_loop_clock';
      if (this.thiefGroup) this.thiefGroup.visible = sceneType === 'thief_gears_draining';
      if (this.twoRunnersGroup) this.twoRunnersGroup.visible = sceneType === 'two_runners_starting_line';
      if (this.bookStepsGroup) this.bookStepsGroup.visible = sceneType === 'open_glowing_book_steps';
      if (this.chainedAnchorsGroup) this.chainedAnchorsGroup.visible = sceneType === 'chained_heavy_anchors';
      if (this.sisyphusWallGroup) this.sisyphusWallGroup.visible = sceneType === 'endless_sisyphus_wall';
      if (this.thornyRopeGroup) this.thornyRopeGroup.visible = sceneType === 'thorny_crimson_rope';
      if (this.bloomStoneGroup) this.bloomStoneGroup.visible = sceneType === 'bloom_to_stone_burden';
      if (this.butterflyCageGroup) this.butterflyCageGroup.visible = sceneType === 'shattered_cage_butterflies';
      if (this.emeraldPortalGroup) this.emeraldPortalGroup.visible = sceneType === 'closing_door_emerald_portal';
      if (this.compassCrossroadsGroup) this.compassCrossroadsGroup.visible = sceneType === 'crossroads_compass_maturity';
      if (this.openHandsDawnGroup) this.openHandsDawnGroup.visible = sceneType === 'open_hands_new_dawn';
      if (this.noisyEchoGroup) this.noisyEchoGroup.visible = sceneType === 'noisy_echo_arrows';
      if (this.chessPeaceGroup) this.chessPeaceGroup.visible = sceneType === 'chessboard_peace_crown';
      if (this.silentMountainGroup) this.silentMountainGroup.visible = sceneType === 'silent_mountain_fortress';
      if (this.crystalLakeGroup) this.crystalLakeGroup.visible = sceneType === 'rippling_to_crystal_lake';
      if (this.emotionZenGroup) this.emotionZenGroup.visible = sceneType === 'impulsive_fire_to_zen_sphere';
      if (this.jadeShieldGroup) this.jadeShieldGroup.visible = sceneType === 'jade_shield_inner_garden';
      if (this.voiceActionGroup) this.voiceActionGroup.visible = sceneType === 'voice_and_action_scale';
      if (this.silentMonumentGroup) this.silentMonumentGroup.visible = sceneType === 'silent_monument_constellation';
      if (this.midnightPlanetGroup) this.midnightPlanetGroup.visible = sceneType === 'midnight_phone_planet';
      if (this.divergingGalaxiesGroup) this.divergingGalaxiesGroup.visible = sceneType === 'diverging_twin_galaxies';
      if (this.dreamHouseGroup) this.dreamHouseGroup.visible = sceneType === 'unfinished_dream_house';
      if (this.vinylPhoneGroup) this.vinylPhoneGroup.visible = sceneType === 'vinyl_melody_dimming_screen';
      if (this.paperBoatsGroup) this.paperBoatsGroup.visible = sceneType === 'paper_boats_star_river';
      if (this.roseTreeGroup) this.roseTreeGroup.visible = sceneType === 'rose_bloom_crystal_tree';
      if (this.peaceBridgesGroup) this.peaceBridgesGroup.visible = sceneType === 'two_peaceful_lantern_bridges';
      if (this.parallelStarsGroup) this.parallelStarsGroup.visible = sceneType === 'parallel_stars_still_loving';
      if (this.earthBillionsGroup) this.earthBillionsGroup.visible = sceneType === 'earth_billions_two_souls';
      if (this.sweetBeginningsGroup) this.sweetBeginningsGroup.visible = sceneType === 'sweet_beginnings_constellation';
      if (this.stormImperfectGroup) this.stormImperfectGroup.visible = sceneType === 'thorny_storm_imperfect_days';
      if (this.kintsugiHeartGroup) this.kintsugiHeartGroup.visible = sceneType === 'smile_mask_to_kintsugi_heart';
      if (this.listeningTableGroup) this.listeningTableGroup.visible = sceneType === 'listening_bridge_table';
      if (this.lighthouseGroup) this.lighthouseGroup.visible = sceneType === 'fireworks_vs_storm_lighthouse';
      if (this.mutualRespectGroup) this.mutualRespectGroup.visible = sceneType === 'balanced_pillars_mutual_respect';
      if (this.imperfectPuzzleGroup) this.imperfectPuzzleGroup.visible = sceneType === 'two_imperfect_puzzle_spheres';
      if (this.ordinaryDaysGroup) this.ordinaryDaysGroup.visible = sceneType === 'ordinary_days_starlight_walk';
      if (this.silentBedGroup) this.silentBedGroup.visible = sceneType === 'silent_bed_dropped_bag';
      if (this.dawnRushGroup) this.dawnRushGroup.visible = sceneType === 'dawn_rush_deadline_storm';
      if (this.billsFamilyGroup) this.billsFamilyGroup.visible = sceneType === 'bills_and_family_expectations';
      if (this.smilingMaskGroup) this.smilingMaskGroup.visible = sceneType === 'smiling_mask_hidden_tears';
      if (this.unresolvedMazeGroup) this.unresolvedMazeGroup.visible = sceneType === 'walking_through_unresolved_maze';
      if (this.notMachineGroup) this.notMachineGroup.visible = sceneType === 'not_a_machine_human_heart';
      if (this.badDayMosaicGroup) this.badDayMosaicGroup.visible = sceneType === 'bad_day_not_failed_life';
      if (this.restSanctuaryGroup) this.restSanctuaryGroup.visible = sceneType === 'rest_recharge_sanctuary';
      if (this.loveYourselfGroup) this.loveYourselfGroup.visible = sceneType === 'work_for_life_love_yourself';
      if (this.lotusDiamondGroup) this.lotusDiamondGroup.visible = sceneType === 'lotus_mud_diamond_pressure';
      if (this.risingStepsGroup) this.risingStepsGroup.visible = sceneType === 'rising_from_stumble_steps';
      if (this.rainWallsGroup) this.rainWallsGroup.visible = sceneType === 'endless_rain_high_walls';
      if (this.seedTreeGroup) this.seedTreeGroup.visible = sceneType === 'seed_breaks_shell_mighty_tree';
      if (this.stormShipGroup) this.stormShipGroup.visible = sceneType === 'ship_sailing_stormy_ocean';
      if (this.resilienceScarsGroup) this.resilienceScarsGroup.visible = sceneType === 'resilience_light_in_darkness';
      if (this.ruggedHorizonGroup) this.ruggedHorizonGroup.visible = sceneType === 'rugged_mountain_new_horizon';
      if (this.blueSkyStormGroup) this.blueSkyStormGroup.visible = sceneType === 'blue_sky_beyond_storm_clouds';
      if (this.proudFlowerGroup) this.proudFlowerGroup.visible = sceneType === 'proud_flower_blooming_in_storm';
      if (this.slippingTreasureGroup) this.slippingTreasureGroup.visible = sceneType === 'slipping_treasure_from_hand';
      if (this.youthMissedFamilyGroup) this.youthMissedFamilyGroup.visible = sceneType === 'youth_illusion_missed_family';
      if (this.threeLossesGroup) this.threeLossesGroup.visible = sceneType === 'three_irreversible_losses_cards';
      if (this.mirageVsHomeGroup) this.mirageVsHomeGroup.visible = sceneType === 'chasing_distant_mirage_vs_home';
      if (this.trueSuccessChecklistGroup) this.trueSuccessChecklistGroup.visible = sceneType === 'true_success_checklist_balance';
      if (this.cherishNowGroup) this.cherishNowGroup.visible = sceneType === 'cherish_parents_and_loved_ones_now';
      if (this.silentTimeGroup) this.silentTimeGroup.visible = sceneType === 'silent_river_of_time_hourglass';
      if (this.trulyLivingGroup) this.trulyLivingGroup.visible = sceneType === 'existing_vs_truly_living_awakening';
      if (this.surfaceJudgmentGroup) this.surfaceJudgmentGroup.visible = sceneType === 'surface_judgment_scale_illusion';
      if (this.threeLabelsGroup) this.threeLabelsGroup.visible = sceneType === 'three_hasty_labels_cards';
      if (this.hiddenTempestGroup) this.hiddenTempestGroup.visible = sceneType === 'calm_surface_hidden_tempest';
      if (this.twoStartingLinesGroup) this.twoStartingLinesGroup.visible = sceneType === 'two_starting_lines_backpack';
      if (this.ownTimelineGroup) this.ownTimelineGroup.visible = sceneType === 'own_clock_unique_timeline';
      if (this.deepRootsTreeGroup) this.deepRootsTreeGroup.visible = sceneType === 'tree_deep_roots_underground';
      if (this.slingshotPrepGroup) this.slingshotPrepGroup.visible = sceneType === 'silent_preparation_slingshot_run';
      if (this.valuePerseveranceGroup) this.valuePerseveranceGroup.visible = sceneType === 'value_in_perseverance_climb';
      if (this.empathyWalkGroup) this.empathyWalkGroup.visible = sceneType === 'empathy_walk_horizon_outro';
      if (this.selfReflectionGroup) this.selfReflectionGroup.visible = sceneType === 'self_reflection_mirror_pause';
      if (this.blameArrowsGroup) this.blameArrowsGroup.visible = sceneType === 'blame_pointing_arrows_vs_mirror';
      if (this.victimCageGroup) this.victimCageGroup.visible = sceneType === 'victim_comfort_cage_breaking';
      if (this.pastShadowGroup) this.pastShadowGroup.visible = sceneType === 'past_shadow_today_burden';
      if (this.solitaryPillarGroup) this.solitaryPillarGroup.visible = sceneType === 'solitary_standing_pillar_strength';
      if (this.firmHelmGroup) this.firmHelmGroup.visible = sceneType === 'ocean_ship_firm_helm_hands';
      if (this.goldenKeyGroup) this.goldenKeyGroup.visible = sceneType === 'golden_key_future_portal';
      if (this.valleySummitGroup) this.valleySummitGroup.visible = sceneType === 'origin_valley_to_summit_peak';
      if (this.brickBridgeGroup) this.brickBridgeGroup.visible = sceneType === 'brick_by_brick_golden_bridge';
      if (this.ownHeroGroup) this.ownHeroGroup.visible = sceneType === 'own_hero_crown_awakening';
      if (this.destinySunriseGroup) this.destinySunriseGroup.visible = sceneType === 'destiny_master_sunrise_outro';
      if (this.outwardArenaGroup) this.outwardArenaGroup.visible = sceneType === 'outward_battle_arena_illusion';
      if (this.comparisonPodiumsGroup) this.comparisonPodiumsGroup.visible = sceneType === 'comparison_pedestals_clash';
      if (this.innerShadowGroup) this.innerShadowGroup.visible = sceneType === 'inner_shadow_confrontation';
      if (this.lazyWhisperGroup) this.lazyWhisperGroup.visible = sceneType === 'lazy_whisper_comfort_pillow';
      if (this.trophyCrownGroup) this.trophyCrownGroup.visible = sceneType === 'trophy_vs_inner_crown';
      if (this.dawnDisciplineGroup) this.dawnDisciplineGroup.visible = sceneType === 'dawn_discipline_awakening';
      if (this.focusChoiceGroup) this.focusChoiceGroup.visible = sceneType === 'book_and_dumbbell_vs_scroll';
      if (this.flameZenWaterGroup) this.flameZenWaterGroup.visible = sceneType === 'flame_to_zen_water_sphere';
      if (this.twoVersionsGroup) this.twoVersionsGroup.visible = sceneType === 'two_versions_self_progress';
      if (this.forgingDiamondGroup) this.forgingDiamondGroup.visible = sceneType === 'forging_willpower_diamond';
      if (this.selfConquestGroup) this.selfConquestGroup.visible = sceneType === 'self_conquest_triumph_outro';
      // Dynamic per-scene atmospheric background & fog color so scenes feel visually diverse
      const atmospherePalette = {
        chained_heavy_anchors: 0x060b16,
        endless_sisyphus_wall: 0x100907,
        thorny_crimson_rope: 0x12060b,
        bloom_to_stone_burden: 0x0b0914,
        shattered_cage_butterflies: 0x080716,
        closing_door_emerald_portal: 0x05110e,
        crossroads_compass_maturity: 0x060c18,
        open_hands_new_dawn: 0x090b17,
        noisy_echo_arrows: 0x110612,
        chessboard_peace_crown: 0x070a16,
        silent_mountain_fortress: 0x050e15,
        rippling_to_crystal_lake: 0x041016,
        impulsive_fire_to_zen_sphere: 0x0d0814,
        jade_shield_inner_garden: 0x05120e,
        voice_and_action_scale: 0x060c17,
        silent_monument_constellation: 0x080918,
        midnight_phone_planet: 0x090717,
        diverging_twin_galaxies: 0x0b0716,
        unfinished_dream_house: 0x080b16,
        vinyl_melody_dimming_screen: 0x0c0615,
        paper_boats_star_river: 0x040d17,
        rose_bloom_crystal_tree: 0x090814,
        two_peaceful_lantern_bridges: 0x060e15,
        parallel_stars_still_loving: 0x0b0715,
        earth_billions_two_souls: 0x050b18,
        sweet_beginnings_constellation: 0x0b0716,
        thorny_storm_imperfect_days: 0x100711,
        smile_mask_to_kintsugi_heart: 0x090917,
        listening_bridge_table: 0x05110f,
        fireworks_vs_storm_lighthouse: 0x070c16,
        balanced_pillars_mutual_respect: 0x080918,
        two_imperfect_puzzle_spheres: 0x060e16,
        ordinary_days_starlight_walk: 0x080a16,
        silent_bed_dropped_bag: 0x070816,
        dawn_rush_deadline_storm: 0x11080d,
        bills_and_family_expectations: 0x080c16,
        smiling_mask_hidden_tears: 0x0a0717,
        walking_through_unresolved_maze: 0x060f16,
        not_a_machine_human_heart: 0x0c0712,
        bad_day_not_failed_life: 0x060c18,
        rest_recharge_sanctuary: 0x05120e,
        work_for_life_love_yourself: 0x090816,
        lotus_mud_diamond_pressure: 0x0a0716,
        rising_from_stumble_steps: 0x060d17,
        endless_rain_high_walls: 0x080918,
        seed_breaks_shell_mighty_tree: 0x05120d,
        ship_sailing_stormy_ocean: 0x050e18,
        resilience_light_in_darkness: 0x0c0714,
        rugged_mountain_new_horizon: 0x080a18,
        blue_sky_beyond_storm_clouds: 0x05101a,
        proud_flower_blooming_in_storm: 0x0b0716,
        slipping_treasure_from_hand: 0x0a0818,
        youth_illusion_missed_family: 0x080b18,
        three_irreversible_losses_cards: 0x0c0716,
        chasing_distant_mirage_vs_home: 0x070d18,
        true_success_checklist_balance: 0x051210,
        cherish_parents_and_loved_ones_now: 0x0a0816,
        silent_river_of_time_hourglass: 0x060b18,
        existing_vs_truly_living_awakening: 0x090918,
        surface_judgment_scale_illusion: 0x090716,
        three_hasty_labels_cards: 0x070b18,
        calm_surface_hidden_tempest: 0x05101a,
        two_starting_lines_backpack: 0x0e0814,
        own_clock_unique_timeline: 0x060e18,
        tree_deep_roots_underground: 0x05120d,
        silent_preparation_slingshot_run: 0x0d0918,
        value_in_perseverance_climb: 0x090a18,
        empathy_walk_horizon_outro: 0x0a0918,
        self_reflection_mirror_pause: 0x070c18,
        blame_pointing_arrows_vs_mirror: 0x110710,
        victim_comfort_cage_breaking: 0x0e0915,
        past_shadow_today_burden: 0x090b17,
        solitary_standing_pillar_strength: 0x060f16,
        ocean_ship_firm_helm_hands: 0x050e18,
        golden_key_future_portal: 0x061112,
        origin_valley_to_summit_peak: 0x080c16,
        brick_by_brick_golden_bridge: 0x090816,
        own_hero_crown_awakening: 0x0c0818,
        destiny_master_sunrise_outro: 0x0a0918,
        outward_battle_arena_illusion: 0x110710,
        comparison_pedestals_clash: 0x0e0915,
        inner_shadow_confrontation: 0x090616,
        lazy_whisper_comfort_pillow: 0x0f0812,
        trophy_vs_inner_crown: 0x061110,
        dawn_discipline_awakening: 0x060f18,
        book_and_dumbbell_vs_scroll: 0x090818,
        flame_to_zen_water_sphere: 0x040e18,
        two_versions_self_progress: 0x051210,
        forging_willpower_diamond: 0x0e0a16,
        self_conquest_triumph_outro: 0x0a0918
      };
      if (this._getNeonStoryPalette) Object.assign(atmospherePalette, this._getNeonStoryPalette());
      if (this._setNeonStoryVisibility) this._setNeonStoryVisibility(sceneType, activeSegment);
      const bgHex = atmospherePalette[sceneType] || 0x060809;
      this.scene.background.setHex(bgHex);
      this.scene.fog.color.setHex(bgHex);

      const showRedSparks = ['leak_particles_heavy', 'leak_cutters', 'leak_pins_map'].includes(sceneType);
      this.redParticlesGroup.visible = showRedSparks;

      const showCutters = sceneType === 'leak_cutters';
      this.cutterBlades.forEach((cb, i) => {
        cb.visible = showCutters;
        if (showCutters) {
          cb.rotation.x = timeSec * 3.2 + i;
        }
      });

      const showPins = sceneType === 'leak_pins_map';
      this.locatorPins.forEach((pin, i) => {
        pin.visible = showPins;
        if (showPins) {
          pin.position.y = 3.1 + Math.sin(timeSec * 3.0 + i * 0.7) * 0.15;
        }
      });

      // Animate flowing coins inside the pipe
      const pipeStart = -1.2;
      const pipeLen = 83.2;
      const flowSpeed = 4.2; // units per second
      this.pipeCoins.forEach((c) => {
        // Flow from right to left into the tank on tank_intro/outro, or left-to-right along the pipe
        const rawX = (c.baseOffset + timeSec * flowSpeed) % pipeLen;
        c.mesh.position.x = pipeStart + rawX;
        c.mesh.position.y = 2.25 + Math.sin(timeSec * 2.8 + c.phase) * 0.16 + c.radialOffset;
        c.mesh.position.z = Math.cos(timeSec * 2.2 + c.phase) * 0.16;
        c.mesh.rotation.x = timeSec * c.rotSpeedX + c.phase;
        c.mesh.rotation.y = timeSec * c.rotSpeedY;
        c.mesh.rotation.z = timeSec * c.rotSpeedZ;
      });

      // Animate leaking coins dropping underneath the pipe
      const showLeaks = [
        'pipe_flow_leaks',
        'leak_closeup',
        'leak_particles_heavy',
        'leak_cutters',
        'leak_pins_map'
      ].includes(sceneType);

      this.leakDrops.forEach((d) => {
        d.mesh.visible = showLeaks;
        if (showLeaks) {
          const fallCycle = (timeSec * 1.15 + d.phase) % 1.0;
          d.mesh.position.x = d.x + Math.sin(fallCycle * 6.0 + d.phase) * 0.15;
          d.mesh.position.y = d.baseY - fallCycle * 1.95;
          d.mesh.position.z = Math.cos(fallCycle * 5.0 + d.phase) * 0.15;
          d.mesh.rotation.x = timeSec * 3.0 + d.phase;
          d.mesh.rotation.z = timeSec * 2.4;
        }
      });

      // Animate red spark particles
      if (showRedSparks) {
        this.redParticles.forEach((rp) => {
          const cycle = (timeSec * rp.speedY + rp.phase) % 1.0;
          rp.sprite.position.set(
            rp.baseX + Math.sin(timeSec * 2.0 + rp.phase) * 0.35,
            rp.baseY - cycle * 1.4,
            rp.baseZ + Math.cos(timeSec * 1.8 + rp.phase) * 0.35
          );
          rp.sprite.material.opacity = Math.sin(cycle * Math.PI) * 0.85;
        });
      }

      // Animate Golden Helm rotation
      if (showHelm) {
        this.helmWheel.rotation.z = -timeSec * 0.55;
      }

      // Animate Smartphone screen touch ripples
      if (showPhone) {
        this.phoneRipples.forEach((rip, idx) => {
          const rCycle = (timeSec * 1.2 + idx * 0.5) % 1.0;
          const scale = 0.5 + rCycle * 2.2;
          rip.scale.set(scale, scale, 1);
          rip.material.opacity = (1.0 - rCycle) * 0.9;
        });
      }

      // Animate Extra Metaphors (Balance Scale, Gears, Vault, Hourglass, Dominoes, Two Paths)
      this.scaleBeam.rotation.z = Math.sin(timeSec * 1.6) * 0.18;
      this.gears.forEach((g) => {
        g.mesh.rotation.z = timeSec * g.speed;
      });
      if (this.vaultWheel) {
        this.vaultWheel.rotation.z = timeSec * 0.8;
      }

      // Hourglass animation
      this.hourglassRings.forEach((ring, idx) => {
        ring.rotation.y = timeSec * (idx === 0 ? 0.65 : -0.85);
        ring.rotation.z = Math.sin(timeSec * 0.7 + idx) * 0.25;
      });
      this.hourglassDrops.forEach((hd) => {
        const c = (timeSec * 0.85 + hd.phase) % 1.0;
        const y = 3.9 - c * 3.35;
        const spread = Math.abs(y - 2.55) * 0.32;
        hd.mesh.position.set(
          Math.sin(c * 12 + hd.phase * 6) * spread * 0.4,
          y,
          Math.cos(c * 10 + hd.phase * 6) * spread * 0.4
        );
        hd.mesh.rotation.x = timeSec * 2.8 + hd.phase;
        hd.mesh.rotation.z = timeSec * 2.1;
      });

      // Domino chain wave animation
      const waveIdx = (timeSec * 2.6) % (this.dominoes.length + 3);
      this.dominoes.forEach((dom) => {
        const diff = waveIdx - dom.index;
        let tilt = 0;
        if (diff > 0) {
          tilt = -Math.min(0.42, diff * 0.28);
        }
        dom.pivot.rotation.z = tilt;
      });

      // Two paths animation (Short-term falling coins vs Long-term climbing coins)
      this.shortTermDrops.forEach((sd) => {
        const c = (timeSec * 0.95 + sd.phase) % 1.0;
        sd.mesh.position.set(
          1.2 + c * 1.4,
          0.85 - c * 2.6,
          3.1 + Math.sin(c * 6 + sd.phase) * 0.25
        );
        sd.mesh.rotation.x = timeSec * 3.5;
      });

      this.bridgeCoins.forEach((bc) => {
        const progress = ((timeSec * 0.45 + bc.phase) % 1.0) * 11;
        const bounce = Math.abs(Math.sin(timeSec * 4.5 + bc.stepIndex)) * 0.28;
        bc.mesh.position.set(
          -3.2 + progress * 0.95,
          1.52 + progress * 0.42 + bounce,
          -0.5 - progress * 0.22
        );
        bc.mesh.rotation.y = timeSec * 2.4 + bc.stepIndex;
      });

      // Lifeline candles flame flicker & rising golden embers
      this.candleFlames.forEach((cf) => {
        const flicker = 1.0 + Math.sin(timeSec * 11.0 + cf.phase) * 0.12 + Math.cos(timeSec * 17.0 + cf.phase) * 0.08;
        cf.group.scale.set(1.0, flicker, 1.0);
        cf.group.position.y = cf.baseY + Math.sin(timeSec * 7.0 + cf.phase) * 0.03;
      });
      this.candleEmbers.forEach((em) => {
        const c = (timeSec * 0.42 + em.phase) % 1.0;
        em.sprite.position.set(
          em.baseX + Math.sin(c * 6.0 + em.phase * 10) * 0.28,
          em.baseY + c * 2.9,
          em.baseZ + Math.cos(c * 5.0 + em.phase * 10) * 0.22
        );
        em.sprite.material.opacity = Math.sin(c * Math.PI) * 0.78;
      });

      // Home table pendant lamp gentle sway
      if (this.homePendulum) {
        this.homePendulum.rotation.z = Math.sin(timeSec * 1.25) * 0.06;
      }

      // Golden family tree falling leaves animation
      this.fallingLeaves.forEach((fl, idx) => {
        const c = (timeSec * 0.34 + fl.phase) % 1.0;
        fl.mesh.position.set(
          fl.baseX + Math.sin(c * 6.2 + idx) * 0.55,
          3.85 - c * 3.7,
          fl.baseZ + Math.cos(c * 5.0 + idx) * 0.4
        );
        fl.mesh.rotation.x = timeSec * 1.8 + idx;
        fl.mesh.rotation.z = Math.sin(timeSec * 2.2 + idx) * 0.8;
      });

      // Vanishing bridge planks drifting apart
      this.vanishingPlanks.forEach((vp) => {
        const drift = Math.sin(timeSec * 1.5 + vp.index * 0.7) * 0.28 + vp.index * 0.14;
        vp.mesh.position.set(
          vp.baseX + Math.sin(timeSec * 1.1 + vp.index) * 0.18,
          vp.baseY + drift,
          vp.baseZ + Math.cos(timeSec * 1.3 + vp.index) * 0.22
        );
        vp.mesh.rotation.z = Math.sin(timeSec * 1.4 + vp.index) * 0.25;
        vp.mesh.rotation.x = Math.cos(timeSec * 1.2 + vp.index) * 0.2;
      });

      // Memory silhouette stardust rising
      this.memoryStardust.forEach((ms, idx) => {
        const c = (timeSec * 0.38 + ms.phase) % 1.0;
        ms.sprite.position.set(
          ms.baseX + Math.sin(c * 5.5 + idx) * 0.32,
          ms.baseY + c * 2.8,
          ms.baseZ + Math.cos(c * 4.5 + idx) * 0.25
        );
        ms.sprite.material.opacity = Math.sin(c * Math.PI) * 0.85;
      });

      // Caged dreams & heart-core pulsing inside the glass cage
      this.cagedDreams.forEach((cd) => {
        if (cd.index === 0) {
          const pulse = 1.0 + Math.sin(timeSec * 4.2) * 0.14;
          cd.mesh.scale.set(pulse, pulse, pulse);
          cd.mesh.position.set(0, 2.0 + Math.sin(timeSec * 2.0) * 0.15, 0);
          cd.mesh.rotation.x = Math.PI / 2;
        } else {
          const ang = timeSec * 1.35 + cd.phase * Math.PI * 2;
          const rad = 0.85 + Math.sin(timeSec * 2.1 + cd.index) * 0.35;
          cd.mesh.position.set(
            Math.cos(ang) * rad,
            1.1 + ((timeSec * 0.45 + cd.phase) % 1.0) * 2.1,
            Math.sin(ang) * rad
          );
          cd.mesh.rotation.set(timeSec * 2.0 + cd.index, ang, 0.4);
        }
      });

      // Radiant Present core & orbit rings
      if (this.presentCore) {
        this.presentRipples.forEach((pr, idx) => {
          pr.rotation.y = timeSec * (idx % 2 === 0 ? 0.75 : -0.95);
          pr.rotation.x = Math.sin(timeSec * 0.8 + idx) * 0.55;
        });
      }

      // Procrastination Loop Clock animation
      if (this.clockMinuteHand && this.clockHourHand && this.loopRunner) {
        this.clockMinuteHand.rotation.y = -timeSec * 2.4;
        this.clockHourHand.rotation.y = -timeSec * 0.45;
        const rAng = -timeSec * 1.35;
        this.loopRunner.position.set(
          Math.sin(rAng) * 2.15,
          0.72 + Math.abs(Math.sin(timeSec * 5.0)) * 0.18,
          Math.cos(rAng) * 2.15
        );
      }

      // Silent Thief draining opportunities animation
      this.thiefRings.forEach((tr, idx) => {
        tr.rotation.x = Math.PI / 2 + Math.sin(timeSec * 1.8 + idx) * 0.22;
        tr.rotation.y = timeSec * (idx % 2 === 0 ? 1.1 : -1.3);
      });
      this.thiefDrops.forEach((td) => {
        const c = (timeSec * 0.55 + td.phase) % 1.0;
        const rad = 0.35 + c * 1.65;
        const ang = c * 8.0 + td.index;
        td.mesh.position.set(
          Math.cos(ang) * rad,
          3.4 - c * 3.1,
          Math.sin(ang) * rad
        );
        td.mesh.rotation.set(timeSec * 2.5, ang, 0);
      });

      // Two Runners Starting Line animation
      if (this.actionRunner) {
        const stepP = ((timeSec * 0.38) % 1.0) * 13;
        const stepIdx = Math.floor(stepP);
        const stepH = 0.18 + stepP * 0.26;
        const bounce = Math.abs(Math.sin(timeSec * 4.8)) * 0.26;
        this.actionRunner.position.set(-2.9 + stepP * 0.68, stepH + 0.35 + bounce, -1.35);
        this.actionRunner.rotation.y = timeSec * 2.0 + stepIdx;
      }
      this.hesitationRings.forEach((hr, idx) => {
        hr.rotation.x = timeSec * (idx === 0 ? 1.4 : -1.1);
        hr.rotation.y = timeSec * 0.9;
      });

      // Open Glowing Book & Rising Steps animation
      this.bookPages.forEach((bp) => {
        const c = (timeSec * 0.32 + bp.phase) % 1.0;
        const x = -2.2 + c * 5.8;
        const y = 1.45 + Math.pow(c, 1.15) * 2.8 + Math.sin(c * Math.PI * 4) * 0.14;
        const z = 0.4 - c * 0.9;
        bp.mesh.position.set(x, y, z);
        bp.mesh.rotation.set(Math.sin(timeSec * 2 + bp.index) * 0.25, timeSec * 1.5, -0.2);
      });

      // 19. Chained Heavy Anchors animation
      if (this.chainedSoulCore) {
        this.chainedSoulCore.position.y = 2.85 + Math.sin(timeSec * 2.4) * 0.16;
        this.chainedSoulCore.rotation.y = timeSec * 0.9;
        this.chainedSoulCore.rotation.z = Math.sin(timeSec * 1.8) * 0.12;
      }
      this.chainedBurdens.forEach((cb, idx) => {
        cb.group.position.y = cb.baseY + Math.sin(timeSec * 2.0 + cb.phase) * 0.1;
        cb.group.rotation.y = Math.sin(timeSec * 0.9 + idx) * 0.22;
      });

      // 20. Endless Sisyphus Wall vs Emerald Release animation
      if (this.sisyphusBoulder) {
        const pushCycle = (timeSec * 0.55) % 1.0;
        const climb = Math.sin(pushCycle * Math.PI);
        this.sisyphusBoulder.position.set(-2.6 + climb * 1.45, 0.95 + climb * 0.68, 0);
        this.sisyphusBoulder.rotation.z = -timeSec * 2.6;
      }
      if (this.sisyphusFreeOrb) {
        const freeC = (timeSec * 0.36) % 1.0;
        const s = freeC * 6.0;
        const ang = s * 0.42;
        this.sisyphusFreeOrb.position.set(
          0.85 + s * 0.58,
          1.15 + s * 0.52 + Math.abs(Math.sin(timeSec * 4.2)) * 0.22,
          Math.sin(ang) * 1.1
        );
        this.sisyphusFreeOrb.rotation.y = timeSec * 2.2;
      }

      // 21. Thorny Crimson Rope Grip & Pain Waves animation
      this.thornyGripRings.forEach((fg) => {
        const squeeze = 0.92 + Math.sin(timeSec * 3.8 + fg.index * 0.5) * 0.08;
        fg.group.scale.set(1, squeeze, squeeze);
        fg.group.rotation.x = Math.sin(timeSec * 2.6 + fg.index) * 0.12;
      });
      this.thornyPainWaves.forEach((pw, idx) => {
        const wCycle = (timeSec * 0.9 + idx * 0.33) % 1.0;
        const sc = 0.8 + wCycle * 1.8;
        pw.scale.set(sc, sc, 1);
      });
      this.thornyBloodDrops.forEach((bd) => {
        const dCycle = (timeSec * 0.78 + bd.phase) % 1.0;
        bd.group.position.set(
          bd.baseX + Math.sin(dCycle * 5.0 + bd.phase * 8) * 0.1,
          2.05 - dCycle * 1.95,
          Math.cos(dCycle * 4.0 + bd.phase * 8) * 0.12
        );
        bd.group.rotation.y = timeSec * 3.0;
      });

      // 22. Bloom Lotus to Stone Burden animation
      if (this.bloomLotusGroup) {
        this.bloomLotusGroup.rotation.y = timeSec * 0.55;
        this.bloomLotusGroup.position.y = 1.45 + Math.sin(timeSec * 2.0) * 0.08;
      }
      this.morphingPetals.forEach((mp) => {
        const c = (timeSec * 0.38 + mp.phase) % 1.0;
        const arcX = -2.1 + c * 4.2;
        const arcY = 1.55 + Math.sin(c * Math.PI) * 1.35 - c * 0.35;
        const arcZ = Math.sin(c * Math.PI * 2 + mp.index) * 0.45;
        mp.mesh.position.set(arcX, arcY, arcZ);
        mp.mesh.rotation.set(timeSec * 2.2 + mp.index, timeSec * 1.8, 0);
      });
      this.acceptanceRings.forEach((ar, idx) => {
        ar.rotation.x = Math.PI / 3 + Math.sin(timeSec * 1.2 + idx) * 0.35;
        ar.rotation.y = timeSec * (idx === 0 ? 0.9 : -1.1);
      });

      // 23. Shattered Cage & 3D Flapping Butterflies animation
      this.shatteredBars.forEach((sb) => {
        const drift = 0.25 + Math.sin(timeSec * 1.5 + sb.index) * 0.18;
        sb.mesh.position.set(
          sb.baseX * (1.0 + drift * 0.45),
          sb.baseY + drift * 0.65,
          sb.baseZ * (1.0 + drift * 0.45)
        );
        sb.mesh.rotation.set(
          Math.sin(timeSec * 1.2 + sb.index) * 0.45,
          sb.ang,
          Math.cos(timeSec * 1.1 + sb.index) * 0.45
        );
      });
      this.butterflies.forEach((bf) => {
        const c = (timeSec * 0.28 + bf.phase) % 1.0;
        const spiralAng = c * Math.PI * 4 + bf.index * 0.9;
        const rad = 0.35 + c * 1.85;
        bf.group.position.set(
          Math.cos(spiralAng) * rad,
          0.95 + c * 3.6,
          Math.sin(spiralAng) * rad
        );
        bf.group.rotation.y = -spiralAng + Math.PI / 2;
        const flap = Math.sin(timeSec * 11.0 + bf.index * 1.7) * 0.68;
        bf.leftWing.rotation.z = flap;
        bf.rightWing.rotation.z = -flap;
      });

      // 24. Closing Bronze Door & Opening Emerald Portal animation
      if (this.closingBronzeDoor) {
        this.closingBronzeDoor.rotation.y = Math.max(0.08, 0.95 - segProgress * 0.85);
      }
      if (this.openingEmeraldDoorL && this.openingEmeraldDoorR) {
        const openAngle = 0.35 + Math.min(1.0, segProgress * 1.2) * 0.95;
        this.openingEmeraldDoorL.rotation.y = openAngle;
        this.openingEmeraldDoorR.rotation.y = -openAngle;
      }
      if (this.portalTraveler) {
        const tProg = (timeSec * 0.35) % 1.0;
        const s = tProg * 7.0;
        this.portalTraveler.position.set(
          1.35 + s * 0.28,
          0.65 + s * 0.34 + Math.abs(Math.sin(timeSec * 4.5)) * 0.18,
          0.2 - s * 0.78
        );
        this.portalTraveler.rotation.y = timeSec * 2.0;
      }

      // 25. Crossroads Celestial Compass animation
      this.compassRings.forEach((cr, idx) => {
        cr.rotation.x = Math.sin(timeSec * 0.9 + idx * 1.2) * 0.55;
        cr.rotation.y = timeSec * (idx % 2 === 0 ? 0.85 : -1.05);
      });
      if (this.compassNeedle) {
        this.compassNeedle.rotation.z = 0.55 + Math.sin(timeSec * 1.8) * 0.18;
        this.compassNeedle.rotation.y = timeSec * 0.6;
      }

      // 26. Open Hands & Blooming Dawn Lotus animation
      if (this.openHandL && this.openHandR) {
        const openSpread = Math.sin(timeSec * 1.5) * 0.08 + 0.12;
        this.openHandL.position.x = -1.05 - openSpread;
        this.openHandR.position.x = 1.05 + openSpread;
        this.openHandL.rotation.z = -0.15 - openSpread * 0.5;
        this.openHandR.rotation.z = 0.15 + openSpread * 0.5;
      }
      if (this.dawnLotus) {
        this.dawnLotus.rotation.y = timeSec * 0.65;
        this.dawnLotus.position.y = 2.55 + Math.sin(timeSec * 1.8) * 0.14;
      }
      this.fallingOldShards.forEach((fs, idx) => {
        const c = (timeSec * 0.42 + fs.phase) % 1.0;
        fs.mesh.position.set(
          fs.baseX + Math.sin(c * 5.0 + idx) * 0.25,
          1.25 - c * 1.2,
          fs.baseZ + Math.cos(c * 4.0 + idx) * 0.2
        );
        fs.mesh.rotation.set(timeSec * 2.0 + idx, timeSec * 1.5, 0);
      });
      this.dawnOrbitOrbs.forEach((doOrb) => {
        const ang = timeSec * 0.95 + doOrb.phase * Math.PI * 2;
        const rad = 1.35 + Math.sin(timeSec * 2.0 + doOrb.index) * 0.25;
        doOrb.group.position.set(
          Math.cos(ang) * rad,
          2.45 + Math.sin(ang * 2.0 + doOrb.index) * 0.45,
          0.15 + Math.sin(ang) * rad
        );
      });

      // 27. Noisy Echo Arrows & Judgment Megaphones animation
      if (this.noisyCore) {
        this.noisyCore.rotation.y = timeSec * 1.2;
        this.noisyCore.position.y = 2.2 + Math.sin(timeSec * 3.5) * 0.1;
      }
      this.noisySoundRings.forEach((sr, idx) => {
        sr.rotation.x = timeSec * (idx === 0 ? 1.5 : -1.2) + idx;
        sr.rotation.y = timeSec * (idx % 2 === 0 ? -1.4 : 1.7);
      });
      this.noisyArrows.forEach((na) => {
        const ang = na.baseAng + timeSec * 0.95;
        const jab = 1.95 + Math.sin(timeSec * 5.2 + na.index * 1.3) * 0.45;
        na.group.position.set(
          Math.cos(ang) * jab,
          na.baseY + Math.sin(timeSec * 3.0 + na.index) * 0.2,
          Math.sin(ang) * jab
        );
        na.group.rotation.y = -ang;
      });

      // 28. Chessboard Clash vs Private Story Sanctuary animation
      this.chessClashSparks.forEach((cs) => {
        const c = (timeSec * 0.9 + cs.phase) % 1.0;
        const ang = cs.index * 1.1 + timeSec * 2.0;
        cs.mesh.position.set(
          -1.95 + Math.cos(ang) * (0.2 + c * 0.9),
          1.45 + Math.sin(c * Math.PI) * 0.85,
          0.2 + Math.sin(ang) * (0.2 + c * 0.9)
        );
        cs.mesh.rotation.set(timeSec * 3.0, ang, 0);
      });
      if (this.peaceStoryBook) {
        this.peaceStoryBook.position.y = 1.85 + Math.sin(timeSec * 1.8) * 0.14;
        this.peaceStoryBook.rotation.y = Math.sin(timeSec * 0.8) * 0.35;
      }

      // 29. Silent Mountain Fortress amid Storm Rings animation
      this.mountainStormRings.forEach((mr, idx) => {
        mr.rotation.x = Math.PI / 2 + Math.sin(timeSec * 2.2 + idx) * 0.25;
        mr.rotation.z = timeSec * (idx % 2 === 0 ? 2.2 : -2.5);
      });
      this.mountainSnowOrbs.forEach((so) => {
        const c = (timeSec * 0.35 + so.phase) % 1.0;
        const ang = c * Math.PI * 2 + so.index;
        so.mesh.position.set(
          Math.cos(ang) * (1.2 - c * 0.5),
          1.2 + c * 2.8,
          Math.sin(ang) * (1.2 - c * 0.5)
        );
      });

      // 30. Turbulent Waves vs Crystal-Clear Mirror Lake animation
      this.turbulentWaves.forEach((tw) => {
        tw.mesh.position.set(
          tw.baseX + Math.sin(timeSec * 4.5 + tw.index) * 0.18,
          1.35 + Math.abs(Math.sin(timeSec * 5.5 + tw.index * 0.9)) * 0.55,
          tw.baseZ + Math.cos(timeSec * 4.2 + tw.index) * 0.18
        );
        tw.mesh.rotation.set(
          Math.sin(timeSec * 3.5 + tw.index) * 0.5,
          timeSec * 2.0,
          Math.cos(timeSec * 3.8 + tw.index) * 0.5
        );
      });
      this.calmMirrorRipples.forEach((cr, idx) => {
        const rCycle = (timeSec * 0.45 + idx * 0.33) % 1.0;
        const sc = 0.65 + rCycle * 1.35;
        cr.scale.set(sc, sc, 1);
      });
      if (this.lakeBottomLotus) {
        this.lakeBottomLotus.rotation.y = timeSec * 0.55;
      }

      // 31. Impulsive Emotion Fire Shards vs Zen Sphere animation
      this.emotionSpikes.forEach((es) => {
        const c = (timeSec * 0.85 + es.phase) % 1.0;
        const ang = es.index * 0.63 + timeSec * 1.2;
        const rad = 0.55 + c * 1.15;
        es.mesh.position.set(
          -2.25 + Math.cos(ang) * rad,
          2.0 + Math.sin(ang * 1.5) * rad * 0.65,
          Math.sin(ang) * rad
        );
        es.mesh.rotation.set(ang, timeSec * 3.0, 0);
      });
      this.zenSphereRings.forEach((zr, idx) => {
        zr.rotation.x = timeSec * (idx === 0 ? 0.65 : -0.55) + idx;
        zr.rotation.y = timeSec * (idx % 2 === 0 ? 0.75 : -0.85);
      });

      // 32. Jade Dome Shield deflecting Criticism Darts animation
      if (this.jadeDomeShield) {
        this.jadeDomeShield.rotation.y = timeSec * 0.45;
      }
      if (this.innerSanctuaryTree) {
        this.innerSanctuaryTree.rotation.y = -timeSec * 0.35;
      }
      this.deflectedDarts.forEach((dd) => {
        const c = (timeSec * 0.65 + dd.phase) % 1.0;
        const ang = (dd.index / 10) * Math.PI * 2 + 0.4;
        const dist = c < 0.6 ? 3.5 - c * 2.6 : 1.94 + (c - 0.6) * 2.8;
        const yBounce = c < 0.6 ? 2.4 - c * 0.8 : 1.92 + (c - 0.6) * 1.6;
        dd.mesh.position.set(Math.cos(ang) * dist, yBounce, Math.sin(ang) * dist);
        dd.mesh.rotation.set(c * 4.0, -ang, c < 0.6 ? 1.2 : -1.2);
      });

      // 33. Voice Bell of Truth & Ascending Action Pillars animation
      if (this.truthChimeBell) {
        this.truthChimeBell.rotation.z = Math.sin(timeSec * 2.4) * 0.24;
      }
      this.actionPillars.forEach((ap) => {
        const pulseH = 1.0 + Math.sin(timeSec * 2.2 - ap.index * 0.45) * 0.14;
        ap.mesh.scale.set(1, pulseH, 1);
        ap.mesh.position.y = (ap.baseH * pulseH) / 2;
      });

      // 34. Silent Monument & Constellation Crown animation
      this.silentSpireTiers.forEach((st) => {
        if (st.isCrown) {
          st.mesh.rotation.y = timeSec * 0.95;
          st.mesh.position.y = st.baseY + Math.sin(timeSec * 2.0) * 0.12;
        } else {
          st.mesh.rotation.y = timeSec * (st.index % 2 === 0 ? 0.35 : -0.35);
        }
      });
      this.silentConstellationOrbs.forEach((scOrb) => {
        const ang = timeSec * 0.75 + scOrb.phase * Math.PI * 2;
        const rad = 1.65 + (scOrb.index % 3) * 0.38;
        scOrb.group.position.set(
          Math.cos(ang) * rad,
          1.25 + ((timeSec * 0.25 + scOrb.phase) % 1.0) * 2.6,
          Math.sin(ang) * rad
        );
      });

      // 35. Midnight Smartphone & Shared Planet with Parting Moons animation
      if (this.unsentChatBubble) {
        this.unsentChatBubble.position.y = 2.25 + Math.sin(timeSec * 2.4) * 0.14;
        this.unsentChatBubble.rotation.y = Math.sin(timeSec * 1.4) * 0.22;
      }
      if (this.sharedPlanetCore) {
        this.sharedPlanetCore.rotation.y = timeSec * 0.45;
      }
      this.twinOrbitMoons.forEach((tm) => {
        const ang = timeSec * (tm.index === 0 ? 1.15 : -0.95) + tm.index * Math.PI;
        const rad = 1.4 + tm.index * 0.25;
        tm.group.position.set(
          1.85 + Math.cos(ang) * rad,
          2.15 + Math.sin(ang * 1.5) * 0.45,
          Math.sin(ang) * rad
        );
      });

      // 36. Diverging Twin Galaxies & Floating Memory Gems animation
      this.divergingGems.forEach((dg) => {
        const c = (timeSec * 0.32 + dg.phase) % 1.0;
        const gx = -3.0 + c * 6.0;
        const gz = (dg.index % 2 === 0 ? -1 : 1) * (0.25 + c * 2.2);
        const gy = 1.15 + c * 1.35 + Math.sin(timeSec * 2.5 + dg.index) * 0.22;
        dg.mesh.position.set(gx, gy, gz);
        dg.mesh.rotation.set(timeSec * 1.8 + dg.index, timeSec * 1.4, 0);
      });

      // 37. Unfinished Dream House dissolving blueprint shards animation
      this.unfinishedRoofShards.forEach((rs) => {
        const drift = (Math.sin(timeSec * 1.6 + rs.index * 0.7) + 1) * 0.32;
        rs.mesh.position.set(
          rs.baseX + drift * 0.55,
          rs.baseY + drift * 0.85,
          rs.baseZ + Math.cos(timeSec * 1.3 + rs.index) * 0.22
        );
        rs.mesh.rotation.set(drift * 0.6, timeSec * 0.8 + rs.index, drift * 0.4);
      });

      // 38. Spinning Vinyl Record & Dimming Smartphone Screen animation
      if (this.vinylDisc) {
        this.vinylDisc.rotation.y = timeSec * 1.8;
      }
      this.vinylNotes.forEach((vn) => {
        const c = (timeSec * 0.36 + vn.phase) % 1.0;
        const ang = c * Math.PI * 3 + vn.index;
        const rad = 0.45 + c * 1.15;
        vn.group.position.set(
          -1.75 + Math.cos(ang) * rad,
          1.75 + c * 2.2,
          Math.sin(ang) * rad
        );
      });
      if (this.dimmingScreenGlow) {
        const pulse = Math.max(0.12, 1.0 - segProgress * 0.78 + Math.sin(timeSec * 4.0) * 0.08);
        this.dimmingScreenGlow.scale.set(1, pulse, 1);
      }

      // 39. Paper Boats Drifting & Rising on Star-River animation
      this.paperBoats.forEach((pb) => {
        const c = (timeSec * 0.25 + pb.phase) % 1.0;
        const bx = -3.4 + c * 6.8;
        const bz = Math.sin(c * Math.PI * 2 + pb.index * 0.5) * 0.75;
        const by = 0.35 + (c > 0.45 ? Math.pow(c - 0.45, 1.4) * 3.2 : Math.sin(timeSec * 3.0 + pb.index) * 0.08);
        pb.group.position.set(bx, by, bz);
        pb.group.rotation.y = Math.cos(c * Math.PI * 2) * 0.25;
      });

      // 40. Rose of Love feeding Crystal Tree of Maturity animation
      this.loveToTreePetals.forEach((lp) => {
        const c = (timeSec * 0.38 + lp.phase) % 1.0;
        const px = -2.1 + c * 3.95;
        const py = 1.55 + Math.sin(c * Math.PI) * 1.25 + c * 0.65;
        const pz = Math.sin(c * Math.PI * 2 + lp.index) * 0.45;
        lp.mesh.position.set(px, py, pz);
        lp.mesh.rotation.set(timeSec * 2.0 + lp.index, timeSec * 1.5, 0);
      });

      // 41. Two Peaceful Lantern Bridges animation
      this.peaceBridgeSouls.forEach((ps) => {
        const u = (timeSec * 0.26 + ps.index * 0.5) % 1.0;
        const dir = ps.index === 0 ? 1 : -1;
        const bx = dir * (-2.8 + u * 5.6);
        const by = 0.72 + Math.sin(u * Math.PI) * 1.45;
        ps.group.position.set(bx, by, ps.zOff);
      });
      this.peaceLanterns.forEach((pl, idx) => {
        const c = (timeSec * 0.28 + pl.phase) % 1.0;
        pl.group.position.set(
          pl.baseX + Math.sin(c * 4.0 + idx) * 0.22,
          0.65 + c * 3.1,
          pl.baseZ
        );
      });

      // 42. Parallel Starlight Roads & Still-Loving Heart animation
      if (this.stillLovingHeart) {
        const beat = 1.0 + Math.sin(timeSec * 4.2) * 0.1;
        this.stillLovingHeart.scale.set(beat, beat, beat);
        this.stillLovingHeart.rotation.y = timeSec * 0.75;
      }
      if (this.parallelTravelerL && this.parallelTravelerR) {
        const u = (timeSec * 0.28) % 1.0;
        const ty = 0.65 + u * 2.15 + Math.abs(Math.sin(timeSec * 4.0)) * 0.14;
        const tz = 2.2 - u * 5.8;
        this.parallelTravelerL.position.set(-1.65, ty, tz);
        this.parallelTravelerR.position.set(1.65, ty, tz);
      }

      // 43. Earth Billions & Two Destined Souls animation
      if (this.earthBillionsGlobe) {
        this.earthBillionsGlobe.rotation.y = timeSec * 0.45;
      }
      this.destinedSoulPair.forEach((ds) => {
        const ang = timeSec * 1.15 + ds.index * Math.PI;
        ds.group.position.set(
          Math.cos(ang) * 0.85,
          3.15 + Math.sin(timeSec * 2.5 + ds.index) * 0.12,
          Math.sin(ang) * 0.85
        );
      });
      this.fadingIllusionTokens.forEach((ft) => {
        const c = (timeSec * 0.35 + ft.phase) % 1.0;
        const ang = ft.index * 0.7 + timeSec * 0.6;
        const rad = 1.85 + c * 1.2;
        ft.mesh.position.set(Math.cos(ang) * rad, 1.8 - c * 1.5, Math.sin(ang) * rad);
        ft.mesh.rotation.set(timeSec * 2.0, ang, 0);
      });

      // 44. Sweet Beginnings Constellation Icons animation
      this.sweetBeginningIcons.forEach((sb) => {
        const ang = timeSec * 0.65 + sb.phase * Math.PI * 2;
        const rad = 1.65 + (sb.index % 2) * 0.45;
        sb.group.position.set(
          Math.cos(ang) * rad,
          1.65 + Math.sin(timeSec * 2.0 + sb.index) * 0.45,
          Math.sin(ang) * rad * 0.65
        );
        sb.group.rotation.y = -ang;
      });

      // 45. Storm Imperfect Days & Tangled Knot animation
      this.stormRainDrops.forEach((sr, idx) => {
        const c = (timeSec * 0.95 + sr.phase) % 1.0;
        sr.mesh.position.set(sr.baseX, 2.25 - c * 1.85, (idx % 2 === 0 ? 0.2 : -0.2));
      });
      this.stormMisunderstandingRings.forEach((mr, idx) => {
        mr.rotation.x = timeSec * (idx % 2 === 0 ? 1.4 : -1.2) + idx;
        mr.rotation.y = timeSec * (idx === 0 ? -1.5 : 1.3);
      });

      // 46. Empathy Sadness Core & Kintsugi Mending Heart animation
      if (this.empathySadnessCore) {
        this.empathySadnessCore.position.y = 1.95 + Math.sin(timeSec * 2.2) * 0.12;
        this.empathySadnessCore.rotation.y = Math.sin(timeSec * 0.9) * 0.3;
      }
      if (this.kintsugiHeart) {
        const pulse = 1.0 + Math.sin(timeSec * 3.6) * 0.08;
        this.kintsugiHeart.scale.set(pulse, pulse, pulse);
        this.kintsugiHeart.rotation.y = timeSec * 0.65;
      }

      // 47. Listening Table Soundwaves animation
      this.listeningWaves.forEach((lw, idx) => {
        lw.rotation.x = Math.PI / 2 + Math.sin(timeSec * 1.5 + idx) * 0.25;
        lw.rotation.z = timeSec * (idx % 2 === 0 ? 0.8 : -0.8);
      });

      // 48. Ephemeral Fireworks vs Steadfast Lighthouse Beam animation
      this.ephemeralFireworks.forEach((ef) => {
        const c = (timeSec * 0.75 + ef.phase) % 1.0;
        const ang = ef.index * 0.63 + timeSec * 0.8;
        const rad = 0.2 + c * 1.45;
        ef.mesh.position.set(
          -2.15 + Math.cos(ang) * rad,
          2.35 + Math.sin(ang) * rad * 0.8 - c * c * 0.9,
          Math.sin(ang * 2) * 0.6
        );
        const sc = Math.sin(c * Math.PI);
        ef.mesh.scale.set(sc, sc, sc);
      });
      if (this.lighthouseBeam) {
        this.lighthouseBeam.rotation.y = Math.sin(timeSec * 1.1) * 0.55;
      }

      // 49. Mutual Respect Pillars Energy Orbs animation
      this.mutualEnergyOrbs.forEach((me) => {
        const c = (timeSec * 0.48 + me.phase) % 1.0;
        const ang = c * Math.PI * 0.5;
        const dir = me.isLeft ? -1 : 1;
        const ex = dir * Math.cos(ang) * 1.55;
        const ey = c < 0.5 ? c * 4.7 : 2.35 + Math.sin((c - 0.5) * Math.PI) * 1.55;
        me.mesh.position.set(ex, ey, Math.sin(c * Math.PI * 2) * 0.2);
      });

      // 50. Two Imperfect Puzzle Spheres Completing Each Other animation
      if (this.imperfectHalfL && this.imperfectHalfR) {
        const sway = Math.sin(timeSec * 1.8) * 0.14;
        this.imperfectHalfL.position.x = -0.28 - Math.abs(sway);
        this.imperfectHalfR.position.x = 0.28 + Math.abs(sway);
        this.imperfectHalfL.rotation.y = timeSec * 0.55;
        this.imperfectHalfR.rotation.y = timeSec * 0.55;
      }

      // 51. Ordinary Days Boulevard Walk animation
      if (this.ordinaryWalkCouple) {
        const u = (timeSec * 0.22) % 1.0;
        const wy = 0.55 + u * 1.45 + Math.abs(Math.sin(timeSec * 4.2)) * 0.12;
        const wz = 2.2 - u * 5.2;
        this.ordinaryWalkCouple.position.set(0, wy, wz);
      }
      this.ordinaryLanternOrbs.forEach((ol, idx) => {
        const c = (timeSec * 0.3 + ol.phase) % 1.0;
        ol.mesh.position.set(
          (idx % 2 === 0 ? -1.85 : 1.85) + Math.sin(c * 5.0 + idx) * 0.25,
          0.85 + c * 2.6,
          1.8 - (idx % 5) * 1.1
        );
      });

      // 52. Silent Bed & Dropped Bag animation
      if (this.silentBedSoul) {
        this.silentBedSoul.position.y = 1.38 + Math.sin(timeSec * 1.6) * 0.04;
      }
      this.tiredBatteryRings.forEach((tr, idx) => {
        tr.rotation.z = timeSec * (idx % 2 === 0 ? 0.55 : -0.45);
        tr.position.y = 2.35 + idx * 0.22 + Math.sin(timeSec * 2.0 + idx) * 0.06;
      });

      // 53. Dawn Rush & Deadline Storm animation
      this.dawnCommuters.forEach((dc) => {
        const c = (timeSec * 0.55 + dc.phase) % 1.0;
        dc.mesh.position.set(
          -3.2 + c * 3.6,
          0.55 + Math.abs(Math.sin(timeSec * 6.0 + dc.index)) * 0.16,
          0.85 + (dc.index % 3 - 1) * 0.45
        );
        dc.mesh.rotation.y = timeSec * 2.0;
      });
      if (this.deadlineClockHands.length >= 2) {
        this.deadlineClockHands[0].rotation.z = -timeSec * 3.2;
        this.deadlineClockHands[1].rotation.z = -timeSec * 0.85;
      }
      this.deadlineStormRings.forEach((sr, idx) => {
        sr.rotation.x = Math.sin(timeSec * 1.8 + idx) * 0.55;
        sr.rotation.y = timeSec * (idx % 2 === 0 ? 1.5 : -1.3);
      });

      // 54. Bills & Family Expectations animation
      this.billTablets.forEach((bt) => {
        const ang = bt.index * 0.9 + timeSec * 0.65;
        bt.group.position.set(
          -1.85 + Math.cos(ang) * 0.45,
          1.15 + bt.index * 0.42 + Math.sin(timeSec * 2.2 + bt.index) * 0.12,
          0.4 + Math.sin(ang) * 0.65
        );
        bt.group.rotation.y = Math.sin(timeSec * 1.2 + bt.index) * 0.35;
      });
      this.familyHopeOrbs.forEach((fh) => {
        const ang = timeSec * 0.75 + fh.phase * Math.PI * 2;
        fh.group.position.set(
          1.75 + Math.cos(ang) * 0.65,
          1.35 + fh.index * 0.32 + Math.sin(timeSec * 2.0 + fh.index) * 0.14,
          Math.sin(ang) * 0.65
        );
      });
      if (this.perseveringWalker) {
        const u = (timeSec * 0.28) % 1.0;
        const stepS = u * 8.0;
        this.perseveringWalker.position.set(
          0,
          0.55 + stepS * 0.24 + Math.abs(Math.sin(timeSec * 4.5)) * 0.14,
          1.8 - stepS * 0.55
        );
        this.perseveringWalker.rotation.y = timeSec * 1.8;
      }

      // 55. Smiling Mask ("Ổn mà") & Hidden Sleepless Tears animation
      if (this.smilingMaskFront) {
        this.smilingMaskFront.position.y = 2.15 + Math.sin(timeSec * 1.8) * 0.08;
        this.smilingMaskFront.rotation.y = Math.sin(timeSec * 0.9) * 0.14;
      }
      this.hiddenSleeplessTears.forEach((ht) => {
        const c = (timeSec * 0.65 + ht.phase) % 1.0;
        const ang = c * Math.PI * 3 + ht.index;
        const rad = 0.45 + (ht.index % 3) * 0.38;
        ht.mesh.position.set(
          Math.cos(ang) * rad,
          3.15 - c * 2.6,
          -0.65 + Math.sin(ang) * rad * 0.65
        );
        ht.mesh.rotation.set(timeSec * 2.4, ang, 0);
      });

      // 56. Walking Through Unresolved Maze animation
      this.unresolvedMazeBlocks.forEach((mb) => {
        mb.mesh.position.y = mb.baseY + Math.sin(timeSec * 1.8 + mb.index) * 0.25;
        mb.mesh.rotation.y = Math.sin(timeSec * 0.9 + mb.index) * 0.22;
      });
      if (this.mazeWalkerSoul) {
        const u = (timeSec * 0.26) % 1.0;
        this.mazeWalkerSoul.position.set(
          0,
          1.05 + Math.abs(Math.sin(timeSec * 4.2)) * 0.12,
          2.2 - u * 4.8
        );
        this.mazeWalkerSoul.rotation.y = timeSec * 1.6;
      }

      // 57. Not a Machine — Beating Human Heart & Essential Check Stars animation
      this.partingMachineGears.forEach((pg) => {
        pg.group.rotation.z = timeSec * pg.dir * 0.65;
        pg.group.position.x = pg.dir * (1.65 + Math.sin(timeSec * 1.4) * 0.22);
      });
      if (this.beatingHumanHeart) {
        const beat = 1.0 + Math.sin(timeSec * 4.5) * 0.11;
        this.beatingHumanHeart.scale.set(beat, beat, beat);
        this.beatingHumanHeart.rotation.y = timeSec * 0.7;
      }
      this.essentialCheckStars.forEach((cs) => {
        const ang = timeSec * 0.8 + cs.phase * Math.PI * 2;
        cs.group.position.set(
          Math.cos(ang) * 1.55,
          2.15 + Math.sin(ang * 2.0 + cs.index) * 0.55,
          0.25 + Math.sin(ang) * 0.85
        );
      });

      // 58. One Bad Day Tile vs Radiant Mosaic of Whole Self-Worth animation
      this.mosaicLifeTiles.forEach((mt) => {
        mt.mesh.position.y =
          (mt.isBadDayTile ? 0.22 : 0.42) + Math.sin(timeSec * 2.2 + mt.index * 0.5) * 0.1;
      });
      if (this.identityWorthCore) {
        this.identityWorthCore.rotation.y = timeSec * 0.75;
        this.identityWorthCore.position.y = 2.35 + Math.sin(timeSec * 2.0) * 0.12;
      }

      // 59. Rest & Recharge Sanctuary animation
      this.rechargeEnergyRings.forEach((er) => {
        const c = (timeSec * 0.42 + er.phase) % 1.0;
        er.mesh.position.set(0, 0.55 + c * 2.15, 0);
        const sc = 0.85 + Math.sin(c * Math.PI) * 0.25;
        er.mesh.scale.set(sc, sc, 1);
      });
      this.sanctuaryCareOrbs.forEach((co) => {
        const ang = timeSec * 0.65 + co.phase * Math.PI * 2;
        co.group.position.set(
          Math.cos(ang) * 1.85,
          1.75 + Math.sin(timeSec * 2.0 + co.index) * 0.35,
          Math.sin(ang) * 1.85
        );
        co.group.rotation.y = -ang;
      });

      // 60. Work for Life & Love Yourself Heart-Crown animation
      if (this.selfLoveHeartCrown) {
        const pulse = 1.0 + Math.sin(timeSec * 3.8) * 0.09;
        this.selfLoveHeartCrown.scale.set(pulse, pulse, pulse);
        this.selfLoveHeartCrown.rotation.y = timeSec * 0.65;
      }
      this.lifeGardenPetals.forEach((lp) => {
        const c = (timeSec * 0.32 + lp.phase) % 1.0;
        const ang = c * Math.PI * 3 + lp.index;
        const rad = 0.65 + c * 1.75;
        lp.mesh.position.set(
          Math.cos(ang) * rad,
          0.65 + c * 3.1,
          Math.sin(ang) * rad
        );
        lp.mesh.rotation.set(timeSec * 2.0, ang, 0);
      });

      // 61. Lotus from Mud & Diamond under Pressure animation
      if (this.mudLotusBloom) {
        this.mudLotusBloom.rotation.y = timeSec * 0.55;
        this.mudLotusBloom.position.y = 1.35 + Math.sin(timeSec * 2.0) * 0.08;
      }
      if (this.forgedDiamondCore) {
        this.forgedDiamondCore.rotation.y = -timeSec * 0.85;
        const pulse = 1.0 + Math.sin(timeSec * 3.5) * 0.08;
        this.forgedDiamondCore.scale.set(pulse, pulse, pulse);
      }
      this.diamondPressureRings.forEach((pr, idx) => {
        pr.rotation.x = timeSec * (idx % 2 === 0 ? 1.2 : -1.0) + idx;
        pr.rotation.y = timeSec * 0.9;
      });

      // 62. Rising from Stumble Steps animation
      if (this.risingResilientSoul) {
        const u = (timeSec * 0.32) % 1.0;
        const s = u * 8.0;
        this.risingResilientSoul.position.set(
          -1.1 + s * 0.58,
          0.88 + s * 0.34 + Math.abs(Math.sin(timeSec * 4.8)) * 0.16,
          0.45 - s * 0.28
        );
        this.risingResilientSoul.rotation.y = timeSec * 2.0;
      }

      // 63. Endless Rain & High Walls animation
      this.endlessRainShafts.forEach((rs) => {
        const c = (timeSec * 1.15 + rs.phase) % 1.0;
        rs.mesh.position.set(rs.baseX, 3.6 - c * 3.4, rs.baseZ);
      });
      this.selfDoubtRings.forEach((dr, idx) => {
        dr.rotation.x = timeSec * (idx === 0 ? 1.5 : -1.3);
        dr.rotation.y = timeSec * 1.1;
      });

      // 64. Seed Breaks Shell to Mighty Tree animation
      if (this.seedSproutCore) {
        this.seedSproutCore.position.y = 1.35 + Math.sin(timeSec * 2.4) * 0.14;
        this.seedSproutCore.rotation.y = timeSec * 0.9;
      }
      this.mightyTreeCanopyOrbs.forEach((co) => {
        co.group.position.y = co.baseY + Math.sin(timeSec * 2.0 + co.index) * 0.1;
        co.group.rotation.y = timeSec * 0.45;
      });

      // 65. Ship Sailing Stormy Ocean animation
      this.oceanStormWaves.forEach((ow) => {
        ow.mesh.position.y = 0.28 + Math.sin(timeSec * 3.2 + ow.index * 0.65) * 0.18;
        ow.mesh.rotation.z = Math.cos(timeSec * 2.8 + ow.index * 0.65) * 0.12;
      });
      if (this.stormSailingShip) {
        this.stormSailingShip.position.y = 1.18 + Math.sin(timeSec * 2.8) * 0.16;
        this.stormSailingShip.rotation.z = Math.sin(timeSec * 2.2) * 0.12;
        this.stormSailingShip.rotation.x = Math.cos(timeSec * 1.8) * 0.08;
      }

      // 66. Resilience Light in Darkness & Golden Scar Rings animation
      if (this.resiliencePhoenixCore) {
        const beat = 1.0 + Math.sin(timeSec * 3.8) * 0.1;
        this.resiliencePhoenixCore.scale.set(beat, beat, beat);
        this.resiliencePhoenixCore.rotation.y = timeSec * 0.75;
      }
      this.goldenScarRings.forEach((sr, idx) => {
        sr.rotation.x = Math.sin(timeSec * 1.1 + idx) * 0.85;
        sr.rotation.y = timeSec * (idx % 2 === 0 ? 0.95 : -0.85);
      });

      // 67. Rugged Mountain Ridge to New Horizon animation
      if (this.mountainClimberSoul) {
        const u = (timeSec * 0.28) % 1.0;
        const cx = -2.6 + u * 4.8;
        const cy = 0.75 + Math.pow(u, 1.25) * 2.35 + Math.abs(Math.sin(timeSec * 4.5)) * 0.15;
        const cz = 1.1 - u * 2.0;
        this.mountainClimberSoul.position.set(cx, cy, cz);
      }
      if (this.horizonSummitStar) {
        this.horizonSummitStar.rotation.y = timeSec * 0.85;
        this.horizonSummitStar.position.y = 3.15 + Math.sin(timeSec * 2.2) * 0.12;
      }

      // 68. Parting Storm Clouds & Eternal Blue Sky Worth Core animation
      if (this.partingStormCloudL && this.partingStormCloudR) {
        const spread = 1.45 + Math.min(1.0, segProgress * 1.2) * 0.95 + Math.sin(timeSec * 1.5) * 0.1;
        this.partingStormCloudL.position.x = -spread;
        this.partingStormCloudR.position.x = spread;
      }
      if (this.eternalBlueSkyCore) {
        this.eternalBlueSkyCore.rotation.y = timeSec * 0.7;
        this.eternalBlueSkyCore.position.y = 2.25 + Math.sin(timeSec * 2.0) * 0.1;
      }

      // 69. Proud Flower Blooming in Storm animation
      if (this.proudStormFlower) {
        this.proudStormFlower.rotation.y = timeSec * 0.6;
        const bloomPulse = 1.0 + Math.sin(timeSec * 3.2) * 0.07;
        this.proudStormFlower.scale.set(bloomPulse, bloomPulse, bloomPulse);
      }
      this.tempestWindRibbons.forEach((wr, idx) => {
        wr.rotation.x = Math.PI / 2 + Math.sin(timeSec * 2.0 + idx) * 0.28;
        wr.rotation.z = timeSec * (idx % 2 === 0 ? 1.8 : -2.1);
      });

      // 70. Slipping Treasure from Hand animation
      if (this.slippingTreasureChar) {
        this.slippingTreasureChar.position.y = 0.14 + Math.sin(timeSec * 2.2) * 0.04;
        if (this.slippingTreasureChar.userData && this.slippingTreasureChar.userData.armR) {
          this.slippingTreasureChar.userData.armR.rotation.z = -1.25 + Math.sin(timeSec * 3.0) * 0.14;
        }
      }
      if (this.slippingHeartGem) {
        const drift = (Math.sin(timeSec * 1.4) + 1) * 0.45;
        this.slippingHeartGem.position.set(
          0.82 + drift * 0.85,
          1.65 + drift * 0.45,
          Math.sin(timeSec * 2.0) * 0.18
        );
        this.slippingHeartGem.rotation.y = timeSec * 0.95;
      }
      this.slippingBadges.forEach((b, idx) => {
        b.position.y = (idx === 0 ? 2.45 : 2.55) + Math.sin(timeSec * 2.0 + idx) * 0.06;
      });

      // 71. Youth Illusion of Endless Time & Missed Family Dinner animation
      if (this.youthPhoneChar) {
        this.youthPhoneChar.position.y = 0.14 + Math.sin(timeSec * 2.4) * 0.04;
      }
      this.youthMissedBadges.forEach((b, idx) => {
        b.position.y = 2.42 + Math.sin(timeSec * 2.5 + idx * 1.2) * 0.06;
      });

      // 72. Three Irreversible Losses 3-Panel Storyboard animation
      this.lossCardTears.forEach((td) => {
        const c = (timeSec * 0.75 + td.index * 0.33) % 1.0;
        td.mesh.position.set(
          0.16 + (td.index - 1) * 0.12,
          -0.2 - c * 0.65,
          0.12
        );
      });
      if (this.lossCardTrain) {
        const trainC = (timeSec * 0.45) % 1.0;
        this.lossCardTrain.position.set(-0.35 + trainC * 0.7, -0.05, 0.08);
      }
      this.lossCardWords.forEach((sw) => {
        const c = (timeSec * 0.42 + sw.index * 0.33) % 1.0;
        sw.mesh.position.set(
          -0.25 + sw.index * 0.28,
          0.22 + c * 0.45,
          0.1
        );
        sw.mesh.rotation.z = Math.sin(timeSec * 2.8 + sw.index) * 0.15;
      });

      // 73. Chasing Distant Mirage vs Neglected Warm Home animation
      if (this.mirageRunnerChar) {
        const runBounce = Math.abs(Math.sin(timeSec * 5.2)) * 0.12;
        this.mirageRunnerChar.position.set(
          -0.15 + ((timeSec * 0.35) % 1.0) * 0.85,
          0.14 + runBounce,
          0.15
        );
      }
      this.mirageFloatingIcons.forEach((mi) => {
        mi.mesh.position.set(
          0.95 + (mi.index - 1) * 0.28,
          1.25 + mi.index * 0.52 + Math.sin(timeSec * 2.2 + mi.index) * 0.08,
          0.25
        );
      });

      // 74. True Success Checklist Balance animation
      if (this.checklistHeroChar) {
        this.checklistHeroChar.position.y = 0.14 + Math.sin(timeSec * 2.2) * 0.05;
      }
      this.checklistCards3D.forEach((cb) => {
        cb.mesh.position.y = cb.baseY + Math.sin(timeSec * 2.2 + cb.index * 0.8) * 0.06;
        cb.mesh.rotation.y = Math.sin(timeSec * 1.1 + cb.index) * 0.08;
      });

      // 75. Cherish Parents & Loved Ones Now + 5-Dot Progress Bar animation
      this.cherishNowChars.forEach((ch, idx) => {
        ch.position.y = 0.14 + Math.sin(timeSec * 2.2 + idx * 0.8) * 0.04;
      });
      const activeDotCount = Math.floor(((timeSec * 0.85) % 1.0) * 6);
      this.cherishProgressDots.forEach((dotMesh, idx) => {
        const isLit = idx <= activeDotCount;
        const sc = isLit ? 1.28 : 0.82;
        dotMesh.scale.set(sc, sc, sc);
      });

      // 76. Silent River of Time Hourglass & Drifting Calendar Pages animation
      if (this.silentTimeChar) {
        this.silentTimeChar.position.y = 0.14 + Math.sin(timeSec * 2.0) * 0.04;
      }
      this.silentTimePages.forEach((cp) => {
        const c = (timeSec * 0.28 + cp.phase) % 1.0;
        const px = 0.65 + c * 1.85;
        const py = 1.15 + c * 1.35 + Math.sin(timeSec * 2.2 + cp.index) * 0.12;
        const pz = 0.25 + Math.sin(c * Math.PI * 2 + cp.index) * 0.35;
        cp.mesh.position.set(px, py, pz);
        cp.mesh.rotation.z = Math.sin(timeSec * 1.6 + cp.index) * 0.22;
      });

      // 77. Existing vs Truly Living Awakening — Dropping Regret Block & Sunrise Rays animation
      if (this.droppedExistBlock) {
        const dropC = Math.min(1.0, segProgress * 1.35);
        this.droppedExistBlock.position.y = 0.58 - dropC * 0.22;
        this.droppedExistBlock.rotation.z = 0.22 + dropC * 0.18;
      }
      if (this.trulyLivingChar) {
        this.trulyLivingChar.position.y = 0.14 + Math.sin(timeSec * 2.4) * 0.04;
      }
      if (this.sunriseRaysGroup) {
        this.sunriseRaysGroup.rotation.z = timeSec * 0.45;
        const sunPulse = 1.0 + Math.sin(timeSec * 3.0) * 0.08;
        this.sunriseRaysGroup.scale.set(sunPulse, sunPulse, sunPulse);
      }

      // 78. Surface Judgment Scale & Magnifier animation
      if (this.surfaceScaleBeam) {
        this.surfaceScaleBeam.rotation.z = Math.sin(timeSec * 1.8) * 0.12;
      }
      if (this.surfaceMagnifier) {
        this.surfaceMagnifier.position.y = 2.35 + Math.sin(timeSec * 2.2) * 0.06;
        this.surfaceMagnifier.rotation.z = Math.sin(timeSec * 1.2) * 0.1;
      }
      if (this.surfaceJudgeCharR) {
        this.surfaceJudgeCharR.position.y = 0.14 + Math.sin(timeSec * 2.0) * 0.04;
      }

      // 79. Three Hasty Labels Cards animation
      this.hastyLabelsCards.forEach((cGroup, idx) => {
        cGroup.position.y = 1.75 + Math.sin(timeSec * 2.1 + idx * 0.9) * 0.05;
        cGroup.rotation.y = Math.sin(timeSec * 1.2 + idx * 0.7) * 0.06;
      });

      // 80. Calm Surface Hidden Tempest Iceberg animation
      if (this.calmPersonChar) {
        this.calmPersonChar.position.y = 1.05 + Math.sin(timeSec * 2.0) * 0.04;
      }
      if (this.hiddenScarsMesh) {
        this.hiddenScarsMesh.rotation.y = timeSec * 0.45;
        this.hiddenScarsMesh.position.y = 0.45 + Math.sin(timeSec * 1.5) * 0.05;
      }

      // 81. Two Starting Lines & Heavy Backpack animation
      this.twoStartRunners.forEach((runner, idx) => {
        runner.position.y = (idx === 0 ? 0.16 : 0.42) + Math.sin(timeSec * (idx === 0 ? 2.5 : 1.8)) * 0.04;
      });
      if (this.heavyBackpackMesh) {
        this.heavyBackpackMesh.rotation.y = Math.sin(timeSec * 1.5) * 0.12;
      }

      // 82. Own Clock Unique Timeline animation
      this.uniqueClockHands.forEach((ch) => {
        if (ch.pivotHour) ch.pivotHour.rotation.z = -timeSec * 0.8 * ch.speed;
        if (ch.pivotMin) ch.pivotMin.rotation.z = -timeSec * 3.5 * ch.speed;
      });

      // 83. Tree Deep Roots Underground animation
      if (this.deepRootsTree) {
        this.deepRootsTree.rotation.y = Math.sin(timeSec * 0.5) * 0.08;
      }
      this.deepRootSprouts.forEach((root, idx) => {
        root.rotation.z = (idx - 2) * 0.25 + Math.sin(timeSec * 2.0 + idx) * 0.04;
      });

      // 84. Silent Preparation Slingshot Run animation
      if (this.slingshotBowMesh) {
        const bowTension = 1.0 + Math.sin(timeSec * 3.0) * 0.06;
        this.slingshotBowMesh.scale.set(bowTension, 1.0, bowTension);
      }
      if (this.preppingArcherChar) {
        this.preppingArcherChar.position.y = 0.14 + Math.sin(timeSec * 2.2) * 0.04;
        this.preppingArcherChar.rotation.y = 0.55 + Math.sin(timeSec * 1.5) * 0.05;
      }

      // 85. Value in Perseverance Climb animation
      if (this.perseveranceHeroChar) {
        const stepCycle = (timeSec * 0.6) % 1.0;
        const currentStep = Math.min(4, Math.floor(stepCycle * 5));
        this.perseveranceHeroChar.position.x = -1.0 + currentStep * 0.5;
        this.perseveranceHeroChar.position.y = 0.95 + currentStep * 0.35 + Math.sin(timeSec * 4.0) * 0.04;
      }

      // 86. Empathy Walk Horizon Outro animation
      if (this.empathyHorizonGateway) {
        this.empathyHorizonGateway.rotation.y = timeSec * 0.35;
        const gatePulse = 1.0 + Math.sin(timeSec * 2.5) * 0.06;
        this.empathyHorizonGateway.scale.set(gatePulse, gatePulse, gatePulse);
      }
      if (this.empathyWalkHero) {
        this.empathyWalkHero.position.y = 0.14 + Math.sin(timeSec * 2.4) * 0.05;
        this.empathyWalkHero.rotation.y = Math.sin(timeSec * 0.8) * 0.12;
      }


      // 87. Self Reflection Mirror & Pause animation
      if (this.selfMirrorMesh) {
        this.selfMirrorMesh.position.y = 1.65 + Math.sin(timeSec * 2.0) * 0.04;
        this.selfMirrorMesh.rotation.y = Math.sin(timeSec * 0.8) * 0.08;
      }
      if (this.selfReflectionChar) {
        this.selfReflectionChar.position.y = 0.14 + Math.sin(timeSec * 1.8) * 0.03;
      }

      // 88. Blame Pointing Arrows vs Central Shield animation
      if (this.blameShield) {
        this.blameShield.rotation.z = timeSec * 0.6;
      }
      this.blameArrows.forEach((arr, idx) => {
        const arrPulse = 1.0 + Math.sin(timeSec * 3.5 + idx * 0.8) * 0.12;
        arr.scale.set(arrPulse, arrPulse, arrPulse);
      });
      if (this.blameChar) {
        this.blameChar.position.y = 0.14 + Math.sin(timeSec * 2.2) * 0.03;
      }

      // 89. Victim Comfort Cage Breaking animation
      if (this.victimCageMesh) {
        const breakPulse = 1.0 + Math.sin(timeSec * 2.8) * 0.05;
        this.victimCageMesh.scale.set(breakPulse, 1.0, breakPulse);
        this.victimCageMesh.rotation.y = Math.sin(timeSec * 0.6) * 0.06;
      }
      if (this.victimChar) {
        this.victimChar.position.y = 0.14 + Math.sin(timeSec * 2.0) * 0.04;
      }

      // 90. Past Shadow vs Today Responsibility animation
      if (this.pastShadowMesh) {
        this.pastShadowMesh.position.y = 1.45 + Math.sin(timeSec * 1.5) * 0.06;
        this.pastShadowMesh.rotation.y = timeSec * 0.3;
      }
      if (this.presentHeroChar) {
        this.presentHeroChar.position.y = 0.14 + Math.sin(timeSec * 2.2) * 0.04;
      }

      // 91. Solitary Standing Pillar Strength animation
      this.solitaryRings.forEach((rg, idx) => {
        rg.rotation.z = timeSec * (idx % 2 === 0 ? 0.8 : -0.8);
      });
      if (this.solitaryChar) {
        this.solitaryChar.position.y = 1.32 + Math.sin(timeSec * 2.0) * 0.03;
      }

      // 92. Ocean Ship Firm Helm Hands animation
      if (this.firmHelmMesh) {
        this.firmHelmMesh.rotation.z = Math.sin(timeSec * 1.4) * 0.35;
      }
      if (this.captainChar) {
        this.captainChar.position.y = 0.14 + Math.sin(timeSec * 2.5) * 0.04;
      }

      // 93. Golden Key Future Portal Gateway animation
      if (this.goldenKeyMesh) {
        this.goldenKeyMesh.position.y = 1.55 + Math.sin(timeSec * 2.2) * 0.06;
        this.goldenKeyMesh.rotation.z = Math.sin(timeSec * 1.2) * 0.1;
      }
      if (this.futurePortalGateway) {
        this.futurePortalGateway.rotation.y = Math.sin(timeSec * 0.6) * 0.12;
      }
      if (this.keyBearerChar) {
        this.keyBearerChar.position.y = 0.14 + Math.sin(timeSec * 2.0) * 0.04;
      }

      // 94. Origin Valley to Summit Peak animation
      if (this.summitStarMesh) {
        this.summitStarMesh.rotation.y = timeSec * 1.2;
        this.summitStarMesh.rotation.z = timeSec * 0.8;
      }
      if (this.mountainClimberChar) {
        this.mountainClimberChar.position.y = 0.35 + Math.sin(timeSec * 2.5) * 0.05;
      }

      // 95. Brick-by-Brick Golden Bridge animation
      this.brickBridgeBlocks.forEach((bk, idx) => {
        bk.position.y = 0.35 + idx * 0.18 + Math.sin(timeSec * 2.2 + idx * 0.6) * 0.03;
      });
      if (this.bridgeBuilderChar) {
        this.bridgeBuilderChar.position.y = 0.82 + Math.sin(timeSec * 2.4) * 0.04;
      }

      // 96. Own Hero Crown of Courage Awakening animation
      if (this.heroCrownMesh) {
        this.heroCrownMesh.position.y = 1.85 + Math.sin(timeSec * 2.0) * 0.05;
        this.heroCrownMesh.rotation.y = timeSec * 0.6;
      }
      if (this.ownHeroChar) {
        this.ownHeroChar.position.y = 0.14 + Math.sin(timeSec * 2.2) * 0.04;
      }

      // 97. Destiny Master Sunrise Outro animation
      if (this.destinySunriseArch) {
        this.destinySunriseArch.rotation.y = timeSec * 0.35;
        const archPulse = 1.0 + Math.sin(timeSec * 2.5) * 0.06;
        this.destinySunriseArch.scale.set(archPulse, archPulse, archPulse);
      }
      if (this.destinyMasterChar) {
        this.destinyMasterChar.position.y = 0.14 + Math.sin(timeSec * 2.4) * 0.05;
        this.destinyMasterChar.rotation.y = Math.sin(timeSec * 0.8) * 0.12;
      }

      // 98. Outward Battle Arena Clash animation
      this.arenaClashPillars.forEach((p, idx) => {
        p.position.y = 0.85 + Math.sin(timeSec * 3.0 + idx * Math.PI) * 0.05;
      });

      // 99. Comparison Pedestals Clash animation
      if (this.pedestalPodiumL && this.pedestalPodiumR) {
        this.pedestalPodiumL.position.y = 0.48 + Math.sin(timeSec * 2.0) * 0.1;
        this.pedestalPodiumR.position.y = 0.62 - Math.sin(timeSec * 2.0) * 0.1;
      }

      // 100. Inner Shadow Confrontation animation
      if (this.innerLightChar) {
        this.innerLightChar.position.y = 0.14 + Math.sin(timeSec * 2.0) * 0.03;
      }
      if (this.innerShadowChar) {
        this.innerShadowChar.position.y = 0.14 + Math.sin(timeSec * 2.2 + 0.5) * 0.04;
      }

      // 101. Lazy Comfort Pillow vs Ringing Alarm Clock animation
      if (this.lazyComfortPillow) {
        this.lazyComfortPillow.position.y = 1.35 + Math.sin(timeSec * 1.5) * 0.05;
      }
      if (this.lazyAlarmClock) {
        this.lazyAlarmClock.rotation.z = Math.sin(timeSec * 16.0) * 0.08;
      }

      // 102. Transient Trophy vs Inner Freedom Crown animation
      if (this.transientTrophy) {
        this.transientTrophy.position.y = 1.45 + Math.sin(timeSec * 1.8) * 0.04;
      }
      if (this.innerFreedomCrown) {
        this.innerFreedomCrown.rotation.y = timeSec * 0.8;
        const crPulse = 1.0 + Math.sin(timeSec * 2.5) * 0.06;
        this.innerFreedomCrown.scale.set(crPulse, crPulse, crPulse);
      }

      // 103. Dawn Discipline Awakening animation
      if (this.dawnSunSphere) {
        this.dawnSunSphere.rotation.y = timeSec * 0.2;
      }
      if (this.dawnAwakeningChar) {
        this.dawnAwakeningChar.position.y = 0.14 + Math.sin(timeSec * 2.2) * 0.04;
      }

      // 104. Focused Book & Dumbbell vs Dim Phone animation
      if (this.focusedBookMesh) {
        this.focusedBookMesh.position.y = 1.45 + Math.sin(timeSec * 2.0) * 0.04;
      }
      if (this.focusedDumbbellMesh) {
        this.focusedDumbbellMesh.position.y = 0.85 + Math.sin(timeSec * 1.8) * 0.03;
      }
      if (this.dimPhoneScrollMesh) {
        this.dimPhoneScrollMesh.rotation.z = Math.sin(timeSec * 1.0) * 0.05;
      }

      // 105. Flame to Zen Water Sphere animation
      if (this.rageFlameMesh) {
        const flmScale = 1.0 + Math.sin(timeSec * 4.5) * 0.08;
        this.rageFlameMesh.scale.set(flmScale, flmScale, flmScale);
      }
      if (this.zenWaterSphere) {
        this.zenWaterSphere.rotation.y = timeSec * 0.5;
        this.zenWaterSphere.position.y = 1.45 + Math.sin(timeSec * 1.8) * 0.04;
      }

      // 106. Two Versions Self Progress animation
      if (this.yesterdayGhostChar) {
        this.yesterdayGhostChar.position.y = 0.14 + Math.sin(timeSec * 1.6) * 0.03;
      }
      if (this.todayProgressChar) {
        this.todayProgressChar.position.y = 0.14 + Math.sin(timeSec * 2.4) * 0.04;
      }

      // 107. Forging Willpower Diamond animation
      if (this.willpowerAnvilDiamond) {
        this.willpowerAnvilDiamond.rotation.y = timeSec * 0.9;
        this.willpowerAnvilDiamond.position.y = 1.25 + Math.sin(timeSec * 2.2) * 0.04;
      }
      this.willpowerForgeSparks.forEach((spk, idx) => {
        const sa = (idx / 4) * Math.PI * 2 + timeSec * 1.5;
        spk.position.x = Math.cos(sa) * 0.75;
        spk.position.z = Math.sin(sa) * 0.35;
      });

      // 108. Self Conquest Triumph Outro animation
      if (this.selfConquestGateway) {
        this.selfConquestGateway.rotation.y = timeSec * 0.35;
        const gwPulse = 1.0 + Math.sin(timeSec * 2.5) * 0.06;
        this.selfConquestGateway.scale.set(gwPulse, gwPulse, gwPulse);
      }
      if (this.selfConquestHeroChar) {
        this.selfConquestHeroChar.position.y = 0.14 + Math.sin(timeSec * 2.4) * 0.05;
        this.selfConquestHeroChar.rotation.y = Math.sin(timeSec * 0.8) * 0.12;
      }

      if (this._updateNeonStoryStage) {
        this._updateNeonStoryStage(timeSec, activeSegment, segProgress, sceneType);
      }

      // Camera positioning
      const camTarget = this._getCameraTarget(cameraPreset, segProgress, timeSec);
      this.camera.position.copy(camTarget.pos);
      this.camera.lookAt(camTarget.look);

      // Apply presentation after legacy scene code sets its dark atmosphere.
      const presentation = this.presentation || {};
      // Layout/style chooses geometry, not permission to undo the user's palette.
      if (presentation.visualTheme !== 'dark') {
        const background = activeSegment?.background || presentation.background || '#dcebf3';
        this.scene.background.set(background);
        if (this.scene.fog) this.scene.fog.color.set(background);
        if (!this.daylightFill) {
          this.daylightFill = new THREE.HemisphereLight(0xffffff, 0xa5b9c6, 1.1);
          this.scene.add(this.daylightFill);
        }
        this.daylightFill.visible = true;
      } else if (this.daylightFill) this.daylightFill.visible = false;
      this.renderer.render(this.scene, this.camera);
    }
  }

  global.MetaphorScene3D = MetaphorScene3D;
})(window);


/**
 * ghostSeraphina.js - Ghost Appearance & Choreography: Lady Seraphina
 *
 * Implements Lady Seraphina:
 * - Visual Appearance (Human Touch with Translucent Ethereal Glow):
 *   * Smooth Sculpted 3D Anime Silhouette:
 *     - Delicate fair/porcelain natural human skin tone (#fdf0e4) on face, slender neck, contoured
 *       décolletage, arms, and hands with subtle celestial cyan rim glow (#38bdf8).
 *     - Soft blushing cheeks (#f29d9d) and natural rosy-coral lips (#d95d70).
 *     - Expressive anime eyes with clean white sclera and deep hazel-violet irises (#3a354d / #4f46e5).
 *     - Silky dark chestnut brunette hair (#3e2c1e) with sweeping anime bangs and cascading wavy locks.
 *     - Royal Victorian satin corset bodice (#faf4e8) and flaring silk ballgown skirt (#fdfbf7) with
 *       48 radial segments and smooth vertex normals.
 *     - Translucent sheer draped sleeves, sweetheart ruffle collar, and pearl hairpins.
 *   * Floating above the right-center edge of the central carpet (y ≈ 0.15m hover offset, sin(t) bobbing).
 *   * Articulated jaw, lips, and eyelids for real-time speech lip-sync and natural eye blinks.
 * - Dialogue Pipeline (Web Speech API + Natural Emotional Female Voice):
 *   * Zero On-Screen Captions: Completely removes HTML subtitle banners (#seraphina-subtitle-box / #seraphina-subtitle-ribbon).
 *   * High-quality female English voice selected from speechSynthesis.getVoices() (Aria, Jenny, Google UK Female, Samantha, Victoria, Zira).
 *   * Dynamic emotional pitch/rate progression across 4 distinct sentence utterances.
 *   * Zero intrusive microphone access prompts (voice recognition passive without prompting).
 * - Choreography Timeline:
 *   * Greeting (0.0s - 5.5s): Slight head bow, right hand touches near heart then opens gracefully toward player.
 *   * Sealed Warning (5.5s - 11.5s): Solemn head shake side-to-side toward sealed right doors, hands lower with palms downward.
 *   * Three Souls Cue (11.5s - 18.0s): Extends right arm smoothly left-to-right across the hall.
 *   * Golden Key Promise (18.0s - 25.0s): Cups both hands gently at chest height with golden key sparkle preview.
 *   * Dialogue End -> Fires onDialogueEnd callback to trigger Dual Player Thumbs Up!
 */

import * as THREE from 'three';

/**
 * Returns the highest-quality female English voice available on the client device
 */
export function getBestFemaleVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // High-priority natural female English voices
  const priorityList = [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Google UK English Female',
    'Google US English',
    'Samantha',
    'Victoria',
    'Microsoft Zira - English (United States)',
    'Karen',
    'Moira',
    'Tessa'
  ];

  for (const prio of priorityList) {
    const match = voices.find((v) => v.name === prio || v.name.includes(prio));
    if (match) return match;
  }

  // Regex fallback: any English voice containing female keywords
  const regex = /female|woman|aria|jenny|samantha|zira|karen|moira|tessa/i;
  const femaleEnVoice = voices.find((v) => v.lang.startsWith('en') && regex.test(v.name));
  if (femaleEnVoice) return femaleEnVoice;

  // Fallback: any English voice
  const anyEnVoice = voices.find((v) => v.lang.startsWith('en'));
  if (anyEnVoice) return anyEnVoice;

  return voices[0] || null;
}

export class GhostSeraphina {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.basePosition = new THREE.Vector3(1.75, 0.0, -2.2); // Positioned to the side so never hidden by souls
    this.hoverOffset = 0.15;
    this.isVisible = false;
    this.isSpeaking = false;
    this.speechStartTime = 0;
    this.speechProgress = 0;
    this.speechDuration = 24.5;
    this.onDialogueEnd = options.onDialogueEnd || null;

    // Gesture and articulation states
    this.jawAngle = 0;
    this.lipSpread = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.phase = 0; // 0: hidden, 1: fading in, 2: speaking, 3: completed sentinel

    // Cache female voice when available
    this.cachedVoice = null;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.cachedVoice = getBestFemaleVoice();
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          this.cachedVoice = getBestFemaleVoice();
        });
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          this.cachedVoice = getBestFemaleVoice();
        };
      }
    }

    this.initSpiritMesh();
    this.initSubtitleRibbon(); // Safe stub ensuring zero caption box exists in DOM
  }

  initSpiritMesh() {
    this.group = new THREE.Group();
    this.group.name = 'ghostSeraphina';
    this.group.position.copy(this.basePosition);
    this.group.rotation.y = -0.48; // Face center hall and player from side
    this.group.visible = false;

    // 1. Natural Fair Porcelain Peach Skin Material (Warm human presence with soft champagne rim glow)
    this.spiritMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe6d5, // Delicate fair human porcelain skin tone (healthy peach undertone, NO BLUE!)
      emissive: new THREE.Color(0xfde68a), // Warm champagne gold ethereal rim glow
      emissiveIntensity: 0.16, // Preserves exact contract test assertion
      roughness: 0.38,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88, // Solid human presence (fades in smoothly to 0.88, not ghostly pale blue!)
      depthWrite: false,
      side: THREE.FrontSide
    });

    // 2. Royal Victorian Ivory Silk Ballgown Material
    this.gownMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffdfa, // Pure royal ivory silk
      emissive: new THREE.Color(0xfef3c7), // Warm golden champagne glow
      emissiveIntensity: 0.10,
      roughness: 0.30,
      metalness: 0.08,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      side: THREE.FrontSide
    });

    // 3. Contoured Regal Corset Bodice Material (Gold-trimmed satin)
    this.corsetMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef9ee,
      emissive: new THREE.Color(0xd4af37), // Subtle gold leaf embroidery glow
      emissiveIntensity: 0.14,
      roughness: 0.28,
      metalness: 0.12,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      side: THREE.FrontSide
    });

    // 4. Silky Human Dark Chestnut / Brunette Hair Material
    this.hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x361f10, // Natural rich dark chestnut human hair (NO BLUE!)
      emissive: new THREE.Color(0x1a0e07),
      emissiveIntensity: 0.06,
      roughness: 0.36,
      metalness: 0.05,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      side: THREE.FrontSide
    });

    // 5. Natural Rosy-Coral Lip Material
    this.lipMaterial = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Natural soft rose lips
      emissive: new THREE.Color(0xbe123c),
      emissiveIntensity: 0.14,
      roughness: 0.22,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      side: THREE.FrontSide
    });

    // 6. Soft Rosy Cheek Blush Material
    this.blushMaterial = new THREE.MeshStandardMaterial({
      color: 0xf29d9d,
      roughness: 0.5,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    // 7. Human Anime Eyes Materials (Sclera & Hazel-Violet Iris)
    this.eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    this.irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a354d,
      emissive: new THREE.Color(0x4f46e5),
      emissiveIntensity: 0.15,
      roughness: 0.15,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    // 8. Sheer Draped Sleeves & Veil Material
    this.sheerMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f9ff,
      emissive: new THREE.Color(0x7dd3fc),
      emissiveIntensity: 0.10,
      roughness: 0.20,
      metalness: 0.05,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.FrontSide
    });

    // --- 1. Root & Torso ---
    this.root = new THREE.Group();
    this.root.position.set(0, 0.88, 0); // Graceful standing offset so gown hem hovers right above floor
    this.group.add(this.root);
    this.group.rotation.y = -0.32; // Facing the player at (0.0, 1.35, 1.15)

    // Smooth LatheGeometry: Contoured Hourglass Victorian Corset Bodice (in regal satin)
    const corsetPoints = [
      new THREE.Vector2(0.125, 0.38),
      new THREE.Vector2(0.128, 0.44),
      new THREE.Vector2(0.145, 0.50),
      new THREE.Vector2(0.178, 0.58), // Contoured bust
      new THREE.Vector2(0.182, 0.62),
      new THREE.Vector2(0.165, 0.68),
      new THREE.Vector2(0.138, 0.73)
    ];
    const torsoGeo = new THREE.LatheGeometry(corsetPoints, 32);
    torsoGeo.computeVertexNormals();
    this.torso = new THREE.Mesh(torsoGeo, this.corsetMaterial);
    this.root.add(this.torso);

    // Sweetheart Off-Shoulder Ruffle Collar
    const collarGeo = new THREE.TorusGeometry(0.175, 0.028, 16, 32);
    collarGeo.scale(1.15, 0.65, 1.0);
    this.collar = new THREE.Mesh(collarGeo, this.sheerMaterial);
    this.collar.position.set(0, 0.68, 0.02);
    this.collar.rotation.x = Math.PI * 0.12;
    this.root.add(this.collar);

    // Smooth LatheGeometry: Gracefully Flaring Pleated Royal Silk Ballgown Skirt (48 radial segments)
    const skirtPoints = [
      new THREE.Vector2(0.125, 0.38),  // Fitted waist
      new THREE.Vector2(0.148, 0.28),  // Upper hips
      new THREE.Vector2(0.195, 0.12),  // Hips
      new THREE.Vector2(0.265, -0.08), // Upper flare
      new THREE.Vector2(0.355, -0.32), // Mid flare
      new THREE.Vector2(0.465, -0.56), // Lower flare
      new THREE.Vector2(0.585, -0.78), // Broad bell hem
      new THREE.Vector2(0.565, -0.79)  // Soft inner rim thickness
    ];
    const gownGeo = new THREE.LatheGeometry(skirtPoints, 48);
    gownGeo.computeVertexNormals();
    this.gown = new THREE.Mesh(gownGeo, this.gownMaterial);
    this.root.add(this.gown);

    // Smooth LatheGeometry: Lower Undulating Spiritual Veil / Hem (48 radial segments)
    const veilPoints = [
      new THREE.Vector2(0.52, -0.68),
      new THREE.Vector2(0.59, -0.79),
      new THREE.Vector2(0.66, -0.88),
      new THREE.Vector2(0.68, -0.92)
    ];
    const veilGeo = new THREE.LatheGeometry(veilPoints, 48);
    veilGeo.computeVertexNormals();
    this.veil = new THREE.Mesh(veilGeo, this.sheerMaterial);
    this.root.add(this.veil);

    // --- 2. Slender Neck, Head, Face & Lip-Sync Articulation ---
    this.neck = new THREE.Group();
    this.neck.position.set(0, 0.73, 0);
    this.root.add(this.neck);

    // Slender sculpted neck profile (in porcelain skin)
    const neckPoints = [
      new THREE.Vector2(0.052, 0.00),
      new THREE.Vector2(0.044, 0.05),
      new THREE.Vector2(0.046, 0.11)
    ];
    const neckGeo = new THREE.LatheGeometry(neckPoints, 24);
    neckGeo.computeVertexNormals();
    this.neckMesh = new THREE.Mesh(neckGeo, this.spiritMaterial);
    this.neck.add(this.neckMesh);

    this.head = new THREE.Group();
    this.head.position.set(0, 0.11, 0);
    this.neck.add(this.head);

    // Smooth Sculpted Porcelain Cranium & Face
    const craniumGeo = new THREE.SphereGeometry(0.125, 32, 24);
    craniumGeo.scale(0.96, 1.20, 1.05);
    this.cranium = new THREE.Mesh(craniumGeo, this.spiritMaterial);
    this.head.add(this.cranium);

    // Soft Rosy Cheek Blushes
    const blushGeo = new THREE.SphereGeometry(0.022, 12, 12);
    blushGeo.scale(1.4, 0.7, 0.3);
    const leftBlush = new THREE.Mesh(blushGeo, this.blushMaterial);
    leftBlush.position.set(-0.058, 0.002, 0.112);
    this.head.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, this.blushMaterial);
    rightBlush.position.set(0.058, 0.002, 0.112);
    this.head.add(rightBlush);

    // Expressive Eyes (White Sclera + Deep Hazel-Violet Irises)
    const eyeScleraGeo = new THREE.SphereGeometry(0.019, 14, 14);
    eyeScleraGeo.scale(1.2, 0.8, 0.4);

    const leftEyeWhite = new THREE.Mesh(eyeScleraGeo, this.eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.042, 0.022, 0.115);
    this.head.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeScleraGeo, this.eyeWhiteMaterial);
    rightEyeWhite.position.set(0.042, 0.022, 0.115);
    this.head.add(rightEyeWhite);

    const irisGeo = new THREE.CircleGeometry(0.010, 16);
    const leftIris = new THREE.Mesh(irisGeo, this.irisMaterial);
    leftIris.position.set(-0.042, 0.022, 0.124);
    this.head.add(leftIris);

    const rightIris = new THREE.Mesh(irisGeo, this.irisMaterial);
    rightIris.position.set(0.042, 0.022, 0.124);
    this.head.add(rightIris);

    // Articulated Jaw for Speech Lip-Sync with Tapered Anime Chin Profile
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, -0.05, 0.035);
    this.head.add(this.jaw);

    const chinPoints = [
      new THREE.Vector2(0.012, -0.052), // Slender anime chin tip
      new THREE.Vector2(0.032, -0.028),
      new THREE.Vector2(0.055, 0.005)   // Tapered jaw angle
    ];
    const chinGeo = new THREE.LatheGeometry(chinPoints, 24);
    chinGeo.computeVertexNormals();
    this.chin = new THREE.Mesh(chinGeo, this.spiritMaterial);
    this.chin.position.set(0, -0.015, 0.02);
    this.jaw.add(this.chin);

    // Soft Rosy-Coral Upper and Lower Lips
    const upperLipGeo = new THREE.CylinderGeometry(0.022, 0.028, 0.009, 16);
    upperLipGeo.scale(1.5, 1.0, 0.5);
    this.upperLip = new THREE.Mesh(upperLipGeo, this.lipMaterial);
    this.upperLip.position.set(0, -0.028, 0.124);
    this.head.add(this.upperLip);

    const lowerLipGeo = new THREE.CylinderGeometry(0.024, 0.020, 0.010, 16);
    lowerLipGeo.scale(1.4, 1.0, 0.55);
    this.lowerLip = new THREE.Mesh(lowerLipGeo, this.lipMaterial);
    this.lowerLip.position.set(0, -0.016, 0.082);
    this.jaw.add(this.lowerLip);

    // Eyelids (Natural eye blinks every ~3.5s)
    const eyelidGeo = new THREE.SphereGeometry(0.030, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    this.leftEyelid = new THREE.Mesh(eyelidGeo, this.spiritMaterial);
    this.leftEyelid.position.set(-0.042, 0.025, 0.114);
    this.leftEyelid.rotation.x = Math.PI / 2;
    this.head.add(this.leftEyelid);

    this.rightEyelid = new THREE.Mesh(eyelidGeo, this.spiritMaterial);
    this.rightEyelid.position.set(0.042, 0.025, 0.114);
    this.rightEyelid.rotation.x = Math.PI / 2;
    this.head.add(this.rightEyelid);

    // Natural Brows (Silky brunette)
    this.leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.007, 0.010), this.hairMaterial);
    this.leftBrow.position.set(-0.042, 0.054, 0.122);
    this.head.add(this.leftBrow);

    this.rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.007, 0.010), this.hairMaterial);
    this.rightBrow.position.set(0.042, 0.054, 0.122);
    this.head.add(this.rightBrow);

    // Rich Chestnut Brunette Hair (Bangs & Elegant Classical Crown)
    const hairCrownGeo = new THREE.SphereGeometry(0.145, 24, 18);
    hairCrownGeo.scale(1.05, 1.12, 1.15);
    this.hair = new THREE.Mesh(hairCrownGeo, this.hairMaterial);
    this.hair.position.set(0, 0.04, -0.025);
    this.head.add(this.hair);

    // Anime Side Bangs (Silky brunette curved locks)
    const bangCurveLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.09, 0.08),
      new THREE.Vector3(-0.09, 0.04, 0.10),
      new THREE.Vector3(-0.11, -0.04, 0.08),
      new THREE.Vector3(-0.10, -0.12, 0.04)
    ]);
    const bangGeoLeft = new THREE.TubeGeometry(bangCurveLeft, 24, 0.012, 8, false);
    const bangLeft = new THREE.Mesh(bangGeoLeft, this.hairMaterial);
    this.head.add(bangLeft);

    const bangCurveRight = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.09, 0.08),
      new THREE.Vector3(0.09, 0.04, 0.10),
      new THREE.Vector3(0.11, -0.04, 0.08),
      new THREE.Vector3(0.10, -0.12, 0.04)
    ]);
    const bangGeoRight = new THREE.TubeGeometry(bangCurveRight, 24, 0.012, 8, false);
    const bangRight = new THREE.Mesh(bangGeoRight, this.hairMaterial);
    this.head.add(bangRight);

    // Flowing Wavy Locks Cascading down back & shoulders
    const lockCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.04, 0.06, -0.12),
        new THREE.Vector3(-0.07, -0.08, -0.16),
        new THREE.Vector3(-0.05, -0.22, -0.18),
        new THREE.Vector3(-0.08, -0.38, -0.15)
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, 0.06, -0.12),
        new THREE.Vector3(0.07, -0.08, -0.16),
        new THREE.Vector3(0.05, -0.22, -0.18),
        new THREE.Vector3(0.08, -0.38, -0.15)
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.00, 0.08, -0.14),
        new THREE.Vector3(0.00, -0.10, -0.19),
        new THREE.Vector3(0.02, -0.28, -0.20),
        new THREE.Vector3(0.00, -0.42, -0.16)
      ])
    ];
    lockCurves.forEach((curve) => {
      const lockGeo = new THREE.TubeGeometry(curve, 28, 0.013, 8, false);
      const lockMesh = new THREE.Mesh(lockGeo, this.hairMaterial);
      this.head.add(lockMesh);
    });

    // Chignon / Hair Bun adorned with Pearl Hairpins
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 14), this.hairMaterial);
    bun.position.set(0, 0.08, -0.14);
    this.head.add(bun);

    // Iridescent Pearl Hairpins nestled into chignon
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xfef08a),
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.85
    });
    const pearlOffsets = [
      new THREE.Vector3(-0.045, 0.12, -0.14),
      new THREE.Vector3(0.045, 0.12, -0.14),
      new THREE.Vector3(0.0, 0.15, -0.13),
      new THREE.Vector3(-0.06, 0.06, -0.13),
      new THREE.Vector3(0.06, 0.06, -0.13)
    ];
    pearlOffsets.forEach((pos) => {
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 12), pearlMat);
      pearl.position.copy(pos);
      this.head.add(pearl);
    });

    // --- 3. Articulated Left & Right Arms and Hands (in Porcelain Skin) ---
    // Left Arm Hierarchy
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.21, 0.62, 0);
    this.root.add(this.leftShoulder);

    this.leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.032, 0.28, 12), this.spiritMaterial);
    this.leftUpperArm.position.set(0, -0.14, 0);
    this.leftShoulder.add(this.leftUpperArm);

    // Sheer Draped Sleeve
    this.leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.135, 0.36, 16, 1, true), this.sheerMaterial);
    this.leftSleeve.position.set(0, -0.17, 0);
    this.leftShoulder.add(this.leftSleeve);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.set(0, -0.28, 0);
    this.leftShoulder.add(this.leftElbow);

    this.leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.26, 12), this.spiritMaterial);
    this.leftForearm.position.set(0, -0.13, 0);
    this.leftElbow.add(this.leftForearm);

    this.leftHand = new THREE.Group();
    this.leftHand.position.set(0, -0.26, 0);
    this.leftElbow.add(this.leftHand);

    const lPalm = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.062, 0.016), this.spiritMaterial);
    this.leftHand.add(lPalm);

    // Right Arm Hierarchy
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.21, 0.62, 0);
    this.root.add(this.rightShoulder);

    this.rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.032, 0.28, 12), this.spiritMaterial);
    this.rightUpperArm.position.set(0, -0.14, 0);
    this.rightShoulder.add(this.rightUpperArm);

    // Sheer Draped Sleeve
    this.rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.135, 0.36, 16, 1, true), this.sheerMaterial);
    this.rightSleeve.position.set(0, -0.17, 0);
    this.rightShoulder.add(this.rightSleeve);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.set(0, -0.28, 0);
    this.rightShoulder.add(this.rightElbow);

    this.rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.26, 12), this.spiritMaterial);
    this.rightForearm.position.set(0, -0.13, 0);
    this.rightElbow.add(this.rightForearm);

    this.rightHand = new THREE.Group();
    this.rightHand.position.set(0, -0.26, 0);
    this.rightElbow.add(this.rightHand);

    const rPalm = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.062, 0.016), this.spiritMaterial);
    this.rightHand.add(rPalm);

    // --- 4. Golden Key Sparkle Preview (Between Cupped Hands in Step 5d) ---
    this.goldenKeyPreview = new THREE.Group();
    this.goldenKeyPreview.position.set(0, 0.48, 0.24);
    this.goldenKeyPreview.visible = false;

    const keyHead = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.008, 12, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: new THREE.Color(0xffb700),
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.9
      })
    );
    this.goldenKeyPreview.add(keyHead);

    const keyShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: new THREE.Color(0xffb700), emissiveIntensity: 0.5 })
    );
    keyShaft.position.set(0, -0.06, 0);
    this.goldenKeyPreview.add(keyShaft);

    // Ornate Key Bit (Teeth)
    const keyBit = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.03, 0.008),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: new THREE.Color(0xffb700), emissiveIntensity: 0.6, metalness: 0.9 })
    );
    keyBit.position.set(0.012, -0.10, 0);
    this.goldenKeyPreview.add(keyBit);

    // Warm golden point light radiating from key
    const keyLight = new THREE.PointLight(0xfde047, 1.8, 2.5);
    keyLight.position.set(0, 0, 0.05);
    this.goldenKeyPreview.add(keyLight);

    this.root.add(this.goldenKeyPreview);

    // Add to Scene
    this.scene.add(this.group);
  }

  /**
   * Safe Stub: Completely removes any HTML subtitle box or ribbon from the DOM.
   * Zero captions rendered on screen.
   */
  initSubtitleRibbon() {
    if (typeof document === 'undefined') return;
    const existingRibbon = document.getElementById('seraphina-subtitle-ribbon');
    if (existingRibbon) existingRibbon.remove();
    const existingBox = document.getElementById('seraphina-subtitle-box');
    if (existingBox) existingBox.remove();
  }

  showSubtitles(text) {
    // Zero on-screen captions: intentional no-op
  }

  hideSubtitles() {
    // Zero on-screen captions: intentional no-op
  }

  materialize() {
    this.phase = 1; // Fading in
    this.isVisible = true;
    this.group.visible = true;
    this.fadeProgress = 0;
    console.log('[GhostSeraphina] Materializing Lady Seraphina with delicate porcelain skin and royal attire...');
  }

  /**
   * Speaks Lady Seraphina's dialogue with a clear, emotional female voice
   * across 4 dynamic sentences with varied pitch, rate, and volume.
   */
  startSpeech() {
    if (this.isSpeaking) return;
    this.isSpeaking = true;
    this.speechStartTime = performance.now();
    this.phase = 2;

    // 4 sentences with dynamic emotional modulation
    const dialogueLines = [
      {
        text: "Welcome, traveler... I am Seraphina, keeper of this forgotten palace.",
        pitch: 1.12, // Soft, pleading, sorrowful introduction
        rate: 0.88,
        volume: 1.0
      },
      {
        text: "Once you have stepped inside these halls, the doors are sealed—you cannot leave on your own.",
        pitch: 1.14, // Solemn warning
        rate: 0.86,
        volume: 1.0
      },
      {
        text: "If you wish to find your way out, you must first make my three little souls happy by playing their games with them.",
        pitch: 1.18, // Warmer, hopeful guide
        rate: 0.94,
        volume: 1.0
      },
      {
        text: "Only when you have earned all their points of joy will the golden key appear to set you free.",
        pitch: 1.26, // Bright, joyful, relieved
        rate: 1.00,
        volume: 1.0
      }
    ];

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Clear any queued utterances

      const femaleVoice = this.cachedVoice || getBestFemaleVoice();
      let currentIndex = 0;

      const speakNextLine = () => {
        if (!this.isSpeaking) return;
        if (currentIndex >= dialogueLines.length) {
          console.log('[GhostSeraphina] All 4 emotional utterances finished speaking.');
          this.finishSpeech();
          return;
        }

        const line = dialogueLines[currentIndex++];
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.pitch = line.pitch;
        utterance.rate = line.rate;
        utterance.volume = line.volume;
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.onboundary = (evt) => {
          // Subtle real-time lip & brow pulse on spoken words
          this.jawAngle = 0.22;
          this.lipSpread = 0.15;
        };

        utterance.onend = () => {
          speakNextLine();
        };

        utterance.onerror = (err) => {
          console.warn('[GhostSeraphina] Speech synthesis utterance note:', err?.error);
          speakNextLine();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextLine();
    } else {
      console.log('[GhostSeraphina] Web Speech API not supported; using cinematic timeline fallback.');
    }

    // Safety fallback timer if speech synthesis is blocked or silent
    setTimeout(() => {
      if (this.isSpeaking) {
        this.finishSpeech();
      }
    }, (this.speechDuration + 1.5) * 1000);
  }

  finishSpeech() {
    if (!this.isSpeaking && this.phase === 3) return;
    this.isSpeaking = false;
    this.phase = 3; // Sentinel pose

    // Close lips gently
    this.jawAngle = 0.0;
    this.lipSpread = 0.0;
    if (this.jaw) this.jaw.rotation.x = 0.0;

    // Trigger player thumbs up callback
    if (typeof this.onDialogueEnd === 'function') {
      this.onDialogueEnd();
    }
  }

  update(delta, time) {
    if (!this.isVisible) return;

    // 1. Fade-in materialization (Smoothly to 0.88 opacity over 1.4s)
    if (this.phase === 1) {
      this.fadeProgress = Math.min(1, (this.fadeProgress || 0) + delta / 1.4);
      const targetOp = 0.88 * this.fadeProgress;
      this.spiritMaterial.opacity = targetOp;
      if (this.corsetMaterial) this.corsetMaterial.opacity = targetOp * 0.95;
      if (this.gownMaterial) this.gownMaterial.opacity = targetOp * 0.95;
      if (this.hairMaterial) this.hairMaterial.opacity = targetOp * 0.98;
      if (this.lipMaterial) this.lipMaterial.opacity = targetOp;
      if (this.eyeWhiteMaterial) this.eyeWhiteMaterial.opacity = targetOp;
      if (this.irisMaterial) this.irisMaterial.opacity = targetOp;
      if (this.blushMaterial) this.blushMaterial.opacity = targetOp * 0.42;
      if (this.sheerMaterial) this.sheerMaterial.opacity = targetOp * 0.65;

      if (this.fadeProgress >= 1) {
        this.startSpeech();
      }
    }

    // 2. Translucent Spirit Hover Bobbing & Soft Undulation
    const bob = Math.sin(time * 1.8) * 0.035;
    this.group.position.x = this.basePosition.x;
    this.group.position.z = this.basePosition.z;
    this.group.position.y = this.basePosition.y + this.hoverOffset + bob;

    // Gown gentle ghostly sway
    if (this.gown) {
      this.gown.rotation.z = Math.sin(time * 1.4) * 0.025;
      this.gown.rotation.x = Math.cos(time * 1.2) * 0.02;
    }
    if (this.veil) {
      this.veil.rotation.y = time * 0.2;
      this.veil.scale.set(1.0 + Math.sin(time * 2.0) * 0.04, 1.0, 1.0 + Math.cos(time * 2.0) * 0.04);
    }

    // 3. Natural Eye Blinks Every ~3.5 Seconds
    this.blinkTimer += delta;
    if (this.blinkTimer >= 3.5) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }
    if (this.isBlinking) {
      this.leftEyelid.scale.y = 0.15;
      this.rightEyelid.scale.y = 0.15;
      setTimeout(() => {
        if (this.leftEyelid && this.rightEyelid) {
          this.leftEyelid.scale.y = 1.0;
          this.rightEyelid.scale.y = 1.0;
          this.isBlinking = false;
        }
      }, 140);
    }

    // 4. Choreography Timeline & Real-Time Lip-Sync
    if (this.isSpeaking) {
      const elapsed = (performance.now() - this.speechStartTime) / 1000;
      this.speechProgress = elapsed;

      // Real-time lip motion & jaw articulation
      const speechMouthAmp = Math.max(0, Math.sin(time * 16.0) * 0.18 + Math.sin(time * 24.0) * 0.08);
      this.jawAngle = THREE.MathUtils.lerp(this.jawAngle, speechMouthAmp, delta * 18.0);
      this.jaw.rotation.x = this.jawAngle;

      this.upperLip.position.y = -0.028 + speechMouthAmp * 0.015;
      this.lowerLip.position.y = -0.016 - speechMouthAmp * 0.02;

      // Synchronized Gesture Stages
      if (elapsed < 5.5) {
        // --- Stage A (0.0s - 5.5s): Greeting ("Welcome, traveler... I am Seraphina...") ---
        // Slight head bow
        this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, 0.08, delta * 3.0);
        this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, -0.12, delta * 3.0);

        // Right hand touches near heart then opens gracefully toward player
        this.rightShoulder.rotation.x = THREE.MathUtils.lerp(this.rightShoulder.rotation.x, -0.65, delta * 3.5);
        this.rightShoulder.rotation.z = THREE.MathUtils.lerp(this.rightShoulder.rotation.z, -0.32, delta * 3.5);
        this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 1.25, delta * 3.5);
        this.rightHand.rotation.y = THREE.MathUtils.lerp(this.rightHand.rotation.y, 0.45, delta * 3.5);

        // Left arm relaxed at side
        this.leftShoulder.rotation.x = THREE.MathUtils.lerp(this.leftShoulder.rotation.x, 0.15, delta * 2.0);
        this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, 0.25, delta * 2.0);

      } else if (elapsed < 11.5) {
        // --- Stage B (5.5s - 11.5s): Sealed Warning ("Once you have stepped inside...") ---
        // Solemn head shake side-to-side toward the sealed right doors
        const headShake = Math.sin((elapsed - 5.5) * 2.2) * 0.14;
        this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, 0.02, delta * 2.5);
        this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, 0.35 + headShake, delta * 3.0);

        // Both hands draw inward and lower slowly with palms downward
        this.rightShoulder.rotation.x = THREE.MathUtils.lerp(this.rightShoulder.rotation.x, -0.22, delta * 2.5);
        this.rightShoulder.rotation.z = THREE.MathUtils.lerp(this.rightShoulder.rotation.z, 0.25, delta * 2.5);
        this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.65, delta * 2.5);

        this.leftShoulder.rotation.x = THREE.MathUtils.lerp(this.leftShoulder.rotation.x, -0.22, delta * 2.5);
        this.leftShoulder.rotation.z = THREE.MathUtils.lerp(this.leftShoulder.rotation.z, -0.25, delta * 2.5);
        this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, 0.65, delta * 2.5);

      } else if (elapsed < 18.0) {
        // --- Stage C (11.5s - 18.0s): Three Souls Cue ("...make my three little souls happy...") ---
        // Head turns to follow graceful sweeping arm across the hall
        this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, -0.04, delta * 2.5);
        this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, -0.25, delta * 2.5);

        // Extends right arm smoothly in wide sweeping arc left-to-right across the hall
        const sweep = (elapsed - 11.5) / 6.5; // 0 to 1
        const armYaw = THREE.MathUtils.lerp(-0.75, 0.65, sweep);
        this.rightShoulder.rotation.x = THREE.MathUtils.lerp(this.rightShoulder.rotation.x, -0.85, delta * 3.0);
        this.rightShoulder.rotation.y = armYaw;
        this.rightShoulder.rotation.z = THREE.MathUtils.lerp(this.rightShoulder.rotation.z, -0.15, delta * 3.0);
        this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 0.35, delta * 3.0);
        this.rightHand.rotation.y = 0.65;

      } else {
        // --- Stage D (18.0s - 25.0s): Golden Key Promise ("Only when you have earned all their points...") ---
        // Cups both hands gently at chest height
        this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, 0.06, delta * 3.0);
        this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, 0.0, delta * 3.0);

        this.leftShoulder.rotation.x = THREE.MathUtils.lerp(this.leftShoulder.rotation.x, -0.65, delta * 3.5);
        this.leftShoulder.rotation.z = THREE.MathUtils.lerp(this.leftShoulder.rotation.z, 0.38, delta * 3.5);
        this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, 1.25, delta * 3.5);

        this.rightShoulder.rotation.x = THREE.MathUtils.lerp(this.rightShoulder.rotation.x, -0.65, delta * 3.5);
        this.rightShoulder.rotation.z = THREE.MathUtils.lerp(this.rightShoulder.rotation.z, -0.38, delta * 3.5);
        this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, 1.25, delta * 3.5);

        // Reveal the rotating golden key sparkle preview
        if (this.goldenKeyPreview) {
          this.goldenKeyPreview.visible = true;
          this.goldenKeyPreview.rotation.y += delta * 2.2;
          const keyBob = Math.sin(time * 3.0) * 0.015;
          this.goldenKeyPreview.position.y = 0.48 + keyBob;
        }
      }
    } else if (this.phase === 3) {
      // Sentinel Pose: Poised and watchful over the hall from side
      this.basePosition.z = THREE.MathUtils.lerp(this.basePosition.z, -2.2, delta * 1.2);
      this.basePosition.x = THREE.MathUtils.lerp(this.basePosition.x, 1.75, delta * 1.2);
      this.group.rotation.y = -0.48;
      this.head.rotation.set(0, -0.10, 0);

      this.leftShoulder.rotation.set(0.12, 0, 0.15);
      this.leftElbow.rotation.set(0.25, 0, 0);
      this.rightShoulder.rotation.set(0.12, 0, -0.15);
      this.rightElbow.rotation.set(0.25, 0, 0);

      if (this.goldenKeyPreview && !this.isOverjoyed && !this.hasGivenKey) {
        this.goldenKeyPreview.visible = false;
      }
    }
  }

  onPointEarned(point = 1, total = 3) {
    this.joyPoints = point;
    console.log(`[GhostSeraphina] Joy Point Earned: ${point} / ${total}! Shifting expression from sorrowful to hopeful.`);

    // 1. Shift face from sorrowful to hopeful & joyful
    this.isHopeful = true;
    if (point >= total) {
      this.isOverjoyed = true;
      if (this.goldenKeyPreview) {
        this.goldenKeyPreview.visible = true;
      }
      if (this.handManager && !this.hasGivenKey) {
        this.giveGoldenKeyTo(this.handManager);
      }
    }

    // Eyebrows: lift from furrowed sorrow to gentle hopeful curve
    if (this.leftBrow) {
      this.leftBrow.rotation.z = -0.16;
      this.leftBrow.position.y = 0.058;
    }
    if (this.rightBrow) {
      this.rightBrow.rotation.z = 0.16;
      this.rightBrow.position.y = 0.058;
    }

    // Lips: gentle, warm, grateful smile
    if (this.upperLip) {
      this.upperLip.position.y = -0.024;
      this.upperLip.scale.x = 1.65;
    }
    if (this.lowerLip) {
      this.lowerLip.position.y = -0.012;
      this.lowerLip.scale.x = 1.55;
    }

    // Blushing cheeks glow warmer with relief
    if (this.blushMaterial) {
      this.blushMaterial.color.setHex(0xf472b6);
      this.blushMaterial.opacity = 0.65;
    }

    // Spiritual aura shifts from mournful pale cyan to warm champagne-gold illumination
    if (this.spiritMaterial) {
      this.spiritMaterial.emissive.setHex(0xf59e0b);
      this.spiritMaterial.emissiveIntensity = 0.22;
    }
    if (this.gownMaterial) {
      this.gownMaterial.emissive.setHex(0xfef08a);
      this.gownMaterial.emissiveIntensity = 0.18;
    }

    // Arms: Bring both hands gently over heart in sincere emotional gratitude
    if (this.rightShoulder) this.rightShoulder.rotation.set(-0.65, 0.22, -0.28);
    if (this.rightElbow) this.rightElbow.rotation.set(1.20, 0, 0);
    if (this.leftShoulder) this.leftShoulder.rotation.set(-0.65, -0.22, 0.28);
    if (this.leftElbow) this.leftElbow.rotation.set(1.20, 0, 0);

    // 2. Emotional female reaction voice line with ZERO on-screen captions
    const reactionLines = {
      1: "You freed my first little soul... The palace light is returning. Thank you, kind traveler!",
      2: "Another soul restored! I feel the ancient magic mending throughout the hall.",
      3: "You can leave now, traveller. Take this golden key and be free!"
    };

    const reactionText = reactionLines[point] || reactionLines[1];

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const femaleVoice = this.cachedVoice || getBestFemaleVoice();
      const utterance = new SpeechSynthesisUtterance(reactionText);
      utterance.pitch = 1.25; // Bright, joyful, emotional
      utterance.rate = 0.96;
      utterance.volume = 1.0;
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      this.isSpeaking = true;
      this.speechStartTime = performance.now();

      utterance.onboundary = () => {
        this.jawAngle = 0.18;
        this.lipSpread = 0.15;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.jawAngle = 0.0;
        if (this.jaw) this.jaw.rotation.x = 0;
      };

      utterance.onerror = (err) => {
        console.warn('[GhostSeraphina] Reaction speech notice:', err?.error);
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.log(`[GhostSeraphina] Spoken emotional reaction: "${reactionText}"`);
    }
  }

  giveGoldenKeyTo(handManager) {
    if (this.hasGivenKey) return;
    this.hasGivenKey = true;
    this.handManager = handManager;

    if (this.goldenKeyPreview && handManager && typeof handManager.holdGoldenKey === 'function') {
      const startPos = new THREE.Vector3();
      this.goldenKeyPreview.getWorldPosition(startPos);
      handManager.holdGoldenKey(this.goldenKeyPreview, startPos);
      console.log('[GhostSeraphina] Lady Seraphina gives the golden key to the traveler!');
    }

    if (typeof window !== 'undefined' && typeof window.showCenterStatusBox === 'function') {
      window.showCenterStatusBox('Game Over', 0);
    }
  }
}

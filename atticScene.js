/**
 * Attic Scene Builder - Gritty, Rustic & Weathered Overhaul
 * Procedural 3D Environment, High-Detail PBR Canvas Textures (Diffuse, Bump, Roughness),
 * Broken Window Volumetric Moonlight, Rustic Chest, Burlap Tarp, and Cobwebs.
 * 100% procedural - zero external GLBs required.
 */

import * as THREE from 'three';

// -------------------------------------------------------------
// Procedural High-Detail Rustic Textures (Diffuse, Bump, Roughness)
// -------------------------------------------------------------

/**
 * Splintered Dark Oak Floorboard Textures
 */
export function generateRusticFloorTextures() {
  const width = 512;
  const height = 512;

  // 1. Diffuse Canvas
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');

  // Base dark aged oak tone (#22160d)
  diffCtx.fillStyle = '#22160d';
  diffCtx.fillRect(0, 0, width, height);

  // 2. Bump Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d');
  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, width, height);

  // 3. Roughness Canvas (Matte dusty roughness 0.95)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext('2d');
  roughCtx.fillStyle = '#f2f2f2'; // Thick matte roughness ~0.95
  roughCtx.fillRect(0, 0, width, height);

  const plankHeight = 128;
  for (let p = 0; p < 4; p++) {
    const y = p * plankHeight;

    // Dark, splintered oak planks (#22160d with aged variants)
    const tones = ['#22160d', '#1a1008', '#26170d', '#160d06'];
    diffCtx.fillStyle = tones[p % tones.length];
    diffCtx.fillRect(0, y + 3, width, plankHeight - 6);

    // Deep splinter lines and dark grain fissures
    for (let l = 0; l < 35; l++) {
      const ly = y + Math.random() * plankHeight;
      const alpha = 0.25 + Math.random() * 0.45;
      diffCtx.strokeStyle = `rgba(12, 6, 2, ${alpha})`;
      diffCtx.lineWidth = 1.0 + Math.random() * 1.6;
      diffCtx.beginPath();
      diffCtx.moveTo(0, ly);
      diffCtx.bezierCurveTo(
        150, ly + (Math.random() - 0.5) * 16,
        350, ly + (Math.random() - 0.5) * 16,
        width, ly + (Math.random() - 0.5) * 8
      );
      diffCtx.stroke();

      // Bump map fissure
      bumpCtx.strokeStyle = 'rgba(20, 20, 20, 0.4)';
      bumpCtx.lineWidth = 1.2;
      bumpCtx.stroke();
    }

    // Weathered wood knots
    if (Math.random() > 0.25) {
      const kx = 60 + Math.random() * 380;
      const ky = y + 25 + Math.random() * (plankHeight - 50);
      diffCtx.fillStyle = 'rgba(10, 5, 2, 0.9)';
      diffCtx.beginPath();
      diffCtx.ellipse(kx, ky, 15, 8, Math.random() * 0.5, 0, Math.PI * 2);
      diffCtx.fill();

      // Knot rings
      diffCtx.strokeStyle = 'rgba(40, 25, 12, 0.6)';
      diffCtx.lineWidth = 1.5;
      diffCtx.beginPath();
      diffCtx.ellipse(kx, ky, 22, 12, Math.random() * 0.5, 0, Math.PI * 2);
      diffCtx.stroke();

      // Bump indentation
      bumpCtx.fillStyle = '#202020';
      bumpCtx.beginPath();
      bumpCtx.ellipse(kx, ky, 15, 8, 0, 0, Math.PI * 2);
      bumpCtx.fill();
    }

    // Hand-hammered square iron nail heads
    [24, 488].forEach((nx) => {
      diffCtx.fillStyle = '#0a0806';
      diffCtx.fillRect(nx - 3, y + 18, 7, 7);
      diffCtx.fillRect(nx - 3, y + plankHeight - 24, 7, 7);

      bumpCtx.fillStyle = '#e0e0e0';
      bumpCtx.fillRect(nx - 3, y + 18, 7, 7);
      bumpCtx.fillRect(nx - 3, y + plankHeight - 24, 7, 7);
    });

    // Deep dark plank seam shadow
    diffCtx.fillStyle = '#050302';
    diffCtx.fillRect(0, y, width, 5);

    bumpCtx.fillStyle = '#000000';
    bumpCtx.fillRect(0, y, width, 5);

    // Bevel edge highlight
    diffCtx.fillStyle = 'rgba(140, 105, 75, 0.2)';
    diffCtx.fillRect(0, y + 5, width, 2);
  }

  const map = new THREE.CanvasTexture(diffCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap, roughnessMap };
}

/**
 * Peeling Plaster Revealing Weathered Wooden Laths Underneath
 */
export function generatePeelingPlasterTextures() {
  const width = 512;
  const height = 512;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d');

  // Layer 1: Weathered wooden lath slats underneath (#2c1f14)
  diffCtx.fillStyle = '#22160d';
  diffCtx.fillRect(0, 0, width, height);

  // Horizontal wood laths
  const lathH = 24;
  for (let y = 0; y < height; y += lathH) {
    diffCtx.fillStyle = (y / lathH) % 2 === 0 ? '#2c1e14' : '#26190f';
    diffCtx.fillRect(0, y + 2, width, lathH - 4);

    // Seam gap between wooden laths
    diffCtx.fillStyle = '#0a0604';
    diffCtx.fillRect(0, y, width, 2);
  }

  // Layer 2: Decaying, dark brown/grey plaster (#2c2522)
  bumpCtx.fillStyle = '#202020'; // Laths sunken
  bumpCtx.fillRect(0, 0, width, height);

  // Draw irregular peeling plaster islands (#2c2522)
  diffCtx.fillStyle = '#2c2522';
  bumpCtx.fillStyle = '#d5d5d5'; // Plaster raised

  const plasterPatches = [
    { x: 120, y: 140, rx: 160, ry: 130 },
    { x: 380, y: 260, rx: 150, ry: 170 },
    { x: 160, y: 390, rx: 180, ry: 120 },
    { x: 420, y: 80,  rx: 110, ry: 90 }
  ];

  plasterPatches.forEach((p) => {
    diffCtx.beginPath();
    bumpCtx.beginPath();
    for (let a = 0; a <= Math.PI * 2; a += 0.25) {
      const rMod = 0.75 + Math.sin(a * 5.0) * 0.18 + Math.cos(a * 3.0) * 0.12;
      const px = p.x + Math.cos(a) * p.rx * rMod;
      const py = p.y + Math.sin(a) * p.ry * rMod;
      if (a === 0) {
        diffCtx.moveTo(px, py);
        bumpCtx.moveTo(px, py);
      } else {
        diffCtx.lineTo(px, py);
        bumpCtx.lineTo(px, py);
      }
    }
    diffCtx.closePath();
    diffCtx.fill();
    bumpCtx.closePath();
    bumpCtx.fill();
  });

  // Dark damp water stains, grime, and mildew discoloration
  for (let i = 0; i < 45; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    const rad = 25 + Math.random() * 95;
    const grad = diffCtx.createRadialGradient(rx, ry, 0, rx, ry, rad);
    grad.addColorStop(0, 'rgba(16, 12, 10, 0.68)');
    grad.addColorStop(0.6, 'rgba(24, 18, 14, 0.35)');
    grad.addColorStop(1, 'rgba(24, 18, 14, 0)');
    diffCtx.fillStyle = grad;
    diffCtx.beginPath();
    diffCtx.arc(rx, ry, rad, 0, Math.PI * 2);
    diffCtx.fill();
  }

  // Deep jagged cracks through plaster
  diffCtx.strokeStyle = 'rgba(10, 6, 4, 0.95)';
  bumpCtx.strokeStyle = '#000000';
  diffCtx.lineWidth = 2.4;
  bumpCtx.lineWidth = 3.0;

  for (let c = 0; c < 7; c++) {
    let cx = 30 + Math.random() * 450;
    let cy = 30 + Math.random() * 450;
    diffCtx.beginPath();
    bumpCtx.beginPath();
    diffCtx.moveTo(cx, cy);
    bumpCtx.moveTo(cx, cy);
    for (let s = 0; s < 7; s++) {
      cx += (Math.random() - 0.5) * 55;
      cy += 20 + Math.random() * 45;
      diffCtx.lineTo(cx, cy);
      bumpCtx.lineTo(cx, cy);
    }
    diffCtx.stroke();
    bumpCtx.stroke();
  }

  const map = new THREE.CanvasTexture(diffCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap };
}

/**
 * Heavy Rough-Hewn Cedar Timber Rafters
 */
export function generateCedarRafterTextures() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2c1c12';
  ctx.fillRect(0, 0, 512, 512);

  // Deep axial wood splits and axe hewing marks
  for (let i = 0; i < 45; i++) {
    const y = Math.random() * 512;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(8, 4, 2, 0.7)' : 'rgba(18, 10, 5, 0.45)';
    ctx.lineWidth = 1.2 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + (Math.random() - 0.5) * 30);
    ctx.stroke();
  }

  // Adze chop indentations
  for (let c = 0; c < 20; c++) {
    ctx.fillStyle = 'rgba(12, 6, 3, 0.55)';
    const cx = Math.random() * 480;
    const cy = Math.random() * 480;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 25, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Rough Woven Burlap Tarp Texture with Frayed Jute (#5c5042)
 */
export function generateBurlapTextures() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#5c5042'; // Earthy rough burlap
  ctx.fillRect(0, 0, 256, 256);

  // Thick coarse jute weave
  ctx.fillStyle = 'rgba(38, 30, 22, 0.42)';
  for (let x = 0; x < 256; x += 4) {
    ctx.fillRect(x, 0, 2, 256);
  }
  for (let y = 0; y < 256; y += 4) {
    ctx.fillRect(0, y, 256, 2);
  }

  // Uneven slub yarn variations and stains
  for (let i = 0; i < 25; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, 35);
    grad.addColorStop(0, 'rgba(28, 20, 14, 0.5)');
    grad.addColorStop(1, 'rgba(28, 20, 14, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, 35, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Corroded Rusty Iron Straps & Brackets
 */
export function generateRustyIronTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark forged iron base
  ctx.fillStyle = '#221f1d';
  ctx.fillRect(0, 0, 256, 256);

  // Orange-brown rust bloom and pitting (#7a3818 / #5c2810)
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 8;
    ctx.fillStyle = Math.random() > 0.4 ? 'rgba(122, 56, 24, 0.55)' : 'rgba(92, 40, 16, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

export const generateAgedMetalTexture = generateRustyIronTexture;
export const generateMetalTexture = generateRustyIronTexture;

/**
 * Torn Semi-Transparent Cobweb Texture
 */
export function generateCobwebTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 256);

  // Gossamer radiating silk strands originating from corner (0, 0)
  ctx.strokeStyle = 'rgba(230, 235, 245, 0.55)';
  ctx.lineWidth = 1.2;

  const numRadials = 16;
  for (let i = 0; i <= numRadials; i++) {
    const angle = (i / numRadials) * (Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * 250, Math.sin(angle) * 250);
    ctx.stroke();
  }

  // Concentric spiral threads with gentle sagging catenaries
  for (let r = 35; r < 240; r += 26) {
    ctx.beginPath();
    for (let i = 0; i <= numRadials; i++) {
      const angle = (i / numRadials) * (Math.PI / 2);
      const sag = Math.sin((i / numRadials) * Math.PI) * 5;
      const px = Math.cos(angle) * (r + sag);
      const py = Math.sin(angle) * (r + sag);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Torn gaps / ragged holes in the web
  ctx.globalCompositeOperation = 'destination-out';
  for (let h = 0; h < 4; h++) {
    ctx.beginPath();
    ctx.arc(60 + Math.random() * 120, 60 + Math.random() * 120, 18 + Math.random() * 22, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function generateFeatherTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 512);

  // Central quill shaft
  ctx.strokeStyle = '#ded3be';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 480);
  ctx.bezierCurveTo(128, 300, 126, 120, 128, 20);
  ctx.stroke();

  // Feathery barbs fanning out
  for (let y = 30; y < 460; y += 3) {
    const progress = (y - 30) / 430;
    const width = Math.sin(progress * Math.PI) * 75;

    const grad = ctx.createLinearGradient(128 - width, y, 128 + width, y);
    grad.addColorStop(0, 'rgba(230, 222, 208, 0)');
    grad.addColorStop(0.3, 'rgba(160, 190, 215, 0.85)');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(0.7, 'rgba(160, 190, 215, 0.85)');
    grad.addColorStop(1, 'rgba(230, 222, 208, 0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(128 - width, y + 12);
    ctx.quadraticCurveTo(128, y, 128 + width, y + 12);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

// -------------------------------------------------------------
// 1. Gritty, Rustic Attic Environment Assembly
// -------------------------------------------------------------

export const ATTIC_THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const THEME_CONFIGS = {
  light: {
    name: 'Daylight Attic (Warm Sunlit)',
    background: 0xdde9f5,      // Soft, bright daylight sky visible through the windows
    fogColor: 0xd2e2f0,        // Soft morning mist
    fogDensity: 0.010,         // Clean, airy visibility across the entire room
    ambientColor: 0xfff4e6,    // Warm daylight bounce
    ambientIntensity: 2.35,    // Bright, non-glaring fill illumination
    sunColor: 0xffeed4,        // Warm golden sunlight streaming through window
    sunIntensity: 3.4,
    spotColor: 0xffe2b0,       // Warm sun spotlight on the chest
    spotIntensity: 4.8,
    shaftColor: 0xffd88e,      // Golden volumetric light shaft
    shaftOpacity: 0.09,
    floorColor: 0x8e684c,      // Warm golden natural oak floorboards
    wallColor: 0xd2c4b2,       // Warm bright weathered plaster
    beamColor: 0x885434,       // Warm honey cedar rafters & crates
    handEmissive: 0x1f2838
  },
  dark: {
    name: 'Moonlit Attic (Rustic Night)',
    background: 0x14100e,
    fogColor: 0x14100e,
    fogDensity: 0.038,
    ambientColor: 0x28344c,
    ambientIntensity: 1.15,
    sunColor: 0x9bc4ff,
    sunIntensity: 1.75,
    spotColor: 0xaed4ff,
    spotIntensity: 3.4,
    shaftColor: 0x9bc2ff,
    shaftOpacity: 0.045,
    floorColor: 0x22160d,
    wallColor: 0x2c2522,
    beamColor: 0x3a2416,
    handEmissive: 0x2a3242
  }
};

export function buildAtticEnvironment(scene, chestTargetPos = new THREE.Vector3(-0.35, 0.38, -0.75), initialTheme = 'light') {
  const floorTex = generateRusticFloorTextures();
  const plasterTex = generatePeelingPlasterTextures();
  const cedarTex = generateCedarRafterTextures();
  const cobwebTex = generateCobwebTexture();

  // Floorboards Material (Splintered oak, thick matte roughness 0.95)
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTex.map,
    color: 0x8e684c,
    bumpMap: floorTex.bumpMap,
    bumpScale: 0.045,
    roughnessMap: floorTex.roughnessMap,
    roughness: 0.95,
    metalness: 0.02
  });

  // Walls Material (Weathered plaster revealing laths)
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: plasterTex.map,
    color: 0xd2c4b2,
    bumpMap: plasterTex.bumpMap,
    bumpScale: 0.055,
    roughness: 0.95,
    metalness: 0.02
  });

  // Cedar Timber Beam Material (Rough-hewn timber rafters)
  const beamMaterial = new THREE.MeshStandardMaterial({
    map: cedarTex,
    color: 0x885434,
    roughness: 0.88,
    metalness: 0.06
  });

  const atticRoot = new THREE.Group();
  atticRoot.name = 'attic-root';

  // 1. Wooden Floorboards with Individual 3D Plank Meshes
  const floorGroup = new THREE.Group();
  const floorBaseGeo = new THREE.PlaneGeometry(8.0, 8.0);
  floorBaseGeo.rotateX(-Math.PI / 2);
  const floorBase = new THREE.Mesh(floorBaseGeo, floorMaterial);
  floorBase.receiveShadow = true;
  floorGroup.add(floorBase);

  // Tactile raised floorboards with dark seam gaps
  const plankGeo = new THREE.BoxGeometry(0.32, 0.02, 7.6);
  for (let i = -11; i <= 11; i++) {
    const plank = new THREE.Mesh(plankGeo, floorMaterial);
    plank.position.set(i * 0.33, 0.01 + (i % 2) * 0.003, 0);
    plank.receiveShadow = true;
    floorGroup.add(plank);
  }
  atticRoot.add(floorGroup);

  // 2. Enclosed Attic Walls (Back, Left, Right)
  const wallGeo = new THREE.PlaneGeometry(8.0, 4.2);

  // Back Wall
  const backWall = new THREE.Mesh(wallGeo, wallMaterial);
  backWall.position.set(0, 2.1, -3.8);
  backWall.receiveShadow = true;
  atticRoot.add(backWall);

  // Right Sloping Wall
  const rightWall = new THREE.Mesh(wallGeo, wallMaterial);
  rightWall.position.set(3.8, 2.1, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  atticRoot.add(rightWall);

  // Left Wall
  const leftWall = new THREE.Mesh(wallGeo, wallMaterial);
  leftWall.position.set(-3.8, 2.1, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  atticRoot.add(leftWall);

  // 3. Slanted Roof & Heavy Timber Rafters Overhead
  const roofGroup = new THREE.Group();
  const roofHalfGeo = new THREE.PlaneGeometry(8.0, 4.6);

  // Left Slanted Roof
  const leftRoof = new THREE.Mesh(roofHalfGeo, wallMaterial);
  leftRoof.position.set(-1.9, 2.9, 0);
  leftRoof.rotation.set(0, Math.PI / 2, Math.PI / 4);
  roofGroup.add(leftRoof);

  // Right Slanted Roof
  const rightRoof = new THREE.Mesh(roofHalfGeo, wallMaterial);
  rightRoof.position.set(1.9, 2.9, 0);
  rightRoof.rotation.set(0, -Math.PI / 2, -Math.PI / 4);
  roofGroup.add(rightRoof);

  // Central Ridge Timber Beam Overhead
  const ridgeBeamGeo = new THREE.BoxGeometry(0.28, 0.28, 7.8);
  const ridgeBeam = new THREE.Mesh(ridgeBeamGeo, beamMaterial);
  ridgeBeam.position.set(0, 3.95, 0);
  ridgeBeam.castShadow = true;
  roofGroup.add(ridgeBeam);

  // Diagonal Wooden Ceiling Rafters & Cross Collar Ties
  const rafterGeo = new THREE.BoxGeometry(0.16, 0.22, 3.4);
  const collarGeo = new THREE.BoxGeometry(2.8, 0.16, 0.16);

  for (let z = -3.2; z <= 3.2; z += 1.3) {
    const rLeft = new THREE.Mesh(rafterGeo, beamMaterial);
    rLeft.position.set(-1.35, 2.9, z);
    rLeft.rotation.z = -Math.PI / 4;
    rLeft.castShadow = true;
    roofGroup.add(rLeft);

    const rRight = new THREE.Mesh(rafterGeo, beamMaterial);
    rRight.position.set(1.35, 2.9, z);
    rRight.rotation.z = Math.PI / 4;
    rRight.castShadow = true;
    roofGroup.add(rRight);

    const collar = new THREE.Mesh(collarGeo, beamMaterial);
    collar.position.set(0, 2.65, z);
    collar.castShadow = true;
    roofGroup.add(collar);
  }
  atticRoot.add(roofGroup);

  // 4. Semi-Transparent Layered Procedural Cobwebs Across Corners & Rafter Beams
  const cobwebMat = new THREE.MeshBasicMaterial({
    map: cobwebTex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const webCorners = [
    { pos: [-2.4, 3.3, -3.2], rot: [0, Math.PI / 4, 0], scale: 1.3 },
    { pos: [2.4, 3.3, -3.2],  rot: [0, -Math.PI / 4, 0], scale: 1.2 },
    { pos: [-1.8, 2.8, -1.3], rot: [Math.PI / 6, Math.PI / 3, 0], scale: 1.0 },
    { pos: [0.0, 3.7, -2.6],  rot: [0, 0, Math.PI / 4], scale: 1.1 },
    { pos: [1.6, 2.7, 0.4],   rot: [-Math.PI / 6, -Math.PI / 3, 0], scale: 0.95 },
    { pos: [-0.9, 3.1, -2.0], rot: [Math.PI / 4, 0, Math.PI / 6], scale: 0.85 },
    { pos: [0.0, 3.85, 0.0],  rot: [Math.PI / 2, 0, 0], scale: 1.4 }, // Ridge beam web
    { pos: [-3.2, 1.2, -3.4], rot: [0, Math.PI / 3, 0], scale: 0.8 }  // Corner near floor
  ];

  webCorners.forEach((wc) => {
    const webMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), cobwebMat);
    webMesh.position.set(...wc.pos);
    webMesh.rotation.set(...wc.rot);
    webMesh.scale.setScalar(wc.scale);
    atticRoot.add(webMesh);
  });

  // 5. Broken Corner Window & Narrow Volumetric Light Shaft
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-2.2, 2.4, -3.75);

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x22160e,
    roughness: 0.9,
    metalness: 0.1
  });
  const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.45, 0.08), frameMat);
  windowGroup.add(frameOuter);

  // Night Sky Backdrop
  const skyMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 1.3),
    new THREE.MeshBasicMaterial({ color: 0x081328 })
  );
  skyMesh.position.z = -0.02;
  windowGroup.add(skyMesh);

  // Full Moon Outside
  const moonMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 32),
    new THREE.MeshBasicMaterial({ color: 0xeef5ff })
  );
  moonMesh.position.set(0.18, 0.3, -0.015);
  windowGroup.add(moonMesh);

  // Window Crossbars
  const barH = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.04), frameMat);
  const barV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.04), frameMat);
  barH.position.z = 0.02;
  barV.position.z = 0.02;
  windowGroup.add(barH);
  windowGroup.add(barV);

  // Broken jagged glass shards
  const shardMat = new THREE.MeshPhysicalMaterial({
    color: 0xaecbe8,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    transmission: 0.85
  });
  const shardGeo = new THREE.BufferGeometry();
  shardGeo.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.42, -0.6, 0.01,
    -0.1, -0.6, 0.01,
    -0.35, -0.2, 0.01
  ], 3));
  shardGeo.computeVertexNormals();
  const shard1 = new THREE.Mesh(shardGeo, shardMat);
  windowGroup.add(shard1);

  atticRoot.add(windowGroup);

  // -----------------------------------------------------------
  // LIGHTING ASSEMBLY (Moody, Atmospheric, Non-Blinding)
  // -----------------------------------------------------------

  // Ambient Fill Light (Soft moonlight bounce, keeps wood textured and readable)
  const ambientLight = new THREE.AmbientLight(0x28344c, 1.15);
  atticRoot.add(ambientLight);

  // Directional Moonlight streaming through broken window
  const moonlight = new THREE.DirectionalLight(0x9bc4ff, 1.75);
  moonlight.position.set(-2.5, 3.4, -3.6);
  moonlight.target.position.copy(chestTargetPos);
  moonlight.castShadow = true;
  moonlight.shadow.mapSize.width = 1024;
  moonlight.shadow.mapSize.height = 1024;
  moonlight.shadow.camera.near = 0.5;
  moonlight.shadow.camera.far = 10.0;
  moonlight.shadow.bias = -0.0008;
  atticRoot.add(moonlight);
  atticRoot.add(moonlight.target);

  // Narrow Volumetric SpotLight beaming directly from the window onto the chest
  const moonlightSpot = new THREE.SpotLight(0xaed4ff, 3.4);
  moonlightSpot.position.set(-2.2, 2.6, -3.7);
  moonlightSpot.target.position.copy(chestTargetPos);
  moonlightSpot.angle = Math.PI / 5.5;
  moonlightSpot.penumbra = 0.5;
  moonlightSpot.decay = 0.8;
  moonlightSpot.distance = 12.0;
  atticRoot.add(moonlightSpot);
  atticRoot.add(moonlightSpot.target);

  // Volumetric Light Shaft (Subtle translucent light beam, non-blinding opacity 0.045)
  const beamDist = moonlightSpot.position.distanceTo(chestTargetPos);
  const shaftGeo = new THREE.CylinderGeometry(0.35, 1.45, beamDist, 24, 1, true);
  shaftGeo.rotateX(Math.PI / 2);
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0x9bc2ff,
    transparent: true,
    opacity: 0.045,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const moonShaft = new THREE.Mesh(shaftGeo, shaftMat);
  moonShaft.position.lerpVectors(moonlightSpot.position, chestTargetPos, 0.5);
  moonShaft.lookAt(chestTargetPos);
  atticRoot.add(moonShaft);

  // Soft atmospheric attic fog
  scene.fog = new THREE.FogExp2(0xd2e2f0, 0.010);

  // Background Props in shadows
  const crateGeo = new THREE.BoxGeometry(0.5, 0.45, 0.5);
  const crate1 = new THREE.Mesh(crateGeo, beamMaterial);
  crate1.position.set(-2.6, 0.22, -2.5);
  crate1.rotation.y = 0.3;
  crate1.castShadow = true;
  crate1.receiveShadow = true;
  atticRoot.add(crate1);

  const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.44), beamMaterial);
  crate2.position.set(-2.55, 0.62, -2.45);
  crate2.rotation.y = -0.15;
  crate2.castShadow = true;
  crate2.receiveShadow = true;
  atticRoot.add(crate2);

  // Rustic wooden chest bench
  const benchGeo = new THREE.BoxGeometry(0.76, 0.36, 0.58);
  const bench = new THREE.Mesh(benchGeo, beamMaterial);
  bench.position.set(chestTargetPos.x, 0.18, chestTargetPos.z);
  bench.castShadow = true;
  bench.receiveShadow = true;
  atticRoot.add(bench);

  scene.add(atticRoot);

  const applyTheme = (themeName) => {
    const cfg = THEME_CONFIGS[themeName] || THEME_CONFIGS.light;
    floorMaterial.color.setHex(cfg.floorColor);
    wallMaterial.color.setHex(cfg.wallColor);
    beamMaterial.color.setHex(cfg.beamColor);
    ambientLight.color.setHex(cfg.ambientColor);
    ambientLight.intensity = cfg.ambientIntensity;
    moonlight.color.setHex(cfg.sunColor);
    moonlight.intensity = cfg.sunIntensity;
    moonlightSpot.color.setHex(cfg.spotColor);
    moonlightSpot.intensity = cfg.spotIntensity;
    shaftMat.color.setHex(cfg.shaftColor);
    shaftMat.opacity = cfg.shaftOpacity;

    if (scene.background) {
      scene.background.setHex(cfg.background);
    }
    if (scene.fog) {
      scene.fog.color.setHex(cfg.fogColor);
      scene.fog.density = cfg.fogDensity;
    }
  };

  applyTheme(initialTheme);

  return {
    atticRoot,
    moonlight,
    moonlightSpot,
    moonShaft,
    ambientLight,
    floorMaterial,
    wallMaterial,
    beamMaterial,
    shaftMat,
    applyTheme,
    setTheme: applyTheme
  };
}

// -------------------------------------------------------------
// The Antique Wooden Chest with Localized Cyan Inner Glow
// -------------------------------------------------------------

export function buildOrnateChest(scene, chestPos = new THREE.Vector3(-0.35, 0.36, -0.75)) {
  const cedarTex = generateCedarRafterTextures();
  const rustTex = generateRustyIronTexture();

  const chestGroup = new THREE.Group();
  chestGroup.name = 'chestGroup';
  chestGroup.position.copy(chestPos);

  const chestWoodMat = new THREE.MeshStandardMaterial({
    map: cedarTex,
    color: 0x3d2718, // Rustic dark cedar
    roughness: 0.75,
    metalness: 0.08
  });

  const chestMetalMat = new THREE.MeshStandardMaterial({
    map: rustTex,
    color: 0x7a6350,
    roughness: 0.65,
    metalness: 0.75
  });

  const width = 0.56;
  const height = 0.25;
  const depth = 0.40;

  // 1. Antique Chest Base
  const baseBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), chestWoodMat);
  baseBox.position.set(0, height / 2, 0);
  baseBox.castShadow = true;
  baseBox.receiveShadow = true;
  chestGroup.add(baseBox);

  // Rusty iron corner fittings and straps
  const strapGeoH = new THREE.BoxGeometry(width + 0.008, 0.03, depth + 0.008);
  const strapBottom = new THREE.Mesh(strapGeoH, chestMetalMat);
  strapBottom.position.set(0, 0.02, 0);
  chestGroup.add(strapBottom);

  const strapTop = new THREE.Mesh(strapGeoH, chestMetalMat);
  strapTop.position.set(0, height - 0.015, 0);
  chestGroup.add(strapTop);

  // Antique Brass Latch Material
  const brassLatchMat = new THREE.MeshStandardMaterial({
    color: 0xc89d4d,
    roughness: 0.45,
    metalness: 0.82
  });

  // Front Keyhole / Brass Latch Plate
  const latchPlate = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.085, 0.015), brassLatchMat);
  latchPlate.name = 'brassLatchPlate';
  latchPlate.position.set(0, height - 0.045, depth / 2 + 0.008);
  chestGroup.add(latchPlate);

  // 2. Chest Lid (Hinged strictly at rear-top edge: [0, height, -depth * 0.5])
  const lidHinge = new THREE.Group();
  lidHinge.name = 'lidHinge';
  lidHinge.position.set(0, height, -depth * 0.5);

  const lidMeshGroup = new THREE.Group();
  lidMeshGroup.position.set(0, 0, depth * 0.5);

  const lidWidth = width + 0.01;
  const lidGeo = new THREE.CylinderGeometry(depth / 2, depth / 2, lidWidth, 24, 1, false, 0, Math.PI);
  lidGeo.rotateZ(Math.PI / 2);
  const lidMesh = new THREE.Mesh(lidGeo, chestWoodMat);
  lidMesh.scale.set(1, 0.65, 1);
  lidMesh.castShadow = true;
  lidMesh.receiveShadow = true;
  lidMeshGroup.add(lidMesh);

  // Brass straps on lid matching chest base
  const brassStrapMat = new THREE.MeshStandardMaterial({
    color: 0xc89d4d, // Antique Brass matching chest base straps & latch
    roughness: 0.45,
    metalness: 0.82
  });
  const lidBandGeo = new THREE.CylinderGeometry(depth / 2 + 0.006, depth / 2 + 0.006, 0.035, 24, 1, false, 0, Math.PI);
  lidBandGeo.rotateZ(Math.PI / 2);
  [-width * 0.35, 0, width * 0.35].forEach((bx) => {
    const band = new THREE.Mesh(lidBandGeo, brassStrapMat);
    band.position.set(bx, 0, 0);
    band.scale.set(1, 0.66, 1);
    band.castShadow = true;
    lidMeshGroup.add(band);
  });

  // Dark velvet inner lining on the lid underside
  const velvetInnerMat = new THREE.MeshStandardMaterial({
    color: 0x140e1a, // Dark velvet inner lining
    roughness: 0.95,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const lidInnerLining = new THREE.Mesh(new THREE.PlaneGeometry(lidWidth - 0.01, depth), velvetInnerMat);
  lidInnerLining.rotation.x = Math.PI / 2;
  lidInnerLining.position.set(0, 0.001, 0);
  lidMeshGroup.add(lidInnerLining);

  // Front Brass Latch Clasp
  const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.065, 0.02), brassLatchMat);
  clasp.name = 'brassLatchClasp';
  clasp.position.set(0, -0.02, depth / 2 + 0.006);
  lidMeshGroup.add(clasp);

  // Lid Handle / Grab point
  const handleMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.042, 0.0085, 8, 16, Math.PI),
    chestMetalMat
  );
  handleMesh.rotateX(Math.PI / 2);
  handleMesh.position.set(0, 0.13, 0);
  lidMeshGroup.add(handleMesh);

  lidHinge.add(lidMeshGroup);
  chestGroup.add(lidHinge);

  // 3. Mystic Inner Box with Strictly Localized Cyan Glow
  const velvetMat = new THREE.MeshStandardMaterial({
    color: 0x160c22,
    roughness: 0.95,
    metalness: 0.05
  });
  const velvet = new THREE.Mesh(new THREE.BoxGeometry(width - 0.06, 0.04, depth - 0.06), velvetMat);
  velvet.position.set(0, height - 0.015, 0);
  chestGroup.add(velvet);

  const mysticBoxGeo = new THREE.BoxGeometry(0.44, 0.09, 0.3);
  const mysticBoxMat = new THREE.MeshStandardMaterial({
    color: 0x182638,
    roughness: 0.45,
    metalness: 0.55
  });
  const mysticBox = new THREE.Mesh(mysticBoxGeo, mysticBoxMat);
  mysticBox.position.set(0, height + 0.02, 0);
  chestGroup.add(mysticBox);

  // Internal Cyan Point Light (#00b8e6, localized, toned down by 70% to subtle intensity 0.72)
  const innerLight = new THREE.PointLight(0x00b8e6, 0.72, 2.6, 1.8);
  innerLight.position.set(0, height + 0.08, 0);
  innerLight.castShadow = true;
  chestGroup.add(innerLight);

  // Localized subtle seam glow strips (reduced by 70% to opacity 0.16)
  const seamMat = new THREE.MeshBasicMaterial({
    color: 0x00a8cc,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending
  });

  const seamFront = new THREE.Mesh(new THREE.BoxGeometry(width - 0.02, 0.01, 0.015), seamMat);
  seamFront.position.set(0, height, depth / 2 - 0.005);
  chestGroup.add(seamFront);

  const seamLeft = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.01, depth - 0.04), seamMat);
  seamLeft.position.set(-width / 2 + 0.01, height, 0);
  const seamRight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.01, depth - 0.04), seamMat);
  seamRight.position.set(width / 2 - 0.01, height, 0);
  chestGroup.add(seamLeft);
  chestGroup.add(seamRight);

  scene.add(chestGroup);

  return {
    chestGroup,
    lidHinge,
    innerLight,
    seamMat,
    mysticBox,
    latchPlate,
    clasp,
    lidHeight: height,
    boxDepth: depth
  };
}

// -------------------------------------------------------------
// Rough Woven Burlap Tarp (#5c5042) with Edge Displacement
// -------------------------------------------------------------

export function buildCanvasTarp(scene, chestPos = new THREE.Vector3(-0.35, 0.36, -0.75)) {
  const burlapTex = generateBurlapTextures();
  burlapTex.repeat.set(2, 2);

  const tarpMat = new THREE.MeshStandardMaterial({
    map: burlapTex,
    color: 0x5c5042, // Rough earthy burlap
    roughness: 0.94,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  const width = 0.86;
  const depth = 0.70;
  const segsW = 24;
  const segsD = 24;
  const tarpGeo = new THREE.PlaneGeometry(width, depth, segsW, segsD);
  tarpGeo.rotateX(-Math.PI / 2);

  const posAttr = tarpGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);

    let y = 0.0;
    const distEdgeX = Math.max(0, Math.abs(x) - 0.27);
    const distEdgeZ = Math.max(0, Math.abs(z) - 0.20);

    y -= Math.pow(distEdgeX * 3.8, 1.35) * 0.25;
    y -= Math.pow(distEdgeZ * 3.8, 1.35) * 0.25;

    y += Math.sin(x * 18 + z * 14) * 0.014;
    y += Math.cos(x * 26 - z * 12) * 0.009;

    const edgeFactor = Math.min(1.0, (distEdgeX + distEdgeZ) * 4.0);
    y += Math.sin(x * 35) * 0.015 * edgeFactor;

    // Corner slightly lifted allowing cyan glow to peek out
    if (x > 0.18 && z > 0.12) {
      y += 0.038;
    }

    posAttr.setY(i, y);
  }
  tarpGeo.computeVertexNormals();

  const tarpMesh = new THREE.Mesh(tarpGeo, tarpMat);
  tarpMesh.name = 'tarpMesh';
  tarpMesh.position.set(chestPos.x, chestPos.y + 0.36, chestPos.z);
  tarpMesh.castShadow = true;
  tarpMesh.receiveShadow = true;
  scene.add(tarpMesh);

  return { tarpMesh, tarpMat };
}

// -------------------------------------------------------------
// The Procedural Dreamcatcher (Dream Hanger)
// -------------------------------------------------------------

export function buildDreamcatcher(scene, chestPos = new THREE.Vector3(-0.35, 0.36, -0.75)) {
  const dreamcatcherGroup = new THREE.Group();
  dreamcatcherGroup.name = 'dreamcatcher';
  // Positioned lying flat deep inside the chest cavity (hidden until box is opened)
  dreamcatcherGroup.position.set(chestPos.x, chestPos.y + 0.10, chestPos.z);
  dreamcatcherGroup.rotation.x = -Math.PI / 2;
  dreamcatcherGroup.visible = false;

  // 1. Woven Circular Outer Frame
  const hoopRadius = 0.15;
  const hoopTube = 0.008;
  const hoopGeo = new THREE.TorusGeometry(hoopRadius, hoopTube, 16, 48);
  const hoopMat = new THREE.MeshStandardMaterial({
    color: 0x3e2617,
    roughness: 0.78,
    metalness: 0.12
  });
  const hoopMesh = new THREE.Mesh(hoopGeo, hoopMat);
  hoopMesh.castShadow = true;
  dreamcatcherGroup.add(hoopMesh);

  // Brass binding accents
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xb89855,
    roughness: 0.45,
    metalness: 0.82
  });
  for (let b = 0; b < 12; b++) {
    const angle = (b / 12) * Math.PI * 2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(hoopTube * 1.5, 0.0025, 8, 16), accentMat);
    ring.position.set(Math.cos(angle) * hoopRadius, Math.sin(angle) * hoopRadius, 0);
    ring.rotation.z = angle + Math.PI / 2;
    dreamcatcherGroup.add(ring);
  }

  // 2. Radial String Lines & Sacred Geometry Web
  const webMat = new THREE.LineBasicMaterial({
    color: 0xded5c4,
    transparent: true,
    opacity: 0.85,
    linewidth: 1.5
  });

  const webPoints = [];
  const outerVerts = [];
  const numOuter = 12;

  for (let i = 0; i < numOuter; i++) {
    const angle = (i / numOuter) * Math.PI * 2;
    outerVerts.push(new THREE.Vector3(Math.cos(angle) * (hoopRadius - 0.005), Math.sin(angle) * (hoopRadius - 0.005), 0));
  }

  let currentRing = outerVerts;
  for (let tier = 0; tier < 3; tier++) {
    const nextRing = [];
    const count = currentRing.length;
    const shrink = 0.68;

    for (let j = 0; j < count; j++) {
      const p1 = currentRing[j];
      const p2 = currentRing[(j + 1) % count];
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).multiplyScalar(shrink);
      nextRing.push(mid);

      webPoints.push(p1.x, p1.y, p1.z);
      webPoints.push(mid.x, mid.y, mid.z);
      webPoints.push(mid.x, mid.y, mid.z);
      webPoints.push(p2.x, p2.y, p2.z);
    }
    currentRing = nextRing;
  }

  const centerPos = new THREE.Vector3(0, 0, 0);
  currentRing.forEach((p) => {
    webPoints.push(p.x, p.y, p.z);
    webPoints.push(centerPos.x, centerPos.y, centerPos.z);
  });

  const webGeo = new THREE.BufferGeometry();
  webGeo.setAttribute('position', new THREE.Float32BufferAttribute(webPoints, 3));
  const webLines = new THREE.LineSegments(webGeo, webMat);
  dreamcatcherGroup.add(webLines);

  // Central Cyan Crystal Bead
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x00d2ff,
    emissive: 0x0099cc,
    emissiveIntensity: 0.85,
    roughness: 0.15,
    transmission: 0.6,
    thickness: 0.02
  });
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.016, 0), crystalMat);
  dreamcatcherGroup.add(crystal);

  // 3. Dangling Feathers and 3 Distinct Seashell Child Objects
  const featherTex = generateFeatherTexture();
  const featherMat = new THREE.MeshStandardMaterial({
    map: featherTex,
    transparent: true,
    alphaTest: 0.1,
    side: THREE.DoubleSide,
    roughness: 0.7
  });

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5ede0,
    roughness: 0.25,
    metalness: 0.08,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
    iridescence: 0.65,
    iridescenceIOR: 1.35
  });

  const strands = [
    { x: -0.075, threadLen: 0.20, shellOffset: 0.11, isFallingShell: false, name: 'leftShell' },
    { x: 0.0,    threadLen: 0.26, shellOffset: 0.14, isFallingShell: true,  name: 'fallingShell' },
    { x: 0.075,  threadLen: 0.20, shellOffset: 0.11, isFallingShell: false, name: 'rightShell' }
  ];

  let fallingShell = null;
  let centerThread = null;
  const shellObjects = [];

  strands.forEach((strand, idx) => {
    const bottomHoopY = -hoopRadius;
    const strandGroup = new THREE.Group();
    strandGroup.position.set(strand.x, bottomHoopY, 0);

    const threadGeo = new THREE.CylinderGeometry(0.0015, 0.0015, strand.threadLen, 6);
    threadGeo.translate(0, -strand.threadLen / 2, 0);
    const threadMesh = new THREE.Mesh(threadGeo, webMat);
    strandGroup.add(threadMesh);

    if (strand.isFallingShell) {
      centerThread = threadMesh;
    }

    const featherGeo = new THREE.PlaneGeometry(0.048, 0.135);
    featherGeo.translate(0, -0.067, 0);
    const featherMesh = new THREE.Mesh(featherGeo, featherMat);
    featherMesh.position.set(0, -strand.threadLen, 0);
    featherMesh.rotation.y = (idx - 1) * 0.35;
    strandGroup.add(featherMesh);

    const shellGeo = createScallopShellGeometry(0.026);
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.name = strand.name;
    shellMesh.castShadow = true;

    if (strand.isFallingShell) {
      shellMesh.position.set(strand.x, bottomHoopY - strand.shellOffset, 0);
      dreamcatcherGroup.add(shellMesh);
      fallingShell = shellMesh;
      fallingShell.userData = {
        isDetached: false,
        hasLanded: false,
        velocity: new THREE.Vector3(0, 0, 0),
        angularVelocity: new THREE.Vector3(0, 0, 0),
        initialScale: shellMesh.scale.clone()
      };
      shellObjects.push(fallingShell);
    } else {
      shellMesh.position.set(0, -strand.shellOffset, 0);
      strandGroup.add(shellMesh);
      shellObjects.push(shellMesh);
    }

    dreamcatcherGroup.add(strandGroup);
  });

  scene.add(dreamcatcherGroup);

  return {
    dreamcatcherGroup,
    fallingShell,
    centerThread,
    crystal,
    shellObjects
  };
}

function createScallopShellGeometry(radius = 0.026) {
  const geom = new THREE.BufferGeometry();
  const segments = 16;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  positions.push(0, 0, 0);
  normals.push(0, 0, 1);
  uvs.push(0.5, 0);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = (t - 0.5) * Math.PI * 0.85;
    const r = radius * (0.85 + Math.sin(t * Math.PI) * 0.3);
    const rib = Math.sin(t * Math.PI * 8) * (radius * 0.12);
    const x = Math.sin(angle) * r;
    const y = -Math.cos(angle) * r;
    const z = rib + (1.0 - t * (1.0 - t)) * (radius * 0.2);

    positions.push(x, y, z);
    normals.push(0, 0.3, 0.95);
    uvs.push(t, 1.0);
  }

  for (let i = 1; i <= segments; i++) {
    indices.push(0, i, i + 1);
    indices.push(0, i + 1, i);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

// -------------------------------------------------------------
// Automated Showcase Camera & Framing Configuration
// -------------------------------------------------------------

export const SHOWCASE_CONFIG = {
  chestPosition: new THREE.Vector3(-0.35, 0.36, -0.75),
  cameraFramingPosition: new THREE.Vector3(-0.35, 1.05, 0.45),
  cameraTarget: new THREE.Vector3(-0.35, 0.75, -0.65),
  dollyPosition: new THREE.Vector3(-0.35, 0, 0.45),
  cameraFOV: 58,
  handRestLeft: new THREE.Vector3(-0.48, 0.82, -0.42),
  handRestRight: new THREE.Vector3(-0.20, 0.82, -0.42)
};

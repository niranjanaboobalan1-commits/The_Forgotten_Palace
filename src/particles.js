/**
 * Procedural Particle Systems for the Old Dusty Attic
 * - Ambient Room Dust Motes (floating in moonlight)
 * - Cyan Box Glow Particles (pulsing around chest seams)
 * - Chest Opening Dust Burst
 * - Dreamcatcher Dust Puff on Brush/Swipe
 * - Expanding Golden Shockwave Particle Wave on Shell Impact
 */

import * as THREE from 'three';

/**
 * Creates a procedural circular glow sprite texture on a canvas.
 * Avoids any missing external asset errors.
 */
function createParticleTexture(colorHex = '#ffffff', blurRadius = 0.5) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(blurRadius * 0.5, colorHex);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const whiteTexture = createParticleTexture('#ffffff', 0.8);
const cyanTexture = createParticleTexture('#00b8e6', 0.5);
const goldTexture = createParticleTexture('#ffd700', 0.7);

/**
 * Ambient Attic Dust Motes
 */
export class AmbientDust {
  constructor(scene, count = 220) {
    this.count = count;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 6.5; // X
      positions[i * 3 + 1] = 0.2 + Math.random() * 2.8;   // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6.0; // Z

      speeds[i * 3 + 0] = (Math.random() - 0.5) * 0.04;
      speeds[i * 3 + 1] = -0.015 + Math.random() * 0.03;
      speeds[i * 3 + 2] = (Math.random() - 0.5) * 0.04;

      phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.04,
      map: whiteTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xc4d8ee
    });

    this.points = new THREE.Points(geometry, this.material);
    scene.add(this.points);

    this.positions = positions;
    this.speeds = speeds;
    this.phases = phases;
  }

  update(delta, time) {
    const pos = this.positions;
    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      pos[idx + 0] += Math.sin(time * 0.6 + this.phases[i]) * 0.003;
      pos[idx + 1] += this.speeds[idx + 1] * delta;
      pos[idx + 2] += Math.cos(time * 0.5 + this.phases[i]) * 0.003;

      if (pos[idx + 1] < 0.1) pos[idx + 1] = 3.0;
      if (pos[idx + 1] > 3.0) pos[idx + 1] = 0.1;
      if (pos[idx + 0] < -3.25) pos[idx + 0] = 3.25;
      if (pos[idx + 0] > 3.25) pos[idx + 0] = -3.25;
      if (pos[idx + 2] < -3.0) pos[idx + 2] = 3.0;
      if (pos[idx + 2] > 3.0) pos[idx + 2] = -3.0;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

/**
 * Cyan Box Glow Particles (subtle, pulsing dust motes around chest seams)
 */
export class BoxGlowParticles {
  constructor(scene, chestCenter = new THREE.Vector3(0, 0.65, -0.6), count = 55) {
    this.count = count;
    this.center = chestCenter.clone();

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const originalOffsets = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const rx = 0.26 + (Math.random() - 0.5) * 0.08;
      const rz = 0.18 + (Math.random() - 0.5) * 0.08;

      const ox = Math.cos(theta) * rx;
      const oy = (Math.random() - 0.5) * 0.16;
      const oz = Math.sin(theta) * rz;

      originalOffsets[i * 3 + 0] = ox;
      originalOffsets[i * 3 + 1] = oy;
      originalOffsets[i * 3 + 2] = oz;

      positions[i * 3 + 0] = this.center.x + ox;
      positions[i * 3 + 1] = this.center.y + oy;
      positions[i * 3 + 2] = this.center.z + oz;

      scales[i] = 0.4 + Math.random() * 0.5;
      speeds[i] = 0.6 + Math.random() * 0.9;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Reduced by 70%: size 0.032, opacity 0.32, soft ethereal cyan
    this.material = new THREE.PointsMaterial({
      size: 0.032,
      map: cyanTexture,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x00b4d8
    });

    this.points = new THREE.Points(geometry, this.material);
    scene.add(this.points);

    this.positions = positions;
    this.originalOffsets = originalOffsets;
    this.speeds = speeds;
  }

  update(delta, time, intensityBoost = 1.0) {
    const pos = this.positions;
    const offsets = this.originalOffsets;
    const pulse = 0.75 + Math.sin(time * 2.5) * 0.25 * intensityBoost;
    this.material.opacity = Math.min(0.55, 0.32 * pulse * intensityBoost);
    this.material.size = 0.032 * (0.85 + pulse * 0.3);

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const angle = time * 0.8 * this.speeds[i] + i;
      pos[idx + 0] = this.center.x + offsets[idx + 0] + Math.cos(angle) * 0.04;
      pos[idx + 1] = this.center.y + offsets[idx + 1] + Math.sin(time * 2.0 + i) * 0.05 + 0.04 * (intensityBoost - 1);
      pos[idx + 2] = this.center.z + offsets[idx + 2] + Math.sin(angle) * 0.04;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  setCenter(center) {
    this.center.copy(center);
  }
}

/**
 * Chest Opening Dust Burst
 */
export class ChestDustBurst {
  constructor(scene, count = 220) {
    this.count = count;
    this.active = false;
    this.age = 0;
    this.maxAge = 2.4;

    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.09,
      map: cyanTexture,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x88edff
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.visible = false;
    scene.add(this.points);
  }

  trigger(origin = new THREE.Vector3(0, 0.65, -0.6)) {
    this.active = true;
    this.age = 0;
    this.points.visible = true;
    this.material.opacity = 1.0;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx + 0] = origin.x + (Math.random() - 0.5) * 0.25;
      this.positions[idx + 1] = origin.y + (Math.random() - 0.5) * 0.1;
      this.positions[idx + 2] = origin.z + (Math.random() - 0.5) * 0.2;

      const theta = Math.random() * Math.PI * 2;
      const speedHoriz = 0.15 + Math.random() * 0.45;
      this.velocities[idx + 0] = Math.cos(theta) * speedHoriz;
      this.velocities[idx + 1] = 0.45 + Math.random() * 0.85;
      this.velocities[idx + 2] = Math.sin(theta) * speedHoriz;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  update(delta) {
    if (!this.active) return;
    this.age += delta;

    if (this.age >= this.maxAge) {
      this.active = false;
      this.points.visible = false;
      return;
    }

    const progress = this.age / this.maxAge;
    this.material.opacity = (1.0 - progress) * 0.95;
    this.material.size = 0.09 + progress * 0.05;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx + 0] += this.velocities[idx + 0] * delta;
      this.positions[idx + 1] += this.velocities[idx + 1] * delta;
      this.positions[idx + 2] += this.velocities[idx + 2] * delta;

      this.velocities[idx + 0] *= 0.96;
      this.velocities[idx + 1] *= 0.94;
      this.velocities[idx + 2] *= 0.96;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

/**
 * Dust Puff on Brushing / Dusting the Dreamcatcher
 */
export class BrushDustPuff {
  constructor(scene, count = 80) {
    this.count = count;
    this.active = false;
    this.age = 0;
    this.maxAge = 1.0;

    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.065,
      map: whiteTexture,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xe6f4ff
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.visible = false;
    scene.add(this.points);
  }

  trigger(origin, direction = new THREE.Vector3(1, 0, 0)) {
    this.active = true;
    this.age = 0;
    this.points.visible = true;
    this.material.opacity = 0.95;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx + 0] = origin.x + (Math.random() - 0.5) * 0.08;
      this.positions[idx + 1] = origin.y + (Math.random() - 0.5) * 0.08;
      this.positions[idx + 2] = origin.z + (Math.random() - 0.5) * 0.08;

      const spread = 0.35;
      this.velocities[idx + 0] = direction.x * 0.6 + (Math.random() - 0.5) * spread;
      this.velocities[idx + 1] = direction.y * 0.4 + (Math.random() - 0.5) * spread + 0.1;
      this.velocities[idx + 2] = direction.z * 0.6 + (Math.random() - 0.5) * spread;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  update(delta) {
    if (!this.active) return;
    this.age += delta;

    if (this.age >= this.maxAge) {
      this.active = false;
      this.points.visible = false;
      return;
    }

    const progress = this.age / this.maxAge;
    this.material.opacity = (1.0 - progress) * 0.9;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx + 0] += this.velocities[idx + 0] * delta;
      this.positions[idx + 1] += this.velocities[idx + 1] * delta;
      this.positions[idx + 2] += this.velocities[idx + 2] * delta;
      this.velocities[idx + 0] *= 0.92;
      this.velocities[idx + 1] *= 0.92;
      this.velocities[idx + 2] *= 0.92;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

/**
 * Dramatic Golden Particle Wave Expanding on Shell Floor Impact
 */
export class GoldenTransitionWave {
  constructor(scene, count = 650) {
    this.count = count;
    this.active = false;
    this.age = 0;
    this.maxAge = 3.6;
    this.center = new THREE.Vector3();

    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.angles = new Float32Array(count);
    this.radii = new Float32Array(count);
    this.radialSpeeds = new Float32Array(count);
    this.verticalSpeeds = new Float32Array(count);
    this.initialY = 0;

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.095,
      map: goldTexture,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffd700
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.visible = false;
    scene.add(this.points);

    const ringGeo = new THREE.RingGeometry(0.01, 0.08, 64);
    ringGeo.rotateX(-Math.PI / 2);
    this.ringMat = new THREE.MeshBasicMaterial({
      color: 0xffe680,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.ringMesh = new THREE.Mesh(ringGeo, this.ringMat);
    this.ringMesh.visible = false;
    scene.add(this.ringMesh);
  }

  trigger(impactPoint) {
    this.active = true;
    this.age = 0;
    this.center.copy(impactPoint);
    this.initialY = impactPoint.y + 0.015;

    this.points.visible = true;
    this.material.opacity = 1.0;
    this.material.size = 0.095;

    this.ringMesh.visible = false; // Strictly hidden so zero expanding floor rings clip across camera
    this.ringMesh.position.copy(impactPoint);
    this.ringMesh.position.y = this.initialY;
    this.ringMesh.scale.set(1, 1, 1);
    this.ringMat.opacity = 0.0;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const angle = (i / this.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
      this.angles[i] = angle;
      this.radii[i] = 0.02 + Math.random() * 0.08;
      this.radialSpeeds[i] = 1.8 + Math.random() * 1.6;
      this.verticalSpeeds[i] = 0.15 + Math.random() * 0.65;

      this.positions[idx + 0] = this.center.x + Math.cos(angle) * this.radii[i];
      this.positions[idx + 1] = this.initialY;
      this.positions[idx + 2] = this.center.z + Math.sin(angle) * this.radii[i];
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  update(delta) {
    if (!this.active) return;
    this.age += delta;

    if (this.age >= this.maxAge) {
      this.active = false;
      this.points.visible = false;
      this.ringMesh.visible = false;
      return;
    }

    const progress = this.age / this.maxAge;
    const waveRadius = 0.05 + (1 - Math.pow(1 - progress, 2.2)) * 4.2;

    const ringScale = waveRadius * 12.0;
    this.ringMesh.scale.set(ringScale, 1, ringScale);
    this.ringMat.opacity = 0.0;
    this.ringMesh.visible = false;

    this.material.opacity = Math.max(0, (1.0 - progress) * 1.0);
    this.material.size = 0.095 * (1.0 - progress * 0.4);

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.radii[i] += this.radialSpeeds[i] * delta * (1.0 - progress * 0.6);

      const angle = this.angles[i];
      this.positions[idx + 0] = this.center.x + Math.cos(angle) * this.radii[i];
      this.positions[idx + 1] += this.verticalSpeeds[i] * delta * (1.0 - progress * 0.5);
      this.positions[idx + 2] = this.center.z + Math.sin(angle) * this.radii[i];
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

/**
 * Swirling Golden Particle Vortex Around the Whirling Seashell
 */
export class WhirlingShellVortex {
  constructor(scene, count = 120) {
    this.count = count;
    this.active = false;
    this.scene = scene;
    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.angles = new Float32Array(count);
    this.heightOffsets = new Float32Array(count);
    this.radii = new Float32Array(count);
    this.speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      this.angles[i] = Math.random() * Math.PI * 2;
      this.heightOffsets[i] = (Math.random() - 0.5) * 0.22;
      this.radii[i] = 0.08 + Math.random() * 0.16;
      this.speeds[i] = 4.0 + Math.random() * 5.0;
      this.positions[i * 3 + 0] = 0;
      this.positions[i * 3 + 1] = -999;
      this.positions[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.PointsMaterial({
      size: 0.055,
      map: goldTexture,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffd700
    });
    this.points = new THREE.Points(geometry, this.material);
    this.points.visible = false;
    scene.add(this.points);
  }

  activate(shellPos) {
    this.active = true;
    this.points.visible = true;
    this.material.opacity = 0.95;
    if (shellPos) {
      for (let i = 0; i < this.count; i++) {
        const idx = i * 3;
        const r = this.radii[i];
        this.positions[idx + 0] = shellPos.x + Math.cos(this.angles[i]) * r;
        this.positions[idx + 1] = shellPos.y + this.heightOffsets[i];
        this.positions[idx + 2] = shellPos.z + Math.sin(this.angles[i]) * r;
      }
      this.points.geometry.attributes.position.needsUpdate = true;
    }
  }

  update(delta, time, shellPos, whirlSpeed = 10.0) {
    if (!this.active || !shellPos) return;
    const pos = this.positions;
    for (let i = 0; i < this.count; i++) {
      this.angles[i] += delta * (this.speeds[i] + whirlSpeed * 0.6);
      const r = this.radii[i] + Math.sin(time * 6.0 + i) * 0.02;
      const x = shellPos.x + Math.cos(this.angles[i]) * r;
      const y = shellPos.y + this.heightOffsets[i] + Math.sin(this.angles[i] * 2.0) * 0.04;
      const z = shellPos.z + Math.sin(this.angles[i]) * r;
      const idx = i * 3;
      pos[idx + 0] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  deactivate() {
    this.active = false;
    this.points.visible = false;
    this.material.opacity = 0.0;
  }
}

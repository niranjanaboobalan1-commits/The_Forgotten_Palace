/**
 * soulMiniGames.js - Three Soul Mini-Games Manager & Interactive Anchors
 *
 * Implements:
 * 1. Three Cute Anime Wisp Spirits with High-Contrast 512x512 Canvas Faces & 512x192 Badges:
 *    - Soul 1 (Electric Cyan Wisp): Sapphire anime eyes, starlight catchlights, rosy cheeks, cute mouth.
 *    - Soul 2 (Emerald-Teal Wisp): Vivid #00f5d4 glow, expressive anime eyes, sweatdrop sparkle, cat smile.
 *    - Soul 3 (Royal Violet-Magenta Wisp): Vivid #c77dff glow, large shimmering anime eyes, happy smile.
 *    - Above each soul (y + 0.28m): High-DPI badge (depthTest: false, renderOrder: 25) with #071124 pill.
 *
 * 2. Three High-Contrast Mini-Games That Pop Against the Warm Grand Palace:
 *    - Mini-Game 1: Sapphire & Cyan Crystal Lotus Lanterns on dark-navy pedestals with glowing cyan rims.
 *                   Lift >= 0.10m erupts into turquoise-and-gold starfire flame.
 *    - Mini-Game 2: Deep-Cobalt & Electric-Cyan Celestial Astrolabe Frame (R = 0.24m) with 3 glowing
 *                   Emerald, Cyan, and Violet Rune Fragments. Pinch & snap into matching slots.
 *    - Mini-Game 3: Obsidian-Navy & Luminous-Cyan Sacred Ring (R = 0.28m) with 6 bright Magenta-Cyan
 *                   Star Nodes. Pinch-weave neon-cyan/white TubeGeometry threads, then dual-palm seal.
 *
 * 3. Strict, Responsive Hand Tracking & Lady Seraphina Progression:
 *    - Enforces Stop-Palm halt gesture (0.65s hold), Cupped Cradle & Lift, Pinch & Snap, Pinch-Weave.
 *    - Calls ghostSeraphina.onPointEarned(score, 3) on every completion (1/3, 2/3, 3/3).
 */

import * as THREE from 'three';
import { playTingChime, playSuccessChime } from './soundEffects.js';
import { Posture } from './handInteraction.js';

/**
 * Creates a crisp 512x512 CanvasTexture anime wisp face mapped onto each soul
 */
export function createAnimeWispFaceTexture(soulIndex = 1) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 512);

    if (soulIndex === 1) {
      // Soul 1: Electric Cyan-Blue Wisp
      const drawEye = (x, y) => {
        ctx.fillStyle = '#050c1e';
        ctx.beginPath();
        ctx.ellipse(x, y, 36, 52, 0, 0, Math.PI * 2);
        ctx.fill();

        const irisGrad = ctx.createLinearGradient(x, y - 40, x, y + 45);
        irisGrad.addColorStop(0, '#0369a1');
        irisGrad.addColorStop(0.55, '#0284c7');
        irisGrad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.ellipse(x, y + 6, 30, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Upper eyeliner / lashes
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(x, y - 6, 36, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Double starlight catchlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 10, y - 14, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 12, y + 16, 7, 0, Math.PI * 2);
        ctx.fill();
      };

      drawEye(175, 230);
      drawEye(337, 230);

      // Rosy cheeks
      const drawBlush = (x, y) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 40);
        grad.addColorStop(0, 'rgba(251, 113, 133, 0.65)');
        grad.addColorStop(1, 'rgba(251, 113, 133, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
        ctx.lineWidth = 3;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(x + i * 12 - 6, y - 6);
          ctx.lineTo(x + i * 12 + 6, y + 6);
          ctx.stroke();
        }
      };
      drawBlush(130, 290);
      drawBlush(382, 290);

      // Tiny hopeful mouth
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(256, 310, 16, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else if (soulIndex === 2) {
      // Soul 2: Emerald-Teal Wisp (#00f5d4)
      const drawEye = (x, y) => {
        ctx.fillStyle = '#022c22';
        ctx.beginPath();
        ctx.ellipse(x, y, 36, 50, 0, 0, Math.PI * 2);
        ctx.fill();

        const irisGrad = ctx.createLinearGradient(x, y - 35, x, y + 45);
        irisGrad.addColorStop(0, '#065f46');
        irisGrad.addColorStop(0.5, '#059669');
        irisGrad.addColorStop(1, '#00f5d4');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.ellipse(x, y + 4, 30, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#022c22';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(x, y - 6, 36, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 9, y - 12, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 11, y + 14, 6, 0, Math.PI * 2);
        ctx.fill();
      };

      drawEye(175, 230);
      drawEye(337, 230);

      // Sweatdrop sparkle
      ctx.fillStyle = '#2dd4bf';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(395, 175);
      ctx.lineTo(405, 190);
      ctx.lineTo(395, 205);
      ctx.lineTo(385, 190);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cheeks
      const drawBlush = (x, y) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 38);
        grad.addColorStop(0, 'rgba(253, 164, 175, 0.6)');
        grad.addColorStop(1, 'rgba(253, 164, 175, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 38, 0, Math.PI * 2);
        ctx.fill();
      };
      drawBlush(130, 290);
      drawBlush(382, 290);

      // Cat-like smile
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(244, 312, 12, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(268, 312, 12, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else {
      // Soul 3: Royal Violet-Magenta Wisp (#c77dff / #d946ef)
      const drawEye = (x, y) => {
        ctx.fillStyle = '#2e1065';
        ctx.beginPath();
        ctx.ellipse(x, y, 38, 54, 0, 0, Math.PI * 2);
        ctx.fill();

        const irisGrad = ctx.createLinearGradient(x, y - 40, x, y + 45);
        irisGrad.addColorStop(0, '#581c87');
        irisGrad.addColorStop(0.5, '#9333ea');
        irisGrad.addColorStop(1, '#c77dff');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.ellipse(x, y + 5, 32, 44, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(x, y - 6, 38, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 11, y - 14, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 13, y + 16, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - 10, y + 18, 5, 0, Math.PI * 2);
        ctx.fill();
      };

      drawEye(175, 230);
      drawEye(337, 230);

      // Floating star motes
      const drawStar = (cx, cy, r) => {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          const a2 = a + Math.PI / 4;
          ctx.lineTo(cx + Math.cos(a2) * (r * 0.35), cy + Math.sin(a2) * (r * 0.35));
        }
        ctx.closePath();
        ctx.fill();
      };
      drawStar(115, 185, 14);
      drawStar(395, 185, 14);

      // Blush
      const drawBlush = (x, y) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 42);
        grad.addColorStop(0, 'rgba(244, 114, 182, 0.7)');
        grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 42, 0, Math.PI * 2);
        ctx.fill();
      };
      drawBlush(130, 292);
      drawBlush(382, 292);

      // Big joyful open smile
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#881337';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(256, 310, 22, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(256, 322, 12, 0, Math.PI);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  } catch (e) {
    return null;
  }
}

function renderBlackScoreCard(canvas, scoreText, stateText, soulNumber) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 1024, 384);

  // Solid pure black rectangle fill (#000000, alpha = 0.96)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.96)';
  ctx.strokeStyle = '#ffffff'; // Crisp 6px pure white border
  ctx.lineWidth = 6;

  const x = 8, y = 8, w = 1008, h = 368, r = 28;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Thin interior divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 195);
  ctx.lineTo(976, 195);
  ctx.stroke();

  // Top Line: Large, razor-sharp bold white text (#ffffff, 92px)
  ctx.font = '900 92px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(scoreText || `SCORE: 0 / 3`, 512, 115);

  // Bottom Line: High-contrast state and prompt text (#ffffff, 54px)
  ctx.font = '700 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(stateText || 'ACTIVE', 512, 280);
}

/**
 * Creates a double-size rectangular black card above each soul (1024x384, depthTest: false, renderOrder: 30)
 */
export function createSoulBadgeSprite(soulNumber = 1, promptText = 'GAME 1: ACTIVE', scoreText = 'SCORE: 0 / 3') {
  let texture = null;
  let canvas = null;
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    try {
      canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 384;
      renderBlackScoreCard(canvas, scoreText, promptText, soulNumber);
      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
    } catch (e) {}
  }

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.98,
    depthTest: false,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.renderOrder = 30;
  sprite.scale.set(0.96, 0.36, 1.0);
  sprite.userData = {
    canvas,
    texture,
    soulNumber,
    update(newScore, newPrompt) {
      if (canvas && texture) {
        renderBlackScoreCard(canvas, newScore, newPrompt, soulNumber);
        texture.needsUpdate = true;
      }
    }
  };
  return sprite;
}

export const createBlackScoreCardSprite = createSoulBadgeSprite;

export class SoulMiniGamesManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = options;
    this.handManager = options.handManager || null;
    this.ghostSeraphina = options.ghostSeraphina || null;
    this.camera = options.camera || null;

    this.root = new THREE.Group();
    this.root.name = 'soulMiniGamesRoot';
    this.scene.add(this.root);

    this.unlocked = false;
    this.joyPoints = 0;
    this.totalJoyPoints = 3;

    // Progression State:
    // Game 1: 'LOCKED' | 'STEP_A_ROAMING' | 'STEP_B_LANTERNS' | 'STEP_C_ABSORB' | 'COMPLETED'
    // Game 2: 'GAME_2_ROAMING' | 'GAME_2_RELIC' | 'GAME_2_ABSORB' | 'GAME_2_DONE'
    // Game 3: 'GAME_3_ROAMING' | 'GAME_3_WEAVING' | 'GAME_3_SEAL' | 'GAME_3_ABSORB' | 'ALL_COMPLETED'
    this.step = 'LOCKED';

    // -------------------------------------------------------------
    // Roaming Soul 1 Setup (Electric Cyan Wisp)
    // -------------------------------------------------------------
    this.soul1Group = null;
    this.soul1Mesh = null;
    this.soul1Face = null;
    this.soul1Badge = null;
    this.soul1Trail = [];
    this.tailSpheres = [];
    this.soulRoamTimer = 0.0;
    this.isSoul1Frozen = false;
    this.frozenPos = new THREE.Vector3();
    this.freezeRingGroup = null;
    this.freezeRingMat = null;

    // Stop-Palm detection timer
    this.stopPalmSteadyTimer = 0.0;
    this.requiredHoldTime = 0.65;

    // -------------------------------------------------------------
    // Mini-Game 1: 3 Lotus Lanterns (Sapphire & Cyan Crystal)
    // -------------------------------------------------------------
    this.lanterns = [];
    this.lanternPositions = [
      new THREE.Vector3(-0.55, 0.98, -0.92),
      new THREE.Vector3(0.0, 0.98, -0.92),
      new THREE.Vector3(0.55, 0.98, -0.92)
    ];

    // Absorption
    this.absorbProgress = 0.0;
    this.absorbDuration = 1.6;
    this.seraphinaChestPos = new THREE.Vector3(1.75, 1.35, -2.2);

    // -------------------------------------------------------------
    // Roaming Soul 2 & Mini-Game 2 (Astral Clock Relic)
    // -------------------------------------------------------------
    this.soul2Group = null;
    this.soul2Mesh = null;
    this.soul2Face = null;
    this.soul2Badge = null;
    this.soul2RoamTimer = 0.0;
    this.isSoul2Frozen = false;
    this.soul2FrozenPos = new THREE.Vector3();
    this.astrolabeGroup = null;
    this.runeFragments = [];
    this.runeSlots = [];
    this.relicCompleted = false;

    // -------------------------------------------------------------
    // Roaming Soul 3 & Mini-Game 3 (Dreamcatcher Thread Weaving)
    // -------------------------------------------------------------
    this.soul3Group = null;
    this.soul3Mesh = null;
    this.soul3Face = null;
    this.soul3Badge = null;
    this.soul3RoamTimer = 0.0;
    this.isSoul3Frozen = false;
    this.soul3FrozenPos = new THREE.Vector3();
    this.sacredRingGroup = null;
    this.starNodes = [];
    this.wovenThreads = [];
    this.activeNodeIndex = 0;
    this.weavingCompleted = false;

    // Full Hands-Free Auto-Run mode enabled by default
    this.isAutoRun = true;
    this.autoRunTimer = 0.0;
    this.autoRunStep = 0;

    // Build visual entities
    this.buildSoul1();
    this.buildLotusLanterns();
    this.buildSoul2();
    this.buildMiniGame2Astrolabe();
    this.buildSoul3();
    this.buildMiniGame3Dreamcatcher();

    // Backward compatibility stations
    this.stations = {
      lantern: { group: this.root, joy: 0 },
      relic: { joy: 0 },
      thread: { joy: 0 }
    };

    // Initially hidden until mini-games unlocked
    this.root.visible = false;
  }

  setDependencies({ handManager, ghostSeraphina, camera }) {
    if (handManager) this.handManager = handManager;
    if (ghostSeraphina) this.ghostSeraphina = ghostSeraphina;
    if (camera) this.camera = camera;
  }

  unlock() {
    this.unlocked = true;
    this.root.visible = true;

    this.game1Score = 0;
    this.game2Score = 0;
    this.game3Score = 0;

    // All 3 souls lined up neatly on the left side so they NEVER interfere or block Lady Seraphina!
    // Soul 1 (Active First): In center play area with single active score card
    this.soul1Group.visible = true;
    this.soul1Group.position.set(-0.35, 1.30, -1.60);
    if (this.soul1Badge) {
      this.soul1Badge.visible = true;
      if (this.soul1Badge.userData?.update) {
        this.soul1Badge.userData.update('SCORE: 0 / 3', 'GAME 1: LANTERN BLOOM');
      }
    }

    // Soul 2 (Waiting Second): Neatly queued behind Soul 1 on the left
    this.soul2Group.visible = true;
    this.soul2Group.position.set(-1.15, 1.45, -2.10);
    if (this.soul2Badge) {
      this.soul2Badge.visible = false; // Hide while waiting so zero card overlap!
      if (this.soul2Badge.userData?.update) {
        this.soul2Badge.userData.update('SCORE: 0 / 3', 'GAME 2: WAITING');
      }
    }

    // Soul 3 (Waiting Third): Neatly queued behind Soul 2 on the left
    this.soul3Group.visible = true;
    this.soul3Group.position.set(-1.85, 1.55, -2.65);
    if (this.soul3Badge) {
      this.soul3Badge.visible = false; // Hide while waiting so zero card overlap!
      if (this.soul3Badge.userData?.update) {
        this.soul3Badge.userData.update('SCORE: 0 / 3', 'GAME 3: WAITING');
      }
    }

    this.step = 'STEP_A_ROAMING';
    this.currentStepTracker = this.step;
    this.soulRoamTimer = 0.0;
    this.isSoul1Frozen = false;
    this.stopPalmSteadyTimer = 0.0;
    this.autoStepTimer = 0.0;
    this.autoLanternIdx = 0;
    console.log('[SoulMiniGames] All 3 Souls spawned lined up neatly on the left! Game 1: Lantern Bloom active.');

    if (this.isAutoRun) {
      this.startAutoRun();
    }
  }

  // =============================================================
  // 1. SOUL 1 (Electric Cyan Wisp) & MINI-GAME 1 (Lotus Lanterns)
  // =============================================================

  buildSoul1() {
    this.soul1Group = new THREE.Group();
    this.soul1Group.name = 'roamingSoul1';
    this.soul1Group.position.set(-0.95, 1.28, -1.55);
    this.root.add(this.soul1Group);

    // Glowing Spirit Core (2x size: R = 0.18m)
    const coreGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.95,
      roughness: 0.18,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92
    });
    this.soul1Mesh = new THREE.Mesh(coreGeo, coreMat);
    this.soul1Group.add(this.soul1Mesh);

    // Translucent Ethereal Shell (2x size: orbRadius = 0.24m)
    const auraGeo = new THREE.SphereGeometry(0.24, 32, 32);
    const auraMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: new THREE.Color(0x00e5ff),
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.soul1Group.add(auraMesh);

    // Cute Anime Wisp Face (512x512 CanvasTexture on front hemisphere)
    const faceTex = createAnimeWispFaceTexture(1);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.soul1Face = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), faceMat);
    this.soul1Face.position.set(0, 0, 0.18);
    this.soul1Group.add(this.soul1Face);

    // Wispy spirit tail ribbons + crown curl
    this.tailGroup = new THREE.Group();
    this.tailSpheres = [];
    for (let i = 0; i < 4; i++) {
      const radius = 0.12 - i * 0.026;
      const tailGeo = new THREE.SphereGeometry(radius, 14, 14);
      const tailMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.60 - i * 0.12,
        blending: THREE.AdditiveBlending
      });
      const tailMesh = new THREE.Mesh(tailGeo, tailMat);
      this.tailGroup.add(tailMesh);
      this.tailSpheres.push(tailMesh);
    }
    this.soul1Group.add(this.tailGroup);

    // Double-Size Black Score Card (y + 0.42m, depthTest: false, renderOrder: 30)
    this.soul1Badge = createSoulBadgeSprite(1, 'GAME 1: LANTERN BLOOM', 'SCORE: 0 / 3');
    this.soul1Badge.position.set(0, 0.42, 0);
    this.soul1Group.add(this.soul1Badge);

    // Golden-Cyan Freeze Ring (scaled for 2x soul)
    this.freezeRingGroup = new THREE.Group();
    this.freezeRingGroup.name = 'soul1FreezeRing';

    const ringGeo = new THREE.RingGeometry(0.29, 0.35, 48);
    this.freezeRingMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    const outerRing = new THREE.Mesh(ringGeo, this.freezeRingMat);
    this.freezeRingGroup.add(outerRing);

    const innerRingGeo = new THREE.RingGeometry(0.25, 0.28, 48);
    this.innerFreezeRingMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    const innerRing = new THREE.Mesh(innerRingGeo, this.innerFreezeRingMat);
    this.freezeRingGroup.add(innerRing);

    this.freezeRingGroup.visible = false;
    this.soul1Group.add(this.freezeRingGroup);
  }

  buildLotusLanterns() {
    // Reachable lotus positions floating around player
    this.lanternPositions = [
      new THREE.Vector3(-0.55, 0.92, -0.95),
      new THREE.Vector3(0.0, 0.92, -0.95),
      new THREE.Vector3(0.55, 0.92, -0.95)
    ];

    this.lanterns = this.lanternPositions.map((pos, idx) => {
      const group = new THREE.Group();
      group.name = `palaceLotusLantern_${idx}`;
      group.position.copy(pos);
      // Double-size 2x larger lotus flowers (~0.34m wide)
      group.scale.set(2.0, 2.0, 2.0);
      this.root.add(group);

      // 1. Broad Layered Lily-Pad Leaves in deep dark forest green (#14532d)
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x14532d, // Deep dark forest green (#14532d)
        emissive: new THREE.Color(0x052e16),
        emissiveIntensity: 0.25,
        roughness: 0.45,
        side: THREE.DoubleSide
      });
      const leafGroup = new THREE.Group();
      leafGroup.name = 'lilyPadLeaves';
      for (let l = 0; l < 4; l++) {
        const leafAngle = (l * Math.PI) / 2 + 0.25;
        const leafGeo = new THREE.CircleGeometry(0.088, 24, 0, Math.PI * 1.85); // notched lily pad
        leafGeo.rotateX(-Math.PI / 2);
        const leafMesh = new THREE.Mesh(leafGeo, leafMat);
        leafMesh.position.set(Math.cos(leafAngle) * 0.045, 0.004, Math.sin(leafAngle) * 0.045);
        leafMesh.rotation.y = leafAngle;
        leafGroup.add(leafMesh);
      }
      group.add(leafGroup);

      // 2. Sculpted multi-layered curved lotus petals in rich dark crimson-red (#881337)
      const petalMat = new THREE.MeshStandardMaterial({
        color: 0x881337, // Rich dark crimson-red (#881337)
        emissive: new THREE.Color(0x4c0519),
        emissiveIntensity: 0.35,
        roughness: 0.35,
        side: THREE.DoubleSide
      });

      const petalsGroup = new THREE.Group();
      petalsGroup.name = 'petalsGroup';
      // Outer layer of 8 petals
      for (let p = 0; p < 8; p++) {
        const angle = (p * Math.PI * 2) / 8;
        const petalGeo = new THREE.ConeGeometry(0.038, 0.10, 6);
        petalGeo.rotateX(Math.PI * 0.26);
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(Math.cos(angle) * 0.048, 0.042, Math.sin(angle) * 0.048);
        petal.rotation.y = angle;
        petalsGroup.add(petal);
      }
      // Inner layer of 6 upright petals
      for (let p = 0; p < 6; p++) {
        const angle = (p * Math.PI * 2) / 6 + 0.35;
        const petalGeo = new THREE.ConeGeometry(0.028, 0.085, 6);
        petalGeo.rotateX(Math.PI * 0.18);
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(Math.cos(angle) * 0.028, 0.048, Math.sin(angle) * 0.028);
        petal.rotation.y = angle;
        petalsGroup.add(petal);
      }
      group.add(petalsGroup);

      // 3. Warm golden stamen core in center (#facc15 / #d97706)
      const stamenMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: new THREE.Color(0xd97706),
        emissiveIntensity: 0.55,
        roughness: 0.25
      });
      const stamenCore = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.024, 16), stamenMat);
      stamenCore.position.y = 0.042;
      group.add(stamenCore);

      // 4. Central Wick
      const wickGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.02, 8);
      const wick = new THREE.Mesh(wickGeo, new THREE.MeshBasicMaterial({ color: 0x071124 }));
      wick.position.y = 0.05;
      group.add(wick);

      // 5. Golden Starfire Flame (Ignites when lifted >= 0.12m)
      const flameGroup = new THREE.Group();
      flameGroup.position.y = 0.075;
      flameGroup.visible = false; // Initially unlit

      const flameOuterGeo = new THREE.SphereGeometry(0.026, 14, 14);
      flameOuterGeo.scale(0.8, 1.8, 0.8);
      const flameOuterMat = new THREE.MeshBasicMaterial({
        color: 0xfde047, // Golden starfire
        transparent: true,
        opacity: 0.90,
        blending: THREE.AdditiveBlending
      });
      const flameOuter = new THREE.Mesh(flameOuterGeo, flameOuterMat);
      flameGroup.add(flameOuter);

      const flameInnerGeo = new THREE.SphereGeometry(0.016, 12, 12);
      flameInnerGeo.scale(0.7, 1.5, 0.7);
      const flameInner = new THREE.Mesh(flameInnerGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      flameGroup.add(flameInner);
      group.add(flameGroup);

      // Warm Golden Point Light
      const flameLight = new THREE.PointLight(0xfde047, 0.0, 3.5);
      flameLight.position.y = 0.08;
      group.add(flameLight);

      // Floating hover ring under lotus
      const hoverRingGeo = new THREE.RingGeometry(0.085, 0.105, 24);
      hoverRingGeo.rotateX(-Math.PI / 2);
      const hoverRing = new THREE.Mesh(
        hoverRingGeo,
        new THREE.MeshBasicMaterial({
          color: 0xfacc15,
          transparent: true,
          opacity: 0.40,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      );
      hoverRing.position.y = 0.001;
      group.add(hoverRing);

      return {
        idx,
        index: idx,
        group,
        startPos: pos.clone(),
        currentPos: pos.clone(),
        status: 'unlit', // 'unlit' | 'cradling' | 'ascending' | 'bloomed'
        petalsGroup,
        flameMesh: flameGroup,
        flameLight,
        liftDistance: 0.0,
        ascendProgress: 0.0
      };
    });
  }

  updateSoul1Roaming(delta, time) {
    if (this.isSoul1Frozen) {
      if (this.freezeRingGroup) {
        this.freezeRingGroup.rotation.z += delta * 1.5;
        this.freezeRingGroup.rotation.y += delta * 0.8;
      }
      return;
    }

    this.soulRoamTimer += delta;

    // Figure-eight strictly fitting within:
    // x: -0.95 to 0.35, y: 1.05 to 1.55, z: -1.85 to -1.35
    const cx = -0.30;
    const cy = 1.30;
    const cz = -1.60;
    const ax = 0.65;
    const ay = 0.25;
    const az = 0.25;
    const omega = 0.85;

    const x = cx + ax * Math.sin(this.soulRoamTimer * omega);
    const y = cy + ay * Math.sin(this.soulRoamTimer * omega * 2.0);
    const z = cz + az * Math.cos(this.soulRoamTimer * omega);

    this.soul1Group.position.set(x, y, z);

    // Keep face looking at camera
    if (this.camera && this.soul1Face) {
      this.soul1Face.lookAt(this.camera.position);
    }

    // Spiritual pulse
    const pulse = 1.0 + Math.sin(time * 3.5) * 0.05;
    this.soul1Mesh.scale.set(pulse, pulse, pulse);

    // Drifting tail ribbon history
    this.soul1Trail.unshift(new THREE.Vector3(x, y, z));
    if (this.soul1Trail.length > 25) {
      this.soul1Trail.pop();
    }

    if (this.tailSpheres && this.tailSpheres.length > 0) {
      this.tailSpheres.forEach((sphere, idx) => {
        const historyIdx = (idx + 1) * 4;
        if (this.soul1Trail[historyIdx]) {
          const localTrail = this.soul1Trail[historyIdx].clone().sub(this.soul1Group.position);
          sphere.position.copy(localTrail);
        }
      });
    }
  }

  checkStopPalmGesture(delta, handManager) {
    if (!handManager || this.step !== 'STEP_A_ROAMING' || this.isSoul1Frozen) return;

    const hands = [handManager.leftHand, handManager.rightHand].filter(
      (h) => h && (h.handModel?.visible || h.rig?.handRoot?.visible)
    );
    if (hands.length === 0) return;

    let aimingHandFound = false;

    for (const h of hands) {
      const isStopPalm =
        h.posture === Posture.STOP_PALM ||
        h.posture === Posture.FLAT_PALM ||
        h.posture === 'STOP_PALM';

      const handPos = h.currentPos;
      const soulPos = this.soul1Group.position;

      const palmForward = new THREE.Vector3(0, 0, -1).applyQuaternion(h.currentQuat).normalize();
      const toSoul = new THREE.Vector3().subVectors(soulPos, handPos);
      const toSoulDist = toSoul.length();

      const proj = toSoul.dot(palmForward);
      let perpDist = 999;
      if (proj > 0) {
        const rayPoint = new THREE.Vector3().copy(handPos).addScaledVector(palmForward, proj);
        perpDist = rayPoint.distanceTo(soulPos);
      }

      const isAimedAtSoul = proj > 0 && perpDist <= 0.45 && toSoulDist <= 2.5;

      if (isStopPalm && isAimedAtSoul) {
        aimingHandFound = true;
        break;
      }
    }

    if (aimingHandFound) {
      this.stopPalmSteadyTimer += delta;

      if (this.freezeRingMat) {
        this.freezeRingGroup.visible = true;
        const progress = Math.min(1.0, this.stopPalmSteadyTimer / this.requiredHoldTime);
        this.freezeRingMat.opacity = progress * 0.85;
        this.innerFreezeRingMat.opacity = progress * 0.75;
      }

      if (this.stopPalmSteadyTimer >= this.requiredHoldTime) {
        this.freezeSoul1();
      }
    } else {
      this.stopPalmSteadyTimer = Math.max(0, this.stopPalmSteadyTimer - delta * 2.0);
      if (this.freezeRingMat && this.step === 'STEP_A_ROAMING' && !this.isSoul1Frozen) {
        this.freezeRingMat.opacity = 0;
        this.innerFreezeRingMat.opacity = 0;
        this.freezeRingGroup.visible = false;
      }
    }
  }

  freezeSoul1() {
    this.isSoul1Frozen = true;
    this.frozenPos.copy(this.soul1Group.position);
    this.step = 'STEP_B_LANTERNS';

    this.freezeRingGroup.visible = true;
    this.freezeRingMat.opacity = 0.95;
    this.innerFreezeRingMat.opacity = 0.85;

    playTingChime();

    console.log(
      `[SoulMiniGames] Step A Complete: Soul 1 frozen in place at (${this.frozenPos.x.toFixed(2)}, ${this.frozenPos.y.toFixed(2)}, ${this.frozenPos.z.toFixed(2)}) with golden-cyan freeze ring!`
    );
  }

  updateAscendingLanterns(delta, time) {
    if (!this.lanterns) return;
    if (this._lastAscendFrameTime === time) return;
    this._lastAscendFrameTime = time;

    this.lanterns.forEach((lantern) => {
      if (lantern.status === 'ascending') {
        lantern.ascendProgress = (lantern.ascendProgress || 0) + delta * 1.85;
        lantern.group.position.y = lantern.startPos.y + lantern.ascendProgress;
        lantern.group.rotation.y += delta * 1.2;
        lantern.group.position.x = lantern.startPos.x + Math.sin(time * 3.0 + lantern.index) * 0.02;

        if (lantern.group.position.y > 8.0) {
          lantern.group.visible = false;
        }
      }
    });
  }

  updateLanternsInteraction(delta, time, handManager) {
    // Keep all ascending lanterns rising up smoothly toward the dome
    this.updateAscendingLanterns(delta, time);

    if (this.step !== 'STEP_B_LANTERNS' || !handManager) return;

    const hands = [handManager.leftHand, handManager.rightHand].filter(
      (h) => h && (h.handModel?.visible || h.rig?.handRoot?.visible)
    );

    this.lanterns.forEach((lantern) => {
      if (lantern.status === 'ascending' || lantern.status === 'bloomed') {
        return;
      }

      let isEngaged = false;

      for (const h of hands) {
        const handPos = h.currentPos;
        const dist = handPos.distanceTo(lantern.group.position);

        const isEligibleGesture =
          h.isPinching ||
          h.posture === Posture.PRECISION_PINCH ||
          h.posture === Posture.CUPPED_CRADLE ||
          h.posture === Posture.CUPPED_LIFT ||
          h.posture === Posture.RELAXED_OPEN ||
          h.posture === Posture.FLAT_PALM;

        const maxDist = (lantern.status === 'cradling' && lantern.cradlingHand === h) ? 0.26 : 0.15;
        if (dist <= maxDist && isEligibleGesture) {
          isEngaged = true;

          if (lantern.status !== 'cradling') {
            lantern.status = 'cradling';
            lantern.cradlingHand = h;
            lantern.handStartY = handPos.y;
          }

          const liftDelta = handPos.y - lantern.handStartY;
          lantern.liftDelta = liftDelta;

          if (liftDelta > 0) {
            lantern.group.position.y = lantern.startPos.y + Math.min(0.12, liftDelta);
          }

          if (liftDelta >= 0.12) {
            this.bloomLantern(lantern);
          }
          break;
        }
      }

      if (!isEngaged && lantern.status === 'cradling') {
        lantern.status = 'unlit';
        lantern.cradlingHand = null;
      }

      if (lantern.status === 'unlit') {
        lantern.group.position.lerp(lantern.startPos, Math.min(1.0, delta * 6.0));
      }
    });

    const allBloomed = this.lanterns.every(
      (l) => l.status === 'bloomed' || l.status === 'ascending'
    );

    if (allBloomed) {
      this.advanceToStepC();
    }
  }

  bloomLantern(lantern) {
    if (lantern.status === 'ascending' || lantern.status === 'bloomed') return;
    lantern.status = 'ascending';
    lantern.cradlingHand = null;

    // Immediately kickstart vertical rise so the lotus visibly lifts off into the air without delay
    lantern.ascendProgress = Math.max(lantern.ascendProgress || 0, 0.08);
    lantern.group.position.y = lantern.startPos.y + lantern.ascendProgress;

    lantern.flameMesh.visible = true;
    lantern.flameLight.intensity = 2.2;

    lantern.petalsGroup.scale.set(1.35, 0.90, 1.35);

    playTingChime();

    const bloomedCount = this.lanterns.filter(
      (l) => l.status === 'bloomed' || l.status === 'ascending'
    ).length;
    this.game1Score = bloomedCount;

    if (this.soul1Badge?.userData?.update) {
      this.soul1Badge.userData.update(`SCORE: ${bloomedCount} / 3`, `LOTUS: ${bloomedCount}/3 BLOOMED`);
    }

    console.log(`[SoulMiniGames] Lantern ${lantern.index + 1} / 3 bloomed! Score: ${bloomedCount} / 3. Ascending toward the dome.`);
  }

  advanceToStepC() {
    this.step = 'STEP_C_ABSORB';
    this.absorbProgress = 0.0;
    console.log('[SoulMiniGames] All 3 lanterns bloomed! Absorbing Soul 1 into Lady Seraphina...');
  }

  updateSoulAbsorption(delta, time) {
    if (this.step !== 'STEP_C_ABSORB') return;

    this.absorbProgress += delta / this.absorbDuration;
    const t = Math.min(1.0, this.absorbProgress);
    const ease = Math.pow(t, 2.5);

    this.soul1Group.position.lerpVectors(this.frozenPos, this.seraphinaChestPos, ease);
    const shrink = Math.max(0.01, 1.0 - ease);
    this.soul1Group.scale.setScalar(shrink);

    if (this.freezeRingMat) {
      this.freezeRingMat.opacity = shrink * 0.9;
    }

    if (t >= 1.0) {
      this.completeSoul1MiniGame();
    }
  }

  completeSoul1MiniGame() {
    this.step = 'COMPLETED';
    this.joyPoints = 1;
    this.soul1Group.visible = false;
    if (this.soul1Badge) {
      this.soul1Badge.visible = false;
    }

    playSuccessChime();

    console.log('[SoulMiniGames] Soul 1 absorbed! +1 Joy Point earned (1 / 3). Upgrading Lady Seraphina.');

    if (this.ghostSeraphina && typeof this.ghostSeraphina.onPointEarned === 'function') {
      this.ghostSeraphina.onPointEarned(1, 3);
    }

    // Keep soul2 and soul3 badges hidden until Soul 2 moves to active position
    if (this.soul2Badge) {
      this.soul2Badge.visible = false;
      if (this.soul2Badge.userData?.update) {
        this.soul2Badge.userData.update('SCORE: 0 / 3', 'GAME 2: WAITING');
      }
    }
    if (this.soul3Badge) {
      this.soul3Badge.visible = false;
      if (this.soul3Badge.userData?.update) {
        this.soul3Badge.userData.update('SCORE: 0 / 3', 'GAME 3: WAITING');
      }
    }
  }

  // =============================================================
  // 2. SOUL 2 (Emerald-Teal Wisp) & MINI-GAME 2 (Astral Astrolabe)
  // =============================================================

  buildSoul2() {
    this.soul2Group = new THREE.Group();
    this.soul2Group.name = 'roamingSoul2';
    this.soul2Group.position.set(-1.15, 1.45, -2.10);
    this.soul2Group.visible = false;
    this.root.add(this.soul2Group);

    // Glowing Spirit Core (2x size: R = 0.18m)
    const coreGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: new THREE.Color(0x059669),
      emissiveIntensity: 0.95,
      roughness: 0.18,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92
    });
    this.soul2Mesh = new THREE.Mesh(coreGeo, coreMat);
    this.soul2Group.add(this.soul2Mesh);

    // Translucent Ethereal Shell (2x size: orbRadius = 0.24m)
    const auraGeo = new THREE.SphereGeometry(0.24, 32, 32);
    const auraMat = new THREE.MeshStandardMaterial({
      color: 0xccfbf1,
      emissive: new THREE.Color(0x00f5d4),
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.soul2Group.add(auraMesh);

    // Cute Anime Wisp Face
    const faceTex = createAnimeWispFaceTexture(2);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.soul2Face = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), faceMat);
    this.soul2Face.position.set(0, 0, 0.18);
    this.soul2Group.add(this.soul2Face);

    // Swirling Emerald Spirit Tail (2x size)
    this.soul2TailGroup = new THREE.Group();
    this.soul2TailSpheres = [];
    for (let i = 0; i < 4; i++) {
      const radius = 0.12 - i * 0.026;
      const tailGeo = new THREE.SphereGeometry(radius, 14, 14);
      const tailMat = new THREE.MeshBasicMaterial({
        color: 0x00f5d4,
        transparent: true,
        opacity: 0.60 - i * 0.12,
        blending: THREE.AdditiveBlending
      });
      const tailMesh = new THREE.Mesh(tailGeo, tailMat);
      this.soul2TailGroup.add(tailMesh);
      this.soul2TailSpheres.push(tailMesh);
    }
    this.soul2Group.add(this.soul2TailGroup);

    // Double-Size Black Score Card (y + 0.42m, depthTest: false, renderOrder: 30)
    this.soul2Badge = createSoulBadgeSprite(2, 'GAME 2: WAITING', 'SCORE: 0 / 3');
    this.soul2Badge.position.set(0, 0.42, 0);
    this.soul2Badge.visible = false; // Initially hidden until Soul 2 moves to active center
    this.soul2Group.add(this.soul2Badge);

    // Freeze Ring (scaled for 2x soul)
    this.soul2FreezeRingGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(0.29, 0.35, 48);
    this.soul2FreezeRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    const outerRing = new THREE.Mesh(ringGeo, this.soul2FreezeRingMat);
    this.soul2FreezeRingGroup.add(outerRing);
    this.soul2FreezeRingGroup.visible = false;
    this.soul2Group.add(this.soul2FreezeRingGroup);
  }

  buildMiniGame2Astrolabe() {
    this.astrolabeGroup = new THREE.Group();
    this.astrolabeGroup.name = 'celestialAstrolabe';
    this.astrolabeGroup.position.set(0.0, 1.08, -0.92);
    this.astrolabeGroup.visible = false;
    this.root.add(this.astrolabeGroup);

    // Deep-Cobalt backing disc (#071124)
    const discGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.015, 36);
    discGeo.rotateX(Math.PI / 2);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x071124,
      metalness: 0.85,
      roughness: 0.25
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    this.astrolabeGroup.add(discMesh);

    // Electric-Cyan Outer Ring (emissiveIntensity: 0.85)
    const frameRingGeo = new THREE.TorusGeometry(0.24, 0.012, 16, 48);
    const frameRingMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: new THREE.Color(0x00e5ff),
      emissiveIntensity: 0.85,
      metalness: 0.9,
      roughness: 0.2
    });
    const frameRing = new THREE.Mesh(frameRingGeo, frameRingMat);
    this.astrolabeGroup.add(frameRing);

    // 3 Rune Slot Silhouettes & 3 Glowing Rune Fragments:
    // Slot 0: Emerald (#00f59b), Slot 1: Electric Cyan (#00e5ff), Slot 2: Violet (#d946ef)
    const runeConfigs = [
      {
        id: 0,
        color: 0x00f59b,
        emissive: 0x00f59b,
        slotPos: new THREE.Vector3(-0.12, -0.07, 0.012),
        fragStartPos: new THREE.Vector3(-0.28, -0.16, 0.08)
      },
      {
        id: 1,
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        slotPos: new THREE.Vector3(0.0, 0.12, 0.012),
        fragStartPos: new THREE.Vector3(0.0, -0.20, 0.08)
      },
      {
        id: 2,
        color: 0xd946ef,
        emissive: 0xd946ef,
        slotPos: new THREE.Vector3(0.12, -0.07, 0.012),
        fragStartPos: new THREE.Vector3(0.28, -0.16, 0.08)
      }
    ];

    this.runeSlots = [];
    this.runeFragments = [];

    runeConfigs.forEach((cfg) => {
      // Slot silhouette (dark indented socket with faint matching glow border)
      const slotGeo = new THREE.BoxGeometry(0.052, 0.052, 0.008);
      const slotMat = new THREE.MeshStandardMaterial({
        color: 0x020617,
        emissive: new THREE.Color(cfg.emissive),
        emissiveIntensity: 0.20
      });
      const slotMesh = new THREE.Mesh(slotGeo, slotMat);
      slotMesh.position.copy(cfg.slotPos);
      this.astrolabeGroup.add(slotMesh);
      this.runeSlots.push({ cfg, mesh: slotMesh, filled: false });

      // Fragment Mesh (Dark backing silhouette + brightly glowing jewel face)
      const fragGroup = new THREE.Group();
      fragGroup.position.copy(cfg.fragStartPos);

      const fragBackGeo = new THREE.BoxGeometry(0.048, 0.048, 0.016);
      const fragBackMat = new THREE.MeshStandardMaterial({ color: 0x050c1e, roughness: 0.3 });
      const fragBack = new THREE.Mesh(fragBackGeo, fragBackMat);
      fragGroup.add(fragBack);

      const fragJewelGeo = new THREE.OctahedronGeometry(0.024, 1);
      const fragJewelMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: new THREE.Color(cfg.emissive),
        emissiveIntensity: 0.85,
        roughness: 0.15,
        metalness: 0.1
      });
      const fragJewel = new THREE.Mesh(fragJewelGeo, fragJewelMat);
      fragJewel.position.z = 0.012;
      fragGroup.add(fragJewel);

      this.astrolabeGroup.add(fragGroup);
      this.runeFragments.push({
        cfg,
        group: fragGroup,
        isSnapped: false,
        isCarried: false
      });
    });
  }

  startMiniGame2() {
    this.step = 'GAME_2_ROAMING';
    this.currentStepTracker = this.step;
    this.soul2Group.visible = true;
    this.game2Score = 0;

    if (this.soul1Badge) this.soul1Badge.visible = false;
    if (this.soul3Badge) this.soul3Badge.visible = false;
    if (this.soul2Badge) {
      this.soul2Badge.visible = true;
      if (this.soul2Badge.userData?.update) {
        this.soul2Badge.userData.update('SCORE: 0 / 3', 'GAME 2: STOP-PALM HALT');
      }
    }
    this.soul2RoamTimer = 0.0;
    this.isSoul2Frozen = false;
    this.stopPalmSteadyTimer = 0.0;
    this.autoStepTimer = 0.0;
    this.autoRelicIdx = 0;
    console.log('[SoulMiniGames] Soul Mini-Game 2: Astral Clock Relic activated! Soul 2 roaming. Initial Score: 0 / 3.');
  }

  updateSoul2Roaming(delta, time) {
    if (this.isSoul2Frozen) return;

    this.soul2RoamTimer += delta;

    const cx = -0.40;
    const cy = 1.35;
    const cz = -1.70;
    const ax = 0.60;
    const ay = 0.22;
    const az = 0.25;
    const omega = 0.90;

    const x = cx + ax * Math.sin(this.soul2RoamTimer * omega);
    const y = cy + ay * Math.cos(this.soul2RoamTimer * omega * 1.8);
    const z = cz + az * Math.sin(this.soul2RoamTimer * omega);

    this.soul2Group.position.set(x, y, z);

    if (this.camera && this.soul2Face) {
      this.soul2Face.lookAt(this.camera.position);
    }
  }

  checkStopPalmSoul2(delta, handManager) {
    if (!handManager || this.step !== 'GAME_2_ROAMING' || this.isSoul2Frozen) return;

    const hands = [handManager.leftHand, handManager.rightHand].filter(
      (h) => h && (h.handModel?.visible || h.rig?.handRoot?.visible)
    );
    if (hands.length === 0) return;

    let aimingHandFound = false;

    for (const h of hands) {
      const isStopPalm =
        h.posture === Posture.STOP_PALM ||
        h.posture === Posture.FLAT_PALM ||
        h.posture === 'STOP_PALM';

      const handPos = h.currentPos;
      const soulPos = this.soul2Group.position;
      const palmForward = new THREE.Vector3(0, 0, -1).applyQuaternion(h.currentQuat).normalize();
      const toSoul = new THREE.Vector3().subVectors(soulPos, handPos);

      const proj = toSoul.dot(palmForward);
      let perpDist = 999;
      if (proj > 0) {
        const rayPoint = new THREE.Vector3().copy(handPos).addScaledVector(palmForward, proj);
        perpDist = rayPoint.distanceTo(soulPos);
      }

      if (isStopPalm && proj > 0 && perpDist <= 0.45 && toSoul.length() <= 2.5) {
        aimingHandFound = true;
        break;
      }
    }

    if (aimingHandFound) {
      this.stopPalmSteadyTimer += delta;
      if (this.soul2FreezeRingMat) {
        this.soul2FreezeRingGroup.visible = true;
        this.soul2FreezeRingMat.opacity = Math.min(1.0, this.stopPalmSteadyTimer / this.requiredHoldTime);
      }
      if (this.stopPalmSteadyTimer >= this.requiredHoldTime) {
        this.freezeSoul2();
      }
    } else {
      this.stopPalmSteadyTimer = Math.max(0, this.stopPalmSteadyTimer - delta * 2.0);
    }
  }

  freezeSoul2() {
    this.isSoul2Frozen = true;
    this.soul2FrozenPos.copy(this.soul2Group.position);
    this.step = 'GAME_2_RELIC';
    this.currentStepTracker = this.step;
    this.astrolabeGroup.visible = true;
    this.autoStepTimer = 0.0;
    this.autoRelicIdx = 0;
    if (this.soul2Badge?.userData?.update) {
      this.soul2Badge.userData.update(`SCORE: ${this.game2Score || 0} / 3`, 'RESTORE 3 RUNES: 0/3');
    }

    playTingChime();
    console.log('[SoulMiniGames] Soul 2 frozen! Celestial Astrolabe unlocked. Pinch & Snap runes!');
  }

  snapRuneFragment(idx) {
    const frag = this.runeFragments[idx];
    const slot = this.runeSlots[idx];
    if (!frag || frag.isSnapped || !slot) return;

    frag.isSnapped = true;
    frag.isCarried = false;
    frag.carriedByHand = null;
    slot.filled = true;
    frag.group.position.copy(slot.cfg.slotPos);
    frag.group.position.z += 0.008;

    playTingChime();

    const snappedCount = this.runeFragments.filter((f) => f.isSnapped).length;
    this.game2Score = snappedCount;

    if (this.soul2Badge?.userData?.update) {
      this.soul2Badge.userData.update(`SCORE: ${snappedCount} / 3`, `RUNE: ${snappedCount}/3 RESTORED`);
    }

    console.log(`[SoulMiniGames] Rune ${idx + 1} / 3 snapped into Astrolabe! Score: ${snappedCount} / 3.`);
  }

  updateAstrolabeInteraction(delta, time, handManager) {
    if (this.step !== 'GAME_2_RELIC' || !handManager) return;

    const hands = [handManager.leftHand, handManager.rightHand].filter(
      (h) => h && (h.handModel?.visible || h.rig?.handRoot?.visible)
    );

    const worldMatrixInv = new THREE.Matrix4().copy(this.astrolabeGroup.matrixWorld).invert();

    this.runeFragments.forEach((frag, idx) => {
      if (frag.isSnapped) return;

      const slot = this.runeSlots[idx];
      const slotWorldPos = slot.mesh.getWorldPosition(new THREE.Vector3());

      for (const h of hands) {
        const handPos = h.currentPos;
        const fragWorldPos = frag.group.getWorldPosition(new THREE.Vector3());
        const distToHand = fragWorldPos.distanceTo(handPos);

        const isPinching =
          h.isPinching ||
          h.posture === Posture.PRECISION_PINCH ||
          h.posture === Posture.CUPPED_CRADLE ||
          h.posture === Posture.CUPPED_LIFT;

        if (distToHand <= 0.14 && isPinching && !frag.isCarried) {
          frag.isCarried = true;
          frag.carriedByHand = h;
        }

        if (frag.isCarried && frag.carriedByHand === h) {
          if (isPinching) {
            const localHandPos = handPos.clone().applyMatrix4(worldMatrixInv);
            frag.group.position.copy(localHandPos);

            // Check snap to target slot
            const distHandToSlot = handPos.distanceTo(slotWorldPos);
            if (distHandToSlot <= 0.14) {
              this.snapRuneFragment(idx);
              break;
            }
          } else {
            frag.isCarried = false;
            frag.carriedByHand = null;
          }
        }
      }
    });

    const allSnapped = this.runeFragments.every((f) => f.isSnapped);
    if (allSnapped && !this.relicCompleted) {
      this.relicCompleted = true;
      this.step = 'GAME_2_ABSORB';
      this.absorbProgress = 0.0;
      console.log('[SoulMiniGames] All 3 runes restored! Absorbing Soul 2 into Lady Seraphina...');
    }
  }

  updateSoul2Absorption(delta, time) {
    if (this.step !== 'GAME_2_ABSORB') return;

    this.absorbProgress += delta / this.absorbDuration;
    const t = Math.min(1.0, this.absorbProgress);
    const ease = Math.pow(t, 2.5);

    this.soul2Group.position.lerpVectors(this.soul2FrozenPos, this.seraphinaChestPos, ease);
    const shrink = Math.max(0.01, 1.0 - ease);
    this.soul2Group.scale.setScalar(shrink);

    if (t >= 1.0) {
      this.step = 'GAME_2_DONE';
      this.joyPoints = 2;
      this.soul2Group.visible = false;
      this.astrolabeGroup.visible = false;
      if (this.soul2Badge) {
        this.soul2Badge.visible = false;
      }

      playSuccessChime();
      console.log('[SoulMiniGames] Soul 2 absorbed! +1 Joy Point earned (2 / 3).');

      if (this.ghostSeraphina && typeof this.ghostSeraphina.onPointEarned === 'function') {
        this.ghostSeraphina.onPointEarned(2, 3);
      }

      if (this.soul3Badge) {
        this.soul3Badge.visible = false;
        if (this.soul3Badge.userData?.update) {
          this.soul3Badge.userData.update('SCORE: 0 / 3', 'GAME 3: WAITING');
        }
      }
    }
  }

  // =============================================================
  // 3. SOUL 3 (Violet-Magenta Wisp) & MINI-GAME 3 (Dreamcatcher)
  // =============================================================

  buildSoul3() {
    this.soul3Group = new THREE.Group();
    this.soul3Group.name = 'roamingSoul3';
    this.soul3Group.position.set(-1.85, 1.55, -2.65);
    this.soul3Group.visible = false;
    this.root.add(this.soul3Group);

    // Core (Royal Violet-Magenta 2x size: R = 0.18m)
    const coreGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: new THREE.Color(0x701a75),
      emissiveIntensity: 0.95,
      roughness: 0.18,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92
    });
    this.soul3Mesh = new THREE.Mesh(coreGeo, coreMat);
    this.soul3Group.add(this.soul3Mesh);

    // Aura (2x size: orbRadius = 0.24m)
    const auraGeo = new THREE.SphereGeometry(0.24, 32, 32);
    const auraMat = new THREE.MeshStandardMaterial({
      color: 0xf5d0fe,
      emissive: new THREE.Color(0xd946ef),
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.soul3Group.add(auraMesh);

    // Cute Anime Face
    const faceTex = createAnimeWispFaceTexture(3);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.soul3Face = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), faceMat);
    this.soul3Face.position.set(0, 0, 0.18);
    this.soul3Group.add(this.soul3Face);

    // Floating star motes tail (2x size)
    this.soul3TailGroup = new THREE.Group();
    this.soul3TailSpheres = [];
    for (let i = 0; i < 4; i++) {
      const radius = 0.12 - i * 0.026;
      const tailGeo = new THREE.SphereGeometry(radius, 14, 14);
      const tailMat = new THREE.MeshBasicMaterial({
        color: 0xd946ef,
        transparent: true,
        opacity: 0.60 - i * 0.12,
        blending: THREE.AdditiveBlending
      });
      const tailMesh = new THREE.Mesh(tailGeo, tailMat);
      this.soul3TailGroup.add(tailMesh);
      this.soul3TailSpheres.push(tailMesh);
    }
    this.soul3Group.add(this.soul3TailGroup);

    // Double-Size Black Score Card (y + 0.42m, depthTest: false, renderOrder: 30)
    this.soul3Badge = createSoulBadgeSprite(3, 'GAME 3: WAITING', 'SCORE: 0 / 3');
    this.soul3Badge.position.set(0, 0.42, 0);
    this.soul3Badge.visible = false; // Initially hidden until Soul 3 moves to active center
    this.soul3Group.add(this.soul3Badge);

    // Freeze Ring (scaled for 2x soul)
    this.soul3FreezeRingGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(0.29, 0.35, 48);
    this.soul3FreezeRingMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    const outerRing = new THREE.Mesh(ringGeo, this.soul3FreezeRingMat);
    this.soul3FreezeRingGroup.add(outerRing);
    this.soul3FreezeRingGroup.visible = false;
    this.soul3Group.add(this.soul3FreezeRingGroup);
  }

  buildMiniGame3Dreamcatcher() {
    this.sacredRingGroup = new THREE.Group();
    this.sacredRingGroup.name = 'sacredDreamcatcherRing';
    this.sacredRingGroup.position.set(0.0, 1.12, -0.90);
    this.sacredRingGroup.visible = false;
    this.root.add(this.sacredRingGroup);

    // Obsidian-Navy Ring (#030712)
    const ringGeo = new THREE.TorusGeometry(0.28, 0.012, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      metalness: 0.90,
      roughness: 0.15
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.sacredRingGroup.add(ringMesh);

    // Luminous-Cyan energy edge (#00e5ff)
    const cyanEdgeGeo = new THREE.TorusGeometry(0.285, 0.004, 16, 48);
    const cyanEdgeMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending
    });
    const cyanEdge = new THREE.Mesh(cyanEdgeGeo, cyanEdgeMat);
    this.sacredRingGroup.add(cyanEdge);

    // 6 Star Nodes (alternating Magenta #d946ef and Cyan #00e5ff)
    this.starNodes = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * 0.26;
      const y = Math.sin(angle) * 0.26;

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, y, 0);

      const color = i % 2 === 0 ? 0xd946ef : 0x00e5ff;
      const nodeGeo = new THREE.SphereGeometry(0.018, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.95,
        roughness: 0.15
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeGroup.add(nodeMesh);

      // Pulsing halo ring
      const haloGeo = new THREE.RingGeometry(0.022, 0.032, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      nodeGroup.add(haloMesh);

      this.sacredRingGroup.add(nodeGroup);
      this.starNodes.push({ index: i, position: new THREE.Vector3(x, y, 0), group: nodeGroup });
    }
    this.ringNodes = this.starNodes; // Alias ensuring zero undefined errors

    // Sacred Weaving Order: 0 -> 2 -> 4 -> 1 -> 3 -> 5 -> 0
    this.weaveOrder = [0, 2, 4, 1, 3, 5, 0];
    this.currentWeaveStep = 0;
    this.threadsGroup = new THREE.Group();
    this.sacredRingGroup.add(this.threadsGroup);
  }

  startMiniGame3() {
    this.step = 'GAME_3_ROAMING';
    this.currentStepTracker = this.step;
    this.soul3Group.visible = true;
    this.game3Score = 0;

    if (this.soul1Badge) this.soul1Badge.visible = false;
    if (this.soul2Badge) this.soul2Badge.visible = false;
    if (this.soul3Badge) {
      this.soul3Badge.visible = true;
      if (this.soul3Badge.userData?.update) {
        this.soul3Badge.userData.update('SCORE: 0 / 3', 'GAME 3: STOP-PALM HALT');
      }
    }
    this.soul3RoamTimer = 0.0;
    this.isSoul3Frozen = false;
    this.stopPalmSteadyTimer = 0.0;
    this.autoStepTimer = 0.0;
    this.autoWeaveTimer = 0.0;
    console.log('[SoulMiniGames] Soul Mini-Game 3: Sacred Dreamcatcher activated! Soul 3 roaming. Initial Score: 0 / 3.');
  }

  updateSoul3Roaming(delta, time) {
    if (this.isSoul3Frozen) return;

    this.soul3RoamTimer += delta;

    const cx = -0.30;
    const cy = 1.32;
    const cz = -1.60;
    const ax = 0.45;
    const ay = 0.18;
    const az = 0.20;
    const omega = 0.90;

    const x = cx + ax * Math.cos(this.soul3RoamTimer * omega);
    const y = cy + ay * Math.sin(this.soul3RoamTimer * omega * 2.0);
    const z = cz + az * Math.sin(this.soul3RoamTimer * omega);

    this.soul3Group.position.set(x, y, z);

    if (this.camera && this.soul3Face) {
      this.soul3Face.lookAt(this.camera.position);
    }
  }

  checkStopPalmSoul3(delta, handManager) {
    if (!handManager || this.step !== 'GAME_3_ROAMING' || this.isSoul3Frozen) return;

    const hands = [handManager.leftHand, handManager.rightHand].filter(
      (h) => h && (h.handModel?.visible || h.rig?.handRoot?.visible)
    );
    if (hands.length === 0) return;

    let aimingHandFound = false;

    for (const h of hands) {
      const isStopPalm =
        h.posture === Posture.STOP_PALM ||
        h.posture === Posture.FLAT_PALM ||
        h.posture === 'STOP_PALM';

      const handPos = h.currentPos;
      const soulPos = this.soul3Group.position;
      const palmForward = new THREE.Vector3(0, 0, -1).applyQuaternion(h.currentQuat).normalize();
      const toSoul = new THREE.Vector3().subVectors(soulPos, handPos);

      const proj = toSoul.dot(palmForward);
      let perpDist = 999;
      if (proj > 0) {
        const rayPoint = new THREE.Vector3().copy(handPos).addScaledVector(palmForward, proj);
        perpDist = rayPoint.distanceTo(soulPos);
      }

      if (isStopPalm && proj > 0 && perpDist <= 0.45 && toSoul.length() <= 2.5) {
        aimingHandFound = true;
        break;
      }
    }

    if (aimingHandFound) {
      this.stopPalmSteadyTimer += delta;
      if (this.soul3FreezeRingMat) {
        this.soul3FreezeRingGroup.visible = true;
        this.soul3FreezeRingMat.opacity = Math.min(1.0, this.stopPalmSteadyTimer / this.requiredHoldTime);
      }
      if (this.stopPalmSteadyTimer >= this.requiredHoldTime) {
        this.freezeSoul3();
      }
    } else {
      this.stopPalmSteadyTimer = Math.max(0, this.stopPalmSteadyTimer - delta * 2.0);
    }
  }

  freezeSoul3() {
    this.isSoul3Frozen = true;
    this.soul3FrozenPos.copy(this.soul3Group.position);
    this.step = 'GAME_3_WEAVING';
    this.currentStepTracker = this.step;
    this.sacredRingGroup.visible = true;
    this.autoStepTimer = 0.0;
    this.autoWeaveTimer = 0.0;
    this.game3Score = 0;
    if (this.soul3Badge?.userData?.update) {
      this.soul3Badge.userData.update('SCORE: 0 / 3', 'PUZZLE 1/3: TRIANGLE WEAVE');
    }

    playTingChime();
    console.log('[SoulMiniGames] Soul 3 frozen! Sacred Dreamcatcher Ring unlocked. Weave 3 Sacred Puzzles!');
  }

  weaveThreadSegment(stepIdx) {
    if (stepIdx >= this.weaveOrder.length - 1) return;
    const fromNodeIdx = this.weaveOrder[stepIdx];
    const toNodeIdx = this.weaveOrder[stepIdx + 1];
    const nodes = this.starNodes || this.ringNodes;
    if (!nodes || !nodes[fromNodeIdx] || !nodes[toNodeIdx]) return;

    const p1 = nodes[fromNodeIdx].position;
    const p2 = nodes[toNodeIdx].position;
    const curve = new THREE.LineCurve3(p1, p2);
    const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.008, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: new THREE.Color(0x00e5ff),
      emissiveIntensity: 1.0,
      roughness: 0.1
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.threadsGroup.add(tubeMesh);

    this.currentWeaveStep = stepIdx + 1;
    playTingChime();

    // Grouping the 6 threads into 3 distinct puzzles:
    // Puzzle 1: Steps 1 & 2 complete triangle -> Score 1 / 3
    if (this.currentWeaveStep === 2) {
      this.game3Score = 1;
      if (this.soul3Badge?.userData?.update) {
        this.soul3Badge.userData.update('SCORE: 1 / 3', 'PUZZLE 1/3 SOLVED');
      }
      console.log('[SoulMiniGames] Game 3 - Puzzle 1/3 Solved! (Triangle of Light). Score: 1 / 3.');
    }
    // Puzzle 2: Steps 3 & 4 complete star diamond -> Score 2 / 3
    else if (this.currentWeaveStep === 4) {
      this.game3Score = 2;
      if (this.soul3Badge?.userData?.update) {
        this.soul3Badge.userData.update('SCORE: 2 / 3', 'PUZZLE 2/3 SOLVED');
      }
      console.log('[SoulMiniGames] Game 3 - Puzzle 2/3 Solved! (Star Diamond). Score: 2 / 3.');
    }
    // Steps 5 & 6 complete perimeter -> Awaiting Puzzle 3/3 Dual-Palm Keystone Seal
    else if (this.currentWeaveStep >= this.weaveOrder.length - 1) {
      this.step = 'GAME_3_SEAL';
      this.autoStepTimer = 0.0;
      if (this.soul3Badge?.userData?.update) {
        this.soul3Badge.userData.update('SCORE: 2 / 3', 'PUZZLE 3/3: KEYSTONE SEAL');
      }
      console.log('[SoulMiniGames] All threads woven! Awaiting Puzzle 3/3 Dual-Palm Keystone Seal!');
    }
  }

  updateWeavingInteraction(delta, time, handManager) {
    if (this.step !== 'GAME_3_WEAVING' || !handManager) return;

    const hands = [handManager.leftHand, handManager.rightHand].filter(
      (h) => h && (h.handModel?.visible || h.rig?.handRoot?.visible)
    );

    if (this.currentWeaveStep < this.weaveOrder.length - 1) {
      const toNodeIdx = this.weaveOrder[this.currentWeaveStep + 1];
      const toNode = this.starNodes[toNodeIdx];
      const toWorldPos = toNode.group.getWorldPosition(new THREE.Vector3());

      for (const h of hands) {
        const handPos = h.currentPos;
        if (handPos.distanceTo(toWorldPos) <= 0.14) {
          this.weaveThreadSegment(this.currentWeaveStep);
          break;
        }
      }
    } else {
      this.step = 'GAME_3_SEAL';
    }
  }

  checkDualPalmSeal(delta, handManager) {
    if (this.step !== 'GAME_3_SEAL' || !handManager) return;

    const left = handManager.leftHand;
    const right = handManager.rightHand;
    if (!left || !right) return;

    const ringWorldPos = this.sacredRingGroup.getWorldPosition(new THREE.Vector3());
    const dLeft = left.currentPos.distanceTo(ringWorldPos);
    const dRight = right.currentPos.distanceTo(ringWorldPos);

    if (dLeft <= 0.40 && dRight <= 0.40) {
      this.game3Score = 3;
      if (this.soul3Badge?.userData?.update) {
        this.soul3Badge.userData.update('SCORE: 3 / 3', 'PUZZLE 3/3 SOLVED');
      }
      this.step = 'GAME_3_ABSORB';
      this.absorbProgress = 0.0;
      playSuccessChime();
      console.log('[SoulMiniGames] Game 3 - Puzzle 3/3 Solved! Dual-Palm Keystone Seal completed! Score: 3 / 3.');
    }
  }

  updateSoul3Absorption(delta, time) {
    if (this.step !== 'GAME_3_ABSORB') return;

    this.absorbProgress += delta / this.absorbDuration;
    const t = Math.min(1.0, this.absorbProgress);
    const ease = Math.pow(t, 2.5);

    this.soul3Group.position.lerpVectors(this.soul3FrozenPos, this.seraphinaChestPos, ease);
    const shrink = Math.max(0.01, 1.0 - ease);
    this.soul3Group.scale.setScalar(shrink);

    if (t >= 1.0) {
      this.step = 'ALL_COMPLETED';
      this.joyPoints = 3;
      this.soul3Group.visible = false;
      this.sacredRingGroup.visible = false;
      if (this.soul3Badge) {
        this.soul3Badge.visible = false;
      }

      playSuccessChime();
      console.log('[SoulMiniGames] ALL 3 SOULS FREED! Lady Seraphina is overjoyed and golden key appears!');

      if (this.ghostSeraphina) {
        if (typeof this.ghostSeraphina.giveGoldenKeyTo === 'function') {
          this.ghostSeraphina.giveGoldenKeyTo(this.handManager);
        }
        if (typeof this.ghostSeraphina.onPointEarned === 'function') {
          this.ghostSeraphina.onPointEarned(3, 3);
        }
      }

      if (typeof window !== 'undefined' && typeof window.showCenterStatusBox === 'function') {
        window.showCenterStatusBox('Game Over', 0);
      }

      // Hands hold the golden key proudly
      if (this.handManager) {
        this.handManager.isHandExternallyControlled = true;
        this.handManager.leftHand.targetPos.set(-0.16, 1.20, -0.48);
        this.handManager.leftHand.posture = Posture.THUMBS_UP;
        this.handManager.rightHand.targetPos.set(0.14, 1.25, -0.48);
        this.handManager.rightHand.posture = Posture.KEY_PINCH;
        this.handManager.rightHand.isPinching = true;
      }
    }
  }

  // =============================================================
  // Full Hands-Free Auto-Run Simulation Engine
  // =============================================================

  startAutoRun() {
    this.isAutoRun = true;
    this.autoRunTimer = 0.0;
    this.autoStepPhase = 0;
    this.autoStepTimer = 0.0;
    this.autoLanternIdx = 0;
    this.autoRelicIdx = 0;
    this.autoWeaveTimer = 0.0;
    this.intermissionTimer = 0.0;
    console.log('[SoulMiniGames] Full End-to-End Hands-Free Auto-Run Mode started (Calm, Deliberate & Majestic Pace)!');
  }

  updateAutoRun(delta, time, handManager) {
    if (!this.isAutoRun || !handManager) return;
    this.autoRunTimer += delta;

    if (this.currentStepTracker !== this.step) {
      this.currentStepTracker = this.step;
      this.autoStepTimer = 0.0;
    } else {
      this.autoStepTimer = (this.autoStepTimer || 0.0) + delta;
    }
    handManager.isHandExternallyControlled = true;

    // Ensure hands are visible in scene
    if (handManager.leftHand?.handModel) handManager.leftHand.handModel.visible = true;
    if (handManager.rightHand?.handModel) handManager.rightHand.handModel.visible = true;
    if (handManager.leftHand?.rig?.handRoot) handManager.leftHand.rig.handRoot.visible = !handManager.leftHand?.handModel;
    if (handManager.rightHand?.rig?.handRoot) handManager.rightHand.rig.handRoot.visible = !handManager.rightHand?.handModel;

    // =========================================================
    // GAME 1: LANTERN BLOOM (0 / 3 -> 1 / 3)
    // =========================================================

    // Phase 1: Roaming Soul 1 -> Hold Stop-Palm (STEP_A_ROAMING)
    if (this.step === 'STEP_A_ROAMING') {
      const sPos = this.soul1Group.position;
      handManager.leftHand.targetPos.set(-0.24, 0.92, -0.55);
      handManager.leftHand.posture = Posture.RELAXED;
      handManager.rightHand.targetPos.set(sPos.x, sPos.y - 0.04, sPos.z + 0.32);
      if (handManager.rightHand.targetQuat) handManager.rightHand.targetQuat.set(0, 0, 0, 1);
      handManager.rightHand.posture = Posture.STOP_PALM;
      if (this.autoStepTimer >= 0.8 && !this.isSoul1Frozen) {
        this.freezeSoul1();
      }
    }
    // Phase 2: Deliberate, Slow Blooming of 3 Lotus Lanterns (STEP_B_LANTERNS)
    else if (this.step === 'STEP_B_LANTERNS') {
      handManager.leftHand.targetPos.set(-0.24, 0.92, -0.55);
      handManager.leftHand.posture = Posture.RELAXED;

      const curIdx = Math.min(2, this.autoLanternIdx || 0);
      const curLantern = this.lanterns[curIdx];

      if (curLantern) {
        // Subphase 0 (0.0s - 1.8s): Glide hand gently underneath the lotus
        if (this.autoStepTimer < 1.8) {
          handManager.rightHand.targetPos.set(curLantern.startPos.x, curLantern.startPos.y - 0.02, curLantern.startPos.z);
          handManager.rightHand.posture = Posture.CUPPED_CRADLE;
          handManager.rightHand.isPinching = false;
        }
        // Subphase 1 (1.8s - 3.8s): Slowly and majestically lift lotus upward (+0.22m)
        else if (this.autoStepTimer < 3.8) {
          const liftProgress = Math.min(1.0, (this.autoStepTimer - 1.8) / 1.8);
          handManager.rightHand.targetPos.set(
            curLantern.startPos.x,
            curLantern.startPos.y - 0.02 + liftProgress * 0.22,
            curLantern.startPos.z
          );
          handManager.rightHand.posture = Posture.CUPPED_CRADLE;
          handManager.rightHand.isPinching = false;

          // Deterministically bloom lotus when lifted >= 0.12m
          if (liftProgress >= 0.55 && curLantern.status === 'unlit') {
            this.bloomLantern(curLantern);
          }
        }
        // Subphase 2 (3.8s - 5.0s): Pause to admire ignited starfire flame, gently return hand
        else if (this.autoStepTimer < 5.0) {
          if (curLantern.status === 'unlit') {
            this.bloomLantern(curLantern);
          }
          handManager.rightHand.targetPos.set(0.24, 0.92, -0.55);
          handManager.rightHand.posture = Posture.RELAXED;
        }
        // Advance to next lotus lantern
        else {
          if (curLantern.status === 'unlit') {
            this.bloomLantern(curLantern);
          }
          this.autoLanternIdx = curIdx + 1;
          this.autoStepTimer = 0.0;
          if (this.autoLanternIdx >= 3) {
            this.advanceToStepC();
          }
        }
      } else {
        this.advanceToStepC();
      }
    }
    // Phase 3: Soul 1 Absorbing
    else if (this.step === 'STEP_C_ABSORB') {
      handManager.leftHand.targetPos.set(-0.24, 0.92, -0.55);
      handManager.rightHand.targetPos.set(0.24, 0.92, -0.55);
      handManager.leftHand.posture = Posture.RELAXED;
      handManager.rightHand.posture = Posture.RELAXED;
    }
    // Phase 3b: Soul 1 Completed -> Celebratory Thumbs Up
    else if (this.step === 'COMPLETED') {
      if (!this.celebratedStep1) {
        this.celebratedStep1 = true;
        handManager.setThumbsUpPose();
      }
    }

    // =========================================================
    // GAME 2: ASTRAL CLOCK RELIC (1 / 3 -> 2 / 3)
    // =========================================================

    // Phase 4: Game 2 Roaming -> Halt Soul 2 with Stop-Palm (GAME_2_ROAMING)
    else if (this.step === 'GAME_2_ROAMING') {
      const sPos = this.soul2Group.position;
      handManager.leftHand.targetPos.set(-0.24, 0.92, -0.55);
      handManager.leftHand.posture = Posture.RELAXED;
      handManager.rightHand.targetPos.set(sPos.x, sPos.y - 0.04, sPos.z + 0.32);
      if (handManager.rightHand.targetQuat) handManager.rightHand.targetQuat.set(0, 0, 0, 1);
      handManager.rightHand.posture = Posture.STOP_PALM;
      if (this.autoStepTimer >= 0.8 && !this.isSoul2Frozen) {
        this.freezeSoul2();
      }
    }
    // Phase 5: Deliberate, Slow Snapping of 3 Clock Rune Fragments (GAME_2_RELIC)
    else if (this.step === 'GAME_2_RELIC') {
      handManager.leftHand.targetPos.set(-0.24, 0.92, -0.55);
      handManager.leftHand.posture = Posture.RELAXED;

      const rIdx = Math.min(2, this.autoRelicIdx || 0);
      const curFrag = this.runeFragments[rIdx];
      const curSlot = this.runeSlots[rIdx];

      if (curFrag && this.astrolabeGroup) {
        const slotWorld = curFrag.cfg.slotPos.clone().applyMatrix4(this.astrolabeGroup.matrixWorld);
        const fragWorld = curFrag.group.position.clone().applyMatrix4(this.astrolabeGroup.matrixWorld);

        // Subphase 0 (0.0s - 1.8s): Glide hand toward rune fragment
        if (this.autoStepTimer < 1.8) {
          handManager.rightHand.targetPos.copy(fragWorld);
          handManager.rightHand.posture = Posture.PINCH;
          handManager.rightHand.isPinching = false;
        }
        // Subphase 1 (1.8s - 2.6s): Precision clamp on rune fragment
        else if (this.autoStepTimer < 2.6) {
          handManager.rightHand.targetPos.copy(fragWorld);
          handManager.rightHand.posture = Posture.PINCH;
          handManager.rightHand.isPinching = true;
        }
        // Subphase 2 (2.6s - 4.6s): Slowly carry fragment to matching slot
        else if (this.autoStepTimer < 4.6) {
          const carryEase = Math.min(1.0, (this.autoStepTimer - 2.6) / 2.0);
          handManager.rightHand.targetPos.lerpVectors(fragWorld, slotWorld, carryEase);
          handManager.rightHand.posture = Posture.PINCH;
          handManager.rightHand.isPinching = true;

          // Deterministically snap when nearing slot
          if (carryEase >= 0.85 && !curFrag.isSnapped) {
            this.snapRuneFragment(rIdx);
          }
        }
        // Subphase 3 (4.6s - 5.8s): Fragment snaps into slot with golden chime, hand settles
        else if (this.autoStepTimer < 5.8) {
          if (!curFrag.isSnapped) {
            this.snapRuneFragment(rIdx);
          }
          handManager.rightHand.targetPos.set(0.24, 0.92, -0.55);
          handManager.rightHand.posture = Posture.RELAXED;
          handManager.rightHand.isPinching = false;
        }
        // Advance to next rune fragment
        else {
          if (!curFrag.isSnapped) {
            this.snapRuneFragment(rIdx);
          }
          this.autoRelicIdx = rIdx + 1;
          this.autoStepTimer = 0.0;
          if (this.autoRelicIdx >= 3) {
            this.relicCompleted = true;
            this.step = 'GAME_2_ABSORB';
            this.absorbProgress = 0.0;
          }
        }
      } else {
        this.relicCompleted = true;
        this.step = 'GAME_2_ABSORB';
        this.absorbProgress = 0.0;
      }
    }
    // Phase 5b: Soul 2 Absorbing
    else if (this.step === 'GAME_2_ABSORB') {
      handManager.leftHand.targetPos.set(-0.24, 0.92, -0.55);
      handManager.rightHand.targetPos.set(0.24, 0.92, -0.55);
      handManager.leftHand.posture = Posture.RELAXED;
      handManager.rightHand.posture = Posture.RELAXED;
    }
    // Phase 5c: Soul 2 Done -> Celebratory Thumbs Up
    else if (this.step === 'GAME_2_DONE') {
      if (!this.celebratedStep2) {
        this.celebratedStep2 = true;
        handManager.setThumbsUpPose();
      }
    }

    // =========================================================
    // GAME 3: SACRED 3 PUZZLES (0 / 3 -> 3 / 3)
    // =========================================================

    // Phase 6: Game 3 Roaming -> Halt Soul 3 with Stop-Palm (GAME_3_ROAMING)
    else if (this.step === 'GAME_3_ROAMING') {
      const sPos = this.soul3Group.position;
      handManager.rightHand.targetPos.set(0.24, 0.92, -0.55);
      handManager.rightHand.posture = Posture.RELAXED;
      handManager.leftHand.targetPos.set(sPos.x, sPos.y - 0.04, sPos.z + 0.32);
      if (handManager.leftHand.targetQuat) handManager.leftHand.targetQuat.set(0, 0, 0, 1);
      handManager.leftHand.posture = Posture.STOP_PALM;
      if (this.autoStepTimer >= 0.8 && !this.isSoul3Frozen) {
        this.freezeSoul3();
      }
    }
    // Phase 7: Weaving 3 Sacred Puzzles (GAME_3_WEAVING)
    else if (this.step === 'GAME_3_WEAVING') {
      handManager.leftHand.targetPos.set(-0.24, 0.92, -0.55);
      handManager.leftHand.posture = Posture.RELAXED;

      const nextIdx = this.currentWeaveStep + 1;
      if (nextIdx < this.weaveOrder.length && this.sacredRingGroup) {
        const targetNode = this.weaveOrder[nextIdx];
        const nodes = this.starNodes || this.ringNodes;
        const nodeWorld = nodes[targetNode].position.clone().applyMatrix4(this.sacredRingGroup.matrixWorld);
        handManager.rightHand.targetPos.copy(nodeWorld);
        handManager.rightHand.posture = Posture.PRECISION_PINCH;
        handManager.rightHand.isPinching = true;

        this.autoWeaveTimer = (this.autoWeaveTimer || 0.0) + delta;
        if (this.autoWeaveTimer >= 1.6) {
          this.autoWeaveTimer = 0.0;
          this.weaveThreadSegment(this.currentWeaveStep);
        }
      } else {
        this.step = 'GAME_3_SEAL';
        this.autoStepTimer = 0.0;
      }
    }
    // Phase 8: Sacred Dual-Palm Seal (GAME_3_SEAL) -> Puzzle 3/3
    else if (this.step === 'GAME_3_SEAL') {
      const ringCenter = this.sacredRingGroup.position;
      handManager.leftHand.targetPos.set(ringCenter.x - 0.16, ringCenter.y, ringCenter.z + 0.22);
      handManager.rightHand.targetPos.set(ringCenter.x + 0.16, ringCenter.y, ringCenter.z + 0.22);
      handManager.leftHand.posture = Posture.STOP_PALM;
      handManager.rightHand.posture = Posture.STOP_PALM;

      if (this.autoStepTimer >= 2.0) {
        this.game3Score = 3;
        if (this.soul3Badge?.userData?.update) {
          this.soul3Badge.userData.update('SCORE: 3 / 3', 'PUZZLE 3/3 SOLVED');
        }
        this.step = 'GAME_3_ABSORB';
        this.absorbProgress = 0.0;
        playSuccessChime();
        console.log('[SoulMiniGames] Game 3 - Puzzle 3/3 Solved! Dual-Palm Keystone Seal completed! Score: 3 / 3.');
      }
    }
    // Phase 8b: Soul 3 Absorbing
    else if (this.step === 'GAME_3_ABSORB') {
      handManager.leftHand.targetPos.set(-0.24, 0.92, -0.55);
      handManager.rightHand.targetPos.set(0.24, 0.92, -0.55);
      handManager.leftHand.posture = Posture.RELAXED;
      handManager.rightHand.posture = Posture.RELAXED;
    }
    // Phase 9: Finale & Lady Seraphina Golden Key Bestowal!
    else if (this.step === 'ALL_COMPLETED') {
      handManager.isHandExternallyControlled = true;

      // Left hand rests in calm celebratory posture
      handManager.leftHand.targetPos.set(-0.16, 1.20, -0.48);
      handManager.leftHand.posture = Posture.THUMBS_UP;

      // Right hand holds the golden key firmly in front of the camera
      handManager.rightHand.targetPos.set(0.14, 1.25, -0.48);
      handManager.rightHand.posture = Posture.KEY_PINCH;
      handManager.rightHand.isPinching = true;

      if (this.ghostSeraphina && !this.ghostSeraphina.hasGivenKey && typeof this.ghostSeraphina.giveGoldenKeyTo === 'function') {
        this.ghostSeraphina.giveGoldenKeyTo(handManager);
      }
    }
  }

  // =============================================================
  // Frame Update Loop
  // =============================================================

  update(delta, time, handManager, ghostSeraphina) {
    if (!this.unlocked || !this.root.visible) return;

    const hm = handManager || this.handManager;
    const gs = ghostSeraphina || this.ghostSeraphina;
    if (hm) this.handManager = hm;
    if (gs) this.ghostSeraphina = gs;

    // Drive Hands-Free Auto-Run if enabled
    if (this.isAutoRun && hm) {
      this.updateAutoRun(delta, time, hm);
    }

    // Strictly enforce that only the ACTIVE mini-game's score badge is visible (zero overlapping cards)
    if (this.step.startsWith('STEP_') || this.step === 'COMPLETED') {
      if (this.soul1Badge) this.soul1Badge.visible = true;
      if (this.soul2Badge) this.soul2Badge.visible = false;
      if (this.soul3Badge) this.soul3Badge.visible = false;
    } else if (this.step.startsWith('GAME_2_') || this.step === 'GAME_2_DONE') {
      if (this.soul1Badge) this.soul1Badge.visible = false;
      if (this.soul2Badge) this.soul2Badge.visible = true;
      if (this.soul3Badge) this.soul3Badge.visible = false;
    } else if (this.step.startsWith('GAME_3_') || this.step === 'ALL_COMPLETED') {
      if (this.soul1Badge) this.soul1Badge.visible = false;
      if (this.soul2Badge) this.soul2Badge.visible = false;
      if (this.soul3Badge) this.soul3Badge.visible = true;
    }

    // Always update ascending lanterns so ANY lit lotus (especially the 3rd lantern) continues
    // ascending smoothly toward the rotunda dome across all subsequent steps
    this.updateAscendingLanterns(delta, time);

    switch (this.step) {
      // Game 1
      case 'STEP_A_ROAMING':
        this.updateSoul1Roaming(delta, time);
        this.checkStopPalmGesture(delta, hm);
        break;

      case 'STEP_B_LANTERNS':
        this.updateSoul1Roaming(delta, time);
        this.updateLanternsInteraction(delta, time, hm);
        break;

      case 'STEP_C_ABSORB':
        this.updateSoulAbsorption(delta, time);
        break;

      case 'COMPLETED':
        this.intermissionTimer = (this.intermissionTimer || 0.0) + delta;
        // From 1.5s to 3.5s, smoothly glide Soul 2 from queue to center!
        if (this.intermissionTimer >= 1.5 && this.intermissionTimer <= 3.5) {
          const t = Math.min(1.0, (this.intermissionTimer - 1.5) / 2.0);
          const ease = t * (2 - t);
          this.soul2Group.position.lerpVectors(
            new THREE.Vector3(-1.15, 1.45, -2.10),
            new THREE.Vector3(-0.30, 1.35, -1.60),
            ease
          );
          this.soul3Group.position.lerpVectors(
            new THREE.Vector3(-1.85, 1.55, -2.65),
            new THREE.Vector3(-1.15, 1.45, -2.10),
            ease
          );
        }
        if (this.intermissionTimer >= 3.5) {
          this.startMiniGame2();
        }
        break;

      // Game 2
      case 'GAME_2_ROAMING':
        this.updateSoul2Roaming(delta, time);
        this.checkStopPalmSoul2(delta, hm);
        break;

      case 'GAME_2_RELIC':
        this.updateSoul2Roaming(delta, time);
        this.updateAstrolabeInteraction(delta, time, hm);
        break;

      case 'GAME_2_ABSORB':
        this.updateSoul2Absorption(delta, time);
        break;

      case 'GAME_2_DONE':
        this.intermissionTimer = (this.intermissionTimer || 0.0) + delta;
        // From 1.5s to 3.5s, smoothly glide Soul 3 from queue to center!
        if (this.intermissionTimer >= 1.5 && this.intermissionTimer <= 3.5) {
          const t = Math.min(1.0, (this.intermissionTimer - 1.5) / 2.0);
          const ease = t * (2 - t);
          this.soul3Group.position.lerpVectors(
            new THREE.Vector3(-1.15, 1.45, -2.10),
            new THREE.Vector3(-0.30, 1.32, -1.60),
            ease
          );
        }
        if (this.intermissionTimer >= 3.5) {
          this.startMiniGame3();
        }
        break;

      // Game 3
      case 'GAME_3_ROAMING':
        this.updateSoul3Roaming(delta, time);
        this.checkStopPalmSoul3(delta, hm);
        break;

      case 'GAME_3_WEAVING':
        this.updateSoul3Roaming(delta, time);
        this.updateWeavingInteraction(delta, time, hm);
        break;

      case 'GAME_3_SEAL':
        this.updateSoul3Roaming(delta, time);
        this.checkDualPalmSeal(delta, hm);
        break;

      case 'GAME_3_ABSORB':
        this.updateSoul3Absorption(delta, time);
        break;

      case 'ALL_COMPLETED':
      default:
        break;
    }
  }
}

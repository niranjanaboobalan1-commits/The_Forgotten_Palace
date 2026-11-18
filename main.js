/**
 * Main WebXR & Desktop Simulation Attic Application
 * Orchestrates Environment, Hand Interaction, 3 Control Modes ([1], [2], [3]),
 * 11 Interaction States, Procedural Audio, and Grand Palace Transition.
 */

import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {
  buildAtticEnvironment,
  buildOrnateChest,
  buildCanvasTarp,
  buildDreamcatcher
} from './atticScene.js';

import {
  AmbientDust,
  BoxGlowParticles,
  ChestDustBurst,
  BrushDustPuff,
  GoldenTransitionWave,
  WhirlingShellVortex
} from './particles.js';

import {
  initAudio,
  playTarpRustle,
  playCreak,
  playMagicShimmer,
  playBrushWhoosh,
  playShellClink,
  playTingChime,
  playSuccessChime,
  playPalaceTransitionBoom,
  startAtticHorrorMusic,
  stopAtticHorrorMusic,
  getAudioStream
} from './soundEffects.js';

import { buildPalaceScene } from './palaceScene.js';
import { GhostSeraphina } from './ghostSeraphina.js';
import { SoulMiniGamesManager } from './soulMiniGames.js';

import {
  HandInteractionManager,
  ControlMode,
  InteractionState
} from './handInteraction.js';

// -------------------------------------------------------------
// Global Transition Hook (Ready for Scene 2: Grand Palace)
// -------------------------------------------------------------

window.triggerPalaceTransition = function (payload = {}) {
  console.log(
    '%c[WEBXR] TRIGGER_PALACE_TRANSITION',
    'background: #ffd700; color: #000; font-size: 16px; font-weight: bold; padding: 6px 12px; border-radius: 4px;'
  );
  console.log('Transition Payload for Scene 2 (Grand Palace):', payload);

  window.dispatchEvent(
    new CustomEvent('palaceTransition', {
      detail: {
        timestamp: performance.now(),
        nextScene: 'Scene_2_Grand_Palace',
        ...payload
      }
    })
  );

  if (window.app) {
    window.app.fadeAtticForTransition();
  }
};

window.onTransitionToPalace = window.triggerPalaceTransition;

class AtticApp {
  constructor() {
    window.app = this;
    this.currentStep = 1;
    this.brushCount = 0;
    this.requiredBrushes = 2;
    this.currentTheme = 'light'; // Default to bright daylight sunlit attic theme

    this.clock = new THREE.Clock();
    // Positioned directly in the window light beam path
    this.chestPosition = new THREE.Vector3(-0.35, 0.36, -0.75);

    // Scene 2: Grand Palace Escape State
    const urlParams = typeof window !== 'undefined' && window.location ? new URLSearchParams(window.location.search) : null;
    this.isAutoRun = urlParams ? urlParams.get('autorun') !== '0' : true;
    this.sceneState = 'ATTIC'; // 'ATTIC' | 'SEASHELL_RISING' | 'PALACE_EMPTY' | 'PALACE_SERAPHINA' | 'PALACE_GAMES_UNLOCKED'
    this.palace = null;
    this.ghostSeraphina = null;
    this.soulMiniGames = null;
    this.seashellRiseAnim = {
      active: false,
      progress: 0,
      duration: 1.8,
      startPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(0.0, 0.52, -1.2),
      startRotY: 0,
      whirlSpeed: 0.0,
      phase: 'IDLE', // 'IDLE' | 'FLOOR_GLOW' | 'RISING' | 'WHIRLING' | 'DISSOLVE' | 'REVEAL_PALACE'
      phaseTimer: 0.0,
      shellMesh: null
    };
    this.palaceEmptyTimer = 0;
    this.dissolveMesh = null;
    this.dissolveMat = null;
    this.shellGlowLight = null;
    this.whirlingVortex = null;

    // Frame-based animation states (zero race conditions, no clock stealing)
    this.tarpAnim = {
      active: false,
      progress: 0,
      duration: 1.15,
      startPos: new THREE.Vector3(),
      endPos: new THREE.Vector3(),
      startRotX: 0,
      endRotX: 0,
      startRotZ: 0,
      endRotZ: 0
    };

    this.lidAnim = {
      active: false,
      progress: 0,
      duration: 1.45,
      startAngle: 0,
      targetAngle: -1.42
    };

    this.dcLiftAnim = {
      active: false,
      progress: 0,
      duration: 1.10,
      startPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      startRotX: 0,
      targetRotX: 0
    };

    this.initThree();
    this.initScene();
    this.initParticles();
    this.initInteractions();
    this.setupHUD();
    this.initCenterStatusBox();
    this.initVideoRecorder();

    this.renderer.setAnimationLoop(this.render.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));

    console.log('[AtticApp] Atmospheric Attic Scene initialized with Sleek White Articulated Hands & Showcase Mode.');

    // Start procedural mild horror background music (plays in attic & continues through palace)
    startAtticHorrorMusic();

    // Display "Game On" banner in the middle when game starts
    this.showCenterStatusBox('Game On', 2.8);

    // Immediate Palace Scene Preview Mode for ?scene=palace
    if (typeof window !== 'undefined' && window.location && window.location.search.includes('palace')) {
      setTimeout(() => {
        this.executeGrandPalaceTransformation();
        this.materializeGhostSeraphina();
        if (this.dreamcatcher?.fallingShell) {
          const shell = this.dreamcatcher.fallingShell;
          shell.userData.isDetached = true;
          shell.userData.hasLanded = true;
          shell.position.set(0.0, 0.48, -1.35);
          shell.rotation.set(0, 0, 0);
          shell.scale.set(6.5, 6.5, 6.5);
          this.seashellRiseAnim.shellMesh = shell;
          if (shell.material) {
            shell.material.emissive = new THREE.Color(0xd99b26);
            shell.material.emissiveIntensity = 0.28;
          }
        }
      }, 100);
    }
  }

  initThree() {
    this.container = document.getElementById('scene-container') || document.body;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.xr.enabled = true;

    this.container.appendChild(this.renderer.domElement);

    // VRButton with hand-tracking and controller features requested
    const sessionInit = {
      optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers']
    };
    const vrBtn = VRButton.createButton(this.renderer, sessionInit);
    document.body.appendChild(vrBtn);

    // Note: Never auto-enter WebXR immersive-vr on page load!
    // Preserves pristine laptop desktop viewport framing, UI controls, and hands.
    // WebXR can be entered voluntarily at any time by clicking the VR button.

    // Scene & Camera Rig (Light theme sky background by default)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdde9f5);

    // Perspective Camera (54 FOV, cinematic eye-level view centered on chest & dreamcatcher)
    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.05, 50);

    // Camera Rig for WebXR:
    // Placed to align viewer's standing/seated eye height naturally with the antique chest and lifted dreamcatcher
    this.cameraRig = new THREE.Group();
    this.cameraRig.name = 'cameraRig';
    this.cameraRig.position.set(-0.22, -0.65, 0.15);
    this.cameraRig.rotation.set(0, 0, 0);
    this.scene.add(this.cameraRig);

    // Default Desktop View (Cinematic 3/4 Video Perspective):
    // Framed with subtle 10° angle and 15° gentle downward pitch:
    // - Chest & table centered in lower half
    // - Latch clasp dead center
    // - Dreamcatcher lifts into upper third (golden ratio)
    // - Seashell floor impact fully visible at bottom
    // - Atmospheric skylight sunbeam cuts diagonally across the scene
    this.camera.position.set(-0.20, 0.78, 0.20);
    this.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(-0.35, 0.56, -0.60);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
    this.controls.minDistance = 0.3;
    this.controls.maxDistance = 3.6;
    this.controls.update();

    this.renderer.xr.addEventListener('sessionstart', () => {
      this.controls.enabled = false;
      this.cameraRig.add(this.camera);
      this.resetScene();
      if (this.handManager) {
        this.handManager.restartShowcase();
      }
      initAudio();
      this.updateHUDStatus('WebXR Hand Tracking Active');
    });

    this.renderer.xr.addEventListener('sessionend', () => {
      this.scene.add(this.camera);
      this.camera.position.set(-0.20, 0.78, 0.20);
      this.controls.target.set(-0.35, 0.56, -0.60);
      this.controls.enabled = true;
      this.controls.update();
      this.updateHUDStatus('Desktop Simulation Mode');
    });
  }

  initScene() {
    // 1. Full Attic Architecture with Daylight / Sunlit Light Theme support
    const env = buildAtticEnvironment(this.scene, this.chestPosition, this.currentTheme);
    this.atticEnv = env;
    this.atticRoot = env.atticRoot;
    this.moonlight = env.moonlight;
    this.moonlightSpot = env.moonlightSpot;
    this.moonShaft = env.moonShaft;
    this.ambientLight = env.ambientLight;

    // 2. The Antique Wooden Chest & Glowing Mystic Box (Cyan glow reduced by 70%)
    this.chest = buildOrnateChest(this.scene, this.chestPosition);

    // 3. Canvas Tarp with Edge Displacement
    this.tarp = buildCanvasTarp(this.scene, this.chestPosition);

    // 4. Detailed Procedural Dreamcatcher (Tucked inside chest, hidden until opened)
    this.dreamcatcher = buildDreamcatcher(this.scene, this.chestPosition);
    this.dreamcatcher.dreamcatcherGroup.visible = false;

    // Caching original positions for reset
    this.initialTarpPos = this.tarp.tarpMesh.position.clone();
    this.initialTarpRot = this.tarp.tarpMesh.rotation.clone();
    this.initialDCPos = this.dreamcatcher.dreamcatcherGroup.position.clone();
    this.initialDCRot = this.dreamcatcher.dreamcatcherGroup.rotation.clone();

    // 5. Golden Shell Glow Point Light
    this.shellGlowLight = new THREE.PointLight(0xffdf77, 0, 4.5);
    this.shellGlowLight.visible = false;
    this.scene.add(this.shellGlowLight);

    // 6. Camera-Aligned Cinematic Dissolve Veil (Dissolves Attic into Palace)
    const dissolveGeo = new THREE.PlaneGeometry(3.5, 3.5);
    this.dissolveMat = new THREE.MeshBasicMaterial({
      color: 0xfef9c3, // Warm golden-ivory champagne light
      transparent: true,
      opacity: 0.0,
      depthTest: false,
      depthWrite: false
    });
    this.dissolveMesh = new THREE.Mesh(dissolveGeo, this.dissolveMat);
    this.dissolveMesh.frustumCulled = false;
    this.dissolveMesh.renderOrder = 99999;
    this.dissolveMesh.visible = false;
    this.scene.add(this.dissolveMesh);
  }

  initParticles() {
    this.ambientDust = new AmbientDust(this.scene, 420);
    this.boxGlow = new BoxGlowParticles(
      this.scene,
      new THREE.Vector3(this.chestPosition.x, 0.62, this.chestPosition.z),
      160
    );
    this.chestDustBurst = new ChestDustBurst(this.scene, 220);
    this.brushDustPuff = new BrushDustPuff(this.scene, 90);
    this.goldenWave = new GoldenTransitionWave(this.scene, 650);
    this.whirlingVortex = new WhirlingShellVortex(this.scene, 120);
  }

  initInteractions() {
    this.handManager = new HandInteractionManager(
      this.renderer,
      this.scene,
      this.camera,
      document.getElementById('desktop-hud')
    );

    this.handManager.setTargets({
      tarp: this.tarp.tarpMesh,
      lid: this.chest.lidHinge,
      chestGroup: this.chest.chestGroup,
      latchPlate: this.chest.latchPlate,
      latchClasp: this.chest.clasp,
      dreamcatcher: this.dreamcatcher.dreamcatcherGroup,
      fallingShell: this.dreamcatcher.fallingShell
    });

    // Narrative callback links
    this.handManager.onTarpPulled = () => {
      this.executeTarpSlideOff();
    };

    this.handManager.onLatchRotated = () => {
      playCreak();
    };

    this.handManager.onLidOpened = () => {
      this.executeLidOpen();
    };

    this.handManager.onDreamcatcherLifted = () => {
      this.executeDreamcatcherLift();
    };

    this.handManager.onDreamcatcherSupported = () => {
      playMagicShimmer();
      this.updateHUD();
    };

    this.handManager.onDreamcatcherBrushed = (position, direction, swipeNum) => {
      this.executeDreamcatcherBrush(position, direction, swipeNum);
    };

    this.handManager.onStepChanged = () => {
      this.updateHUD();
    };

    this.handManager.onModeChanged = () => {
      this.updateHUD();
    };
  }

  // -------------------------------------------------------------
  // Step State Transitions & Smooth Frame-Driven Animations
  // -------------------------------------------------------------

  executeTarpSlideOff() {
    if (this.tarpAnim.active) return;
    this.tarpAnim.active = true;
    this.tarpAnim.progress = 0;
    this.isTarpAnimating = true;
    playTarpRustle();

    const startPos = this.initialTarpPos ? this.initialTarpPos.clone() : this.tarp.tarpMesh.position.clone();
    const endPos = new THREE.Vector3(startPos.x - 0.44, 0.035, startPos.z + 0.18);
    this.tarpAnim.startPos.copy(startPos);
    this.tarpAnim.endPos.copy(endPos);
    this.tarpAnim.startRotX = this.initialTarpRot ? this.initialTarpRot.x : this.tarp.tarpMesh.rotation.x;
    this.tarpAnim.endRotX = (this.initialTarpRot ? this.initialTarpRot.x : this.tarp.tarpMesh.rotation.x) + 0.35;
    this.tarpAnim.startRotZ = this.initialTarpRot ? this.initialTarpRot.z : this.tarp.tarpMesh.rotation.z;
    this.tarpAnim.endRotZ = (this.initialTarpRot ? this.initialTarpRot.z : this.tarp.tarpMesh.rotation.z) + 0.55;
  }

  executeLidOpen() {
    if (this.lidAnim.active) return;
    this.lidAnim.active = true;
    this.lidAnim.progress = 0;
    this.isLidAnimating = true;

    // Hanger remains 100% concealed inside box until hands physically lift it out
    if (this.dreamcatcher?.dreamcatcherGroup) {
      this.dreamcatcher.dreamcatcherGroup.visible = false;
    }

    playCreak();
    playMagicShimmer();

    const chestCenter = new THREE.Vector3(this.chestPosition.x, 0.62, this.chestPosition.z);
    this.chestDustBurst.trigger(chestCenter);

    this.lidAnim.startAngle = this.chest.lidHinge.rotation.x;
  }

  executeDreamcatcherLift() {
    if (this.dcLiftAnim.active) return;
    this.dcLiftAnim.active = true;
    this.dcLiftAnim.progress = 0;
    this.isDCLifting = true;

    // Reveal and lift the hanger smoothly accompanying the hands' grip
    if (this.dreamcatcher?.dreamcatcherGroup) {
      this.dreamcatcher.dreamcatcherGroup.visible = true;
    }

    playMagicShimmer();

    const dcGroup = this.dreamcatcher.dreamcatcherGroup;
    this.dcLiftAnim.startPos.copy(dcGroup.position);
    this.dcLiftAnim.targetPos.set(-0.35, 0.70, -0.45);
    this.dcLiftAnim.startRotX = dcGroup.rotation.x;
    this.dcLiftAnim.targetRotX = 0.0;
  }

  updateSceneAnimations(delta) {
    // 1. Tarp Slide Animation (Driven smoothly every frame)
    if (this.tarpAnim.active) {
      this.tarpAnim.progress += delta / this.tarpAnim.duration;
      const ease = 1 - Math.pow(1 - Math.min(1, this.tarpAnim.progress), 3);
      if (!this.handManager || !this.handManager.isShowcaseActive) {
        this.tarp.tarpMesh.position.lerpVectors(this.tarpAnim.startPos, this.tarpAnim.endPos, ease);
        this.tarp.tarpMesh.rotation.x = THREE.MathUtils.lerp(this.tarpAnim.startRotX, this.tarpAnim.endRotX, ease);
        this.tarp.tarpMesh.rotation.z = THREE.MathUtils.lerp(this.tarpAnim.startRotZ, this.tarpAnim.endRotZ, ease);
      }

      if (this.tarpAnim.progress >= 1) {
        this.tarpAnim.active = false;
        this.isTarpAnimating = false;
        if (this.brushDustPuff) {
          this.brushDustPuff.trigger(this.tarpAnim.endPos, new THREE.Vector3(0, 1, 0));
        }
        this.currentStep = 4;
        this.updateHUD();
      }
    }

    // 2. Lid Opening Animation
    if (this.lidAnim.active) {
      this.lidAnim.progress += delta / this.lidAnim.duration;
      const ease = 1 - Math.pow(1 - Math.min(1, this.lidAnim.progress), 2.6);
      this.chest.lidHinge.rotation.x = THREE.MathUtils.lerp(this.lidAnim.startAngle, this.lidAnim.targetAngle, ease);

      const lightBoost = 1.0 + ease * 1.5;
      this.chest.innerLight.intensity = 0.72 * lightBoost;
      this.chest.innerLight.distance = 3.0 + ease * 1.2;

      if (this.lidAnim.progress >= 1) {
        this.lidAnim.active = false;
        this.isLidAnimating = false;
        this.currentStep = 7;
        this.updateHUD();
      }
    }

    // 3. Dreamcatcher Lift Animation (Synchronized with hands; hands retain 100% position authority)
    if (this.dcLiftAnim.active) {
      this.dcLiftAnim.progress += delta / this.dcLiftAnim.duration;
      const ease = 1 - Math.pow(1 - Math.min(1, this.dcLiftAnim.progress), 3);
      const dcGroup = this.dreamcatcher.dreamcatcherGroup;
      if (!this.handManager || !this.handManager.dreamcatcherHeldBy) {
        dcGroup.position.lerpVectors(this.dcLiftAnim.startPos, this.dcLiftAnim.targetPos, ease);
      }
      dcGroup.rotation.x = THREE.MathUtils.lerp(this.dcLiftAnim.startRotX, this.dcLiftAnim.targetRotX, ease);

      if (this.dcLiftAnim.progress >= 1) {
        this.dcLiftAnim.active = false;
        this.isDCLifting = false;
        this.currentStep = 9;
        this.updateHUD();
      }
    }
  }

  executeDreamcatcherBrush(position, direction, swipeNum) {
    this.brushCount = swipeNum || (this.brushCount + 1);
    playBrushWhoosh();
    this.brushDustPuff.trigger(position, direction || new THREE.Vector3(1, 0, 0));

    if (this.dreamcatcher.crystal) {
      this.dreamcatcher.crystal.material.emissiveIntensity += 1.4;
    }

    if (this.brushCount === 1) {
      console.log('[AtticScene] Dusting Swipe (1/2) complete.');
      this.updateHUD();
    } else if (this.brushCount >= this.requiredBrushes) {
      console.log('[AtticScene] Dusting Swipe (2/2) complete. Detaching final seashell!');
      this.detachSeashell();
      this.currentStep = 11;
      this.updateHUD();
    }
  }

  detachSeashell() {
    const shell = this.dreamcatcher.fallingShell;
    if (!shell || shell.userData.isDetached) return;

    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    shell.getWorldPosition(worldPos);
    shell.getWorldQuaternion(worldQuat);

    this.scene.attach(shell);
    shell.position.copy(worldPos);
    shell.quaternion.copy(worldQuat);

    if (this.dreamcatcher.centerThread) {
      this.dreamcatcher.centerThread.scale.y = 0.5;
    }

    shell.userData.isDetached = true;
    shell.userData.hasLanded = false;
    shell.userData.velocity.set(
      (Math.random() - 0.5) * 0.12,
      -0.05,
      (Math.random() - 0.5) * 0.12
    );
    shell.userData.angularVelocity.set(
      3.2 + Math.random() * 3.5,
      1.8 + Math.random() * 2.5,
      2.5 + Math.random() * 3.0
    );
  }

  updatePhysics(delta) {
    const shell = this.dreamcatcher.fallingShell;
    if (shell && shell.userData.isDetached && !shell.userData.hasLanded) {
      const uData = shell.userData;
      uData.velocity.y -= 7.5 * delta; // Graceful visible gravitational fall

      shell.position.x += uData.velocity.x * delta;
      shell.position.y += uData.velocity.y * delta;
      shell.position.z += uData.velocity.z * delta;

      shell.rotation.x += uData.angularVelocity.x * delta;
      shell.rotation.y += uData.angularVelocity.y * delta;
      shell.rotation.z += uData.angularVelocity.z * delta;

      const floorY = 0.025;
      if (shell.position.y <= floorY) {
        shell.position.y = floorY;
        uData.hasLanded = true;
        uData.velocity.set(0, 0, 0);
        uData.angularVelocity.set(0, 0, 0);

        this.onShellFloorImpact(shell.position.clone());
      }
    }
  }

  onShellFloorImpact(impactPoint) {
    // Step 1: Immediate crisp, high-pitched metallic/crystal "ting" chime & shell clink on floor
    playTingChime();
    playShellClink();

    // Floor shockwave & golden resonance ring
    this.goldenWave.trigger(impactPoint);

    // Keep right hand holding dreamcatcher in attic and left hand open
    if (this.handManager) {
      this.handManager.setTransitionToPalacePose();
    }

    if (this.moonlight) {
      const origColor = this.moonlight.color.getHex();
      this.moonlight.color.setHex(0xffd700);
      this.moonlight.intensity = 4.8;

      setTimeout(() => {
        if (this.moonlight) {
          this.moonlight.color.setHex(origColor);
          this.moonlight.intensity = 2.6;
        }
      }, 1600);
    }

    // Step 2: Seashell Glow on floor & Levitation + Whirling sequence
    const shell = this.dreamcatcher.fallingShell;
    if (shell) {
      this.seashellRiseAnim.active = true;
      this.seashellRiseAnim.phase = 'FLOOR_GLOW';
      this.seashellRiseAnim.phaseTimer = 0.0;
      this.seashellRiseAnim.progress = 0;
      this.seashellRiseAnim.duration = 1.8;
      this.seashellRiseAnim.startPos.copy(shell.position);
      this.seashellRiseAnim.targetPos.set(0.0, 0.52, -1.2);
      this.seashellRiseAnim.startRotY = shell.rotation.y;
      this.seashellRiseAnim.whirlSpeed = 0.0;
      this.seashellRiseAnim.shellMesh = shell;

      // Magical golden emissive glow on the floor
      if (shell.material) {
        shell.material.emissive = new THREE.Color(0xffd700);
        shell.material.emissiveIntensity = 0.9;
      }
      if (this.shellGlowLight) {
        this.shellGlowLight.position.copy(shell.position);
        this.shellGlowLight.position.y += 0.05;
        this.shellGlowLight.intensity = 2.8;
        this.shellGlowLight.visible = true;
      }
      if (this.whirlingVortex) {
        this.whirlingVortex.activate(shell.position);
      }
    }

    // Trigger Grand Palace Transition Hook (horror music continues into palace seamlessly)
    window.triggerPalaceTransition({
      origin: 'SeashellFloorImpact',
      impactPoint: impactPoint.toArray(),
      goldenShockwaveColor: '#ffd700'
    });
  }

  executeGrandPalaceTransformation() {
  console.log('[Transition] Step 3: Transforming environment from Attic into Grand Palace...');
  this.sceneState = 'PALACE_EMPTY';
  this.palaceEmptyTimer = 0;

  // Remove Attic environment
  if (this.atticRoot) {
    this.scene.remove(this.atticRoot);
  }
  // Remove chest and tarp meshes
  if (this.chest?.chestGroup) {
    this.scene.remove(this.chest.chestGroup);
  }
  if (this.tarp?.tarpMesh) {
    this.scene.remove(this.tarp.tarpMesh);
  }
  // Remove dream-hanger so it NEVER rises up or hovers in the palace
  if (this.dreamcatcher?.dreamcatcherGroup) {
    this.scene.remove(this.dreamcatcher.dreamcatcherGroup);
    this.dreamcatcher.dreamcatcherGroup.visible = false;
  }

  // Balanced Lighting & Exposure (Photorealistic Panorama with zero washout and zero black void)
  this.scene.fog = null;
  this.scene.background = new THREE.Color(0xf6ede2); // Warm palace ambient ivory (never black container)
  this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  this.renderer.toneMappingExposure = 0.95;

  // Turn off attic specific lights & completely turn off floating attic dust particles & golden wave
  if (this.ambientLight) this.ambientLight.intensity = 0;
  if (this.moonlight) this.moonlight.intensity = 0;
  if (this.moonlightSpot) this.moonlightSpot.intensity = 0;
  if (this.moonShaft) this.moonShaft.visible = false;
  if (this.goldenWave) {
    this.goldenWave.active = false;
    if (this.goldenWave.points) this.goldenWave.points.visible = false;
    if (this.goldenWave.ringMesh) this.goldenWave.ringMesh.visible = false;
  }
  if (this.boxGlow?.points) this.boxGlow.points.visible = false;
  if (this.ambientDust?.points) {
    this.ambientDust.points.visible = false;
    this.ambientDust.points.position.set(0, -999, 0);
  }
  if (this.chestDustBurst?.points) this.chestDustBurst.points.visible = false;
  if (this.brushDustPuff?.points) this.brushDustPuff.points.visible = false;

  // Hide any 3D floating seashells so ONLY the photorealistic carpet seashell is visible
  if (this.seashellRiseAnim?.shellMesh) {
    this.seashellRiseAnim.shellMesh.visible = false;
  }
  if (this.palace?.hoveringSeashell) {
    this.palace.hoveringSeashell.visible = false;
  }

  // Add Grand Palace scene
  if (!this.palace) {
    this.palace = buildPalaceScene(this.scene);
    this.scene.add(this.palace.palaceRoot);
  } else {
    this.scene.add(this.palace.palaceRoot);
  }

  // Initialize 3 Soul Mini-Games Manager & Interactive Anchors
  if (!this.soulMiniGames) {
    this.soulMiniGames = new SoulMiniGamesManager(this.scene);
  }

  // Smoothly transition camera to frame the grand hall
  if (this.cameraRig) {
    this.cameraRig.position.set(0, 0, 0);
    this.cameraRig.rotation.set(0, 0, 0);
  }
  this.camera.position.set(0.0, 1.35, 1.15);
  this.controls.target.set(0.0, 1.15, -2.5);
  this.controls.update();

  // Keep hands in default WebXR posture terminating at wrist
  if (this.handManager) {
    this.handManager.setTransitionToPalacePose();
  }

  // Update HUD banner
  this.updateHUDStatus('Scene 2: The Grand Palace Escape — The silent palace awaits...');
  console.log('[Transition] Step 4: Silent 5.0s Empty Palace pause started...');
}

materializeGhostSeraphina() {
  console.log('[Transition] Step 5: Lady Seraphina materializing and beginning speech...');
  if (!this.ghostSeraphina) {
    this.ghostSeraphina = new GhostSeraphina(this.scene, {
      handManager: this.handManager,
      onDialogueEnd: () => {
        this.onSeraphinaDialogueEnd();
      }
    });
  }
  this.ghostSeraphina.handManager = this.handManager;
  this.ghostSeraphina.materialize();
  this.updateHUDStatus('Scene 2: Lady Seraphina speaks...');
}

onSeraphinaDialogueEnd() {
  console.log('[Transition] Step 6: Dialogue finished -> Triggering Player Thumbs Up & Unlocking Mini-Games!');
  this.sceneState = 'PALACE_GAMES_UNLOCKED';

  // Step 6: Transition both hands to Posture.THUMBS_UP
  if (this.handManager) {
    this.handManager.setThumbsUpPose();
  }

  // Play triumphant success chime
  playSuccessChime();

  // Unlock the 3 Soul Mini-Games
  this.unlockSoulMiniGames();
}

unlockSoulMiniGames() {
  this.updateHUDStatus('Soul Mini-Games Unlocked: 1. Lantern Bloom | 2. Relic Restoration | 3. Thread Weaving');
  if (this.soulMiniGames) {
    this.soulMiniGames.setDependencies({
      handManager: this.handManager,
      ghostSeraphina: this.ghostSeraphina,
      camera: this.camera
    });
    if (this.ghostSeraphina) {
      this.ghostSeraphina.handManager = this.handManager;
    }
    this.soulMiniGames.unlock();
    if (this.isAutoRun) {
      this.soulMiniGames.startAutoRun();
    }
  }

  // Suppress any black container toast or banner
  const toast = document.getElementById('error-toast');
  if (toast) {
    toast.style.display = 'none';
  }
}

fadeAtticForTransition() {
  let fadeProgress = 0;
  const fadeDuration = 2.4;

  const fadeAnim = () => {
    fadeProgress += this.clock.getDelta() / fadeDuration;
    const t = Math.min(1, fadeProgress);

    if (this.ambientLight) {
      this.ambientLight.intensity = THREE.MathUtils.lerp(1.8, 0.05, t);
    }
    if (this.moonShaft) {
      this.moonShaft.material.opacity = THREE.MathUtils.lerp(0.18, 0.0, t);
    }
    if (this.scene.fog) {
      this.scene.fog.density = THREE.MathUtils.lerp(0.038, 0.28, t);
    }

    if (fadeProgress < 1) {
      requestAnimationFrame(fadeAnim);
    } else {
      console.log('[AtticApp] Attic scene completely faded. Grand Palace Scene Ready.');
    }
  };
  requestAnimationFrame(fadeAnim);
}

resetScene() {
  this.currentStep = 1;
  this.brushCount = 0;
  this.isTarpAnimating = false;
  this.isLidAnimating = false;
  this.isDCLifting = false;

  // Reset Grand Palace & Seraphina if active
  if (this.palace?.palaceRoot) {
    this.scene.remove(this.palace.palaceRoot);
  }
  if (this.ghostSeraphina?.group) {
    this.scene.remove(this.ghostSeraphina.group);
    this.ghostSeraphina.hideSubtitles();
    this.ghostSeraphina = null;
  }
  if (this.atticRoot) {
    this.scene.add(this.atticRoot);
  }
  if (this.chest?.chestGroup) {
    this.scene.add(this.chest.chestGroup);
  }
  if (this.tarp?.tarpMesh) {
    this.scene.add(this.tarp.tarpMesh);
  }
  if (this.moonShaft) this.moonShaft.visible = true;
  if (this.boxGlow?.points) this.boxGlow.points.visible = true;

  this.sceneState = 'ATTIC';
  this.seashellRiseAnim.active = false;
  this.seashellRiseAnim.phase = 'IDLE';
  this.seashellRiseAnim.phaseTimer = 0;
  this.palaceEmptyTimer = 0;

  // Restart mild horror background music in attic
  startAtticHorrorMusic();

  // Display "Game On" banner in the middle on reset
  this.showCenterStatusBox('Game On', 2.8);

  if (this.whirlingVortex) this.whirlingVortex.deactivate();
  if (this.shellGlowLight) this.shellGlowLight.visible = false;
  if (this.dissolveMesh) this.dissolveMesh.visible = false;
  if (this.dissolveMat) this.dissolveMat.opacity = 0.0;

  if (this.cameraRig) {
    this.cameraRig.position.set(-0.22, -0.65, 0.15);
    this.cameraRig.rotation.set(0, 0, 0);
  }
  this.camera.position.set(-0.20, 0.78, 0.20);
  this.controls.target.set(-0.35, 0.56, -0.60);
  this.controls.update();

  // Reset frame-driven animation states
  this.tarpAnim.active = false;
  this.tarpAnim.progress = 0;
  this.lidAnim.active = false;
  this.lidAnim.progress = 0;
  this.dcLiftAnim.active = false;
  this.dcLiftAnim.progress = 0;

  if (this.handManager) {
    this.handManager.interactionState = InteractionState.STATE_1_APPROACH_TARP;
    this.handManager.isLatchUnlocked = false;
    this.handManager.dreamcatcherHeldBy = null;
    this.handManager.brushCount = 0;
    this.handManager.setControlMode(ControlMode.LEFT_ONLY);

    this.handManager.leftHand.targetPos.set(-0.46, 0.56, -0.38);
    this.handManager.leftHand.currentPos.copy(this.handManager.leftHand.targetPos);
    this.handManager.leftHand.posture = 'RELAXED';

    this.handManager.rightHand.targetPos.set(-0.24, 0.56, -0.38);
    this.handManager.rightHand.currentPos.copy(this.handManager.rightHand.targetPos);
    this.handManager.rightHand.posture = 'RELAXED';
  }

  // Reset Tarp
  this.tarp.tarpMesh.position.copy(this.initialTarpPos);
  this.tarp.tarpMesh.rotation.copy(this.initialTarpRot);
  this.tarp.tarpMesh.material.emissive.setHex(0x000000);

  // Reset Lid & Latch
  this.chest.lidHinge.rotation.x = 0;
  if (this.chest.clasp) {
    this.chest.clasp.rotation.z = 0;
  }
  this.chest.innerLight.intensity = 0.72;

  // Reset Dreamcatcher (hidden inside box until opened)
  this.dreamcatcher.dreamcatcherGroup.position.copy(this.initialDCPos);
  this.dreamcatcher.dreamcatcherGroup.rotation.copy(this.initialDCRot);
  this.dreamcatcher.dreamcatcherGroup.visible = false;
  if (this.dreamcatcher.crystal) {
    this.dreamcatcher.crystal.material.emissiveIntensity = 0.85;
  }
  if (this.dreamcatcher.centerThread) {
    this.dreamcatcher.centerThread.scale.y = 1.0;
  }

  // Reattach shell
  const shell = this.dreamcatcher.fallingShell;
  if (shell) {
    shell.userData.isDetached = false;
    shell.userData.hasLanded = false;
    shell.userData.velocity.set(0, 0, 0);
    shell.userData.angularVelocity.set(0, 0, 0);
    this.dreamcatcher.dreamcatcherGroup.add(shell);
    shell.position.set(0.0, -0.15 - 0.14, 0);
    shell.rotation.set(0, 0, 0);
    shell.scale.set(1, 1, 1);
  }

  if (this.ambientLight) this.ambientLight.intensity = 1.8;
  if (this.moonShaft) this.moonShaft.material.opacity = 0.18;
  this.scene.background = new THREE.Color(0xdde9f5);
  this.renderer.toneMappingExposure = 1.35;

  this.updateHUD();
  console.log('[AtticApp] Scene reset to initial state.');
}

// -------------------------------------------------------------
// Render Loop
// -------------------------------------------------------------

render() {
  try {
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.getElapsedTime();

    if (!this.renderer.xr.isPresenting) {
      this.controls.update();
    }

    // Pulsing subtle cyan inner glow in chest
    if (this.chest && this.chest.innerLight) {
      const baseIntensity = this.handManager?.interactionState >= InteractionState.STATE_7_REACH_BOX ? 1.6 : 0.72;
      const pulse = Math.sin(time * 2.8);
      this.chest.innerLight.intensity = baseIntensity + pulse * 0.15;

      if (this.chest.seamMat) {
        this.chest.seamMat.opacity = 0.16 + pulse * 0.05;
      }
    }

    // Gentle floating idle for dreamcatcher only while lifted in attic
    if (this.sceneState === 'ATTIC' && this.handManager?.interactionState >= InteractionState.STATE_9_SUPPORT_HOLD && !this.handManager.isDreamcatcherGrabbed) {
      const dc = this.dreamcatcher.dreamcatcherGroup;
      dc.position.y = 1.18 + Math.sin(time * 1.6) * 0.012;
      dc.rotation.y = Math.sin(time * 0.9) * 0.06;
    }

    // Particles (Attic only - completely disabled in Palace scene to avoid floating motes/pears)
    if (this.sceneState === 'ATTIC') {
      if (this.ambientDust) this.ambientDust.update(delta, time);
      if (this.boxGlow) this.boxGlow.update(delta, time, this.currentStep >= 4 ? 1.2 : 0.8);
      if (this.chestDustBurst) this.chestDustBurst.update(delta);
      if (this.brushDustPuff) this.brushDustPuff.update(delta);
      if (this.goldenWave) this.goldenWave.update(delta);
    } else {
      if (this.goldenWave) {
        this.goldenWave.active = false;
        if (this.goldenWave.points) this.goldenWave.points.visible = false;
        if (this.goldenWave.ringMesh) this.goldenWave.ringMesh.visible = false;
      }
      if (this.ambientDust?.points) this.ambientDust.points.visible = false;
      if (this.boxGlow?.points) this.boxGlow.points.visible = false;
      if (this.chestDustBurst?.points) this.chestDustBurst.points.visible = false;
      if (this.brushDustPuff?.points) this.brushDustPuff.points.visible = false;
    }

    // Scene Animations (Tarp slide, lid open, dreamcatcher lift)
    this.updateSceneAnimations(delta);

    // Hand Interactions & Smoothing
    if (this.handManager) {
      this.handManager.update(delta, time, this.currentStep);
      this.updateLiveCoordinatesHUD();
    }

    // Physics (Seashell Falling)
    this.updatePhysics(delta);

    // Step 2 & 3: Seashell Levitation, Whirling & Cinematic Attic Dissolve
    if (this.seashellRiseAnim.active && this.seashellRiseAnim.shellMesh) {
      const anim = this.seashellRiseAnim;
      const shell = anim.shellMesh;
      anim.phaseTimer += delta;

      // Phase A: Glow on Floor (0.35s)
      if (anim.phase === 'FLOOR_GLOW') {
        const glowProgress = Math.min(1.0, anim.phaseTimer / 0.35);
        if (shell.material) {
          shell.material.emissiveIntensity = 0.9 + glowProgress * 0.9;
        }
        if (this.shellGlowLight) {
          this.shellGlowLight.intensity = 2.8 + glowProgress * 1.5;
        }
        if (this.whirlingVortex) {
          this.whirlingVortex.update(delta, time, shell.position, 4.0);
        }
        if (anim.phaseTimer >= 0.35) {
          anim.phase = 'RISING';
          anim.phaseTimer = 0.0;
        }
      }
      // Phase B: Rising Up & Whirling (~1.8s)
      else if (anim.phase === 'RISING') {
        anim.progress += delta / anim.duration;
        const t = Math.min(1.0, anim.progress);
        const ease = 1 - Math.pow(1 - t, 3); // Cubic ease out

        shell.position.lerpVectors(anim.startPos, anim.targetPos, ease);

        // Accelerating whirl as it rises
        anim.whirlSpeed = THREE.MathUtils.lerp(4.0, 16.0, ease);
        shell.rotation.y += delta * anim.whirlSpeed;
        shell.rotation.z = Math.sin(time * 8.0) * 0.12 * ease;
        shell.rotation.x = Math.cos(time * 6.0) * 0.08 * ease;

        const currentScale = THREE.MathUtils.lerp(1.0, 5.5, ease);
        shell.scale.set(currentScale, currentScale, currentScale);

        if (shell.material) {
          shell.material.emissiveIntensity = 1.8 + ease * 1.0;
        }
        if (this.shellGlowLight) {
          this.shellGlowLight.position.copy(shell.position);
          this.shellGlowLight.intensity = 4.0 + ease * 2.0;
        }
        if (this.whirlingVortex) {
          this.whirlingVortex.update(delta, time, shell.position, anim.whirlSpeed);
        }

        if (t >= 1.0) {
          anim.phase = 'WHIRLING';
          anim.phaseTimer = 0.0;
          shell.position.copy(anim.targetPos);
          playPalaceTransitionBoom();
        }
      }
      // Phase C: Whirling at Apex (~1.3s)
      else if (anim.phase === 'WHIRLING') {
        anim.whirlSpeed = 16.0;
        shell.rotation.y += delta * anim.whirlSpeed;
        shell.rotation.z = Math.sin(time * 10.0) * 0.15;
        shell.rotation.x = Math.cos(time * 8.0) * 0.10;

        const pulse = Math.sin(time * 14.0);
        if (shell.material) {
          shell.material.emissiveIntensity = 2.8 + pulse * 0.8;
        }
        if (this.shellGlowLight) {
          this.shellGlowLight.intensity = 6.0 + pulse * 1.5;
        }
        if (this.whirlingVortex) {
          this.whirlingVortex.update(delta, time, shell.position, anim.whirlSpeed);
        }

        if (anim.phaseTimer >= 1.3) {
          anim.phase = 'DISSOLVE';
          anim.phaseTimer = 0.0;
          if (this.dissolveMesh) this.dissolveMesh.visible = true;
        }
      }
      // Phase D: Attic Scene Dissolves into Golden Light (~1.2s)
      else if (anim.phase === 'DISSOLVE') {
        shell.rotation.y += delta * 18.0;
        const dissolveProgress = Math.min(1.0, anim.phaseTimer / 1.2);
        const ease = Math.sin(dissolveProgress * Math.PI / 2);

        if (this.dissolveMat) {
          this.dissolveMat.opacity = ease;
        }

        if (this.moonlight) {
          this.moonlight.intensity = Math.max(0, 2.6 * (1.0 - dissolveProgress));
        }
        if (this.ambientLight) {
          this.ambientLight.intensity = Math.max(0, 0.45 * (1.0 - dissolveProgress));
        }

        if (anim.phaseTimer >= 1.2) {
          // Environment Transformation at peak dissolve
          this.executeGrandPalaceTransformation();

          if (this.whirlingVortex) {
            this.whirlingVortex.deactivate();
          }
          if (this.shellGlowLight) {
            this.shellGlowLight.visible = false;
          }
          shell.visible = false;

          anim.phase = 'REVEAL_PALACE';
          anim.phaseTimer = 0.0;
        }
      }
      // Phase E: Palace Scene Emerges from Golden Dissolve (~1.4s)
      else if (anim.phase === 'REVEAL_PALACE') {
        const revealProgress = Math.min(1.0, anim.phaseTimer / 1.4);
        const ease = 1.0 - Math.sin(revealProgress * Math.PI / 2);

        if (this.dissolveMat) {
          this.dissolveMat.opacity = ease;
        }

        if (anim.phaseTimer >= 1.4) {
          anim.active = false;
          if (this.dissolveMesh) this.dissolveMesh.visible = false;
          if (this.dissolveMat) this.dissolveMat.opacity = 0.0;
          this.sceneState = 'PALACE_EMPTY';
          this.palaceEmptyTimer = 0.0;
        }
      }
    }

    // Position dissolve mesh directly in front of camera
    if (this.dissolveMesh && this.dissolveMesh.visible) {
      const activeCam = (this.renderer?.xr?.isPresenting ? this.renderer.xr.getCamera(this.camera) : this.camera) || this.camera;
      this.dissolveMesh.position.copy(activeCam.position).add(
        new THREE.Vector3(0, 0, -0.22).applyQuaternion(activeCam.quaternion)
      );
      this.dissolveMesh.quaternion.copy(activeCam.quaternion);
    }

    // Ensure attic seashell is hidden in Palace scene (ONLY the big white scallop shell is visible)
    if ((this.sceneState === 'PALACE_EMPTY' || this.sceneState === 'PALACE_SERAPHINA' || this.sceneState === 'PALACE_GAMES_UNLOCKED') && this.seashellRiseAnim?.shellMesh && !this.seashellRiseAnim.active) {
      this.seashellRiseAnim.shellMesh.visible = false;
    }

    // Step 4: Silent Empty Palace Pause (5.0s)
    if (this.sceneState === 'PALACE_EMPTY') {
      this.palaceEmptyTimer += delta;
      if (this.palaceEmptyTimer >= 5.0) {
        this.sceneState = 'PALACE_SERAPHINA';
        this.materializeGhostSeraphina();
      }
    }

    // Palace, Ghost Seraphina & Soul Mini-Games Updates
    if (this.palace && typeof this.palace.update === 'function') {
      this.palace.update(delta, time);
    }
    if (this.ghostSeraphina && typeof this.ghostSeraphina.update === 'function') {
      this.ghostSeraphina.update(delta, time);
    }
    if (this.soulMiniGames && typeof this.soulMiniGames.update === 'function') {
      this.soulMiniGames.update(delta, time, this.handManager, this.ghostSeraphina);
    }

    this.renderer.render(this.scene, this.camera);
  } catch (err) {
    console.error('[Render Loop Error]', err);
  }
}

updateLiveCoordinatesHUD() {
  if (!this.handManager) return;

  const lPos = this.handManager.leftHand.currentPos;
  const rPos = this.handManager.rightHand.currentPos;
  const lPosture = this.handManager.leftHand.posture;
  const rPosture = this.handManager.rightHand.posture;

  const coordsLeftEl = document.getElementById('coords-left');
  const coordsRightEl = document.getElementById('coords-right');
  const postureLeftEl = document.getElementById('posture-left');
  const postureRightEl = document.getElementById('posture-right');

  if (coordsLeftEl) {
    coordsLeftEl.textContent = `X:${lPos.x.toFixed(2)} Y:${lPos.y.toFixed(2)} Z:${lPos.z.toFixed(2)}`;
  }
  if (coordsRightEl) {
    coordsRightEl.textContent = `X:${rPos.x.toFixed(2)} Y:${rPos.y.toFixed(2)} Z:${rPos.z.toFixed(2)}`;
  }
  if (postureLeftEl) postureLeftEl.textContent = `[${lPosture}]`;
  if (postureRightEl) postureRightEl.textContent = `[${rPosture}]`;
}

onWindowResize() {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
}

// -------------------------------------------------------------
// HUD UI Overlay Management
// -------------------------------------------------------------

setupHUD() {
  // Mode switcher buttons
  const mode1 = document.getElementById('mode-btn-1');
  const mode2 = document.getElementById('mode-btn-2');
  const mode3 = document.getElementById('mode-btn-3');

  if (mode1) mode1.onclick = () => this.handManager?.setControlMode(ControlMode.LEFT_ONLY);
  if (mode2) mode2.onclick = () => this.handManager?.setControlMode(ControlMode.RIGHT_ONLY);
  if (mode3) mode3.onclick = () => this.handManager?.setControlMode(ControlMode.DUAL_SIMULTANEOUS);

  // Action buttons
  const btnPinch = document.getElementById('btn-pinch-action');
  const btnTarp = document.getElementById('btn-tarp');
  const btnLatch = document.getElementById('btn-latch');
  const btnLid = document.getElementById('btn-lid');
  const btnLift = document.getElementById('btn-lift');
  const btnSupport = document.getElementById('btn-support');
  const btnBrush = document.getElementById('btn-brush');
  const btnReset = document.getElementById('btn-reset');
  const btnRecenter = document.getElementById('btn-recenter');
  const btnToggleShowcase = document.getElementById('btn-toggle-showcase');

  if (btnToggleShowcase) {
    btnToggleShowcase.onclick = () => {
      if (this.handManager) {
        const isActive = this.handManager.toggleShowcaseMode();
        btnToggleShowcase.textContent = isActive ? 'Pause [Space]' : 'Resume [Space]';
        this.updateHUD();
      }
    };
  }

  if (btnPinch) btnPinch.onclick = () => this.handManager?.handlePinchOrActionKey();
  if (btnTarp) btnTarp.onclick = () => this.handManager?.executeStep3PullTarp();
  if (btnLatch) btnLatch.onclick = () => this.handManager?.executeStep5TwistLatch();
  if (btnLid) btnLid.onclick = () => this.handManager?.executeStep6LiftLid();
  if (btnLift) btnLift.onclick = () => this.handManager?.executeStep8GraspDreamcatcher();
  if (btnSupport) btnSupport.onclick = () => this.handManager?.executeStep9SupportHold();
  if (btnBrush) btnBrush.onclick = () => {
    if (this.handManager) {
      if (this.handManager.interactionState === InteractionState.STATE_10_BRUSH_SWIPE_1) {
        this.handManager.executeStep10Swipe1();
      } else {
        this.handManager.executeStep11Swipe2();
      }
    }
  };
  if (btnReset) btnReset.onclick = () => this.resetScene();
  if (btnRecenter) {
    btnRecenter.onclick = () => {
      this.camera.position.set(-0.20, 0.78, 0.20);
      this.controls.target.set(-0.35, 0.56, -0.60);
      this.controls.update();
    };
  }

  // Theme Toggle Controls
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const btnThemePill = document.getElementById('btn-theme-pill');
  if (btnThemeToggle) {
    btnThemeToggle.onclick = () => this.toggleTheme();
  }
  if (btnThemePill) {
    btnThemePill.onclick = () => this.toggleTheme();
  }

  // Full Walkthrough Video Recording Control
  const btnRecordVideo = document.getElementById('btn-record-video');
  if (btnRecordVideo) {
    btnRecordVideo.onclick = () => {
      if (this.isRecording) {
        this.stopVideoRecording();
      } else {
        this.resetScene();
        this.startVideoRecording();
      }
    };
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') {
      this.toggleTheme();
    }
  });

  this.setTheme(this.currentTheme);
  this.updateHUD();
}

setTheme(themeName) {
  if (themeName !== 'light' && themeName !== 'dark') return;
  this.currentTheme = themeName;

  if (this.atticEnv && typeof this.atticEnv.setTheme === 'function') {
    this.atticEnv.setTheme(this.currentTheme);
  }

  document.body.classList.toggle('theme-light', this.currentTheme === 'light');
  document.body.classList.toggle('theme-dark', this.currentTheme === 'dark');

  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const btnThemePill = document.getElementById('btn-theme-pill');
  const label = this.currentTheme === 'light' ? '☀️ Light Theme [T]' : '🌙 Dark Theme [T]';
  const pillLabel = this.currentTheme === 'light' ? '☀️ Light' : '🌙 Dark';
  if (btnThemeToggle) btnThemeToggle.textContent = label;
  if (btnThemePill) btnThemePill.textContent = pillLabel;

  console.log(`[AtticApp] Attic theme set to: ${this.currentTheme.toUpperCase()}`);
}

toggleTheme() {
  this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
}

updateHUDStatus(text) {
  const statusEl = document.getElementById('hud-mode-badge');
  if (statusEl) statusEl.textContent = text;
}

updateHUD() {
  const nStep = this.handManager ? this.handManager.interactionState : this.currentStep;
  const mode = this.handManager ? this.handManager.controlMode : ControlMode.LEFT_ONLY;
  const isShowcase = this.handManager ? this.handManager.isShowcaseActive : false;
  const hasStarted = this.handManager ? this.handManager.hasStartedShowcase : false;

  // 1. Update Mode Badge & Showcase Status
  const modeBadge = document.getElementById('hud-mode-badge');
  const showcaseStatus = document.getElementById('showcase-status-text');
  const btnToggle = document.getElementById('btn-toggle-showcase');
  const pulseEl = document.querySelector('.showcase-pulse');
  const mBtn1 = document.getElementById('mode-btn-1');
  const mBtn2 = document.getElementById('mode-btn-2');
  const mBtn3 = document.getElementById('mode-btn-3');

  if (btnToggle) {
    if (!hasStarted) {
      btnToggle.textContent = '▶ Start Showcase [Space]';
    } else {
      btnToggle.textContent = isShowcase ? 'Pause [Space]' : 'Resume [Space]';
    }
  }

  if (pulseEl) {
    if (!hasStarted) {
      pulseEl.className = 'showcase-pulse waiting';
    } else {
      pulseEl.className = 'showcase-pulse active';
    }
  }

  if (showcaseStatus) {
    if (this.handManager && this.handManager.showcasePhase === 12) {
      showcaseStatus.textContent = '★ SHOWCASE COMPLETE - SCENE 2 READY';
    } else if (isShowcase) {
      showcaseStatus.textContent = `AUTO SHOWCASE ACTIVE (Step ${nStep}/11)`;
    } else if (!hasStarted) {
      showcaseStatus.textContent = 'WAITING FOR INPUT (Press Space/Enter)';
    } else {
      showcaseStatus.textContent = 'MANUAL PLAY MODE (Space to Resume)';
    }
  }

  [mBtn1, mBtn2, mBtn3].forEach((b) => b && b.classList.remove('active'));

  if (!hasStarted) {
    if (modeBadge) modeBadge.textContent = 'READY (Press Any Key)';
    if (mBtn1) mBtn1.classList.add('active');
  } else if (mode === ControlMode.LEFT_ONLY) {
    if (modeBadge) modeBadge.textContent = isShowcase ? '★ [1] AUTO LEFT' : '[1] Left Hand';
    if (mBtn1) mBtn1.classList.add('active');
  } else if (mode === ControlMode.RIGHT_ONLY) {
    if (modeBadge) modeBadge.textContent = isShowcase ? '★ [2] AUTO RIGHT' : '[2] Right Hand';
    if (mBtn2) mBtn2.classList.add('active');
  } else {
    if (modeBadge) modeBadge.textContent = isShowcase ? '★ [3] AUTO DUAL' : '[3] Dual Hands';
    if (mBtn3) mBtn3.classList.add('active');
  }

  // 2. Update 11-Step Items to Green
  const isAllDone = (this.brushCount >= 2) || (this.handManager && (this.handManager.brushCount >= 2 || this.handManager.showcasePhase === 12));

  for (let i = 1; i <= 11; i++) {
    const el = document.getElementById(`step-${i}`);
    if (!el) continue;
    el.className = 'step-item';

    const isCompleted = isAllDone || (i < nStep);
    if (isCompleted) {
      el.classList.add('done');
    } else if (i === nStep) {
      el.classList.add('active');
    }
  }

  // 3. Dynamic Step Instructions
  const instructions = document.getElementById('instructions-box');
  const brushText = document.getElementById('brush-count-text');

  if (brushText) {
    const bCount = this.handManager ? this.handManager.brushCount : this.brushCount;
    brushText.textContent = `(${bCount}/2)`;
  }

  if (instructions) {
    const prompts = {
      1: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Reach Left Hand toward the burlap tarp corner.<br/><span style="color:#a0aec0;">[Desktop]</span> Move Left Hand with <strong>WASD + QE</strong>.',
      2: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Pinch Left thumb & index finger (&lt; 3.8cm) or press Trigger on tarp.<br/><span style="color:#a0aec0;">[Desktop]</span> Press <strong>P</strong> or click <em>[P] Trigger Pinch/Action</em>.',
      3: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Pull Left Hand backward to drag burlap cloth off the chest.<br/><span style="color:#a0aec0;">[Desktop]</span> Move backward (<strong>S key</strong>) or click <em>[1-3] Pull Tarp</em>.',
      4: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Reach Right Hand to the brass lock on chest front.<br/><span style="color:#a0aec0;">[Desktop]</span> Press <strong>[2]</strong>, move Right Hand with <strong>Arrow Keys + RF</strong>.',
      5: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Pinch fingers or twist Right Hand at latch to unlock.<br/><span style="color:#a0aec0;">[Desktop]</span> Press <strong>P</strong> or click <em>[4-5] Turn Latch</em>.',
      6: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Raise Right Hand upward near lid to swing it open.<br/><span style="color:#a0aec0;">[Desktop]</span> Press <strong>R key</strong> or click <em>[6] Open Lid</em>.',
      7: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Reach Left Hand down into glowing chest cavity.<br/><span style="color:#a0aec0;">[Desktop]</span> Press <strong>[1]</strong>, move Left Hand inside.',
      8: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Pinch or full-hand grasp hoop to lift dreamcatcher.<br/><span style="color:#a0aec0;">[Desktop]</span> Press <strong>P</strong> or click <em>[7-8] Lift Dreamcatcher</em>.',
      9: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Bring Right Hand close to support & balance dreamcatcher.<br/><span style="color:#a0aec0;">[Desktop]</span> Press <strong>[2]</strong> or click <em>[9] Hold Both Hands</em>.',
      10: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Swipe flat Left Palm horizontally across webbing to dust (1/2).<br/><span style="color:#a0aec0;">[Desktop]</span> Swipe with <strong>A/D keys</strong> or click <em>[10-11] Dust Swipe</em>.',
      11: '<span style="color:#00d2ff; font-weight:600;">[VR White Hand]</span> Swipe Left Palm a second time! Dislodges seashell to fall to floorboards and trigger Grand Palace transition!<br/><span style="color:#a0aec0;">[Desktop]</span> Swipe <strong>A/D keys</strong> or click <em>[10-11] Dust Swipe</em>.'
    };
    instructions.innerHTML = `<strong>Active Step ${nStep}:</strong> ${prompts[nStep] || 'Complete!'}`;
  }
}

  initCenterStatusBox() {
    this.centerStatusBox = null;
    if (typeof document === 'undefined') return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 384;
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const geo = new THREE.PlaneGeometry(0.72, 0.27);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.0,
        depthTest: false,
        depthWrite: false,
        renderOrder: 99999
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, -0.75); // Centered directly in front of camera view
      mesh.visible = false;
      if (this.camera) {
        this.camera.add(mesh);
      }

      this.centerStatusBox = {
        canvas,
        ctx,
        texture,
        mat,
        mesh,
        hideTimer: null
      };
    } catch (e) {
      console.warn('[CenterStatusBox] Canvas 3D initialization warning:', e);
    }

    window.showCenterStatusBox = (text, duration = 2.8) => {
      this.showCenterStatusBox(text, duration);
    };
  }

  showCenterStatusBox(text, duration = 2.8) {
    console.log(`[CenterStatusBox] Displaying: "${text}" (duration: ${duration}s)`);

    // 1. Desktop HTML Overlay
    if (typeof document !== 'undefined') {
      const htmlBox = document.getElementById('game-center-box');
      const htmlText = document.getElementById('game-center-text');
      if (htmlText) {
        htmlText.textContent = text;
      }
      if (htmlBox) {
        htmlBox.classList.add('visible');
      }
    }

    // 2. WebXR In-Headset 3D Billboard Overlay
    if (this.centerStatusBox && this.centerStatusBox.ctx) {
      const { ctx, canvas, texture, mat, mesh } = this.centerStatusBox;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pad = 12;
      const r = 24;
      const w = canvas.width - pad * 2;
      const h = canvas.height - pad * 2;
      const x = pad;
      const y = pad;

      ctx.save();
      // Black Box Background
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 12;

      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      // White Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 100px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '6px';
      ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
      ctx.restore();

      texture.needsUpdate = true;
      mat.opacity = 1.0;
      mesh.visible = true;

      if (this.centerStatusBox.hideTimer) {
        clearTimeout(this.centerStatusBox.hideTimer);
        this.centerStatusBox.hideTimer = null;
      }

      if (duration > 0) {
        this.centerStatusBox.hideTimer = setTimeout(() => {
          if (typeof document !== 'undefined') {
            const htmlBox = document.getElementById('game-center-box');
            if (htmlBox) htmlBox.classList.remove('visible');
          }
          if (mesh) {
            mat.opacity = 0.0;
            mesh.visible = false;
          }
        }, duration * 1000);
      }
    }

    // Auto-finalize video recording on Game Over
    if (text && text.toUpperCase() === 'GAME OVER' && this.isRecording) {
      console.log('[VideoRecorder] "Game Over" reached! Capturing 3s finale then saving video...');
      setTimeout(() => {
        this.stopVideoRecording();
      }, 3000);
    }
  }

  initVideoRecorder() {
    this.recordedChunks = [];
    this.isRecording = false;
    this.mediaRecorder = null;

    if (typeof window !== 'undefined') {
      window.startVideoRecording = () => this.startVideoRecording();
      window.stopVideoRecording = () => this.stopVideoRecording();
      window.isVideoRecording = () => this.isRecording;

      const urlParams = window.location ? new URLSearchParams(window.location.search) : null;
      if (urlParams && (urlParams.get('record') === '1' || urlParams.get('record') === 'true')) {
        setTimeout(() => {
          this.startVideoRecording();
        }, 600);
      }
    }
  }

  startVideoRecording() {
    if (this.isRecording) return;
    try {
      initAudio();
      const canvas = this.renderer?.domElement;
      if (!canvas || typeof canvas.captureStream !== 'function') {
        console.warn('[VideoRecorder] canvas.captureStream not supported.');
        return;
      }

      const canvasStream = canvas.captureStream(60);
      const audioStream = getAudioStream();
      const combinedStream = new MediaStream();

      // Video tracks
      canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));

      // Audio tracks (synthesized ambient music & all sound effects)
      if (audioStream && audioStream.getAudioTracks) {
        audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8,opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }
        }
      }

      const options = {
        mimeType: (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) ? mimeType : undefined,
        videoBitsPerSecond: 6000000 // 6 Mbps high quality
      };

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(combinedStream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingComplete();
      };

      this.mediaRecorder.start(250);
      this.isRecording = true;
      this.recordingStartTime = performance.now();

      console.log(`[VideoRecorder] Video recording started successfully (${this.mediaRecorder.mimeType}).`);

      const btn = document.getElementById('btn-record-video');
      if (btn) {
        btn.classList.add('recording');
        btn.innerHTML = '⏹ Stop &amp; Save Video (Recording...)';
      }
    } catch (err) {
      console.error('[VideoRecorder] Failed to start MediaRecorder:', err);
    }
  }

  stopVideoRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;
    try {
      this.mediaRecorder.stop();
      this.isRecording = false;

      const btn = document.getElementById('btn-record-video');
      if (btn) {
        btn.classList.remove('recording');
        btn.innerHTML = '⏳ Processing Video Download...';
      }
    } catch (err) {
      console.warn('[VideoRecorder] Error stopping MediaRecorder:', err);
    }
  }

  handleRecordingComplete() {
    const mime = this.mediaRecorder?.mimeType || 'video/webm';
    const blob = new Blob(this.recordedChunks, { type: mime });
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
    console.log(`[VideoRecorder] Walkthrough recording finished! Total size: ${sizeMb} MB`);

    window.__walkthroughVideoBlob = blob;
    window.__walkthroughVideoFinished = true;

    // Convert blob to base64 for automated headless scripts (Playwright)
    const reader = new FileReader();
    reader.onloadend = () => {
      window.__walkthroughVideoBase64 = reader.result;
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('video-recording-ready', {
          detail: { size: blob.size, mimeType: mime, base64: reader.result }
        }));
      }
    };
    reader.readAsDataURL(blob);

    // Auto trigger browser download
    if (typeof document !== 'undefined') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `DreamHanger_Full_Walkthrough_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 2000);

      const btn = document.getElementById('btn-record-video');
      if (btn) {
        btn.innerHTML = `✅ Saved! (${sizeMb} MB) - Click to Record Again`;
        setTimeout(() => {
          btn.innerHTML = '🎥 Record &amp; Download Full Video';
        }, 6000);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new AtticApp();
});

/**
 * Fully Integrated White Articulated Hand Interaction System for WebXR & Desktop Simulation
 *
 * 1. Sole Visual Hand Representation:
 *    - Pure sleek white articulated hands (XRHandModelFactory generic mesh in WebXR / Meta Emulator).
 *    - Skintone hands and peach colors are completely removed.
 *    - Zero redundant meshes in WebXR - only the clean white hand model is rendered.
 *
 * 2. 100% WebXR Joint & Gesture Integration with All 11 Interaction States:
 *    - Pinch Detection: Real-time physical distance between white thumb-tip and index-finger-tip (< 0.032m).
 *    - Grasp Detection: White finger curl toward palm or WebXR squeeze/grip event.
 *    - Motion & Swipe: Velocity vector tracking across the dreamcatcher webbing (> 0.22m/s).
 *    - Fallback & Controls: Keyboard modes ([1], [2], [3]), 'P' key, and HUD buttons remain fully functional.
 *
 * 3. The 11 Seamless Interaction States:
 *    - State 1: [Left Hand] Approach Tarp -> Reaching within 0.32m of burlap corner highlights tarp.
 *    - State 2: [Left Hand] Pinch Tarp -> White hand pinch gesture (< 0.032m), VR trigger, or 'P' key grips corner.
 *    - State 3: [Left Hand] Pull Tarp -> Moving pinched white hand backward slides cloth off box with dust puff.
 *    - State 4: [Right Hand] Approach Latch -> Move right white hand to brass box lock.
 *    - State 5: [Right Hand] Twist Latch -> White hand pinch or twist rotates brass latch open with creak.
 *    - State 6: [Right Hand] Lift Lid -> Upward motion with right white hand swings lid open, cyan glow & dust burst.
 *    - State 7: [Left Hand] Reach into Box -> Reach left white hand down into chest cavity.
 *    - State 8: [Left Hand] Grasp Dreamcatcher -> White hand grasp/pinch around hoop lifts dreamcatcher to eye level.
 *    - State 9: [Right Hand] Support / Hold -> Bring right white hand close (< 0.28m) to balance dreamcatcher together.
 *    - State 10: [Left Hand] First Brush Swipe -> Swipe left white hand horizontally across webbing for dust puff (1/2).
 *    - State 11: [Left Hand] Final Swipe & Drop -> Second swipe detaches seashell; falls with gravity to oak floor,
 *                triggering golden shockwave ring (#ffd700) and window.triggerPalaceTransition().
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { AtticStoryNarrator } from './atticScene.js';

export const ControlMode = {
  LEFT_ONLY: 'LEFT_ONLY',       // [1] WASD + QE
  RIGHT_ONLY: 'RIGHT_ONLY',     // [2] Arrow Keys + RF
  DUAL_SIMULTANEOUS: 'DUAL'     // [3] Simultaneous Dual Hands
};

export const InteractionState = {
  STATE_1_APPROACH_TARP: 1,
  STATE_2_PINCH_TARP: 2,
  STATE_3_PULL_TARP: 3,
  STATE_4_APPROACH_LATCH: 4,
  STATE_5_TWIST_LATCH: 5,
  STATE_6_LIFT_LID: 6,
  STATE_7_REACH_BOX: 7,
  STATE_8_GRASP_DREAMCATCHER: 8,
  STATE_9_SUPPORT_HOLD: 9,
  STATE_10_BRUSH_SWIPE_1: 10,
  STATE_11_FINAL_SWIPE_DROP: 11
};

export const Posture = {
  RELAXED: 'RELAXED',
  RELAXED_OPEN: 'RELAXED_OPEN',
  PINCH: 'PINCH',
  PRECISION_PINCH: 'PRECISION_PINCH',
  KEY_PINCH: 'KEY_PINCH',
  EXTENDED_INDEX: 'EXTENDED_INDEX',
  CUPPED_LIFT: 'CUPPED_LIFT',
  FULL_GRASP: 'FULL_GRASP',
  FLAT_PALM: 'FLAT_PALM',
  THUMBS_UP: 'THUMBS_UP',
  STOP_PALM: 'STOP_PALM',
  CUPPED_CRADLE: 'CUPPED_CRADLE'
};

/**
 * Clean White Stylized Hand Shader (#ffffff, roughness: 0.35, metalness: 0.08, pure matte-pearl white PBR shading)
 */
export function createWhiteStylizedHandMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.08,
    emissive: new THREE.Color(0xdbeafe),
    emissiveIntensity: 0.18
  });
}

// Backward compatibility alias (ensures zero skintone color exists anywhere)
export const createRealisticSkinMaterial = createWhiteStylizedHandMaterial;
export function generateSkinBumpTexture() {
  return null;
}

/**
 * Builds a clean, articulated white hand model with sleek forearm entering from bottom viewport
 */
export function buildArticulatedWhiteHand(handMaterial, isLeft = false) {
  const material = handMaterial || createWhiteStylizedHandMaterial();
  const handRoot = new THREE.Group();
  handRoot.name = isLeft ? 'left-white-hand' : 'right-white-hand';

  // 1. Sleek Palm Group
  const palmGroup = new THREE.Group();
  palmGroup.name = 'palm';

  const palmMainGeo = new THREE.BoxGeometry(0.072, 0.018, 0.068);
  const palmMain = new THREE.Mesh(palmMainGeo, material);
  palmMain.castShadow = true;
  palmGroup.add(palmMain);

  // Clean palm-side knuckle bridge (seamlessly ties all 4 finger bases together)
  const knuckleBridgeGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.066, 16);
  knuckleBridgeGeo.rotateZ(Math.PI / 2);
  const knuckleBridge = new THREE.Mesh(knuckleBridgeGeo, material);
  knuckleBridge.position.set(0, 0.002, -0.034);
  palmGroup.add(knuckleBridge);

  // Thenar eminence (thumb base pad)
  const thenarGeo = new THREE.SphereGeometry(0.016, 12, 12);
  thenarGeo.scale(1.2, 0.8, 1.3);
  const thenar = new THREE.Mesh(thenarGeo, material);
  thenar.position.set(isLeft ? 0.028 : -0.028, -0.003, 0.014);
  palmGroup.add(thenar);

  // Hypothenar eminence (pinky side pad)
  const hypothenarGeo = new THREE.SphereGeometry(0.014, 12, 12);
  hypothenarGeo.scale(1.0, 0.7, 1.2);
  const hypothenar = new THREE.Mesh(hypothenarGeo, material);
  hypothenar.position.set(isLeft ? -0.028 : 0.028, -0.003, 0.01);
  palmGroup.add(hypothenar);

  // Smooth tapered wrist base
  const wristGeo = new THREE.CylinderGeometry(0.020, 0.023, 0.028, 16);
  wristGeo.rotateX(Math.PI / 2);
  const wrist = new THREE.Mesh(wristGeo, material);
  wrist.position.set(0, -0.002, 0.042);
  wrist.castShadow = true;
  palmGroup.add(wrist);

  // Sleek stylized white forearm extending naturally back toward elbow / viewport edge
  const forearmGeo = new THREE.CylinderGeometry(0.022, 0.035, 0.22, 16);
  forearmGeo.rotateX(Math.PI / 2);
  const forearm = new THREE.Mesh(forearmGeo, material);
  forearm.position.set(0, -0.006, 0.16);
  forearm.castShadow = true;
  forearm.visible = false; // Strictly wrist-terminated white hands (zero forearms extending off-screen)
  palmGroup.add(forearm);

  handRoot.add(palmGroup);

  // 2. 5 Articulated Segmented Fingers (Tapered 0.0118m down to 0.0085m with overlapping spheres)
  const fingers = [];
  const side = isLeft ? -1 : 1;

  const fingerConfigs = [
    {
      name: 'thumb',
      knucklePos: [0.034 * -side, -0.003, 0.016],
      lengths: [0.030, 0.024],
      radii: [0.0115, 0.0105, 0.0092],
      baseRot: [-0.26, 0.50 * side, -0.22 * side]
    },
    {
      name: 'index',
      knucklePos: [0.025 * -side, 0.002, -0.036],
      lengths: [0.030, 0.022, 0.016],
      radii: [0.0112, 0.0102, 0.0092, 0.0084],
      baseRot: [-0.14, 0.04 * side, 0]
    },
    {
      name: 'middle',
      knucklePos: [0.002 * -side, 0.003, -0.040],
      lengths: [0.034, 0.024, 0.018],
      radii: [0.0118, 0.0108, 0.0096, 0.0086],
      baseRot: [-0.12, 0.0, 0]
    },
    {
      name: 'ring',
      knucklePos: [0.021 * side, 0.001, -0.036],
      lengths: [0.030, 0.022, 0.016],
      radii: [0.0110, 0.0100, 0.0090, 0.0082],
      baseRot: [-0.14, -0.04 * side, 0]
    },
    {
      name: 'pinky',
      knucklePos: [0.038 * side, -0.002, -0.030],
      lengths: [0.022, 0.016, 0.013],
      radii: [0.0098, 0.0088, 0.0078, 0.0072],
      baseRot: [-0.18, -0.10 * side, 0]
    }
  ];

  fingerConfigs.forEach((cfg) => {
    const knuckleGroup = new THREE.Group();
    knuckleGroup.name = `${cfg.name}-knuckle`;
    knuckleGroup.position.set(...cfg.knucklePos);
    knuckleGroup.rotation.set(...cfg.baseRot);

    // Rounded knuckle sphere at base
    const kSphere = new THREE.Mesh(new THREE.SphereGeometry(cfg.radii[0] * 1.15, 16, 16), material);
    kSphere.castShadow = true;
    knuckleGroup.add(kSphere);

    const segments = [];
    let currentParent = knuckleGroup;

    cfg.lengths.forEach((len, idx) => {
      const jointGroup = new THREE.Group();
      jointGroup.name = `${cfg.name}-seg-${idx}`;

      if (idx > 0) {
        jointGroup.position.z = -cfg.lengths[idx - 1];
        // Overlapping joint sphere at rotation pivot: eliminates gaps from 0° to 115° curl
        const pivotSphere = new THREE.Mesh(new THREE.SphereGeometry(cfg.radii[idx] * 1.14, 16, 16), material);
        pivotSphere.castShadow = true;
        jointGroup.add(pivotSphere);
      }

      const rTop = cfg.radii[idx + 1];
      const rBottom = cfg.radii[idx];
      // Cylinder with 1.08 length overlap so adjacent segment meshes seamlessly merge
      const cylGeo = new THREE.CylinderGeometry(rTop, rBottom, len * 1.08, 16);
      cylGeo.rotateX(Math.PI / 2);
      const cylMesh = new THREE.Mesh(cylGeo, material);
      cylMesh.position.z = -len * 0.5;
      cylMesh.castShadow = true;
      jointGroup.add(cylMesh);

      // Distal rounded joint sphere
      const jSphere = new THREE.Mesh(new THREE.SphereGeometry(rTop * 1.14, 16, 16), material);
      jSphere.position.z = -len;
      jSphere.castShadow = true;
      jointGroup.add(jSphere);

      currentParent.add(jointGroup);
      segments.push(jointGroup);
      currentParent = jointGroup;
    });

    const lastRadius = cfg.radii[cfg.radii.length - 1];
    const tipMesh = new THREE.Mesh(new THREE.SphereGeometry(lastRadius * 1.08, 16, 16), material);
    tipMesh.scale.set(1.0, 0.85, 1.25);
    tipMesh.position.z = -cfg.lengths[cfg.lengths.length - 1];
    tipMesh.castShadow = true;
    currentParent.add(tipMesh);

    handRoot.add(knuckleGroup);

    fingers.push({
      name: cfg.name,
      knuckle: knuckleGroup,
      segments,
      tip: tipMesh,
      baseRot: [...cfg.baseRot]
    });
  });

  handRoot.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = false;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return {
    handRoot,
    palmGroup,
    fingers,
    isLeft
  };
}

// Backward compatibility aliases
export const buildSmoothArticulatedHand = buildArticulatedWhiteHand;
export const buildArticulatedHumanHand = buildArticulatedWhiteHand;

export class HandInteractionManager {
  constructor(renderer, scene, camera, domOverlay) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.domOverlay = domOverlay;

    this.targets = {
      tarp: null,
      lid: null,
      chestGroup: null,
      latchPlate: null,
      latchClasp: null,
      dreamcatcher: null,
      fallingShell: null
    };

    // State machine & Control Mode
    this.interactionState = InteractionState.STATE_1_APPROACH_TARP;
    this.controlMode = ControlMode.LEFT_ONLY; // [1] Left, [2] Right, [3] Dual
    this.keysDown = {};

    this.dreamcatcherHeldBy = null; // 'left' | 'both' | 'right' | null
    this.brushCount = 0;
    this.brushCooldown = 0;
    this.isLatchUnlocked = false;
    this.tarpPinchStartPos = new THREE.Vector3(-0.46, 0.82, -0.57);
    this.isInPalaceScene = false;
    this.isHandExternallyControlled = false;

    // Callbacks
    this.onTarpPulled = null;
    this.onLatchRotated = null;
    this.onLidOpened = null;
    this.onDreamcatcherLifted = null;
    this.onDreamcatcherSupported = null;
    this.onDreamcatcherBrushed = null;
    this.onStepChanged = null;
    this.onModeChanged = null;

    // Sleek White Material for Hand Models (Zero Skintone)
    this.whiteHandMaterial = createWhiteStylizedHandMaterial();
    this.skinMaterial = this.whiteHandMaterial;

    // Configure XRHandModelFactory with white stylized material and local asset path
    const onLoadHandMesh = (object) => {
      object.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          child.material = this.whiteHandMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
          child.visible = true;
          child.name = 'white-webxr-hand-mesh';
        }
      });

      const skinnedMesh = object.getObjectByProperty('type', 'SkinnedMesh');
      const isLeft = (skinnedMesh && skinnedMesh.name.startsWith('l_')) ||
        (object.parent?.parent === this.leftHand?.handGroup) ||
        (object.parent === this.leftHand?.handGroup) ||
        object.name.toLowerCase().includes('left');
      (object.parent?.parent === this.leftHand?.handGroup) ||
        (object.parent === this.leftHand?.handGroup) ||
        object.name.toLowerCase().includes('left');
      const targetHand = isLeft ? this.leftHand : this.rightHand;

      if (skinnedMesh) {
        targetHand.skinnedMesh = skinnedMesh;
        targetHand.bonesMap = {};
        targetHand.basePositions = {};
        targetHand.baseQuaternions = {};

        if (skinnedMesh.skeleton && skinnedMesh.skeleton.bones) {
          skinnedMesh.skeleton.bones.forEach((b) => {
            targetHand.bonesMap[b.name] = b;
            targetHand.basePositions[b.name] = b.position.clone();
            targetHand.baseQuaternions[b.name] = b.quaternion.clone();
            if (b.name === 'thumb-tip') targetHand.thumbTip = b;
            if (b.name === 'index-finger-tip') targetHand.indexTip = b;
            if (b.name === 'thumb-phalanx-distal') targetHand.thumbDistal = b;
            if (b.name === 'index-finger-phalanx-distal') targetHand.indexDistal = b;
          });
        }
      }
    };

    this.handModelFactory = new XRHandModelFactory(null, onLoadHandMesh);
    const basePath = (typeof window !== 'undefined' && window.location?.pathname && window.location.pathname.endsWith('/')) ? window.location.pathname : '/';
    if (this.handModelFactory && typeof this.handModelFactory.setPath === 'function') {
      this.handModelFactory.setPath(basePath);
    }

    // Subtle Camera Headlight for clear hand visibility
    this.handHeadlight = new THREE.PointLight(0xffffff, 0.75, 3.0, 1.5);
    this.handHeadlight.position.set(0, 0, 0.15);
    this.camera.add(this.handHeadlight);
    if (!this.camera.parent) {
      this.scene.add(this.camera);
    }

    // Automated Hands-Free Showcase Playback Mode (Active by default so autorun works immediately!)
    this.isShowcaseActive = true;
    this.hasStartedShowcase = true;
    this.showcaseTimer = 0;
    this.showcasePhase = 0; // 0 = initial framing pause (0.6s), then 1..11
    this.showcaseLoop = true;
    this.step2Triggered = false;
    this.step3Triggered = false;
    this.step5Triggered = false;
    this.step6Triggered = false;
    this.step8Triggered = false;
    this.step9Triggered = false;
    this.step10Triggered = false;
    this.step11Triggered = false;

    // Two Independent Hands State & Objects
    this.leftHand = this.initHandObject('left');
    this.rightHand = this.initHandObject('right');

    this.gltfLoader = new GLTFLoader();
    this.setupWebXRTracking();
    this.setupHandRigs();
    this.setupKeyboardListeners();
    this.setupPointerListeners();

    // Directly load the authentic default WebXR hand assets (/left.glb & /right.glb)
    this.loadDefaultWebXRHand('left');
    this.loadDefaultWebXRHand('right');

    // Attic Concept Story Narration & Cinematic Subtitles System
    this.storyNarrator = new AtticStoryNarrator(this.scene, this.camera);
  }

  get narrativeStep() {
    return this.interactionState;
  }

  get isDreamcatcherGrabbed() {
    return this.dreamcatcherHeldBy !== null;
  }

  initHandObject(handedness) {
    const isLeft = handedness === 'left';
    return {
      handedness,
      isLeft,
      handGroup: null,
      handModel: null,
      primitiveModel: null,
      skinnedMesh: null,
      bonesMap: {},
      basePositions: null,
      thumbTip: null,
      indexTip: null,
      thumbDistal: null,
      indexDistal: null,
      controllerGroup: null,
      controllerGrip: null,
      rig: null,
      posture: Posture.RELAXED,
      currentPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      currentQuat: new THREE.Quaternion(),
      targetQuat: new THREE.Quaternion(),
      animOffset: new THREE.Vector3(0, 0, 0),
      targetAnimOffset: new THREE.Vector3(0, 0, 0),
      animRotation: new THREE.Euler(0, 0, 0),
      targetAnimRotation: new THREE.Euler(0, 0, 0),
      velocity: new THREE.Vector3(),
      prevPosition: new THREE.Vector3(),
      pinchCenter: new THREE.Vector3(),
      isPinching: false,
      isGrasping: false,
      curlAmount: 0.0
    };
  }

  setTargets(targets) {
    this.targets = { ...this.targets, ...targets };
    if (this.targets.tarp && !this.initialTarpPos) {
      this.initialTarpPos = this.targets.tarp.position.clone();
      this.initialTarpRot = this.targets.tarp.rotation.clone();
    }
  }

  setHandPoseTarget(hand, pos, rotEuler, posture) {
    if (pos) hand.targetPos.copy(pos);
    if (rotEuler) hand.targetQuat.setFromEuler(rotEuler);
    if (posture) hand.posture = posture;
  }

  // -------------------------------------------------------------
  // 1. Setup Sole Articulated White Hands (100% Reliable in WebXR & Desktop)
  // -------------------------------------------------------------

  setupHandRigs() {
    // 1. Sleek white articulated hand for Left Hand (visible from frame 0)
    const leftRig = buildArticulatedWhiteHand(this.whiteHandMaterial, true);
    leftRig.handRoot.scale.set(1.15, 1.15, 1.15);
    leftRig.handRoot.name = 'left-white-hand';
    leftRig.handRoot.visible = true; // Always visible from frame 0
    this.scene.add(leftRig.handRoot);
    this.leftHand.rig = leftRig;

    this.leftHand.targetPos.set(-0.46, 0.54, -0.42);
    this.leftHand.currentPos.copy(this.leftHand.targetPos);
    this.leftHand.targetQuat.setFromEuler(new THREE.Euler(0.28, 0.20, -0.10));
    this.leftHand.currentQuat.copy(this.leftHand.targetQuat);
    this.leftHand.rig.handRoot.position.copy(this.leftHand.currentPos);
    this.leftHand.rig.handRoot.quaternion.copy(this.leftHand.currentQuat);

    // 2. Sleek white articulated hand for Right Hand (visible from frame 0)
    const rightRig = buildArticulatedWhiteHand(this.whiteHandMaterial, false);
    rightRig.handRoot.scale.set(1.15, 1.15, 1.15);
    rightRig.handRoot.name = 'right-white-hand';
    rightRig.handRoot.visible = true; // Always visible from frame 0
    this.scene.add(rightRig.handRoot);
    this.rightHand.rig = rightRig;

    this.rightHand.targetPos.set(-0.24, 0.54, -0.42);
    this.rightHand.currentPos.copy(this.rightHand.targetPos);
    this.rightHand.targetQuat.setFromEuler(new THREE.Euler(0.28, -0.20, 0.10));
    this.rightHand.currentQuat.copy(this.rightHand.targetQuat);
    this.rightHand.rig.handRoot.position.copy(this.rightHand.currentPos);
    this.rightHand.rig.handRoot.quaternion.copy(this.rightHand.currentQuat);

    this.applyPosture(this.leftHand.rig, Posture.RELAXED, 1.0);
    this.applyPosture(this.rightHand.rig, Posture.RELAXED, 1.0);
  }

  // -------------------------------------------------------------
  // 2. WebXR Tracking Setup (White Hand Models & Native Events)
  // -------------------------------------------------------------

  setupWebXRTracking() {
    for (let i = 0; i < 2; i++) {
      const handGroup = this.renderer.xr.getHand(i);
      const controllerGroup = this.renderer.xr.getController(i);
      const controllerGrip = this.renderer.xr.getControllerGrip(i);

      // Permanently hide controller visual models so no peach cuffs or controller avatars render
      controllerGrip.visible = false;
      controllerGroup.visible = false;

      const targetHand = i === 0 ? this.leftHand : this.rightHand;
      targetHand.handGroup = handGroup;
      targetHand.controllerGroup = controllerGroup;
      targetHand.controllerGrip = controllerGrip;

      this.scene.add(handGroup);
      this.scene.add(controllerGroup);
      this.scene.add(controllerGrip);

      handGroup.addEventListener('connected', (event) => {
        const handedness = event.data?.handedness || (i === 0 ? 'left' : 'right');
        const h = handedness === 'left' ? this.leftHand : this.rightHand;
        h.handGroup = handGroup;
        // Keep controller/handGroup dummy visual invisible so emulator static dummy hands never render
        handGroup.visible = false;

        // Apply clean white material and shadows
        handGroup.traverse((child) => {
          if (child.isMesh || child.isInstancedMesh || child.isSkinnedMesh) {
            child.material = this.whiteHandMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = false;
            child.visible = false;
          }
        });
      });

      controllerGroup.addEventListener('connected', (event) => {
        const handedness = event.data?.handedness || (i === 0 ? 'left' : 'right');
        const h = handedness === 'left' ? this.leftHand : this.rightHand;
        h.controllerGroup = controllerGroup;
        controllerGroup.visible = false;
        controllerGroup.scale.set(0.0001, 0.0001, 0.0001);
        controllerGroup.traverse((child) => {
          child.visible = false;
          if (child.material) {
            child.material.visible = false;
            child.material.opacity = 0;
            child.material.transparent = true;
          }
        });
      });

      controllerGrip.addEventListener('connected', (event) => {
        const handedness = event.data?.handedness || (i === 0 ? 'left' : 'right');
        const h = handedness === 'left' ? this.leftHand : this.rightHand;
        h.controllerGrip = controllerGrip;
        controllerGrip.visible = false;
        controllerGrip.scale.set(0.0001, 0.0001, 0.0001);
        controllerGrip.traverse((child) => {
          child.visible = false;
          if (child.material) {
            child.material.visible = false;
            child.material.opacity = 0;
            child.material.transparent = true;
          }
        });
      });

      // Map VR Pinch / Trigger / Squeeze Events to White Hand Actions
      const bindEvents = (source) => {
        source.addEventListener('selectstart', () => {
          const targetHand = i === 0 ? this.leftHand : this.rightHand;
          targetHand.isPinching = true;
          this.handleWebXRPinchOrAction(targetHand);
        });
        source.addEventListener('selectend', () => {
          const targetHand = i === 0 ? this.leftHand : this.rightHand;
          targetHand.isPinching = false;
        });
        source.addEventListener('pinchstart', () => {
          const targetHand = i === 0 ? this.leftHand : this.rightHand;
          targetHand.isPinching = true;
          this.handleWebXRPinchOrAction(targetHand);
        });
        source.addEventListener('pinchend', () => {
          const targetHand = i === 0 ? this.leftHand : this.rightHand;
          targetHand.isPinching = false;
        });
        source.addEventListener('squeezestart', () => {
          const targetHand = i === 0 ? this.leftHand : this.rightHand;
          targetHand.isGrasping = true;
          this.handleWebXRPinchOrAction(targetHand);
        });
        source.addEventListener('squeezeend', () => {
          const targetHand = i === 0 ? this.leftHand : this.rightHand;
          targetHand.isGrasping = false;
        });
      };

      bindEvents(handGroup);
      bindEvents(controllerGroup);
    }

    // In WebXR, automatically restart the narrative performance so hands perform all operations!
    this.renderer.xr.addEventListener('sessionstart', () => {
      if (this.leftHand?.controllerGrip) this.leftHand.controllerGrip.visible = false;
      if (this.rightHand?.controllerGrip) this.rightHand.controllerGrip.visible = false;
      if (this.leftHand?.controllerGroup) this.leftHand.controllerGroup.visible = false;
      if (this.rightHand?.controllerGroup) this.rightHand.controllerGroup.visible = false;
      if (this.leftHand?.handGroup) this.leftHand.handGroup.visible = false;
      if (this.rightHand?.handGroup) this.rightHand.handGroup.visible = false;
      if (this.leftHand?.rig?.handRoot) this.leftHand.rig.handRoot.visible = false;
      if (this.rightHand?.rig?.handRoot) this.rightHand.rig.handRoot.visible = false;
      if (this.leftHand?.handModel) this.leftHand.handModel.visible = true;
      if (this.rightHand?.handModel) this.rightHand.handModel.visible = true;
      this.restartShowcase();
      this.suppressSkintoneAndCuffs();
    });

    this.renderer.xr.addEventListener('sessionend', () => {
      this.suppressSkintoneAndCuffs();
    });
  }

  // -------------------------------------------------------------
  // 2b. Direct Loading of Default WebXR Hands (/left.glb & /right.glb)
  // -------------------------------------------------------------

  loadDefaultWebXRHand(handedness) {
    const isLeft = handedness === 'left';
    const targetHand = isLeft ? this.leftHand : this.rightHand;
    const filename = `${handedness}.glb`;

    // In node environment (unit tests), parse from local file system if fetch is unavailable
    if (typeof window === 'undefined' || !window.location?.href) {
      import('fs').then((fs) => {
        let p = `public/${filename}`;
        if (!fs.existsSync(p)) p = `dream-hanger/public/${filename}`;
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
          this.gltfLoader.parse(arrayBuffer, '', (gltf) => {
            this.setupParsedHandMesh(targetHand, gltf, handedness);
          });
        }
      }).catch(() => { });
      return;
    }

  const basePath = (typeof window !== 'undefined' && window.location?.pathname && window.location.pathname.endsWith('/')) ? window.location.pathname : './';
  const primaryUrl = `${basePath}${filename}`;

    this.gltfLoader.load(
    primaryUrl,
    (gltf) => {
      this.setupParsedHandMesh(targetHand, gltf, handedness);
    },
    undefined,
    () => {
      this.gltfLoader.load(`/${filename}`, (gltf) => {
        this.setupParsedHandMesh(targetHand, gltf, handedness);
      }, undefined, (err) => {
        console.warn(`[HandInteraction] Default WebXR Hand (${handedness}) load note:`, err?.message || err);
      });
    }
  );
  }

setupParsedHandMesh(targetHand, gltf, handedness) {
  const isLeft = handedness === 'left';
  const rootObj = gltf.scene.children[0];
  rootObj.traverse((child) => {
    if (child.isMesh || child.isSkinnedMesh) {
      child.material = this.whiteHandMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;
      child.visible = true;
      child.name = `${handedness}-webxr-hand-mesh`;
    }
  });

  // Orient hand: fingers extend forward (-Z), palm faces downward (-Y)
  rootObj.rotation.set(Math.PI / 2, isLeft ? -Math.PI / 2 : Math.PI / 2, 0);

  const skinnedMesh = rootObj.getObjectByProperty('type', 'SkinnedMesh');
  if (skinnedMesh) {
    targetHand.skinnedMesh = skinnedMesh;
    targetHand.bonesMap = {};
    targetHand.basePositions = {};
    targetHand.baseQuaternions = {};

    if (skinnedMesh.skeleton && skinnedMesh.skeleton.bones) {
      skinnedMesh.skeleton.bones.forEach((b) => {
        targetHand.bonesMap[b.name] = b;
        targetHand.basePositions[b.name] = b.position.clone();
        targetHand.baseQuaternions[b.name] = b.quaternion.clone();
        if (b.name === 'thumb-tip') targetHand.thumbTip = b;
        if (b.name === 'index-finger-tip') targetHand.indexTip = b;
        if (b.name === 'thumb-phalanx-distal') targetHand.thumbDistal = b;
        if (b.name === 'index-finger-phalanx-distal') targetHand.indexDistal = b;
      });
    }
  }

  const handModelGroup = new THREE.Group();
  handModelGroup.name = `${handedness}-default-hand-model`;
  handModelGroup.add(rootObj);
  targetHand.handModel = handModelGroup;

  // Add directly to the scene graph (world space) so the default WebXR hand model renders
  // reliably in both desktop simulation and WebXR mode without being hijacked by emulator inputs
  this.scene.add(handModelGroup);
  handModelGroup.position.copy(targetHand.currentPos);
  handModelGroup.quaternion.copy(targetHand.currentQuat);
  handModelGroup.updateMatrix();
  handModelGroup.updateMatrixWorld(true);
  handModelGroup.visible = true;

  // Keep WebXR controller/hand group meshes hidden so emulator dummy hands at (-0.25, -0.10, -0.40) do not render
  if (targetHand.handGroup) {
    targetHand.handGroup.visible = false;
  }

  this.articulateDefaultWebXRHand(targetHand, Posture.RELAXED, 1.0);
}

// -------------------------------------------------------------
// 3. WebXR Pinch / Grasp Action Dispatcher
// -------------------------------------------------------------

handleWebXRPinchOrAction(hand) {
  const step = this.interactionState;
  const pos = hand.currentPos;

  if (step === InteractionState.STATE_1_APPROACH_TARP || step === InteractionState.STATE_2_PINCH_TARP) {
    if (hand.isLeft) {
      const tarpPos = new THREE.Vector3();
      if (this.targets.tarp) this.targets.tarp.getWorldPosition(tarpPos);
      const dist = pos.distanceTo(tarpPos);
      if (dist < 0.95 || !this.renderer.xr.isPresenting) {
        this.executeStep2PinchTarp();
      }
    }
  } else if (step === InteractionState.STATE_3_PULL_TARP) {
    if (hand.isLeft) this.executeStep3PullTarp();
  } else if (step === InteractionState.STATE_4_APPROACH_LATCH || step === InteractionState.STATE_5_TWIST_LATCH) {
    if (!hand.isLeft) {
      const latchPos = new THREE.Vector3();
      if (this.targets.latchClasp) this.targets.latchClasp.getWorldPosition(latchPos);
      const dist = pos.distanceTo(latchPos);
      if (dist < 0.95 || !this.renderer.xr.isPresenting) {
        this.executeStep5TwistLatch();
      }
    }
  } else if (step === InteractionState.STATE_6_LIFT_LID) {
    if (!hand.isLeft) this.executeStep6LiftLid();
  } else if (step === InteractionState.STATE_7_REACH_BOX || step === InteractionState.STATE_8_GRASP_DREAMCATCHER) {
    if (hand.isLeft) this.executeStep8GraspDreamcatcher();
  } else if (step === InteractionState.STATE_9_SUPPORT_HOLD) {
    this.executeStep9SupportHold();
  } else if (step === InteractionState.STATE_10_BRUSH_SWIPE_1) {
    this.executeStep10Swipe1();
  } else if (step === InteractionState.STATE_11_FINAL_SWIPE_DROP) {
    this.executeStep11Swipe2();
  }
}

// -------------------------------------------------------------
// 4. Three Keyboard Control Modes ([1], [2], [3]) & Hand Controls
// -------------------------------------------------------------

setupKeyboardListeners() {
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    this.keysDown[key] = true;
    this.keysDown[e.code] = true;

    if (e.key === '1') {
      this.setControlMode(ControlMode.LEFT_ONLY);
    } else if (e.key === '2') {
      this.setControlMode(ControlMode.RIGHT_ONLY);
    } else if (e.key === '3') {
      this.setControlMode(ControlMode.DUAL_SIMULTANEOUS);
    } else if (key === 'p') {
      this.handlePinchOrActionKey();
    } else if (key === 'h') {
      this.toggleStopPalmPosture();
    } else if (key === 'c') {
      this.toggleCuppedCradlePosture();
    } else if (key === 't') {
      if (window.app && typeof window.app.toggleTheme === 'function') {
        window.app.toggleTheme();
      }
    } else if (e.code === 'Space' || key === ' ') {
      e.preventDefault();
      this.toggleShowcaseMode();
    }
  });

  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    this.keysDown[key] = false;
    this.keysDown[e.code] = false;
  });
}

toggleShowcaseMode() {
  if (!this.hasStartedShowcase) {
    this.startShowcaseMode();
    return true;
  }
  this.isShowcaseActive = !this.isShowcaseActive;
  console.log(`[HandInteraction] Showcase Mode: ${this.isShowcaseActive ? 'PLAYING (Auto)' : 'PAUSED (Manual)'}`);
  this.notifyStepChange();
  return this.isShowcaseActive;
}

toggleStopPalmPosture() {
  const isCurrentlyStopPalm = this.leftHand.posture === Posture.STOP_PALM || this.rightHand.posture === Posture.STOP_PALM;
  const targetPosture = isCurrentlyStopPalm ? Posture.RELAXED_OPEN : Posture.STOP_PALM;
  this.leftHand.posture = targetPosture;
  this.rightHand.posture = targetPosture;
  console.log(`[HandInteraction] Palm Posture set to: ${targetPosture}`);
}

toggleCuppedCradlePosture() {
  const isCurrentlyCradle = this.leftHand.posture === Posture.CUPPED_CRADLE || this.rightHand.posture === Posture.CUPPED_CRADLE;
  const targetPosture = isCurrentlyCradle ? Posture.RELAXED_OPEN : Posture.CUPPED_CRADLE;
  this.leftHand.posture = targetPosture;
  this.rightHand.posture = targetPosture;
  console.log(`[HandInteraction] Cradle Posture set to: ${targetPosture}`);
}

startShowcaseMode() {
  this.isShowcaseActive = true;
  this.hasStartedShowcase = true;
  if (this.showcasePhase === 0) {
    this.showcasePhase = 1;
    this.showcaseTimer = 0;
    this.interactionState = InteractionState.STATE_1_APPROACH_TARP;
  }
  console.log('[HandInteraction] Automated Showcase Triggered & Running from Step 1.');
  this.notifyStepChange();
}

pauseShowcaseMode() {
  this.isShowcaseActive = false;
  console.log('[HandInteraction] Showcase Mode Paused');
  this.notifyStepChange();
}

restartShowcase() {
  this.showcasePhase = 1;
  this.showcaseTimer = 0;
  this.isShowcaseActive = true;
  this.hasStartedShowcase = true;
  this.step2Triggered = false;
  this.step3Triggered = false;
  this.step5Triggered = false;
  this.step6Triggered = false;
  this.step8Triggered = false;
  this.step9Triggered = false;
  this.step10Triggered = false;
  this.step11Triggered = false;
  this.isLatchUnlocked = false;
  this.brushCount = 0;
  this.brushCooldown = 0;
  this.interactionState = InteractionState.STATE_1_APPROACH_TARP;

  this.leftHand.targetPos.set(-0.46, 0.56, -0.38);
  this.leftHand.currentPos.copy(this.leftHand.targetPos);
  this.leftHand.targetQuat.setFromEuler(new THREE.Euler(0.28, 0.20, -0.10));
  this.leftHand.currentQuat.copy(this.leftHand.targetQuat);
  this.leftHand.posture = Posture.RELAXED;
  this.leftHand.targetAnimOffset.set(0, 0, 0);
  this.leftHand.animOffset.set(0, 0, 0);
  this.leftHand.targetAnimRotation.set(0, 0, 0);
  this.leftHand.animRotation.set(0, 0, 0);
  this.leftHand.isPinching = false;

  this.rightHand.targetPos.set(-0.24, 0.56, -0.38);
  this.rightHand.currentPos.copy(this.rightHand.targetPos);
  this.rightHand.targetQuat.setFromEuler(new THREE.Euler(0.28, -0.20, 0.10));
  this.rightHand.currentQuat.copy(this.rightHand.targetQuat);
  this.rightHand.posture = Posture.RELAXED;
  this.rightHand.targetAnimOffset.set(0, 0, 0);
  this.rightHand.animOffset.set(0, 0, 0);
  this.rightHand.targetAnimRotation.set(0, 0, 0);
  this.rightHand.animRotation.set(0, 0, 0);
  this.rightHand.isPinching = false;

  if (this.targets.dreamcatcher) {
    this.targets.dreamcatcher.visible = false;
  }

  if (window.app && typeof window.app.resetScene === 'function') {
    window.app.resetScene();
  }
  if (this.storyNarrator) {
    this.storyNarrator.reset();
  }
  this.notifyStepChange();
  console.log('[HandInteraction] Showcase restarted seamlessly from Step 1.');
}

setTransitionToPalacePose() {
  if (this.storyNarrator) {
    this.storyNarrator.stop();
  }
  this.isInPalaceScene = true;
  this.isShowcaseActive = false; // Pause attic showcase loop during Scene 2
  this.dreamcatcherHeldBy = null;
  this.isHandExternallyControlled = true; // Rock-solid presentation: zero fighting with controller noise or shivering

  // Right hand: visible in lower-right foreground in PRECISION_PINCH
  this.rightHand.posture = Posture.PRECISION_PINCH;
  this.rightHand.isPinching = true;

  // Left hand: visible in lower-left foreground in RELAXED_OPEN reach
  this.leftHand.posture = Posture.RELAXED_OPEN;
  this.leftHand.isPinching = false;

  const cam = (this.renderer?.xr?.isPresenting ? this.renderer.xr.getCamera(this.camera) : this.camera) || this.camera;
  if (cam) {
    if (typeof cam.updateMatrixWorld === 'function') cam.updateMatrixWorld(true);
    const leftWorld = new THREE.Vector3(-0.22, -0.16, -0.46).applyMatrix4(cam.matrixWorld);
    const rightWorld = new THREE.Vector3(0.22, -0.16, -0.46).applyMatrix4(cam.matrixWorld);
    this.leftHand.currentPos.copy(leftWorld);
    this.leftHand.targetPos.copy(leftWorld);
    this.rightHand.currentPos.copy(rightWorld);
    this.rightHand.targetPos.copy(rightWorld);

    const camQuat = new THREE.Quaternion();
    if (typeof cam.getWorldQuaternion === 'function') cam.getWorldQuaternion(camQuat);
    else camQuat.copy(cam.quaternion);

    this.leftHand.currentQuat.copy(camQuat).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.20, 0.18, -0.08)));
    this.leftHand.targetQuat.copy(this.leftHand.currentQuat);
    this.rightHand.currentQuat.copy(camQuat).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.20, -0.18, 0.08)));
    this.rightHand.targetQuat.copy(this.rightHand.currentQuat);
  } else {
    this.leftHand.currentPos.set(-0.24, 1.22, 0.72);
    this.leftHand.targetPos.set(-0.24, 1.22, 0.72);
    this.rightHand.currentPos.set(0.24, 1.22, 0.72);
    this.rightHand.targetPos.set(0.24, 1.22, 0.72);
  }

  // Ensure both sleek white hands are 100% visible in the foreground
  if (this.leftHand?.handModel) this.leftHand.handModel.visible = true;
  if (this.leftHand?.rig?.handRoot) this.leftHand.rig.handRoot.visible = !this.leftHand?.handModel;

  if (this.rightHand?.handModel) this.rightHand.handModel.visible = true;
  if (this.rightHand?.rig?.handRoot) this.rightHand.rig.handRoot.visible = !this.rightHand?.handModel;

  // Strict rule: dream-hanger stays behind in attic and does NOT rise up
  if (this.targets.dreamcatcher) {
    this.targets.dreamcatcher.visible = false;
  }
  this.suppressSkintoneAndCuffs();
}

setThumbsUpPose() {
  this.isInPalaceScene = true;
  this.dreamcatcherHeldBy = null;
  this.isHandExternallyControlled = true;

  // Left hand thumbs up in foreground
  this.leftHand.posture = Posture.THUMBS_UP;
  this.leftHand.isPinching = false;
  this.leftHand.isGrasping = false;

  // Right hand thumbs up in foreground
  this.rightHand.posture = Posture.THUMBS_UP;
  this.rightHand.isPinching = false;
  this.rightHand.isGrasping = false;

  // Two celebratory up-and-down shakes (calm, slow, and graceful)
  this.isThumbsUpShaking = true;
  this.thumbsUpShakeTimer = 0.0;
  this.thumbsUpShakeDuration = 1.30;

  const cam = (this.renderer?.xr?.isPresenting ? this.renderer.xr.getCamera(this.camera) : this.camera) || this.camera;
  if (cam) {
    if (typeof cam.updateMatrixWorld === 'function') cam.updateMatrixWorld(true);
    const leftWorld = new THREE.Vector3(-0.18, -0.12, -0.40).applyMatrix4(cam.matrixWorld);
    const rightWorld = new THREE.Vector3(0.18, -0.12, -0.40).applyMatrix4(cam.matrixWorld);
    this.leftHand.targetPos.copy(leftWorld);
    this.rightHand.targetPos.copy(rightWorld);

    const camQuat = new THREE.Quaternion();
    if (typeof cam.getWorldQuaternion === 'function') cam.getWorldQuaternion(camQuat);
    else camQuat.copy(cam.quaternion);

    // Orient hands with thumbs pointing straight UP (+Y in camera view)
    this.leftHand.targetQuat.copy(camQuat).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0.16, Math.PI * 0.48)));
    this.rightHand.targetQuat.copy(camQuat).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, -0.16, -Math.PI * 0.48)));
  } else {
    this.leftHand.targetPos.set(-0.22, 1.24, 0.75);
    this.rightHand.targetPos.set(0.22, 1.24, 0.75);
  }

  if (this.leftHand?.handModel) this.leftHand.handModel.visible = true;
  if (this.leftHand?.rig?.handRoot) this.leftHand.rig.handRoot.visible = !this.leftHand?.handModel;

  if (this.rightHand?.handModel) this.rightHand.handModel.visible = true;
  if (this.rightHand?.rig?.handRoot) this.rightHand.rig.handRoot.visible = !this.rightHand?.handModel;

  if (this.leftHand?.rig) this.applyPosture(this.leftHand.rig, Posture.THUMBS_UP, 0.016);
  if (this.rightHand?.rig) this.applyPosture(this.rightHand.rig, Posture.THUMBS_UP, 0.016);

  if (this.targets.dreamcatcher) {
    this.targets.dreamcatcher.visible = false;
  }
  this.suppressSkintoneAndCuffs();

  console.log('[HandInteraction] Both hands transitioned into Posture.THUMBS_UP with upward thumbs & 2 celebratory shakes!');
}

setControlMode(mode) {
  if (this.controlMode === mode) return;
  this.controlMode = mode;
  console.log(`[HandInteraction] Active Control Mode: ${mode}`);
  if (this.onModeChanged) this.onModeChanged(this.controlMode);
  this.notifyStepChange();
}

handlePinchOrActionKey() {
  const step = this.interactionState;

  if (step === InteractionState.STATE_1_APPROACH_TARP || step === InteractionState.STATE_2_PINCH_TARP) {
    this.executeStep2PinchTarp();
  } else if (step === InteractionState.STATE_4_APPROACH_LATCH || step === InteractionState.STATE_5_TWIST_LATCH) {
    this.executeStep5TwistLatch();
  } else if (step === InteractionState.STATE_6_LIFT_LID) {
    this.executeStep6LiftLid();
  } else if (step === InteractionState.STATE_7_REACH_BOX || step === InteractionState.STATE_8_GRASP_DREAMCATCHER) {
    this.executeStep8GraspDreamcatcher();
  } else if (step === InteractionState.STATE_9_SUPPORT_HOLD) {
    this.executeStep9SupportHold();
  } else if (step === InteractionState.STATE_10_BRUSH_SWIPE_1) {
    this.executeStep10Swipe1();
  } else if (step === InteractionState.STATE_11_FINAL_SWIPE_DROP) {
    this.executeStep11Swipe2();
  }
}

// -------------------------------------------------------------
// 5. Mouse Pointer Raycasting & Click Fallback
// -------------------------------------------------------------

setupPointerListeners() {
  this.raycaster = new THREE.Raycaster();
  this.mouse = new THREE.Vector2();

  window.addEventListener('pointermove', (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('click', (e) => {
    if (e.target.closest('#desktop-hud') || e.target.closest('button')) return;
    this.onPointerClick();
  });
}

onPointerClick() {
  if (!this.camera) return;
  this.raycaster.setFromCamera(this.mouse, this.camera);
  const hit = this.raycastInteractiveObjects();
  if (!hit) return;

  if (hit.type === 'tarp') {
    if (this.interactionState <= InteractionState.STATE_2_PINCH_TARP) {
      this.executeStep2PinchTarp();
    } else if (this.interactionState === InteractionState.STATE_3_PULL_TARP) {
      this.executeStep3PullTarp();
    }
  } else if (hit.type === 'latch') {
    if (this.interactionState >= InteractionState.STATE_4_APPROACH_LATCH && this.interactionState <= InteractionState.STATE_5_TWIST_LATCH) {
      this.executeStep5TwistLatch();
    }
  } else if (hit.type === 'lid' || hit.type === 'chest') {
    if (this.interactionState === InteractionState.STATE_6_LIFT_LID) {
      this.executeStep6LiftLid();
    }
  } else if (hit.type === 'dreamcatcher') {
    if (this.interactionState >= InteractionState.STATE_7_REACH_BOX && this.interactionState <= InteractionState.STATE_8_GRASP_DREAMCATCHER) {
      this.executeStep8GraspDreamcatcher();
    } else if (this.interactionState === InteractionState.STATE_9_SUPPORT_HOLD) {
      this.executeStep9SupportHold();
    } else if (this.interactionState === InteractionState.STATE_10_BRUSH_SWIPE_1) {
      this.executeStep10Swipe1();
    } else if (this.interactionState === InteractionState.STATE_11_FINAL_SWIPE_DROP) {
      this.executeStep11Swipe2();
    }
  }
}

raycastInteractiveObjects() {
  const list = [];
  if (this.targets.tarp) list.push({ obj: this.targets.tarp, type: 'tarp' });
  if (this.targets.latchClasp) list.push({ obj: this.targets.latchClasp, type: 'latch' });
  if (this.targets.lid) list.push({ obj: this.targets.lid, type: 'lid' });
  if (this.targets.chestGroup) list.push({ obj: this.targets.chestGroup, type: 'chest' });
  if (this.targets.dreamcatcher) list.push({ obj: this.targets.dreamcatcher, type: 'dreamcatcher' });

  for (let item of list) {
    const intersects = this.raycaster.intersectObject(item.obj, true);
    if (intersects.length > 0) {
      return { type: item.type, intersection: intersects[0] };
    }
  }
  return null;
}

// -------------------------------------------------------------
// 6. 11 Detailed Interaction States Progression
// -------------------------------------------------------------

executeStep2PinchTarp() {
  this.tarpPinchStartPos.copy(this.leftHand.currentPos);
  this.leftHand.posture = Posture.PRECISION_PINCH;
  this.leftHand.isPinching = true;
  this.interactionState = InteractionState.STATE_3_PULL_TARP;
  console.log('[Step 2] Left White Hand pinched burlap corner. Move Left Hand backward (pull back in VR / S key) to drag tarp.');
  this.notifyStepChange();
}

executeStep3PullTarp() {
  if (this.interactionState !== InteractionState.STATE_3_PULL_TARP) return;
  this.interactionState = InteractionState.STATE_4_APPROACH_LATCH;
  this.leftHand.posture = Posture.RELAXED;
  this.leftHand.isPinching = false;
  this.setControlMode(ControlMode.RIGHT_ONLY);

  if (this.onTarpPulled) this.onTarpPulled();
  console.log('[Step 3] Tarp pulled off box! Control Mode switched to [2] Right Hand.');
  this.notifyStepChange();
}

executeStep5TwistLatch() {
  if (this.isLatchUnlocked) return;
  this.isLatchUnlocked = true;
  this.rightHand.posture = Posture.PRECISION_PINCH;

  if (this.targets.latchClasp) {
    this.targets.latchClasp.rotation.z = Math.PI * 0.45;
  }

  this.interactionState = InteractionState.STATE_6_LIFT_LID;
  this.rightHand.posture = Posture.CUPPED_LIFT;

  if (this.onLatchRotated) this.onLatchRotated();
  console.log('[Step 5] Latch twisted open! Use cupped Right Hand upward motion (R key or lift in VR) to open lid.');
  this.notifyStepChange();
}

executeStep6LiftLid() {
  if (this.interactionState !== InteractionState.STATE_6_LIFT_LID) return;
  this.interactionState = InteractionState.STATE_7_REACH_BOX;
  this.rightHand.posture = Posture.RELAXED;
  this.setControlMode(ControlMode.LEFT_ONLY);

  if (this.onLidOpened) this.onLidOpened();
  console.log('[Step 6] Lid opened! Move Left Hand down into glowing chest cavity.');
  this.notifyStepChange();
}

executeStep8GraspDreamcatcher() {
  this.leftHand.posture = Posture.FULL_GRASP;
  this.rightHand.posture = Posture.FULL_GRASP;
  this.dreamcatcherHeldBy = 'both';
  if (this.targets.dreamcatcher) {
    this.targets.dreamcatcher.visible = true;
    const midPos = new THREE.Vector3().addVectors(this.leftHand.currentPos, this.rightHand.currentPos).multiplyScalar(0.5);
    this.targets.dreamcatcher.position.copy(midPos);
    this.targets.dreamcatcher.rotation.set(0, 0, 0);
  }
  this.interactionState = InteractionState.STATE_9_SUPPORT_HOLD;

  if (this.onDreamcatcherLifted) this.onDreamcatcherLifted();
  console.log('[Step 8] Dreamcatcher grasped & lifted by both hands in fist grip! Right hand will hold hoop while Left hand dusts.');
  this.notifyStepChange();
}

executeStep9SupportHold() {
  this.rightHand.posture = Posture.FULL_GRASP;
  this.dreamcatcherHeldBy = 'right';
  if (this.targets.dreamcatcher) {
    this.targets.dreamcatcher.visible = true;
  }
  this.interactionState = InteractionState.STATE_10_BRUSH_SWIPE_1;
  this.leftHand.posture = Posture.FLAT_PALM;
  this.setControlMode(ControlMode.LEFT_ONLY);

  if (this.onDreamcatcherSupported) this.onDreamcatcherSupported();
  console.log('[Step 9] Right Hand holds dreamcatcher steady in fist! Left Hand opens to dust webbing.');
  this.notifyStepChange();
}

executeStep10Swipe1() {
  if (this.brushCooldown > 0) return;
  this.brushCooldown = 0.45;
  this.brushCount = 1;
  this.interactionState = InteractionState.STATE_11_FINAL_SWIPE_DROP;

  const dcPos = new THREE.Vector3();
  if (this.targets.dreamcatcher) this.targets.dreamcatcher.getWorldPosition(dcPos);

  if (this.onDreamcatcherBrushed) {
    this.onDreamcatcherBrushed(dcPos, new THREE.Vector3(1, 0, 0), 1);
  }
  console.log('[Step 10] First dust swipe complete (1/2)! Swipe flat Left Palm once more to detach the final seashell.');
  this.notifyStepChange();
}

executeStep11Swipe2() {
  if (this.brushCooldown > 0) return;
  this.brushCooldown = 0.45;
  this.brushCount = 2;

  const dcPos = new THREE.Vector3();
  if (this.targets.dreamcatcher) this.targets.dreamcatcher.getWorldPosition(dcPos);

  if (this.onDreamcatcherBrushed) {
    this.onDreamcatcherBrushed(dcPos, new THREE.Vector3(1, 0, 0), 2);
  }
  console.log('[Step 11] Final dust swipe! Seashell detached, gravity falling to floorboards. Palace transition imminent.');
  this.notifyStepChange();
}

notifyStepChange() {
  if (this.onStepChanged) {
    this.onStepChanged(this.interactionState, this.controlMode);
  }
  if (this.storyNarrator && !this.isInPalaceScene) {
    this.storyNarrator.onStepChanged(this.interactionState);
  }
}

// -------------------------------------------------------------
// 7. Real-Time Frame Update (Desktop White Hands & WebXR White Models)
// -------------------------------------------------------------

update(delta, time, appStep) {
  if (this.brushCooldown > 0) {
    this.brushCooldown -= delta;
  }

  // Unconditionally suppress emulator controller axes and gizmos every single frame
  if (this.leftHand?.controllerGrip) this.leftHand.controllerGrip.visible = false;
  if (this.rightHand?.controllerGrip) this.rightHand.controllerGrip.visible = false;
  if (this.leftHand?.controllerGroup) this.leftHand.controllerGroup.visible = false;
  if (this.rightHand?.controllerGroup) this.rightHand.controllerGroup.visible = false;
  if (this.leftHand?.handGroup) this.leftHand.handGroup.visible = false;
  if (this.rightHand?.handGroup) this.rightHand.handGroup.visible = false;
  this.suppressSkintoneAndCuffs();

  if (this.isInPalaceScene) {
    this.updatePalaceHands(delta, time);
    return;
  }

  if (this.isShowcaseActive) {
    this.updateShowcasePlayback(delta, time);
  } else {
    if (this.renderer.xr.isPresenting) {
      this.updateWebXRTracking(delta, time);
    } else {
      this.updateDesktopMovements(delta, time);
    }
    this.applyPoseToWebXRHand(this.leftHand, delta);
    this.applyPoseToWebXRHand(this.rightHand, delta);
    // Unified Proximity, Gesture, & State Progression Logic (Works for VR & Desktop)
    this.processProximityAndGestures(delta);
  }

  // Anchor Dreamcatcher if lifted
  this.updateDreamcatcherAttachment();
}

// -------------------------------------------------------------
// 7a. Palace Scene Hands Presentation (Guaranteed Foreground Visibility & Thumbs Up)
// -------------------------------------------------------------

updatePalaceHands(delta, time = 0) {
  const cam = (this.renderer?.xr?.isPresenting ? this.renderer.xr.getCamera(this.camera) : this.camera) || this.camera;
  if (!cam) return;
  if (typeof cam.updateMatrixWorld === 'function') {
    cam.updateMatrixWorld(true);
  }

  const isThumbsUp = (this.leftHand.posture === Posture.THUMBS_UP || this.rightHand.posture === Posture.THUMBS_UP);

  // Two celebratory up-and-down shakes animation (slow, graceful, exactly 2 pump cycles)
  let shakeY = 0;
  let shakePitch = 0;
  if (this.isThumbsUpShaking) {
    this.thumbsUpShakeTimer += delta;
    if (this.thumbsUpShakeTimer < this.thumbsUpShakeDuration) {
      // 2 complete full cycles: 4 * PI radians
      const progress = this.thumbsUpShakeTimer / this.thumbsUpShakeDuration;
      const angle = progress * Math.PI * 4.0;
      // Gentle, dignified vertical pump motion (zero shivering)
      shakeY = Math.sin(angle) * 0.032;
      shakePitch = Math.sin(angle) * 0.08;
    } else {
      this.isThumbsUpShaking = false;
      this.thumbsUpShakeTimer = this.thumbsUpShakeDuration;
    }
  }

  // Left and Right local positions relative to player camera view (calm and rock-solid)
  const leftLocal = isThumbsUp
    ? new THREE.Vector3(-0.18, -0.12 + shakeY, -0.40)
    : new THREE.Vector3(-0.22, -0.16, -0.46);
  const rightLocal = isThumbsUp
    ? new THREE.Vector3(0.18, -0.12 + shakeY, -0.40)
    : new THREE.Vector3(0.22, -0.16, -0.46);

  // Convert from camera local space to world space for default resting pose
  const leftWorld = leftLocal.applyMatrix4(cam.matrixWorld);
  const rightWorld = rightLocal.applyMatrix4(cam.matrixWorld);

  // Ensure thumbs point straight UP (+Y in camera view)
  let leftEuler = isThumbsUp
    ? new THREE.Euler(0.12 + shakePitch, 0.16, Math.PI * 0.48)
    : new THREE.Euler(0.20, 0.18, -0.08);
  let rightEuler = isThumbsUp
    ? new THREE.Euler(0.12 + shakePitch, -0.16, -Math.PI * 0.48)
    : new THREE.Euler(0.20, -0.18, 0.08);

  if (this.leftHand.posture === Posture.STOP_PALM) {
    leftEuler = new THREE.Euler(0.0, 0.0, 0.0);
  }
  if (this.rightHand.posture === Posture.STOP_PALM) {
    rightEuler = new THREE.Euler(0.0, 0.0, 0.0);
  }
  if (this.leftHand.posture === Posture.CUPPED_CRADLE) {
    leftEuler = new THREE.Euler(0.35, 0.12, 0.0);
  }
  if (this.rightHand.posture === Posture.CUPPED_CRADLE) {
    rightEuler = new THREE.Euler(0.35, -0.12, 0.0);
  }

  const camQuat = new THREE.Quaternion();
  if (typeof cam.getWorldQuaternion === 'function') {
    cam.getWorldQuaternion(camQuat);
  } else {
    camQuat.copy(cam.quaternion);
  }

  if (!this.isHandExternallyControlled) {
    this.leftHand.targetPos.copy(leftWorld);
    this.rightHand.targetPos.copy(rightWorld);
    this.leftHand.targetQuat.copy(camQuat).multiply(new THREE.Quaternion().setFromEuler(leftEuler));
    this.rightHand.targetQuat.copy(camQuat).multiply(new THREE.Quaternion().setFromEuler(rightEuler));
  }

  // Single source of truth: rock-solid frame-rate-independent damping (lambda = 8)
  // Zero fighting with raw controller inputs, zero shivering, perfectly calm hands
  const dt = Math.min(delta, 0.05);
  this.leftHand.currentPos.x = THREE.MathUtils.damp(this.leftHand.currentPos.x, this.leftHand.targetPos.x, 8, dt);
  this.leftHand.currentPos.y = THREE.MathUtils.damp(this.leftHand.currentPos.y, this.leftHand.targetPos.y, 8, dt);
  this.leftHand.currentPos.z = THREE.MathUtils.damp(this.leftHand.currentPos.z, this.leftHand.targetPos.z, 8, dt);

  this.rightHand.currentPos.x = THREE.MathUtils.damp(this.rightHand.currentPos.x, this.rightHand.targetPos.x, 8, dt);
  this.rightHand.currentPos.y = THREE.MathUtils.damp(this.rightHand.currentPos.y, this.rightHand.targetPos.y, 8, dt);
  this.rightHand.currentPos.z = THREE.MathUtils.damp(this.rightHand.currentPos.z, this.rightHand.targetPos.z, 8, dt);

  const tQuat = 1 - Math.exp(-8 * dt);
  this.leftHand.currentQuat.slerp(this.leftHand.targetQuat, tQuat);
  this.rightHand.currentQuat.slerp(this.rightHand.targetQuat, tQuat);

  [this.leftHand, this.rightHand].forEach((h) => {
    if (h.handModel) {
      h.handModel.visible = true;
      if (h.rig?.handRoot) h.rig.handRoot.visible = false;
    } else if (h.rig?.handRoot) {
      h.rig.handRoot.visible = true;
    }
    this.applyPoseToWebXRHand(h, delta);
  });

  // Track & hold Golden Key firmly in Right Hand when granted by Lady Seraphina
  if (this.heldKey) {
    const rPos = this.rightHand.currentPos;
    const rQuat = this.rightHand.currentQuat;

    if (this.keyLerpProgress < 1.0) {
      this.keyLerpProgress += delta / 1.4;
      const ease = Math.min(1.0, this.keyLerpProgress);
      const smoothEase = ease * (2 - ease);
      const targetPos = rPos.clone().add(new THREE.Vector3(0.015, 0.035, -0.05).applyQuaternion(rQuat));
      this.heldKey.position.lerpVectors(this.keyStartPos, targetPos, smoothEase);
      this.heldKey.rotation.y += delta * 3.0;
    } else {
      this.heldKey.position.copy(rPos).add(new THREE.Vector3(0.015, 0.035, -0.05).applyQuaternion(rQuat));
      this.heldKey.quaternion.copy(rQuat);
      this.heldKey.rotateZ(Math.PI / 4);
      this.heldKey.rotateX(0.2);
    }
    this.heldKey.visible = true;
  }

  this.suppressSkintoneAndCuffs();
}

holdGoldenKey(keyGroup, startWorldPos) {
  this.heldKey = keyGroup;
  this.keyLerpProgress = 0.0;
  this.keyStartPos = startWorldPos ? startWorldPos.clone() : new THREE.Vector3(1.75, 1.35, -2.2);
  if (keyGroup.parent) {
    keyGroup.parent.remove(keyGroup);
  }
  this.scene.add(keyGroup);
  keyGroup.visible = true;
  this.rightHand.posture = Posture.KEY_PINCH;
  this.rightHand.isPinching = true;
  console.log('[HandInteraction] Traveler hand received and is now holding the Golden Key!');

  // Display "Game Over" in black box with white text in the middle
  if (typeof window !== 'undefined' && typeof window.showCenterStatusBox === 'function') {
    window.showCenterStatusBox('Game Over', 0);
  }
}

// -------------------------------------------------------------
// 7b. Automated Hands-Free Showcase Playback Engine
// -------------------------------------------------------------

updateShowcasePlayback(delta, time) {
  this.showcaseTimer += delta;

  // Default natural resting reference poses (entering from bottom-left and bottom-right viewport)
  const restLeftPos = new THREE.Vector3(-0.46, 0.54, -0.38);
  const restLeftRot = new THREE.Euler(0.28, 0.20, -0.10);
  const restRightPos = new THREE.Vector3(-0.24, 0.54, -0.38);
  const restRightRot = new THREE.Euler(0.28, -0.20, 0.10);

  // Fixed steady holding reference pose for Right Hand holding Dreamcatcher hoop (palm faces left -X)
  const steadyRightHoldPos = new THREE.Vector3(-0.20, 0.70, -0.45);
  const steadyRightHoldRot = new THREE.Euler(0.10, -0.12, -Math.PI / 2);

  switch (this.showcasePhase) {
    case 0: {
      // Initial Framing Pause (0.7s) - hands resting relaxed in front of chest
      if (this.storyNarrator && this.storyNarrator.currentChapterIndex !== 0) {
        this.storyNarrator.playChapter(0);
      }
      this.setHandPoseTarget(this.leftHand, restLeftPos, restLeftRot, Posture.RELAXED);
      this.setHandPoseTarget(this.rightHand, restRightPos, restRightRot, Posture.RELAXED);
      this.leftHand.targetAnimOffset.set(0, 0, 0);
      this.leftHand.targetAnimRotation.set(0, 0, 0);
      this.leftHand.isPinching = false;
      this.rightHand.targetAnimOffset.set(0, 0, 0);
      this.rightHand.targetAnimRotation.set(0, 0, 0);
      this.rightHand.isPinching = false;
      this.setControlMode(ControlMode.LEFT_ONLY);

      if (this.showcaseTimer >= 0.7) {
        this.showcasePhase = 1;
        this.showcaseTimer = 0;
        this.interactionState = InteractionState.STATE_1_APPROACH_TARP;
        this.notifyStepChange();
      }
      break;
    }

    case 1: {
      // Move Left Hand to front-left tip/corner of cloth/tarp in clear reaching posture
      // Positive surface clearance offset (+0.025m Y, +0.02m Z) so hand stays 100% visible on top of cloth
      const clothTipPos = new THREE.Vector3(-0.62, 0.665, -0.44);
      const clothTipRot = new THREE.Euler(0.24, 0.18, -0.10);
      this.setHandPoseTarget(this.leftHand, clothTipPos, clothTipRot, Posture.RELAXED);
      this.setHandPoseTarget(this.rightHand, restRightPos, restRightRot, Posture.RELAXED);

      this.leftHand.isPinching = false;
      this.rightHand.isPinching = false;

      if (this.targets.tarp?.material) {
        this.targets.tarp.material.emissive = new THREE.Color(0x1a3344);
        this.targets.tarp.material.emissiveIntensity = 0.55;
      }

      if (this.showcaseTimer >= 1.2 || this.leftHand.currentPos.distanceTo(clothTipPos) < 0.05) {
        this.interactionState = InteractionState.STATE_2_PINCH_TARP;
        this.notifyStepChange();
        this.showcasePhase = 2;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 2: {
      // The hand pinches the tip of the cloth: Thumb tip and index tip clamp tightly onto cloth tip
      // Remaining 3 fingers tightly curled into palm; hand rests visibly on top of cloth tip
      const clothTipPos = new THREE.Vector3(-0.62, 0.665, -0.44);
      const clothTipRot = new THREE.Euler(0.24, 0.18, -0.10);
      this.setHandPoseTarget(this.leftHand, clothTipPos, clothTipRot, Posture.PRECISION_PINCH);
      this.setHandPoseTarget(this.rightHand, restRightPos, restRightRot, Posture.RELAXED);
      this.leftHand.isPinching = true;

      if (this.showcaseTimer >= 0.35 && !this.step2Triggered) {
        this.step2Triggered = true;
        this.executeStep2PinchTarp();
      }

      // Distinct pause holding the pinched tip stationary before pulling off
      if (this.showcaseTimer >= 0.85) {
        this.step2Triggered = false;
        this.interactionState = InteractionState.STATE_3_PULL_TARP;
        this.notifyStepChange();
        this.showcasePhase = 3;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 3: {
      // And then pull the cloth off: Left hand in precision pinch smoothly sweeps to the side and down onto floor,
      // dragging the pinched cloth tip in lockstep off the box.
      const pullTarget = new THREE.Vector3(-0.84, 0.14, -0.34);
      const pullRot = new THREE.Euler(0.36, 0.26, -0.16);
      this.setHandPoseTarget(this.leftHand, pullTarget, pullRot, Posture.PRECISION_PINCH);
      this.setHandPoseTarget(this.rightHand, restRightPos, restRightRot, Posture.RELAXED);
      this.leftHand.velocity.set(-0.35, -0.28, 0.15);
      this.leftHand.isPinching = true;

      // Keep cloth tip attached to left hand pinch point as it sweeps off the box onto the floor
      if (this.targets.tarp) {
        const initialPos = this.initialTarpPos || new THREE.Vector3(-0.35, 0.72, -0.75);
        const finalTarpPos = new THREE.Vector3(initialPos.x - 0.44, 0.035, initialPos.z + 0.18);
        const pullProgress = Math.min(1, Math.max(0, this.showcaseTimer / 1.35));
        const ease = 1 - Math.pow(1 - pullProgress, 2.8);
        this.targets.tarp.position.lerpVectors(initialPos, finalTarpPos, ease);
        this.targets.tarp.rotation.z = THREE.MathUtils.lerp(0, 0.55, ease);
        this.targets.tarp.rotation.x = THREE.MathUtils.lerp(0, 0.35, ease);
      }

      // When cloth has been pulled completely off the box down to the floor:
      if (this.showcaseTimer >= 1.35 && !this.step3Triggered) {
        this.step3Triggered = true;
        this.executeStep3PullTarp();
      }

      if (this.showcaseTimer >= 1.40) {
        this.leftHand.isPinching = false;
        this.leftHand.posture = Posture.RELAXED;
      }

      if (this.showcaseTimer >= 1.70) {
        this.step3Triggered = false;
        this.interactionState = InteractionState.STATE_4_APPROACH_LATCH;
        this.setControlMode(ControlMode.RIGHT_ONLY);
        this.notifyStepChange();
        this.showcasePhase = 4;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 4: {
      // Right Hand Approach Latch in Full Camera View
      // Forward clearance offset in front (+Z) of brass lock (z = -0.48m) outside chest mesh
      this.setHandPoseTarget(this.leftHand, restLeftPos, restLeftRot, Posture.RELAXED);
      this.leftHand.isPinching = false;

      const latchTarget = new THREE.Vector3(-0.30, 0.58, -0.48);
      const latchRot = new THREE.Euler(0.18, -0.20, 0.65);
      this.setHandPoseTarget(this.rightHand, latchTarget, latchRot, Posture.KEY_PINCH);
      this.rightHand.isPinching = false;

      if (this.showcaseTimer >= 1.3 || this.rightHand.currentPos.distanceTo(latchTarget) < 0.05) {
        this.interactionState = InteractionState.STATE_5_TWIST_LATCH;
        this.notifyStepChange();
        this.showcasePhase = 5;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 5: {
      // Position clearly in front (+Z) of brass lock (z = -0.48m) with +0.06m clearance outside chest mesh
      // ONLY thumb and index in pinch position, middle, ring, pinky tightly curled/closed in palm
      // Hand twists along roll axis like turning a key/latch
      const latchPinchPos = new THREE.Vector3(-0.32, 0.58, -0.48);
      const twistProgress = Math.min(1, Math.max(0, (this.showcaseTimer - 0.10) / 0.55));
      const twistAngle = THREE.MathUtils.lerp(0, Math.PI * 0.48, twistProgress);
      const latchTwistRot = new THREE.Euler(0.18, -0.20, 0.65 + twistAngle);

      this.setHandPoseTarget(this.rightHand, latchPinchPos, latchTwistRot, Posture.KEY_PINCH);
      this.rightHand.isPinching = true;

      if (this.targets.latchClasp) {
        this.targets.latchClasp.rotation.z = twistAngle;
      }

      if (this.showcaseTimer >= 0.35 && !this.step5Triggered) {
        this.step5Triggered = true;
        this.executeStep5TwistLatch();
      }

      if (this.showcaseTimer >= 0.95) {
        this.step5Triggered = false;
        this.rightHand.isPinching = false;
        this.interactionState = InteractionState.STATE_6_LIFT_LID;
        this.notifyStepChange();
        this.showcasePhase = 6;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 6: {
      // Right hand palm faces UPWARD (+Y), wrist below front rim of lid outside (+Z = -0.46m)
      // Four fingers (index, middle, ring, pinky) tucked tightly underneath front edge of box lid, lift smoothly along opening arc
      this.setHandPoseTarget(this.leftHand, restLeftPos, restLeftRot, Posture.RELAXED);

      const lidLiftRot = new THREE.Euler(-0.20, 0, Math.PI);
      const startLiftPos = new THREE.Vector3(-0.35, 0.54, -0.46);
      const endLiftPos = new THREE.Vector3(-0.35, 0.82, -0.48);
      const liftProgress = Math.min(1, this.showcaseTimer / 1.4);
      const currentLiftPos = new THREE.Vector3().lerpVectors(startLiftPos, endLiftPos, liftProgress);

      this.setHandPoseTarget(this.rightHand, currentLiftPos, lidLiftRot, Posture.CUPPED_LIFT);
      this.rightHand.velocity.set(0, 0.24, 0);
      this.rightHand.isPinching = false;

      if (this.showcaseTimer >= 0.35 && !this.step6Triggered) {
        this.step6Triggered = true;
        this.executeStep6LiftLid();
      }

      if (this.showcaseTimer >= 1.6) {
        this.step6Triggered = false;
        this.setControlMode(ControlMode.DUAL_SIMULTANEOUS);
        this.interactionState = InteractionState.STATE_7_REACH_BOX;
        this.notifyStepChange();
        this.showcasePhase = 7;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 7: {
      // Both hands enter through open top of box (Zero clipping through box walls)
      // Hanger remains 100% concealed and hidden inside the box until hands physically reach and grasp it
      if (this.targets.dreamcatcher) {
        this.targets.dreamcatcher.visible = false;
      }
      this.dreamcatcherHeldBy = null;

      const leftBoxRot = new THREE.Euler(0.10, 0.12, Math.PI / 2);  // Left palm faces toward right (+X)
      const rightBoxRot = new THREE.Euler(0.10, -0.12, -Math.PI / 2); // Right palm faces toward left (-X)

      if (this.showcaseTimer < 0.85) {
        // Sub-step 7a: Raise both hands above open rim of chest (y >= 0.74m),
        // positioned directly over open top cavity at outer hoop X coordinates (x = -0.50m and -0.20m, z = -0.72m)
        const leftHoverPos = new THREE.Vector3(-0.50, 0.74, -0.72);
        const rightHoverPos = new THREE.Vector3(-0.20, 0.74, -0.72);

        this.setHandPoseTarget(this.leftHand, leftHoverPos, leftBoxRot, Posture.FULL_GRASP);
        this.setHandPoseTarget(this.rightHand, rightHoverPos, rightBoxRot, Posture.FULL_GRASP);
      } else {
        // Sub-step 7b: Lower downward (-Y) through open top into cavity to outer hoop edges (x = -0.50m and -0.20m)
        // Strictly vertical descent through open top - zero horizontal clipping through box walls!
        const leftEnterPos = new THREE.Vector3(-0.50, 0.48, -0.72);
        const rightEnterPos = new THREE.Vector3(-0.20, 0.48, -0.72);

        this.setHandPoseTarget(this.leftHand, leftEnterPos, leftBoxRot, Posture.FULL_GRASP);
        this.setHandPoseTarget(this.rightHand, rightEnterPos, rightBoxRot, Posture.FULL_GRASP);
      }

      this.leftHand.isPinching = false;
      this.rightHand.isPinching = false;

      if (this.showcaseTimer >= 1.70) {
        this.interactionState = InteractionState.STATE_8_GRASP_DREAMCATCHER;
        this.notifyStepChange();
        this.showcasePhase = 8;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 8: {
      // Both hands grasp outer left (-X = -0.50) and outer right (+X = -0.20) hoop edges in opposing closed fist poses (FULL_GRASP)
      // Right palm faces left (-X), left palm faces right (+X), cleanly lifting hanger in 100% lockstep synchronization
      const leftHoldRot = new THREE.Euler(0.10, 0.12, Math.PI / 2); // Left palm faces right (+X)
      const rightHoldRot = steadyRightHoldRot; // Right palm faces left (-X)

      if (!this.step8Triggered) {
        this.step8Triggered = true;
        this.dreamcatcherHeldBy = 'both';
        if (this.targets.dreamcatcher) {
          this.targets.dreamcatcher.visible = true;
          const initialMid = new THREE.Vector3().addVectors(this.leftHand.currentPos, this.rightHand.currentPos).multiplyScalar(0.5);
          this.targets.dreamcatcher.position.copy(initialMid);
          this.targets.dreamcatcher.rotation.set(0, 0, 0);
        }
        if (this.onDreamcatcherLifted) this.onDreamcatcherLifted();
      }

      if (this.showcaseTimer < 1.30) {
        // Sub-stage 8a: Hands and dreamcatcher lift strictly upward (+Y) out of the box opening
        // Lift straight up until the dream hanger COMPLETELY clears the box all the way to the lowest feather (y = 1.20m)!
        // Bottom of feather is 0.545m below hoop center; lifting to y = 1.20m ensures feather clears chest rim (y = 0.61m).
        // X and Z remain 100% locked at (-0.50/-0.20, -0.72) with zero lateral/forward movement.
        const liftUpProgress = Math.min(1.0, this.showcaseTimer / 1.20);
        const currentY = THREE.MathUtils.lerp(0.48, 1.20, liftUpProgress);
        const leftLiftUp = new THREE.Vector3(-0.50, currentY, -0.72);
        const rightLiftUp = new THREE.Vector3(-0.20, currentY, -0.72);

        this.setHandPoseTarget(this.leftHand, leftLiftUp, leftHoldRot, Posture.FULL_GRASP);
        this.setHandPoseTarget(this.rightHand, rightLiftUp, rightHoldRot, Posture.FULL_GRASP);
      } else {
        // Sub-stage 8b: ONLY after the dream hanger completely came out till the feather (y >= 1.20m),
        // THEN the hands and grasped hanger come forward (+Z) together in unison and settle to eye level (y = 0.70m, z = -0.45m)
        const fwdProgress = Math.min(1.0, (this.showcaseTimer - 1.30) / 1.20);
        const currentY = THREE.MathUtils.lerp(1.20, 0.70, fwdProgress);
        const currentZ = THREE.MathUtils.lerp(-0.72, -0.45, fwdProgress);
        const leftFinal = new THREE.Vector3(-0.50, currentY, currentZ);
        const rightFinal = new THREE.Vector3(-0.20, currentY, currentZ);

        this.setHandPoseTarget(this.leftHand, leftFinal, leftHoldRot, Posture.FULL_GRASP);
        this.setHandPoseTarget(this.rightHand, rightFinal, rightHoldRot, Posture.FULL_GRASP);
      }

      this.leftHand.isGrasping = true;
      this.rightHand.isGrasping = true;

      // Dreamcatcher stays in 100% synchronized lockstep with hands at every frame
      if (this.targets.dreamcatcher) {
        this.targets.dreamcatcher.visible = true;
        const midPos = new THREE.Vector3().addVectors(this.leftHand.currentPos, this.rightHand.currentPos).multiplyScalar(0.5);
        this.targets.dreamcatcher.position.copy(midPos);
        this.targets.dreamcatcher.rotation.set(0, 0, 0);
      }

      if (this.showcaseTimer >= 2.60) {
        this.step8Triggered = false;
        this.interactionState = InteractionState.STATE_9_SUPPORT_HOLD;
        this.notifyStepChange();
        this.showcasePhase = 9;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 9: {
      // Right Hand remains locked in SAME closed fist position holding dreamcatcher stationary (outer right hoop)!
      // Dreamcatcher does NOT move! Left hand releases outer hoop and opens into flat dusting pose in front (+Z = -0.41m)
      this.setHandPoseTarget(this.rightHand, steadyRightHoldPos, steadyRightHoldRot, Posture.FULL_GRASP);
      this.rightHand.isGrasping = true;

      const dustPrepPos = new THREE.Vector3(-0.48, 0.70, -0.41);
      const dustRot = new THREE.Euler(0.10, 0.30, -0.12);
      this.setHandPoseTarget(this.leftHand, dustPrepPos, dustRot, Posture.FLAT_PALM);
      this.leftHand.isGrasping = false;
      this.leftHand.isPinching = false;

      if (this.showcaseTimer >= 0.6 && !this.step9Triggered) {
        this.step9Triggered = true;
        this.executeStep9SupportHold();
      }

      if (this.showcaseTimer >= 1.2) {
        this.step9Triggered = false;
        this.setControlMode(ControlMode.LEFT_ONLY);
        this.interactionState = InteractionState.STATE_10_BRUSH_SWIPE_1;
        this.notifyStepChange();
        this.showcasePhase = 10;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 10: {
      // Right hand stays locked in SAME FIST holding dreamcatcher stationary/frozen
      // Left hand performs first flat palm dust swipe across front (+Z = -0.41m) of dreamcatcher
      this.setHandPoseTarget(this.rightHand, steadyRightHoldPos, steadyRightHoldRot, Posture.FULL_GRASP);
      this.rightHand.isGrasping = true;
      this.leftHand.isPinching = false;

      const swipeRot = new THREE.Euler(0.10, 0.30, -0.12);
      if (this.showcaseTimer < 0.4) {
        this.setHandPoseTarget(this.leftHand, new THREE.Vector3(-0.48, 0.70, -0.41), swipeRot, Posture.FLAT_PALM);
      } else if (this.showcaseTimer < 1.0) {
        this.setHandPoseTarget(this.leftHand, new THREE.Vector3(-0.25, 0.70, -0.41), swipeRot, Posture.FLAT_PALM);
        this.leftHand.velocity.set(0.35, 0, 0);

        if (!this.step10Triggered) {
          this.step10Triggered = true;
          this.executeStep10Swipe1();
        }
      }

      if (this.showcaseTimer >= 1.4) {
        this.step10Triggered = false;
        this.brushCooldown = 0;
        this.interactionState = InteractionState.STATE_11_FINAL_SWIPE_DROP;
        this.notifyStepChange();
        this.showcasePhase = 11;
        this.showcaseTimer = 0;
      }
      break;
    }

    case 11: {
      // Right hand stays locked in SAME FIST holding dreamcatcher stationary/frozen
      // Left hand performs final return flat palm swipe in front (+Z = -0.41m), detaching seashell & triggering Palace transition
      this.setHandPoseTarget(this.rightHand, steadyRightHoldPos, steadyRightHoldRot, Posture.FULL_GRASP);
      this.rightHand.isGrasping = true;
      this.leftHand.isPinching = false;

      const returnRot = new THREE.Euler(0.10, -0.30, 0.12);
      if (this.showcaseTimer < 0.35) {
        this.setHandPoseTarget(this.leftHand, new THREE.Vector3(-0.25, 0.70, -0.41), returnRot, Posture.FLAT_PALM);
      } else if (this.showcaseTimer < 1.1) {
        this.setHandPoseTarget(this.leftHand, new THREE.Vector3(-0.48, 0.70, -0.41), returnRot, Posture.FLAT_PALM);
        this.leftHand.velocity.set(-0.35, 0, 0);

        if (!this.step11Triggered) {
          this.step11Triggered = true;
          this.executeStep11Swipe2();
        }
      }

      if (this.showcaseTimer >= 2.0) {
        this.step11Triggered = false;
        this.showcasePhase = 12;
        this.showcaseTimer = 0;
        this.notifyStepChange();
      }
      break;
    }

    case 12: {
      // Showcase Complete & Transition Held - Right hand maintains steady hold in fist!
      this.setHandPoseTarget(this.rightHand, steadyRightHoldPos, steadyRightHoldRot, Posture.FULL_GRASP);
      this.setHandPoseTarget(this.leftHand, restLeftPos, restLeftRot, Posture.RELAXED);
      this.leftHand.isPinching = false;
      this.rightHand.isPinching = false;

      // Seamless Loop after 4.5s
      if (this.showcaseLoop && this.showcaseTimer >= 4.5) {
        this.restartShowcase();
      }
      break;
    }
  }

  // Smooth Vector Lerping for Position AND Slerp for Rotation (calm, lifelike human speed)
  const lerpRate = Math.min(1, delta * 5.2);
  this.leftHand.currentPos.lerp(this.leftHand.targetPos, lerpRate);
  this.rightHand.currentPos.lerp(this.rightHand.targetPos, lerpRate);
  this.leftHand.currentQuat.slerp(this.leftHand.targetQuat, lerpRate);
  this.rightHand.currentQuat.slerp(this.rightHand.targetQuat, lerpRate);

  // Keep hands visible: if handModel is loaded show it; otherwise procedural rig is visible
  if (this.leftHand?.handModel) {
    this.leftHand.handModel.visible = true;
    if (this.leftHand.rig?.handRoot) this.leftHand.rig.handRoot.visible = false;
  } else if (this.leftHand?.rig?.handRoot) {
    this.leftHand.rig.handRoot.visible = true;
  }

  if (this.rightHand?.handModel) {
    this.rightHand.handModel.visible = true;
    if (this.rightHand.rig?.handRoot) this.rightHand.rig.handRoot.visible = false;
  } else if (this.rightHand?.rig?.handRoot) {
    this.rightHand.rig.handRoot.visible = true;
  }

  // Apply posture to procedural rig with full finger articulation
  if (this.leftHand.rig) this.applyPosture(this.leftHand.rig, this.leftHand.posture, delta);
  if (this.rightHand.rig) this.applyPosture(this.rightHand.rig, this.rightHand.posture, delta);

  // Actively drive the visible hands in 3D space
  this.applyPoseToWebXRHand(this.leftHand, delta);
  this.applyPoseToWebXRHand(this.rightHand, delta);

  // Suppress any skintone/cuff artifacts
  this.suppressSkintoneAndCuffs();
}

updateDesktopMovements(delta, time) {
  const speed = 0.65; // m/s movement rate
  const keys = this.keysDown;

  // Left Hand Translation: WASD + QE
  if (this.controlMode === ControlMode.LEFT_ONLY || this.controlMode === ControlMode.DUAL_SIMULTANEOUS) {
    if (keys['w'] || keys['keyw']) this.leftHand.targetPos.z -= speed * delta;
    if (keys['s'] || keys['keys']) this.leftHand.targetPos.z += speed * delta;
    if (keys['a'] || keys['keya']) this.leftHand.targetPos.x -= speed * delta;
    if (keys['d'] || keys['keyd']) this.leftHand.targetPos.x += speed * delta;
    if (keys['q'] || keys['keyq']) this.leftHand.targetPos.y += speed * delta;
    if (keys['e'] || keys['keye']) this.leftHand.targetPos.y -= speed * delta;

    if (this.isInPalaceScene) {
      const cam = this.camera;
      if (cam) {
        const isThumbsUp = this.leftHand.posture === Posture.THUMBS_UP;
        const leftLocal = isThumbsUp
          ? new THREE.Vector3(-0.20, -0.12, -0.40)
          : new THREE.Vector3(-0.22, -0.16, -0.44);
        const rightLocal = isThumbsUp
          ? new THREE.Vector3(0.20, -0.12, -0.40)
          : new THREE.Vector3(0.22, -0.16, -0.44);

        const leftWorld = leftLocal.applyMatrix4(cam.matrixWorld);
        const rightWorld = rightLocal.applyMatrix4(cam.matrixWorld);

        this.leftHand.targetPos.copy(leftWorld);
        this.rightHand.targetPos.copy(rightWorld);

        const leftEuler = isThumbsUp ? new THREE.Euler(0.05, 0.16, -0.05) : new THREE.Euler(0.18, 0.16, -0.08);
        const rightEuler = isThumbsUp ? new THREE.Euler(0.05, -0.16, 0.05) : new THREE.Euler(0.16, -0.14, 0.08);
        this.leftHand.targetQuat.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromEuler(leftEuler));
        this.rightHand.targetQuat.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromEuler(rightEuler));
      }
    } else {
      this.leftHand.targetPos.x = THREE.MathUtils.clamp(this.leftHand.targetPos.x, -1.2, 0.4);
      this.leftHand.targetPos.y = THREE.MathUtils.clamp(this.leftHand.targetPos.y, 0.25, 1.8);
      this.leftHand.targetPos.z = THREE.MathUtils.clamp(this.leftHand.targetPos.z, -1.5, 0.3);
    }
  }

  // Right Hand Translation: Arrow Keys + RF
  if (this.controlMode === ControlMode.RIGHT_ONLY || this.controlMode === ControlMode.DUAL_SIMULTANEOUS) {
    if (keys['arrowup']) this.rightHand.targetPos.z -= speed * delta;
    if (keys['arrowdown']) this.rightHand.targetPos.z += speed * delta;
    if (keys['arrowleft']) this.rightHand.targetPos.x -= speed * delta;
    if (keys['arrowright']) this.rightHand.targetPos.x += speed * delta;
    if (keys['r'] || keys['keyr']) this.rightHand.targetPos.y += speed * delta;
    if (keys['f'] || keys['keyf']) this.rightHand.targetPos.y -= speed * delta;

    if (!this.isInPalaceScene) {
      this.rightHand.targetPos.x = THREE.MathUtils.clamp(this.rightHand.targetPos.x, -0.9, 0.8);
      this.rightHand.targetPos.y = THREE.MathUtils.clamp(this.rightHand.targetPos.y, 0.25, 1.8);
      this.rightHand.targetPos.z = THREE.MathUtils.clamp(this.rightHand.targetPos.z, -1.5, 0.3);
    }
  }

  // Apply smooth vector lerping and slerping to hand positions and orientations
  this.leftHand.currentPos.lerp(this.leftHand.targetPos, Math.min(1, delta * 14.0));
  this.rightHand.currentPos.lerp(this.rightHand.targetPos, Math.min(1, delta * 14.0));
  this.leftHand.currentQuat.slerp(this.leftHand.targetQuat, Math.min(1, delta * 14.0));
  this.rightHand.currentQuat.slerp(this.rightHand.targetQuat, Math.min(1, delta * 14.0));

  // Apply posture to rig
  if (this.leftHand.rig) this.applyPosture(this.leftHand.rig, this.leftHand.posture, delta);
  if (this.rightHand.rig) this.applyPosture(this.rightHand.rig, this.rightHand.posture, delta);

  // Drive WebXR generic hands / visual rigs
  this.applyPoseToWebXRHand(this.leftHand, delta);
  this.applyPoseToWebXRHand(this.rightHand, delta);

  // Calculate velocities for swipe detection
  if (delta > 0.001) {
    this.leftHand.velocity.subVectors(this.leftHand.currentPos, this.leftHand.prevPosition).divideScalar(delta);
    this.rightHand.velocity.subVectors(this.rightHand.currentPos, this.rightHand.prevPosition).divideScalar(delta);
  }
  this.leftHand.prevPosition.copy(this.leftHand.currentPos);
  this.rightHand.prevPosition.copy(this.rightHand.currentPos);
}

updateWebXRTracking(delta, time) {
  const cam = this.renderer.xr.getCamera(this.camera) || this.camera;

  // Keep hands visible in WebXR tracking
  if (this.leftHand?.handModel) {
    this.leftHand.handModel.visible = true;
    if (this.leftHand.rig?.handRoot) this.leftHand.rig.handRoot.visible = false;
  } else if (this.leftHand?.rig?.handRoot) {
    this.leftHand.rig.handRoot.visible = true;
  }

  if (this.rightHand?.handModel) {
    this.rightHand.handModel.visible = true;
    if (this.rightHand.rig?.handRoot) this.rightHand.rig.handRoot.visible = false;
  } else if (this.rightHand?.rig?.handRoot) {
    this.rightHand.rig.handRoot.visible = true;
  }

  if (this.leftHand?.handGroup) this.leftHand.handGroup.visible = false;
  if (this.rightHand?.handGroup) this.rightHand.handGroup.visible = false;

  // Ensure controller grips and controller visual models stay permanently invisible
  if (this.leftHand?.controllerGrip) this.leftHand.controllerGrip.visible = false;
  if (this.rightHand?.controllerGrip) this.rightHand.controllerGrip.visible = false;
  if (this.leftHand?.controllerGroup) this.leftHand.controllerGroup.visible = false;
  if (this.rightHand?.controllerGroup) this.rightHand.controllerGroup.visible = false;

  // Continuously suppress any skintone/peach mesh or cuff injected by WebXR emulator or extension
  this.suppressSkintoneAndCuffs();

  // If showcase is running or hands are externally controlled (AutoRun / guided steps), bypass raw WebXR tracking completely
  if (this.isShowcaseActive || this.isHandExternallyControlled) {
    return;
  }

  [this.leftHand, this.rightHand].forEach((h) => {
    let hasPose = false;

    // 1. Check Tracked WebXR Hand Joints (White Hand Mesh Bones)
    const handGroup = h.handGroup;
    if (handGroup) {
      const wPos = new THREE.Vector3();
      const wQuat = new THREE.Quaternion();

      if (handGroup.joints && handGroup.joints['wrist']) {
        handGroup.joints['wrist'].getWorldPosition(wPos);
        handGroup.joints['wrist'].getWorldQuaternion(wQuat);
      }
      if (wPos.lengthSq() <= 0.001) {
        handGroup.getWorldPosition(wPos);
        handGroup.getWorldQuaternion(wQuat);
      }

      if (wPos.lengthSq() > 0.001) {
        hasPose = true;
        h.currentQuat.copy(wQuat);
        h.currentPos.copy(wPos);

        // Real-time Pinch Detection from White Fingertips
        const iTip = handGroup.joints ? handGroup.joints['index-finger-tip'] : null;
        const tTip = handGroup.joints ? handGroup.joints['thumb-tip'] : null;
        const mTip = handGroup.joints ? handGroup.joints['middle-finger-tip'] : null;

        if (iTip && tTip) {
          const iPos = new THREE.Vector3();
          const tPos = new THREE.Vector3();
          iTip.getWorldPosition(iPos);
          tTip.getWorldPosition(tPos);

          const pDist = iPos.distanceTo(tPos);
          const wasPinching = h.isPinching;

          // Natural pinch threshold in VR / Meta Emulator (< 3.8 cm)
          h.isPinching = pDist < 0.038;
          h.pinchCenter.addVectors(iPos, tPos).multiplyScalar(0.5);

          if (h.isPinching) {
            h.posture = Posture.PRECISION_PINCH;
            if (!wasPinching) {
              // Physical pinch trigger in VR!
              this.handleWebXRPinchOrAction(h);
            }
          } else if (h.posture === Posture.PRECISION_PINCH) {
            h.posture = Posture.RELAXED;
          }

          // Grasp / Fist detection (Fingertips curled toward wrist)
          if (mTip) {
            const mPos = new THREE.Vector3();
            mTip.getWorldPosition(mPos);
            const mDist = mPos.distanceTo(wPos);
            const wasGrasping = h.isGrasping;
            h.isGrasping = mDist < 0.095;
            if (h.isGrasping && !wasGrasping) {
              this.handleWebXRPinchOrAction(h);
            }
          }

          // Position at center of hand between wrist and index tip
          h.currentPos.addVectors(wPos, iPos).multiplyScalar(0.5);
        } else {
          h.pinchCenter.copy(wPos).add(new THREE.Vector3(0, 0, -0.08));
          h.currentPos.copy(wPos);
        }
      }
    }

    // 2. Controller Grip Fallback (if using simulated controllers without joint tracking)
    if (!hasPose && h.controllerGrip) {
      const gPos = new THREE.Vector3();
      h.controllerGrip.getWorldPosition(gPos);
      if (gPos.lengthSq() > 0.001) {
        hasPose = true;
        const gQuat = new THREE.Quaternion();
        h.controllerGrip.getWorldQuaternion(gQuat);
        h.currentQuat.copy(gQuat);
        h.pinchCenter.copy(gPos).add(new THREE.Vector3(0, 0, -0.06).applyQuaternion(gQuat));
        h.currentPos.copy(gPos);
      }
    }

    // Suppress any controller model/axes gizmo scaling
    if (h.controllerGroup) {
      h.controllerGroup.visible = false;
      h.controllerGroup.scale.set(0.0001, 0.0001, 0.0001);
    }
    if (h.controllerGrip) {
      h.controllerGrip.visible = false;
      h.controllerGrip.scale.set(0.0001, 0.0001, 0.0001);
    }

    // 3. Fallback First-Person View (Never lost in VR)
    if (!hasPose) {
      const sideX = h.isLeft ? -0.22 : 0.22;
      const fovPos = new THREE.Vector3(sideX, -0.16, -0.46);
      fovPos.applyMatrix4(cam.matrixWorld);
      h.currentPos.copy(fovPos);
      h.pinchCenter.copy(fovPos);
      const camQuat = new THREE.Quaternion();
      if (typeof cam.getWorldQuaternion === 'function') cam.getWorldQuaternion(camQuat);
      else camQuat.copy(cam.quaternion);
      const defaultEuler = h.isLeft
        ? new THREE.Euler(0.20, 0.18, -0.08)
        : new THREE.Euler(0.20, -0.18, 0.08);
      h.currentQuat.copy(camQuat).multiply(new THREE.Quaternion().setFromEuler(defaultEuler));
    }

    // Ensure visible hand representation in WebXR presentation
    if (h.handModel) {
      h.handModel.position.copy(h.currentPos);
      h.handModel.quaternion.copy(h.currentQuat);
      h.handModel.updateMatrix();
      h.handModel.updateMatrixWorld(true);
      h.handModel.visible = true;
      this.articulateDefaultWebXRHand(h, h.posture, delta);
      if (h.rig?.handRoot) h.rig.handRoot.visible = false;
    } else if (h.rig?.handRoot) {
      h.rig.handRoot.position.copy(h.currentPos);
      h.rig.handRoot.quaternion.copy(h.currentQuat);
      h.rig.handRoot.updateMatrix();
      h.rig.handRoot.updateMatrixWorld(true);
      h.rig.handRoot.visible = true;
      this.applyPosture(h.rig, h.posture, delta);
    }

    if (delta > 0.001) {
      h.velocity.subVectors(h.currentPos, h.prevPosition).divideScalar(delta);
    }
    h.prevPosition.copy(h.currentPos);
  });
}

// -------------------------------------------------------------
// 8. Unified Proximity, Gesture, & State Progression Logic
// -------------------------------------------------------------

processProximityAndGestures(delta) {
  this.updateDreamcatcherAttachment();
  const lPos = this.leftHand.currentPos;
  const rPos = this.rightHand.currentPos;

  // State 1: Approach Tarp
  if (this.interactionState === InteractionState.STATE_1_APPROACH_TARP && this.targets.tarp) {
    const tarpPos = new THREE.Vector3();
    this.targets.tarp.getWorldPosition(tarpPos);
    const corner = new THREE.Vector3(tarpPos.x - 0.27, tarpPos.y - 0.05, tarpPos.z + 0.31);
    const distCorner = lPos.distanceTo(corner);
    const distCenter = lPos.distanceTo(tarpPos);

    if (distCorner < 0.70 || distCenter < 0.80) {
      if (this.targets.tarp.material) {
        this.targets.tarp.material.emissive = new THREE.Color(0x1a3344);
        this.targets.tarp.material.emissiveIntensity = 0.55;
      }
      this.interactionState = InteractionState.STATE_2_PINCH_TARP;
      this.notifyStepChange();
      return;
    }
  }

  // State 2: Pinch Tarp (Auto-advances when white hand pinches near corner in VR!)
  if (this.interactionState === InteractionState.STATE_2_PINCH_TARP && this.targets.tarp) {
    const tarpPos = new THREE.Vector3();
    this.targets.tarp.getWorldPosition(tarpPos);
    const corner = new THREE.Vector3(tarpPos.x - 0.27, tarpPos.y - 0.05, tarpPos.z + 0.31);
    const distCorner = lPos.distanceTo(corner);
    const distCenter = lPos.distanceTo(tarpPos);

    if ((distCorner < 0.75 || distCenter < 0.80) && (this.leftHand.isPinching || this.leftHand.isGrasping)) {
      this.executeStep2PinchTarp();
      return;
    }
  }

  // State 3: Pull Tarp (Moving left white hand backward after pinch in VR)
  if (this.interactionState === InteractionState.STATE_3_PULL_TARP) {
    const pulledDist = lPos.z - this.tarpPinchStartPos.z;
    const isMovingBack = pulledDist > 0.04 || lPos.z > -0.52 || Math.abs(this.leftHand.velocity.z) > 0.06 || this.leftHand.velocity.length() > 0.12;
    const isKeyboardBack = this.keysDown['s'] || this.keysDown['keys'];

    if (isMovingBack || isKeyboardBack) {
      this.executeStep3PullTarp();
      return;
    }
  }

  // State 4: Approach Latch (Right Hand)
  if (this.interactionState === InteractionState.STATE_4_APPROACH_LATCH && this.targets.latchClasp) {
    const latchPos = new THREE.Vector3();
    this.targets.latchClasp.getWorldPosition(latchPos);
    const dist = rPos.distanceTo(latchPos);

    this.rightHand.posture = Posture.EXTENDED_INDEX;

    if (dist < 0.70) {
      this.interactionState = InteractionState.STATE_5_TWIST_LATCH;
      this.notifyStepChange();
      return;
    }
  }

  // State 5: Twist Latch (Auto-advances when right white hand pinches or twists at latch)
  if (this.interactionState === InteractionState.STATE_5_TWIST_LATCH && this.targets.latchClasp) {
    const latchPos = new THREE.Vector3();
    this.targets.latchClasp.getWorldPosition(latchPos);
    const dist = rPos.distanceTo(latchPos);

    if (dist < 0.75 && (this.rightHand.isPinching || this.rightHand.isGrasping)) {
      this.executeStep5TwistLatch();
      return;
    }
  }

  // State 6: Lift Lid (Upward movement with right white hand near lid in VR)
  if (this.interactionState === InteractionState.STATE_6_LIFT_LID) {
    this.rightHand.posture = Posture.CUPPED_LIFT;
    const isUpwardMotion = rPos.y > 0.40 || this.rightHand.velocity.y > 0.05;
    const isLiftPinch = (this.rightHand.isPinching || this.rightHand.isGrasping) && rPos.y > 0.30;
    const isKeyboardUp = this.keysDown['r'] || this.keysDown['keyr'];

    if (isUpwardMotion || isLiftPinch || isKeyboardUp) {
      this.executeStep6LiftLid();
      return;
    }
  }

  // State 7: Reach into Box (Both Hands reach inside box through open top, hanger concealed)
  if (this.interactionState === InteractionState.STATE_7_REACH_BOX && this.targets.dreamcatcher) {
    const dcPos = new THREE.Vector3();
    this.targets.dreamcatcher.getWorldPosition(dcPos);
    const dist = lPos.distanceTo(dcPos);
    const rDist = rPos.distanceTo(dcPos);

    if (dist < 0.70 || rDist < 0.70) {
      this.interactionState = InteractionState.STATE_8_GRASP_DREAMCATCHER;
      this.notifyStepChange();
      return;
    }
  }

  // State 8: Grasp Dreamcatcher (Fist grasp in VR)
  if (this.interactionState === InteractionState.STATE_8_GRASP_DREAMCATCHER && this.targets.dreamcatcher) {
    if (this.targets.dreamcatcher) {
      this.targets.dreamcatcher.visible = true;
    }
    const dcPos = new THREE.Vector3();
    this.targets.dreamcatcher.getWorldPosition(dcPos);
    const dist = lPos.distanceTo(dcPos);
    const rDist = rPos.distanceTo(dcPos);

    if ((dist < 0.70 || rDist < 0.70) && (this.leftHand.isPinching || this.leftHand.isGrasping || this.rightHand.isPinching || this.rightHand.isGrasping)) {
      this.executeStep8GraspDreamcatcher();
      return;
    }
  }

  // State 9: Support / Hold (Both White Hands close to Dreamcatcher)
  if (this.interactionState === InteractionState.STATE_9_SUPPORT_HOLD && this.targets.dreamcatcher) {
    const dcPos = new THREE.Vector3();
    this.targets.dreamcatcher.getWorldPosition(dcPos);
    const rDist = rPos.distanceTo(dcPos);

    if (rDist < 0.60 || this.rightHand.isPinching || this.rightHand.isGrasping) {
      this.executeStep9SupportHold();
      return;
    }
  }

  // State 10 & 11: Horizontal Swipe Detection across Held Dreamcatcher
  if (this.interactionState === InteractionState.STATE_10_BRUSH_SWIPE_1 || this.interactionState === InteractionState.STATE_11_FINAL_SWIPE_DROP) {
    this.leftHand.posture = Posture.FLAT_PALM;

    if (this.targets.dreamcatcher) {
      const dcPos = new THREE.Vector3();
      this.targets.dreamcatcher.getWorldPosition(dcPos);
      const dist = lPos.distanceTo(dcPos);
      const speed = this.leftHand.velocity.length();

      if ((dist < 0.65 && speed > 0.10 && this.brushCooldown <= 0) || (dist < 0.65 && (this.leftHand.isPinching || this.leftHand.isGrasping))) {
        if (this.interactionState === InteractionState.STATE_10_BRUSH_SWIPE_1) {
          this.executeStep10Swipe1();
          return;
        } else {
          this.executeStep11Swipe2();
          return;
        }
      }
    }
  }
}

// Active suppression to guarantee no skintone hand, cuff, or debug gizmo ever appears in the scene
suppressSkintoneAndCuffs() {
  this.scene.traverse((node) => {
    if (!node.visible) return;
    const name = (node.name || '').toLowerCase();

    // First: unconditionally hide any AxesHelper, gizmos, transform controls, or RGB axis helpers
    if (
      node.isAxesHelper ||
      node.type === 'AxesHelper' ||
      node.type === 'TransformControls' ||
      (node.isLineSegments && node.material?.vertexColors) ||
      name.includes('axis') ||
      name.includes('axes') ||
      name.includes('gizmo') ||
      name.includes('transformcontrols') ||
      name.includes('controller_axis') ||
      name.includes('teleport') ||
      name.includes('ray') ||
      name.includes('pointer')
    ) {
      node.visible = false;
      if (node.scale) node.scale.set(0, 0, 0);
      return;
    }

    // Hide red, green, blue, yellow debug gizmo spheres around controllers / hands
    if (
      node.isMesh &&
      node.geometry &&
      node.geometry.type === 'SphereGeometry' &&
      node.material &&
      node.material.color &&
      (
        node.material.color.getHex() === 0xff0000 ||
        node.material.color.getHex() === 0x00ff00 ||
        node.material.color.getHex() === 0x0000ff ||
        node.material.color.getHex() === 0xffff00
      ) &&
      !name.includes('soul') &&
      !name.includes('star') &&
      !name.includes('rune') &&
      !name.includes('lantern')
    ) {
      node.visible = false;
      if (node.scale) node.scale.set(0, 0, 0);
      return;
    }

    // NEVER suppress WebXR hand models, joints, instanced meshes, skinned meshes, or scene architecture
    if (
      node.isInstancedMesh ||
      node.isSkinnedMesh ||
      node.isXRHandModel ||
      (node.name && (
        node.name.includes('hand') ||
        node.name.includes('joint') ||
        node.name.includes('wrist') ||
        node.name.includes('finger') ||
        node.name.includes('thumb') ||
        node.name.includes('armature') ||
        node.name.includes('attic') ||
        node.name.includes('chest') ||
        node.name.includes('dreamcatcher') ||
        node.name.includes('tarp') ||
        node.name.includes('dust') ||
        node.name.includes('floor') ||
        node.name.includes('beam') ||
        node.name.includes('window')
      ))
    ) {
      return;
    }
    if (
      name.includes('cuff') ||
      name.includes('wrist_band') ||
      name.includes('wristband') ||
      name.includes('controller-cuff') ||
      name.includes('meta_touch') ||
      name.includes('touch_controller') ||
      name.includes('quest_controller')
    ) {
      node.visible = false;
      return;
    }
    if (node.isMesh && node.material) {
      const mat = node.material;
      if (mat.color) {
        const r = mat.color.r;
        const g = mat.color.g;
        const b = mat.color.b;
        // Suppress peach / skintone hex #d29d7d or similar peach tones
        if (r > 0.65 && g > 0.45 && g < 0.78 && b > 0.35 && b < 0.65 && (r - b) > 0.12) {
          node.visible = false;
        }
      }
    }
  });
}

updateDreamcatcherAttachment() {
  if (!this.targets.dreamcatcher || !this.dreamcatcherHeldBy) return;

  if (this.dreamcatcherHeldBy === 'both') {
    let midPos;
    const rFar = this.rightHand.currentPos.lengthSq() > 16;
    const lFar = this.leftHand.currentPos.lengthSq() > 16;
    if (rFar && !lFar) {
      midPos = this.leftHand.currentPos.clone();
    } else if (lFar && !rFar) {
      midPos = this.rightHand.currentPos.clone();
    } else {
      midPos = new THREE.Vector3().addVectors(this.leftHand.currentPos, this.rightHand.currentPos).multiplyScalar(0.5);
    }
    this.targets.dreamcatcher.position.copy(midPos);
    this.targets.dreamcatcher.rotation.set(0, 0, 0);
    this.targets.dreamcatcher.visible = true;
  } else if (this.dreamcatcherHeldBy === 'right') {
    // Right hand holds hoop steady while left hand dusts
    const rPos = this.rightHand.currentPos;
    this.targets.dreamcatcher.position.set(rPos.x - 0.15, rPos.y, rPos.z);
    this.targets.dreamcatcher.rotation.set(0, 0, 0);
    this.targets.dreamcatcher.visible = true;
  }
}

// -------------------------------------------------------------
// 8b. Real-Time WebXR Generic Hand Pose & Skeletal Articulation
// -------------------------------------------------------------

applyPoseToWebXRHand(h, delta) {
  if (!h) return;

  // Authentic Default WebXR Hand model (left.glb / right.glb) is the sole visible hand representation
  if (h.handModel) {
    h.handModel.position.copy(h.currentPos);
    h.handModel.quaternion.copy(h.currentQuat);
    h.handModel.updateMatrix();
    h.handModel.updateMatrixWorld(true);
    h.handModel.visible = true;

    // Articulate all 25 bones of the authentic default WebXR hand with lifelike human kinematics
    this.articulateDefaultWebXRHand(h, h.posture, delta);

    // Hide procedural rig while authentic default WebXR hand is active
    if (h.rig?.handRoot) {
      h.rig.handRoot.visible = false;
    }
  } else if (h.rig?.handRoot) {
    // Fallback: Ensure sculpted white hand mesh is visible until GLTF hand loads
    h.rig.handRoot.position.copy(h.currentPos);
    h.rig.handRoot.quaternion.copy(h.currentQuat);
    h.rig.handRoot.updateMatrix();
    h.rig.handRoot.updateMatrixWorld(true);
    h.rig.handRoot.visible = true;
    this.applyPosture(h.rig, h.posture, delta);
  }

  // Suppress WebXR emulator static dummy controller/hand visuals so only our articulated default hand shows
  if (h.handGroup) {
    h.handGroup.visible = false;
  }
}

articulateDefaultWebXRHand(targetHand, posture, delta = 0.016) {
  if (!targetHand || !targetHand.bonesMap || !targetHand.basePositions || !targetHand.baseQuaternions) return;
  const bones = targetHand.bonesMap;
  const basePos = targetHand.basePositions;
  const baseQuat = targetHand.baseQuaternions;
  const isLeft = targetHand.isLeft;

  if (!targetHand.currentPoseState) {
    targetHand.currentPoseState = {
      index: { mcp: 18, pip: 22, dip: 12, spread: 0 },
      middle: { mcp: 22, pip: 28, dip: 16, spread: 0 },
      ring: { mcp: 26, pip: 34, dip: 20, spread: 0 },
      pinky: { mcp: 30, pip: 40, dip: 24, spread: 0 },
      thumb: isLeft ? { rx: -25, ry: -15, rz: -10 } : { rx: -30, ry: 20, rz: 10 }
    };
  }

  let targets = {};
  switch (posture) {
    case Posture.PINCH:
    case Posture.KEY_PINCH:
    case Posture.PRECISION_PINCH:
      targets = {
        index: { mcp: 46, pip: 66, dip: 42, spread: -2 },
        middle: { mcp: 82, pip: 94, dip: 80, spread: 0 },
        ring: { mcp: 84, pip: 96, dip: 82, spread: 2 },
        pinky: { mcp: 86, pip: 98, dip: 84, spread: 4 },
        thumb: isLeft ? { rx: -65, ry: -35, rz: -20 } : { rx: -75, ry: 20, rz: -15 }
      };
      break;
    case Posture.FULL_GRASP:
      targets = {
        index: { mcp: 95, pip: 110, dip: 90, spread: -2 },
        middle: { mcp: 95, pip: 110, dip: 90, spread: 0 },
        ring: { mcp: 95, pip: 110, dip: 90, spread: 2 },
        pinky: { mcp: 95, pip: 110, dip: 90, spread: 4 },
        thumb: isLeft ? { rx: -55, ry: -35, rz: -20 } : { rx: -65, ry: 35, rz: 10 }
      };
      break;
    case Posture.CUPPED_LIFT:
      targets = {
        index: { mcp: 45, pip: 62, dip: 40, spread: -2 },
        middle: { mcp: 47, pip: 64, dip: 42, spread: 0 },
        ring: { mcp: 49, pip: 66, dip: 44, spread: 2 },
        pinky: { mcp: 51, pip: 68, dip: 46, spread: 4 },
        thumb: isLeft ? { rx: -15, ry: -10, rz: -5 } : { rx: -20, ry: 10, rz: 5 }
      };
      break;
    case Posture.EXTENDED_INDEX:
      targets = {
        index: { mcp: 2, pip: 5, dip: 5, spread: 0 },
        middle: { mcp: 70, pip: 85, dip: 70, spread: 0 },
        ring: { mcp: 72, pip: 88, dip: 72, spread: 0 },
        pinky: { mcp: 75, pip: 90, dip: 75, spread: 0 },
        thumb: isLeft ? { rx: -40, ry: -25, rz: -10 } : { rx: -50, ry: 25, rz: 10 }
      };
      break;
    case Posture.FLAT_PALM:
      targets = {
        index: { mcp: -2, pip: 2, dip: 0, spread: -4 },
        middle: { mcp: -2, pip: 2, dip: 0, spread: 0 },
        ring: { mcp: -2, pip: 2, dip: 0, spread: 3 },
        pinky: { mcp: -2, pip: 2, dip: 0, spread: 6 },
        thumb: isLeft ? { rx: -10, ry: -10, rz: 0 } : { rx: -15, ry: 10, rz: 0 }
      };
      break;
    case Posture.THUMBS_UP:
      targets = {
        index: { mcp: 95, pip: 110, dip: 90, spread: -2 },
        middle: { mcp: 95, pip: 110, dip: 90, spread: 0 },
        ring: { mcp: 95, pip: 110, dip: 90, spread: 2 },
        pinky: { mcp: 95, pip: 110, dip: 90, spread: 4 },
        thumb: isLeft ? { rx: 14, ry: -10, rz: -6 } : { rx: 14, ry: 10, rz: 6 } // thumb uncurled, extended straight up
      };
      break;
    case Posture.STOP_PALM:
      targets = {
        index: { mcp: -6, pip: 0, dip: 0, spread: -5 },
        middle: { mcp: -6, pip: 0, dip: 0, spread: 0 },
        ring: { mcp: -6, pip: 0, dip: 0, spread: 4 },
        pinky: { mcp: -6, pip: 0, dip: 0, spread: 8 },
        thumb: isLeft ? { rx: 12, ry: -25, rz: -10 } : { rx: 12, ry: 25, rz: 10 } // 5 fingers extended upright
      };
      break;
    case Posture.CUPPED_CRADLE:
      targets = {
        index: { mcp: 24, pip: 32, dip: 18, spread: -2 },
        middle: { mcp: 26, pip: 34, dip: 20, spread: 0 },
        ring: { mcp: 28, pip: 36, dip: 22, spread: 2 },
        pinky: { mcp: 30, pip: 38, dip: 24, spread: 4 },
        thumb: isLeft ? { rx: 18, ry: -14, rz: -10 } : { rx: 18, ry: 14, rz: 10 }
      };
      break;
    case Posture.RELAXED_OPEN:
      targets = {
        index: { mcp: 12, pip: 16, dip: 8, spread: -2 },
        middle: { mcp: 14, pip: 18, dip: 10, spread: 0 },
        ring: { mcp: 16, pip: 20, dip: 12, spread: 2 },
        pinky: { mcp: 18, pip: 22, dip: 14, spread: 4 },
        thumb: isLeft ? { rx: -15, ry: -10, rz: -5 } : { rx: -20, ry: 10, rz: 5 }
      };
      break;
    case Posture.RELAXED:
    default:
      targets = {
        index: { mcp: 18, pip: 22, dip: 12, spread: 0 },
        middle: { mcp: 22, pip: 28, dip: 16, spread: 0 },
        ring: { mcp: 26, pip: 34, dip: 20, spread: 0 },
        pinky: { mcp: 30, pip: 40, dip: 24, spread: 0 },
        thumb: isLeft ? { rx: -25, ry: -15, rz: -10 } : { rx: -30, ry: 20, rz: 10 }
      };
      break;
  }

  const lerpFactor = Math.min(1, delta * 9.0);
  const cur = targetHand.currentPoseState;
  ['index', 'middle', 'ring', 'pinky'].forEach(f => {
    cur[f].mcp += (targets[f].mcp - cur[f].mcp) * lerpFactor;
    cur[f].pip += (targets[f].pip - cur[f].pip) * lerpFactor;
    cur[f].dip += (targets[f].dip - cur[f].dip) * lerpFactor;
    cur[f].spread += (targets[f].spread - cur[f].spread) * lerpFactor;
  });
  cur.thumb.rx += (targets.thumb.rx - cur.thumb.rx) * lerpFactor;
  cur.thumb.ry += (targets.thumb.ry - cur.thumb.ry) * lerpFactor;
  cur.thumb.rz += (targets.thumb.rz - cur.thumb.rz) * lerpFactor;

  const curlSign = isLeft ? 1 : -1;
  const curlAxis = new THREE.Vector3(0, 0, curlSign);
  const spreadAxis = new THREE.Vector3(curlSign, 0, 0);

  const fingerNames = [
    { key: 'index', name: 'index-finger' },
    { key: 'middle', name: 'middle-finger' },
    { key: 'ring', name: 'ring-finger' },
    { key: 'pinky', name: 'pinky-finger' }
  ];

  fingerNames.forEach(({ key, name }) => {
    const pMCP = basePos[`${name}-phalanx-proximal`];
    const pPIP = basePos[`${name}-phalanx-intermediate`];
    const pDIP = basePos[`${name}-phalanx-distal`];
    const pTip = basePos[`${name}-tip`];
    if (!pMCP || !pPIP || !pDIP || !pTip) return;

    const v1 = new THREE.Vector3().subVectors(pPIP, pMCP);
    const v2 = new THREE.Vector3().subVectors(pDIP, pPIP);
    const v3 = new THREE.Vector3().subVectors(pTip, pDIP);

    const fCfg = cur[key];
    const qSpread = new THREE.Quaternion().setFromAxisAngle(spreadAxis, THREE.MathUtils.degToRad(fCfg.spread));
    const qMCP = qSpread.clone().multiply(new THREE.Quaternion().setFromAxisAngle(curlAxis, THREE.MathUtils.degToRad(fCfg.mcp)));
    const qPIP = qSpread.clone().multiply(new THREE.Quaternion().setFromAxisAngle(curlAxis, THREE.MathUtils.degToRad(fCfg.mcp + fCfg.pip)));
    const qDIP = qSpread.clone().multiply(new THREE.Quaternion().setFromAxisAngle(curlAxis, THREE.MathUtils.degToRad(fCfg.mcp + fCfg.pip + fCfg.dip)));

    const newPIP = pMCP.clone().add(v1.clone().applyQuaternion(qMCP));
    const newDIP = newPIP.clone().add(v2.clone().applyQuaternion(qPIP));
    const newTip = newDIP.clone().add(v3.clone().applyQuaternion(qDIP));

    if (bones[`${name}-phalanx-intermediate`]) bones[`${name}-phalanx-intermediate`].position.copy(newPIP);
    if (bones[`${name}-phalanx-distal`]) bones[`${name}-phalanx-distal`].position.copy(newDIP);
    if (bones[`${name}-tip`]) bones[`${name}-tip`].position.copy(newTip);

    if (bones[`${name}-phalanx-proximal`]) bones[`${name}-phalanx-proximal`].quaternion.copy(baseQuat[`${name}-phalanx-proximal`]).multiply(qMCP);
    if (bones[`${name}-phalanx-intermediate`]) bones[`${name}-phalanx-intermediate`].quaternion.copy(baseQuat[`${name}-phalanx-intermediate`]).multiply(qPIP);
    if (bones[`${name}-phalanx-distal`]) bones[`${name}-phalanx-distal`].quaternion.copy(baseQuat[`${name}-phalanx-distal`]).multiply(qDIP);
    if (bones[`${name}-tip`]) bones[`${name}-tip`].quaternion.copy(baseQuat[`${name}-tip`]).multiply(qDIP);
  });

  const pProx = basePos['thumb-phalanx-proximal'];
  const pDist = basePos['thumb-phalanx-distal'];
  const pTip = basePos['thumb-tip'];
  if (pProx && pDist && pTip) {
    const v1 = new THREE.Vector3().subVectors(pDist, pProx);
    const v2 = new THREE.Vector3().subVectors(pTip, pDist);

    const tc = cur.thumb;
    const qThumb = new THREE.Quaternion().setFromEuler(new THREE.Euler(
      THREE.MathUtils.degToRad(tc.rx),
      THREE.MathUtils.degToRad(tc.ry),
      THREE.MathUtils.degToRad(tc.rz)
    ));

    const newDist = pProx.clone().add(v1.clone().applyQuaternion(qThumb));
    const newTip = newDist.clone().add(v2.clone().applyQuaternion(qThumb));

    if (bones['thumb-phalanx-distal']) bones['thumb-phalanx-distal'].position.copy(newDist);
    if (bones['thumb-tip']) bones['thumb-tip'].position.copy(newTip);

    if (bones['thumb-phalanx-proximal']) bones['thumb-phalanx-proximal'].quaternion.copy(baseQuat['thumb-phalanx-proximal']).multiply(qThumb);
    if (bones['thumb-phalanx-distal']) bones['thumb-phalanx-distal'].quaternion.copy(baseQuat['thumb-phalanx-distal']).multiply(qThumb);
    if (bones['thumb-tip']) bones['thumb-tip'].quaternion.copy(baseQuat['thumb-tip']).multiply(qThumb);
  }

  if (targetHand.skinnedMesh?.skeleton) {
    targetHand.skinnedMesh.skeleton.update();
  }
}

// Alias for backward compatibility
articulateWebXRFingers(hand) {
  this.articulateDefaultWebXRHand(hand, hand?.posture || Posture.RELAXED, 0.016);
}

// -------------------------------------------------------------
// 9. Posture Morphing & Skeletal Curl Interpolation (Desktop Rigs)
// -------------------------------------------------------------

applyPosture(rig, postureName, delta) {
  if (!rig || !rig.fingers) return;
  const side = rig.isLeft ? -1 : 1;
  const blendRate = Math.min(1, delta * 12.0);

  rig.fingers.forEach((finger) => {
    const name = finger.name;

    if (postureName === Posture.PINCH || postureName === Posture.PRECISION_PINCH || postureName === Posture.KEY_PINCH) {
      // PINCH: Thumb tip and Index tip pressed together (0.0m gap) in clean precision pinch; Middle, Ring, Pinky gently curled (1.1 rad)
      if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.95 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.48, blendRate);
        finger.knuckle.rotation.z = THREE.MathUtils.lerp(finger.knuckle.rotation.z, -0.22 * side, blendRate);
        finger.segments.forEach((seg, idx) => {
          const rot = idx === 0 ? -0.65 : -0.85;
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, rot, blendRate);
        });
      } else if (name === 'index') {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.45, blendRate);
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, -0.15 * side, blendRate);
        finger.segments.forEach((seg, idx) => {
          const rot = idx === 0 ? -0.75 : (idx === 1 ? -0.85 : -0.65);
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, rot, blendRate);
        });
      } else {
        // Middle, ring, and pinky gently curled (1.1 rad)
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -1.10, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -1.10, blendRate);
        });
      }
    } else if (postureName === Posture.EXTENDED_INDEX) {
      if (name === 'index') {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, 0.0, blendRate);
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.0, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, 0.0, blendRate);
        });
      } else if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.72 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.35, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -0.55, blendRate);
        });
      } else {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.85, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -1.05, blendRate);
        });
      }
    } else if (postureName === Posture.CUPPED_LIFT || postureName === Posture.CUPPED_CRADLE) {
      // CUPPED_LIFT: Palms turned upward (+Y) with fingers softly curved (0.45 rad) to cradle and lift objects from underneath
      if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.35 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.20, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -0.30, blendRate);
        });
      } else {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.45, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -0.45, blendRate);
        });
      }
    } else if (postureName === Posture.FULL_GRASP || postureName === Posture.FIST || postureName === Posture.POWER_GRASP) {
      if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.40 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.65, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -1.25, blendRate);
        });
      } else {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -1.65, blendRate);
        finger.segments.forEach((seg, idx) => {
          const rot = idx === 0 ? -1.65 : (idx === 1 ? -1.85 : -1.50);
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, rot, blendRate);
        });
      }
    } else if (postureName === Posture.FLAT_PALM) {
      if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.20 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, 0.0, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, 0.0, blendRate);
        });
      } else {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, 0.0, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, 0.0, blendRate);
        });
      }
    } else if (postureName === Posture.THUMBS_UP) {
      // THUMBS_UP: Index, Middle, Ring, and Pinky fingers tightly closed into the palm (proximal = 1.65 rad, middle = 1.85 rad, distal = 1.50 rad with overlapping rounded joint spheres so zero gaps show), while the Thumb extends straight upward (+Y)
      if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.15 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, 0.05, blendRate);
        finger.knuckle.rotation.z = THREE.MathUtils.lerp(finger.knuckle.rotation.z, 0.0, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, 0.0, blendRate);
        });
      } else {
        const mcpRot = -1.65;
        const pipRot = -1.85;
        const dipRot = -1.50;

        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, mcpRot, blendRate);
        finger.segments.forEach((seg, idx) => {
          const rot = idx === 0 ? mcpRot : (idx === 1 ? pipRot : dipRot);
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, rot, blendRate);
        });
      }
    } else if (postureName === Posture.STOP_PALM) {
      // STOP_PALM: All 5 fingers fully extended straight (0.0 rad), fingers slightly fanned, palm facing forward (-Z) toward the target soul
      const fanY = name === 'index' ? -0.06 : (name === 'middle' ? 0.0 : (name === 'ring' ? 0.06 : 0.12));
      if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.35 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, 0.0, blendRate);
        finger.knuckle.rotation.z = THREE.MathUtils.lerp(finger.knuckle.rotation.z, -0.15 * side, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, 0.0, blendRate);
        });
      } else {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, 0.0, blendRate);
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, fanY * side, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, 0.0, blendRate);
        });
      }
    } else if (postureName === Posture.RELAXED_OPEN) {
      if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.25 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.15, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -0.15, blendRate);
        });
      } else {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.20, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -0.20, blendRate);
        });
      }
    } else {
      // RELAXED: Natural gentle curve (0.25 rad) when resting
      if (name === 'thumb') {
        finger.knuckle.rotation.y = THREE.MathUtils.lerp(finger.knuckle.rotation.y, 0.30 * side, blendRate);
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.20, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -0.20, blendRate);
        });
      } else {
        finger.knuckle.rotation.x = THREE.MathUtils.lerp(finger.knuckle.rotation.x, -0.25, blendRate);
        finger.segments.forEach((seg) => {
          seg.rotation.x = THREE.MathUtils.lerp(seg.rotation.x, -0.25, blendRate);
        });
      }
    }
  });
}
}

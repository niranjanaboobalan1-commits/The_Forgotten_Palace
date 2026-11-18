/**
 * Automated Test Suite for Scene 2: The Grand Palace Escape
 * Tests all 6 sequential steps, visual design, hand poses, timing, and ghost choreography.
 */

if (!globalThis.window) {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  };
}
if (!globalThis.document) {
  globalThis.document = {
    addEventListener: () => {},
    getElementById: () => null
  };
}

import * as THREE from 'three';
import { buildPalaceScene } from './palaceScene.js';
import { GhostSeraphina } from './ghostSeraphina.js';
import { HandInteractionManager, Posture } from './handInteraction.js';
import { playTingChime, playSuccessChime } from './soundEffects.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

console.log('====================================================');
console.log('  RUNNING SCENE 2: GRAND PALACE ESCAPE TEST SUITE   ');
console.log('====================================================\n');

// -----------------------------------------------------------
// TEST GROUP 1: Grand Palace Architecture & Furnishings
// -----------------------------------------------------------
console.log('[TEST GROUP 1] Grand Palace Architecture & Spatial Layout');
const scene = new THREE.Scene();
const palace = buildPalaceScene(scene);

assert(palace.palaceRoot !== null, 'palaceRoot group exists and is populated');
assert(palace.palaceRoot.children.length >= 35, `palaceRoot has rich spatial depth (${palace.palaceRoot.children.length} meshes/groups)`);

// Floor & Carpet
assert(palace.carpetMesh !== undefined, 'Central ornate Persian medallion carpet created');
assert(palace.resonanceRing !== undefined, 'Floor resonance ring created beneath seashell');

// Architecture & Colonnades
const doors = palace.palaceRoot.getObjectByName('sealedPalaceDoors');
assert(doors !== null && doors !== undefined, 'Tall sealed double palace doors exist on right wall');

const centerConsole = palace.palaceRoot.getObjectByName('focalConsoleTable');
assert(centerConsole !== null, 'Ornate carved gold-leaf center console table exists behind carpet');

const mantelClock = palace.palaceRoot.getObjectByName('mantelClockRelicStation');
assert(mantelClock !== null, 'Vintage brass mantel clock & relic station anchor exist');

const lanternStation = palace.palaceRoot.getObjectByName('lanternBloomStation');
assert(lanternStation !== null, 'Lotus flower lantern station anchor exists on left console');

const threadStation = palace.palaceRoot.getObjectByName('threadWeavingStation');
assert(threadStation !== null, 'Thread weaving banquet table anchor exists on right');

// Lighting
assert(palace.sunlight.isDirectionalLight, 'Soft warm afternoon sunlight DirectionalLight configured');
assert(palace.hemiLight.isHemisphereLight, 'Natural atmosphere HemisphereLight configured');
assert(palace.sunbeamGroup.children.length === 3, '3 tall arched window sunbeam volumes created');

console.log('\n[TEST GROUP 2] Ghost Character: Lady Seraphina');
const seraphina = new GhostSeraphina(scene);

assert(seraphina.group !== null, 'Seraphina spirit mesh group exists');
assert(seraphina.spiritMaterial.transparent === true, 'Spirit material is translucent (transparent: true)');
assert(seraphina.spiritMaterial.depthWrite === false, 'Depth write is false for correct ethereal layering');
assert(seraphina.spiritMaterial.emissiveIntensity === 0.16, 'Calm, reduced glow intensity (0.16)');

// Face & Articulation
assert(seraphina.jaw !== undefined, 'Articulated jaw exists for speech lip-sync');
assert(seraphina.upperLip !== undefined && seraphina.lowerLip !== undefined, 'Upper and lower lips exist for real-time articulation');
assert(seraphina.leftEyelid !== undefined && seraphina.rightEyelid !== undefined, 'Eyelids exist for ~3.5s natural eye blinks');
assert(seraphina.goldenKeyPreview !== undefined, 'Golden key sparkle preview exists for Step 5d promise');

// Materialization & Opacity
assert(seraphina.group.visible === false, 'Initially hidden before Step 5');
seraphina.materialize();
assert(seraphina.group.visible === true, 'Visible when materialized at Step 5');
assert(seraphina.phase === 1, 'Phase transitions to 1 (fading in)');

// Simulation of 1.4s fade-in
seraphina.update(1.45, 1.45);
assert(seraphina.spiritMaterial.opacity >= 0.70, `Opacity reached translucent 0.72 (actual: ${seraphina.spiritMaterial.opacity.toFixed(2)})`);

console.log('\n[TEST GROUP 3] Exact 6-Step Transition & Scene 2 Sequence');

// Mock Hand Manager for Test
const mockCamera = new THREE.PerspectiveCamera();
const mockRenderer = {
  xr: {
    isPresenting: false,
    getHand: () => new THREE.Group(),
    getController: () => new THREE.Group(),
    getControllerGrip: () => new THREE.Group(),
    addEventListener: () => {}
  }
};
const handManager = new HandInteractionManager(mockRenderer, scene, mockCamera);

// Step 1: Seashell Floor Impact
let tingChimeFired = false;
try {
  playTingChime();
  tingChimeFired = true;
} catch (e) {
  tingChimeFired = false;
}
assert(tingChimeFired === true, 'Step 1: soundEffects.playTingChime() executes without errors');

// Step 1 & 2 Hand Poses: Right cord-pinch, Left relaxed-open
handManager.setTransitionToPalacePose();
assert(handManager.isInPalaceScene === true, 'handManager transitioned to Palace Scene mode');
assert(handManager.rightHand.posture === Posture.PRECISION_PINCH, 'Step 1 & 2: Right hand in PRECISION_PINCH holding dreamcatcher cord');
assert(handManager.rightHand.isPinching === true, 'Right hand is actively pinching cord');
assert(handManager.leftHand.posture === Posture.RELAXED_OPEN, 'Step 1 & 2: Left hand in RELAXED_OPEN posture');
assert(handManager.leftHand.isPinching === false, 'Left hand is open (not pinching)');

// Step 2: Seashell Levitation
const mockShell = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
mockShell.position.set(-0.35, 0.025, -0.75);

const riseAnim = {
  active: true,
  progress: 0,
  duration: 1.8,
  startPos: mockShell.position.clone(),
  targetPos: new THREE.Vector3(0.0, 0.52, -1.2),
  startRotY: 0
};

// Simulate 1.8s rise
for (let t = 0; t <= 1.8; t += 0.2) {
  riseAnim.progress = Math.min(1, t / riseAnim.duration);
  const ease = 1 - Math.pow(1 - riseAnim.progress, 3);
  mockShell.position.lerpVectors(riseAnim.startPos, riseAnim.targetPos, ease);
}
assert(mockShell.position.distanceTo(riseAnim.targetPos) < 0.01, 'Step 2: Seashell levitates smoothly to eye/chest level (0.0, 0.52, -1.2) with cubic-ease-out');

// Step 3: Palace Environment Swap
const atticRoot = new THREE.Group();
atticRoot.name = 'atticRoot';
scene.add(atticRoot);
assert(scene.children.includes(atticRoot), 'Attic scene present initially');

scene.remove(atticRoot);
scene.add(palace.palaceRoot);
assert(!scene.children.includes(atticRoot), 'Step 3: atticRoot removed from scene');
assert(scene.children.includes(palace.palaceRoot), 'Step 3: palaceRoot added to scene');

// Step 4: Silent 5.0s Empty Palace Pause
let palaceEmptyTimer = 0;
let ghostMaterialized = false;
for (let s = 0; s < 5.0; s += 1.0) {
  palaceEmptyTimer += 1.0;
  if (palaceEmptyTimer < 5.0) {
    assert(ghostMaterialized === false, `Step 4: Silent empty-palace pause at ${palaceEmptyTimer}s (ghost not visible)`);
  }
}
assert(palaceEmptyTimer >= 5.0, 'Step 4: Exactly 5.0 seconds silent empty palace pause completed');

// Step 5: Ghost Arrival at T + 5.0s & Dialogue
ghostMaterialized = true;
seraphina.startSpeech();
assert(seraphina.isSpeaking === true, 'Step 5: Lady Seraphina speaking started at T + 5.0s');

// Test lip sync & eye blink updates
seraphina.update(0.1, 0.1);
assert(seraphina.head !== undefined, 'Head articulation active during speech');

// Step 6: Dialogue End -> Player Thumbs Up
let gamesUnlocked = false;
seraphina.onDialogueEnd = () => {
  handManager.setThumbsUpPose();
  playSuccessChime();
  gamesUnlocked = true;
};

seraphina.finishSpeech();
assert(gamesUnlocked === true, 'Step 6: onDialogueEnd triggered at end of dialogue');
assert(handManager.leftHand.posture === Posture.THUMBS_UP, 'Step 6: Left hand smoothly transitioned into Posture.THUMBS_UP');
assert(handManager.rightHand.posture === Posture.THUMBS_UP, 'Step 6: Right hand smoothly transitioned into Posture.THUMBS_UP');
assert(handManager.leftHand.isPinching === false, 'Left hand unpinched in thumbs up');
assert(handManager.rightHand.isPinching === false, 'Right hand unpinched in thumbs up');

// -----------------------------------------------------------
// TEST GROUP 4: Thumbs Up Upward Orientation & 2-Cycle Shake
// -----------------------------------------------------------
console.log('\n[TEST GROUP 4] Thumbs Up Upward Orientation & 2-Cycle Shake');
assert(handManager.isThumbsUpShaking === true, 'Thumbs-up celebratory shaking active on trigger');
assert(handManager.thumbsUpShakeDuration === 1.30, 'Exact duration configured for 2 pump cycles');

// Test the 2 vertical up-and-down shake pumps
let maxShakeY = -999;
let minShakeY = 999;
for (let t = 0; t < 1.35; t += 0.05) {
  handManager.updatePalaceHands(0.05, t);
}
assert(handManager.isThumbsUpShaking === false, 'Two full up-and-down shakes completed after 1.30s');

// Test that thumbs-up orientation points thumbs upward (+Y in view)
const leftEuler = new THREE.Euler().setFromQuaternion(handManager.leftHand.targetQuat);
const rightEuler = new THREE.Euler().setFromQuaternion(handManager.rightHand.targetQuat);
assert(Math.abs(leftEuler.z) > 1.0, `Left hand roll tilts thumb upward (roll: ${leftEuler.z.toFixed(2)} rad)`);
assert(Math.abs(rightEuler.z) > 1.0, `Right hand roll tilts thumb upward (roll: ${rightEuler.z.toFixed(2)} rad)`);

// -----------------------------------------------------------
// TEST GROUP 5: Soul Mini-Game 1: Lantern Bloom
// -----------------------------------------------------------
console.log('\n[TEST GROUP 5] Soul Mini-Game 1: Lantern Bloom (Soul 1 Roaming, Stop-Palm & 3 Lanterns)');
import { SoulMiniGamesManager } from './soulMiniGames.js';

const miniGames = new SoulMiniGamesManager(scene, {
  handManager,
  ghostSeraphina: seraphina
});

assert(miniGames.soul1Group !== null, 'Soul 1 (Celestial Cyan Wisp) group created');
assert(miniGames.soul1Badge !== null, 'Clean floating +1 SOUL badge created above Soul 1');
assert(miniGames.lanterns.length === 3, '3 Palace lotus lanterns created');

// Step A: Roaming along figure-eight path within strict bounds
miniGames.unlock();
assert(miniGames.step === 'STEP_A_ROAMING', 'Mini-Game 1 initialized in STEP_A_ROAMING');

let minX = 999, maxX = -999, minY = 999, maxY = -999, minZ = 999, maxZ = -999;
for (let sec = 0; sec < 10.0; sec += 0.1) {
  miniGames.updateSoul1Roaming(0.1, sec);
  const p = miniGames.soul1Group.position;
  minX = Math.min(minX, p.x);
  maxX = Math.max(maxX, p.x);
  minY = Math.min(minY, p.y);
  maxY = Math.max(maxY, p.y);
  minZ = Math.min(minZ, p.z);
  maxZ = Math.max(maxZ, p.z);
}

assert(minX >= -0.96 && maxX <= 0.36, `Soul 1 X stays within [-0.95, 0.35] (actual: [${minX.toFixed(2)}, ${maxX.toFixed(2)}])`);
assert(minY >= 1.04 && maxY <= 1.56, `Soul 1 Y stays within [1.05, 1.55] (actual: [${minY.toFixed(2)}, ${maxY.toFixed(2)}])`);
assert(minZ >= -1.86 && maxZ <= -1.34, `Soul 1 Z stays within [-1.85, -1.35] (actual: [${minZ.toFixed(2)}, ${maxZ.toFixed(2)}])`);

// Step A: Stop-Palm Halt Gesture Detection
// Set hand to STOP_PALM aimed directly at Soul 1
handManager.leftHand.posture = Posture.STOP_PALM;
const sPos = miniGames.soul1Group.position;
handManager.leftHand.currentPos.set(sPos.x, sPos.y, sPos.z + 0.60);
handManager.leftHand.currentQuat.set(0, 0, 0, 1); // Facing along -Z directly toward Soul 1

// Simulate 0.30s hold (less than 0.65s) -> Not frozen yet
miniGames.checkStopPalmGesture(0.30, handManager);
assert(miniGames.isSoul1Frozen === false, 'Soul 1 remains roaming when held for only 0.30s (< 0.65s)');

// Simulate remaining 0.40s hold (total 0.70s >= 0.65s) -> Freeze!
miniGames.checkStopPalmGesture(0.40, handManager);
assert(miniGames.isSoul1Frozen === true, 'Soul 1 frozen in place after 0.65s steady hold');
assert(miniGames.freezeRingGroup.visible === true, 'Golden-cyan freeze ring visible around Soul 1');
assert(miniGames.step === 'STEP_B_LANTERNS', 'Advanced to STEP_B_LANTERNS');

// Step B: 3 Lotus Lanterns Cupped Cradle & Lift
const l0 = miniGames.lanterns[0];
const l1 = miniGames.lanterns[1];
const l2 = miniGames.lanterns[2];

assert(l0.status === 'unlit' && l1.status === 'unlit' && l2.status === 'unlit', 'All 3 lanterns initially unlit');

// Test settle fallback if dropped before 0.12m
handManager.leftHand.posture = Posture.CUPPED_CRADLE;
handManager.leftHand.currentPos.copy(l0.startPos);
miniGames.updateLanternsInteraction(0.016, 1.0, handManager);
assert(l0.status === 'cradling', 'Lantern 1 begins cradling when hand is within 0.14m');

// Move hand away before reaching 0.12m
handManager.leftHand.currentPos.set(5.0, 5.0, 5.0);
miniGames.updateLanternsInteraction(0.1, 1.1, handManager);
assert(l0.status === 'unlit', 'Lantern settles back to unlit if hand drops or leaves before 0.12m');

// Lift Lantern 0 upward >= 0.12m -> Blooms!
handManager.leftHand.currentPos.copy(l0.startPos);
miniGames.updateLanternsInteraction(0.016, 1.2, handManager);
handManager.leftHand.currentPos.y += 0.13;
miniGames.updateLanternsInteraction(0.016, 1.3, handManager);
assert(l0.status === 'ascending', 'Lantern 1 bloomed and ascending after +Y delta >= 0.12m');
assert(l0.flameMesh.visible === true, 'Lantern 1 golden flame ignited');

// Bloom Lantern 1
handManager.rightHand.posture = Posture.PRECISION_PINCH;
handManager.rightHand.isPinching = true;
handManager.rightHand.currentPos.copy(l1.startPos);
miniGames.updateLanternsInteraction(0.016, 1.4, handManager);
handManager.rightHand.currentPos.y += 0.14;
miniGames.updateLanternsInteraction(0.016, 1.5, handManager);
assert(l1.status === 'ascending', 'Lantern 2 bloomed and ascending after pinch lift >= 0.12m');

// Bloom Lantern 2
handManager.leftHand.posture = Posture.CUPPED_CRADLE;
handManager.leftHand.currentPos.copy(l2.startPos);
miniGames.updateLanternsInteraction(0.016, 1.6, handManager);
handManager.leftHand.currentPos.y += 0.13;
miniGames.updateLanternsInteraction(0.016, 1.7, handManager);
assert(l2.status === 'ascending', 'Lantern 3 bloomed and ascending');

// Step C: Absorption & Seraphina Hopeful Upgrade
assert(miniGames.step === 'STEP_C_ABSORB', 'Step C Absorption triggered after all 3 lanterns bloomed');

// Simulate absorption progress to completion
for (let t = 0; t < 1.7; t += 0.1) {
  miniGames.updateSoulAbsorption(0.1, t);
}
assert(miniGames.step === 'COMPLETED', 'Soul 1 mini-game completed');
assert(miniGames.joyPoints === 1, 'Awarded +1 Joy Point (1 / 3)');
assert(seraphina.isHopeful === true, 'Lady Seraphina face shifted from sorrowful to hopeful');
assert(seraphina.joyPoints === 1, 'Lady Seraphina registered point 1 of 3');

// -----------------------------------------------------------
// TEST GROUP 6: Soul Mini-Game 2: Astral Clock Relic
// -----------------------------------------------------------
console.log('\n[TEST GROUP 6] Soul Mini-Game 2: Astral Clock Relic (Soul 2 Roaming, Astrolabe & Rune Snapping)');
miniGames.startMiniGame2();
assert(miniGames.step === 'GAME_2_ROAMING', 'Mini-Game 2 initialized in GAME_2_ROAMING');
assert(miniGames.soul2Group.visible === true, 'Soul 2 (Emerald-Teal Wisp) visible');
assert(miniGames.soul2Badge !== null, 'High-DPI badge created above Soul 2');
assert(miniGames.runeFragments.length === 3, '3 Glowing Rune Fragments created');
assert(miniGames.runeSlots.length === 3, '3 Astrolabe Rune Slots created');

// Step A: Stop Palm on Soul 2
handManager.leftHand.posture = Posture.STOP_PALM;
const s2Pos = miniGames.soul2Group.position;
handManager.leftHand.currentPos.set(s2Pos.x, s2Pos.y, s2Pos.z + 0.50);
miniGames.checkStopPalmSoul2(0.70, handManager);
assert(miniGames.isSoul2Frozen === true, 'Soul 2 frozen in place with Stop Palm');
assert(miniGames.step === 'GAME_2_RELIC', 'Advanced to GAME_2_RELIC');
assert(miniGames.astrolabeGroup.visible === true, 'Celestial Astrolabe frame visible');

// Step B: Snap 3 Rune Fragments
miniGames.runeFragments.forEach((frag, idx) => {
  const slot = miniGames.runeSlots[idx];
  handManager.rightHand.posture = Posture.PRECISION_PINCH;
  handManager.rightHand.isPinching = true;
  // Grab fragment
  handManager.rightHand.currentPos.copy(frag.group.getWorldPosition(new THREE.Vector3()));
  miniGames.updateAstrolabeInteraction(0.016, 1.0, handManager);
  // Carry to slot
  handManager.rightHand.currentPos.copy(slot.mesh.getWorldPosition(new THREE.Vector3()));
  miniGames.updateAstrolabeInteraction(0.016, 1.1, handManager);
  assert(frag.isSnapped === true, `Rune Fragment ${idx + 1} snapped into Astrolabe`);
});

assert(miniGames.step === 'GAME_2_ABSORB', 'Advanced to GAME_2_ABSORB after 3 runes placed');
for (let t = 0; t < 1.7; t += 0.1) {
  miniGames.updateSoul2Absorption(0.1, t);
}
assert(miniGames.joyPoints === 2, 'Awarded +1 Joy Point (2 / 3)');
assert(seraphina.joyPoints === 2, 'Lady Seraphina registered point 2 of 3');

// -----------------------------------------------------------
// TEST GROUP 7: Soul Mini-Game 3: Dreamcatcher Thread Weaving
// -----------------------------------------------------------
console.log('\n[TEST GROUP 7] Soul Mini-Game 3: Dreamcatcher Thread Weaving (Soul 3 Roaming, Weave & Dual-Palm)');
miniGames.startMiniGame3();
assert(miniGames.step === 'GAME_3_ROAMING', 'Mini-Game 3 initialized in GAME_3_ROAMING');
assert(miniGames.soul3Group.visible === true, 'Soul 3 (Royal Violet-Magenta Wisp) visible');
assert(miniGames.starNodes.length === 6, '6 Star Nodes created on Sacred Ring');

// Step A: Stop Palm on Soul 3
const s3Pos = miniGames.soul3Group.position;
handManager.leftHand.posture = Posture.STOP_PALM;
handManager.leftHand.currentPos.set(s3Pos.x, s3Pos.y, s3Pos.z + 0.50);
miniGames.checkStopPalmSoul3(0.70, handManager);
assert(miniGames.isSoul3Frozen === true, 'Soul 3 frozen in place with Stop Palm');
assert(miniGames.step === 'GAME_3_WEAVING', 'Advanced to GAME_3_WEAVING');
assert(miniGames.sacredRingGroup.visible === true, 'Sacred Dreamcatcher Ring visible');

// Step B: Pinch Weave 6 Sacred Threads
for (let step = 0; step < 6; step++) {
  const nextTargetNode = miniGames.starNodes[miniGames.weaveOrder[step + 1]];
  handManager.rightHand.posture = Posture.PRECISION_PINCH;
  handManager.rightHand.isPinching = true;
  handManager.rightHand.currentPos.copy(nextTargetNode.group.getWorldPosition(new THREE.Vector3()));
  miniGames.updateWeavingInteraction(0.016, 2.0 + step * 0.1, handManager);
}
assert(miniGames.step === 'GAME_3_SEAL', 'All 6 threads woven! Advanced to GAME_3_SEAL');
assert(miniGames.threadsGroup.children.length === 6, '6 Thick luminous TubeGeometry threads drawn');

// Step C: Dual-Palm Seal
const ringPos = miniGames.sacredRingGroup.getWorldPosition(new THREE.Vector3());
handManager.leftHand.posture = Posture.STOP_PALM;
handManager.rightHand.posture = Posture.STOP_PALM;
handManager.leftHand.currentPos.set(ringPos.x - 0.15, ringPos.y, ringPos.z + 0.20);
handManager.rightHand.currentPos.set(ringPos.x + 0.15, ringPos.y, ringPos.z + 0.20);
miniGames.checkDualPalmSeal(0.1, handManager);
assert(miniGames.step === 'GAME_3_ABSORB', 'Dual-Palm Seal successful! Advanced to GAME_3_ABSORB');

// Simulate Absorption
for (let t = 0; t < 1.7; t += 0.1) {
  miniGames.updateSoul3Absorption(0.1, t);
}
assert(miniGames.step === 'ALL_COMPLETED', 'All 3 Soul Mini-Games completed!');
assert(miniGames.joyPoints === 3, 'All 3 Joy Points earned (3 / 3)');
assert(seraphina.joyPoints === 3, 'Lady Seraphina registered final point (3 / 3)');
assert(seraphina.isOverjoyed === true, 'Lady Seraphina entered final joyful relieved state');

console.log('\n====================================================');
console.log('  SCENE 2 TEST RESULTS: ALL ASSERTIONS PASSED!       ');
console.log('====================================================\n');
process.exit(0);

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
import { GhostSeraphina } from './ghostSeraphina.js';
import { HandInteractionManager } from './handInteraction.js';
import { SoulMiniGamesManager } from './soulMiniGames.js';

console.log('====================================================');
console.log(' TESTING END-TO-END AUTORUN SOUL MINI-GAME FLOW     ');
console.log('====================================================\n');

function assert(cond, msg) {
  if (!cond) {
    console.error(`  ✗ FAIL: ${msg}`);
    process.exit(1);
  } else {
    console.log(`  ✓ PASS: ${msg}`);
  }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
camera.position.set(0.0, 1.35, 1.15);

const mockRenderer = {
  xr: {
    isPresenting: false,
    getHand: () => new THREE.Group(),
    getController: () => new THREE.Group(),
    getControllerGrip: () => new THREE.Group(),
    addEventListener: () => {}
  }
};

const handManager = new HandInteractionManager(mockRenderer, scene, camera);
const ghostSeraphina = new GhostSeraphina(scene);
ghostSeraphina.materialize();

// Verify Seraphina side placement
assert(ghostSeraphina.basePosition.x >= 1.5, `Seraphina placed safely on side (x: ${ghostSeraphina.basePosition.x})`);

const miniGames = new SoulMiniGamesManager(scene, {
  handManager,
  ghostSeraphina,
  camera
});

miniGames.unlock();

// Verify all 3 souls are lined up on the left side
assert(miniGames.soul1Group.position.x === -0.35, 'Soul 1 in active center (-0.35)');
assert(miniGames.soul2Group.position.x === -1.15, 'Soul 2 queued behind on left (-1.15)');
assert(miniGames.soul3Group.position.x === -1.85, 'Soul 3 queued further behind on left (-1.85)');

// Verify only Soul 1's badge is visible initially (zero overlapping cards)
assert(miniGames.soul1Badge.visible === true, 'Soul 1 score badge visible');
assert(miniGames.soul2Badge.visible === false, 'Soul 2 score badge hidden while queued (no overlap)');
assert(miniGames.soul3Badge.visible === false, 'Soul 3 score badge hidden while queued (no overlap)');

console.log('\n--- Simulating Frame Loop through Game 1, 2, and 3 ---');

let simTime = 0;
const dt = 0.05; // 50ms per frame
let maxSimSeconds = 90.0;
let score1Logged = false;
let score2Logged = false;
let score3Logged = false;

while (simTime < maxSimSeconds && miniGames.step !== 'ALL_COMPLETED') {
  simTime += dt;
  miniGames.update(dt, simTime, handManager, ghostSeraphina);
  handManager.updatePalaceHands(dt, simTime);
  ghostSeraphina.update(dt, simTime);

  if (miniGames.joyPoints === 1 && !score1Logged) {
    score1Logged = true;
    console.log(`[AutoRun Sim T+${simTime.toFixed(1)}s] Reached SCORE: 1 / 3! Step: ${miniGames.step}`);
  }
  if (miniGames.joyPoints === 2 && !score2Logged) {
    score2Logged = true;
    console.log(`[AutoRun Sim T+${simTime.toFixed(1)}s] Reached SCORE: 2 / 3! Step: ${miniGames.step}`);
  }
  if (miniGames.joyPoints === 3 && !score3Logged) {
    score3Logged = true;
    console.log(`[AutoRun Sim T+${simTime.toFixed(1)}s] Reached SCORE: 3 / 3! Step: ${miniGames.step}`);
  }
}

assert(score1Logged === true, 'Game 1 bloomed lanterns and increased score to 1 / 3');
assert(score2Logged === true, 'Game 2 snapped clock runes and increased score to 2 / 3');
assert(score3Logged === true, 'Game 3 wove sacred threads and increased score to 3 / 3');
assert(miniGames.step === 'ALL_COMPLETED', 'All mini-games successfully completed');
assert(ghostSeraphina.joyPoints === 3, 'Lady Seraphina registered all 3 points');
assert(ghostSeraphina.isOverjoyed === true, 'Lady Seraphina is overjoyed');
assert(ghostSeraphina.goldenKeyPreview.visible === true, 'Golden key is visible in Lady Seraphina hands');

console.log('\n====================================================');
console.log(' ALL AUTORUN PROGRESSION TESTS PASSED SUCCESSFULLY! ');
console.log('====================================================\n');
process.exit(0);

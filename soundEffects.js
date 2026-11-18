/**
 * Procedural Web Audio API Sound Synthesizer
 * 100% standalone - requires zero external audio files.
 * Generates authentic antique wood creaks, cloth rustles, crystal chimes,
 * and golden resonance chords.
 */

let audioCtx = null;
let isUnlocked = false;

let masterBus = null;
let mediaStreamDest = null;

export function getMasterBus() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return null;
  if (!masterBus) {
    masterBus = audioCtx.createGain();
    masterBus.gain.setValueAtTime(1.0, audioCtx.currentTime);
    masterBus.connect(audioCtx.destination);
  }
  if (mediaStreamDest) {
    try { masterBus.connect(mediaStreamDest); } catch (_) {}
  }
  return masterBus;
}

export function getAudioStream() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return null;
  if (!mediaStreamDest) {
    mediaStreamDest = audioCtx.createMediaStreamDestination();
    if (masterBus) {
      try { masterBus.connect(mediaStreamDest); } catch (_) {}
    }
  }
  return mediaStreamDest.stream;
}

let atticHorrorMusicWanted = false;
const horrorMusicState = {
  isPlaying: false,
  masterGain: null,
  nodes: [],
  intervalId: null
};

export function initAudio() {
  if (isUnlocked && audioCtx) {
    return;
  }
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isUnlocked = true;
    console.log('[Audio] Procedural Web Audio initialized & unlocked');

    if (atticHorrorMusicWanted && !horrorMusicState.isPlaying) {
      startAtticHorrorMusic();
    }
  } catch (err) {
    console.warn('[Audio] Failed to initialize AudioContext:', err);
  }
}

// Auto-unlock on first interaction
if (typeof window !== 'undefined') {
  ['pointerdown', 'touchstart', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, () => initAudio(), { once: true, passive: true });
  });
}

/**
 * Procedural Tarp Rustle - Coarse canvas sliding friction
 */
export function playTarpRustle() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Bandpass-filtered white noise buffer
  const bufferSize = audioCtx.sampleRate * 0.45;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.15));
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(650, now);
  filter.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
  filter.frequency.exponentialRampToValueAtTime(320, now + 0.45);
  filter.Q.setValueAtTime(2.2, now);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(getMasterBus() || audioCtx.destination);

  noise.start(now);
  noise.stop(now + 0.48);
}

/**
 * Procedural Creak - Heavy antique wood & iron hinge groaning
 */
export function playCreak() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Dual detuned sawtooth oscillators with vibrato and friction modulation
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  osc1.type = 'sawtooth';
  osc2.type = 'triangle';

  // Pitch envelope for creaking hinge
  const baseFreq = 95;
  osc1.frequency.setValueAtTime(baseFreq, now);
  osc1.frequency.linearRampToValueAtTime(baseFreq + 35, now + 0.18);
  osc1.frequency.exponentialRampToValueAtTime(baseFreq - 15, now + 0.45);
  osc1.frequency.linearRampToValueAtTime(baseFreq + 60, now + 0.75);
  osc1.frequency.exponentialRampToValueAtTime(45, now + 1.1);

  osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
  osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.35);
  osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 1.1);

  // Highpass/Resonant filter to simulate wooden box body cavity resonance
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'peaking';
  filter.frequency.setValueAtTime(280, now);
  filter.Q.setValueAtTime(4.0, now);
  filter.gain.setValueAtTime(9.0, now);

  const mainGain = audioCtx.createGain();
  mainGain.gain.setValueAtTime(0.001, now);
  mainGain.gain.linearRampToValueAtTime(0.32, now + 0.1);
  mainGain.gain.linearRampToValueAtTime(0.22, now + 0.5);
  mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(mainGain);
  mainGain.connect(getMasterBus() || audioCtx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 1.2);
  osc2.stop(now + 1.2);
}

/**
 * Procedural Magic Shimmer - Ethereal cyan glow chime
 */
export function playMagicShimmer() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const notes = [1046.5, 1318.5, 1567.98, 2093.0, 2637.0]; // C6, E6, G6, C7, E7
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    const startTime = now + idx * 0.06;
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.linearRampToValueAtTime(freq * 1.02, startTime + 0.8);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

    osc.connect(gain);
    gain.connect(getMasterBus() || audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.3);
  });
}

/**
 * Procedural Brush Whoosh - Soft dusting swipe across feathers/hoop
 */
export function playBrushWhoosh() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const bufferSize = Math.floor(audioCtx.sampleRate * 0.3);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(350, now);
  filter.frequency.exponentialRampToValueAtTime(2200, now + 0.12);
  filter.frequency.exponentialRampToValueAtTime(450, now + 0.28);
  filter.Q.setValueAtTime(1.8, now);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMasterBus() || audioCtx.destination);

  source.start(now);
  source.stop(now + 0.32);
}

/**
 * Procedural Crisp High-Pitched Metallic/Crystal "Ting" Chime
 * Triggered immediately when seashell impacts the floorboards.
 */
export function playTingChime() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Dual high-frequency crystal/metallic bell harmonics (2637.0 Hz [E7] & 5274.0 Hz [E8])
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  const gain2 = audioCtx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2637.0, now);
  osc1.frequency.exponentialRampToValueAtTime(2610.0, now + 1.8);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(5274.0, now);
  osc2.frequency.exponentialRampToValueAtTime(5220.0, now + 1.2);

  // Sharp, crisp attack with long, crystalline exponential decay
  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.linearRampToValueAtTime(0.38, now + 0.003); // 3ms crisp attack
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.linearRampToValueAtTime(0.18, now + 0.002);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

  // Bandpass filter to sculpt pure crystalline sparkle
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3200, now);
  filter.Q.setValueAtTime(2.5, now);

  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(filter);
  gain2.connect(filter);
  filter.connect(getMasterBus() || audioCtx.destination);

  // Soft low thud for subtle wood floorboard contact
  const thud = audioCtx.createOscillator();
  const thudGain = audioCtx.createGain();
  thud.type = 'triangle';
  thud.frequency.setValueAtTime(140, now);
  thud.frequency.exponentialRampToValueAtTime(45, now + 0.12);
  thudGain.gain.setValueAtTime(0.15, now);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  thud.connect(thudGain);
  thudGain.connect(getMasterBus() || audioCtx.destination);

  osc1.start(now);
  osc2.start(now);
  thud.start(now);
  osc1.stop(now + 1.85);
  osc2.stop(now + 1.25);
  thud.stop(now + 0.15);
}

/**
 * Procedural Success Chime - Ascending major 6th triad chime
 * Triggered on dialogue completion & player thumbs up
 */
export function playSuccessChime() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    const startTime = now + idx * 0.10;
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.linearRampToValueAtTime(freq * 1.01, startTime + 1.2);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.24 / (idx + 1), startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

    osc.connect(gain);
    gain.connect(getMasterBus() || audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.7);
  });
}

/**
 * Procedural Shell Clink - Delicate ceramic seashell impact on wood
 */
export function playShellClink() {
  playTingChime();
}

/**
 * Procedural Golden Palace Transition Boom - Majestic resonant chord & wave
 */
export function playPalaceTransitionBoom() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Deep resonant bass swell
  const sub = audioCtx.createOscillator();
  const subGain = audioCtx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(73.42, now); // D2
  sub.frequency.exponentialRampToValueAtTime(55.0, now + 1.8);
  subGain.gain.setValueAtTime(0.001, now);
  subGain.gain.linearRampToValueAtTime(0.45, now + 0.25);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
  sub.connect(subGain);
  subGain.connect(getMasterBus() || audioCtx.destination);
  sub.start(now);
  sub.stop(now + 3.1);

  // Ethereal golden triad swell (D major 9th: F#4, A4, C#5, E5)
  const goldenFrequencies = [369.99, 440.0, 554.37, 659.25, 880.0];
  goldenFrequencies.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

    gain.gain.setValueAtTime(0.001, now + idx * 0.05);
    gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + idx * 0.05 + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    osc.connect(gain);
    gain.connect(getMasterBus() || audioCtx.destination);
    osc.start(now + idx * 0.05);
    osc.stop(now + 3.0);
  });
}

/**
 * Procedural Mild Horror Background Music for the Old Attic Scene
 * Layered ambient drone in D minor with breathing low-pass filter,
 * whistling draft wind, sub-bass suspense heartbeat swells, and
 * a sparse, haunting antique music box melody.
 */
export function startAtticHorrorMusic() {
  atticHorrorMusicWanted = true;
  if (!audioCtx) initAudio();
  if (!audioCtx || horrorMusicState.isPlaying) return;
  horrorMusicState.isPlaying = true;

  try {
    const now = audioCtx.currentTime;
    horrorMusicState.isPlaying = true;
    horrorMusicState.nodes = [];

    // Master volume for mild horror background ambience (subtle & atmospheric)
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.18, now + 3.0);
    masterGain.connect(getMasterBus() || audioCtx.destination);
    horrorMusicState.masterGain = masterGain;

    // 1. Low Ominous D-Minor Tension Drone
    const oscD2 = audioCtx.createOscillator();
    oscD2.type = 'sawtooth';
    oscD2.frequency.setValueAtTime(73.42, now); // D2

    const oscD2Detuned = audioCtx.createOscillator();
    oscD2Detuned.type = 'sawtooth';
    oscD2Detuned.frequency.setValueAtTime(73.88, now); // Slow 0.46 Hz beating shudder

    const oscF2 = audioCtx.createOscillator();
    oscF2.type = 'triangle';
    oscF2.frequency.setValueAtTime(87.31, now); // F2 (minor 3rd)

    const oscA2 = audioCtx.createOscillator();
    oscA2.type = 'sine';
    oscA2.frequency.setValueAtTime(110.0, now); // A2 (perfect 5th)

    const oscSub = audioCtx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(36.71, now); // D1 (sub-bass foundation)

    // Resonant lowpass filter for dark, muted, claustrophobic tone
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);
    filter.Q.setValueAtTime(3.2, now);

    // LFO that slowly breathes the filter cutoff up and down
    const filterLfo = audioCtx.createOscillator();
    filterLfo.frequency.setValueAtTime(0.075, now); // ~13s cycle
    const filterLfoGain = audioCtx.createGain();
    filterLfoGain.gain.setValueAtTime(65, now);
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);
    filterLfo.start(now);

    const droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.28, now);

    [oscD2, oscD2Detuned, oscF2, oscA2, oscSub].forEach((osc) => {
      osc.connect(filter);
      osc.start(now);
      horrorMusicState.nodes.push(osc);
    });
    filter.connect(droneGain);
    droneGain.connect(masterGain);
    horrorMusicState.nodes.push(filterLfo, filterLfoGain, filter, droneGain);

    // 2. Ghostly Cold Wind Draft Through Attic Floorboards
    const bufferSize = audioCtx.sampleRate * 2.0;
    const windBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const windData = windBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      windData[i] = (Math.random() * 2 - 1) * 0.45;
    }
    const windSource = audioCtx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(290, now);
    windFilter.Q.setValueAtTime(4.8, now);

    const windLfo = audioCtx.createOscillator();
    windLfo.frequency.setValueAtTime(0.055, now); // ~18s breathing cycle
    const windLfoGain = audioCtx.createGain();
    windLfoGain.gain.setValueAtTime(110, now);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    windLfo.start(now);

    const windGain = audioCtx.createGain();
    windGain.gain.setValueAtTime(0.065, now);
    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windSource.start(now);
    horrorMusicState.nodes.push(windSource, windFilter, windLfo, windLfoGain, windGain);

    // 3. Antique Music Box / Spooky Chime Melody (Periodic Eerie Motif)
    const melodyNotes = [587.33, 698.46, 830.61, 880.0, 698.46, 554.37, 587.33, 466.16];
    let noteIdx = 0;

    function playChimeNote(freq) {
      if (!horrorMusicState.isPlaying || !audioCtx) return;
      const t = audioCtx.currentTime;

      // Primary chime tone
      const chimeOsc = audioCtx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t);

      // Subtle metallic overtone (antique music box chime harmonic)
      const metallicOsc = audioCtx.createOscillator();
      metallicOsc.type = 'sine';
      metallicOsc.frequency.setValueAtTime(freq * 2.756, t);

      const chimeGain = audioCtx.createGain();
      chimeGain.gain.setValueAtTime(0.0001, t);
      chimeGain.gain.linearRampToValueAtTime(0.085, t + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.7);

      const metallicGain = audioCtx.createGain();
      metallicGain.gain.setValueAtTime(0.0001, t);
      metallicGain.gain.linearRampToValueAtTime(0.025, t + 0.015);
      metallicGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      chimeOsc.connect(chimeGain);
      metallicOsc.connect(metallicGain);
      chimeGain.connect(masterGain);
      metallicGain.connect(masterGain);

      chimeOsc.start(t);
      chimeOsc.stop(t + 2.8);
      metallicOsc.start(t);
      metallicOsc.stop(t + 0.9);

      // Every 4th note, trigger a soft deep heartbeat / floor creak resonance
      if (noteIdx % 4 === 0) {
        const pulseOsc = audioCtx.createOscillator();
        pulseOsc.type = 'sine';
        pulseOsc.frequency.setValueAtTime(42, t);
        const pulseGain = audioCtx.createGain();
        pulseGain.gain.setValueAtTime(0.0001, t);
        pulseGain.gain.linearRampToValueAtTime(0.075, t + 0.35);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        pulseOsc.connect(pulseGain);
        pulseGain.connect(masterGain);
        pulseOsc.start(t);
        pulseOsc.stop(t + 1.85);
      }
    }

    // Play first note immediately, then loop through motif
    playChimeNote(melodyNotes[0]);
    noteIdx = 1;

    horrorMusicState.intervalId = setInterval(() => {
      if (!horrorMusicState.isPlaying) return;
      playChimeNote(melodyNotes[noteIdx % melodyNotes.length]);
      noteIdx++;
    }, 3600);

    console.log('[Audio] Mild horror attic background music started.');
  } catch (err) {
    console.warn('[Audio] Failed to start attic horror music:', err);
    horrorMusicState.isPlaying = false;
  }
}

export function stopAtticHorrorMusic(fadeDuration = 2.0) {
  atticHorrorMusicWanted = false;
  if (!horrorMusicState.isPlaying || !horrorMusicState.masterGain || !audioCtx) {
    horrorMusicState.isPlaying = false;
    return;
  }

  try {
    const now = audioCtx.currentTime;
    const g = horrorMusicState.masterGain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.exponentialRampToValueAtTime(0.0001, now + fadeDuration);

    const nodesToStop = [...horrorMusicState.nodes];
    const timerToClear = horrorMusicState.intervalId;
    horrorMusicState.isPlaying = false;
    horrorMusicState.nodes = [];
    horrorMusicState.intervalId = null;

    if (timerToClear) {
      clearInterval(timerToClear);
    }

    setTimeout(() => {
      nodesToStop.forEach((node) => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (_) {}
      });
      console.log('[Audio] Mild horror attic music stopped & cleaned up.');
    }, Math.ceil(fadeDuration * 1000) + 120);
  } catch (err) {
    console.warn('[Audio] Error stopping attic horror music:', err);
    horrorMusicState.isPlaying = false;
  }
}

export function isAtticHorrorMusicPlaying() {
  return horrorMusicState.isPlaying;
}


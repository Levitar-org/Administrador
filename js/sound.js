let ctx = null;
let enabled = true;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function playTone(freq, duration, type = 'sine', volume = 0.08) {
  if (!enabled) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (e) { /* silent fail */ }
}

export const Sound = {
  click() {
    playTone(800, 0.05, 'square', 0.03);
  },

  success() {
    if (!enabled) return;
    try {
      const c = getCtx();
      [523, 659, 784].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, c.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.06, c.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime + i * 0.08);
        osc.stop(c.currentTime + i * 0.08 + 0.15);
      });
    } catch (e) { /* silent fail */ }
  },

  error() {
    playTone(200, 0.2, 'sawtooth', 0.04);
  },

  trash() {
    playTone(300, 0.1, 'square', 0.04);
    setTimeout(() => playTone(200, 0.15, 'square', 0.04), 80);
  },

  drop() {
    playTone(400, 0.08, 'sine', 0.04);
    setTimeout(() => playTone(600, 0.08, 'sine', 0.03), 60);
  },

  page() {
    playTone(500, 0.08, 'sine', 0.02);
  },

  toggle(on) {
    enabled = on;
  },

  isEnabled() {
    return enabled;
  }
};

// Enable on first user interaction
const enableOnFirstClick = () => {
  getCtx();
  document.removeEventListener('click', enableOnFirstClick);
  document.removeEventListener('keydown', enableOnFirstClick);
};
document.addEventListener('click', enableOnFirstClick);
document.addEventListener('keydown', enableOnFirstClick);

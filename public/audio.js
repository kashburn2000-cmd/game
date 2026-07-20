// Procedural audio for the TV — no external files, everything synthesized
// with WebAudio so the game works offline and behind any network policy.
window.SoundKit = (() => {
  let ctx = null, master = null, drone = null, beat = null;

  function init() {
    if (ctx) { ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  const ready = () => !!ctx;

  function stopDrone() {
    if (!drone) return;
    const d = drone; drone = null;
    d.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    setTimeout(() => d.nodes.forEach((n) => { try { n.stop ? n.stop() : n.disconnect(); } catch { } }), 1500);
  }

  // scene: 'night' | 'day' | 'doom' | 'off'
  function scene(name) {
    if (!ready()) return;
    stopDrone();
    if (name === 'off') return;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.connect(master);
    const nodes = [];
    const mk = (type, freq, vol) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.value = freq; g.gain.value = vol;
      o.connect(g); g.connect(gain); o.start(); nodes.push(o, g);
      return o;
    };
    if (name === 'night') {
      mk('sine', 55, 0.5); mk('sine', 55.8, 0.4); mk('triangle', 110.3, 0.08);
      gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2.5);
    } else if (name === 'day') {
      mk('triangle', 110, 0.18); mk('sine', 220.7, 0.05);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);
    } else if (name === 'doom') {
      mk('sawtooth', 41.2, 0.35); mk('sine', 43.7, 0.4); mk('sawtooth', 82.9, 0.12);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 3);
    }
    drone = { gain, nodes };
  }

  function blip(freq, dur, type = 'sine', vol = 0.3, when = 0) {
    if (!ready()) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.1);
    return o;
  }

  function noiseBurst(dur, vol = 0.3, when = 0) {
    if (!ready()) return;
    const t = ctx.currentTime + when;
    const len = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }

  function sting(kind) {
    if (!ready()) return;
    switch (kind) {
      case 'death': {
        noiseBurst(1.2, 0.35);
        const o = blip(220, 1.6, 'sawtooth', 0.22);
        if (o) o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.5);
        break;
      }
      case 'reveal': blip(70, 0.9, 'sine', 0.5); blip(66, 1.4, 'sine', 0.4, 0.35); break;
      case 'haunt': blip(880, 0.5, 'sine', 0.12); blip(1244, 0.7, 'sine', 0.08, 0.15); break;
      case 'whisper': blip(1560, 0.35, 'sine', 0.07); noiseBurst(0.25, 0.05); break;
      case 'vote': blip(196, 0.4, 'triangle', 0.25); blip(147, 0.5, 'triangle', 0.2, 0.25); break;
      case 'dice': for (let i = 0; i < 4; i++) blip(600 + Math.random() * 700, 0.06, 'square', 0.1, i * 0.07); break;
      case 'item': blip(523, 0.2, 'triangle', 0.2); blip(784, 0.3, 'triangle', 0.2, 0.12); break;
      case 'join': blip(392, 0.15, 'triangle', 0.15); blip(523, 0.2, 'triangle', 0.15, 0.1); break;
      case 'triumph': [262, 330, 392, 523].forEach((f, i) => blip(f, 0.7, 'triangle', 0.22, i * 0.16)); break;
      case 'doom': {
        noiseBurst(2.5, 0.3);
        [41, 44, 55, 58].forEach((f) => blip(f, 3.2, 'sawtooth', 0.16));
        break;
      }
      case 'gamestart': [523, 392, 262, 131].forEach((f, i) => blip(f, 0.8, 'sine', 0.2, i * 0.22)); break;
      case 'rising': sting('doom'); break;
      case 'dawn': blip(330, 1.2, 'sine', 0.12); blip(415, 1.6, 'sine', 0.1, 0.4); break;
      case 'night': blip(110, 1.5, 'sine', 0.18); blip(104, 2.0, 'sine', 0.14, 0.5); break;
    }
  }

  let beatTimer = null;
  function heartbeat(on) {
    if (!ready()) return;
    if (on && !beatTimer) {
      const thump = () => { blip(52, 0.18, 'sine', 0.5); blip(48, 0.16, 'sine', 0.4, 0.22); };
      thump();
      beatTimer = setInterval(thump, 950);
    } else if (!on && beatTimer) {
      clearInterval(beatTimer); beatTimer = null;
    }
  }

  return { init, scene, sting, heartbeat, ready };
})();

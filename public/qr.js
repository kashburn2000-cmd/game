// TinyQR — minimal QR encoder (byte mode, ECC level L, versions 1-5, mask 0).
// Just enough to put a join link on the TV. Verified in tests by decoding
// the generated matrix with jsQR.
(function (root) {
  'use strict';

  // GF(256) tables, polynomial 0x11d.
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1; if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  const gmul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

  // Reed-Solomon ECC.
  function rsGenerator(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= gmul(poly[j], EXP[i]);
        next[j + 1] ^= poly[j];
      }
      poly = next;
    }
    return poly; // highest-order coefficient first is poly[last]? We built low->high; use as is with care below.
  }
  function rsRemainder(data, degree) {
    const gen = rsGenerator(degree);
    const res = new Array(degree).fill(0);
    for (const b of data) {
      const factor = b ^ res[0];
      res.shift(); res.push(0);
      for (let i = 0; i < degree; i++) {
        // gen is [g0..gdeg] with gdeg=1 (monic, low->high); we need coefficients
        // of x^(deg-1-i): gen[deg-1-i].
        res[i] ^= gmul(gen[degree - 1 - i], factor);
      }
    }
    return res;
  }

  // Version tables for ECC level L: [totalDataCodewords, eccCodewords].
  const VERSIONS = { 1: [19, 7], 2: [34, 10], 3: [55, 15], 4: [80, 20], 5: [108, 26] };
  const ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30] };

  function pickVersion(len) {
    for (let v = 1; v <= 5; v++) {
      if (4 + 8 + 8 * len <= VERSIONS[v][0] * 8) return v;
    }
    throw new Error('TinyQR: text too long (' + len + ' bytes)');
  }

  function encodeData(bytes, version) {
    const [dataCw] = VERSIONS[version];
    const bits = [];
    const push = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    push(0b0100, 4);              // byte mode
    push(bytes.length, 8);        // char count (8 bits for v1-9)
    for (const b of bytes) push(b, 8);
    // Terminator + pad to byte.
    const cap = dataCw * 8;
    push(0, Math.min(4, cap - bits.length));
    while (bits.length % 8 !== 0) bits.push(0);
    const out = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      out.push(b);
    }
    const pads = [0xec, 0x11];
    let pi = 0;
    while (out.length < dataCw) out.push(pads[pi++ % 2]);
    return out;
  }

  function matrix(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    const version = pickVersion(bytes.length);
    const size = 17 + 4 * version;
    const [, eccCw] = VERSIONS[version];
    const data = encodeData(bytes, version);
    const codewords = data.concat(rsRemainder(data, eccCw));

    const M = Array.from({ length: size }, () => new Array(size).fill(false));
    const F = Array.from({ length: size }, () => new Array(size).fill(false)); // function modules
    const set = (y, x, v) => { M[y][x] = !!v; F[y][x] = true; };

    // Finder patterns + separators.
    const finder = (fy, fx) => {
      for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) {
        const y = fy + dy, x = fx + dx;
        if (y < 0 || y >= size || x < 0 || x >= size) continue;
        const inSquare = dy >= 0 && dy <= 6 && dx >= 0 && dx <= 6;
        const ring = inSquare && (dy === 0 || dy === 6 || dx === 0 || dx === 6);
        const core = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
        set(y, x, inSquare && (ring || core));
      }
    };
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

    // Timing patterns.
    for (let i = 8; i < size - 8; i++) {
      if (!F[6][i]) set(6, i, i % 2 === 0);
      if (!F[i][6]) set(i, 6, i % 2 === 0);
    }

    // Alignment patterns.
    const centers = ALIGN[version];
    for (const cy of centers) for (const cx of centers) {
      // skip the three finder corners
      if ((cy === 6 && cx === 6) || (cy === 6 && cx === size - 7) || (cy === size - 7 && cx === 6)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        set(cy + dy, cx + dx, Math.max(Math.abs(dy), Math.abs(dx)) !== 1);
      }
    }

    // Reserve format info areas (filled below).
    for (let i = 0; i <= 8; i++) {
      if (!F[8][i]) set(8, i, false);
      if (!F[i][8]) set(i, 8, false);
    }
    for (let i = 0; i < 8; i++) {
      if (!F[8][size - 1 - i]) set(8, size - 1 - i, false);
      if (!F[size - 1 - i][8]) set(size - 1 - i, 8, false);
    }

    // Data placement (zigzag), then mask 0.
    let bitIdx = 0;
    const totalBits = codewords.length * 8;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (F[y][x]) continue;
          let bit = false;
          if (bitIdx < totalBits) {
            bit = ((codewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) === 1;
            bitIdx++;
          }
          if ((y + x) % 2 === 0) bit = !bit; // mask 0
          M[y][x] = bit;
        }
      }
    }

    // Format info: ECC L (formatBits=1), mask 0.
    let fmtData = (1 << 3) | 0; // 5 bits
    let rem = fmtData;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const fmt = ((fmtData << 10) | rem) ^ 0x5412;
    const fbit = (i) => ((fmt >>> i) & 1) === 1;
    // Copy 1, around the top-left finder: bits 0-5 down column 8, corner
    // bits, then bits 9-14 leftward along row 8.
    for (let i = 0; i <= 5; i++) set(i, 8, fbit(i));
    set(7, 8, fbit(6)); set(8, 8, fbit(7)); set(8, 7, fbit(8));
    for (let i = 9; i < 15; i++) set(8, 14 - i, fbit(i));
    // Copy 2: bits 0-7 along row 8 from the right edge, bits 8-14 down
    // column 8 near the bottom.
    for (let i = 0; i < 8; i++) set(8, size - 1 - i, fbit(i));
    for (let i = 8; i < 15; i++) set(size - 15 + i, 8, fbit(i));
    set(size - 8, 8, true); // dark module

    return M;
  }

  function draw(canvas, text, opts = {}) {
    const M = matrix(text);
    const n = M.length;
    const quiet = opts.quiet ?? 2;
    const px = canvas.width / (n + quiet * 2);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = opts.light || '#e8dcc0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = opts.dark || '#0a0e12';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (M[y][x]) ctx.fillRect((x + quiet) * px, (y + quiet) * px, Math.ceil(px), Math.ceil(px));
    }
  }

  const api = { matrix, draw };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TinyQR = api;
})(typeof window !== 'undefined' ? window : globalThis);

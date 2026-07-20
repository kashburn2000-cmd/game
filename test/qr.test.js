// Verify TinyQR output by decoding it with jsQR (an independent decoder).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const maybe = require('../public/qr.js');
// Under "type":"module" the browser file may register on globalThis instead.
const TinyQR = maybe && maybe.matrix ? maybe : globalThis.TinyQR;
const jsQR = require('jsqr');

let failures = 0;
const ok = (c, l) => { if (c) console.log('  ✓', l); else { failures++; console.error('  ✗ FAIL:', l); } };

function decode(text) {
  const M = TinyQR.matrix(text);
  const n = M.length, scale = 8, quiet = 4;
  const dim = (n + quiet * 2) * scale;
  const rgba = new Uint8ClampedArray(dim * dim * 4).fill(255);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!M[y][x]) continue;
      for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) {
        const py = (y + quiet) * scale + sy, px = (x + quiet) * scale + sx;
        const i = (py * dim + px) * 4;
        rgba[i] = rgba[i + 1] = rgba[i + 2] = 0;
      }
    }
  }
  const res = jsQR(rgba, dim, dim);
  return res ? res.data : null;
}

const cases = [
  'HELLO',
  'https://strangeisthenight.party/#join-ABCD',
  'https://strangeisthenight.party/#join-WXYZ',
  'http://192.168.1.23:8787/#join-QQQQ',
  'A'.repeat(100), // pushes into version 5
];
for (const text of cases) {
  const got = decode(text);
  ok(got === text, `round-trips ${text.length} chars: ${text.slice(0, 44)}${text.length > 44 ? '…' : ''}`);
}

console.log(failures ? `\n${failures} FAILURES` : '\nQR tests passed.');
process.exit(failures ? 1 : 0);

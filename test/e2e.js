// End-to-end test against the real local server: HTTP room creation,
// WebSocket TV + phone connections, a full first night and vote over the wire.
import { spawn } from 'node:child_process';
import WebSocket from 'ws';

const PORT = 8791;
const base = `http://127.0.0.1:${PORT}`;
let failures = 0;
const ok = (c, l) => { if (c) console.log('  ✓', l); else { failures++; console.error('  ✗ FAIL:', l); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('node', ['local/server.js'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await sleep(800);

try {
  const { code } = await fetch(base + '/api/room', { method: 'POST' }).then((r) => r.json());
  ok(/^[A-Z]{4}$/.test(code), 'room created: ' + code);
  const chk = await fetch(base + '/api/check/' + code).then((r) => r.json());
  ok(chk.active === true, 'room check says active');
  const chk2 = await fetch(base + '/api/check/ZZZZ').then((r) => r.json());
  ok(chk2.active === false, 'bogus room check says inactive');
  const page = await fetch(base + '/').then((r) => r.text());
  ok(page.includes('client.js'), 'index.html served');

  const mkWs = (role) => new Promise((res, rej) => {
    const w = new WebSocket(`ws://127.0.0.1:${PORT}/ws/${code}?role=${role}`);
    const conn = { ws: w, view: null, playerId: null, token: null };
    w.on('message', (raw) => {
      const m = JSON.parse(raw);
      if (m.type === 'state') conn.view = m.view;
      if (m.type === 'joined') { conn.playerId = m.playerId; conn.token = m.token; }
    });
    w.on('open', () => res(conn));
    w.on('error', rej);
  });
  const send = (c, o) => c.ws.send(JSON.stringify(o));

  const tv = await mkWs('tv');
  await sleep(200);
  ok(tv.view && tv.view.mode === 'tv' && tv.view.phase === 'lobby', 'TV sees the lobby');

  const phones = [];
  for (let i = 0; i < 6; i++) {
    const p = await mkWs('player');
    send(p, { type: 'join', name: 'Guest' + i });
    phones.push(p);
  }
  await sleep(400);
  ok(phones.every((p) => p.playerId && p.token), 'six phones joined with tokens');
  ok(tv.view.players.length === 6, 'TV lobby shows six players');
  ok(phones[0].view.you.host === true, 'first phone is host');

  send(phones[0], { type: 'start', final: false, stretch: false });
  await sleep(300);
  ok(tv.view.phase === 'night', 'game starts into night over the wire');
  ok(phones.every((p) => p.view.you.role), 'every phone got a secret role');
  const cultPhone = phones.find((p) => p.view.you.role === 'cultist');
  ok(cultPhone.view.you.mates.length === 1, 'cultist sees their partner');

  // Everyone acts. Explorers may hit two-stage scenes or tarot offers, so
  // keep responding until their scene fully resolves.
  for (const p of phones) {
    const y = p.view.you;
    if (['cultist', 'medium', 'occultist', 'archivist'].includes(y.role)) {
      send(p, { type: 'night', target: y.nightUI.targets[0].id });
      await sleep(100);
    } else {
      send(p, { type: 'explore', location: 'library' });
      for (let i = 0; i < 5; i++) {
        await sleep(200);
        const ui = p.view.you.nightUI;
        if (!ui || ui.result || !ui.scene) break;
        if (ui.await) send(p, { type: 'tarot', use: false });
        else send(p, { type: 'exploreChoice', index: 0 });
      }
    }
  }
  await sleep(400);
  ok(tv.view.phase === 'dawn', 'all night actions resolve to dawn over the wire');
  ok((tv.view.dawnReport || []).length >= 3, 'TV received the dawn report');

  // Reconnect test: drop a phone and rejoin by token.
  const dropped = phones[1];
  const droppedId = dropped.playerId, droppedToken = dropped.token;
  dropped.ws.close();
  await sleep(300);
  const re = await mkWs('player');
  send(re, { type: 'join', name: 'whatever', token: droppedToken });
  await sleep(300);
  ok(re.playerId === droppedId, 'phone reconnects to same seat via token');
  ok(re.view.you.role === dropped.view.you.role, 'reconnected phone keeps its secret role');

  console.log(failures ? `\n${failures} FAILURES` : '\nE2E passed.');
} catch (e) {
  console.error('E2E crashed:', e);
  failures++;
} finally {
  server.kill();
}
process.exit(failures ? 1 : 0);

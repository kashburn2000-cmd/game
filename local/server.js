// Local fallback server — runs the same game on a laptop over home WiFi.
//   npm run local
// then open  http://<laptop-ip>:8787  on the TV and phones (same network).

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { Engine, newRoom } from '../src/engine/engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const PORT = process.env.PORT || 8787;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const makeCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

const rooms = new Map(); // code -> { engine, socks: Set<{ws, conn}>, timer }

function getRoom(code) { return rooms.get(code); }

function broadcast(room) {
  for (const s of room.socks) {
    try { s.ws.send(JSON.stringify({ type: 'state', view: room.engine.viewFor(s.conn) })); } catch { }
  }
}

function armTimer(room) {
  clearTimeout(room.timer);
  const d = room.engine.deadline();
  if (!d) return;
  room.timer = setTimeout(() => {
    room.engine.tick();
    broadcast(room);
    armTimer(room);
  }, Math.max(50, d - Date.now()));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/room' && req.method === 'POST') {
    const code = makeCode();
    const engine = new Engine(newRoom(code));
    engine.s.active = true;
    rooms.set(code, { engine, socks: new Set(), timer: null });
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ code }));
  }
  const m = url.pathname.match(/^\/api\/check\/([A-Za-z0-9]{3,8})$/);
  if (m) {
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ active: rooms.has(m[1].toUpperCase()) }));
  }
  // Static files.
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  file = path.normalize(file).replace(/^([.][.][/\\])+/, '');
  const full = path.join(PUBLIC, file);
  if (!full.startsWith(PUBLIC) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  res.setHeader('content-type', MIME[path.extname(full)] || 'application/octet-stream');
  fs.createReadStream(full).pipe(res);
});

const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://x');
  const m = url.pathname.match(/^\/ws\/([A-Za-z0-9]{3,8})$/);
  if (!m) return socket.destroy();
  const code = m[1].toUpperCase();
  const room = getRoom(code);
  if (!room) return socket.destroy();
  wss.handleUpgrade(req, socket, head, (ws) => {
    const role = url.searchParams.get('role') === 'tv' ? 'tv' : 'player';
    const conn = { role, playerId: null };
    const entry = { ws, conn };
    room.socks.add(entry);
    ws.send(JSON.stringify({ type: 'state', view: room.engine.viewFor(conn) }));
    ws.on('message', (raw) => {
      let msg; try { msg = JSON.parse(raw); } catch { return; }
      room.engine.handle(conn, msg);
      if (conn.playerId && msg.type === 'join') {
        try { ws.send(JSON.stringify({ type: 'joined', playerId: conn.playerId, token: room.engine.player(conn.playerId)?.token })); } catch { }
      }
      broadcast(room);
      armTimer(room);
    });
    ws.on('close', () => {
      room.socks.delete(entry);
      if (conn.playerId) {
        const others = [...room.socks].some((s) => s.conn.playerId === conn.playerId);
        if (!others) room.engine.disconnect(conn.playerId);
      }
      broadcast(room);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n  A Shadow Over Arkham — local server\n`);
  console.log(`  On this machine:   http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  TV + phones (same WiFi):  http://${net.address}:${PORT}`);
      }
    }
  }
  console.log('');
});

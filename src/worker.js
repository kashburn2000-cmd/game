// Cloudflare Worker entry: serves the static client, creates rooms, and
// routes WebSockets to a Durable Object per room (class Room below).

import { Engine, newRoom } from './engine/engine.js';

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const makeCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === '/api/room' && req.method === 'POST') {
      const code = makeCode();
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      await stub.fetch(new Request(url.origin + '/init?code=' + code));
      return json({ code });
    }

    let m = url.pathname.match(/^\/api\/check\/([A-Za-z0-9]{3,8})$/);
    if (m) {
      const code = m[1].toUpperCase();
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      return stub.fetch(new Request(url.origin + '/check'));
    }

    m = url.pathname.match(/^\/ws\/([A-Za-z0-9]{3,8})$/);
    if (m) {
      const code = m[1].toUpperCase();
      const stub = env.ROOM.get(env.ROOM.idFromName(code));
      return stub.fetch(req);
    }

    return env.ASSETS.fetch(req);
  },
};

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.engine = null;
  }

  async load() {
    if (!this.engine) {
      const st = await this.ctx.storage.get('state');
      this.engine = new Engine(st || newRoom('----'));
    }
    return this.engine;
  }

  async save() {
    await this.ctx.storage.put('state', this.engine.serialize());
    const d = this.engine.deadline();
    if (d) await this.ctx.storage.setAlarm(d);
    else await this.ctx.storage.deleteAlarm();
  }

  broadcast() {
    for (const ws of this.ctx.getWebSockets()) {
      try {
        const conn = ws.deserializeAttachment() || { role: 'player' };
        ws.send(JSON.stringify({ type: 'state', view: this.engine.viewFor(conn) }));
      } catch { /* socket mid-close */ }
    }
  }

  async fetch(req) {
    const url = new URL(req.url);
    await this.load();

    if (url.pathname === '/init') {
      // A TV creating a room always starts it fresh.
      const code = (url.searchParams.get('code') || '----').toUpperCase();
      this.engine = new Engine(newRoom(code));
      this.engine.s.active = true;
      await this.save();
      return json({ ok: true });
    }
    if (url.pathname === '/check') {
      return json({ active: !!this.engine.s.active });
    }

    if (req.headers.get('Upgrade') !== 'websocket') return new Response('Expected websocket', { status: 426 });
    const role = url.searchParams.get('role') === 'tv' ? 'tv' : 'player';
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ role, playerId: null });
    // Send current state immediately so the TV shows the lobby without a join.
    try { server.send(JSON.stringify({ type: 'state', view: this.engine.viewFor({ role, playerId: null }) })); } catch { }
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, raw) {
    await this.load();
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const conn = ws.deserializeAttachment() || { role: 'player', playerId: null };
    this.engine.handle(conn, msg);
    ws.serializeAttachment(conn); // join/reconnect may have set conn.playerId
    if (conn.playerId && msg.type === 'join') {
      try { ws.send(JSON.stringify({ type: 'joined', playerId: conn.playerId, token: this.engine.player(conn.playerId)?.token })); } catch { }
    }
    this.broadcast();
    await this.save();
  }

  async webSocketClose(ws) {
    await this.load();
    const conn = ws.deserializeAttachment();
    if (conn?.playerId) {
      // Only mark disconnected if no other socket claims this player.
      const others = this.ctx.getWebSockets().filter((w) => w !== ws && w.deserializeAttachment()?.playerId === conn.playerId);
      if (!others.length) this.engine.disconnect(conn.playerId);
    }
    this.broadcast();
    await this.save();
  }

  async webSocketError(ws) { return this.webSocketClose(ws); }

  async alarm() {
    await this.load();
    this.engine.tick();
    this.broadcast();
    await this.save();
  }
}

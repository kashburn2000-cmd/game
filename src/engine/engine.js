// The complete game state machine for A Shadow Over Arkham.
// Pure module: no I/O. Hosts (Cloudflare Durable Object / local Node server)
// call handle()/tick(), then broadcast viewFor() to each connection and
// persist serialize() output. All state is JSON-serializable.

import { PERSONAS, ROLES, CURSES, WHISPERS, ITEMS, LOCATIONS, OBJECTIVES, NARRATION, TITLES } from './content.js';

const rand = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rand(a.length)];
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = rand(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const uid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
const now = () => Date.now();

export const TIMERS = { night: 150e3, dawn: 26e3, day: 180e3, vote: 90e3, reveal: 14e3, rising: 50e3 };
const MAX_SANITY = 5, START_SANITY = 5, RESET_SANITY = 3, MAX_ITEMS = 3;
const WHISPERS_PER_DAY = 3, WHISPER_GAP = 6e3;

export function newRoom(code) {
  return {
    code,
    players: [], // {id, token, name, personaId, joinOrder, connected}
    joinSeq: 0,
    campaign: { games: 0, doom: 0, signs: {}, log: [] },
    game: null,
    fx: { seq: 0, kind: null },
  };
}

export class Engine {
  constructor(state) { this.s = state; }
  serialize() { return this.s; }

  // ---------- helpers ----------
  fx(kind) { this.s.fx = { seq: (this.s.fx?.seq || 0) + 1, kind }; }
  player(id) { return this.s.players.find((p) => p.id === id); }
  persona(p) { return PERSONAS.find((x) => x.id === p?.personaId) || null; }
  pname(id) { const p = this.player(id); const per = this.persona(p); return per ? per.name : (p?.name || '???'); }
  hostId() {
    const c = [...this.s.players].filter((p) => p.connected).sort((a, b) => a.joinOrder - b.joinOrder);
    const any = [...this.s.players].sort((a, b) => a.joinOrder - b.joinOrder);
    return (c[0] || any[0])?.id || null;
  }
  get g() { return this.s.game; }
  alive(id) { return this.g && this.g.alive.includes(id); }
  spirit(id) { return this.g && this.g.spirits.includes(id); }
  role(id) { return this.g?.roles[id] || null; }
  livingCultists() { return this.g.alive.filter((id) => this.role(id) === 'cultist'); }
  deadline() {
    const g = this.g;
    if (!g || !g.deadline || g.phase === 'gameover' || g.phase === 'lobbywait') return null;
    return g.deadline;
  }
  setPhase(phase) {
    const g = this.g;
    g.phase = phase;
    g.deadline = TIMERS[phase] ? now() + TIMERS[phase] : null;
  }
  addSign(id, n) { const s = this.s.campaign.signs; s[id] = (s[id] || 0) + n; }
  loseSanity(id, n) {
    const g = this.g;
    if (!(id in g.sanity)) return;
    g.sanity[id] = Math.max(0, Math.min(MAX_SANITY, g.sanity[id] - n));
    if (n > 0) g.stats[id] && (g.stats[id].sanityLost += n);
  }

  // ---------- entry points ----------
  handle(conn, msg) {
    try { this._handle(conn, msg); } catch (e) { this.s.lastError = String((e && e.stack) || e); }
  }

  _handle(conn, msg) {
    if (!msg || typeof msg.type !== 'string') return;
    const pid = conn.playerId || null;
    const isHost = pid && pid === this.hostId();
    switch (msg.type) {
      case 'join': return this.join(conn, msg);
      case 'persona': return this.setPersona(pid, msg.personaId);
      case 'start': return isHost && this.startGame(msg);
      case 'forceAdvance': return isHost && this.forceAdvance();
      case 'extend': return isHost && this.extend();
      case 'skipToVote': return isHost && this.g?.phase === 'day' && this.startVote();
      case 'markBroken': return isHost && this.markBroken(msg.playerId, !!msg.broken);
      case 'kick': return isHost && this.kick(msg.playerId);
      case 'night': return this.nightAction(pid, msg.target);
      case 'explore': return this.explore(pid, msg.location);
      case 'exploreChoice': return this.exploreChoice(pid, msg.index);
      case 'haunt': return this.haunt(pid, msg.target, msg.curseId);
      case 'whisper': return this.whisper(pid, msg.index);
      case 'vote': return this.vote(pid, msg.target);
      case 'useItem': return this.useItem(pid, msg.item, msg.target);
      case 'risingPick': return this.risingPick(pid, msg.stat, !!msg.spend);
    }
  }

  tick() {
    try {
      const g = this.g;
      if (!g || !g.deadline || now() < g.deadline - 250) return;
      switch (g.phase) {
        case 'night': return this.resolveNight(true);
        case 'dawn': return this.afterDawn();
        case 'day': return this.startVote();
        case 'vote': return this.tally();
        case 'reveal': return this.afterReveal();
        case 'rising': return this.resolveRisingRound(true);
      }
    } catch (e) { this.s.lastError = String((e && e.stack) || e); }
  }

  // ---------- lobby ----------
  join(conn, msg) {
    // Reconnect by token.
    if (msg.token) {
      const p = this.s.players.find((x) => x.token === msg.token);
      if (p) { p.connected = true; conn.playerId = p.id; return; }
    }
    if (this.s.players.length >= 12) return;
    const name = String(msg.name || '').trim().slice(0, 18) || 'Stranger';
    const p = { id: uid(), token: uid(), name, personaId: null, joinOrder: this.s.joinSeq++, connected: true };
    // Auto-claim a free persona so narration always has a name.
    const claimed = new Set(this.s.players.map((x) => x.personaId));
    const free = PERSONAS.filter((x) => !claimed.has(x.id));
    if (free.length) p.personaId = pick(free).id;
    this.s.players.push(p);
    conn.playerId = p.id;
    // Late arrival during a game joins as a spirit until next deal.
    const g = this.g;
    if (g && g.phase !== 'gameover') {
      g.spirits.push(p.id);
      this.initPlayerGameState(p.id);
    }
    this.fx('join');
  }

  disconnect(pid) { const p = this.player(pid); if (p) p.connected = false; }
  reconnectMark(pid) { const p = this.player(pid); if (p) p.connected = true; }

  setPersona(pid, personaId) {
    const p = this.player(pid);
    if (!p) return;
    if (this.g && this.g.phase !== 'gameover') return; // locked during a game
    if (!PERSONAS.some((x) => x.id === personaId)) return;
    if (this.s.players.some((x) => x.id !== pid && x.personaId === personaId)) return;
    p.personaId = personaId;
  }

  kick(targetId) {
    if (this.g && this.g.phase !== 'gameover') return; // in-game kicks disallowed; use forceAdvance for stalls
    this.s.players = this.s.players.filter((p) => p.id !== targetId);
  }

  initPlayerGameState(id) {
    const g = this.g;
    g.sanity[id] = START_SANITY;
    g.items[id] = g.items[id] || [];
    g.quirks[id] = g.quirks[id] || [];
    g.stats[id] = { votedInnocent: 0, votedCultist: 0, whispers: 0, itemsFound: 0, sanityLost: 0, locs: [], majorityVotes: 0, wrongVotes: 0, totalVotes: 0, hauntedCount: 0, daysSurvivedCultist: 0 };
    g.objectives[id] = g.objectives[id] || { id: pick(OBJECTIVES).id, done: false };
  }

  // ---------- game setup ----------
  startGame(opts = {}) {
    const ids = this.s.players.map((p) => p.id);
    if (ids.length < 4) return;
    const g = this.s.game = {
      num: this.s.campaign.games + 1,
      final: !!opts.final,
      stretch: !!opts.stretch || !!opts.final,
      phase: 'night', deadline: null, day: 1,
      roles: {}, alive: [...ids], spirits: [],
      sanity: {}, items: {}, quirks: {}, curse: {},
      objectives: {}, stats: {},
      night: null, dawnReport: null, votes: {}, lastTally: null,
      whispersFeed: [], whispersUsed: {}, lastWhisperAt: 0,
      gravedirt: null, seenScenes: {}, pendingWin: null,
      reveal: null, winner: null, rising: null, ceremony: null,
      voteHistory: [],
    };
    // Roles.
    const n = ids.length;
    const order = shuffle(ids);
    const nCult = n >= 9 ? 3 : n >= 6 ? 2 : 1;
    let i = 0;
    for (let c = 0; c < nCult; c++) g.roles[order[i++]] = 'cultist';
    g.roles[order[i++]] = 'medium';
    if (i < n) g.roles[order[i++]] = 'occultist';
    if (n >= 8) g.roles[order[i++]] = 'lunatic';
    const rest = order.slice(i);
    rest.forEach((id) => (g.roles[id] = 'townsfolk'));
    if (g.stretch) {
      if (rest[0]) g.roles[rest[0]] = 'hybrid';
      if (rest[1]) g.roles[rest[1]] = 'archivist';
    }
    // Per-player state + objectives (fresh each game).
    const objPool = shuffle(OBJECTIVES.map((o) => o.id));
    ids.forEach((id, idx) => {
      this.initPlayerGameState(id);
      g.objectives[id] = { id: objPool[idx % objPool.length], done: false };
    });
    // Assign personas to anyone still without one.
    const claimed = new Set(this.s.players.map((x) => x.personaId).filter(Boolean));
    for (const p of this.s.players) {
      if (!p.personaId) {
        const free = PERSONAS.filter((x) => !claimed.has(x.id));
        if (free.length) { p.personaId = free[0].id; claimed.add(p.personaId); }
      }
    }
    this.beginNight();
    this.fx('gamestart');
  }

  beginNight() {
    const g = this.g;
    g.night = { acts: {}, explores: {}, haunts: {}, spiritsAtStart: [...g.spirits] };
    g.votes = {};
    // Clear yesterday's curses (quirks persist).
    g.curse = {};
    this.setPhase('night');
    this.fx('night');
  }

  // ---------- night ----------
  nightAction(pid, target) {
    const g = this.g;
    if (!g || g.phase !== 'night' || !this.alive(pid)) return;
    const role = this.role(pid);
    if (!['cultist', 'medium', 'occultist'].includes(role)) return;
    if (!this.alive(target)) return;
    if (role === 'cultist' && this.role(target) === 'cultist') return;
    if (role === 'medium' && target === pid) return;
    const act = { target };
    if (role === 'medium') {
      const tr = this.role(target);
      act.result = tr === 'cultist' || tr === 'hybrid'; // hybrid reads as cultist
    }
    g.night.acts[pid] = act;
    this.checkNightDone();
  }

  explore(pid, location) {
    const g = this.g;
    if (!g || g.phase !== 'night' || !this.alive(pid)) return;
    const role = this.role(pid);
    if (['cultist', 'medium', 'occultist'].includes(role)) return;
    if (!LOCATIONS[location]) return;
    if (g.night.explores[pid]?.result) return; // already resolved tonight
    const seen = (g.seenScenes[pid] = g.seenScenes[pid] || []);
    let scenes = LOCATIONS[location].scenes.filter((s) => !seen.includes(location + ':' + s.id));
    if (!scenes.length) scenes = LOCATIONS[location].scenes;
    const scene = pick(scenes);
    seen.push(location + ':' + scene.id);
    g.night.explores[pid] = { loc: location, sceneId: scene.id, result: null };
    const st = g.stats[pid];
    if (st && !st.locs.includes(location)) st.locs.push(location);
  }

  exploreChoice(pid, index) {
    const g = this.g;
    if (!g || g.phase !== 'night') return;
    const ex = g.night.explores[pid];
    if (!ex || ex.result) return;
    const scene = LOCATIONS[ex.loc].scenes.find((s) => s.id === ex.sceneId);
    const choice = scene.choices[index === 1 ? 1 : 0];
    if (!choice) return;
    let outcome, roll = null;
    if (choice.check) {
      const per = this.persona(this.player(pid)) || { brawn: 1, wits: 1, nerve: 1 };
      const stat = per[choice.check.stat] || 0;
      const die = 1 + rand(20);
      const total = die + stat * 2;
      const ok = total >= choice.check.dc;
      roll = { die, stat: choice.check.stat, bonus: stat * 2, total, dc: choice.check.dc, ok };
      outcome = ok ? choice.success : choice.fail;
    } else {
      outcome = choice.outcome;
    }
    ex.result = { text: outcome.text, roll, choiceLabel: choice.label, gained: null, sanity: outcome.sanity || 0, tag: outcome.tag };
    if (outcome.sanity) {
      if (outcome.sanity < 0) this.loseSanity(pid, -outcome.sanity);
      else g.sanity[pid] = Math.min(MAX_SANITY, g.sanity[pid] + outcome.sanity);
    }
    if (outcome.item && (g.items[pid] || []).length < MAX_ITEMS) {
      g.items[pid].push(outcome.item);
      ex.result.gained = outcome.item;
      const st = g.stats[pid];
      if (st) { st.itemsFound++; }
      this.checkObjective(pid);
    }
    this.checkNightDone();
  }

  haunt(pid, target, curseId) {
    const g = this.g;
    if (!g || g.phase !== 'night' || !this.spirit(pid)) return;
    if (!g.night.spiritsAtStart.includes(pid)) return; // died tonight? not yet
    if (!this.alive(target)) return;
    if (!CURSES.some((c) => c.id === curseId)) return;
    g.night.haunts[pid] = { target, curseId };
  }

  checkNightDone() {
    const g = this.g;
    for (const id of g.alive) {
      const role = this.role(id);
      if (['cultist', 'medium', 'occultist'].includes(role)) {
        if (!g.night.acts[id]) return;
      } else {
        if (!g.night.explores[id]?.result) return;
      }
    }
    this.resolveNight(false);
  }

  resolveNight(forced) {
    const g = this.g;
    if (g.phase !== 'night') return;
    const report = [];
    report.push(pick(NARRATION.nightFall)(g.day));

    // Ward.
    const occId = g.alive.find((id) => this.role(id) === 'occultist');
    const ward = occId ? g.night.acts[occId]?.target || null : null;

    // Cult victim.
    const cultPicks = this.livingCultists().map((id) => g.night.acts[id]?.target).filter(Boolean);
    let victim = cultPicks.length ? pick(cultPicks) : null;
    if (!victim && forced) {
      const targets = g.alive.filter((id) => this.role(id) !== 'cultist');
      victim = targets.length ? pick(targets) : null;
    }

    let death = null;
    if (victim) {
      if (victim === ward) {
        report.push(pick(NARRATION.dawnWard)(this.pname(victim)));
        this.loseSanity(victim, 2);
      } else if ((g.items[victim] || []).includes('amulet')) {
        g.items[victim] = g.items[victim].filter((x, i) => i !== g.items[victim].indexOf('amulet'));
        report.push(pick(NARRATION.dawnAmulet)(this.pname(victim)));
        this.loseSanity(victim, 2);
      } else {
        death = victim;
        report.push(pick(NARRATION.dawnDeath)(this.pname(victim)));
      }
    } else {
      report.push('No one was taken in the night — an outcome so unusual the town finds it deeply unsettling.');
    }
    if (death) {
      g.alive = g.alive.filter((id) => id !== death);
      g.spirits.push(death);
      g.alive.forEach((id) => { if (this.role(id) !== 'cultist') this.loseSanity(id, 0); });
      this.fx('death');
    }

    // Haunting (spirits from the start of night vote; grave dirt overrides).
    const hauntVotes = Object.values(g.night.haunts);
    let hauntTarget = null, hauntCurse = null;
    if (g.gravedirt && this.alive(g.gravedirt.target)) {
      hauntTarget = g.gravedirt.target;
      hauntCurse = pick(CURSES).id;
      g.gravedirt = null;
    } else if (hauntVotes.length) {
      const counts = {};
      hauntVotes.forEach((h) => { if (this.alive(h.target)) counts[h.target] = (counts[h.target] || 0) + 1; });
      const max = Math.max(0, ...Object.values(counts));
      const leaders = Object.keys(counts).filter((t) => counts[t] === max);
      if (leaders.length) {
        hauntTarget = pick(leaders);
        const curses = hauntVotes.filter((h) => h.target === hauntTarget).map((h) => h.curseId);
        hauntCurse = pick(curses);
      }
    }
    if (hauntTarget && hauntCurse) {
      g.curse[hauntTarget] = { curseId: hauntCurse, broken: false };
      const ctext = CURSES.find((c) => c.id === hauntCurse).text;
      report.push(pick(NARRATION.haunt)(this.pname(hauntTarget), ctext.toLowerCase() + '.'));
      this.loseSanity(hauntTarget, 1);
      const st = g.stats[hauntTarget]; if (st) st.hauntedCount++;
      this.fx('haunt');
    }

    // Madness quirks for anyone at zero sanity.
    for (const id of g.alive) {
      if (g.sanity[id] === 0) {
        const have = new Set(g.quirks[id]);
        const options = CURSES.filter((c) => !have.has(c.id));
        if (options.length) {
          const q = pick(options).id;
          g.quirks[id].push(q);
          report.push(pick(NARRATION.quirk)(this.pname(id), CURSES.find((c) => c.id === q).text.toLowerCase() + '.'));
        }
        g.sanity[id] = RESET_SANITY;
      }
    }

    // Exploration flavor: one line for the busiest location.
    const locCounts = {};
    Object.values(g.night.explores).forEach((ex) => { if (ex?.result) locCounts[ex.loc] = (locCounts[ex.loc] || 0) + 1; });
    const busiest = Object.keys(locCounts).sort((a, b) => locCounts[b] - locCounts[a])[0];
    if (busiest) report.push(pick(NARRATION.flavor[busiest]));

    report.push(pick(NARRATION.advertiser));

    // Cultists survive another day (for Silver Tongue).
    this.livingCultists().forEach((id) => { g.stats[id].daysSurvivedCultist++; });

    g.dawnReport = report;
    // Parity check happens after dawn is shown.
    const cult = this.livingCultists().length;
    if (cult > 0 && cult >= g.alive.length - cult) g.pendingWin = 'cult';
    this.setPhase('dawn');
    this.fx('dawn');
  }

  afterDawn() {
    const g = this.g;
    if (g.phase !== 'dawn') return;
    if (g.pendingWin) {
      if (g.pendingWin === 'cult' && g.final) return this.startRising();
      return this.endGame(g.pendingWin);
    }
    g.whispersUsed = {};
    this.setPhase('day');
    this.fx('day');
  }

  // ---------- day ----------
  markBroken(playerId, broken) {
    const g = this.g;
    if (!g || !['day', 'vote'].includes(g.phase)) return;
    const c = g.curse[playerId];
    if (!c) return;
    if (broken && !c.broken) this.loseSanity(playerId, 1);
    c.broken = broken;
  }

  whisper(pid, index) {
    const g = this.g;
    if (!g || !['day', 'vote'].includes(g.phase) || !this.spirit(pid)) return;
    if (typeof WHISPERS[index] !== 'string') return;
    const used = g.whispersUsed[pid] || 0;
    if (used >= WHISPERS_PER_DAY) return;
    if (now() - g.lastWhisperAt < WHISPER_GAP) return;
    g.whispersUsed[pid] = used + 1;
    g.lastWhisperAt = now();
    g.whispersFeed.push({ text: WHISPERS[index], at: now() });
    if (g.whispersFeed.length > 6) g.whispersFeed.shift();
    const st = g.stats[pid]; if (st) st.whispers++;
    this.fx('whisper');
  }

  useItem(pid, item, target) {
    const g = this.g;
    if (!g || !this.player(pid)) return;
    const items = g.items[pid] || [];
    const idx = items.indexOf(item);
    if (idx === -1) return;
    let used = false;
    if (item === 'flask' && g.curse[pid] && !g.curse[pid].broken) {
      delete g.curse[pid];
      used = true;
    } else if (item === 'gravedirt' && this.alive(target) && ['day', 'vote', 'dawn'].includes(g.phase)) {
      g.gravedirt = { by: pid, target };
      used = true;
    } else if (item === 'press' && g.lastTally) {
      g.pressReveals = g.pressReveals || {};
      g.pressReveals[pid] = g.lastTally;
      used = true;
    }
    if (used) {
      items.splice(idx, 1);
      const st = g.stats[pid]; if (st) st.usedItem = true;
      this.checkObjective(pid);
      this.fx('item');
    }
  }

  startVote() {
    const g = this.g;
    if (!g || g.phase !== 'day') return;
    g.votes = {};
    this.setPhase('vote');
    this.fx('vote');
  }

  vote(pid, target) {
    const g = this.g;
    if (!g || g.phase !== 'vote' || !this.alive(pid)) return;
    if (target !== 'abstain' && !this.alive(target)) return;
    if (target === pid) return;
    g.votes[pid] = target;
    if (g.alive.every((id) => g.votes[id])) this.tally();
  }

  tally() {
    const g = this.g;
    if (g.phase !== 'vote') return;
    const counts = {};
    const votesBy = {};
    for (const [voter, target] of Object.entries(g.votes)) {
      if (!this.alive(voter)) continue;
      votesBy[voter] = target;
      if (target === 'abstain') continue;
      if (g.curse[voter]?.broken) continue; // broke their curse: vote silenced
      counts[target] = (counts[target] || 0) + 1;
    }
    const max = Math.max(0, ...Object.values(counts));
    const leaders = Object.keys(counts).filter((t) => counts[t] === max && max > 0);
    let banished = leaders.length === 1 ? leaders[0] : null;

    // Stats + objectives per voter.
    for (const [voter, target] of Object.entries(votesBy)) {
      if (target === 'abstain') continue;
      const st = g.stats[voter]; if (!st) continue;
      st.totalVotes++;
      const tr = this.role(target);
      if (tr === 'cultist') st.votedCultist++; else { st.votedInnocent++; st.wrongVotes++; }
      if (banished && target === banished) st.majorityVotes++;
    }
    g.voteHistory.push({ day: g.day, votes: votesBy, banished });

    let line;
    if (!banished) {
      line = pick(NARRATION.tie)();
    } else {
      const role = this.role(banished);
      g.alive = g.alive.filter((id) => id !== banished);
      g.spirits.push(banished);
      if (role === 'cultist') {
        line = pick(NARRATION.banishCultist)(this.pname(banished));
        for (const [voter, target] of Object.entries(votesBy)) {
          if (target === banished) { const st = g.stats[voter]; if (st) st.helpedBanishCultist = true; }
        }
      } else {
        line = pick(NARRATION.banishInnocent)(this.pname(banished), role);
        g.alive.forEach((id) => { if (this.role(id) !== 'cultist') this.loseSanity(id, 1); });
      }
    }
    g.lastTally = { day: g.day, votesBy, counts, banished };
    g.reveal = { banished, role: banished ? this.role(banished) : null, tie: !banished, counts, line };
    this.s.players.forEach((p) => this.checkObjective(p.id));
    this.setPhase('reveal');
    this.fx('reveal');
  }

  afterReveal() {
    const g = this.g;
    if (g.phase !== 'reveal') return;
    const r = g.reveal;
    if (r.banished) {
      if (r.role === 'lunatic') return this.endGame('lunatic', r.banished);
      const cult = this.livingCultists().length;
      if (cult === 0) return this.endGame('town');
      if (cult >= g.alive.length - cult) {
        if (g.final) return this.startRising();
        return this.endGame('cult');
      }
    }
    g.day++;
    this.beginNight();
  }

  // ---------- objectives ----------
  checkObjective(pid, atEnd = false) {
    const g = this.g;
    const o = g?.objectives[pid];
    if (!o || o.done) return;
    const st = g.stats[pid]; if (!st) return;
    const aliveNow = this.alive(pid);
    let done = false;
    switch (o.id) {
      case 'survive': done = atEnd && aliveNow; break;
      case 'majority3': done = st.majorityVotes >= 3; break;
      case 'votedCultist': done = !!st.helpedBanishCultist; break;
      case 'hauntedSurvive': done = atEnd && aliveNow && st.hauntedCount > 0; break;
      case 'visit3': done = st.locs.length >= 3; break;
      case 'holdTwo': done = (g.items[pid] || []).length >= 2; break;
      case 'useItem': done = !!st.usedItem; break;
      case 'neverWrong': done = atEnd && st.totalVotes >= 2 && st.wrongVotes === 0; break;
    }
    if (done) o.done = true;
  }

  // ---------- endgame / ceremony ----------
  endGame(winner, lunaticId = null) {
    const g = this.g;
    g.winner = winner;
    const camp = this.s.campaign;

    this.s.players.forEach((p) => this.checkObjective(p.id, true));

    // Elder Signs.
    const winners = [];
    for (const p of this.s.players) {
      const role = this.role(p.id);
      if (!role) continue;
      const team = ROLES[role].team;
      const won =
        (winner === 'cult' && team === 'cult') ||
        (winner === 'town' && team === 'town') ||
        (winner === 'lunatic' && p.id === lunaticId) ||
        (winner === 'dawn');
      if (won) { winners.push(p.id); this.addSign(p.id, winner === 'lunatic' ? 4 : winner === 'dawn' ? 2 : 3); }
      if (g.objectives[p.id]?.done) this.addSign(p.id, 2);
    }

    // Doom.
    if (winner === 'cult') camp.doom = Math.min(10, camp.doom + 2);
    else if (winner === 'dawn') camp.doom = Math.max(0, camp.doom - 3);
    else if (winner === 'oldone') camp.doom = 10;
    else camp.doom = Math.max(0, camp.doom - 1);

    // Titles.
    const titles = [];
    const byStat = (fn, min) => {
      let best = null, bestV = min - 1;
      for (const p of this.s.players) {
        const v = fn(g.stats[p.id] || {});
        if (v > bestV) { bestV = v; best = p.id; }
      }
      return best;
    };
    const t1 = byStat((s) => s.votedInnocent || 0, 2);
    if (t1) titles.push({ title: 'Most Paranoid', who: t1, note: 'voted against the most innocents' });
    const cultists = this.s.players.filter((p) => this.role(p.id) === 'cultist');
    if (cultists.length) {
      const st = cultists.sort((a, b) => (g.stats[b.id]?.daysSurvivedCultist || 0) - (g.stats[a.id]?.daysSurvivedCultist || 0))[0];
      titles.push({ title: 'Silver Tongue', who: st.id, note: 'survived longest as a cultist' });
    }
    const cassandra = this.s.players.find((p) => {
      const st = g.stats[p.id];
      return st && st.votedCultist > 0 && this.spirit(p.id) && this.role(p.id) && ROLES[this.role(p.id)].team === 'town' &&
        g.voteHistory.some((v) => v.banished === p.id);
    });
    if (cassandra) titles.push({ title: 'Cassandra', who: cassandra.id, note: 'was right — and got banished anyway' });
    const t4 = byStat((s) => s.whispers || 0, 2);
    if (t4) titles.push({ title: 'Chatterbox of the Beyond', who: t4, note: 'most whispers from the grave' });
    const t5 = byStat((s) => s.itemsFound || 0, 2);
    if (t5) titles.push({ title: 'Packrat of the Apocalypse', who: t5, note: 'hoarded the most items' });
    const t6 = byStat((s) => s.sanityLost || 0, 3);
    if (t6) titles.push({ title: 'Most Fragile Mind', who: t6, note: 'lost the most sanity' });

    const lineFn =
      winner === 'cult' ? pick(NARRATION.cultWin) :
      winner === 'town' ? pick(NARRATION.townWin) :
      winner === 'lunatic' ? () => pick(NARRATION.lunaticWin)(this.pname(lunaticId)) :
      winner === 'dawn' ? pick(NARRATION.risingWin) :
      pick(NARRATION.risingLose);

    g.ceremony = {
      winner,
      line: lineFn(),
      roles: this.s.players.filter((p) => this.role(p.id)).map((p) => ({ id: p.id, role: this.role(p.id) })),
      titles,
      objectives: this.s.players.map((p) => ({ id: p.id, obj: g.objectives[p.id] || null })),
      doom: camp.doom,
      signs: { ...camp.signs },
    };
    camp.games++;
    camp.log.push({ num: g.num, winner, doom: camp.doom });
    g.phase = 'gameover';
    g.deadline = null;
    this.fx(winner === 'cult' || winner === 'oldone' ? 'doom' : 'triumph');
  }

  // ---------- The Rising (boss finale) ----------
  startRising() {
    const g = this.g;
    g.pendingWin = null;
    const participants = this.s.players.filter((p) => this.role(p.id) || this.spirit(p.id)).map((p) => p.id);
    g.rising = {
      participants,
      round: 1, rounds: 3,
      successes: 0,
      needed: Math.max(4, Math.round(participants.length * 1.55)),
      dc: this.s.campaign.doom >= 6 ? 16 : 14,
      picks: {}, lastRolls: [],
    };
    this.setPhase('rising');
    this.fx('rising');
  }

  risingPick(pid, stat, spend) {
    const g = this.g;
    if (!g || g.phase !== 'rising' || !g.rising.participants.includes(pid)) return;
    if (!['brawn', 'wits', 'nerve'].includes(stat)) return;
    if (spend && !(g.items[pid] || []).length) spend = false;
    g.rising.picks[pid] = { stat, spend };
    if (g.rising.participants.every((id) => g.rising.picks[id])) this.resolveRisingRound(false);
  }

  resolveRisingRound(forced) {
    const g = this.g;
    if (g.phase !== 'rising') return;
    const r = g.rising;
    r.lastRolls = [];
    for (const id of r.participants) {
      const pickd = r.picks[id] || { stat: 'nerve', spend: false };
      const per = this.persona(this.player(id)) || { brawn: 1, wits: 1, nerve: 1 };
      let bonus = (per[pickd.stat] || 0) * 2;
      if (pickd.spend && (g.items[id] || []).length) { g.items[id].pop(); bonus += 3; }
      const die = 1 + rand(20);
      const total = die + bonus;
      const ok = total >= r.dc;
      if (ok) r.successes++;
      r.lastRolls.push({ id, stat: pickd.stat, die, bonus, total, ok, spent: pickd.spend });
    }
    r.picks = {};
    this.fx('dice');
    if (r.round >= r.rounds) {
      return this.endGame(r.successes >= r.needed ? 'dawn' : 'oldone');
    }
    r.round++;
    this.setPhase('rising');
  }

  // ---------- host utilities ----------
  extend() { const g = this.g; if (g?.deadline) g.deadline += 60e3; }
  forceAdvance() {
    const g = this.g;
    if (!g) return;
    if (g.deadline) g.deadline = now();
    this.tick();
  }

  // ---------- views ----------
  viewFor(conn) {
    const g = this.g;
    const hostId = this.hostId();
    const base = {
      mode: conn.role === 'tv' ? 'tv' : 'phone',
      code: this.s.code,
      fx: this.s.fx,
      doom: this.s.campaign.doom,
      games: this.s.campaign.games,
      phase: g ? g.phase : 'lobby',
      day: g?.day || 0,
      final: g?.final || false,
      deadline: this.deadline(),
      now: now(),
      players: this.s.players.map((p) => ({
        id: p.id, name: p.name, connected: p.connected,
        persona: this.persona(p),
        host: p.id === hostId,
        alive: g ? this.alive(p.id) : true,
        spirit: g ? this.spirit(p.id) : false,
        curse: g?.curse[p.id] ? { text: CURSES.find((c) => c.id === g.curse[p.id].curseId)?.text, broken: g.curse[p.id].broken } : null,
        quirks: g ? (g.quirks[p.id] || []).map((q) => CURSES.find((c) => c.id === q)?.text) : [],
        signs: this.s.campaign.signs[p.id] || 0,
      })),
    };
    if (conn.role === 'tv') return this.tvView(base);
    return this.phoneView(base, conn.playerId);
  }

  tvView(v) {
    const g = this.g;
    if (!g) return v;
    if (g.phase === 'night') {
      let waiting = 0;
      for (const id of g.alive) {
        const role = this.role(id);
        const done = ['cultist', 'medium', 'occultist'].includes(role) ? !!g.night.acts[id] : !!g.night.explores[id]?.result;
        if (!done) waiting++;
      }
      v.night = { waiting, total: g.alive.length, spirits: g.night.spiritsAtStart.length };
    }
    if (g.phase === 'dawn') v.dawnReport = g.dawnReport;
    if (g.phase === 'day' || g.phase === 'vote') {
      v.whispersFeed = g.whispersFeed;
      v.cursed = Object.entries(g.curse).map(([id, c]) => ({ id, name: this.pname(id), text: CURSES.find((x) => x.id === c.curseId)?.text, broken: c.broken }));
    }
    if (g.phase === 'vote') v.voteProgress = { voted: Object.keys(g.votes).filter((id) => this.alive(id)).length, total: g.alive.length };
    if (g.phase === 'reveal') v.reveal = { ...g.reveal, name: g.reveal.banished ? this.pname(g.reveal.banished) : null, roleInfo: g.reveal.role ? ROLES[g.reveal.role] : null };
    if (g.phase === 'rising') v.rising = { round: g.rising.round, rounds: g.rising.rounds, successes: g.rising.successes, needed: g.rising.needed, dc: g.rising.dc, lastRolls: g.rising.lastRolls.map((r) => ({ ...r, name: this.pname(r.id) })), picked: Object.keys(g.rising.picks).length, total: g.rising.participants.length };
    if (g.phase === 'gameover') v.ceremony = this.ceremonyView();
    return v;
  }

  ceremonyView() {
    const g = this.g;
    const c = g.ceremony;
    if (!c) return null;
    return {
      ...c,
      roles: c.roles.map((r) => ({ ...r, name: this.pname(r.id), roleInfo: ROLES[r.role] })),
      titles: c.titles.map((t) => ({ ...t, name: this.pname(t.who) })),
      objectives: c.objectives.map((o) => ({ name: this.pname(o.id), obj: o.obj ? { text: OBJECTIVES.find((x) => x.id === o.obj.id)?.text, done: o.obj.done } : null })),
      log: this.s.campaign.log,
    };
  }

  phoneView(v, pid) {
    const p = this.player(pid);
    const g = this.g;
    if (!p) { v.you = null; return v; }
    const you = {
      id: p.id, name: p.name, personaId: p.personaId,
      persona: this.persona(p),
      host: p.id === this.hostId(),
      token: p.token,
    };
    v.you = you;
    if (!g || g.phase === 'gameover') {
      you.personaChoices = PERSONAS.map((x) => {
        const owner = this.s.players.find((q) => q.personaId === x.id);
        return { ...x, takenBy: owner && owner.id !== pid ? owner.name : null, mine: owner?.id === pid };
      });
    }
    if (!g) return v;
    const role = this.role(pid);
    you.role = role;
    you.roleInfo = role ? ROLES[role] : null;
    you.alive = this.alive(pid);
    you.spirit = this.spirit(pid);
    you.sanity = g.sanity[pid] ?? null;
    you.maxSanity = MAX_SANITY;
    you.items = (g.items[pid] || []).map((i) => ITEMS[i]);
    you.quirks = (g.quirks[pid] || []).map((q) => CURSES.find((c) => c.id === q)?.text);
    you.curse = g.curse[pid] ? { text: CURSES.find((c) => c.id === g.curse[pid].curseId)?.text, broken: g.curse[pid].broken } : null;
    const obj = g.objectives[pid];
    you.objective = obj ? { text: OBJECTIVES.find((o) => o.id === obj.id)?.text, done: obj.done } : null;
    if (role === 'cultist') you.mates = g.alive.concat(g.spirits).filter((id) => id !== pid && this.role(id) === 'cultist').map((id) => this.pname(id));
    you.pressAvailable = !!g.lastTally && !g.pressReveals?.[pid];
    if (g.pressReveals?.[pid]) {
      const t = g.pressReveals[pid];
      you.pressTally = Object.entries(t.votesBy).map(([voter, target]) => ({ voter: this.pname(voter), target: target === 'abstain' ? '(abstained)' : this.pname(target) }));
    }

    if (g.phase === 'night' && you.alive) {
      if (['cultist', 'medium', 'occultist'].includes(role)) {
        const act = g.night.acts[pid];
        you.nightUI = {
          kind: role,
          submitted: !!act,
          targetName: act ? this.pname(act.target) : null,
          mediumResult: role === 'medium' && act ? act.result : null,
          targets: g.alive.filter((id) => (role === 'cultist' ? this.role(id) !== 'cultist' : role === 'medium' ? id !== pid : true)).map((id) => ({ id, name: this.pname(id) })),
        };
      } else {
        const ex = g.night.explores[pid];
        you.nightUI = { kind: 'explore' };
        if (!ex) {
          you.nightUI.locations = Object.entries(LOCATIONS).map(([id, l]) => ({ id, name: l.name, icon: l.icon }));
        } else {
          const scene = LOCATIONS[ex.loc].scenes.find((s) => s.id === ex.sceneId);
          you.nightUI.scene = { loc: LOCATIONS[ex.loc].name, text: scene.text, choices: scene.choices.map((c) => ({ label: c.label, check: c.check || null })) };
          you.nightUI.result = ex.result ? { ...ex.result, gained: ex.result.gained ? ITEMS[ex.result.gained] : null } : null;
        }
      }
    }
    if (g.phase === 'night' && you.spirit && g.night.spiritsAtStart.includes(pid)) {
      you.hauntUI = {
        submitted: !!g.night.haunts[pid],
        targets: g.alive.map((id) => ({ id, name: this.pname(id) })),
        curses: CURSES,
        current: g.night.haunts[pid] || null,
      };
    }
    if ((g.phase === 'day' || g.phase === 'vote') && you.spirit) {
      const used = g.whispersUsed[pid] || 0;
      you.whisperUI = { remaining: Math.max(0, WHISPERS_PER_DAY - used), options: WHISPERS, coolingDown: now() - g.lastWhisperAt < WHISPER_GAP };
    }
    if (g.phase === 'vote' && you.alive) {
      you.voteUI = { submitted: !!g.votes[pid], choice: g.votes[pid] || null, targets: g.alive.filter((id) => id !== pid).map((id) => ({ id, name: this.pname(id) })) };
    }
    if (g.phase === 'reveal' && role === 'archivist' && g.reveal?.banished) {
      you.archivist = { name: this.pname(g.reveal.banished), role: ROLES[g.reveal.role]?.name };
    }
    if (g.phase === 'rising' && g.rising.participants.includes(pid)) {
      you.risingUI = { picked: !!g.rising.picks[pid], stats: this.persona(p) || { brawn: 1, wits: 1, nerve: 1 }, canSpend: (g.items[pid] || []).length > 0, round: g.rising.round, rounds: g.rising.rounds };
    }
    if (g.phase === 'gameover') v.ceremony = this.ceremonyView();
    if (you.host) {
      you.hostUI = {
        canStart: !g || g.phase === 'gameover',
        phase: g.phase,
        cursed: Object.entries(g.curse).map(([id, c]) => ({ id, name: this.pname(id), broken: c.broken })),
      };
    }
    return v;
  }
}

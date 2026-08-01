// The complete game state machine for STRANGE IS THE NIGHT.
// Pure module: no I/O. Hosts (Cloudflare Durable Object / local Node server)
// call handle()/tick(), then broadcast viewFor() to each connection and
// persist serialize() output. All state is JSON-serializable.

import { PERSONAS, ROLES, CURSES, WHISPERS, ITEMS, LOCATIONS, OBJECTIVES, NARRATION, TITLES, DOOM_LINES, INTERLUDES, RISING_SCENES, RISING_BEATS, VISIONS, UNREST_LINES, NAME_EGGS } from './content.js';

const rand = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rand(a.length)];
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = rand(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const uid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
const now = () => Date.now();

export const TIMERS = { night: 180e3, dawn: 26e3, day: 180e3, vote: 90e3, reveal: 14e3, rising: 70e3 };
const MAX_SANITY = 5, START_SANITY = 5, RESET_SANITY = 3, MAX_ITEMS = 3;
// The Last Act's dials, gathered here because they are what you retune when
// the boss fight plays too easy or too mean. LEND_CAP is per living player,
// so the dead have to spread out; MASK_DC_CAP bounds how much harder a table
// of unrepentant Masked can make every scene.
const LEND_CAP = 4, PUSH_BONUS = 3, ITEM_BONUS = 3, FAVORED_BONUS = 2, POOR_PENALTY = 2, MASK_DC_CAP = 1;
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
  // The founding player: first-ever join. Host duties can temporarily hop to
  // another connected phone, but the guest list never leaves the founder.
  foundingId() {
    const all = [...this.s.players].sort((a, b) => a.joinOrder - b.joinOrder);
    return all[0]?.id || null;
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
  // Effective stats: persona base + campaign XP bumps.
  pstats(p) {
    const per = this.persona(p) || { brawn: 1, wits: 1, nerve: 1 };
    const b = p?.statBumps || {};
    return { brawn: per.brawn + (b.brawn || 0), wits: per.wits + (b.wits || 0), nerve: per.nerve + (b.nerve || 0) };
  }
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
      case 'assignEgg': return isHost && this.assignEgg(pid, msg.playerId, msg.egg);
      case 'kick': return isHost && this.kick(msg.playerId);
      case 'night': return this.nightAction(pid, msg.target);
      case 'explore': return this.explore(pid, msg.location);
      case 'exploreChoice': return this.exploreChoice(pid, msg.index);
      case 'haunt': return this.haunt(pid, msg.target, msg.curseId);
      case 'whisper': return this.whisper(pid, msg.index);
      case 'vote': return this.vote(pid, msg.target);
      case 'useItem': return this.useItem(pid, msg.item, msg.target);
      case 'tarot': return this.tarotDraw(pid, !!msg.use);
      case 'spendXp': return this.spendXp(pid, msg.stat);
      case 'risingPick': return this.risingPick(pid, msg.stat, !!msg.spend, !!msg.push);
      case 'risingSpirit': return this.risingSpirit(pid, msg.mode, msg.target);
      case 'risingMask': return this.risingMask(pid, !!msg.keep);
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
    // The game quietly recognizes certain names.
    const eggKey = name.toLowerCase();
    if (NAME_EGGS[eggKey]) p.egg = eggKey;
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

  // The founding host privately tags who a player really is; the Play takes
  // note. Overrides any auto-match from the typed join name.
  assignEgg(actorId, targetId, egg) {
    if (actorId !== this.foundingId()) return; // never a fallback host
    const p = this.player(targetId);
    if (!p) return;
    if (egg !== null && !NAME_EGGS[egg]) return;
    // An identity belongs to one player at a time.
    if (egg) for (const other of this.s.players) { if (other.egg === egg) other.egg = null; }
    p.egg = egg || null;
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
    g.nightLine = pick(NARRATION.nightScene);
    this.setPhase('night');
    this.fx('night');
  }

  doomLine() {
    const tier = Math.min(3, Math.floor(this.s.campaign.doom / 3));
    return pick(DOOM_LINES[tier]);
  }

  // ---------- night ----------
  nightAction(pid, target) {
    const g = this.g;
    if (!g || g.phase !== 'night' || !this.alive(pid)) return;
    const role = this.role(pid);
    if (!['cultist', 'medium', 'occultist', 'archivist'].includes(role)) return;
    if (!this.alive(target)) return;
    if (role === 'cultist' && this.role(target) === 'cultist') return;
    if ((role === 'medium' || role === 'archivist') && target === pid) return;
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
    if (['cultist', 'medium', 'occultist', 'archivist'].includes(role)) return;
    if (!LOCATIONS[location]) return;
    if (g.night.explores[pid]) return; // committed for the night
    const st = g.stats[pid];
    if (st) {
      if (!st.locs.includes(location)) st.locs.push(location);
      st.locCounts = st.locCounts || {};
      st.locCounts[location] = (st.locCounts[location] || 0) + 1;
    }
    const seen = (g.seenScenes[pid] = g.seenScenes[pid] || []);
    const all = LOCATIONS[location].scenes;
    const unseen = (list) => list.filter((s) => !seen.includes(location + ':' + s.id));
    // A rare scene opens the moment its gate is met — finding one is guaranteed, not lucky.
    const rares = unseen(all.filter((s) => s.rare && this.rareOpen(pid, location, s.gate)));
    let scene;
    const ex = { loc: location, sceneId: null, rare: false, result: null };
    if (rares.length) {
      scene = rares[0];
      ex.rare = true;
      if (scene.gate === 'key') {
        const items = g.items[pid] || [];
        const ki = items.indexOf('key');
        if (ki !== -1) items.splice(ki, 1); // the key stays in the lock
      }
      if (st) st.rareFound = true;
    } else {
      let scenes = unseen(all.filter((s) => !s.rare));
      if (!scenes.length) scenes = all.filter((s) => !s.rare);
      scene = pick(scenes);
    }
    seen.push(location + ':' + scene.id);
    ex.sceneId = scene.id;
    if ((g.sanity[pid] ?? MAX_SANITY) <= 2) ex.vision = pick(VISIONS);
    // The Palace knows some visitors by name. Once per evening.
    const player = this.player(pid);
    if (location === 'church' && player?.egg) {
      const camp = this.s.campaign;
      camp.eggSceneUsed = camp.eggSceneUsed || {};
      if (!camp.eggSceneUsed[player.egg]) {
        camp.eggSceneUsed[player.egg] = true;
        ex.egg = NAME_EGGS[player.egg].scene;
      }
    }
    g.night.explores[pid] = ex;
  }

  // preview=true asks "would tonight's visit open it?" for the location picker.
  rareOpen(pid, location, gate, preview = false) {
    const g = this.g;
    if (gate === 'key') return (g.items[pid] || []).includes('key');
    if (gate === 'visits') return (g.stats[pid]?.locCounts?.[location] || 0) >= (preview ? 2 : 3);
    if (gate === 'strange') return this.s.campaign.doom >= 5 || (this.s.campaign.unrest?.[location] || 0) >= 4;
    return false;
  }

  currentScene(ex) { return LOCATIONS[ex.loc].scenes.find((s) => s.id === ex.sceneId); }

  exploreChoice(pid, index) {
    const g = this.g;
    if (!g || g.phase !== 'night') return;
    const ex = g.night.explores[pid];
    if (!ex || ex.result || ex.await) return;
    const choices = ex.stage2 ? ex.stage2.choices : this.currentScene(ex).choices;
    const choice = choices[index === 1 ? 1 : 0];
    if (!choice) return;
    if (choice.check) {
      const roll = this.rollCheck(pid, choice.check, ex.loc);
      // The Hanged Man: on a failed roll, offer one redraw before fate lands.
      if (!roll.ok && !ex.tarotUsed && (g.items[pid] || []).includes('tarot')) {
        ex.await = { index, roll };
        return;
      }
      this.applyExplore(pid, ex, choice, roll.ok ? choice.success : choice.fail, roll);
    } else {
      this.applyExplore(pid, ex, choice, choice.outcome, null);
    }
    this.checkNightDone();
  }

  rollCheck(pid, check, loc) {
    const g = this.g;
    const per = this.pstats(this.player(pid));
    let bonus = (per[check.stat] || 0) * 2, charm = false;
    const items = g.items[pid] || [];
    const si = items.indexOf('seaglass');
    if (si !== -1) { items.splice(si, 1); bonus += 2; charm = true; }
    // Unrest stiffens a location's checks: +1 DC per 2 unrest, capped at +2.
    const dc = check.dc + Math.min(2, Math.floor((this.s.campaign.unrest?.[loc] || 0) / 2));
    const die = 1 + rand(20);
    const total = die + bonus;
    const ok = total >= dc;
    if (!ok) this.bumpUnrest(loc);
    return { die, stat: check.stat, bonus, total, dc, ok, charm };
  }

  bumpUnrest(loc) {
    const c = this.s.campaign;
    c.unrest = c.unrest || {};
    const before = c.unrest[loc] || 0;
    c.unrest[loc] = Math.min(6, before + 1);
    if (before < 4 && c.unrest[loc] >= 4) {
      const g = this.g;
      if (g) { g.unrestNews = g.unrestNews || []; g.unrestNews.push(LOCATIONS[loc].name); }
    }
  }

  applyExplore(pid, ex, choice, outcome, roll) {
    const g = this.g;
    if (outcome.sanity) {
      if (outcome.sanity < 0) this.loseSanity(pid, -outcome.sanity);
      else g.sanity[pid] = Math.min(MAX_SANITY, g.sanity[pid] + outcome.sanity);
    }
    let gained = null;
    if (outcome.item && (g.items[pid] || []).length < MAX_ITEMS) {
      g.items[pid].push(outcome.item);
      gained = outcome.item;
      const st = g.stats[pid];
      if (st) st.itemsFound++;
      this.checkObjective(pid);
    }
    if (outcome.next) {
      // The scene deepens: stash this beat, present the follow-up.
      ex.partial = { text: outcome.text, roll, gained };
      ex.stage2 = { text: outcome.next.text, choices: outcome.next.choices };
      return;
    }
    ex.result = { text: outcome.text, roll, choiceLabel: choice.label, gained, sanity: outcome.sanity || 0, tag: outcome.tag, partial: ex.partial || null };
  }

  tarotDraw(pid, use) {
    const g = this.g;
    if (!g || g.phase !== 'night') return;
    const ex = g.night.explores[pid];
    if (!ex || !ex.await) return;
    const { index, roll } = ex.await;
    const choices = ex.stage2 ? ex.stage2.choices : this.currentScene(ex).choices;
    const choice = choices[index === 1 ? 1 : 0];
    ex.await = null;
    ex.tarotUsed = true;
    let finalRoll = roll;
    if (use) {
      const items = g.items[pid] || [];
      const ti = items.indexOf('tarot');
      if (ti !== -1) {
        items.splice(ti, 1);
        const die = 1 + rand(20);
        const total = die + roll.bonus;
        finalRoll = { ...roll, die, total, ok: total >= roll.dc, redrawn: true };
        const st = g.stats[pid];
        if (st) st.usedItem = true;
        this.checkObjective(pid);
      }
    }
    this.applyExplore(pid, ex, choice, finalRoll.ok ? choice.success : choice.fail, finalRoll);
    this.checkNightDone();
  }

  spendXp(pid, stat) {
    const p = this.player(pid);
    if (!p || !['brawn', 'wits', 'nerve'].includes(stat)) return;
    if (this.g && this.g.phase !== 'gameover') return;
    if (!(p.xp > 0)) return;
    p.statBumps = p.statBumps || {};
    if ((p.statBumps[stat] || 0) >= 2) return; // +2 per stat is the ceiling
    p.statBumps[stat] = (p.statBumps[stat] || 0) + 1;
    p.xp--;
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
      if (['cultist', 'medium', 'occultist', 'archivist'].includes(role)) {
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
    // Finalize explorations cut short by the timer (mid-story or mid-tarot).
    for (const ex of Object.values(g.night.explores)) {
      if (ex && !ex.result && (ex.await || ex.stage2)) {
        ex.await = null;
        ex.result = { text: 'The night ran out before the tale finished. You hurry home with what you have.', roll: ex.partial?.roll || null, gained: null, sanity: 0, partial: ex.partial || null };
      }
    }
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
        // Half the time, the victim's persona gets their bespoke death scene.
        const per = this.persona(this.player(victim));
        if (per?.death && Math.random() < 0.5) report.push(per.death);
        else report.push(pick(NARRATION.dawnDeath)(this.pname(victim)));
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

    // The Courier's archive: a recognized victim's photo runs with the
    // obituary — once per person per evening. (Photo files are optional;
    // the TV hides the frame if none is uploaded.)
    g.dawnPhoto = null;
    if (death) {
      const dp = this.player(death);
      if (dp?.egg) {
        const campP = this.s.campaign;
        campP.eggPhotoUsed = campP.eggPhotoUsed || {};
        if (!campP.eggPhotoUsed[dp.egg]) {
          campP.eggPhotoUsed[dp.egg] = true;
          g.dawnPhoto = { egg: dp.egg };
        }
      }
    }

    // The Archivist's records: did their target leave an entry tonight?
    const archId = g.alive.concat(g.spirits).find((id) => this.role(id) === 'archivist');
    const archAct = archId ? g.night.acts[archId] : null;
    if (archId && archAct) {
      const ex = g.night.explores[archAct.target];
      g.lastArchive = {
        by: archId, target: archAct.target, day: g.day,
        loc: ex?.result ? LOCATIONS[ex.loc].name : null,
      };
    }

    // Dead Man's Watch: same record semantics as the Archivist, single-use.
    if (g.night.watch) {
      const w = g.night.watch;
      const wex = g.night.explores[w.target];
      g.lastWatch = { by: w.by, target: w.target, day: g.day, loc: wex?.result ? LOCATIONS[wex.loc].name : null };
    }

    // Fellow travelers: explorers who shared a location glimpse each other.
    // At sanity <= 2, one face in the fog may be wrong (25%).
    const byLoc = {};
    for (const [xpid, ex] of Object.entries(g.night.explores)) {
      if (ex?.result) (byLoc[ex.loc] = byLoc[ex.loc] || []).push(xpid);
    }
    g.sightings = {};
    for (const [loc, folks] of Object.entries(byLoc)) {
      if (folks.length < 2) continue;
      for (const xpid of folks) {
        let others = folks.filter((x) => x !== xpid);
        if ((g.sanity[xpid] ?? MAX_SANITY) <= 2 && Math.random() < 0.25) {
          const pool = g.alive.concat(g.spirits).filter((x) => x !== xpid && !others.includes(x));
          if (pool.length) others = [...others.slice(1), pick(pool)];
        }
        g.sightings[xpid] = { loc: LOCATIONS[loc].name, others: others.map((x) => this.pname(x)) };
      }
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
      const titems = g.items[hauntTarget] || [];
      const saltIdx = titems.indexOf('salt');
      if (saltIdx !== -1) {
        titems.splice(saltIdx, 1);
        report.push(`The spirits went for ${this.pname(hauntTarget)} — and found a ring of salt, laid neat and white across the doorstep. The curse broke on it like weather. The dead respect the classics.`);
        this.fx('haunt');
      } else {
        g.curse[hauntTarget] = { curseId: hauntCurse, broken: false };
        const ctext = CURSES.find((c) => c.id === hauntCurse).text;
        report.push(pick(NARRATION.haunt)(this.pname(hauntTarget), ctext.toLowerCase() + '.'));
        this.loseSanity(hauntTarget, 1);
        const st = g.stats[hauntTarget]; if (st) st.hauntedCount++;
        this.fx('haunt');
      }
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

    if (g.unrestNews?.length) {
      for (const name of g.unrestNews) report.push(pick(UNREST_LINES)(name));
      g.unrestNews = [];
    }

    // The Courier's daily notice — sometimes it prints something personal.
    const camp = this.s.campaign;
    camp.eggCourierUsed = camp.eggCourierUsed || {};
    const eggCandidates = this.s.players.filter((p) => p.egg && this.role(p.id) && !camp.eggCourierUsed[p.egg]);
    if (eggCandidates.length && Math.random() < 0.35) {
      const chosen = pick(eggCandidates);
      camp.eggCourierUsed[chosen.egg] = true;
      report.push(NAME_EGGS[chosen.egg].courier);
    } else {
      report.push(pick(NARRATION.advertiser));
    }

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

  // Spirit whisper options: the curated list, plus one personal line for
  // each living player the game recognizes (fires once per evening each).
  whisperOptions() {
    const camp = this.s.campaign;
    camp.eggWhisperUsed = camp.eggWhisperUsed || {};
    const eggs = this.s.players
      .filter((p) => p.egg && !camp.eggWhisperUsed[p.egg] && this.alive(p.id))
      .sort((a, b) => a.joinOrder - b.joinOrder)
      .map((p) => NAME_EGGS[p.egg].whisper);
    return WHISPERS.concat(eggs);
  }

  whisper(pid, index) {
    const g = this.g;
    if (!g || !['day', 'vote'].includes(g.phase) || !this.spirit(pid)) return;
    const options = this.whisperOptions();
    if (typeof options[index] !== 'string') return;
    const used = g.whispersUsed[pid] || 0;
    if (used >= WHISPERS_PER_DAY) return;
    if (now() - g.lastWhisperAt < WHISPER_GAP) return;
    const text = options[index];
    if (index >= WHISPERS.length) {
      // A personal whisper: it fires once per evening, then is gone.
      const owner = this.s.players.find((p) => p.egg && NAME_EGGS[p.egg].whisper === text);
      if (owner) this.s.campaign.eggWhisperUsed[owner.egg] = true;
    }
    g.whispersUsed[pid] = used + 1;
    g.lastWhisperAt = now();
    g.whispersFeed.push({ text, at: now() });
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
    } else if (item === 'watch' && g.phase === 'night' && this.alive(pid) && this.alive(target) && target !== pid && !g.night.watch) {
      g.night.watch = { by: pid, target };
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

  // How many votes it takes to cast a neighbor out: half the town that still
  // HAS a vote, rounded up, and never fewer than two. Abstaining does not
  // lower the bar — a silent town protects the accused, which is the point.
  // (Players who broke their haunting curse forfeited their vote, so they
  // don't count toward the bar they can no longer help clear.)
  voteThreshold() {
    const g = this.g;
    if (!g) return 0;
    const eligible = g.alive.filter((id) => !g.curse[id]?.broken).length;
    return Math.max(2, Math.ceil(eligible / 2));
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
    const threshold = this.voteThreshold();
    const max = Math.max(0, ...Object.values(counts));
    const leaders = Object.keys(counts).filter((t) => counts[t] === max && max > 0);
    // Banishment needs a single clear leader who also clears the threshold.
    let banished = leaders.length === 1 && max >= threshold ? leaders[0] : null;
    const reason = banished ? null : leaders.length > 1 ? 'tie' : max === 0 ? 'silence' : 'short';

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
      if (reason === 'tie') line = pick(NARRATION.tie)();
      else if (reason === 'silence') line = pick(NARRATION.silence)();
      else line = pick(NARRATION.shortfall)(this.pname(leaders[0]), max, threshold);
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
    g.lastTally = { day: g.day, votesBy, counts, banished, threshold };
    g.reveal = {
      banished, role: banished ? this.role(banished) : null,
      tie: !banished, reason, counts, threshold, top: max,
      topName: leaders.length === 1 ? this.pname(leaders[0]) : null,
      line,
    };
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
      // A Masked who never took the mask off in the Last Act is vindicated if
      // the King takes the stage — and wins alone, like the Lunatic. If the
      // curtain falls instead, they get nothing: they bet against the town.
      const kept = g.rising?.masks?.[p.id] === 'kept';
      const won =
        (winner === 'cult' && team === 'cult') ||
        (winner === 'town' && team === 'town') ||
        (winner === 'lunatic' && p.id === lunaticId) ||
        (winner === 'oldone' && kept) ||
        (winner === 'dawn' && !kept);
      if (won) { winners.push(p.id); this.addSign(p.id, winner === 'lunatic' || winner === 'oldone' ? 4 : winner === 'dawn' ? 2 : 3); }
      if (g.objectives[p.id]?.done) this.addSign(p.id, 2);
    }

    // Doom.
    if (winner === 'cult') camp.doom = Math.min(10, camp.doom + 2);
    else if (winner === 'dawn') camp.doom = Math.max(0, camp.doom - 3);
    else if (winner === 'oldone') camp.doom = 10;
    else camp.doom = Math.max(0, camp.doom - 1);
    camp.doomLine = this.doomLine(); // stable flavor line until doom changes again

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
      titles.push({ title: 'Silver Tongue', who: st.id, note: 'survived longest among the Masked' });
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
    if (g.rising) {
      const tal = g.rising.tally || {};
      const ranked = Object.keys(tal).sort((a, b) => tal[b].verses - tal[a].verses);
      if (ranked[0] && tal[ranked[0]].verses >= 2) titles.push({ title: 'Curtain-Puller', who: ranked[0], note: `unwound ${tal[ranked[0]].verses} of the King's verses` });
      const nerviest = Object.keys(tal).sort((a, b) => tal[b].pushes - tal[a].pushes)[0];
      if (nerviest && tal[nerviest].pushes >= 2) titles.push({ title: 'Recklessly Magnificent', who: nerviest, note: 'threw themselves at the Play the hardest' });
      const keeper = g.rising.living.find((id) => g.rising.masks[id] === 'kept');
      if (keeper) titles.push({ title: 'Never Took It Off', who: keeper, note: `kept the mask on and took ${tal[keeper]?.kingHits || 0} out of the town` });
    }

    // Experience for the campaign: survive, quest, win, rare discovery.
    const xpRows = [];
    for (const p of this.s.players) {
      if (!this.role(p.id)) continue;
      let gain = 0;
      if (this.alive(p.id)) gain++;
      if (g.objectives[p.id]?.done) gain++;
      if (winners.includes(p.id)) gain++;
      if (g.stats[p.id]?.rareFound) gain++;
      if ((g.rising?.tally?.[p.id]?.verses || 0) >= 3) gain++; // stood up in the Last Act
      if (gain) p.xp = (p.xp || 0) + gain;
      xpRows.push({ id: p.id, gained: gain, total: p.xp || 0 });
    }

    const lineFn =
      winner === 'cult' ? pick(NARRATION.cultWin) :
      winner === 'town' ? pick(NARRATION.townWin) :
      winner === 'lunatic' ? () => pick(NARRATION.lunaticWin)(this.pname(lunaticId)) :
      winner === 'dawn' ? pick(NARRATION.risingWin) :
      pick(NARRATION.risingLose);

    g.ceremony = {
      winner,
      line: lineFn(),
      interlude: pick(INTERLUDES[winner] || INTERLUDES.town),
      doomLine: camp.doomLine,
      roles: this.s.players.filter((p) => this.role(p.id)).map((p) => ({ id: p.id, role: this.role(p.id) })),
      titles,
      objectives: this.s.players.map((p) => ({ id: p.id, obj: g.objectives[p.id] || null })),
      xp: xpRows,
      doom: camp.doom,
      signs: { ...camp.signs },
      lastAct: g.rising ? {
        rounds: g.rising.log.length, of: g.rising.rounds,
        verses: g.rising.verses, versesLeft: g.rising.versesLeft,
        resolve: g.rising.resolve, resolveMax: g.rising.resolveMax,
        keepers: g.rising.living.filter((id) => g.rising.masks[id] === 'kept'),
        log: g.rising.log,
        tally: Object.entries(g.rising.tally)
          .filter(([, t]) => t.verses > 0 || t.kingHits > 0 || t.lends > 0 || t.burned > 0)
          .sort((a, b) => b[1].verses - a[1].verses || b[1].kingHits - a[1].kingHits)
          .map(([id, t]) => ({ id, ...t })),
      } : null,
    };
    camp.games++;
    camp.log.push({ num: g.num, winner, doom: camp.doom });
    g.phase = 'gameover';
    g.deadline = null;
    this.fx(winner === 'cult' || winner === 'oldone' ? 'doom' : 'triumph');
  }

  // ---------- The Last Act (boss finale) ----------
  // A five-scene cooperative fight. Each scene favors one stat and punishes
  // another; the living roll, the dead either lend their strength or wail at
  // the King themselves, and any surviving Masked must decide, on the record,
  // whether to take the mask off. Two tracks run against each other: the
  // King's VERSES (unwind them all and the curtain falls) and the town's
  // RESOLVE (spend it all and the town joins the cast).
  startRising() {
    const g = this.g;
    g.pendingWin = null;
    const participants = this.s.players.filter((p) => this.role(p.id) || this.spirit(p.id)).map((p) => p.id);
    const living = participants.filter((id) => this.alive(id));
    const spirits = participants.filter((id) => !this.alive(id));
    const doom = this.s.campaign.doom;
    const r = g.rising = {
      participants, living, spirits,
      round: 1, rounds: RISING_SCENES.length,
      baseDc: 16 + (doom >= 4 ? 1 : 0) + (doom >= 7 ? 1 : 0),
      picks: {}, spiritPicks: {}, masks: {},
      lastRolls: [], lastSpirits: [], lastDc: null, log: [], tally: {},
    };
    // How long the Play runs isn't known until the town knows who is in it —
    // the verse count is struck once the Masked have declared (see
    // resolveRisingRound). Until then both are null and the TV shows a shrug.
    r.verses = null;
    r.versesLeft = null;
    r.resolveMax = Math.max(6, living.length * 2 + spirits.length);
    r.resolve = r.resolveMax;
    for (const id of participants) {
      r.tally[id] = { verses: 0, kingHits: 0, successes: 0, fails: 0, burned: 0, pushes: 0, lends: 0, best: 0 };
    }
    this.setPhase('rising');
    this.fx('rising');
  }

  risingScene() { const r = this.g?.rising; return r ? RISING_SCENES[Math.min(r.round - 1, RISING_SCENES.length - 1)] : null; }
  maskKept(id) { return this.g?.rising?.masks[id] === 'kept'; }
  risingKeepers() { const r = this.g.rising; return r.living.filter((id) => r.masks[id] === 'kept').length; }
  // The King's verses scale to whoever actually stands against him; the dead
  // count for less, since they can only push from behind the curtain.
  risingVerses() {
    const r = this.g.rising;
    const standing = r.living.filter((id) => !this.maskKept(id)).length;
    return Math.max(11, Math.round(standing * 4 + r.spirits.length * 1.9));
  }
  risingDc() {
    const r = this.g.rising;
    return r.baseDc + (this.risingScene().dcMod || 0) + Math.min(MASK_DC_CAP, this.risingKeepers());
  }
  bestStat(id) {
    const s = this.pstats(this.player(id));
    return ['nerve', 'wits', 'brawn'].reduce((a, b) => (s[b] > s[a] ? b : a), 'nerve');
  }
  // A living player's total modifier for a stat in the current scene.
  risingMod(id, stat) {
    const sc = this.risingScene();
    const s = this.pstats(this.player(id));
    return (s[stat] || 0) * 2 + (stat === sc.favored ? FAVORED_BONUS : 0) + (stat === sc.poor ? -POOR_PENALTY : 0);
  }

  // The living choose a stance. `push` is the reckless option: a bonus now,
  // and a failure costs an extra point of the town's resolve plus a point of
  // sanity. A Masked who kept the mask picks a stance too — theirs performs
  // the Play, and every landed roll takes a piece of the town instead.
  risingPick(pid, stat, spend, push) {
    const g = this.g;
    if (!g || g.phase !== 'rising') return;
    const r = g.rising;
    if (!r.living.includes(pid)) return;
    if (this.role(pid) === 'cultist' && !r.masks[pid]) return; // must declare first
    if (!['brawn', 'wits', 'nerve'].includes(stat)) return;
    if (spend && !(g.items[pid] || []).length) spend = false;
    if (this.maskKept(pid)) push = false; // nothing left of theirs to spend
    r.picks[pid] = { stat, spend: !!spend, push: !!push };
    this.checkRisingDone();
  }

  // The dead: lend two points to a living neighbor, or throw themselves at
  // the King directly (harder, but the dead have no resolve left to lose).
  risingSpirit(pid, mode, target) {
    const g = this.g;
    if (!g || g.phase !== 'rising') return;
    const r = g.rising;
    if (!r.spirits.includes(pid)) return;
    if (mode === 'lend') {
      if (!r.living.includes(target) || this.maskKept(target)) return;
      r.spiritPicks[pid] = { mode: 'lend', target };
    } else if (mode === 'wail') {
      r.spiritPicks[pid] = { mode: 'wail', target: null };
    } else return;
    this.checkRisingDone();
  }

  // A surviving Masked declares, once and for all, which side of the curtain
  // they are standing on. Keeping the mask means you go on performing: your
  // rolls take the town's resolve instead of the King's verses, the dead will
  // not lend you a hand, and every scene runs a little harder for everyone.
  // It pays out — alone — if the King takes the stage.
  risingMask(pid, keep) {
    const g = this.g;
    if (!g || g.phase !== 'rising') return;
    const r = g.rising;
    if (this.role(pid) !== 'cultist' || !r.living.includes(pid)) return;
    if (r.masks[pid]) return; // no take-backs
    r.masks[pid] = keep ? 'kept' : 'repented';
    if (keep) { delete r.picks[pid]; this.fx('haunt'); }
    this.checkRisingDone();
  }

  checkRisingDone() {
    const r = this.g.rising;
    for (const id of r.living) {
      if (this.role(id) === 'cultist' && !r.masks[id]) return;
      if (!r.picks[id]) return;
    }
    for (const id of r.spirits) if (!r.spiritPicks[id]) return;
    this.resolveRisingRound(false);
  }

  resolveRisingRound(forced) {
    const g = this.g;
    if (g.phase !== 'rising') return;
    const r = g.rising;
    // Anyone who never answered the question takes the mask off by default —
    // a phone in a pocket doesn't get to side with the King.
    for (const id of r.living) if (this.role(id) === 'cultist' && !r.masks[id]) r.masks[id] = 'repented';
    // Now that the sides are known, the Play's length is fixed.
    if (r.verses === null) { r.verses = this.risingVerses(); r.versesLeft = r.verses; }
    const scene = this.risingScene();
    const dc = this.risingDc();
    r.lastRolls = []; r.lastSpirits = []; r.lastDc = dc; r.lastScene = scene.id;
    let versesOff = 0, resolveOff = 0;

    // Spirits move first — a lent hand has to arrive before the living roll.
    const lent = {};
    for (const id of r.spirits) {
      const sp = r.spiritPicks[id] || { mode: 'wail' };
      if (sp.mode === 'lend' && r.living.includes(sp.target) && !this.maskKept(sp.target)) {
        // No more than two of the dead can crowd one living soul: +4 is the ceiling.
        lent[sp.target] = Math.min(LEND_CAP, (lent[sp.target] || 0) + 2);
        r.tally[id].lends++;
        r.lastSpirits.push({ id, mode: 'lend', target: sp.target });
      } else {
        // Wailing is uphill work: the dead roll flat, with no stat to lean on.
        const die = 1 + rand(20);
        const total = die + 4;
        const ok = total >= dc;
        if (ok) { versesOff++; r.tally[id].verses++; r.tally[id].successes++; }
        else r.tally[id].fails++;
        r.tally[id].best = Math.max(r.tally[id].best, total);
        r.lastSpirits.push({ id, mode: 'wail', die, total, ok });
      }
    }

    for (const id of r.living) {
      const forKing = this.maskKept(id);
      const pickd = r.picks[id] || { stat: this.bestStat(id), spend: false, push: false };
      const favored = pickd.stat === scene.favored, poor = pickd.stat === scene.poor;
      let bonus = this.risingMod(id, pickd.stat);
      let burned = null;
      if (pickd.spend && (g.items[id] || []).length) { burned = g.items[id].pop(); bonus += ITEM_BONUS; r.tally[id].burned++; }
      if (!forKing && pickd.push) { bonus += PUSH_BONUS; r.tally[id].pushes++; }
      const lend = forKing ? 0 : lent[id] || 0; // nobody dead lends a hand to a mask
      bonus += lend;
      const die = 1 + rand(20);
      const total = die + bonus;
      const crit = die === 20, fumble = die === 1;
      const ok = crit || (!fumble && total >= dc);
      let gain = 0, cost = 0;
      if (forKing) {
        // The performance lands: it comes straight out of the town.
        if (ok) { cost = 1 + (crit ? 1 : 0); resolveOff += cost; r.tally[id].successes++; r.tally[id].kingHits += cost; }
        else r.tally[id].fails++;
      } else if (ok) {
        gain = 1 + (favored ? 1 : 0) + (crit ? 1 : 0);
        versesOff += gain;
        r.tally[id].successes++; r.tally[id].verses += gain;
      } else {
        cost = 1 + (pickd.push ? 1 : 0) + (fumble ? 1 : 0);
        resolveOff += cost;
        r.tally[id].fails++;
        if (pickd.push) this.loseSanity(id, 1);
      }
      r.tally[id].best = Math.max(r.tally[id].best, total);
      r.lastRolls.push({ id, stat: pickd.stat, die, bonus, total, ok, crit, fumble, gain, cost, lend, favored, poor, forKing, push: !forKing && !!pickd.push, spent: !!burned, burned });
    }

    r.versesLeft = Math.max(0, r.versesLeft - versesOff);
    r.resolve = Math.max(0, r.resolve - resolveOff);
    r.picks = {}; r.spiritPicks = {};
    const beat = r.versesLeft <= 3 && r.versesLeft > 0 ? pick(RISING_BEATS.surge)
      : r.resolve <= 2 && r.resolve > 0 ? pick(RISING_BEATS.grim)
        : versesOff > resolveOff ? pick(RISING_BEATS.good) : pick(RISING_BEATS.bad);
    r.lastBeat = beat;
    r.log.push({ round: r.round, scene: scene.id, title: scene.title, dc, versesOff, resolveOff, versesLeft: r.versesLeft, resolve: r.resolve, sceneLine: versesOff > resolveOff ? scene.good : scene.bad, beat });
    this.fx('dice');

    if (r.versesLeft <= 0) return this.endGame('dawn');
    if (r.resolve <= 0) return this.endGame('oldone');
    if (r.round >= r.rounds) return this.endGame('oldone');
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
      doomLine: this.s.campaign.games > 0 ? this.s.campaign.doomLine || null : null,
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
    if (!g || g.phase === 'gameover') {
      // Lobby / between games: the TV cycles the role deck for newcomers.
      v.cast = Object.values(ROLES).map((r) => ({ name: r.name, icon: r.icon, desc: r.desc, team: r.team }));
    }
    if (!g) return v;
    if (g.phase === 'night') {
      let waiting = 0;
      for (const id of g.alive) {
        const role = this.role(id);
        const done = ['cultist', 'medium', 'occultist', 'archivist'].includes(role) ? !!g.night.acts[id] : !!g.night.explores[id]?.result;
        if (!done) waiting++;
      }
      v.night = { waiting, total: g.alive.length, spirits: g.night.spiritsAtStart.length, line: g.nightLine };
    }
    if (g.phase === 'dawn') {
      v.dawnReport = g.dawnReport;
      if (g.dawnPhoto) v.dawnPhoto = {
        src: 'eggs/' + g.dawnPhoto.egg + '.jpg',
        caption: `From the Courier archive: ${g.dawnPhoto.egg.toUpperCase()}, photographed outside the Palace. The plate is dated 1912.`,
      };
    }
    if (g.phase === 'day' || g.phase === 'vote') {
      v.whispersFeed = g.whispersFeed;
      v.cursed = Object.entries(g.curse).map(([id, c]) => ({ id, name: this.pname(id), text: CURSES.find((x) => x.id === c.curseId)?.text, broken: c.broken }));
    }
    if (g.phase === 'vote') v.voteProgress = { voted: Object.keys(g.votes).filter((id) => this.alive(id)).length, total: g.alive.length, threshold: this.voteThreshold() };
    if (g.phase === 'reveal') v.reveal = { ...g.reveal, name: g.reveal.banished ? this.pname(g.reveal.banished) : null, roleInfo: g.reveal.role ? ROLES[g.reveal.role] : null };
    if (g.phase === 'rising') v.rising = this.risingTvView();
    if (g.phase === 'gameover') v.ceremony = this.ceremonyView();
    return v;
  }

  risingTvView() {
    const g = this.g, r = g.rising;
    const scene = this.risingScene();
    const shortName = (id) => this.pname(id).split(' ').slice(-1)[0];
    const waitingLiving = r.living.filter((id) => !r.picks[id]).length;
    const waitingSpirits = r.spirits.filter((id) => !r.spiritPicks[id]).length;
    const rollers = r.living.length;
    return {
      round: r.round, rounds: r.rounds,
      scene: { id: scene.id, title: scene.title, text: scene.text, favored: scene.favored, poor: scene.poor },
      dc: this.risingDc(),
      verses: r.verses, versesLeft: r.versesLeft,
      resolve: r.resolve, resolveMax: r.resolveMax,
      keepers: this.risingKeepers(),
      picked: rollers + r.spirits.length - waitingLiving - waitingSpirits,
      total: rollers + r.spirits.length,
      lastRolls: r.lastRolls.map((x) => ({ ...x, name: shortName(x.id), item: x.burned ? ITEMS[x.burned]?.icon || null : null })),
      lastSpirits: r.lastSpirits.map((x) => ({ ...x, name: shortName(x.id), targetName: x.target ? shortName(x.target) : null })),
      lastBeat: r.lastBeat || null,
      lastLine: r.log.length ? r.log[r.log.length - 1].sceneLine : null,
    };
  }

  ceremonyView() {
    const g = this.g;
    const c = g.ceremony;
    if (!c) return null;
    return {
      ...c,
      lastAct: c.lastAct ? {
        ...c.lastAct,
        keepers: c.lastAct.keepers.map((id) => this.pname(id)),
        tally: c.lastAct.tally.map((t) => ({ ...t, name: this.pname(t.id) })),
      } : null,
      roles: c.roles.map((r) => ({ ...r, name: this.pname(r.id), roleInfo: ROLES[r.role] })),
      titles: c.titles.map((t) => ({ ...t, name: this.pname(t.who) })),
      objectives: c.objectives.map((o) => ({ name: this.pname(o.id), obj: o.obj ? { text: OBJECTIVES.find((x) => x.id === o.obj.id)?.text, done: o.obj.done } : null })),
      xp: (c.xp || []).map((x) => ({ ...x, name: this.pname(x.id) })),
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
    if (you.host) {
      you.hostUI = {
        canStart: !g || g.phase === 'gameover',
        phase: g ? g.phase : 'lobby',
        cursed: g ? Object.entries(g.curse).map(([id, c]) => ({ id, name: this.pname(id), broken: c.broken })) : [],
      };
      // The guest list is for the founding host's eyes only — a fallback
      // host inheriting the controls never sees the tags.
      if (pid === this.foundingId()) {
        you.hostUI.eggKeys = Object.keys(NAME_EGGS);
        you.hostUI.eggs = this.s.players.map((q) => ({ id: q.id, name: q.name, egg: q.egg || null }));
      }
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
      if (['cultist', 'medium', 'occultist', 'archivist'].includes(role)) {
        const act = g.night.acts[pid];
        you.nightUI = {
          kind: role,
          submitted: !!act,
          targetName: act ? this.pname(act.target) : null,
          mediumResult: role === 'medium' && act ? act.result : null,
          targets: g.alive.filter((id) => (role === 'cultist' ? this.role(id) !== 'cultist' : (role === 'medium' || role === 'archivist') ? id !== pid : true)).map((id) => ({ id, name: this.pname(id) })),
        };
      } else {
        const ex = g.night.explores[pid];
        you.nightUI = { kind: 'explore', hasWatch: (g.items[pid] || []).includes('watch') && !g.night.watch };
        if (!ex) {
          you.nightUI.locations = Object.entries(LOCATIONS).map(([id, l]) => ({
            id, name: l.name, icon: l.icon,
            unrest: Math.min(6, this.s.campaign.unrest?.[id] || 0),
            rareReady: l.scenes.some((s) => s.rare && !(g.seenScenes[pid] || []).includes(id + ':' + s.id) && this.rareOpen(pid, id, s.gate, true)),
          }));
        } else {
          const scene = this.currentScene(ex);
          const choices = ex.stage2 ? ex.stage2.choices : scene.choices;
          you.nightUI.scene = {
            loc: LOCATIONS[ex.loc].name,
            rare: !!ex.rare,
            text: ex.stage2 ? ex.stage2.text : scene.text,
            egg: ex.egg || null,
            eggImg: ex.egg && this.player(pid)?.egg ? 'eggs/' + this.player(pid).egg + '.jpg' : null,
            vision: ex.stage2 ? null : ex.vision || null,
            deeper: !!ex.stage2,
            partial: ex.partial ? { ...ex.partial, gained: ex.partial.gained ? ITEMS[ex.partial.gained] : null } : null,
            choices: choices.map((c) => ({ label: c.label, check: c.check || null })),
          };
          you.nightUI.await = ex.await ? { roll: ex.await.roll } : null;
          you.nightUI.result = ex.result ? {
            ...ex.result,
            gained: ex.result.gained ? ITEMS[ex.result.gained] : null,
            partial: ex.result.partial ? { ...ex.result.partial, gained: ex.result.partial.gained ? ITEMS[ex.result.partial.gained] : null } : null,
          } : null;
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
      you.whisperUI = { remaining: Math.max(0, WHISPERS_PER_DAY - used), options: this.whisperOptions(), coolingDown: now() - g.lastWhisperAt < WHISPER_GAP };
    }
    if (g.phase === 'vote' && you.alive) {
      you.voteUI = {
        submitted: !!g.votes[pid], choice: g.votes[pid] || null,
        threshold: this.voteThreshold(),
        eligible: g.alive.filter((id) => !g.curse[id]?.broken).length,
        targets: g.alive.filter((id) => id !== pid).map((id) => ({ id, name: this.pname(id) })),
      };
    }
    if (role === 'archivist' && g.lastArchive?.by === pid) {
      you.archive = { name: this.pname(g.lastArchive.target), loc: g.lastArchive.loc, day: g.lastArchive.day };
    }
    if (g.lastWatch?.by === pid) {
      you.watch = { name: this.pname(g.lastWatch.target), loc: g.lastWatch.loc, day: g.lastWatch.day };
    }
    if (g.sightings?.[pid] && g.phase !== 'night') {
      you.sighting = g.sightings[pid];
    }
    you.stats = this.pstats(p);
    if (g.phase === 'rising' && g.rising.participants.includes(pid)) {
      const r = g.rising;
      const scene = this.risingScene();
      const living = r.living.includes(pid);
      const kept = this.maskKept(pid);
      const mustDeclare = living && role === 'cultist' && !r.masks[pid];
      you.risingUI = {
        kind: kept ? 'masked' : living ? 'living' : 'spirit',
        round: r.round, rounds: r.rounds, dc: this.risingDc(),
        verses: r.verses, versesLeft: r.versesLeft, resolve: r.resolve, resolveMax: r.resolveMax,
        scene: { title: scene.title, text: scene.text, favored: scene.favored, poor: scene.poor, stances: scene.stances },
        keepers: this.risingKeepers(),
        mask: r.masks[pid] || null, mustDeclare,
        picked: living ? !!r.picks[pid] : !!r.spiritPicks[pid],
        pick: living ? r.picks[pid] || null : r.spiritPicks[pid] || null,
        stats: this.pstats(p),
        mods: living ? { brawn: this.risingMod(pid, 'brawn'), wits: this.risingMod(pid, 'wits'), nerve: this.risingMod(pid, 'nerve') } : null,
        canSpend: (g.items[pid] || []).length > 0,
        lendTargets: living ? null : r.living.filter((id) => !this.maskKept(id)).map((id) => ({ id, name: this.pname(id) })),
        lastBeat: r.lastBeat || null,
        lastLine: r.log.length ? r.log[r.log.length - 1].sceneLine : null,
      };
    }
    if (g.phase === 'gameover') {
      v.ceremony = this.ceremonyView();
      you.xp = p.xp || 0;
      you.bumps = p.statBumps || {};
    }
    return v;
  }
}

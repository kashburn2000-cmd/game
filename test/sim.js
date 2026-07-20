// Engine smoke test: drives complete games through every phase and asserts
// the state machine behaves. Run: npm test
import { Engine, newRoom } from '../src/engine/engine.js';

let failures = 0;
const ok = (cond, label) => {
  if (cond) console.log('  ✓', label);
  else { failures++; console.error('  ✗ FAIL:', label); }
};
const section = (t) => console.log('\n== ' + t);

function views(engine, conns) {
  // Rendering every view at every step catches crashes in viewFor.
  engine.viewFor({ role: 'tv', playerId: null });
  for (const c of conns) engine.viewFor(c);
  if (engine.s.lastError) { console.error('  engine error:', engine.s.lastError); failures++; engine.s.lastError = null; }
}

function advanceTimer(engine) {
  engine.s.game.deadline = Date.now() - 1000;
  engine.tick();
}

function doNight(engine, conns, { cultTarget, mediumTarget, wardTarget } = {}) {
  const g = engine.s.game;
  const role = (id) => g.roles[id];
  const aliveNonCult = g.alive.filter((id) => role(id) !== 'cultist');
  for (const c of [...conns]) {
    const id = c.playerId;
    if (!g.alive.includes(id)) continue;
    const r = role(id);
    if (r === 'cultist') engine.handle(c, { type: 'night', target: cultTarget || aliveNonCult[0] });
    else if (r === 'medium') engine.handle(c, { type: 'night', target: mediumTarget || g.alive.find((x) => x !== id) });
    else if (r === 'occultist') engine.handle(c, { type: 'night', target: wardTarget || id });
    else {
      engine.handle(c, { type: 'explore', location: 'docks' });
      engine.handle(c, { type: 'exploreChoice', index: 1 });
    }
    views(engine, conns);
  }
}

function doVote(engine, conns, target) {
  const g = engine.s.game;
  for (const c of conns) {
    if (!g.alive.includes(c.playerId)) continue;
    engine.handle(c, { type: 'vote', target: target === c.playerId ? 'abstain' : target });
  }
}

// ---------------- game 1: full town win at 8 players ----------------
section('setup: 8 players join');
const engine = new Engine(newRoom('TEST'));
const conns = [];
for (let i = 0; i < 8; i++) {
  const c = { role: 'player', playerId: null };
  engine.handle(c, { type: 'join', name: 'P' + i });
  ok(c.playerId, `P${i} joined with id`);
  conns.push(c);
}
const host = conns[0];
ok(engine.hostId() === host.playerId, 'first player is host');
views(engine, conns);

section('game 1 starts');
engine.handle(host, { type: 'start', final: false, stretch: false });
let g = engine.s.game;
ok(g && g.phase === 'night', 'phase is night after start');
const roleCount = {};
Object.values(g.roles).forEach((r) => (roleCount[r] = (roleCount[r] || 0) + 1));
ok(roleCount.cultist === 2, '2 cultists at 8 players');
ok(roleCount.medium === 1 && roleCount.occultist === 1, 'medium + occultist dealt');
ok(roleCount.lunatic === 1, 'lunatic dealt at 8');
ok(roleCount.townsfolk === 3, '3 townsfolk');
ok(engine.s.players.every((p) => p.personaId), 'everyone has a persona');
views(engine, conns);

const byRole = (r) => Object.keys(g.roles).filter((id) => g.roles[id] === r);
const cultists = byRole('cultist');
const townies = byRole('townsfolk');

section('night 1: kill a townsfolk');
doNight(engine, conns, { cultTarget: townies[0], wardTarget: townies[1] });
g = engine.s.game;
ok(g.phase === 'dawn', 'night resolves to dawn when all act');
ok(!g.alive.includes(townies[0]), 'victim is dead');
ok(g.spirits.includes(townies[0]), 'victim became a spirit');
ok(g.dawnReport.length >= 3, 'dawn report has narration');
views(engine, conns);

section('day 1: vote out first cultist');
advanceTimer(engine); // dawn -> day
ok(engine.s.game.phase === 'day', 'dawn advances to day');
engine.handle(host, { type: 'skipToVote' });
ok(engine.s.game.phase === 'vote', 'host can skip to vote');
doVote(engine, conns, cultists[0]);
g = engine.s.game;
ok(g.phase === 'reveal', 'all votes cast resolves to reveal');
ok(g.reveal.banished === cultists[0] && g.reveal.role === 'cultist', 'cultist banished + revealed');
views(engine, conns);
advanceTimer(engine); // reveal -> night 2
g = engine.s.game;
ok(g.phase === 'night' && g.day === 2, 'game continues to night 2');

section('night 2: spirits haunt');
const spiritConns = conns.filter((c) => g.spirits.includes(c.playerId));
ok(spiritConns.length === 2, 'two spirits exist');
const hauntTarget = g.alive.find((id) => g.roles[id] === 'townsfolk');
for (const sc of spiritConns) engine.handle(sc, { type: 'haunt', target: hauntTarget, curseId: 'questions' });
doNight(engine, conns, { cultTarget: townies[1], wardTarget: townies[1] }); // warded!
g = engine.s.game;
ok(g.phase === 'dawn', 'night 2 resolves');
ok(g.alive.includes(townies[1]), 'warded target survived');
ok(g.curse[hauntTarget]?.curseId === 'questions', 'haunt curse applied');
views(engine, conns);

section('day 2: items + whispers + broken curse');
advanceTimer(engine); // -> day
g = engine.s.game;
g.items[hauntTarget] = ['flask'];
const hauntedConn = conns.find((c) => c.playerId === hauntTarget);
engine.handle(hauntedConn, { type: 'useItem', item: 'flask' });
ok(!g.curse[hauntTarget], 'flask lifts the curse');
engine.handle(spiritConns[0], { type: 'whisper', index: 0 });
ok(g.whispersFeed.length === 1, 'spirit whisper lands on the feed');
engine.handle(spiritConns[0], { type: 'whisper', index: 1 });
ok(g.whispersFeed.length === 1, 'whisper cooldown blocks spam');
views(engine, conns);

section('day 2 vote: banish last cultist -> town wins');
engine.handle(host, { type: 'skipToVote' });
doVote(engine, conns, cultists[1]);
g = engine.s.game;
ok(g.phase === 'reveal', 'reveal after vote');
advanceTimer(engine);
g = engine.s.game;
ok(g.phase === 'gameover', 'game over when cult is gone');
ok(g.winner === 'town', 'town wins');
ok(g.ceremony && g.ceremony.roles.length === 8, 'ceremony reveals all roles');
ok(engine.s.campaign.games === 1, 'campaign counted the game');
const townWinners = engine.s.players.filter((p) => ['medium', 'occultist', 'townsfolk'].includes(g.roles[p.id]));
ok(townWinners.every((p) => (engine.s.campaign.signs[p.id] || 0) >= 3), 'town winners earned elder signs');
views(engine, conns);

// ---------------- game 2: lunatic win ----------------
section('game 2: lunatic gets themselves banished');
engine.handle(host, { type: 'start', final: false, stretch: false });
g = engine.s.game;
ok(g.phase === 'night' && g.day === 1, 'second game deals');
const lunatic = Object.keys(g.roles).find((id) => g.roles[id] === 'lunatic');
const cult2 = Object.keys(g.roles).filter((id) => g.roles[id] === 'cultist');
doNight(engine, conns, { cultTarget: g.alive.find((id) => !cult2.includes(id) && id !== lunatic) });
advanceTimer(engine); // dawn -> day
engine.handle(host, { type: 'skipToVote' });
doVote(engine, conns, lunatic);
advanceTimer(engine); // reveal ->
g = engine.s.game;
ok(g.phase === 'gameover' && g.winner === 'lunatic', 'lunatic wins alone when banished');
views(engine, conns);

// ---------------- game 3: finale -> The Rising ----------------
section('game 3: The Stars Are Right -> cult parity -> The Rising');
engine.handle(host, { type: 'start', final: true });
g = engine.s.game;
ok(g.final && g.stretch, 'finale enables stretch roles');
ok(Object.values(g.roles).includes('hybrid') || Object.values(g.roles).includes('archivist'), 'stretch roles dealt');
const cult3 = Object.keys(g.roles).filter((id) => g.roles[id] === 'cultist');
// Kill + banish innocents until parity: 8 -> kill(7) -> banish(6) -> kill(5) -> banish(4: 2v2)
const lunatic3 = Object.keys(g.roles).find((id) => g.roles[id] === 'lunatic');
const safeTarget = (gg) => gg.alive.find((id) => !cult3.includes(id) && id !== lunatic3);
let safety = 10;
while (engine.s.game.phase !== 'rising' && engine.s.game.phase !== 'gameover' && safety-- > 0) {
  g = engine.s.game;
  // Ward a cultist so the night kill always lands; never banish the lunatic.
  doNight(engine, conns, { cultTarget: safeTarget(g), wardTarget: cult3[0] });
  if (engine.s.game.phase === 'dawn') {
    advanceTimer(engine); // dawn -> day (or straight to the Rising on parity)
    if (engine.s.game.phase !== 'day') break;
    engine.handle(host, { type: 'skipToVote' });
    doVote(engine, conns, safeTarget(engine.s.game));
    advanceTimer(engine); // reveal -> next
  }
  views(engine, conns);
}
g = engine.s.game;
ok(g.phase === 'rising', 'finale parity triggers The Rising (got: ' + g.phase + ')');
views(engine, conns);

section('The Rising: three rounds of dice');
let round = 0;
while (engine.s.game.phase === 'rising' && round++ < 5) {
  for (const c of conns) engine.handle(c, { type: 'risingPick', stat: 'nerve', spend: false });
  views(engine, conns);
}
g = engine.s.game;
ok(g.phase === 'gameover', 'Rising concludes');
ok(['dawn', 'oldone'].includes(g.winner), 'Rising has a verdict: ' + g.winner);
ok(g.ceremony && g.ceremony.line, 'finale ceremony narrates');
views(engine, conns);

// ---------------- misc: late join + reconnect + forced night ----------------
section('misc behaviors');
engine.handle(host, { type: 'start' });
const late = { role: 'player', playerId: null };
engine.handle(late, { type: 'join', name: 'Latecomer' });
g = engine.s.game;
ok(g.spirits.includes(late.playerId), 'late joiner enters as a spirit');
const reconn = { role: 'player', playerId: null };
engine.handle(reconn, { type: 'join', name: 'ignored', token: engine.player(host.playerId).token });
ok(reconn.playerId === host.playerId, 'token reconnect maps to same player');
// Forced night resolution (host force-advance with nobody acting).
engine.handle(host, { type: 'forceAdvance' });
ok(engine.s.game.phase === 'dawn', 'force-advance resolves a stalled night');
views(engine, [...conns, late]);

console.log(failures ? `\n${failures} FAILURES` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);

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

function doNight(engine, conns, { cultTarget, mediumTarget, wardTarget, archTarget } = {}) {
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
    else if (r === 'archivist') engine.handle(c, { type: 'night', target: archTarget || g.alive.find((x) => x !== id) });
    else {
      engine.handle(c, { type: 'explore', location: 'docks' });
      for (let guard = 0; guard < 5; guard++) {
        const ex = engine.s.game.night?.explores?.[id];
        if (!ex || ex.result) break;
        if (ex.await) engine.handle(c, { type: 'tarot', use: true });
        else engine.handle(c, { type: 'exploreChoice', index: 1 });
      }
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

// ---------------- content integrity ----------------
import { LOCATIONS, NARRATION, PERSONAS, DOOM_LINES, INTERLUDES, RISING_ROUNDS, CURSES, WHISPERS, ITEMS } from '../src/engine/content.js';
section('content integrity');
function validOutcome(o) {
  if (!o || !o.text) return false;
  if (o.item && !ITEMS[o.item]) return false;
  if (o.next) return !!o.next.text && o.next.choices?.length === 2 && o.next.choices.every(validChoice);
  return true;
}
function validChoice(c) {
  if (!c.label) return false;
  if (c.check) return validOutcome(c.success) && validOutcome(c.fail) && ['brawn', 'wits', 'nerve'].includes(c.check.stat) && c.check.dc >= 8 && c.check.dc <= 18;
  return validOutcome(c.outcome);
}
let rareCount = 0;
for (const [key, loc] of Object.entries(LOCATIONS)) {
  ok(Array.isArray(NARRATION.flavor[key]) && NARRATION.flavor[key].length > 0, `flavor lines exist for location "${key}"`);
  for (const scene of loc.scenes) {
    ok(scene.choices.length === 2 && scene.choices.every(validChoice), `scene ${key}/${scene.id} well-formed (incl. deep stages)`);
    if (scene.rare) { rareCount++; ok(['key', 'visits', 'strange'].includes(scene.gate), `rare ${key}/${scene.id} has a known gate`); }
  }
}
ok(rareCount === 6, 'one rare scene per location');
ok(PERSONAS.every((p) => p.death && p.death.length > 40), 'every persona has a bespoke death line');
ok(DOOM_LINES.length === 4 && DOOM_LINES.every((t) => t.length > 0), 'doom lines cover all four tiers');
ok(['town', 'cult', 'lunatic', 'dawn', 'oldone'].every((w) => INTERLUDES[w]?.length > 0), 'interludes cover every winner');
ok(RISING_ROUNDS.length === 3, 'rising narration covers three rounds');
ok(new Set(CURSES.map((c) => c.id)).size === CURSES.length, 'curse ids unique');
ok(new Set(WHISPERS).size === WHISPERS.length, 'whispers unique');
const totalScenes = Object.values(LOCATIONS).reduce((a, l) => a + l.scenes.length, 0);
console.log(`  (content: ${Object.keys(LOCATIONS).length} locations, ${totalScenes} scenes, ${CURSES.length} curses, ${WHISPERS.length} whispers)`);

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
ok(typeof g.ceremony.interlude === 'string' && g.ceremony.interlude.length > 20, 'ceremony includes an interlude');
ok(typeof g.ceremony.doomLine === 'string', 'ceremony includes a doom flavor line');
ok(typeof g.nightLine === 'string', 'night scene line was set');
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

// ---------------- game 2b: the Archivist's records ----------------
section('game 2b: archivist records catch the roleless and clear the explorers');
engine.handle(host, { type: 'start', final: false, stretch: true });
g = engine.s.game;
const archivist = Object.keys(g.roles).find((id) => g.roles[id] === 'archivist');
ok(!!archivist, 'stretch deal includes an archivist');
const archConn = conns.find((c) => c.playerId === archivist);
const cultB = Object.keys(g.roles).filter((id) => g.roles[id] === 'cultist');
const lunaticB = Object.keys(g.roles).find((id) => g.roles[id] === 'lunatic');
// Archivist checks a cultist: cultists leave no record.
doNight(engine, conns, { archTarget: cultB[0], cultTarget: g.alive.find((id) => !cultB.includes(id) && id !== archivist && id !== lunaticB) });
g = engine.s.game;
ok(g.lastArchive?.by === archivist && g.lastArchive.target === cultB[0], 'record targets the checked player');
ok(g.lastArchive.loc === null, 'a cultist leaves NO ENTRY in the records');
let av = engine.viewFor(archConn);
ok(av.you.archive && av.you.archive.loc === null, 'archivist phone shows the NO ENTRY record at dawn');
advanceTimer(engine); // dawn -> day
engine.handle(host, { type: 'skipToVote' });
doVote(engine, conns, lunaticB); // end this game quickly via lunatic win
advanceTimer(engine);
g = engine.s.game;
if (g.phase !== 'gameover') { // lunatic may have died at night; force-end via cult parity is overkill — just note it
  console.log('  (note: quick-end via lunatic unavailable this run; finishing game normally)');
  let s2 = 12;
  while (engine.s.game.phase !== 'gameover' && s2-- > 0) {
    if (engine.s.game.phase === 'night') doNight(engine, conns, {});
    else advanceTimer(engine);
    if (engine.s.game.phase === 'vote') { doVote(engine, conns, engine.s.game.alive.find((id) => cultB.includes(id)) || engine.s.game.alive[0]); }
  }
}
ok(engine.s.game.phase === 'gameover', 'archivist test game concluded');
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

// ---------------- RPG systems: deep scenes, rares, items, unrest, sightings, XP ----------------
section('RPG systems (deterministic)');
const origRandom = Math.random;
const e2 = new Engine(newRoom('RPGT'));
const c2 = [];
for (let i = 0; i < 6; i++) { const c = { role: 'player', playerId: null }; e2.handle(c, { type: 'join', name: 'R' + i }); c2.push(c); }
e2.handle(c2[0], { type: 'start' });
let g2 = e2.s.game;
const r2 = (id) => g2.roles[id];
const explorers2 = c2.filter((c) => !['cultist', 'medium', 'occultist'].includes(r2(c.playerId)));
ok(explorers2.length === 2, 'six-player deal leaves two explorers');
const [ea, eb] = explorers2;
const cultC = c2.filter((c) => r2(c.playerId) === 'cultist');
const medC = c2.find((c) => r2(c.playerId) === 'medium');
const occC = c2.find((c) => r2(c.playerId) === 'occultist');

// Deep scene: force the docks ledger; d20 always 20.
Math.random = () => 0.999;
g2.seenScenes[ea.playerId] = ['docks:net', 'docks:singing', 'docks:ferryman', 'docks:icehouse', 'docks:thirdtide'];
e2.handle(ea, { type: 'explore', location: 'docks' });
let exa = g2.night.explores[ea.playerId];
ok(exa?.sceneId === 'ledger', 'scene forcing works (ledger)');
e2.handle(ea, { type: 'exploreChoice', index: 0 });
exa = g2.night.explores[ea.playerId];
ok(!!exa.stage2 && !exa.result, 'successful ledger choice opens a second stage');
ok((g2.items[ea.playerId] || []).includes('press'), 'stage-one loot granted');
e2.handle(ea, { type: 'exploreChoice', index: 0 });
exa = g2.night.explores[ea.playerId];
ok(!!exa.result && !!exa.result.partial, 'second stage resolves with the first beat attached');
ok((g2.items[ea.playerId] || []).includes('watch'), 'deep scene yields the Dead Man’s Watch');

// Key-gated rare: eb holds a skeleton key, walks into the library.
g2.items[eb.playerId] = ['key'];
e2.handle(eb, { type: 'explore', location: 'library' });
const exb = g2.night.explores[eb.playerId];
ok(exb?.sceneId === 'lockedcase' && exb.rare === true, 'skeleton key opens the rare library scene');
ok(!(g2.items[eb.playerId] || []).includes('key'), 'key consumed in the lock');
e2.handle(eb, { type: 'exploreChoice', index: 0 });
ok((g2.items[eb.playerId] || []).includes('tarot'), 'rare scene pays out the tarot');
ok(g2.stats[eb.playerId].rareFound === true, 'rare discovery recorded for XP');

// Dead Man's Watch armed at night; power roles act; night resolves.
Math.random = origRandom;
e2.handle(ea, { type: 'useItem', item: 'watch', target: cultC[0].playerId });
ok(g2.night.watch?.by === ea.playerId, 'watch armed for the night');
for (const cc of cultC) e2.handle(cc, { type: 'night', target: medC.playerId });
e2.handle(medC, { type: 'night', target: cultC[0].playerId });
e2.handle(occC, { type: 'night', target: occC.playerId });
g2 = e2.s.game;
ok(g2.phase === 'dawn', 'RPG night 1 resolves');
ok(g2.lastWatch?.target === cultC[0].playerId && g2.lastWatch.loc === null, 'watch reports NO RECORD for a cultist');
ok(e2.viewFor(ea).you.watch && e2.viewFor(ea).you.watch.loc === null, 'watch record shows on the owner’s phone');

// Day 1: everyone abstains -> tie -> night 2.
advanceTimer(e2);
e2.handle(c2[0], { type: 'skipToVote' });
doVote(e2, c2, 'abstain');
ok(e2.s.game.reveal?.tie === true, 'unanimous abstention ties');
advanceTimer(e2); // -> night 2

// Night 2: both explorers to the church -> mutual sighting. Cult hits the warded occultist.
g2 = e2.s.game;
Math.random = () => 0.5;
e2.handle(ea, { type: 'explore', location: 'church' });
e2.handle(eb, { type: 'explore', location: 'church' });
e2.handle(ea, { type: 'exploreChoice', index: 1 });
e2.handle(eb, { type: 'exploreChoice', index: 1 });
for (const cc of cultC) e2.handle(cc, { type: 'night', target: occC.playerId });
e2.handle(occC, { type: 'night', target: occC.playerId });
g2 = e2.s.game;
ok(g2.phase === 'dawn', 'RPG night 2 resolves');
ok(g2.alive.includes(occC.playerId), 'self-ward saved the occultist');
const sa = g2.sightings[ea.playerId], sb = g2.sightings[eb.playerId];
ok(sa && sb, 'both explorers got a sighting');
const nameOf = (c) => e2.pname(c.playerId);
ok(sa.others.includes(nameOf(eb)) && sb.others.includes(nameOf(ea)), 'sightings name each other truthfully at sane sanity');

// Day 2: banish the first cultist.
advanceTimer(e2);
e2.handle(c2[0], { type: 'skipToVote' });
doVote(e2, c2, cultC[0].playerId);
advanceTimer(e2); // -> night 3

// Night 3: guaranteed check failure raises graveyard unrest.
Math.random = () => 0;
e2.handle(ea, { type: 'explore', location: 'graveyard' });
e2.handle(ea, { type: 'exploreChoice', index: 0 });
ok((e2.s.campaign.unrest?.graveyard || 0) >= 1, 'failed check raises location unrest');
Math.random = origRandom;
e2.handle(eb, { type: 'explore', location: 'roadhouse' });
for (let guard = 0; guard < 5; guard++) {
  const ex = e2.s.game.night?.explores?.[eb.playerId];
  if (!ex || ex.result) break;
  if (ex.await) e2.handle(eb, { type: 'tarot', use: false });
  else e2.handle(eb, { type: 'exploreChoice', index: 1 });
}
for (const cc of cultC) { if (e2.s.game.alive.includes(cc.playerId)) e2.handle(cc, { type: 'night', target: occC.playerId }); }
e2.handle(occC, { type: 'night', target: occC.playerId });
g2 = e2.s.game;
ok(g2.phase === 'dawn', 'RPG night 3 resolves');

// Day 3: banish the last cultist -> town wins -> XP flows.
advanceTimer(e2);
e2.handle(c2[0], { type: 'skipToVote' });
doVote(e2, c2, cultC[1].playerId);
advanceTimer(e2);
g2 = e2.s.game;
ok(g2.phase === 'gameover' && g2.winner === 'town', 'RPG test game ends in town win');
ok((g2.ceremony.xp || []).length > 0, 'ceremony reports experience');
const eaP = e2.player(ea.playerId);
ok((eaP.xp || 0) >= 2, 'surviving winner banked XP (alive + win)');
const witsBefore = e2.pstats(eaP).wits;
e2.handle(ea, { type: 'spendXp', stat: 'wits' });
ok(eaP.statBumps?.wits === 1 && e2.pstats(eaP).wits === witsBefore + 1, 'spending XP bumps effective stats');
const xpAfter = eaP.xp;
e2.handle(ea, { type: 'spendXp', stat: 'wits' });
e2.handle(ea, { type: 'spendXp', stat: 'wits' });
ok((eaP.statBumps?.wits || 0) <= 2, 'stat bumps cap at +2');
views(e2, c2);
Math.random = origRandom;

console.log(failures ? `\n${failures} FAILURES` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);

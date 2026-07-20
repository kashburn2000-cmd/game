// TV + phone client for A Shadow Over Arkham.
// One file, two modes: the TV renders the public stage; phones render each
// player's private controller. Both just re-render from server state.
(() => {
  const app = document.getElementById('app');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let ws = null, view = null, role = null, code = null, screen = 'landing';
  let timeOffset = 0, lastFxSeq = -1, lastPhaseKey = '', reconnectTries = 0, connBanner = false;
  let hauntSel = {}, gravedirtMode = false, spendItem = false;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('soa') || '{}'); } catch { }
  saved.rooms = saved.rooms || {};
  const persist = () => localStorage.setItem('soa', JSON.stringify(saved));

  // ---------- networking ----------
  function wsUrl(c, r) {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${location.host}/ws/${c}?role=${r}`;
  }

  function connect(c, r) {
    code = c; role = r; screen = 'game';
    try { ws && ws.close(); } catch { }
    ws = new WebSocket(wsUrl(c, r));
    ws.onopen = () => {
      reconnectTries = 0; connBanner = false;
      if (r === 'player') send({ type: 'join', name: saved.name || 'Stranger', token: saved.rooms[c] || null });
    };
    ws.onmessage = (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.type === 'joined') { saved.rooms[c] = msg.token; persist(); }
      if (msg.type === 'state') {
        view = msg.view;
        timeOffset = Date.now() - view.now;
        onStateSounds();
        render();
      }
    };
    ws.onclose = () => {
      if (screen !== 'game') return;
      connBanner = true; render();
      reconnectTries++;
      setTimeout(() => { if (screen === 'game') connect(code, role); }, Math.min(8000, 500 * reconnectTries));
    };
  }
  const send = (o) => { try { ws.send(JSON.stringify(o)); } catch { } };

  // ---------- sound + vibration ----------
  const SCENES = { night: 'night', dawn: 'day', day: 'day', vote: 'day', reveal: 'day', rising: 'doom', gameover: null, lobby: null };
  function onStateSounds() {
    if (role !== 'tv' || !window.SoundKit || !SoundKit.ready()) { phoneBuzz(); return; }
    const phaseKey = view.phase + ':' + view.day;
    if (phaseKey !== lastPhaseKey) {
      lastPhaseKey = phaseKey;
      const sc = view.phase === 'gameover' ? (view.ceremony && ['cult', 'oldone'].includes(view.ceremony.winner) ? 'doom' : 'off') : SCENES[view.phase];
      SoundKit.scene(sc || 'off');
    }
    if (view.fx && view.fx.seq !== lastFxSeq) {
      if (lastFxSeq >= 0 && view.fx.kind) SoundKit.sting(view.fx.kind);
      lastFxSeq = view.fx.seq;
    }
  }
  let lastBuzzKey = '';
  function phoneBuzz() {
    if (role !== 'player' || !navigator.vibrate || !view?.you) return;
    const y = view.you;
    const needsAction =
      (view.phase === 'night' && y.nightUI && !(y.nightUI.submitted || y.nightUI.result)) ||
      (view.phase === 'vote' && y.voteUI && !y.voteUI.submitted) ||
      (view.phase === 'rising' && y.risingUI && !y.risingUI.picked);
    const key = view.phase + ':' + view.day + ':' + (view.phase === 'rising' ? y.risingUI?.round : '');
    if (needsAction && key !== lastBuzzKey) { lastBuzzKey = key; navigator.vibrate([120, 80, 200]); }
  }

  // ---------- timers ----------
  setInterval(() => {
    document.querySelectorAll('[data-deadline]').forEach((el) => {
      const d = +el.dataset.deadline;
      const rem = Math.max(0, d - (Date.now() - timeOffset));
      const m = Math.floor(rem / 60000), s = Math.floor((rem % 60000) / 1000);
      el.textContent = `${m}:${String(s).padStart(2, '0')}`;
      if (role === 'tv' && window.SoundKit) SoundKit.heartbeat(view?.phase === 'vote' && rem > 0 && rem < 25000);
    });
  }, 400);

  // ---------- shared bits ----------
  const doomTrack = (doom) => `
    <div class="doomtrack" title="Doom">
      <span class="doomlabel">DOOM</span>
      ${Array.from({ length: 10 }, (_, i) => `<span class="doompip ${i < doom ? 'lit' : ''}">${i < doom ? '🌑' : '·'}</span>`).join('')}
    </div>`;
  const sanityDots = (n, max) => Array.from({ length: max }, (_, i) => `<span class="san ${i < n ? 'ok' : 'gone'}">${i < n ? '◈' : '◇'}</span>`).join('');
  const chip = (p) => `
    <span class="chip ${p.connected ? '' : 'off'} ${p.spirit ? 'ghost' : ''}">
      <span class="chipicon">${p.spirit ? '👻' : (p.persona?.icon || '❔')}</span>
      ${esc(p.persona ? p.persona.name.split(' ').slice(-1)[0] : p.name)}${p.host ? ' ⭐' : ''}
    </span>`;

  // ---------- landing ----------
  function renderLanding() {
    app.innerHTML = `
      <div class="landing">
        <h1 class="gametitle">A SHADOW<br>OVER ARKHAM</h1>
        <p class="tagline">a parlor game of paranoia, whiskey, and things beneath the bay</p>
        <div class="landing-buttons">
          <button class="bigbtn" data-action="be-tv">🖥&nbsp; Host on this screen</button>
          <button class="bigbtn" data-action="show-join">📱&nbsp; Join a game</button>
        </div>
        <div id="joinform" class="joinform hidden">
          <input id="jcode" placeholder="ROOM CODE" maxlength="4" autocapitalize="characters" autocomplete="off" value="${esc(sessionStorage.getItem('lastcode') || '')}">
          <input id="jname" placeholder="Your first name" maxlength="18" value="${esc(saved.name || '')}">
          <button class="bigbtn" data-action="do-join">Enter Arkham</button>
          <p id="joinerr" class="err"></p>
        </div>
      </div>`;
  }

  async function beTV() {
    if (window.SoundKit) SoundKit.init(); // user gesture: unlock audio now
    const res = await fetch('/api/room', { method: 'POST' });
    const { code: c } = await res.json();
    connect(c, 'tv');
  }

  async function doJoin() {
    const c = document.getElementById('jcode').value.trim().toUpperCase();
    const n = document.getElementById('jname').value.trim();
    const err = document.getElementById('joinerr');
    if (c.length < 3) { err.textContent = 'Enter the room code shown on the TV.'; return; }
    if (!n) { err.textContent = 'The town insists on knowing your name.'; return; }
    const chk = await fetch('/api/check/' + c).then((r) => r.json()).catch(() => ({ active: false }));
    if (!chk.active) { err.textContent = 'No such room. Check the code on the TV.'; return; }
    saved.name = n; persist();
    sessionStorage.setItem('lastcode', c);
    connect(c, 'player');
  }

  // ---------- TV ----------
  function renderTV(v) {
    const banner = connBanner ? `<div class="connbanner">⛆ reconnecting…</div>` : '';
    let body = '';
    const playerStrip = `<div class="chips">${v.players.map(chip).join('')}</div>`;
    switch (v.phase) {
      case 'lobby':
        body = `
          <h1 class="gametitle">A SHADOW OVER ARKHAM</h1>
          <p class="tagline">a parlor game of paranoia for 4–12 souls · best with 6–8</p>
          <div class="joinbox">On your phone, visit <b>${esc(location.host)}</b> → <i>Join a game</i> → code
            <div class="roomcode">${esc(v.code)}</div>
          </div>
          ${playerStrip}
          ${v.games > 0 ? doomTrack(v.doom) + signsBoard(v) : ''}
          <p class="hint">${v.players.length < 4 ? 'Waiting for at least 4 souls…' : 'The host’s phone bears the ⭐ — they may deal the roles.'}</p>`;
        break;
      case 'night':
        body = `
          <div class="scene night">
            <div class="moon">🌙</div>
            <h2 class="phasetitle">NIGHT ${v.day}</h2>
            <p class="narr">The town sleeps. Some of it works.</p>
            <p class="waiting">${v.night ? `${v.night.waiting} soul${v.night.waiting === 1 ? '' : 's'} still stirring…` : ''}</p>
            ${v.night?.spirits ? `<p class="hint">👻 the ${v.night.spirits} restless dead confer on a haunting…</p>` : ''}
            <div class="timer tiny" data-deadline="${v.deadline}"></div>
          </div>`;
        break;
      case 'dawn':
        body = `
          <div class="scene dawn">
            <h2 class="phasetitle">DAWN</h2>
            <div class="parchment">
              ${(v.dawnReport || []).map((l, i) => `<p class="dawnline" style="animation-delay:${i * 1.6}s">${esc(l)}</p>`).join('')}
            </div>
            <div class="timer tiny" data-deadline="${v.deadline}"></div>
          </div>`;
        break;
      case 'day':
        body = `
          <div class="scene day">
            <h2 class="phasetitle">DAY ${v.day} — THE TOWN DELIBERATES</h2>
            <div class="timer big" data-deadline="${v.deadline}"></div>
            ${(v.cursed || []).length ? `<div class="cursebanners">${v.cursed.map((c) => `<div class="cursebanner ${c.broken ? 'broken' : ''}">👻 <b>${esc(c.name)}</b>: ${esc(c.text)} ${c.broken ? '— <i>BROKEN: vote forfeit</i>' : ''}</div>`).join('')}</div>` : ''}
            <div class="whispers">${(v.whispersFeed || []).map((w) => `<p class="whisper">🕯 ${esc(w.text)}</p>`).join('')}</div>
            ${playerStrip}
          </div>`;
        break;
      case 'vote':
        body = `
          <div class="scene vote">
            <h2 class="phasetitle">JUDGMENT</h2>
            <p class="narr">The town votes in silence. Phones only. No take-backs.</p>
            <div class="voteprogress">${v.voteProgress ? `${v.voteProgress.voted} / ${v.voteProgress.total} votes cast` : ''}</div>
            <div class="timer big" data-deadline="${v.deadline}"></div>
            ${(v.whispersFeed || []).slice(-2).map((w) => `<p class="whisper">🕯 ${esc(w.text)}</p>`).join('')}
          </div>`;
        break;
      case 'reveal': {
        const r = v.reveal || {};
        body = `
          <div class="scene reveal">
            ${r.tie
            ? `<h2 class="phasetitle">DEADLOCK</h2><p class="narr revealline">${esc(r.line)}</p>`
            : `<h2 class="phasetitle">THE TOWN HAS SPOKEN</h2>
               <div class="revealcard">
                 <div class="revealname">${esc(r.name)}</div>
                 <div class="revealrole">${r.roleInfo ? `${r.roleInfo.icon} ${esc(r.roleInfo.name).toUpperCase()}` : ''}</div>
               </div>
               <p class="narr revealline">${esc(r.line)}</p>`}
          </div>`;
        break;
      }
      case 'rising': {
        const r = v.rising || {};
        body = `
          <div class="scene rising">
            <div class="oldone">🐙</div>
            <h2 class="phasetitle doomtext">THE RISING — ROUND ${r.round} of ${r.rounds}</h2>
            <p class="narr">All of Arkham — the living, the dead, and the deeply embarrassed cultists — stands together.</p>
            <div class="risingbar"><div class="risingfill" style="width:${Math.min(100, (r.successes / r.needed) * 100)}%"></div>
              <span class="risinglabel">${r.successes} / ${r.needed} rites completed · need ${r.dc}+ on the die</span></div>
            <p class="waiting">${r.picked} / ${r.total} have chosen their stand</p>
            <div class="rolls">${(r.lastRolls || []).map((x) => `<span class="roll ${x.ok ? 'ok' : 'bad'}">${esc(x.name.split(' ').slice(-1)[0])} 🎲${x.die}+${x.bonus}=${x.total}</span>`).join('')}</div>
            <div class="timer tiny" data-deadline="${v.deadline}"></div>
          </div>`;
        break;
      }
      case 'gameover': {
        const c = v.ceremony || {};
        body = `
          <div class="scene gameover ${['cult', 'oldone'].includes(c.winner) ? 'doomed' : 'saved'}">
            <p class="narr endline">${esc(c.line || '')}</p>
            <div class="cols">
              <div class="col">
                <h3>THE TRUTH</h3>
                ${(c.roles || []).map((r) => `<p class="truthrow">${r.roleInfo.icon} <b>${esc(r.name)}</b> — ${esc(r.roleInfo.name)}</p>`).join('')}
              </div>
              <div class="col">
                <h3>HONORS</h3>
                ${(c.titles || []).map((t) => `<p class="titlerow">🏅 <b>${esc(t.title)}</b>: ${esc(t.name)} <i>(${esc(t.note)})</i></p>`).join('') || '<p class="hint">No honors earned. Shameful.</p>'}
                <h3>SECRET QUESTS</h3>
                ${(c.objectives || []).filter((o) => o.obj).map((o) => `<p class="objrow">${o.obj.done ? '✅' : '❌'} ${esc(o.name)}: <i>${esc(o.obj.text)}</i></p>`).join('')}
              </div>
            </div>
            ${doomTrack(c.doom ?? v.doom)}
            ${signsBoard(v)}
            <p class="hint">The host may deal the next game from their phone. The bay is patient.</p>
          </div>`;
        break;
      }
    }
    app.innerHTML = `${banner}<div class="tv phase-${v.phase}">${body}</div>`;
  }

  function signsBoard(v) {
    const ranked = [...v.players].filter((p) => p.signs > 0).sort((a, b) => b.signs - a.signs);
    if (!ranked.length) return '';
    return `<div class="signsboard">${ranked.map((p) => `<span class="signentry">${p.persona?.icon || '❔'} ${esc(p.persona ? p.persona.name.split(' ').slice(-1)[0] : p.name)} <b>${p.signs}✴</b></span>`).join('')}</div>`;
  }

  // ---------- phone ----------
  function renderPhone(v) {
    const y = v.you;
    const banner = connBanner ? `<div class="connbanner">⛆ reconnecting…</div>` : '';
    if (!y) { app.innerHTML = `${banner}<div class="phone"><p class="hint">Joining…</p></div>`; return; }

    const header = `
      <div class="phead">
        <span class="pheadicon">${y.spirit ? '👻' : (y.persona?.icon || '❔')}</span>
        <span class="pheadname">${esc(y.persona ? y.persona.name : y.name)}${y.host ? ' ⭐' : ''}</span>
        ${y.sanity != null && !y.spirit ? `<span class="pheadsan">${sanityDots(y.sanity, y.maxSanity)}</span>` : ''}
      </div>`;

    let body = '';
    if (v.phase === 'lobby') body = phoneLobby(v, y);
    else if (v.phase === 'night') body = phoneNight(v, y);
    else if (v.phase === 'dawn') body = `<h2>DAWN</h2><p class="hint">Look to the TV. The town is finding out what the night cost.</p>${statusCards(y)}`;
    else if (v.phase === 'day') body = phoneDay(v, y);
    else if (v.phase === 'vote') body = phoneVote(v, y);
    else if (v.phase === 'reveal') body = phoneReveal(v, y);
    else if (v.phase === 'rising') body = phoneRising(v, y);
    else if (v.phase === 'gameover') body = phoneGameover(v, y);

    app.innerHTML = `${banner}<div class="phone">${header}${body}${hostPanel(v, y)}</div>`;
  }

  const roleCard = (y) => y.roleInfo ? `
    <div class="rolecard team-${y.roleInfo.team}">
      <div class="rolename">${y.roleInfo.icon} ${esc(y.roleInfo.name).toUpperCase()}</div>
      <p class="roledesc">${esc(y.roleInfo.desc)}</p>
      ${y.mates?.length ? `<p class="mates">Your fellow cultist${y.mates.length > 1 ? 's' : ''}: <b>${y.mates.map(esc).join(', ')}</b></p>` : ''}
    </div>` : '';

  const statusCards = (y) => `
    ${y.curse && !y.curse.broken ? `<div class="cursecard">👻 <b>HAUNTED:</b> ${esc(y.curse.text)}<br><i>Break it and you forfeit today’s vote.</i></div>` : ''}
    ${y.curse?.broken ? `<div class="cursecard broken">👻 Curse broken — your vote today is forfeit.</div>` : ''}
    ${(y.quirks || []).length ? `<div class="quirkcard">🧠 <b>Madness:</b> ${y.quirks.map(esc).join(' · ')}</div>` : ''}
    ${y.objective ? `<div class="objcard ${y.objective.done ? 'done' : ''}">🗝 <b>Secret quest:</b> ${esc(y.objective.text)} ${y.objective.done ? '✅ done (+2✴)' : ''}</div>` : ''}
    ${itemCards(y)}`;

  function itemCards(y) {
    if (!(y.items || []).length) return '';
    return `<div class="items">${y.items.map((it) => {
      let btn = '';
      if (it.id === 'flask' && y.curse && !y.curse.broken) btn = `<button class="minibtn" data-action="use-item" data-item="flask">drink</button>`;
      if (it.id === 'press' && y.pressAvailable) btn = `<button class="minibtn" data-action="use-item" data-item="press">read the tally</button>`;
      if (it.id === 'gravedirt' && ['day', 'vote'].includes(view.phase)) btn = `<button class="minibtn" data-action="gravedirt-mode">choose victim</button>`;
      return `<div class="itemcard">${it.icon} <b>${esc(it.name)}</b><br><small>${esc(it.desc)}</small> ${btn}</div>`;
    }).join('')}</div>`;
  }

  function phoneLobby(v, y) {
    return `
      <h2>THE LOBBY</h2>
      <p class="hint">Choose who you are in this town. Choose wisely; the narrator will not let you forget it.</p>
      <div class="personagrid">${personaGrid(y)}</div>`;
  }

  function personaGrid(y) {
    return (y.personaChoices || []).map((info) => `
      <button class="personabtn ${info.mine ? 'mine' : ''} ${info.takenBy ? 'taken' : ''}" ${info.takenBy ? 'disabled' : `data-action="persona" data-id="${info.id}"`}>
        <span class="picon">${info.icon}</span>
        <span class="pname">${esc(info.name)}</span>
        <span class="pjob">${esc(info.job || '')} · 💪${info.brawn} 🧠${info.wits} 🕯${info.nerve}</span>
        <span class="pblurb">${esc(info.blurb || '')}</span>
        ${info.takenBy ? `<span class="powner">${esc(info.takenBy)}</span>` : ''}${info.mine ? '<span class="powner">YOU</span>' : ''}
      </button>`).join('');
  }

  function phoneNight(v, y) {
    if (y.spirit) return phoneSpiritNight(v, y);
    if (!y.alive) return `<p class="hint">You are beyond such things now.</p>`;
    const ui = y.nightUI;
    if (!ui) return `<h2>NIGHT ${v.day}</h2><p class="hint">You sleep. Lucky you.</p>${statusCards(y)}`;
    if (['cultist', 'medium', 'occultist'].includes(ui.kind)) {
      if (ui.submitted) {
        let extra = '';
        if (ui.kind === 'medium') extra = `<div class="divined ${ui.mediumResult ? 'bad' : 'good'}">${ui.mediumResult ? '🐙 The cards scream. <b>' + esc(ui.targetName) + '</b> walks with the cult.' : '🃏 The cards are calm. <b>' + esc(ui.targetName) + '</b> is not of the cult.'}<br><small>(A Deep One Hybrid also reads as cult…)</small></div>`;
        return `<h2>NIGHT ${v.day}</h2>${roleCard(y)}<p class="hint">Your work is done: <b>${esc(ui.targetName)}</b>.</p>${extra}<p class="hint">Wait for dawn. Try to look innocent.</p>`;
      }
      const prompt = ui.kind === 'cultist' ? 'Choose tonight’s sacrifice' : ui.kind === 'medium' ? 'Divine one soul' : 'Ward one door';
      return `
        <h2>NIGHT ${v.day}</h2>${roleCard(y)}
        <h3>${prompt}</h3>
        <div class="targets">${ui.targets.map((t) => `<button class="targetbtn" data-action="night" data-id="${t.id}">${esc(t.name)}</button>`).join('')}</div>`;
    }
    // Explorer.
    if (!ui.scene) {
      return `
        <h2>NIGHT ${v.day}</h2>${roleCard(y)}
        <h3>The night is long. Where do you go?</h3>
        <div class="targets">${(ui.locations || []).map((l) => `<button class="targetbtn" data-action="explore" data-id="${l.id}">${l.icon} ${esc(l.name)}</button>`).join('')}</div>
        ${statusCards(y)}`;
    }
    if (!ui.result) {
      return `
        <h2>${esc(ui.scene.loc).toUpperCase()}</h2>
        <p class="scenetext">${esc(ui.scene.text)}</p>
        <div class="targets">${ui.scene.choices.map((c, i) => `<button class="targetbtn" data-action="explore-choice" data-i="${i}">${esc(c.label)}${c.check ? ` <small>(${c.check.stat} check, ${c.check.dc}+)</small>` : ''}</button>`).join('')}</div>`;
    }
    const r = ui.result;
    return `
      <h2>${esc(ui.scene.loc).toUpperCase()}</h2>
      ${r.roll ? `<div class="rollcard ${r.roll.ok ? 'ok' : 'bad'}">🎲 ${r.roll.die} + ${r.roll.bonus} (${esc(r.roll.stat)}) = <b>${r.roll.total}</b> vs ${r.roll.dc} — ${r.roll.ok ? 'SUCCESS' : 'FAILURE'}</div>` : ''}
      <p class="scenetext">${esc(r.text)}</p>
      ${r.gained ? `<div class="itemcard gained">${r.gained.icon} You found: <b>${esc(r.gained.name)}</b></div>` : ''}
      ${r.sanity ? `<p class="hint">${r.sanity > 0 ? '+' : ''}${r.sanity} sanity</p>` : ''}
      <p class="hint">You hurry home before the fog notices you. Wait for dawn.</p>
      ${statusCards(y)}`;
  }

  function phoneSpiritNight(v, y) {
    const ui = y.hauntUI;
    if (!ui) return `<h2>NIGHT ${v.day}</h2><p class="hint">👻 You drift. You watch. You know so much more than they do.</p>`;
    if (ui.submitted) return `<h2>NIGHT ${v.day}</h2><p class="hint">👻 Your haunting vote is cast. The spirits confer…</p>`;
    return `
      <h2>NIGHT ${v.day} — 👻 HAUNT</h2>
      <p class="hint">Vote with your fellow spirits: who suffers tomorrow, and how?</p>
      <h3>Who?</h3>
      <div class="targets small">${ui.targets.map((t) => `<button class="targetbtn ${hauntSel.target === t.id ? 'sel' : ''}" data-action="haunt-target" data-id="${t.id}">${esc(t.name)}</button>`).join('')}</div>
      <h3>How?</h3>
      <div class="targets small">${ui.curses.map((c) => `<button class="targetbtn ${hauntSel.curse === c.id ? 'sel' : ''}" data-action="haunt-curse" data-id="${c.id}">${esc(c.text)}</button>`).join('')}</div>
      <button class="bigbtn ${hauntSel.target && hauntSel.curse ? '' : 'disabled'}" data-action="haunt-submit">Send the chill</button>`;
  }

  function phoneDay(v, y) {
    let out = `<h2>DAY ${v.day}</h2>`;
    if (y.spirit) {
      const w = y.whisperUI;
      out += `<p class="hint">👻 Stir the pot. You have ${w ? w.remaining : 0} whisper${w?.remaining === 1 ? '' : 's'} left today.</p>`;
      if (w && w.remaining > 0) out += `<div class="targets small">${w.options.map((t, i) => `<button class="targetbtn ${w.coolingDown ? 'disabled' : ''}" data-action="whisper" data-i="${i}">🕯 ${esc(t)}</button>`).join('')}</div>`;
    } else if (y.alive) {
      out += `${roleCard(y)}<p class="hint">Argue. Accuse. Deflect. The vote comes when the timer dies.</p>`;
      if (gravedirtMode) {
        const targets = v.players.filter((p) => p.alive && p.id !== y.id);
        out += `<h3>🪦 Grave dirt — choose who the spirits strike next</h3>
          <div class="targets small">${targets.map((t) => `<button class="targetbtn" data-action="use-gravedirt" data-id="${t.id}">${esc(t.persona ? t.persona.name : t.name)}</button>`).join('')}
          <button class="targetbtn" data-action="gravedirt-cancel">never mind</button></div>`;
      }
    }
    out += statusCards(y);
    if (y.pressTally) out += `<div class="presscard">📰 <b>THE FULL TALLY</b>${y.pressTally.map((t) => `<br>${esc(t.voter)} → ${esc(t.target)}`).join('')}</div>`;
    return out;
  }

  function phoneVote(v, y) {
    if (!y.alive) {
      let out = `<h2>JUDGMENT</h2><p class="hint">👻 Watch them get it wrong.</p>`;
      if (y.whisperUI && y.whisperUI.remaining > 0) out += `<div class="targets small">${y.whisperUI.options.map((t, i) => `<button class="targetbtn ${y.whisperUI.coolingDown ? 'disabled' : ''}" data-action="whisper" data-i="${i}">🕯 ${esc(t)}</button>`).join('')}</div>`;
      return out;
    }
    const ui = y.voteUI;
    if (ui?.submitted) return `<h2>JUDGMENT</h2><p class="hint">Your vote is cast. No take-backs. Maintain eye contact with no one.</p>`;
    return `
      <h2>JUDGMENT</h2>
      ${y.curse?.broken ? `<div class="cursecard broken">Your broken curse silences your vote — cast it anyway, for the record.</div>` : ''}
      <p class="hint">Who does Arkham cast out?</p>
      <div class="targets">${(ui?.targets || []).map((t) => `<button class="targetbtn" data-action="vote" data-id="${t.id}">${esc(t.name)}</button>`).join('')}
      <button class="targetbtn abstain" data-action="vote" data-id="abstain">Abstain</button></div>`;
  }

  function phoneReveal(v, y) {
    let out = `<h2>THE TOWN HAS SPOKEN</h2><p class="hint">Eyes on the TV.</p>`;
    if (y.archivist) out += `<div class="presscard">📜 <b>ARCHIVIST’S RECORD</b> (you know first):<br>${esc(y.archivist.name)} — <b>${esc(y.archivist.role)}</b></div>`;
    return out;
  }

  function phoneRising(v, y) {
    const ui = y.risingUI;
    if (!ui) return `<h2>THE RISING</h2><p class="hint">Watch the TV. Pray to something local.</p>`;
    if (ui.picked) return `<h2>THE RISING — ROUND ${ui.round}</h2><p class="hint">You have chosen your stand. The dice decide.</p>`;
    return `
      <h2>THE RISING — ROUND ${ui.round} of ${ui.rounds}</h2>
      <p class="hint">The Old One rises. How do you resist?</p>
      <div class="targets">
        <button class="targetbtn" data-action="rising" data-stat="brawn">💪 BRAWN +${(ui.stats.brawn || 0) * 2} — hold the barricades</button>
        <button class="targetbtn" data-action="rising" data-stat="wits">🧠 WITS +${(ui.stats.wits || 0) * 2} — read the counter-rite</button>
        <button class="targetbtn" data-action="rising" data-stat="nerve">🕯 NERVE +${(ui.stats.nerve || 0) * 2} — stare it down</button>
      </div>
      ${ui.canSpend ? `<label class="spendlabel"><input type="checkbox" id="spendItem" ${spendItem ? 'checked' : ''}> burn an item for +3</label>` : ''}`;
  }

  function phoneGameover(v, y) {
    const c = v.ceremony;
    return `
      <h2>${c ? (['cult', 'oldone'].includes(c.winner) ? 'DOOM' : 'RESPITE') : 'THE END'}</h2>
      <p class="hint">The full ceremony plays on the TV.</p>
      ${y.objective ? `<div class="objcard ${y.objective.done ? 'done' : ''}">🗝 Your quest: ${esc(y.objective.text)} — ${y.objective.done ? 'DONE ✅ (+2✴)' : 'failed ❌'}</div>` : ''}
      <p class="signentry">Your Elder Signs: <b>${(v.players.find((p) => p.id === y.id) || {}).signs || 0}✴</b></p>
      ${y.personaChoices ? `<details><summary>Change persona for the next game</summary><div class="personagrid">${personaGrid(y)}</div></details>` : ''}`;
  }

  function hostPanel(v, y) {
    if (!y?.host) return '';
    const ui = y.hostUI || {};
    const enough = v.players.length >= 4;
    let inner = '';
    if (v.phase === 'lobby' || v.phase === 'gameover') {
      inner += `
        <label class="spendlabel"><input type="checkbox" id="optFinal"> 🌌 The Stars Are Right (finale — stretch roles + The Rising)</label>
        <label class="spendlabel"><input type="checkbox" id="optStretch"> 🐟 stretch roles (Hybrid + Archivist)</label>
        <button class="bigbtn ${enough ? '' : 'disabled'}" data-action="start">${v.phase === 'gameover' ? 'Deal the next game' : 'Deal the roles'} (${v.players.length} players)</button>`;
    } else {
      inner += `
        <button class="minibtn" data-action="extend">＋1 min</button>
        ${v.phase === 'day' ? `<button class="minibtn" data-action="skipToVote">skip to vote</button>` : ''}
        <button class="minibtn" data-action="forceAdvance">force next phase</button>`;
      if ((ui.cursed || []).length && ['day', 'vote'].includes(v.phase)) {
        inner += `<p class="hint">Curse enforcement (spirits are watching):</p>` +
          ui.cursed.map((c) => `<button class="minibtn ${c.broken ? 'bad' : ''}" data-action="markBroken" data-id="${c.id}" data-broken="${c.broken ? '0' : '1'}">${esc(c.name)}: ${c.broken ? 'un-break' : 'mark broken'}</button>`).join('');
      }
    }
    return `<details class="hostpanel" open><summary>⭐ Host controls</summary>${inner}</details>`;
  }

  // ---------- render dispatch ----------
  function render() {
    if (screen === 'landing') return renderLanding();
    if (!view) { app.innerHTML = `<div class="phone"><p class="hint">Reaching Arkham…</p></div>`; return; }
    if (role === 'tv') renderTV(view); else renderPhone(view);
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.classList.contains('disabled')) return;
    const a = btn.dataset.action;
    switch (a) {
      case 'be-tv': beTV(); break;
      case 'show-join': document.getElementById('joinform').classList.remove('hidden'); break;
      case 'do-join': doJoin(); break;
      case 'persona': send({ type: 'persona', personaId: btn.dataset.id }); break;
      case 'start': send({ type: 'start', final: !!document.getElementById('optFinal')?.checked, stretch: !!document.getElementById('optStretch')?.checked }); break;
      case 'extend': send({ type: 'extend' }); break;
      case 'skipToVote': send({ type: 'skipToVote' }); break;
      case 'forceAdvance': send({ type: 'forceAdvance' }); break;
      case 'markBroken': send({ type: 'markBroken', playerId: btn.dataset.id, broken: btn.dataset.broken === '1' }); break;
      case 'night': send({ type: 'night', target: btn.dataset.id }); break;
      case 'explore': send({ type: 'explore', location: btn.dataset.id }); break;
      case 'explore-choice': send({ type: 'exploreChoice', index: +btn.dataset.i }); break;
      case 'haunt-target': hauntSel.target = btn.dataset.id; render(); break;
      case 'haunt-curse': hauntSel.curse = btn.dataset.id; render(); break;
      case 'haunt-submit': if (hauntSel.target && hauntSel.curse) { send({ type: 'haunt', target: hauntSel.target, curseId: hauntSel.curse }); hauntSel = {}; } break;
      case 'whisper': send({ type: 'whisper', index: +btn.dataset.i }); break;
      case 'vote': send({ type: 'vote', target: btn.dataset.id }); break;
      case 'use-item': send({ type: 'useItem', item: btn.dataset.item }); break;
      case 'gravedirt-mode': gravedirtMode = true; render(); break;
      case 'gravedirt-cancel': gravedirtMode = false; render(); break;
      case 'use-gravedirt': gravedirtMode = false; send({ type: 'useItem', item: 'gravedirt', target: btn.dataset.id }); break;
      case 'rising': send({ type: 'risingPick', stat: btn.dataset.stat, spend: !!document.getElementById('spendItem')?.checked }); break;
    }
  });
  document.addEventListener('change', (e) => { if (e.target.id === 'spendItem') spendItem = e.target.checked; });

  render();
})();

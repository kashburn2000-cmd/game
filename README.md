# 🎭 Strange Is the Night

A King in Yellow social-deduction party game (built on Robert W. Chambers' public-domain 1895 mythos) for **4–12 players** (best with 6–8).
The **TV shows the game** in a browser; everyone **plays from their phone** —
no apps to install, nothing to print, no moderator needed.

Werewolf at heart, with an RPG twist: the secret Masked, night-time exploration
with dice checks, one-use items, sanity and madness, haunting ghosts, secret
side-quests, and an evening-long Doom Track that can end in a cooperative
boss fight against the King himself.

Full rules and design: see [DESIGN.md](DESIGN.md). How to play, in one breath:
the Masked secretly kill at night, the town argues by day and votes someone out,
the dead become ghosts who curse the living, and everything else is flavor,
items, and paranoia.

---

## Get it running (one-time setup, ~15 minutes, no coding)

You need a free [Cloudflare](https://cloudflare.com) account (you already have
one if your domain is on Cloudflare).

**Step 1 — Install Node.js.** Go to [nodejs.org](https://nodejs.org) and
install the "LTS" version like any normal program.

**Step 2 — Get this project onto your computer.** On the GitHub page for this
repository click the green **Code** button → **Download ZIP**, and unzip it
somewhere (e.g. your Desktop).

**Step 3 — Open a terminal in that folder.**
- **Windows:** open the unzipped folder, click the address bar, type `cmd`, press Enter.
- **Mac:** right-click the folder in Finder → Services → "New Terminal at Folder"
  (or open Terminal and type `cd `, then drag the folder onto the window and press Enter).

**Step 4 — Paste these two commands**, one at a time (each takes a minute):

```
npm install
npx wrangler login
```

The second one opens your browser — click **Allow** to connect your
Cloudflare account. Then:

```
npx wrangler deploy
```

That's it. The command prints a URL ending in **`.workers.dev`** — the game
is live there right now, for free. Open that URL on your TV's browser and
you're in business.

### Optional: put it on your own domain

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages**.
2. Click **strange-is-the-night** → **Settings** → **Domains & Routes**.
3. Click **Add** → **Custom domain**, type something like `game.yourdomain.com`, confirm.

A minute later the game answers at `game.yourdomain.com`. (This only works
for a domain that's already managed by the same Cloudflare account.)

### Updating the game later

If the game gets updated, download the new ZIP and run `npx wrangler deploy`
again from the new folder. Same URL, new game.

---

## Party day

1. On the TV, open the game URL in a browser and tap **"Host on this screen."**
   (That first tap also switches on the sound — the game has an ambient
   soundtrack, so put the TV volume up a little.)
2. Everyone else opens the same URL on their phone → **Join a game** → enters
   the 4-letter code on the TV and their first name, then claims a persona.
3. The first person to join is the **host** (⭐ on their phone) and gets the
   "Deal the roles" button plus in-game controls (extend timer, skip to vote,
   force a stuck phase, and marking curse-breakers).
4. Play games all evening — wins bank Black Stars on the scoreboard and move
   the Doom Track. For the last game of the night, the host checks
   **🌌 The Stars Are Right** to unlock the extra roles and the boss finale.

### Host tips

- Phones that fall asleep reconnect automatically to the same seat — just
  reopen the page. Friends arriving late can join mid-game as ghosts.
- If a phase ever stalls (someone's in the bathroom), the host's
  **force next phase** button auto-resolves it.
- The spirits enforce curses gleefully, but the host's phone has the actual
  "mark broken" button. Breaking a curse forfeits that day's vote.

### Backup plan (no internet / domain trouble)

The game also runs entirely on a laptop over your home WiFi:

```
npm run local
```

It prints an address like `http://192.168.1.23:8787` — open that on the TV
and all the phones (same WiFi). No internet needed at all.

---

## For the technically curious

- `src/engine/` — the whole game as a pure state machine + all the content
  (narration variants, exploration scenes, curses, items, personas).
- `src/worker.js` — Cloudflare Worker; one Durable Object per room holds the
  game and its WebSockets, with alarms driving the timers.
- `local/server.js` — the same engine behind a plain Node + `ws` server.
- `public/` — the TV/phone client: vanilla JS, no build step, procedural
  WebAudio soundtrack (no audio files).
- `npm test` — simulates complete games through every phase;
  `node test/e2e.js` runs a real WebSocket game against the local server.

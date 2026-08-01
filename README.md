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

Two things worth knowing before your first game:

- **Casting someone out takes a real majority** — at least half the voting
  townsfolk, rounded up, on one name. Abstaining doesn't lower that bar, so a
  quiet room protects whoever is accused. The TV and every phone show the
  number live.
- **The last game of the night can end in a boss fight.** If the Masked
  complete the ritual with 🌌 *The Stars Are Right* switched on, the whole
  table — living, dead, and the Masked — plays five scenes against the King
  himself.

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

### The domain: strangeisthenight.party

The project is pre-configured to live at **strangeisthenight.party** (and
`www.`) — `npx wrangler deploy` attaches the domain automatically. The only
requirement is that the domain exists in the **same Cloudflare account**
you logged into:

- **Bought through Cloudflare?** Nothing to do — it's already there.
- **Bought elsewhere (Namecheap, GoDaddy, Porkbun...)?** One-time move:
  1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a domain** →
     type `strangeisthenight.party` → pick the **Free** plan.
  2. Cloudflare shows you two **nameservers** (like `ada.ns.cloudflare.com`).
     At the site where you bought the domain, find the domain's
     **Nameservers** setting and replace whatever is there with those two.
  3. Wait for Cloudflare to email "your domain is active" (minutes to a few
     hours), then run `npx wrangler deploy` (again, if you already had).

If `deploy` complains it can't create the custom domain, the domain isn't
active in your account yet — the game still works at the `.workers.dev`
URL in the meantime.

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
5. If that finale goes badly and the ritual completes, everyone keeps
   playing: **The Last Act** puts the whole table — including the ghosts, and
   including the Masked, who each have to declare on the record whether
   they're taking the mask off — through five scenes against the King. How
   ugly the Doom Track got all evening decides how hard those scenes are.

### Friend photos (optional, highly recommended)

Drop a photo of each friend into the `public/eggs/` folder of the repo,
named exactly: `brendan.jpg`, `alex.jpg`, `jason.jpg`, `annie.jpg`,
`matt.jpg`, `kevin.jpg` (lowercase, .jpg). Easiest way, all in the
browser: on GitHub, open the `public/eggs` folder → **Add file →
Upload files** → drag the photos in → **Commit**. The site redeploys
itself, and the game gains two moments per person — an "archival plate"
of their face beside their obituary on the TV, and a photo in their
personal Palace Theater scene. The display ages the photos ~100 years
automatically; upload normal modern photos.

Note: anything in `public/` is served on the website (and visible in the
repo). If the repo is public and that matters to you, flip it to private
first: GitHub → Settings → General → Danger Zone → Change visibility.
Cloudflare's deploy keeps working with private repos.

### Host tips

- Phones that fall asleep reconnect automatically to the same seat — just
  reopen the page. Friends arriving late can join mid-game as ghosts.
- If a phase ever stalls (someone's in the bathroom), the host's
  **force next phase** button auto-resolves it.
- Your host phone also carries **📸 the Courier's photographer**: snap a
  candid photo mid-argument and it appears on the TV for 14 seconds as an
  aged archival plate ("PLATE 4 — Recovered from the Palace archives").
  Ephemeral — shown once, stored nowhere.
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

# A Shadow Over Arkham

A Lovecraftian social deduction party game for 6–8 players. Runs in a browser
on the living-room TV; players join from their phones via a room code. The
arguing happens out loud in the room — the app handles everything that
normally needs a moderator or trust: secret roles, night actions, anonymous
voting, timers, and dramatic reveals.

## The pitch

Automated Werewolf, reskinned as a 1920s New England town infiltrated by a
cult. No moderator needed, no closed eyes, no cheating: night actions happen
silently on phones while the TV shows fog and dread. Eliminated players don't
leave the game — they *succumb to madness* and keep playing as Restless
Spirits with real (but non-secret-leaking) powers.

## Roles

Dealt secretly to phones at game start.

| Role | Count | Power |
|---|---|---|
| **Cultist** | 2 | Know each other. Each night, jointly choose a victim to sacrifice. |
| **Medium** | 1 | Each night, divines one player: learns cultist / not cultist. |
| **Occultist** | 1 | Each night, wards one player; blocks the sacrifice if they were targeted. |
| **Townsfolk** | rest | No powers. Wits and paranoia. |
| **Lunatic** | 1 (only at 8 players) | Wins alone if the town votes them out. |

### Stretch roles (unlockable for later games in the evening)

| Role | Power |
|---|---|
| **Deep One Hybrid** | Innocent townsfolk, but the Medium sees them as a cultist. |
| **Archivist** | Privately learns each banished player's true role before the public TV reveal. |

## Game flow

1. **Lobby.** TV shows room code. Players join on phones and claim a 1920s
   Arkham persona (name + portrait, e.g. *Dr. Constance Whateley, Coroner*).
   Narration uses persona names throughout.
2. **Night.** TV dims to fog/ambient dread — identical visuals regardless of
   what's happening, so it can't leak information. Phones prompt night
   actions (cultists pick a victim, Medium divines, Occultist wards). Phone
   vibration cues your turn.
3. **Morning.** TV narrates the night's events in pulpy prose. Night one has
   a kill (early death is softened by ghost powers — first ghost gets first
   haunting).
4. **Day.** 3-minute out-loud discussion timer. Host phone has +1 min and
   skip-to-vote controls.
5. **Judgment.** Anonymous vote on phones. Slow dramatic reveal of the
   banished player's true role on the TV. **Tie = nobody banished.**
6. Repeat until a side wins.

**Win conditions:** Cultists win when they equal the remaining townsfolk (the
ritual completes; TV goes apocalyptic). Town wins by banishing both cultists.
Lunatic wins alone by getting voted out.

A full game runs 20–30 minutes.

## The Restless Spirits (eliminated players)

Spirits see everything — all roles and night actions — but their powers are
designed to be fun without leaking secrets:

1. **Haunting.** Each morning, spirits vote to curse one living player with a
   rule for the day (e.g. "may only speak in questions", "must begin every
   sentence with 'Mark my words'", "cannot say the word 'cultist'").
   Breaking the rule costs that player their vote for the day.
2. **Whispers.** Spirits can fire pre-written cryptic phrases onto the TV
   during discussion ("*One among you reeks of brine.*", "*The stars are
   almost right...*"). Curated list only — no free text, so nothing can be
   spelled out.

Late arrivals join as spirits until the next game deals them in.

## The evening as a campaign

- Persistent scoreboard across games: each win earns the side **Elder Signs**.
- Post-game **stats ceremony** on the TV: who voted for whom all night, plus
  earned titles — "Most Paranoid" (voted against most innocents), "Silver
  Tongue" (longest-surviving cultist), "Cassandra" (was right, banished
  anyway).
- Final game of the night: **"The Stars Are Right"** — stretch roles enabled,
  TV visuals progressively more apocalyptic.

## Narration tone

**Dread with dry wit** — Night-Vale-adjacent. Real atmosphere, but the
*Arkham Advertiser* cheerfully misreports each horror ("The screaming, the
paper assures readers, was recreational"). Write 4–5 variants of every
narration beat so back-to-back games don't repeat lines.

## Sound

- TV: low ambient drone at night, heartbeat as vote timer runs out, sting on
  role reveals, dead silence just before them.
- Phones: vibration when it's your turn to act at night.

## Practical party requirements

- Phones reconnect to their seat automatically after locking / WiFi drops.
- Host runs everything from their phone after setup; nobody touches the TV.
- Host controls: pause, kick, extend timer, skip to vote.

## Tech

- **Hosting:** Cloudflare Workers free tier (WebSockets via Durable Objects),
  deployed on the owner's existing Cloudflare-managed domain
  (e.g. `game.<domain>`). Deployment guide must be plain-English for a
  non-coder: install one tool, paste two commands, click "add subdomain" in
  the Cloudflare dashboard.
- **Fallback:** runnable on a laptop on home WiFi in case the domain fights
  us on party day.
- **Clients:** plain phone/TV browsers, nothing to install.

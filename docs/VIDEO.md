# Strange Is the Night — Video Shot List

Generate each clip and upload to `public/video/` with the exact filename
(GitHub → folder → Add file → Upload files). Everything is optional — any
missing clip falls back to the current CSS fog. The game adds a uniform
film-grain + flicker overlay on top of all clips, so minor style
differences between generations will blend.

**Global style prefix — start EVERY prompt with this:**

> 1920s silent film footage, silver-nitrate black and white with faint
> sepia tint, heavy film grain, slight projector flicker, slow static
> camera, no people, no faces, no text or signage legible, moody, foggy

**Technical rules**
- 16:9, 1080p, H.264 `.mp4`, 8–12 seconds, intended to loop
- No audio track (the game's sound is separate; videos play muted)
- Keep each file under ~20 MB (GitHub's web uploader caps at 25 MB;
  if a clip comes out bigger, upload it anyway if under 25 and it can be
  compressed later)
- Slow or static camera only — fast moves loop badly and read modern
- Generate 2–3 takes; keep the emptiest, slowest one

## The shots (priority order)

| File | Prompt (after the global prefix) | Where it plays |
|---|---|---|
| ★ `prologue.mp4` | a vast dark lake at night seen from the shore, low mist standing on the water like a curtain, faint suggestion of towers on the far side almost hidden in fog, water barely moving | behind all six prologue cards |
| ★ `night.mp4` | empty small-town main street at night, gas lamps glowing in fog, mist drifting slowly across the street, storefronts dark | night phase backdrop |
| ★ `king.mp4` | an ornate abandoned theater proscenium seen from the empty house, tattered yellow-tinged curtain stirring as if breathing, darkness beyond the curtain, dust in a single shaft of light | The Last Act (all rounds) |
| ★ `king-stage.mp4` | the same abandoned theater, curtain now fully open onto absolute darkness, rows of empty seats beginning to fill with shadow, light dying | the bad ending |
| `curtain-falls.mp4` | heavy theater curtain fully closed, house lights warming slowly, dust settling, stillness, the faintest morning light entering from a side door | the good ending |
| `lobby.mp4` | an old theater marquee at night with its lights on but every bulb slightly out of sync, fog around the lamps, letters out of focus and unreadable | lobby backdrop |
| `dawn.mp4` | grey morning over a lake town, mist retreating across the water, rooftops and chimneys in silhouette, no birds, stillness | dawn phase backdrop |

## Skip list (deliberately no video)

- **Day / vote phases** — that's reading time (curses, whispers, timers);
  motion behind text hurts more than it helps.
- **Reveal** — the name card is the star; darkness is its frame.
- **The Courier front page** — it's a newspaper; it should be paper.

## Doom variants (optional stretch, only if generating is fun)

| File | Prompt addition | Plays when |
|---|---|---|
| `lobby-doom.mp4` | same marquee shot, but every lamp lit steady, fog gone yellow-tinged, one bulb pulsing like a heartbeat | lobby when doom ≥ 6 |
| `night-doom.mp4` | same main street, but a second faint shadow angle on every object as if lit by a second unseen moon | night when doom ≥ 6 |

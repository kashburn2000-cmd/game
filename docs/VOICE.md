# Strange Is the Night — Audio Production Script

Generate each line as its own file with the exact filename given, then upload:
voice lines to `public/voice/`, sound effects to `public/sfx/` (GitHub →
folder → Add file → Upload files). Everything is optional — the game plays
its built-in procedural audio for anything missing, so partial uploads work.

**Voice direction:** unhurried, dry, almost administrative — a town
historian who has made peace with the material. Never spooky-voice; the
words do the horror. Low style / high stability settings. Use `.mp3`.

**ElevenLabs tips:** punctuation is your pacing tool — em dashes for beats,
ellipses for long pauses. Generate two or three takes of important lines
and keep the calmest one. For the whispers section, use a whispered
delivery (audio tag like `[whispers]` if your model supports it, or a
separate whisper-capable voice) — and note the game plays whispers LOUD,
because a party room is noisy; whispered ≠ quiet. For single-word files
(the names), end with a period and generate with surrounding silence.

---

## 1. The Prologue — `prologue-01.mp3` … `prologue-06.mp3`

**prologue-01** *(measured, reciting)*
> "Strange is the night where black stars rise, and strange moons circle
> through the skies." — from a play no one will name. Act One.

**prologue-02**
> Castaigne. Population eleven hundred — give or take. Lately, take.
> A lake town at the end of a rail line, known for three things: its mist,
> its whiskey, and the Palace Theater, dark on Main Street for thirty
> years. The mist and the whiskey are doing fine.

**prologue-03**
> Last month, a traveling company arrived to reopen the Palace. Nobody saw
> their train come in. The station master insists there wasn't one. But
> their posters hang on every lamppost, and the marquee is lit for the
> first time in living memory — and it does not say the name of the play.
> Everyone knows it anyway.

**prologue-04**
> The company has been rehearsing. Auditions, it seems, are ongoing —
> because some of your neighbors have started smiling through their
> conversations the way an actor smiles through a scene he has already
> read to the end of. They have seen the second act. They are casting
> for it now.

**prologue-05**
> The old wards still hold: chalk on the doorsteps, salt on the sills, a
> small town's stubborn refusal to learn its lines. A play cannot go on
> without its audience. So the town must be taken… one seat at a time.

**prologue-06** *(the only card allowed to slow down and mean it)*
> Tonight the mist is early. The lamps are lit. And somewhere among you —
> your friends, your neighbors, the faces you have known your whole
> life — the Masked are choosing. Places, everyone. The curtain was up
> before you sat down.

## 2. Phase announcements

| File | Line |
|---|---|
| `gamestart.mp3` | Places, everyone. |
| `night.mp3` | Night falls over Castaigne. |
| `dawn.mp3` | Dawn. |
| `day.mp3` | The town deliberates. |
| `vote.mp3` | Judgment. |
| `reveal.mp3` | The town has spoken. |
| `lastact.mp3` | The Last Act. |
| `curtain-falls.mp3` | The curtain falls. |
| `king-stage.mp3` | The King takes the stage. |

## 3. The whispers — `whisper-01.mp3` … `whisper-18.mp3`

Whispered delivery. These must match the on-screen text exactly, in this
order (the game numbers them the same way):

1. Have you seen the Yellow Sign?
2. Strange is the night where black stars rise.
3. The one who smiles has read further than they admit.
4. The Courier lies. It has always lied.
5. Trust the one you least enjoy.
6. Ask them to describe their mask.
7. The vote you regret is still ahead of you.
8. It is warmer down here than you'd think.
9. Two of you have already auditioned.
10. The librarian knows. The librarian always knows.
11. The lake has no far shore tonight.
12. You banished the wrong one once. You will again.
13. The quiet one is counting you.
14. Someone here has already taken their bow.
15. We are all in the play now. Some of you have lines.
16. The stars are not right. They are REHEARSING.
17. Check the promptbook. Someone has added a scene.
18. Save your vote. Spend your suspicion.

## 4. The names — `name-<name>.mp3`

Flat. Calm. Nothing else in the file. Played once each per evening, when
that person's archival plate appears.

| File | Line |
|---|---|
| `name-brendan.mp3` | Brendan. |
| `name-alex.mp3` | Alex. |
| `name-jason.mp3` | Jason. |
| `name-annie.mp3` | Annie. |
| `name-matt.mp3` | Matt. |
| `name-kevin.mp3` | Kevin. |

## 5. The Last Act rounds — `lastact-1.mp3` … `lastact-3.mp3`

**lastact-1**
> The house lights die across the whole sky. The King is in the wings.

**lastact-2**
> Half the town is audience now, seated in rows in the mist. Hold the
> line either way.

**lastact-3**
> The final scene. The tattered mantle fills the sky above the Palace.
> Whatever you have left, Castaigne — spend it before the bow.

## 6. Optional — for features not yet built (record now or later)

| File | Line | For |
|---|---|---|
| `letter.mp3` | *(whispered)* The post has come. | the Morning Post |
| `aswaswritten.mp3` | As was written. | prophecies |

---

## Sound effects — `public/sfx/`

Generate with the ElevenLabs SFX tool using the prompts below. Loops
should be requested as seamless loops (~20 seconds). Priorities marked ★
are the ones that will land hardest at a party.

| File | Prompt | Used for |
|---|---|---|
| ★ `bell.mp3` | a single distant church bell toll, heavy, slow decay, through fog | dawn, the prologue epigraph |
| ★ `heartbeat-loop.mp3` | slow muffled human heartbeat, tense, seamless loop | final 25 seconds of every vote |
| ★ `plate.mp3` | antique camera flash powder pop, 1900s photography, glass plate slide | the Courier's photographer + obituary plates |
| ★ `applause.mp3` | sparse slow applause in a large empty theater, echoing, unsettling | the Masked win; the King's endings |
| `night-loop.mp3` | low ominous drone, distant lake water lapping, sparse wood creaks, seamless loop | night phase bed |
| `day-loop.mp3` | quiet 1920s small town morning, sparse birds, distant dog, faint wind, seamless loop | day phase bed |
| `curtain.mp3` | heavy stage curtain sweeping in an old theater, fabric and rings | prologue end, game start |
| `sting-death.mp3` | sudden dissonant string sting, horror, short | night victims |
| `sting-reveal.mp3` | deep timpani hit with a reverse cymbal swell into it, dramatic | role reveals |
| `seal.mp3` | wax seal cracking, old envelope paper opening | letters (when built) |
| `dice.mp3` | bone dice rolling and settling on a wooden table | Last Act rolls |
| `knock.mp3` | two slow deliberate knocks on old wood | hauntings |
| `piano.mp3` | distant out-of-tune player piano, short eerie unresolved phrase | lobby ambience accent |

**Mixing note:** generate everything, then trust the game's mixer — voice
lines duck the ambient beds automatically once wired. If a file sounds too
quiet in ElevenLabs previews, don't worry; level-matching happens in the
game, not in the files.

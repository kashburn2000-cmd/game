// All flavor content for A Shadow Over Arkham: personas, narration,
// exploration scenes, curses, whispers, items, objectives.
// Narration entries are arrays of variants; the engine picks one at random
// so back-to-back games don't repeat lines.

export const PERSONAS = [
  { id: 'whateley', name: 'Dr. Constance Whateley', job: 'Coroner', icon: '🩺', brawn: 1, wits: 3, nerve: 2, blurb: 'Has never met a corpse she couldn’t make small talk with.' },
  { id: 'finnegan', name: '"Fish-Eye" Finnegan', job: 'Dockworker', icon: '⚓', brawn: 3, wits: 1, nerve: 2, blurb: 'Saw something in the water in ’19. Won’t say what. Charges a nickel to not say it again.' },
  { id: 'marsh', name: 'Prof. Edmund Marsh', job: 'Linguist, Miskatonic U.', icon: '📖', brawn: 0, wits: 4, nerve: 1, blurb: 'Fluent in eleven languages, three of which have no living speakers. Or so he hopes.' },
  { id: 'pryce', name: 'Sister Agatha Pryce', job: 'Asylum Nurse', icon: '🕯️', brawn: 1, wits: 2, nerve: 3, blurb: 'Unshockable. The patients find this comforting. The doctors find it suspicious.' },
  { id: 'crane', name: 'Silas Crane', job: 'Gravedigger', icon: '⚰️', brawn: 3, wits: 2, nerve: 1, blurb: 'Digs them six feet down and, lately, has started digging them seven.' },
  { id: 'ashcroft', name: 'Vivian Ashcroft', job: 'Jazz Singer', icon: '🎷', brawn: 1, wits: 2, nerve: 3, blurb: 'Sings at the Roadhouse. The applause is enthusiastic and not entirely human.' },
  { id: 'hobbes', name: 'Deputy Roy Hobbes', job: 'Lawman', icon: '⭐', brawn: 3, wits: 2, nerve: 1, blurb: 'Enforces the law. Increasingly unsure whose.' },
  { id: 'zerelda', name: 'Madame Zerelda', job: 'Fortune Teller', icon: '🔮', brawn: 0, wits: 3, nerve: 3, blurb: 'Refunds available if the doom she foretells fails to arrive. Has never issued a refund.' },
  { id: 'pike', name: 'Chester Pike', job: 'Reporter, Arkham Advertiser', icon: '📰', brawn: 1, wits: 3, nerve: 2, blurb: 'Committed to printing the truth, lightly edited for cheerfulness.' },
  { id: 'lockwood', name: 'Ada Lockwood', job: 'Librarian', icon: '🗝️', brawn: 0, wits: 4, nerve: 2, blurb: 'Runs the restricted section. Shushes things that should not be shushed.' },
  { id: 'grey', name: '"Doc" Tobias Grey', job: 'Pharmacist', icon: '⚗️', brawn: 1, wits: 3, nerve: 2, blurb: 'His tonics cure insomnia, melancholy, and — since March — visions of the sea.' },
  { id: 'calloway', name: 'Ruth Calloway', job: 'Bootlegger', icon: '🥃', brawn: 2, wits: 2, nerve: 2, blurb: 'Moves crates by moonlight. Has strong opinions about what else moves by moonlight.' },
];

export const ROLES = {
  cultist:   { name: 'Cultist',   icon: '🐙', team: 'cult', desc: 'You serve what sleeps beneath the bay. Each night, choose a sacrifice with your fellow cultist. By day, blend in. Win when the cult equals the town.' },
  medium:    { name: 'Medium',    icon: '🃏', team: 'town', desc: 'Each night, divine one soul and learn whether they belong to the cult. Your knowledge is precious — and claiming it out loud paints a target on you.' },
  occultist: { name: 'Occultist', icon: '✴️', team: 'town', desc: 'Each night, place a warding sigil on one person. If the cult comes for them, the sigil holds. You may ward yourself.' },
  townsfolk: { name: 'Townsfolk', icon: '🏚️', team: 'town', desc: 'No powers — only wits, paranoia, and a vote. Explore the town by night; argue by day. Banish both cultists to win.' },
  lunatic:   { name: 'Lunatic',   icon: '🎭', team: 'lunatic', desc: 'The asylum misses you. You win — alone, instantly — if the town votes to banish you. Act suspicious. But not TOO suspicious.' },
  hybrid:    { name: 'Deep One Hybrid', icon: '🐟', team: 'town', desc: 'You are innocent — but the sea is in your blood, and the Medium will see you as a cultist. Good luck explaining that.' },
  archivist: { name: 'Archivist', icon: '📜', team: 'town', desc: 'You keep the true records. Whenever someone is banished, you privately learn their real role moments before the town does.' },
};

// ---- Haunting curses (also reused as madness quirks) ----
export const CURSES = [
  { id: 'questions', text: 'May only speak in questions' },
  { id: 'markmywords', text: 'Must begin every sentence with "Mark my words"' },
  { id: 'nocult', text: 'Cannot say "cult" or "cultist"' },
  { id: 'thirdperson', text: 'Must refer to themselves in the third person' },
  { id: 'knock', text: 'Must knock twice on something after every statement' },
  { id: 'nonames', text: 'Cannot use anyone’s name — occupations only' },
  { id: 'whisper', text: 'Must whisper at all times' },
  { id: 'stand', text: 'Must stand while speaking' },
  { id: 'noquestions', text: 'Cannot ask questions' },
  { id: 'dearfolk', text: 'Must address the group as "dear townsfolk" when speaking' },
];

// ---- Spirit whispers (curated — spirits can never type free text) ----
export const WHISPERS = [
  'One among you reeks of brine.',
  'The stars are almost right...',
  'I saw who smiled at the funeral.',
  'The Advertiser lies. It has always lied.',
  'Trust the one you least enjoy.',
  'Someone here has salt water where blood should be.',
  'The vote you regret is still ahead of you.',
  'It is warmer down here than you’d think.',
  'Two of you have already spoken to it.',
  'The librarian knows. The librarian always knows.',
  'Check under the floorboards. Not those. The other ones.',
  'You banished the wrong one once. You will again.',
];

// ---- Items ----
export const ITEMS = {
  amulet: { id: 'amulet', name: 'Elder Sign Amulet', icon: '🧿', desc: 'If the cult comes for you, the sigil burns bright and you survive. Consumed. Automatic.' },
  flask: { id: 'flask', name: 'Whiskey Flask', icon: '🥃', desc: 'Drink to shrug off a haunting curse. Consumed.' },
  press: { id: 'press', name: 'Press Credentials', icon: '📰', desc: 'After a vote, privately see exactly who voted for whom. Once.' },
  gravedirt: { id: 'gravedirt', name: 'Grave Dirt', icon: '🪦', desc: 'The spirits owe you one. Choose who the next haunting strikes. Consumed.' },
};

// ---- Exploration ----
// Each scene: text, two choices. A choice either has a flat `outcome`, or a
// `check` (stat + dc) with success/fail outcomes.
// Outcome: { sanity, item, sign, text, tag }  (tag feeds morning narration flavor)
export const LOCATIONS = {
  docks: {
    name: 'The Docks', icon: '⚓',
    scenes: [
      { id: 'ledger', text: 'The harbormaster’s shack is unlocked. His ledger lists cargo that only arrives on moonless nights, signed for in a script that hurts to read.',
        choices: [
          { label: 'Tear out the page', check: { stat: 'nerve', dc: 12 },
            success: { item: 'press', sanity: 0, text: 'You pocket the page. Proof, of a kind. Your hands only shake a little.', tag: 'docks' },
            fail: { sanity: -2, text: 'The script writhes as you tear it. You read one word by accident. You will not repeat it.', tag: 'docks' } },
          { label: 'Leave it and go', outcome: { sanity: 1, text: 'Some doors are better left shut. You walk home whistling, loudly, the whole way.', tag: 'docks' } },
        ] },
      { id: 'net', text: 'A fishing net has hauled up something wrapped in oilcloth and rope, tied with knots no sailor here would admit to knowing.',
        choices: [
          { label: 'Cut it open', check: { stat: 'brawn', dc: 11 },
            success: { item: 'amulet', text: 'Inside: a stone charm, warm as a handshake. The carvings match nothing in any church.', tag: 'docks' },
            fail: { sanity: -1, text: 'The rope parts and the oilcloth exhales. Whatever was inside had already left. Recently.', tag: 'docks' } },
          { label: 'Kick it back in', outcome: { sanity: 0, text: 'It sinks too fast, like something below reached up to accept the delivery.', tag: 'docks' } },
        ] },
      { id: 'singing', text: 'From beneath the pier: singing. Low, patient, in a round. The tide is going out but the water level is not.',
        choices: [
          { label: 'Listen closer', check: { stat: 'wits', dc: 13 },
            success: { item: 'gravedirt', sanity: -1, text: 'You catch a verse. It is a work song. You understand, horribly, what the work is — and what the dead are owed for it.', tag: 'docks' },
            fail: { sanity: -2, text: 'You listen too long. For the rest of the night the song hums along inside your teeth.', tag: 'docks' } },
          { label: 'Hum something louder', outcome: { sanity: 1, text: 'You drown it out with a show tune. The singing stops, offended. A small, ridiculous victory.', tag: 'docks' } },
        ] },
    ],
  },
  library: {
    name: 'The Library', icon: '🗝️',
    scenes: [
      { id: 'restricted', text: 'The restricted section door stands open. It is never open. A book on the lectern is open too, to a page headed "Concerning the Tenants of the Bay."',
        choices: [
          { label: 'Read the page', check: { stat: 'wits', dc: 12 },
            success: { item: 'press', sanity: -1, text: 'You read fast and quit early. You now know what the cult calls itself, and why the fishing improved.', tag: 'library' },
            fail: { sanity: -2, text: 'The margin notes are in your own handwriting. You have never seen this book before.', tag: 'library' } },
          { label: 'Slam the book shut', outcome: { sanity: 1, text: 'The book puffs out dust and what sounds, faintly, like a sigh of relief.', tag: 'library' } },
        ] },
      { id: 'card', text: 'The card catalog has grown a new drawer overnight, labeled only with a spiral. The wood is wet.',
        choices: [
          { label: 'Open the drawer', check: { stat: 'nerve', dc: 12 },
            success: { item: 'flask', sanity: 0, text: 'Inside: a flask of very good whiskey and a note — "You’ll want this. — The Management."', tag: 'library' },
            fail: { sanity: -1, text: 'The drawer is deeper than the cabinet. Considerably. You shut it before the smell of low tide gets out.', tag: 'library' } },
          { label: 'File a complaint', outcome: { sanity: 1, text: 'You leave a stern note for the librarian. Order must be maintained somewhere in this town.', tag: 'library' } },
        ] },
      { id: 'atlas', text: 'An atlas lies open to the coast. Someone has re-inked the shoreline, and the new coastline is closer.',
        choices: [
          { label: 'Compare the editions', check: { stat: 'wits', dc: 13 },
            success: { item: 'amulet', sanity: -1, text: 'Every edition since 1919 differs. Tucked in the newest one: a stone charm and a bookmark reading "for the flood."', tag: 'library' },
            fail: { sanity: -1, text: 'The ink is not dry. The ink, you realize, is never dry.', tag: 'library' } },
          { label: 'Close the atlas', outcome: { sanity: 0, text: 'Maps are only opinions, you decide. The sea has opinions too, but louder.', tag: 'library' } },
        ] },
    ],
  },
  graveyard: {
    name: 'The Graveyard', icon: '🪦',
    scenes: [
      { id: 'fresh', text: 'A grave has been dug that no one ordered. It is neat, professional work — and exactly your height.',
        choices: [
          { label: 'Fill it back in', check: { stat: 'brawn', dc: 11 },
            success: { item: 'gravedirt', sanity: 1, text: 'You fill it in out of spite. You keep a pocketful of the dirt. The spirits appreciate a professional.', tag: 'graveyard' },
            fail: { sanity: -1, text: 'The soil keeps sliding back out, politely, like the hole insists it is expecting someone.', tag: 'graveyard' } },
          { label: 'Measure it, nervously', outcome: { sanity: -1, text: 'Exactly your height. To the inch. You leave at a dignified sprint.', tag: 'graveyard' } },
        ] },
      { id: 'mausoleum', text: 'The Marsh family mausoleum is lit from inside. The Marshes have been dead for sixty years, which makes this either trespassing or a reunion.',
        choices: [
          { label: 'Peer through the grate', check: { stat: 'nerve', dc: 13 },
            success: { item: 'press', sanity: -1, text: 'Robed figures, a ledger of names. You memorize what you can before the candles all turn to look at you.', tag: 'graveyard' },
            fail: { sanity: -2, text: 'Something peers back through the grate. It has been waiting for a face to practice on.', tag: 'graveyard' } },
          { label: 'Knock politely', outcome: { sanity: 1, text: 'The light goes out at once, embarrassed. Even horrors respect etiquette in this town.', tag: 'graveyard' } },
        ] },
      { id: 'sexton', text: 'The sexton’s tool shed hangs open. Among the spades: a stone charm on a nail, and a list of names with most crossed out.',
        choices: [
          { label: 'Take the charm', check: { stat: 'nerve', dc: 11 },
            success: { item: 'amulet', text: 'You lift the charm. The crossed-out list, you decide firmly, is a gardening schedule.', tag: 'graveyard' },
            fail: { sanity: -1, text: 'As you reach out, a fresh name appears on the list. You do not stay to read it.', tag: 'graveyard' } },
          { label: 'Read the list only', outcome: { sanity: -1, text: 'You recognize every name still standing. You are between two of them.', tag: 'graveyard' } },
        ] },
    ],
  },
  roadhouse: {
    name: "Hibb's Roadhouse", icon: '🎷',
    scenes: [
      { id: 'backroom', text: 'The card game in the back room went quiet when you walked in. The pot in the middle of the table is not money.',
        choices: [
          { label: 'Ask to be dealt in', check: { stat: 'nerve', dc: 12 },
            success: { item: 'flask', sanity: 0, text: 'You win a hand and a flask, and fold before you learn what the house always collects.', tag: 'roadhouse' },
            fail: { sanity: -1, text: 'You lose the hand. They let you keep what you wagered, which somehow feels worse.', tag: 'roadhouse' } },
          { label: 'Order a drink instead', outcome: { sanity: 1, text: 'The bartender pours a double without being asked. Bartenders know. Bartenders always know.', tag: 'roadhouse' } },
        ] },
      { id: 'song', text: 'The band is playing a number nobody requested and nobody wrote. The dancers’ shadows are a half-beat behind them.',
        choices: [
          { label: 'Study the shadows', check: { stat: 'wits', dc: 12 },
            success: { item: 'gravedirt', sanity: -1, text: 'The shadows aren’t behind — the dancers are early. Something below keeps the true time, and now you can hear it.', tag: 'roadhouse' },
            fail: { sanity: -1, text: 'Your own shadow taps its foot. You stop dancing. It doesn’t.', tag: 'roadhouse' } },
          { label: 'Dance anyway', outcome: { sanity: 1, text: 'If the world ends, it ends. You, at least, will have danced.', tag: 'roadhouse' } },
        ] },
      { id: 'cellar', text: 'The cellar hatch is padlocked from the outside — and knocking from the inside. Ruth’s "inventory" was due tonight.',
        choices: [
          { label: 'Open the hatch', check: { stat: 'brawn', dc: 12 },
            success: { item: 'flask', sanity: -1, text: 'Just crates. And a draft. And one crate, already open, packed with straw shaped like something that left. You take a consolation bottle.', tag: 'roadhouse' },
            fail: { sanity: -2, text: 'The knocking stops the moment the lock gives — which is, you realize far too late, much worse.', tag: 'roadhouse' } },
          { label: 'Add a second padlock', outcome: { sanity: 1, text: 'Problems you can lock in a cellar are the very best kind of problem.', tag: 'roadhouse' } },
        ] },
    ],
  },
};

// ---- Secret personal objectives (auto-checked by the engine) ----
export const OBJECTIVES = [
  { id: 'survive', text: 'Survive to the end of the game.' },
  { id: 'majority3', text: 'Vote for the banished player in 3 separate judgments.' },
  { id: 'votedCultist', text: 'Be among the voters who banish a cultist.' },
  { id: 'hauntedSurvive', text: 'Get haunted by the spirits — and still survive to the end.' },
  { id: 'visit3', text: 'Explore 3 different locations in one game.' },
  { id: 'holdTwo', text: 'Hold 2 items at the same time.' },
  { id: 'useItem', text: 'Use an item.' },
  { id: 'neverWrong', text: 'Vote at least twice, and never vote against an innocent.' },
];

// ---- Narration ----
const P = (name) => name; // persona display name passthrough for readability

export const NARRATION = {
  nightFall: [
    (day) => `Night ${day}. The gas lamps gutter, one by one, as if counting down. Something vast turns in its sleep beneath the bay.`,
    (day) => `Night ${day} settles over Arkham like a tarp over a birdcage. The town goes quiet. The bay does not.`,
    (day) => `Night ${day}. The fog rolls in off the water carrying the smell of low tide and old promises.`,
    (day) => `Night ${day}. Doors are locked, prayers are said, and neither precaution has a strong track record here.`,
  ],
  dawnDeath: [
    (n) => `Dawn. ${P(n)} was found at first light, raving at the tide in a language the tide seemed to understand. They are gone — though not, perhaps, entirely quiet.`,
    (n) => `Morning comes, thin and gray. Of ${P(n)}, only their shoes remain, placed neatly side by side, facing the sea.`,
    (n) => `The town wakes one soul lighter. ${P(n)}'s door stands open, their breakfast laid, their chair still warm, their whereabouts a matter for theologians.`,
    (n) => `${P(n)} did not come home last night. The harbor bell rang once at 3 a.m., by itself, in what witnesses describe as "a satisfied way."`,
    (n) => `At dawn they found ${P(n)}'s lantern at the water line, still lit, illuminating a single line of footprints that walk INTO the bay and do not walk back out.`,
  ],
  dawnWard: [
    (n) => `In the small hours, something came for ${P(n)} — and found the sigils on their door burning bright. The scratching lasted until four, then stopped, disappointed.`,
    (n) => `${P(n)} woke to find their windowsill scorched in the shape of a warding sign, and the garden path melted where something heavy had waited, and waited, and left hungry.`,
    (n) => `The wards held. ${P(n)} slept through the whole thing, which the neighbors — who did not — deeply resent.`,
    (n) => `Something tested every door and window of ${P(n)}'s house last night. The occultist's sigils sang like struck crystal until it gave up. ${P(n)} owes someone a drink.`,
  ],
  dawnAmulet: [
    (n) => `The cult came for ${P(n)} in the night — and the stone charm in their pocket flared white-hot. At dawn it was a handful of ash, and ${P(n)} was, remarkably, still a person.`,
    (n) => `${P(n)} woke on their own floor, ears ringing, clutching the crumbled remains of an Elder Sign. Whatever was owed last night went unpaid.`,
  ],
  haunt: [
    (n, c) => `The Restless Spirits have taken an interest in ${P(n)}. Until dusk: ${c}. The dead have a sense of humor. It did not improve with death.`,
    (n, c) => `A cold spot follows ${P(n)} this morning, and with it, a compulsion: ${c}. The spirits watch, delighted.`,
    (n, c) => `${P(n)} has been HAUNTED. The terms, scratched in frost on their mirror: ${c}.`,
  ],
  quirk: [
    (n, c) => `${P(n)}'s mind, sadly, has given way. A lasting madness takes root: ${c}. The asylum sends its regards and a pamphlet.`,
    (n, c) => `The horrors have added up. ${P(n)} now suffers a permanent affliction: ${c}. Friends are asked to be understanding, or at least entertained.`,
  ],
  tie: [
    () => `The town cannot agree, and the tied vote dissolves into shoving. No one is banished. Somewhere beneath the bay, something chuckles at democracy.`,
    () => `A tie. The meeting ends with pointed fingers and nothing done — a proud Arkham tradition. No one is banished.`,
    () => `Deadlock. The townsfolk glare at one another and disperse. The only winner today is the thing in the water.`,
  ],
  banishInnocent: [
    (n, r) => `The town drags ${P(n)} to the crossroads and casts them out. In their pockets: nothing but ${r === 'lunatic' ? 'asylum release papers, dated tomorrow' : 'a library card and an honest life'}. The town has made a terrible mistake. Again.`,
    (n, r) => `${P(n)} protests to the end — and the end comes anyway. They were ${r === 'townsfolk' ? 'exactly what they claimed: innocent' : 'innocent all along'}. The vote count is quietly burned.`,
    (n, r) => `Justice moves swiftly, and in entirely the wrong direction. ${P(n)} — innocent — is banished beyond the wards. The Advertiser will call it "a spirited civic exercise."`,
  ],
  banishCultist: [
    (n) => `As the town seizes ${P(n)}, their protests slide into a language with too many consonants. A CULTIST — robes under the floorboards, tide charts on the walls. Arkham exhales.`,
    (n) => `${P(n)} goes quietly — too quietly — and at the town line turns and smiles with entirely too many teeth. One of the cult, banished. The bay is furious tonight.`,
    (n) => `Under ${P(n)}'s mattress: an idol of wet green stone that no one can look at directly. A cultist, cast out. The town sleeps easier. The town is wrong to.`,
  ],
  cultWin: [
    () => `The bells ring backward at midnight. The remaining townsfolk look around the meeting hall and realize, too late, that they are outnumbered by smiles. The ritual is complete. THE CULT PREVAILS.`,
    () => `There are not enough honest hands left to bar the door. The tide comes all the way up Main Street, unhurried, like it owns the place — because now it does. THE CULT PREVAILS.`,
  ],
  townWin: [
    () => `The last cultist is cast out beyond the wards, and the fog lifts for the first time in living memory. The sea grumbles and recedes. Arkham endures — pig-headed, paranoid, and MAGNIFICENT. THE TOWN PREVAILS.`,
    () => `With the cult broken, the singing beneath the pier stops mid-verse. Silence, for once, sounds like victory. THE TOWN PREVAILS.`,
  ],
  lunaticWin: [
    (n) => `As the town votes to banish ${P(n)}, they burst into delighted applause. "FINALLY," they cry, producing commitment papers, "a MAJORITY DECISION." The Lunatic wanted this all along. THE LUNATIC WINS. Everyone else feels used.`,
    (n) => `${P(n)} thanks the town for the banishment, curtsies, and skips beyond the wards singing. The asylum had a bet going. THE LUNATIC WINS, alone.`,
  ],
  risingWin: [
    () => `The final syllable dies half-spoken. The shape above the bay hangs frozen — then collapses like a tide going out all at once, all over the world. You did not defeat it. Nothing defeats it. But tonight, together, you made Arkham TOO ANNOYING TO EAT. THE DAWN COMES.`,
  ],
  risingLose: [
    () => `The stars arrive. The sea stands up. In its last edition, the Arkham Advertiser reports "UNSEASONABLE WEATHER" in 300-point type. There are no further editions. THE OLD ONE RISES.`,
  ],
  advertiser: [
    `The Arkham Advertiser assures readers the screaming was recreational.`,
    `The Advertiser reminds readers that the harbor's new glow is "probably plankton, probably fine."`,
    `In civic news, the Advertiser reports attendance at church is up, "particularly at the new one."`,
    `The Advertiser's weather desk forecasts fog, followed by fog, followed by something moving in the fog.`,
    `The Advertiser prints a correction: the "escaped livestock" reported swimming out to sea was neither escaped, nor livestock, nor — strictly — swimming.`,
    `Classifieds: FOUND — one rowboat, returned to dock overnight, oars dry, hull warm. Owner need not come forward.`,
    `The Advertiser notes the asylum's annual gala was "well attended, twice, by the same guests."`,
    `Public notice: the lighthouse keeper wishes it known that whatever is flashing back at him, he did not start it.`,
  ],
  flavor: {
    docks: [
      `Lantern light was seen bobbing along the docks long after midnight.`,
      `The harbormaster reports his ledger "rearranged, but respectfully."`,
    ],
    library: [
      `The library lights burned late; the librarian denies scheduling this.`,
      `Several books were found reshelved in an order that spells something.`,
    ],
    graveyard: [
      `Fresh footprints wander the graveyard rows — pacing, or measuring.`,
      `The sexton found his spades cleaned and returned. He owns no spades.`,
    ],
    roadhouse: [
      `The Roadhouse band played until dawn for a crowd that cast too few shadows.`,
      `Hibb's went through a week of whiskey in one night. Nobody remembers drinking it.`,
    ],
  },
};

export const TITLES = [
  { id: 'paranoid', name: 'Most Paranoid', desc: 'voted against the most innocents' },
  { id: 'silvertongue', name: 'Silver Tongue', desc: 'survived longest as a cultist' },
  { id: 'cassandra', name: 'Cassandra', desc: 'was right about the cult — and got banished anyway' },
  { id: 'chatterbox', name: 'Chatterbox of the Beyond', desc: 'most whispers from beyond the grave' },
  { id: 'packrat', name: 'Packrat of the Apocalypse', desc: 'hoarded the most items' },
  { id: 'fragile', name: 'Most Fragile Mind', desc: 'lost the most sanity' },
];

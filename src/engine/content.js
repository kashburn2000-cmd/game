// All flavor content for A Shadow Over Arkham: personas, narration,
// exploration scenes, curses, whispers, items, objectives.
// Narration entries are arrays of variants; the engine picks one at random
// so back-to-back games don't repeat lines.

// Each persona carries a bespoke `death` line — used for some dawn reports so
// deaths feel personal to the character, not just the player.
export const PERSONAS = [
  { id: 'whateley', name: 'Dr. Constance Whateley', job: 'Coroner', icon: '🩺', brawn: 1, wits: 3, nerve: 2, blurb: 'Has never met a corpse she couldn’t make small talk with.',
    death: 'Dr. Constance Whateley was found at dawn on her own examination table, arranged with professional care, a toe tag filled out in her own meticulous hand. Cause of death: "see attached." Nothing is attached.' },
  { id: 'finnegan', name: '"Fish-Eye" Finnegan', job: 'Dockworker', icon: '⚓', brawn: 3, wits: 1, nerve: 2, blurb: 'Saw something in the water in ’19. Won’t say what. Charges a nickel to not say it again.',
    death: '"Fish-Eye" Finnegan is gone. On his stool at the dock they found a jar of nickels and a note: "It remembered me too." The harbor was glassy calm all night, witnesses say, except in one patient circle.' },
  { id: 'marsh', name: 'Prof. Edmund Marsh', job: 'Linguist, Miskatonic U.', icon: '📖', brawn: 0, wits: 4, nerve: 1, blurb: 'Fluent in eleven languages, three of which have no living speakers. Or so he hopes.',
    death: 'Professor Edmund Marsh was last seen in his study, mid-translation. The final word in his notebook is rendered in a beautiful, steady hand — and the ink continues off the page, off the desk, and out under the door.' },
  { id: 'pryce', name: 'Sister Agatha Pryce', job: 'Asylum Nurse', icon: '🕯️', brawn: 1, wits: 2, nerve: 3, blurb: 'Unshockable. The patients find this comforting. The doctors find it suspicious.',
    death: 'Sister Agatha Pryce did not report for the night shift. Her patients, every one, woke at 3 a.m. and observed a minute of silence — unprompted, in unison. They refuse to say who suggested it.' },
  { id: 'crane', name: 'Silas Crane', job: 'Gravedigger', icon: '⚰️', brawn: 3, wits: 2, nerve: 1, blurb: 'Digs them six feet down and, lately, has started digging them seven.',
    death: 'Silas Crane was taken in the night. His shovel stands upright in a fresh, neat, empty grave — his best work, the town agrees. Seven feet, exactly. The extra foot, it turns out, was for him.' },
  { id: 'ashcroft', name: 'Vivian Ashcroft', job: 'Jazz Singer', icon: '🎷', brawn: 1, wits: 2, nerve: 3, blurb: 'Sings at the Roadhouse. The applause is enthusiastic and not entirely human.',
    death: 'Vivian Ashcroft finished her final set to a standing ovation, witnesses say — though nobody remembers standing. She took one encore, one bow, and one step backstage, and the Roadhouse has no backstage.' },
  { id: 'hobbes', name: 'Deputy Roy Hobbes', job: 'Lawman', icon: '⭐', brawn: 3, wits: 2, nerve: 1, blurb: 'Enforces the law. Increasingly unsure whose.',
    death: 'Deputy Roy Hobbes made his last rounds at midnight. His badge was returned to the station door with a nail through it and a note in brine-soaked ink: "Jurisdiction settled."' },
  { id: 'zerelda', name: 'Madame Zerelda', job: 'Fortune Teller', icon: '🔮', brawn: 0, wits: 3, nerve: 3, blurb: 'Refunds available if the doom she foretells fails to arrive. Has never issued a refund.',
    death: 'Madame Zerelda’s parlor was found in perfect order: cards laid out mid-reading, kettle still warm, and a single nickel on the table — the first refund she ever issued, made out, apparently, to herself.' },
  { id: 'pike', name: 'Chester Pike', job: 'Reporter, Arkham Advertiser', icon: '📰', brawn: 1, wits: 3, nerve: 2, blurb: 'Committed to printing the truth, lightly edited for cheerfulness.',
    death: 'Chester Pike filed his last story at 2 a.m. — the presses ran themselves, the night printer swears, and every copy of the morning edition carries a headline that changes when read twice. Of Pike, no trace but his byline, which now appears on the obituary page. Under tomorrow’s date.' },
  { id: 'lockwood', name: 'Ada Lockwood', job: 'Librarian', icon: '🗝️', brawn: 0, wits: 4, nerve: 2, blurb: 'Runs the restricted section. Shushes things that should not be shushed.',
    death: 'Ada Lockwood was checked out overnight. That is the only way to describe it: her card sits in the restricted section’s ledger, stamped, with a due date the librarian’s assistant refuses to read aloud.' },
  { id: 'grey', name: '"Doc" Tobias Grey', job: 'Pharmacist', icon: '⚗️', brawn: 1, wits: 3, nerve: 2, blurb: 'His tonics cure insomnia, melancholy, and — since March — visions of the sea.',
    death: '"Doc" Tobias Grey’s pharmacy was found unlocked, one tonic bottle empty on the counter. The label, in his handwriting, reads: "For visions of the sea — WORKS." The back door stands open. The trail of wet footprints leads in.' },
  { id: 'calloway', name: 'Ruth Calloway', job: 'Bootlegger', icon: '🥃', brawn: 2, wits: 2, nerve: 2, blurb: 'Moves crates by moonlight. Has strong opinions about what else moves by moonlight.',
    death: 'Ruth Calloway missed her own midnight delivery — a first. Her truck sits at the shore road turn, engine running, headlights aimed at the water, cargo untouched. Whatever she moved by moonlight all these years, last night it moved her.' },
];

export const ROLES = {
  cultist:   { name: 'Cultist',   icon: '🐙', team: 'cult', desc: 'You serve what sleeps beneath the bay. Each night, choose a sacrifice with your fellow cultist. By day, blend in. Win when the cult equals the town.' },
  medium:    { name: 'Medium',    icon: '🃏', team: 'town', desc: 'Each night, divine one soul and learn whether they belong to the cult. Your knowledge is precious — and claiming it out loud paints a target on you.' },
  occultist: { name: 'Occultist', icon: '✴️', team: 'town', desc: 'Each night, place a warding sigil on one person. If the cult comes for them, the sigil holds. You may ward yourself.' },
  townsfolk: { name: 'Townsfolk', icon: '🏚️', team: 'town', desc: 'No powers — only wits, paranoia, and a vote. Explore the town by night; argue by day. Banish both cultists to win.' },
  lunatic:   { name: 'Lunatic',   icon: '🎭', team: 'lunatic', desc: 'The asylum misses you. You win — alone, instantly — if the town votes to banish you. Act suspicious. But not TOO suspicious.' },
  hybrid:    { name: 'Deep One Hybrid', icon: '🐟', team: 'town', desc: 'You are innocent — but the sea is in your blood, and the Medium will see you as a cultist. Good luck explaining that.' },
  archivist: { name: 'Archivist', icon: '📜', team: 'town', desc: 'You keep the town’s records. Each night, consult them on one soul: at dawn you learn where they went — or that NO ENTRY exists. Honest folk leave records. The busy ones don’t.' },
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
  { id: 'seaward', text: 'Must face the nearest window while speaking' },
  { id: 'echo', text: 'Must repeat the last word of every sentence, twice, quietly' },
  { id: 'nautical', text: 'Must work a nautical term into every statement' },
  { id: 'formal', text: 'Must address everyone by full persona name and title' },
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
  'The quiet one is counting you.',
  'Ask about the smell. Go on. Ask.',
  'We can see your cards from up here. All of them.',
  'The tide took me. The tide had HELP.',
  'Whoever speaks next is lying. Or was it the one after. It gets muddled, being dead.',
  'Save your vote. Spend your suspicion.',
];

// ---- Items ----
export const ITEMS = {
  amulet: { id: 'amulet', name: 'Elder Sign Amulet', icon: '🧿', desc: 'If the cult comes for you, the sigil burns bright and you survive. Consumed. Automatic.' },
  flask: { id: 'flask', name: 'Whiskey Flask', icon: '🥃', desc: 'Drink to shrug off a haunting curse. Consumed.' },
  press: { id: 'press', name: 'Press Credentials', icon: '📰', desc: 'After a vote, privately see exactly who voted for whom. Once.' },
  gravedirt: { id: 'gravedirt', name: 'Grave Dirt', icon: '🪦', desc: 'The spirits owe you one. Choose who the next haunting strikes. Consumed.' },
  seaglass: { id: 'seaglass', name: 'Sea-Glass Charm', icon: '🔹', desc: 'The next die you roll glows: +2. Automatic. Consumed.' },
  tarot: { id: 'tarot', name: 'The Hanged Man', icon: '🎴', desc: 'When a die fails you, draw again — and take the new fate, whatever it is. Once.' },
  salt: { id: 'salt', name: 'Ring of Salt', icon: '🧂', desc: 'The next haunting aimed at you breaks against your doorstep. Automatic. Consumed.' },
  key: { id: 'key', name: 'Skeleton Key', icon: '🗝', desc: 'Somewhere in Arkham is a door this fits. It will know when you are near. Consumed.' },
  watch: { id: 'watch', name: 'Dead Man’s Watch', icon: '⌚', desc: 'Use at night: follow one soul’s evening. At dawn, learn where they went — or that no record exists. Consumed.' },
};

// ---- Low-sanity visions: appended to exploration scenes at sanity <= 2 ----
export const VISIONS = [
  'Your hands, you notice, are wet. They have been wet all night.',
  'Someone keeps pace with you a street over. When you stop, it stops. Almost.',
  'The moon is on the wrong side of the sky. You decide not to mention this.',
  'You can hear your heartbeat. It is very slightly out of rhythm with your pulse.',
  'Every window you pass holds your reflection. One holds it a beat too long.',
  'The fog smells like a house you grew up in. You never lived by the sea.',
  'Somewhere behind you, your own voice asks you to wait up.',
];

// ---- Unrest: locations grow strange as checks fail there ----
export const UNREST_LINES = [
  (l) => `${l} has gone STRANGE. Locals now cross the street to avoid it. The street, locals report, also moved.`,
  (l) => `The town agrees, without ever meeting: nobody goes near ${l} after dark now. The town keeps going anyway.`,
];

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
            success: { item: 'press', sanity: 0, text: 'You pocket the page. Proof, of a kind. Your hands only shake a little.', tag: 'docks',
              next: { text: 'Boots on the boardwalk — two sets, unhurried, coming this way. The shack has one door and one window.',
                choices: [
                  { label: 'Hide and watch them', check: { stat: 'nerve', dc: 12 },
                    success: { item: 'watch', sanity: -1, text: 'Two figures collect the ledger without a lantern, counting pages by touch. One checks a pocket watch and leaves it on the sill. You take it. It is still ticking. It is set to a thirteenth hour.', tag: 'docks' },
                    fail: { sanity: -2, text: 'You hold your breath behind the door. They never enter. They stand outside for eleven minutes, waiting for you to breathe.', tag: 'docks' } },
                  { label: 'Out the window, now', outcome: { sanity: 0, text: 'You leave through the window with the dignity of a man exiting a window. Behind you, the shack door opens for no one.', tag: 'docks' } },
                ] } },
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
      { id: 'ferryman', text: 'At the last slip, a rowboat waits with a lit lantern and no rower. A hand-painted sign lists the fare. The fare is not money.',
        choices: [
          { label: 'Take the lantern', check: { stat: 'nerve', dc: 12 },
            success: { item: 'amulet', sanity: -1, text: 'You lift the lantern. Beneath it, a stone charm — a tip, perhaps, from a previous passenger who chose not to ride.', tag: 'docks' },
            fail: { sanity: -1, text: 'As your fingers close on the handle, the boat rocks — politely, like a chair being pulled out for you. You decline at speed.', tag: 'docks' } },
          { label: 'Pay nothing, take nothing', outcome: { sanity: 1, text: 'You tip your hat to the empty boat and keep walking. Behind you, oars creak. You do not turn around, and are proud of that forever.', tag: 'docks' } },
        ] },
      { id: 'icehouse', text: 'The ice house door is ajar. Inside, last week’s catch lies packed in sawdust and frost — and one of the fish is, very faintly, still singing.',
        choices: [
          { label: 'Find the singing fish', check: { stat: 'wits', dc: 12 },
            success: { item: 'flask', sanity: -1, text: 'You find it. It looks at you with a grandfather’s patience and stops singing, embarrassed. Behind the crate: the ice-man’s medicinal whiskey. You feel you’ve earned it.', tag: 'docks' },
            fail: { sanity: -1, text: 'The song stops the moment you get close — and starts again from a different crate. Then two crates. Then all of them, in harmony.', tag: 'docks' } },
          { label: 'Shut the door firmly', outcome: { sanity: 1, text: 'Not every mystery deserves a witness. You wedge the door with a gaff hook and sleep the sleep of the sensibly incurious.', tag: 'docks' } },
        ] },
      { id: 'thirdtide', rare: true, gate: 'visits',
        text: 'Third night at the water, and the water has decided you may as well see. The tide pulls back past all reason — past the moorings, past the sandbar, laying bare the drowned first street of Old Arkham: cobbles, lamp posts, one door still on its hinges.',
        choices: [
          { label: 'Walk the drowned street', check: { stat: 'nerve', dc: 14 },
            success: { item: 'watch', sanity: -1, text: 'The door opens on a parlor kept tidy for eighty years. On the mantle, a watch, still ticking, set to a thirteenth hour. You take it. Something, somewhere, approves of punctuality.', tag: 'docks' },
            fail: { sanity: -3, text: 'You reach the lamp post before you understand the lamps are lit, and turn back before you understand for whom.', tag: 'docks' } },
          { label: 'Watch from the seawall', outcome: { sanity: 1, text: 'You witness it from a respectful altitude, remove your hat, and let the sea keep its museum. The tide returns like a curtain.', tag: 'docks' } },
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
            success: { item: 'flask', sanity: 0, text: 'Inside: a flask of very good whiskey and a note — "You’ll want this. — The Management."', tag: 'library',
              next: { text: 'Beneath the flask, the drawer keeps going — deeper than the cabinet, deeper than the wall. Far back, something small glints iron-grey.',
                choices: [
                  { label: 'Reach all the way in', check: { stat: 'nerve', dc: 13 },
                    success: { item: 'key', sanity: -1, text: 'Your whole arm in a drawer that cannot hold it, fingers closing on cold iron: a key, tagged in library hand — "RESTRICTED. FITS MORE THAN ONE DOOR."', tag: 'library' },
                    fail: { sanity: -2, text: 'At full stretch, something far inside the drawer very gently takes your measurements.', tag: 'library' } },
                  { label: 'Withdraw with your arm', outcome: { sanity: 1, text: 'You close the drawer, wash your hands twice, and update your definition of furniture.', tag: 'library' } },
                ] } },
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
      { id: 'overdue', text: 'An overdue notice waits on the counter, addressed to you. The book — "Rites of the Drowned Choir" — was checked out in your name, forty years before you were born.',
        choices: [
          { label: 'Pay the fine', check: { stat: 'nerve', dc: 11 },
            success: { item: 'press', sanity: 0, text: 'You count out four decades of late fees in nickels. The ledger accepts them, closes itself, and leaves you a receipt with tomorrow’s date. Useful, that.', tag: 'library' },
            fail: { sanity: -1, text: 'The fine, recalculated with interest, is listed in years. You leave before learning whose.', tag: 'library' } },
          { label: 'Dispute the charge', outcome: { sanity: 1, text: '"I wasn’t alive," you write firmly on the notice, and feel much better. Bureaucracy is a kind of warding sigil, if you believe hard enough.', tag: 'library' } },
        ] },
      { id: 'children', text: 'In the children’s corner, every picture book has been lovingly redrawn. The three bears now live under the sea. So does everyone, eventually, in these editions.',
        choices: [
          { label: 'Study the artist’s hand', check: { stat: 'wits', dc: 12 },
            success: { item: 'gravedirt', sanity: -1, text: 'The brushwork matches the gravestones’ newest carvings. You take a rubbing. The spirits will appreciate the attribution.', tag: 'library' },
            fail: { sanity: -2, text: 'The last page of every book shows the same drawing: this library, this corner, tonight — and someone standing exactly where you stand.', tag: 'library' } },
          { label: 'Shelve them spine-in', outcome: { sanity: 1, text: 'You hide the lot behind the almanacs. The children of Arkham will grow up frightened of normal, wholesome things, as is right.', tag: 'library' } },
        ] },
      { id: 'lockedcase', rare: true, gate: 'key',
        text: 'The skeleton key grows warm in your pocket as you pass the display case that has never, in anyone’s memory, been open. The lock takes the key like a held breath. Inside: the founding charter of Arkham — two signatures. The mayor’s. And below it, in water damage the shape of a hand, the other party’s.',
        choices: [
          { label: 'Read the terms of the founding', check: { stat: 'wits', dc: 13 },
            success: { item: 'tarot', sanity: -1, text: 'You read what the town agreed to, and what it pays, and when. Tucked in the binding: a single tarot card, left — the charter notes — "for whoever finally asks." You have questions. You now also have a spare fate.', tag: 'library' },
            fail: { sanity: -2, text: 'The legal language is dense, circular, and — you realize on the third clause — being read back to you, aloud, from very far below.', tag: 'library' } },
          { label: 'Lock it back up', outcome: { sanity: 1, text: 'Some contracts survive by never being read. You turn the key and let the town keep its terms.', tag: 'library' } },
        ] },
    ],
  },
  graveyard: {
    name: 'The Graveyard', icon: '🪦',
    scenes: [
      { id: 'fresh', text: 'A grave has been dug that no one ordered. It is neat, professional work — and exactly your height.',
        choices: [
          { label: 'Fill it back in', check: { stat: 'brawn', dc: 11 },
            success: { item: 'gravedirt', sanity: 1, text: 'You fill it in out of spite. You keep a pocketful of the dirt. The spirits appreciate a professional.', tag: 'graveyard',
              next: { text: 'Halfway done, your spade rings on wood. A box. Small, coffin-shaped, coffin-serious. It was not there when you started filling.',
                choices: [
                  { label: 'Pry it open', check: { stat: 'brawn', dc: 12 },
                    success: { item: 'salt', sanity: 0, text: 'Inside: a mason jar of coarse grey salt, packed with care, labeled in a steady hand — "FOR THE DOOR. YOU’LL KNOW WHEN."', tag: 'graveyard' },
                    fail: { sanity: -2, text: 'The lid gives a half inch, exhales the cold of a much larger room, and pulls itself back shut.', tag: 'graveyard' } },
                  { label: 'Bury it deeper', outcome: { sanity: 1, text: 'Whatever mails itself to a grave can wait for the next delivery. You tamp it down flat and sleep fine, mostly.', tag: 'graveyard' } },
                ] } },
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
      { id: 'mourner', text: 'A figure in black weeps at a headstone with no name on it. The grave is old. The grief sounds brand new.',
        choices: [
          { label: 'Offer comfort', check: { stat: 'nerve', dc: 12 },
            success: { item: 'gravedirt', sanity: 0, text: 'You sit with them until the crying stops. "You’re kind," they say, in a voice like wet gravel, and press a handful of grave dirt into your palm. "For the others. They owe me a favor now."', tag: 'graveyard' },
            fail: { sanity: -2, text: 'You put a hand on their shoulder. There is no shoulder. The coat holds its shape out of habit and, you sense, politeness.', tag: 'graveyard' } },
          { label: 'Mourn from a distance', outcome: { sanity: 1, text: 'You stand quietly with your hat off, at a range you can live with. Respect and self-preservation, in perfect balance.', tag: 'graveyard' } },
        ] },
      { id: 'potters', text: 'In potter’s field, the unmarked graves are humming — low and content, like a kitchen before a holiday.',
        choices: [
          { label: 'Press your ear to the earth', check: { stat: 'wits', dc: 13 },
            success: { item: 'press', sanity: -1, text: 'The humming is gossip. The dead discuss the living with terrible accuracy, and you memorize the best of it before your nerve gives out.', tag: 'graveyard' },
            fail: { sanity: -2, text: 'The humming stops. All of it. The silence has the specific texture of many people listening back.', tag: 'graveyard' } },
          { label: 'Hum along walking past', outcome: { sanity: 1, text: 'You harmonize, badly. The graves forgive you. Somewhere below, something taps time with what is hopefully a foot.', tag: 'graveyard' } },
        ] },
      { id: 'stair', rare: true, gate: 'strange',
        text: 'On strange nights the Marsh mausoleum does not bother pretending. The door stands wide. Inside, where a floor should be, a stair descends — swept clean, lamp-lit, and worn smooth by use. By use in both directions.',
        choices: [
          { label: 'Take three steps down', check: { stat: 'nerve', dc: 14 },
            success: { item: 'salt', sanity: -1, text: 'On the third step: a poured ring of salt, a lantern, and a note — someone else’s precaution, abandoned mid-vigil. You inherit the salt and do not inquire after the sentry.', tag: 'graveyard' },
            fail: { sanity: -3, text: 'On the third step you hear, from below, a stair creak — the fourth step. You have not taken the fourth step.', tag: 'graveyard' } },
          { label: 'Brick the doorway', check: { stat: 'brawn', dc: 12 },
            success: { sanity: 2, text: 'You wall it shut with headstone offcuts and half a bag of mortar the sexton will not miss. It won’t hold. It doesn’t need to hold. It needs to be RUDE.', tag: 'graveyard' },
            fail: { sanity: -1, text: 'Every brick you lay is neatly unlaid behind you. Someone below values an open-door policy.', tag: 'graveyard' } },
        ] },
    ],
  },
  roadhouse: {
    name: "Hibb's Roadhouse", icon: '🎷',
    scenes: [
      { id: 'backroom', text: 'The card game in the back room went quiet when you walked in. The pot in the middle of the table is not money.',
        choices: [
          { label: 'Ask to be dealt in', check: { stat: 'nerve', dc: 12 },
            success: { item: 'flask', sanity: 0, text: 'You win a hand and a flask, and fold before you learn what the house always collects.', tag: 'roadhouse',
              next: { text: 'As you stand, the dealer slides one card toward you, face down. "House rule," he says. "Everyone leaves with a card."',
                choices: [
                  { label: 'Take the card', check: { stat: 'nerve', dc: 11 },
                    success: { item: 'tarot', sanity: 0, text: 'The Hanged Man — upside down, or you are. "Good pull," the dealer says, with what would be envy in a man with different eyes.', tag: 'roadhouse' },
                    fail: { sanity: -1, text: 'The card is blank. Both sides. It stays blank exactly as long as you keep looking at it.', tag: 'roadhouse' } },
                  { label: 'Refuse politely', outcome: { sanity: 1, text: '"Suit yourself," the dealer says, and deals your card to the empty chair, which anteed.', tag: 'roadhouse' } },
                ] } },
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
      { id: 'piano', text: 'The player piano is playing with its lid open. The scroll inside is blank. The keys move anyway, and the tune keeps almost resolving.',
        choices: [
          { label: 'Finish the tune yourself', check: { stat: 'nerve', dc: 12 },
            success: { item: 'flask', sanity: 1, text: 'You sit down and hammer out the final chord the thing keeps flinching from. The piano sighs. The bar applauds. Hibb stands you a bottle for "exorcism services."', tag: 'roadhouse' },
            fail: { sanity: -1, text: 'You reach for the keys and they pull away — all eighty-eight, together, like a mouth deciding not to be touched.', tag: 'roadhouse' } },
          { label: 'Close the lid gently', outcome: { sanity: 1, text: 'The piano accepts this with dignity and switches to humming through its strings, much quieter. A compromise everyone can live with.', tag: 'roadhouse' } },
        ] },
      { id: 'regular', text: 'The man at the end of the bar has been "just leaving" since 1917, according to Hibb. His glass is always full. Nobody fills it.',
        choices: [
          { label: 'Buy him a round', check: { stat: 'nerve', dc: 11 },
            success: { item: 'press', sanity: 0, text: 'He talks. Oh, how he talks. Nine years of watching this town from one stool, and he remembers every face that came in smelling of low tide. You take notes.', tag: 'roadhouse' },
            fail: { sanity: -1, text: 'He turns to thank you. You did not know a face could be so profoundly the back of a head.', tag: 'roadhouse' } },
          { label: 'Respect the arrangement', outcome: { sanity: 1, text: 'You nod to him as one nods to a lighthouse: gratefully, and from a distance. He nods back without moving.', tag: 'roadhouse' } },
        ] },
      { id: 'hibb', rare: true, gate: 'visits',
        text: 'Third night running, and the Roadhouse finally decides you count as furniture. The door behind the bar stands open. In the office beyond, doing the books by candlelight, sits Hibb — THE Hibb, whom no living customer has ever seen — and he waves you in without looking up.',
        choices: [
          { label: 'Ask about the second ledger column', check: { stat: 'nerve', dc: 12 },
            success: { item: 'seaglass', sanity: 0, text: '"Rent," Hibb says, "runs two ways here." He pays you for your discretion in advance: a disc of warm sea-glass. "House luck. Spend it on a bad night." You have several scheduled.', tag: 'roadhouse' },
            fail: { sanity: -1, text: 'Hibb looks up. You apologize — to whom, you could not later swear — and are outside, mid-stride, three streets away.', tag: 'roadhouse' } },
          { label: 'Just drink with him', outcome: { sanity: 2, text: 'You share two fingers of the good stuff in companionable silence while the candle burns without shortening. Best nightcap of your life. You will not find the door again.', tag: 'roadhouse' } },
        ] },
    ],
  },
  church: {
    name: 'The Old Chapel', icon: '⛪',
    scenes: [
      { id: 'collection', text: 'The Esoteric Order’s chapel is unlocked for "night confession." The collection plate by the door holds teeth, a compass that points down, and one perfect pearl.',
        choices: [
          { label: 'Take the pearl', check: { stat: 'nerve', dc: 13 },
            success: { item: 'amulet', sanity: -1, text: 'Your fingers close on the pearl and it is not a pearl, it is a stone charm someone gave up. The plate rattles once — annoyed, but rules are rules.', tag: 'church' },
            fail: { sanity: -2, text: 'Your hand stops above the plate. Every candle in the chapel leans toward you, attentively, like a congregation.', tag: 'church' } },
          { label: 'Donate a button', outcome: { sanity: 1, text: 'You add a coat button to the plate. Somewhere behind the altar, something purrs. You have tithed. You are, technically, in good standing.', tag: 'church' } },
        ] },
      { id: 'choir', text: 'Choir practice, the sign says, WEDNESDAYS. It is not Wednesday. The pews are empty. The choir is magnificent.',
        choices: [
          { label: 'Sing the descant', check: { stat: 'nerve', dc: 12 },
            success: { item: 'gravedirt', sanity: 0, text: 'You join in from the back row. The unseen choir parts around your voice like water around a stone, delighted. Afterward, a small bag of consecrated earth waits on your pew. A welcome gift.', tag: 'church' },
            fail: { sanity: -2, text: 'You hum two notes. The choir stops. A single voice near your left ear finishes your phrase, correcting your pitch.', tag: 'church' } },
          { label: 'Leave before the sermon', outcome: { sanity: 1, text: 'You genuflect to nothing in particular and back out the door. Faith is knowing when a service is not for you.', tag: 'church' } },
        ] },
      { id: 'altar', rare: true, gate: 'key',
        text: 'The key knows the vestry door — it pulls your hand there. Behind the altar, under canvas gone stiff with years: the OLD altar. The one from before the Order renovated. It is face down. It was bolted face down.',
        choices: [
          { label: 'Lift the canvas and look', check: { stat: 'brawn', dc: 13 },
            success: { item: 'amulet', sanity: -1, text: 'Carved into the altar’s hidden face: the true Elder Sign, and set into it, a stone charm on a chain — confiscated, catalogued, and kept where only the desperate would look. You are exactly that qualified.', tag: 'church' },
            fail: { sanity: -2, text: 'The canvas lifts an inch and the candles go out in order, nearest first, like a congregation turning to look.', tag: 'church' } },
          { label: 'Take the warden’s spare ledger instead', outcome: { item: 'press', sanity: 0, text: 'Beside the altar, the churchwarden’s duplicate ledger — births, deaths, and a third column with no heading. Insurance, of a kind. You take it.', tag: 'church' } },
        ] },
      { id: 'window', text: 'The new stained-glass window depicts the harbor. In the glass, the congregation stands on the beach, facing the water. Tonight, several of the little glass figures are facing the town.',
        choices: [
          { label: 'Count the figures', check: { stat: 'wits', dc: 13 },
            success: { item: 'press', sanity: -1, text: 'You count. You compare against the parish register in the vestry. The window is a census, and it is more current than the register.', tag: 'church',
              next: { text: 'One pane sits loose in its lead — a thumb-sized figure of blue-green glass, facing the town. Facing, in fact, you.',
                choices: [
                  { label: 'Pocket the little figure', check: { stat: 'wits', dc: 12 },
                    success: { item: 'seaglass', sanity: 0, text: 'It comes free with a click like a tooth. Sea-glass, warm as a held hand, humming faintly in the choir’s key. Lucky, probably. Probably lucky.', tag: 'church' },
                    fail: { sanity: -1, text: 'The pane will not budge, and now every figure in the window is facing you, which is not how you left them.', tag: 'church' } },
                  { label: 'Press it back into place', outcome: { sanity: 1, text: 'You seat the pane firmly and pull the curtain. The census can keep itself.', tag: 'church' } },
                ] } },
            fail: { sanity: -2, text: 'You lose count at thirty because one of the figures is wearing your coat.', tag: 'church' } },
          { label: 'Draw the curtain', outcome: { sanity: 1, text: 'Some art is improved by not being looked at. The curtain rings screech agreement.', tag: 'church' } },
        ] },
    ],
  },
  asylum: {
    name: 'The Asylum Annex', icon: '🛏️',
    scenes: [
      { id: 'room13', text: 'Room 13 has been empty for a month, but the orderlies still bring meals. The padded walls are covered in scratched columns of numbers — a tide table, decades long, ending this year.',
        choices: [
          { label: 'Copy the final column', check: { stat: 'wits', dc: 12 },
            success: { item: 'press', sanity: -1, text: 'You copy the last figures by matchlight. Whoever scratched them knew the harbor better than the harbor does. This is leverage, if you live to use it.', tag: 'asylum' },
            fail: { sanity: -2, text: 'Halfway down the column you realize the numbers aren’t predicting the tide. They’re counting attendance.', tag: 'asylum' } },
          { label: 'Eat the abandoned supper', outcome: { sanity: 1, text: 'The soup is still warm. It is, honestly, the best meal you’ve had all week, and you refuse to examine any part of that sentence.', tag: 'asylum' } },
        ] },
      { id: 'interview', text: 'A patient in the dayroom is awake, calm, and expecting you. "Sit," she says. "You want to know who to trust. I keep a list."',
        choices: [
          { label: 'Ask for the list', check: { stat: 'nerve', dc: 13 },
            success: { item: 'gravedirt', sanity: -1, text: '"Trust the dead," she says, bored by your disappointment. "They’ve stopped lying." She gives you a twist of paper: grave dirt, pre-measured. "Tell them Marguerite says hello."', tag: 'asylum' },
            fail: { sanity: -1, text: 'She recites a list of names — everyone at your party tonight — in the exact order, she says pleasantly, "that it will happen."', tag: 'asylum' } },
          { label: 'Just chat about the weather', outcome: { sanity: 1, text: 'You discuss the fog for half an hour. She has strong, sensible opinions. It is the sanest conversation available in Arkham, and you both know it.', tag: 'asylum' } },
        ] },
      { id: 'nightlog', text: 'The night nurse’s log lies open at the desk. Every entry for the past week ends the same way: "All quiet. All accounted for. One extra."',
        choices: [
          { label: 'Take a headcount yourself', check: { stat: 'brawn', dc: 12 },
            success: { item: 'flask', sanity: 0, text: 'You walk every ward, counting, ready for anything. The count comes out even — and on the last bed sits the night nurse’s medicinal brandy, abandoned mid-shift. Finders keepers.', tag: 'asylum',
              next: { text: 'Tucked under the log book: a pawn ticket. "ONE (1) WATCH, DEAD MAN’S. UNCLAIMED." The pawnshop closed years ago. Its ticket window, someone has noted in the margin, did not.',
                choices: [
                  { label: 'Redeem the ticket tonight', check: { stat: 'nerve', dc: 12 },
                    success: { item: 'watch', sanity: -1, text: 'The ticket window is lit. A drawer slides out with the watch, still warm. You do not see hands. You are billed, the receipt says, "in kind, later."', tag: 'asylum' },
                    fail: { sanity: -1, text: 'The window is lit until you knock. You keep the ticket. The ticket, you notice on the walk home, now says TWO (2).', tag: 'asylum' } },
                  { label: 'File the ticket away', outcome: { sanity: 1, text: 'Unclaimed it was, unclaimed it stays. Some inheritances are declined.', tag: 'asylum' } },
                ] } },
            fail: { sanity: -2, text: 'You count twice. The first count is one high. The second is one low. Somewhere between the wards, the difference is moving.', tag: 'asylum' } },
          { label: 'Add "sounds fine" and leave', outcome: { sanity: 1, text: 'You initial the log like a professional. If the extra one wanted to be counted, it would hold still.', tag: 'asylum' } },
        ] },
      { id: 'director', rare: true, gate: 'strange',
        text: 'On strange nights the third-floor corridor is longer, and at the end of it, the Director’s office is lit. The Annex has had no Director since 1902. The nameplate is freshly polished. The chair behind the desk is turning to greet you.',
        choices: [
          { label: 'Sit for the interview', check: { stat: 'nerve', dc: 14 },
            success: { item: 'tarot', sanity: -1, text: 'The interview lasts either minutes or the winter. You answer honestly; it is that kind of room. At the end, the Director slides one card across the desk — "severance" — and the office is a supply closet, and always was.', tag: 'asylum' },
            fail: { sanity: -3, text: 'You take the chair opposite. The chair opposite THAT also fills. You do not stay to learn who is interviewing whom.', tag: 'asylum' } },
          { label: 'Decline the appointment', outcome: { sanity: 1, text: 'You leave a card with the night nurse: "Called. Will not call again." Some career opportunities are traps with stationery.', tag: 'asylum' } },
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
    (day) => `Night ${day}. The moon rises over the harbor and, after a visible moment of consideration, keeps its distance.`,
    (day) => `Night ${day}. Somewhere a dog barks twice, reconsiders its position, and spends the rest of the night under a porch.`,
  ],
  // Shown on the TV while the town acts at night — pure atmosphere.
  nightScene: [
    `The town sleeps. Some of it works.`,
    `Curtains twitch. Floorboards confess. The fog takes attendance.`,
    `Every window in Arkham is dark, which is not the same as empty.`,
    `The harbor bell does not ring. Everyone lies awake, waiting for it not to ring again.`,
    `Out past the breakwater, a light answers a light that nobody lit.`,
    `The streets belong to the fog now. The fog is generous. The fog shares.`,
    `In the churchyard, the grass leans against the wind, listening.`,
    `Midnight passes. Then, by several accounts, passes again.`,
  ],
  dawnDeath: [
    (n) => `Dawn. ${P(n)} was found at first light, raving at the tide in a language the tide seemed to understand. They are gone — though not, perhaps, entirely quiet.`,
    (n) => `Morning comes, thin and gray. Of ${P(n)}, only their shoes remain, placed neatly side by side, facing the sea.`,
    (n) => `The town wakes one soul lighter. ${P(n)}'s door stands open, their breakfast laid, their chair still warm, their whereabouts a matter for theologians.`,
    (n) => `${P(n)} did not come home last night. The harbor bell rang once at 3 a.m., by itself, in what witnesses describe as "a satisfied way."`,
    (n) => `At dawn they found ${P(n)}'s lantern at the water line, still lit, illuminating a single line of footprints that walk INTO the bay and do not walk back out.`,
    (n) => `${P(n)} is gone. Their neighbors heard nothing, which they insist on repeatedly, in the too-loud voices of people who heard something.`,
    (n) => `The milkman found ${P(n)}'s bottles untaken and their front door replaced — same door, same hinges, but now it only opens outward, and nobody can say what that means, and nobody wants to.`,
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
    (n, c) => `${P(n)} woke to every clock in the house showing a different wrong time and one shared demand: ${c}. The dead were bored. Now they have a hobby.`,
  ],
  quirk: [
    (n, c) => `${P(n)}'s mind, sadly, has given way. A lasting madness takes root: ${c}. The asylum sends its regards and a pamphlet.`,
    (n, c) => `The horrors have added up. ${P(n)} now suffers a permanent affliction: ${c}. Friends are asked to be understanding, or at least entertained.`,
  ],
  tie: [
    () => `The town cannot agree, and the tied vote dissolves into shoving. No one is banished. Somewhere beneath the bay, something chuckles at democracy.`,
    () => `A tie. The meeting ends with pointed fingers and nothing done — a proud Arkham tradition. No one is banished.`,
    () => `Deadlock. The townsfolk glare at one another and disperse. The only winner today is the thing in the water.`,
    () => `The vote splits clean down the middle, like something bitten. No one is banished, and everyone walks home the long way, in pairs, watching each other.`,
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
    `The Advertiser's advice column counsels "Sleepless on Saltonstall St." to simply stop listening at the floor.`,
    `Sports: the rowing club has canceled practice indefinitely, citing "a strong headwind" on a windless day.`,
    `The Advertiser reports the town meeting ran long, owing to "spirited debate and one attendee nobody invited or remembers leaving."`,
    `Real estate: waterfront property values continue to climb, as does the waterfront.`,
    `The Advertiser thanks its loyal subscribers, its advertisers, and the third thing.`,
    `Society pages: the Ladies' Auxiliary bake sale sold out by noon, except for one pie that no one will approach.`,
  ],
  flavor: {
    docks: [
      `Lantern light was seen bobbing along the docks long after midnight.`,
      `The harbormaster reports his ledger "rearranged, but respectfully."`,
      `Three separate residents swear the tide came in twice last night.`,
    ],
    library: [
      `The library lights burned late; the librarian denies scheduling this.`,
      `Several books were found reshelved in an order that spells something.`,
      `The restricted section requested — in writing — that patrons stop visiting.`,
    ],
    graveyard: [
      `Fresh footprints wander the graveyard rows — pacing, or measuring.`,
      `The sexton found his spades cleaned and returned. He owns no spades.`,
      `The graveyard gate was found latched from the inside.`,
    ],
    roadhouse: [
      `The Roadhouse band played until dawn for a crowd that cast too few shadows.`,
      `Hibb's went through a week of whiskey in one night. Nobody remembers drinking it.`,
      `The Roadhouse piano refused requests all evening, which is new, because nobody plays it.`,
    ],
    church: [
      `The chapel candles burned all night without shrinking an inch.`,
      `Late passersby heard the choir rehearsing. The choir disbanded in 1911.`,
      `The chapel bell rang thirteen. The bell-ringer was home in bed, counting along in horror.`,
    ],
    asylum: [
      `The asylum reports a quiet night, an even headcount, and one extra.`,
      `Lights moved between the asylum wards in a pattern the night nurse described as "deliberate."`,
      `A patient asked the morning orderly to pass along congratulations. She would not say to whom.`,
    ],
  },
};

// ---- Doom Track flavor: index by Math.min(3, floor(doom / 3)) ----
export const DOOM_LINES = [
  [ // 0-2: uneasy calm
    `The bay is quiet. The town calls this "peace" and the fishermen call it "holding its breath."`,
    `Doom recedes, for now. The tide charts almost make sense again.`,
  ],
  [ // 3-5: something stirring
    `The fog has started arriving early and leaving late, like it's been given a key.`,
    `Salt rings appear on doorsteps overnight. Nobody admits to leaving them. Nobody wipes them away, either.`,
  ],
  [ // 6-8: dire
    `The water in every glass in Arkham leans, very slightly, toward the sea.`,
    `Birds now cross the town at altitude, without stopping, in silence, in apology.`,
  ],
  [ // 9-10: the brink
    `At night the stars rearrange, patiently, like an orchestra tuning. The performance is soon.`,
    `The bay no longer bothers with tides. It simply watches. High water is a matter of appetite now.`,
  ],
];

// ---- Between-game interludes, keyed by the last game's winner ----
export const INTERLUDES = {
  town: [
    `Between horrors, Arkham does what Arkham does: it holds a potluck. The survivors compare notes, the Advertiser prints a triumphant and largely fictional account, and for one evening the fog keeps a respectful distance.`,
    `The town breathes. Shops reopen. The banished cultists' houses are auctioned off, and the auctioneer talks very quickly past the question of why every room smells of kelp.`,
    `A quiet season follows. The church bells ring on schedule, the tide behaves, and the town almost forgets — which, the old-timers mutter, is exactly how it starts again.`,
  ],
  cult: [
    `The ritual's echo settles over the town like ash. Survivors speak of that season only as "the wet spring." New faces appear at the chapel. Old faces appear — briefly, at windows — where no faces should be.`,
    `The cult's victory buys the deep something it wanted. The harbor gains a new sandbar shaped disturbingly like a welcome mat, and the town, bruised but stubborn, begins again.`,
    `In the weeks after, nobody says the word "cult" out loud. They say "the club," or "them," or nothing, and they re-lay the wards, and they wait.`,
  ],
  lunatic: [
    `The Lunatic's departure beyond the wards is later described as "the happiest exile in town history." They send postcards. The postcards arrive damp. Everyone else sits with what they did for a long, long time.`,
    `Committed at last — by popular vote, no less — the Lunatic writes a bestselling memoir. The town would sue, but every word of it is true, and that's the problem.`,
  ],
  dawn: [
    `They will sing about that night — quietly, in daylight, with the doors locked. The thing went back down. The town stood up. Arkham buys itself a round for approximately a decade.`,
  ],
  oldone: [
    `There is no interlude. There is water where the interlude used to be.`,
  ],
};

// ---- The Rising: round-by-round narration ----
export const RISING_ROUNDS = [
  `The bay stands up. It has been practicing. Barricade, chant, or stare it down — but do it NOW.`,
  `Half the sky is occupied. The chant is working — or it's applause. Hold the line either way.`,
  `The final verse. The stars lean in. Whatever you have left, Arkham — spend it.`,
];

export const TITLES = [
  { id: 'paranoid', name: 'Most Paranoid', desc: 'voted against the most innocents' },
  { id: 'silvertongue', name: 'Silver Tongue', desc: 'survived longest as a cultist' },
  { id: 'cassandra', name: 'Cassandra', desc: 'was right about the cult — and got banished anyway' },
  { id: 'chatterbox', name: 'Chatterbox of the Beyond', desc: 'most whispers from beyond the grave' },
  { id: 'packrat', name: 'Packrat of the Apocalypse', desc: 'hoarded the most items' },
  { id: 'fragile', name: 'Most Fragile Mind', desc: 'lost the most sanity' },
];

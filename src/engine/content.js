// All flavor content for STRANGE IS THE NIGHT — a parlor tragedy of the
// Yellow Sign, set in the fog-locked lake town of Castaigne, where a
// traveling company has reopened the Palace Theater to stage a play
// nobody will name. Built on Robert W. Chambers' public-domain
// King in Yellow (1895).
// Narration entries are arrays of variants; the engine picks one at random
// so back-to-back games don't repeat lines.

// Each persona carries a bespoke `death` line — used for some dawn reports so
// deaths feel personal to the character, not just the player.
export const PERSONAS = [
  { id: 'whateley', name: 'Dr. Constance Vale', job: 'County Coroner', icon: '🩺', brawn: 1, wits: 3, nerve: 2, blurb: 'Has never met a corpse she couldn’t make small talk with. Lately, some of them wait for their cue.',
    death: 'Dr. Constance Vale was found at dawn on her own examination table, arranged with professional care, a toe tag filled out in her own meticulous hand. Cause of death: "see program." No program is attached. The program is at the theater, under her name.' },
  { id: 'finnegan', name: '"Wick" Fennel', job: 'Lamplighter', icon: '🪔', brawn: 3, wits: 1, nerve: 2, blurb: 'Lights every lamp in Castaigne by hand. Won’t do the two on Theater Row. Charges a nickel to not say why.',
    death: '"Wick" Fennel is gone. His ladder stands against a lamp post on Theater Row — the one he never lit — and the lamp is burning now, has been all night, with a flame that gives no light to anything around it.' },
  { id: 'marsh', name: 'Prof. Edmund Thale', job: 'Linguist, Blackwood College', icon: '📖', brawn: 0, wits: 4, nerve: 1, blurb: 'Fluent in eleven languages. Translated the first act of something once, for money. Sleeps less now.',
    death: 'Professor Edmund Thale was last seen in his study, mid-translation. The final line in his notebook is rendered in a beautiful, steady hand — and continues off the page, off the desk, and under the door, in stage directions.' },
  { id: 'pryce', name: 'Sister Agatha Pryce', job: 'Asylum Nurse', icon: '🕯️', brawn: 1, wits: 2, nerve: 3, blurb: 'Unshockable. The patients find this comforting. The new patients find it familiar.',
    death: 'Sister Agatha Pryce did not report for the night shift. Her patients, every one, woke at 3 a.m. and applauded — softly, in unison, toward the window. They refuse to say for whom.' },
  { id: 'crane', name: 'Silas Crane', job: 'Gravedigger', icon: '⚰️', brawn: 3, wits: 2, nerve: 1, blurb: 'Digs them six feet down and, since the company came to town, has started digging them seven.',
    death: 'Silas Crane was taken in the night. His shovel stands upright in a fresh, neat, empty grave — his best work, the town agrees. Seven feet, exactly. The extra foot, it turns out, was for him.' },
  { id: 'ashcroft', name: 'Vivian Ashcroft', job: 'Leading Lady', icon: '🎷', brawn: 1, wits: 2, nerve: 3, blurb: 'Star of the old Castaigne repertory. The new company keeps offering her a part. She keeps not reading it.',
    death: 'Vivian Ashcroft finished her final number to a standing ovation, witnesses say — though nobody remembers standing. She took one encore, one bow, and one step into the wings, and the Roadhouse has no wings.' },
  { id: 'hobbes', name: 'Deputy Roy Hobbes', job: 'Lawman', icon: '⭐', brawn: 3, wits: 2, nerve: 1, blurb: 'Enforces the law. Increasingly unsure which act it appears in.',
    death: 'Deputy Roy Hobbes made his last rounds at midnight. His badge was returned to the station door with a nail through it and a note in yellowed ink: "RECAST."' },
  { id: 'zerelda', name: 'Madame Zerelda', job: 'Fortune Teller', icon: '🔮', brawn: 0, wits: 3, nerve: 3, blurb: 'Refunds available if the doom she foretells fails to arrive. Has never issued a refund.',
    death: 'Madame Zerelda’s parlor was found in perfect order: cards laid out mid-reading, kettle still warm, and a single nickel on the table — the first refund she ever issued, made out, apparently, to herself.' },
  { id: 'pike', name: 'Chester Pike', job: 'Reporter, Castaigne Courier', icon: '📰', brawn: 1, wits: 3, nerve: 2, blurb: 'Committed to printing the truth, lightly edited for cheerfulness.',
    death: 'Chester Pike filed his last story at 2 a.m. — the presses ran themselves, the night printer swears, and every copy of the morning edition carries a review of a play that has not opened. Of Pike, no trace but his byline. On the review.' },
  { id: 'lockwood', name: 'Ada Lockwood', job: 'Librarian', icon: '🗝️', brawn: 0, wits: 4, nerve: 2, blurb: 'Runs the restricted section. Refuses to shelve one particular donation. It keeps getting shelved.',
    death: 'Ada Lockwood was checked out overnight. That is the only way to describe it: her card sits in the restricted section’s ledger, stamped, with a due date the librarian’s assistant refuses to read aloud.' },
  { id: 'grey', name: '"Doc" Tobias Grey', job: 'Pharmacist', icon: '⚗️', brawn: 1, wits: 3, nerve: 2, blurb: 'His tonics cure insomnia, melancholy, and — since the company arrived — dreams of a pale city.',
    death: '"Doc" Tobias Grey’s pharmacy was found unlocked, one tonic bottle empty on the counter. The label, in his handwriting, reads: "For dreams of the pale city — WORKS." The back door stands open. The footprints outside are dressed in stage chalk.' },
  { id: 'calloway', name: 'Ruth Calloway', job: 'Bootlegger', icon: '🥃', brawn: 2, wits: 2, nerve: 2, blurb: 'Moves crates by moonlight. Has strong opinions about what else has been moving by moonlight.',
    death: 'Ruth Calloway missed her own midnight delivery — a first. Her truck sits at the lake road turn, engine running, headlights aimed at the water, cargo untouched. On the windshield, a ticket. Front row. Tonight.' },
];

export const ROLES = {
  cultist:   { name: 'The Masked',   icon: '🎭', team: 'cult', desc: 'You have read the second act, and it has read you. Each night, choose with your fellow Masked who the Play takes next. By day, wear your face like a mask. Win when the Masked equal the town.' },
  medium:    { name: 'Medium',    icon: '🃏', team: 'town', desc: 'Each night, turn the cards on one soul and learn whether they bear the Yellow Sign. The catch: saying so out loud paints the Sign on you.' },
  occultist: { name: 'Occultist', icon: '✴️', team: 'town', desc: 'Each night, lay warding signs on one door. If the Masked come for them, the wards hold. You may ward yourself.' },
  townsfolk: { name: 'Townsfolk', icon: '🏚️', team: 'town', desc: 'No powers — only wits, paranoia, and a vote. Explore the town by night; argue by day. Banish all of the Masked to win.' },
  lunatic:   { name: 'Lunatic',   icon: '🌀', team: 'lunatic', desc: 'The asylum misses you. You win — alone, instantly — if the town votes you out. Act suspicious. But not TOO suspicious.' },
  hybrid:    { name: 'Understudy', icon: '👤', team: 'town', desc: 'You are innocent — but you once read a page you should not have, and the Medium will see the Sign on you. Good luck explaining that at your trial.' },
  archivist: { name: 'Archivist', icon: '📜', team: 'town', desc: 'You keep the town’s records. Each night, consult them on one soul: at dawn you learn where they went — or that NO ENTRY exists. Honest folk leave records. The busy ones don’t.' },
};

// ---- Haunting curses (also reused as madness quirks) ----
export const CURSES = [
  { id: 'questions', text: 'May only speak in questions' },
  { id: 'markmywords', text: 'Must begin every sentence with "Mark my words"' },
  { id: 'nocult', text: 'Cannot say "mask" or "masked"' },
  { id: 'thirdperson', text: 'Must refer to themselves in the third person' },
  { id: 'knock', text: 'Must knock twice on something after every statement' },
  { id: 'nonames', text: 'Cannot use anyone’s name — occupations only' },
  { id: 'whisper', text: 'Must whisper at all times' },
  { id: 'stand', text: 'Must stand while speaking' },
  { id: 'noquestions', text: 'Cannot ask questions' },
  { id: 'dearfolk', text: 'Must address the group as "dear townsfolk" when speaking' },
  { id: 'seaward', text: 'Must face the nearest window while speaking' },
  { id: 'echo', text: 'Must repeat the last word of every sentence, twice, quietly' },
  { id: 'nautical', text: 'Must work a theatrical term into every statement' },
  { id: 'formal', text: 'Must address everyone by full persona name and title' },
];

// ---- Spirit whispers (curated — spirits can never type free text) ----
export const WHISPERS = [
  'Have you seen the Yellow Sign?',
  'Strange is the night where black stars rise.',
  'The one who smiles has read further than they admit.',
  'The Courier lies. It has always lied.',
  'Trust the one you least enjoy.',
  'Ask them to describe their mask.',
  'The vote you regret is still ahead of you.',
  'It is warmer down here than you’d think.',
  'Two of you have already auditioned.',
  'The librarian knows. The librarian always knows.',
  'The lake has no far shore tonight.',
  'You banished the wrong one once. You will again.',
  'The quiet one is counting you.',
  'Someone here has already taken their bow.',
  'We are all in the play now. Some of you have lines.',
  'The stars are not right. They are REHEARSING.',
  'Check the promptbook. Someone has added a scene.',
  'Save your vote. Spend your suspicion.',
];

// ---- Items ----
export const ITEMS = {
  amulet: { id: 'amulet', name: 'Warding Charm', icon: '🧿', desc: 'If the Masked come for you, the charm burns bright and you survive. Consumed. Automatic.' },
  flask: { id: 'flask', name: 'Whiskey Flask', icon: '🥃', desc: 'Drink to shrug off a haunting curse. Consumed.' },
  press: { id: 'press', name: 'Press Credentials', icon: '📰', desc: 'After a vote, privately see exactly who voted for whom. Once.' },
  gravedirt: { id: 'gravedirt', name: 'Grave Dirt', icon: '🪦', desc: 'The spirits owe you one. Choose who the next haunting strikes. Consumed.' },
  seaglass: { id: 'seaglass', name: 'Lake-Glass Charm', icon: '🔹', desc: 'The next die you roll glows: +2. Automatic. Consumed.' },
  tarot: { id: 'tarot', name: 'The Hanged Man', icon: '🎴', desc: 'When a die fails you, draw again — and take the new fate, whatever it is. Once.' },
  salt: { id: 'salt', name: 'Ring of Salt', icon: '🧂', desc: 'The next haunting aimed at you breaks against your doorstep. Automatic. Consumed.' },
  key: { id: 'key', name: 'Skeleton Key', icon: '🗝', desc: 'Somewhere in Castaigne is a door this fits. It will know when you are near. Consumed.' },
  watch: { id: 'watch', name: 'Dead Man’s Watch', icon: '⌚', desc: 'Use at night: follow one soul’s evening. At dawn, learn where they went — or that no record exists. Consumed.' },
};

// ---- Low-sanity visions: appended to exploration scenes at sanity <= 2 ----
export const VISIONS = [
  'Your hands, you notice, are wet. The lake is nowhere near.',
  'Someone keeps pace with you a street over. When you stop, it stops. Almost.',
  'The moon is on the wrong side of the sky. You decide not to mention this.',
  'For one full block, the town is a painted backdrop, and you walk carefully so as not to tear it.',
  'Every window you pass holds your reflection. One of them is wearing a mask, and it is your face.',
  'The fog smells like greasepaint and old velvet. You have never been backstage anywhere.',
  'Somewhere behind you, your own voice delivers a line you haven’t said yet.',
];

// ---- Unrest: locations grow strange as checks fail there ----
export const UNREST_LINES = [
  (l) => `${l} has gone STRANGE. Locals now cross the street to avoid it. The street, locals report, also moved.`,
  (l) => `The town agrees, without ever meeting: nobody goes near ${l} after dark now. The town keeps going anyway.`,
];

// ---- Exploration ----
// Each scene: text, two choices. A choice either has a flat `outcome`, or a
// `check` (stat + dc) with success/fail outcomes. A `next` on an outcome
// opens a second stage. `rare: true` scenes hide behind a `gate`.
export const LOCATIONS = {
  docks: {
    name: 'The Lakefront', icon: '⚓',
    scenes: [
      { id: 'ledger', text: 'The wharfmaster’s shack is unlocked. His ledger lists cargo that only arrives on moonless nights, signed for in a script that hurts to read.',
        choices: [
          { label: 'Tear out the page', check: { stat: 'nerve', dc: 12 },
            success: { item: 'press', sanity: 0, text: 'You pocket the page. Proof, of a kind. Your hands only shake a little.', tag: 'docks',
              next: { text: 'Boots on the boardwalk — two sets, unhurried, coming this way. The shack has one door and one window.',
                choices: [
                  { label: 'Hide and watch them', check: { stat: 'nerve', dc: 12 },
                    success: { item: 'watch', sanity: -1, text: 'Two figures collect the ledger without a lantern, counting pages by touch. Their faces are pale and smooth and do not move. One checks a pocket watch and leaves it on the sill. You take it. It is still ticking. It is set to a thirteenth hour.', tag: 'docks' },
                    fail: { sanity: -2, text: 'You hold your breath behind the door. They never enter. They stand outside for eleven minutes, waiting for you to breathe.', tag: 'docks' } },
                  { label: 'Out the window, now', outcome: { sanity: 0, text: 'You leave through the window with the dignity of a man exiting a window. Behind you, the shack door opens for no one.', tag: 'docks' } },
                ] } },
            fail: { sanity: -2, text: 'The script writhes as you tear it. You read one word by accident. You will not repeat it.', tag: 'docks' } },
          { label: 'Leave it and go', outcome: { sanity: 1, text: 'Some doors are better left shut. You walk home whistling, loudly, the whole way.', tag: 'docks' } },
        ] },
      { id: 'net', text: 'A fishing net has hauled up something wrapped in oilcloth and rope, tied with knots no fisherman on this lake would admit to knowing.',
        choices: [
          { label: 'Cut it open', check: { stat: 'brawn', dc: 11 },
            success: { item: 'amulet', text: 'Inside: a stone charm, warm as a handshake. The carvings match nothing in any church — but something in you unclenches to hold it.', tag: 'docks' },
            fail: { sanity: -1, text: 'The rope parts and the oilcloth exhales. Whatever was inside had already left. Recently.', tag: 'docks' } },
          { label: 'Kick it back in', outcome: { sanity: 0, text: 'It sinks too fast, like something below reached up to accept the delivery.', tag: 'docks' } },
        ] },
      { id: 'singing', text: 'From beneath the pier: singing. Low, patient, in a round. The lake is flat calm tonight, and the water keeps time anyway.',
        choices: [
          { label: 'Listen closer', check: { stat: 'wits', dc: 13 },
            success: { item: 'gravedirt', sanity: -1, text: 'You catch a verse. It is a rehearsal. You understand, horribly, what is being rehearsed — and what the dead are owed for their parts.', tag: 'docks' },
            fail: { sanity: -2, text: 'You listen too long. For the rest of the night the song hums along inside your teeth.', tag: 'docks' } },
          { label: 'Hum something louder', outcome: { sanity: 1, text: 'You drown it out with a show tune. The singing stops, offended. A small, ridiculous victory.', tag: 'docks' } },
        ] },
      { id: 'ferryman', text: 'At the last slip, a rowboat waits with a lit lantern and no rower. A hand-painted sign lists the fare. The fare is not money. The destination is not on any map of the lake.',
        choices: [
          { label: 'Take the lantern', check: { stat: 'nerve', dc: 12 },
            success: { item: 'amulet', sanity: -1, text: 'You lift the lantern. Beneath it, a stone charm — a tip, perhaps, from a previous passenger who chose not to ride.', tag: 'docks' },
            fail: { sanity: -1, text: 'As your fingers close on the handle, the boat rocks — politely, like a chair being pulled out for you. You decline at speed.', tag: 'docks' } },
          { label: 'Pay nothing, take nothing', outcome: { sanity: 1, text: 'You tip your hat to the empty boat and keep walking. Behind you, oars creak. You do not turn around, and are proud of that forever.', tag: 'docks' } },
        ] },
      { id: 'icehouse', text: 'The ice house door is ajar. Inside, last week’s catch lies packed in sawdust and frost — and one of the fish is, very faintly, singing the soprano part.',
        choices: [
          { label: 'Find the singing fish', check: { stat: 'wits', dc: 12 },
            success: { item: 'flask', sanity: -1, text: 'You find it. It looks at you with a grandfather’s patience and stops singing, embarrassed. Behind the crate: the ice-man’s medicinal whiskey. You feel you’ve earned it.', tag: 'docks' },
            fail: { sanity: -1, text: 'The song stops the moment you get close — and starts again from a different crate. Then two crates. Then all of them, in harmony.', tag: 'docks' } },
          { label: 'Shut the door firmly', outcome: { sanity: 1, text: 'Not every mystery deserves a witness. You wedge the door with a gaff hook and sleep the sleep of the sensibly incurious.', tag: 'docks' } },
        ] },
      { id: 'thirdtide', rare: true, gate: 'visits',
        text: 'Third night at the water, and the water has decided you may as well see. The mist stands offshore like a curtain, and the lake pulls back past all reason — laying bare the drowned first street of Old Castaigne: cobbles, lamp posts, one door still on its hinges. And beyond the curtain of mist, far out: towers. There is no far shore. There have never been towers.',
        choices: [
          { label: 'Walk the drowned street', check: { stat: 'nerve', dc: 14 },
            success: { item: 'watch', sanity: -1, text: 'The door opens on a parlor kept tidy for eighty years. On the mantle, a watch, still ticking, set to a thirteenth hour. You take it and do not look at the towers again. Mostly.', tag: 'docks' },
            fail: { sanity: -3, text: 'You reach the lamp post before you understand the lamps are lit, and turn back before you understand for whose entrance.', tag: 'docks' } },
          { label: 'Watch from the seawall', outcome: { sanity: 1, text: 'You witness it from a respectful altitude, remove your hat, and let the lake keep its scenery. The water returns like a curtain falling.', tag: 'docks' } },
        ] },
    ],
  },
  library: {
    name: 'The Library', icon: '🗝️',
    scenes: [
      { id: 'restricted', text: 'The restricted section door stands open. It is never open. A book on the lectern is open too, to a page headed "Concerning the Play and Its Tenants."',
        choices: [
          { label: 'Read the page', check: { stat: 'wits', dc: 12 },
            success: { item: 'press', sanity: -1, text: 'You read fast and quit early. You now know what the Masked call themselves, and why the Palace reopened.', tag: 'library' },
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
            fail: { sanity: -1, text: 'The drawer is deeper than the cabinet. Considerably. You shut it before the smell of lake water gets out.', tag: 'library' } },
          { label: 'File a complaint', outcome: { sanity: 1, text: 'You leave a stern note for the librarian. Order must be maintained somewhere in this town.', tag: 'library' } },
        ] },
      { id: 'atlas', text: 'An atlas lies open to the county. Someone has re-inked the lake, and the new shoreline is closer. In the middle of the lake, someone has begun, very lightly, to sketch an island with towers.',
        choices: [
          { label: 'Compare the editions', check: { stat: 'wits', dc: 13 },
            success: { item: 'amulet', sanity: -1, text: 'Every edition since the theater closed differs. Tucked in the newest one: a stone charm and a bookmark reading "for opening night."', tag: 'library' },
            fail: { sanity: -1, text: 'The ink is not dry. The ink, you realize, is never dry.', tag: 'library' } },
          { label: 'Close the atlas', outcome: { sanity: 0, text: 'Maps are only opinions, you decide. The lake has opinions too, but deeper.', tag: 'library' } },
        ] },
      { id: 'overdue', text: 'An overdue notice waits on the counter, addressed to you. The book — "The King in Yellow: A Play in Two Acts" — was checked out in your name, forty years before you were born.',
        choices: [
          { label: 'Pay the fine', check: { stat: 'nerve', dc: 11 },
            success: { item: 'press', sanity: 0, text: 'You count out four decades of late fees in nickels. The ledger accepts them, closes itself, and leaves you a receipt with tomorrow’s date. Useful, that.', tag: 'library' },
            fail: { sanity: -1, text: 'The fine, recalculated with interest, is listed in years. You leave before learning whose.', tag: 'library' } },
          { label: 'Dispute the charge', outcome: { sanity: 1, text: '"I wasn’t alive," you write firmly on the notice, and feel much better. Bureaucracy is a kind of warding sign, if you believe hard enough.', tag: 'library' } },
        ] },
      { id: 'children', text: 'In the children’s corner, every picture book has been lovingly redrawn. The three bears now live in a pale city under two suns. So does everyone, eventually, in these editions.',
        choices: [
          { label: 'Study the artist’s hand', check: { stat: 'wits', dc: 12 },
            success: { item: 'gravedirt', sanity: -1, text: 'The brushwork matches the gravestones’ newest carvings. You take a rubbing. The spirits will appreciate the attribution.', tag: 'library' },
            fail: { sanity: -2, text: 'The last page of every book shows the same drawing: this library, this corner, tonight — and someone standing exactly where you stand.', tag: 'library' } },
          { label: 'Shelve them spine-in', outcome: { sanity: 1, text: 'You hide the lot behind the almanacs. The children of Castaigne will grow up frightened of normal, wholesome things, as is right.', tag: 'library' } },
        ] },
      { id: 'lockedcase', rare: true, gate: 'key',
        text: 'The skeleton key grows warm in your pocket as you pass the display case that has never, in anyone’s memory, been open. The lock takes the key like a held breath. Inside: the founding charter of Castaigne — two signatures. The mayor’s. And below it, in yellow ink that has never dried, the other party’s.',
        choices: [
          { label: 'Read the terms of the founding', check: { stat: 'wits', dc: 13 },
            success: { item: 'tarot', sanity: -1, text: 'You read what the town agreed to stage, and what it is paid, and when the run ends. Tucked in the binding: a single tarot card, left — the charter notes — "for whoever finally asks." You have questions. You now also have a spare fate.', tag: 'library' },
            fail: { sanity: -2, text: 'The legal language is dense, circular, and — you realize on the third clause — being performed back to you, aloud, from very far away, to applause.', tag: 'library' } },
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
      { id: 'mausoleum', text: 'The Founders’ mausoleum is lit from inside. The founders have been dead for sixty years, which makes this either trespassing or a revival.',
        choices: [
          { label: 'Peer through the grate', check: { stat: 'nerve', dc: 13 },
            success: { item: 'press', sanity: -1, text: 'Figures in pale, smooth masks, a ledger of names, a seating chart. You memorize what you can before the candles all turn to look at you.', tag: 'graveyard' },
            fail: { sanity: -2, text: 'Something peers back through the grate. It has been waiting for a face to practice on.', tag: 'graveyard' } },
          { label: 'Knock politely', outcome: { sanity: 1, text: 'The light goes out at once, embarrassed. Even horrors respect etiquette in this town.', tag: 'graveyard' } },
        ] },
      { id: 'sexton', text: 'The sexton’s tool shed hangs open. Among the spades: a stone charm on a nail, and a cast list with most names crossed out.',
        choices: [
          { label: 'Take the charm', check: { stat: 'nerve', dc: 11 },
            success: { item: 'amulet', text: 'You lift the charm. The crossed-out list, you decide firmly, is a gardening schedule.', tag: 'graveyard' },
            fail: { sanity: -1, text: 'As you reach out, a fresh name appears on the list. You do not stay to read it.', tag: 'graveyard' } },
          { label: 'Read the list only', outcome: { sanity: -1, text: 'You recognize every name still standing. You are between two of them. Beside yours, in pencil: "understudy?"', tag: 'graveyard' } },
        ] },
      { id: 'mourner', text: 'A figure in black weeps at a headstone with no name on it. The grave is old. The grief sounds brand new. And rehearsed.',
        choices: [
          { label: 'Offer comfort', check: { stat: 'nerve', dc: 12 },
            success: { item: 'gravedirt', sanity: 0, text: 'You sit with them until the crying stops. "You’re kind," they say, in a voice like wet gravel, and press a handful of grave dirt into your palm. "For the others. They owe me a favor now."', tag: 'graveyard' },
            fail: { sanity: -2, text: 'You put a hand on their shoulder. There is no shoulder. The coat holds its shape out of habit and, you sense, politeness.', tag: 'graveyard' } },
          { label: 'Mourn from a distance', outcome: { sanity: 1, text: 'You stand quietly with your hat off, at a range you can live with. Respect and self-preservation, in perfect balance.', tag: 'graveyard' } },
        ] },
      { id: 'potters', text: 'In potter’s field, the unmarked graves are humming — low and content, like an orchestra pit before the overture.',
        choices: [
          { label: 'Press your ear to the earth', check: { stat: 'wits', dc: 13 },
            success: { item: 'press', sanity: -1, text: 'The humming is gossip. The dead discuss the living with terrible accuracy, and you memorize the best of it before your nerve gives out.', tag: 'graveyard' },
            fail: { sanity: -2, text: 'The humming stops. All of it. The silence has the specific texture of many people listening back.', tag: 'graveyard' } },
          { label: 'Hum along walking past', outcome: { sanity: 1, text: 'You harmonize, badly. The graves forgive you. Somewhere below, something taps time with what is hopefully a foot.', tag: 'graveyard' } },
        ] },
      { id: 'stair', rare: true, gate: 'strange',
        text: 'On strange nights the Founders’ mausoleum does not bother pretending. The door stands wide. Inside, where a floor should be, a stair descends — swept clean, lamp-lit, and worn smooth by use. By use in both directions.',
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
            success: { item: 'gravedirt', sanity: -1, text: 'The shadows aren’t behind — the dancers are early. Something below keeps the true time, and now you can hear it counting them in.', tag: 'roadhouse' },
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
            success: { item: 'press', sanity: 0, text: 'He talks. Oh, how he talks. Nine years of watching this town from one stool, and he remembers every face that came in smelling of greasepaint. You take notes.', tag: 'roadhouse' },
            fail: { sanity: -1, text: 'He turns to thank you. You did not know a face could be so profoundly the back of a head.', tag: 'roadhouse' } },
          { label: 'Respect the arrangement', outcome: { sanity: 1, text: 'You nod to him as one nods to a lighthouse: gratefully, and from a distance. He nods back without moving.', tag: 'roadhouse' } },
        ] },
      { id: 'hibb', rare: true, gate: 'visits',
        text: 'Third night running, and the Roadhouse finally decides you count as furniture. The door behind the bar stands open. In the office beyond, doing the books by candlelight, sits Hibb — THE Hibb, whom no living customer has ever seen — and he waves you in without looking up.',
        choices: [
          { label: 'Ask about the second ledger column', check: { stat: 'nerve', dc: 12 },
            success: { item: 'seaglass', sanity: 0, text: '"Rent," Hibb says, "runs two ways here." He pays you for your discretion in advance: a disc of warm lake-glass. "House luck. Spend it on a bad night." You have several scheduled.', tag: 'roadhouse' },
            fail: { sanity: -1, text: 'Hibb looks up. You apologize — to whom, you could not later swear — and are outside, mid-stride, three streets away.', tag: 'roadhouse' } },
          { label: 'Just drink with him', outcome: { sanity: 2, text: 'You share two fingers of the good stuff in companionable silence while the candle burns without shortening. Best nightcap of your life. You will not find the door again.', tag: 'roadhouse' } },
        ] },
    ],
  },
  church: {
    name: 'The Palace Theater', icon: '🎭',
    scenes: [
      { id: 'collection', text: 'The Palace box office is lit for "advance sales." The ticket drawer holds teeth, a compass that points at the stage, and one perfect pearl.',
        choices: [
          { label: 'Take the pearl', check: { stat: 'nerve', dc: 13 },
            success: { item: 'amulet', sanity: -1, text: 'Your fingers close on the pearl and it is not a pearl, it is a stone charm someone traded in. The drawer rattles once — annoyed, but rules are rules. All sales final.', tag: 'church' },
            fail: { sanity: -2, text: 'Your hand stops above the drawer. Every poster in the lobby leans toward you, attentively, like an usher.', tag: 'church' } },
          { label: 'Leave exact change', outcome: { sanity: 1, text: 'You put down coins and take nothing. Somewhere inside, a seat folds down. You have a ticket now. You do not have to attend. Probably.', tag: 'church' } },
        ] },
      { id: 'altar', rare: true, gate: 'key',
        text: 'The key pulls your hand to the property room door, three locks deep under the stage. Under canvas gone stiff with years: the OLD scenery. From the production that closed the Palace. It is stacked face-down. It was bolted face-down.',
        choices: [
          { label: 'Lift the canvas and look', check: { stat: 'brawn', dc: 13 },
            success: { item: 'amulet', sanity: -1, text: 'Painted on the hidden face: a warding sign the old company added without permission — and hanging from the frame, a stone charm, confiscated, catalogued, and kept where only the desperate would look. You are exactly that qualified.', tag: 'church' },
            fail: { sanity: -2, text: 'The canvas lifts an inch and the ghost light dies — then every working light in the house comes up at once, warm and golden, on you, alone, center stage.', tag: 'church' } },
          { label: 'Take the stage manager’s book instead', outcome: { item: 'press', sanity: 0, text: 'On a nail by the door: the old stage manager’s duplicate promptbook — entrances, exits, and a third column with no heading. Insurance, of a kind. You take it.', tag: 'church' } },
        ] },
      { id: 'choir', text: 'REHEARSAL — CLOSED, says the sign on the stage door. It is not rehearsal night. The house is dark. The rehearsal is magnificent.',
        choices: [
          { label: 'Read in for the missing part', check: { stat: 'nerve', dc: 12 },
            success: { item: 'gravedirt', sanity: 0, text: 'You speak the missing lines from the back row. The unseen company parts around your voice, delighted. Afterward, a small bag of consecrated earth waits on your seat. A welcome gift, with a card: "until the run begins."', tag: 'church' },
            fail: { sanity: -2, text: 'You mouth two words. The rehearsal stops. A single voice near your left ear finishes your line, correcting your delivery.', tag: 'church' } },
          { label: 'Leave before your cue', outcome: { sanity: 1, text: 'You bow to nothing in particular and back out the stage door. Craft is knowing which parts are not for you.', tag: 'church' } },
        ] },
      { id: 'window', text: 'The painted backdrop for the second act hangs half-lit above the stage: a lake, two suns, an audience painted into the seats. Tonight, several of the painted faces have turned toward the house.',
        choices: [
          { label: 'Count the painted audience', check: { stat: 'wits', dc: 13 },
            success: { item: 'press', sanity: -1, text: 'You count. You compare against the box-office ledger in the lobby. The backdrop is a census, and it is more current than the ledger.', tag: 'church',
              next: { text: 'One painted face sits on a loose slat — thumb-sized, lake-glass eyes, turned all the way around. It is not painted on the slat. It is set into it.',
                choices: [
                  { label: 'Pocket the little face', check: { stat: 'wits', dc: 12 },
                    success: { item: 'seaglass', sanity: 0, text: 'It comes free with a click like a tooth. Lake-glass, warm as a held hand, humming faintly in the key of the overture. Lucky, probably. Probably lucky.', tag: 'church' },
                    fail: { sanity: -1, text: 'The slat will not budge, and now every painted face is turned toward you, which is not how the scene is blocked.', tag: 'church' } },
                  { label: 'Turn it back around', outcome: { sanity: 1, text: 'You reach up and gently face it toward the painted lake. The audience should watch the play. That is the arrangement.', tag: 'church' } },
                ] } },
            fail: { sanity: -2, text: 'You lose count at thirty because one of the painted figures is wearing your coat.', tag: 'church' } },
          { label: 'Kill the work light', outcome: { sanity: 1, text: 'Some scenery is improved by darkness. The rope of the work light screeches agreement.', tag: 'church' } },
        ] },
    ],
  },
  asylum: {
    name: 'The Asylum Annex', icon: '🛏️',
    scenes: [
      { id: 'room13', text: 'Room 13 has been empty for a month, but the orderlies still bring meals. The padded walls are covered in scratched columns of numbers — attendance figures, decades of them, ending with a full house. This year.',
        choices: [
          { label: 'Copy the final column', check: { stat: 'wits', dc: 12 },
            success: { item: 'press', sanity: -1, text: 'You copy the last figures by matchlight. Whoever scratched them knew the Palace better than the Palace does. This is leverage, if you live to use it.', tag: 'asylum' },
            fail: { sanity: -2, text: 'Halfway down the column you realize the numbers aren’t counting the audience. They’re counting the cast.', tag: 'asylum' } },
          { label: 'Eat the abandoned supper', outcome: { sanity: 1, text: 'The soup is still warm. It is, honestly, the best meal you’ve had all week, and you refuse to examine any part of that sentence.', tag: 'asylum' } },
        ] },
      { id: 'interview', text: 'A patient in the dayroom is awake, calm, and expecting you. "Sit," she says. "You want to know who to trust. I keep a list."',
        choices: [
          { label: 'Ask for the list', check: { stat: 'nerve', dc: 13 },
            success: { item: 'gravedirt', sanity: -1, text: '"Trust the dead," she says, bored by your disappointment. "They’ve stopped auditioning." She gives you a twist of paper: grave dirt, pre-measured. "Tell them Marguerite says hello."', tag: 'asylum' },
            fail: { sanity: -1, text: 'She recites a list of names — everyone at your party tonight — in the exact order, she says pleasantly, "of the curtain calls."', tag: 'asylum' } },
          { label: 'Just chat about the weather', outcome: { sanity: 1, text: 'You discuss the fog for half an hour. She has strong, sensible opinions. It is the sanest conversation available in Castaigne, and you both know it.', tag: 'asylum' } },
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
  { id: 'votedCultist', text: 'Be among the voters who banish one of the Masked.' },
  { id: 'hauntedSurvive', text: 'Get haunted by the spirits — and still survive to the end.' },
  { id: 'visit3', text: 'Explore 3 different locations in one game.' },
  { id: 'holdTwo', text: 'Hold 2 items at the same time.' },
  { id: 'useItem', text: 'Use an item.' },
  { id: 'neverWrong', text: 'Vote at least twice, and never vote against an innocent.' },
];

// ---- Narration ----
const P = (name) => name;

export const NARRATION = {
  nightFall: [
    (day) => `Night ${day}. The gas lamps gutter, one by one, as if the house lights are going down. Somewhere across the lake, something waits for its cue.`,
    (day) => `Night ${day} settles over Castaigne like a curtain nobody rang down. The town goes quiet. The lake does not.`,
    (day) => `Night ${day}. The mist comes up off the water carrying the smell of old velvet and older promises.`,
    (day) => `Night ${day}. Doors are locked, prayers are said, and neither precaution has a strong record against a play.`,
    (day) => `Night ${day}. The moon rises over the lake and, after a visible moment of stage fright, keeps to the wings.`,
    (day) => `Night ${day}. Somewhere a dog barks twice, reconsiders its role, and spends the rest of the night under a porch.`,
  ],
  // Shown on the TV while the town acts at night — pure atmosphere.
  nightScene: [
    `The town sleeps. Some of it rehearses.`,
    `Curtains twitch. Floorboards confess. The mist takes attendance.`,
    `Every window in Castaigne is dark, which is not the same as empty.`,
    `The Palace marquee is unlit. Everyone lies awake, waiting for it not to light again.`,
    `Out past the breakwater, a lantern answers a lantern that nobody lit.`,
    `The streets belong to the mist now. The mist is generous. The mist shares its stage.`,
    `In the churchyard, the grass leans against the wind, listening for its cue.`,
    `Midnight passes. Then, by several accounts, an intermission.`,
  ],
  dawnDeath: [
    (n) => `Dawn. ${P(n)} was found at first light, reciting to the mist in perfect meter, in a language the mist seemed to know. They are gone — though not, perhaps, entirely offstage.`,
    (n) => `Morning comes, thin and grey. Of ${P(n)}, only their shoes remain, placed neatly side by side, facing the lake.`,
    (n) => `The town wakes one soul lighter. ${P(n)}'s door stands open, their breakfast laid, their chair still warm, their whereabouts a matter for the playbill.`,
    (n) => `${P(n)} did not come home last night. The Palace bell rang once at 3 a.m., by itself, in what witnesses describe as "a satisfied way."`,
    (n) => `At dawn they found ${P(n)}'s lantern at the water line, still lit, illuminating a single line of footprints that walk INTO the lake and do not walk back out.`,
    (n) => `${P(n)} is gone. Their neighbors heard nothing, which they insist on repeatedly, in the too-loud voices of people who heard applause.`,
    (n) => `The milkman found ${P(n)}'s bottles untaken and their front door replaced — same door, same hinges, but now it only opens outward, like a stage door, and nobody wants to say for whom.`,
  ],
  dawnWard: [
    (n) => `In the small hours, something came for ${P(n)} — and found the warding signs on their door burning bright. The scratching lasted until four, then stopped, disappointed.`,
    (n) => `${P(n)} woke to find their windowsill scorched in the shape of a warding sign, and the garden path scuffed where something patient had waited, and waited, and exited stage left, hungry.`,
    (n) => `The wards held. ${P(n)} slept through the whole thing, which the neighbors — who did not — deeply resent.`,
    (n) => `Something tested every door and window of ${P(n)}'s house last night. The occultist's signs sang like struck crystal until it gave up. ${P(n)} owes someone a drink.`,
  ],
  dawnAmulet: [
    (n) => `The Masked came for ${P(n)} in the night — and the stone charm in their pocket flared white-hot. At dawn it was a handful of ash, and ${P(n)} was, remarkably, still in the audience.`,
    (n) => `${P(n)} woke on their own floor, ears ringing, clutching the crumbled remains of a warding charm. Whatever part was written for them last night went uncast.`,
  ],
  haunt: [
    (n, c) => `The Restless Spirits have taken an interest in ${P(n)}. Until dusk: ${c} The dead have a sense of humor. It did not improve with death.`,
    (n, c) => `A cold spot follows ${P(n)} this morning, and with it, a stage direction: ${c} The spirits watch from the cheap seats, delighted.`,
    (n, c) => `${P(n)} has been HAUNTED. The terms, scratched in frost on their mirror: ${c}`,
    (n, c) => `${P(n)} woke to every clock in the house showing a different wrong time and one shared demand: ${c} The dead were bored. Now they have a hobby.`,
  ],
  quirk: [
    (n, c) => `${P(n)}'s mind, sadly, has given way. A lasting madness takes root: ${c} The asylum sends its regards and a pamphlet.`,
    (n, c) => `The horrors have added up. ${P(n)} now suffers a permanent affliction: ${c} Friends are asked to be understanding, or at least entertained.`,
  ],
  tie: [
    () => `The town cannot agree, and the tied vote dissolves into shoving. No one is banished. Somewhere across the lake, something applauds democracy, slowly.`,
    () => `A tie. The meeting ends with pointed fingers and nothing done — a proud Castaigne tradition. No one is banished.`,
    () => `Deadlock. The townsfolk glare at one another and disperse. The only winner today is the thing in the mist.`,
    () => `The vote splits clean down the middle, like a stage trapdoor. No one is banished, and everyone walks home the long way, in pairs, watching each other.`,
  ],
  banishInnocent: [
    (n, r) => `The town drags ${P(n)} to the crossroads and casts them out. In their pockets: nothing but ${r === 'lunatic' ? 'asylum release papers, dated tomorrow' : 'a library card and an honest life'}. The town has made a terrible mistake. Again.`,
    (n, r) => `${P(n)} protests to the end — and the end comes anyway. They were ${r === 'townsfolk' ? 'exactly what they claimed: innocent' : 'innocent all along'}. The vote count is quietly burned.`,
    (n, r) => `Justice moves swiftly, and in entirely the wrong direction. ${P(n)} — innocent — is banished beyond the wards. The Courier will call it "a spirited civic exercise."`,
  ],
  banishCultist: [
    (n) => `As the town seizes ${P(n)}, their protests slide into perfect, practiced verse. Under the floorboards: a pallid mask, smooth as an egg, still warm. One of the MASKED, banished. Castaigne exhales.`,
    (n) => `${P(n)} goes quietly — too quietly — and at the town line turns and takes a long, professional bow. One of the Masked, cast out. The lake is furious tonight.`,
    (n) => `In ${P(n)}'s rooms: a script bound in yellow, its first act creased and soft with reading — and its second act read PAST. One of the Masked, banished. The town sleeps easier. The town is wrong to.`,
  ],
  cultWin: [
    () => `The Palace marquee lights itself at midnight. The remaining townsfolk look around the meeting hall and realize, too late, that they are outnumbered by smiles they have known all their lives. Places, everyone. The second act begins. THE MASKED PREVAIL.`,
    () => `There are not enough honest faces left to bar the door. The mist comes all the way up Main Street, unhurried, checking tickets as it goes. THE MASKED PREVAIL.`,
  ],
  townWin: [
    () => `The last of the Masked is cast out beyond the wards, and across the lake the rehearsal stops mid-line. The mist lifts for the first time in living memory. Castaigne endures — pig-headed, paranoid, and MAGNIFICENT. THE TOWN PREVAILS.`,
    () => `With the Masked broken, the Palace goes dark — properly dark, the dark of an empty building, which no one in town has seen for months. Silence, for once, sounds like a standing ovation. THE TOWN PREVAILS.`,
  ],
  lunaticWin: [
    (n) => `As the town votes to banish ${P(n)}, they burst into delighted applause. "FINALLY," they cry, producing commitment papers, "a MAJORITY DECISION." The Lunatic wanted this all along. THE LUNATIC WINS. Everyone else feels used.`,
    (n) => `${P(n)} thanks the town for the banishment, curtsies, and skips beyond the wards singing Cassilda's part. The asylum had a bet going. THE LUNATIC WINS, alone.`,
  ],
  risingWin: [
    () => `The final line dies half-spoken. The tattered shape above the Palace hangs frozen — then the curtain falls, all at once, all over the sky. You did not defeat the King. Nothing defeats the King. But tonight, together, Castaigne FORGOT ITS LINES on purpose — and a play cannot go on without its town. THE CURTAIN FALLS.`,
  ],
  risingLose: [
    () => `The house lights die. The audience — and it is all audience now — rises as one. In its final edition, the Castaigne Courier reviews the premiere: "A TRIUMPH. THE TOWN JOINS THE CAST." in 300-point type. There are no further editions. THE KING TAKES THE STAGE.`,
  ],
  advertiser: [
    `The Castaigne Courier assures readers the screaming was recreational.`,
    `The Courier reminds readers that the glow over the lake is "probably the aurora, probably fine."`,
    `In civic news, the Courier reports theater attendance is up, "particularly among residents who have not yet purchased tickets."`,
    `The Courier's weather desk forecasts mist, followed by mist, followed by something moving in the mist.`,
    `The Courier prints a correction: the "traveling company" reported leaving town has neither traveled, nor left, nor — strictly — arrived.`,
    `Classifieds: FOUND — one rowboat, returned to dock overnight, oars dry, hull warm. Owner need not come forward.`,
    `The Courier notes the asylum's annual gala was "well attended, twice, by the same guests."`,
    `Public notice: the lighthouse keeper wishes it known that whatever is signaling back at him, he did not start it.`,
    `The Courier's advice column counsels "Sleepless on Saltonstall St." to simply stop reading at the first act.`,
    `Sports: the rowing club has canceled practice indefinitely, citing "a strong headwind" on a windless lake.`,
    `The Courier reports the town meeting ran long, owing to "spirited debate and one attendee nobody invited or remembers leaving."`,
    `Real estate: lakefront property values continue to climb, as does the lake.`,
    `The Courier thanks its loyal subscribers, its advertisers, and the third thing.`,
    `Arts: the Palace Theater declines to name its upcoming production, "for reasons of tradition." Tickets are sold out. Tickets were never sold.`,
  ],
  flavor: {
    docks: [
      `Lantern light was seen bobbing along the lakefront long after midnight.`,
      `The wharfmaster reports his ledger "rearranged, but respectfully."`,
      `Three separate residents swear the lake was higher at midnight than at dawn. And closer.`,
    ],
    library: [
      `The library lights burned late; the librarian denies scheduling this.`,
      `Several books were found reshelved in an order that scans.`,
      `The restricted section requested — in writing — that patrons stop visiting.`,
    ],
    graveyard: [
      `Fresh footprints wander the graveyard rows — pacing, or blocking scenes.`,
      `The sexton found his spades cleaned and returned. He owns no spades.`,
      `The graveyard gate was found latched from the inside.`,
    ],
    roadhouse: [
      `The Roadhouse band played until dawn for a crowd that cast too few shadows.`,
      `Hibb's went through a week of whiskey in one night. Nobody remembers drinking it.`,
      `The Roadhouse piano refused requests all evening, which is new, because nobody plays it.`,
    ],
    church: [
      `The Palace ghost light burned all night without shrinking an inch.`,
      `Late passersby heard a full rehearsal through the Palace doors. The company was seen boarding the last train. The company is still in town.`,
      `The Palace marquee spelled something at 3 a.m. The letters were rearranged by morning, and nobody will write down what they said.`,
    ],
    asylum: [
      `The asylum reports a quiet night, an even headcount, and one extra.`,
      `Lights moved between the asylum wards in a pattern the night nurse described as "choreographed."`,
      `A patient asked the morning orderly to pass along congratulations. She would not say to whom.`,
    ],
  },
};

// ---- Doom Track flavor: index by Math.min(3, floor(doom / 3)) ----
export const DOOM_LINES = [
  [ // 0-2: uneasy calm
    `The lake is quiet. The town calls this "peace" and the fishermen call it "holding for the cue."`,
    `Doom recedes, for now. The Palace marquee stays dark, and dark it should stay.`,
  ],
  [ // 3-5: something stirring
    `The mist has started arriving early and leaving late, like it's been given a key to the building.`,
    `Yellow chalk marks appear on doorsteps overnight. Nobody admits to leaving them. Nobody washes them off, either.`,
  ],
  [ // 6-8: dire
    `At dusk the clouds over the lake tear like cheap scenery, and what shows through is not sky.`,
    `Birds now cross the town at altitude, without stopping, in silence, in apology.`,
  ],
  [ // 9-10: the brink
    `At night the stars rearrange, patiently, like an orchestra tuning. Black ones first.`,
    `The lake no longer bothers with waves. It simply watches the town, the way a house watches a stage.`,
  ],
];

// ---- Between-game interludes, keyed by the last game's winner ----
export const INTERLUDES = {
  town: [
    `Between horrors, Castaigne does what Castaigne does: it holds a potluck. The survivors compare notes, the Courier prints a triumphant and largely fictional account, and for one evening the mist keeps a respectful distance.`,
    `The town breathes. Shops reopen. The banished players' houses are auctioned off, and the auctioneer talks very quickly past the question of why every room smells of greasepaint.`,
    `A quiet season follows. The church bells ring on schedule, the lake behaves, and the town almost forgets — which, the old-timers mutter, is exactly how the next act opens.`,
  ],
  cult: [
    `The failed banishments settle over the town like dust on a stage. Survivors speak of that season only as "the yellow autumn." New faces appear at the Palace. Old faces appear — briefly, in its posters — where no faces were printed.`,
    `The Masked's victory buys the Play something it wanted. The lake gains a second reflection of the moon that the moon does not account for, and the town, bruised but stubborn, begins again.`,
    `In the weeks after, nobody says the word "mask" out loud. They say "the company," or "them," or nothing, and they re-chalk the wards, and they wait.`,
  ],
  lunatic: [
    `The Lunatic's departure beyond the wards is later described as "the happiest exile in town history." They send postcards. The postcards are all of the same city, and it is not a city anyone can find. Everyone else sits with what they did for a long, long time.`,
    `Committed at last — by popular vote, no less — the Lunatic writes a bestselling memoir. The town would sue, but every word of it is true, and that's the problem.`,
  ],
  dawn: [
    `They will sing about that night — quietly, in daylight, with the doors locked and the sheet music burned after. The curtain came down. The town stood up. Castaigne buys itself a round for approximately a decade.`,
  ],
  oldone: [
    `There is no interlude. There is an intermission, and it is not for you.`,
  ],
};

// ---- The Last Act: round-by-round narration ----
export const RISING_ROUNDS = [
  `The house lights die across the whole sky. The King is in the wings. Barricade, counter-chant, or stare down the stage — but do it NOW.`,
  `Half the town is audience now, seated in rows in the mist. The counter-chant is working — or it's the overture. Hold the line either way.`,
  `The final scene. The tattered mantle fills the sky above the Palace. Whatever you have left, Castaigne — spend it before the bow.`,
];

// ---- Name-keyed easter eggs ----
// If a player joins with one of these real names, the game quietly knows.
// Each surface fires AT MOST ONCE per evening: a spirit whisper option, a
// Courier notice at dawn, and a personal line when they explore the Palace.
// Edit freely — this is the place to hide inside jokes.
export const NAME_EGGS = {
  brenda: {
    whisper: 'The seat beside Brenda has been reserved for years.',
    courier: 'PERSONAL — The Courier reminds BRENDA that her complimentary subscription continues whether or not she recalls subscribing.',
    scene: 'On the seat beside you lies tonight’s program. Nobody printed a program. The cast list is one name long: BRENDA.',
  },
  alex: {
    whisper: 'Alex has read further than they say. Ask Alex.',
    courier: 'NOTICE — Will ALEX please call at the box office to collect a personal item. The box office declines to describe the item. It is breathing.',
    scene: 'Chalked on the dressing-room mirror, in a neat, patient hand: "ALEX — HALF-HOUR CALL."',
  },
  jason: {
    whisper: 'They have been practicing saying "Jason."',
    courier: 'CORRECTION — In yesterday’s edition the Courier misspelled the name JASON. The Courier has never printed the name Jason. The Courier apologizes for tomorrow.',
    scene: 'The promptbook lies open on the stage manager’s desk. In the margin of the second act, in fresh ink: "enter JASON, unwilling."',
  },
  annie: {
    whisper: 'Annie hears this one twice.',
    courier: 'SOCIETY — The Ladies’ Auxiliary thanks ANNIE for her generous donation, which arrived Tuesday, postmarked next month.',
    scene: 'A brass plaque gleams on the best seat in the house: "PATRON — ANNIE. IN PERPETUITY." The other plaques are green with age.',
  },
  matt: {
    whisper: 'The understudy list is one name long. Matt knows.',
    courier: 'LOST & FOUND — one umbrella, one pocketknife, one hour, belonging to MATT. Owner may reclaim any two.',
    scene: 'Pinned to the callboard, an understudy sheet for a role with no name. The single entry, typed: MATT.',
  },
  kevin: {
    whisper: 'Kevin invited you all here. Ask him why.',
    courier: 'PUBLIC RECORD — the Palace’s reopening permit is countersigned by one K——N of this parish. The clerk cannot finish reading the signature.',
    scene: 'In the manager’s office, the contract for tonight’s engagement. The producer’s line is signed in a hand you know intimately: your own. KEVIN.',
  },
};

export const TITLES = [
  { id: 'paranoid', name: 'Most Paranoid', desc: 'voted against the most innocents' },
  { id: 'silvertongue', name: 'Silver Tongue', desc: 'survived longest among the Masked' },
  { id: 'cassandra', name: 'Cassandra', desc: 'was right about the Masked — and got banished anyway' },
  { id: 'chatterbox', name: 'Chatterbox of the Beyond', desc: 'most whispers from beyond the grave' },
  { id: 'packrat', name: 'Packrat of the Apocalypse', desc: 'hoarded the most items' },
  { id: 'fragile', name: 'Most Fragile Mind', desc: 'lost the most sanity' },
];

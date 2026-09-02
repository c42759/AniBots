# AniBots Anima Chips Catalog (`CHIPS.md`)

Welcome to the canonical **Anima Chips Catalog**. Anima Chips are the solid-state AI cores that function as both the operating system and autonomous soul of every AniBot.

> [!NOTE]
> - **Legendary Ancient Chips (Gen 0)**: Documented in [CHARACTERS.md](./CHARACTERS.md#the-10-legendary-ancient-series-anichips-generation-0).
> - **Combat & AI Targeting Rules**: Detailed in [OVERVIEW.md](./OVERVIEW.md#targeting).
> - **Web Databank Browser**: Explore with search and multi-filtering in [dex/README.md](./dex/README.md).
> - **AI Schematic Art Prompts**: Reusable ink sketch prompts in [ai/AniChipDesignPrompt.md](./ai/AniChipDesignPrompt.md).

---

## 🧭 Catalog Navigation

- [🏛️ Antiquity Series (12 Chips)](#-antiquity-series)
- [⚡ Kinetic Series (12 Chips)](#-kinetic-series)
- [✨ Astral Series (12 Chips)](#-astral-series)
- [👑 Legendary Ancient Series (10 Chips)](./CHARACTERS.md#the-10-legendary-ancient-series-anichips-generation-0)

---

## 🏛️ Antiquity Series

Mass-market Anima Chips programmed to mimic the disciplines of legendary historical fighters. Their personalities are distinct and their combat styles are intuitive for Handlers.

### Ronin Chip (`chip_ronin`)

- **Series**: ANTIQUITY | **Affinity**: `MELEE` | **Diode Color**: `#D4AF37`
- **Personality Engram**: Philosophical Wanderer
- **Voice / Style**: Calm, measured haiku verses
- **Quote**: *"Steel blade cuts the wind / In the silence of the dawn / One strike ends the path."*
- **Target Priority**: `ONE_ON_ONE_DUEL`
- **Passive Trait**: *Wandering Blade* — Lightweight and high-evasion parts gain +15% Evasion and +10% Melee Critical Rate when engaged in single combat against an isolated target.
- **Ultimate Abilities**:
  - **Falling Petal Slash** (Cost: 50%, Power: 65): A single lightning-fast iaijutsu strike that completely bypasses enemy evasion.
  - **Zenith Haiku Counter** (Cost: 80%, Power: 90): Enters a transcendent meditative stance, countering the next incoming melee strike for 200% retaliatory damage.

### Dragoon Chip (`chip_dragoon`)

- **Series**: ANTIQUITY | **Affinity**: `MELEE` | **Diode Color**: `#C5A059`
- **Personality Engram**: Chivalric Knight
- **Voice / Style**: Booming, theatrical chivalric proclamations
- **Quote**: *"For valor and eternal glory! Let the skies witness our indomitable strength!"*
- **Target Priority**: `HIGHEST_HP`
- **Passive Trait**: *High Jump Momentum* — Spear weapons and heavy armor gain +15% Payload damage when executing leap and charge attacks from the base line.
- **Ultimate Abilities**:
  - **Skyward Dive** (Cost: 50%, Power: 70): Leaps high into the air and crashes down onto the center line, inflicting heavy kinetic splash damage.
  - **Dragon's Lance Piercer** (Cost: 75%, Power: 95): A devastating thrust that ignores 50% of the target's Torso Firewall defense.
  - **Valorous Bastion** (Cost: 100%, Power: 0): Rallies team resolve, providing temporary invulnerability for 1 combat rotation.

### Corsair Chip (`chip_corsair`)

- **Series**: ANTIQUITY | **Affinity**: `TRAP` | **Diode Color**: `#E67E22`
- **Personality Engram**: Swashbuckler Raider
- **Voice / Style**: Boisterous pirate laugh and swashbuckling banter
- **Quote**: *"Yahaha! Drop your Scrap and walk the plank, matey!"*
- **Target Priority**: `LOWEST_INTEGRITY`
- **Passive Trait**: *Plunderer's Gambit* — Trapping the center line increases end-of-battle Scrap drop rates by 20%, and heavy cannons recover 15% faster from cooldown latency.
- **Ultimate Abilities**:
  - **Broadside Cannonade** (Cost: 60%, Power: 80): Fires an overwhelming volley of cannon shells striking all opposing units across the field.
  - **Dread Anchor Snare** (Cost: 85%, Power: 50): Deploys a magnetized anchor on the center line that snags running enemies, halting their sprint.

### Phalanx Chip (`chip_phalanx`)

- **Series**: ANTIQUITY | **Affinity**: `DEFENSE` | **Diode Color**: `#B8860B`
- **Personality Engram**: Disciplined Spartan Guardian
- **Voice / Style**: Terse, militaristic battle commands
- **Quote**: *"Shields locked. Formation unbreakable. None shall breach our line."*
- **Target Priority**: `DEFENDER_INTERCEPT`
- **Passive Trait**: *Shield Wall Infrastructure* — Automatically triggers an Override Intercept on attacks targeting fragile allies, reducing incoming damage by 30% when equipped with Shield parts.
- **Ultimate Abilities**:
  - **Aegis Shield Wall** (Cost: 50%, Power: 0): Projects a massive defensive energy barrier over all allies, soaking up to 150 damage.
  - **Spartan Shield Bash** (Cost: 70%, Power: 60): Slams enemy front-runner with reinforced shield, knocking them back along their ATB track.
  - **Iron Phalanx Protocol** (Cost: 100%, Power: 0): Taunts all enemies and converts 50% of all absorbed intercept damage directly into Overclock energy.

### Artificer Chip (`chip_artificer`)

- **Series**: ANTIQUITY | **Affinity**: `TRAP` | **Diode Color**: `#E5A93C`
- **Starter Frame**: **Genesis-1**
- **Personality Engram**: System Optimizer & Architect
- **Voice / Style**: Calculated algorithm readouts and structured diagnostic notes
- **Quote**: *"Combat is merely an unoptimized logic routine. Executing system refactor."*
- **Target Priority**: `BALANCED`
- **Passive Trait**: *Automated Pipeline* — Center-line traps gain +25% trigger radius, and arm attacks have 20% reduced latency when triggered in sequential combos.
- **Ultimate Abilities**:
  - **System Override** (Cost: 50%, Power: 50): Injects an override signal that stuns the target and resets their action pipeline.
  - **Automated Trap Array** (Cost: 75%, Power: 75): Floods the center line with 3 micro-traps that detonate sequentially upon enemy crossing.
  - **Master Algorithm** (Cost: 100%, Power: 110): Calculates the target's fatal flaw, delivering an overwhelming precision strike that disables their strongest arm.

### Gunslinger Chip (`chip_gunslinger`)

- **Series**: ANTIQUITY | **Affinity**: `SHOOTING` | **Diode Color**: `#D27D2D`
- **Personality Engram**: Quick-Draw Outlaw
- **Voice / Style**: Relaxed southern drawl and effortless swagger
- **Quote**: *"Keep your hand off that holster unless you're ready to eat lead, partner."*
- **Target Priority**: `FASTEST_ENEMY`
- **Passive Trait**: *Quick Draw Cylinder* — Drastically cuts Latency (cooldown return time) for revolvers and pistol parts by 35%, enabling rapid hit-and-run volleys.
- **Ultimate Abilities**:
  - **Fanning the Hammer** (Cost: 50%, Power: 65): Discharges a rapid 6-bullet barrage with near-zero cooldown latency.
  - **High Noon Deadshot** (Cost: 80%, Power: 95): A lethal showdown bullet that auto-locks onto the enemy Head part with 100% precision.

### Berserker Chip (`chip_berserker`)

- **Series**: ANTIQUITY | **Affinity**: `MELEE` | **Diode Color**: `#C0392B`
- **Personality Engram**: Frenzied Glass Cannon
- **Voice / Style**: Screaming primal fury and savage roars
- **Quote**: *"SKULLS FOR THE HEAP! CRUSH! SMASH! NO RETREAT!"*
- **Target Priority**: `CLOSEST_OPPONENT`
- **Passive Trait**: *Rage Overdrive* — Completely ignores its own Torso Firewall armor modifiers to boost raw physical Melee Payload by +30%.
- **Ultimate Abilities**:
  - **Blood Frenzy Cleave** (Cost: 50%, Power: 80): A frenzied axe cleave dealing massive damage while inflicting 10 recoil damage to self.
  - **Ragnarok Overdrive** (Cost: 90%, Power: 120): Enters an uncontrollable berserk frenzy, doubling attack damage while disabling defensive stats.

### Templar Chip (`chip_templar`)

- **Series**: ANTIQUITY | **Affinity**: `SUPPORT` | **Diode Color**: `#F1C40F`
- **Personality Engram**: Righteous Crusader
- **Voice / Style**: Solemn, noble crusader resonance
- **Quote**: *"By the sacred code, we shall preserve our comrades and purge all corruption."*
- **Target Priority**: `HIGHEST_THREAT`
- **Passive Trait**: *Sacred Transfusion* — Sacrifices 15% personal ATB charge speed to pulse a protective firewall repair aura, restoring 10 Integrity to damaged ally parts per cycle.
- **Ultimate Abilities**:
  - **Sanctuary Field** (Cost: 50%, Power: 0): Erects a protective aura repairing 40 Integrity across all active ally parts.
  - **Righteous Smite** (Cost: 75%, Power: 80): Calls down an orbital kinetic beam that strikes and stuns the highest-threat enemy unit.
  - **Divine Reboot** (Cost: 100%, Power: 0): Restores a destroyed arm part to 50% Integrity and cleanses all status ailments across the team.

### Ranger Chip (`chip_ranger`)

- **Series**: ANTIQUITY | **Affinity**: `SHOOTING` | **Diode Color**: `#27AE60`
- **Personality Engram**: Reconnaissance Tracker
- **Voice / Style**: Low, terse reconnaissance whispers
- **Quote**: *"Target acquired. Elevation mapped. Wind factor zero. Releasing shot."*
- **Target Priority**: `VULNERABLE_PARTS`
- **Passive Trait**: *Terrain Mastery* — Maps the battlefield instantly, granting +25% Agility and Clock Speed to Legs while negating rough terrain penalties.
- **Ultimate Abilities**:
  - **Hawkeye Snipe** (Cost: 50%, Power: 70): An unerring shot that pierces through enemy evasion and smoke screens.
  - **Guerrilla Ambush** (Cost: 75%, Power: 85): Lays an invisible perimeter snare and fires a concussive round from concealment.

### Gladiator Chip (`chip_gladiator`)

- **Series**: ANTIQUITY | **Affinity**: `MELEE` | **Diode Color**: `#D35400`
- **Personality Engram**: Pit Fighter Showman
- **Voice / Style**: Theatrical taunts and thunderous roars
- **Quote**: *"Are you not entertained?! Look at this magnificence in motion!"*
- **Target Priority**: `TAUNT_AGGRO`
- **Passive Trait**: *Crowd Pleaser* — Actively taunts opponents, forcing enemy targeting logic to focus on it while gaining +20% Overclock gauge each time it is targeted.
- **Ultimate Abilities**:
  - **Roar of the Colosseum** (Cost: 45%, Power: 30): Taunts all opponents, forcing them to attack Gladiator while raising self-defense by 25%.
  - **Champion's Decapitation** (Cost: 85%, Power: 100): A brutal crowd-pleasing strike dealing massive bonus damage scaled with lost Integrity.

### Bard Chip (`chip_bard`)

- **Series**: ANTIQUITY | **Affinity**: `SUPPORT` | **Diode Color**: `#9B59B6`
- **Personality Engram**: Harmonic Minstrel
- **Voice / Style**: Melodic rhymes and whimsical song verses
- **Quote**: *"A tempo swift, a chord so bright / We dance into the neon night!"*
- **Target Priority**: `DISRUPT_CASTERS`
- **Passive Trait**: *Acoustic Resonance* — Broadcasts audio frequencies that passively increase the Wait Phase ATB fill rate of adjacent allies by +20%.
- **Ultimate Abilities**:
  - **Allegro Anthem** (Cost: 40%, Power: 0): Accelerates all allies' ATB meters by 30% immediately.
  - **Dissonant Chord** (Cost: 65%, Power: 55): Disorients enemy audio sensors, reducing their accuracy by 25% for 2 turns.
  - **Grand Crescendo** (Cost: 95%, Power: 85): A symphonic sonic wave that damages all enemies and fully fills ally Action Bars.

### Shinobi Chip (`chip_shinobi`)

- **Series**: ANTIQUITY | **Affinity**: `EVASION` | **Diode Color**: `#34495E`
- **Personality Engram**: Shadow Assassin
- **Voice / Style**: Hushed whispers and brief, silent cues
- **Quote**: *"The blade is unseen until the thread is cut. Speak only in silence."*
- **Target Priority**: `BACKLINE_VULNERABLE`
- **Passive Trait**: *Shadow Step* — Gains a massive +35% Evasion bonus during the Run Phase, rendering it nearly impossible to intercept mid-transit.
- **Ultimate Abilities**:
  - **Decoy Substitution** (Cost: 50%, Power: 0): Leaves a holographic smoke decoy, dodging the next two incoming attacks completely.
  - **Thousand Kunai Flurry** (Cost: 80%, Power: 95): Strikes from the shadows with high critical probability, disabling the target's fastest arm.

---

## ⚡ Kinetic Series

Originally engineered for heavy industrial operations (deep-core mining, planetary weather grids, high-output power generation) before being adapted for competitive AniBot battling. Personalities are raw, reactive, and aligned with elemental physics.

### Spark Chip (`chip_spark`)

- **Series**: KINETIC | **Affinity**: `SPEED` | **Diode Color**: `#00E5FF`
- **Starter Frame**: **Circuit-Breaker**
- **Personality Engram**: Hyperactive Speedster
- **Voice / Style**: Rapid, high-frequency rushed chatter
- **Quote**: *"Faster! Faster! I'm already charged! Let me out there now!"*
- **Target Priority**: `HIGHEST_PAYLOAD`
- **Passive Trait**: *Overcharged Dynamo* — Boosts ATB Wait Phase charging speed by +25% and grants electrical weapons +15% chance to stun enemies.
- **Ultimate Abilities**:
  - **Lightning Blitz** (Cost: 50%, Power: 65): An instant electric strike that completely bypasses enemy evasion and applies a stun.
  - **Voltage Surge** (Cost: 75%, Power: 80): Unleashes high-voltage arc lightning across all enemy units, resetting their ATB gauges.
  - **Superconductor Overclock** (Cost: 100%, Power: 105): Instantly overclocks all active weapons to fire simultaneously without cooldown latency.

### Magma Chip (`chip_magma`)

- **Series**: KINETIC | **Affinity**: `MELEE` | **Diode Color**: `#FF4500`
- **Personality Engram**: Volatile Berserker Core
- **Voice / Style**: Low volcanic drawl escalating into explosive bellows
- **Quote**: *"Heat... building... YOU BROKE MY ARM?! BURN TO CINDERS!"*
- **Target Priority**: `ATTACKER_REVENGE`
- **Passive Trait**: *Thermal Volatility* — Attack Payload scales inversely with remaining Integrity, gaining up to +50% bonus damage as HP drops.
- **Ultimate Abilities**:
  - **Pyroclastic Burst** (Cost: 55%, Power: 75): Erupts in a wave of molten slag, inflicting a thermal burn that shreds enemy Torso armor.
  - **Caldera Eruption** (Cost: 90%, Power: 115): Detonates the arena floor in geysers of lava, scaling massive damage from lost HP.

### Frost Chip (`chip_frost`)

- **Series**: KINETIC | **Affinity**: `CONTROL` | **Diode Color**: `#80DEEA`
- **Personality Engram**: Cryogenic Controller
- **Voice / Style**: Monotone, synthetic machine readouts
- **Quote**: *"Thermal entropy applied. Target velocity reduced to zero. Logical conclusion reached."*
- **Target Priority**: `RUNNING_TARGETS`
- **Passive Trait**: *Cryo-Stasis Protocol* — Applies a chilling frost effect that slows the target's Run Phase and Wait Phase speed by 30%.
- **Ultimate Abilities**:
  - **Flash Freeze** (Cost: 50%, Power: 55): Encases enemy in solid cryo-ice, freezing their ATB meter in place for 3 seconds.
  - **Blizzard Protocol** (Cost: 85%, Power: 85): Summons a sub-zero storm that lowers all enemies' clock speed and evasion by 40%.

### Gale Chip (`chip_gale`)

- **Series**: KINETIC | **Affinity**: `SPEED` | **Diode Color**: `#A7FFEB`
- **Personality Engram**: Aloof Zephyr
- **Voice / Style**: Breezy, careless sighs and airy whispers
- **Quote**: *"So slow... why can't anyone keep up? Let's blow this away."*
- **Target Priority**: `ADVANCING_UNITS`
- **Passive Trait**: *Slipstream Turbulence* — Blasts moving enemies backwards along their ATB track on hit, delaying their attack execution.
- **Ultimate Abilities**:
  - **Tailwind Burst** (Cost: 45%, Power: 60): Fires a concentrated vortex that resets the target's Run Phase back to base line.
  - **Typhoon Slipstream** (Cost: 80%, Power: 80): Accelerates the entire team's Run speed by 50% while deflecting incoming projectiles.

### Terra Chip (`chip_terra`)

- **Series**: KINETIC | **Affinity**: `DEFENSE` | **Diode Color**: `#8D6E63`
- **Personality Engram**: Seismic Bastion
- **Voice / Style**: Deep, rumbling subterranean bass
- **Quote**: *"I do not run. The world comes to me. Break yourself against my bedrock."*
- **Target Priority**: `PHYSICAL_ATTACKERS`
- **Passive Trait**: *Bedrock Plating* — Suffers -20% Run speed but gains an innate 25% flat damage reduction against all physical and kinetic attacks.
- **Ultimate Abilities**:
  - **Faultline Slam** (Cost: 50%, Power: 65): Strikes the floor with tectonic force, knocking all grounded enemies off-balance.
  - **Granite Armor** (Cost: 70%, Power: 0): Hardens chassis armor, increasing Torso Firewall by +25 for 3 combat turns.
  - **Tectonic Cataclysm** (Cost: 100%, Power: 110): Shatters the arena floor beneath the enemy squad, dealing massive crushing ground damage.

### Torrent Chip (`chip_torrent`)

- **Series**: KINETIC | **Affinity**: `COOLING` | **Diode Color**: `#0288D1`
- **Personality Engram**: Hydro-Cooling Specialist
- **Voice / Style**: Calm, rhythmic oceanic cadence
- **Quote**: *"Flow like water. Formless, adaptive, relentless. Cool your systems."*
- **Target Priority**: `OVERHEATING_UNITS`
- **Passive Trait**: *Hydro-Coolant Loop* — Acts as a continuous liquid heatsink, eliminating heat-based cooldown latency penalties on heavy weapons by 40%.
- **Ultimate Abilities**:
  - **Tidal Surge** (Cost: 50%, Power: 65): A high-pressure water jet that washes away enemy stat buffs and cools own weapons instantly.
  - **Abyssal Deluge** (Cost: 85%, Power: 90): Unleashes a torrential vortex that drenches the battlefield, doubling cooling for allies.

### Corrosive Chip (`chip_corrosive`)

- **Series**: KINETIC | **Affinity**: `ACID` | **Diode Color**: `#76FF03`
- **Personality Engram**: Cynical Sanitation Debugger
- **Voice / Style**: Dry, sarcastic debugger logs and terminal errors
- **Quote**: *"Target identified as critical bug in system. Applying acid patch: deletion guaranteed."*
- **Target Priority**: `HIGHEST_ARMOR`
- **Passive Trait**: *Bugfix as a Service* — Attacks inject acidic malware that shreds 10% enemy Torso Firewall armor per hit, stacking up to 50% total reduction.
- **Ultimate Abilities**:
  - **Decompile Protocol** (Cost: 50%, Power: 60): Sprays caustic nanite acid that dissolves 50% of the target's current armor value.
  - **Systemic Meltdown** (Cost: 85%, Power: 95): Triggers a cascade failure inside the enemy's circuitry, dealing heavy damage over time.

### Photon Chip (`chip_photon`)

- **Series**: KINETIC | **Affinity**: `SHOOTING` | **Diode Color**: `#FFFF00`
- **Personality Engram**: Optical Laser Matrix
- **Voice / Style**: Rapid binary telemetry and frequency codes
- **Quote**: *"01001100 01001001 01000111 01001000 01010100. Target illuminated. Evasion probability: 0%."*
- **Target Priority**: `HIGH_EVASION_UNITS`
- **Passive Trait**: *Optical Target Lock* — Employs coherent laser telemetry that completely bypasses enemy evasion/packet loss, guaranteeing 100% hit rate.
- **Ultimate Abilities**:
  - **Prismatic Beam** (Cost: 50%, Power: 70): Fires a concentrated light beam that cannot be dodged or shielded against.
  - **Solar Flare Burst** (Cost: 85%, Power: 90): Blinds all opposing optical sensors, dropping enemy accuracy to zero for 1 combat turn.

### Void Chip (`chip_void`)

- **Series**: KINETIC | **Affinity**: `CONTROL` | **Diode Color**: `#4A148C`
- **Personality Engram**: Gravitational Singularity
- **Voice / Style**: Somber, ponderous cosmic echoes
- **Quote**: *"All mass collapses into darkness. Nothing escapes the singularity."*
- **Target Priority**: `CENTER_CLUSTER`
- **Passive Trait**: *Gravitational Well* — Emits a localized gravity field that slows down the Run Phase sprint speed of all other units on the field by 20%.
- **Ultimate Abilities**:
  - **Event Horizon** (Cost: 55%, Power: 60): Creates a gravitational vortex pulling all enemies toward the center line, halting their movement.
  - **Singularity Collapse** (Cost: 90%, Power: 100): Crushes the target in a dense gravitational field, dealing damage scaled by their total loadout weight.

### Sonic Chip (`chip_sonic`)

- **Series**: KINETIC | **Affinity**: `DISRUPTION` | **Diode Color**: `#FF007F`
- **Personality Engram**: Disruptive Acoustic Shockwave
- **Voice / Style**: High-decibel distorted banter and screeching shouts
- **Quote**: *"BLAST IT! You want maximum volume?! Here comes the shockwave!"*
- **Target Priority**: `CASTING_UNITS`
- **Passive Trait**: *Acoustic Concussion* — All attacks possess a 25% chance to concussive-stun an enemy, instantly resetting their Action Bar to zero.
- **Ultimate Abilities**:
  - **Sonic Shockwave** (Cost: 50%, Power: 65): Blasts a high-decibel acoustic pulse that stuns and completely drains the target's ATB gauge.
  - **Harmonic Shatter** (Cost: 80%, Power: 85): Emits a resonant frequency that shatters enemy active shields and arm parts.

### Plasma Chip (`chip_plasma`)

- **Series**: KINETIC | **Affinity**: `BURST_DAMAGE` | **Diode Color**: `#FF6D00`
- **Personality Engram**: Superheated Reactor Core
- **Voice / Style**: Panicked, frantic reactor warning alarms
- **Quote**: *"Warning! Core containment failing! It's too hot! EJECTING BURST!"*
- **Target Priority**: `HIGHEST_INTEGRITY`
- **Passive Trait**: *Superheated Discharge* — Arm weapons deal +35% devastating burst payload damage, but suffer 5 recoil integrity damage to equipped arms per shot.
- **Ultimate Abilities**:
  - **Core Vent** (Cost: 50%, Power: 90): Discharges superheated ionic plasma, dealing massive single-target damage with slight self-recoil.
  - **Supernova Discharge** (Cost: 90%, Power: 130): Vents the entire plasma core in a cataclysmic burst that damages all units on the field.

### Flora Chip (`chip_flora`)

- **Series**: KINETIC | **Affinity**: `SUPPORT` | **Diode Color**: `#00C853`
- **Personality Engram**: Botanical Regenerator
- **Voice / Style**: Gentle, organic botanical whispers
- **Quote**: *"Rest within the soil of patience. Silicon and sap shall mend our armor."*
- **Target Priority**: `POISONED_TARGETS`
- **Passive Trait**: *Photosynthetic Cache* — Remaining idle in the Wait Phase without issuing an immediate command slowly regenerates 8 Integrity per cycle to all equipped parts.
- **Ultimate Abilities**:
  - **Bio-Entanglement** (Cost: 45%, Power: 45): Ensnare the enemy with conductive vines, leeching 30 HP to heal self.
  - **Verdant Restoration** (Cost: 70%, Power: 0): Sprouts a regenerative nanite garden, repairing all ally parts by 35 Integrity.
  - **Gaia's Renewal** (Cost: 95%, Power: 70): Absorbs ambient energy to revive one disabled arm part and grant team-wide health regeneration.

---

## ✨ Astral Series

Rare, celestial, or experimental Anima Chips recovered from meteor impact sites and black-budget research facilities. Personalities are grand, mystical, and alien, unlocking esoteric battlefield mechanics.

### Orion Chip (`chip_orion`)

- **Series**: ASTRAL | **Affinity**: `SNIPER` | **Diode Color**: `#7C4DFF`
- **Starter Frame**: **Nova-Seeker**
- **Personality Engram**: Celestial Marksman
- **Voice / Style**: Stoic, quiet telemetry readouts
- **Quote**: *"Target weakness isolated. Elevation and wind locked. Executing clean termination."*
- **Target Priority**: `LOWEST_ARMOR`
- **Passive Trait**: *Hunter's Starlight* — Grants +25% Precision and +20% Critical Hit damage to long-range sniper rifle parts.
- **Ultimate Abilities**:
  - **Starlight Piercer** (Cost: 50%, Power: 75): Precision celestial shot guaranteed to strike the enemy Head with 100% critical damage.
  - **Constellation Mark** (Cost: 75%, Power: 0): Marks all enemy weak points, doubling critical hit chance for all allies.
  - **Supernova Railgun** (Cost: 100%, Power: 120): Fires a relativistic cosmic round that penetrates all 3 enemy bot frames.

### Gemini Chip (`chip_gemini`)

- **Series**: ASTRAL | **Affinity**: `DUAL_WIELD` | **Diode Color**: `#00E5FF`
- **Personality Engram**: Dual Conscious Twins
- **Voice / Style**: Overlapping dual voices arguing over tactical choices
- **Quote**: *"I'll strike left! — No, right arm cannon is ready! — Let's just fire both!"*
- **Target Priority**: `DUAL_TARGET`
- **Passive Trait**: *Binary Synchronization* — 25% chance to execute a free second attack in the same combat turn, or dynamically copy the target's highest stat.
- **Ultimate Abilities**:
  - **Castor & Pollux Flurry** (Cost: 50%, Power: 70): Fires both left and right arm weapons simultaneously in a rapid unison strike.
  - **Prismatic Reflection** (Cost: 85%, Power: 90): Mirrors the opponent's strongest weapon payload back at them with 120% power.

### Ursa Chip (`chip_ursa`)

- **Series**: ASTRAL | **Affinity**: `DEFENSE` | **Diode Color**: `#5D4037`
- **Personality Engram**: Great Bear Guardian
- **Voice / Style**: Booming, warm protective parental guardian roar
- **Quote**: *"Stay close to me, child. No harm shall touch you while my circuits hum."*
- **Target Priority**: `ALLY_ATTACKERS`
- **Passive Trait**: *Mother Bear's Bulwark* — Intercepts lethal damage aimed at allies; gains +20% Firewall armor when an ally is below 50% HP.
- **Ultimate Abilities**:
  - **Great Bear Bastion** (Cost: 50%, Power: 0): Takes 100% of all incoming damage meant for teammates for 1 full combat rotation.
  - **Mighty Claw Counter** (Cost: 80%, Power: 95): Retaliates with a crushing celestial maul that stuns the target for 3 seconds.

### Leo Chip (`chip_leo`)

- **Series**: ASTRAL | **Affinity**: `LEADERSHIP` | **Diode Color**: `#FFD700`
- **Personality Engram**: Sovereign Monarch
- **Voice / Style**: Imperious monarch with regal grandeur
- **Quote**: *"Kneel before your sovereign! Squad, advance under my glorious banner!"*
- **Target Priority**: `ENEMY_LEADER`
- **Passive Trait**: *Sovereign Command* — When designated as the squad's Leader, all teammates gain a flat +15% damage multiplier and +10% Clock Speed.
- **Ultimate Abilities**:
  - **King's Roar** (Cost: 50%, Power: 50): Intimidates the entire enemy lineup, reducing their attack power by 25%.
  - **Solar Flare Claws** (Cost: 75%, Power: 85): A blazing regal claw strike that inflicts radiant burn and guard break.
  - **Sovereign Execution** (Cost: 100%, Power: 125): Executes an enemy below 30% HP instantly, rallying the entire squad's Overclock gauge.

### Cygnus Chip (`chip_cygnus`)

- **Series**: ASTRAL | **Affinity**: `CRITICAL` | **Diode Color**: `#E1BEE7`
- **Personality Engram**: Celestial Ballet Duelist
- **Voice / Style**: Poetic, aristocratic grace and cadence
- **Quote**: *"A pirouette among constellations. Every strike is a verse of sublime beauty."*
- **Target Priority**: `EXPOSED_FRAMES`
- **Passive Trait**: *Trajectory Calculation* — Lightweight sword parts gain +30% Critical Hit chance and ignore 20% target evasion.
- **Ultimate Abilities**:
  - **Starlight Pirouette** (Cost: 50%, Power: 70): An aerial ballet slash that guarantees a critical hit and boosts own evasion by 20%.
  - **Feather of Cygnus** (Cost: 80%, Power: 95): Flings razor-sharp starlight plumes that shred the target's limbs.

### Draco Chip (`chip_draco`)

- **Series**: ASTRAL | **Affinity**: `OVERCLOCK` | **Diode Color**: `#E53935`
- **Personality Engram**: Primordial Slumbering Dragon
- **Voice / Style**: Ancient primordial resonance, sleepy and deep
- **Quote**: *"An eternity of slumber disturbed... Witness the awakening of the cosmos."*
- **Target Priority**: `STRONGEST_OPPONENT`
- **Passive Trait**: *Ancient Dragon Heart* — Moves 15% slower during the Wait Phase, but its Overclock / Medaforce gauge charges twice as fast as standard chips.
- **Ultimate Abilities**:
  - **Wyrm Fire Breath** (Cost: 40%, Power: 70): Breathes mythic dragon fire across the enemy front line, applying armor melt.
  - **Draconic Meteor** (Cost: 70%, Power: 100): Summons a celestial meteorite, dealing massive crushing damage to all enemy parts.
  - **Awakened Dragon Cataclysm** (Cost: 100%, Power: 140): Unleashes complete primordial fury, devastating the enemy team with cosmic fire.

### Pegasus Chip (`chip_pegasus`)

- **Series**: ASTRAL | **Affinity**: `MOBILITY` | **Diode Color**: `#81D4FA`
- **Personality Engram**: Free-Spirited Celestial Steed
- **Voice / Style**: Soaring, spirited, exultant cries
- **Quote**: *"No ground can bind these wings! Soar into the boundless ether!"*
- **Target Priority**: `GROUNDED_TARGETS`
- **Passive Trait**: *Celestial Hover* — Grants the Anibot an innate Hover status, completely negating all terrain movement penalties for its Legs and boosting Run speed by +25%.
- **Ultimate Abilities**:
  - **Starfall Dive** (Cost: 50%, Power: 65): Swoops down from high altitude with an unblockable kinetic strike.
  - **Wings of the Cosmos** (Cost: 80%, Power: 0): Grants the entire team free flight for 2 combat cycles, negating all terrain penalties.

### Scorpio Chip (`chip_scorpio`)

- **Series**: ASTRAL | **Affinity**: `COUNTER` | **Diode Color**: `#880E4F`
- **Personality Engram**: Vindictive Stinger
- **Voice / Style**: Hissing, venomous malice
- **Quote**: *"Strike my head, will you? Feel my venom seep through every copper vein!"*
- **Target Priority**: `HEAD_ATTACKERS`
- **Passive Trait**: *Vindictive Stinger* — If an enemy damages its Head part, Scorpio automatically queues a free, instant 0-cost counter-attack on its next turn.
- **Ultimate Abilities**:
  - **Neurotoxin Sting** (Cost: 50%, Power: 60): Stabs the enemy with a neurotoxin payload that drains 15 Integrity per second.
  - **Vindictive Execution** (Cost: 85%, Power: 105): Deals triple counter damage if Scorpio's Head was damaged in the preceding turn.

### Lyra Chip (`chip_lyra`)

- **Series**: ASTRAL | **Affinity**: `COMBO` | **Diode Color**: `#CE93D8`
- **Personality Engram**: Harmonic Synchronizer
- **Voice / Style**: Melodic, soft celestial harmony
- **Quote**: *"The harmony of the spheres unites us. Together, we play the melody of triumph."*
- **Target Priority**: `ALLY_TARGET`
- **Passive Trait**: *Harmonic Synchronization* — When Lyra reaches the center line, an ally immediately runs up to execute a simultaneous dual combination attack.
- **Ultimate Abilities**:
  - **Stellar Symphony** (Cost: 45%, Power: 0): Links all 3 ally bots, sharing 25% of all damage dealt as team healing.
  - **Harmonic Convergence** (Cost: 85%, Power: 110): Commands all 3 squad bots to execute a coordinated simultaneous strike on a single target.

### Aries Chip (`chip_aries`)

- **Series**: ASTRAL | **Affinity**: `INTERCEPT` | **Diode Color**: `#FF3D00`
- **Personality Engram**: Battering Ram Interceptor
- **Voice / Style**: Rash, aggressive shouting
- **Quote**: *"Clear the track! I'm coming through and smashing whatever is in front of me!"*
- **Target Priority**: `RUNNING_MIDFIELD`
- **Passive Trait**: *Battering Intercept* — Rushes the center line specifically to body-block sprinting enemies, interrupting their actions and stunning them.
- **Ultimate Abilities**:
  - **Battering Horn Strike** (Cost: 50%, Power: 70): Rams the enemy with massive kinetic force, shattering their guard and pushing them back.
  - **Astral Juggernaut** (Cost: 85%, Power: 100): Charges through the entire enemy team, trampling all units in its path.

### Libra Chip (`chip_libra`)

- **Series**: ASTRAL | **Affinity**: `BALANCE` | **Diode Color**: `#26A69A`
- **Personality Engram**: Equilibrium Arbiter
- **Voice / Style**: Calm, mathematical, strictly balanced cadence
- **Quote**: *"Excess creates fragility; deficiency invites collapse. Perfect equilibrium restored."*
- **Target Priority**: `HEALTHIEST_OPPONENT`
- **Passive Trait**: *Equilibrium Rebalance* — At the start of its turn, automatically averages and redistributes the remaining Integrity across all of its own equipped parts.
- **Ultimate Abilities**:
  - **Karmic Scale** (Cost: 50%, Power: 50): Equalizes the HP percentage between self and the targeted opponent.
  - **Total Equilibrium** (Cost: 85%, Power: 0): Evenly redistributes total squad HP across all surviving allies and cleanses all debuffs.

### Andromeda Chip (`chip_andromeda`)

- **Series**: ASTRAL | **Affinity**: `MARTYR` | **Diode Color**: `#EC407A`
- **Personality Engram**: Tragic Martyr
- **Voice / Style**: Operatic tragedy and poetic martyrdom
- **Quote**: *"Shatter my armor, strike my core... In tragedy, our true power awakens!"*
- **Target Priority**: `PART_DESTROYERS`
- **Passive Trait**: *Martyr Complex* — Every time one of its equipped parts is destroyed, its remaining parts gain a permanent +25% Payload and +15% Accuracy boost.
- **Ultimate Abilities**:
  - **Nebula Shackles** (Cost: 50%, Power: 65): Binds enemy to Andromeda, redirecting 40% of damage taken back to the attacker.
  - **Martyr's Requiem** (Cost: 75%, Power: 90): Unleashes tragic nebula energy that deals bonus damage for every broken part on self.
  - **Cosmic Ascendance** (Cost: 100%, Power: 135): Can only be activated if 2 or more parts are destroyed: unleashes a catastrophic cosmic supernova.


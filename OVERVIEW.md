# AniBots

**Game name:** Anibots

**Game engine:** Godot

**Database:** SQLite

- 1. The "Read-Only" Game Database (The Catalog)<br>
  Instead of hardcoding the stats for the Circuit-Breaker legs or the Orion chip into your engine scripts, you build a static SQLite database that ships with the game.
  - **The Benefit:** When a battle starts, the engine just runs a quick SELECT query to pull the exact Base Integrity, Payload, and Precision stats for whatever parts the Anibots have equipped.

  - **Balance and Patching:** If you need to nerf a weapon's damage for a patch, you don't have to touch the game code at all. You just update that single cell in the SQLite database file and push the update.

- 2. The "Writable" Save Database (The Player's State)<br>
  We will maintain a second, separate SQLite file specifically for the player's save data. This handles the dynamic economy we just built:

  - **Tracking Degradation:** Because every part the player owns has a unique Condition percentage, SQLite allows us to update that specific value instantly when a part breaks in battle, without having to rewrite the entire save file.

  - **ACID Compliance (Corrupt Save Protection):** If the game crashes right as a player is paying Scrap to the Workshop, SQLite's transactional nature ensures the save file doesn't corrupt. Either the transaction completely finishes, or it rolls back.

- 3. Portability for the Nintendo Switch<br>
  SQLite is a C-language library that runs completely self-contained. It does not require a separate server process running in the background. Because of this, a Godot or Unity project using SQLite will compile natively and run flawlessly on Windows, Linux, macOS, and consoles like the Nintendo Switch.

- 4. Implementation in Godot<br>
  Because we are moving forward with Godot, integrating SQLite is incredibly frictionless.

  - You do not need to write complex database drivers.

  - There are highly maintained, open-source plugins (like godot-sqlite) available directly in the Godot Asset Library. You simply drop the plugin into your project folder, and you can immediately start writing standard SQL queries directly inside your GDScript logic.

## Anima Chip: The Heart of the Machine

At its core, an Anibot is just a collection of inert hardware—motors, servos, and armor plating acting as bare metal. The Anima Chip is the spark that brings that infrastructure to life.

It is a highly advanced, indestructible solid-state memory drive that functions as both the central operating system and the autonomous "soul" of the Anibot.

### 1. The Hardware Design

Physically, an Anima Chip looks like a ruggedized, futuristic SD card or a classic ROM cartridge. It features a hardened metallic casing with exposed gold connector pins. The center of the chip houses a glowing, holographic diode that changes color depending on the Series (Historical, Kinetic, or Astral) and pulses rhythmically like a heartbeat when the Anibot is powered on.

To bring an Anibot online, the pilot (known as a "Handler") simply slots the Anima Chip into the secure port located on the back of the Anibot's central skeleton.

### 2. The Software (The "Soul")

The Anima Chip contains a highly sophisticated, containerized AI environment. When slotted in, it immediately runs a boot sequence that abstracts the physical hardware (the arms, legs, and head) and assumes total control.

This AI is not a blank slate. Because of how they are manufactured, every Anima Chip is pre-programmed with a distinct personality engram. An "Orion" chip will always boot up with a stoic, calculating demeanor, while a "Spark" chip will act hyperactive and restless. The chip dictates how the robot sounds, acts, and reacts to the player's commands.

### 3. The Combat Pipeline and Growth

In battle, the Anima Chip is the central processor. It receives the Handler's tactical commands and pipelines them to the physical weapons.

More importantly, Anima Chips are dynamic learning engines. As an Anibot battles, the chip continuously logs combat data, opponent tactics, and optimization algorithms. When you "Level Up" after winning a match, you are actually pushing a new version update to the Anima Chip's internal repository. This allows the AI to unlock new ultimate abilities and calculate attacks faster, regardless of what physical parts it is currently wearing.

## Anima Chips Series

### Antiquity Series

These are the most common, mass-market Anima Chips. They were programmed to mimic the disciplines of legendary fighters, making their personalities highly distinct and their combat styles easy for new players to understand.

- **Ronin Chip:** A wandering, philosophical personality. It speaks in haikus and excels in one-on-one melee combat using lightweight, high-evasion parts.

- **Dragoon Chip:** A proud, loud, and constantly talking about "honor." Specializes in heavy armor, spear-like weapons, and leap-attacks.

- **Corsair Chip:** Rebellious, greedy, and laughs a lot. Its AI prefers sneaky tactics, trapping the enemy line, and using heavy ranged cannons.

- **Phalanx Chip (Hoplite):** Highly disciplined and fiercely protective. It acts as the ultimate front-line infrastructure, excelling with shield arms and automatically intercepting attacks meant for fragile allies.

- **Artificer Chip (Engineer):** Analytical and constantly optimizing. It views combat as a system to be automated, excelling at setting up traps on the center line and structuring complex attack pipelines that trigger sequentially.

- **Gunslinger Chip (Cowboy):** Cocky, drawls when it speaks, and is dangerously quick. It drastically reduces the "Cooldown Phase" time for revolver and pistol parts, allowing for rapid hit-and-run tactics.

- **Berserker Chip (Viking):** Unhinged and screaming. It completely ignores its own armor modifiers to boost raw damage, making it a terrifying glass cannon.

- **Templar Chip (Paladin):** Righteous and serious. It sacrifices its own ATB charge time to cast defensive buffs or repair the broken parts of its teammates.

- **Ranger Chip (Scout):** Quiet and observant. It maps the battlefield perfectly, granting a massive agility boost to its Legs, regardless of the terrain type.

- **Gladiator Chip (Pit Fighter):** A complete showboat that thrives on attention. It actively taunts, forcing the enemy's targeting logic to focus entirely on it.

- **Bard Chip (Minstrel):** Eccentric and rhythmic. It uses broadcast audio signals to buff the team, passively increasing the "Wait Phase" fill rate of any Anibots next to it.

- **Shinobi Chip (Ninja):** Speaks in whispers and hates direct confrontation. It gains massive evasion bonuses during the "Run Phase," making it incredibly hard to intercept.

### Kinetic Series

These chips were originally developed for industrial use (mining, power grids, weather research) before being repurposed for Anibot battling. Their personalities are raw, emotional, and tied directly to their element.

- **Spark Chip (Electric):** Hyperactive, impatient, and practically vibrates with energy. It boosts the Anibot's ATB "Wait Phase" charging speed.

- **Magma Chip (Fire):** Sluggish and slow to speak, but incredibly volatile if its parts take too much damage. Perfect for a "berserker" build that gets stronger as its HP drops.

- **Frost Chip (Ice):** Cold, calculating, and highly analytical. It speaks like a computer and focuses on freezing or delaying the opponent's "Run Phase."

- **Gale Chip (Wind):** Aloof and easily bored. It moves so fast that it can occasionally blow enemies backward on their ATB track, delaying their actions.

- **Terra Chip (Earth):** Stubborn, deep-voiced, and refuses to move quickly. It has abysmal Run speed but gains a massive innate damage reduction against all physical attacks.

- **Torrent Chip (Water):** Calm, adaptable, and fluid. Its AI acts as a perfect cooling system, preventing high-damage heavy weapons from suffering heat-based cooldown penalties.

- **Corrosive Chip (Acid):** Originally a digital sanitation AI, it is highly cynical. It treats enemy Anibots as fatal system errors, violently dismantling their armor over time like a twisted, aggressive "bugfix as a service."

- **Photon Chip (Light):** Intensely focused and speaks in rapid binary. It uses laser/optical targeting to completely bypass enemy evasion, guaranteeing hits.

- **Void Chip (Gravity):** Nihilistic and heavy. It exerts a gravitational pull that slows down the "Run Phase" of every other Anibot on the field, including allies.

- **Sonic Chip (Sound):** Loud, chaotic, and disruptive. Its attacks have a high chance of stunning an enemy, instantly resetting their Action Bar to zero.

- **Plasma Chip (Energy):** Unstable and prone to panic. It deals devastating burst damage but causes slight recoil damage to its own equipped parts with every shot.

- **Flora Chip (Nature):** Nurturing and patient. If you leave it in the "Wait Phase" without issuing a command, it will slowly regenerate the durability of its equipped parts.

### Astral Series

These are the rare, mysterious, or experimental Anima Chips. In the game's lore, they could be ancient chips found in meteorites or cutting-edge tech leaked from a secret lab. Their personalities are slightly alien, grandiose, or mystical.

- **Orion Chip (The Hunter):** Stoic and intensely focused. It constantly scans the battlefield for weaknesses and grants a massive accuracy bonus to sniper parts.

- **Gemini Chip (The Twins):** It has two distinct voices that argue with each other. In combat, it allows the Anibot to occasionally attack twice in one turn or perfectly mirror an opponent's stats.

- **Ursa Chip (The Great Bear):** A deeply protective, booming, and fatherly/motherly AI. It excels at defensive setups, taking damage in place of its teammates.

- **Leo Chip (Lion):** Regal, arrogant, and demands respect. As long as it is designated as the team's "Leader," the entire squad gets a flat damage multiplier.

- **Cygnus Chip (Swan):** Elegant and poetic. It perfectly calculates trajectories in the background, granting a high critical-hit chance to lightweight, elegant sword parts.

- **Draco Chip (Dragon):** Ancient, sleepy, and slow to act. However, its Medaforce/Ultimate attack gauge charges twice as fast as any other chip.

- **Pegasus Chip (Winged Horse):** Free-spirited and hates being tied down. It grants the Anibot a "hover" state, completely negating all terrain movement penalties for its Legs.

- **Scorpio Chip (Scorpion):** Spiteful and vindictive. If an enemy damages its Head part, it will automatically launch a free counter-attack during its next turn.

- **Lyra Chip (Harp):** Harmonic and gentle. It synchronizes the team's framework, ensuring that if it reaches the center line, an ally can run up and execute a combination attack with it.

- **Aries Chip (Ram):** Hot-headed and impatient. Its primary tactic is to rush the center line specifically to body-block and intercept running enemies.

- **Libra Chip (Scales):** Obsessed with perfect balance. At the start of its turn, it instantly redistributes the remaining durability (HP) of its parts so they are all equally healthy.

- **Andromeda Chip (Maiden):** Speaks in dramatic, tragic tones. It possesses a martyr complex—every time one of its own parts is destroyed, its remaining parts become significantly stronger.

## Starters

The classic 3-starter approach is the gold standard for RPG onboarding. It immediately teaches the player that their choice of Anima Chip affects both the personality of their companion and their foundational combat strategy.

By offering one from each Series, you give the player three completely distinct playstyles right out of the box. Here is a balanced, exciting lineup for the starting three Anibots:

### 1. The Antiquity Starter: The Control/Trap Playstyle

- **Anima Chip:** The Artificer Chip

- **Personality:** Analytical, methodical, and constantly trying to optimize the battlefield. It speaks in calculated, structured sentences and views combat as a system to be perfectly managed.

- **Default Frame:** Genesis-1

  - **Head (Logic Bomb):** Instead of direct damage, this places a trap on the center combat line. The next enemy to step on it takes massive damage.

  - **Left/Right Arms (Ratchet & Wrench):** Reliable, medium-damage melee tools with very short Cooldown Phases, allowing the Anibot to run back to safety quickly.

  - **Legs (Steady-Tread):** Bipedal legs with high armor. They aren't the fastest, but they can take a hit without being severely slowed down.

- **The Vibe:** The Genesis-1 acts as the perfect foundational starter kit for players who want to thoughtfully control the flow of battle and outsmart their opponents rather than just overpowering them.

### 2. The Kinetic Starter: The Aggressive/Speed Playstyle

- **Anima Chip:** The Spark Chip

- **Personality:** Hyperactive, practically vibrating with electricity, and incredibly impatient. It talks fast, complains when the Wait Phase takes too long, and wants to be constantly moving.

- **Default Frame:** Circuit-Breaker

  - **Head (Surge Node):** Fires a paralyzing blast. If it hits an enemy during their Run Phase, it stuns them and instantly resets their Action Bar to zero.

  - **Left/Right Arms (Volt-Caster & Static-Whip):** High-speed electrical attacks. The whip is great for close-range intercepts, while the caster chips away from afar.

  - **Legs (Current-Wheels):** Wheeled legs that boast the fastest Run Phase speed in the early game, but they are incredibly fragile and suffer heavy penalties on rough terrain (like water or mud).

- **The Vibe:** High risk, high reward. Perfect for players who want to aggressively intercept enemies mid-run and overwhelm them with speed.

### 3. The Astral Starter: The Precision/Sniper Playstyle

- **Anima Chip:** The Orion Chip

- **Personality:** Stoic, quiet, and intensely focused. It acts like a veteran hunter, patiently scanning the enemy for weak points and rarely showing emotion.

- **Default Frame:** Nova-Seeker

  - **Head (Astro-Scope):** A utility head part. Using it spends a turn but guarantees that the Anibot's next arm attack will be a critical hit that cannot be evaded.

  - **Left/Right Arms (Pulsar-Rifle & Comet-Snipe):** Devastatingly powerful ranged weapons. However, because they are heavy, they cause a very slow Cooldown Phase, leaving the Anibot vulnerable as it returns to the start line.

  - **Legs (Hover-Drive):** Anti-gravity boosters. They provide average speed, but they completely ignore all terrain penalties, ensuring the Anibot's timing is always perfectly predictable.

- **The Vibe:** Elegant and deadly. Designed for the patient player who wants to set up the perfect, unblockable shot to instantly destroy an enemy's Head part in a single blow.

## Attributes

### 1. Active Parts (Head, Left Arm, Right Arm)

These are your peripheral devices—the tools that execute commands.

- **Integrity (HP):** The physical health of the component. If the Head's Integrity hits 0, it results in a "System Failure" (game over). If an Arm hits 0, it is disabled.

- **Payload (Power):** The raw output. This could be kinetic damage (bullets/swords), elemental damage, or the strength of a firewall/buff.

- **Precision (Success):** The targeting accuracy. Higher Precision not only guarantees hits but increases the chance of striking a critical vulnerability.

- Execution Time (Charge):** The Uplink speed. How fast the Anibot can sprint from the starting line to the center line to deliver this specific payload.

- **Latency (Cooldown):** The Downlink speed. The mechanical recovery time needed to run back to the starting line after the attack animation finishes. Heavy weapons have massive latency.

- **Cache (Head Only):** Replaces "Uses". The finite amount of memory allocated for this devastating attack (e.g., Cache: 3).

```json
{
  "name": "Pulsar-Rifle",
  "slot": "LEFT_ARM",
  "type": "SHOOTING",
  "integrity": 60,
  "payload": 50,
  "precision": 80,
  "execution_time": 4.5,
  "latency": 9.2,
  "weight": 18,
  "cache": -1
}
```

### 2. The Twist: The Torso (Chassis)

The Torso acts as the motherboard. It doesn't have its own attacks; instead, it dictates the structural limits and passive defenses of the entire build.

- **Integrity (HP):** If the Torso is destroyed, the Anibot doesn't die, but it loses connection to its Arms, disabling them until repaired.

- **Max Loadout (Bandwidth):** Every Head and Arm has a "Weight" value. The Torso's Max Loadout determines how much heavy equipment it can support. If you exceed this limit, your overall speed suffers massive penalties.

- **Firewall (Armor):** A flat damage mitigation stat that protects the entire Anibot from incoming attacks.

- **Cooling System:** A passive stat that physically reduces the Latency (cooldown phase) of whatever Arms are attached to it. A Torso with high Cooling lets you fire heavy weapons much faster.

```json
{
  "name": "Heavy-Duty",
  "slot": "TORSO",
  "type": "CHASSIS",
  "integrity": 500,
  "max_loadout": 35,
  "firewall": 15,
  "cooling": 2.0
}
```

### 3. The Legs (Routing & Mobility)

Legs are all about movement, evasion, and adapting to the physical environment.

- **Integrity (HP):** If broken, the Anibot defaults to a crippled, crawling speed.

- **Clock Speed (Propulsion):** The base frequency at which the Anibot fills its Action Bar during the "Wait Phase" at the starting line.

- **Direct Connect (Proximity):** A structural bonus applied to all close-range/melee payloads.

- **Remote Uplink (Remoteness):** A structural bonus applied to all long-range/shooting payloads.

- **Packet Loss (Evasion):** The percentage chance to completely dodge an incoming attack while standing on the center line or running back.

- **Protocol (Terrain Type):** Whether the legs are Bipedal, Tracks, Hover, or Aquatic, dictating their performance on different battlefield terrains.

```json
{
  "name": "Scout-Legs",
  "slot": "LEGS",
  "type": "LEGS",
  "integrity": 150,
  "clock_speed": 1.8,
  "direct_connect": -5,
  "remote_uplink": 20,
  "packet_loss": 15,
  "protocol": "BIPEDAL"
}
```

### 4. The Anima Chip (The Kernel)

The Chip ties the hardware together and provides the "soul" of the machine.

- **Personality Matrix:** Dictates the AI's autonomous behavior (if you let it auto-battle) and its voice lines.

- **Overclock Gauge:** Replaces the "Medaforce". Taking damage or charging fills this gauge, allowing the Anibot to unleash its Chip-specific ultimate abilities (which bypass destroyed hardware).

- **Affinity:** Every Chip has a preferred combat style (e.g., "Melee", "Sniper", "Trap"). Equipping parts that match the Chip's Affinity grants a passive 10% boost to all stats.

By routing everything through the Torso's "Max Loadout" and "Cooling" stats, forces players to balance their builds. Player can't just equip the four heaviest weapons in the game without a massive, slow Torso to support them.

```json
{
  "name": "Aggressive-Core",
  "slot": "CORE",
  "type": "ANIMA_CHIP",
  "integrity": 200,
  "base_stats": {
    "target_accuracy": 70,
    "evasion": 10,
    "compatibility_bonus": "MELEE"
  },
  "ultimate_abilities": [
    {
      "unlock_level": 10,
      "skill_id": "ult_slash",
      "gauge_cost": 50
    },
    {
      "unlock_level": 20,
      "skill_id": "ult_cut",
      "gauge_cost": 70
    },
    {
      "unlock_level": 30,
      "skill_id": "ult_berserker",
      "gauge_cost": 100
    }
  ]
}
```

## Targeting

Keeping the Anibot semi-autonomous is the exact secret sauce that makes the game feel like you are a "Handler" issuing commands to a living AI, rather than just clicking buttons in a standard RPG menu.

Because the Anibot calculates the target on its own, it makes the choice of the Anima Chip just as important as the weapons equipped.

From a software architecture perspective, this target selection can be programmed using a highly efficient Weighted Scoring System (Utility AI). When a command is issued, the game engine quickly runs a script that assigns a numerical "threat score" to every enemy on the field, and the Anibot attacks the highest score.

Here is how we can adapt those Medabots rules directly into the Anibots infrastructure:

### 1. The Anima Chip's "Directive" (The Aim Logic)

Instead of a simple "Aim" stat, every Anima Chip has a hardcoded Priority Matrix that manipulates the target's threat score based on their hardware.

- **Chip (Sniper):** Adds a massive weight bonus to enemies with the lowest Torso Firewall (Armor) stat. It mathematically seeks the weakest link.

- **Spark Chip (Aggressive):** Adds a massive weight bonus to enemies currently equipping heavy, high-damage Payloads. It wants to take out the biggest gun in the room.

- **Phalanx Chip (Defender):** Prioritizes enemies that are actively targeting its allies, attempting to draw aggro naturally.

### 2. Target Caching (When the lock happens)

Just like in Medabots, the type of hardware used dictates when the targeting script is executed. This makes combat beautifully unpredictable.

- **Precision Payloads (Sniper/Laser Arms):** The targeting script runs the exact moment the Anibot finishes its Wait Phase. It securely "caches" that specific enemy's ID into memory and runs to the center line to shoot them, no matter what else changes on the battlefield.

- **Scatter/Brawler Payloads (Shotguns/Swords):** The targeting script does not run until the Anibot physically reaches the center line. Because other robots might have moved during its Run Phase, the AI recalculates the battlefield state at the last second, meaning the target can suddenly change.

### 3. Track Exposure (Proximity)

The State Machine we discussed earlier ties perfectly into targeting. An Anibot sitting at the start line (Wait Phase) is relatively safe. However, the moment an Anibot enters the Run Phase or Cooldown Phase, it is exposed in the center of the arena.

- The targeting algorithm applies a massive multiplier to any enemy currently in transit.

- This creates an amazing tactical layer: if you equip heavy weapons with terrible Latency, your Anibot will be stuck slowly returning to the start line, acting as a giant magnet for enemy AI targeting.

### 4. The Override Protocol (Interception)

Even with perfect AI logic, a Handler can use defensive hardware to force an interrupt.

- If you command an Anibot to use a Shield/Guard part, it rushes the center line and broadcasts an "Override" signal.

- At the engine level, this temporarily forces the enemy's targeting variables to re-route entirely to the defending Anibot, completely bypassing the Anima Chip's desired algorithm. The defender soaks the Integrity damage to save a fragile teammate.

## Rewards

It bridges the gap between a standard RPG and a survival/management game. By adding persistent "Wear and Tear," you make the Anibots feel like real physical hardware that requires maintenance, rather than just abstract digital stats.

The 85% cap on field repairs is an especially smart design choice. It prevents players from just hoarding infinite repair kits and forces them to actually interact with the game's economy and manage their loadouts carefully.

Here is how we can structure this Hardware Degradation System to make it fun and balanced:

### 1. The Loot System (Salvage)

When a Handler wins a match, they immediately secure one random part from the defeated Anibot, and it goes straight into their inventory, ready to be equipped.

- **The Condition Transfer:** The part retains the exact Condition percentage it had at the start of the battle.

- **The Break Penalty on Loot:** If the losing Anibot had that specific part destroyed (0 HP) during the match, the part suffers a Condition drop before going into your inventory (e.g., dropping from 90% to 87%).

- **Bonus Loot:** Alongside the part, players will occasionally receive generic Scrap material drops, making every victory feel slightly more rewarding even if they loot a duplicate part.

### 2. Condition vs. Integrity (In-Battle HP)

You will need to separate the part's base health from its long-term condition.

- **Integrity (In-Battle HP):** This is the health of the part during a specific match (e.g., 50/50 HP).

- **Condition (The Grade):** This is the permanent physical state of the hardware, capped at 100%.

- **The Math:** A part's max in-battle Integrity is scaled by its Condition. If a Revolver Arm has a base Integrity of 100 HP, but its Condition is degraded to 85%, it will enter the next battle with only 85 HP. If the Condition hits 0%, the part is "Bricked" and cannot be equipped at all until repaired.

### 3. Taking Damage (The Penalty)

Anibots are built tough. Simply engaging in combat, firing weapons, or taking minor damage does not degrade the hardware.

- A part only loses its permanent Condition percentage if its Integrity hits 0 HP and it completely shuts down during a match.

- This encourages highly tactical gameplay. If a player sees their Anibot's right arm is at 5 HP, they are highly motivated to use a Shield command with another Anibot to protect it, rather than letting it break and suffering a permanent Condition penalty.

- **The Break Penalty:** If a part hits 0 Integrity during a battle and explodes, it suffers a massive Condition penalty (e.g., -10% or -15%). This means even if you win the match, letting your parts get destroyed has long-term economic consequences.

### 4. The Repair Economy

Giving players two distinct ways to fix their gear creates excellent risk/reward gameplay.

- **Field-Patch Kits (The Consumable):** These are items you carry in your inventory. You can use them between battles for instant repairs. However, because you are just using duct tape and quick-solder in the field, a kit can only restore a part up to 85% Condition.

- **The Workshop (The Shop):** To get a part back to 100% "Brand New" condition, you have to leave it at the mechanic's shop. This takes time, forcing players to keep backup parts and experiment with different builds while their favorite weapons are in the shop.

- **Real-Time Timers:** Dropping a part at the Workshop removes it from your usable inventory for a real-world duration (e.g., 3 hours for a slightly damaged Torso, or up to 24 hours for a severely bricked Head part).

- **Loadout Shuffling:** This is a fantastic mechanic for a cross-platform game. It naturally forces the player to swap their loadout, try new Anima Chips, and experiment with different parts while their favorite weapons are in the shop. They can set a part to repair on their PC before bed, and it will be ready to equip when they boot up the game the next day.

## Scraps

It essentially creates a highly engaging, player-friendly crafting system that acts as a resource sink without feeling like a punishing "gacha" mechanic.

By delivering the part at 40% Condition, you are giving the player a functional "test drive." It builds anticipation and forces them to make strategic economic decisions.

Here is how this Scrap Synthesis system fits perfectly into the game loop:

### 1. The Assembly Phase (The Gamble)

When players accumulate enough Scrap (e.g., 50 units), they can approach the Workshop's fabrication machine.

- **The Cost:** They hand over the Scrap and pay a minimal currency fee to initiate the build.

- **The Result:** The Shop spits out a completely random AniPart (which could be anything from a common bipedal leg to an ultra-rare sniper head).

- **The Catch:** Because it was cobbled together from junk, it initializes at exactly 40% Condition.

### 2. The 40% "Test Drive"

This is where the mechanic shines. The player now owns the part and can equip it immediately, but using a 40% Condition part in the field is highly dangerous.

- Because Condition dictates in-battle Integrity (HP), a 40% part will have less than half of its maximum health.

- If a player equips a 40% Torso, their Anibot is essentially a glass cannon. It allows them to feel the power, speed, or unique effects of the new gear, but they have to play flawlessly to protect it.

- If they let it hit 0 HP during the test drive, the standard Break Penalty applies, dropping it even lower and risking completely bricking the item before they even fully own it.

### 3. The Investment Decision

After testing the part out, the player has complete agency over what to do next:

- **Option A (The Restoration):** If they love the part, they can take it back to the Workshop, pay the premium restoration fee, and wait out the real-world timer to bring it up to pristine 100% Condition.

- **Option B (The Recycle):** If the RNG gave them a part they already own, or one that doesn't fit their Anima Chip's playstyle, they don't have to waste money fixing it. They can simply dismantle the 40% part right back into a small handful of Scrap, creating a perfect closed-loop economy.

This loop ensures that every battle—even against low-level enemies—feels rewarding, because every piece of Scrap brings the player closer to pulling a potentially rare piece of hardware from the Workshop.

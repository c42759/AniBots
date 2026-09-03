# AniBots Game Design Document (`OVERVIEW.md`)

**AniBots** is a tactical RPG built in **Godot 4.x**, featuring deeply customizable modular robots powered by autonomous AI cores known as **Anima Chips**. Players act as "Handlers," assembling hardware configurations, setting behavioral directives, and issuing tactical commands to semi-autonomous units.

> [!NOTE]
> - **Modular Parts & Types Specification**: See [PARTS.md](./PARTS.md) for full 5-slot anatomy, 5 payload types, 4 torso chassis, and 6 mobility protocols.
> - **Technical Architecture & Godot Engine**: See [GAME.md](./GAME.md) for autoloads, scenes, and full SQLite schemas.
> - **World Lore & Quests**: See [LORE.md](./LORE.md) for 3047 AD timeline, factions, and story arcs.
> - **Characters & Frames**: See [CHARACTERS.md](./CHARACTERS.md) for cast profiles and the 10 Ancient Cores.
> - **Standard Anima Chips**: See [CHIPS.md](./CHIPS.md) for all 36 Antiquity, Kinetic, and Astral chips.
> - **Combat Inspiration**: See [INSPIRATION/README.md](./INSPIRATION/README.md) for design roots in classic relay-line combat (Medabots GBA).

---

## 🛠 System Architecture Summary

The game utilizes a dual-database architecture powered by SQLite:
1. **The Catalog (Read-Only)**: Static base statistics for AniParts and Anima Chips. Allows instant balance patching without altering engine scripts.
2. **The Save Database (Writable)**: Dynamic player save state tracking part wear-and-tear degradation, inventory, and progression with ACID transactional safety.

For GDScript integration details, database drivers, and complete SQL table schemas, see [GAME.md Section 8 (Complete Database & Save Schema)](./GAME.md#8-complete-database--save-schema-slot_xdb).

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

## Anima Chips Roster & Categorization

Anima Chips are categorized into distinct Series reflecting their engineering origin and tactical discipline:
- **Antiquity Series (12 Chips)**: Mimic historical martial disciplines (e.g., Ronin, Dragoon, Corsair, Phalanx, Artificer).
- **Kinetic Series (12 Chips)**: Industrial and elemental cores (e.g., Spark, Magma, Frost, Gale, Terra, Corrosive).
- **Astral Series (12 Chips)**: Celestial, experimental, and rare cores (e.g., Orion, Gemini, Ursa, Leo, Cygnus).
- **Ancient Series (10 Cores)**: Legendary Generation 0 cores (e.g., Vulpes Zerda, Agon, Biggon, Cygon).

> [!TIP]
> For the complete 36-chip catalog containing personality engrams, haiku quotes, diode colors, affinities, passive traits, and full ultimate abilities, consult **[CHIPS.md](./CHIPS.md)**.
> For the 10 legendary Generation 0 cores, consult **[CHARACTERS.md](./CHARACTERS.md#the-10-legendary-ancient-series-anichips-generation-0)**.
> To browse, search, and filter chips in real time, launch the **[AniDex Web App](./dex/README.md)**.

---

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

## Attributes & Hardware Mechanics

> [!TIP]
> For the authoritative specification of all 5 physical slots, 5 payload types, 4 torso architectures, and 6 mobility protocols with terrain interaction formulas, consult **[PARTS.md](./PARTS.md)**.

### 1. Active Parts (Head, Left Arm, Right Arm)

These are your peripheral devices—the tools that execute commands.

- **Integrity (HP):** The physical health of the component. If the Head's Integrity hits 0, it results in a "System Failure" (game over). If an Arm hits 0, it is disabled.
- **Payload (Power):** The raw output. This could be kinetic damage (bullets/swords), elemental damage, or the strength of a firewall/buff.
- **Precision (Success):** The targeting accuracy. Higher Precision not only guarantees hits but increases the chance of striking a critical vulnerability.
- **Execution Time (Charge):** The Uplink speed. How fast the Anibot can sprint from the starting line to the center line to deliver this specific payload.
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

- **Integrity (HP):** If the Torso is destroyed (0 HP), the Anibot does not die, and equipped Arms remain fully functional as long as their own Integrity is above 0. However, the Anibot loses the Torso's Firewall armor mitigation and Cooling bonuses for the remainder of the battle.

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

## Targeting & Autonomous Utility AI

Keeping AniBots semi-autonomous reinforces the Handler fantasy: commanding a living AI rather than micromanaging every turn via traditional menu clicks. Because the robot evaluates targets autonomously, the choice of Anima Chip is just as consequential as the physical weaponry equipped.

Target selection operates via a **Weighted Scoring System (Utility AI)**. When a command is dispatched, the engine calculates a numerical "threat score" for every opposing unit, and the AniBot executes against the highest-scoring target.

> [!NOTE]
> This relay-line combat loop and semi-autonomous targeting adapts principles from classic robot-battler titles. For historical design origins, see [INSPIRATION/README.md](./INSPIRATION/README.md).

### 1. The Anima Chip Priority Matrix (Aim Directives)

Every Anima Chip contains a priority matrix that skews threat calculations based on opponent loadouts:

- **Orion Chip (Sniper)**: Applies massive weight bonuses to enemies with the lowest Torso Firewall (Armor). Mathematically eliminates the weakest link.
- **Spark Chip (Aggressive)**: Applies massive weight bonuses to enemies equipping heavy, high-damage Payloads. Targets high-threat offensive pieces.
- **Phalanx Chip (Defender)**: Prioritizes enemies actively targeting vulnerable allies, generating natural defensive aggro.

### 2. Target Caching (Lock-On Timing)

Hardware type determines when target evaluation executes:

- **Precision Payloads (Sniper/Laser Arms)**: The targeting script runs the instant the AniBot concludes its Wait Phase. It securely caches the enemy ID in memory and sprints to the combat line to fire, regardless of changes occurring mid-run.
- **Scatter/Brawler Payloads (Shotguns/Swords)**: Target evaluation triggers only upon reaching the center line. If opposing units shift positions during transit, the AI re-evaluates the field state at the last second, allowing dynamic retargeting.

### 3. Track Exposure & Transit Penalties

The 3-Phase ATB State Machine directly affects vulnerability:
- Units at the starting line (Wait Phase) benefit from base cover.
- Units entering the Run or Cooldown phases are exposed in the center arena, receiving high targeting weight multipliers from enemy AI.
- Weapons with heavy Latency prolong the return transit, leaving the unit exposed as an easy target.

### 4. The Override Protocol (Defensive Interception)

Handlers can manually override autonomous AI targeting using specialized defensive hardware:
- Commanding an AniBot to activate a Shield/Guard part triggers a center-line sprint with an "Override" signal.
- The engine forcibly re-routes active enemy targeting vectors toward the guarding unit, protecting fragile teammates at the cost of the defender's Integrity.

---

## Hardware Degradation & Economy

The Hardware Degradation System introduces persistent wear-and-tear to hardware components, balancing tactical RPG battling with resource management.

### 1. The Salvage System (Post-Battle Loot)

Upon match victory, the Handler secures one random part from the defeated opponent:
- **Condition Preservation**: The looted part retains the condition percentage it held at the start of battle.
- **Break Penalty on Loot**: If the target part was reduced to 0 Integrity during the match, it incurs a condition drop (e.g., dropping from 90% to 80%) prior to inventory deposit.
- **Scrap Drops**: Winning matches additionally yields generic Scrap materials for crafting and repair.

### 2. Condition vs. Integrity

Hardware durability is split across two distinct layers:
- **Integrity (In-Battle HP)**: The transient operational health of a part during active combat (e.g., 50/50 HP).
- **Condition (Permanent Grade)**: The persistent physical state of the hardware, capped at 100%.
- **Scaling Formula**: Max in-battle Integrity scales linearly with Condition. A 100 HP base weapon at 85% Condition enters battle with 85 Max HP. At 0% Condition, the component is "Bricked" and cannot be equipped until fully repaired.

### 3. Destruction Penalty

Standard combat use does not degrade parts. Permanent condition degradation occurs only upon catastrophic part destruction (Integrity reaching 0 HP):
- Destroyed parts suffer a permanent -10% to -15% Condition penalty.
- This incentivizes tactical preservation (e.g., defensive intercepts to shield low-HP limbs).

### 4. The Dual-Tier Repair Economy

1. **Field-Patch Kits (Consumable)**: Portable field consumables used between matches for immediate restoration. Field patches are capped at **85% Condition**, preventing players from bypassing the workshop economy.
2. **The Workshop (Full Overhaul)**: Mechanical overhaul returning parts to pristine 100% Condition. Requires Scrap currency and a real-world timer (or in-game rest cycle), encouraging loadout rotation and spare-part experimentation.

---

## Scrap Synthesis & Closed-Loop Economy

Scrap Synthesis provides an accessible crafting and recycling pipeline that acts as a consistent resource sink:

### 1. Fabrication Phase

Handlers exchange accumulated Scrap (e.g., 50 units) plus a standard service fee at the Workshop fabrication unit to forge a random AniPart (spanning common bipedal legs to rare sniper optics).

### 2. The 40% "Test Drive"

Synthesized components initialize at **40% Condition**:
- The Handler can immediately equip and evaluate the part in battle, but at reduced Integrity.
- If the part is destroyed during field testing, standard break penalties apply, risking bricking the prototype.

### 3. Investment Branching

After field testing, the Handler chooses between two economic paths:
- **Path A (Restoration)**: Pay the Workshop premium fee and wait out the overhaul cycle to upgrade the part to 100% Condition.
- **Path B (Recycle)**: Dismantle unwanted or duplicate parts back into Scrap materials, sustaining the closed-loop economy.

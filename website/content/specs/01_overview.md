---
id: 01_overview
title: Game Design & Core Loop
subtitle: Tactical RPG Overview, Anima Chips, and Combat Pipeline
order: 1
---

## Game Overview & Technical Foundation

**AniBots** is an open-source tactical RPG built in **Godot 4.x**, featuring deeply customizable modular robots powered by autonomous AI cores known as **Anima Chips**. Players act as "Handlers," assembling hardware configurations, setting behavioral directives, and issuing tactical commands to semi-autonomous units.

> [!NOTE]
> - **Modular Parts & Mechanics**: See [Modular Parts Specification](/specs/03_modular_parts) for 5-slot anatomy and payload types.
> - **Technical Architecture & Engine**: See [Technical Architecture](/specs/02_game_architecture) for autoloads, scenes, and SQLite schemas.
> - **Anima Chips & Cores**: See [Anima Chips Specification](/specs/04_anima_chips) for core concepts and [AniDex Chips](/dex/chips/) for chip catalogs.
> - **World Lore & Quests**: See [Canon Lore](/lore/) for 3047 AD timeline, factions, and story arcs.
> - **Characters & Frames**: See [Characters Databank](/characters/) for cast profiles.

---

## 🛠 System Architecture Summary

The game utilizes a dual-database architecture powered by SQLite:
1. **The Catalog (Read-Only)**: Static base statistics for AniParts and Anima Chips. Allows instant balance patching without altering engine scripts.
2. **The Save Database (Writable)**: Dynamic player save state tracking part wear-and-tear degradation, inventory, and progression with ACID transactional safety.

For GDScript integration details, database drivers, and complete SQL table schemas, see [Technical Architecture](/specs/02_game_architecture).

---

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

---

## Starters & Tactical Archetypes

The classic 3-starter approach is the gold standard for RPG onboarding. It immediately teaches the player that their choice of Anima Chip affects both the personality of their companion and their foundational combat strategy:

### 1. The Antiquity Starter: The Control/Trap Playstyle
- **Anima Chip:** The Artificer Chip
- **Personality:** Analytical, methodical, and constantly trying to optimize the battlefield. It speaks in calculated, structured sentences and views combat as a system to be perfectly managed.
- **Default Frame (Genesis-1):**
  - **Head (Logic Bomb):** Places a trap on the center combat line. The next enemy to step on it takes massive damage.
  - **Left/Right Arms (Ratchet & Wrench):** Reliable, medium-damage melee tools with short Cooldown Phases.
  - **Legs (Steady-Tread):** Bipedal legs with high armor.
- **The Vibe:** For players who want to thoughtfully control the flow of battle and outsmart their opponents.

### 2. The Kinetic Starter: The Aggressive/Speed Playstyle
- **Anima Chip:** The Spark Chip
- **Personality:** Hyperactive, vibrating with electricity, and impatient. Complains when the Wait Phase takes too long.
- **Default Frame (Circuit-Breaker):**
  - **Head (Surge Node):** Fires a paralyzing blast that resets enemy Action Bars to zero if struck mid-run.
  - **Left/Right Arms (Volt-Caster & Static-Whip):** High-speed electrical attacks for close-range intercepts and chip damage.
  - **Legs (Current-Wheels):** Fast sprint speed with penalties on rough terrain.
- **The Vibe:** High risk, high reward aggressive interceptor.

### 3. The Astral Starter: The Precision/Sniper Playstyle
- **Anima Chip:** The Orion Chip
- **Personality:** Stoic, quiet, and intensely focused like a veteran hunter.
- **Default Frame (Nova-Seeker):**
  - **Head (Astro-Scope):** Calibrates sensors to guarantee a critical hit on the next attack.
  - **Left/Right Arms (Pulsar-Rifle & Comet-Snipe):** Devastating ranged weapons with high cooldown latency.
  - **Legs (Hover-Drive):** Anti-gravity boosters ignoring terrain penalties.
- **The Vibe:** Elegant and deadly long-range executioner.

---

## Targeting & Autonomous Utility AI

Keeping AniBots semi-autonomous reinforces the Handler fantasy: commanding a living AI rather than micromanaging every turn via traditional menu clicks. Because the robot evaluates targets autonomously, the choice of Anima Chip is just as consequential as the physical weaponry equipped.

Target selection operates via a **Weighted Scoring System (Utility AI)**. When a command is dispatched, the engine calculates a numerical "threat score" for every opposing unit, and the AniBot executes against the highest-scoring target.

### 1. The Anima Chip Priority Matrix (Aim Directives)
- **Orion Chip (Sniper)**: Applies massive weight bonuses to enemies with the lowest Torso Firewall (Armor). Mathematically eliminates the weakest link.
- **Spark Chip (Aggressive)**: Applies massive weight bonuses to enemies equipping heavy, high-damage Payloads. Targets high-threat offensive pieces.
- **Phalanx Chip (Defender)**: Prioritizes enemies actively targeting vulnerable allies, generating natural defensive aggro.

### 2. Target Caching (Lock-On Timing)
- **Precision Payloads (Sniper/Laser Arms)**: The targeting script runs the instant the AniBot concludes its Wait Phase. It securely caches the enemy ID in memory and sprints to the combat line to fire, regardless of changes occurring mid-run.
- **Scatter/Brawler Payloads (Shotguns/Swords)**: Target evaluation triggers only upon reaching the center line. If opposing units shift positions during transit, the AI re-evaluates the field state at the last second, allowing dynamic retargeting.

### 3. Track Exposure & Transit Penalties
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
- **Scaling Formula**: Max in-battle Integrity scales linearly with Condition. A 100 HP base weapon at 85% Condition enters battle with 85 Max HP. At 0% Condition, the component is "Bricked" and cannot be equipped until fully repaired:

```gdscript
func calculate_battle_integrity(base_integrity: int, condition_percent: float) -> int:
    if condition_percent <= 0.0:
        return 0  # Bricked: Cannot be equipped
    return int(round(base_integrity * (condition_percent / 100.0)))
```

### 3. Destruction Penalty
Standard combat use does not degrade parts. Permanent condition degradation occurs only upon catastrophic part destruction (Integrity reaching 0 HP):
- Destroyed parts suffer a permanent -10% to -15% Condition penalty.
- This incentivizes tactical preservation (e.g., defensive intercepts to shield low-HP limbs).

### 4. The Dual-Tier Repair Economy
1. **Field-Patch Kits (Consumable)**: Portable field consumables used between matches for immediate restoration. Field patches are capped at **85% Condition**, preventing players from bypassing the workshop economy.
2. **The Workshop (Full Overhaul)**: Mechanical overhaul returning parts to pristine 100% Condition. Requires Scrap currency and a real-world timer (or in-game rest cycle), encouraging loadout rotation and spare-part experimentation.

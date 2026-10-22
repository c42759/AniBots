---
id: 06_walkthrough
title: Implementation & Testing Walkthrough
subtitle: Stage-by-Stage Feature Verification, 3D Garage, and Battle Testing
order: 6
---

## Implementation & Testing Walkthrough

Welcome to the **AniBots** Godot 4.x tactical RPG implementation guide.

> [!NOTE]
> - **Game Design & Formulas**: See [Game Design & Core Loop](/specs/01_overview).
> - **Architecture & Singletons**: See [Technical Architecture](/specs/02_game_architecture).
> - **Modular Parts**: See [Modular Parts Specification](/specs/03_modular_parts).
> - **Anima Chips**: See [Anima Chips Specification](/specs/04_anima_chips).

---

## 🚀 How to Open & Test in Godot Engine

1. Launch **Godot Engine 4.x** (GL Compatibility supported).
2. In the **Godot Project Manager**, click **Import**.
3. Navigate to repository path `/src` and select `project.godot`.
4. Click **Import & Edit**, then press **F5** (Run Project).

---

## 🎮 Stage-by-Stage Feature Verification Checklist

### 1. Main Menu, 5-Slot Save System & Audio Settings
- **Scenes**: `MainMenu.tscn`, `SaveSlotSelector.tscn`, `SettingsMenu.tscn`
- **What to Test**:
  - Click **Settings** to adjust Master, Music, and SFX sliders (persisted to `user://settings.cfg`).
  - Click **New Game** and select any of the **5 ACID Save Slots** (`user://saves/slot_1.json` .. `slot_5.json`).

### 2. Chibi Handler Customizer & Starter Anima Chip Selection
- **Scene**: `CharacterCustomizer.tscn` / `CharacterCustomizer.gd`
- **What to Test**:
  - Customize Handler name (defaults to **Kura Ato**), Hair Style (5 styles), Hair/Skin/Shirt/Bottom/Shoe colors on the live 3D chibi model.
  - Cycle Starter Anima Chips:
    - **Vulpes Zerda (`G0-004`) — Zerdata**: Ancient Series Acoustic Scout (+30% Evasion & Echo Counter).
    - **Artificer Chip — Genesis-1**: Antiquity Series Trapper (`Logic Bomb` center-line mine).
    - **Spark Chip — Circuit-Breaker**: Kinetic Series Speedster (`Current-Wheels` & `Surge Node`).
    - **Orion Chip — Nova-Seeker**: Astral Series Marksman (`Astro-Scope` 100% Crit lock & `Comet Cannon`).

### 3. 3D Top-Down Overworld (`StarterCity`) & Ato Family Workshop (`WorkshopInterior`)
- **Scenes**: `StarterCity.tscn`, `WorkshopInterior.tscn`
- **Controls**:
  - `WASD` / `Arrow Keys`: 8-directional 3D planar movement.
  - `E` / `Space`: Interact with NPCs and Workshop doors.
  - `Tab` / `I`: Open **Medabots-Style 3D Garage (`AnibotAssembly`)**.
  - `F5`: Quick-save current position and state.

### 4. Medabots-Style 3D Assembly & Part Swapping (Garage)
- **Scene**: `AnibotAssembly.tscn` / `AnibotAssembly.gd`
- **What to Test**:
  - Press `Tab` or click the HUD **AniBots** button.
  - Select active AniBot.
  - Click any modular slot (**Head**, **Torso**, **Left Arm**, **Right Arm**, **Legs**).
  - Verify right panel automatically filters inventory to only display compatible spare parts.
  - Select an inventory part to review delta previews (Integrity, Payload, Latency, Weight).
  - Click **Equip** to swap parts. Old part returns to inventory, new part equips to bot, and changes save automatically.

### 5. 3v3 Speed-Dependent Combat Arena (`BattleArena`)
- **Scene**: `BattleArena.tscn`
- **What to Test**:
  - Speak with Sparring Coordinator **Bolt** in the southeast sparring ring.
  - Select *"Let's battle!"* to launch the 3v3 speed-dependent relay arena.
  - Watch the Action Bar fill based on Leg Clock Speed during the `WAIT` phase.
  - Select target bot, target limb, and weapon attack during the `COMMAND` phase.
  - Observe sprint velocity to the center line. Fastest robot reaching center strikes first with 2.5D dynamic camera cut-in.
  - Destroy enemy Leader's Head part to trigger victory, earning Scrap and salvageable part drops.

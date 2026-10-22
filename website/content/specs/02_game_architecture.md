---
id: 02_game_architecture
title: Technical Architecture & Engine Specs
subtitle: Godot 4.x Foundation, Autoloads, Event Bus, and SQLite Persistence
order: 2
---

## 1. Project Overview & Technical Foundation

- **Engine:** Godot Engine 4.x (GL Compatibility / Mobile / Desktop target)
- **Primary Language:** GDScript 2.0 (Strict typing enabled)
- **Architecture Pattern:** Composition over Inheritance, Event Bus Signal decoupling, Autoload Singletons
- **Game Presentation & Perspectives:**
  - **Out of Battle (Overworld):** 3D top-down role-playing game (RPG) featuring stylized 3D environments, free 8-way movement, and fixed-pitch overhead/isometric `Camera3D` tracking.
  - **In Battle (Combat Arena):** Turn-based, speed-dependent tactical battles controlling a team of up to three AniBots. Action order is determined dynamically by how fast an AniBot sprints from its base line to the battlefield center line.
  - **Attack Execution Camera:** Seamlessly transitions into a dynamic 2.5D presentation with 3D elements (3D chassis models, volumetric lighting, particle FX, and camera punch).
- **Data Persistence:** Dual SQLite Database (`godot-sqlite` plugin / GDExtension / JSON ACID driver fallback)
  - `user://settings.cfg` or `user://global_settings.db`: Global configuration (audio volumes, display settings)
  - `user://saves/slot_{1..5}.db` (or `slot_{1..5}.json`): 5 isolated, ACID-compliant SQLite player save slots

```text
res://
├── assets/
│   ├── audio/
│   │   ├── music/
│   │   └── sfx/
│   ├── sprites/
│   ├── models/
│   │   ├── characters/
│   │   └── anibots/
│   └── shaders/
├── src/
│   ├── autoload/
│   │   ├── GameManager.gd
│   │   ├── SaveManager.gd
│   │   ├── AudioManager.gd
│   │   └── SceneRouter.gd
│   ├── core/
│   │   ├── DatabaseService.gd
│   │   ├── Types.gd
│   │   └── SignalBus.gd
│   ├── scenes/
│   │   ├── ui/
│   │   │   ├── MainMenu.tscn
│   │   │   ├── SaveSlotSelector.tscn
│   │   │   ├── SettingsMenu.tscn
│   │   │   ├── CharacterCustomizer.tscn
│   │   │   ├── DialogueBox.tscn
│   │   │   └── AnibotAssembly.tscn          # <-- AniBot & Part Swapping Garage
│   │   ├── overworld/
│   │   │   ├── StarterCity.tscn
│   │   │   ├── Player3D.tscn
│   │   │   └── npc/
│   │   └── combat/
│   │       ├── BattleArena.tscn             # 2.5D / 3D Hybrid Relay Arena
│   │       ├── CombatUnit.tscn
│   │       └── CombatUI.tscn
└── project.godot
```

---

## 2. Core Singletons & Architecture

### 2.1 Autoload List (`project.godot`)

1. `SignalBus` (`res://src/core/SignalBus.gd`): Global decoupled event broker.
2. `AudioManager` (`res://src/autoload/AudioManager.gd`): Audio buses, volume interpolation, SFX pooling.
3. `SaveManager` (`res://src/autoload/SaveManager.gd`): Multi-slot save/load pipeline and inventory manager.
4. `GameManager` (`res://src/autoload/GameManager.gd`): Game state coordinator (Menu, Overworld, Assembly, Battle).
5. `SceneRouter` (`res://src/autoload/SceneRouter.gd`): Scene transitions with screen fade.

### 2.2 Global Event Bus (`SignalBus.gd`)

```gdscript
extends Node

# Audio Signals
signal volume_changed(bus_name: String, volume_linear: float)
signal play_sfx_requested(sfx_name: String)

# Save / Load Signals
signal save_created(slot_index: int)
signal save_loaded(slot_index: int)
signal save_deleted(slot_index: int)
signal game_saved()

# Character Customization Signals
signal character_appearance_changed(appearance_data: Dictionary)

# Overworld & Interaction Signals
signal player_moved(position: Vector2)
signal interaction_triggered(npc_node: Node)
signal dialogue_requested(dialogue_data: Dictionary)
signal dialogue_choice_selected(choice_index: int)
signal dialogue_finished()

# AniBot & Part Assembly Signals
signal anibot_assembly_opened()
signal anibot_part_swapped(bot_id: String, slot: int, new_part_id: String)
signal anibot_assembly_closed()

# Battle Signals
signal combat_started(player_team: Array, enemy_team: Array, battle_context: Dictionary)
signal combat_phase_changed(unit_id: String, phase: int)
signal combat_action_executed(attacker_id: String, target_id: String, part_used: Dictionary, damage_dealt: int)
signal combat_ended(player_won: bool, rewards: Dictionary)
```

---

## 3. Start Menu & System Settings

- **5-Slot Save System (`SaveManager.gd`)**: Tracks active slot index (`current_slot_id: int` from `1` to `5`). Save files stored at `user://saves/slot_1.json` through `user://saves/slot_5.json` (or SQLite `slot_X.db`).
- Save slot metadata preview displays: Player Name, Starter Chip, Playtime (`HH:MM`), Last Saved timestamp, Credits, and Scrap.
- **Audio Settings System (`AudioManager.gd`)**: Audio buses (`Master`, `Music`, `SFX`) with linear-to-decibel scaling and procedural fallback sounds.

---

## 4. Character Customization System

- **Chibi Proportions**: Large rounded chibi head, expressive vertical anime eyes, and compact torso.
- **Customization Categories**:
  - **Hair Style**: Spiky Punk, Side Part, Ponytail, Buzz Cut, Messy Anime.
  - **Hair & Skin Colors**: Midnight Black, Chestnut Brown, Golden Blonde, Crimson Red, Neon Cyan, Electric Purple, Silver Ash.
  - **Wardrobe**: Shirts, shorts/jeans, sneakers/boots.

---

## 5. Starter City & 3D Top-Down Overworld

- **Camera & Perspective**: 3D top-down view with fixed overhead/isometric angle (`Camera3D` pitched at ~45-55 degrees) and spring-arm damping.
- **Navigation**: 3D planar top-down navigation (`Vector3.X` and `Vector3.Z`) with analog/8-directional input vector normalization, acceleration, and deceleration.
- **Forward Probe**: `RayCast3D` projecting forward along facing vector (1.8m reach) detecting interactable NPCs, doors, and inspection points.

---

## 6. 3v3 Speed-Dependent Battle Arena

- **Relay Track Structure**: Player Base Line (Spawn positions 1, 2, 3) ↔ **Center Action Line** ↔ Enemy Base Line (Spawn positions 1, 2, 3).
- **Turn Order by Center Race**: Action order is determined dynamically by how fast an AniBot runs to the center line.
- **Phase Loop per Bot**:
  1. `WAIT / CHARGE`: Leg part clock speed fills action threshold.
  2. `COMMAND SELECTION`: Handler selects target bot, part to target, and weapon payload.
  3. `SPRINT TO CENTER`: AniBot sprints across relay track. Fastest bot reaching center strikes first.
  4. `EXECUTION (2.5D with 3D Elements)`: Dynamic 2.5D side/isometric battle shot framed on colliding bots with particle FX and camera punch.
  5. `RETURN & COOLDOWN`: AniBot returns to base line with latency cooldown governed by Torso cooling and weight.
- **Win Conditions**:
  - Eliminate enemy Leader AniBot's Head (System Failure).
  - Or dismantle all active enemy AniBots on the field.

---

## 7. AniBot Assembly & Part Inventory System (Garage UI)

Modeled after classic modular assembly mechanics: players inspect AniBots, review slot stats, and replace parts from inventory.

1. **Slot-Filtered Inventory**: Clicking [Left Arm] slot automatically filters inventory to show only available Left Arm parts.
2. **Stat Comparison Preview**: Displays delta previews for Integrity, Payload, Latency, and Weight.
3. **Torso Max Loadout Validation**:
```gdscript
var total_weight: int = head_part.weight + left_arm_part.weight + right_arm_part.weight
if total_weight > torso_part.max_loadout:
    apply_overweight_penalty()  # Cooldown latency penalized by +50%
```
4. **Chip Affinity Indicator**: Lights up with a +10% stat boost when equipped parts match Anima Chip affinity.

---

## 8. Complete Database & Save Schema (`slot_X.db`)

```sql
-- 1. Save Slot Metadata
CREATE TABLE IF NOT EXISTS save_metadata (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    player_name TEXT NOT NULL DEFAULT 'Handler',
    playtime_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    starter_chip TEXT NOT NULL,
    location_name TEXT NOT NULL DEFAULT 'Circuit City - Sector 0',
    pos_x REAL DEFAULT 600.0,
    pos_y REAL DEFAULT 410.0
);

-- 2. Character Customization Cosmetics
CREATE TABLE IF NOT EXISTS player_customization (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    hair_style TEXT NOT NULL DEFAULT 'hair_01',
    hair_color TEXT NOT NULL DEFAULT '#1A1A1A',
    skin_color TEXT NOT NULL DEFAULT '#F0D5BE',
    shirt_style TEXT NOT NULL DEFAULT 'shirt_tshirt',
    shirt_color TEXT NOT NULL DEFAULT '#1976D2',
    bottom_style TEXT NOT NULL DEFAULT 'bottom_shorts',
    bottom_color TEXT NOT NULL DEFAULT '#37474F',
    shoe_style TEXT NOT NULL DEFAULT 'shoes_sneakers',
    shoe_color TEXT NOT NULL DEFAULT '#FAFAFA'
);

-- 3. Economy & Scrap
CREATE TABLE IF NOT EXISTS player_economy (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    credits INTEGER DEFAULT 500,
    scrap INTEGER DEFAULT 25,
    patch_kits INTEGER DEFAULT 2
);

-- 4. Modular AniParts Inventory (Owned spare parts)
CREATE TABLE IF NOT EXISTS part_inventory (
    item_uuid TEXT PRIMARY KEY,
    part_id TEXT NOT NULL,             -- References Types.PARTS_CATALOG
    slot_type INTEGER NOT NULL,        -- 0: HEAD, 1: TORSO, 2: LEFT_ARM, 3: RIGHT_ARM, 4: LEGS
    condition_percent REAL DEFAULT 100.0, -- Persistent wear & tear (0 to 100)
    current_cache INTEGER DEFAULT -1,  -- Remaining head uses
    is_equipped INTEGER DEFAULT 0,     -- 1 if slotted on an Anibot, 0 if in inventory bag
    equipped_to_bot_id TEXT DEFAULT ''
);

-- 5. Anima Chips Inventory
CREATE TABLE IF NOT EXISTS chip_inventory (
    chip_uuid TEXT PRIMARY KEY,
    chip_id TEXT NOT NULL,             -- References Types.CHIPS_CATALOG
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    is_equipped INTEGER DEFAULT 0,
    equipped_to_bot_id TEXT DEFAULT ''
);

-- 6. Assembled AniBots Roster
CREATE TABLE IF NOT EXISTS assembled_anibots (
    bot_id TEXT PRIMARY KEY,
    bot_name TEXT NOT NULL,
    chip_uuid TEXT,
    head_part_uuid TEXT,
    torso_part_uuid TEXT,
    left_arm_uuid TEXT,
    right_arm_uuid TEXT,
    legs_part_uuid TEXT,
    is_active_in_battle INTEGER DEFAULT 1,
    FOREIGN KEY(chip_uuid) REFERENCES chip_inventory(chip_uuid),
    FOREIGN KEY(head_part_uuid) REFERENCES part_inventory(item_uuid),
    FOREIGN KEY(torso_part_uuid) REFERENCES part_inventory(item_uuid),
    FOREIGN KEY(left_arm_uuid) REFERENCES part_inventory(item_uuid),
    FOREIGN KEY(right_arm_uuid) REFERENCES part_inventory(item_uuid),
    FOREIGN KEY(legs_part_uuid) REFERENCES part_inventory(item_uuid)
);
```

---

## 9. Implementation Roadmap

### Phase 1: Core Foundation & UI Frame [COMPLETED]
- [x] Configure `project.godot` (Input maps, autoloads, screen resolution).
- [x] Configure Audio Buses (`Master`, `Music`, `SFX`) in `default_bus_layout.tres`.
- [x] Implement singletons: `SignalBus.gd`, `AudioManager.gd`, `SaveManager.gd`, `GameManager.gd`, `SceneRouter.gd`.
- [x] Implement `MainMenu.tscn`, `SaveSlotSelector.tscn` (5 slots), and `SettingsMenu.tscn`.

### Phase 2: Character Customizer Pipeline [COMPLETED]
- [x] Create procedural composite avatar renderer `CompositeCharacter.gd`.
- [x] Implement `CharacterCustomizer.tscn` with interactive palette swatches and live preview.
- [x] Wire save logic to store customizer dictionary into active save slot.

### Phase 3: Starter City & Sparring NPC [COMPLETED]
- [x] Create 2D map `StarterCity.tscn` (roads, buildings, plaza, sparring ring, boundary walls).
- [x] Implement `Player.tscn` with 8-direction movement and interaction probe.
- [x] Implement `SparringNPC.tscn` with proximity prompt bubble and dialogue choices.

### Phase 4: 3-Phase ATB Combat Prototype [COMPLETED]
- [x] Implement `CombatUnit.tscn` with 3-Phase ATB relay state machine (`WAIT`, `COMMAND`, `RUN`, `COOLDOWN`).
- [x] Implement `CombatUI.tscn` with action command menu, part HP bars, and combat announcer.
- [x] Implement `BattleArena.tscn` sparring battle against training drone with victory scrap rewards.

### Phase 5: AniBot Assembly & Part Swapping (Garage UI) [COMPLETED]
- [x] Implement `AnibotAssembly.tscn` & `AnibotAssembly.gd` (HUD garage modal).
- [x] Bind Overworld HUD "AniBots" button and `Tab` / `I` keyboard shortcuts.
- [x] Implement slot-filtered inventory part selection and stat comparison card.
- [x] Implement part swap transactions (unequip → inventory, equip → bot) and save sync.

### Phase 6: Workshop Interior & Parts Shopkeeper NPC [COMPLETED]
- [x] Create `WorkshopInterior.tscn` (chibi lab map with workbenches, Anibot pod, and exit door warp).
- [x] Implement `ShopkeeperNPC.tscn` ("Clara - Master Artificer" with shop & repair dialogues).
- [x] Implement `PartsShop.tscn` & `PartsShop.gd` (slot filter, part stat inspect, buy with Credits, repair all with Scrap).
- [x] Implement door entry warp between `StarterCity` and `WorkshopInterior`.
- [x] Add economy transaction methods in `SaveManager.gd` (`deduct_credits`, `purchase_part`, `repair_all_parts`).


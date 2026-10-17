# AniBots - Game Implementation Plan & Architecture Specification (`GAME.md`)

> [!NOTE]
> - **Game Design & Formulas**: See [OVERVIEW.md](./OVERVIEW.md) for core combat loop, utility AI targeting, and degradation math.
> - **Modular Parts & Types**: See [PARTS.md](./PARTS.md) for full 5-slot anatomy, 5 payload types, 4 torso architectures, and 6 mobility protocols.
> - **Anima Chips Catalog**: See [CHIPS.md](./CHIPS.md) for all 36 mass-market AI cores and traits.
> - **Characters & Frames**: See [CHARACTERS.md](./CHARACTERS.md) for Zerdata chassis anatomy and the 10 Ancient Cores.
> - **Project Portal**: See [README.md](./README.md) for engine setup and the complete documentation directory.

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
│   │   ├── character/
│   │   ├── environment/
│   │   ├── anibots/
│   │   └── ui/
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
│   │   │   ├── CompositeCharacter3D.gd
│   │   │   └── npc/
│   │   │       ├── NPCBase3D.tscn
│   │   │       └── SparringNPC3D.tscn
│   │   └── combat/
│   │       ├── BattleArena.tscn         # 2.5D / 3D Hybrid Relay Arena
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

### 3.1 Flow & State Diagram

```mermaid
graph TD
    A[Start Menu: MainMenu.tscn] --> B[New Game]
    A --> C[Continue Game]
    A --> D[Settings]
    
    B --> E[Save Slot Selector - Mode: NEW]
    E -->|Select Slot 1..5| F[Character Customizer]
    F --> G[Starter City Map]
    
    C --> H[Save Slot Selector - Mode: LOAD]
    H -->|Select Active Slot 1..5| I[Load Save DB -> Starter City Map]
    
    D --> J[Settings Modal: Music & SFX Sliders]
    J -->|Save Settings| A
```

### 3.2 5-Slot Save System (`SaveManager.gd`)

- Tracks active slot index (`current_slot_id: int` from `1` to `5`).
- Save files stored at `user://saves/slot_1.json` through `user://saves/slot_5.json` (or SQLite `slot_X.db`).
- Save slot metadata preview displays: Player Name, Starter Chip, Playtime (`HH:MM`), Last Saved timestamp, Credits, and Scrap.

### 3.3 Audio Settings System (`AudioManager.gd` & `SettingsMenu.tscn`)

- Godot Audio Bus Layout:
  - Bus 0: `Master`
  - Bus 1: `Music` (routed to Master)
  - Bus 2: `SFX` (routed to Master)
- Linear (0.0 to 1.0) to Decibel conversion: `linear_to_db(value)` with mute floor below `0.01` (`-80.0 dB`).
- Real-time procedural tone/synthesis fallback for UI clicks, attacks, lasers, and explosions.

---

## 4. Character Customization System

### 4.1 Customization Categories & Options

1. **Hair Style:** `hair_01` (Spiky Punk), `hair_02` (Side Part), `hair_03` (Ponytail), `hair_04` (Buzz Cut), `hair_05` (Messy Anime).
2. **Hair Color:** 7 rich palette swatches (Midnight Black `#1A1A1A`, Chestnut Brown `#5D4037`, Golden Blonde `#FBC02D`, Crimson Red `#D32F2F`, Neon Cyan `#00BCD4`, Electric Purple `#7B1FA2`, Silver Ash `#CFD8DC`).
3. **Skin Color:** 6 tone swatches (Fair `#FFDFC4`, Peach `#F0D5BE`, Warm Sand `#E0AC69`, Bronze `#C68642`, Deep Mocha `#8D5524`, Espresso `#3D2314`).
4. **Shirt:** Styles (`shirt_tshirt`, `shirt_jacket`, `shirt_hoodie`) + Color swatches.
5. **Shorts / Bottoms:** Styles (`bottom_shorts`, `bottom_cargo`, `bottom_jeans`) + Color swatches.
6. **Shoes:** Styles (`shoes_sneakers`, `shoes_boots`, `shoes_sandals`) + Color swatches.

### 4.2 Composite Layered Sprite Architecture (`CompositeCharacter.gd`)

**Chibi Aesthetic (Pokémon Brilliant Diamond / BDSP Inspired)**:

- **Proportions:** Large rounded chibi head (1:1.5 ratio with body), chubby cheeks with soft blush, and compact torso.
- **Expressive Eyes:** Big anime vertical oval eyes with iris gradient and dual white shine sparkles.
- **Dynamic Chibi Walk Cycle:** Bouncy step oscillations (`sin(walk_time)`), leg swing, chubby arm swing, and scaling drop shadow.
- **Hair Highlights:** Volumetric polygon highlights and shines across all 5 hairstyles.

---

## 5. Starter City (Overworld)

### 5.1 Visual Environment Design (3D Top-Down RPG)

- **Perspective & Camera:** 3D top-down RPG view. Fixed overhead/isometric angle (`Camera3D` pitched at ~45-55 degrees, orthographic or subtle perspective FOV) following the player with smooth spring-arm damping.
- **Ground & Pathways:** Saturated emerald green terrain mesh with checkerboard tile accents, cobblestone street geometry, and central circular plaza with 3D animated water fountain.
- **Nature & Props:** Stylized 3D low-poly cartoon trees, flower clusters, benches, streetlamps with volumetric light cones, and dynamic soft shadow casting.
- **Architecture:** Modular 3D workshop structures with pitched roofs, glowing neon signage, and physical entry trigger colliders.
- **Sparring Ring:** Southeast elevated arena platform with illuminated corner pylons for initiating 3v3 exhibition matches.

### 5.2 Scene Tree & World Hierarchy (`StarterCity.tscn` - 3D)

```text
StarterCity (Node3D)
├── WorldEnvironment (Stylized lighting, sky, ambient occlusion, glow)
├── DirectionalLight3D (Sunlight with soft shadow maps)
├── LevelGeometry (StaticBody3D terrain, roads, fences, plaza fountain)
├── WorkshopBuilding (StaticBody3D structure with DoorWarp Area3D trigger)
├── Entities (Node3D)
│   ├── SparringNPC (CharacterBody3D / Sparring Coordinator "Bolt")
│   └── Player (CharacterBody3D with Camera3D SpringArm rig & RayCast3D probe)
└── HUD (CanvasLayer)
    ├── TopBar (Location Badge, Active Bot Name, Scrap & Credits Counter)
    ├── BotButton ("[TAB] AniBots / Garage")
    ├── MenuButton ("Pause / Save")
    ├── DialogueBox (DialogueUI instance)
    ├── AnibotAssembly (Assembly & Part Swap UI)
    └── PauseModal (Pause & Return to Menu)
```

### 5.3 3D Top-Down Player Controller (`Player.gd`)

- **Movement:** 3D planar top-down navigation (`Vector3.X` and `Vector3.Z`) with analog/8-directional input vector normalization, acceleration, and deceleration friction.
- **Model Orientation:** Smooth model yaw rotation facing velocity vector (`transform.basis`).
- **Interaction Probe:** `RayCast3D` projecting forward along facing vector (1.8m reach) detecting interactable NPCs, doors, and inspection points.
- **Control Lock:** Automatically freezes velocity and animations during dialogues, garage assembly modals, or scene transitions.

---

## 6. Combat Test NPC & Arena Integration

### 6.1 Sparring NPC Setup (`SparringNPC.tscn`)

- **NPC:** "Bolt" (Sparring Coordinator).
- **Proximity:** When player approaches, displays animated `[E] Talk` prompt bubble.
- **Input:** Pressing `E` or `Space` in range opens branching dialogue:
  1. *Let's battle!* → Launches 3v3 speed-dependent relay arena battle against rival team.
  2. *Explain combat rules.* → Explains 3v3 team setup, center-line sprint speed ordering, 2.5D/3D attack execution, and Head destruction win condition.
  3. *Maybe later.* → Closes dialogue.

### 6.2 3v3 Speed-Dependent Battle Arena (`BattleArena.tscn`)

- **Team Size:** Players control a team of up to **three AniBots** deployed simultaneously on the field against an opposing squad of up to three enemy bots.
- **Turn-Based Speed-Dependent Relay Battlefield:**
  - **Field Layout:** Player Base Line (Spawn positions 1, 2, 3) ↔ **Center Action Line** ↔ Enemy Base Line (Spawn positions 1, 2, 3).
  - **Action Order by Center-Line Race:** Action order is determined dynamically by how fast an AniBot can run to the center line of the battlefield.
  - **Phase Loop per Bot:**
    1. `WAIT / CHARGE`: Leg part clock speed and mobility class fill the unit's action threshold.
    2. `COMMAND SELECTION`: When ready, command input pauses for player decision: choose target enemy bot, part to target, and weapon payload (Head cache, Left Arm, Right Arm, or Core Ability).
    3. `SPRINT TO CENTER`: AniBot dashes across relay track toward the center combat line. Running speed is calculated from `Legs.clock_speed`, equipped weight loadout penalty, and terrain affinity. The fastest bot reaching the center executes first.
    4. `EXECUTION (2.5D with 3D Elements)`: Upon reaching the center line, combat view switches to an immersive 2.5D perspective:
       - **Camera:** Dynamic 2.5D side/isometric battle shot framed on the colliding bots.
       - **3D Elements:** Fully 3D AniBot modular frames, weapon animations (blaster muzzle blasts, laser beams, hammer strikes), dynamic hit reactions, shield sparks, and volumetric particle effects.
       - **Damage & Part Targeting:** Payload calculated with firewall defense mitigation; damage applied directly to targeted enemy part (Head, Torso, Left Arm, Right Arm, Legs).
    5. `RETURN & COOLDOWN`: AniBot runs back to its base line with latency cooldown governed by Torso heat dissipation, weapon weight, and fatigue.
- **Win Conditions:**
  - **Team Leader Elimination:** Destroying the enemy Leader AniBot's Head (System Failure) scores an immediate match victory.
  - **Full Team Wipeout:** Alternatively, dismantling all active enemy AniBots on the field.
  - **Match Rewards:** Yields Credits, Scrap, and salvageable AniPart drops.

### 6.3 Combat Camera & Perspective Pipeline
- **Track Overview:** 2.5D fixed lateral perspective showing all 6 relay lanes (3 Player vs 3 Enemy) and the center line.
- **Attack Execution Cut-In:** Seamless camera transition into a dramatic 2.5D presentation with 3D elements when an AniBot reaches the center line to strike, with split-second impact freeze, screen shake, and part damage readouts.

---

## 7. AniBot Assembly & Part Inventory System (Garage UI)

> [!IMPORTANT]
> Modeled directly after the classic **Medabots (Metabee Version)** assembly mechanics: players can inspect their AniBots, view slot stats, and replace individual parts with spare parts from their inventory.

```mermaid
graph TD
    A[Overworld HUD: Press Bot Button / TAB / I] --> B[AniBot Assembly UI: AnibotAssembly.tscn]
    B --> C[Select AniBot from Roster]
    C --> D[Select Slot: Head, Torso, Left Arm, Right Arm, Legs]
    D --> E[Part Swap Browser: Filtered Inventory List]
    E --> F[Stat Comparison Preview: Equipped vs Selected]
    F -->|Confirm Swap| G[Update AniBot Loadout in Save Data & SQLite]
    G --> B
```

### 7.1 HUD Access & Shortcuts

- **Overworld HUD Button:** Top bar features an **"AniBots / Garage"** button.
- **Keyboard Shortcuts:** Pressing `Tab` or `I` toggles the Anibot Assembly modal.
- **Game Freeze:** Opening the assembly modal safely pauses player overworld movement.

### 7.2 Assembly Scene Hierarchy (`AnibotAssembly.tscn`)

```text
AnibotAssembly (Control - CanvasLayer)
├── DimBackground (ColorRect)
└── CenterContainer
    └── AssemblyPanel (PanelContainer - 960x600)
        └── Margin
            └── HBoxContainer
                ├── LeftBotSummaryPanel (320px)
                │   ├── BotSelectorDropdown / OptionButton
                │   ├── BotVisualPreview (Node2D)
                │   ├── EquippedChipCard (Name, Series, Affinity, Level)
                │   └── TotalBotStats (Total Integrity, Total Weight, Max Loadout, Avg Latency)
                ├── CenterSlotsPanel (280px)
                │   ├── SlotCard_Head (Equipped Part, Condition %, Cache uses, [Swap] button)
                │   ├── SlotCard_Torso (Chassis, Firewall, Max Loadout, Cooling, [Swap] button)
                │   ├── SlotCard_LArm (Weapon Name, Payload, Latency, [Swap] button)
                │   ├── SlotCard_RArm (Weapon Name, Payload, Latency, [Swap] button)
                │   └── SlotCard_Legs (Leg Type, Clock Speed, Evasion %, [Swap] button)
                └── RightInventoryPanel (360px)
                    ├── SlotFilterTitle ("Available LEFT ARM Parts")
                    ├── InventoryScrollList (ScrollContainer with available spare parts)
                    │   └── PartItemCards (Name, Condition %, Stats, [Equip] button)
                    ├── StatComparisonDiffBox (Green/Red stat changes vs currently equipped)
                    └── CloseButton ("Close Garage")
```

### 7.3 Medabots-Style Part Swapping Rules & Mechanics

> [!TIP]
> For complete specifications of all 5 physical slots, 5 payload types, 4 torso architectures, and 6 mobility protocols with terrain formulas, consult **[PARTS.md](./PARTS.md)**.

1. **Slot-Filtered Inventory:**
   - When the player clicks on the **[Left Arm]** slot, the right-hand browser automatically filters to show only `LEFT_ARM` parts in the player's inventory that are not currently equipped on another AniBot.
2. **Stat Comparison Preview:**
   - Hovering or selecting an inventory part displays a side-by-side comparison:
     - **Δ Integrity:** `65 HP` → `55 HP` (`-10 HP`)
     - **Δ Payload:** `28 Power` → `38 Power` (`+10 Power`)
     - **Δ Latency:** `2.8s` → `4.8s` (`+2.0s cooldown`)
     - **Δ Weight:** `8` → `12` (`+4 load`)
3. **Torso Max Loadout Validation:**
   - Total equipped weight cannot exceed the equipped Torso's `max_loadout`:
   ```gdscript
   var total_weight: int = head_part.weight + left_arm_part.weight + right_arm_part.weight
   if total_weight > torso_part.max_loadout:
       apply_overweight_penalty()  # Cooldown latency penalized by +50%
   ```
   - If a swap exceeds bandwidth, a warning indicator displays: `"OVERWEIGHT: Cooldown latency penalized by 50%!"`
4. **Chip Affinity Indicator:**
   - If an equipped part matches the active Anima Chip's Affinity (e.g. `MELEE` part with `Artificer` or `SHOOTING` with `Orion`), a glowing **"AFFINITY MATCH (+10% Stat Bonus)"** badge lights up.
5. **Instant Unequip & Swap Transaction:**
   - Swapping a part immediately returns the old part to `inventory_parts` with its existing `condition_percent` preserved.
   - The new part is slotted into `active_anibot.parts[slot]` and marked `is_equipped = 1` in SQLite/Save state.

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
    part_id TEXT NOT NULL,             -- References Types.PARTS_CATALOG (e.g. part_arm_l_pulsar_rifle)
    slot_type INTEGER NOT NULL,        -- 0: HEAD, 1: TORSO, 2: LEFT_ARM, 3: RIGHT_ARM, 4: LEGS
    condition_percent REAL DEFAULT 100.0, -- Persistent wear & tear (0 to 100)
    current_cache INTEGER DEFAULT -1,  -- Remaining head uses
    is_equipped INTEGER DEFAULT 0,     -- 1 if slotted on an Anibot, 0 if in inventory bag
    equipped_to_bot_id TEXT DEFAULT ''
);

-- 5. Anima Chips Inventory
CREATE TABLE IF NOT EXISTS chip_inventory (
    chip_uuid TEXT PRIMARY KEY,
    chip_id TEXT NOT NULL,             -- References Types.CHIPS_CATALOG (e.g. chip_artificer)
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

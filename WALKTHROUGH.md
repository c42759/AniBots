# AniBots — Complete Implementation & Testing Walkthrough (`WALKTHROUGH.md`)

Welcome to the **AniBots** Godot 4.x tactical RPG implementation in `./src`.

---

## 🚀 How to Open & Test in Godot Engine

1. Launch **Godot Engine 4.x** (GL Compatibility supported).
2. In the **Godot Project Manager**, click **Import**.
3. Navigate to `/mnt/8TB/Git/Anibots/src` and select `project.godot`.
4. Click **Import & Edit**, then press **F5** (Run Project).

---

## 🎮 Stage-by-Stage Feature Verification Checklist

### 1. Main Menu, 5-Slot Save System & Audio Settings
- **Scenes**: [`MainMenu.tscn`](./src/src/scenes/ui/MainMenu.tscn), [`SaveSlotSelector.tscn`](./src/src/scenes/ui/SaveSlotSelector.tscn), [`SettingsMenu.tscn`](./src/src/scenes/ui/SettingsMenu.tscn)
- **What to Test**:
  - Click **Settings** to adjust Master, Music, and SFX sliders (persisted to `user://settings.cfg`).
  - Click **New Game** and select any of the **5 ACID Save Slots** (`user://saves/slot_1.json` .. `slot_5.json`).

### 2. Chibi Handler Customizer & Starter Anima Chip Selection
- **Scene**: [`CharacterCustomizer.tscn`](./src/src/scenes/ui/CharacterCustomizer.tscn) / [`CharacterCustomizer.gd`](./src/src/scenes/ui/CharacterCustomizer.gd)
- **What to Test**:
  - Customize Handler name (defaults to **Kura Ato**), Hair Style (5 styles), Hair/Skin/Shirt/Bottom/Shoe colors on the live 3D chibi model.
  - Cycle Starter Anima Chips:
    - **Vulpes Zerda (`G0-004`) — Zerdata**: Ancient Series Acoustic Scout (+30% Evasion & Echo Counter).
    - **Artificer Chip — Genesis-1**: Antiquity Series Trapper (`Logic Bomb` center-line mine).
    - **Spark Chip — Circuit-Breaker**: Kinetic Series Speedster (`Current-Wheels` & `Surge Node`).
    - **Orion Chip — Nova-Seeker**: Astral Series Marksman (`Astro-Scope` 100% Crit lock & `Comet Cannon`).

### 3. 3D Top-Down Overworld (`StarterCity`) & Ato Family Workshop (`WorkshopInterior`)
- **Scenes**: [`StarterCity.tscn`](./src/src/scenes/overworld/StarterCity.tscn), [`WorkshopInterior.tscn`](./src/src/scenes/overworld/WorkshopInterior.tscn)
- **Controls**:
  - `WASD` / `Arrow Keys`: 8-directional 3D planar movement.
  - `E` / `Space`: Interact with NPCs and Workshop doors.
  - `Tab` / `I`: Open **Medabots-Style 3D Garage (`AnibotAssembly`)**.
  - `F5`: Quick-save current position and state.
  - `Esc`: Open Pause / Save Modal.

### 4. Medabots-Style 3D Garage & Squad Assembly (`AnibotAssembly`)
- **Scene**: [`AnibotAssembly.tscn`](./src/src/scenes/ui/AnibotAssembly.tscn) / [`AnibotAssembly.gd`](./src/src/scenes/ui/AnibotAssembly.gd)
- **What to Test**:
  - **Squad Bot Switcher (`Squad Bot [1/3]`)**: Cycle between your Leader Bot and 2 Wingman Bots in your 3-bot squad roster.
  - **Swap Chip**: Cycle equipped Anima Chips and observe the **★ AFFINITY SYNERGY ACTIVE (+10% Stats)** badge when weapon types match Chip Affinity.
  - **3D NUA Model Preview**: Observe the rear pulsing **Anima Chip Diode** (colored by Chip Series) and **Zerdata's Acoustic Dish Radar Ears** (`CHARACTERS-DESIGN.md`).
  - **Torso Max Loadout Validation**: Equip heavy weapons exceeding Torso `max_loadout` to trigger the **OVERWEIGHT (+50% Cooldown Latency)** warning (`PARTS.md`).
  - **Field-Patch Kit (`Patch -> 85%`)**: Use a consumable Field-Patch Kit to restore battle-damaged parts up to the **85% Condition cap** (`OVERVIEW.md`).

### 5. Workshop Catalog, 100% Overhaul & 40% Scrap Synthesis (`PartsShop`)
- **Scene**: [`PartsShop.tscn`](./src/src/scenes/ui/PartsShop.tscn) / [`PartsShop.gd`](./src/src/scenes/ui/PartsShop.gd)
- **What to Test**:
  - Enter the Ato Workshop (northwest building in `StarterCity`) and talk to **Clara & Master Jax**.
  - **Browse 190 Canonical Parts**: Hydrated directly from `anibots.json` & `anima_chips.json`.
  - **Synthesize 40% Test-Drive Part (50 Scrap)**: Fabricates a random canonical AniPart initialized at **40% Condition ("Test Drive")**.
  - **Recycle Bag (+18 Scrap)**: Dismantle unwanted spare parts back into Scrap currency.
  - **Full Workshop Overhaul (5 Scrap/part)**: Restores all squad and spare parts to pristine **100% Condition**.

### 6. 3v3 Speed-Dependent Relay Battle Arena & 3D Clash Cut-Ins (`BattleArena`)
- **Scenes**: [`BattleArena.tscn`](./src/src/scenes/combat/BattleArena.tscn), [`CombatClash3D.tscn`](./src/src/scenes/combat/clash/CombatClash3D.tscn)
- **What to Test**:
  - Talk to **Bolt (Sparring Coordinator)** at the southeast Sparring Ring.
  - Choose **3v3 Squad Relay Battle vs Rival Luk Tirio**, **1v1 Duel vs Training Drone**, or **Cycle Arena Terrain** (`CITY`, `RUBBLE`, `MUD`, `FLOODED`, `ROCKY`).
  - Verify **Wait-Phase Cached Lock-On** (`SHOOTING` parts) vs. **Center-Line Dynamic Retargeting** (`MELEE` parts).
  - Deploy **Center-Line Traps** (`Logic Bomb`), **Support Scanners** (`Astro-Scope` / `Acoustic Dish Ears` for 100% Crit), **Defense Override Shields** (`Aegis Tower Shield`), and **Overclock Ultimates**.
  - On match end, inspect the **Battle Results Modal** for **Salvaged Enemy Part loot** and **Destruction Penalties (-10% to -15% permanent Condition on parts reduced to 0 HP)**.

### 7. 3D Environment Textures & Dynamic Arena Surfaces (`EnvironmentTextureService`)
- **Texture Directory**: [`src/assets/textures/environment/`](./src/assets/textures/environment/)
- **Service**: [`EnvironmentTextureService.gd`](./src/src/core/EnvironmentTextureService.gd)
- **What to Test**:
  - **Overworld (`StarterCity`)**: Inspect checkerboard eco-turf (`grass_eco_turf.png`), glowing-grout cobblestone roads (`road_cobblestone.png`), travertine fountain rim (`plaza_stone.png`), scrolling bioluminescent water (`fountain_water.png`), Ato Workshop stucco walls & solar-shingle roof (`workshop_wall_stucco.png`, `workshop_roof_solar.png`), 3D Eco-Trees, and the Southeast Sparring Ring platform with glowing corner pylons.
  - **Workshop Interior (`WorkshopInterior`)**: Inspect anti-static grid floor tiles (`workshop_floor_grid.png`), hazard-striped mechanic pegboard wall (`workshop_wall_tech.png`), and brushed steel/carbon workbench (`workbench_metal.png`).
  - **Dynamic 5-Terrain Combat Arena (`BattleArena` & `CombatClash3D`)**: Cycle the Arena Terrain with Bolt (`CITY`, `RUBBLE`, `MUD`, `FLOODED`, `ROCKY`) and start a match to see the arena floor and clash cutscene ground dynamically switch between `arena_city_asphalt.png`, `arena_rubble_junkyard.png`, `arena_mud_trench.png`, `arena_flooded_water.png`, and `arena_rocky_cliffs.png` alongside the glowing chevron `relay_track_tech.png` lane.

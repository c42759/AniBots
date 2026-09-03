# AniBots Modular Parts & Types Specification (`PARTS.md`)

Welcome to the canonical **AniBots Modular Parts & Types Specification**. In the AniBots universe, every robot frame is a modular assembly of five distinct physical components controlled by an [Anima Chip](./CHIPS.md) core.

Part types dictate core combat mechanics: targeting lock-on timing, relay transit speeds, damage formulas, defensive interception, and terrain friction.

> [!NOTE]
> - **Game Design & Combat Loop**: Detailed in [OVERVIEW.md](./OVERVIEW.md).
> - **Anima Chips & AI Cores**: Cataloged in [CHIPS.md](./CHIPS.md) and [CHARACTERS.md](./CHARACTERS.md#the-10-legendary-ancient-series-anichips-generation-0).
> - **Godot Architecture & Database Schema**: Implemented in [GAME.md](./GAME.md) and [`src/src/core/Types.gd`](./src/src/core/Types.gd).
> - **Interactive Parts Databank**: Explore 190 modular parts across 38 AniBots in the [AniDex Web App](./dex/README.md).
> - **Combat Design Roots**: Inspired by classic relay-line battlers documented in [INSPIRATION/README.md](./INSPIRATION/README.md).

---

## 🧭 Multi-Layer Parts Taxonomy

```text
AniParts Architecture:
├── 1. Physical Slots (PartSlot)
│   ├── HEAD       --> Tactical burst & utility | Finite Cache charges | 0 HP = System Failure (Win Condition)
│   ├── TORSO      --> Motherboard Chassis | Max Loadout, Firewall & Cooling | Passive structural core
│   ├── LEFT_ARM   --> Active Weapon/Utility | Infinite standard usage | Execution sprint & Latency return
│   ├── RIGHT_ARM  --> Active Weapon/Utility | Infinite standard usage | Execution sprint & Latency return
│   └── LEGS       --> Propulsion Platform | Clock Speed, Direct/Remote bonuses, Evasion & Protocol
│
├── 2. Action / Payload Types (AttackType)
│   ├── MELEE      --> Close-quarters strike | Dynamic retargeting at center line | Scaled by Direct Connect
│   ├── SHOOTING   --> Ballistic / Beam fire | Cached targeting at Wait completion | Scaled by Remote Uplink
│   ├── DEFENSE    --> Shields / Interceptors | Broadcasts Override Protocol to protect allies
│   ├── SUPPORT    --> Scanners / Buffs / Jamming | Sensory locks, guaranteed criticals, ATB acceleration
│   └── TRAP       --> Center-Line Mines | Deploys logic hazard triggering on enemy transit
│
├── 3. Torso Chassis Architectures
│   ├── Balanced Chassis      --> Uniform distribution of Firewall, Max Loadout, and Cooling
│   ├── Heavy Fortress        --> Extreme HP & Firewall armor, massive Loadout bandwidth, slower Cooling
│   ├── High-Cooling Speed    --> High heat dissipation (Cooling 2.0+), rapid weapon recovery, lighter armor
│   └── Precision Sniper      --> High weight tolerance for heavy cannons, calibrated for sniper optics
│
└── 4. Leg Mobility Protocols (Terrain Systems)
    ├── BIPEDAL    --> Balanced runner | Optimized for urban streets & concrete | Solid armor & direct connect
    ├── WHEELED    --> Maximum straight-line velocity | Blazing Clock Speed & Evasion | Severe rough/mud penalty
    ├── TRACKS     --> Heavy treads | Bulldozes rubble, snow & mud without penalty | High armor, lower speed
    ├── HOVER      --> Anti-gravity repulsors | Ignores all ground hazards | Constant predictable speed
    ├── AQUATIC    --> Amphibious propulsion | Dominates flooded arenas | Synergizes with high cooling
    └── MULTI_LEG  --> Quadruped / Hexapod base | Recoil absorption & stability | Superior rough terrain grip
```

---

## 1. Physical Slot Anatomy (`PartSlot`)

Every AniBot is assembled from 5 modular slots defined in Godot [`Types.PartSlot`](./src/src/core/Types.gd):

| Slot | Enum | Primary Role | Ammo / Resource | Destruction Penalty (0 Integrity) |
| :--- | :--- | :--- | :--- | :--- |
| **HEAD** | `PartSlot.HEAD` | Tactical burst attacks, powerful shields, traps, and utility scans. | **Cache** (2 to 4 finite uses per battle). | **System Failure**: Robot immediately shuts down. Reaching 0 Head Integrity loses the battle. |
| **TORSO** | `PartSlot.TORSO` | The central motherboard. Provides passive armor, weight bandwidth, and heat cooling. | Passive (No direct attack). | **Chassis Ruptured**: Robot remains fully operational. Arms remain usable as long as their own HP is above 0. Torso loses Firewall damage reduction and Cooling bonuses for remainder of battle. |
| **LEFT_ARM** | `PartSlot.LEFT_ARM` | Primary or secondary active weapon, shield, or utility. | Infinite standard usage. | **Disabled**: Left arm cannot be selected for combat commands for remainder of match. |
| **RIGHT_ARM** | `PartSlot.RIGHT_ARM` | Primary or secondary active weapon, shield, or utility. | Infinite standard usage. | **Disabled**: Right arm cannot be selected for combat commands for remainder of match. |
| **LEGS** | `PartSlot.LEGS` | Mobility platform. Dictates ATB fill rate, evasion, combat range modifiers, and terrain handling. | Passive mobility. | **Crippled**: Robot defaults to minimum crawl speed (Clock Speed drops to floor value). |

### Mathematical Formulas & Slot Scaling

1. **In-Battle HP (Integrity vs. Condition)**:
   $$\text{Integrity}_{\text{max}} = \text{Base Integrity} \times \left( \frac{\text{Condition}}{100} \right)$$
   *Example: A 60 HP base arm at 85% Condition enters combat with 51 HP. At 0% Condition, the part is Bricked and cannot be equipped.*

2. **Torso Bandwidth Validation**:
   $$\text{Total Weight} = \text{Weight}_{\text{Head}} + \text{Weight}_{\text{Left\_Arm}} + \text{Weight}_{\text{Right\_Arm}}$$
   $$\text{If } \text{Total Weight} > \text{Max Loadout}_{\text{Torso}} \implies \text{Overweight Penalty: } +50\% \text{ to all Action Latencies}$$

3. **Effective Weapon Latency (Cooldown Time)**:
   $$\text{Effective Latency} = \max\left(1.0, \text{Base Latency}_{\text{Weapon}} - \text{Cooling}_{\text{Torso}}\right)$$
   *Higher Torso Cooling physically accelerates weapon recovery times on the return line.*

---

## 2. Action / Payload Types (`AttackType`)

Active components (Head, Left Arm, Right Arm) execute specific payload types defined in [`Types.AttackType`](./src/src/core/Types.gd):

| Payload Type | Enum | Primary Slots | Targeting Lock Timing | Scaling Attribute | Tactical Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MELEE** | `AttackType.MELEE` | Left Arm, Right Arm, Head | **Center-Line Dynamic** (Evaluates when robot reaches center) | Legs `direct_connect` | Fast execution sprint, minimal latency recovery. Allows last-second dynamic retargeting. |
| **SHOOTING** | `AttackType.SHOOTING` | Left Arm, Right Arm, Head | **Wait-Phase Cached** (Locked the moment Wait Phase ends) | Legs `remote_uplink` | High payload and precision, but higher latency (long vulnerable return transit). |
| **DEFENSE** | `AttackType.DEFENSE` | Left Arm, Right Arm, Head | **Instant Center Intercept** | Torso `firewall` | Broadcasts **Override Protocol**, forcibly intercepting enemy targeting vectors to protect allies. |
| **SUPPORT** | `AttackType.SUPPORT` | Head, Left Arm, Right Arm | **Wait-Phase Instant** | Fixed utility / 100% precision | Provides utility: guaranteed critical strikes, sensory locks, ATB acceleration, or enemy disruption. |
| **TRAP** | `AttackType.TRAP` | Head | **Center-Line Placement** | Base payload | Plants a logic hazard mine on the center combat line. Detonates when an enemy crosses the center line. |

### In-Depth Payload Mechanics

#### 1. MELEE (Direct Physical Impact)
- **Combat Flow**: The AniBot sprints across the relay track to the center line. Because target evaluation is deferred until arrival (**Scatter/Brawler Logic**), if an enemy moves or changes state while the bot is running, the AI dynamically selects the optimal target at the instant of impact.
- **Scaling**: Benefits directly from the equipped Legs' `direct_connect` stat (+/- damage modifier).
- **Archetypes**: High-frequency Katanas, Concussive Ratchet Wrenches, Hydraulic Drills, Vibro-Claws, Shock Knives.

#### 2. SHOOTING & RANGED (Ballistic & Beam Ordnance)
- **Combat Flow**: The AniBot calculates target evaluation immediately upon filling the Action Bar (**Precision Logic**). The target's ID is locked into memory. The bot runs toward the center line and fires upon arrival, even if the battlefield state shifted during the run.
- **Scaling**: Benefits directly from the equipped Legs' `remote_uplink` stat.
- **Archetypes**: Revolvers, Pulsar Rifles, Anti-Materiel Comet Cannons, Gatling Blasters, Plasma Casters, Howitzers.

#### 3. DEFENSE (Shields & Interception Barriers)
- **The Override Protocol**: When commanded to use a defensive shield, the AniBot rushes to the center line and broadcasts an emergency override beacon. At the engine level, all active opposing targeting vectors targeting fragile teammates are forcibly diverted to the defender.
- **Damage Mitigation**: Incoming damage is absorbed by the shield part's Integrity and modified by Torso Firewall armor.
- **Archetypes**: Tower Shields, Bucklers, Dragon-Wing Greatshields, Hard-Light Energy Barriers.

#### 4. SUPPORT (Tactical Sensors & Disruptors)
- **Offensive Utility**: Calibrates sensor feeds (e.g., *Astro-Scope*, *Zenith Cowl*) to guarantee 100% critical strike chance on subsequent strikes.
- **Defensive Utility**: Emits restorative pulses or chaff clouds to accelerate teammate Action Bar charging.
- **Disruptive Utility**: Emits sonic or electronic interference (e.g., *Surge Node*, *Chime Projector*) to reset or delay an enemy's ATB charge.

#### 5. TRAP (Center-Line Area Hazards)
- **Placement**: Head utility arms (e.g., *Logic Bomb*) drop logic traps onto the center combat line instead of targeting a specific robot.
- **Detonation**: When an enemy begins a Run Phase and reaches the center line, the trap triggers instantly, dealing severe damage and interrupting their command.

---

## 3. Torso Chassis Architectures

The Torso acts as the motherboard and structural foundation. Torsos do not feature offensive weapons; instead, they dictate four architectural parameters:

1. **Integrity**: Torso durability.
2. **Max Loadout**: Bandwidth capacity limiting the combined weight of equipped Head and Arms.
3. **Firewall**: Flat passive damage reduction applied to all incoming attacks across the robot.
4. **Cooling**: Thermal dispersal rate that reduces the mechanical recovery Latency of equipped weapons.

### Canonical Chassis Architectures

| Architecture | Representative Chassis | Firewall | Max Loadout | Cooling | Tactical Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Balanced Chassis** | Genesis Chassis (`part_torso_genesis`), Tatami Chassis (`part_torso_tatami`) | Moderate (10–14) | Moderate (32–36) | Moderate (1.4–1.8) | Well-rounded performance for versatile mixed melee/shooting builds. |
| **Heavy Fortress Chassis** | Aegis Chassis (`part_torso_aegis`), Goliath Titan (`part_torso_goliath`) | High (18–26) | Massive (40–48) | Low (0.8–1.2) | Capable of mounting two heavy cannons or siege shields; sacrifices cooldown speed for impenetrable defense. |
| **High-Cooling Speed Chassis** | Circuit Chassis (`part_torso_circuit`), Shadow-Fang Core (`part_torso_shadow`) | Low (6–10) | Low (26–30) | Extreme (2.2–2.8) | Dissipates heat instantly. Allows rapid weapon cycling and fast hit-and-run tactics with lightweight armaments. |
| **Precision Chassis** | Nova Chassis (`part_torso_nova`), Hawkeye Core (`part_torso_hawkeye`) | Moderate (8–12) | High (36–42) | Moderate (1.6–2.0) | Tuned weight bandwidth specifically balanced for long-range sniper rifles and heavy optics. |

---

## 4. Leg Mobility Protocols & Terrain Interaction Matrix

Legs dictate movement through the **Clock Speed** (frequency of Action Bar fill during Wait Phase) and **Packet Loss** (percentage chance to dodge incoming attacks during Run/Cooldown phases).

Every set of Legs runs a hardware **Protocol** defining its locomotion physics and arena terrain compatibility:

| Protocol | Movement Style | Base Clock Speed | Base Evasion | Direct Connect (Melee) | Remote Uplink (Ranged) | Best Suited Arenas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`BIPEDAL`** | Humanoid two-legged stride | Moderate (1.4–1.8) | Moderate (10–15%) | Positive (+5 to +15) | Balanced (0 to +5) | Urban City, Paved Arenas, Indoors |
| **`WHEELED`** | Rollers, motorized wheels | Blazing (2.0–2.6) | High (18–25%) | Neutral (0) | Positive (+5 to +10) | Flat Pavement, Hardpacked Asphalt |
| **`TRACKS`** | Caterpillar tank treads | Slow (1.0–1.3) | Low (5–8%) | Positive (+10) | Positive (+10) | Muddy Trenches, Rubble, Sand |
| **`HOVER`** | Anti-gravity thrusters | Predictable (1.6–1.9) | Moderate (12–16%) | Negative (-5) | High (+15 to +20) | All Terrains (Ignores Hazards) |
| **`AQUATIC`** | Sub-surface hydro-jets | High in water (2.2) | High (20%) | Neutral (0) | Moderate (+5) | Flooded Arenas, Coastal Waters |
| **`MULTI_LEG`**| Quadruped / Hexapod crawl | Moderate (1.3–1.6) | Low (8–12%) | High (+15) | High (+15) | Mountain Cliffs, Jagged Rocks |

### Terrain Interaction Matrix

Modifiers applied to Action Bar fill rates and evasion based on arena terrain:

| Terrain Type | BIPEDAL | WHEELED | TRACKS | HOVER | AQUATIC | MULTI_LEG |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **City / Paved Asphalt** | **+10% Speed** | **+25% Speed** | Normal | Normal | -20% Speed | Normal |
| **Rubble / Junkyard** | Normal | -20% Speed | **+15% Armor** | Normal | -30% Speed | **+15% Stability** |
| **Mud / Swamp / Sand** | -15% Speed | **-40% Speed** | **Immune (No Penalty)** | **Immune (No Penalty)** | Normal | Normal |
| **Flooded / Water Base** | -25% Speed | **-50% Speed** | -20% Speed | **Immune (No Penalty)** | **+30% Speed & Evasion** | -10% Speed |
| **Rocky Peaks / Slopes** | -10% Speed | -30% Speed | Normal | **Immune (No Penalty)** | -40% Speed | **+25% Evasion & Defense** |

---

## 5. Anima Chip Affinity Synergy

When an active weapon part's `type` matches the slotted [Anima Chip's](./CHIPS.md) `affinity`, the system activates an **Affinity Synergy Match**:

$$\text{Affinity Synergy Bonus} = +10\% \text{ to Payload, Precision, and Overclock Charge}$$

- **`MELEE` Affinity Chips** (e.g., *Ronin*, *Berserker*, *Gladiator*): Best paired with swords, claws, and impact hammers.
- **`SHOOTING` / `SNIPER` Affinity Chips** (e.g., *Orion*, *Gunslinger*, *Photon*): Best paired with rifles, pistols, and laser blasters.
- **`DEFENSE` / `GUARDIAN` Affinity Chips** (e.g., *Phalanx*, *Ursa*, *Biggon*): Best paired with deployable tower shields and protective head units.
- **`TRAP` Affinity Chips** (e.g., *Artificer*): Best paired with center-line logic bombs and hazard deployers.
- **`SPEED` / `AGILITY` Affinity Chips** (e.g., *Spark*, *Vulpes Zerda*, *Acinonyx Jubatus*): Best paired with wheeled legs and rapid-fire low-latency weapons.

---

## 6. Complete Parts Databank Summary

Across the 38 canonical AniBots cataloged in [`dex/data/anibots.json`](./dex/data/anibots.json), there are **190 unique modular parts**:
- **38 Head Units**: Including tactical scanners (*Astro-Scope*, *Zenith Cowl*), logic traps (*Logic Bomb*), acoustic ears (*Acoustic Dish Ears*), and burst cannons (*Surge Node*, *Dragon-Roar Cannon*).
- **38 Torso Chassis**: Across Balanced, Heavy Fortress, High-Cooling, and Precision architectures.
- **76 Arm Weapons (38 Left / 38 Right)**: Ranging from light parrying daggers to super-heavy howitzers and shield barriers.
- **38 Mobility Leg Platforms**: Spanning Bipedal, Wheeled, Tracks, Hover, Aquatic, and Multi-Leg protocols.

For the full statistical breakdown of every individual part (Integrity, Payload, Precision, Clock Speed, Latency, Weight, Firewall, Cooling, and Cache), visit the **[AniDex Web Application](./dex/README.md)**.

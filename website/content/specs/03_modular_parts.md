---
id: 03_modular_parts
title: Modular Parts & Types Specification
subtitle: 5-Slot Anatomy, Payload Archetypes, Chassis, and Mobility Protocols
order: 3
---

## Modular Anatomy & System Integration

In the AniBots universe, every robot frame is a modular assembly of five distinct physical components controlled by an [Anima Chip](/specs/04_anima_chips) core.

Part types dictate core combat mechanics: targeting lock-on timing, relay transit speeds, damage formulas, defensive interception, and terrain friction.

> [!IMPORTANT]
> **Explore the Parts Databank**: This specification details how modular parts interface with game mechanics and formulas. To view complete statistics, 3D assets, weight ratings, and loadout parameters for each part individually, browse the interactive **[AniDex Parts Databank](/dex/parts/)**.

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

## 1. Physical Slot Anatomy & Failure Consequences

Every AniBot is assembled from 5 modular slots. How each slot interacts with active combat and what happens when it sustains critical damage is governed by strict rules:

| Slot | Primary Role & Interaction | Ammo / Resource | Destruction Penalty (0 Integrity) |
| :--- | :--- | :--- | :--- |
| **HEAD** | Tactical burst attacks, powerful shields, logic traps, and utility scans. | **Cache** (2 to 4 finite uses per match). | **System Failure**: The robot immediately shuts down. Reducing the opposing Leader's Head to 0 Integrity wins the battle. |
| **TORSO** | The central motherboard. Provides passive armor, weight bandwidth, and heat cooling. | Passive structural chassis (no direct attack). | **Chassis Ruptured**: Robot remains fully operational. Equipped Arms remain usable as long as their own HP is above 0. Torso loses Firewall damage reduction and Cooling bonuses for remainder of battle. |
| **LEFT_ARM** | Primary or secondary active weapon, shield, or utility payload. | Infinite standard usage. | **Disabled**: Left arm cannot be selected for combat commands for remainder of match. |
| **RIGHT_ARM** | Primary or secondary active weapon, shield, or utility payload. | Infinite standard usage. | **Disabled**: Right arm cannot be selected for combat commands for remainder of match. |
| **LEGS** | Mobility platform. Dictates ATB fill rate, evasion, combat range modifiers, and terrain handling. | Passive mobility. | **Crippled**: Robot defaults to minimum crawl speed (Clock Speed drops to floor value). |

### Core Mechanical Formulas

#### 1. In-Battle HP (Integrity vs. Condition)
Max battle integrity scales linearly with permanent hardware condition:
```gdscript
func calculate_battle_integrity(base_integrity: int, condition_percent: float) -> int:
    if condition_percent <= 0.0:
        return 0  # Bricked: Cannot be equipped
    return int(round(base_integrity * (condition_percent / 100.0)))
```

#### 2. Torso Bandwidth & Overweight Penalty
Total equipped Head and Arm weight cannot exceed the Torso's `max_loadout`:
```gdscript
func is_build_overweight(head: Dictionary, left_arm: Dictionary, right_arm: Dictionary, torso: Dictionary) -> bool:
    var total_weight: int = head.get("weight", 0) + left_arm.get("weight", 0) + right_arm.get("weight", 0)
    return total_weight > torso.get("max_loadout", 0)
```
*If a build is overweight, an Overweight Penalty of +50% latency is applied to all action recovery phases.*

#### 3. Effective Weapon Latency (Cooldown Time)
Higher Torso Cooling physically accelerates weapon recovery times on the return line:
```gdscript
func calculate_effective_latency(base_latency: float, torso_cooling: float, is_overweight: bool = false) -> float:
    var net_latency: float = maxf(1.0, base_latency - torso_cooling)
    var overweight_multiplier: float = 1.5 if is_overweight else 1.0
    return net_latency * overweight_multiplier
```

---

## 2. Action / Payload Types & Combat Interactions

Active components execute specific payload types, each determining how targeting locks and executes on the battlefield:

| Payload Type | Primary Slots | Targeting Lock Timing | Scaling Attribute | Tactical Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **MELEE** | Left Arm, Right Arm, Head | **Center-Line Dynamic** (Evaluates when robot reaches center) | Legs `direct_connect` | Fast execution sprint, minimal latency recovery. Allows last-second dynamic retargeting. |
| **SHOOTING** | Left Arm, Right Arm, Head | **Wait-Phase Cached** (Locked the moment Wait Phase ends) | Legs `remote_uplink` | High payload and precision, but higher latency (long vulnerable return transit). |
| **DEFENSE** | Left Arm, Right Arm, Head | **Instant Center Intercept** | Torso `firewall` | Broadcasts **Override Protocol**, forcibly intercepting enemy targeting vectors to protect allies. |
| **SUPPORT** | Head, Left Arm, Right Arm | **Wait-Phase Instant** | Fixed utility / 100% precision | Provides utility: guaranteed critical strikes, sensory locks, ATB acceleration, or enemy disruption. |
| **TRAP** | Head | **Center-Line Placement** | Base payload | Plants a logic hazard mine on the center combat line. Detonates when an enemy crosses the center line. |

---

## 3. Torso Chassis Architectures

The Torso acts as the structural foundation and motherboard:
- **Balanced Chassis**: Uniform distribution of Firewall, Max Loadout, and Cooling (e.g. Genesis Chassis, Tatami Chassis).
- **Heavy Fortress Chassis**: Massive HP and Firewall armor, high loadout bandwidth, but lower Cooling (e.g. Aegis Chassis, Goliath Titan).
- **High-Cooling Speed Chassis**: Extreme heat dissipation (Cooling 2.2–2.8), allowing rapid weapon recovery and hit-and-run cycles (e.g. Circuit Chassis, Shadow-Fang Core).
- **Precision Chassis**: Tuned weight bandwidth balanced for long-range sniper rifles and heavy optics (e.g. Nova Chassis, Hawkeye Core).

---

## 4. Leg Mobility Protocols & Terrain Interaction Matrix

Legs dictate movement through **Clock Speed** (frequency of Action Bar fill during Wait Phase) and **Packet Loss** (percentage chance to dodge incoming attacks during transit).

| Terrain Type | BIPEDAL | WHEELED | TRACKS | HOVER | AQUATIC | MULTI_LEG |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **City / Paved Asphalt** | **+10% Speed** | **+25% Speed** | Normal | Normal | -20% Speed | Normal |
| **Rubble / Junkyard** | Normal | -20% Speed | **+15% Armor** | Normal | -30% Speed | **+15% Stability** |
| **Mud / Swamp / Sand** | -15% Speed | **-40% Speed** | **Immune (No Penalty)** | **Immune (No Penalty)** | Normal | Normal |
| **Flooded / Water Base** | -25% Speed | **-50% Speed** | -20% Speed | **Immune (No Penalty)** | **+30% Speed & Evasion** | -10% Speed |
| **Rocky Peaks / Slopes** | -10% Speed | -30% Speed | Normal | **Immune (No Penalty)** | -40% Speed | **+25% Evasion & Defense** |

---

## 5. Anima Chip Affinity Synergy

When an active weapon part's `type` matches the slotted [Anima Chip's](/specs/04_anima_chips) `affinity`, the system activates an **Affinity Synergy Match**:

```gdscript
func apply_affinity_synergy(part_attack_type: Types.AttackType, chip_affinity: String, base_payload: int, base_precision: int) -> Dictionary:
    var type_key: String = Types.AttackType.keys()[part_attack_type]
    var matches: bool = type_key.to_upper() == chip_affinity.to_upper()
    var multiplier: float = 1.10 if matches else 1.0
    return {
        "payload": int(round(base_payload * multiplier)),
        "precision": int(round(base_precision * multiplier)),
        "overclock_boost": multiplier
    }
```

---

> [!TIP]
> **View Every Part in Detail**: Want to see individual part stats, weights, 3D models, and full descriptions?
> Visit the **[AniDex Parts Explorer](/dex/parts/)** to filter all 190+ parts by slot, attack type, and manufacturer.

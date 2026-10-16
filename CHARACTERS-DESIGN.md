# AniBots Character Design Guidelines (`CHARACTERS-DESIGN.md`)

Welcome to the canonical **AniBots Character Design Guidelines**. This document defines the visual, anatomical, and mechanical rules for designing AniBots across 2D concept art, 3D models, and animation rigs.

Inspired by modular chibi-mecha design principles (analyzed in [INSPIRATION/Medabots.md](./INSPIRATION/Medabots.md)), AniBots establishes its own distinct engineering philosophy: **autonomous 5-part modularity**, **gender-neutral under-skeleton anchoring**, and **integrated joint-coupler networking** without external wireframe skeletons.

> [!NOTE]
> - **Modular Parts & Combat Mechanics**: Full stat formulas, loadout rules, and slots in [PARTS.md](./PARTS.md).
> - **Anima Chips & Cores**: Brain engrams, diode palettes, and personality lore in [CHIPS.md](./CHIPS.md) and [OVERVIEW.md](./OVERVIEW.md).
> - **Character Profiles**: Canonical cast profiles in [CHARACTERS.md](./CHARACTERS.md).
> - **Parts Databank**: 190 canonical parts cataloged in [`dex/data/anibots.json`](./dex/data/anibots.json).

---

## 1. Proportional Rule: The 100–120 cm Silhouette

AniBots stand between **100 cm and 120 cm tall** (roughly 1.0 m to 1.2 m). This scale places them at chest height to human teenagers (such as 16-year-old Kura Ato), reinforcing their identity as dynamic, physical partners rather than towering military mechs or tiny tabletop toys.

```text
AniBot Vertical Mass Distribution (100–120 cm):
┌─────────────────────────┐  ◄── 100–120 cm Total Height
│      HEAD & VISOR       │      ~28–32% Height (Enlarged expressive head, sensor crests)
├─────────────────────────┤
│      TORSO CHASSIS      │      ~22–25% Height (Dense core, rear chip port, motherboard)
├─────────────────────────┤
│   UPPER LEGS (STUBBY)   │      ~12–15% Height (Shortened femur linkages, high torque)
├─────────────────────────┤
│ LOWER LEGS & PROPULSION │      ~30–35% Height (Chunky boots, treads, wheels, 
└─────────────────────────┘                      or hover thrusters)
```

### Proportional Constraints

1. **The Chibi-Mecha Ratio**:
   - Head-to-body ratio is strictly **1:3.5 to 1:4**.
   - Heads are intentionally enlarged to house the sensory suite, tactical weapon caches, and expressive glowing visors.
2. **The "Trimming" Principle**:
   - Do NOT draw lanky human silhouettes dressed in armor.
   - **Upper Extremities (Biceps & Thighs)**: Kept short, stubby, and dense. Minimal exposed midriff or waistline.
   - **Lower Extremities (Forearms & Lower Legs)**: Carry physical visual weight. Heavy gauntlets, massive weapon barrels, articulated claws, and wide mobility platforms ground the silhouette.
3. **Tactile Weight**:
   - Armor panels have visible plate thickness (chamfered edges, recessed panel lines, bolt fixtures).
   - Silhouettes feel dense, spring-loaded, and athletic.

---

## 2. Anatomical Architecture: No Tinpet, Neutral Under-Skeleton Anchor

Unlike legacy systems requiring an external wireframe doll skeleton (such as the gender-locked Tinpets in [Medabots.md](./INSPIRATION/Medabots.md)), **AniBots have NO Tinpet**.

Every AniBot is constructed around the **Neutral Under-Skeleton Anchor (NUA)** integrated directly into the Torso Chassis, coupled to self-articulated modular parts.

```text
Neutral Under-Skeleton Anchor (NUA) Architecture:

                                  [HEAD UNIT]
                                       │
                              [Omni-Relay Neck]
                                       │
   [LEFT ARM] ──[L-Hardpoint]───[ TORSO CHASSIS ]───[R-Hardpoint]── [RIGHT ARM]
                                │               │
                         [NUA Spine Core]   [Rear Port] ◄── [ANIMA CHIP]
                                │
                        [Pelvic Drive Gimbal]
                                │
                          [LEGS PLATFORM]
```

### A. The Neutral Under-Skeleton Anchor (NUA)

- **Universal & Gender-Neutral**: Standardized across all 38 AniBots. No male or female frame locks. Any head, arm, or leg part can mount seamlessly to any torso anchor.
- **Titanium-Ceramic Backbone**: The NUA acts as the rigid central spine inside the Torso Chassis. It houses:
  1. **Anima Chip Cradle**: Secure rear port locking the Anima Chip into direct hardware contact.
  2. **Central Bus Bridge**: High-bandwidth fiber-optic bridge multiplexing control signals between chip and limbs.
  3. **Power & Heat Manifold**: Distributes battery bus power and channels heat to the Torso cooling ducts.

### B. Omni-Relay Part Couplers (Smart Connectors)

Every individual part (Head, Left Arm, Right Arm, Legs) features an integrated **Omni-Relay Coupler**:

1. **Physical Movement (Active Articulation)**:
   - Self-contained sealed motorized joints (ball-and-socket gimbals, dual-axis rotary swivels, or hydraulic actuators) built into the part's base.
   - Parts provide their own locomotion and articulation; they do not rely on an internal skeleton puppet.
2. **Data & Signal Relay**:
   - High-speed dual-channel optical bus pins on the coupler face.
   - Real-time telemetry, targeting vectors, and sensory feeds relay directly between parts and the Torso NUA with sub-millisecond latency.
3. **Power Rails**:
   - High-amperage conductive contact rings feeding actuator motors and energy weapons directly from the Torso core.
4. **Mag-Coupler Quick-Release**:
   - High-power electromagnetic locking ring. Provides structural rigidity under impact, but releases instantaneously during field maintenance, salvage, or modular ejection.

---

## 3. The 5-Part Modular Formula

AniBots adheres to an autonomous **5-Part Modular Formula** (defined in [PARTS.md](./PARTS.md)):

| Slot | Canonical Role | Anatomy & Connector Type | Mechanical Failure Behavior |
| :--- | :--- | :--- | :--- |
| **HEAD** | Tactical burst weapons, radar dishes, sensory horns, barrier emitters. | Omni-Relay Neck Gimbal (3-DOF rotation + optical bus). | **0 HP = System Failure**. Brain disconnects; robot shuts down immediately. |
| **TORSO** | Structural chassis housing NUA spine, cooling radiators, and rear Anima Chip port. | Central structural core with 4 universal docking hardpoints. | **Chassis Ruptured**. Loses Firewall armor and Cooling boost; limbs remain operational. |
| **LEFT_ARM** | Active weapon, heavy shield, claw, or utility module. | Left Shoulder Omni-Relay Hardpoint (multi-axis ball-swivel). | **Disabled**. Arm drops offline; command unavailable for match duration. |
| **RIGHT_ARM**| Active weapon, heavy shield, claw, or utility module. | Right Shoulder Omni-Relay Hardpoint (multi-axis ball-swivel). | **Disabled**. Arm drops offline; command unavailable for match duration. |
| **LEGS** | Locomotion platform across 6 mobility protocols (Bipedal, Wheeled, Tracks, Hover, Aquatic, Multi-Leg). | Pelvic Drive Gimbal (heavy-load hydraulic socket). | **Crippled**. Speed drops to emergency crawl rate. |

---

## 4. Visor Typology & Optical Aesthetics

The faceplate defines the AniBot's soul and personality engram. Following the **Negative-Space Receptacle Principle**, every head part features a deep, shadowed dark cavity (`#0A0D14` to `#161B22`) containing high-contrast, emissive LED/laser visors (`#00FFAA`, `#FF3366`, `#FFB800`, `#00E5FF`).

### The 7 Canonical Visor Archetypes

```text
1. Split Dual-Visor        2. Monocular Cyclops       3. Aero-Bubble Shield
   ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
   │  /──\   /──\  │          │ ═════════════ │          │ (═══════════) │
   └───────────────┘          └───────────────┘          └───────────────┘
4. Hex-Cluster Array       5. Emotive Dot-Matrix      6. Ballistic Slit Goggles
   ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
   │  ⬡ ⬡   ⬡ ⬡    │          │  ^         ^  │          │  [ ═ ]   [ ═ ]│
   └───────────────┘          └───────────────┘          └───────────────┘
7. Asymmetric Tactical
   ┌───────────────┐
   │  (◎)   /──\   │
   └───────────────┘
```

#### 1. Split Dual-Visor (Bino-Optic / Twin Slits)
- **Visuals**: Two sharply angled, high-contrast neon eyes sitting deep within the faceplate shadow.
- **Affinity**: Brawler Melee, Agile Strikers, Mascot Frames (e.g., *Zerdata*, *Muramasa-X*).
- **Expression**: Fierce, alert, determined. Eyelid panels can shift angle to convey anger, surprise, or focus.

#### 2. Monocular Cyclops (Horizon Bar / Linear Scanner)
- **Visuals**: A single continuous horizontal neon slit or cycling laser band traversing a dark visor trench.
- **Affinity**: Heavy Ordnance, Calculating Snipers, Cold Industrial Frames (e.g., *Nova-Strike*, *Orion*).
- **Expression**: Methodical, stoic, emotionless, scanning.

#### 3. Aero-Bubble Shield (Wraparound Canopy)
- **Visuals**: Sleek, curved panoramic visor shield with tinted glass and interior holographic readouts.
- **Affinity**: High-Speed Wheeled, Aerial Hover, Aquatic Frames (e.g., *Peregrine*, *Hydro-Sub*).
- **Expression**: Futuristic, aerodynamic, clean.

#### 4. Hex-Cluster Array (Compound / Arachnid Optics)
- **Visuals**: Cluster of 4 to 6 small glowing hexagonal or circular sensor lenses grouped in triangular or insectoid formations.
- **Affinity**: Reconnaissance, Multi-Leg Platforms, Ancient Generation-0 Frames (e.g., *Agon*, *Chitin-Stalker*).
- **Expression**: Alien, ancient, all-seeing, analytical.

#### 5. Emotive Dot-Matrix (Micro-LED Array)
- **Visuals**: High-density digital LED matrix faceplate capable of rendering pixel eyes, emoticons (`> <`, `o_o`, `!`), and targeting brackets.
- **Affinity**: Support, Trapper, Hyperactive Kinetic Frames (e.g., *Spark*, *Artificer*).
- **Expression**: Highly animated, quirky, emotive, directly responsive to Handler banter.

#### 6. Ballistic Slit Goggles (Reinforced Recessed Bunkers)
- **Visuals**: Heavy, armored visor cowl with twin narrow slit windows protecting deep glowing amber/red lenses.
- **Affinity**: Heavy Fortress Chassis, Shield Guardians (e.g., *Aegis*, *Goliath*).
- **Expression**: Unshakeable, defensive, intimidating.

#### 7. Asymmetric Tactical Optic (Monocle Recon)
- **Visuals**: Left and right eyes are intentionally mismatched—one standard visor slit paired with an oversized telescopic lens or targeting reticle.
- **Affinity**: Precision Snipers, Electronic Warfare (e.g., *Hawkeye Core*).
- **Expression**: Technical, calibrated, calculating.

---

## 5. Biomorphic Motif Transmutation

Every AniBot maps a recognizable biological, historical, or mechanical motif into hard robotic architecture:

1. **Literal Translation Without Flesh**:
   - Animals, insects, and mythical beasts are translated strictly as machines. No artificial skin, fur, or organic tissue.
   - Fur tufts become heat dissipation fins or antennae arrays.
   - Beetle horns become pneumatic railguns or kinetic blades.
   - Fennec fox ears become parabolic acoustic radar dishes (as seen on *Zerdata*).
2. **Function Over Decoration**:
   - Every silhouette feature must perform a mechanical duty. Wings act as vector thrusters or shield foils. Tails function as counter-weights, anchor spikes, or exhaust pipes.
3. **Exposed Functional Details**:
   - Gaps between armor plates reveal black braided data cables, hydraulic pistons, and radiator cooling vanes.

---

## 6. Visual Style & Rendering Standards

To ensure harmony between 2D art and 3D Godot rendering:

1. **Line Art**:
   - Crisp, uniform-weight mechanical lines. Subtle inner panel lines with bold silhouette outer outlines.
2. **Color Palette**:
   - 3-Tone rule: Primary armor tone (60%), secondary trim tone (30%), accent/mechanical dark slate tone (10%).
   - Visors, diodes, and energy conduits use 100% emissive high-contrast neon tints.
3. **3D Meshing & Cel-Shading**:
   - Solid volumetric bevels on all armor plates (avoids paper-thin polygon looks).
   - Cel-shaded flat texture maps with specular rim lighting and emissive Bloom masks for visors and the rear Anima Chip diode.

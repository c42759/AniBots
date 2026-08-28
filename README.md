# AniBots
![Anima Chips](./AnimaChip.png)

Welcome to the **AniBots** repository! 

**AniBots** is a strategic RPG built in **Godot**, featuring deeply customizable robots powered by unique AI cores known as **Anima Chips**. This project blends classic RPG battling mechanics with a robust hardware degradation and management system, where players act as "Handlers" commanding semi-autonomous machines.

## 🛠 Tech Stack & Architecture

- **Game Engine:** Godot
- **Database:** SQLite

We are using a dual-database architecture powered by SQLite, ensuring lightweight, cross-platform performance (including Nintendo Switch):
1. **The Catalog (Read-Only):** A static database containing all base stats for Anibot parts (Integrity, Payload, Precision). This allows for instant balance patching without touching the engine scripts.
2. **The Save Database (Writable):** Tracks the player's dynamic state, inventory, and hardware degradation. SQLite guarantees ACID compliance, ensuring save files never corrupt during transactions.

## 🤖 Core Game Systems

If you are looking to contribute, here are the core systems that drive AniBots:

### 1. The Anima Chip (The AI "Soul")
The Anima Chip is the central processor that dictates an Anibot's personality and autonomous targeting logic. Instead of hardcoded actions, chips use a **Weighted Scoring System (Utility AI)** to dynamically calculate threats on the battlefield based on their specific personality (e.g., Aggressive chips target heavy weapons, Sniper chips target weak armor).

### 2. Modular Hardware Loadouts
Anibots are assembled from customizable parts, forcing players to balance weight, speed, and power:
- **Active Parts (Head, Arms):** Determine HP (Integrity), damage (Payload), speed (Execution/Latency), and accuracy (Precision).
- **Torso (Chassis):** The motherboard that limits the **Max Loadout**, acting as the structural bottleneck to prevent overpowered builds.
- **Legs (Mobility):** Dictate action speed, evasion, and terrain compatibility.

### 3. Combat Pipeline
Combat utilizes a dynamic action bar with distinct phases (Wait, Run, Cooldown). The hardware equipped directly affects transit times. Heavy weapons have high Latency, leaving the Anibot exposed on the center line, while players can use shields to force an "Override Protocol" to intercept attacks.

### 4. Hardware Degradation & Scrap Economy
To bridge the gap between RPG and management games, parts suffer permanent **Condition** degradation if destroyed in combat. Players collect **Scrap** from defeated enemies to synthesize new parts (which start at 40% condition as a "test drive") and must balance using field patches versus real-time Workshop repairs.

## 🚀 Getting Involved

We are building a highly tactical, system-driven RPG and need contributors passionate about game design, Godot development, and AI logic! 

To get a full understanding of the lore, all Anima Chip series, and the deep math behind the combat and economy systems, please read our comprehensive design document:
👉 **[OVERVIEW.md](./OVERVIEW.md)**

*(Setup instructions, Godot version requirements, and contribution guidelines will be added here soon.)*

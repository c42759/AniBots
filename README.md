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

## 📱 AniDex Web App

The repository includes **AniDex**, a Next.js Pokédex-style web application located in the [`./dex`](./dex) directory for exploring, searching, and analyzing all AniBots (robot frames) and Anima Chips (AI cores).

![Anima Dex](./AnimaDex.png)

### Features

- **Item Databank:** Browse 36 AniBots and 36 Anima Chips with live search and multi-faceted filtering (Series, Affinity, Stats).
- **5-Part Schematics:** Detailed breakdown for Head, Torso, Left/Right Arms, and Legs (Integrity, Payload, Precision, Clock Speed, Latency, Weight).
- **AI Core Specs:** View personality engrams, quote haikus, base stat gauges, passive traits, and ultimate abilities.
- **Cross-Linking:** Quick navigation between AniBots and their preferred Anima Chips.

### Running AniDex Locally

```bash
cd dex
pnpm dev   # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. For complete documentation, see [`./dex/README.md`](./dex/README.md).

## 🚀 Getting Started

Follow these steps to set up the AniBots project locally:

1. **Install Godot Engine**: Download and install Godot (available via [Steam](https://store.steampowered.com/app/404790/Godot_Engine/) or the official [Godot website](https://godotengine.org/)).
2. **Open Godot**: Launch Godot Engine.
3. **Import Project**:
   - In the Godot Project Manager, click **Import**.
   - Browse to the repository and select the `src/` folder (or select `project.godot` inside `src/`).
   - Click **Import & Edit** to open the project.

## 🤝 Contributing

We are building a highly tactical, system-driven RPG and actively welcome contributors across multiple disciplines!

### Open Roles & Skillsets Needed

- **Game Designers**: Balance core combat formulas, scrap economy, part statistics, and Anima Chip behavioral weights.
- **Game Developers**: Build and optimize GDScript systems, SQLite integration, AI utility algorithms, and UI flow in Godot.
- **Brainstormers**: Propose constructive gameplay mechanics, lore expansion, mission structures, and Anima Chip personality concepts.
- **2D & 3D Modelers / Artists**: Create modular robot chassis parts, Anima Chip illustrations, battlefield UI assets, and combat VFX/animations.

### How to Get Started

1. Read our comprehensive design document: 👉 **[OVERVIEW.md](./OVERVIEW.md)** to understand the lore, mechanics, and design philosophy.
2. Check existing Issues or open a new Discussion/Issue with your ideas or proposed changes.
3. Fork the repository, create your feature branch, and submit a Pull Request.

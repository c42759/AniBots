# AniDex — AniBots & Anima Chips Tactical Databank

**AniDex** is a Pokédex-style web application for exploring, searching, and analyzing the attributes, parts, and combat schematics of **AniBots** (robot frames) and **Anima Chips** (AI cores).

---

## 🚀 Quick Start

To launch the application locally:

```bash
# 1. Navigate to the dex directory
cd dex

# 2. Start the development server
pnpm dev
# or
npm run dev

# 3. Open http://localhost:3000 in your browser
```

### Production Build

To build and run the optimized production bundle:

```bash
pnpm build && pnpm start
# or
npm run build && npm start
```

---

## ✨ Features

- **🤖 AniBots & 💾 Anima Chips Databanks**: Switch seamlessly between browsing 36 AniBot robot frames and 36 Anima Chip AI cores.
- **🔍 Real-Time Search & Multi-Filter**: Search instantly by name, model code (`RON-01`), archetype, personality, quotes, traits, or skills. Filter by **Series** (*ANTIQUITY*, *KINETIC*, *ASTRAL*), **Affinity** (*MELEE*, *RANGED*, *SIEGE*, *TECH*, etc.), and sort by Name, ID, or Max Integrity.
- **📊 5-Part Detailed Schematics**: Click any AniBot to inspect its 5 parts breakdown (**Head**, **Torso**, **Left Arm**, **Right Arm**, **Legs**) with individual integrity, payload, precision, weight, clock speed, firewall, cooling, and packet loss metrics.
- **⚡ Core Stats & Ultimate Abilities**: Click any Anima Chip to view its diode color spectrum, voice gender/style, quote engram, base stat gauges (Integrity, Accuracy, Evasion, Overclock Rate), passive traits, and full list of ultimate abilities.
- **🔗 Intelligent Cross-Linking**: Jump directly from an AniBot to its preferred Anima Chip (and vice versa) with one click.
- **🖼️ Image Display Slots**: Designed with image display containers on all cards and detail modals (supporting custom image paths or `/images/anibots/[id].png` / `/images/chips/[id].png`) with high-tech hologram fallbacks.
- **🔊 Sci-Fi Web Audio FX**: Built-in retro-futuristic sound effects for clicks, mode switches, and modals with a dedicated audio FX toggle button.

---

## 📁 Directory Structure

```text
dex/
├── app/
│   ├── globals.css      # Cyber HUD grid styling & animations
│   ├── layout.tsx       # Root layout & SEO metadata
│   └── page.tsx         # Main AniDex application page & state
├── components/
│   ├── Header.tsx       # Top branding banner & audio toggle
│   ├── FilterBar.tsx    # Category tabs, search bar & filters
│   ├── AniBotCard.tsx   # AniBot item card
│   ├── ChipCard.tsx     # Anima Chip item card
│   ├── AniBotDetailModal.tsx # Full 5-part schematic modal
│   ├── ChipDetailModal.tsx   # Core stats & ultimate abilities modal
│   └── ItemImage.tsx    # Responsive image loader with cyber fallback
├── data/
│   ├── anibots.json     # AniBots dataset
│   └── anima_chips.json # Anima Chips dataset
├── types/
│   └── dex.ts           # TypeScript interfaces
└── utils/
    └── audio.ts         # Web Audio API sound synthesizer
```

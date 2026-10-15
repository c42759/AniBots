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

- **🤖 AniBots, 💾 Chips & ⚙️ Parts Databanks**: Switch seamlessly between browsing 38 AniBot robot frames, 36 Chips (AI cores), and 190 modular robot parts.
- **⚙️ Standalone Modular Parts Catalog**: Inspect all 190 individual robot parts across all 5 physical slots (**HEAD**, **TORSO**, **LEFT_ARM**, **RIGHT_ARM**, **LEGS**) with deep telemetry for combat payload, precision, latency cooldown, firewall damage reduction, cooling, and mobility protocols.
- **🔍 Real-Time Search & Multi-Filter**: Search instantly by name, model code (`RON-01`), archetype, personality, quotes, traits, or part attributes. Filter by **Slot** (*HEAD*, *TORSO*, *LEFT_ARM*, *RIGHT_ARM*, *LEGS*), **Series** (*ANTIQUITY*, *KINETIC*, *ASTRAL*), and **Affinity** (*MELEE*, *RANGED*, *SIEGE*, *TECH*).
- **📊 5-Part Detailed Schematics**: Click any AniBot to inspect its 5 parts breakdown with individual integrity, payload, precision, weight, clock speed, firewall, cooling, and packet loss metrics.
- **⚡ Core Stats & Ultimate Abilities**: Click any Chip to view its diode color spectrum, voice gender/style, quote engram, base stat gauges (Integrity, Accuracy, Evasion, Overclock Rate), passive traits, and full list of ultimate abilities.
- **🔗 Intelligent Cross-Linking**: Jump directly from an AniBot to its preferred Chip, or from any modular part directly to its parent AniBot frame.
- **🖼️ Image Display Slots**: Designed with image display containers on all cards and detail modals with high-tech hologram fallbacks.
- **🔊 Sci-Fi Web Audio FX**: Built-in retro-futuristic sound effects for clicks, mode switches, and modals with a dedicated audio FX toggle button.

---

## 📁 Directory Structure

```text
dex/
├── app/
│   ├── globals.css           # Cyber HUD grid styling & animations
│   ├── layout.tsx            # Root layout & SEO metadata
│   └── page.tsx              # Main AniDex application page & state
├── components/
│   ├── Header.tsx            # Top branding banner & audio toggle
│   ├── FilterBar.tsx         # Category tabs, search bar, slot filters
│   ├── AniBotCard.tsx        # AniBot item card
│   ├── ChipCard.tsx          # Chip item card
│   ├── PartCard.tsx          # Modular part item card
│   ├── AniBotDetailModal.tsx # Full 5-part schematic modal
│   ├── ChipDetailModal.tsx   # Core stats & ultimate abilities modal
│   ├── PartDetailModal.tsx   # Individual part telemetry & blueprint modal
│   └── ItemImage.tsx         # Responsive image loader with cyber fallback
├── data/
│   ├── anibots.json          # AniBots dataset (38 frames with 190 parts)
│   └── anima_chips.json      # Chips dataset (36 AI cores)
├── types/
│   └── dex.ts                # TypeScript interfaces (AniBot, AnimaChip, ModularPart)
└── utils/
    └── audio.ts              # Web Audio API sound synthesizer
```


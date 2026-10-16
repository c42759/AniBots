# AniBots Web Portal (`anibots.github.io`)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Core Game](https://img.shields.io/badge/Godot_4.x-Core_Game_Repo-478cbf?style=flat-square&logo=godotengine)](https://github.com/c42759/AniBots)

The official web portal and contributor hub for **[AniBots](https://github.com/c42759/AniBots)** — an open-source modular tactical RPG built in Godot 4.x.

Live Site: **[anibots.github.io](https://anibots.github.io)**

---

## About The Project

AniBots combines classic relay-line battlers (inspired by Medabots GBA) with autonomous utility AI cores (**Anima Chips**), 5-slot modular chassis engineering, and a persistent hardware degradation scrap economy.

This repository hosts the public-facing landing page and onboarding portal designed to:

- Introduce players and contributors to the AniBots universe and mechanics.
- Recruit contributors across specialized roles: Pixel Artists, 3D Modelers, Game Devs (GDScript/Godot), UI/UX Designers, Writers, and Audio Composers.
- Provide interactive showcases of the 5-slot modular hardware system (Head, Torso, Left Arm, Right Arm, Legs) and Anima Chip AI series.
- Connect community members via Discord, GitHub Discussions, and issue boards.

> **Looking for the game engine source code?**
> Visit the primary game repository at [c42759/AniBots](https://github.com/c42759/AniBots).

---

## Features

- **Interactive Role Navigator**: Dedicated onboarding tracks for 2D artists, 3D animators, engine programmers, UI designers, and audio creators.
- **5-Slot Modular Hardware Inspector**: Interactive breakdown of robot anatomy, stats, and combat mechanics.
- **Anima Chip AI Matrix**: Overview of Antiquity, Kinetic, Astral, and Gen-0 Ancient AI cores.
- **Contributor Onboarding Pipeline**: Step-by-step onboarding guide and AI usage / creator respect policy.
- **Community Hub**: Direct links to Discord, GitHub Discussions, and bug trackers.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/postcss`)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Hosting**: GitHub Pages via static export into `/docs`

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (`corepack enable pnpm` or `npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/c42759/anibots.github.io.git
cd anibots.github.io

# Install dependencies
pnpm install
```

### Development

Run the local development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Export

To build the static site for GitHub Pages deployment:

```bash
pnpm build
```

The output is written directly to the `/docs` directory (configured via `distDir: 'docs'` in `next.config.mjs`) for GitHub Pages serving.

### Linting

```bash
pnpm lint
```

---

## Project Structure

```text
anibots.github.io/
├── app/
│   ├── favicon.ico
│   ├── globals.css      # Tailwind CSS base styles & cyber-grid effects
│   ├── layout.js        # Root layout, metadata & dark theme wrapper
│   └── page.js          # Interactive landing page & contributor portal
├── docs/                # Built output for GitHub Pages deployment
├── public/              # Static assets & SVG icons
├── next.config.mjs      # Next.js config (distDir: 'docs')
├── package.json         # Scripts and dependencies
└── README.md            # Repository documentation
```

---

## Contributing

Contributions to improve the website are welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/cool-enhancement`).
3. Commit your changes (`git commit -m "Add cool enhancement"`).
4. Push to the branch (`git push origin feature/cool-enhancement`).
5. Open a Pull Request.

For game contributions (sprites, 3D models, GDScript, lore), head over to the [AniBots Game Repository](https://github.com/c42759/AniBots).

---

## Community & Support

- **Discord**: Join the team and contributors on [Discord](https://discord.gg/FEjMjNGRFg)
- **Discussions**: Brainstorm ideas on [GitHub Discussions](https://github.com/c42759/AniBots/discussions)
- **Issues**: Report bugs or pick up tasks on [GitHub Issues](https://github.com/c42759/AniBots/issues)

---

## License

This project is licensed under the [MIT License](LICENSE).

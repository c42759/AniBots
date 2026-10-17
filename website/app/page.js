'use client';

import { useState } from 'react';
import Link from 'next/link';


const GITHUB_REPO = 'https://github.com/c42759/AniBots/';
const GITHUB_DISCUSSIONS = 'https://github.com/c42759/AniBots/discussions';
const GITHUB_ISSUES = 'https://github.com/c42759/AniBots/issues';
const DISCORD_INVITE_URL = 'https://discord.gg/FEjMjNGRFg';
const ANIDEX_URL = '/dex/';


const CONTRIBUTOR_ROLES = [
    {
        id: 'pixel-art',
        index: '01',
        title: 'Pixel Artists & 2D Illustrators',
        discipline: 'Visual / 2D',
        tagline: 'Bring retro-tactical mechas and chibi overworld characters to life.',
        description:
            'AniBots draws inspiration from Pokémon BDSP chibi proportions in the overworld and high-tactile robot battlers like Medabots GBA. We need artists to shape our chassis frames, character sprites, and combat arenas.',
        deliverables: [
            '5-Part modular robot chassis sprites (Head, Torso, Left Arm, Right Arm, Legs)',
            'Layered composite chibi player customization sprites (hairstyles, clothing, skin tones)',
            'Anima Chip schematic illustrations and ink sketch icons',
            'Dynamic 2D battle arena backgrounds (City, Junkyard, Badlands, Sub-Zero Ridge)',
        ],
        techStack: ['Aseprite / PyxelEdit / Photoshop', 'Indexed color palettes', 'PNG Sprite Sheets (32x32 / 64x64)'],
        issueLink: GITHUB_ISSUES,
        issueLabel: 'role: 2D & Pixel Art',
    },
    {
        id: '3d-art',
        index: '02',
        title: '3D Modelers & Animators',
        discipline: 'Mesh / Animation',
        tagline: 'Build swappable chassis parts and dynamic combat animations for Godot 4.x.',
        description:
            'Our target engine is Godot 4.x (GL Compatibility / Desktop & Mobile). We are developing modular 3D robot frames where components snap into standard sockets, paired with punchy combat animations for the 3-Phase ATB combat pipeline.',
        deliverables: [
            'Modular 3D chassis meshes with unified socket rigging (Head, Torso, Arms, Legs)',
            'Keyframe combat animations: Sprint Run, Payload Execution, Latency Return, Stagger/Knockout',
            'VFX meshes & shaders: Plasma beams, kinetic impacts, logic barrier shields',
            'Battle arena 3D dioramas and environmental props',
        ],
        techStack: ['Blender', 'glTF 2.0 / GLB export pipeline', 'Low / Mid-Poly optimization for Godot'],
        issueLink: GITHUB_ISSUES,
        issueLabel: 'role: 3D & Animation',
    },
    {
        id: 'devs',
        index: '03',
        title: 'Software & Game Developers',
        discipline: 'Godot / Engine',
        tagline: 'Architect GDScript gameplay systems, AI targeting, and SQLite persistence.',
        description:
            'AniBots runs on a clean architecture: Event Bus decoupling (SignalBus), Autoload managers, dual SQLite databases (Catalog + ACID Save state), and a weighted utility AI targeting loop.',
        deliverables: [
            'GDScript 2.0 core mechanics and 3-Phase ATB relay state machines',
            'Autonomous Anima Chip Utility AI threat scoring algorithms',
            'Dual SQLite database queries and save state migrations',
            'Full controller / keyboard input mapping and game loop polish',
        ],
        techStack: ['Godot 4.x (GDScript 2.0 strict typing)', 'SQLite (godot-sqlite)', 'Git / GitHub Actions'],
        issueLink: GITHUB_ISSUES,
        issueLabel: 'role: Game Dev',
    },
    {
        id: 'ui-ux',
        index: '04',
        title: 'UI / UX Designers',
        discipline: 'Interface',
        tagline: 'Craft diegetic garage part-swapping screens and responsive combat HUDs.',
        description:
            'Players act as Handlers managing complex hardware stats: Integrity, Condition, Payload, Latency, Clock Speed, and Weight limits. We need intuitive, retro-futuristic interfaces that make hardware customization effortless and satisfying.',
        deliverables: [
            'AniBot Garage Assembly UI (Medabots-style modular 5-slot inspector)',
            'Battle HUD: Dynamic 3-Phase ATB relay action bars, part HP cards, targeting indicators',
            'Overworld menus: Save slot selectors, character customizer, shopkeeper trade modals',
            'Godot Control theme styling & responsive screen layout design',
        ],
        techStack: ['Figma / Penpot', 'Godot Control node theming', 'Tailwind CSS (for web companion AniDex)'],
        issueLink: GITHUB_ISSUES,
        issueLabel: 'role: UI / UX',
    },
    {
        id: 'lore-audio',
        index: '05',
        title: 'Writers, Designers & Audio Composers',
        discipline: 'Lore & Sound',
        tagline: 'Compose chiptune OSTs, servo SFX, and expand the 3047 AD story universe.',
        description:
            'From the mysterious Generation 0 Ancient Cores to the Anode Group badlands syndicate, AniBots features a rich story bible. We are also building an energetic hybrid OST and tactile robotic soundscapes.',
        deliverables: [
            'Anima Chip personality dialogue engrams, battle haikus, and quest scenarios',
            'Combat balancing: Part stat scaling, scrap economy math, terrain matrices',
            'Original cyberpunk/chiptune battle soundtracks and ambient city loops',
            'Robotic SFX: Servos, hydraulic steps, energy charging, laser blasts, shield overrides',
        ],
        techStack: ['FL Studio / Ableton / Reaper', 'SFX pooling in Godot', 'Markdown World Bible'],
        issueLink: GITHUB_DISCUSSIONS,
        issueLabel: 'role: Lore & Audio',
    },
];

const MODULAR_SLOTS = [
    {
        code: 'SLT-01',
        name: 'HEAD',
        role: 'Tactical Burst & Win Condition',
        mechanic:
            'Houses high-impact utility (Logic Bombs, Scanners, Shields). Limited Cache charges. Reaching 0 HP triggers System Failure (Defeat).',
        statFocus: 'Finite Cache memory (2-4 uses), Critical Scanners, Emergency Shields',
        tag: 'Win Condition',
    },
    {
        code: 'SLT-02',
        name: 'TORSO',
        role: 'Motherboard Chassis & Heat Dissipation',
        mechanic:
            'Structural backbone providing Max Loadout weight tolerance, passive Firewall armor, and Cooling rate that lowers weapon cooldowns.',
        statFocus: 'Max Loadout (Weight Bandwidth), Firewall Mitigation, Thermal Cooling',
        tag: 'Chassis Core',
    },
    {
        code: 'SLT-03',
        name: 'LEFT ARM',
        role: 'Active Weapon / Shield / Utility',
        mechanic:
            'Primary offensive or defensive limb. Infinite usage. Melee weapons retarget dynamically at the center line; ranged weapons lock in advance.',
        statFocus: 'Payload Power, Precision Accuracy, Execution Charge, Latency Return',
        tag: 'Primary Limb',
    },
    {
        code: 'SLT-04',
        name: 'RIGHT ARM',
        role: 'Active Weapon / Shield / Utility',
        mechanic:
            'Secondary limb. Can dual-wield balanced weapons or mount super-heavy siege howitzers and barrier shields.',
        statFocus: 'Payload Power, Precision Accuracy, Execution Charge, Latency Return',
        tag: 'Secondary Limb',
    },
    {
        code: 'SLT-05',
        name: 'LEGS',
        role: 'Propulsion Platform & Terrain Protocol',
        mechanic:
            'Dictates Action Bar fill speed (Clock Speed), evasion (Packet Loss), and terrain compatibility across Bipedal, Wheeled, Tracks, Hover, Aquatic, and Multi-Leg.',
        statFocus: 'Clock Speed (Wait Phase fill), Packet Loss Evasion, Terrain Protocol',
        tag: 'Mobility Base',
    },
];

const CHIP_SERIES = [
    {
        code: 'SER-A',
        series: 'Antiquity Series',
        count: '12 Cores',
        archetype: 'Martial Disciplines',
        summary:
            'Programmed after historical martial disciplines: Ronin, Dragoon, Spartan Phalanx, Corsair, Artificer, Gunslinger, and Berserker.',
    },
    {
        code: 'SER-K',
        series: 'Kinetic Series',
        count: '12 Cores',
        archetype: 'Elemental & Industrial',
        summary:
            'Industrial and elemental engines: Spark, Magma, Cryo-Frost, Gale, Seismic Terra, Hydro-Torrent, and Caustic Corrosive.',
    },
    {
        code: 'SER-S',
        series: 'Astral Series',
        count: '12 Cores',
        archetype: 'Celestial Matrices',
        summary:
            'Rare celestial matrices: Orion Sniper, Gemini Dual-Wield, Ursa Guardian, Draco Overclock, and Leo Sovereign.',
    },
    {
        code: 'SER-0',
        series: 'Ancient Series (Gen 0)',
        count: '10 Cores',
        archetype: 'Pre-War Relics',
        summary:
            'Legendary pre-war archetypes: Vulpes Zerda, Agon Vanguard, Biggon Colossus, Cygon Cipher, and the 7 Animal Ancients.',
    },
];

const ONBOARDING_STEPS = [
    {
        step: '01',
        title: 'Join Our Discord',
        body: 'Introduce yourself in #contributions, share your portfolio or past work, and connect directly with team leads.',
    },
    {
        step: '02',
        title: 'Review Design Specs',
        body: 'Read the modular hardware specifications (PARTS.md, GAME.md, OVERVIEW.md) inside the main repository.',
    },
    {
        step: '03',
        title: 'Claim or Pitch a Task',
        body: 'Pick an issue tagged good first issue on GitHub or pitch a robot chassis, sprite sheet, or system in Discussions.',
    },
    {
        step: '04',
        title: 'Submit Pull Request',
        body: 'Fork the repository, test your assets or GDScript in Godot 4.x, and open a PR. Every contributor is credited in-game.',
    },
];

export default function Home() {
    const [activeRole, setActiveRole] = useState(CONTRIBUTOR_ROLES[0].id);
    const [activeSlot, setActiveSlot] = useState(0);

    const toggleTheme = () => {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        const nextTheme = isCurrentlyDark ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        try {
            localStorage.setItem('anibots-theme', nextTheme);
        } catch {
            // ignore storage errors
        }
    };

    const selectedRole = CONTRIBUTOR_ROLES.find((r) => r.id === activeRole) || CONTRIBUTOR_ROLES[0];
    const currentSlot = MODULAR_SLOTS[activeSlot];

    return (
        <div className='min-h-screen flex flex-col bg-background text-foreground selection:bg-accent selection:text-white'>
            {/* Top Editorial Masthead */}
            <header className='sticky top-0 z-50 bg-background/95 backdrop-blur-xs border-b border-border'>
                <div className='max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-6'>
                        <a href='#' className='flex items-baseline gap-2.5 group'>
                            <span className='w-2.5 h-2.5 bg-accent inline-block transition-transform group-hover:scale-125' />
                            <span className='font-bold tracking-tight text-lg uppercase'>AniBots</span>
                            <span className='font-mono text-[11px] text-muted hidden sm:inline-block'>
                                SPEC // GODOT 4.X
                            </span>
                        </a>
                    </div>

                    <nav className='hidden lg:flex items-center gap-7 text-xs font-mono uppercase tracking-wider text-muted'>
                        <a href='#overview' className='hover:text-foreground transition-colors'>
                            Overview
                        </a>
                        <Link href='/characters/' className='hover:text-foreground transition-colors font-semibold text-foreground/90'>
                            Characters
                        </Link>
                        <Link href='/lore/' className='hover:text-foreground transition-colors font-semibold text-foreground/90'>
                            Lore
                        </Link>
                        <a href='#architecture' className='hover:text-foreground transition-colors'>
                            Architecture
                        </a>
                        <a href='#contributors' className='text-foreground font-semibold hover:text-accent transition-colors'>
                            Contributors
                        </a>
                        <a href='#directory' className='hover:text-foreground transition-colors'>
                            Directory
                        </a>
                    </nav>

                    <div className='flex items-center gap-2 sm:gap-3'>
                        <button
                            onClick={toggleTheme}
                            type='button'
                            aria-label='Toggle color theme'
                            className='px-3 py-1.5 border border-border bg-surface hover:border-foreground text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2'
                        >
                            <span className='w-2 h-2 rounded-full bg-amber-500 dark:bg-foreground' />
                            <span className='dark:hidden'>Light</span>
                            <span className='hidden dark:inline'>Dark</span>
                        </button>

                        <a
                            href={ANIDEX_URL}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-accent/40 bg-accent/10 hover:bg-accent hover:text-white text-accent text-xs font-mono uppercase tracking-wider font-semibold transition-colors'
                        >
                            AniDex ↗
                        </a>

                        <a
                            href={GITHUB_REPO}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='px-3.5 py-1.5 bg-foreground text-background hover:bg-accent hover:text-white text-xs font-mono uppercase tracking-wider font-medium transition-colors'
                        >
                            GitHub ↗
                        </a>
                    </div>
                </div>
            </header>

            <main className='flex-1'>
                {/* SECTION 01: EDITORIAL HERO */}
                <section id='overview' className='border-b border-border'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-8'>
                        {/* Metadata Sub-header bar */}
                        <div className='py-4 border-b border-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted'>
                            <div className='flex items-center gap-4'>
                                <span className='text-foreground font-semibold'>INDEX 01 — PROJECT MANIFESTO</span>
                                <span className='hidden sm:inline'>|</span>
                                <span className='hidden sm:inline'>OPEN-SOURCE TACTICAL RPG</span>
                            </div>
                            <div className='flex items-center gap-4'>
                                <a
                                    href={ANIDEX_URL}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-foreground hover:text-accent font-medium transition-colors'
                                >
                                    ANIDEX: LIVE ↗
                                </a>
                                <span>•</span>
                                <span className='text-accent font-medium'>STATUS: RECRUITING CONTRIBUTORS</span>
                            </div>
                        </div>

                        {/* Main Asymmetric Hero Grid */}
                        <div className='grid lg:grid-cols-12 border-b border-border'>
                            <div className='lg:col-span-8 py-14 sm:py-20 lg:pr-12 lg:border-r border-border flex flex-col justify-between'>
                                <div>
                                    <p className='font-mono text-xs uppercase tracking-widest text-accent mb-5'>
                                        Modular Mecha Engineering & Autonomous AI
                                    </p>
                                    <h1 className='text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight leading-[0.98] text-foreground'>
                                        Assemble modular machines. Command autonomous souls.
                                    </h1>
                                </div>

                                <div className='mt-10 sm:mt-14 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-end justify-between gap-8'>
                                    <p className='text-base sm:text-lg text-muted max-w-xl leading-relaxed'>
                                        AniBots is an open-source tactical RPG built in Godot 4.x. It combines classic 3-phase relay line combat (inspired by Medabots GBA) with 5-slot swappable hardware, persistent part degradation, and weighted utility AI cores known as <strong className='text-foreground font-medium'>Anima Chips</strong>.
                                    </p>

                                    <div className='flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0'>
                                        <a
                                            href='#contributors'
                                            className='px-6 py-3.5 bg-accent text-white font-mono text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity text-center'
                                        >
                                            Contribute to AniBots
                                        </a>
                                        <a
                                            href={ANIDEX_URL}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='px-6 py-3.5 border border-foreground bg-foreground text-background hover:bg-accent hover:border-accent hover:text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors text-center'
                                        >
                                            Launch AniDex ↗
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Technical Specification Sheet */}
                            <div className='lg:col-span-4 py-10 lg:py-20 lg:pl-10 flex flex-col justify-between bg-surface/40 lg:bg-transparent -mx-4 px-4 sm:mx-0 sm:px-0'>
                                <div>
                                    <div className='font-mono text-xs uppercase tracking-wider text-muted pb-3 border-b border-border'>
                                        System Specification
                                    </div>
                                    <dl className='divide-y divide-border font-mono text-xs'>
                                        <div className='py-3.5 flex justify-between gap-4'>
                                            <dt className='text-muted'>TARGET ENGINE</dt>
                                            <dd className='text-foreground font-medium text-right'>Godot 4.x (GDScript 2.0)</dd>
                                        </div>
                                        <div className='py-3.5 flex justify-between gap-4'>
                                            <dt className='text-muted'>PERSISTENCE</dt>
                                            <dd className='text-foreground font-medium text-right'>Dual SQLite (Catalog + ACID)</dd>
                                        </div>
                                        <div className='py-3.5 flex justify-between gap-4'>
                                            <dt className='text-muted'>COMBAT LOOP</dt>
                                            <dd className='text-foreground font-medium text-right'>3-Phase ATB Relay Line</dd>
                                        </div>
                                        <div className='py-3.5 flex justify-between gap-4'>
                                            <dt className='text-muted'>TARGETING LOGIC</dt>
                                            <dd className='text-foreground font-medium text-right'>Weighted Utility AI</dd>
                                        </div>
                                        <div className='py-3.5 flex justify-between gap-4'>
                                            <dt className='text-muted'>WEB DATABASE</dt>
                                            <dd className='text-right'>
                                                <a
                                                    href={ANIDEX_URL}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-accent hover:underline font-medium'
                                                >
                                                    anibots.c42759.dev/dex/ ↗
                                                </a>
                                            </dd>
                                        </div>
                                        <div className='py-3.5 flex justify-between gap-4'>
                                            <dt className='text-muted'>ERA / SETTING</dt>
                                            <dd className='text-foreground font-medium text-right'>3047 AD Post-Collapse</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className='mt-8 p-4 border border-border bg-surface space-y-3'>
                                    <div>
                                        <div className='font-mono text-[11px] uppercase tracking-wider text-muted mb-0.5'>
                                            Public Companion Database
                                        </div>
                                        <a
                                            href={ANIDEX_URL}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline font-semibold'
                                        >
                                            Open Public AniDex (Live) ↗
                                        </a>
                                    </div>
                                    <div className='pt-3 border-t border-border'>
                                        <div className='font-mono text-[11px] uppercase tracking-wider text-muted mb-0.5'>
                                            Repository Access
                                        </div>
                                        <a
                                            href={GITHUB_REPO}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex items-center gap-1.5 font-mono text-xs text-foreground hover:text-accent transition-colors font-medium'
                                        >
                                            github.com/c42759/AniBots ↗
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cinematic Hero Artwork Banner */}
                        <div className='py-8 sm:py-12 border-b border-border'>
                            <div className='relative overflow-hidden border border-border bg-surface/50 group'>
                                {/* Technical HUD Corner Overlays */}
                                <div className='absolute top-3 left-3 z-10 font-mono text-[10px] text-foreground/80 uppercase tracking-widest bg-background/90 px-2.5 py-1 border border-border backdrop-blur-xs flex items-center gap-2'>
                                    <span className='w-1.5 h-1.5 bg-accent inline-block' />
                                    <span>FIG. 01 // HANDLER & PARTNER CHASSIS</span>
                                </div>
                                <div className='absolute bottom-3 right-3 z-10 font-mono text-[10px] text-foreground/80 uppercase tracking-widest bg-background/90 px-2.5 py-1 border border-border backdrop-blur-xs hidden sm:flex items-center gap-2'>
                                    <span>KURA ATO & ZERDATA</span>
                                    <span className='text-accent'>•</span>
                                    <span>VULPES ZERDA G0-004</span>
                                </div>
                                <img
                                    src='/images/hero-banner.jpg'
                                    alt='AniBots Protagonist Kura Ato and Zerdata Chassis'
                                    className='w-full h-auto object-cover max-h-[580px] transition-transform duration-700 group-hover:scale-[1.01]'
                                    loading='eager'
                                />
                            </div>
                        </div>

                        {/* Quantitative Strip */}
                        <div className='grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border'>
                            <div className='py-8 pr-6'>
                                <div className='font-mono text-xs text-muted uppercase'>01 / Chassis Frames</div>
                                <div className='mt-2 text-3xl sm:text-4xl font-bold tracking-tight'>53+</div>
                                <div className='mt-1 text-xs text-muted'>5 Series: Antiquity, Kinetic, Astral, Ancient, Primal</div>
                            </div>
                            <div className='py-8 md:px-6'>
                                <div className='font-mono text-xs text-muted uppercase'>02 / Swappable Parts</div>
                                <div className='mt-2 text-3xl sm:text-4xl font-bold tracking-tight'>265</div>
                                <div className='mt-1 text-xs text-muted'>Individual modular hardware components</div>
                            </div>
                            <div className='py-8 pr-6 md:px-6'>
                                <div className='font-mono text-xs text-muted uppercase'>03 / Anima Chips</div>
                                <div className='mt-2 text-3xl sm:text-4xl font-bold tracking-tight'>46</div>
                                <div className='mt-1 text-xs text-muted'>Autonomous AI personalities & matrices</div>
                            </div>
                            <div className='py-8 md:pl-6'>
                                <div className='font-mono text-xs text-muted uppercase'>04 / Hardware Slots</div>
                                <div className='mt-2 text-3xl sm:text-4xl font-bold tracking-tight'>5-Part</div>
                                <div className='mt-1 text-xs text-muted'>Head, Torso, Left/Right Arms, Legs</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 02: HARDWARE ARCHITECTURE & ANIMA CORES */}
                <section id='architecture' className='border-b border-border py-20 sm:py-28'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-8'>
                        {/* Section Header */}
                        <div className='grid lg:grid-cols-12 gap-8 pb-12 border-b border-border items-end'>
                            <div className='lg:col-span-7'>
                                <div className='font-mono text-xs uppercase tracking-widest text-muted mb-3'>
                                    INDEX 02 — HARDWARE ARCHITECTURE
                                </div>
                                <h2 className='text-3xl sm:text-5xl font-bold tracking-tight leading-tight'>
                                    Five-Slot Modular Anatomy
                                </h2>
                            </div>
                            <div className='lg:col-span-5'>
                                <p className='text-sm sm:text-base text-muted leading-relaxed'>
                                    Every AniBot is assembled from five distinct mechanical sockets. Handlers balance weight bandwidth, thermal dissipation, and locomotion protocols while managing part-by-part structural integrity in combat.
                                </p>
                            </div>
                        </div>

                        {/* Interactive 5-Slot Schematic Table */}
                        <div className='grid lg:grid-cols-12 border-b border-border'>
                            {/* Left Selector List */}
                            <div className='lg:col-span-5 lg:border-r border-border divide-y divide-border'>
                                {MODULAR_SLOTS.map((slot, index) => {
                                    const isSelected = activeSlot === index;
                                    return (
                                        <button
                                            key={slot.code}
                                            type='button'
                                            onClick={() => setActiveSlot(index)}
                                            className={`w-full text-left p-5 sm:p-6 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                                                isSelected
                                                    ? 'bg-foreground text-background'
                                                    : 'bg-background hover:bg-surface text-foreground'
                                            }`}
                                        >
                                            <div className='flex items-baseline gap-4'>
                                                <span
                                                    className={`font-mono text-xs ${
                                                        isSelected ? 'text-accent font-bold' : 'text-muted'
                                                    }`}
                                                >
                                                    {slot.code}
                                                </span>
                                                <div>
                                                    <div className='font-bold tracking-tight text-base sm:text-lg'>
                                                        {slot.name}
                                                    </div>
                                                    <div
                                                        className={`text-xs mt-0.5 ${
                                                            isSelected ? 'text-background/75' : 'text-muted'
                                                        }`}
                                                    >
                                                        {slot.role}
                                                    </div>
                                                </div>
                                            </div>
                                            <span
                                                className={`font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 border ${
                                                    isSelected
                                                        ? 'border-background/30 text-background'
                                                        : 'border-border text-muted'
                                                }`}
                                            >
                                                {slot.tag}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right Inspector Readout */}
                            <div className='lg:col-span-7 p-6 sm:p-12 bg-surface/50 flex flex-col justify-between'>
                                <div>
                                    <div className='flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-border'>
                                        <div className='font-mono text-xs text-muted uppercase tracking-wider'>
                                            COMPONENT SPECIFICATION // {currentSlot.code}
                                        </div>
                                        <div className='font-mono text-xs font-semibold text-accent uppercase'>
                                            [{currentSlot.tag}]
                                        </div>
                                    </div>

                                    <h3 className='mt-6 text-2xl sm:text-4xl font-bold tracking-tight'>
                                        {currentSlot.name} ASSEMBLY
                                    </h3>
                                    <p className='mt-1 font-mono text-xs text-muted uppercase tracking-wider'>
                                        {currentSlot.role}
                                    </p>

                                    <div className='mt-8 space-y-6'>
                                        <div>
                                            <h4 className='font-mono text-xs uppercase tracking-wider text-muted mb-2'>
                                                Mechanical Function & Combat Rule
                                            </h4>
                                            <p className='text-base sm:text-lg leading-relaxed text-foreground'>
                                                {currentSlot.mechanic}
                                            </p>
                                        </div>

                                        <div className='p-5 bg-background border border-border'>
                                            <div className='font-mono text-xs uppercase tracking-wider text-muted mb-1.5'>
                                                Primary Scaling Parameters
                                            </div>
                                            <div className='font-mono text-sm font-medium text-foreground'>
                                                {currentSlot.statFocus}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-10 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs text-muted'>
                                    <div className='flex flex-wrap gap-6'>
                                        <div>
                                            <span className='block text-foreground font-semibold'>38 Archetypes</span>
                                            Cataloged per slot
                                        </div>
                                        <div>
                                            <span className='block text-foreground font-semibold'>ACID State</span>
                                            Persistent wear & tear
                                        </div>
                                        <div>
                                            <span className='block text-foreground font-semibold'>Socket Rigged</span>
                                            Standardized 3D attachment
                                        </div>
                                    </div>
                                    <a
                                        href='/dex/parts/'
                                        className='text-accent hover:underline font-semibold shrink-0'
                                    >
                                        Browse All 190 Parts in AniDex ↗
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Anima Chip AI Cores Sub-Section */}
                        <div className='pt-16 sm:pt-20'>
                            <div className='flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4'>
                                <div>
                                    <div className='font-mono text-xs uppercase tracking-widest text-muted mb-2'>
                                        AUTONOMOUS DECISION MATRICES
                                    </div>
                                    <h3 className='text-2xl sm:text-3xl font-bold tracking-tight'>
                                        Anima Chip AI Series
                                    </h3>
                                </div>
                                <p className='text-sm text-muted max-w-xl'>
                                    Rather than micromanaging every target, Handlers slot an Anima Chip that evaluates battlefield threat scores using a Weighted Utility AI loop, complete with personality engrams and battle haikus.
                                </p>
                            </div>

                            <div className='grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-border'>
                                {CHIP_SERIES.map((chip) => (
                                    <div
                                        key={chip.code}
                                        className='p-6 sm:p-7 border-r border-b border-border bg-background hover:bg-surface/60 transition-colors flex flex-col justify-between'
                                    >
                                        <div>
                                            <div className='flex items-center justify-between font-mono text-xs text-muted mb-4'>
                                                <span>{chip.code}</span>
                                                <span className='px-2 py-0.5 bg-surface border border-border text-foreground font-medium'>
                                                    {chip.count}
                                                </span>
                                            </div>
                                            <h4 className='text-lg font-bold tracking-tight'>{chip.series}</h4>
                                            <div className='font-mono text-[11px] text-accent uppercase tracking-wider mt-0.5 mb-4'>
                                                {chip.archetype}
                                            </div>
                                            <p className='text-xs sm:text-sm text-muted leading-relaxed'>
                                                {chip.summary}
                                            </p>
                                        </div>

                                        <div className='mt-6 pt-4 border-t border-border flex items-center justify-between font-mono text-[11px] text-muted'>
                                            <span>UTILITY AI</span>
                                            <span className='text-foreground font-medium'>WEIGHTED SCORING</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 03: CONTRIBUTOR RECRUITMENT HUB */}
                <section id='contributors' className='border-b border-border py-20 sm:py-28 bg-surface/30'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-8'>
                        {/* Header */}
                        <div className='grid lg:grid-cols-12 gap-8 pb-12 border-b border-border items-end'>
                            <div className='lg:col-span-7'>
                                <div className='inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent mb-3'>
                                    <span className='w-2 h-2 bg-accent inline-block' />
                                    INDEX 03 — OPEN CALL FOR CONTRIBUTORS
                                </div>
                                <h2 className='text-3xl sm:text-5xl font-bold tracking-tight leading-tight'>
                                    Built in the open by artists, animators & engineers.
                                </h2>
                            </div>
                            <div className='lg:col-span-5'>
                                <p className='text-sm sm:text-base text-muted leading-relaxed'>
                                    AniBots is an independent community production. Whether you craft pixel sprites, rig low-poly 3D mechas in Blender, write GDScript systems, or compose chiptunes, select your discipline below to inspect open deliverables.
                                </p>
                            </div>
                        </div>

                        {/* Role Navigation Tabs (Editorial Index Bar) */}
                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-b border-l border-border'>
                            {CONTRIBUTOR_ROLES.map((role) => {
                                const isActive = activeRole === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        type='button'
                                        onClick={() => setActiveRole(role.id)}
                                        className={`p-4 sm:p-5 text-left border-r border-b lg:border-b-0 border-border transition-colors cursor-pointer flex flex-col justify-between ${
                                            isActive
                                                ? 'bg-foreground text-background'
                                                : 'bg-background hover:bg-surface text-foreground'
                                        }`}
                                    >
                                        <div className='flex items-center justify-between w-full font-mono text-[11px] mb-3'>
                                            <span className={isActive ? 'text-accent font-bold' : 'text-muted'}>
                                                ROLE {role.index}
                                            </span>
                                            <span className={isActive ? 'text-background/70' : 'text-muted'}>
                                                {role.discipline}
                                            </span>
                                        </div>
                                        <div className='font-bold text-sm tracking-tight leading-snug'>
                                            {role.title}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Role Specification Sheet */}
                        <div className='grid lg:grid-cols-12 border-b border-l border-r border-border bg-background'>
                            <div className='lg:col-span-8 p-6 sm:p-12 lg:border-r border-border'>
                                <div className='flex items-center gap-3 font-mono text-xs text-muted mb-3'>
                                    <span className='px-2 py-0.5 bg-surface border border-border text-foreground font-semibold'>
                                        {selectedRole.discipline}
                                    </span>
                                    <span>•</span>
                                    <span>DISCIPLINE TRACK {selectedRole.index}</span>
                                </div>

                                <h3 className='text-2xl sm:text-4xl font-bold tracking-tight'>
                                    {selectedRole.title}
                                </h3>
                                <p className='mt-2 font-mono text-xs sm:text-sm text-accent font-medium'>
                                    {selectedRole.tagline}
                                </p>

                                <p className='mt-6 text-sm sm:text-base text-muted leading-relaxed'>
                                    {selectedRole.description}
                                </p>

                                <div className='mt-10'>
                                    <h4 className='font-mono text-xs uppercase tracking-wider text-muted pb-3 border-b border-border'>
                                        Key Deliverables & Asset Specifications
                                    </h4>
                                    <ul className='divide-y divide-border'>
                                        {selectedRole.deliverables.map((item, idx) => (
                                            <li key={idx} className='py-3.5 flex items-start gap-3.5 text-sm'>
                                                <span className='font-mono text-xs text-accent font-bold mt-0.5'>
                                                    0{idx + 1}
                                                </span>
                                                <span className='text-foreground'>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column: Tooling & Direct Action */}
                            <div className='lg:col-span-4 p-6 sm:p-10 bg-surface/40 flex flex-col justify-between'>
                                <div>
                                    <h4 className='font-mono text-xs uppercase tracking-wider text-muted pb-3 border-b border-border'>
                                        Target Tooling & Formats
                                    </h4>
                                    <div className='mt-4 flex flex-wrap gap-2'>
                                        {selectedRole.techStack.map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className='font-mono text-xs px-3 py-1.5 bg-background border border-border text-foreground'
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className='mt-8 pt-6 border-t border-border'>
                                        <div className='font-mono text-xs uppercase tracking-wider text-muted mb-2'>
                                            Issue Board Filter
                                        </div>
                                        <div className='font-mono text-xs text-foreground bg-background px-3 py-2 border border-border'>
                                            label:&quot;{selectedRole.issueLabel}&quot;
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-10 pt-6 border-t border-border space-y-3'>
                                    <a
                                        href={selectedRole.issueLink}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-full block text-center px-5 py-3.5 bg-accent text-white font-mono text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity'
                                    >
                                        Browse Open Issues ↗
                                    </a>
                                    <a
                                        href={DISCORD_INVITE_URL}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='w-full block text-center px-5 py-3.5 border border-border bg-background hover:border-foreground text-foreground font-mono text-xs uppercase tracking-wider font-medium transition-colors'
                                    >
                                        Coordinate on Discord ↗
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 04: ONBOARDING PROTOCOL */}
                <section id='protocol' className='border-b border-border py-20 sm:py-28'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-8'>
                        <div className='flex flex-col md:flex-row md:items-end justify-between pb-12 border-b border-border gap-6'>
                            <div>
                                <div className='font-mono text-xs uppercase tracking-widest text-muted mb-3'>
                                    INDEX 04 — CONTRIBUTION PROTOCOL
                                </div>
                                <h2 className='text-3xl sm:text-4xl font-bold tracking-tight'>
                                    How to Join the Production
                                </h2>
                            </div>
                            <p className='text-sm text-muted max-w-md'>
                                First-time open-source contributors and veteran game developers follow the same streamlined four-step workflow.
                            </p>
                        </div>

                        <div className='grid md:grid-cols-4 border-b border-l border-border'>
                            {ONBOARDING_STEPS.map((item) => (
                                <div
                                    key={item.step}
                                    className='p-6 sm:p-8 border-r border-b md:border-b-0 border-border flex flex-col justify-between'
                                >
                                    <div>
                                        <div className='font-mono text-xs text-accent font-bold mb-6'>
                                            STEP // {item.step}
                                        </div>
                                        <h3 className='text-lg font-bold tracking-tight mb-3'>{item.title}</h3>
                                        <p className='text-xs sm:text-sm text-muted leading-relaxed'>{item.body}</p>
                                    </div>
                                    <div className='mt-8 pt-4 border-t border-border font-mono text-[11px] text-muted uppercase'>
                                        Phase {item.step}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Creator Attribution & AI Policy */}
                        <div className='mt-12 p-6 sm:p-8 border border-border bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
                            <div className='max-w-3xl'>
                                <div className='font-mono text-xs uppercase tracking-wider text-foreground font-semibold mb-1.5'>
                                    Creator Attribution & Tooling Policy
                                </div>
                                <p className='text-xs sm:text-sm text-muted leading-relaxed'>
                                    Every human artist, modeler, writer, composer, and developer is permanently credited in the in-game databank and official project credits. AI-assisted workflow tools are permitted to accelerate prototyping, while human craft and authorship remain at the heart of AniBots.
                                </p>
                            </div>
                            <a
                                href={GITHUB_DISCUSSIONS}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='shrink-0 px-5 py-2.5 border border-border bg-background hover:border-foreground font-mono text-xs uppercase tracking-wider transition-colors'
                            >
                                Read Governance ↗
                            </a>
                        </div>
                    </div>
                </section>

                {/* SECTION 05: COMMUNITY & DIRECTORY */}
                <section id='directory' className='py-20 sm:py-28'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-8'>
                        <div className='grid lg:grid-cols-12 gap-12'>
                            {/* Left Column: Direct Channels */}
                            <div className='lg:col-span-7'>
                                <div className='font-mono text-xs uppercase tracking-widest text-muted mb-3'>
                                    INDEX 05 — PROJECT DIRECTORY
                                </div>
                                <h2 className='text-3xl sm:text-4xl font-bold tracking-tight mb-8'>
                                    Database, Repositories & Channels
                                </h2>

                                <div className='divide-y divide-border border-t border-b border-border'>
                                    <Link
                                        href='/characters/'
                                        className='py-6 flex items-start justify-between gap-4 group'
                                    >
                                        <div>
                                            <div className='font-mono text-xs text-accent font-semibold uppercase mb-1'>
                                                01 / Characters Databank (11 Roster Profiles)
                                            </div>
                                            <h3 className='text-lg font-bold group-hover:text-accent transition-colors'>
                                                Handlers, Mentors & Syndicate Roster
                                            </h3>
                                            <p className='text-xs sm:text-sm text-muted mt-1 max-w-xl'>
                                                Explore character backgrounds, partner machines, personality engrams, and official turnaround artwork.
                                            </p>
                                        </div>
                                        <span className='font-mono text-xs text-accent group-hover:underline shrink-0 mt-1 font-medium'>
                                            /characters/ ↗
                                        </span>
                                    </Link>

                                    <Link
                                        href='/lore/'
                                        className='py-6 flex items-start justify-between gap-4 group'
                                    >
                                        <div>
                                            <div className='font-mono text-xs text-accent font-semibold uppercase mb-1'>
                                                02 / World Lore & Canon Bible (6 Chapters)
                                            </div>
                                            <h3 className='text-lg font-bold group-hover:text-accent transition-colors'>
                                                3047 AD Setting & Historical Archives
                                            </h3>
                                            <p className='text-xs sm:text-sm text-muted mt-1 max-w-xl'>
                                                Read the 31st century history, Anima Stone origins, Quality Control tiers, Vault 7 rebellion, and World Cup tournament arc.
                                            </p>
                                        </div>
                                        <span className='font-mono text-xs text-accent group-hover:underline shrink-0 mt-1 font-medium'>
                                            /lore/ ↗
                                        </span>
                                    </Link>

                                    <a
                                        href={ANIDEX_URL}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='py-6 flex items-start justify-between gap-4 group'
                                    >
                                        <div>
                                            <div className='font-mono text-xs text-accent font-semibold uppercase mb-1'>
                                                03 / Public Companion Database (Live)
                                            </div>
                                            <h3 className='text-lg font-bold group-hover:text-accent transition-colors'>
                                                AniDex Web Database
                                            </h3>
                                            <p className='text-xs sm:text-sm text-muted mt-1 max-w-xl'>
                                                Browse the live public catalog of 53+ robot chassis archetypes, 265 modular hardware parts, and 46 Anima Chip AI cores.
                                            </p>
                                        </div>
                                        <span className='font-mono text-xs text-accent group-hover:underline shrink-0 mt-1 font-medium'>
                                            anibots.c42759.dev/dex/ ↗
                                        </span>
                                    </a>

                                    <a
                                        href={GITHUB_REPO}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='py-6 flex items-start justify-between gap-4 group'
                                    >
                                        <div>
                                            <div className='font-mono text-xs text-muted uppercase mb-1'>
                                                02 / Primary Codebase
                                            </div>
                                            <h3 className='text-lg font-bold group-hover:text-accent transition-colors'>
                                                GitHub Game Repository
                                            </h3>
                                            <p className='text-xs sm:text-sm text-muted mt-1 max-w-xl'>
                                                Godot 4.x project source, GDScript singletons, SQLite schemas, and full game design documentation.
                                            </p>
                                        </div>
                                        <span className='font-mono text-xs text-muted group-hover:text-foreground shrink-0 mt-1'>
                                            github.com/c42759/AniBots ↗
                                        </span>
                                    </a>

                                    <a
                                        href={GITHUB_DISCUSSIONS}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='py-6 flex items-start justify-between gap-4 group'
                                    >
                                        <div>
                                            <div className='font-mono text-xs text-muted uppercase mb-1'>
                                                03 / Design & RFCs
                                            </div>
                                            <h3 className='text-lg font-bold group-hover:text-accent transition-colors'>
                                                GitHub Discussions
                                            </h3>
                                            <p className='text-xs sm:text-sm text-muted mt-1 max-w-xl'>
                                                Pitch new robot chassis concepts, propose Anima Chip personalities, and collaborate on combat balance math.
                                            </p>
                                        </div>
                                        <span className='font-mono text-xs text-muted group-hover:text-foreground shrink-0 mt-1'>
                                            Discussions ↗
                                        </span>
                                    </a>

                                    <a
                                        href={GITHUB_ISSUES}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='py-6 flex items-start justify-between gap-4 group'
                                    >
                                        <div>
                                            <div className='font-mono text-xs text-muted uppercase mb-1'>
                                                04 / Task Tracking
                                            </div>
                                            <h3 className='text-lg font-bold group-hover:text-accent transition-colors'>
                                                GitHub Issue Board
                                            </h3>
                                            <p className='text-xs sm:text-sm text-muted mt-1 max-w-xl'>
                                                Track active engineering tasks, art asset requests, bug reports, and beginner-friendly tickets.
                                            </p>
                                        </div>
                                        <span className='font-mono text-xs text-muted group-hover:text-foreground shrink-0 mt-1'>
                                            Issues ↗
                                        </span>
                                    </a>
                                </div>
                            </div>

                            {/* Right Column: Discord Dispatch Box */}
                            <div className='lg:col-span-5'>
                                <div className='border border-border bg-surface p-6 sm:p-10 h-full flex flex-col justify-between'>
                                    <div>
                                        <div className='flex items-center justify-between pb-4 border-b border-border'>
                                            <span className='font-mono text-xs uppercase tracking-wider text-foreground font-semibold'>
                                                REAL-TIME COORDINATION
                                            </span>
                                            <span className='inline-flex items-center gap-1.5 font-mono text-[11px] text-accent font-medium'>
                                                <span className='w-1.5 h-1.5 rounded-full bg-accent' />
                                                ACTIVE SERVER
                                            </span>
                                        </div>

                                        <h3 className='mt-6 text-2xl font-bold tracking-tight'>
                                            AniBots Discord Server
                                        </h3>
                                        <p className='mt-2 text-xs sm:text-sm text-muted leading-relaxed'>
                                            Work alongside developers, pixel artists, and 3D modelers in dedicated production channels. Share WIP assets and test pre-release combat builds.
                                        </p>

                                        <div className='mt-6 space-y-2.5 font-mono text-xs'>
                                            <div className='p-3 bg-background border border-border flex items-center justify-between'>
                                                <span className='font-semibold text-foreground'>#contributions</span>
                                                <span className='text-muted'>Asset & code coordination</span>
                                            </div>
                                            <div className='p-3 bg-background border border-border flex items-center justify-between'>
                                                <span className='font-semibold text-foreground'>#playtesting</span>
                                                <span className='text-muted'>ATB combat & balance builds</span>
                                            </div>
                                            <div className='p-3 bg-background border border-border flex items-center justify-between'>
                                                <span className='font-semibold text-foreground'>#lore-and-audio</span>
                                                <span className='text-muted'>World bible & OST composition</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='mt-8 pt-6 border-t border-border'>
                                        <a
                                            href={DISCORD_INVITE_URL}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='w-full block text-center px-6 py-4 bg-foreground text-background hover:bg-accent hover:text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors'
                                        >
                                            Launch Discord Invite ↗
                                        </a>
                                        <div className='mt-3 text-center font-mono text-[11px] text-muted'>
                                            INVITE CODE: <span className='text-foreground select-all'>discord.gg/FEjMjNGRFg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Editorial Footer */}
            <footer className='border-t border-border bg-surface/50 py-10 font-mono text-xs text-muted'>
                <div className='max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div className='flex items-center gap-2.5'>
                        <span className='w-2 h-2 bg-accent inline-block' />
                        <span className='text-foreground font-semibold'>ANIBOTS PROJECT</span>
                        <span>— OPEN SOURCE TACTICAL RPG</span>
                    </div>

                    <div className='flex items-center gap-6'>
                        <a href={ANIDEX_URL} target='_blank' rel='noopener noreferrer' className='text-foreground hover:text-accent font-semibold transition-colors'>
                            AniDex ↗
                        </a>
                        <a href={GITHUB_REPO} target='_blank' rel='noopener noreferrer' className='hover:text-foreground transition-colors'>
                            GitHub
                        </a>
                        <a href={GITHUB_DISCUSSIONS} target='_blank' rel='noopener noreferrer' className='hover:text-foreground transition-colors'>
                            Discussions
                        </a>
                        <a href={GITHUB_ISSUES} target='_blank' rel='noopener noreferrer' className='hover:text-foreground transition-colors'>
                            Issues
                        </a>
                        <a href={DISCORD_INVITE_URL} target='_blank' rel='noopener noreferrer' className='hover:text-foreground transition-colors'>
                            Discord
                        </a>
                    </div>

                    <div>MIT LICENSE • GODOT 4.X</div>
                </div>
            </footer>
        </div>
    );
}

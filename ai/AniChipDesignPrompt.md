# AniChip Schematic & Ink Design Prompt Guide

> [!NOTE]
> - **Standard Anima Chips Catalog**: For official chip names, models, and series, see [CHIPS.md](../CHIPS.md).
> - **Ancient Series Cores**: For Generation 0 chips, see [CHARACTERS.md](../CHARACTERS.md#the-10-legendary-ancient-series-anichips-generation-0).
> - **Project Portal**: [README.md](../README.md).

This document provides reusable AI image generation prompt templates to create technical ink schematic sketches for any **AniChip / AnimaChip**.

---

## 1. Master Reusable Prompt Template

Fill in the bracketed variables `[LIKE_THIS]` before submitting to the image generator:

```text
A detailed technical schematic ink sketch of the AniChip "[CHIP_NAME]" (Model: [MODEL_NAME], ID: [ID_NUMBER], Series: [SERIES_NAME]). Drawn on a warm off-white yellowish parchment sketch paper background with crisp black ink lines and fine technical pen cross-hatching.

The illustration shows a mechanical blueprint and architectural line-art layout of the AniChip cartridge: displaying an orthographic front view and technical callout details of the rectangular translucent outer shell with rounded corners and corner security screws, top title header zone, central circular emblem slot containing [EMBLEM_DESCRIPTION], surrounding PCB circuit trace lines and micro-components, lower stat display meters ([STAT_1], [STAT_2], [STAT_3]), and bottom array of 8 gold edge pin contacts.

Styled as a professional draftsman schematic draft with clean black ink pen lines, subtle pencil guide lines, dimension arrows, technical annotations, and a title block at the bottom right.
```

---

## 2. Parameter Reference Table

| Variable | Description | Example Values |
| :--- | :--- | :--- |
| `[CHIP_NAME]` | Name of the chip | `RONIN`, `THUNDERBOLT`, `PYRO BLAST`, `AERO DASH` |
| `[MODEL_NAME]` | Model designation | `RONIN-01`, `VOLT-X`, `FLAME-CORE`, `ZEPHYR` |
| `[ID_NUMBER]` | ID number tag | `#004`, `#012`, `#089` |
| `[SERIES_NAME]` | Chip series or rarity class | `ANTIQUITY`, `ELEMENTAL`, `CYBER`, `PROTOTYPE` |
| `[EMBLEM_DESCRIPTION]` | Central medallion icon details | `a glowing samurai mask crest`, `a sharp lightning bolt symbol`, `a roaring dragon head emblem` |
| `[STAT_1]`, `[STAT_2]`, `[STAT_3]` | Primary chip stats shown | `ATK`, `SPD`, `DEF`, `PWR`, `CRIT`, `ENG` |

---

## 3. Ready-To-Use Examples

### Example A: Thunderbolt Chip Schematic

> `A detailed technical schematic ink sketch of the AniChip "THUNDERBOLT" (Model: VOLT-X, ID: #007, Series: ELEMENTAL). Drawn on a warm off-white yellowish parchment sketch paper background with crisp black ink lines and fine technical pen cross-hatching. The illustration shows a mechanical blueprint and architectural line-art layout of the AniChip cartridge: displaying an orthographic front view and technical callout details of the rectangular outer shell with rounded corners, top title header zone, central circular emblem slot featuring a sharp lightning bolt crest, surrounding electric PCB circuit trace lines and micro-capacitors, lower stat display meters (ATK, SPD, PWR), and bottom array of gold edge pin contacts. Styled as a professional draftsman schematic draft with clean black ink pen lines, subtle pencil guide lines, dimension arrows, and hand-drawn technical blueprint annotations.`

### Example B: Pyro Flame Chip Schematic

> `A detailed technical schematic ink sketch of the AniChip "PYRO BLAST" (Model: IGNIS-02, ID: #015, Series: TACTICAL). Drawn on a warm off-white yellowish parchment sketch paper background with crisp black ink lines and fine technical pen cross-hatching. The illustration shows a mechanical blueprint and architectural line-art layout of the AniChip cartridge: displaying an orthographic front view and exploded assembly view of the rectangular outer shell with rounded corners, top title header zone, central circular emblem slot with a flame emblem crest, surrounding thermal PCB circuit traces, lower stat display meters (ATK, HEAT, DEF), and bottom edge pin contacts. Styled as a professional draftsman schematic draft with clean black ink pen lines, dimension arrows, and hand-drawn blueprint annotations.`

---

## 4. Key Style & Aesthetic Requirements

When tweaking prompts, preserve these key terms for visual consistency across all chips:

- **Background**: `warm off-white yellowish parchment sketch paper background`
- **Line Art**: `crisp black ink lines`, `fine technical pen cross-hatching`, `pencil guide lines`
- **Format**: `mechanical blueprint and architectural line-art layout`, `orthographic front view`, `exploded assembly view`
- **Components**: `title header zone`, `central circular emblem slot`, `PCB circuit traces`, `stat display meters`, `bottom gold edge pin contacts`, `corner security screws`

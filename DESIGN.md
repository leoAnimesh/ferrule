---
name: Ferrule
description: One ink on paper tinted by that ink, in any palette.
colors:
  verdigris: "#0A6B5E"
  verdigris-dark: "#4FD1B5"
  on-verdigris: "#FFFFFF"
  verdigris-soft: "#DDEAE8"
  paper: "#F0F6F5"
  surface: "#FFFFFF"
  surface-muted: "#E4EFED"
  hairline: "#C4DBD8"
  control-edge: "#808987"
  ink-text: "#0F1B19"
  ink-text-muted: "#535D5B"
  danger: "#B3261E"
  success: "#29781B"
  brass: "#8A5A00"
  paper-dark: "#111917"
  surface-dark: "#1B2321"
typography:
  display: { fontFamily: "system-ui", fontSize: "36px", fontWeight: 700, lineHeight: "42px", letterSpacing: "-0.8px" }
  h1: { fontFamily: "system-ui", fontSize: "28px", fontWeight: 700, lineHeight: "34px", letterSpacing: "-0.5px" }
  h2: { fontFamily: "system-ui", fontSize: "22px", fontWeight: 700, lineHeight: "28px", letterSpacing: "-0.25px" }
  h3: { fontFamily: "system-ui", fontSize: "18px", fontWeight: 600, lineHeight: "24px", letterSpacing: "-0.1px" }
  body: { fontFamily: "system-ui", fontSize: "16px", fontWeight: 400, lineHeight: "24px" }
  label: { fontFamily: "system-ui", fontSize: "14px", fontWeight: 600, lineHeight: "20px" }
  caption: { fontFamily: "system-ui", fontSize: "12px", fontWeight: 400, lineHeight: "16px", letterSpacing: "0.1px" }
rounded:
  sm: "3px"
  md: "6px"
  lg: "10px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button-solid: { backgroundColor: "{colors.verdigris}", textColor: "{colors.on-verdigris}", rounded: "{rounded.md}", height: "44px", typography: "{typography.label}" }
  button-soft: { backgroundColor: "{colors.verdigris-soft}", textColor: "{colors.verdigris}", rounded: "{rounded.md}", height: "44px" }
  card: { backgroundColor: "{colors.surface}", rounded: "{rounded.lg}" }
  input: { backgroundColor: "{colors.surface}", textColor: "{colors.ink-text}", rounded: "{rounded.md}", height: "44px" }
---

# Design System: Ferrule

## Overview

A theme is a printing job: one spot ink on paper tinted by that same ink. Swap the ink and the whole product reprints. The default ink is verdigris, the patina a brass ferrule grows. Brass itself is kept for warnings. This is a component library, so the world lends only type, palette, density and one signature move; every control stays the standard control people already know.

## Colors

`createPalette` derives every token from one ink per mode, and moves anything that would miss AA. Seven palettes ship: verdigris, cobalt, madder, vermilion, saffron, plum, graphite. The hexes above are verdigris, as rendered.

**The One Ink Rule.** Neutrals are the ink at low strength over paper, never grey. Background is 6% ink, muted surface 11%, hairlines 24%.

**The Semantic Only Rule.** Components read semantic tokens and hold no raw color. `ferrule check` and a test enforce it.

**The Overprint Rule.** Pressing a solid fill prints over it with `overprint`, in the direction that raises the label's contrast. It never washes the fill toward its label.

State colors keep their own hue in every palette, and always come with a label.

## Typography

System faces on every platform, so nothing needs installing. An optional brand font goes in `tokens.fontFamily`, one family per weight. Headings are heavy and tightly tracked; labels are semibold; body stays regular. Rank comes from weight and tracking as much as from size. Figures are tabular so rows line up.

## Layout

A 4dp spacing scale. Controls are 36, 44 and 52dp tall, and small ones extend to a 44dp touch target. Layouts use minHeight so large text grows instead of clipping, up to a font scale of 2. Logical start and end styles throughout, for right-to-left.

## Elevation & Depth

Surfaces step up one tint per level: paper, then surface, then a soft shadow only for what truly floats. Shadows have a real offset and blur: `sm` 1/2, `md` 4/14, `lg` 14/36. On dark grounds, the lighter surface carries the elevation.

## Shapes

Crisp small radii, like a trimmed chip: 3, 6 and 10dp. Avatars are the one circle.

## Components

**Buttons.** Solid, soft, outline, ghost, danger, with a state layer that fades in on hover and press. Disabled is 45% opacity. Loading keeps the label so the width does not jump.

**The Band (signature).** A solid strip of ink marks what is active. A focused or invalid input grows a 3dp band along its lower edge from the center. A switch's thumb is an upright band in a squared track.

**Focus.** An offset keyline, 2dp wide with a 2dp gap, shown for keyboard focus only.

**Badges and toasts.** Tone-tinted fills with tone-matched text. Badges are small chips, not pills.

**Motion.** 120ms and 240ms on one curve, `cubic-bezier(0.16, 1, 0.3, 1)`. System reduced motion is respected, and the spinner stops.

## Do's and Don'ts

### Do:
- Change the palette, not the components.
- Run `auditPalette` on any custom overrides.
- Keep one solid primary action per group.

### Don't:
- Put raw colors in a component.
- Use a colored side stripe on toasts, cards or rows.
- Add hard offset shadows, gradient text or kicker labels.
- Require a font install.

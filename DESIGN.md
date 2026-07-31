---
name: Lumora
description: A cinematic sanctuary for finding clarity in a noisy universe.
colors:
  midnight-ink: "#182c41"
  deep-navy: "#142334"
  luminous-white: "#f8fbff"
  pure-white: "#ffffff"
  soft-mist: "#eef5f7"
  black-stage: "#000000"
  glass-panel: "rgb(14 29 42 / .62)"
  glass-fallback: "rgb(17 31 45 / .88)"
typography:
  display:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(3.15rem, 6.5vw, 5.8rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(2.4rem, 6vw, 4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-.03em"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "clamp(.82rem, 1.1vw, .95rem)"
    fontWeight: 400
    lineHeight: 1.58
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: ".7rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: ".01em"
rounded:
  pill: "999px"
  card: "26px"
  card-mobile: "22px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "32px"
  card: "42px"
components:
  button-primary:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.deep-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.soft-mist}"
    textColor: "{colors.deep-navy}"
    rounded: "{rounded.pill}"
  input-email:
    textColor: "{colors.luminous-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
  card-info:
    backgroundColor: "{colors.glass-panel}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.card}"
    padding: "42px"
---

# Design System: Lumora

## Overview

**Creative North Star: "The Cinematic Sanctuary"**

Lumora makes calm immediately felt through a fullscreen moving landscape, a centered editorial manifesto, and restrained translucent controls. The interface should feel like stepping into a protected atmosphere: immersive and elevated, but never theatrical at the expense of legibility or action.

The system pairs lyrical, high-contrast display type with compact system-UI controls. Visual density stays low, proof remains quiet at the lower edge, and interaction is concentrated into a small number of obvious gestures. It rejects productivity-dashboard chrome, ornamental gradients, and decorative UI that competes with the scene.

**Key Characteristics:**

- Full-bleed ambient imagery is the visual foundation.
- Instrument Serif carries emotion; system UI carries function.
- Liquid-glass surfaces are thin, translucent, and subordinate to content.
- Pill silhouettes make controls feel calm, continuous, and touchable.
- Motion is slow and atmospheric; state feedback is brief and precise.

## Colors

The palette is a neutral cinematic frame: luminous whites over darkened imagery, with deep blue-black surfaces and a misty hover tone.

### Primary

- **Midnight Ink:** The alternate foreground for bright scenes and the core dark text color.
- **Deep Navy:** The text color inside luminous primary actions.

### Neutral

- **Luminous White:** The default foreground over cinematic media.
- **Pure White:** The strongest emphasis, active statistics, and primary-action surface.
- **Soft Mist:** The quiet hover state for primary actions.
- **Black Stage:** The fallback canvas beneath all media.
- **Glass Panel:** The translucent information-dialog surface.
- **Glass Fallback:** The opaque accessibility fallback when reduced transparency is preferred.

**The Scene-First Contrast Rule.** Foreground color may switch between luminous white and midnight ink to preserve contrast against the active scene; the imagery never dictates unreadable text.

**The No Accent Color Rule.** Lumora derives emphasis from luminosity, type scale, and transparency rather than a saturated brand accent.

## Typography

**Display Font:** Instrument Serif (with serif fallback)  
**Body Font:** system-ui (with sans-serif fallback)

**Character:** Instrument Serif gives the brand an editorial, contemplative voice. System UI keeps navigation, labels, forms, and feedback compact and immediately usable.

### Hierarchy

- **Display:** Regular, fluid oversized type with compressed leading and tracking; reserved for the centered two-line manifesto.
- **Headline:** Regular editorial type for modal headings and secondary brand moments.
- **Body:** Compact system sans with generous leading; used for explanations and supporting copy, generally limited to about 590px.
- **Label:** Small system sans for eyelines, navigation, controls, form text, and statistics.

**The Two-Voice Rule.** Instrument Serif expresses aspiration; system UI communicates function. Do not swap those roles.

**The Quiet Scale Rule.** Large type is reserved for one message per surface; all supporting language remains compact.

## Layout

The landing surface occupies exactly one dynamic viewport (`100dvh`) with no page scroll. A centered content layer is capped at 1440px and uses 32px horizontal insets on desktop, reducing to 18px below 768px.

Navigation frames the top edge, the manifesto and form occupy the optical center, and proof statistics anchor the bottom edge. The scene switcher stays close to the conversion form so ambience selection reads as part of the focus experience, not as detached media controls.

At widths below 768px, desktop navigation becomes a 44px circular menu trigger, content widths compress to 340px, scene controls distribute across the available width, and only the first two statistics remain. At heights below 690px, vertical gaps tighten without changing hierarchy.

**The One-Viewport Rule.** Preserve the full narrative arc—brand, promise, action, ambience, proof—inside one viewport.

## Elevation & Depth

Depth comes primarily from real media, layered cinematic grading, blur, and translucency rather than conventional drop shadows. Glass controls use a faint inset highlight and a thin gradient rim; modal layers add background blur and dark tonal separation. The active visual world remains spatial without looking like a stack of floating cards.

### Shadow Vocabulary

- **Glass highlight** (`inset 0 1px 1px rgb(255 255 255 / .1)`): Gives translucent controls a subtle material edge.
- **Status halo** (`0 0 0 3px color-mix(in srgb, currentColor 16%, transparent)`): Makes the tiny live-status dot readable without adding color.

**The Atmospheric Depth Rule.** Use blur, tonal layers, and media grading for hierarchy; reserve shadows for material edges and micro-signals.

## Shapes

Controls use fully rounded pill or circular geometry. Information cards are the only broad containers and use a generous 26px radius, tightening to 22px on mobile. Most translucent surfaces omit a conventional border; a masked 1.4px luminous rim creates the edge. The fullscreen scene itself is clipped by the viewport.

**The Continuous Edge Rule.** Small interactive surfaces are pills or circles; large informational surfaces use one generous continuous curve.

## Components

### Buttons

- **Shape:** Fully rounded pill for primary actions; circular 44px touch targets for icon-only mobile controls.
- **Primary:** Pure-white surface, deep-navy text, compact system label, 42px minimum height, and 18px horizontal padding.
- **Hover / Focus:** Hover shifts to soft mist; active state compresses slightly and moves down 1px. Keyboard focus uses a 2px current-color outline with 3px offset.
- **Ghost:** Navigation and scene actions remain transparent, gaining only slight luminosity or an underline.

### Chips

- **Style:** The social-proof eyeline is a translucent pill with an 8px internal gap and a tiny current-color status dot.
- **State:** It is informational, not clickable; it inherits the scene-aware foreground color.

### Cards / Containers

- **Corner Style:** Generously curved information card.
- **Background:** Deep translucent navy over a blurred scrim.
- **Shadow Strategy:** Glass highlight only; depth comes from backdrop blur.
- **Border:** No conventional border; use the luminous glass rim.
- **Internal Padding:** 42px desktop, 34px × 26px on mobile.

### Inputs / Fields

- **Style:** Transparent email field nested inside a glass pill, sharing the scene-aware foreground color.
- **Focus:** The field remains visually quiet while the contained action and system focus outline carry interaction.
- **Error / Disabled:** Error adds a current-color inset stroke and reveals a compact alert below; success replaces the field with a centered saved-state message.

### Navigation

Desktop navigation is a compact glass pill with transparent text buttons and a solid primary action. Below 768px it becomes a fullscreen blurred dialog with oversized Instrument Serif links, staggered entrance motion, a circular close control, and a compact pill CTA.

### Scene Switcher

Four compact text buttons name the ambient worlds. Inactive scenes sit at reduced opacity; hover and active states return to full opacity, with the active scene gaining a thin current-color underline. Mobile adds quiet two-digit indices.

## Do's and Don'ts

### Do:

- **Do** let supplied ambient media establish color, mood, and depth.
- **Do** preserve the display/function type split across every extension of the surface.
- **Do** keep controls translucent, compact, and subordinate to the manifesto.
- **Do** provide reduced-motion and reduced-transparency fallbacks.
- **Do** preserve 44px touch targets for mobile icon controls.

### Don't:

- **Don't** introduce dashboard panels, productivity metrics chrome, or dense feature grids into this surface.
- **Don't** add saturated accent colors when luminance and typography can carry emphasis.
- **Don't** place decorative UI over faces, focal scenery, or the central reading corridor.
- **Don't** use bounce, spring, or conspicuous motion; transitions should feel atmospheric or state-specific.
- **Don't** fabricate testimonial, pricing, or validation content.

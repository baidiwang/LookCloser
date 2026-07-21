# Look Closer design system

The visual system should read like a contemporary museum catalogue: quiet, legible, and editorial. The painting remains the loudest object in the room.

## Typography

- **Editorial serif — Source Serif 4:** artwork titles, curator headlines, story titles, annotation sentences, and long-form curator copy.
- **Interface sans — Inter:** navigation, exhibition labels, section labels, metadata, progress, and calls to action.
- Use sentence case for explanatory labels. Uppercase is reserved for short navigation or identity marks and must remain at least 12px with restrained tracking.
- Small text uses higher contrast than decorative ambient text. Never communicate essential information below 12px.

The runtime tokens live in `src/app/globals.css`:

- `--type-editorial`
- `--type-ui`
- `--type-label-size`
- `--type-label-tracking`
- `--type-body-size`
- `--type-body-leading`

## Annotation direction

Each hotspot may define `annotationPlacement.direction` (`left`, `right`, `top`, or `bottom`) and an optional pixel `offset`. The direction describes where the annotation opens relative to the observed detail. Viewport constraints may flip it to a safe fallback side.

## Motion

Motion should reveal hierarchy without moving copy underneath the viewer. Once an annotation appears, its visible curator sentence is immutable until the viewer leaves the hotspot, enters another hotspot, or opens the story.

Opening a story creates a locked exhibition state: the hotspot, curator copy, glow, and artwork framing remain unchanged until the viewer explicitly chooses to continue looking.

## Composition

The curator insert overlays a continuously visible artwork field. Reframing is deliberately bounded so the painting always extends underneath the insert edge; dark background must never appear as a seam between the two.

The landing page uses one warm-gold cursor trace beneath “eye.” It is the page's only editorial emphasis, a line treatment rather than a highlight block, and remains quieter than the headline itself.

Corner metadata is deliberately sparse: one identity mark, one artwork credit, and at most one quiet invitation. Decorative pseudo-historical labels such as “Est. MMXXVI” are not part of the system.

## Hotspot mapping and curator provenance

- Hotspot IDs, bounds, and story indexes must remain unique.
- When a small figure region overlaps a substantially broader scenic region, the figure owns the overlap. Similar-sized neighboring regions resolve by relative distance to each region's center.
- The hotspot ID selected by the attention tracker is the same ID resolved and logged by the server route.
- Curator route logs must identify the received hotspot, resolved hotspot, story index, and final response source (`openai` or `fallback`) without logging API keys or full prompts.

## AI curator architecture

The curator is an attention-aware museum companion, not an answer engine. Its response sequence is attention → curiosity → discovery → return to the painting.

- `curator-system-prompt.ts` contains the stable curator identity and never receives visitor-specific data.
- `curator-user-prompt.ts` renders the current artwork, hotspot, dwell duration, visit history, attention pattern, interaction stage, prior notes, and verified artwork seeds.
- `curator-output-schema.ts` defines the strict `annotation`, `subtitle`, `title`, `observation`, `why`, `next`, and `cta` contract.
- The API route only validates input, resolves the hotspot, calls OpenAI, validates output, and records provenance.
- The first generated sentence acknowledges attention before any artwork fact. Assume the visitor is intelligent; never over-explain.

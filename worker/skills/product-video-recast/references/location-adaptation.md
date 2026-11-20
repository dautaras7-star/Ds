# Relocating scenes and B-roll

Use when the user requests a different location from the source, including indoors to outdoors. Aim for one believable new scene with strong visual treatment across all its shots. Preserve the product, essential actions, narrative purpose and source edit unless the user has requested a creative restructuring.

## Interpret the requested change

Map the scope before sourcing: a named shot, one setting and its associated B-roll, or the entire reel. A specific destination supplied by the user wins over a more convenient substitute. When the request is broad, such as "outside," choose a setting that supports the observed product use and action. State a concrete assumption such as "a sheltered garden patio with a table for the unboxing" and proceed; don't ask the user to direct every detail.

Distinguish a background visible through a window from a true relocation. For an outdoor sequence, the actor, product, support surfaces, ambient light and connected B-roll must read as outdoors. Do not preserve indoor set pieces simply because the original preservation prompt mentioned them.

A location instruction authorizes replacing scene furnishings with suitable equivalents and retargeting location-dependent contextual B-roll. Keep essential hand paths, contact heights, subject scale, camera movement, product actions, shot lengths and cut boundaries. Replacing a coffee table with a compatible patio table is an ordinary adaptation; replacing seated unboxing with a walking reveal is a different action. If the destination cannot support a required action, find a compatible staging within that destination or surface the precise remaining conflict before generation. Do not quietly select an indoor alternative or invent new product capabilities.

## Map each shot by purpose

Identify the function before deciding what to change: hook/reaction, context/establishing, unboxing, product reveal, texture/feature detail, use demonstration, or payoff. B-roll may be a close-up of the same interaction, not an unrelated scenic insert.

Record a compact mapping:

`source shot/time → purpose → target location → action kept → support/prop translation → required reference view → continuity anchors → intended visual gain`

For a living-room sequence moved outside, possible adaptations include:

| Source shot | Credible target | Must still work |
|---|---|---|
| Box opened on a coffee table | Box opened on a stable patio table at a compatible height | Same hands, reach, box orientation, lid clearance and product reveal |
| Seated creator on a sofa | Suitable outdoor chair or bench | Seat height, back/arm support, body pose and product drape |
| Close-up of product on the table | Same product on the same outdoor tabletop | Matching material, light direction, product orientation and nearby props |
| Room/atmosphere B-roll | Outdoor context that serves the same cozy or gifting purpose | Same insert duration and story function; no unrelated beauty shot |
| Standing product demonstration | Clear terrace, garden path or other compatible outdoor floor | Foot contact, walk clearance, feature demonstration and camera scale |

These are examples, not a fixed patio template. Select a garden, terrace, campsite or other destination from the actual brief and product context. A cold-weather product and a summer beach do not automatically tell the same story. Do not infer waterproofing, battery operation, weather resistance or other capabilities from a request to film outdoors. Keep necessary cables, connections and use conditions believable.

## Build a coherent location reference set

Use actual Pinterest photographs under Esteban's sourcing preference. Prefer a location view that establishes usable space and a compatible surface/seat view when the interaction needs it. Additional angles should be from the same place when available. Otherwise check that architecture, materials, layout, palette and light can form a consistent setting, and label them as compatible references rather than verified views of one physical place.

Do not require one unrelated background photo per cut. Reuse the location reference across wide, medium and detail shots; add a view only to resolve missing geometry or an important interaction. A scenic landscape without a suitable table does not fully specify an unboxing location. If the model must infer unseen geometry, record that limitation and test it instead of claiming exact control.

Define a short shared scene description for the shot group: location, season/time of day if relevant, weather, light direction/softness, ground, table/seat material and position, color palette and a few visible background anchors. Apply it consistently. Natural light should illuminate the person and product as well as the background; changing the backdrop alone can leave mismatched indoor shadows or reflections. Avoid wind/rain effects that conflict with locked hair, clothing or product motion.

Choose the strongest visually compatible setting using [visual-improvement.md](visual-improvement.md): readable opening, face and product separation, natural skin and material texture, clear feature action, useful depth and manageable clutter. Favor the best supported fit rather than the most spectacular scenery. Preserve the product's actual color and details when adjusting scene contrast.

## Prompt and production

Replace stale location wording in the active prompt, including references to indoor sofas, fireplaces, lamps, wall shadows or other set elements that conflict with the requested move. Separate retained interaction geometry from replaced furnishings. Keep the source edit map distinct from the target location map so the destination appears only during its assigned shot group.

Example clause for an outdoor unboxing and its detail B-roll:

> Move the living-room unboxing and its associated product close-ups to the same sheltered garden patio shown in the location references. Replace the indoor coffee table with a compatible outdoor wooden table at the source hand-contact height. Keep the original box, product, hands, gestures, relative framing, camera motion, shot durations and cuts. Use consistent soft daylight and the same tabletop, product orientation and garden background across the wide and close-up views. Remove the original interior set from these shots. Do not introduce the patio in other scenes or before the assigned cut. No caption or emoji overlays.

This is intent, not a guarantee of model control. Use current Genjutsu capabilities and [genjutsu-production.md](genjutsu-production.md) for execution. Direct recasting fits when the source action and geometry can transfer. If the model repeatedly mixes locations, isolate the affected shot group or shot and assemble at the original boundaries within the authorized allowance.

For contextual B-roll whose original content cannot plausibly transfer, plan a replacement with the same narrative purpose, duration and edit slot. Do not force an unrelated motion onto a new object or silently replace a product demonstration with scenery. A separate generation/editing step may be needed; include it in the concrete plan and budget, and use an available supported workflow. Request missing creative direction only when the new shot would change the locked action/story or another explicit constraint. A location request is not an unlimited generation budget.

For a representative test, choose the shot with the hardest surface/contact constraint plus an adjacent linked detail when feasible. Inspect that both belong to the same setting before scaling to the remaining shots. Reuse accepted identity and product references; avoid changing casting while debugging a location transfer. After a location pass, repeat the full identity and wardrobe review from [format-voice-identity.md](format-voice-identity.md); a corrected room can still contain the old person in back or hooded views.

## Review the relocated sequence

Check the whole affected shot group, not just its best frame:

- Every linked B-roll shot matches the chosen location, materials, light and product state. No old interior flashes remain.
- The action still has a purpose in the new setting, and the source product demonstration is complete.
- Hands, feet, seated body and product meet the correct surfaces; objects do not float, sink or pass through them.
- Camera height, perspective, scale, occlusion, reflections and contact shadows agree with the new scene. Closely framed shots do not jump to an unrelated tabletop.
- Sun direction, weather, foliage, furniture and palette are coherent across views; no unrequested appearance changes accompany the move.
- Exact shot boundaries, order and timing remain correct, with no early location changes, blended backgrounds, added cuts or removed action.
- The visual gains are visible at phone size, the product remains accurate, and the no-text rule is satisfied.

If the sequence fails, diagnose the reference, support geometry, lighting or shot assignment that caused the mismatch. Prefer a targeted correction within the remaining allowance. Keep accepted shots and describe any unresolved limitation rather than claiming a perfect relocation from a good-looking reference board.

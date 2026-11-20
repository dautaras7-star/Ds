---
name: product-video-recast
description: Recast or visually improve a supplied product or UGC video with Genjutsu, including relocating scenes and their B-roll, using shot analysis, current short-form references, the user's benchmark, and Pinterest photographs. Preserve the requested source and edit constraints; execute authorized production. Exclude ordinary model questions and unrelated editing.
metadata:
  version: "7"
---

# Product video recast

Turn source footage into a product-aware recasting plan and, when requested, a tested finished video. Match the user's visual standard as well as the scene's physical requirements. Read [research-and-board.md](references/research-and-board.md) for sourcing and candidate selection, and [genjutsu-production.md](references/genjutsu-production.md) for execution. For Esteban's work, read [esteban-visual-standard.md](references/esteban-visual-standard.md), which records his Miro benchmark and explicit sourcing preference; a newer brief overrides that profile.

When the brief asks for better visuals, stronger short-form appeal, or a more viral-looking recast, read [visual-improvement.md](references/visual-improvement.md). For Esteban, improving the visual treatment is now the default for future recasts unless he requests a strict match. Identify specific improvements over the source, research relevant examples, and verify the gain in the rendered output. Do not equate a prettier reference board with a better video or promise virality.

For Esteban's realism and stronger-visuals requests, use the companion `short-form-realism` skill when available. It supplies detailed Pinterest casting/location selection, Miro benchmark analysis, physical integration and motion checks. Keep this recast workflow responsible for source mapping, Genjutsu production, cut/voice/format validation and delivery; share one shot map and do not recursively reload either skill. Its preferred final target is native 1080 × 1920 when supported within the authorized allowance; identify 720p limits or upscaling explicitly. If the companion is unavailable, continue with the references bundled here.

When a requested location differs from the source, such as moving a living-room sequence outdoors, read [location-adaptation.md](references/location-adaptation.md). Retarget the whole affected scene and its related B-roll: translate support surfaces, seating, spatial layout, light and context while preserving the product action and edit. A new background behind unchanged indoor furniture is not a completed relocation.

## Required format, voice and identity checks

For Esteban, deliver every video as a single full-frame **9:16 portrait** clip. A requested female presenter includes an **adult female speaking voice** unless he explicitly chooses otherwise. Replace the presenter across **every view**, including rear-facing turns, hands, occlusions, hooded shots and the ending. Preserve the requested script and performance; do not preserve an incompatible source voice. A later explicit brief overrides these defaults.

Read [format-voice-identity.md](references/format-voice-identity.md) before production and final delivery. It defines voice replacement, difficult-view testing, the portrait-format helper and per-shot pass/fail evidence. A source-person reappearance, wrong voice, non-portrait composition or unverified critical check prevents final acceptance.

## Scope and intake

Determine whether the user requested research, a review board, or production. Building or installing this skill does not itself authorize running it or spending generation credits. Preserve existing user choices, approval, and budgets; do not repeatedly ask about settled decisions.

Distinguish visual treatment, location adaptation and editorial changes. Better light, subject separation, natural texture and product-readable settings can improve a recast while the source actions, shot order, exact cuts and framing remain locked. Resolve dialogue wording, speaker voice, music and sound effects separately; the requested avatar/voice change overrides preservation of the old speaker. An explicit relocation permits the set and equivalent support props to change and location-dependent B-roll to be retargeted to the same purpose. It does not require keeping the old room, couch or coffee table literally. Changing the hook action, product demonstration, pace, camera move, shot length or story requires a brief that permits that change. An instruction to make visuals better or change location does not cancel the no-text preference or source-cut checks.

Use the supplied source video and any existing product/brand assets. Ask only for information that materially changes the work: an unreadable product, intended replacement product, required avatar, or whether the dialogue must change. Continue independent visual research while a needed answer is pending. If no video is supplied, research can proceed from a product brief, but do not invent a shot analysis.

Resolve what the references are meant to be: exact photographs from Pinterest, user-supplied images, or newly generated assets. "Take them from Pinterest" means select and use those actual images, not generate substitutes inspired by them. Do not silently switch sourcing modes or carry rejected references into a later prompt. A request to update this skill does not itself request a new video generation.

Resolve the text policy separately from motion preservation. For Esteban, default to **no captions, subtitles, hook text, emoji stickers or other editorial text overlays**, including overlays already burned into the source. Do not carry forward an older prompt that says to preserve source captions. Add text only when a newer explicit request calls for it; see the text handling in [genjutsu-production.md](references/genjutsu-production.md).

When the user provides a Miro board or other visual benchmark, inspect its examples and annotations before choosing assets. Translate them into a short visual brief: creator presentation, light, camera/framing, background organization, product placement and hook. Distinguish visible evidence from the board author's opinions. If access fails, say what is missing rather than claiming to have absorbed the board.

## Inspect the source

Inspect actual footage using available video tools or local frame extraction and playback. Read duration, raster/display aspect, rotation, frame rate, and audio streams with a media probe when available. Listen to the full source to map speech and other audio. Sample every shot and inspect transitions and interactions closely; contact sheets alone do not establish motion, speech, or exact cut times. Distinguish visible observations from inferred actions and unchecked audio.

Identify product category, readable brand/model, use context, and confidence. Use packaging, visible application, and user-provided product pages; do not infer ingredients, benefits, audience demographics, or claims from appearance. A generic category can support provisional research while exact identity is unresolved.

Create a shot map with stable IDs and measured time ranges. For each shot record:

- Source setting, framing, camera movement, person(s), and action.
- Product visibility, hand contact, support surfaces, occlusions, mirrors, and physical requirements.
- Target location ID, avatar ID, reference IDs, and intended replacements.
- Shot purpose and relationship to other shots, including B-roll belonging to a relocated scene; map any indoor-to-outdoor support-prop substitutions.
- What must remain: product, motion, timing, camera, agreed clothing, script, music/effects, and captions only when explicitly requested.
- Identity coverage for front/profile/back views, hair, body, hands, hood/occlusion and reappearance; record the target voice and speech intervals separately.
- Source text overlays to remove or exclude under the agreed text policy.
- Uncertainties and likely failure points.

One location can span several shots. Different camera angles do not automatically require different environments. Record editorial cuts independently from location changes, including close-ups within the same location. Archive the original video and master audio as references; archiving does not authorize restoring an unwanted source voice.

Apply a location request at its stated scope. Moving the living-room sequence changes its connected close-ups and B-roll, not every other location in the reel. A request to relocate the whole video applies across the full map. If only "outside" is specified, select a product-appropriate setting compatible with the action and visual benchmark, state the concrete choice, and continue within the authorized work.

## Research and art direction

Use Pinterest for actual visual discovery when requested; inspect candidate pins and follow original sources where useful. Search from product use, source geometry AND the user's visual benchmark. A matching category such as "warehouse," "woman" or "car interior" is insufficient. Judge the actual image at usable size for photographic quality, subject placement, face readability, lighting, depth, clutter and shot compatibility. Apply the selection rubric in the research reference before presenting a recommendation.

Treat “viral” as a claim requiring evidence. Separate aesthetic inspiration, visible popularity signals, and documented video performance. Do not attribute success to a background merely because it appears in a successful video.

For an improvement brief, diagnose the source first and rank candidate upgrades against it: opening-frame clarity, face/reaction readability, product visibility, lighting and color separation, believable setting, and useful visual change at the existing cuts. Record the source weakness, proposed change, why it might help and supporting evidence or uncertainty. Use current comparable short-form videos to identify mechanisms, then find actual Pinterest photographs that implement those mechanisms within the source geometry. Do not default to a more luxurious, more saturated or busier setting.

Follow the requested identity and sourcing route. For a photographed creator, choose a clear, usable identity reference that fits the desired creator presentation, not merely the right clothing color. Generate an avatar or background only when that mode is requested or already agreed. Keep source and use records accurate: a Pinterest pin is not proof of authorship, a license, photographic origin, or performance. Uncertainty about those facts must not become an unannounced switch to generated assets.

## Make the direction reviewable

Deliver an image-led board: source frame beside proposed avatar/location, short concrete fit notes, exact source links, and shot assignments. Lead with the opening-shot avatar/background pairing so the creative direction can be judged immediately. Include relevant benchmark comparisons; do not bury weak images beneath polished layout or extensive explanations. Present provisional or rejected candidates as such, not as production-ready choices.

For visual upgrades, add a concise source-versus-proposal comparison explaining the strongest intended gains and any tradeoff. Keep benchmark clips, selected Pinterest assets and generated output clearly distinguished. A reference photograph does not prove the final lighting or integration will work.

For a relocation, show the source-to-target shot mapping, shared location reference, required surfaces/props, and matching B-roll direction. Explain why the new setting improves this product's presentation. Do not make the user find a separate background for every shot when one coherent location and compatible views will suffice.

When direction selection is unresolved, present the completed board before asking the user to choose. If the user has delegated art direction and authorized production, select the strongest supported direction and continue within scope. Do not add a mandatory approval gate to an already authorized workflow.

For a corrected board, use a visibly new versioned filename, embed or locally package authorized images, and inspect the exact final file in its viewer. Link that new file. Confirm that old rejected images and media IDs are absent from active inputs. A renamed page or successful file write alone is not evidence the visual correction worked.

## Produce and learn

Prepare consistent references within the requested source mode and run a representative Genjutsu test within the authorized budget. Keep avatar identity and wardrobe stable across shots unless changes were requested. Test difficult identity views such as a back turn and hooded ending before treating the easy frontal replacement as accepted. Match environment geometry, camera height, lighting, and contact surfaces. Consider an integrated still only when its preparation method is within the agreed scope.

For relocation tests, prioritize the hardest interaction and an adjacent B-roll shot, not just an empty establishing view. Verify that supports, hand/foot contact, perspective, shadows and material appearance remain plausible across both. Follow [location-adaptation.md](references/location-adaptation.md) when direct recasting is insufficient.

Compare source and output before scaling up. Check the agreed text policy and compare every cut frame by frame; a background must not switch to the next location while the current shot's action is still happening. Diagnose the actual defect and change a relevant variable. Preserve prompt, references/order, settings, job IDs, estimated/actual costs when available, and review findings. Stop retries when the test passes, the authorized cost/attempt limit is reached, or repeated results show no meaningful improvement. Do not silently expand the budget. When the user approves the overall result but reports a local defect, retain the accepted references, avatar and art direction and target that defect.

For an improvement brief, compare the final opening, reaction and product-proof frames with the source at matched times. Confirm the proposed gains survived generation without reducing realism or changing the product/action. Record user feedback and any later supplied performance data using the learning guidance in [visual-improvement.md](references/visual-improvement.md).

Deliver the playable result as finished only after the required format, identity, voice and source-edit checks pass on the final muxed file. If a correction is blocked or the allowance is exhausted, label any supplied video as an incomplete review draft and lead with the remaining failed checks. Deliver a board alone only when that was the requested output. Do not claim exact identity, audio, timing, or pixel preservation without checking it.

State production status plainly: references prepared, job submitted, rendered but unreviewed, or reviewed output. A reference board is not a replicated video. If an allowance choice is genuinely missing, finish the concrete preparation and ask once; retain the answer across turns.

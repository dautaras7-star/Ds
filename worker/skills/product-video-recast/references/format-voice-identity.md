# Portrait format, voice and complete avatar replacement

Read before generation and again before delivery. These are separate acceptance checks: a correct-looking opening does not establish a complete recast. Apply Esteban's current defaults below unless he explicitly changes them. Do not spend generation credits merely to update or validate this skill.

## Delivery format: 9:16

For Esteban, every delivered video is a single upright, full-frame **9:16 portrait** clip. Use the selected resolution, typically 720×1280 or 1080×1920. Reference photographs and comparison boards may have other dimensions; they are not the video master.

- Send `aspect_ratio: "9:16"` when the active tool/model supports the control. Do not deliberately select `auto` when an explicit portrait setting is available. Inspect returned adjustments: a silently coerced setting is not compliance.
- When a route inherits the source ratio or exposes no usable aspect control, supply a verified 9:16 driving clip, explicitly state the portrait composition in the prompt, and verify the result. Do not invent unsupported parameters or infer that an empty capability list guarantees support.
- Inspect the actual encoded file: raster dimensions, sample aspect ratio and rotation metadata, plus the displayed frame. A landscape file with a portrait clip in its center, decorative side panels, duplicated room images, letterboxing or a multi-panel collage fails this brief. Correct metadata alone cannot detect these compositions.
- Run `python3 scripts/verify_portrait.py final.mp4` with FFprobe available, or run it against a fresh FFprobe JSON report from the environment that can access the file. The helper checks geometry only. Inspect visual composition separately, and rerun the checks after the final edit/export.
- Normalize to upright square-pixel portrait output. Reframing must keep the face, hood, hands, whole relevant product and demonstration visible. Do not stretch a landscape image, or crop away evidence of an identity/text defect. If a safe reframe cannot preserve the action, correct the shot within the authorized production plan.
- Check the delivered playback surface too. A provider widget's `auto` badge, wide container or reference backdrop does not prove the file is landscape; a 720×1280 file does not prove a wide-looking preview is acceptable. Distinguish player layout from baked pixels. Provide the verified portrait MP4 in a suitable player. If supplying HTML, use a 9:16 video element with proportional sizing, without artificial background panels. Do not promise control over a third-party widget.

## Voice follows the requested presenter

For Esteban, a request to replace the presenter with a woman includes an **adult female speaking voice for that presenter's dialogue/narration**, unless he explicitly requests the original voice or specifies another voice. Preserve the script, language, intended accent/style and timing; preserve music and sound effects where possible. The old source speaker is not part of the preservation lock when the requested voice differs.

1. Listen to the full source and identify the target presenter's speech, off-screen continuation, other speakers, music and sound effects. Transcribe the words with time ranges. Metadata, waveforms and a transcript do not establish the audible voice. A silent/music-only source does not require invented narration.
2. Select a suitable available adult female voice for this brief. A Pinterest face does not provide a real person's voice or permission to clone it. Use an available generic/licensed voice; preserve an explicitly supplied authorized voice choice. Do not automatically change singers or unrelated speakers.
3. Separate or recreate the speech track using the available supported dubbing, voice-conversion or speech-generation workflow. Discover current tool capabilities and costs first. For mixed tracks, separate music/effects from the target speech before recombining; do not leave the old speaker faintly underneath the replacement. If separation is inadequate, correct that audio issue rather than hiding it with louder speech.
4. Fit every utterance to its source interval, preserving words, emphasis, pauses and product claims. Do not truncate words, invent benefits or stretch speech unnaturally to hit a duration. When a mouth is visible, check synchronization and use a supported alignment/lip-sync correction if necessary. Close-up B-roll still needs the same replacement narrator.
5. Listen to the **entire final muxed video**, including any clips replaced later. Verify a consistent requested voice, intelligible speech, no old-speaker leakage or doubled dialogue, suitable levels, intact music/effects and the complete ending. Check visible mouth timing against the final voice. Pitch-shifting alone is not a reliable voice replacement or a verification method.

Keep the original audio as a reference/master backup. **Never restore the entire original mix after a female-avatar swap if it reintroduces the unwanted original voice.** Reattach only approved stems or the finished replacement mix. A near-perfect correlation with the original male speech would confirm this failure, not success. If a required listening or synchronization check cannot be performed, mark it unverified; do not call audio complete.

## Avatar identity belongs to every view

Treat the requested avatar as one person across the entire performance, not a face patch for frontal frames. Define a small identity record from the actual reference: face, hair color/length/style, visible profile and rear-head cues, relevant body appearance, and agreed wardrobe. Keep wardrobe separate from identity; an identity photo's black shirt must not override an approved white outfit or the supplied product.

Extend each shot entry with:

`shot/time → subject ID → view/occlusion → target identity reference → hair/body/wardrobe cues → spoken track → evidence checked → pass/fail/unverified`

Map every appearance of the source presenter, including back-facing turns, profiles, rear head/hair, torso and hand-only views, mirrored/reflected appearances, fabric passing in front of the face, hooded/seated views, re-entry after occlusion and the last visible frame. Never retain the source person's short curly hair or body appearance merely because the new person's face is not visible. Judge against the chosen identity and brief, not generic gender stereotypes.

Use a front/three-quarter identity reference and suitable same-person views when available for difficult angles. Under the actual-Pinterest preference, use photographs of the same person; do not silently generate a character sheet or borrow a different person's rear view. Record missing coverage and test it. A photograph cannot prove exactly how an unseen back view should look.

For a montage with a turn-away and a hooded ending, the representative test must include those difficult views, not just the easy opening. State their shot IDs/time windows explicitly in the production prompt. Ask for complete presenter replacement while preserving performance and product interactions. If the avatar is retained in one shot and lost in another, isolate the failing shot with supported handles, preserve the accepted footage, and reassemble at the original boundaries within the authorized allowance. Do not remove the shot, add a freeze frame or cover the face to hide failure. An alternative generation route still needs verified capabilities and authority; a changed prompt is not evidence of a fix.

Inspect the complete moving sequence at normal speed. Then inspect turns, occlusions, reappearances, cuts and the ending frame by frame, including the first/last visible identity frame in each shot. Fixed one-second samples can miss an entire half-second back view. Contact sheets are supporting evidence, not proof of continuous identity replacement. Record viewable frame/time evidence for every risky interval. If all-frame analysis or playback is unavailable, state that coverage limit and keep the affected verdict unverified.

## Release decision

Keep a compact final QA record with measured dimensions/rotation/SAR; visual composition; per-shot identity and wardrobe verdicts; voice choice and listened time range; speech/music/effects and lip-sync checks; product fidelity; location/B-roll continuity; text removal; cut/duration comparison; and the remaining defects. Each required item is `pass`, `fail` or `unverified` with evidence.

The video is complete only when the required checks pass. A completed generation job, an attractive room, a geometry-script pass, or a changed opening face cannot override a wrong voice, source-person reappearance or unreviewed final shot. Inspect again after every correction because a location repair can regress wardrobe or identity.

When a provider blocks a correction or the authorized allowance is exhausted, keep the result clearly labeled **incomplete review draft**, identify the failed shots/checks and stop. Do not route around a provider restriction or claim the skill guarantees perfect generation. If a draft is delivered, lead with its remaining defect; do not present it as the finished replication.

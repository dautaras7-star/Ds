---
name: reel-replicator
description: Replicate a winning UGC reel/TikTok shot-for-shot with the user's own product, background, and avatar swapped in, using an AI image/video MCP (Higgsfield). Use when the user shares a competitor reel/ad and asks to recreate/replicate/copy it or "do it for my product/variant" with a named background and avatar.
---

# Reel Replicator

Turn a proven competitor reel into your own version: same shots, same pacing —
but with YOUR product, set, and creator. Frames first, videos second, with an
approval gate between (a bad frame costs cents; a bad video costs real money).

## Quality defaults — ALWAYS apply, never ask
Organic UGC wins on looking like REAL phone footage, not maximal polish.
- Images: model nano_banana_pro, 9:16, 2K. End every prompt with:
  "candid iPhone photo, natural window light, photorealistic, no text overlays."
   Never GPT Image 2 or 4K studio looks — they over-polish and read as "AI ad."
- Video: model seedance_2_0 (best start-frame + product identity, cheaper,
   supports unlimited), 1080p, mode std (never fast — fast looks soft),
   start_image = the approved frame. Clip length = the source shot's duration.
- Text: never bake caption/hook text into frames or video; ignore any text in
   the source frame. User adds captions + trending audio in their editor.

## Steps
1. Extract source frames from the mp4 (use the video-frame-extractor skill:
   dense sample + dedupe so no short beat like the in-store product shot is missed).
   Note each shot's duration for the video step.
2. Import references into Higgsfield: product (3-4 REAL angle photos — never AI-
   invented for a real product), background, avatar. Reuse media ids across a session.
3. Lock the product: generate ONE hero frame (product in the chosen background),
   get approval, then use that hero as the anchor reference for every other frame
   so the product stays identical (no size/shape drift).
4. Generate all frames with nano_banana_pro, 9:16, per the quality defaults.
  - Store/retail hook shots: keep the store, swap only the person.
  - Sequential shots in one scene: chain off the previous generated frame for continuity.
  - Pin the subject (e.g. golden retriever, or black cat) so it stays consistent.
5. STOP for approval before any video. Regenerate rejects with a sharper prompt.
6. Multiply: on approval, batch the full set across new backgrounds/avatars in parallel.
7. Animate approved frames (seedance_2_0, 1080p std, start_image = frame, motion
   described from the source shot, duration matched). Stitch in source order, deliver.

## Verification
Every frame matches its source composition; product identical across all frames;
no baked-in text; all 9:16; continuous-scene frames share room/lighting/subject.

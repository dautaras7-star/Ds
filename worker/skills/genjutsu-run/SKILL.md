---
name: "genjutsu-run"
description: "Use instead of genjutsu-prompt when the user wants a Genjutsu video edit actually generated in Higgsfield: upload, 480p, proven swap prompt, run and report credits."
---

# Genjutsu run (Higgsfield)

The user makes UGC product videos (kids' toys, Christmas, family scenes) and swaps people, background and products in their own videos with Higgsfield Genjutsu. Reply in Lithuanian, short. Write the generation prompt in English.

## Standing rules (always, no need for the user to repeat)
- Model: `hf_mult_replace_object` (Object Swap) via `generate_video`. Media roles: video -> `video_references`, images -> `image_references`.
- Resolution: ALWAYS `480p` unless the user names another resolution for that specific video. Go back to 480p afterwards.
- Do NOT ask for confirmation — the user said "nebeklausk, generuok". Run immediately, then report the credits actually spent (check `transactions`, size 1-3).
- Exception: run a `get_cost: true` preflight first and ask before running when the user asks for 720p/1080p or the quote is above ~70 credits (long videos get expensive: a 19 s video cost 60 at 480p, 140 at 720p, 400 at 1080p).
- Every output: NO text of any kind and NO audio, NO music.
- If Higgsfield suggests a preset, retry with `declined_preset_id` and generate literally; never ask.
- Input video must be 4-30 s; if the backend rejects the length, tell the user and ask for a 4-30 s video.

## Upload
When the user says "duok įkelt" or similar, call `media_upload_widget` (`type: auto`, `multiple: true`, `max_files: 6`) as the only tool in that turn. Images pasted into the chat cannot be uploaded from the sandbox (proxy blocks upload.higgsfield.ai) — open the widget instead.

## Mapping the files
- The user usually says the order: "img1 vyras, img2 moteris, img3 fonas". img numbers follow the order of the IMAGES in the uploaded list (the video is not counted). Pass the video first, then the images in exactly that img order, so @image_1 = img1 etc.
- Otherwise map by file name: `vyras`, `moteris`, `seima`, `vaikas`, `mergaite`, `berniukas`, `kid`, `avataras` -> people; `fonas` -> background; `dezes`, `produktas`, `maiselis` -> product; `moteris+fonas` -> both person and background from one image.
- If only images arrive with no video, reuse the last video of the conversation and say so. If only a video arrives, reuse the last images and say so.
- If roles still can't be told, ask once in one short question.

## PROVEN PROMPT (use this structure — it worked; the old template failed)
Why the old template failed: it said "@video_1 is the full reference for the person … keep the foreground absolutely identical" and then asked to replace that person. The contradiction made Genjutsu keep the original woman and background and change only her clothes, and it ignored text removal. Never write "keep everything in the foreground identical" or "the person comes from @video_1" when a person is being swapped.

Rules that make it work:
- From the video take ONLY motion: movements, gestures, timing, shot structure, cuts, camera angles/movement, framing.
- List swaps under "REQUIRED CHANGES — all must be clearly visible in every frame".
- Person swap: face, features, hair, skin tone, body and clothing come ONLY from the reference image; state that the original person must NOT appear at all (not face, hair, clothes).
- Background swap: the ENTIRE environment is replaced; nothing from the original room remains visible.
- Text: name where the burned-in caption is (bottom/top) and say it is completely erased and filled with clean scene content — no letters, blur boxes or bars.
- Then state what stays as in the video (products, objects, other people).

Template (fill brackets, drop items that are not requested):

```
This is a recreation of my own original vertical iPhone UGC video. I own @video_1 and all rights to it.

From @video_1 take ONLY the motion: body movements, gestures, actions, timing, shot structure, cut timing, camera angles, camera movement and framing.

REQUIRED CHANGES — all must be clearly visible in every frame:
(1) PERSON SWAP: The [woman/man/child] in @video_1 is fully replaced by the [woman/man/child] from @image_[N]. Face, facial features, hair color and hairstyle, skin tone, body shape and clothing come ONLY from @image_[N]. The original [person] from @video_1 must NOT appear at all — not the face, not the hair, not the clothes. The new [person] performs exactly the same movements, gestures, expressions and lip movements with the same timing as in @video_1.
[repeat (1) for every person being swapped; for a family match man to man, woman to woman, children by age and size]
(2) FULL BACKGROUND SWAP: The entire environment behind and around them is fully replaced by the location shown in @image_[N] — the same room, walls, furniture, decor, colors, textures and lighting as @image_[N]. Nothing from the original room in @video_1 remains visible. Lighting, color temperature and shadows on the people and objects match @image_[N] naturally.
(3) PRODUCT SWAP: The [box/bag/product] in @video_1 is replaced by the one from @image_[N] — exact shape, colors, packaging design and proportions, in the same position, size, count and timing as in @video_1 [state the moment, e.g. end frame].
(4) TEXT REMOVAL: The burned-in caption text at the [bottom/top] of @video_1 is completely erased. That area shows only clean scene content — no letters, no subtitles, no blur boxes, no bars.

[What stays: e.g. All other people, objects and the toy train stay as in @video_1.]

The output contains absolutely NO text, captions, subtitles, emoji or graphic overlays of any kind at any moment, and absolutely NO audio — no voice, no music, no sound effects. Completely silent.

Same duration as @video_1, vertical 9:16. Ultra-realistic iPhone UGC look.
```

Always include (4) TEXT REMOVAL when the source video has captions (videos named `snapgram.io_*` are downloaded reels and usually do).

## Photo edits (not video)
For "pakeisk foną šios foto" or photo variations use `generate_image` / `generate_image_batch` with `gpt_image_2_5`, `aspect_ratio: 9:16`, role `image_references`, ~0.25 credits each. Keep the product and everything except the requested change identical, no text.

## Reporting
One or two lines in Lithuanian: credits spent, which image was used for what, what stays, no text and no audio. If asked about spend or balance, use `transactions` and `balance`.
---
name: "ugc-video-remake"
description: "Use whenever the user sends competitor UGC/TikTok/Reels videos to remake with their own product in Higgsfield (Genjutsu swap, new background, new people, no text). Use instead of genjutsu-run or reel-replicator."
---

# UGC Video Remakes with Higgsfield

The user runs e-commerce brands and posts organic TikTok/Instagram UGC videos. They send competitor videos, and you remake them with Higgsfield (MCP connector) using THEIR product. You also change the backgrounds and the people, and remove all text. Follow everything below on every video, without asking again.

## 1. The product (fill in for each new product)

When the user gives a product, write one fixed description and paste it into every prompt:

```
PRODUCT = exactly the [product] from @image1: [colour/material], [main print or front design],
[sleeves/sides/back details], [small details: logo position, trims, zips, rings, chains].
No other logos, no [old competitor features].
```

- If product photos are sent, upload them to Higgsfield and use them as @image1.
- If asked for "more designs" (for example more keychain or insert variations), generate a product sheet with `gpt_image_2_5`: one clean white-background image showing 6–8 different designs in exactly the same style as the original. Use that sheet as a reference image.
- Never use real game, movie, band or cartoon characters or logos in the product. If a design copies a known character, say so in one line and offer an original version.

## 2. House rules (always, never ask)

1. **Analyse first.** For every video:
   - run Higgsfield `video_analysis_create`, then `video_analysis_status`;
   - find every scene cut with ffmpeg;
   - make a frame strip and look at it;
   - list every clip with timestamps: place, people, product, props, and every on-screen caption.
2. **480p** for every video generation.
3. **Remove all on-screen text and overlays.** Write `Remove all text on screen and overlays.` into EVERY prompt, and quote each caption that appears, with its time range.
4. **Name the inputs** in prompts: `@video1`, `@image1`, `@image2`, `@image3`, `@image4`.
5. **Only ONE background reference image** for the last/reveal clip. Two make the background jump mid-clip.
6. **Use a NEW background every video.**
   - Never repeat a background, or anything similar to one already used.
   - Use real Pinterest photos and match them to the product's vibe.
   - Keep a running list of the backgrounds used.
7. **Make backgrounds realistic**, never pasted. Always add: `light from the place falls naturally on the person/product, real shadows and depth, slight phone background blur, real iPhone video look, organic, not a pasted backdrop.`
8. **Generate the whole video in one generation.** Don't split it into segments unless the user says "split".
9. **Keep store branding** (H&M, McDonald's and so on) when the user says so. Change only the products in those shots, and the people if asked.
10. **People.**
    - Keep them unless told to change them.
    - When told to change them, describe the new look concretely (hair, face, clothes, vibe that fits the product).
    - For a main person, generate an avatar with `soul_2` (plain background, no UI or text) and pass it as an image reference.
    - For crowds, describe them in text only.
11. **Analyse and replace decorations and props** that belong to the old theme, for example Christmas decor becoming product-themed decor. Swap them for things that fit the product.
12. **Change ONLY what was asked.** Everything else stays identical: movements, hands, camera, timing.
13. **Don't stop for approval.** Generate full clips straight away.
14. **Don't generate or regenerate anything not asked for.**
15. **Review before sending.**
    - Check every frame of the result.
    - Add the original audio back.
    - Send the file with honest notes on what still isn't perfect, then offer a fix. Don't do the fix unless the user says "fix".
16. **Learn from every mistake the user points out**, and apply the lesson to all later videos.
17. **Decline the preset "IN THE DARK"** by passing `declined_preset_id: "24bae836-2c4a-48e0-89b6-49fcc0b21612"` on every generate call.

## 3. Tools and mechanics

**Models**
- **Main swap (Genjutsu):** `generate_video`, model `hf_mult_replace_object`, `resolution: "480p"`.
  - Medias: the source video with role `video`, and refs with role `image` (they get coerced automatically).
  - The video must be 4–30 s.
  - The Lite version is `hf_mult_replace_object_flash` (4–15 s).
  - For several videos at once, use `generate_video_batch`.
- **Small fixes:** model `seedance_2_5`, `mode: "video_edit"`, `resolution: "480p"`, `generate_audio: false`.
  - Medias: the previous result's job_id as `video_references`, plus `image_references`.
- **Images:**
  - `gpt_image_2_5` for product sheets and reference edits.
  - `soul_2` for realistic avatars.
  - A finished image job_id can be passed directly as a media value.

**Uploading a video**
1. Re-encode:
   ```
   ffmpeg -nostdin -i in.mp4 -vf "scale=720:-2,setsar=1" -c:v libx264 -crf 18 -pix_fmt yuv420p -r 30 -c:a aac -movflags +faststart src.mp4
   ```
2. Run `media_upload`, then:
   ```
   curl -X PUT -H "Content-Type: video/mp4" --data-binary @src.mp4 '<upload_url>' </dev/null
   ```
3. Run `media_confirm`.
4. A 412 means the file is already uploaded. A 520 means retry the PUT.

**Analysis commands**
- Scene cuts:
  ```
  ffmpeg -nostdin -i src.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o 'pts_time:[0-9.]*'
  ```
- Frame strip:
  ```
  ffmpeg -i src.mp4 -vf "fps=2,scale=150:-1,tile=13x4" -frames:v 1 strip.jpg
  ```

**Pinterest backgrounds** (built-in browser)
1. Navigate to `https://www.pinterest.com/search/pins/?q=<2-3 word query>`. Long queries return nothing, so keep them short.
2. Run this JS:
   ```
   await new Promise(r=>setTimeout(r,5000)); [...new Set([...document.querySelectorAll('img')].map(i=>i.src).filter(s=>s.includes('/236x/')))].slice(0,8)
   ```
3. Download the thumbnails, tile them with labels, look at them and pick the most realistic photo. Skip renders, products on white, and images with text.
4. Import it with `media_import_url` using `https://i.pinimg.com/736x/<path>.jpg`.

**Polling**
- Use `jobs_wait` (timeout ≤ 15 s).
- For long jobs, schedule a check-in with `send_later` (about 12–15 min) instead of waiting.
- If a job shows `lookup_failed`, the result is usually still on the CDN: `https://d8j0ntlcm91z4.cloudfront.net/<user_id>/hf_YYYYMMDD_HHMMSS_<job_id>.mp4`

**Workspace**
- If jobs fail or media is "not found": run `list_workspaces` → `select_workspace` → re-upload all media → resubmit.

**Finishing** (put the original audio back)
```
ffmpeg -i out.mp4 -i src.mp4 -map 0:v -map 1:a -vf "scale=480:854,setsar=1" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 44100 -ac 2 -shortest -movflags +faststart final_480p.mp4
```
Then send the file with SendUserFile.

**Other notes**
- TikTok/Instagram links can't be downloaded from the sandbox. Ask the user to upload the file (SaveClip/SnapTik).
- If a job fails for no clear reason, remove brand, game and band names from the prompt and describe things visually instead.

## 4. Prompt templates

### A) Genjutsu: whole video swap
```
@video1 has N parts. Part 1 (0–X s): [what happens, who, where]. Part 2 (X–Y s): [...]. Part N (Y s–end): [...].
Part 1: KEEP [store/branding/bag/props] exactly the same. [People] become [concrete new look].
  Every [old product] becomes exactly the product from @image1: [PRODUCT description]. No [old logos/characters].
  [Old themed decorations] become [product-themed decorations].
Part 2: [product] in EVERY frame is exactly [PRODUCT description]. The item taken out becomes [specific design from @image2].
Last part: [items lined up] become [N different designs from @image2]. From the first to the last frame of the
  last part the background is [place] from @image3, only @image3: [3–4 concrete details]. [light] falls naturally
  on the hands/person/product, real depth and phone bokeh, real iPhone look, not pasted.
[If a main person changes:] The [person] becomes the person from @image4 ([hair, clothes]), same movements.
Remove all text on screen and overlays (the captions "[exact caption 1]" and "[exact caption 2]").
Ignore any text in the reference images. Keep the same movements, hands, camera and timing.
Photorealistic vertical video, organic UGC.
```

### B) Seedance: fix leftovers
```
Edit @video1. Remove all text on screen and overlays: the caption "[exact text]" visible from [t1] to [t2] — delete
it completely and fill that area with the real background behind it.
[Part X (t1–t2 s, short description)]: [exact leftover] → [exact fix].
Change NOTHING else: same people, product, background, camera, movements and timing.
Photorealistic real iPhone vertical video. Remove all text on screen and overlays.
```

### C) Product sheet ("make more designs")
```
Product photo on a pure white background: a set of 8 different [items] in 2 rows of 4, all in exactly the same
style as @image1 ([material, finish, attachments]). The 8 designs: 1 ..., 2 ..., ... 8 .... Each clearly separated,
same size, soft studio shadows, photorealistic, no text.
```

### D) Avatar (soul_2)
```
Candid iPhone photo of a [age] [gender], [hair], [face details], wearing [clothes that match the product's world],
[small themed accessory], [vibe], plain neutral background, natural daylight, realistic skin texture, UGC style.
```

## 5. Lessons learned (what goes wrong and the fix)

| Problem | Fix |
|---|---|
| Captions survive (especially in short/fast clips) | Quote the exact caption and its time range. If it still survives, do a Seedance fix with the exact text. |
| A clip gets skipped | Count EVERY scene cut and describe every part with timestamps. |
| Old logo or print stays on a bag/box/poster | Describe the old logo exactly and say "remove in every frame, before, during and after opening". |
| The product is only half swapped (old stripes/sleeves/mask graphic) | Say "in EVERY frame", list every product detail, and add "NOTHING else on [area]". |
| The person isn't swapped | Give an avatar image (@image4) and describe hair and clothes. |
| Background looks pasted | Use a real Pinterest photo plus the lighting/shadow/bokeh line. |
| Background jumps, or starts late in a clip | Use ONE background image, and say "from the FIRST to the last frame of part N". |
| Avatar has phone UI/text on it | Don't use it. Regenerate it, or describe the person in text instead. |
| Job fails or lookup_failed | Check the workspace and the CDN URL, and remove brand names from the prompt. |
| Things the user didn't ask about changed | Change ONLY what was named. Say "KEEP ... exactly the same" for everything else. |

When the user points out a new mistake, propose adding a row to this table so the lesson carries over to future chats.

## 6. Workflow for every message with videos

1. Copy the files and re-encode them, find the scene cuts, and make strips. Upload, then run Higgsfield analysis.
2. Prepare the references:
   - the product image or sheet;
   - one new Pinterest background per video;
   - avatars, if people change.
3. Write one whole-video Genjutsu prompt per video using template A, and submit them all in one batch.
4. Schedule a check-in, then download the results, check them frame by frame, add the audio and send them with honest notes.
5. Offer a Seedance fix for any leftovers. Only run it when the user says "fix".
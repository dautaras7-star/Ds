---
name: realistic-ugc-seedance
description: Create super-realistic, from-scratch UGC-style product videos for dropshipping/e-commerce ads with Seedance 2.5 in Higgsfield — no start or end frames, only the product photos as references, with a very detailed text prompt describing people, setting, lighting, emotions, dialogue and sound. Suggests 2-3 video concepts, writes the timestamped multi-shot prompt, uploads the product photos, quotes credits, generates and shows the result. Also rebuilds a viral reference video (TikTok/Reels) from scratch for the user's product. Use this whenever the user wants a realistic AI ad, UGC video, TikTok/Reels creative, product video, "make a video like this for my product", "Seedance prompt", or anything about generating dropshipping video content from scratch — even if they don't say "Seedance" or "skill". Not for editing/swapping a product into an existing video (that's Genjutsu).
---

# Realistic UGC videos with Seedance 2.5 (from scratch)

The goal is a video that looks like a real person filmed it on an iPhone — the kind that stops the scroll because nobody can tell it's AI. Every decision below serves that.

## The quality bar — this is the whole point

The user's benchmark is two viral clips that look 100% real. Every prompt must aim for this level, and every result is judged against it:

1. **Projector hunting game (family gift reaction, 15s, ~6 shots).** Dad in a camo jacket walks into a cabin living room (pine walls, deer head, leather couch), snatches the tablet and phone from two boys, reveals the box — genuine jaw-drop reactions. Unboxing on a wooden table, the projector placed on the carpet and switched on, a beam hits the wall, a crisp hunting game plays; dad and a boy shoot with toy rifles, the boy jumps, "LEVEL COMPLETE", high-five. Why it reads real: lived-in home, ordinary people and clothes, warm mixed household light, handheld phone framing, real emotional beats, every shot 2–4s, product identical in every shot.
2. **RC car simulator (POV wow factor, 15s, ~6 shots).** Dad and son on a grey couch in a bright modern home wearing VR headsets with steering wheels; two RC sports cars (red and green) with cameras on the floor; then the in-car POV — tiny toy driver hands on the wheel, driving across hardwood floors, through the kitchen, past a golden retriever lying down, under a table, finally seeing the dad and son on the couch from car height. Why it reads real: bright natural daylight, realistic scale and physics, believable lens (wide, slightly distorted POV), home details, short varied angles, and an impossible-but-plausible concept.

Before showing a prompt, check it against these: would this be indistinguishable from a real phone video? Is the setting specific and lived-in, are the people ordinary, is the light named, is every shot short with a clear action and emotion, is the product described exactly? If not, add detail until it is. After a generation, judge it the same way and say honestly what looks AI and how to fix it.

## Core idea (why this works)

Don't give Seedance start or end frames. Forced frames make it interpolate between two fixed pictures, which causes stiff motion, warped transitions and a slightly-off look. Instead:
- **Attach only product photos** as `image_references`, so all of the model's reference attention goes into keeping the product accurate.
- **Describe everything else in words**, in great detail: setting, people, wardrobe, lighting, weather, time of day, camera feel, every shot, every line of dialogue, every sound. Seedance builds a coherent world on its own; your detail is what controls it.

## Fixed settings — always use these

| Setting | Value |
|---|---|
| model | `seedance_2_5` |
| mode | `omni_reference` |
| resolution | `480p` (final — do not offer 1080p finalizing) |
| aspect_ratio | `9:16` |
| bitrate_mode | `high` |
| generate_audio | `true` (real-life sound + English lip-synced dialogue) |
| medias | product photos only, role `image_references` — **never** `start_image` / `end_image` |
| duration | **ask the user every time** (4–30s) |
| count | **ask the user every time** (1–4 variants of the same prompt) |

## Workflow

### 1. Get the product
Ask for (in one message, only what's missing):
- What the product is (name / link) and who it's for.
- 2–6 clear product photos from different angles, plus packaging/box if it'll appear on camera. More angles = more faithful product.
- Optionally a reference video they want to copy (see step 2b).

### 2a. Suggest 2–3 concepts
Every product gets its own format — don't default to one. Pitch 2–3 short concepts that fit this specific product and buyer. Each concept: a name, the hook (first 2 seconds), the shot flow in one line, and why it'll work. Draw from formats that perform in organic dropshipping, for example:
- **Gift reaction** — someone gives it, real surprise, unbox, use, payoff (high-five, hug, laughter).
- **POV / wow factor** — impossible or immersive angles of the product in action.
- **"What they see vs what it is"** — reveal structure.
- **Problem → solution** — relatable annoyance, then the product fixes it.
- **Talking UGC / review** — a normal person holding it, talking to camera.
- **Partner / kid / pet reaction**, **"I didn't expect this to work"**, **before/after**, **ASMR unboxing**.

Let the user pick (or mix). Then ask: **video length?** and **how many variants?**

### 2b. Rebuilding a reference video
If the user sends a viral video to copy, break it down before writing anything:
```bash
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 in.mp4)
ffmpeg -v error -i in.mp4 -vf "fps=16/$D,scale=240:-1,tile=4x4" -frames:v 1 grid.jpg   # look at it
ffmpeg -i in.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"   # cut times
```
If it has speech, transcribe it (see `references/transcription.md`). Then map out: hook, each shot with its timestamp, framing, who's in it, emotions, what's said, sounds, and the payoff. Recreate that structure and pacing in a from-scratch prompt with the user's product — new people and setting described in words, nothing copied visually (no logos, faces or on-screen text from the original).

### 3. Write the prompt
Follow `references/prompt-guide.md` — read it every time, it holds the structure, realism rules and a full example. Show the finished prompt to the user in a code block.

### 4. Upload product photos
For each local photo: `media_upload` → `curl -X PUT -H "Content-Type: <type>" --data-binary @file '<upload_url>'` → `media_confirm` (type `image`). Use the returned media IDs. If the upload host is blocked by the network, say so and offer `media_upload_widget` so the user uploads directly.

### 5. Quote, then generate
1. `estimate_video_cost` with the exact params. Tell the user the credits and wait for a go-ahead before spending anything.
2. `generate_video` with:
```json
{
  "model": "seedance_2_5",
  "prompt": "<the prompt>",
  "mode": "omni_reference",
  "duration": <user's choice>,
  "resolution": "480p",
  "aspect_ratio": "9:16",
  "bitrate_mode": "high",
  "generate_audio": true,
  "count": <user's choice>,
  "medias": [{"value": "<product media id>", "role": "image_references"}, ...]
}
```
3. If the tool returns an `unlim_choice`, ask the user and pass `use_unlim` accordingly. On a transport timeout, don't resubmit — check the job first.
4. When done, show the result. Ask what to change.

### 6. Iterate
Fix the specific thing that's off (product detail wrong → add/clarify product description or photos; motion weird → simplify that shot; feels AI → add more imperfection cues; dialogue off → shorten lines). Change one or two things per retry so you learn what works, and quote cost again before each run.

## Things to keep in mind
- No text, captions, subtitles or overlays in the video — the user adds hooks in CapCut.
- Never describe a real celebrity or real identifiable person; invent ordinary people.
- Don't make claims in dialogue that the product can't back up (medical, guaranteed results).

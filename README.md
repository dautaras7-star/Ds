# Viral Studio

Desktop app (Windows) for the daily viral-video pipeline:

- **Today**: viral concepts with the videos generated from each one. Fix, upscale or delete each take.
- **Review**: upscaled videos. Approve to send them to Google Drive for editing.
- **Schedule posts**: week calendar of posts to YouTube, TikTok, Instagram and Facebook.
- **Viral**: today's viral competitor videos, with stats and why they went viral.

This is a prototype with example data. Nothing is connected yet.

## Install on Windows

Download `Viral Studio Setup x.y.z.exe` from the latest GitHub Release (or from the "Build Windows installer" Actions run) and run it. The installer creates a desktop shortcut and a Start menu entry.

Windows SmartScreen may warn that the app is from an unknown publisher, because the installer isn't code-signed. Click **More info → Run anyway**.

## Develop

```bash
npm install
npm start          # run the app
npm run dist:win   # build the installer (on Windows, or Linux with Wine)
```

# Transcribing speech in a reference video

Claude can't hear audio — speech must be converted to text first.

```bash
pip install -q faster-whisper
ffmpeg -v error -y -i in.mp4 -ar 16000 -ac 1 a.wav
HF_HUB_DISABLE_XET=1 python3 -c "
import wave, numpy as np
from faster_whisper import WhisperModel
w = wave.open('a.wav'); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
m = WhisperModel('small', compute_type='int8')
for s in m.transcribe(a)[0]: print(f'[{s.start:.1f}] {s.text}')
"
```

Notes:
- Passing a numpy array avoids a PyAV version mismatch (`metadata_errors` error) when passing a file path.
- `HF_HUB_DISABLE_XET=1` avoids the extra `cas-server.xethub.hf.co` host.
- In a cloud session with a limited network, the model download needs these hosts allowed: `huggingface.co`, `us.aws.cdn.hf.co` (and possibly `cdn-lfs.hf.co`, `cas-bridge.xethub.hf.co`). If blocked, propose adding them to the environment, or ask the user to type out what's said.
- Whisper may mishear brand names ("Seedance" → "cdance", "Claude" → "claw") — correct obvious ones from context.

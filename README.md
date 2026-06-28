# 🌟 Kids Learning Game 🌟

A small personal educational game created with the help of AI, designed for entertainment and learning for my 3-year-old daughters.

## About

This is a fun, colorful, and interactive web-based game collection built specifically for toddlers. The games feature large, easy-to-tap buttons, vibrant colors, sound effects, and celebratory animations — all designed to keep little ones engaged while learning basic concepts.

## Games Included

| Game                | Description                                |
| ------------------- | ------------------------------------------ |
| 🔤 **First Letter** | Identify the first Hebrew letter of a word |
| 🔢 **Math**         | Simple addition questions                  |
| 🍎 **Counting**     | Count emojis on screen                     |
| 🃏 **Memory**       | Classic card-matching memory game          |
| 🎨 **Colors**       | Identify colors by their emoji             |
| 🏁 **Star Race**    | Two-player race with mixed questions       |
| 🌦️ **Seasons**      | Match items to their season                |
| 🎨 **Color Mixing** | Mix two colors and see the result          |
| 😄 **Face Contest** | Family expression contest using the webcam |

## How to Run

1. Open a terminal in the project directory
2. Start a local server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser

## 😄 Face Contest Game

A camera-based party game for the whole family. The whole family stands together
in front of the webcam, a target expression is shown (e.g. "Surprised 😲"), and
during a short 3-second capture window the app scores how well each person
matches it. Faces are mapped to players by their position in the frame
(left → right), set once at the start. After each round you see the round ranking
and a running scoreboard; at the end a winner is crowned.

### 🔒 Privacy

**No image or video ever leaves the device.** All face detection and expression
scoring runs entirely in the browser via [`face-api.js`](https://github.com/vladmandic/face-api).
The only network access is a one-time download of the small model files.

### Webcam notes

- The browser will ask for camera permission the first time you play.
- The page must be served over `http://localhost` (or `https://`) — opening it
  via `file://` will block camera access.

### Running fully offline (optional)

By default the model files load from a CDN, with an automatic fallback. To run
100% offline, download the model files into `games/faces/models/`:

```bash
mkdir -p games/faces/models
cd games/faces/models
BASE="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"
for f in \
  tiny_face_detector_model-weights_manifest.json \
  tiny_face_detector_model.bin \
  face_expression_model-weights_manifest.json \
  face_expression_model.bin; do
  curl -O "$BASE/$f"
done
```

The game checks `games/faces/models/` first and falls back to the CDN if the
files are missing.

## Tech Stack

- Pure HTML, CSS, and JavaScript — no frameworks or build step
- In-browser face detection via face-api.js (loaded from CDN) for the Face Contest game
- Responsive design that fits any screen without scrolling
- Custom cursor and sound effects using the Web Audio API
- RTL (right-to-left) layout for Hebrew

## Disclaimer

This is a personal project created by AI for private entertainment purposes. It is not intended for commercial use.

---

_Made with ❤️ for my little ones_

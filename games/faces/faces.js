// ===== FACE CONTEST GAME (FAMILY) =====
// Everyone stands in one frame. At the start we take ONE calibration photo and
// crop each detected face into a thumbnail – those thumbnails ARE the players
// (no names needed). Each round a target expression is shown; for ~3 seconds
// the webcam is sampled locally with face-api.js and each face gets its best
// score for the requested expression. Faces are mapped to players by horizontal
// position (left -> right), fixed at calibration time.
//
// PRIVACY: all detection runs in the browser. No frame, image or video ever
// leaves the device. The only network access is the one-time download of the
// face-api model files (which can also be hosted locally in games/faces/models).

// ---- Configuration ----
// The detector + expression model files. We try a local folder first (fully
// offline) and fall back to a CDN if the local files are not present. Only the
// MODEL files are fetched – never any image/video of the players.
const FACES_MODEL_URL_LOCAL = "games/faces/models";
const FACES_MODEL_URL_CDN =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

const FACES_TOTAL_ROUNDS = 5;
const FACES_COUNTDOWN_SECONDS = 3;
const FACES_THUMB_SIZE = 96; // px – size of each cropped face thumbnail
const FACES_THUMB_PADDING = 0.35; // extra margin around the face box when cropping
const FACES_MAX_PLAYERS = 6;

// Expressions face-api can detect, with Hebrew labels + emoji prompts.
// NOTE: each `key` MUST exactly match a field name emitted by face-api's
// FaceExpressions result. Valid keys are:
//   neutral, happy, sad, angry, fearful, disgusted, surprised
// A typo here would silently score 0 for everyone (see validateFacesExpressions).
const FACES_VALID_EXPRESSION_KEYS = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
];
const FACES_EXPRESSIONS = [
  { key: "happy", he: "שמח", emoji: "😄" },
  { key: "sad", he: "עצוב", emoji: "😢" },
  { key: "angry", he: "כועס", emoji: "😠" },
  { key: "surprised", he: "מופתע", emoji: "😲" },
  { key: "fearful", he: "מפוחד", emoji: "😨" },
  { key: "disgusted", he: "נגעל", emoji: "🤢" },
  { key: "neutral", he: "רגוע", emoji: "😐" },
];

// ---- State ----
let facesModelsLoaded = false;
let facesStream = null;
let facesPlayers = []; // [{ thumb (dataURL), total }]
let facesRound = 0;
let facesRoundExpressions = []; // chosen expression per round
let facesPhase = "setup"; // setup | calibrate | countdown | capture | results | final
let facesCountdownTimer = null; // active countdown interval (cleared on leave)

// Escape user-provided text before injecting into innerHTML (prevents XSS).
function facesEscapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// ===== ENTRY POINT (called by app.js router) =====
function startFacesGame() {
  facesPhase = "setup";
  facesRound = 0;
  facesPlayers = [];
  showScreen("facesScreen");
  renderFacesSetup();
}

// ===== SETUP UI =====
// A single button that loads models + camera, then moves to calibration.
function renderFacesSetup() {
  const container = document.getElementById("facesContainer");
  container.innerHTML = `
    <div class="faces-setup">
      <div class="faces-setup-title">😄 תחרות פרצופים 😄</div>
      <div class="faces-setup-sub">
        כולם יעמדו יחד מול המצלמה. נצלם תמונה אחת שתזהה את הפרצופים —
        ואז כל אחד יקבל ניקוד לפי הפרצוף שלו!
      </div>
      <div>
        <button class="faces-big-btn" id="facesStartBtn">🎥 הפעילו מצלמה</button>
      </div>
      <div class="faces-status" id="facesStatus"></div>
    </div>
  `;

  document.getElementById("facesStartBtn").onclick = beginFacesCalibration;
}

// ===== START: load models + camera, then show the calibration preview =====
async function beginFacesCalibration() {
  const status = document.getElementById("facesStatus");
  const startBtn = document.getElementById("facesStartBtn");

  if (typeof faceapi === "undefined") {
    status.textContent =
      "⚠️ ספריית face-api לא נטענה. בדקו את החיבור לאינטרנט ורעננו.";
    return;
  }

  startBtn.disabled = true;

  try {
    if (!facesModelsLoaded) {
      status.textContent = "⏳ טוען מודלים (פעם אחת)...";
      await loadFacesModels();
      facesModelsLoaded = true;
    }

    status.textContent = "📷 מבקש גישה למצלמה...";
    if (!facesStream) {
      facesStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 960 },
        audio: false,
      });
    }

    renderFacesCalibrate();
  } catch (err) {
    startBtn.disabled = false;
    if (err && err.name === "NotAllowedError") {
      status.textContent = "🚫 לא ניתנה גישה למצלמה. אשרו גישה ונסו שוב.";
    } else {
      status.textContent =
        "⚠️ שגיאה בהפעלת המצלמה/מודלים. ודאו שהדף רץ דרך שרת מקומי (לא file://).";
    }
  }
}

// ===== CALIBRATION: live preview + "take photo" =====
function renderFacesCalibrate() {
  facesPhase = "calibrate";
  const container = document.getElementById("facesContainer");
  container.innerHTML = `
    <div class="faces-round-info">📸 שלב הכנה</div>
    <div class="faces-prompt">
      <div class="faces-prompt-label">
        עמדו יחד מול המצלמה (משמאל לימין) וצלמו תמונה
      </div>
    </div>
    <div class="faces-stage">
      <video class="faces-video" id="facesVideo" autoplay muted playsinline></video>
    </div>
    <div class="faces-actions">
      <button class="faces-big-btn" id="facesSnapBtn">📸 צלמו!</button>
    </div>
    <div class="faces-status" id="facesStatus"></div>
  `;

  const video = document.getElementById("facesVideo");
  video.srcObject = facesStream;
  video.onloadedmetadata = () => video.play();

  document.getElementById("facesSnapBtn").onclick = captureFacesCalibration;
}

// Detect every face in the current frame, crop each to a thumbnail, and create
// one player per face ordered left->right (as seen on the mirrored preview).
async function captureFacesCalibration() {
  if (currentGame !== "faces" || !facesStream) return;
  const status = document.getElementById("facesStatus");
  const snapBtn = document.getElementById("facesSnapBtn");
  const video = document.getElementById("facesVideo");
  snapBtn.disabled = true;
  status.textContent = "🔍 מזהה פרצופים...";

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.4,
  });

  let detections = [];
  try {
    detections = await faceapi.detectAllFaces(video, options);
  } catch (e) {
    detections = [];
  }

  if (!detections.length) {
    snapBtn.disabled = false;
    status.textContent = "🙁 לא זוהו פרצופים. התקרבו למצלמה ונסו שוב.";
    return;
  }

  // Sort by horizontal position. The video is mirrored on screen, so the person
  // on the user's LEFT appears at a HIGH raw x. Sort ascending then reverse to
  // get the same left->right order the players see.
  const ordered = detections
    .slice()
    .sort((a, b) => a.box.x - b.box.x)
    .reverse()
    .slice(0, FACES_MAX_PLAYERS);

  // Snapshot the current frame once, then crop each face from it.
  const frame = document.createElement("canvas");
  frame.width = video.videoWidth;
  frame.height = video.videoHeight;
  frame.getContext("2d").drawImage(video, 0, 0, frame.width, frame.height);

  facesPlayers = ordered.map((det) => ({
    thumb: cropFaceThumbnail(frame, det.box),
    total: 0,
  }));

  renderFacesCalibrationReview();
}

// Crop a square thumbnail around a face box (with padding) from the frame canvas.
function cropFaceThumbnail(frame, box) {
  const pad = box.width * FACES_THUMB_PADDING;
  let sx = box.x - pad;
  let sy = box.y - pad;
  let size = Math.max(box.width, box.height) + pad * 2;

  // Clamp to the frame bounds.
  sx = Math.max(0, sx);
  sy = Math.max(0, sy);
  size = Math.min(size, frame.width - sx, frame.height - sy);

  const out = document.createElement("canvas");
  out.width = FACES_THUMB_SIZE;
  out.height = FACES_THUMB_SIZE;
  const ctx = out.getContext("2d");
  // Mirror horizontally so the thumbnail matches the mirrored on-screen preview.
  ctx.translate(FACES_THUMB_SIZE, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(
    frame,
    sx,
    sy,
    size,
    size,
    0,
    0,
    FACES_THUMB_SIZE,
    FACES_THUMB_SIZE,
  );
  return out.toDataURL("image/jpeg", 0.85);
}

// Show the captured faces so the family can confirm or retake.
function renderFacesCalibrationReview() {
  const container = document.getElementById("facesContainer");
  const thumbs = facesPlayers
    .map(
      (p, i) => `
        <div class="faces-thumb-card">
          <img class="faces-thumb" src="${p.thumb}" alt="פרצוף ${i + 1}" />
          <span class="faces-thumb-label">${i + 1}</span>
        </div>`,
    )
    .join("");

  const count = facesPlayers.length;
  const countText = count === 1 ? "זוהה שחקן אחד" : `זוהו ${count} שחקנים`;

  container.innerHTML = `
    <div class="faces-setup">
      <div class="faces-setup-title">✅ ${countText}!</div>
      <div class="faces-setup-sub">אלו הפרצופים שישתתפו בתחרות:</div>
      <div class="faces-thumbs-row">${thumbs}</div>
      <div class="faces-actions">
        <button class="faces-big-btn" id="facesPlayBtn">🎮 שחקו!</button>
        <button class="faces-big-btn" id="facesRetakeBtn"
          style="background:linear-gradient(135deg,#fab1a0,#e17055)">🔄 צלמו שוב</button>
      </div>
    </div>
  `;

  document.getElementById("facesPlayBtn").onclick = beginFacesRounds;
  document.getElementById("facesRetakeBtn").onclick = renderFacesCalibrate;
}

// Pick the round expressions and start playing. Rounds are short, so each
// expression is used at most once per game (no repeats). There are more
// expressions than rounds, so a shuffle-and-slice always yields distinct ones.
function beginFacesRounds() {
  facesRoundExpressions = facesShuffle(FACES_EXPRESSIONS).slice(
    0,
    FACES_TOTAL_ROUNDS,
  );
  facesPlayers.forEach((p) => (p.total = 0));
  facesRound = 0;
  startFacesRound();
}

// Fisher–Yates shuffle returning a new array (does not mutate the input).
function facesShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Try local model files first (fully offline); fall back to CDN automatically.
async function loadFacesModels() {
  const sources = [FACES_MODEL_URL_LOCAL, FACES_MODEL_URL_CDN];
  let lastError = null;
  for (const url of sources) {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(url);
      await faceapi.nets.faceExpressionNet.loadFromUri(url);
      return; // success
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Failed to load face-api models");
}

// Dev safety net: warn if a configured expression key is misspelled, since an
// invalid key would silently score 0 for everyone with no visible error.
(function validateFacesExpressions() {
  const invalid = FACES_EXPRESSIONS.filter(
    (e) => !FACES_VALID_EXPRESSION_KEYS.includes(e.key),
  );
  if (invalid.length > 0) {
    console.warn(
      "[faces] Unknown expression key(s):",
      invalid.map((e) => e.key),
      "— valid keys are:",
      FACES_VALID_EXPRESSION_KEYS,
    );
  }
})();

// ===== ROUND FLOW =====
function startFacesRound() {
  if (facesRound >= FACES_TOTAL_ROUNDS) {
    endFacesGame();
    return;
  }

  facesPhase = "countdown";
  const expression = facesRoundExpressions[facesRound];

  const container = document.getElementById("facesContainer");
  container.innerHTML = `
    <div class="faces-round-info">סבב ${facesRound + 1} מתוך ${FACES_TOTAL_ROUNDS}</div>
    <div class="faces-prompt">
      <div class="faces-prompt-label">עשו פרצוף:</div>
      <div class="faces-prompt-emoji">${expression.emoji}</div>
      <div class="faces-prompt-expression">${expression.he}!</div>
    </div>
    <div class="faces-stage">
      <video class="faces-video" id="facesVideo" autoplay muted playsinline></video>
      <div class="faces-countdown" id="facesCountdown"></div>
      <div class="faces-flash" id="facesFlash"></div>
    </div>
    ${renderFacesScoreboardHTML("לוח התוצאות עד כה")}
  `;

  const video = document.getElementById("facesVideo");
  video.srcObject = facesStream;

  video.onloadedmetadata = () => {
    video.play();
    runFacesCountdown(expression);
  };
}

function runFacesCountdown(expression) {
  const cdEl = document.getElementById("facesCountdown");
  let n = FACES_COUNTDOWN_SECONDS;
  cdEl.textContent = n;
  playSound("click");

  facesCountdownTimer = setInterval(() => {
    // user may have left mid-countdown
    if (currentGame !== "faces" || !facesStream) {
      clearInterval(facesCountdownTimer);
      facesCountdownTimer = null;
      return;
    }
    n--;
    if (n > 0) {
      cdEl.textContent = n;
      playSound("click");
    } else {
      clearInterval(facesCountdownTimer);
      facesCountdownTimer = null;
      captureFacesRound(expression);
    }
  }, 1000);
}

// Take a SINGLE snapshot at the end of the countdown — like an old camera:
// shutter sound + a white flash, then one frame is analysed. Rounds are short,
// so one decisive frame is simpler and snappier than sampling for seconds.
async function captureFacesRound(expression) {
  facesPhase = "capture";
  const video = document.getElementById("facesVideo");
  const cdEl = document.getElementById("facesCountdown");
  cdEl.classList.add("capturing");
  cdEl.textContent = "📸";

  // Vintage camera feedback: shutter click + flash, fired together.
  playFacesShutter();
  triggerFacesFlash();

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.4,
  });

  // bestByPlayer[i] = expression score for the face mapped to player i
  const bestByPlayer = new Array(facesPlayers.length).fill(0);

  // Abort if the user left the game (home/Escape) during the snapshot.
  if (currentGame !== "faces" || !facesStream) return;

  let detections = [];
  try {
    detections = await faceapi
      .detectAllFaces(video, options)
      .withFaceExpressions();
  } catch (e) {
    detections = [];
  }

  // Map detected faces to players by horizontal position (left->right as seen
  // on the mirrored video). If more faces than players are detected (e.g. a
  // passer-by), keep only the strongest so noise doesn't steal a slot.
  if (detections.length > 0) {
    let usable = detections;
    if (detections.length > facesPlayers.length) {
      usable = detections
        .slice()
        .sort((a, b) => b.detection.score - a.detection.score)
        .slice(0, facesPlayers.length);
    }

    // Video is mirrored on screen, so the person on the user's LEFT appears at
    // a HIGH raw x. Sort ascending then reverse to match left->right as seen.
    const sorted = usable
      .slice()
      .sort((a, b) => a.detection.box.x - b.detection.box.x)
      .reverse();

    sorted.forEach((det, idx) => {
      if (idx >= facesPlayers.length) return;
      bestByPlayer[idx] = det.expressions[expression.key] || 0;
    });
  }

  // Brief pause so the flash/shutter is felt before results pop in.
  await facesSleep(450);

  // Final guard: don't render results onto a screen the user already left.
  if (currentGame !== "faces") return;
  showFacesRoundResults(expression, bestByPlayer);
}

// Old-school camera shutter: a short, bright two-stage click using filtered
// noise + a quick high "tick". Self-contained Web Audio (no shared assets).
function playFacesShutter() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // White-noise burst shaped into two quick clicks (mirror open + close).
    const dur = 0.18;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 3000;
    bandpass.Q.value = 0.8;

    const noiseGain = ctx.createGain();
    // two-click envelope: open click, tiny gap, close click
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.5, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.02, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.4, now + 0.09);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur);

    // A short high "tick" on top for the mechanical snap.
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(2200, now);
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    // Audio not supported — continue silently.
  }
}

// White flash overlay over the camera stage (fades out via CSS animation).
function triggerFacesFlash() {
  const flash = document.getElementById("facesFlash");
  if (!flash) return;
  flash.classList.remove("flashing");
  // force reflow so the animation can restart on every snapshot
  void flash.offsetWidth;
  flash.classList.add("flashing");
}

// ===== RESULTS =====
function showFacesRoundResults(expression, bestByPlayer) {
  facesPhase = "results";

  // Build per-player round results, add to cumulative totals.
  const roundResults = facesPlayers.map((player, i) => {
    const points = Math.round((bestByPlayer[i] || 0) * 100);
    player.total += points;
    return { thumb: player.thumb, index: i, points };
  });

  // sort descending for ranking
  const ranked = roundResults.slice().sort((a, b) => b.points - a.points);

  const medals = ["🥇", "🥈", "🥉"];
  const maxPoints = Math.max(1, ...ranked.map((r) => r.points));

  const rowsHTML = ranked
    .map((r, idx) => {
      const medal = medals[idx] || `${idx + 1}.`;
      const rankClass = idx < 3 ? `rank-${idx + 1}` : "";
      const barPct = Math.round((r.points / maxPoints) * 100);
      return `
        <div class="faces-result-row ${rankClass}" style="animation-delay:${idx * 0.12}s">
          <span class="faces-result-medal">${medal}</span>
          <img class="faces-result-thumb" src="${r.thumb}" alt="פרצוף ${r.index + 1}" />
          <span class="faces-result-bar-wrap">
            <span class="faces-result-bar" data-pct="${barPct}"></span>
          </span>
          <span class="faces-result-score">${r.points}</span>
        </div>`;
    })
    .join("");

  const isLast = facesRound + 1 >= FACES_TOTAL_ROUNDS;
  const container = document.getElementById("facesContainer");
  container.innerHTML = `
    <div class="faces-results">
      <div class="faces-results-title">
        ${expression.emoji} תוצאות הסבב: "${expression.he}"
      </div>
      ${rowsHTML}
      <div class="faces-actions">
        <button class="faces-big-btn" id="facesNextBtn">
          ${isLast ? "🏆 לתוצאות הסופיות" : "➡️ הסבב הבא"}
        </button>
      </div>
    </div>
    ${renderFacesScoreboardHTML("לוח התוצאות הכולל")}
  `;

  // animate bars
  requestAnimationFrame(() => {
    container.querySelectorAll(".faces-result-bar").forEach((bar) => {
      bar.style.width = bar.dataset.pct + "%";
    });
  });

  playSound("correct");
  spawnConfetti();

  document.getElementById("facesNextBtn").onclick = () => {
    playSound("click");
    facesRound++;
    startFacesRound();
  };
}

function renderFacesScoreboardHTML(title) {
  // Keep the original player index so the medal matches each face's standing.
  const ranked = facesPlayers
    .map((p, index) => ({ ...p, index }))
    .sort((a, b) => b.total - a.total);
  const medals = ["🥇", "🥈", "🥉"];
  const rows = ranked
    .map((p, idx) => {
      const rank = medals[idx] || `${idx + 1}.`;
      return `
        <div class="faces-scoreboard-row">
          <span class="faces-scoreboard-rank">${rank}</span>
          <img class="faces-scoreboard-thumb" src="${p.thumb}" alt="פרצוף ${p.index + 1}" />
          <span class="faces-scoreboard-total">⭐ ${p.total}</span>
        </div>`;
    })
    .join("");
  return `
    <div class="faces-scoreboard">
      <div class="faces-scoreboard-title">${title}</div>
      ${rows}
    </div>`;
}

// ===== FINAL =====
function endFacesGame() {
  facesPhase = "final";
  stopFacesCamera();

  const ranked = facesPlayers
    .map((p, index) => ({ ...p, index }))
    .sort((a, b) => b.total - a.total);
  const winner = ranked[0];
  // handle ties
  const winners = ranked.filter((p) => p.total === winner.total);
  const winnerThumbs = winners
    .map(
      (w) =>
        `<img class="faces-winner-thumb" src="${w.thumb}" alt="פרצוף ${w.index + 1}" />`,
    )
    .join("");
  const winnerText = winners.length > 1 ? `תיקו! 🎉` : `🏆 המנצח/ת!`;

  const container = document.getElementById("facesContainer");
  container.innerHTML = `
    <div class="faces-results">
      <div class="faces-results-title">🎉 סוף המשחק! 🎉</div>
      <div class="faces-winner">${winnerText}</div>
      <div class="faces-winner-thumbs">${winnerThumbs}</div>
      ${renderFacesScoreboardHTML("דירוג סופי")}
      <div class="faces-actions">
        <button class="faces-big-btn" id="facesPlayAgainBtn">🔄 שחקו שוב</button>
        <button class="faces-big-btn" id="facesMenuBtn"
          style="background:linear-gradient(135deg,#00b894,#55efc4)">🏠 לתפריט</button>
      </div>
    </div>
  `;

  playSound("celebration");
  for (let i = 0; i < 4; i++) setTimeout(() => spawnConfetti(), i * 500);

  document.getElementById("facesPlayAgainBtn").onclick = () => {
    playSound("click");
    startFacesGame();
  };
  document.getElementById("facesMenuBtn").onclick = goToMenu;
}

// ===== CLEANUP =====
function stopFacesCamera() {
  if (facesCountdownTimer) {
    clearInterval(facesCountdownTimer);
    facesCountdownTimer = null;
  }
  if (facesStream) {
    facesStream.getTracks().forEach((t) => t.stop());
    facesStream = null;
  }
}

function facesSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Make sure the camera + timers are released when leaving the game.
// NOTE: relies on common/utils.js (which defines goToMenu) being loaded before
// this file. The script order in index.html must keep utils.js first.
(function wrapGoToMenuForFaces() {
  if (typeof window.goToMenu === "function" && !window.__facesGoToMenuWrapped) {
    const originalGoToMenu = window.goToMenu;
    window.goToMenu = function () {
      if (currentGame === "faces" || facesStream || facesCountdownTimer) {
        stopFacesCamera();
        facesPhase = "setup";
      }
      originalGoToMenu();
    };
    window.__facesGoToMenuWrapped = true;
  }
})();

// ===== FACE CONTEST GAME (FAMILY) =====
// Everyone stands in one frame. Each round a target expression is shown.
// For ~3 seconds the webcam is sampled locally with face-api.js. Each detected
// face gets its best score for the requested expression. Faces are mapped to
// players by horizontal position (left -> right), set once at calibration.
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
const FACES_CAPTURE_MS = 3000; // capture window length
const FACES_CAPTURE_INTERVAL_MS = 200; // how often we sample during capture
const FACES_PLAYER_EMOJIS = ["👩", "👨", "👧", "👦", "🧒", "👵"];

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
let facesPlayers = []; // [{ name, emoji, total }]
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
  // default two players: parent + child, editable in the UI
  facesPlayers = [
    { name: "אמא", emoji: FACES_PLAYER_EMOJIS[0], total: 0 },
    { name: "אבא", emoji: FACES_PLAYER_EMOJIS[1], total: 0 },
  ];
  showScreen("facesScreen");
  renderFacesSetup();
}

// ===== SETUP UI =====
function renderFacesSetup() {
  const container = document.getElementById("facesContainer");
  container.innerHTML = `
    <div class="faces-setup">
      <div class="faces-setup-title">😄 תחרות פרצופים 😄</div>
      <div class="faces-setup-sub">
        עמדו יחד מול המצלמה לפי הסדר (משמאל לימין). הזינו את השמות:
      </div>
      <div class="faces-players-list" id="facesPlayersList"></div>
      <button class="faces-add-player-btn" id="facesAddBtn">➕ הוסף שחקן</button>
      <div>
        <button class="faces-big-btn" id="facesStartBtn">🎥 התחילו!</button>
      </div>
      <div class="faces-status" id="facesStatus"></div>
    </div>
  `;

  renderFacesPlayerRows();

  document.getElementById("facesAddBtn").onclick = () => {
    if (facesPlayers.length >= FACES_PLAYER_EMOJIS.length) return;
    facesPlayers.push({
      name: "",
      emoji: FACES_PLAYER_EMOJIS[facesPlayers.length],
      total: 0,
    });
    renderFacesPlayerRows();
  };

  document.getElementById("facesStartBtn").onclick = beginFacesGame;
}

function renderFacesPlayerRows() {
  const list = document.getElementById("facesPlayersList");
  list.innerHTML = "";
  facesPlayers.forEach((player, i) => {
    const row = document.createElement("div");
    row.className = "faces-player-row";

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "faces-player-emoji";
    emojiSpan.textContent = player.emoji;

    // Build the input as a DOM node and set `value` as a property so the name
    // is never parsed as HTML (prevents XSS and broken quotes on re-render).
    const input = document.createElement("input");
    input.className = "faces-player-input";
    input.type = "text";
    input.maxLength = 12;
    input.placeholder = "שם השחקן";
    input.value = player.name;
    input.oninput = (e) => {
      facesPlayers[i].name = e.target.value;
    };

    row.appendChild(emojiSpan);
    row.appendChild(input);

    if (facesPlayers.length > 1) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "faces-player-remove";
      removeBtn.textContent = "✕";
      removeBtn.onclick = () => {
        facesPlayers.splice(i, 1);
        // re-assign emojis in order
        facesPlayers.forEach((p, idx) => (p.emoji = FACES_PLAYER_EMOJIS[idx]));
        renderFacesPlayerRows();
      };
      row.appendChild(removeBtn);
    }

    list.appendChild(row);
  });
}

// ===== START: load models + camera =====
async function beginFacesGame() {
  const status = document.getElementById("facesStatus");
  const startBtn = document.getElementById("facesStartBtn");

  // Normalise: trim names, apply a default only when blank, reset totals.
  facesPlayers.forEach((p, i) => {
    p.name = p.name.trim() || `שחקן ${i + 1}`;
    p.total = 0;
  });

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
    facesStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 1280, height: 960 },
      audio: false,
    });

    // pick the round expressions up front
    facesRoundExpressions = [];
    for (let i = 0; i < FACES_TOTAL_ROUNDS; i++) {
      const ex =
        FACES_EXPRESSIONS[Math.floor(Math.random() * FACES_EXPRESSIONS.length)];
      facesRoundExpressions.push(ex);
    }

    facesRound = 0;
    startFacesRound();
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

// Sample frames during the capture window and keep each face's best score.
async function captureFacesRound(expression) {
  facesPhase = "capture";
  const video = document.getElementById("facesVideo");
  const cdEl = document.getElementById("facesCountdown");
  cdEl.classList.add("capturing");
  cdEl.textContent = "📸 עכשיו!";

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.4,
  });

  // bestByPlayer[i] = best expression score for the face mapped to player i
  const bestByPlayer = new Array(facesPlayers.length).fill(0);
  const start = Date.now();

  while (Date.now() - start < FACES_CAPTURE_MS) {
    // Abort if the user left the game (home/Escape) during the capture window.
    if (currentGame !== "faces" || !facesStream) return;

    let detections = [];
    try {
      detections = await faceapi
        .detectAllFaces(video, options)
        .withFaceExpressions();
    } catch (e) {
      detections = [];
    }

    // Score every frame that has at least one detected face. We map faces to
    // players by horizontal position (left->right as seen on the mirrored
    // video). Requiring ALL players in every frame was too strict — a single
    // briefly-missed face meant the whole round scored 0. Now we score the
    // faces we do have, and only the missing player(s) skip that frame.
    if (detections.length > 0) {
      // If more faces are detected than there are players (e.g. a passer-by),
      // keep only the strongest detections so noise doesn't steal a slot.
      let usable = detections;
      if (detections.length > facesPlayers.length) {
        usable = detections
          .slice()
          .sort((a, b) => b.detection.score - a.detection.score)
          .slice(0, facesPlayers.length);
      }

      // Sort by horizontal position. Video is mirrored on screen, so the
      // person standing on the user's LEFT appears at a HIGH x in raw pixels.
      // We sort raw x ascending and then reverse to match left->right as seen.
      const sorted = usable
        .slice()
        .sort((a, b) => a.detection.box.x - b.detection.box.x)
        .reverse();

      sorted.forEach((det, idx) => {
        if (idx >= facesPlayers.length) return;
        const score = det.expressions[expression.key] || 0;
        if (score > bestByPlayer[idx]) bestByPlayer[idx] = score;
      });
    }

    await facesSleep(FACES_CAPTURE_INTERVAL_MS);
  }

  // Final guard: don't render results onto a screen the user already left.
  if (currentGame !== "faces") return;
  showFacesRoundResults(expression, bestByPlayer);
}

// ===== RESULTS =====
function showFacesRoundResults(expression, bestByPlayer) {
  facesPhase = "results";

  // Build per-player round results, add to cumulative totals.
  const roundResults = facesPlayers.map((player, i) => {
    const points = Math.round((bestByPlayer[i] || 0) * 100);
    player.total += points;
    return { name: player.name, emoji: player.emoji, points };
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
          <span class="faces-result-name">${r.emoji} ${facesEscapeHtml(r.name)}</span>
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
  const ranked = facesPlayers.slice().sort((a, b) => b.total - a.total);
  const medals = ["🥇", "🥈", "🥉"];
  const rows = ranked
    .map((p, idx) => {
      const rank = medals[idx] || `${idx + 1}.`;
      return `
        <div class="faces-scoreboard-row">
          <span class="faces-scoreboard-rank">${rank}</span>
          <span class="faces-scoreboard-name">${p.emoji} ${facesEscapeHtml(p.name)}</span>
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

  const ranked = facesPlayers.slice().sort((a, b) => b.total - a.total);
  const winner = ranked[0];
  // handle ties
  const winners = ranked.filter((p) => p.total === winner.total);
  const winnerText =
    winners.length > 1
      ? `תיקו! ${winners
          .map((w) => `${w.emoji} ${facesEscapeHtml(w.name)}`)
          .join(" ו")} 🎉`
      : `🏆 המנצח/ת: ${winner.emoji} ${facesEscapeHtml(winner.name)}!`;

  const container = document.getElementById("facesContainer");
  container.innerHTML = `
    <div class="faces-results">
      <div class="faces-results-title">🎉 סוף המשחק! 🎉</div>
      <div class="faces-winner">${winnerText}</div>
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

// ===== SHARED UTILITIES =====
// Common functions used across all game modules.

// ===== ARRAY HELPERS =====
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ===== AUDIO =====
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === "correct") {
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } else if (type === "wrong") {
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } else if (type === "celebration") {
      const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + i * 0.12 + 0.3,
        );
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } else if (type === "click") {
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } else if (type === "flip") {
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.setValueAtTime(900, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === "match") {
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    // Audio not supported, continue silently
  }
}

// ===== SCREEN MANAGEMENT =====
function showScreen(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
  document
    .getElementById("backBtn")
    .classList.toggle("visible", screenId !== "menuScreen");
}

function goToMenu() {
  playSound("click");
  currentGame = null;
  showScreen("menuScreen");
}

// ===== FEEDBACK =====
function showFeedback(emoji) {
  const overlay = document.getElementById("feedbackOverlay");
  const emojiEl = document.getElementById("feedbackEmoji");
  emojiEl.textContent = emoji;
  overlay.classList.add("show");
  setTimeout(() => {
    overlay.classList.remove("show");
  }, 1000);
}

// ===== CONFETTI =====
function spawnConfetti() {
  const container = document.getElementById("confettiContainer");
  const colors = [
    "#ff6b6b",
    "#ffd93d",
    "#6bcb77",
    "#4d96ff",
    "#ff6b9d",
    "#c44dff",
    "#ff9f43",
  ];

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + "s";
    confetti.style.animationDuration = Math.random() * 2 + 2 + "s";
    const shapes = ["50%", "0%", "30%"];
    confetti.style.borderRadius =
      shapes[Math.floor(Math.random() * shapes.length)];
    container.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}

// ===== SCORE & STARS =====
function updateScore() {
  document.getElementById("scoreDisplay").textContent = score;
}

function resetStars() {
  document
    .querySelectorAll("#starsContainer .star")
    .forEach((s) => s.classList.remove("earned"));
}

function earnStar() {
  const stars = document.querySelectorAll("#starsContainer .star");
  const unearnedStars = Array.from(stars).filter(
    (s) => !s.classList.contains("earned"),
  );
  if (unearnedStars.length > 0) unearnedStars[0].classList.add("earned");
}

function earnStarIn(containerId) {
  const stars = document.querySelectorAll(`#${containerId} .star`);
  const unearnedStars = Array.from(stars).filter(
    (s) => !s.classList.contains("earned"),
  );
  if (unearnedStars.length > 0) unearnedStars[0].classList.add("earned");
}

function showCelebration(message, confettiBursts = 3) {
  playSound("celebration");
  showScreen("celebrationScreen");
  document.getElementById("finalScore").textContent = message;
  for (let i = 0; i < confettiBursts; i++) {
    setTimeout(() => spawnConfetti(), i * 500);
  }
}

// ===== ANSWER RENDERING =====
function renderAnswerButtons(answers, gridId, btnClass, onClickHandler) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "";
  answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = btnClass;
    btn.textContent = answer;
    btn.onclick = () => onClickHandler(index);
    btn.setAttribute("data-index", index);
    grid.appendChild(btn);
  });
}

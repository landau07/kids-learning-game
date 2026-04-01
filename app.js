// ===== MAIN APPLICATION =====
// Entry point: custom cursor, global state, game router, keyboard support.
// HTML templates are loaded from game folders into the container on page load.

// ===== CUSTOM CURSOR =====
const customCursor = document.getElementById("customCursor");
const customCursorRing = document.getElementById("customCursorRing");

document.addEventListener("mousemove", (e) => {
  customCursor.style.left = e.clientX + "px";
  customCursor.style.top = e.clientY + "px";
  customCursorRing.style.left = e.clientX + "px";
  customCursorRing.style.top = e.clientY + "px";
});

document.addEventListener("mousedown", () =>
  customCursor.classList.add("clicking"),
);
document.addEventListener("mouseup", () =>
  customCursor.classList.remove("clicking"),
);

const interactiveSelector =
  "button, .answer-btn, .menu-btn, .memory-card, .play-again-btn, .back-btn, .color-option-btn, .race-answer-btn, .season-option-btn, .mixing-color-btn, .mixing-reset-btn";

document.addEventListener("mouseover", (e) => {
  if (e.target.closest(interactiveSelector))
    customCursorRing.classList.add("hovering");
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest(interactiveSelector))
    customCursorRing.classList.remove("hovering");
});

// ===== GLOBAL GAME STATE =====
let currentGame = null;
let score = 0;
let round = 0;
let maxRounds = 8;
let correctAnswer = null;
let isWaiting = false;

// ===== START GAME (ROUTER) =====
function startGame(type) {
  playSound("click");
  currentGame = type;
  score = 0;
  round = 0;

  if (type === "memory") {
    startMemoryGame();
    return;
  }
  if (type === "colors") {
    startColorsGame();
    return;
  }
  if (type === "race") {
    startRaceGame();
    return;
  }
  if (type === "seasons") {
    startSeasonsGame();
    return;
  }
  if (type === "mixing") {
    startMixingGame();
    return;
  }

  // Generic quiz games: letters, math, counting
  updateScore();
  resetStars();
  showScreen("gameScreen");
  document.getElementById("questionBox").style.display = "block";
  document.getElementById("spacebarHint").style.display = "block";

  if (type === "letters") {
    document.getElementById("gameTitle").textContent = "🔤 אות ראשונה 🔤";
  } else if (type === "math") {
    document.getElementById("gameTitle").textContent = "🔢 חשבון 🔢";
  } else if (type === "counting") {
    document.getElementById("gameTitle").textContent = "🍎 ספירה 🍎";
  }

  nextRound();
}

// ===== GENERIC QUIZ ROUND FLOW =====
function nextRound() {
  if (round >= maxRounds) {
    endGame();
    return;
  }

  round++;
  isWaiting = false;
  document.getElementById("countingDisplay").innerHTML = "";
  document.getElementById("questionMain").style.display = "block";
  document.getElementById("questionMain").style.fontSize = "";

  if (currentGame === "letters") generateLetterQuestion();
  else if (currentGame === "math") generateMathQuestion();
  else if (currentGame === "counting") generateCountingQuestion();
}

function checkAnswer(index) {
  if (isWaiting) return;
  isWaiting = true;

  const buttons = document.querySelectorAll(".answer-btn");

  if (index === correctAnswer) {
    score++;
    updateScore();
    earnStar();
    buttons[index].classList.add("correct");
    playSound("correct");
    showFeedback("🎉");
    spawnConfetti();
    setTimeout(() => nextRound(), 1500);
  } else {
    buttons[index].classList.add("wrong");
    buttons[correctAnswer].classList.add("correct");
    playSound("wrong");
    showFeedback("🤔");
    setTimeout(() => nextRound(), 2000);
  }
}

function endGame() {
  showCelebration(`אספתם ${score} מתוך ${maxRounds} כוכבים!`);
}

// ===== KEYBOARD SUPPORT =====
document.addEventListener("keydown", (e) => {
  if (isWaiting && currentGame !== "memory") return;

  if (["1", "2", "3", "4"].includes(e.key) && currentGame !== "memory") {
    const index = parseInt(e.key) - 1;
    const buttons = document.querySelectorAll(".answer-btn");
    if (buttons[index]) checkAnswer(index);
  }

  if (e.key === " ") {
    e.preventDefault();
    if (
      document.getElementById("celebrationScreen")?.classList.contains("active")
    ) {
      goToMenu();
    }
  }

  if (e.key === "Escape") goToMenu();
});

// ===== MEMORY GAME =====
// Flip cards to find matching emoji pairs.

let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let moves = 0;
let memoryLocked = false;

function startMemoryGame() {
  matchedPairs = 0;
  moves = 0;
  flippedCards = [];
  memoryLocked = false;
  totalPairs = 6;

  document.getElementById("movesDisplay").textContent = "0";
  document.getElementById("pairsDisplay").textContent = "0";
  document.getElementById("totalPairsDisplay").textContent = totalPairs;

  showScreen("memoryScreen");

  const selectedEmojis = shuffleArray([...memoryEmojis]).slice(0, totalPairs);
  const cardValues = shuffleArray([...selectedEmojis, ...selectedEmojis]);

  const grid = document.getElementById("memoryGrid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = "repeat(4, 1fr)";

  cardValues.forEach((emoji, index) => {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.setAttribute("data-value", emoji);
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-front">❓</div>
        <div class="memory-card-back">${emoji}</div>
      </div>
    `;
    card.onclick = () => flipCard(card);
    grid.appendChild(card);
  });

  memoryCards = document.querySelectorAll(".memory-card");
}

function flipCard(card) {
  if (memoryLocked) return;
  if (card.classList.contains("flipped")) return;
  if (card.classList.contains("matched")) return;
  if (flippedCards.length >= 2) return;

  playSound("flip");
  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    document.getElementById("movesDisplay").textContent = moves;
    checkMemoryMatch();
  }
}

function checkMemoryMatch() {
  memoryLocked = true;
  const [card1, card2] = flippedCards;
  const val1 = card1.getAttribute("data-value");
  const val2 = card2.getAttribute("data-value");

  if (val1 === val2) {
    playSound("match");
    showFeedback("🎉");
    spawnConfetti();

    setTimeout(() => {
      card1.classList.add("matched");
      card2.classList.add("matched");
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      matchedPairs++;
      document.getElementById("pairsDisplay").textContent = matchedPairs;

      flippedCards = [];
      memoryLocked = false;

      if (matchedPairs === totalPairs) {
        setTimeout(() => endMemoryGame(), 800);
      }
    }, 600);
  } else {
    playSound("wrong");
    card1.classList.add("wrong-match");
    card2.classList.add("wrong-match");

    setTimeout(() => {
      card1.classList.remove("flipped", "wrong-match");
      card2.classList.remove("flipped", "wrong-match");
      flippedCards = [];
      memoryLocked = false;
    }, 2500);
  }
}

function endMemoryGame() {
  showCelebration(`מצאתם את כל הזוגות ב-${moves} ניסיונות! 🌟`);
}

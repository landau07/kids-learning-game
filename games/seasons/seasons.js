// ===== SEASONS GAME =====
// Match items to their season.

let seasonsScore = 0;
let seasonsRound = 0;
let seasonsCorrectAnswer = null;
let seasonsWaiting = false;

function startSeasonsGame() {
  seasonsScore = 0;
  seasonsRound = 0;
  seasonsWaiting = false;
  document.getElementById("seasonsScoreDisplay").textContent = "0";
  document
    .querySelectorAll("#seasonsStarsContainer .star")
    .forEach((s) => s.classList.remove("earned"));
  showScreen("seasonsScreen");
  nextSeasonsRound();
}

function nextSeasonsRound() {
  if (seasonsRound >= maxRounds) {
    endSeasonsGame();
    return;
  }
  seasonsRound++;
  seasonsWaiting = false;

  const item = seasonsItems[Math.floor(Math.random() * seasonsItems.length)];

  document.getElementById("seasonsEmoji").textContent = item.emoji;
  document.getElementById("seasonsItemName").textContent = item.name;

  const seasonNames = Object.keys(seasonsData);
  seasonsCorrectAnswer = seasonNames.indexOf(item.season);

  const optionsGrid = document.getElementById("seasonsOptions");
  optionsGrid.innerHTML = "";
  seasonNames.forEach((seasonName, index) => {
    const season = seasonsData[seasonName];
    const btn = document.createElement("button");
    btn.className = "season-option-btn";
    btn.style.background = season.color;
    btn.innerHTML = `<span class="season-option-emoji">${season.emoji}</span>${seasonName}`;
    btn.onclick = () => checkSeasonsAnswer(index);
    optionsGrid.appendChild(btn);
  });
}

function checkSeasonsAnswer(index) {
  if (seasonsWaiting) return;
  seasonsWaiting = true;

  const buttons = document.querySelectorAll(".season-option-btn");

  if (index === seasonsCorrectAnswer) {
    seasonsScore++;
    document.getElementById("seasonsScoreDisplay").textContent = seasonsScore;
    earnStarIn("seasonsStarsContainer");
    buttons[index].classList.add("correct");
    playSound("correct");
    showFeedback("🎉");
    spawnConfetti();
    setTimeout(() => nextSeasonsRound(), 1500);
  } else {
    buttons[index].classList.add("wrong");
    buttons[seasonsCorrectAnswer].classList.add("correct");
    playSound("wrong");
    showFeedback("🤔");
    setTimeout(() => nextSeasonsRound(), 2000);
  }
}

function endSeasonsGame() {
  showCelebration(`אספתם ${seasonsScore} מתוך ${maxRounds} כוכבים! 🌟`);
}

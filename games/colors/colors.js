// ===== COLORS GAME =====
// Identify the color of an emoji.

let colorsScore = 0;
let colorsRound = 0;
let colorsCorrectAnswer = null;
let colorsWaiting = false;

function startColorsGame() {
  colorsScore = 0;
  colorsRound = 0;
  colorsWaiting = false;
  document.getElementById("colorsScoreDisplay").textContent = "0";
  document
    .querySelectorAll("#colorsStarsContainer .star")
    .forEach((s) => s.classList.remove("earned"));
  showScreen("colorsScreen");
  nextColorsRound();
}

function nextColorsRound() {
  if (colorsRound >= maxRounds) {
    endColorsGame();
    return;
  }
  colorsRound++;
  colorsWaiting = false;

  const targetIndex = Math.floor(Math.random() * colorsData.length);
  const target = colorsData[targetIndex];

  document.getElementById("colorSortItem").textContent = target.emoji;

  let options = [target];
  while (options.length < 4) {
    const randomColor =
      colorsData[Math.floor(Math.random() * colorsData.length)];
    if (!options.find((o) => o.name === randomColor.name))
      options.push(randomColor);
  }
  options = shuffleArray(options);
  colorsCorrectAnswer = options.findIndex((o) => o.name === target.name);

  const optionsGrid = document.getElementById("colorSortOptions");
  optionsGrid.innerHTML = "";
  options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "color-option-btn";
    btn.style.background = opt.color;
    btn.innerHTML = `<span class="color-dot" style="background:${opt.color}"></span> ${opt.name}`;
    btn.onclick = () => checkColorsAnswer(index);
    optionsGrid.appendChild(btn);
  });
}

function checkColorsAnswer(index) {
  if (colorsWaiting) return;
  colorsWaiting = true;

  const buttons = document.querySelectorAll(".color-option-btn");

  if (index === colorsCorrectAnswer) {
    colorsScore++;
    document.getElementById("colorsScoreDisplay").textContent = colorsScore;
    earnStarIn("colorsStarsContainer");
    buttons[index].classList.add("correct");
    playSound("correct");
    showFeedback("🎉");
    spawnConfetti();
    setTimeout(() => nextColorsRound(), 1500);
  } else {
    buttons[index].classList.add("wrong");
    buttons[colorsCorrectAnswer].classList.add("correct");
    playSound("wrong");
    showFeedback("🤔");
    setTimeout(() => nextColorsRound(), 2000);
  }
}

function endColorsGame() {
  showCelebration(`אספתם ${colorsScore} מתוך ${maxRounds} כוכבים! 🌟`);
}

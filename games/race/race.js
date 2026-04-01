// ===== STAR RACE GAME (2 PLAYERS) =====
// Two-player race with mixed question types.

let raceCurrentPlayer = 1;
let raceScores = [0, 0];
let raceRound = 0;
let raceMaxScore = 5;
let raceCorrectAnswer = null;
let raceWaiting = false;

function startRaceGame() {
  raceCurrentPlayer = 1;
  raceScores = [0, 0];
  raceRound = 0;
  raceWaiting = false;

  document.getElementById("raceScore1").textContent = "⭐ 0";
  document.getElementById("raceScore2").textContent = "⭐ 0";
  document.getElementById("raceLane1").style.width = "0%";
  document.getElementById("raceLane2").style.width = "0%";
  document.getElementById("raceRunner1").style.left = "0%";
  document.getElementById("raceRunner2").style.left = "0%";

  showScreen("raceScreen");
  updateRaceTurn();
  nextRaceRound();
}

function updateRaceTurn() {
  const p1 = document.getElementById("racePlayer1");
  const p2 = document.getElementById("racePlayer2");
  const indicator = document.getElementById("raceTurnIndicator");

  if (raceCurrentPlayer === 1) {
    p1.classList.add("active-player");
    p2.classList.remove("active-player");
    indicator.textContent = "👧 תור שחקנית 1!";
    indicator.style.background = "rgba(255, 155, 155, 0.9)";
  } else {
    p1.classList.remove("active-player");
    p2.classList.add("active-player");
    indicator.textContent = "👧 תור שחקנית 2!";
    indicator.style.background = "rgba(155, 155, 255, 0.9)";
  }
}

function nextRaceRound() {
  if (raceScores[0] >= raceMaxScore || raceScores[1] >= raceMaxScore) {
    endRaceGame();
    return;
  }

  raceRound++;
  raceWaiting = false;

  const qType =
    raceQuestionTypes[Math.floor(Math.random() * raceQuestionTypes.length)];

  if (qType === "counting") generateRaceCountingQuestion();
  else if (qType === "colors") generateRaceColorQuestion();
  else generateRaceMathQuestion();
}

function generateRaceCountingQuestion() {
  const count = Math.floor(Math.random() * 6) + 1;
  const emoji =
    countingEmojis[Math.floor(Math.random() * countingEmojis.length)];

  document.getElementById("raceQuestionText").textContent = "כמה יש כאן?";
  let emojiStr = "";
  for (let i = 0; i < count; i++) emojiStr += emoji + " ";
  document.getElementById("raceQuestionMain").textContent = emojiStr.trim();

  let options = [count];
  while (options.length < 4) {
    let wrong = count + Math.floor(Math.random() * 5) - 2;
    if (wrong < 1) wrong = Math.floor(Math.random() * 6) + 1;
    if (wrong !== count && !options.includes(wrong) && wrong >= 1)
      options.push(wrong);
  }
  options = shuffleArray(options);
  raceCorrectAnswer = options.indexOf(count);
  renderAnswerButtons(
    options.map((o) => String(o)),
    "raceAnswersGrid",
    "race-answer-btn",
    checkRaceAnswer,
  );
}

function generateRaceColorQuestion() {
  const targetIndex = Math.floor(Math.random() * colorsData.length);
  const target = colorsData[targetIndex];

  document.getElementById("raceQuestionText").textContent = "איזה צבע זה?";
  document.getElementById("raceQuestionMain").textContent = target.emoji;
  document.getElementById("raceQuestionMain").style.fontSize =
    "clamp(2.5rem, 6vh, 5rem)";

  let options = [target];
  while (options.length < 4) {
    const randomColor =
      colorsData[Math.floor(Math.random() * colorsData.length)];
    if (!options.find((o) => o.name === randomColor.name))
      options.push(randomColor);
  }
  options = shuffleArray(options);
  raceCorrectAnswer = options.findIndex((o) => o.name === target.name);
  renderAnswerButtons(
    options.map((o) => o.name),
    "raceAnswersGrid",
    "race-answer-btn",
    checkRaceAnswer,
  );
}

function generateRaceMathQuestion() {
  const a = Math.floor(Math.random() * 4) + 1;
  const b = Math.floor(Math.random() * 4) + 1;
  const answer = a + b;

  document.getElementById("raceQuestionText").textContent = "כמה זה?";
  document.getElementById("raceQuestionMain").textContent = `${a} + ${b} = ?`;
  document.getElementById("raceQuestionMain").style.fontSize =
    "clamp(2rem, 5vh, 4rem)";

  let options = [answer];
  while (options.length < 4) {
    let wrong = answer + Math.floor(Math.random() * 5) - 2;
    if (wrong < 0) wrong = Math.floor(Math.random() * 8) + 1;
    if (wrong !== answer && !options.includes(wrong) && wrong >= 0)
      options.push(wrong);
  }
  options = shuffleArray(options);
  raceCorrectAnswer = options.indexOf(answer);
  renderAnswerButtons(
    options.map((o) => String(o)),
    "raceAnswersGrid",
    "race-answer-btn",
    checkRaceAnswer,
  );
}

function checkRaceAnswer(index) {
  if (raceWaiting) return;
  raceWaiting = true;

  const buttons = document.querySelectorAll(".race-answer-btn");
  const playerIndex = raceCurrentPlayer - 1;

  if (index === raceCorrectAnswer) {
    raceScores[playerIndex]++;
    buttons[index].classList.add("correct");
    playSound("correct");
    showFeedback("🎉");
    spawnConfetti();

    document.getElementById(`raceScore${raceCurrentPlayer}`).textContent =
      `⭐ ${raceScores[playerIndex]}`;

    const pct = (raceScores[playerIndex] / raceMaxScore) * 100;
    document.getElementById(`raceLane${raceCurrentPlayer}`).style.width =
      pct + "%";
    document.getElementById(`raceRunner${raceCurrentPlayer}`).style.left =
      Math.min(pct, 90) + "%";
  } else {
    buttons[index].classList.add("wrong");
    buttons[raceCorrectAnswer].classList.add("correct");
    playSound("wrong");
    showFeedback("🤔");
  }

  setTimeout(() => {
    raceCurrentPlayer = raceCurrentPlayer === 1 ? 2 : 1;
    updateRaceTurn();
    nextRaceRound();
  }, 1800);
}

function endRaceGame() {
  let winnerText;
  if (raceScores[0] > raceScores[1]) winnerText = "🏆 שחקנית 1 ניצחה! 🏆";
  else if (raceScores[1] > raceScores[0]) winnerText = "🏆 שחקנית 2 ניצחה! 🏆";
  else winnerText = "🤝 תיקו! שתיכן מדהימות! 🤝";

  showCelebration(
    `${winnerText}\nשחקנית 1: ⭐${raceScores[0]} | שחקנית 2: ⭐${raceScores[1]}`,
    5,
  );
}

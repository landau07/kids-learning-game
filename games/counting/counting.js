// ===== COUNTING GAME =====
// Count the emojis displayed on screen.

function generateCountingQuestion() {
  const count = Math.floor(Math.random() * 8) + 1;
  const emoji =
    countingEmojis[Math.floor(Math.random() * countingEmojis.length)];

  document.getElementById("questionText").textContent = "כמה יש כאן?";
  document.getElementById("questionMain").style.display = "none";

  const countingDisplay = document.getElementById("countingDisplay");
  countingDisplay.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "counting-item";
    span.textContent = emoji;
    countingDisplay.appendChild(span);
  }

  let options = [count];
  while (options.length < 4) {
    let wrong = count + Math.floor(Math.random() * 5) - 2;
    if (wrong < 1) wrong = Math.floor(Math.random() * 8) + 1;
    if (wrong !== count && !options.includes(wrong) && wrong >= 1) {
      options.push(wrong);
    }
  }

  options = shuffleArray(options);
  correctAnswer = options.indexOf(count);

  renderAnswerButtons(
    options.map((o) => String(o)),
    "answersGrid",
    "answer-btn",
    checkAnswer,
  );
}

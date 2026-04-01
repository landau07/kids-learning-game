// ===== MATH GAME =====
// Simple addition questions.

function generateMathQuestion() {
  const a = Math.floor(Math.random() * 5) + 1;
  const b = Math.floor(Math.random() * 5) + 1;
  const answer = a + b;

  document.getElementById("questionText").textContent = "כמה זה?";
  document.getElementById("questionMain").textContent = `${a} + ${b} = ?`;
  document.getElementById("questionMain").className = "question-math";

  let options = [answer];
  while (options.length < 4) {
    let wrong = answer + Math.floor(Math.random() * 5) - 2;
    if (wrong < 0) wrong = Math.floor(Math.random() * 10) + 1;
    if (wrong !== answer && !options.includes(wrong) && wrong >= 0) {
      options.push(wrong);
    }
  }

  options = shuffleArray(options);
  correctAnswer = options.indexOf(answer);

  renderAnswerButtons(
    options.map((o) => String(o)),
    "answersGrid",
    "answer-btn",
    checkAnswer,
  );
}

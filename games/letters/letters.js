// ===== LETTERS GAME =====
// "אות ראשונה" – identify the first Hebrew letter of a word.

function generateLetterQuestion() {
  const targetIndex = Math.floor(Math.random() * hebrewLetters.length);
  const target = hebrewLetters[targetIndex];

  document.getElementById("questionText").textContent =
    `באיזו אות מתחיל ${target.name}?`;
  document.getElementById("questionMain").textContent = target.emoji;
  document.getElementById("questionMain").className = "question-main";
  document.getElementById("questionMain").style.fontSize =
    "clamp(3rem, 8vh, 6rem)";

  let optionLetters = [target.letter];
  const allUniqueLetters = [...new Set(hebrewLetters.map((h) => h.letter))];
  while (optionLetters.length < 4) {
    const randomLetter =
      allUniqueLetters[Math.floor(Math.random() * allUniqueLetters.length)];
    if (!optionLetters.includes(randomLetter)) {
      optionLetters.push(randomLetter);
    }
  }

  optionLetters = shuffleArray(optionLetters);
  correctAnswer = optionLetters.indexOf(target.letter);

  renderAnswerButtons(optionLetters, "answersGrid", "answer-btn", checkAnswer);
}

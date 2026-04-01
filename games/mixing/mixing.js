// ===== COLOR MIXING GAME =====
// Select two colors and see the result of mixing them.

let mixingSelectedLeft = null;
let mixingSelectedRight = null;

function startMixingGame() {
  mixingSelectedLeft = null;
  mixingSelectedRight = null;
  showScreen("mixingScreen");
  renderMixingPalettes();
  resetMixingResult();
}

function renderMixingPalettes() {
  const leftPalette = document.getElementById("mixingPaletteLeft");
  const rightPalette = document.getElementById("mixingPaletteRight");
  leftPalette.innerHTML = '<div class="mixing-palette-label">בחרו צבע</div>';
  rightPalette.innerHTML = '<div class="mixing-palette-label">בחרו צבע</div>';

  mixingColors.forEach((c, i) => {
    const btnL = document.createElement("button");
    btnL.className = "mixing-color-btn";
    btnL.style.background = c.hex;
    if (c.name === "לבן") btnL.style.border = "5px solid #ccc";
    btnL.innerHTML = `<span class="color-name-tooltip">${c.name}</span>`;
    btnL.onclick = () => selectMixingColor("left", i, btnL);
    leftPalette.appendChild(btnL);

    const btnR = document.createElement("button");
    btnR.className = "mixing-color-btn";
    btnR.style.background = c.hex;
    if (c.name === "לבן") btnR.style.border = "5px solid #ccc";
    btnR.innerHTML = `<span class="color-name-tooltip">${c.name}</span>`;
    btnR.onclick = () => selectMixingColor("right", i, btnR);
    rightPalette.appendChild(btnR);
  });
}

function selectMixingColor(side, index, btn) {
  playSound("click");

  if (side === "left") {
    document
      .querySelectorAll("#mixingPaletteLeft .mixing-color-btn")
      .forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    mixingSelectedLeft = mixingColors[index];
  } else {
    document
      .querySelectorAll("#mixingPaletteRight .mixing-color-btn")
      .forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    mixingSelectedRight = mixingColors[index];
  }

  if (mixingSelectedLeft && mixingSelectedRight) showMixingResult();
}

function showMixingResult() {
  const key = mixingSelectedLeft.name + "+" + mixingSelectedRight.name;
  const resultEl = document.getElementById("mixingResult");
  const nameEl = document.getElementById("mixingResultName");
  const hintEl = document.getElementById("mixingHint");

  if (mixingSelectedLeft.name === mixingSelectedRight.name) {
    resultEl.style.background = mixingSelectedLeft.hex;
    resultEl.textContent = "";
    resultEl.classList.add("has-color");
    if (mixingSelectedLeft.name === "לבן")
      resultEl.style.border = "6px solid #ccc";
    nameEl.textContent = `${mixingSelectedLeft.name}! אותו צבע 😄`;
    hintEl.textContent = "🔄 נסו שילוב אחר!";
    playSound("click");
  } else if (mixingResults[key]) {
    const result = mixingResults[key];
    resultEl.style.background = result.color;
    resultEl.textContent = "";
    resultEl.classList.add("has-color");
    resultEl.style.border = "6px solid rgba(255,255,255,0.6)";
    nameEl.textContent = result.name;
    hintEl.textContent = "🎉 יופי! נסו עוד שילוב!";
    playSound("correct");
    showFeedback("🎨");
    spawnConfetti();
  } else {
    const r = Math.round(
      (mixingSelectedLeft.color[0] + mixingSelectedRight.color[0]) / 2,
    );
    const g = Math.round(
      (mixingSelectedLeft.color[1] + mixingSelectedRight.color[1]) / 2,
    );
    const b = Math.round(
      (mixingSelectedLeft.color[2] + mixingSelectedRight.color[2]) / 2,
    );
    resultEl.style.background = `rgb(${r},${g},${b})`;
    resultEl.textContent = "";
    resultEl.classList.add("has-color");
    nameEl.textContent = "צבע חדש! 🎨";
    hintEl.textContent = "🔄 נסו עוד שילוב!";
    playSound("correct");
    showFeedback("🎨");
  }
}

function resetMixing() {
  playSound("click");
  mixingSelectedLeft = null;
  mixingSelectedRight = null;
  document
    .querySelectorAll(".mixing-color-btn")
    .forEach((b) => b.classList.remove("selected"));
  resetMixingResult();
}

function resetMixingResult() {
  const resultEl = document.getElementById("mixingResult");
  resultEl.style.background = "rgba(255,255,255,0.2)";
  resultEl.style.border = "6px solid rgba(255,255,255,0.6)";
  resultEl.textContent = "?";
  resultEl.classList.remove("has-color");
  document.getElementById("mixingResultName").textContent = "";
  document.getElementById("mixingHint").textContent =
    "👆 בחרו צבע מכל צד וראו מה קורה!";
}

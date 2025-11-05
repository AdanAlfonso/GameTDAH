// ======== SIMÓN DICE — Juego básico ======== //
document.addEventListener("DOMContentLoaded", () => {
  const pads = Array.from(document.querySelectorAll(".pad"));
  const display = document.getElementById("display");
  const btnStart = document.getElementById("btnStart");
  const btnStrict = document.getElementById("btnStrict");

  const stepEl = document.getElementById("step");
  const streakEl = document.getElementById("streak");
  const bestEl = document.getElementById("best");

  // ===== Estado del juego =====
  let sequence = [];
  let playerSeq = [];
  let step = 0;
  let streak = 0;
  let best = 0;
  let strict = false;
  let isPlaying = false;
  let allowInput = false;

  // ===== Sonidos básicos =====
  const sounds = [
    new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"),
    new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg"),
    new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"),
    new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg")
  ];

  // ===== Funciones de utilidad =====
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const flashPad = async (index, duration = 550) => {
    const pad = pads[index];
    pad.classList.add("is-on");
    sounds[index].currentTime = 0;
    sounds[index].play();
    await sleep(duration);
    pad.classList.remove("is-on");
  };

  const updateDisplay = (text) => (display.textContent = text);
  const resetPlayer = () => (playerSeq = []);
  const randomPad = () => Math.floor(Math.random() * 4);

  // ===== Lógica del juego =====
  const playSequence = async () => {
    allowInput = false;
    updateDisplay("••");
    for (let i = 0; i < sequence.length; i++) {
      await flashPad(sequence[i]);
      await sleep(250);
    }
    updateDisplay("TU");
    allowInput = true;
  };

  const nextRound = async () => {
    allowInput = false;
    step++;
    stepEl.textContent = step;
    sequence.push(randomPad());
    updateDisplay("IA");
    await sleep(400);
    await playSequence();
  };

  const handleInput = async (padIndex) => {
    if (!allowInput) return;
    playerSeq.push(padIndex);
    flashPad(padIndex, 300);

    // Validación parcial
    const currentStep = playerSeq.length - 1;
    if (playerSeq[currentStep] !== sequence[currentStep]) {
      await errorFeedback();
      if (strict) {
        resetGame();
        return;
      } else {
        playerSeq = [];
        updateDisplay("REINT");
        await sleep(600);
        playSequence();
        return;
      }
    }

    // Si completó secuencia correctamente
    if (playerSeq.length === sequence.length) {
      allowInput = false;
      streak++;
      streakEl.textContent = streak;
      best = Math.max(best, streak);
      bestEl.textContent = best;
      await sleep(500);
      nextRound();
    }
  };

  const errorFeedback = async () => {
    document.querySelector(".hub").classList.add("is-error");
    updateDisplay("ERR");
    sounds[0].play();
    await sleep(700);
    document.querySelector(".hub").classList.remove("is-error");
  };

  const resetGame = () => {
    sequence = [];
    playerSeq = [];
    step = 0;
    streak = 0;
    stepEl.textContent = "0";
    streakEl.textContent = "0";
    updateDisplay("--");
    isPlaying = false;
    allowInput = false;
  };

  // ===== Controles =====
  btnStart.disabled = false;
  btnStart.addEventListener("click", async () => {
    if (isPlaying) {
      resetGame();
      btnStart.textContent = "Iniciar";
      return;
    }
    isPlaying = true;
    btnStart.textContent = "Reiniciar";
    updateDisplay("GO");
    await sleep(600);
    nextRound();
  });

  btnStrict.disabled = false;
  btnStrict.addEventListener("click", () => {
    strict = !strict;
    btnStrict.textContent = strict ? "Modo estricto: ON" : "Modo estricto";
    btnStrict.classList.toggle("active", strict);
  });

  // ===== Interacciones de pads =====
  pads.forEach((pad, i) => {
    pad.addEventListener("click", () => handleInput(i));
  });
});

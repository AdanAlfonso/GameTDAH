// ===== FRUSTRACIÓN — Sopa de letras (JS visual básico) =====
document.addEventListener('DOMContentLoaded', () => {
  // HUD
  const timeEl   = document.getElementById('time');
  const triesEl  = document.getElementById('tries');
  const foundEl  = document.getElementById('found');
  const totalEl  = document.getElementById('total');
  const wordItems = Array.from(document.querySelectorAll('.word-list li'));
  const btnReiniciar = document.querySelector('.btn-primary');

  // Tablero
  const grid = document.querySelector('.grid');
  const cells = Array.from(document.querySelectorAll('.grid .cell'));

  // ===== Temporizador =====
  let sec = 0;
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const r = (s % 60).toString().padStart(2, '0');
    return `${m}:${r}`;
  };
  if (timeEl) timeEl.textContent = '00:00';
  const timer = setInterval(() => {
    sec++;
    if (timeEl) timeEl.textContent = fmt(sec);
  }, 1000);

  // ===== Totales =====
  if (totalEl) totalEl.textContent = String(wordItems.length);

  let tries = 0;
  let foundCount = 0;
  const updateTries = () => { if (triesEl) triesEl.textContent = String(tries); };
  const updateFound = () => { if (foundEl) foundEl.textContent = String(foundCount); };
  updateTries(); updateFound();

  // ===== Lista de palabras (marcado manual visual) =====
  wordItems.forEach((li) => {
    li.tabIndex = 0;
    li.addEventListener('click', () => {
      const found = li.classList.toggle('is-found');
      foundCount += found ? 1 : -1;
      if (foundCount < 0) foundCount = 0;
      updateFound();
    });
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        li.click();
      }
    });
  });

  // ===== Selección de celdas (clic + arrastre) =====
  let selecting = false;
  const selected = new Set();

  const clearSelection = () => {
    selected.forEach((el) => {
      el.classList.remove('is-active');
      el.setAttribute('aria-pressed', 'false');
    });
    selected.clear();
  };

  const addToSelection = (cell) => {
    if (!cell || selected.has(cell)) return;
    selected.add(cell);
    cell.classList.add('is-active');
    cell.setAttribute('aria-pressed', 'true');
  };

  cells.forEach((cell) => {
    // Accesibilidad mínima
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-pressed', 'false');

    cell.addEventListener('mousedown', (e) => {
      e.preventDefault();
      selecting = true;
      clearSelection();
      addToSelection(cell);
    });

    cell.addEventListener('mouseenter', () => {
      if (selecting) addToSelection(cell);
    });

    // Toggle con teclado (visual)
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (cell.classList.contains('is-active')) {
          cell.classList.remove('is-active');
          cell.setAttribute('aria-pressed', 'false');
          selected.delete(cell);
        } else {
          addToSelection(cell);
        }
      }
    });
  });

  // Terminar selección con mouseup global
  document.addEventListener('mouseup', () => {
    if (!selecting) return;
    selecting = false;
    tries += 1;
    updateTries();
    // Efecto demo: mantener un instante y limpiar
    setTimeout(clearSelection, 350);
  });

  // ===== Reiniciar =====
  if (btnReiniciar) {
    btnReiniciar.disabled = false;
    btnReiniciar.addEventListener('click', () => {
      // Reset contadores
      tries = 0; foundCount = 0; sec = 0;
      updateTries(); updateFound();
      if (timeEl) timeEl.textContent = '00:00';

      // Limpiar estados visuales
      clearSelection();
      wordItems.forEach(li => li.classList.remove('is-found'));
    });
  }

  // Limpieza de timer al salir
  window.addEventListener('beforeunload', () => clearInterval(timer));
});

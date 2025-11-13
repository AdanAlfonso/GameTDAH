// ===== Utilidades simples =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  // HUD
  const timeEl = $('#time');
  const triesEl = $('#tries');
  const foundEl = $('#found');
  const totalEl = $('#total') || { textContent: '' }; // por si no existe en tu HTML
  const wordItems = $$('.word-list li');
  const btnReiniciar = $('.btn-primary');

  // Tablero
  const grid = $('.grid');
  const cells = $$('.grid .cell');

  // ===== Temporizador =====
  let sec = 0;
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const r = (s % 60).toString().padStart(2, '0');
    return `${m}:${r}`;
  };
  timeEl && (timeEl.textContent = '00:00');
  const timer = setInterval(() => {
    sec++;
    timeEl && (timeEl.textContent = fmt(sec));
  }, 1000);

  // ===== Total de palabras =====
  if (totalEl) totalEl.textContent = String(wordItems.length);

  // ===== Contadores =====
  let tries = 0;
  let foundCount = 0;
  const updateTries = () => { triesEl && (triesEl.textContent = String(tries)); };
  const updateFound = () => { foundEl && (foundEl.textContent = String(foundCount)); };
  updateTries(); updateFound();

  // ===== Marcar palabras (demo visual) =====
  wordItems.forEach((li) => {
    li.addEventListener('click', () => {
      const isFound = li.classList.toggle('is-found');
      foundCount += isFound ? 1 : -1;
      if (foundCount < 0) foundCount = 0;
      updateFound();
    });
  });

  // ===== Selección de celdas (clic y arrastre) =====
  let selecting = false;
  let selected = new Set();

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

  // iniciar selección con mousedown
  cells.forEach((cell) => {
    // Asegura accesibilidad toggle con tecla Enter/Espacio (demo)
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

    // Toggle con teclado (solo visual)
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

  // terminar selección con mouseup global
  document.addEventListener('mouseup', () => {
    if (!selecting) return;
    selecting = false;
    tries += 1;
    updateTries();

    // DEMO: mantenemos la selección 350ms y luego la limpiamos
    setTimeout(clearSelection, 350);
  });

  // ===== Reiniciar =====
  if (btnReiniciar) {
    btnReiniciar.disabled = false;
    btnReiniciar.addEventListener('click', () => {
      // Reinicia contadores demo
      tries = 0; foundCount = 0; sec = 0;
      updateTries(); updateFound();
      timeEl && (timeEl.textContent = '00:00');

      // Limpia marcas
      clearSelection();
      wordItems.forEach(li => li.classList.remove('is-found'));
    });
  }

  // Limpieza si se abandona la página
  window.addEventListener('beforeunload', () => clearInterval(timer));
});

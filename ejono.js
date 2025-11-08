// ===== ENOJO — Rompecabezas (sliding puzzle 3x2, 5 piezas + 1 vacío) =====
document.addEventListener('DOMContentLoaded', () => {
  const puzzle = document.querySelector('.puzzle');            // grid 3x2
  const slots = () => Array.from(puzzle.children);             // piezas + vacío, en orden DOM
  const btnReset = document.querySelector('.btn-primary');     // Reiniciar
  const timeEl = document.getElementById('time');
  const movesEl = document.getElementById('moves');

  const COLS = 3;
  const ROWS = 2;

  // ===== Estado =====
  let moves = 0;
  let sec = 0;
  let timerId = null;
  let isShuffling = false;

  // ===== Utilidades =====
  const fmtTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2,'0');
    const r = (s % 60).toString().padStart(2,'0');
    return `${m}:${r}`;
  };

  const startTimer = () => {
    stopTimer();
    timeEl && (timeEl.textContent = '00:00');
    timerId = setInterval(() => {
      sec++;
      timeEl && (timeEl.textContent = fmtTime(sec));
    }, 1000);
  };
  const stopTimer = () => { if (timerId) clearInterval(timerId); timerId = null; };

  const indexOfEmpty = () => slots().findIndex(el => el.classList.contains('empty'));
  const coords = (index) => ({ r: Math.floor(index / COLS), c: index % COLS });
  const isAdjacent = (i, j) => {
    const a = coords(i), b = coords(j);
    const dr = Math.abs(a.r - b.r), dc = Math.abs(a.c - b.c);
    return (dr + dc) === 1; // Manhattan 1
  };

  // Intercambia dos nodos (i ↔ j) en el DOM manteniendo el grid
  const swapByIndex = (i, j) => {
    const arr = slots();
    const nodeI = arr[i];
    const nodeJ = arr[j];
    const refI = nodeI.nextSibling;
    const refJ = nodeJ.nextSibling;

    // Si son adyacentes en DOM, el swap directo es más simple
    if (nodeJ === refI) {
      puzzle.insertBefore(nodeJ, nodeI);
    } else if (nodeI === refJ) {
      puzzle.insertBefore(nodeI, nodeJ);
    } else {
      // intercambio general
      puzzle.insertBefore(nodeJ, refI);
      puzzle.insertBefore(nodeI, refJ);
    }
  };

  const moveIfAdjacent = (pieceEl) => {
    const arr = slots();
    const i = arr.indexOf(pieceEl);
    const emptyIdx = indexOfEmpty();
    if (i === -1 || emptyIdx === -1) return false;
    if (!isAdjacent(i, emptyIdx)) return false;

    swapByIndex(i, emptyIdx);
    if (!isShuffling) {
      moves++;
      movesEl && (movesEl.textContent = String(moves));
    }
    return true;
  };

  const solvedOrderSignature = () =>
    // Piezas originales en orden + último es empty
    ['piece--r1c1','piece--r1c2','piece--r1c3','piece--r2c1','piece--r2c2','empty'].join('|');

  const currentOrderSignature = () =>
    slots().map(el => {
      if (el.classList.contains('empty')) return 'empty';
      // Marca por clase de recorte original
      const cls = Array.from(el.classList).find(c => c.startsWith('piece--r'));
      return cls || 'piece';
    }).join('|');

  const isSolved = () => currentOrderSignature() === solvedOrderSignature();

  // Baraja aplicando N movimientos válidos aleatorios desde el resuelto (siempre resoluble)
  const shuffle = async (movesCount = 60) => {
    isShuffling = true;
    for (let k = 0; k < movesCount; k++) {
      const emptyIdx = indexOfEmpty();
      const adj = neighbors(emptyIdx);
      const pick = adj[Math.floor(Math.random() * adj.length)];
      swapByIndex(pick, emptyIdx);
    }
    isShuffling = false;
  };

  const neighbors = (idx) => {
    const list = [];
    const { r, c } = coords(idx);
    if (r > 0) list.push((r - 1) * COLS + c); // up
    if (r < ROWS - 1) list.push((r + 1) * COLS + c); // down
    if (c > 0) list.push(r * COLS + (c - 1)); // left
    if (c < COLS - 1) list.push(r * COLS + (c + 1)); // right
    return list;
  };

  const resetCounters = () => {
    moves = 0; sec = 0;
    movesEl && (movesEl.textContent = '0');
    timeEl && (timeEl.textContent = '00:00');
  };

  const setInteractive = () => {
    slots().forEach(el => {
      if (el.classList.contains('piece')) {
        el.tabIndex = 0;
        el.addEventListener('click', onPieceClick);
        el.addEventListener('keydown', onPieceKeydown);
      }
    });
  };

  const clearInteractive = () => {
    slots().forEach(el => {
      el.replaceWith(el.cloneNode(true)); // forma rápida de quitar listeners
    });
  };

  const onPieceClick = (e) => {
    const moved = moveIfAdjacent(e.currentTarget);
    if (!isShuffling && moved && isSolved()) {
      // puzzle resuelto
      stopTimer();
      // podrías mostrar un mensaje o animación aquí
      // alert('¡Bien hecho! Rompecabezas completo.');
    }
  };

  const onPieceKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPieceClick(e);
    }
  };

  // ===== Inicialización =====
  const init = async () => {
    // Asegura que el DOM esté en orden resuelto de partida:
    // piece--r1c1, r1c2, r1c3, r2c1, r2c2, empty
    // (tu HTML ya viene así)
    clearInteractive();
    setInteractive();
    resetCounters();
    startTimer();
    // Baraja
    await shuffle(60);
  };

  // ===== Reiniciar =====
  if (btnReset) {
    btnReset.disabled = false;
    btnReset.addEventListener('click', async () => {
      stopTimer();
      // Reconstruir orden resuelto: tomamos todas las piezas/empty y las reinsertamos en orden
      const order = ['piece--r1c1','piece--r1c2','piece--r1c3','piece--r2c1','piece--r2c2','empty'];
      const children = slots();
      order.forEach(mark => {
        const node = children.find(el =>
          mark === 'empty' ? el.classList.contains('empty') : el.classList.contains(mark)
        );
        if (node) puzzle.appendChild(node); // mueve al final en orden deseado
      });

      await init();
    });
  }

  // Arrancamos
  init();
});

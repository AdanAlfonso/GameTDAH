// ===== TEMOR — Encuentra las diferencias (JS base) =====
document.addEventListener('DOMContentLoaded', () => {
  // Meta / Marcadores
  const timeEl  = document.getElementById('time');
  const leftEl  = document.getElementById('left');
  const foundEl = document.getElementById('found');

  // Hotspots en ambas imágenes
  const hotspots = Array.from(document.querySelectorAll('.hotspot'));
  // Total real = número de IDs únicos presentes en el DOM
  const uniqueIds = Array.from(new Set(hotspots.map(h => h.dataset.id)));
  const TOTAL = uniqueIds.length;

  // Si tus contadores del HTML tenían valores fijos, los sincronizamos
  if (leftEl)  leftEl.textContent  = String(TOTAL);
  if (foundEl) foundEl.textContent = '0';

  let foundCount = 0;

  // ====== Temporizador simple ======
  let sec = 0;
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2,'0');
    const r = (s % 60).toString().padStart(2,'0');
    return `${m}:${r}`;
  };
  if (timeEl) timeEl.textContent = '00:00';
  const timer = setInterval(() => {
    sec++;
    if (timeEl) timeEl.textContent = fmt(sec);
  }, 1000);

  // ====== Utilidades ======
  const updateCounters = () => {
    if (foundEl) foundEl.textContent = String(foundCount);
    if (leftEl)  leftEl.textContent  = String(Math.max(TOTAL - foundCount, 0));
  };

  const markPairFound = (id) => {
    // Marca ambos (o todos) los hotspots con el mismo ID
    const pair = document.querySelectorAll(`.hotspot[data-id="${id}"]`);
    pair.forEach(btn => {
      btn.classList.add('is-found');
      btn.setAttribute('aria-pressed', 'true');
      btn.disabled = true;
      // Efecto de “ping” rápido (opcional, no requiere CSS extra)
      btn.animate(
        [
          { boxShadow: '0 0 0 0 rgba(123,92,255,0.0)' },
          { boxShadow: '0 0 18px 3px rgba(123,92,255,0.65)' },
          { boxShadow: '0 0 10px 0 rgba(123,92,255,0.35)' }
        ],
        { duration: 420, easing: 'ease-out' }
      );
    });
  };

  const alreadyFound = (id) => {
    // Basta con revisar uno del par
    const any = document.querySelector(`.hotspot[data-id="${id}"]`);
    return any && any.classList.contains('is-found');
  };

  // ====== Click / Teclado en hotspots ======
  const onSelect = (ev) => {
    const btn = ev.currentTarget;
    const id = btn.dataset.id;
    if (!id) return;
    if (btn.disabled || alreadyFound(id)) return;

    // Marca la pareja
    markPairFound(id);
    foundCount++;
    updateCounters();

    // ¿Completado?
    if (foundCount >= TOTAL) {
      // Puedes mostrar un pequeño mensaje si quieres
      // alert('¡Excelente! Encontraste todas las diferencias.');
      // clearInterval(timer);  // Si deseas parar el tiempo al finalizar
    }
  };

  hotspots.forEach((btn) => {
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', onSelect);
    // Accesibilidad: activar con Enter/Espacio
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect({ currentTarget: btn });
      }
    });
  });

  // ====== Botón Reiniciar (si existe) ======
  const btnReset = document.querySelector('.btn-primary');
  if (btnReset) {
    btnReset.disabled = false;
    btnReset.addEventListener('click', () => {
      // Reset contadores
      foundCount = 0;
      sec = 0;
      if (timeEl) timeEl.textContent = '00:00';
      updateCounters();

      // Reset estados de hotspots
      hotspots.forEach((btn) => {
        btn.classList.remove('is-found');
        btn.disabled = false;
        btn.setAttribute('aria-pressed', 'false');
      });
    });
  }

  // Limpieza si el usuario abandona la página
  window.addEventListener('beforeunload', () => clearInterval(timer));
});

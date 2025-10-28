document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formLogin');
  const usuario = document.getElementById('usuario');
  const contrasena = document.getElementById('contrasena');
  const groupUsuario = document.getElementById('groupUsuario');
  const groupContrasena = document.getElementById('groupContrasena');
  const btnTogglePwd = document.getElementById('btnTogglePwd');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnText = btnSubmit.querySelector('.btnText');

  btnTogglePwd.addEventListener('click', () => {
    const isPassword = contrasena.type === 'password';
    contrasena.type = isPassword ? 'text' : 'password';
    btnTogglePwd.setAttribute('aria-pressed', String(isPassword));
  });

  function validateField(input, groupEl) {
    const valid = input.checkValidity();
    groupEl.classList.toggle('invalid', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  usuario.addEventListener('input', () => validateField(usuario, groupUsuario));
  contrasena.addEventListener('input', () => validateField(contrasena, groupContrasena));

  form.addEventListener('submit', e => {
    const uOk = validateField(usuario, groupUsuario);
    const pOk = validateField(contrasena, groupContrasena);
    if (!uOk || !pOk) { e.preventDefault(); return; }

    btnSubmit.disabled = true;
    btnText.textContent = 'Entrando…';
    const spin = document.createElement('span');
    spin.className = 'spinner';
    btnSubmit.prepend(spin);
  });
});

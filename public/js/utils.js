function showToast(message, isError = false, duration = 3000) {
  const t = dom.toast;
  if (!t) return;
  clearTimeout(window._toastTimeout);
  t.textContent = message;
  t.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition 
                 ${
                   isError
                     ? 'bg-red-600 text-white'
                     : 'bg-gray-800 text-white'
                 }`;
  t.style.transform = 'translateY(0)';
  window._toastTimeout = setTimeout(() => {
    t.style.transform = 'translateY(100%)';
  }, duration);
}

function showButtonLoading(btn, txtEl, spinnerEl, loading) {
  if (!btn || !txtEl || !spinnerEl) return;
  btn.disabled = loading;
  txtEl.style.opacity = loading ? '0.5' : '1';
  spinnerEl.hidden = !loading;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
}

function showStatus(message, isError = false) {
  const s = dom.statusMessage;
  if (!s) return;
  s.textContent = message;
  s.classList.toggle('text-red-600', isError);
  s.classList.toggle('text-green-600', !isError);
  s.hidden = false;
}

function clearStatus() {
  if (dom.statusMessage) dom.statusMessage.hidden = true;
}

const toastRegion = document.querySelector('#toast-region');

export function showPrototypeMessage(message) {
  if (!toastRegion) return;

  const toast = document.createElement('p');
  toast.className = 'toast';
  toast.textContent = message;
  toastRegion.replaceChildren(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

document.querySelectorAll('[data-prototype-message]').forEach((control) => {
  control.addEventListener('click', () => showPrototypeMessage(control.dataset.prototypeMessage));
});

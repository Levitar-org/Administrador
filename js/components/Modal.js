import { Sound } from '../sound.js';

export function showModal(title, bodyHtml, buttons = []) {
  const overlay = document.getElementById('modalOverlay');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const footerEl = document.getElementById('modalFooter');

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;

  footerEl.innerHTML = buttons.map((btn, i) => {
    return `<button class="btn ${btn.class || 'btn-secondary'}" data-modal-btn="${i}">${btn.label}</button>`;
  }).join('');

  const closeModal = () => {
    overlay.classList.remove('open');
  };

  const cleanup = () => {
    document.removeEventListener('keydown', handleKeydown);
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      cleanup();
    }
  };

  document.addEventListener('keydown', handleKeydown);

  document.getElementById('modalClose').addEventListener('click', () => {
    closeModal();
    cleanup();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
      cleanup();
    }
  });

  footerEl.querySelectorAll('[data-modal-btn]').forEach(el => {
    const idx = parseInt(el.dataset.modalBtn);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      Sound.click();
      buttons[idx].action(closeModal);
      cleanup();
    });
  });

  overlay.classList.add('open');
}

const modalOverlay = document.getElementById("modal-overlay");
const modalBox = document.getElementById("modal-box");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");

modalCancel?.addEventListener("click", closeModal);

function closeModal() {
  modalBox.classList.remove("opacity-100", "scale-100");
  modalBox.classList.add("opacity-0", "scale-95");
  setTimeout(() => modalOverlay.classList.add("hidden"), 150);
}

window.openModal = (title, message, onConfirm) => {
  modalTitle.textContent = title;
  modalMessage.textContent = message;

  modalOverlay.classList.remove("hidden");
  setTimeout(() => {
    modalBox.classList.add("opacity-100", "scale-100");
  }, 10);

  modalConfirm.onclick = () => {
    closeModal();
    onConfirm && onConfirm();
  };
};

window.closeModal = closeModal;


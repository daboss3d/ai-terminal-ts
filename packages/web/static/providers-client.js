// src/client/providers-client.ts
function deleteProvider(id) {
  console.log("Deleting provider with id:", id);
}
function editProvider(id) {
  console.log("editing provider with id:", id);
}
window.deleteProvider = deleteProvider;
window.editProvider = editProvider;
document.addEventListener("DOMContentLoaded", () => {
  console.log("Setting up Providers Manager ...");
});
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".action-btn");
  if (!btn)
    return;
  const action = btn.dataset.action;
  const id = btn.dataset.providerId;
  switch (action) {
    case "delete":
      return window.deleteProvider(id);
    case "edit":
      return window.editProvider(id);
    default:
      console.warn("Unknown action:", action);
  }
});

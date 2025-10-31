declare global {
  interface Window {
    deleteProvider: (id: string) => void;
    editProvider: (id: string) => void;
  }
}

function deleteProvider(id: string) {

  console.log("Deleting provider with id:", id);
  //  window.openModal(
  //    "Delete Provider",
  //    `Are you sure you want to delete provider #${id}?`,
  //    () => deleteProviderBackend(id)
  //  );

}
function editProvider(id: string) {

  console.log("Editing provider with id:", id);
}



// expose globally for React
window.deleteProvider = deleteProvider;
window.editProvider = editProvider;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Setting up Providers Manager ...");
  // Get DOM elements
});



document.addEventListener("click", (e) => {
  const btn = e.target.closest(".action-btn");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.providerId;

  switch (action) {
    case "delete":
      //      return window.deleteProvider(id);
      return window.openModal(
        "Delete Provider",
        `Are you sure you want to delete provider "${id}" ?`,
        () => window.deleteProvider(id)
      );



    case "edit":
      return window.editProvider(id);

    default:
      console.warn("Unknown action:", action);
  }
});



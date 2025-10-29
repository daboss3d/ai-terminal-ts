// src/client/providers.ts
class ProvidersPage {
  container = null;
  constructor() {
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }
  async init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id ${containerId} not found`);
    }
    this.bindEvents();
  }
  bindEvents() {
    if (!this.container)
      return;
    const addBtn = this.container.querySelector("#add-provider-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.showForm());
    }
    const form = this.container.querySelector("#provider-form");
    if (form) {
      form.addEventListener("submit", this.handleFormSubmit);
    }
    const cancelBtn = this.container.querySelector("#cancel-form-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.hideForm());
    }
    const providersList = this.container.querySelector("#providers-list");
    if (providersList) {
      providersList.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("edit-provider-btn")) {
          e.preventDefault();
          const id = target.getAttribute("data-provider-id");
          if (id)
            this.editProvider(id);
        }
      });
      providersList.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("toggle-provider-btn")) {
          e.preventDefault();
          const id = target.getAttribute("data-provider-id");
          if (id)
            this.handleToggle(id);
        }
      });
      providersList.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("delete-provider-btn")) {
          e.preventDefault();
          const id = target.getAttribute("data-provider-id");
          if (id)
            this.handleDelete(id);
        }
      });
    }
  }
  showForm() {
    if (!this.container)
      return;
    const formContainer = this.container.querySelector("#providers-form-container");
    const formTitle = this.container.querySelector("#form-title");
    if (formContainer && formTitle) {
      formContainer.classList.remove("hidden");
      formTitle.textContent = "Add New Provider";
      const form = this.container.querySelector("#provider-form");
      if (form) {
        form.reset();
        const idInput = form.querySelector("#provider-id");
        if (idInput)
          idInput.value = "";
      }
    }
  }
  hideForm() {
    if (!this.container)
      return;
    const formContainer = this.container.querySelector("#providers-form-container");
    if (formContainer) {
      formContainer.classList.add("hidden");
    }
  }
  async editProvider(id) {
    try {
      const response = await fetch(`/api/providers/${id}`);
      if (!response.ok) {
        console.error("Failed to fetch provider:", response.status, response.statusText);
        alert("Failed to fetch provider details");
        return;
      }
      const provider = await response.json();
      if (!this.container)
        return;
      const formContainer = this.container.querySelector("#providers-form-container");
      const formTitle = this.container.querySelector("#form-title");
      const idInput = this.container.querySelector("#provider-id");
      const nameInput = this.container.querySelector("#provider-name");
      const modelInput = this.container.querySelector("#provider-model");
      const apiKeyInput = this.container.querySelector("#provider-api-key");
      const baseUrlInput = this.container.querySelector("#provider-base-url");
      const enabledInput = this.container.querySelector("#provider-enabled");
      if (formContainer && formTitle && idInput && nameInput && modelInput && apiKeyInput && baseUrlInput && enabledInput) {
        formContainer.classList.remove("hidden");
        formTitle.textContent = "Edit Provider";
        idInput.value = provider.id;
        nameInput.value = provider.name;
        modelInput.value = provider.model;
        apiKeyInput.value = provider.apiKey || "";
        baseUrlInput.value = provider.baseUrl || "";
        enabledInput.checked = provider.enabled;
      }
    } catch (error) {
      console.error("Error fetching provider for edit:", error);
      alert("Error fetching provider details: " + error.message);
    }
  }
  async handleFormSubmit(e) {
    e.preventDefault();
    if (!this.container)
      return;
    const idInput = this.container.querySelector("#provider-id");
    const nameInput = this.container.querySelector("#provider-name");
    const modelInput = this.container.querySelector("#provider-model");
    const apiKeyInput = this.container.querySelector("#provider-api-key");
    const baseUrlInput = this.container.querySelector("#provider-base-url");
    const enabledInput = this.container.querySelector("#provider-enabled");
    if (!nameInput || !modelInput)
      return;
    const providerData = {
      name: nameInput.value,
      model: modelInput.value,
      apiKey: apiKeyInput?.value || "",
      baseUrl: baseUrlInput?.value || undefined,
      enabled: enabledInput?.checked || false
    };
    try {
      let response;
      if (idInput && idInput.value) {
        response = await fetch(`/api/providers/${idInput.value}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(providerData)
        });
      } else {
        response = await fetch("/api/providers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(providerData)
        });
      }
      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Failed to save provider:", response.status, response.statusText);
        alert("Failed to save provider: " + response.status + " " + response.statusText);
      }
    } catch (error) {
      console.error("Error saving provider:", error);
      alert("Error saving provider: " + error.message);
    }
  }
  async handleToggle(id) {
    try {
      const response = await fetch(`/api/providers/${id}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Failed to toggle provider:", response.status, response.statusText);
        alert("Failed to toggle provider: " + response.status + " " + response.statusText);
      }
    } catch (error) {
      console.error("Error toggling provider:", error);
      alert("Error toggling provider: " + error.message);
    }
  }
  async handleDelete(id) {
    if (!confirm(`Are you sure you want to delete provider "${id}"?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Failed to delete provider:", response.status, response.statusText);
        alert("Failed to delete provider: " + response.status + " " + response.statusText);
      }
    } catch (error) {
      console.error("Error deleting provider:", error);
      alert("Error deleting provider: " + error.message);
    }
  }
}
document.addEventListener("DOMContentLoaded", function() {
  const providersPage = new ProvidersPage;
  providersPage.init("main-content");
});

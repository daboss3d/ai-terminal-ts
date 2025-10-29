// Provider management page UI
class ProvidersPage {
  private container: HTMLElement | null = null;

  constructor() {
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  // Initialize the providers page
  async init(containerId: string): Promise<void> {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id ${containerId} not found`);
    }

    // Only bind events since providers are rendered server-side
    this.bindEvents();
  }

  // Bind event listeners using event delegation
  bindEvents(): void {
    if (!this.container) return;

    // Add provider button
    const addBtn = this.container.querySelector('#add-provider-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showForm());
    }

    // Form submission
    const form = this.container.querySelector('#provider-form');
    if (form) {
      form.addEventListener('submit', this.handleFormSubmit);
    }

    // Cancel form button
    const cancelBtn = this.container.querySelector('#cancel-form-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideForm());
    }

    // Event delegation for provider actions - attach to parent element (providers-list)
    const providersList = this.container.querySelector('#providers-list');
    if (providersList) {
      // Edit provider button
      providersList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('edit-provider-btn')) {
          e.preventDefault();
          const id = target.getAttribute('data-provider-id');
          if (id) this.editProvider(id);
        }
      });

      // Toggle provider button
      providersList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('toggle-provider-btn')) {
          e.preventDefault();
          const id = target.getAttribute('data-provider-id');
          if (id) this.handleToggle(id);
        }
      });

      // Delete provider button
      providersList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('delete-provider-btn')) {
          e.preventDefault();
          const id = target.getAttribute('data-provider-id');
          if (id) this.handleDelete(id);
        }
      });
    }
  }

  // Show the provider form
  showForm(): void {
    if (!this.container) return;
    
    const formContainer = this.container.querySelector('#providers-form-container');
    const formTitle = this.container.querySelector('#form-title');
    
    if (formContainer && formTitle) {
      formContainer.classList.remove('hidden');
      formTitle.textContent = 'Add New Provider';
      
      // Reset form
      const form = this.container.querySelector('#provider-form') as HTMLFormElement;
      if (form) {
        form.reset();
        const idInput = form.querySelector('#provider-id') as HTMLInputElement;
        if (idInput) idInput.value = '';
      }
    }
  }

  // Hide the provider form
  hideForm(): void {
    if (!this.container) return;
    
    const formContainer = this.container.querySelector('#providers-form-container');
    if (formContainer) {
      formContainer.classList.add('hidden');
    }
  }

  // Edit a provider - fetch provider data and populate form
  async editProvider(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/providers/${id}`);
      if (!response.ok) {
        console.error('Failed to fetch provider:', response.status, response.statusText);
        alert('Failed to fetch provider details');
        return;
      }

      const provider = await response.json();

      if (!this.container) return;

      const formContainer = this.container.querySelector('#providers-form-container');
      const formTitle = this.container.querySelector('#form-title');
      const idInput = this.container.querySelector('#provider-id') as HTMLInputElement;
      const nameInput = this.container.querySelector('#provider-name') as HTMLInputElement;
      const modelInput = this.container.querySelector('#provider-model') as HTMLInputElement;
      const apiKeyInput = this.container.querySelector('#provider-api-key') as HTMLInputElement;
      const baseUrlInput = this.container.querySelector('#provider-base-url') as HTMLInputElement;
      const enabledInput = this.container.querySelector('#provider-enabled') as HTMLInputElement;

      if (formContainer && formTitle && idInput && nameInput && modelInput && apiKeyInput && baseUrlInput && enabledInput) {
        formContainer.classList.remove('hidden');
        formTitle.textContent = 'Edit Provider';
        
        idInput.value = provider.id;
        nameInput.value = provider.name;
        modelInput.value = provider.model;
        apiKeyInput.value = provider.apiKey || '';
        baseUrlInput.value = provider.baseUrl || '';
        enabledInput.checked = provider.enabled;
      }
    } catch (error) {
      console.error('Error fetching provider for edit:', error);
      alert('Error fetching provider details: ' + (error as Error).message);
    }
  }

  // Handle form submission (create or update)
  async handleFormSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.container) return;

    const idInput = this.container.querySelector('#provider-id') as HTMLInputElement;
    const nameInput = this.container.querySelector('#provider-name') as HTMLInputElement;
    const modelInput = this.container.querySelector('#provider-model') as HTMLInputElement;
    const apiKeyInput = this.container.querySelector('#provider-api-key') as HTMLInputElement;
    const baseUrlInput = this.container.querySelector('#provider-base-url') as HTMLInputElement;
    const enabledInput = this.container.querySelector('#provider-enabled') as HTMLInputElement;

    if (!nameInput || !modelInput) return;

    const providerData = {
      name: nameInput.value,
      model: modelInput.value,
      apiKey: apiKeyInput?.value || '',
      baseUrl: baseUrlInput?.value || undefined,
      enabled: enabledInput?.checked || false
    };

    try {
      let response;
      if (idInput && idInput.value) {
        // Update existing provider
        response = await fetch(`/api/providers/${idInput.value}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(providerData)
        });
      } else {
        // Create new provider
        response = await fetch('/api/providers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(providerData)
        });
      }

      if (response.ok) {
        // Reload the page to refresh with server-side rendered content
        window.location.reload();
      } else {
        console.error('Failed to save provider:', response.status, response.statusText);
        alert('Failed to save provider: ' + response.status + ' ' + response.statusText);
      }
    } catch (error) {
      console.error('Error saving provider:', error);
      alert('Error saving provider: ' + (error as Error).message);
    }
  }

  // Handle provider toggle
  async handleToggle(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/providers/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Reload the page to refresh with server-side rendered content
        window.location.reload();
      } else {
        console.error('Failed to toggle provider:', response.status, response.statusText);
        alert('Failed to toggle provider: ' + response.status + ' ' + response.statusText);
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
      alert('Error toggling provider: ' + (error as Error).message);
    }
  }

  // Handle provider deletion
  async handleDelete(id: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete provider "${id}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Reload the page to refresh with server-side rendered content
        window.location.reload();
      } else {
        console.error('Failed to delete provider:', response.status, response.statusText);
        alert('Failed to delete provider: ' + response.status + ' ' + response.statusText);
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Error deleting provider: ' + (error as Error).message);
    }
  }
}

// Initialize providers page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const providersPage = new ProvidersPage();
  providersPage.init('main-content');
});
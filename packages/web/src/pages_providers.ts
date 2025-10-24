import { Provider, getAllProviders, createProvider, updateProvider, deleteProvider, toggleProvider } from './providers';

// Provider management page UI
export class ProvidersPage {
  private container: HTMLElement | null = null;
  private providers: Provider[] = [];

  constructor() {
    this.loadProviders = this.loadProviders.bind(this);
    this.render = this.render.bind(this);
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

    await this.loadProviders();
    this.render();
    this.bindEvents();
  }

  // Load providers from the backend
  async loadProviders(): Promise<void> {
    try {
      this.providers = await getAllProviders();
    } catch (error) {
      console.error('Error loading providers:', error);
      // In a real app, you might want to show an error message to the user
    }
  }

  // Render the complete UI
  render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="providers-page p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Providers Management</h1>
          <button id="add-provider-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Provider
          </button>
        </div>

        <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 class="text-lg font-semibold mb-2">Provider Configuration</h2>
          <p class="text-gray-600 dark:text-gray-300">
            Configure AI providers for use with agents. Each provider requires an API key and configuration settings.
          </p>
        </div>

        <div id="providers-form-container" class="mb-6 hidden">
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 id="form-title" class="text-xl font-semibold mb-4">Add New Provider</h2>
            <form id="provider-form">
              <input type="hidden" id="provider-id" />
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="provider-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="provider-name"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., OpenAI, Anthropic, Ollama"
                  />
                </div>

                <div>
                  <label for="provider-model" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    id="provider-model"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., gpt-3.5-turbo, claude-3-haiku, llama3"
                  />
                </div>

                <div>
                  <label for="provider-api-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="provider-api-key"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your API key"
                  />
                </div>

                <div>
                  <label for="provider-base-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base URL
                  </label>
                  <input
                    type="url"
                    id="provider-base-url"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., https://api.openai.com/v1"
                  />
                </div>

                <div class="md:col-span-2">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="provider-enabled"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="provider-enabled" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Enabled
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex space-x-3">
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Provider
                </button>
                <button
                  type="button"
                  id="cancel-form-btn"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Available Providers (${this.providers.length})
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Manage your AI providers and their configurations.
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Model
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Base URL
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="providers-list" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                ${this.renderProvidersList()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // Render the providers list
  renderProvidersList(): string {
    if (this.providers.length === 0) {
      return `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No providers found. Add a new provider to get started.
          </td>
        </tr>
      `;
    }

    return this.providers.map(provider => `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700" data-provider-id="${provider.id}">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.874-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900 dark:text-white">${provider.name}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">${provider.id}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-white">${provider.model}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          ${provider.baseUrl || 'Default'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${provider.enabled 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}">
            ${provider.enabled ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button 
            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 edit-provider-btn" 
            data-provider-id="${provider.id}"
          >
            Edit
          </button>
          <button 
            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 toggle-provider-btn" 
            data-provider-id="${provider.id}"
          >
            ${provider.enabled ? 'Disable' : 'Enable'}
          </button>
          <button 
            class="ml-3 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-provider-btn" 
            data-provider-id="${provider.id}"
          >
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Bind event listeners
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

    // Edit provider buttons
    const editButtons = this.container.querySelectorAll('.edit-provider-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-provider-id');
        if (id) this.editProvider(id);
      });
    });

    // Toggle provider buttons
    const toggleButtons = this.container.querySelectorAll('.toggle-provider-btn');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-provider-id');
        if (id) this.handleToggle(id);
      });
    });

    // Delete provider buttons
    const deleteButtons = this.container.querySelectorAll('.delete-provider-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-provider-id');
        if (id) this.handleDelete(id);
      });
    });
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

  // Edit a provider
  async editProvider(id: string): Promise<void> {
    const provider = this.providers.find(p => p.id === id);
    if (!provider) return;

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
      apiKeyInput.value = provider.apiKey;
      baseUrlInput.value = provider.baseUrl || '';
      enabledInput.checked = provider.enabled;
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

    const providerData: Partial<Provider> = {
      name: nameInput.value,
      model: modelInput.value,
      apiKey: apiKeyInput?.value || '',
      baseUrl: baseUrlInput?.value || undefined,
      enabled: enabledInput?.checked || false
    };

    try {
      if (idInput && idInput.value) {
        // Update existing provider
        await updateProvider(idInput.value, providerData as Provider);
      } else {
        // Create new provider
        await createProvider(providerData as Omit<Provider, 'id'> & { id?: string });
      }

      // Reload providers and refresh UI
      await this.loadProviders();
      this.render();
      this.hideForm();

      // Show success message (in a real app)
      console.log('Provider saved successfully');
    } catch (error) {
      console.error('Error saving provider:', error);
      // In a real app, show an error message to the user
    }
  }

  // Handle provider toggle
  async handleToggle(id: string): Promise<void> {
    const provider = this.providers.find(p => p.id === id);
    if (!provider) return;

    try {
      const updatedProvider = await toggleProvider(id, !provider.enabled);
      if (updatedProvider) {
        // Update the local providers array
        const index = this.providers.findIndex(p => p.id === id);
        if (index !== -1) {
          this.providers[index] = updatedProvider;
        }
        
        // Refresh the UI
        this.render();
        this.bindEvents();
        
        console.log(`Provider ${id} ${updatedProvider.enabled ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
      // In a real app, show an error message to the user
    }
  }

  // Handle provider deletion
  async handleDelete(id: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete provider "${id}"?`)) {
      return;
    }

    try {
      const success = await deleteProvider(id);
      if (success) {
        // Remove from local providers array
        this.providers = this.providers.filter(p => p.id !== id);
        
        // Refresh the UI
        this.render();
        this.bindEvents();
        
        console.log(`Provider ${id} deleted successfully`);
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      // In a real app, show an error message to the user
    }
  }
}
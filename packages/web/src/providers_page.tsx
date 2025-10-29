import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { jsx, Fragment } from 'hono/jsx';
import { html, raw } from 'hono/html';
import { Navbar } from './components/navbar';

// Create the providers page app
const providersApp = new Hono();

// Function to get backend URL
function getBackendUrl() {
  return 'http://localhost:3001'; // Assuming backend runs on port 3001
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Providers page route
providersApp.get('/', async (c) => {
  try {
    // Fetch providers from backend server-side
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/providers`);
    
    let providers = [];
    if (response.ok) {
      providers = await response.json();
    } else {
      console.error('Failed to load providers:', response.status, response.statusText);
    }
    
    // Calculate provider count
    const providerCount = providers.length;
    
    // Generate provider rows server-side
    const providerRows = providers.length > 0 
      ? jsx(Fragment, {
          children: providers.map((provider: any) => {
            const id = escapeHtml(provider.id);
            const name = escapeHtml(provider.name);
            const model = escapeHtml(provider.model);
            const baseUrl = escapeHtml(provider.baseUrl || 'Default');
            const enabled = provider.enabled;
            
            return jsx('tr', {
              class: "hover:bg-gray-50 dark:hover:bg-gray-700",
              'data-provider-id': id,
              children: [
                jsx('td', {
                  class: "px-6 py-4 whitespace-nowrap",
                  children: jsx('div', {
                    class: "flex items-center",
                    children: [
                      jsx('div', {
                        class: "flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/50",
                        children: jsx('svg', {
                          xmlns: "http://www.w3.org/2000/svg",
                          class: "h-6 w-6 text-blue-600 dark:text-blue-400",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor",
                          children: jsx('path', {
                            'stroke-linecap': "round",
                            'stroke-linejoin': "round",
                            'stroke-width': "2",
                            d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.874-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          })
                        })
                      }),
                      jsx('div', {
                        class: "ml-4",
                        children: [
                          jsx('div', {
                            class: "text-sm font-medium text-gray-900 dark:text-white",
                            children: name
                          }),
                          jsx('div', {
                            class: "text-sm text-gray-500 dark:text-gray-400",
                            children: id
                          })
                        ]
                      })
                    ]
                  })
                }),
                jsx('td', {
                  class: "px-6 py-4 whitespace-nowrap",
                  children: jsx('div', {
                    class: "text-sm text-gray-900 dark:text-white",
                    children: model
                  })
                }),
                jsx('td', {
                  class: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
                  children: baseUrl
                }),
                jsx('td', {
                  class: "px-6 py-4 whitespace-nowrap",
                  children: jsx('span', {
                    class: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${enabled 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`,
                    children: enabled ? 'Active' : 'Inactive'
                  })
                }),
                jsx('td', {
                  class: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                  children: [
                    jsx('button', {
                      class: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 edit-provider-btn",
                      'data-provider-id': id,
                      children: 'Edit'
                    }),
                    jsx('button', {
                      class: "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 toggle-provider-btn",
                      'data-provider-id': id,
                      children: enabled ? 'Disable' : 'Enable'
                    }),
                    jsx('button', {
                      class: "ml-3 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-provider-btn",
                      'data-provider-id': id,
                      children: 'Delete'
                    })
                  ]
                })
              ]
            });
          })
        })
      : jsx('tr', {
          children: jsx('td', {
            colspan: 5,
            class: "px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400",
            children: 'No providers found. Add a new provider to get started.'
          })
        });

    // Return the JSX template
    return c.html(
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>AI Terminal - Providers</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            {raw(`
              // Initialize theme based on user preference
              if (localStorage.getItem('theme') === 'dark' || 
                  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            `)}
          </script>
          <link rel="stylesheet" href="/static/styles.css" />
        </head>
        <body class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div class="flex flex-col h-screen">
            <header class="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
              <div class="flex items-center">
                <button id="sidebar-toggle" class="mr-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 class="text-xl font-bold">AI Terminal</h1>
              </div>
              <div class="flex items-center space-x-4">
                <button id="theme-toggle" class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path id="theme-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>
                <div class="relative">
                  <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>
            <div class="flex flex-1 overflow-hidden">
              <Navbar currentPage="providers" />
              <main class="flex-1 overflow-auto p-4">
                <div id="main-content" class="providers-page">
                  <div class="p-6">
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
                          Available Providers (<span id="providers-count">{providerCount}</span>)
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
                            {providerRows}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
            <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex justify-between items-center">
                <div>AI Terminal v1.0</div>
                <div>Current Agent: <span id="current-agent" class="font-medium">Default Agent</span></div>
                <div>Messages: <span id="message-count">0</span> | Tokens: <span id="token-count">0</span></div>
              </div>
            </footer>
          </div>
          <script src="/static/client.js"></script>
          <script src="/static/providers.js"></script>
        </body>
      </html>
    );
  } catch (error) {
    console.error('Error in providers page:', error);
    // Fallback to original HTML if there's an error
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>AI Terminal - Providers</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            // Initialize theme based on user preference
            if (localStorage.getItem('theme') === 'dark' || 
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          </script>
          <link rel="stylesheet" href="/static/styles.css">
        </head>
        <body class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div class="flex flex-col h-screen">
            <header class="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
              <div class="flex items-center">
                <button id="sidebar-toggle" class="mr-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 class="text-xl font-bold">AI Terminal</h1>
              </div>
              <div class="flex items-center space-x-4">
                <button id="theme-toggle" class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path id="theme-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>
                <div class="relative">
                  <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>
            <div class="flex flex-1 overflow-hidden">
              <Navbar currentPage="providers" />
              <main class="flex-1 overflow-auto p-4">
                <div id="main-content" class="providers-page">
                  <div class="p-6">
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
                          Available Providers (<span id="providers-count">0</span>)
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
                            <tr>
                              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                Loading providers...
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
            <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex justify-between items-center">
                <div>AI Terminal v1.0</div>
                <div>Current Agent: <span id="current-agent" class="font-medium">Default Agent</span></div>
                <div>Messages: <span id="message-count">0</span> | Tokens: <span id="token-count">0</span></div>
              </div>
            </footer>
          </div>
          <script src="/static/client.js"></script>
          <script src="/static/providers.js"></script>
        </body>
      </html>
    `);
  }
});

export default providersApp;
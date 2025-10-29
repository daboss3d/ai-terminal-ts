import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { serveStatic } from 'hono/bun';
import { jsx, Fragment } from 'hono/jsx';
import { html, raw } from 'hono/html'
//import providersApp from './providers_page';
import providersApp from './pages/Providers_page.tsx';

// test comment
function getBackendUrl() {
  return 'http://localhost:3001'; // Assuming backend runs on port 3001
}


// Create the Hono app
const app = new Hono();

const currentDirectory = import.meta.dir;
// print the root directory for debugging
console.log('Current working directory:', currentDirectory);

// Serve static assets
app.use('/static/*', serveStatic({
  root: './',

  mimes: {
    tsx: 'text/javascript',
    ts: 'text/javascript',
    css: 'text/css'
  },

  onNotFound: (path, c) => {
    console.log(`${path} is not found, you access ${c.req.path}`)
  },
  onFound: (_path, c) => {
    c.header('Cache-Control', `public, immutable, max-age=31536000`)
  }

}));

// Mount the providers app under the /providers route
app.route('/providers', providersApp);



// Main route
app.get('/', (c) => {
  // Directly return the full HTML with all components rendered as HTML strings
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">

        <title>AI Terminal</title>
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
            <aside id="sidebar" class="bg-white dark:bg-gray-800 shadow-md sidebar h-full flex flex-col overflow-hidden" style="width: var(--sidebar-width);">
              <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 class="text-lg font-semibold">AI Terminal</h2>
                <button id="sidebar-collapse" class="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <nav class="flex-1 overflow-y-auto p-2">
                <ul class="space-y-1">
                  <li>
                    <a href="/" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span class="sidebar-label">Chat</span>
                    </a>
                  </li>
                  <li>
                    <a href="/agents" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      <span class="sidebar-label">Agents</span>
                    </a>
                  </li>
                  <li>
                    <a href="/providers" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span class="sidebar-label">Providers</span>
                    </a>
                  </li>
                </ul>
                
                <!-- Agents list section - will be populated dynamically -->
                <div class="mt-6">
                  <h3 class="px-2 text-sm font-medium text-gray-500 dark:text-gray-400 sidebar-label">Agents</h3>
                  <ul id="agents-list" class="mt-2 space-y-1">
                    <li>
                      <a href="#" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <span class="sidebar-label">Default Agent</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <span class="sidebar-label">GPT-4 Assistant</span>
                      </a>
                    </li>
                  </ul>
                </div>
                
                <!-- Providers list section - will be populated dynamically -->
                <div class="mt-6">
                  <h3 class="px-2 text-sm font-medium text-gray-500 dark:text-gray-400 sidebar-label">Providers</h3>
                  <ul id="sidebar-providers-list" class="mt-2 space-y-1">
                    <li>
                      <a href="#" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <span class="sidebar-label">OpenAI</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <span class="sidebar-label">Anthropic</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </aside>
            <main class="flex-1 overflow-auto p-4">
              <div id="main-content" class="chat-container flex flex-col">
                <div class="chat-header p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span id="active-agent" class="font-medium">Default Agent</span>
                  </div>
                </div>
                <div class="chat-messages flex-1 overflow-y-auto mb-4 space-y-4 p-4">
                  <!-- Messages will be rendered here -->
                  <div class="message assistant max-w-3/4">
                    <div class="flex">
                      <div class="bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span class="font-bold text-gray-700 dark:text-gray-200">AI</span>
                      </div>
                      <div>
                        <p>Hello! I'm your AI assistant. How can I help you today?</p>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Just now</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="chat-input p-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex">
                    <input
                      type="text"
                      id="message-input"
                      placeholder="Type your message..."
                      class="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button id="send-button" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-r-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Press Enter to send, Shift+Enter for new line
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
      </body>
    </html>
  `);
});



// API routes proxy to backend
app.get('/api/*', async (c) => {
  try {
    const backendUrl = getBackendUrl();
    const url = new URL(c.req.url);
    const backendResponse = await fetch(`${backendUrl}${url.pathname}${url.search}`);

    if (!backendResponse.ok) {
      // If backend is not available, return an empty response or mock data
      console.warn(`Backend request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Backend service not available" }, 503);
    }

    const data = await backendResponse.json();
    return c.json(data);
  } catch (error) {
    console.error('Error proxying API request:', error);
    // Return mock data when backend is not available
    const path = c.req.path;
    if (path === '/api/agents') {
      return c.json([
        { id: "default-agent", name: "Default Agent", description: "This is a default agent", model: "gpt-3.5-turbo", temperature: 0.7, top_p: 1, frequency_penalty: 0, presence_penalty: 0, max_tokens: 1000, provider: "openai", system_prompt: "You are a helpful assistant.", tools: [], use_tools: false, use_memory: false }
      ]);
    } else if (path === '/api/providers') {
      return c.json([
        { id: "openai", name: "OpenAI", apiKey: "", model: "gpt-3.5-turbo", enabled: false },
        { id: "anthropic", name: "Anthropic", apiKey: "", model: "claude-3-haiku-20240307", enabled: false },
        { id: "ollama", name: "Ollama", apiKey: "", model: "llama3", baseUrl: "http://localhost:11434", enabled: false }
      ]);
    } else {
      return c.json({ error: "Service temporarily unavailable" }, 503);
    }
  }
});

app.post('/api/*', async (c) => {
  try {
    const backendUrl = 'http://localhost:3001'; // Assuming backend runs on port 3001
    const url = new URL(c.req.url);

    const body = await c.req.json();

    const backendResponse = await fetch(`${backendUrl}${url.pathname}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      console.warn(`Backend request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Backend service not available" }, 503);
    }

    const data = await backendResponse.json();
    return c.json(data);
  } catch (error) {
    console.error('Error proxying API request:', error);
    return c.json({ error: "Service temporarily unavailable" }, 503);
  }
});

// Special route for chat functionality
app.post('/api/chat', async (c) => {
  try {
    const backendUrl = getBackendUrl();
    const body = await c.req.json();

    // Forward the chat request to the backend
    const backendResponse = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      console.warn(`Chat request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Chat service not available" }, 503);
    }

    const data = await backendResponse.json();
    return c.json(data);
  } catch (error) {
    console.error('Error in chat API:', error);
    return c.json({ error: "Chat service temporarily unavailable", response: "Sorry, there was an error communicating with the AI service." }, 503);
  }
});

// CRUD endpoints for providers

// GET all providers
app.get('/api/providers', async (c) => {
  try {
    const backendUrl = getBackendUrl();
    const url = new URL(c.req.url);
    const backendResponse = await fetch(`${backendUrl}/api/providers`);

    if (!backendResponse.ok) {
      console.warn(`Providers request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Providers service not available" }, 503);
    }

    const data = await backendResponse.json();
    return c.json(data);
  } catch (error) {
    console.error('Error in providers API:', error);
    return c.json({ error: "Providers service temporarily unavailable" }, 503);
  }
});

// GET a specific provider
app.get('/api/providers/:id', async (c) => {
  try {
    const backendUrl = getBackendUrl();
    const { id } = c.req.param();
    const backendResponse = await fetch(`${backendUrl}/api/providers/${id}`);

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return c.json({ error: "Provider not found" }, 404);
      }
      console.warn(`Get provider request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Provider service not available" }, 503);
    }

    const data = await backendResponse.json();
    return c.json(data);
  } catch (error) {
    console.error('Error in get provider API:', error);
    return c.json({ error: "Provider service temporarily unavailable" }, 503);
  }
});

// POST to create a new provider
app.post('/api/providers', async (c) => {
  try {
    const backendUrl = getBackendUrl();
    const body = await c.req.json();

    const backendResponse = await fetch(`${backendUrl}/api/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      console.warn(`Create provider request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Failed to create provider" }, backendResponse.status);
    }

    const data = await backendResponse.json();
    return c.json(data);
  } catch (error) {
    console.error('Error in create provider API:', error);
    return c.json({ error: "Failed to create provider" }, 500);
  }
});

// PUT to update a provider
app.put('/api/providers/:id', async (c) => {
  try {
    const backendUrl = getBackendUrl();
    const { id } = c.req.param();
    const body = await c.req.json();

    const backendResponse = await fetch(`${backendUrl}/api/providers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return c.json({ error: "Provider not found" }, 404);
      }
      console.warn(`Update provider request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Failed to update provider" }, backendResponse.status);
    }

    const data = await backendResponse.json();
    return c.json(data);
  } catch (error) {
    console.error('Error in update provider API:', error);
    return c.json({ error: "Failed to update provider" }, 500);
  }
});

// PUT to toggle provider status
app.put('/api/providers/:id/toggle', async (c) => {
  try {
    const backendUrl = getBackendUrl();
    const { id } = c.req.param();
    const body = await c.req.json();

    const backendResponse = await fetch(`${backendUrl}/api/providers/${id}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return c.json({ error: "Provider not found" }, 404);
      }
      console.warn(`Toggle provider request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Failed to toggle provider" }, backendResponse.status);
    }

    const data = await backendResponse.json();
    return c.json(data);
  } catch (error) {
    console.error('Error in toggle provider API:', error);
    return c.json({ error: "Failed to toggle provider" }, 500);
  }
});

// DELETE a provider
app.delete('/api/providers/:id', async (c) => {
  try {
    const backendUrl = getBackendUrl();
    const { id } = c.req.param();

    const backendResponse = await fetch(`${backendUrl}/api/providers/${id}`, {
      method: 'DELETE'
    });

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return c.json({ error: "Provider not found" }, 404);
      }
      console.warn(`Delete provider request failed: ${backendResponse.status} ${backendResponse.statusText}`);
      return c.json({ error: "Failed to delete provider" }, backendResponse.status);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete provider API:', error);
    return c.json({ error: "Failed to delete provider" }, 500);
  }
});

// Layout component
const Layout = ({ children }: { children: any }) => {
  return jsx('div', {
    class: "flex flex-col h-screen",
    children: [
      jsx(Header, {}),
      jsx('div', {
        class: "flex flex-1 overflow-hidden",
        children: [
          jsx(Sidebar, {}),
          jsx('main', {
            class: "flex-1 overflow-auto p-4",
            children: children
          })
        ]
      }),
      jsx(Footer, {})
    ]
  });
};

// Header component
const Header = () => {
  return jsx('header', {
    class: "bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center",
    children: [
      jsx('div', {
        class: "flex items-center",
        children: [
          jsx('button', {
            id: "sidebar-toggle",
            class: "mr-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            children: jsx('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              class: "h-6 w-6",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: jsx('path', {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M4 6h16M4 12h16M4 18h16"
              })
            })
          }),
          jsx('h1', { class: "text-xl font-bold", children: 'AI Terminal' })
        ]
      }),
      jsx('div', {
        class: "flex items-center space-x-4",
        children: [
          jsx('button', {
            id: "theme-toggle",
            class: "p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            children: jsx('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              class: "h-6 w-6",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: jsx('path', {
                id: "theme-icon",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              })
            })
          }),
          jsx('div', {
            class: "relative",
            children: jsx('button', {
              class: "p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700",
              children: jsx('svg', {
                xmlns: "http://www.w3.org/2000/svg",
                class: "h-6 w-6",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: jsx('path', {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                })
              })
            })
          })
        ]
      })
    ]
  });
};

// Sidebar component
const Sidebar = () => {
  return jsx('aside', {
    id: "sidebar",
    class: "bg-white dark:bg-gray-800 shadow-md sidebar h-full flex flex-col overflow-hidden",
    children: [
      jsx('div', {
        class: "p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center",
        children: [
          jsx('h2', { class: "text-lg font-semibold", children: 'AI Terminal' }),
          jsx('button', {
            id: "sidebar-collapse",
            class: "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            children: jsx('svg', {
              xmlns: "http://www.w3.org/2000/svg",
              class: "h-5 w-5",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: jsx('path', {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M15 19l-7-7 7-7"
              })
            })
          })
        ]
      }),
      jsx('nav', {
        class: "flex-1 overflow-y-auto p-2",
        children: [
          jsx('ul', {
            class: "space-y-1",
            children: [
              jsx('li', {
                children: jsx('a', {
                  href: "/",
                  class: "flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group",
                  children: [
                    jsx('svg', {
                      xmlns: "http://www.w3.org/2000/svg",
                      class: "h-5 w-5 mr-3",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor",
                      children: jsx('path', {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: "2",
                        d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      })
                    }),
                    jsx('span', { class: "sidebar-label", children: 'Chat' })
                  ]
                })
              }),
              jsx('li', {
                children: jsx('a', {
                  href: "/agents",
                  class: "flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group",
                  children: [
                    jsx('svg', {
                      xmlns: "http://www.w3.org/2000/svg",
                      class: "h-5 w-5 mr-3",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor",
                      children: jsx('path', {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: "2",
                        d: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      })
                    }),
                    jsx('span', { class: "sidebar-label", children: 'Agents' })
                  ]
                })
              }),
              jsx('li', {
                children: jsx('a', {
                  href: "/providers",
                  class: "flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group",
                  children: [
                    jsx('svg', {
                      xmlns: "http://www.w3.org/2000/svg",
                      class: "h-5 w-5 mr-3",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      stroke: "currentColor",
                      children: jsx('path', {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: "2",
                        d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      })
                    }),
                    jsx('span', { class: "sidebar-label", children: 'Providers' })
                  ]
                })
              })
            ]
          }),
          // Agents list section
          jsx('div', {
            class: "mt-6",
            children: [
              jsx('h3', {
                class: "px-2 text-sm font-medium text-gray-500 dark:text-gray-400 sidebar-label",
                children: 'Agents'
              }),
              jsx('ul', {
                id: "agents-list",
                class: "mt-2 space-y-1",
                children: [
                  jsx('li', {
                    children: jsx('a', {
                      href: "#",
                      class: "flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group",
                      children: jsx('span', { class: "sidebar-label", children: 'Default Agent' })
                    })
                  }),
                  jsx('li', {
                    children: jsx('a', {
                      href: "#",
                      class: "flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group",
                      children: jsx('span', { class: "sidebar-label", children: 'GPT-4 Assistant' })
                    })
                  })
                ]
              })
            ]
          }),
          // Providers list section
          jsx('div', {
            class: "mt-6",
            children: [
              jsx('h3', {
                class: "px-2 text-sm font-medium text-gray-500 dark:text-gray-400 sidebar-label",
                children: 'Providers'
              }),
              jsx('ul', {
                id: "sidebar-providers-list",
                class: "mt-2 space-y-1",
                children: [
                  jsx('li', {
                    children: jsx('a', {
                      href: "#",
                      class: "flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group",
                      children: jsx('span', { class: "sidebar-label", children: 'OpenAI' })
                    })
                  }),
                  jsx('li', {
                    children: jsx('a', {
                      href: "#",
                      class: "flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group",
                      children: jsx('span', { class: "sidebar-label", children: 'Anthropic' })
                    })
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};

// ChatMessage component
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Home page component
const HomePage = () => {
  return jsx('div', {
    class: "chat-container flex flex-col",
    children: [
      jsx('div', {
        class: "chat-header p-3 border-b border-gray-200 dark:border-gray-700 flex items-center",
        children: jsx('div', {
          class: "flex items-center",
          children: [
            jsx('div', { class: "w-3 h-3 rounded-full bg-green-500 mr-2" }),
            jsx('span', { id: "active-agent", class: "font-medium", children: 'Default Agent' })
          ]
        })
      }),
      jsx('div', {
        class: "chat-messages flex-1 overflow-y-auto mb-4 space-y-4 p-4",
        children: jsx('div', {
          class: "message assistant max-w-3/4",
          children: jsx('div', {
            class: "flex",
            children: [
              jsx('div', {
                class: "bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0",
                children: jsx('span', {
                  class: "font-bold text-gray-700 dark:text-gray-200",
                  children: 'AI'
                })
              }),
              jsx('div', {
                children: [
                  jsx('p', { children: "Hello! I'm your AI assistant. How can I help you today?" }),
                  jsx('div', {
                    class: "text-xs text-gray-500 dark:text-gray-400 mt-1",
                    children: 'Just now'
                  })
                ]
              })
            ]
          })
        })
      }),
      jsx('div', {
        class: "chat-input p-4 border-t border-gray-200 dark:border-gray-700",
        children: [
          jsx('div', {
            class: "flex",
            children: [
              jsx('input', {
                type: "text",
                id: "message-input",
                placeholder: "Type your message...",
                class: "flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              }),
              jsx('button', {
                id: "send-button",
                class: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-r-lg",
                children: jsx('svg', {
                  xmlns: "http://www.w3.org/2000/svg",
                  class: "h-5 w-5",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  children: jsx('path', {
                    fillRule: "evenodd",
                    d: "M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z",
                    clipRule: "evenodd"
                  })
                })
              })
            ]
          }),
          jsx('div', {
            class: "mt-2 text-xs text-gray-500 dark:text-gray-400 text-center",
            children: "Press Enter to send, Shift+Enter for new line"
          })
        ]
      })
    ]
  });
};

// Footer component
const Footer = () => {
  return jsx('footer', {
    class: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-500 dark:text-gray-400",
    children: jsx('div', {
      class: "flex justify-between items-center",
      children: [
        jsx('div', { children: 'AI Terminal v1.0' }),
        jsx('div', {
          children: ['Current Agent: ', jsx('span', {
            id: "current-agent",
            class: "font-medium",
            children: 'Default Agent'
          })]
        }),
        jsx('div', {
          children: [
            'Messages: ',
            jsx('span', { id: "message-count", children: '0' }),
            ' | Tokens: ',
            jsx('span', { id: "token-count", children: '0' })
          ]
        })
      ]
    })
  });
};

export default app;

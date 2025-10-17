import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { serveStatic } from 'hono/bun';
import { jsx, Fragment } from 'hono/jsx';
import { html, raw } from 'hono/html'

// test comment
// 2nd test comment
// 3rd test comment

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



// Main route
app.get('/', (c) => {
  // Directly return the full HTML with all components rendered as HTML strings
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        <style>
          :root {
            --sidebar-width: 240px;
          }
          
          .dark {
            color-scheme: dark;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          
          .chat-container {
            height: calc(100vh - 4rem); /* Full height minus header and footer */
          }
          
          .sidebar {
            width: var(--sidebar-width);
            transition: all 0.3s ease;
            overflow-x: hidden;
          }
          
          .sidebar.collapsed {
            width: 4rem; /* Width of the collapsed sidebar with just icons */
          }
          
          .sidebar.collapsed .sidebar-label {
            display: none;
          }
          
          .sidebar.collapsed #sidebar-collapse svg {
            transform: rotate(180deg);
          }
          
          .message.user {
            background-color: #dbeafe;
            border-radius: 12px;
            padding: 0.75rem 1rem;
          }
          
          .message.assistant {
            background-color: #f3f4f6;
            border-radius: 12px;
            padding: 0.75rem 1rem;
          }
          
          .dark .message.user {
            background-color: #2563eb;
          }
          
          .dark .message.assistant {
            background-color: #374151;
          }
        </style>
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
                  <ul id="providers-list" class="mt-2 space-y-1">
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
              <div class="chat-container flex flex-col">
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
        <script>
          // Toggle sidebar
          const sidebarToggle = document.getElementById('sidebar-toggle');
          const sidebarCollapse = document.getElementById('sidebar-collapse');
          const sidebar = document.getElementById('sidebar');

          if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
              sidebar.classList.toggle('collapsed');
            });
          }

          if (sidebarCollapse && sidebar) {
            sidebarCollapse.addEventListener('click', () => {
              sidebar.classList.toggle('collapsed');
            });
          }

          // Add class to hide sidebar labels when collapsed
          function updateSidebarDisplay() {
            if (sidebar) {
              const isCollapsed = sidebar.classList.contains('collapsed');
              const labels = document.querySelectorAll('.sidebar-label');
              labels.forEach(label => {
                if (isCollapsed) {
                  label.style.display = 'none';
                } else {
                  label.style.display = 'inline';
                }
              });
            }
          }

          // Run on initial load and when sidebar state changes
          document.addEventListener('DOMContentLoaded', updateSidebarDisplay);
          if (sidebar) {
            const observer = new MutationObserver(updateSidebarDisplay);
            observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
          }

          // Theme toggle functionality
          const themeToggle = document.getElementById('theme-toggle');
          const themeIcon = document.getElementById('theme-icon');

          if (themeToggle) {
            themeToggle.addEventListener('click', () => {
              document.documentElement.classList.toggle('dark');
              
              // Save preference to localStorage
              if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
              } else {
                localStorage.setItem('theme', 'light');
              }
              
              // Update icon based on theme
              updateThemeIcon();
            });
            
            // Initialize theme icon on page load
            updateThemeIcon();
          }
          
          function updateThemeIcon() {
            if (themeIcon) {
              if (document.documentElement.classList.contains('dark')) {
                // Sun icon for dark mode (meaning we're switching to light mode)
                themeIcon.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
              } else {
                // Moon icon for light mode (meaning we're switching to dark mode)
                themeIcon.setAttribute('d', 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
              }
            }
          }

          // Initialize theme based on saved preference
          function initializeTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else if (savedTheme === 'light') {
              document.documentElement.classList.remove('dark');
            } else {
              // If no saved preference, use system preference
              if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
              } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
              }
            }
            updateThemeIcon();
          }

          // Run initialization when DOM is loaded
          document.addEventListener('DOMContentLoaded', initializeTheme);

          // Add message sending functionality
          const messageInput = document.getElementById('message-input');
          const sendButton = document.getElementById('send-button');
          let messageCount = 0;

          if (messageInput && sendButton) {
            // Send message on button click
            sendButton.addEventListener('click', sendMessage);
            
            // Send message on Enter key (but allow Shift+Enter for new line)
            messageInput.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent new line
                sendMessage();
              }
            });
          }

          async function sendMessage() {
            if (!messageInput || !messageInput.value.trim()) return;
            
            const message = messageInput.value.trim();
            messageInput.value = '';
            
            // Add user message to chat
            addMessageToChat(message, 'user');
            
            try {
              // Send message to backend API
              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: message,
                  agentId: 'default-agent' // This would come from the selected agent
                })
              });
              
              if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
              }
              
              const data = await response.json();
              
              // Add assistant response to chat
              addMessageToChat(data.response, 'assistant');
            } catch (error) {
              console.error('Error sending message:', error);
              addMessageToChat("Sorry, there was an error communicating with the AI service.", 'assistant');
            }
          }

          function addMessageToChat(content, sender) {
            const messagesContainer = document.querySelector('.chat-messages');
            if (!messagesContainer) return;
            
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', sender, 'max-w-3/4');
            
            const messageContent = document.createElement('div');
            messageContent.classList.add('flex');
            
            // Add avatar
            const avatarDiv = document.createElement('div');
            avatarDiv.classList.add('w-8', 'h-8', 'rounded-full', 'flex', 'items-center', 'justify-center', 'mr-2', 'flex-shrink-0');
            
            if (sender === 'user') {
              avatarDiv.classList.add('bg-blue-500');
              avatarDiv.innerHTML = '<span class="font-bold text-white">U</span>';
            } else {
              avatarDiv.classList.add('bg-gray-200', 'dark:bg-gray-700');
              avatarDiv.innerHTML = '<span class="font-bold text-gray-700 dark:text-gray-200">AI</span>';
            }
            
            // Add message bubble
            const bubbleDiv = document.createElement('div');
            
            const messageParagraph = document.createElement('p');
            messageParagraph.textContent = content;
            
            // Add timestamp
            const timestampDiv = document.createElement('div');
            timestampDiv.classList.add('text-xs', 'text-gray-500', 'dark:text-gray-400', 'mt-1');
            const now = new Date();
            timestampDiv.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            
            bubbleDiv.appendChild(messageParagraph);
            bubbleDiv.appendChild(timestampDiv);
            
            messageContent.appendChild(avatarDiv);
            messageContent.appendChild(bubbleDiv);
            messageDiv.appendChild(messageContent);
            
            messagesContainer.appendChild(messageDiv);
            
            // Update message count
            messageCount++;
            updateStats(messageCount, 0); // Token count would be calculated in a real implementation
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }

          // Function to load agents from API and populate sidebar
          async function loadAgents() {
            try {
              const response = await fetch('/api/agents');
              if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
              }
              
              const agents = await response.json();
              const agentsList = document.getElementById('agents-list');
              
              if (agentsList) {
                // Clear existing agents
                agentsList.innerHTML = '';
                
                // Add each agent to the list
                agents.forEach(function(agent) {
                  const li = document.createElement('li');
                  li.innerHTML = 
                    '<a href="#" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group agent-item" data-agent-id="' + agent.id + '">' +
                      '<span class="sidebar-label">' + agent.name + '</span>' +
                    '</a>';
                  agentsList.appendChild(li);
                });
                
                // Add click event listeners to agent items
                document.querySelectorAll('.agent-item').forEach(function(item) {
                  item.addEventListener('click', function(e) {
                    e.preventDefault();
                    var agentId = e.currentTarget.getAttribute('data-agent-id');
                    if (agentId) {
                      selectAgent(agentId);
                    }
                  });
                });
              }
            } catch (error) {
              console.error('Error loading agents:', error);
            }
          }

          // Function to load providers from API and populate sidebar
          async function loadProviders() {
            try {
              const response = await fetch('/api/providers');
              if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
              }
              
              const providers = await response.json();
              const providersList = document.getElementById('providers-list');
              
              if (providersList) {
                // Clear existing providers
                providersList.innerHTML = '';
                
                // Add each provider to the list
                providers.forEach(function(provider) {
                  const li = document.createElement('li');
                  var statusClass = provider.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
                  var statusText = provider.enabled ? 'ON' : 'OFF';
                  li.innerHTML = 
                    '<a href="#" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group provider-item" data-provider-id="' + provider.id + '">' +
                      '<span class="sidebar-label">' + provider.name + '</span>' +
                      '<span class="ml-auto text-xs px-2 py-1 rounded ' + statusClass + '">' +
                        statusText +
                      '</span>' +
                    '</a>';
                  providersList.appendChild(li);
                });
              }
            } catch (error) {
              console.error('Error loading providers:', error);
            }
          }

          // Function to select an agent
          function selectAgent(agentId) {
            // Update the active agent display
            const activeAgentSpan = document.getElementById('active-agent');
            if (activeAgentSpan) {
              activeAgentSpan.textContent = agentId;
            }
            
            // Update footer to show current agent
            const currentAgentSpan = document.getElementById('current-agent');
            if (currentAgentSpan) {
              currentAgentSpan.textContent = agentId;
            }
            
            // In a real implementation, we would store the selected agent in state
            console.log('Selected agent:', agentId);
          }

          // Function to update message and token counts in footer
          function updateStats(messageCount, tokenCount) {
            const messageCountSpan = document.getElementById('message-count');
            const tokenCountSpan = document.getElementById('token-count');
            
            if (messageCountSpan) {
              messageCountSpan.textContent = messageCount.toString();
            }
            
            if (tokenCountSpan) {
              tokenCountSpan.textContent = tokenCount.toString();
            }
          }

          // Run initialization when DOM is loaded
          document.addEventListener('DOMContentLoaded', async function() {
            initializeTheme();
            await loadAgents();
            await loadProviders();
          });
        </script>
      </body>
    </html>
  `);
});

// API routes proxy to backend
app.get('/api/*', async (c) => {
  const backendUrl = 'http://localhost:3001'; // Assuming backend runs on port 3001
  const url = new URL(c.req.url);
  const backendResponse = await fetch(`${backendUrl}${url.pathname}${url.search}`);
  const data = await backendResponse.json();
  return c.json(data);
});

app.post('/api/*', async (c) => {
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

  const data = await backendResponse.json();
  return c.json(data);
});

// Special route for chat functionality
app.post('/api/chat', async (c) => {
  const backendUrl = 'http://localhost:3001';
  const body = await c.req.json();

  // Forward the chat request to the backend
  const backendResponse = await fetch(`${backendUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  const data = await backendResponse.json();
  return c.json(data);
});

// Get agents from backend
app.get('/api/agents', async (c) => {
  const backendUrl = 'http://localhost:3001';
  const backendResponse = await fetch(`${backendUrl}/api/agents`);
  const data = await backendResponse.json();
  return c.json(data);
});

// Get providers from backend
app.get('/api/providers', async (c) => {
  const backendUrl = 'http://localhost:3001';
  const backendResponse = await fetch(`${backendUrl}/api/providers`);
  const data = await backendResponse.json();
  return c.json(data);
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
                id: "providers-list",
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

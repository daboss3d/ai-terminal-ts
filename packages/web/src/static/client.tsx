// client.tsx - Client-side JavaScript for interactive features

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
        (label as HTMLElement).style.display = 'none';
      } else {
        (label as HTMLElement).style.display = 'inline';
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
document.addEventListener('DOMContentLoaded', async () => {
  initializeTheme();
  await loadAgents();
  await loadProviders();
});

// Function to load agents from API and populate sidebar
async function loadAgents() {
  try {
    const response = await fetch('/api/agents');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const agents = await response.json();
    const agentsList = document.getElementById('agents-list');
    
    if (agentsList) {
      // Clear existing agents
      agentsList.innerHTML = '';
      
      // Add each agent to the list
      agents.forEach((agent: any) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <a href="#" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group agent-item" data-agent-id="${agent.id}">
            <span class="sidebar-label">${agent.name}</span>
          </a>
        `;
        agentsList.appendChild(li);
      });
      
      // Add click event listeners to agent items
      document.querySelectorAll('.agent-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const agentId = (e.currentTarget as HTMLElement).getAttribute('data-agent-id');
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const providers = await response.json();
    const providersList = document.getElementById('providers-list');
    
    if (providersList) {
      // Clear existing providers
      providersList.innerHTML = '';
      
      // Add each provider to the list
      providers.forEach((provider: any) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <a href="#" class="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group provider-item" data-provider-id="${provider.id}">
            <span class="sidebar-label">${provider.name}</span>
            <span class="ml-auto text-xs px-2 py-1 rounded ${provider.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}">
              ${provider.enabled ? 'ON' : 'OFF'}
            </span>
          </a>
        `;
        providersList.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Error loading providers:', error);
  }
}

// Function to select an agent
function selectAgent(agentId: string) {
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
function updateStats(messageCount: number, tokenCount: number) {
  const messageCountSpan = document.getElementById('message-count');
  const tokenCountSpan = document.getElementById('token-count');
  
  if (messageCountSpan) {
    messageCountSpan.textContent = messageCount.toString();
  }
  
  if (tokenCountSpan) {
    tokenCountSpan.textContent = tokenCount.toString();
  }
}

// Add message sending functionality
const messageInput = document.getElementById('message-input') as HTMLInputElement;
const sendButton = document.getElementById('send-button');

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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add assistant response to chat
    addMessageToChat(data.response, 'assistant');
  } catch (error) {
    console.error('Error sending message:', error);
    addMessageToChat("Sorry, there was an error communicating with the AI service.", 'assistant');
  }
}

let messageCount = 0;

function addMessageToChat(content: string, sender: 'user' | 'assistant') {
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
  timestampDiv.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
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
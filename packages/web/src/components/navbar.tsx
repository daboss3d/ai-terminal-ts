import { jsx } from 'hono/jsx';

interface NavbarProps {
  currentPage?: string; // To highlight the current page in the navbar
}

export const Navbar = ({ currentPage = '' }: NavbarProps) => {
  // Determine active class based on current page
  const isActive = (page: string) => currentPage === page ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white';
  
  return (
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
            <a href="/" class={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group ${isActive('chat')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span class="sidebar-label">Chat</span>
            </a>
          </li>
          <li>
            <a href="/agents" class={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group ${isActive('agents')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span class="sidebar-label">Agents</span>
            </a>
          </li>
          <li>
            <a href="/providers" class={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group ${isActive('providers')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="sidebar-label">Providers</span>
            </a>
          </li>
        </ul>
        
        {/* Agents list section - will be populated dynamically */}
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
        
        {/* Providers list section - will be populated dynamically */}
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
  );
};
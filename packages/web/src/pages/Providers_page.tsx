import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { jsx, Fragment } from 'hono/jsx';
import { html, raw } from 'hono/html';

import type { FC } from "hono/jsx";

import type { Provider } from '@lib/providers.js';
import { MainLayout } from '../layouts/MainLayout.js';
import { Icon_edit, Icon_delete } from "../components/Icons.ts";


// Function to get backend URL
function getBackendUrl() {
  return 'http://localhost:3001'; // Assuming backend runs on port 3001
}

async function getProviders() {
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

    return providers;

  } catch (error) {

    console.error('Error in providers page:', error);
    return [];
  }

}


// Create the providers page app
const providersApp = new Hono();


const Layout: FC = (props) => {
  return (
    <html>
      <body>{props.children}</body>
    </html>
  )
}

const Top: FC<{ messages: string[] }> = (props: {
  messages: string[]
}) => {
  return (
    <Layout>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>
        })}
      </ul>
    </Layout>
  )
}

providersApp.get('/test', (c) => {
  const messages = ['Good Morning', 'Good Evening', 'Good Night']
  return c.html(<Top messages={messages} />)
})



// Providers page route
providersApp.get('/', async (c) => {
  const providers = await getProviders();

  return c.html(<ProvidersPageTest providers={providers} />)
})


const ProviderRow: FC<{ provider: Provider }> = (props: { provider: Provider }) => {

  return (
    <div>
      <div className="flex items-center gap-4 p-2 item-name hover:bg-gray-100 rounded cursor-pointer">
        <div className="min-w-[200px] font-medium">{props.provider.name}</div>
        <div className="flex-1">{props.provider.name}</div>
        <div className="flex-1">{props.provider.name}</div>

        <div className="w-12 text-right text-gray-500">28</div>
        <div class="flex-2 w-2 h-8 mr-8 text-primary">{Icon_edit} </div>

        <div className="w-12 text-right text-gray-500">28</div>

        <div class="flex-2 w-2 h-8 mr-8 text-primary">{Icon_delete} </div>

        <button
          class="action-btn mx-4 px-4 py-2 h-10 rounded-xl bg-red-500/50 button-2"
          data-provider-id={props.provider.id}
          data-action="delete"
          title="Delete Provider"
          onClick={() => {
            console.log("Button clicked", props.provider.id);
            window.deleteProvider(props.provider.id);
          }}
        >
          {Icon_delete}
        </button>

      </div>
    </div >
  )
}


const ProvidersPage: FC<{ providers: Provider[] }> = (props: { providers: Provider[] }) => {
  const providerCount = props.providers.length;

  return (
    <div class="p-6">
      <h1 class="text-3xl font-bold color-accent">Providers: {providerCount} </h1>

      <div class="">
        <div class="">
          {props.providers.map((provider) => (
            <ProviderRow provider={provider} />
          ))}


        </div>
      </div>
    </div>
  )
}


const ProvidersPageTest: FC<{ providers: Provider[] }> = (props: { providers: Provider[] }) => {
  const providerCount = props.providers.length;

  const scripts = [
    '<script src="/static/theme.js" defer></script>',
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<script src="/static/providers-client.js" defer></script>'
  ];

  return (
    <MainLayout
      scripts={scripts.join('\n')}
    >
      <div className="bg-grey-200 color-accent">Total Providers: {providerCount}</div>
      <div>
        {props.providers.map((provider) => (
          <ProviderRow provider={provider} />
        ))}
      </div>

      <div>--------------------------------------------</div>
      <ProvidersPage providers={props.providers} />
      <div class="w-2 h-5 mr-8 text-primary">${Icon_edit}</div>
    </MainLayout >
  )
}

// Create the providers page
export default providersApp;

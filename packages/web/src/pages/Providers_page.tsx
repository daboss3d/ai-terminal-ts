import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { jsx, Fragment } from 'hono/jsx';
import { html, raw } from 'hono/html';

import type { FC } from "hono/jsx";

import type { Provider } from '@lib/providers.js';
import { MainLayout } from '../layouts/MainLayout.js';

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

providersApp.get('/', (c) => {
  const messages = ['Good Morning', 'Good Evening', 'Good Night']
  return c.html(<Top messages={messages} />)
})



// Providers page route
providersApp.get('/test', async (c) => {
  const providers = await getProviders();

  return c.html(<ProvidersPageTest providers={providers} />)
})


const ProviderRow: FC<{ provider: Provider }> = (props: { provider: Provider }) => {

  return (
    <div class="text-sm font-medium text-gray-900 dark:text-white" provider-id={props.provider.id}>
      <div>{props.provider.name}</div>
      <div class="text-xs font-normal text-gray-500 dark:text-gray-400">{props.provider.name}</div>
      <div class="background-grey-500 mt-2 flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700">
        <svg class="h-16 w-16 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" aria-hidden="true" preserveAspectRatio="xMidYMid meet"
          path d="MM19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.874-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 01M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.874-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z18 0z">
        </svg>


      </div>

    </div>
  )
}


const ProvidersPage: FC<{ providers: Provider[] }> = (props: { providers: Provider[] }) => {
  const providerCount = props.providers.length;

  return (
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6 gap-4">
          <h1 class="text-3xl font-bold text-accent-theme">Providers {providerCount} </h1>
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

  return (
    <MainLayout
      scripts={<script src="https://cdn.tailwindcss.com"></script> as string}
    >
      {props.providers.map((provider) => (
        <ProviderRow provider={provider} />
      ))}

      <div>--------------------------------------------</div>
      <ProvidersPage providers={props.providers} />
    </MainLayout>
  )
}

// Create the providers page
export default providersApp;

import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';

import type { JSX, Fragment } from 'hono/jsx';

import type { Provider } from '@lib/providers.js';
import { MainLayout } from '../layouts/MainLayout.js';
import { Icon_edit, Icon_delete } from "../components/Icons.ts";
import { Modal } from '../components/Modal.tsx';

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

// Routes -----------------------------------------------
//
providersApp.get('/', jsxRenderer(), async (c) => {
  const providers = await getProviders();
  return c.render(
    <MainLayout title="Providers Management" description="Manage your providers"
    >
      <script src="/static/theme.js" defer></script>
      <script src="/static/providers-client.js" defer></script>
      <script src="/static/modal.js" defer></script>

      <Modal />
      <ProvidersPage providers={providers} />

    </MainLayout>
  );
});

// Helpers -----------------------------------------------
//

const ProviderRow = (props: { provider: Provider }) => {
  return (
    <div class="flex item-name  mt-1 items-center gap-4 p-2 hover:bg-gray-100 rounded cursor-pointer">
      <div class="min-w-[200px] font-medium">{props.provider.name}</div>
      <div class="flex-1">{props.provider.name}</div>
      <div class="flex-1">{props.provider.baseUrl}</div>
      <div class="w-12 text-right text-gray-500">28</div>

      <button class="action-btn w-8" data-action="delete" data-provider-id={props.provider.id}>
        {Icon_delete}
      </button>

      <button class="action-btn w-8" data-action="edit" data-provider-id={props.provider.id}>
        {Icon_edit}
      </button>
    </div>
  );
};

const ProvidersPage = (props: { providers: Provider[] }) => {
  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold color-accent">
        Providers: {props.providers.length}
      </h1>

      {props.providers.map((p) => (
        <ProviderRow provider={p} />
      ))}
    </div>
  );
};


/*
const ProviderRow: FC<{ provider: Provider }> = (props: { provider: Provider }) => {

  return (
    <div>
      <div className="flex mt-1 items-center gap-4 p-2 item-name hover:bg-gray-100 rounded cursor-pointer">
        <div className="min-w-[200px] font-medium">{props.provider.name}</div>
        <div className="flex-1">{props.provider.name}</div>
        <div className="flex-1">{props.provider.baseUrl}</div>

        <div className="w-12 text-right text-gray-500">28</div>
        <div class="flex-2 w-2 h-8 mr-8 text-primary">{Icon_edit} </div>

        <button
          class="action-btn flex-2 items-center mr-8 w-2 h-8"
          data-provider-id={props.provider.id}
          data-action="delete"
          title="Delete Provider"
        >
          {Icon_delete}
        </button>

        <button
          class="action-btn flex-2 items-center mr-8 w-2 h-8"
          data-provider-id={props.provider.id}
          data-action="edit"
          title="Edit Provider"
          onClick={() => {
            window.deleteProvider(props.provider.id);
          }}
        >
          {Icon_edit}
        </button>

      </div>
    </div >
  )
}
*/



/*
const ProvidersPageTest: FC<{ providers: Provider[] }> = (props: { providers: Provider[] }) => {
  const providerCount = props.providers.length;

  //  const scripts = [
  //    '<script src="/static/theme.js" defer></script>',
  //    '<script src="https://cdn.tailwindcss.com"></script>',
  //    '<script src="/static/providers-client.js" defer></script>',
  //    '<script src="/static/modal.js" defer></script>',
  //  ];
  //
  return (
    <MainLayout title="Providers Management" description="Manage your providers"
    >
      <link href="/static/styles.css" rel="stylesheet" />
      <Modal />
      <div className="bg-grey-200 color-accent">Total Providers: {providerCount}</div>
      <div>
        {props.providers.map((provider) => (
          <ProviderRow provider={provider} />
        ))}
      </div>

      <div>--------------------------------------------</div>
      <ProvidersPage providers={props.providers} />
      <div class="w-2 h-5 mr-8 text-primary">${Icon_edit}</div>

      <script src="/static/theme.js" defer></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="/static/providers-client.js" defer></script>
      <script src="/static/modal.js" defer></script>


    </MainLayout >
  )
}
*/
// Create the providers page
export default providersApp;

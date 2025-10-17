import { Hono } from 'hono'
import { z } from 'zod'
import {
  createProvider,
  updateProvider,
  deleteProvider,
  getProviderById,
  getAllProviders,
  setProviderEnabled,
  ProviderSchema,
  initializeProvidersConfig,
  type Provider
} from '../../../lib/providers'

const app = new Hono()

// Initialize providers config on startup
initializeProvidersConfig();

// GET endpoint to return all providers
app.get('/', async (c) => {
  try {
    const providers = await getAllProviders();

    console.log('Retrieved providers:', providers.length);

    return c.json(providers)
  } catch (error) {
    console.error('Error reading providers:', error)
    return c.json({ error: 'Failed to read providers configuration' }, 500)
  }
})

// GET endpoint to return a specific provider by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const provider = await getProviderById(id);

    if (!provider) {
      return c.json({ error: `Provider with ID ${id} not found` }, 404);
    }

    return c.json(provider);
  } catch (error) {
    console.error('Error retrieving provider:', error);
    return c.json({ error: 'Failed to retrieve provider' }, 500);
  }
})

// POST endpoint to add a new provider
app.post('/', async (c) => {
  try {
    const body = await c.req.json()

    // Validate the input using the shared Zod schema
    const validatedProvider = ProviderSchema.parse(body);

    // Use the new createProvider function which handles validation, duplicate checking, and file writing
    const createdProvider = await createProvider(validatedProvider);

    return c.json({ message: 'Provider added successfully', provider: createdProvider }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return c.json({ error: 'Validation failed', details: error.errors.map(e => e.message) }, 400);
    } else if (error instanceof Error && error.message.includes('already exists')) {
      console.error('Duplicate provider error:', error.message);
      return c.json({ error: error.message }, 409);
    } else {
      console.error('Error adding provider:', error);
      return c.json({ error: 'Failed to add provider' }, 500);
    }
  }
})

// PUT endpoint to update an existing provider
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    // Validate that the ID in the URL matches the expected format
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return c.json({ error: 'Invalid provider ID format' }, 400);
    }

    // Use the new updateProvider function which handles validation and file writing
    const updatedProvider = await updateProvider(id, body);

    if (!updatedProvider) {
      return c.json({ error: `Provider with ID ${id} not found` }, 404);
    }

    return c.json({ message: 'Provider updated successfully', provider: updatedProvider });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return c.json({ error: 'Validation failed', details: error.errors.map(e => e.message) }, 400);
    } else {
      console.error('Error updating provider:', error);
      return c.json({ error: 'Failed to update provider' }, 500);
    }
  }
})

// DELETE endpoint to remove a provider
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Validate that the ID in the URL matches the expected format
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return c.json({ error: 'Invalid provider ID format' }, 400);
    }

    // Use the new deleteProvider function which handles file writing
    const deleted = await deleteProvider(id);

    if (!deleted) {
      return c.json({ error: `Provider with ID ${id} not found` }, 404);
    }

    return c.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return c.json({ error: 'Failed to delete provider' }, 500);
  }
})

// PUT endpoint to enable/disable a provider
app.put('/:id/toggle', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return c.json({ error: 'Enabled field must be a boolean' }, 400);
    }

    // Use the setProviderEnabled function
    const updatedProvider = await setProviderEnabled(id, enabled);

    if (!updatedProvider) {
      return c.json({ error: `Provider with ID ${id} not found` }, 404);
    }

    return c.json({ message: `Provider ${enabled ? 'enabled' : 'disabled'} successfully`, provider: updatedProvider });
  } catch (error) {
    console.error('Error toggling provider:', error);
    return c.json({ error: 'Failed to toggle provider' }, 500);
  }
})

export default app

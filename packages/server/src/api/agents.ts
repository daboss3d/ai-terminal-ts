import { Hono } from 'hono'
import { z } from 'zod'
import {
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentById,
  getAllAgents,
  verifyAgent,
  AgentConfigSchema,
  initializeAgentsConfig,
  type AgentConfig
} from '../../../lib/agents'

const app = new Hono()

// Initialize agents config on startup
initializeAgentsConfig();

// GET endpoint to return all agents
app.get('/', async (c) => {
  try {
    const agents = await getAllAgents();

    console.log('Retrieved agents:', agents);

    return c.json(agents)
  } catch (error) {
    console.error('Error reading agents:', error)
    return c.json({ error: 'Failed to read agents configuration' }, 500)
  }
})

// POST endpoint to add a new agent
app.post('/', async (c) => {
  try {
    const body = await c.req.json()

    // Validate the input using the shared Zod schema
    const validatedAgent = AgentConfigSchema.parse(body);

    // Use the new createAgent function which handles validation, duplicate checking, and file writing
    const createdAgent = await createAgent(validatedAgent);

    return c.json({ message: 'Agent added successfully', agent: createdAgent }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return c.json({ error: 'Validation failed', details: error.errors.map(e => e.message) }, 400);
    } else if (error instanceof Error && error.message.includes('already exists')) {
      console.error('Duplicate agent error:', error.message);
      return c.json({ error: error.message }, 409);
    } else {
      console.error('Error adding agent:', error);
      return c.json({ error: 'Failed to add agent' }, 500);
    }
  }
})

// GET endpoint to return a specific agent by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const agent = await getAgentById(id);

    if (!agent) {
      return c.json({ error: `Agent with ID ${id} not found` }, 404);
    }

    return c.json(agent);
  } catch (error) {
    console.error('Error retrieving agent:', error);
    return c.json({ error: 'Failed to retrieve agent' }, 500);
  }
})

// PUT endpoint to update an existing agent
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    // Validate that the ID in the URL matches the expected format
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return c.json({ error: 'Invalid agent ID format' }, 400);
    }

    // Use the new updateAgent function which handles validation and file writing
    const updatedAgent = await updateAgent(id, body);

    if (!updatedAgent) {
      return c.json({ error: `Agent with ID ${id} not found` }, 404);
    }

    return c.json({ message: 'Agent updated successfully', agent: updatedAgent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return c.json({ error: 'Validation failed', details: error.errors.map(e => e.message) }, 400);
    } else {
      console.error('Error updating agent:', error);
      return c.json({ error: 'Failed to update agent' }, 500);
    }
  }
})

// DELETE endpoint to remove an agent
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Validate that the ID in the URL matches the expected format
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return c.json({ error: 'Invalid agent ID format' }, 400);
    }

    // Use the new deleteAgent function which handles file writing
    const deleted = await deleteAgent(id);

    if (!deleted) {
      return c.json({ error: `Agent with ID ${id} not found` }, 404);
    }

    return c.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return c.json({ error: 'Failed to delete agent' }, 500);
  }
})

export default app

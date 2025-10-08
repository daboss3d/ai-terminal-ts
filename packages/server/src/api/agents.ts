import { Hono } from 'hono'
import { promises as fs } from 'fs'

// Define the Agent interface
interface Agent {
  id: string;
  name: string;
  description?: string;
  config?: Record<string, any>;
}

const app = new Hono()

// Manual validation function
function validateAgent(agent: any): string[] {
  const errors: string[] = []
  
  if (!agent.id || typeof agent.id !== 'string' || agent.id.trim() === '') {
    errors.push('ID is required and must be a non-empty string')
  }
  
  if (!agent.name || typeof agent.name !== 'string' || agent.name.trim() === '') {
    errors.push('Name is required and must be a non-empty string')
  }
  
  if (agent.description && typeof agent.description !== 'string') {
    errors.push('Description must be a string if provided')
  }
  
  if (agent.config && typeof agent.config !== 'object') {
    errors.push('Config must be an object if provided')
  }
  
  return errors
}

app.get('/', async (c) => {
  try {
    const agents = await fs.readFile('data/config/agents.json', 'utf-8')
    return c.json(JSON.parse(agents))
  } catch (error) {
    console.error('Error reading agents file:', error)
    return c.json({ error: 'Failed to read agents configuration' }, 500)
  }
})

app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    
    // Validate the input
    const validationErrors = validateAgent(body)
    if (validationErrors.length > 0) {
      return c.json({ error: 'Validation failed', details: validationErrors }, 400)
    }
    
    // Read existing agents
    let existingAgents: any[] = []
    try {
      const agentsData = await fs.readFile('data/config/agents.json', 'utf-8')
      existingAgents = JSON.parse(agentsData)
    } catch (error) {
      // If file doesn't exist, start with empty array
      existingAgents = []
    }
    
    // Check if agent with same ID already exists
    const existingAgent = existingAgents.find((agent: any) => agent.id === body.id)
    if (existingAgent) {
      return c.json({ error: `Agent with ID ${body.id} already exists` }, 409)
    }
    
    // Add the new agent
    existingAgents.push(body)
    
    // Write back to file
    await fs.writeFile('data/config/agents.json', JSON.stringify(existingAgents, null, 2))
    
    return c.json({ message: 'Agent added successfully', agent: body }, 201)
  } catch (error) {
    console.error('Error adding agent:', error)
    return c.json({ error: 'Failed to add agent' }, 500)
  }
})

export default app

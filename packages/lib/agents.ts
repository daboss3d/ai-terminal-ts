/**
 * AI Agents Management Module
 * 
 * This module contains the configuration for AI agents that can be used in the AI Terminal.
 * Each agent is defined by a set of properties that determine its behavior and capabilities.
 */

import { promises as fs } from 'fs';

import { z } from 'zod'

/**
 * Interface defining the structure of an AI agent configuration
 */
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  provider: string;
  system_prompt: string;
  tools: string[];
  use_tools: boolean;
  use_memory: boolean;
}

/**
 * Zod schema for validating AgentConfig
 */
export const AgentConfigSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  name: z.string().min(1, "Agent name is required"),
  description: z.string(),
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(-2).max(2),
  presence_penalty: z.number().min(-2).max(2),
  max_tokens: z.number().min(1),
  provider: z.string().min(1, "Provider is required"),
  system_prompt: z.string(),
  tools: z.array(z.string()),
  use_tools: z.boolean(),
  use_memory: z.boolean(),
});

/**
 * Example agent configuration based on the documentation
 */
export const exampleAgent: AgentConfig = {
  id: "example-agent",
  name: "Example Agent",
  description: "An example agent for testing purposes.",
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_tokens: 1000,
  provider: "openai",
  system_prompt: "You are an example agent.",
  tools: [],
  use_tools: false,
  use_memory: false
};

/**
 * Array of all available agents
 */
export const agents: AgentConfig[] = [
  exampleAgent
];

/**
 * Read agents from the data file
 * @returns Promise resolving to an array of AgentConfig
 */
export const readAgentsFromFile = async (): Promise<AgentConfig[]> => {
  try {
    const agentsData = await fs.readFile('data/agents.json', 'utf-8');
    return JSON.parse(agentsData);
  } catch (error) {
    console.error('Error reading agents file:', error);
    // Return an empty array if file doesn't exist or is invalid
    return [];
  }
};

/**
 * Write agents to the data file
 * @param agents Array of AgentConfig to write to file
 * @returns Promise that resolves when the file is written
 */
export const writeAgentsToFile = async (agents: AgentConfig[]): Promise<void> => {
  try {
    await fs.writeFile('data/agents.json', JSON.stringify(agents, null, 2));
  } catch (error) {
    console.error('Error writing agents file:', error);
    throw error;
  }
};

/**
 * Initialize agents config file if it doesn't exist
 * @returns Promise that resolves when initialization is complete
 */
export const initializeAgentsConfig = async (): Promise<void> => {
  try {
    await fs.access('data/agents.json');
  } catch (error) {
    // File doesn't exist, create it with a default agent
    const defaultAgent: AgentConfig = {
      id: 'default-agent',
      name: 'Default Agent',
      description: 'This is a default agent',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 1000,
      provider: 'openai',
      system_prompt: 'You are a helpful assistant.',
      tools: [],
      use_tools: false,
      use_memory: false
    };

    await writeAgentsToFile([defaultAgent]);
  }
};

/**
 * Create a new agent
 * @param agent The agent configuration to create
 * @returns Promise resolving to the created agent
 */
export const createAgent = async (agent: AgentConfig): Promise<AgentConfig> => {
  // Validate the agent configuration
  const validatedAgent = AgentConfigSchema.parse(agent);

  // Check if agent with this ID already exists
  const existingAgents = await readAgentsFromFile();
  if (existingAgents.some(a => a.id === validatedAgent.id)) {
    throw new Error(`Agent with ID ${validatedAgent.id} already exists`);
  }

  // Add the new agent to the list
  const updatedAgents = [...existingAgents, validatedAgent];

  // Write the updated list back to the file
  await writeAgentsToFile(updatedAgents);

  return validatedAgent;
};

/**
 * Update an existing agent
 * @param id The ID of the agent to update
 * @param updates Partial agent configuration with updates
 * @returns Promise resolving to the updated agent or undefined if not found
 */
export const updateAgent = async (id: string, updates: Partial<AgentConfig>): Promise<AgentConfig | undefined> => {
  // Validate the updates against the schema if any updates are provided
  if (Object.keys(updates).length > 0) {
    // Create a temporary object with the current values merged with updates for validation
    const existingAgents = await readAgentsFromFile();
    const agent = existingAgents.find(a => a.id === id);

    if (!agent) {
      return undefined;
    }

    const updatedAgent = { ...agent, ...updates };
    AgentConfigSchema.parse(updatedAgent);
  }

  // Find and update the agent
  const existingAgents = await readAgentsFromFile();
  const agentIndex = existingAgents.findIndex(a => a.id === id);

  if (agentIndex === -1) {
    return undefined;
  }

  const updatedAgents = [...existingAgents];
  updatedAgents[agentIndex] = { ...updatedAgents[agentIndex], ...updates };

  // Write the updated list back to the file
  await writeAgentsToFile(updatedAgents);

  return updatedAgents[agentIndex];
};

/**
 * Delete an agent by ID
 * @param id The ID of the agent to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export const deleteAgent = async (id: string): Promise<boolean> => {
  const existingAgents = await readAgentsFromFile();
  const filteredAgents = existingAgents.filter(agent => agent.id !== id);

  // If the length is the same, no agent was removed
  if (filteredAgents.length === existingAgents.length) {
    return false;
  }

  // Write the updated list back to the file
  await writeAgentsToFile(filteredAgents);

  return true;
};

/**
 * Verify if an agent exists by ID
 * @param id The ID of the agent to verify
 * @returns Promise resolving to true if the agent exists, false otherwise
 */
export const verifyAgent = async (id: string): Promise<boolean> => {
  const agent = await getAgentById(id);
  return agent !== undefined;
};

/**
 * Function to get an agent by its ID (updated to read from file)
 * @param id The unique identifier of the agent
 * @returns Promise resolving to the agent configuration or undefined if not found
 */
export const getAgentById = async (id: string): Promise<AgentConfig | undefined> => {
  const agents = await readAgentsFromFile();
  return agents.find(agent => agent.id === id);
};

/**
 * Function to get all agents (updated to read from file)
 * @returns Promise resolving to an array of all agent configurations
 */
export const getAllAgents = async (): Promise<AgentConfig[]> => {
  return await readAgentsFromFile();
};

/**
 * Function to validate an agent configuration
 * @param agent The agent configuration to validate
 * @returns True if valid, throws error if invalid
 */
export const validateAgent = (agent: unknown): agent is AgentConfig => {
  try {
    AgentConfigSchema.parse(agent);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Agent validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

/**
 * Function to check if an agent ID is valid
 * @param id The agent ID to validate
 * @returns True if valid, false otherwise
 */
export const isValidAgentId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(id);
};





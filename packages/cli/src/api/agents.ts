import fs from "fs";
import path from "path";

// Define the Agent interface
export interface Agent {
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

// Get the path to the agents config file
const agentsConfigPath = path.join(process.cwd(), "data", "agents.json");

// Ensure the data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Initialize agents config file if it doesn't exist
function initializeAgentsConfig() {
  ensureDataDirectory();
  
  if (!fs.existsSync(agentsConfigPath)) {
    const defaultAgents: Agent[] = [];
    fs.writeFileSync(agentsConfigPath, JSON.stringify(defaultAgents, null, 2));
  }
}

// Get all agents
export function getAgents(): Agent[] {
  initializeAgentsConfig();
  
  try {
    const data = fs.readFileSync(agentsConfigPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading agents config:", error);
    return [];
  }
}

// Get a specific agent by ID
export function getAgentById(id: string): Agent | undefined {
  const agents = getAgents();
  return agents.find(agent => agent.id === id);
}

// Add a new agent
export function addAgent(agent: Omit<Agent, "id"> & { id?: string }): Agent {
  const agents = getAgents();
  
  // Generate ID if not provided
  const id = agent.id || agent.name.toLowerCase().replace(/\s+/g, "-");
  
  // Check if agent with this ID already exists
  if (agents.some(a => a.id === id)) {
    throw new Error(`Agent with ID "${id}" already exists`);
  }
  
  const newAgent: Agent = {
    id,
    ...agent
  };
  
  agents.push(newAgent);
  saveAgents(agents);
  return newAgent;
}

// Update an existing agent
export function updateAgent(id: string, updates: Partial<Agent>): Agent | null {
  const agents = getAgents();
  const index = agents.findIndex(agent => agent.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Merge updates with existing agent
  agents[index] = { ...agents[index], ...updates };
  saveAgents(agents);
  return agents[index];
}

// Delete an agent
export function deleteAgent(id: string): boolean {
  const agents = getAgents();
  const initialLength = agents.length;
  
  const filteredAgents = agents.filter(agent => agent.id !== id);
  saveAgents(filteredAgents);
  
  return filteredAgents.length < initialLength;
}

// Save agents to file
function saveAgents(agents: Agent[]): void {
  ensureDataDirectory();
  fs.writeFileSync(agentsConfigPath, JSON.stringify(agents, null, 2));
}

// Initialize the config on module load
initializeAgentsConfig();
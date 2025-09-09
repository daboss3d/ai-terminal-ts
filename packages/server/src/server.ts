import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  getAgents,
  getAgentById,
  addAgent,
  updateAgent,
  deleteAgent,
} from "./api/agents";

const app = new Hono();

// Add CORS middleware
app.use("*", cors());

// GET /api/agents - Get all agents
app.get("/api/agents", (c) => {
  try {
    const agents = getAgents();
    return c.json(agents);
  } catch (error) {
    return c.json({ error: "Failed to fetch agents" }, 500);
  }
});

// GET /api/agents/:id - Get a specific agent
app.get("/api/agents/:id", (c) => {
  try {
    const agent = getAgentById(c.req.param("id"));
    if (!agent) {
      return c.json({ error: "Agent not found" }, 404);
    }
    return c.json(agent);
  } catch (error) {
    return c.json({ error: "Failed to fetch agent" }, 500);
  }
});

// POST /api/agents - Create a new agent
app.post("/api/agents", async (c) => {
  try {
    const agentData = await c.req.json();
    const newAgent = addAgent(agentData);
    return c.json(newAgent, 201);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// PUT /api/agents/:id - Update an existing agent
app.put("/api/agents/:id", async (c) => {
  try {
    const updates = await c.req.json();
    const updatedAgent = updateAgent(c.req.param("id"), updates);
    if (!updatedAgent) {
      return c.json({ error: "Agent not found" }, 404);
    }
    return c.json(updatedAgent);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// DELETE /api/agents/:id - Delete an agent
app.delete("/api/agents/:id", (c) => {
  try {
    const deleted = deleteAgent(c.req.param("id"));
    if (!deleted) {
      return c.json({ error: "Agent not found" }, 404);
    }
    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Failed to delete agent" }, 500);
  }
});

// send message to server /prompts
async function sendMessageToServer(
  message: string,
  stream: boolean = true
): Promise<string> {
  // This is a mock implementation - you would replace this with your actual AI service
  const response = `Mock response for: ${message}`;

  if (stream) {
    return response;
  } else {
    return JSON.stringify({ response });
  }
}

export { sendMessageToServer, app };

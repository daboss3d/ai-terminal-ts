import express from "express";
import { getAgents, getAgentById, addAgent, updateAgent, deleteAgent } from "./agents";

const router = express.Router();

// GET /api/agents - Get all agents
router.get("/", (req, res) => {
  try {
    const agents = getAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

// GET /api/agents/:id - Get a specific agent
router.get("/:id", (req, res) => {
  try {
    const agent = getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent" });
  }
});

// POST /api/agents - Create a new agent
router.post("/", (req, res) => {
  try {
    const agentData = req.body;
    const newAgent = addAgent(agentData);
    res.status(201).json(newAgent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/agents/:id - Update an existing agent
router.put("/:id", (req, res) => {
  try {
    const updatedAgent = updateAgent(req.params.id, req.body);
    if (!updatedAgent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json(updatedAgent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/agents/:id - Delete an agent
router.delete("/:id", (req, res) => {
  try {
    const deleted = deleteAgent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete agent" });
  }
});

export default router;
import React, { useState, useEffect } from "react";
import { Box, Text, Button, TextInput, Select, useApp } from "ink";
import chalk from "chalk";

interface Agent {
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

const AgentsPage = () => {
  const { exit } = useApp();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<Partial<Agent>>({
    name: "",
    description: "",
    model: "",
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1000,
    provider: "",
    system_prompt: "",
    tools: [],
    use_tools: false,
    use_memory: false
  });

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/agents");
        if (!response.ok) throw new Error("Failed to fetch agents");
        const data = await response.json();
        setAgents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleAddAgent = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add agent");
      
      const newAgent = await response.json();
      setAgents([...agents, newAgent]);
      setView("list");
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/agents/${selectedAgent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update agent");
      
      const updatedAgent = await response.json();
      setAgents(agents.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      ));
      setView("list");
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/agents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete agent");
      
      setAgents(agents.filter(agent => agent.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      model: "",
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 1000,
      provider: "",
      system_prompt: "",
      tools: [],
      use_tools: false,
      use_memory: false
    });
    setSelectedAgent(null);
  };

  const startAddAgent = () => {
    resetForm();
    setView("add");
  };

  const startEditAgent = (agent: Agent) => {
    setFormData(agent);
    setSelectedAgent(agent);
    setView("edit");
  };

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>Loading agents...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
        <Button onPress={() => setError(null)}>Dismiss</Button>
      </Box>
    );
  }

  if (view === "add" || view === "edit") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          {view === "add" ? "Add New Agent" : "Edit Agent"}
        </Text>
        
        <Box marginTop={1}>
          <Text>Name: </Text>
          <TextInput
            value={formData.name || ""}
            onChange={(value) => setFormData({...formData, name: value})}
          />
        </Box>
        
        <Box marginTop={1}>
          <Text>Description: </Text>
          <TextInput
            value={formData.description || ""}
            onChange={(value) => setFormData({...formData, description: value})}
          />
        </Box>
        
        <Box marginTop={1}>
          <Text>Model: </Text>
          <TextInput
            value={formData.model || ""}
            onChange={(value) => setFormData({...formData, model: value})}
          />
        </Box>
        
        <Box marginTop={1}>
          <Text>Provider: </Text>
          <TextInput
            value={formData.provider || ""}
            onChange={(value) => setFormData({...formData, provider: value})}
          />
        </Box>
        
        <Box marginTop={1}>
          <Text>System Prompt: </Text>
          <TextInput
            value={formData.system_prompt || ""}
            onChange={(value) => setFormData({...formData, system_prompt: value})}
          />
        </Box>
        
        <Box marginTop={1}>
          <Text>Temperature: </Text>
          <TextInput
            value={formData.temperature?.toString() || "0.7"}
            onChange={(value) => setFormData({...formData, temperature: parseFloat(value) || 0.7})}
          />
        </Box>
        
        <Box marginTop={1}>
          <Text>Max Tokens: </Text>
          <TextInput
            value={formData.max_tokens?.toString() || "1000"}
            onChange={(value) => setFormData({...formData, max_tokens: parseInt(value) || 1000})}
          />
        </Box>
        
        <Box marginTop={2}>
          <Button onPress={view === "add" ? handleAddAgent : handleUpdateAgent}>
            {view === "add" ? "Add Agent" : "Update Agent"}
          </Button>
          <Box marginLeft={2}>
            <Button onPress={() => setView("list")}>Cancel</Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color="cyan">AI Agents Management</Text>
      </Box>
      
      <Box marginBottom={1}>
        <Button onPress={startAddAgent}>Add New Agent</Button>
        <Box marginLeft={2}>
          <Button onPress={exit}>Back to Terminal</Button>
        </Box>
      </Box>
      
      {agents.length === 0 ? (
        <Text>No agents configured yet.</Text>
      ) : (
        <Box flexDirection="column">
          {agents.map((agent) => (
            <Box key={agent.id} flexDirection="column" marginBottom={1} paddingX={1} borderStyle="round" borderColor="gray">
              <Box justifyContent="space-between">
                <Text bold color="yellow">{agent.name}</Text>
                <Box>
                  <Button onPress={() => startEditAgent(agent)}>Edit</Button>
                  <Box marginLeft={1}>
                    <Button onPress={() => handleDeleteAgent(agent.id)}>Delete</Button>
                  </Box>
                </Box>
              </Box>
              <Text color="gray">{agent.description}</Text>
              <Text color="cyan">Model: {agent.model} | Provider: {agent.provider}</Text>
              <Text color="green">Temperature: {agent.temperature} | Max Tokens: {agent.max_tokens}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AgentsPage;
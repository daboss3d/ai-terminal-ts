Agents configuration file in JSON format in data/agents.json

# AI Agents Management File

This file contains the configuration for AI agents that can be used in the AI Terminal. Each agent is defined by a set of properties that determine its behavior and capabilities.

## Agent Properties

Each agent is defined by the following properties:

- `id`: A unique identifier for the agent.
- `name`: The name of the agent.
- `description`: A brief description of the agent.
- `model`: The AI model to be used by the agent.
- `temperature`: The temperature to be used by the agent.
- `top_p`: The top_p value to be used by the agent.
- `frequency_penalty`: The frequency penalty to be used by the agent.
- `presence_penalty`: The presence penalty to be used by the agent.
- `max_tokens`: The maximum number of tokens to be used by the agent.
- `provider`: The provider to be used by the agent.
- `system_prompt`: The system prompt to be used by the agent.
- `tools`: The tools to be used by the agent.
- `use_tools`: A boolean indicating whether the agent should use tools.
- `use_memory`: A boolean indicating whether the agent should use memory.

## Example Agent Configuration

```json
{
  "id": "example-agent",
  "name": "Example Agent",
  "description": "An example agent for testing purposes.",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "max_tokens": 1000,
  "provider": "openai",
  "system_prompt": "You are an example agent.",
  "tools": [],
  "use_tools": false,
  "use_memory": false
}
```

## Adding New Agents

Using Server server/api/agents.ts

Create a POST endpoint that accepts a new agent configuration in the request body. Validate the input and append it to the agents.json file.

Create a GET endpoint that returns the list of all agents.

Create a Page that allows user to Add, Edit, Delete agents.

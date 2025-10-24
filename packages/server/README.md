# @ai-terminal-ts/server

Backend server for the AI Terminal project.

## Scripts

- `bun run dev` - Start the development server on port 3002

## API Endpoints

- `GET /` - Health check endpoint
- `GET /api/providers` - Get available AI providers
- `GET /api/agents` - Get available agents
- `POST /api/chat` - Chat endpoint for AI interactions
- `GET /prompts` - Get available prompts
- `GET /prompts/stats` - Get prompt statistics

## Chat API Endpoint

The `/api/chat` endpoint accepts POST requests with the following JSON payload:

```json
{
  "message": "Your message here",
  "agentId": "optional-agent-id",
  "history": [
    {
      "role": "user|assistant",
      "content": "Message content"
    }
  ]
}
```

The response includes:
- `response`: The AI's response
- `agentId`: The agent that processed the request
- `timestamp`: When the response was generated
- `history`: Updated conversation history

## Architecture

This package contains:
- A Hono-based REST API
- Socket.IO for real-time communication
- Integration with various AI providers
- Agent management system
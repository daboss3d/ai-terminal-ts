import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Define the request schema
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  agentId: z.string().optional().default('default-agent'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([])
});

type ChatRequest = z.infer<typeof chatRequestSchema>;

const chat = new Hono();

// Mock AI service function (to be replaced with real AI integration)
async function getAIResponse(message: string, agentId?: string): Promise<string> {
  // This is a mock implementation - in a real app, this would call an AI service
  const mockResponses: Record<string, string> = {
    'hello': 'Hello there! How can I assist you today?',
    'how are you': 'I\'m just a program, but I\'m functioning well! How can I help you?',
    'what is your name': 'I\'m an AI assistant in the AI Terminal project.',
    'default': `I received your message: "${message}". This is a mock response from agent ${agentId || 'default-agent'}.`
  };

  const lowerMsg = message.toLowerCase();
  if (mockResponses[lowerMsg]) {
    return mockResponses[lowerMsg];
  } else {
    return mockResponses['default'];
  }
}

chat.post('/', zValidator('json', chatRequestSchema), async (c) => {
  try {
    const { message, agentId, history } = await c.req.json() as ChatRequest;
    
    // Get response from AI service
    const response = await getAIResponse(message, agentId);
    
    return c.json({ 
      response,
      agentId: agentId || 'default-agent',
      timestamp: new Date().toISOString(),
      history: [...(history || []), { role: 'user', content: message }, { role: 'assistant', content: response }]
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request format', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to process chat request' }, 500);
  }
});

export default chat;
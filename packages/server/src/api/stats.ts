import { Hono } from "hono";

// Define the type for prompt statistics
export interface PromptStats {
  prompt: string;
  count: number;
  lastUsed: Date;
  avgResponseTime?: number;
  totalTokens?: number;
}

// In-memory storage for prompt statistics
let promptStats: Map<string, PromptStats> = new Map();

// Function to track prompt usage
export function trackPromptUsage(prompt: string, responseTime?: number, tokens?: number) {
  const existingStat = promptStats.get(prompt);
  const now = new Date();
  
  if (existingStat) {
    promptStats.set(prompt, {
      prompt,
      count: existingStat.count + 1,
      lastUsed: now,
      avgResponseTime: responseTime !== undefined 
        ? (existingStat.avgResponseTime 
            ? (existingStat.avgResponseTime + responseTime) / 2 
            : responseTime)
        : existingStat.avgResponseTime,
      totalTokens: tokens !== undefined 
        ? (existingStat.totalTokens || 0) + tokens
        : existingStat.totalTokens
    });
  } else {
    promptStats.set(prompt, {
      prompt,
      count: 1,
      lastUsed: now,
      avgResponseTime: responseTime,
      totalTokens: tokens
    });
  }
}

// Function to get all prompt statistics
export function getAllPromptStats(): PromptStats[] {
  return Array.from(promptStats.values())
    .sort((a, b) => b.count - a.count); // Sort by count in descending order
}

const app = new Hono();

// Endpoint to get all prompt statistics
app.get("/", async (c) => {
  try {
    const stats = getAllPromptStats();
    return c.json(stats);
  } catch (error) {
    const errorString = error instanceof Error ? error.message : String(error);
    console.error("Error getting prompt stats:", error);
    return c.json({ error: errorString }, 500);
  }
});

export default app;
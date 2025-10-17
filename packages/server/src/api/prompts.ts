import { Hono } from "hono";
import { stream, streamText } from "hono/streaming";
import { promises as fs } from "fs";
import path from "path";

import { getProviders } from "@lib/providers";
import { trackPromptUsage } from "./stats";

const app = new Hono();

app.post("/", async (c) => {
  const { prompt, stream: streamOption,
    provider, agent } = await c.req.json();

  console.log("Stream:", streamOption, "provider:", provider, "agent", agent);

  // Log the prompt
  console.log("Received prompt:", prompt);

  // Track the prompt usage
  const startTime = Date.now();

  const providers = getProviders();

  // Find the active provider
  const activeProvider = providers.find((p) => p.enabled);

  if (!activeProvider) {
    console.error("No active provider found.");
    return c.json({ error: "No active provider found" }, 500);
  }

  // Send the prompt to the active provider
  const { baseUrl, model, apiKey } = activeProvider;
  const url = new URL(baseUrl as string);
  // check if url.pathname ends with /
  if (url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  url.pathname = path.join(url.pathname, "/v1/chat/completions");

  console.log(`Sending prompt to ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error from provider: ${errorText}`);
    // Track the failed request as well
    trackPromptUsage(prompt, Date.now() - startTime);
    return c.json({ error: `Error from provider: ${errorText}` }, 500);
  }

  return streamText(c, async (stream) => {
    const reader = response.body?.getReader();
    if (!reader) {
      // Track the failed request
      trackPromptUsage(prompt, Date.now() - startTime);
      return;
    }
    const decoder = new TextDecoder();
    let tokenCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Track the completed request with response time
        trackPromptUsage(prompt, Date.now() - startTime, tokenCount);
        break;
      }
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          const data = line.substring(6);
          if (data.trim() === "[DONE]") {
            break;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices[0].delta.content;
            if (text) {
              tokenCount += text.length; // Simple token count approximation
              await stream.write(text);
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
    // Track the completed request with response time after processing all chunks
    trackPromptUsage(prompt, Date.now() - startTime, tokenCount);
  });
});

export default app;

import { Hono } from "hono";
import { stream, streamText } from "hono/streaming";
import { promises as fs } from "fs";
import path from "path";

const app = new Hono();

app.post("/", async (c) => {
  const { prompt, stream } = await c.req.json();

  console.log("Stream:", stream);

  // Log the prompt
  console.log("Received prompt:", prompt);

  try {
    // Read providers configuration
    const providersPath = path.resolve(
      process.cwd(),
      "data",
      "config",
      "providers.json"
    );
    const providersData = await fs.readFile(providersPath, "utf-8");
    const providers = JSON.parse(providersData);

    // Find the active provider
    const activeProvider = providers.find((p) => p.enabled);

    if (!activeProvider) {
      console.error("No active provider found.");
      return c.json({ error: "No active provider found" }, 500);
    }

    // Send the prompt to the active provider
    const { baseUrl, model, apiKey } = activeProvider;
    const url = new URL(baseUrl);
    url.pathname = path.join(url.pathname, "chat/completions");

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
      return c.json({ error: `Error from provider: ${errorText}` }, 500);
    }

    return streamText(c, async (stream) => {
      const reader = response.body?.getReader();
      if (!reader) {
        return;
      }
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
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
                await stream.write(text);
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error processing prompt:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;

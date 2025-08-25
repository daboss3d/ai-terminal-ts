// Import your actual providers functionality
import { getProviders } from "../../../../src/lib/providers"; // Adjust path as needed
// import { getProviders } from "../../../lib/providers"; // Alternative path

import React from "react";
import { Text, Box } from "ink";

// Define command types
export type Command = {
  name: string;
  message: string;
  handler: (context: CommandContext, args: string[]) => Promise<void>;
};

export type CommandContext = {
  addOutput: (
    content: string,
    type?: "message" | "command" | "error" | "ai"
  ) => void;
  setOutput: React.Dispatch<React.SetStateAction<any[]>>;
  output: any[];
  exit: () => void;
};

// Command handlers
const commandHandlers = {
  quit: async (ctx: CommandContext) => {
    ctx.exit();
  },

  help: async (ctx: CommandContext) => {
    const helpText = `Available commands:
  /quit      - Exit the application
  /help      - Show this help message
  /clear     - Clear the console
  /providers - List available providers`;
    ctx.addOutput(helpText, "command");
  },

  clear: async (ctx: CommandContext) => {
    ctx.setOutput([]);
  },

  providers: async (ctx: CommandContext) => {
    try {
      // Use your actual providers system
      const providers = getProviders();

      if (providers.length === 0) {
        ctx.addOutput("No providers configured", "command");
        return;
      }

      const providersList = providers
        .map((provider) => {
          const status = provider.enabled ? "✓" : "✗";
          const baseUrl = provider.baseUrl ? ` (${provider.baseUrl})` : "";
          return `  ${status} ${provider.name} (${provider.model})${baseUrl}`;
        })
        .join("\n");

      const output = `Available Providers:\n${providersList}`;
      ctx.addOutput(output, "command");
    } catch (error) {
      ctx.addOutput(`Error loading providers: ${error.message}`, "error");
    }
  },
};

// Export the commands with their handlers
export const commands: Command[] = [
  {
    name: "quit",
    message: "/quit - Exit the application",
    handler: commandHandlers.quit,
  },
  {
    name: "help",
    message: "/help - Show this help message",
    handler: commandHandlers.help,
  },
  {
    name: "clear",
    message: "/clear - Clear the console",
    handler: commandHandlers.clear,
  },
  {
    name: "providers",
    message: "/providers - List available providers",
    handler: commandHandlers.providers,
  },
];

// Export command names for easy checking
export const commandNames = commands.map((cmd) => cmd.name);

// Export a function to handle commands
export async function handleCommand(
  commandName: string,
  context: CommandContext,
  args: string[] = []
) {
  const command = commands.find((cmd) => cmd.name === commandName);

  if (command) {
    await command.handler(context, args);
  } else {
    context.addOutput(`Unknown command: /${commandName}`, "error");
  }
}

import React from 'react';
import { Text, Box } from 'ink';
import {
  getProviders,
  updateProvider,
  deleteProvider,
} from '../../../../src/lib/providers';

// Define command types
export type Command = {
  name: string;
  message: string;
  handler: (context: CommandContext, args: string[]) => Promise<void>;
};

export type CommandContext = {
  addOutput: (
    content: string,
    type?: 'message' | 'command' | 'error' | 'ai'
  ) => void;
  setOutput: React.Dispatch<React.SetStateAction<any[]>>;
  output: any[];
  exit: () => void;
  // setPrompting is removed as we are removing enquirer
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
  /providers [list|edit|delete] - Manage providers`;
    ctx.addOutput(helpText, 'command');
  },

  clear: async (ctx: CommandContext) => {
    ctx.setOutput([]);
  },

  providers: async (ctx: CommandContext, args: string[]) => {
    const [subcommand, ...subcommandArgs] = args;

    switch (subcommand) {
      case 'list':
      case undefined:
        try {
          const providers = getProviders();
          if (providers.length === 0) {
            ctx.addOutput('No providers configured', 'command');
            return;
          }
          const providersList = providers
            .map((provider) => {
              const status = provider.enabled ? '✓' : '✗';
              const baseUrl = provider.baseUrl ? ` (${provider.baseUrl})` : '';
              return `  ${status} ${provider.id} - ${provider.name} (${provider.model})${baseUrl}`;
            })
            .join('\n');
          const output = `Available Providers:\n${providersList}`;
          ctx.addOutput(output, 'command');
        } catch (error) {
          ctx.addOutput(`Error loading providers: ${error.message}`, 'error');
        }
        break;

      case 'edit':
        if (subcommandArgs.length < 3 || subcommandArgs.length % 2 !== 1) {
          ctx.addOutput(
            'Usage: /providers edit <id> <field1> <value1> [field2 value2 ...]',
            'error'
          );
          return;
        }
        try {
          const id = subcommandArgs[0];
          const updates: { [key: string]: string | boolean } = {};
          for (let i = 1; i < subcommandArgs.length; i += 2) {
            const field = subcommandArgs[i];
            const value = subcommandArgs[i + 1];
            if (value === undefined) {
              ctx.addOutput(`Error: Missing value for field "${field}"`, 'error');
              return;
            }
            if (field === 'enabled') {
              updates[field] = value === 'true';
            } else {
              updates[field] = value;
            }
          }

          const updatedProvider = updateProvider(id, updates);
          if (updatedProvider) {
            ctx.addOutput(`Provider "${id}" updated successfully.`, 'command');
          } else {
            ctx.addOutput(`Provider with ID "${id}" not found.`, 'error');
          }
        } catch (error) {
          ctx.addOutput(`Error updating provider: ${error.message}`, 'error');
        }
        break;

      case 'delete':
        if (subcommandArgs.length !== 1) {
          ctx.addOutput('Usage: /providers delete <id>', 'error');
          return;
        }
        try {
          const id = subcommandArgs[0];
          const success = deleteProvider(id);
          if (success) {
            ctx.addOutput(
              `Provider "${id}" deleted successfully.`, 
              'command'
            );
          } else {
            ctx.addOutput(
              `Provider with ID "${id}" not found.`, 
              'error'
            );
          }
        } catch (error) {
          ctx.addOutput(
            `Error deleting provider: ${error.message}`, 
            'error'
          );
        }
        break;

      default:
        ctx.addOutput('Usage: /providers [list|edit|delete]', 'command');
        break;
    }
  },
};

// Export the commands with their handlers
export const commands: Command[] = [
  {
    name: 'quit',
    message: '/quit - Exit the application',
    handler: commandHandlers.quit,
  },
  {
    name: 'help',
    message: '/help - Show this help message',
    handler: commandHandlers.help,
  },
  {
    name: 'clear',
    message: '/clear - Clear the console',
    handler: commandHandlers.clear,
  },
  {
    name: 'providers',
    message: '/providers [list|edit|delete] - Manage providers',
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
    const filteredArgs = args.filter((arg) => arg !== '');
    await command.handler(context, filteredArgs);
  } else {
    context.addOutput(`Unknown command: /${commandName}`, 'error');
  }
}

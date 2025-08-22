import { intro, outro } from "@clack/prompts";
import enquirer from "enquirer";
import chalk from "chalk";
import boxen from "boxen";
import readline from "readline";

import { sendMessageToServer } from "./server.ts";

// Mock providers function for now
async function listProviders() {
  console.log(
    boxen(chalk.cyan("Providers functionality would be implemented here"), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "cyan",
      backgroundColor: "#000",
    })
  );
}

const commands = [
  { name: "quit", message: "/quit - Exit the application" },
  { name: "help", message: "/help - Show this help message" },
  { name: "clear", message: "/clear - Clear the console" },
  { name: "providers", message: "/providers - List available providers" },
];

const commandNames = ["quit", "help", "clear", "providers"];

const help = `Available commands:
  /quit      - Exit the application.
  /help      - Show this help message.
  /clear     - Clear the console.
  /providers - List available providers.`;

// Global state to track if we're handling a command
let isHandlingCommand = false;
let shouldExit = false;

async function handleCommand(command: string) {
  if (isHandlingCommand) return;
  isHandlingCommand = true;

  try {
    switch (command) {
      case "quit":
        outro(chalk.green("Goodbye!"));
        shouldExit = true;
        break;
      case "help":
        console.log(
          boxen(chalk.cyan(help), {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "cyan",
            backgroundColor: "#000",
          })
        );
        break;
      case "clear":
        console.clear();
        break;
      case "providers":
        await listProviders();
        break;
    }
  } finally {
    isHandlingCommand = false;
  }
}

async function showCommandAutocomplete(): Promise<string> {
  if (isHandlingCommand) return "";
  isHandlingCommand = true;

  try {
    const answer = await enquirer.autocomplete({
      name: "command",
      message: chalk.green("Select a command"),
      choices: commands,
      limit: 10,
      initial: 0,
      footer() {
        return chalk.gray(
          "Use arrow keys to navigate, type to filter, Enter to select"
        );
      },
    });

    return answer;
  } catch (error) {
    // User cancelled the prompt
    return "";
  } finally {
    isHandlingCommand = false;
  }
}

// Real-time input handler
function setupRealTimeInput() {
  let inputBuffer = "";

  // Enable keypress events
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.setEncoding("utf8");

  process.stdin.on("keypress", async (char, key) => {
    if (isHandlingCommand || shouldExit) return;

    // Handle Ctrl+C
    if (key && key.ctrl && key.name === "c") {
      shouldExit = true;
      process.exit(0);
    }

    // Handle Enter
    if (char === "\r") {
      if (inputBuffer.startsWith("/")) {
        const command = inputBuffer.slice(1);
        if (commandNames.includes(command)) {
          await handleCommand(command);
        } else if (command === "") {
          // Just "/" - show autocomplete
          const selectedCommand = await showCommandAutocomplete();
          if (selectedCommand && commandNames.includes(selectedCommand)) {
            await handleCommand(selectedCommand);
          }
        } else {
          const errorMessage = boxen(
            chalk.red(`Unknown command: /${command}`),
            {
              padding: 1,
              margin: 1,
              borderStyle: "round",
              borderColor: "red",
              backgroundColor: "#000",
            }
          );
          console.log(errorMessage);
        }
      } else if (inputBuffer.trim() !== "") {
        const text = await sendMessageToServer(inputBuffer);
        console.log(
          boxen(chalk.green(`-> AI: ${text}`), {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "green",
            backgroundColor: "#000",
          })
        );
      }

      // Reset buffer and show prompt
      inputBuffer = "";
      process.stdout.write("\n");
      process.stdout.write("you > ");
      return;
    }

    // Handle backspace
    if (char === "\u007F") {
      if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1);
        process.stdout.write("\b \b");
      }
      return;
    }

    // Handle regular characters
    if (char && char.length === 1) {
      inputBuffer += char;
      process.stdout.write(char);

      // Show autocomplete immediately when user types "/"
      if (inputBuffer === "/") {
        const selectedCommand = await showCommandAutocomplete();
        if (selectedCommand && commandNames.includes(selectedCommand)) {
          await handleCommand(selectedCommand);
        }

        // Reset buffer and show prompt
        inputBuffer = "";
        process.stdout.write("\n");
        process.stdout.write("you > ");
      }
    }
  });

  // Show initial prompt
  process.stdout.write("you > ");
}

async function main() {
  // Create a beautiful header
  const header = boxen(chalk.bold(chalk.cyan("AI Terminal")), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    backgroundColor: "#000",
  });

  console.log(header);

  // Setup real-time input
  setupRealTimeInput();

  // Keep the process alive
  process.stdin.resume();

  // Main loop to keep the application running
  while (!shouldExit) {
    // Small delay to prevent busy waiting
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

// Handle process signals for graceful shutdown
process.on("SIGINT", () => {
  console.log("\n");
  outro(chalk.green("Goodbye!"));
  shouldExit = true;
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

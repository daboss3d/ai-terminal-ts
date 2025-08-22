import { intro, outro } from "@clack/prompts";
import enquirer from "enquirer";
import chalk from "chalk";
import boxen from "boxen";
import readline from "readline";
import { listProviders } from "../lib/providers-cli";

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

async function handleCommand(command: string) {
  switch (command) {
    case "quit":
      outro(chalk.green("Goodbye!"));
      process.exit(0);
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
}

async function showCommandAutocomplete(): Promise<string> {
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
  }
}

// Custom real-time input handler with proper event management
class RealTimeInputHandler {
  private rl: readline.Interface;
  private inputBuffer: string = "";
  private isProcessingCommand: boolean = false;

  constructor() {
    // Enable keypress events
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.setEncoding("utf8");

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Handle keypress events
    process.stdin.on("keypress", this.handleKeypress.bind(this));
  }

  private async handleKeypress(char: string, key: any) {
    // Prevent multiple concurrent command processing
    if (this.isProcessingCommand) return;

    // Handle Ctrl+C
    if (key && key.ctrl && key.name === "c") {
      this.cleanup();
      process.exit(0);
    }

    // Handle Enter
    if (char === "\r") {
      if (this.inputBuffer.startsWith("/")) {
        // Process command
        const command = this.inputBuffer.slice(1);
        if (commandNames.includes(command)) {
          this.isProcessingCommand = true;
          await handleCommand(command);
          this.isProcessingCommand = false;
        } else if (command === "") {
          // Just "/" - show autocomplete
          this.isProcessingCommand = true;
          const selectedCommand = await showCommandAutocomplete();
          if (selectedCommand && commandNames.includes(selectedCommand)) {
            await handleCommand(selectedCommand);
          }
          this.isProcessingCommand = false;
        } else {
          // Unknown command
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
      } else if (this.inputBuffer.trim() !== "") {
        // Process regular input
        const message = boxen(
          chalk.green(`-> Sending to AI: ${this.inputBuffer}`),
          {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "green",
            backgroundColor: "#000",
          }
        );
        console.log(message);
      }

      // Reset buffer and show prompt
      this.inputBuffer = "";
      process.stdout.write("\n");
      process.stdout.write("you > ");
      return;
    }

    // Handle backspace
    if (char === "\u007F") {
      if (this.inputBuffer.length > 0) {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
        process.stdout.write("\b \b");
      }
      return;
    }

    // Handle regular characters
    if (char && char.length === 1) {
      this.inputBuffer += char;
      process.stdout.write(char);

      // Show autocomplete immediately when user types "/"
      if (this.inputBuffer === "/") {
        this.isProcessingCommand = true;
        const selectedCommand = await showCommandAutocomplete();
        if (selectedCommand && commandNames.includes(selectedCommand)) {
          await handleCommand(selectedCommand);
        }
        this.isProcessingCommand = false;

        // Reset buffer and show prompt
        this.inputBuffer = "";
        process.stdout.write("\n");
        process.stdout.write("you > ");
      }
    }
  }

  public start() {
    process.stdout.write("you > ");
  }

  private cleanup() {
    this.rl.close();
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.removeAllListeners("keypress");
  }
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

  // Initialize real-time input handler
  const inputHandler = new RealTimeInputHandler();
  inputHandler.start();

  // Keep the process alive
  process.stdin.resume();
}

// Handle uncaught exceptions to prevent crashes
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

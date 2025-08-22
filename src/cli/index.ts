import { intro, outro } from "@clack/prompts";
import enquirer from "enquirer";

const commands = [
  { name: "quit", message: "/quit - Exit the application" },
  { name: "help", message: "/help - Show this help message" },
  { name: "clear", message: "/clear - Clear the console" },
  { name: "providers", message: "/providers - List available providers" }
];

const commandNames = ["quit", "help", "clear", "providers"];

const help = `Available commands:
  /quit      - Exit the application.
  /help      - Show this help message.
  /clear     - Clear the console.
  /providers - List available providers.`;

const providers = () => {
  return "testing ...";
};

async function handleCommand(command: string) {
  switch (command) {
    case "quit":
      outro("Goodbye!");
      process.exit(0);
      break;
    case "help":
      console.log(help);
      break;
    case "clear":
      console.clear();
      break;
    case "providers":
      console.log(providers());
      break;
  }
}

// Custom real-time input handler
async function realTimeInput(): Promise<string> {
  return new Promise((resolve) => {
    let input = "";
    
    // Enable raw mode for real-time keypress detection
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.setEncoding('utf8');
    
    const onData = (char: string) => {
      // Handle Ctrl+C
      if (char === '\u0003') {
        process.exit(0);
      }
      
      // Handle Enter
      if (char === '\r') {
        process.stdin.removeListener('data', onData);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        process.stdout.write('\n');
        resolve(input);
        return;
      }
      
      // Handle backspace
      if (char === '\u007F') {
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.write('\b \b');
        }
        return;
      }
      
      // Handle regular characters
      if (char.length === 1) {
        input += char;
        process.stdout.write(char);
        
        // Show autocomplete immediately when user types "/"
        if (input === '/') {
          process.stdin.removeListener('data', onData);
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
          }
          process.stdout.write('\n');
          resolve('/');
          return;
        }
      }
    };
    
    process.stdout.write('you > ');
    process.stdin.on('data', onData);
  });
}

async function commandPrompt(): Promise<string> {
  try {
    const answer = await enquirer.autocomplete({
      name: "command",
      message: "Select a command",
      choices: commands,
      limit: 10,
      initial: 0,
      footer() {
        return "Use arrow keys to navigate, type to filter, Enter to select";
      }
    });
    
    return `/${answer}`;
  } catch (error) {
    outro("Goodbye!");
    process.exit(0);
  }
}

async function customPrompt(): Promise<string> {
  const input = await realTimeInput();
  return input;
}

async function main() {
  intro("AI Terminal");

  while (true) {
    const userInput = await customPrompt();

    if (userInput === "/") {
      // Show command autocomplete immediately when user types "/"
      const command = await commandPrompt();
      const commandName = command.slice(1);
      await handleCommand(commandName);
    } else if (userInput.startsWith("/")) {
      const command = userInput.slice(1);
      if (commandNames.includes(command)) {
        await handleCommand(command);
      } else {
        console.log(`Unknown command: ${userInput}`);
        console.log("\nAvailable commands:");
        commandNames.forEach(cmd => console.log(`  /${cmd}`));
        console.log("");
      }
    } else if (userInput.trim() !== "") {
      // This is where the AI call would go in the future
      console.log(`-> Sending to AI: ${userInput}`);
    }
    // Add a newline for spacing
    console.log("");
  }
}

main().catch(console.error);
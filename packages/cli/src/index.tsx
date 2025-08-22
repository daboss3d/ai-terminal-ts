#!/usr/bin/env node

// Check if we're in a TTY environment first
const isTTY = process.stdin.isTTY && process.stdout.isTTY;

if (!isTTY) {
  console.log("AI Terminal - Simple Mode");
  console.log("========================");
  console.log("Available commands:");
  console.log("  /quit      - Exit the application");
  console.log("  /help      - Show this help message");
  console.log("  /clear     - Clear the console");
  console.log("  /providers - List available providers");
  console.log("");
  console.log("For full interactive experience, run in a proper terminal.");
  console.log("");

  // Simple input handling for non-TTY environments
  process.stdin.setEncoding("utf8");

  const handleInput = (chunk) => {
    const input = chunk.toString().trim();

    if (input === "/quit") {
      console.log("Goodbye!");
      process.exit(0);
    } else if (input === "/help") {
      console.log("Available commands:");
      console.log("  /quit      - Exit the application");
      console.log("  /help      - Show this help message");
      console.log("  /clear     - Clear the console");
      console.log("  /providers - List available providers");
    } else if (input === "/clear") {
      console.clear();
      console.log("Console cleared");
    } else if (input === "/providers") {
      console.log("Providers functionality would be implemented here");
    } else if (input.startsWith("/")) {
      console.log(`Unknown command: ${input}`);
    } else if (input.trim() !== "") {
      console.log(`-> Sending to AI: ${input}`);
    }

    process.stdout.write("you > ");
  };

  process.stdin.on("data", handleInput);
  process.stdout.write("you > ");
} else {
  // For TTY environments, import and run the Ink app
  console.log("AI Terminal - Interactive Mode");

  import("./app-runner.js").catch((error) => {
    console.error("Failed to start interactive mode:", error.message);
    console.log("Falling back to simple mode...");

    // Fallback to simple mode
    process.stdin.setEncoding("utf8");

    const handleInput = (chunk) => {
      const input = chunk.toString().trim();

      if (input === "/quit") {
        console.log("Goodbye!");
        process.exit(0);
      } else if (input === "/help") {
        console.log("Available commands:");
        console.log("  /quit      - Exit the application");
        console.log("  /help      - Show this help message");
        console.log("  /clear     - Clear the console");
        console.log("  /providers - List available providers");
      } else if (input === "/clear") {
        console.clear();
        console.log("Console cleared");
      } else if (input === "/providers") {
        console.log("Providers functionality would be implemented here");
      } else if (input.startsWith("/")) {
        console.log(`Unknown command: ${input}`);
      } else if (input.trim() !== "") {
        console.log(`-> Sending to AI: ${input}`);
      }

      process.stdout.write("you > ");
    };

    process.stdin.on("data", handleInput);
    process.stdout.write("you > ");
  });
}

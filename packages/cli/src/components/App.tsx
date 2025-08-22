import React, { useState, useCallback, useEffect } from "react";
import { Text, Box, useApp, useInput } from "ink";

// Mock command definitions
const commands = [
  { name: "quit", message: "/quit - Exit the application" },
  { name: "help", message: "/help - Show this help message" },
  { name: "clear", message: "/clear - Clear the console" },
  { name: "providers", message: "/providers - List available providers" },
];

const commandNames = ["quit", "help", "clear", "providers"];

const helpText = `Available commands:
  /quit      - Exit the application.
  /help      - Show this help message.
  /clear     - Clear the console.
  /providers - List available providers.`;

type OutputLine = {
  id: string;
  content: string;
  type: "message" | "command" | "error" | "ai";
};

type StreamState = {
  id: string;
  content: string;
  isComplete: boolean;
};

const App = () => {
  const { exit } = useApp();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [streamingResponse, setStreamingResponse] = useState<StreamState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate unique IDs for output lines
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addOutput = useCallback(
    (content: string, type: OutputLine["type"] = "message") => {
      setOutput((prev) => [...prev, { id: generateId(), content, type }]);
    },
    [generateId]
  );

  const handleCommand = useCallback(
    (command: string) => {
      switch (command) {
        case "quit":
          exit();
          break;
        case "help":
          addOutput(helpText, "command");
          break;
        case "clear":
          setOutput([]);
          break;
        case "providers":
          addOutput(
            "Providers functionality would be implemented here",
            "command"
          );
          break;
        default:
          addOutput(`Unknown command: /${command}`, "error");
          break;
      }
    },
    [addOutput, exit]
  );

  const processStreamingResponse = useCallback(async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    const streamId = generateId();
    
    // Initialize streaming response
    setStreamingResponse({
      id: streamId,
      content: "",
      isComplete: false
    });

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Update streaming response
        setStreamingResponse(prev => prev ? {
          ...prev,
          content: prev.content + chunk
        } : null);
      }
    } finally {
      // Mark stream as complete
      setStreamingResponse(prev => prev ? {
        ...prev,
        isComplete: true
      } : null);
      
      // Move completed stream to output
      setStreamingResponse(prev => {
        if (prev && prev.isComplete) {
          addOutput(prev.content, "ai");
          return null;
        }
        return prev;
      });
      
      reader.releaseLock();
    }
  }, [generateId, addOutput]);

  const processInput = useCallback(
    async (input: string) => {
      if (isProcessing) return;

      setIsProcessing(true);

      try {
        if (input.startsWith("/")) {
          const command = input.slice(1);
          if (commandNames.includes(command)) {
            handleCommand(command);
          } else {
            addOutput(`Unknown command: /${command}`, "error");
          }
        } else if (input.trim() !== "") {
          addOutput(`-> Sending to AI: ${input}`, "message");

          // Send to server with streaming enabled
          const response = await fetch("http://localhost:3001/prompts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: input, stream: true }),
          });

          if (response.body) {
            await processStreamingResponse(response);
          } else {
            addOutput("No response body received", "error");
          }
        }
      } catch (error) {
        addOutput(`Error: ${error.message}`, "error");
      } finally {
        setInput("");
        setIsProcessing(false);
      }
    },
    [handleCommand, addOutput, isProcessing, processStreamingResponse]
  );

  // Handle keyboard input with Ink's useInput hook
  useInput((inputChar, key) => {
    if (key.escape || (key.ctrl && key.name === "c")) {
      exit();
    } else if (key.return) {
      processInput(input);
    } else if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
    } else if (inputChar) {
      setInput((prev) => prev + inputChar);
    }
  });

  return (
    <Box flexDirection="column">
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color="cyan">
          AI Terminal
        </Text>
      </Box>

      {output.map((line) => (
        <Box key={line.id} flexDirection="column" marginTop={1}>
          {line.type === "ai" ? (
            <Box flexDirection="column">
              <Box>
                <Text color="green">AI Response:</Text>
              </Box>
              <Box 
                borderStyle="round" 
                borderColor="green" 
                paddingX={1} 
                paddingY={0}
              >
                <Text color="green">
                  {line.content}
                </Text>
              </Box>
            </Box>
          ) : (
            <Text
              color={
                line.type === "error"
                  ? "red"
                  : line.type === "command"
                  ? "cyan"
                  : undefined
              }
            >
              {line.content}
            </Text>
          )}
        </Box>
      ))}

      {/* Display streaming response in real-time with a beautiful box */}
      {streamingResponse && !streamingResponse.isComplete && (
        <Box flexDirection="column" marginTop={1}>
          <Box>
            <Text color="green">AI Response:</Text>
          </Box>
          <Box 
            borderStyle="round" 
            borderColor="green" 
            paddingX={1} 
            paddingY={0}
            marginTop={0}
          >
            <Text color="green">
              {streamingResponse.content}
              <Text color="gray">█</Text> {/* Cursor indicator */}
            </Text>
          </Box>
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text color="cyan">You:</Text>
        </Box>
        <Box 
          borderStyle="round" 
          borderColor="cyan" 
          paddingX={1} 
          paddingY={0}
        >
          <Text color="cyan">
            {input}
            <Text color="gray">█</Text> {/* Cursor indicator */}
          </Text>
        </Box>
      </Box>

      {isProcessing && !streamingResponse && (
        <Box marginTop={1}>
          <Box>
            <Text color="gray">Status:</Text>
          </Box>
          <Box 
            borderStyle="round" 
            borderColor="gray" 
            paddingX={1} 
            paddingY={0}
          >
            <Text color="gray">Processing...</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default App;

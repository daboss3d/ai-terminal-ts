import React, { useState, useCallback } from "react";
import { Text, Box, useApp, useInput } from "ink";
import { commands, commandNames, handleCommand } from "../commands";

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
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<typeof commands>(commands);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

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
      setShowCommandSuggestions(false);
      setSelectedCommandIndex(0);

      try {
        if (input.startsWith("/")) {
          const command = input.slice(1);
          if (commandNames.includes(command)) {
            // Create command context
            const context = {
              addOutput,
              setOutput,
              output,
              exit
            };
            
            // Handle the command
            await handleCommand(command, context, []);
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
    [addOutput, isProcessing, processStreamingResponse, output, exit]
  );

  // Handle keyboard input with Ink's useInput hook
  useInput((inputChar, key) => {
    // Handle command selection when suggestions are shown
    if (showCommandSuggestions) {
      if (key.upArrow) {
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }
      
      if (key.downArrow) {
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }
      
      if (key.return) {
        if (filteredCommands.length > 0) {
          const selectedCommand = filteredCommands[selectedCommandIndex];
          setInput("/" + selectedCommand.name);
          setShowCommandSuggestions(false);
          setSelectedCommandIndex(0);
        }
        return;
      }
      
      if (key.escape) {
        setShowCommandSuggestions(false);
        setSelectedCommandIndex(0);
        return;
      }
    }
    
    // Handle regular input
    if (key.escape || (key.ctrl && key.name === "c")) {
      exit();
    } else if (key.return) {
      processInput(input);
    } else if (key.backspace || key.delete) {
      const newInput = input.slice(0, -1);
      setInput(newInput);
      
      // Handle command suggestions
      if (newInput === "/") {
        setShowCommandSuggestions(true);
        setFilteredCommands(commands);
        setSelectedCommandIndex(0);
      } else if (newInput.startsWith("/")) {
        const filterText = newInput.slice(1);
        const filtered = commands.filter(cmd => 
          cmd.name.startsWith(filterText)
        );
        setFilteredCommands(filtered);
        setSelectedCommandIndex(0);
      } else {
        setShowCommandSuggestions(false);
        setSelectedCommandIndex(0);
      }
    } else if (inputChar) {
      const newInput = input + inputChar;
      setInput(newInput);
      
      // Handle command suggestions
      if (newInput === "/") {
        setShowCommandSuggestions(true);
        setFilteredCommands(commands);
        setSelectedCommandIndex(0);
      } else if (newInput.startsWith("/")) {
        const filterText = newInput.slice(1);
        const filtered = commands.filter(cmd => 
          cmd.name.startsWith(filterText)
        );
        setFilteredCommands(filtered);
        setSelectedCommandIndex(0);
      } else {
        setShowCommandSuggestions(false);
        setSelectedCommandIndex(0);
      }
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

      {/* Display command suggestions with selection */}
      {showCommandSuggestions && (
        <Box flexDirection="column" marginTop={1}>
          <Box>
            <Text color="yellow">Available Commands:</Text>
          </Box>
          <Box 
            borderStyle="round" 
            borderColor="yellow" 
            paddingX={1} 
            paddingY={0}
            flexDirection="column"
          >
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, index) => (
                <Box key={index} marginBottom={0}>
                  {index === selectedCommandIndex ? (
                    <Text color="yellow">
                      <Text color="cyan">▶ </Text>
                      {cmd.message}
                    </Text>
                  ) : (
                    <Text color="yellow">
                      <Text>  </Text>
                      {cmd.message}
                    </Text>
                  )}
                </Box>
              ))
            ) : (
              <Text color="yellow">No matching commands found</Text>
            )}
          </Box>
          <Box marginTop={0}>
            <Text color="gray">↑↓ to navigate, ↵ to select, Esc to cancel</Text>
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
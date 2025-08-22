import React, { useState, useCallback, useEffect } from 'react';
import { Text, Box, render, useApp, useInput } from 'ink';

// Mock command definitions
const commands = [
  { name: "quit", message: "/quit - Exit the application" },
  { name: "help", message: "/help - Show this help message" },
  { name: "clear", message: "/clear - Clear the console" },
  { name: "providers", message: "/providers - List available providers" }
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
  type: 'message' | 'command' | 'error' | 'ai';
};

interface AIResponseProps {
  dataStream: ReadableStream | null;
  onDone?: () => void;
}

// Mock AIResponse component for now
const AIResponse: React.FC<AIResponseProps> = ({ dataStream, onDone }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!dataStream) return;

    const reader = dataStream.getReader();
    const decoder = new TextDecoder();

    const read = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          setContent(prev => prev + text);
        }
      } finally {
        reader.releaseLock();
        onDone?.();
      }
    };

    read();

    return () => {
      reader.cancel().catch(() => {});
    };
  }, [dataStream, onDone]);

  return <Text color="green">{content}</Text>;
};

const App = () => {
  const { exit } = useApp();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponseStream, setAiResponseStream] = useState<ReadableStream | null>(null);

  // Generate unique IDs for output lines
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addOutput = useCallback((content: string, type: OutputLine['type'] = 'message') => {
    setOutput(prev => [...prev, { id: generateId(), content, type }]);
  }, [generateId]);

  const handleCommand = useCallback((command: string) => {
    switch (command) {
      case "quit":
        exit();
        break;
      case "help":
        addOutput(helpText, 'command');
        break;
      case "clear":
        setOutput([]);
        break;
      case "providers":
        addOutput("Providers functionality would be implemented here", 'command');
        break;
      default:
        addOutput(`Unknown command: /${command}`, 'error');
        break;
    }
  }, [addOutput, exit]);

  const processInput = useCallback(async (input: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (input.startsWith("/")) {
        const command = input.slice(1);
        if (commandNames.includes(command)) {
          handleCommand(command);
        } else {
          addOutput(`Unknown command: /${command}`, 'error');
        }
      } else if (input.trim() !== "") {
        // Simulate sending to AI
        addOutput(`-> Sending to AI: ${input}`);
        
        // Create a mock stream for demonstration
        const mockStream = new ReadableStream({
          start(controller) {
            const text = "This is a mock AI response to your message: " + input;
            controller.enqueue(new TextEncoder().encode(text));
            controller.close();
          }
        });
        
        setAiResponseStream(mockStream);
      }
    } finally {
      setInput('');
      setIsProcessing(false);
    }
  }, [handleCommand, addOutput, isProcessing]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || (key.ctrl && key.name === 'c')) {
      exit();
      return;
    }

    if (key.return) {
      processInput(input);
      return;
    }

    if (key.backspace) {
      setInput(prev => prev.slice(0, -1));
      return;
    }

    if (input.length === 1) {
      setInput(prev => prev + input);
    }
  });

  const handleAiDone = useCallback(() => {
    setAiResponseStream(null);
  }, []);

  return (
    <Box flexDirection="column">
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color="cyan">AI Terminal</Text>
      </Box>
      
      {output.map((line) => (
        <Text 
          key={line.id} 
          color={
            line.type === 'error' ? 'red' : 
            line.type === 'command' ? 'cyan' : 
            line.type === 'ai' ? 'green' : 
            undefined
          }
        >
          {line.content}
        </Text>
      ))}
      
      {aiResponseStream && (
        <Box marginTop={1}>
          <Text color="green">AI: </Text>
          <AIResponse dataStream={aiResponseStream} onDone={handleAiDone} />
        </Box>
      )}
      
      <Box marginTop={1}>
        <Text color="cyan">you &gt; </Text>
        <Text>{input}</Text>
      </Box>
      
      {isProcessing && (
        <Text color="gray">Processing...</Text>
      )}
    </Box>
  );
};

export default App;
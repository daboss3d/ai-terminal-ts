import React, { useState, useCallback } from 'react';
import { Text, Box, useApp, useInput } from 'ink';
import { commandNames, handleCommand } from '../commands';
import { useCommandInput } from '../hooks/useCommandInput';
import { CommandSuggestions } from './CommandSuggestions';
import { UserInput } from './UserInput';
import { OutputDisplay } from './OutputDisplay';

type OutputLine = {
  id: string;
  content: string;
  type: 'message' | 'command' | 'error' | 'ai';
};

type StreamState = {
  id: string;
  content: string;
  isComplete: boolean;
};

type SubmenuOption = {
  name: string;
  message: string;
  action: () => void;
};

const Submenu = ({ command, options, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((_, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    }
    if (key.return) {
      options[selectedIndex].action();
    }
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color="yellow">Select an action for `/{command}`:</Text>
      </Box>
      <Box
        borderStyle="round"
        borderColor="yellow"
        paddingX={1}
        paddingY={0}
        flexDirection="column"
      >
        {options.map((opt, index) => (
          <Box key={index} marginBottom={0}>
            {index === selectedIndex ? (
              <Text color="yellow">
                <Text color="cyan">▶ </Text>
                {opt.message}
              </Text>
            ) : (
              <Text color="yellow">
                <Text>  </Text>
                {opt.message}
              </Text>
            )}
          </Box>
        ))}
      </Box>
      <Box marginTop={0}>
        <Text color="gray">↑↓ to navigate, ↵ to select, Esc to cancel</Text>
      </Box>
    </Box>
  );
};

const App = () => {
  const { exit } = useApp();
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [streamingResponse, setStreamingResponse] = useState<StreamState | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addOutput = useCallback(
    (content: string, type: OutputLine['type'] = 'message') => {
      setOutput((prev) => [...prev, { id: generateId(), content, type }]);
    },
    [generateId]
  );

  const processStreamingResponse = useCallback(
    async (response: Response) => {
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      const streamId = generateId();

      setStreamingResponse({
        id: streamId,
        content: '',
        isComplete: false,
      });

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          setStreamingResponse(
            (prev) =>
              prev ? { ...prev, content: prev.content + chunk } : null
          );
        }
      } finally {
        setStreamingResponse(
          (prev) => (prev ? { ...prev, isComplete: true } : null)
        );

        setStreamingResponse((prev) => {
          if (prev && prev.isComplete) {
            addOutput(prev.content, 'ai');
            return null;
          }
          return prev;
        });

        reader.releaseLock();
      }
    },
    [generateId, addOutput]
  );

  const processInput = useCallback(
    async (input: string) => {
      if (isProcessing) return;

      setIsProcessing(true);

      if (input.trim() !== '') {
        if (history[history.length - 1] !== input) {
          setHistory((prev) => [...prev, input]);
        }
      }

      try {
        if (input.startsWith('/')) {
          const [command, ...args] = input.slice(1).split(' ').filter(Boolean);

          if (command === 'providers' && args.length === 0) {
            setActiveSubmenu('providers');
            setIsProcessing(false);
            return;
          }

          if (commandNames.includes(command)) {
            const context = {
              addOutput,
              setOutput,
              output,
              exit,
            };

            await handleCommand(command, context, args);
          } else {
            addOutput(`Unknown command: /${command}`, 'error');
          }
        } else if (input.trim() !== '') {
          addOutput(`-> Sending to AI: ${input}`, 'message');

          const response = await fetch('http://localhost:3001/prompts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: input, stream: true }),
          });

          if (response.body) {
            await processStreamingResponse(response);
          } else {
            addOutput('No response body received', 'error');
          }
        }
      } catch (error) {
        addOutput(`Error: ${error.message}`, 'error');
      } finally {
        setIsProcessing(false);
      }
    },
    [addOutput, isProcessing, processStreamingResponse, output, exit, history]
  );

  const {
    input,
    showSuggestions,
    filteredCommands,
    selectedIndex,
  } = useCommandInput(processInput, history, !activeSubmenu);

  const submenuOptions: SubmenuOption[] = [
    {
      name: 'list',
      message: 'List all providers',
      action: () => {
        processInput('/providers list');
        setActiveSubmenu(null);
      },
    },
    {
      name: 'edit',
      message: 'Edit a provider',
      action: () => {
        // This will be handled by the new interactive editor
        // For now, it does nothing, but we will change this
        setActiveSubmenu(null);
      },
    },
    {
      name: 'delete',
      message: 'Delete a provider',
      action: () => {
        // This will also be handled by a new interactive UI
        setActiveSubmenu(null);
      },
    },
  ];

  return (
    <Box flexDirection="column">
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color="cyan">
          AI Terminal
        </Text>
      </Box>

      <OutputDisplay output={output} />

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
              <Text color="gray">█</Text>
            </Text>
          </Box>
        </Box>
      )}

      <CommandSuggestions
        show={showSuggestions}
        commands={filteredCommands}
        selectedIndex={selectedIndex}
      />

      {activeSubmenu === 'providers' && (
        <Submenu
          command="providers"
          options={submenuOptions}
          onCancel={() => setActiveSubmenu(null)}
        />
      )}

      {!activeSubmenu && <UserInput input={input} />}

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
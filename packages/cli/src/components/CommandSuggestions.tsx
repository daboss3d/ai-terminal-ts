import React from 'react';
import { Box, Text } from 'ink';

export const CommandSuggestions = ({ show, commands, selectedIndex }) => {
  if (!show) {
    return null;
  }

  return (
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
        {commands.length > 0 ? (
          commands.map((cmd, index) => (
            <Box key={index} marginBottom={0}>
              {index === selectedIndex ? (
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
  );
};

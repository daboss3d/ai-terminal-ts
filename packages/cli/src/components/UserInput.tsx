import React from 'react';
import { Box, Text } from 'ink';

export const UserInput = ({ input }) => {
  return (
    <Box marginTop={1} flexDirection="column">
      <Box>
        <Text color="cyan">You:</Text>
      </Box>
      <Box borderStyle="round" borderColor="cyan" paddingX={1} paddingY={0}>
        <Text color="cyan">
          {input}
          <Text color="gray">█</Text> {/* Cursor indicator */}
        </Text>
      </Box>
    </Box>
  );
};

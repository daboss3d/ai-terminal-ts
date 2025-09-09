import React from 'react';
import { Box, Text } from 'ink';

export const OutputDisplay = ({ output }) => {
  return (
    <Box flexDirection="column">
      {output.map((line) => (
        <Box key={line.id} flexDirection="column" marginTop={1}>
          {line.type === 'ai' ? (
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
                <Text color="green">{line.content}</Text>
              </Box>
            </Box>
          ) : (
            <Text
              color={
                line.type === 'error'
                  ? 'red'
                  : line.type === 'command'
                  ? 'cyan'
                  : undefined
              }
            >
              {line.content}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );
};

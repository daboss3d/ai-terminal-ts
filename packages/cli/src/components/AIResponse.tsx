import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import boxen from 'boxen';
import chalk from 'chalk';

const AIResponse = ({ dataStream, onDone }) => {
  const [response, setResponse] = useState('');

  useEffect(() => {
    const reader = dataStream.getReader();
    const decoder = new TextDecoder();

    const read = () => {
      reader.read().then(({ done, value }) => {
        if (done) {
          onDone();
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + chunk);
        read();
      });
    };

    read();
  }, [dataStream, onDone]);

  const box = boxen(chalk.green(`-> AI: ${response}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green',
    backgroundColor: '#000',
  });

  return (
    <Box>
      <Text>{box}</Text>
    </Box>
  );
};

export default AIResponse;

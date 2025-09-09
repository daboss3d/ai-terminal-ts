import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { commands } from '../commands';

export const useCommandInput = (
  onSubmit: (input: string) => void,
  history: string[],
  isActive: boolean = true
) => {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(history.length);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setHistoryIndex(history.length);
  }, [history]);

  useInput(
    (char, key) => {
      if (showSuggestions) {
        if (key.upArrow) {
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          return;
        }

        if (key.downArrow) {
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          return;
        }

        if (key.return) {
          if (filteredCommands.length > 0) {
            setInput('/' + filteredCommands[selectedIndex].name);
            setShowSuggestions(false);
            setSelectedIndex(0);
          }
          return;
        }

        if (key.escape) {
          setShowSuggestions(false);
          setSelectedIndex(0);
          return;
        }
      }

      if (key.upArrow) {
        const newIndex = Math.max(0, historyIndex - 1);
        if (history[newIndex]) {
          setInput(history[newIndex]);
          setHistoryIndex(newIndex);
        }
        return;
      }

      if (key.downArrow) {
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setInput(history[newIndex]);
          setHistoryIndex(newIndex);
        } else {
          setHistoryIndex(history.length);
          setInput('');
        }
        return;
      }

      if (key.return) {
        if (input.trim() !== '') {
          onSubmit(input);
        }
        setInput('');
        setHistoryIndex(history.length + 1);
      } else if (key.backspace || key.delete) {
        setHistoryIndex(history.length);
        const newInput = input.slice(0, -1);
        setInput(newInput);

        if (newInput === '/') {
          setShowSuggestions(true);
          setFilteredCommands(commands);
          setSelectedIndex(0);
        } else if (newInput.startsWith('/')) {
          const filterText = newInput.slice(1);
          const filtered = commands.filter((cmd) =>
            cmd.name.startsWith(filterText)
          );
          setFilteredCommands(filtered);
          setSelectedIndex(0);
        } else {
          setShowSuggestions(false);
          setSelectedIndex(0);
        }
      } else if (char) {
        setHistoryIndex(history.length);
        const newInput = input + char;
        setInput(newInput);

        if (newInput === '/') {
          setShowSuggestions(true);
          setFilteredCommands(commands);
          setSelectedIndex(0);
        } else if (newInput.startsWith('/')) {
          const filterText = newInput.slice(1);
          const filtered = commands.filter((cmd) =>
            cmd.name.startsWith(filterText)
          );
          setFilteredCommands(filtered);
          setSelectedIndex(0);
        } else {
          setShowSuggestions(false);
          setSelectedIndex(0);
        }
      }
    },
    { isActive }
  );

  return {
    input,
    setInput,
    showSuggestions,
    setShowSuggestions,
    filteredCommands,
    setFilteredCommands,
    selectedIndex,
    setSelectedIndex,
  };
};
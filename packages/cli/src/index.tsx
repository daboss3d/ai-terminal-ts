#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import App from './components/App';

// Check if we're in a TTY environment (but be more permissive for development)
const isRawModeSupported = process.stdin.isTTY && process.stdout.isTTY;

// For development, we can work without raw mode if needed
if (!isRawModeSupported) {
  console.warn('Warning: Raw mode is not supported in this environment');
  console.warn('Some features may not work as expected');
}

render(React.createElement(App));
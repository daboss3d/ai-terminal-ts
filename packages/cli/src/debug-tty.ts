#!/usr/bin/env node

// Debug script to check TTY support
console.log('process.stdin.isTTY:', process.stdin.isTTY);
console.log('process.stdout.isTTY:', process.stdout.isTTY);
console.log('process.stderr.isTTY:', process.stderr.isTTY);

if (process.stdin.isTTY) {
  console.log('Setting stdin to raw mode...');
  try {
    process.stdin.setRawMode(true);
    console.log('Raw mode enabled successfully');
    process.stdin.setRawMode(false);
  } catch (error) {
    console.error('Failed to set raw mode:', error.message);
  }
} else {
  console.log('stdin is not a TTY, raw mode not available');
}
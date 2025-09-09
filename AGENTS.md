# Agents in ai-terminal-ts

This document provides context for the AI code assistant to understand the `ai-terminal-ts` project.

## Project Overview

`ai-terminal-ts` is a project for managing and interacting with AI agents. It consists of a central server that manages the agents and their configurations, and multiple clients (CLI and web) that connect to the server to interact with the agents.

- **`packages/server`**: A Node.js server built with Hono and Socket.IO. It manages the AI agents, their configurations, and the communication with the LLM providers.
- **`packages/cli`**: A command-line interface (CLI) for interacting with the AI agents through the server.
- **`packages/web`**: A web-based interface for interacting with the AI agents in real-time.

# GEMINI Code Assistant Context

This document provides context for the Gemini code assistant to understand the `ai-terminal-ts` project.

## Project Overview

`ai-terminal-ts` is a command-line interface (CLI) application for managing AI agents. It allows users to configure and interact with different Large Language Model (LLM) providers, manage multiple AI agents with distinct system prompts, and maintain session history.

The project is built with the following technologies:

*   **Runtime and Package Manager:** Bun
*   **Language:** TypeScript
*   **Data Validation:** Zod
*   **CLI UI:** @clack/prompts

The project's architecture is organized as follows:

*   **`src/`**: Contains the source code for the CLI application.
    *   **`src/cli/index.ts`**: The main entry point for the CLI.
*   **`data/`**: Stores the application's data in JSON files.
    *   **`data/config/providers.json`**: A list of LLM providers with their configurations.
    *   **`data/config/agents.json`**: A list of AI agents, each with a specified provider and system prompt.
    *   **`data/config/sessions.json`**: A history of user sessions with different agents.
    *   **`data/config/stats.json`**: Usage statistics for agents and providers.

## Building and Running

To run the application in development mode, use the following command:

```bash
bun run ./src/cli/index.ts
```

## Development Conventions

The project uses TypeScript with strict type checking enabled. The code is formatted according to the default Prettier settings. All dependencies are managed using Bun.

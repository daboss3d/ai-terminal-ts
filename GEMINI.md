# GEMINI Code Assistant Context

This document provides context for the Gemini code assistant to understand the `ai-terminal-ts` project.

## Project Overview

`ai-terminal-ts` is a project for managing and interacting with AI agents. It consists of a central server that manages the agents and their configurations, and multiple clients (CLI and web) that connect to the server to interact with the agents.

## Architecture

The project is a monorepo with the following packages:

*   **`packages/server`**: A Node.js server built with Hono and Socket.IO. It manages the AI agents, their configurations, and the communication with the LLM providers.
*   **`packages/cli`**: A command-line interface (CLI) for interacting with the AI agents through the server.
*   **`packages/web`**: A web-based interface for interacting with the AI agents in real-time.

## Technologies

*   **Runtime and Package Manager:** Bun
*   **Language:** TypeScript
*   **Server:**
    *   **Framework:** Hono
    *   **Real-time Communication:** Socket.IO
*   **CLI:**
    *   **UI:** @clack/prompts
*   **Web:**
    *   **Framework:** React
    *   **Real-time Communication:** Socket.IO-client

## Building and Running

To run the different parts of the application in development mode, use the following commands from the root directory:

*   **Server:**
    ```bash
    bun run dev:server
    ```
*   **CLI:**
    ```bash
    bun run dev:cli
    ```
*   **Web:**
    ```bash
    bun run dev:web
    ```

## Development Conventions

The project uses TypeScript with strict type checking enabled. The code is formatted according to the default Prettier settings. All dependencies are managed using Bun and workspaces.

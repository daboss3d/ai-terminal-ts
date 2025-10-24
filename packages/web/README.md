# @ai-terminal-ts/web

Frontend web application for the AI Terminal project.

## Scripts

- `bun run dev` - Start the development server
- `bun run start` - Start the production server
- `bun run build` - Build the client JavaScript (non-minified)
- `bun run build:client` - Alias for the build command
- `bun run build:client:min` - Build the client JavaScript (minified)

## Client Build Process

The client-side JavaScript is built from `src/client.ts` using Bun's build system. The build process:

1. Transpiles TypeScript to JavaScript
2. Bundles all dependencies
3. Outputs to `static/client.js`

By default, the build is non-minified for easier debugging. Use the `:min` suffix to create a minified version for production.

## Architecture

This package contains:
- A React-based UI for interacting with AI agents
- WebSocket connections for real-time communication
- A responsive design that works on desktop and mobile
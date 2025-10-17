import app from './index';

const port = 3100;
console.log(`Server is running on port ${port}`);

// Use Bun.serve to start the server
const server = Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`Server is running on http://localhost:${port}`);
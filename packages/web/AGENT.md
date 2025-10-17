# Web server 

the Web package is a web server that serves the frontend of the application. It is built with Hono, a lightweight web framework for TypeScript, and uses tailwindcss for styling. The frontend is rendered using TSX server-side rendering.

The main page of the web server is the chat interface, which allows users to interact with the AI agents. The chat interface is built using React components and is styled with tailwindcss.

the page have a colapsable  left sidebar menu that displays the list of available agents. Users can select an agent from the sidebar to start a conversation. The chat interface also includes a message input box and a send button.

the page have a light/dark mode toggle button that allows users to switch between light and dark themes. The theme preference is stored in local storage and applied on page load.



the page will work with packages/server to handle the backend logic and communication with the AI agents.

on the top right corner there is a button to toggle light/dark mode and the user profile icon.

on the bottom of the page there is a line with stats, and the name of the agent being used.

the left menu will have options of agents,providers to edit,create,delete providers and agents.


## tech stack
- Hono webserver
- TypeScript
- tailwindcss
- TSX server-side rendering
- AI SDK
- SQLlite (for storing user data and chat history)


### TODO
- [ ] Implement user authentication and authorization
- []

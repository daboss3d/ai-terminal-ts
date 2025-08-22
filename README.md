# ai-terminal-ts

Manages AI agents

## Tech stack

Bun - for runnig typescript (in development and create executables for production) and package management.
Zod - data validation.
clack/prompts - for CLI UI.
ai sdk - for agent coding.

### Structure

/src - code
/src/cli - code for the cli
/data - all data to run agents and manager
/data/config - json configuration files files wich contains the files:

- providers.json : constains a list of LLM providers (indexed by a unique name) with url,model,api_key,type (type can be extended, e.g. openai, ollama ...) and use_tools (yes/no)
- agents.json - constains a list of agents (indexed by a unique name) each agent have a provider and a field called a system_prompt
- sessions.json - contains a list of current sessions, each session have an agent and a context history (to be replaced in future by a sqlite database)
- stats.json - contains ddata usage of agents and providers

#### Reinstalling

If you want to reinstall the project, you can run the following command:

```bash
rm -r node_modules  &&  rm bun.lock && bun pm cache rm && bun install

```

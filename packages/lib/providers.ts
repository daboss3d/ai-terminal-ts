import fs from "fs";
import path from "path";

// Define the Provider interface
export interface Provider {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  enabled: boolean;
}

// Get the path to the providers config file
const providersConfigPath = path.join(process.cwd(), "../..", "data", "config", "providers.json");

// Ensure the data/config directory exists
function ensureConfigDirectory() {
  const configDir = path.join(process.cwd(), "../..", "data", "config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

// Initialize providers config file if it doesn't exist
function initializeProvidersConfig() {
  ensureConfigDirectory();

  if (!fs.existsSync(providersConfigPath)) {
    const defaultProviders: Provider[] = [
      {
        id: "openai",
        name: "OpenAI",
        apiKey: "",
        model: "gpt-3.5-turbo",
        enabled: false
      },
      {
        id: "anthropic",
        name: "Anthropic",
        apiKey: "",
        model: "claude-3-haiku-20240307",
        enabled: false
      },
      {
        id: "ollama",
        name: "Ollama",
        apiKey: "",
        model: "llama3",
        baseUrl: "http://localhost:11434",
        enabled: false
      }
    ];
    console.log("Creating default providers config at", providersConfigPath);
    fs.writeFileSync(providersConfigPath, JSON.stringify(defaultProviders, null, 2));
  }
}

// Get all providers
export function getProviders(): Provider[] {
  initializeProvidersConfig();

  try {
    // console.log("Reading providers config from", providersConfigPath);

    const data = fs.readFileSync(providersConfigPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading providers config:", error);
    return [];
  }
}

// Get a specific provider by ID
export function getProviderById(id: string): Provider | undefined {
  const providers = getProviders();
  return providers.find(provider => provider.id === id);
}

// Add a new provider
export function addProvider(provider: Omit<Provider, "id"> & { id?: string }): Provider {
  const providers = getProviders();

  // Generate ID if not provided
  const id = provider.id || provider.name.toLowerCase().replace(/\s+/g, "-");

  // Check if provider with this ID already exists
  if (providers.some(p => p.id === id)) {
    throw new Error(`Provider with ID "${id}" already exists`);
  }

  const newProvider: Provider = {
    id,
    ...provider
  };

  providers.push(newProvider);
  saveProviders(providers);
  return newProvider;
}

// Update an existing provider
export function updateProvider(id: string, updates: Partial<Provider>): Provider | null {
  const providers = getProviders();
  const index = providers.findIndex(provider => provider.id === id);

  if (index === -1) {
    return null;
  }

  // Merge updates with existing provider
  providers[index] = { ...providers[index], ...updates };
  saveProviders(providers);
  return providers[index];
}

// Delete a provider
export function deleteProvider(id: string): boolean {
  const providers = getProviders();
  const initialLength = providers.length;

  const filteredProviders = providers.filter(provider => provider.id !== id);
  saveProviders(filteredProviders);

  return filteredProviders.length < initialLength;
}

// Enable or disable a provider
export function setProviderEnabled(id: string, enabled: boolean): Provider | null {
  return updateProvider(id, { enabled });
}

// Save providers to file
function saveProviders(providers: Provider[]): void {
  ensureConfigDirectory();
  fs.writeFileSync(providersConfigPath, JSON.stringify(providers, null, 2));
}

// Initialize the config on module load
initializeProvidersConfig();

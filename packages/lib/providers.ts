import { promises as fs } from 'fs';
import { readFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';

// Define the Provider interface
export interface Provider {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  enabled: boolean;
}

// Zod schema for validating Provider
export const ProviderSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
  name: z.string().min(1, "Provider name is required"),
  apiKey: z.string(),
  model: z.string().min(1, "Model is required"),
  baseUrl: z.string().optional(),
  enabled: z.boolean(),
});

/**
 * Read providers from the data file
 * @returns Promise resolving to an array of Provider
 */
export const readProvidersFromFile = async (): Promise<Provider[]> => {
  try {
    const providersData = await fs.readFile('data/config/providers.json', 'utf-8');
    return JSON.parse(providersData);
  } catch (error) {
    console.error('Error reading providers file:', error);
    // Return an empty array if file doesn't exist or is invalid
    return [];
  }
};

/**
 * Write providers to the data file
 * @param providers Array of Provider to write to file
 * @returns Promise that resolves when the file is written
 */
export const writeProvidersToFile = async (providers: Provider[]): Promise<void> => {
  try {
    // Ensure the config directory exists
    const configDir = path.join(process.cwd(), 'data', 'config');
    await fs.mkdir(configDir, { recursive: true });
    
    await fs.writeFile('data/config/providers.json', JSON.stringify(providers, null, 2));
  } catch (error) {
    console.error('Error writing providers file:', error);
    throw error;
  }
};

/**
 * Initialize providers config file if it doesn't exist
 * @returns Promise that resolves when initialization is complete
 */
export const initializeProvidersConfig = async (): Promise<void> => {
  try {
    await fs.access('data/config/providers.json');
  } catch (error) {
    // File doesn't exist, create it with default providers
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

    await writeProvidersToFile(defaultProviders);
  }
};

/**
 * Create a new provider
 * @param provider The provider configuration to create
 * @returns Promise resolving to the created provider
 */
export const createProvider = async (provider: Omit<Provider, "id"> & { id?: string }): Promise<Provider> => {
  // Generate ID if not provided
  const id = provider.id || provider.name.toLowerCase().replace(/\s+/g, "-");
  const providerToCreate: Provider = { ...provider, id } as Provider;
  
  // Validate the provider configuration
  const validatedProvider = ProviderSchema.parse(providerToCreate);
  
  // Check if provider with this ID already exists
  const existingProviders = await readProvidersFromFile();
  if (existingProviders.some(p => p.id === validatedProvider.id)) {
    throw new Error(`Provider with ID ${validatedProvider.id} already exists`);
  }
  
  // Add the new provider to the list
  const updatedProviders = [...existingProviders, validatedProvider];
  
  // Write the updated list back to the file
  await writeProvidersToFile(updatedProviders);
  
  return validatedProvider;
};

/**
 * Update an existing provider
 * @param id The ID of the provider to update
 * @param updates Partial provider configuration with updates
 * @returns Promise resolving to the updated provider or null if not found
 */
export const updateProvider = async (id: string, updates: Partial<Provider>): Promise<Provider | null> => {
  // Find and update the provider
  const existingProviders = await readProvidersFromFile();
  const providerIndex = existingProviders.findIndex(p => p.id === id);
  
  if (providerIndex === -1) {
    return null;
  }
  
  const updatedProviders = [...existingProviders];
  updatedProviders[providerIndex] = { ...updatedProviders[providerIndex], ...updates };
  
  // Validate the updated provider
  try {
    ProviderSchema.parse(updatedProviders[providerIndex]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Provider validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
  
  // Write the updated list back to the file
  await writeProvidersToFile(updatedProviders);
  
  return updatedProviders[providerIndex];
};

/**
 * Delete a provider by ID
 * @param id The ID of the provider to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export const deleteProvider = async (id: string): Promise<boolean> => {
  const existingProviders = await readProvidersFromFile();
  const filteredProviders = existingProviders.filter(provider => provider.id !== id);
  
  // If the length is the same, no provider was removed
  if (filteredProviders.length === existingProviders.length) {
    return false;
  }
  
  // Write the updated list back to the file
  await writeProvidersToFile(filteredProviders);
  
  return true;
};

/**
 * Verify if a provider exists by ID
 * @param id The ID of the provider to verify
 * @returns Promise resolving to true if the provider exists, false otherwise
 */
export const verifyProvider = async (id: string): Promise<boolean> => {
  const provider = await getProviderById(id);
  return provider !== undefined;
};

/**
 * Function to get a provider by its ID
 * @param id The unique identifier of the provider
 * @returns Promise resolving to the provider or undefined if not found
 */
export const getProviderById = async (id: string): Promise<Provider | undefined> => {
  const providers = await readProvidersFromFile();
  return providers.find(provider => provider.id === id);
};

/**
 * Function to get all providers
 * @returns Promise resolving to an array of all providers
 */
export const getAllProviders = async (): Promise<Provider[]> => {
  return await readProvidersFromFile();
};

/**
 * Enable or disable a provider
 * @param id The ID of the provider to update
 * @param enabled Whether the provider should be enabled
 * @returns Promise resolving to the updated provider or null if not found
 */
export const setProviderEnabled = async (id: string, enabled: boolean): Promise<Provider | null> => {
  return await updateProvider(id, { enabled });
};

/**
 * Function to validate a provider configuration
 * @param provider The provider configuration to validate
 * @returns True if valid, throws error if invalid
 */
export const validateProvider = (provider: unknown): provider is Provider => {
  try {
    ProviderSchema.parse(provider);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Provider validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

/**
 * Function to check if a provider ID is valid
 * @param id The provider ID to validate
 * @returns True if valid, false otherwise
 */
export const isValidProviderId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

// Backward compatibility: synchronous function to get all providers
// This is needed for existing code that uses synchronous operations
export function getProviders(): Provider[] {
  try {
    const providersData = readFileSync('data/config/providers.json', 'utf-8');
    return JSON.parse(providersData);
  } catch (error) {
    console.error('Error reading providers config:', error);
    return [];
  }
}

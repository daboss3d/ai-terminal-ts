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
 * Get all providers from the backend API
 * @returns Promise resolving to an array of Provider
 */
export const getAllProviders = async (): Promise<Provider[]> => {
  try {
    const response = await fetch('/api/providers');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Provider[];
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
};

/**
 * Get a specific provider by ID from the backend API
 * @param id The unique identifier of the provider
 * @returns Promise resolving to the provider or undefined if not found
 */
export const getProviderById = async (id: string): Promise<Provider | undefined> => {
  try {
    const response = await fetch(`/api/providers/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Provider;
  } catch (error) {
    console.error('Error fetching provider:', error);
    throw error;
  }
};

/**
 * Create a new provider via the backend API
 * @param provider The provider configuration to create
 * @returns Promise resolving to the created provider
 */
export const createProvider = async (provider: Omit<Provider, "id"> & { id?: string }): Promise<Provider> => {
  // Generate ID if not provided
  const id = provider.id || provider.name.toLowerCase().replace(/\s+/g, "-");
  const providerToCreate: Provider = { ...provider, id } as Provider;
  
  // Validate the provider configuration
  const validatedProvider = ProviderSchema.parse(providerToCreate);
  
  try {
    const response = await fetch('/api/providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedProvider),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.provider as Provider;
  } catch (error) {
    console.error('Error creating provider:', error);
    throw error;
  }
};

/**
 * Update an existing provider via the backend API
 * @param id The ID of the provider to update
 * @param updates Partial provider configuration with updates
 * @returns Promise resolving to the updated provider or null if not found
 */
export const updateProvider = async (id: string, updates: Partial<Provider>): Promise<Provider | null> => {
  try {
    const response = await fetch(`/api/providers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.provider as Provider;
  } catch (error) {
    console.error('Error updating provider:', error);
    throw error;
  }
};

/**
 * Delete a provider by ID via the backend API
 * @param id The ID of the provider to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export const deleteProvider = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/providers/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return false;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    await response.json(); // Consume the response
    return true;
  } catch (error) {
    console.error('Error deleting provider:', error);
    throw error;
  }
};

/**
 * Toggle the enabled status of a provider
 * @param id The ID of the provider to toggle
 * @param enabled Whether the provider should be enabled
 * @returns Promise resolving to the updated provider or null if not found
 */
export const toggleProvider = async (id: string, enabled: boolean): Promise<Provider | null> => {
  try {
    const response = await fetch(`/api/providers/${id}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled }),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.provider as Provider;
  } catch (error) {
    console.error('Error toggling provider:', error);
    throw error;
  }
};

/**
 * Verify if a provider exists by ID
 * @param id The ID of the provider to verify
 * @returns Promise resolving to true if the provider exists, false otherwise
 */
export const verifyProvider = async (id: string): Promise<boolean> => {
  try {
    const provider = await getProviderById(id);
    return provider !== undefined;
  } catch (error) {
    console.error('Error verifying provider:', error);
    return false;
  }
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
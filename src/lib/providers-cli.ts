import enquirer from "enquirer";
import chalk from "chalk";
import boxen from "boxen";
import { 
  getProviders, 
  getProviderById, 
  addProvider, 
  updateProvider, 
  deleteProvider, 
  setProviderEnabled 
} from "./providers";

// Providers functionality
export async function listProviders(): Promise<void> {
  while (true) {
    const providers = getProviders();
    
    if (providers.length === 0) {
      console.log(boxen(chalk.yellow("No providers configured"), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'yellow',
        backgroundColor: '#000'
      }));
    } else {
      const providersList = providers.map(provider => {
        const status = provider.enabled ? chalk.green("✓") : chalk.red("✗");
        const baseUrl = provider.baseUrl ? ` (${provider.baseUrl})` : "";
        return `${status} ${provider.name} (${provider.model})${baseUrl}`;
      }).join("\n");
      
      console.log(boxen(chalk.cyan(`Available Providers:\n\n${providersList}`), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: '#000'
      }));
    }
    
    // Ask if user wants to manage providers
    const action = await enquirer.select({
      message: "Manage providers?",
      choices: [
        { name: "add", message: "Add new provider" },
        { name: "edit", message: "Edit provider" },
        { name: "delete", message: "Delete provider" },
        { name: "enable", message: "Enable/disable provider" },
        { name: "back", message: "Back to main prompt" }
      ]
    }).catch(() => "back");
    
    if (action === "back") {
      console.log(""); // Add spacing
      return;
    }
    
    switch (action) {
      case "add":
        await addNewProvider();
        break;
      case "edit":
        await editProvider();
        break;
      case "delete":
        await deleteExistingProvider();
        break;
      case "enable":
        await toggleProvider();
        break;
    }
    
    // Add a newline for spacing
    console.log("");
  }
}

async function addNewProvider(): Promise<void> {
  const providerTypes = [
    { name: "openai", message: "OpenAI" },
    { name: "anthropic", message: "Anthropic" },
    { name: "ollama", message: "Ollama" },
    { name: "custom", message: "Custom Provider" }
  ];
  
  const type = await enquirer.select({
    message: "Select provider type",
    choices: providerTypes
  });
  
  const name = await enquirer.input({
    message: "Provider name",
    validate: (value) => value.length > 0 ? true : "Name is required"
  });
  
  const model = await enquirer.input({
    message: "Model name",
    validate: (value) => value.length > 0 ? true : "Model is required"
  });
  
  const apiKey = await enquirer.password({
    message: "API Key (leave empty if not required)"
  });
  
  const baseUrl = await enquirer.input({
    message: "Base URL (leave empty if using default)",
    validate: (value) => {
      if (!value) return true; // Optional for some providers
      try {
        new URL(value);
        return true;
      } catch {
        return "Invalid URL";
      }
    }
  });
  
  try {
    const newProvider = addProvider({
      name,
      model,
      apiKey,
      baseUrl: baseUrl || undefined,
      enabled: false
    });
    
    console.log(boxen(chalk.green(`Provider "${newProvider.name}" added successfully!`), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
      backgroundColor: '#000'
    }));
  } catch (error) {
    console.log(boxen(chalk.red(`Error adding provider: ${error.message}`), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#000'
    }));
  }
}

async function editProvider(): Promise<void> {
  const providers = getProviders();
  
  if (providers.length === 0) {
    console.log(boxen(chalk.yellow("No providers to edit"), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow',
      backgroundColor: '#000'
    }));
    return;
  }
  
  const providerChoices = providers.map(provider => ({
    name: provider.id,
    message: `${provider.name} (${provider.model})`
  }));
  
  const providerId = await enquirer.select({
    message: "Select provider to edit",
    choices: providerChoices
  });
  
  const provider = getProviderById(providerId);
  if (!provider) {
    console.log(boxen(chalk.red("Provider not found"), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#000'
    }));
    return;
  }
  
  const name = await enquirer.input({
    message: "Provider name",
    initial: provider.name,
    validate: (value) => value.length > 0 ? true : "Name is required"
  });
  
  const model = await enquirer.input({
    message: "Model name",
    initial: provider.model,
    validate: (value) => value.length > 0 ? true : "Model is required"
  });
  
  const apiKey = await enquirer.password({
    message: "API Key (leave empty if not required)",
    initial: provider.apiKey
  });
  
  const baseUrl = await enquirer.input({
    message: "Base URL (leave empty if using default)",
    initial: provider.baseUrl || "",
    validate: (value) => {
      if (!value) return true; // Optional for some providers
      try {
        new URL(value);
        return true;
      } catch {
        return "Invalid URL";
      }
    }
  });
  
  try {
    const updatedProvider = updateProvider(providerId, {
      name,
      model,
      apiKey,
      baseUrl: baseUrl || undefined
    });
    
    if (updatedProvider) {
      console.log(boxen(chalk.green(`Provider "${updatedProvider.name}" updated successfully!`), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        backgroundColor: '#000'
      }));
    } else {
      console.log(boxen(chalk.red("Error updating provider"), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red',
        backgroundColor: '#000'
      }));
    }
  } catch (error) {
    console.log(boxen(chalk.red(`Error updating provider: ${error.message}`), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#000'
    }));
  }
}

async function deleteExistingProvider(): Promise<void> {
  const providers = getProviders();
  
  if (providers.length === 0) {
    console.log(boxen(chalk.yellow("No providers to delete"), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow',
      backgroundColor: '#000'
    }));
    return;
  }
  
  const providerChoices = providers.map(provider => ({
    name: provider.id,
    message: `${provider.name} (${provider.model})`
  }));
  
  const providerId = await enquirer.select({
    message: "Select provider to delete",
    choices: providerChoices
  });
  
  const provider = getProviderById(providerId);
  if (!provider) {
    console.log(boxen(chalk.red("Provider not found"), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#000'
    }));
    return;
  }
  
  const confirm = await enquirer.confirm({
    message: `Are you sure you want to delete "${provider.name}"?`
  });
  
  if (confirm) {
    const success = deleteProvider(providerId);
    if (success) {
      console.log(boxen(chalk.green(`Provider "${provider.name}" deleted successfully!`), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        backgroundColor: '#000'
      }));
    } else {
      console.log(boxen(chalk.red("Error deleting provider"), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red',
        backgroundColor: '#000'
      }));
    }
  }
}

async function toggleProvider(): Promise<void> {
  const providers = getProviders();
  
  if (providers.length === 0) {
    console.log(boxen(chalk.yellow("No providers to enable/disable"), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow',
      backgroundColor: '#000'
    }));
    return;
  }
  
  const providerChoices = providers.map(provider => ({
    name: provider.id,
    message: `${provider.enabled ? chalk.green("✓") : chalk.red("✗")} ${provider.name} (${provider.model})`
  }));
  
  const providerId = await enquirer.select({
    message: "Select provider to enable/disable",
    choices: providerChoices
  });
  
  const provider = getProviderById(providerId);
  if (!provider) {
    console.log(boxen(chalk.red("Provider not found"), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#000'
    }));
    return;
  }
  
  const newEnabledState = !provider.enabled;
  const updatedProvider = setProviderEnabled(providerId, newEnabledState);
  
  if (updatedProvider) {
    const status = newEnabledState ? "enabled" : "disabled";
    console.log(boxen(chalk.green(`Provider "${updatedProvider.name}" ${status} successfully!`), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
      backgroundColor: '#000'
    }));
  } else {
    console.log(boxen(chalk.red("Error updating provider"), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#000'
    }));
  }
}
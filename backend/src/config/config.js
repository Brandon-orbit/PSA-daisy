// Import the 'dotenv' library to load environment variables from a .env file
import 'dotenv/config';

/**
 * @description Configuration object for the application.
 * This object holds all the environment variables for the application.
 * It's structured to group related settings together.
 */
const config = {
  // Power BI related configuration
  powerBI: {
    clientId: process.env.CLIENT_ID, // The client ID for the Power BI application
    clientSecret: process.env.CLIENT_SECRET, // The client secret for the Power BI application
    tenantId: process.env.TENANT_ID, // The tenant ID for the Azure Active Directory
    workspaceId: process.env.WORKSPACE_ID, // The workspace ID for the Power BI workspace
    reportId: process.env.REPORT_ID, // The report ID for the Power BI report
  },
  // Azure Storage related configuration
  azureStorage: {
    accountName: process.env.STORAGE_ACCOUNT_NAME, // The name of the Azure Storage account
    accountKey: process.env.STORAGE_ACCOUNT_KEY, // The key for the Azure Storage account
    containerName: process.env.STORAGE_CONTAINER_NAME || 'powerbi-rag-data', // The name of the container in the storage account, with a default value
  },
  // Azure AI Search related configuration
  azureSearch: {
    serviceName: process.env.SEARCH_SERVICE_NAME, // The name of the Azure AI Search service
    adminKey: process.env.SEARCH_ADMIN_KEY, // The admin key for the Azure AI Search service
    indexName: process.env.SEARCH_INDEX_NAME || 'powerbi-rag-index', // The name of the index in the search service, with a default value
  },
  // Azure OpenAI related configuration
  azureOpenAI: {
    apiKey: process.env.AZURE_OPENAI_API_KEY, // The API key for the Azure OpenAI service
    baseUrl: "https://psacodesprint2025.azure-api.net/openai/deployments/gpt-4.1-nano", // The base URL for the OpenAI API
    apiVersion: "2025-01-01-preview", // The version of the OpenAI API
  }
};

// Export the configuration object to be used in other parts of the application
export default config;

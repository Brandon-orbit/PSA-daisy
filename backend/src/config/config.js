// The purpose of this file is to load environment variables from a .env file and export them for use throughout the application.
// Using a centralized configuration file makes it easier to manage and update settings without hardcoding them in multiple places.

import dotenv from 'dotenv';

// This line loads the environment variables from the .env file in the root of the backend directory.
dotenv.config();

// The config object holds all the environment variables that are used in the application.
// This makes it easy to access them from a single, consistent source.
const config = {
  // Power BI configuration details, used for authenticating and interacting with the Power BI API.
  powerbi: {
    clientId: process.env.CLIENT_ID, // The client ID of the Azure AD application.
    clientSecret: process.env.CLIENT_SECRET, // The client secret of the Azure AD application.
    tenantId: process.env.TENANT_ID, // The tenant ID of the Azure AD directory.
    workspaceId: process.env.WORKSPACE_ID, // The ID of the Power BI workspace.
    reportId: process.env.REPORT_ID, // The ID of the Power BI report.
  },
  // Azure Storage configuration details, used for storing and accessing data.
  azure: {
    storageAccountName: process.env.STORAGE_ACCOUNT_NAME, // The name of the Azure Storage account.
    storageAccountKey: process.env.STORAGE_ACCOUNT_KEY, // The access key for the Azure Storage account.
    storageContainerName: process.env.STORAGE_CONTAINER_NAME, // The name of the container within the storage account.
  },
  // Azure AI Search configuration details, used for indexing and querying data.
  search: {
    serviceName: process.env.SEARCH_SERVICE_NAME, // The name of the Azure AI Search service.
    adminKey: process.env.SEARCH_ADMIN_KEY, // The admin key for the search service.
    indexName: process.env.SEARCH_INDEX_NAME, // The name of the search index.
  },
  // Azure OpenAI configuration details, used for interacting with the OpenAI API.
  openai: {
    apiKey: process.env.AZURE_OPENAI_API_KEY, // The API key for the Azure OpenAI service.
  },
};

export default config;

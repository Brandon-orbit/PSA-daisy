# Backend Documentation

This document provides instructions on how to set up and run the backend service.

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
# Power BI Configuration
CLIENT_ID=<your-client-id>
CLIENT_SECRET=<your-client-secret>
TENANT_ID=<your-tenant-id>
WORKSPACE_ID=<your-workspace-id>
REPORT_ID=<your-report-id>

# Azure Storage Configuration
STORAGE_ACCOUNT_NAME=<your-storage-account-name>
STORAGE_ACCOUNT_KEY=<your-storage-account-key>
STORAGE_CONTAINER_NAME=powerbi-rag-data

# Azure AI Search Configuration
SEARCH_SERVICE_NAME=<your-search-service-name>
SEARCH_ADMIN_KEY=<your-search-admin-key>
SEARCH_INDEX_NAME=powerbi-rag-index

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=<your-openai-api-key>
```

## Dependencies

To install the necessary dependencies, run the following command in the `backend` directory:

```bash
npm install express
```

## Running the Application

To start the server, run the following command in the `backend` directory:

```bash
node index.js
```

The server will be available at `http://localhost:3000`.

## API Endpoints

### Execute DAX Query

* **URL:** `/api/powerbi/query`
* **Method:** `POST`
* **Body:**
  ```json
  {
    "datasetId": "<your-dataset-id>",
    "daxQuery": "<your-dax-query>"
  }
  ```

## Folder Structure

The final folder structure for the backend is as follows:

```
backend/
├── src/
│   ├── api/
│   │   ├── controller.js
│   │   └── routes.js
│   ├── config/
│   │   └── config.js
│   ├── services/
│   │   ├── azureSearch.js
│   │   ├── azureStorage.js
│   │   ├── openai.js
│   │   ├── pipeline.js
│   │   └── powerbi.js
│   └── utils/
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

// Import the necessary clients and classes from the Azure Search Documents library
import { SearchClient, SearchIndexClient, AzureKeyCredential } from '@azure/search-documents';
// Import the application configuration
import config from '../config/config.js';

/**
 * @class AzureSearchService
 * @description Manages interactions with the Azure AI Search service.
 * This class provides methods to create a search index and to upload
 * documents to the index, making them searchable.
 */
class AzureSearchService {
  constructor() {
    // The endpoint for the Azure AI Search service
    const endpoint = `https://${config.azureSearch.serviceName}.search.windows.net`;
    // The credential for authenticating with the service
    const credential = new AzureKeyCredential(config.azureSearch.adminKey);

    // Client for managing search indexes
    this.indexClient = new SearchIndexClient(endpoint, credential);
    // Client for interacting with a specific index
    this.searchClient = new SearchClient(endpoint, config.azureSearch.indexName, credential);
  }

  /**
   * @method createSearchIndex
   * @description Creates a new search index in the Azure AI Search service.
   * This method defines the schema for the index, including fields for vector search,
   * and then creates the index if it doesn't already exist.
   * @returns {Promise<boolean>} A boolean indicating if the index was created successfully.
   */
  async createSearchIndex() {
    // The definition of the search index
    const index = {
      name: config.azureSearch.indexName,
      fields: [
        { name: 'id', type: 'Edm.String', key: true, searchable: false },
        { name: 'content', type: 'Edm.String', searchable: true, analyzer: 'en.microsoft' },
        { name: 'title', type: 'Edm.String', searchable: true, filterable: true },
        { name: 'metadata', type: 'Edm.String', searchable: false },
        { name: 'vector', type: 'Collection(Edm.Single)', dimensions: 1536, vectorSearchProfile: 'vector-profile' },
      ],
      vectorSearch: {
        profiles: [{ name: 'vector-profile', algorithm: 'hnsw-algorithm' }],
        algorithms: [{ name: 'hnsw-algorithm', kind: 'hnsw' }],
      },
    };

    // Create the index, ignoring errors if it already exists
    await this.indexClient.createOrUpdateIndex(index);
    return true;
  }

  /**
   * @method indexPowerBIData
   * @description Indexes data from Power BI into the Azure AI Search index.
   * This method takes a dictionary of dataframes, converts them into documents
   * that match the index schema, and then uploads them to the search index.
   * @param {Object.<string, Array<object>>} dataframes - A dictionary where keys are query names and values are the data.
   * @returns {Promise<boolean>} A boolean indicating if the data was indexed successfully.
   */
  async indexPowerBIData(dataframes) {
    const documents = [];

    // Iterate over each dataframe and create a document for it
    for (const [queryName, df] of Object.entries(dataframes)) {
      const content = JSON.stringify(df); // Convert the dataframe to a string

      const doc = {
        '@search.action': 'upload',
        id: `powerbi_${queryName}_${Date.now()}`,
        content: content,
        title: `Power BI Data - ${queryName}`,
        metadata: JSON.stringify({
          source: 'PowerBI',
          query: queryName,
          timestamp: new Date().toISOString(),
          rowCount: df.length,
          columns: Object.keys(df[0] || {}), // Get column names from the first row
        }),
      };
      documents.push(doc);
    }

    // Upload the documents to the search index
    await this.searchClient.uploadDocuments(documents);
    return true;
  }
}

// Export the AzureSearchService class
export default AzureSearchService;

// Import the services that the pipeline will orchestrate
import PowerBIService from './powerbi.js';
import AzureStorageService from './azureStorage.js';
import AzureSearchService from './azureSearch.js';

/**
 * @class PipelineService
 * @description Orchestrates the entire data extraction and indexing pipeline.
 * This class coordinates the process of fetching data from Power BI,
 * processing it, storing it in Azure Blob Storage, and finally indexing it
 * in Azure AI Search.
 */
class PipelineService {
  constructor() {
    // Instantiate the services that the pipeline will use
    this.powerBIService = new PowerBIService();
    this.azureStorageService = new AzureStorageService();
    this.azureSearchService = new AzureSearchService();
  }

  /**
   * @method run
   * @description Executes the complete data pipeline.
   * This method takes a dataset ID and a set of DAX queries, then runs the
   * full sequence of operations to get the data into the search index.
   * @param {string} datasetId - The ID of the Power BI dataset to query.
   * @param {Object.<string, string>} daxQueries - A dictionary of DAX queries to execute.
   * @returns {Promise<object>} An object containing the results of the pipeline execution.
   */
  async run(datasetId, daxQueries) {
    console.log('Starting Power BI to RAG Pipeline...');
    const extractedData = {};
    const processedData = {};

    // First, create the search index if it doesn't exist
    await this.azureSearchService.createSearchIndex();

    // Iterate over each DAX query and process it
    for (const [queryName, daxQuery] of Object.entries(daxQueries)) {
      console.log(`   Executing query: ${queryName}`);
      // Execute the DAX query using the Power BI service
      const result = await this.powerBIService.executeDaxQuery(datasetId, daxQuery);

      if (result) {
        // Process the response to get a structured format
        const processed = this.azureStorageService.processPowerBiResponse(result);
        if (processed) {
          extractedData[queryName] = result;
          processedData[queryName] = processed;

          // Save the processed data to a Parquet file in Azure Blob Storage
          const blobName = `powerbi_data/${queryName}_${Date.now()}.parquet`;
          await this.azureStorageService.saveToParquet(processed, blobName);
          console.log(`   Saved ${queryName} to blob storage`);
        }
      }
    }

    // If there is processed data, index it in Azure AI Search
    if (Object.keys(processedData).length > 0) {
      console.log('Indexing data for RAG system...');
      const success = await this.azureSearchService.indexPowerBIData(processedData);
      if (success) {
        console.log('   Successfully indexed data in Azure AI Search');
      } else {
        console.log('   Failed to index data');
      }
    }

    // Return a summary of the pipeline's execution
    return {
      extractedData: extractedData,
      processedData: processedData,
      pipelineStatus: Object.keys(processedData).length > 0 ? 'completed' : 'failed',
    };
  }
}

// Export the PipelineService class
export default PipelineService;

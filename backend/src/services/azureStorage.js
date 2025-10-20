// Import necessary libraries from Azure Storage Blob and ParquetJS
import { BlobServiceClient } from '@azure/storage-blob';
import { ParquetWriter, ParquetSchema } from 'parquetjs';
import config from '../config/config.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * @class AzureStorageService
 * @description Handles data processing and storage in Azure Blob Storage.
 * This class includes methods to transform Power BI responses into a structured
 * format and upload them to Azure Blob Storage as Parquet files.
 */
class AzureStorageService {
  constructor() {
    // Initialize the BlobServiceClient with the storage account URL and credentials
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${config.azureStorage.accountName};AccountKey=${config.azureStorage.accountKey};EndpointSuffix=core.windows.net`
    );
    this.containerName = config.azureStorage.containerName;
  }

  /**
   * @method processPowerBiResponse
   * @description Converts a Power BI API response into a structured array of objects.
   * This method extracts the rows from the Power BI response and returns them in a format
   * that can be easily converted to a Parquet file.
   * @param {object} powerBiResponse - The response object from the Power BI API.
   * @returns {Array<object>|null} A structured array of data, or null if the response is invalid.
   */
  processPowerBiResponse(powerBiResponse) {
    // Check for a valid response structure
    if (!powerBiResponse || !powerBiResponse.results || !powerBiResponse.results[0]) {
      return null;
    }

    // Extract tables from the response, defaulting to an empty array
    const tables = powerBiResponse.results[0].tables || [];
    if (tables.length === 0) {
      return null;
    }

    // Extract rows from the first table, defaulting to an empty array
    const rows = tables[0].rows || [];
    return rows;
  }

  /**
   * @method saveToParquet
   * @description Saves a DataFrame to Azure Blob Storage as a Parquet file.
   * This method converts the data into a Parquet format using ParquetJS and then
   * uploads the resulting file to the specified container in Azure Blob Storage.
   * @param {Array<object>} data - The data to be saved.
   * @param {string} blobName - The name of the blob to create.
   * @returns {Promise<string>} A confirmation message with the blob name.
   */
  async saveToParquet(data, blobName) {
    if (!data || data.length === 0) {
      throw new Error('No data to save.');
    }

    // Define the schema based on the first data row.
    // This assumes all objects in the data array have the same structure.
    const schema = new ParquetSchema(
        Object.fromEntries(
            Object.keys(data[0]).map(key => [key, { type: 'UTF8' }])
        )
    );

    const tempFilePath = path.join(os.tmpdir(), `${blobName}.parquet`);

    // Create a new Parquet writer and write the data to the temporary file
    const writer = await ParquetWriter.openFile(schema, tempFilePath);
    for (const row of data) {
        await writer.appendRow(row);
    }
    await writer.close();

    // Read the Parquet data from the temporary file
    const parquetData = await fs.readFile(tempFilePath);

    // Get a client for the container and the blob
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the Parquet data to the blob, overwriting if it already exists
    await blockBlobClient.upload(parquetData, parquetData.length, {
      overwrite: true,
    });

    // Clean up the temporary file
    await fs.unlink(tempFilePath);

    // Return a success message
    return `Parquet data saved to blob: ${blobName}`;
  }
}

// Export the AzureStorageService class
export default AzureStorageService;

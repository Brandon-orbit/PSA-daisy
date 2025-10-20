// This file is the controller for the Power BI API.
// It handles the incoming HTTP requests and calls the appropriate service functions to process them.

import { getAccessToken, executeDaxQuery } from '../services/powerbi.js';
import config from '../config/config.js';

/**
 * Handles the DAX query request. It gets an access token, executes the query, and sends the results back to the client.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
async function handleDaxQuery(req, res) {
  // Extracting the dataset ID and DAX query from the request body.
  const { datasetId, daxQuery } = req.body;

  // Basic validation to ensure the required parameters are present.
  if (!datasetId || !daxQuery) {
    return res.status(400).json({ error: 'datasetId and daxQuery are required' });
  }

  try {
    // Step 1: Get an access token for the Power BI API.
    const accessToken = await getAccessToken();

    // Step 2: Execute the DAX query using the access token.
    const result = await executeDaxQuery(datasetId, daxQuery, accessToken);

    // Step 3: Send the query results back to the client with a 200 OK status.
    res.status(200).json(result);
  } catch (error) {
    // If any error occurs during the process, send a 500 Internal Server Error status with the error message.
    res.status(500).json({ error: error.message });
  }
}

// Exporting the handler function for use in the routes file.
export { handleDaxQuery };

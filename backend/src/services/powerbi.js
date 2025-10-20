// This file is responsible for all interactions with the Power BI REST API.
// It includes functions for authentication and for executing DAX queries against a dataset.

import fetch from 'node-fetch';
import config from '../config/config.js';

/**
 * Authenticates with Azure Active Directory to get an access token for the Power BI API.
 * This function uses the client credentials flow to obtain an access token.
 * @returns {Promise<string>} A promise that resolves to the access token.
 * @throws {Error} If the authentication fails.
 */
async function getAccessToken() {
  // The URL for the Azure AD token endpoint, constructed from the tenant ID.
  const tokenUrl = `https://login.microsoftonline.com/${config.powerbi.tenantId}/oauth2/v2.0/token`;

  // The parameters for the token request, sent in the request body.
  const params = new URLSearchParams();
  params.append('client_id', config.powerbi.clientId);
  params.append('client_secret', config.powerbi.clientSecret);
  params.append('scope', 'https://analysis.windows.net/powerbi/api/.default');
  params.append('grant_type', 'client_credentials');

  try {
    // Sending the POST request to the token endpoint.
    const response = await fetch(tokenUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Parsing the JSON response.
    const data = await response.json();

    // If the response contains an access token, return it. Otherwise, throw an error.
    if (data.access_token) {
      console.log('Successfully retrieved access token.');
      return data.access_token;
    } else {
      throw new Error('Failed to retrieve access token: ' + JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/**
 * A utility function to introduce a delay.
 * @param {number} ms - The number of milliseconds to wait.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a DAX query against a specified Power BI dataset with retry logic.
 * @param {string} datasetId - The ID of the Power BI dataset to query.
 * @param {string} daxQuery - The DAX query to execute.
 * @param {string} accessToken - The access token for the Power BI API.
 * @param {number} retries - The number of times to retry the request.
 * @returns {Promise<Object>} A promise that resolves to the query results.
 * @throws {Error} If the query execution fails after all retries.
 */
async function executeDaxQuery(datasetId, daxQuery, accessToken, retries = 3) {
  const queryUrl = `https://api.powerbi.com/v1.0/myorg/datasets/${datasetId}/executeQueries`;
  const requestBody = {
    queries: [{ query: daxQuery }],
  };

  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(queryUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Attempt ${i + 1} failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Successfully executed DAX query.');
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Error on attempt ${i + 1}:`, error.message);
      if (i < retries - 1) {
        console.log('Retrying in 2 seconds...');
        await delay(2000);
      }
    }
  }

  console.error('All retry attempts failed.');
  throw lastError;
}

// Exporting the functions for use in other modules.
export { getAccessToken, executeDaxQuery };

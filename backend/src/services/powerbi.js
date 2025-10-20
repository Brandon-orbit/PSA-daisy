// Import the node-fetch library for making HTTP requests
import fetch from 'node-fetch';
// Import the configuration settings for the Power BI service
import config from '../config/config.js';

/**
 * @class PowerBIService
 * @description Handles interactions with the Power BI API.
 * This class encapsulates methods for authenticating with the Power BI service
 * and executing DAX queries to extract data.
 */
class PowerBIService {
  constructor() {
    // Destructure the Power BI configuration for easier access
    this.clientId = config.powerBI.clientId;
    this.clientSecret = config.powerBI.clientSecret;
    this.tenantId = config.powerBI.tenantId;
    this.workspaceId = config.powerBI.workspaceId;
    this.accessToken = null; // To store the access token
  }

  /**
   * @method getAccessToken
   * @description Retrieves an access token from Azure Active Directory.
   * This method uses the client credentials flow to authenticate the application
   * and get an access token that can be used to call the Power BI API.
   * @returns {Promise<string>} The access token.
   */
  async getAccessToken() {
    // Construct the URL for the token endpoint
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

    // Create the body for the token request
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('scope', 'https://analysis.windows.net/powerbi/api/.default');

    // Make the POST request to the token endpoint
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    // Parse the JSON response and store the access token
    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  /**
   * @method executeDaxQuery
   * @description Executes a DAX query against a Power BI dataset.
   * This method first ensures that an access token is available, then sends the
   * DAX query to the Power BI API to be executed.
   * @param {string} datasetId - The ID of the dataset to query.
   * @param {string} daxQuery - The DAX query to execute.
   * @returns {Promise<object>} The result of the DAX query.
   */
  async executeDaxQuery(datasetId, daxQuery) {
    // If there's no access token, get one first
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    // Construct the URL for the executeQueries endpoint
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${this.workspaceId}/datasets/${datasetId}/executeQueries`;

    // Create the payload for the request
    const payload = {
      queries: [{ query: daxQuery }],
      serializerSettings: { includeNulls: true },
    };

    // Make the POST request to the Power BI API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // If the response is not ok, throw an error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to execute DAX query: ${errorData.error.message}`);
    }

    // Parse and return the JSON response
    return response.json();
  }
}

// Export the PowerBIService class to be used in other parts of the application
export default PowerBIService;

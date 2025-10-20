// Import the OpenAI library for interacting with the AI model
import OpenAI from 'openai';
// Import the application configuration
import config from '../config/config.js';

/**
 * @class OpenAIService
 * @description A wrapper for the OpenAI API.
 * This class provides a simplified interface for sending prompts to the
 * OpenAI chat completions API and receiving the generated responses.
 */
class OpenAIService {
  constructor() {
    // Create a new OpenAI client with the necessary API key and base URL
    this.client = new OpenAI({
      apiKey: config.azureOpenAI.apiKey,
      baseURL: config.azureOpenAI.baseUrl,
      defaultHeaders: {
        'api-key': config.azureOpenAI.apiKey, // Required for Azure
      },
      defaultQuery: {
        'api-version': config.azureOpenAI.apiVersion,
      },
    });
  }

  /**
   * @method getCompletion
   * @description Sends a prompt to the OpenAI chat completions API.
   * This method takes a text prompt, sends it to the specified AI model, and
   * returns the content of the first choice in the response.
   * @param {string} prompt - The text prompt to send to the AI.
   * @returns {Promise<string>} The response from the AI.
   */
  async getCompletion(prompt) {
    // Create a chat completion with the provided prompt
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Return the content of the first message choice
    return completion.choices[0].message.content;
  }
}

// Export the OpenAIService class
export default OpenAIService;

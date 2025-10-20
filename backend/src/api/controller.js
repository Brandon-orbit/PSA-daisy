// Import the PipelineService to run the data extraction and indexing process
import PipelineService from '../services/pipeline.js';
import OpenAIService from '../services/openai.js';

/**
 * @function runPipeline
 * @description Controller for the /extract-and-index route.
 * This function creates a new instance of the PipelineService and uses it to
 * run the data processing pipeline with the parameters from the request body.
 * @param {object} req - The request object from Express.
 * @param {object} res - The response object from Express.
 */
export const runPipeline = async (req, res) => {
  try {
    // Extract the dataset ID and DAX queries from the request body
    const { datasetId, daxQueries } = req.body;

    // Check for missing parameters and return an error if they are not provided
    if (!datasetId || !daxQueries) {
      return res.status(400).json({ error: 'Missing datasetId or daxQueries' });
    }

    // Create a new instance of the pipeline service and run it
    const pipeline = new PipelineService();
    const result = await pipeline.run(datasetId, daxQueries);

    // Send the result of the pipeline back as the response
    res.status(200).json(result);
  } catch (error) {
    // If an error occurs, log it and send a 500 server error response
    console.error('Error running pipeline:', error);
    res.status(500).json({ error: 'Failed to run pipeline', details: error.message });
  }
};

/**
 * @function healthCheck
 * @description Controller for the /health route.
 * This function returns a simple JSON object to indicate that the service is
 * running and healthy.
 * @param {object} req - The request object from Express.
 * @param {object} res - The response object from Express.
 */
export const healthCheck = (req, res) => {
  // Respond with a status of 'healthy'
  res.status(200).json({ status: 'healthy', service: 'Power BI RAG Extraction API' });
};

/**
 * @function askAI
 * @description Controller for the /ask-ai route.
 * @param {object} req - The request object from Express.
 * @param {object} res - The response object from Express.
 */
export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const openai = new OpenAIService();
    const result = await openai.getCompletion(prompt);

    res.status(200).json({ response: result });
  } catch (error) {
    console.error('Error asking AI:', error);
    res.status(500).json({ error: 'Failed to ask AI', details: error.message });
  }
};

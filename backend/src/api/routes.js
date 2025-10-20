// Import the Router object from the Express library
import { Router } from 'express';
// Import the controller that contains the logic for handling requests
import * as controller from './controller.js';

// Create a new Router instance
const router = Router();

/**
 * @route POST /extract-and-index
 * @description Triggers the data extraction and indexing pipeline.
 * This route accepts a POST request with the dataset ID and DAX queries in the body,
 * then initiates the pipeline to process the data.
 * @access Public
 */
router.post('/extract-and-index', controller.runPipeline);

/**
 * @route GET /health
 * @description Performs a health check on the API.
 * This route can be used to verify that the service is running and responsive.
 * @access Public
 */
router.get('/health', controller.healthCheck);

/**
 * @route POST /ask-ai
 * @description Sends a prompt to the AI model.
 * @access Public
 */
router.post('/ask-ai', controller.askAI);

// Export the router to be used in the main server file
export default router;

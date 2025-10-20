// This file defines the API routes for the application.
// It maps the HTTP endpoints to the corresponding controller functions.

import express from 'express';
import { handleDaxQuery } from './controller.js';

// Creating a new router object to handle the routes.
const router = express.Router();

// Defining the POST route for executing a DAX query.
// When a POST request is made to /api/powerbi/query, the handleDaxQuery function will be called.
router.post('/powerbi/query', handleDaxQuery);

// Exporting the router for use in the main server file.
export default router;

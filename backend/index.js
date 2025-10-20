// This is the main entry point for the backend application.
// It sets up the Express server, configures middleware, and connects the API routes.

import express from 'express';
import apiRoutes from './src/api/routes.js';

// Creating a new Express application.
const app = express();

// Defining the port the server will listen on. It will use the PORT environment variable if available, otherwise it will default to 3000.
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests. This is needed to read the body of POST requests.
app.use(express.json());

// Mounting the API routes under the /api path.
// All routes defined in routes.js will be prefixed with /api.
app.use('/api', apiRoutes);

// Starting the server and listening for incoming connections on the specified port.
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

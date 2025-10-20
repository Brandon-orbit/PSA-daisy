// Import the Express library to create and manage the server
import express from 'express';
// Import the API routes for the application
import apiRoutes from './src/api/routes.js';

// Create an instance of an Express application
const app = express();
// Define the port the server will listen on, defaulting to 3000
const port = process.env.PORT || 3000;

// Use Express's built-in middleware to parse JSON bodies of incoming requests
app.use(express.json());

// Mount the API routes at the /api/v1 path
app.use('/api/v1', apiRoutes);

// Define a simple route for the root of the application
app.get('/', (req, res) => {
  res.send('Welcome to the Power BI RAG Data Extraction API');
});

// Start the server and have it listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

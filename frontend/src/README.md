# Frontend Documentation

This document provides a comprehensive overview of the frontend architecture, setup instructions, and key components.

## Overview

The frontend is a Next.js application responsible for providing a user-friendly chat interface for the RAG agent. It communicates with the backend via a dedicated API service, handles streaming responses, and offers a clean, responsive UI.

## Folder Structure

The frontend is organized into the following directories:

-   **/app**: Contains the core application logic, including routing and API definitions.
    -   **/api/chat**: The API route that proxies requests to the backend.
-   **/components**: Reusable UI components.
    -   **Chat.tsx**: The main chat interface component.
-   **/services**: Handles communication with external APIs.
    -   **chatService.ts**: The service responsible for making requests to the backend.
-   **/public**: Static assets, such as images and fonts.

## Getting Started

To run the frontend locally, follow these steps:

1.  **Install Dependencies**:
    Navigate to the `frontend` directory and install the required packages.
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in the `frontend` directory and add the following:
    ```
    BACKEND_URL=http://localhost:3001/api/chat
    ```
    Replace the URL with your actual backend endpoint if it differs.

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Architecture

The frontend follows a modular architecture that separates concerns and promotes code reusability.

-   **API Abstraction**: The `chatService.ts` module abstracts all backend communication, making it easy to manage API calls from a single location.
-   **Component-Based UI**: The UI is built with React components, with `Chat.tsx` serving as the primary interface. This component manages state, handles user input, and displays messages.
-   **Streaming Responses**: The application is designed to handle streaming responses from the backend, allowing for real-time updates to the chat interface as the RAG agent processes information.

This structure ensures that the frontend is maintainable, scalable, and easy to debug.

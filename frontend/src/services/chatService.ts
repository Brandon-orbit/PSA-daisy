// frontend/src/services/chatService.ts

/**
 * @file This file defines the chat service, which is responsible for handling
 * all communication with the backend chat API. It abstracts the API calls,
 * making it easier to manage and reuse the logic across the application.
 */

/**
 * Sends a message to the backend and returns the streaming response.
 *
 * @param message The message to send to the backend.
 * @returns A ReadableStream of the response from the backend.
 * @throws An error if the request fails.
 */
export const sendMessage = async (message: string) => {
  try {
    // Send a POST request to the backend API with the user's message.
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    // If the response is not ok (e.g., status code 4xx or 5xx),
    // throw an error to be handled by the calling function.
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    // Return the response body as a ReadableStream for real-time data processing.
    return response.body;
  } catch (error) {
    // Log the error for debugging purposes and re-throw it to be handled by the UI.
    console.error("Error sending message:", error);
    throw error;
  }
};

// frontend/src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // The backend URL is stored in an environment variable for security and flexibility.
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      // If the backend URL is not configured, return an error.
      return new NextResponse("Backend URL is not configured.", {
        status: 500,
      });
    }

    // Forward the request to the backend.
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    // If the backend response is not OK, forward the error.
    if (!response.ok) {
      return new NextResponse(response.statusText, { status: response.status });
    }

    // Ensure the response body is a ReadableStream.
    if (!response.body) {
      return new NextResponse("No response body from backend.", {
        status: 500,
      });
    }

    // Create a new ReadableStream to pipe the backend response to the client.
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          controller.enqueue(new TextEncoder().encode(chunk));
        }
      },
    });

    // Return the stream as the response.
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in chat API route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

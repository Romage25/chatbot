import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => {
      return null;
    });

    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json(
        {
          error: "Invalid request body. Expected { messages: [] }",
        },
        { status: 400 }
      );
    }

    const { messages } = body;

    if (messages.length === 0) {
      return NextResponse.json(
        {
          error: "Messages array cannot be empty",
        },
        { status: 400 }
      );
    }

    const formattedMessages = messages.map((msg: any, index: number) => {
      if (!msg?.role || !msg?.content) {
        throw new Error(`Invalid message at index ${index}`);
      }

      return {
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: String(msg.content) }],
      };
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    let result;

    try {
      result = await model.generateContent({
        contents: formattedMessages,
      });
    } catch (err: any) {
      console.error("Gemini API Error:", {
        message: err?.message,
        stack: err?.stack,
        response: err?.response?.data,
      });

      return NextResponse.json(
        {
          error: "Failed to generate AI response",
          details: err?.message || "Unknown Gemini error",
        },
        { status: 502 }
      );
    }

    const responseText = result?.response?.text?.();

    if (!responseText) {
      return NextResponse.json(
        {
          error: "Empty response from AI model",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      response: responseText,
    });
  } catch (error: any) {
    console.error("Unexpected API Error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
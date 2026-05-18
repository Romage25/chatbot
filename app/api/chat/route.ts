import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// 🔥 Fallback model chain (best → cheapest)
const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

// retry helper
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tryModel(modelName: string, contents: any[], retries = 2) {
  const model = genAI.getGenerativeModel({ model: modelName });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent({
        contents,
      });

      const text = result?.response?.text?.();
      if (!text) throw new Error("Empty response");

      return text;
    } catch (err: any) {
      const status = err?.status || err?.code;

      console.error(`[${modelName}] attempt ${attempt + 1} failed`, {
        message: err?.message,
        status,
      });

      // ❌ Don't retry on bad request (permanent error)
      if (status === 400) throw err;

      // retry on rate limit / server errors
      const retryable = [429, 500, 502, 503, "ECONNRESET"];

      if (!retryable.includes(status) && !retryable.includes(err?.code)) {
        throw err;
      }

      // wait before retry
      await sleep(800 * (attempt + 1));
    }
  }

  throw new Error(`Model ${modelName} failed after retries`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected { messages: [] }" },
        { status: 400 }
      );
    }

    const { messages } = body;

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array cannot be empty" },
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

    let lastError: any;

    // 🔥 MODEL SWITCHING LOGIC
    for (const modelName of MODELS) {
      try {
        const text = await tryModel(modelName, formattedMessages, 2);

        return NextResponse.json({
          response: text,
          model: modelName,
        });
      } catch (err) {
        lastError = err;
        console.warn(`Switching model from ${modelName}...`);
      }
    }

    return NextResponse.json(
      {
        error: "All models failed",
        details: lastError?.message,
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Unexpected API Error:", error);

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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { messages } = body;

    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [
        {
          text: msg.content,
        },
      ],
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent({
      contents: formattedMessages,
    });

    const response =
      result.response.text();

    return NextResponse.json({
      response,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await res.json();

      // Handle failed responses
      if (!res.ok) {
        let errorMessage = "Something went wrong while generating a response.";

        console.log(res.status);

        // custom friendly messages
        switch (res.status) {
          case 400:
            errorMessage = "Your request could not be processed.";
            break;

          case 429:
            errorMessage =
              "Too many requests right now. Please wait a moment and try again.";
            break;

          case 503:
            errorMessage =
              "All AI models are currently busy. Please try again shortly.";
            break;

          case 500:
            errorMessage = "Server error occurred. Please try again later.";
            break;
        }

        // use backend message if available
        if (data?.details) {
          errorMessage = data.details;
        }

        throw new Error(errorMessage);
      }

      const aiMessage: Message = {
        role: "ai",
        content: data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            error?.message || "Unable to connect right now. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-semibold">Romage Chatbot</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-zinc-500 mt-20">
              Start a conversation...
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap shadow-md ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : msg.content.toLowerCase().includes("error") ||
                        msg.content.toLowerCase().includes("try again") ||
                        msg.content.toLowerCase().includes("unable")
                      ? "bg-red-900/40 border border-red-500/40 text-red-100"
                      : "bg-zinc-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ..."
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-zinc-900 border border-zinc-700 p-4 outline-none focus:border-blue-500"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition px-6 rounded-2xl font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

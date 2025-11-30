"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, RotateCcw, Sparkles, BookMarked } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  sessionId?: string;
  model?: string;
}

export function Chatbot({
  sessionId = "default",
  model = "gemma2:2b",
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollmaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama availability on mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkOllamaStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/health");
      const data = await res.json();
      setOllamaAvailable(data.ollama_available);
    } catch {
      setOllamaAvailable(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          sessionId,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      if (data.status === "success") {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${
          error instanceof Error ? error.message : "Failed to get response"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Clear conversation history?")) {
      try {
        await fetch("/api/conversation/reset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });
        setMessages([]);
      } catch (error) {
        console.error("Failed to reset conversation:", error);
      }
    }
  };

  const handleGenerateNotes = async () => {
    const topic = prompt("What topic should the notes be about?");
    if (!topic?.trim()) return;

    const countStr = prompt("How many notes to generate? (default: 5)", "5");
    const count = parseInt(countStr || "5", 10);

    if (count < 1 || count > 20) {
      alert("Please enter a number between 1 and 20");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/notes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, count }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate notes");
      }

      const data = await response.json();

      if (data.status === "success") {
        const notesMessage: Message = {
          role: "assistant",
          content: `✓ Generated ${
            data.notes.length
          } notes on "${topic}"\n\nNotes:\n${data.notes
            .map(
              (n: any, i: number) =>
                `${i + 1}. ${n.id} (tags: ${n.tags.join(", ")})`
            )
            .join("\n")}\n\nSaved to: ${data.filename}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, notesMessage]);
      } else {
        throw new Error(data.message || "Failed to generate notes");
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${
          error instanceof Error ? error.message : "Failed to generate notes"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-bold">PadhAI Chatbot</h2>
          </div>
          <div className="flex items-center gap-2">
            {ollmaAvailable !== null && (
              <Badge variant={ollmaAvailable ? "default" : "destructive"}>
                {ollmaAvailable ? "✓ Ollama Connected" : "✗ Offline"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start a conversation</p>
              <p className="text-sm opacity-75">
                Ask me anything about learning!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-xs lg:max-w-md px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                  : "bg-slate-700 text-slate-100 rounded-2xl rounded-tl-none"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card className="bg-slate-700 text-slate-100 rounded-2xl rounded-tl-none px-4 py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-800 p-4 border-t border-slate-700 space-y-2">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading || !ollmaAvailable}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim() || !ollmaAvailable}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            onClick={handleGenerateNotes}
            disabled={loading || !ollmaAvailable}
            className="bg-purple-600 hover:bg-purple-700"
            title="Generate AI-powered notes"
          >
            <BookMarked className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading || messages.length === 0}
            className="border-slate-600"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </form>

        {!ollmaAvailable && (
          <p className="text-sm text-red-400">
            ⚠ Backend not available. Make sure the backend server is running.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getOrCreateUserId(): string {
  const key = "fitcoach_user_id";
  if (typeof window === "undefined") return "ssr-placeholder";
  let id = localStorage.getItem(key);
  if (!id) {
    id = "web-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(key, id);
  }
  return id;
}

let msgCounter = 0;
function createId(): string {
  return `msg-${Date.now()}-${++msgCounter}`;
}

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const QUICK_PROMPTS = [
  "I want to lose 5kg in 2 months",
  "Build me a muscle gain plan",
  "What should I eat after a workout?",
  "Show my progress history",
];

function sanitizeHtml(html: string): string {
  const allowed = ["strong", "em", "ul", "li", "br", "br /"];
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    const lower = tag.toLowerCase();
    if (allowed.includes(lower)) return match;
    return "";
  });
}

function renderMarkdown(text: string): string {
  let safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  safe = safe
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^• (.+)$/gm, "<li>$1</li>")
    .replace(/\n/g, "<br />");

  safe = safe.replace(/(<li>.*?<\/li>(?:<br \/>)?)+/g, (match) => {
    const cleaned = match.replace(/<br \/>/g, "");
    return `<ul>${cleaned}</ul>`;
  });

  return sanitizeHtml(safe);
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: createId(),
      role: "assistant",
      text:
        "Hi, I'm your personal fitness coach.\n\n" +
        "Tell me your goal and I'll build a plan around you — whether that's losing weight, building muscle, improving endurance, or just staying consistent.\n\n" +
        "What would you like to work on?",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userId = useRef(getOrCreateUserId());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = { id: createId(), role: "user", text, time: formatTime() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId.current, message: text }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error((errData as { error?: string })?.error || `Server error (${res.status})`);
        }

        const data = (await res.json()) as { reply?: string; error?: string };
        const replyText = data.reply ?? data.error ?? "Something went wrong. Please try again.";
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: "assistant", text: replyText, time: formatTime() },
        ]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Could not reach the server.";
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: "assistant", text: errorMsg, time: formatTime() },
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [loading],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex flex-col h-full gap-5">
      <div
        className="flex-1 overflow-y-auto chat-scroll space-y-6 pr-1"
        style={{ minHeight: 0, maxHeight: "calc(100vh - 210px)" }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-600 mb-1 px-1">
              {msg.role === "user" ? "You" : "Coach"}
            </span>

            <div
              className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed msg-content ${
                msg.role === "user"
                  ? "bg-white text-black rounded-2xl rounded-tr-sm"
                  : "bg-neutral-900 text-neutral-100 border border-neutral-800 rounded-2xl rounded-tl-sm"
              }`}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
            />

            <span className="text-[10px] text-neutral-600 mt-1 px-1 select-none">
              {msg.time}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-600 mb-1 px-1">
              Coach
            </span>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <span className="flex gap-1.5 items-center h-4">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="text-xs border border-neutral-700 text-neutral-400 hover:border-white hover:text-white px-3 py-1.5 rounded-full transition-colors duration-150"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-neutral-800" />

      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your coach..."
          disabled={loading}
          className="flex-1 bg-transparent border-b border-neutral-700 focus:border-white text-white placeholder-neutral-600 py-2 text-sm outline-none transition-colors duration-200 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="text-xs font-semibold tracking-widest uppercase text-black bg-white hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors duration-150"
        >
          Send
        </button>
      </form>
    </div>
  );
}

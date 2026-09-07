"use client";

import { useEffect, useRef, useState } from "react";
import type { TeachingAgent } from "@/content/agents";
import type { LearnerProfile } from "@/content/types";
import type { ChatMessage } from "@/lib/gateway";

export interface TeachContext {
  sessionId: string;
  lessonId: string;
  beatId: string;
  profile: LearnerProfile;
}

interface Props {
  agent: TeachingAgent;
  context: TeachContext;
  /** The agent speaks first (explain, check). Otherwise the learner opens (do, apply). */
  autoStart: boolean;
  placeholder: string;
  messages: ChatMessage[];
  onChange: (messages: ChatMessage[]) => void;
}

export default function AgentChat({ agent, context, autoStart, placeholder, messages, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const started = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  async function run(history: ChatMessage[]) {
    setStreaming("");
    let text = "";
    try {
      const res = await fetch("/api/teach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...context, messages: history }),
      });
      if (!res.ok || !res.body) throw new Error(`teach failed: ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setStreaming(text);
      }
    } catch {
      text = text || "The teaching team is unavailable right now. Please try again in a moment.";
    }
    onChange([...history, { role: "assistant", content: text }]);
    setStreaming(null);
  }

  useEffect(() => {
    if (autoStart && messages.length === 0 && !started.current) {
      started.current = true;
      void run([]);
    }
    // Runs once per beat; the component is keyed by beat id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages, streaming]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || streaming !== null) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    onChange(next);
    setDraft("");
    void run(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <Bubble key={i} who={m.role === "user" ? "You" : agent.name} mine={m.role === "user"} text={m.content} />
        ))}
        {streaming !== null && <Bubble who={agent.name} mine={false} text={streaming || "…"} />}
        <div ref={bottom} />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={streaming !== null || !draft.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Send to {agent.name}
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ who, mine, text }: { who: string; mine: boolean; text: string }) {
  return (
    <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${mine ? "self-end bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "self-start bg-zinc-100 dark:bg-zinc-800"}`}>
      <div className="mb-1 text-xs font-semibold opacity-70">{who}</div>
      <div className="whitespace-pre-wrap">{text}</div>
    </div>
  );
}

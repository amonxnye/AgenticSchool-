import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ModelSettings } from "./settings";

/**
 * Thin model gateway. The platform talks to `streamChat`; providers are
 * swappable behind it so the school never depends on one model vendor.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  system: string;
  messages: ChatMessage[];
}

export interface ModelProvider {
  name: string;
  model: string;
  stream(req: ChatRequest): AsyncIterable<string>;
}

/** RIPA platform: OpenAI-compatible chat completions. The model must be chosen explicitly. */
export function ripaProvider(cfg: ModelSettings["ripa"]): ModelProvider {
  return {
    name: "ripa",
    model: cfg.model,
    async *stream({ system, messages }) {
      if (!cfg.apiKey) throw new Error("RIPA API key is not set");
      if (!cfg.model) throw new Error("RIPA model is not set");
      // The SDK retries 5xx, which covers RIPA's 503 "model_warming" cold start.
      const client = new OpenAI({ baseURL: cfg.baseUrl, apiKey: cfg.apiKey, maxRetries: 3 });
      const stream = await client.chat.completions.create({
        model: cfg.model,
        stream: true,
        messages: [{ role: "system", content: system }, ...messages],
      });
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) yield text;
      }
    },
  };
}

export function anthropicProvider(cfg: ModelSettings["anthropic"]): ModelProvider {
  return {
    name: "anthropic",
    model: cfg.model,
    async *stream({ system, messages }) {
      const client = new Anthropic(cfg.apiKey ? { apiKey: cfg.apiKey } : {});
      const stream = client.beta.messages.stream({
        model: cfg.model,
        max_tokens: 4096,
        system,
        messages,
        // Teaching turns are short; medium effort keeps the class responsive.
        output_config: { effort: "medium" },
        // If the model declines for policy reasons, retry on the server-defined fallback.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal") {
        yield "I can't help with that one here. Let's get back to the lesson.";
      }
    },
  };
}

/** Runs the class without any model vendor, so the platform can be exercised without a key. */
export const mockProvider: ModelProvider = {
  name: "mock",
  model: "mock",
  async *stream({ messages }) {
    const last = messages[messages.length - 1]?.content ?? "";
    const reply = `(mock provider) I received: "${last.slice(0, 80)}". Choose a real provider in the admin settings to teach with a model.`;
    for (const word of reply.split(" ")) {
      yield word + " ";
    }
  },
};

export function providerFor(settings: ModelSettings): ModelProvider {
  switch (settings.provider) {
    case "mock":
      return mockProvider;
    case "anthropic":
      return anthropicProvider(settings.anthropic);
    case "ripa":
      return ripaProvider(settings.ripa);
  }
}

export function streamChat(req: ChatRequest, provider: ModelProvider): AsyncIterable<string> {
  return provider.stream(req);
}

/** One short round trip, used by the admin's "Test connection" button. */
export async function testProvider(provider: ModelProvider): Promise<{ ms: number; sample: string }> {
  const started = Date.now();
  let sample = "";
  for await (const chunk of provider.stream({
    system: "Reply with the single word OK.",
    messages: [{ role: "user", content: "ping" }],
  })) {
    sample += chunk;
    if (sample.length > 200) break;
  }
  return { ms: Date.now() - started, sample: sample.trim() };
}

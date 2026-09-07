import Anthropic from "@anthropic-ai/sdk";

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
  stream(req: ChatRequest): AsyncIterable<string>;
}

export const anthropicProvider: ModelProvider = {
  async *stream({ system, messages }) {
    const client = new Anthropic();
    const stream = client.beta.messages.stream({
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5",
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

/** Used when no model provider is configured, so the class can run without a key. */
export const mockProvider: ModelProvider = {
  async *stream({ messages }) {
    const last = messages[messages.length - 1]?.content ?? "";
    const reply = `(mock provider) I received: "${last.slice(0, 80)}". Set MODEL_PROVIDER=anthropic and an API key to teach with a real model.`;
    for (const word of reply.split(" ")) {
      yield word + " ";
    }
  },
};

export function selectProvider(name = process.env.MODEL_PROVIDER): ModelProvider {
  return name === "mock" ? mockProvider : anthropicProvider;
}

export function streamChat(req: ChatRequest, provider = selectProvider()): AsyncIterable<string> {
  return provider.stream(req);
}

import { describe, expect, it } from "vitest";
import { parseTags, tagsUrl } from "./ripa";

describe("ripa", () => {
  it("derives the tags endpoint from the /v1 base URL", () => {
    expect(tagsUrl("https://api.ripaplatform.com/v1")).toBe("https://api.ripaplatform.com/api/tags");
    expect(tagsUrl("https://svc.ripaplatform.com/v1/")).toBe("https://svc.ripaplatform.com/api/tags");
  });

  it("extracts model names from an Ollama tags response", () => {
    expect(parseTags({ models: [{ name: "llama3.2:3b" }, { name: "qwen2.5:7b" }, {}] })).toEqual([
      "llama3.2:3b",
      "qwen2.5:7b",
    ]);
    expect(parseTags({})).toEqual([]);
    expect(parseTags(null)).toEqual([]);
  });
});

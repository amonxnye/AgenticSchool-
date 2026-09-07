/** Helpers for the RIPA platform gateway (OpenAI-compatible API over Ollama). */

/** `/api/tags` lives at the gateway origin, not under `/v1`. */
export function tagsUrl(baseUrl: string): string {
  return `${new URL(baseUrl).origin}/api/tags`;
}

export function parseTags(json: unknown): string[] {
  const models = (json as { models?: { name?: string }[] })?.models ?? [];
  return models.map((m) => m.name).filter((n): n is string => typeof n === "string");
}

export async function listRipaModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const res = await fetch(tagsUrl(baseUrl), { headers: { authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(`RIPA /api/tags returned ${res.status}`);
  return parseTags(await res.json());
}

import { decrypt, encrypt } from "./crypto";
import { firestore } from "./firebase/admin";

export type ProviderName = "ripa" | "anthropic" | "mock";

export interface ModelSettings {
  provider: ProviderName;
  ripa: { baseUrl: string; model: string; apiKey: string };
  anthropic: { model: string; apiKey: string };
  updatedAt?: string;
  updatedBy?: string;
}

/** What the admin UI sees: keys are never sent to the browser. */
export interface RedactedSettings {
  provider: ProviderName;
  ripa: { baseUrl: string; model: string; hasKey: boolean; keyHint: string };
  anthropic: { model: string; hasKey: boolean; keyHint: string };
  updatedAt?: string;
  updatedBy?: string;
}

export interface SettingsInput {
  provider: ProviderName;
  ripa: { baseUrl: string; model: string; apiKey?: string };
  anthropic: { model: string; apiKey?: string };
}

/** Environment values are the fallback when nothing has been saved in the admin yet. */
export function defaultsFromEnv(env: Record<string, string | undefined> = process.env): ModelSettings {
  const provider = env.MODEL_PROVIDER;
  return {
    provider: provider === "anthropic" || provider === "mock" ? provider : "ripa",
    ripa: {
      baseUrl: env.RIPA_BASE_URL ?? "https://api.ripaplatform.com/v1",
      model: env.RIPA_MODEL ?? "",
      apiKey: env.RIPA_API_KEY ?? "",
    },
    anthropic: { model: env.ANTHROPIC_MODEL ?? "claude-opus-5", apiKey: env.ANTHROPIC_API_KEY ?? "" },
  };
}

interface StoredSettings {
  provider: ProviderName;
  ripa: { baseUrl: string; model: string; apiKeyEnc?: string };
  anthropic: { model: string; apiKeyEnc?: string };
  updatedAt?: string;
  updatedBy?: string;
}

const DOC = "settings/model";
const CACHE_MS = 30_000;
let cache: { at: number; value: ModelSettings } | undefined;

export async function getModelSettings(): Promise<ModelSettings> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  const defaults = defaultsFromEnv();
  const snap = await firestore().doc(DOC).get();
  const stored = snap.data() as StoredSettings | undefined;
  const value: ModelSettings = stored
    ? {
        provider: stored.provider,
        ripa: {
          baseUrl: stored.ripa.baseUrl || defaults.ripa.baseUrl,
          model: stored.ripa.model,
          apiKey: stored.ripa.apiKeyEnc ? decrypt(stored.ripa.apiKeyEnc) : defaults.ripa.apiKey,
        },
        anthropic: {
          model: stored.anthropic.model || defaults.anthropic.model,
          apiKey: stored.anthropic.apiKeyEnc ? decrypt(stored.anthropic.apiKeyEnc) : defaults.anthropic.apiKey,
        },
        updatedAt: stored.updatedAt,
        updatedBy: stored.updatedBy,
      }
    : defaults;
  cache = { at: Date.now(), value };
  return value;
}

export async function saveModelSettings(input: SettingsInput, updatedBy: string): Promise<void> {
  const ref = firestore().doc(DOC);
  const existing = (await ref.get()).data() as StoredSettings | undefined;
  const next: StoredSettings = {
    provider: input.provider,
    ripa: {
      baseUrl: input.ripa.baseUrl.trim(),
      model: input.ripa.model.trim(),
      apiKeyEnc: input.ripa.apiKey?.trim() ? encrypt(input.ripa.apiKey.trim()) : existing?.ripa.apiKeyEnc,
    },
    anthropic: {
      model: input.anthropic.model.trim(),
      apiKeyEnc: input.anthropic.apiKey?.trim() ? encrypt(input.anthropic.apiKey.trim()) : existing?.anthropic.apiKeyEnc,
    },
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  await ref.set(next);
  cache = undefined;
}

export function keyHint(apiKey: string): string {
  return apiKey.length >= 4 ? `…${apiKey.slice(-4)}` : "";
}

export function redact(s: ModelSettings): RedactedSettings {
  return {
    provider: s.provider,
    ripa: { baseUrl: s.ripa.baseUrl, model: s.ripa.model, hasKey: !!s.ripa.apiKey, keyHint: keyHint(s.ripa.apiKey) },
    anthropic: { model: s.anthropic.model, hasKey: !!s.anthropic.apiKey, keyHint: keyHint(s.anthropic.apiKey) },
    updatedAt: s.updatedAt,
    updatedBy: s.updatedBy,
  };
}

"use client";

import { useActionState, useState, useTransition } from "react";
import {
  loadRipaModelsAction,
  saveSettingsAction,
  testConnectionAction,
  type ActionResult,
} from "@/app/admin/actions";
import type { RedactedSettings } from "@/lib/settings";

const input =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const button =
  "rounded-lg border border-zinc-900 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-100";

export default function SettingsForm({ settings, canSaveKeys }: { settings: RedactedSettings; canSaveKeys: boolean }) {
  const [saved, save, saving] = useActionState(saveSettingsAction, null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [pending, start] = useTransition();

  function run(action: () => Promise<ActionResult>) {
    start(async () => {
      const r = await action();
      setResult(r);
      if (r.models) setModels(r.models);
    });
  }

  return (
    <form action={save} className="flex max-w-xl flex-col gap-6">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Active provider</span>
        <select name="provider" defaultValue={settings.provider} className={input}>
          <option value="ripa">RIPA platform</option>
          <option value="anthropic">Anthropic</option>
          <option value="mock">Mock (no model)</option>
        </select>
      </label>

      <fieldset className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-semibold">RIPA platform</legend>
        <label className="flex flex-col gap-1 text-sm">
          <span>Base URL</span>
          <input name="ripaBaseUrl" defaultValue={settings.ripa.baseUrl} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>API key {settings.ripa.hasKey ? `(saved, ${settings.ripa.keyHint})` : "(not set)"}</span>
          <input
            name="ripaApiKey"
            type="password"
            placeholder={settings.ripa.hasKey ? "Leave blank to keep the saved key" : "sk-…"}
            disabled={!canSaveKeys}
            className={input}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Model</span>
          <input name="ripaModel" defaultValue={settings.ripa.model} list="ripa-models" className={input} placeholder="e.g. llama3.2:3b" />
          <datalist id="ripa-models">
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </label>
        <div className="flex items-center gap-3">
          <button type="button" className={button} disabled={pending} onClick={() => run(loadRipaModelsAction)}>
            Load available models
          </button>
          <span className="text-xs text-zinc-500">Uses the saved key. Save first if you just entered it.</span>
        </div>
        {models.length > 0 && <p className="text-xs text-zinc-600">{models.join(" · ")}</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-semibold">Anthropic</legend>
        <label className="flex flex-col gap-1 text-sm">
          <span>API key {settings.anthropic.hasKey ? `(saved, ${settings.anthropic.keyHint})` : "(not set)"}</span>
          <input
            name="anthropicApiKey"
            type="password"
            placeholder={settings.anthropic.hasKey ? "Leave blank to keep the saved key" : "sk-ant-…"}
            disabled={!canSaveKeys}
            className={input}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Model</span>
          <input name="anthropicModel" defaultValue={settings.anthropic.model} className={input} />
        </label>
      </fieldset>

      <div className="flex items-center gap-3">
        <button type="submit" className={`${button} bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900`} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className={button} disabled={pending} onClick={() => run(testConnectionAction)}>
          {pending ? "Working…" : "Test connection"}
        </button>
      </div>

      {saved && <p className={`text-sm ${saved.ok ? "text-green-700" : "text-red-600"}`}>{saved.message}</p>}
      {result && <p className={`text-sm ${result.ok ? "text-green-700" : "text-red-600"}`}>{result.message}</p>}
      {settings.updatedAt && (
        <p className="text-xs text-zinc-500">
          Last saved {settings.updatedAt.slice(0, 16).replace("T", " ")} by {settings.updatedBy}
        </p>
      )}
    </form>
  );
}

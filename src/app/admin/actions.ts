"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { providerFor, testProvider } from "@/lib/gateway";
import { listRipaModels } from "@/lib/ripa";
import { getModelSettings, saveModelSettings, type ProviderName } from "@/lib/settings";
import { setRole, type Role } from "@/lib/users";

export interface ActionResult {
  ok: boolean;
  message: string;
  models?: string[];
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function saveSettingsAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const provider = String(form.get("provider")) as ProviderName;
    if (!["ripa", "anthropic", "mock"].includes(provider)) return { ok: false, message: "Unknown provider" };
    await saveModelSettings(
      {
        provider,
        ripa: {
          baseUrl: String(form.get("ripaBaseUrl") ?? ""),
          model: String(form.get("ripaModel") ?? ""),
          apiKey: String(form.get("ripaApiKey") ?? ""),
        },
        anthropic: {
          model: String(form.get("anthropicModel") ?? ""),
          apiKey: String(form.get("anthropicApiKey") ?? ""),
        },
      },
      admin.email,
    );
    revalidatePath("/admin/settings");
    return { ok: true, message: "Settings saved." };
  } catch (error) {
    return { ok: false, message: message(error) };
  }
}

export async function testConnectionAction(): Promise<ActionResult> {
  try {
    await requireAdmin();
    const provider = providerFor(await getModelSettings());
    const { ms, sample } = await testProvider(provider);
    return { ok: true, message: `${provider.name} / ${provider.model} replied in ${ms} ms: "${sample}"` };
  } catch (error) {
    return { ok: false, message: message(error) };
  }
}

export async function loadRipaModelsAction(): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { ripa } = await getModelSettings();
    if (!ripa.apiKey) return { ok: false, message: "Save a RIPA API key first." };
    const models = await listRipaModels(ripa.baseUrl, ripa.apiKey);
    return { ok: true, message: `${models.length} model(s) available.`, models };
  } catch (error) {
    return { ok: false, message: message(error) };
  }
}

export async function setRoleAction(form: FormData): Promise<void> {
  await requireAdmin();
  const uid = String(form.get("uid"));
  const role = String(form.get("role")) as Role;
  if (!uid || !["learner", "admin"].includes(role)) throw new Error("Bad request");
  await setRole(uid, role);
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${uid}`);
}

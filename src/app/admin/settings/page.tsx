import SettingsForm from "@/components/admin/SettingsForm";
import { encryptionConfigured } from "@/lib/crypto";
import { getModelSettings, redact } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const encryption = encryptionConfigured();
  const settings = redact(await getModelSettings());
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Model settings</h1>
      {!encryption && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          SETTINGS_ENCRYPTION_KEY is not set, so API keys cannot be saved. Generate one with
          <code className="mx-1">openssl rand -base64 32</code> and add it as a secret in apphosting.yaml.
        </p>
      )}
      <SettingsForm settings={settings} canSaveKeys={encryption} />
    </div>
  );
}

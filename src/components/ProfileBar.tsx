import type { LearnerProfile } from "@/content/types";

interface Props {
  profile: LearnerProfile;
  onChange: (profile: LearnerProfile) => void;
}

export default function ProfileBar({ profile, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
      <span className="text-zinc-600 dark:text-zinc-400">Your teaching team tailors examples to you.</span>
      <input
        value={profile.profession}
        onChange={(e) => onChange({ ...profile, profession: e.target.value })}
        placeholder="Your profession, e.g. accountant"
        className="min-w-56 flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <select
        value={profile.level}
        onChange={(e) => onChange({ ...profile, level: e.target.value as LearnerProfile["level"] })}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="new">New to AI tools</option>
        <option value="some">Used AI tools a little</option>
        <option value="experienced">Use AI tools regularly</option>
      </select>
    </div>
  );
}

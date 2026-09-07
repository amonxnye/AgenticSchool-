import type { Beat } from "@/content/types";

export default function WatchBeat({ beat }: { beat: Extract<Beat, { type: "watch" }> }) {
  return (
    <div className="flex flex-col gap-4">
      {beat.url ? (
        <video controls src={beat.url} className="w-full rounded-lg bg-black" />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
          Expert clip not yet recorded
        </div>
      )}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {beat.expert} · {beat.minutes} min
      </div>
      <p className="text-sm">{beat.summary}</p>
    </div>
  );
}

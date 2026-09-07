import { AGENTS, type AgentId } from "@/content/agents";

export default function TeachingTeam({ active }: { active: AgentId }) {
  return (
    <aside className="flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Your AI teaching team</div>
      {Object.values(AGENTS).map((a) => (
        <div
          key={a.id}
          className={`rounded-lg border p-3 ${a.id === active ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"}`}
        >
          <div className="text-sm font-semibold">
            {a.name} <span className="font-normal text-zinc-500">· {a.role}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{a.intro}</p>
          {a.id === active && <div className="mt-2 text-xs font-medium">Leading this beat</div>}
        </div>
      ))}
    </aside>
  );
}

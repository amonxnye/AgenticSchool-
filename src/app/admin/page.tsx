import Stat from "@/components/admin/Stat";
import { getOverview } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const o = await getOverview();
  const max = Math.max(1, ...o.byDay.map((d) => d.turns));
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Students" value={o.students} hint={`${o.newLast7d} new in 7 days`} />
        <Stat label="Active, 7 days" value={o.activeLast7d} />
        <Stat label="Lessons started" value={o.lessonsStarted} hint={`${o.lessonsCompleted} completed`} />
        <Stat label="Teaching turns" value={o.turnsTotal} hint={`${o.turnsLast7d} in 7 days`} />
        <Stat label="Failed turns, 7 days" value={o.failedTurnsLast7d} />
        <Stat label="Avg turn time, 7 days" value={o.avgMsLast7d ? `${(o.avgMsLast7d / 1000).toFixed(1)} s` : "–"} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Teaching turns, last 14 days</h2>
        <ol className="flex flex-col gap-1 text-xs">
          {o.byDay.map((d) => (
            <li key={d.day} className="flex items-center gap-3">
              <span className="w-24 text-zinc-500">{d.day}</span>
              <span className="h-3 bg-zinc-800 dark:bg-zinc-200" style={{ width: `${(d.turns / max) * 100}%` }} />
              <span>{d.turns}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Model usage, last 14 days</h2>
        {o.byModel.length === 0 ? (
          <p className="text-sm text-zinc-500">No teaching turns yet.</p>
        ) : (
          <table className="text-sm">
            <thead className="text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="pr-6">Provider</th>
                <th className="pr-6">Model</th>
                <th>Turns</th>
              </tr>
            </thead>
            <tbody>
              {o.byModel.map((m) => (
                <tr key={`${m.provider}/${m.model}`}>
                  <td className="pr-6">{m.provider}</td>
                  <td className="pr-6">{m.model}</td>
                  <td>{m.turns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

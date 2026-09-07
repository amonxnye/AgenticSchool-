import { SESSIONS } from "@/content";
import { listAllProgress } from "@/lib/progress";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const progress = await listAllProgress();
  const stats = new Map<string, { started: number; completed: number }>();
  for (const p of progress) {
    const key = `${p.sessionId}/${p.lessonId}`;
    const entry = stats.get(key) ?? { started: 0, completed: 0 };
    entry.started += 1;
    entry.completed += p.completed ? 1 : 0;
    stats.set(key, entry);
  }
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Courses</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sessions and lessons are authored in code under src/content. Counts come from learner progress.
      </p>
      {SESSIONS.map((s) => (
        <section key={s.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">{s.title}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.outcome}</p>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-1 pr-4">Lesson</th>
                <th className="pr-4">Beats</th>
                <th className="pr-4">Started</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {s.lessons.map((l) => {
                const st = stats.get(`${s.id}/${l.id}`) ?? { started: 0, completed: 0 };
                return (
                  <tr key={l.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="py-1 pr-4">{l.title}</td>
                    <td className="pr-4">{l.beats.map((b) => b.type).join(", ")}</td>
                    <td className="pr-4">{st.started}</td>
                    <td>{st.completed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

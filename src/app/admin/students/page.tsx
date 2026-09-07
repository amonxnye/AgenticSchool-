import Link from "next/link";
import { listAllProgress } from "@/lib/progress";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

function when(iso: string): string {
  return iso ? iso.slice(0, 10) : "–";
}

export default async function StudentsPage() {
  const [users, progress] = await Promise.all([listUsers(), listAllProgress()]);
  const byUser = new Map<string, { lessons: number; completed: number; beats: number }>();
  for (const p of progress) {
    const entry = byUser.get(p.uid) ?? { lessons: 0, completed: 0, beats: 0 };
    entry.lessons += 1;
    entry.completed += p.completed ? 1 : 0;
    entry.beats += p.beatsDone;
    byUser.set(p.uid, entry);
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Students</h1>
      {users.length === 0 ? (
        <p className="text-sm text-zinc-500">No one has signed in yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="pr-4">Email</th>
                <th className="pr-4">Profession</th>
                <th className="pr-4">Level</th>
                <th className="pr-4">Role</th>
                <th className="pr-4">Joined</th>
                <th className="pr-4">Last active</th>
                <th className="pr-4">Lessons</th>
                <th className="pr-4">Completed</th>
                <th>Beats</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const s = byUser.get(u.uid) ?? { lessons: 0, completed: 0, beats: 0 };
                return (
                  <tr key={u.uid} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="py-2 pr-4">
                      <Link href={`/admin/students/${u.uid}`} className="underline">
                        {u.name || "(no name)"}
                      </Link>
                    </td>
                    <td className="pr-4">{u.email}</td>
                    <td className="pr-4">{u.profession || "–"}</td>
                    <td className="pr-4">{u.level}</td>
                    <td className="pr-4">{u.role}</td>
                    <td className="pr-4">{when(u.createdAt)}</td>
                    <td className="pr-4">{when(u.lastActiveAt)}</td>
                    <td className="pr-4">{s.lessons}</td>
                    <td className="pr-4">{s.completed}</td>
                    <td>{s.beats}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

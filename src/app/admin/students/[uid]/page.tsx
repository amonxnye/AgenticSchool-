import { notFound } from "next/navigation";
import { findLesson, findSession } from "@/content";
import { listProgressForUser } from "@/lib/progress";
import { getUser } from "@/lib/users";
import { setRoleAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function StudentPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const user = await getUser(uid);
  if (!user) notFound();
  const progress = await listProgressForUser(uid);
  const nextRole = user.role === "admin" ? "learner" : "admin";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{user.name || user.email}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {user.email} · {user.profession || "no profession set"} · {user.level} · role: {user.role}
        </p>
        <p className="text-xs text-zinc-500">
          Joined {user.createdAt.slice(0, 10) || "–"} · last active {user.lastActiveAt.slice(0, 10) || "–"}
        </p>
      </div>

      <form action={setRoleAction}>
        <input type="hidden" name="uid" value={uid} />
        <input type="hidden" name="role" value={nextRole} />
        <button type="submit" className="rounded-lg border border-zinc-900 px-3 py-1.5 text-sm dark:border-zinc-100">
          {nextRole === "admin" ? "Make admin" : "Remove admin role"}
        </button>
      </form>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Progress</h2>
        {progress.length === 0 && <p className="text-sm text-zinc-500">No lessons started.</p>}
        {progress.map((p) => {
          const session = findSession(p.sessionId);
          const lesson = session && findLesson(session, p.lessonId);
          return (
            <div key={`${p.sessionId}/${p.lessonId}`} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="font-medium">
                {session?.title ?? p.sessionId} · {lesson?.title ?? p.lessonId}
              </div>
              <div className="text-xs text-zinc-500">
                {p.done.length} of {lesson?.beats.length ?? "?"} beats · {p.completed ? "completed" : "in progress"} · updated{" "}
                {p.updatedAt.slice(0, 16).replace("T", " ") || "–"}
              </div>
              {Object.entries(p.transcripts).map(([beatId, messages]) => (
                <details key={beatId} className="mt-3 text-sm">
                  <summary className="cursor-pointer">
                    {lesson?.beats.find((b) => b.id === beatId)?.title ?? beatId} ({messages.length} messages)
                  </summary>
                  <div className="mt-2 flex flex-col gap-2">
                    {messages.map((m, i) => (
                      <div key={i} className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
                        <div className="text-xs font-semibold text-zinc-500">{m.role === "user" ? "Learner" : "Agent"}</div>
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}

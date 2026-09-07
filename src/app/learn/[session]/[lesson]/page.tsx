import { notFound } from "next/navigation";
import LessonRuntime from "@/components/LessonRuntime";
import UserMenu from "@/components/UserMenu";
import { findLesson, findSession } from "@/content";
import { isAdmin, requireUser } from "@/lib/auth";
import { getProgress } from "@/lib/progress";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ session: string; lesson: string }>;
}) {
  const { session: sessionId, lesson: lessonId } = await params;
  const user = await requireUser(`/learn/${sessionId}/${lessonId}`);
  const session = findSession(sessionId);
  const lesson = session && findLesson(session, lessonId);
  if (!session || !lesson) notFound();

  const progress = await getProgress(user.uid, session.id, lesson.id);
  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-4">
        <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Agentic School</span>
        <UserMenu email={user.email} isAdmin={isAdmin(user)} />
      </div>
      <LessonRuntime
        session={session}
        lesson={lesson}
        initial={{
          profile: user.profile,
          done: progress?.done ?? [],
          transcripts: progress?.transcripts ?? {},
        }}
      />
    </>
  );
}

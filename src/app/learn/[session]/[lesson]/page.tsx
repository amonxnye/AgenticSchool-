import { notFound } from "next/navigation";
import LessonRuntime from "@/components/LessonRuntime";
import { findLesson, findSession } from "@/content";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ session: string; lesson: string }>;
}) {
  const { session: sessionId, lesson: lessonId } = await params;
  const session = findSession(sessionId);
  const lesson = session && findLesson(session, lessonId);
  if (!session || !lesson) notFound();
  return <LessonRuntime session={session} lesson={lesson} />;
}

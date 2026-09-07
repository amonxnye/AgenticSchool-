import { findLesson, findSession } from "@/content";
import type { LearnerProfile } from "@/content/types";
import { getCurrentUser } from "@/lib/auth";
import type { ChatMessage } from "@/lib/gateway";
import { saveProgress } from "@/lib/progress";
import { updateProfile } from "@/lib/users";

interface ProgressBody {
  sessionId: string;
  lessonId: string;
  done: string[];
  transcripts: Record<string, ChatMessage[]>;
  profile: LearnerProfile;
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in to learn", { status: 401 });

  const body = (await request.json()) as ProgressBody;
  const session = findSession(body.sessionId);
  const lesson = session && findLesson(session, body.lessonId);
  if (!session || !lesson) return new Response("Unknown session or lesson", { status: 404 });

  await Promise.all([
    saveProgress(user.uid, {
      sessionId: session.id,
      lessonId: lesson.id,
      done: body.done,
      transcripts: body.transcripts,
      completed: lesson.beats.every((b) => body.done.includes(b.id)),
    }),
    updateProfile(user.uid, { profession: body.profile.profession, level: body.profile.level }),
  ]);
  return Response.json({ ok: true });
}

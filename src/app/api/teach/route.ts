import { findBeat, findLesson, findSession } from "@/content";
import type { LearnerProfile } from "@/content/types";
import { logTurn } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/auth";
import { providerFor, streamChat, type ChatMessage } from "@/lib/gateway";
import { agentForBeat, buildSystemPrompt, kickoffMessage } from "@/lib/prompts";
import { getModelSettings } from "@/lib/settings";
import { touchActive } from "@/lib/users";

interface TeachBody {
  sessionId: string;
  lessonId: string;
  beatId: string;
  profile: LearnerProfile;
  messages: ChatMessage[];
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in to learn", { status: 401 });

  const body = (await request.json()) as TeachBody;
  const session = findSession(body.sessionId);
  const lesson = session && findLesson(session, body.lessonId);
  const beat = lesson && findBeat(lesson, body.beatId);
  if (!session || !lesson || !beat) {
    return new Response("Unknown session, lesson or beat", { status: 404 });
  }

  const kickoff = kickoffMessage(beat);
  const messages: ChatMessage[] = kickoff
    ? [{ role: "user", content: kickoff }, ...body.messages]
    : body.messages;
  if (messages.length === 0 || messages[0].role !== "user") {
    return new Response("Conversation must start with a learner message", { status: 400 });
  }

  const provider = providerFor(await getModelSettings());
  const chunks = streamChat(
    { system: buildSystemPrompt({ session, lesson, beat, profile: body.profile }), messages },
    provider,
  );

  const started = Date.now();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let chars = 0;
      let ok = true;
      try {
        for await (const chunk of chunks) {
          chars += chunk.length;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        ok = false;
        console.error("teach stream failed", error);
        controller.enqueue(encoder.encode("\n\nSomething went wrong on our side. Please try again."));
      } finally {
        controller.close();
      }
      await Promise.all([
        logTurn({
          uid: user.uid,
          sessionId: session.id,
          lessonId: lesson.id,
          beatId: beat.id,
          agent: agentForBeat(beat).id,
          provider: provider.name,
          model: provider.model,
          ms: Date.now() - started,
          chars,
          ok,
        }),
        touchActive(user.uid),
      ]).catch((error) => console.error("turn logging failed", error));
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

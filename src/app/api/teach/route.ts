import { findBeat, findLesson, findSession } from "@/content";
import type { LearnerProfile } from "@/content/types";
import { streamChat, type ChatMessage } from "@/lib/gateway";
import { buildSystemPrompt, kickoffMessage } from "@/lib/prompts";

interface TeachBody {
  sessionId: string;
  lessonId: string;
  beatId: string;
  profile: LearnerProfile;
  messages: ChatMessage[];
}

export async function POST(request: Request) {
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

  const chunks = streamChat({
    system: buildSystemPrompt({ session, lesson, beat, profile: body.profile }),
    messages,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        console.error("teach stream failed", error);
        controller.enqueue(encoder.encode("\n\nSomething went wrong on our side. Please try again."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

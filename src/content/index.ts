import { buildingAiAgents } from "./sessions/building-ai-agents";
import type { Beat, Lesson, Session } from "./types";

export const SESSIONS: Session[] = [buildingAiAgents];

export function findSession(sessionId: string): Session | undefined {
  return SESSIONS.find((s) => s.id === sessionId);
}

export function findLesson(session: Session, lessonId: string): Lesson | undefined {
  return session.lessons.find((l) => l.id === lessonId);
}

export function findBeat(lesson: Lesson, beatId: string): Beat | undefined {
  return lesson.beats.find((b) => b.id === beatId);
}

import { describe, expect, it } from "vitest";
import { SESSIONS, findBeat, findLesson, findSession } from "./index";

describe("session content", () => {
  it("has unique ids at every level", () => {
    const sessionIds = SESSIONS.map((s) => s.id);
    expect(new Set(sessionIds).size).toBe(sessionIds.length);
    for (const session of SESSIONS) {
      const lessonIds = session.lessons.map((l) => l.id);
      expect(new Set(lessonIds).size).toBe(lessonIds.length);
      for (const lesson of session.lessons) {
        const beatIds = lesson.beats.map((b) => b.id);
        expect(new Set(beatIds).size).toBe(beatIds.length);
        expect(lesson.beats.length).toBeGreaterThan(0);
      }
    }
  });

  it("resolves the first lesson of Building AI Agents", () => {
    const session = findSession("building-ai-agents");
    expect(session).toBeDefined();
    const lesson = findLesson(session!, "what-makes-an-agent");
    expect(lesson).toBeDefined();
    expect(findBeat(lesson!, "loop")?.type).toBe("explain");
    expect(findBeat(lesson!, "nope")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { buildingAiAgents } from "@/content/sessions/building-ai-agents";
import type { Beat, LearnerProfile } from "@/content/types";
import { agentForBeat, buildSystemPrompt, kickoffMessage } from "./prompts";

const session = buildingAiAgents;
const lesson = session.lessons[0];
const profile: LearnerProfile = { profession: "pharmacist", level: "new" };

function beatOf<T extends Beat["type"]>(type: T): Extract<Beat, { type: T }> {
  const beat = lesson.beats.find((b) => b.type === type);
  if (!beat) throw new Error(`lesson has no ${type} beat`);
  return beat as Extract<Beat, { type: T }>;
}

describe("buildSystemPrompt", () => {
  it("grounds an explain beat in every teaching point and the learner's profession", () => {
    const beat = beatOf("explain");
    const prompt = buildSystemPrompt({ session, lesson, beat, profile });
    for (const point of beat.points) expect(prompt).toContain(point);
    expect(prompt).toContain("pharmacist");
    expect(prompt).toContain("Maya");
  });

  it("lists check questions in order", () => {
    const beat = beatOf("check");
    const prompt = buildSystemPrompt({ session, lesson, beat, profile });
    const positions = beat.questions.map((q) => prompt.indexOf(q));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("gives the Lab Coach the task and every review criterion", () => {
    const beat = beatOf("do");
    const prompt = buildSystemPrompt({ session, lesson, beat, profile });
    expect(prompt).toContain(beat.task);
    for (const c of beat.criteria) expect(prompt).toContain(c);
    expect(prompt).toContain("Atlas");
  });

  it("falls back to a generic learner when no profession is given", () => {
    const prompt = buildSystemPrompt({
      session,
      lesson,
      beat: beatOf("explain"),
      profile: { profession: "   ", level: "some" },
    });
    expect(prompt).toContain("works as a professional");
  });
});

describe("beat routing", () => {
  it("assigns the right agent to each beat type", () => {
    expect(agentForBeat(beatOf("explain")).id).toBe("maya");
    expect(agentForBeat(beatOf("check")).id).toBe("maya");
    expect(agentForBeat(beatOf("do")).id).toBe("atlas");
    expect(agentForBeat(beatOf("apply")).id).toBe("coach");
  });

  it("only agent-led beats have a kickoff message", () => {
    expect(kickoffMessage(beatOf("explain"))).toBeTruthy();
    expect(kickoffMessage(beatOf("check"))).toBeTruthy();
    expect(kickoffMessage(beatOf("do"))).toBeNull();
    expect(kickoffMessage(beatOf("apply"))).toBeNull();
    expect(kickoffMessage(beatOf("watch"))).toBeNull();
  });
});

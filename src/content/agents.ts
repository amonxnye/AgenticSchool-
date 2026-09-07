import type { BeatType } from "./types";

export type AgentId = "maya" | "atlas" | "dev" | "coach";

export interface TeachingAgent {
  id: AgentId;
  name: string;
  role: string;
  /** One line the learner sees when the team is introduced. */
  intro: string;
}

/** The AI Teaching Team a learner meets when they enter a Session. */
export const AGENTS: Record<AgentId, TeachingAgent> = {
  maya: {
    id: "maya",
    name: "Maya",
    role: "AI Instructor",
    intro: "Teaches the main concepts and checks you understood them.",
  },
  atlas: {
    id: "atlas",
    name: "Atlas",
    role: "Lab Coach",
    intro: "Guides the practical labs and reviews what you build.",
  },
  dev: {
    id: "dev",
    name: "Dev",
    role: "Technical Mentor",
    intro: "Helps with implementation and debugging in technical Sessions.",
  },
  coach: {
    id: "coach",
    name: "Project Coach",
    role: "Project Coach",
    intro: "Connects each lesson to your applied project.",
  },
};

/** Which agent leads each kind of beat. */
export const BEAT_AGENT: Record<BeatType, AgentId> = {
  explain: "maya",
  watch: "maya",
  check: "maya",
  do: "atlas",
  apply: "coach",
};

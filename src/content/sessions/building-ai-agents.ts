import type { Session } from "../types";

export const buildingAiAgents: Session = {
  id: "building-ai-agents",
  title: "Building AI Agents",
  outcome:
    "Design and build a working AI agent for one real task, with clear tools, a stop condition and a human handoff.",
  lessons: [
    {
      id: "what-makes-an-agent",
      title: "What makes an agent an agent",
      outcome:
        "Explain the agent loop and write a complete agent spec for one task from your own work.",
      beats: [
        {
          id: "loop",
          type: "explain",
          title: "The agent loop",
          points: [
            "An agent is a model given a goal, a set of tools, and permission to keep going until the goal is met or it decides to stop.",
            "The loop: the model reads the situation, chooses an action (answer, or call a tool), sees the result, and repeats.",
            "A chatbot answers once. An agent acts, observes, and acts again. The loop is the difference.",
            "Every agent design has four parts: the instructions (what it is for and what it must not do), the tools (what it can actually do), the stop condition (how it knows it is finished), and the boundaries (what needs a human).",
            "Most agent failures are design failures: a vague goal, a tool that is too broad, or no stop condition.",
          ],
        },
        {
          id: "expert-clip",
          type: "watch",
          title: "Where agents go wrong in practice",
          expert: "Session expert",
          minutes: 6,
          summary:
            "The expert walks through two real agent deployments: one that ran up a bill because it had no stop condition, and one that worked because its tools were narrow.",
        },
        {
          id: "check",
          type: "check",
          title: "Check your understanding",
          questions: [
            "In your own words, what is the difference between a chatbot and an agent?",
            "Name the four parts of an agent design and give one example of each for a task you know well.",
            "Why is a missing stop condition dangerous?",
          ],
        },
        {
          id: "spec-lab",
          type: "do",
          title: "Lab: write your first agent spec",
          task:
            "Pick one repetitive task from your own job. Write an agent spec for it with five parts: 1) the goal in one sentence, 2) the instructions in three to six lines, 3) exactly two tools, each with one line on what it can do and one line on what it cannot, 4) the stop condition, 5) one situation where the agent must hand off to a human.",
          criteria: [
            "The goal is one sentence and you could test whether it was met.",
            "Each tool is narrow: it does one thing and its limits are stated.",
            "The stop condition is observable, not a feeling.",
            "The human handoff names a specific situation, not 'when unsure'.",
          ],
        },
        {
          id: "apply",
          type: "apply",
          title: "Where would this run in your work?",
          prompt:
            "Describe one workflow in your role where the agent you just specified would save time this month, and one risk you would need to manage before letting it run.",
        },
      ],
    },
  ],
};

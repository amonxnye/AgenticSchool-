/**
 * Content model for an Agentic Session.
 *
 * A lesson is a script of "beats" authored by a human expert. The teaching
 * agents run the script; they do not invent the curriculum.
 */

export type BeatType = "explain" | "watch" | "check" | "do" | "apply";

type BeatBase = { id: string; title: string };

export type Beat =
  /** The Instructor teaches the concept, personalised to the learner, from these points only. */
  | (BeatBase & { type: "explain"; points: string[] })
  /** A short clip of the real human expert. `url` is absent until the clip is recorded. */
  | (BeatBase & { type: "watch"; expert: string; minutes: number; summary: string; url?: string })
  /** The Instructor asks these questions one at a time and gives feedback. */
  | (BeatBase & { type: "check"; questions: string[] })
  /** A lab task. The Lab Coach reviews the submission against the criteria. */
  | (BeatBase & { type: "do"; task: string; criteria: string[] })
  /** The learner writes how this applies to their own work. The Project Coach responds. */
  | (BeatBase & { type: "apply"; prompt: string });

export interface Lesson {
  id: string;
  title: string;
  /** What the learner can do after this lesson that they could not before. */
  outcome: string;
  beats: Beat[];
}

export interface Session {
  id: string;
  title: string;
  /** The one demonstrable capability this Session produces. */
  outcome: string;
  lessons: Lesson[];
}

export interface LearnerProfile {
  profession: string;
  level: "new" | "some" | "experienced";
}

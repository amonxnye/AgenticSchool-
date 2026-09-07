import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "./firebase/admin";
import type { ChatMessage } from "./gateway";
import { iso } from "./users";

export interface LessonProgress {
  sessionId: string;
  lessonId: string;
  done: string[];
  transcripts: Record<string, ChatMessage[]>;
  completed: boolean;
  updatedAt: string;
}

export function progressId(sessionId: string, lessonId: string): string {
  return `${sessionId}__${lessonId}`;
}

function toProgress(d: FirebaseFirestore.DocumentData): LessonProgress {
  return {
    sessionId: d.sessionId,
    lessonId: d.lessonId,
    done: d.done ?? [],
    transcripts: d.transcripts ?? {},
    completed: !!d.completed,
    updatedAt: iso(d.updatedAt),
  };
}

export async function getProgress(uid: string, sessionId: string, lessonId: string): Promise<LessonProgress | null> {
  const snap = await firestore().doc(`users/${uid}/progress/${progressId(sessionId, lessonId)}`).get();
  return snap.exists ? toProgress(snap.data()!) : null;
}

export async function saveProgress(
  uid: string,
  p: Pick<LessonProgress, "sessionId" | "lessonId" | "done" | "transcripts" | "completed">,
): Promise<void> {
  await firestore()
    .doc(`users/${uid}/progress/${progressId(p.sessionId, p.lessonId)}`)
    .set({ ...p, uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function listProgressForUser(uid: string): Promise<LessonProgress[]> {
  const snap = await firestore().collection(`users/${uid}/progress`).get();
  return snap.docs.map((d) => toProgress(d.data()));
}

export interface ProgressSummary {
  uid: string;
  sessionId: string;
  lessonId: string;
  beatsDone: number;
  completed: boolean;
}

/** Every learner's progress across the school, for the admin views. */
export async function listAllProgress(): Promise<ProgressSummary[]> {
  const snap = await firestore().collectionGroup("progress").limit(5000).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: data.uid ?? d.ref.parent.parent?.id ?? "",
      sessionId: data.sessionId,
      lessonId: data.lessonId,
      beatsDone: (data.done ?? []).length,
      completed: !!data.completed,
    };
  });
}

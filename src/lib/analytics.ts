import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { firestore } from "./firebase/admin";
import { listAllProgress } from "./progress";

export interface TurnLog {
  uid: string;
  sessionId: string;
  lessonId: string;
  beatId: string;
  agent: string;
  provider: string;
  model: string;
  ms: number;
  chars: number;
  ok: boolean;
}

export async function logTurn(turn: TurnLog): Promise<void> {
  await firestore().collection("turns").add({ ...turn, at: FieldValue.serverTimestamp() });
}

export interface DayCount {
  day: string;
  turns: number;
}

/** Turns per calendar day (UTC) for the last `days` days, oldest first, zero-filled. */
export function bucketByDay(turnDates: Date[], days: number, now = new Date()): DayCount[] {
  const counts = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const date of turnDates) {
    const key = date.toISOString().slice(0, 10);
    if (counts.has(key)) counts.set(key, counts.get(key)! + 1);
  }
  return [...counts].map(([day, turns]) => ({ day, turns }));
}

export interface Overview {
  students: number;
  newLast7d: number;
  activeLast7d: number;
  lessonsStarted: number;
  lessonsCompleted: number;
  turnsTotal: number;
  turnsLast7d: number;
  failedTurnsLast7d: number;
  avgMsLast7d: number;
  byModel: { provider: string; model: string; turns: number }[];
  byDay: DayCount[];
}

export async function getOverview(): Promise<Overview> {
  const db = firestore();
  const now = new Date();
  const d7 = Timestamp.fromDate(new Date(now.getTime() - 7 * 86_400_000));
  const d14 = Timestamp.fromDate(new Date(now.getTime() - 14 * 86_400_000));

  const [students, newLast7d, activeLast7d, turnsTotal, recent, progress] = await Promise.all([
    db.collection("users").count().get(),
    db.collection("users").where("createdAt", ">=", d7).count().get(),
    db.collection("users").where("lastActiveAt", ">=", d7).count().get(),
    db.collection("turns").count().get(),
    db.collection("turns").where("at", ">=", d14).orderBy("at", "desc").limit(5000).get(),
    listAllProgress(),
  ]);

  const turns = recent.docs.map((d) => d.data());
  const last7 = turns.filter((t) => t.at instanceof Timestamp && t.at >= d7);
  const byModelMap = new Map<string, { provider: string; model: string; turns: number }>();
  for (const t of turns) {
    const key = `${t.provider}/${t.model}`;
    const entry = byModelMap.get(key) ?? { provider: t.provider, model: t.model, turns: 0 };
    entry.turns += 1;
    byModelMap.set(key, entry);
  }

  return {
    students: students.data().count,
    newLast7d: newLast7d.data().count,
    activeLast7d: activeLast7d.data().count,
    lessonsStarted: progress.length,
    lessonsCompleted: progress.filter((p) => p.completed).length,
    turnsTotal: turnsTotal.data().count,
    turnsLast7d: last7.length,
    failedTurnsLast7d: last7.filter((t) => t.ok === false).length,
    avgMsLast7d: last7.length ? Math.round(last7.reduce((s, t) => s + (t.ms ?? 0), 0) / last7.length) : 0,
    byModel: [...byModelMap.values()].sort((a, b) => b.turns - a.turns),
    byDay: bucketByDay(
      turns.filter((t) => t.at instanceof Timestamp).map((t) => (t.at as Timestamp).toDate()),
      14,
      now,
    ),
  };
}

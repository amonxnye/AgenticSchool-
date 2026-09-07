import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { LearnerProfile } from "@/content/types";
import { firestore } from "./firebase/admin";

export type Role = "learner" | "admin";

export interface UserRecord {
  uid: string;
  email: string;
  name: string;
  role: Role;
  profession: string;
  level: LearnerProfile["level"];
  createdAt: string;
  lastActiveAt: string;
}

export function iso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

function toRecord(uid: string, d: FirebaseFirestore.DocumentData | undefined): UserRecord {
  return {
    uid,
    email: d?.email ?? "",
    name: d?.name ?? "",
    role: d?.role === "admin" ? "admin" : "learner",
    profession: d?.profession ?? "",
    level: d?.level ?? "some",
    createdAt: iso(d?.createdAt),
    lastActiveAt: iso(d?.lastActiveAt),
  };
}

export async function upsertUserOnSignIn(user: { uid: string; email: string; name: string }): Promise<void> {
  const ref = firestore().doc(`users/${user.uid}`);
  const snap = await ref.get();
  await ref.set(
    {
      email: user.email,
      name: user.name,
      lastActiveAt: FieldValue.serverTimestamp(),
      ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp(), role: "learner" }),
    },
    { merge: true },
  );
}

export async function touchActive(uid: string): Promise<void> {
  await firestore().doc(`users/${uid}`).set({ lastActiveAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function updateProfile(uid: string, profile: LearnerProfile): Promise<void> {
  await firestore().doc(`users/${uid}`).set(profile, { merge: true });
}

export async function getUser(uid: string): Promise<UserRecord | null> {
  const snap = await firestore().doc(`users/${uid}`).get();
  return snap.exists ? toRecord(uid, snap.data()) : null;
}

export async function listUsers(): Promise<UserRecord[]> {
  const snap = await firestore().collection("users").orderBy("createdAt", "desc").limit(1000).get();
  return snap.docs.map((d) => toRecord(d.id, d.data()));
}

export async function setRole(uid: string, role: Role): Promise<void> {
  await firestore().doc(`users/${uid}`).set({ role }, { merge: true });
}

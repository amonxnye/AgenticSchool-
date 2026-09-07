import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { LearnerProfile } from "@/content/types";
import { isAdminEmail } from "./admin";
import { SESSION_COOKIE } from "./auth-constants";
import { adminAuth } from "./firebase/admin";
import { getUser, type Role } from "./users";

export { SESSION_COOKIE, SESSION_DAYS } from "./auth-constants";

export interface CurrentUser {
  uid: string;
  email: string;
  name: string;
  role: Role;
  profile: LearnerProfile;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const record = await getUser(decoded.uid);
    return {
      uid: decoded.uid,
      email: record?.email || decoded.email || "",
      name: record?.name || (typeof decoded.name === "string" ? decoded.name : "") || "",
      role: record?.role ?? "learner",
      profile: { profession: record?.profession ?? "", level: record?.level ?? "some" },
    };
  } catch {
    return null;
  }
}

export function isAdmin(user: CurrentUser): boolean {
  return user.role === "admin" || isAdminEmail(user.email);
}

/** For pages: send anonymous visitors to sign in, then back here. */
export async function requireUser(nextPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** For server actions: throw rather than redirect. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) throw new Error("Admin access required");
  return user;
}

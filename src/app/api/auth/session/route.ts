import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth";
import { adminAuth } from "@/lib/firebase/admin";
import { upsertUserOnSignIn } from "@/lib/users";

/** Exchange a Firebase ID token for an httpOnly session cookie. */
export async function POST(request: Request) {
  const { idToken } = (await request.json()) as { idToken?: string };
  if (!idToken) return new Response("Missing idToken", { status: 400 });

  const auth = adminAuth();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return new Response("Invalid token", { status: 401 });
  }

  const expiresIn = SESSION_DAYS * 86_400_000;
  const cookie = await auth.createSessionCookie(idToken, { expiresIn });
  await upsertUserOnSignIn({
    uid: decoded.uid,
    email: decoded.email ?? "",
    name: typeof decoded.name === "string" ? decoded.name : "",
  });

  (await cookies()).set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}

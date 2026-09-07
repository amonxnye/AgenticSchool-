"use client";

import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { firebaseApp } from "@/lib/firebase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const result = await signInWithPopup(getAuth(firebaseApp()), new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error(`Session failed: ${res.status}`);
      window.location.assign(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-24">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Agentic School</div>
        <h1 className="mt-2 text-2xl font-semibold">Sign in to learn</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your teaching team remembers where you left off.
        </p>
      </div>
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {busy ? "Signing in…" : "Continue with Google"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

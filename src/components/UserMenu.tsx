"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserMenu({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }
  return (
    <div className="flex items-center gap-3 text-xs text-zinc-500">
      {isAdmin && (
        <Link href="/admin" className="underline">
          Admin
        </Link>
      )}
      <span>{email}</span>
      <button type="button" onClick={signOut} className="underline">
        Sign out
      </button>
    </div>
  );
}

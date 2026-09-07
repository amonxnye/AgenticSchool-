import Link from "next/link";
import UserMenu from "@/components/UserMenu";
import { isAdmin, requireUser } from "@/lib/auth";

const NAV = [
  ["/admin", "Overview"],
  ["/admin/students", "Students"],
  ["/admin/courses", "Courses"],
  ["/admin/settings", "Settings"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/admin");
  if (!isAdmin(user)) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-sm">
        <p>
          <strong>{user.email}</strong> is not an administrator.
        </p>
        <p className="mt-2 text-zinc-600">Add the address to ADMIN_EMAILS, or ask an admin to grant the role.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Agentic School admin</span>
          <nav className="flex gap-4 text-sm">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className="underline-offset-4 hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <UserMenu email={user.email} isAdmin />
      </div>
      {children}
    </div>
  );
}

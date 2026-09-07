/** Admins are the ADMIN_EMAILS allowlist plus anyone given the admin role in the admin UI. */
export function isAdminEmail(email: string, list = process.env.ADMIN_EMAILS ?? ""): boolean {
  const wanted = email.trim().toLowerCase();
  if (!wanted) return false;
  return list
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(wanted);
}

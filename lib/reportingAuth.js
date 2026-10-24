// lib/reportingAuth.js
import { getAuthUser } from "@/lib/getAuthUser";

export async function requireReportAdmin(req) {
  const user = await getAuthUser(req);
  if (!user) return { ok: false, status: 401, error: "Unauthorized" };
  if (!["admin", "manager"].includes(user.role))
    return { ok: false, status: 403, error: "Forbidden - admin or manager only" };
  return { ok: true, user };
}

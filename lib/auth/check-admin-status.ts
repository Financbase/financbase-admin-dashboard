"use server";

import { isAdmin } from "@/lib/auth/financbase-rbac";

export async function checkAdminStatus(): Promise<boolean> {
  return await isAdmin();
}

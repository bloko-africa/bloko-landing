"use server";

import { db } from "@/lib/db";

export async function checkEmailExists(email: string): Promise<boolean> {
  if (!email || !email.includes("@")) return false;

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return Boolean(user);
}

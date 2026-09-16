"use server";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth/session";
import { ASSIGNABLE_STAFF_ROLES } from "@/lib/user-role";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const changeUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ASSIGNABLE_STAFF_ROLES),
});

// vendeur n'est jamais une cible ici : requireBoutiqueAccess exige un
// boutiqueId pour ce rôle, et createBoutique() est le seul flux qui crée
// atomiquement le compte + la boutique + ce lien. Un simple changement de
// rôle depuis cette page laisserait un vendeur sans boutique.
export async function changeUserRole(formData: FormData) {
  await requireRole(["admin"]);

  const data = changeUserRoleSchema.parse({
    userId: formData.get("userId")?.toString() ?? "",
    role: formData.get("role")?.toString() ?? "",
  });

  await auth.api.setRole({
    body: { userId: data.userId, role: data.role },
    headers: await headers(),
  });

  revalidatePath("/2558588dca9a/users");
}

const banUserSchema = z.object({
  userId: z.string().min(1),
  banReason: z.string().optional(),
});

export async function banUserAccount(formData: FormData) {
  await requireRole(["admin"]);

  const data = banUserSchema.parse({
    userId: formData.get("userId")?.toString() ?? "",
    banReason: formData.get("banReason")?.toString() || undefined,
  });

  await auth.api.banUser({
    body: { userId: data.userId, banReason: data.banReason },
    headers: await headers(),
  });

  revalidatePath("/2558588dca9a/users");
}

export async function unbanUserAccount(userId: string) {
  await requireRole(["admin"]);
  await auth.api.unbanUser({ body: { userId }, headers: await headers() });
  revalidatePath("/2558588dca9a/users");
}

const createStaffSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  role: z.enum(ASSIGNABLE_STAFF_ROLES),
});

// Jamais "vendeur" ici non plus — même raison que changeUserRole ; une
// vendeuse se crée uniquement via createBoutique (boutiques.ts).
export async function createStaffAccount(formData: FormData) {
  await requireRole(["admin"]);

  const data = createStaffSchema.parse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    role: formData.get("role")?.toString() ?? "",
  });

  await auth.api.createUser({
    body: { email: data.email, password: data.password, name: data.name, role: data.role },
  });

  revalidatePath("/2558588dca9a/users");
}

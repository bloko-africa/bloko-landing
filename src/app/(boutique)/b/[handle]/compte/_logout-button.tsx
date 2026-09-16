"use client";

import { signOut } from "@/lib/auth/auth-client";
import { useBoutiquePath } from "@/lib/boutique-path";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const homePath = useBoutiquePath("");

  async function handleLogout() {
    await signOut();
    router.push(homePath || "/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-body-sm font-medium text-dark-5 hover:text-primary dark:text-dark-6"
    >
      Se déconnecter
    </button>
  );
}

"use client";

import { signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export function LogoutButton({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push(redirectTo);
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

"use client";

import { CommandPalette } from "@/components/Admin/command-palette";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header({
  subtitle,
  storeUrl,
}: {
  subtitle: string;
  storeUrl: string | null;
}) {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="border-stroke shadow-1 dark:border-stroke-dark dark:bg-gray-dark sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-5 md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="dark:border-stroke-dark rounded-lg border px-1.5 py-1 lg:hidden dark:bg-[#0d0c0a] hover:dark:bg-[#FFFFFF1A]"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link
          href={"/2558588dca9a"}
          className="2xsm:ml-4 ml-2 flex size-8 shrink-0 items-center justify-center rounded-lg bg-dark max-[430px]:hidden dark:bg-black"
        >
          <Image src="/brand/bloko-icon.png" width={16} height={18} alt="" role="presentation" />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="text-heading-5 text-dark mb-0.5 font-bold dark:text-white">
          Dashboard
        </h1>
        <p className="font-medium">{subtitle}</p>
      </div>

      <div className="2xsm:gap-4 flex flex-1 items-center justify-end gap-2">
        <CommandPalette />

        {storeUrl && (
          <Link
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-2 rounded-full border border-stroke px-4 py-2.5 text-body-sm font-medium text-dark-5 hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6 sm:flex"
          >
            Voir ma boutique
          </Link>
        )}

        <ThemeToggleSwitch />

        <Notification />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}

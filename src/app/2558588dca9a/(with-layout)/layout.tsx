import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { VendorBottomNav } from "@/components/Layouts/vendor-bottom-nav";
import { type PropsWithChildren } from "react";

export default function WithLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-full bg-gray-2 dark:bg-[#0d0c0a]">
        <Header />

        <main className="iblokote mx-auto w-full max-w-(--breakpoint-2xl) overflow-hidden p-4 pb-20 md:p-6 md:pb-6 2xl:p-10">
          {children}
        </main>
      </div>

      <VendorBottomNav />
    </div>
  );
}

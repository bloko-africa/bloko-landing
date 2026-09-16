import { PLATFORM_MENTIONS_LEGALES } from "@/lib/legal-content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function PlatformMentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-(--breakpoint-md) px-4 py-16">
      <h1 className="text-heading-5 font-medium text-dark dark:text-white">
        Mentions légales
      </h1>
      <div
        className="rich-text mt-8 text-body-sm text-dark-5 dark:text-dark-6"
        dangerouslySetInnerHTML={{ __html: PLATFORM_MENTIONS_LEGALES }}
      />
    </div>
  );
}

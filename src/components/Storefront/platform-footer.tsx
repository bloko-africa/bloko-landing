import Image from "next/image";
import Link from "next/link";

export function PlatformFooter() {
  return (
    <footer className="bg-dark dark:bg-black">
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col items-center gap-3 px-4 py-8 text-center md:px-8">
        <div className="relative h-7 w-28">
          <Image src="/brand/bloko-logo.png" alt="Bloko" fill className="object-contain" sizes="112px" />
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-body-xs text-dark-7">
          <Link href="/mentions-legales" className="hover:text-white">
            Mentions légales
          </Link>
          <Link href="/cgu" className="hover:text-white">
            Conditions générales d&apos;utilisation
          </Link>
        </nav>
      </div>
    </footer>
  );
}

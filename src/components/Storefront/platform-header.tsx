import Image from "next/image";
import Link from "next/link";

// Header minimal de l'accueil plateforme (direction A du design) — pas de
// panier ni de "mon compte" : ceux-ci n'existent qu'une fois entré dans une
// boutique via /b/[handle] (StorefrontHeader, composant séparé). Fond noir
// (comme le hero et le footer) : le logo Bloko est blanc, il a besoin d'un
// fond sombre pour être visible.
export function PlatformHeader() {
  return (
    <header className="sticky top-0 z-30 bg-dark dark:bg-black">
      <div className="mx-auto flex h-16 max-w-(--breakpoint-2xl) items-center justify-between px-4 md:px-8">
        <Link href="/" className="relative block h-6 w-24">
          <Image
            src="/brand/bloko-logo.png"
            alt="Bloko"
            fill
            priority
            className="object-contain object-left"
            sizes="96px"
          />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/pourquoi-bloko"
            className="hidden text-body-xs font-medium uppercase tracking-wide text-dark-7 hover:text-white sm:block"
          >
            Pourquoi Bloko
          </Link>
          <Link
            href="/decouvrir"
            className="text-body-xs font-medium uppercase tracking-wide text-dark-7 hover:text-white"
          >
            Découvrir
          </Link>
        </nav>
      </div>
    </header>
  );
}

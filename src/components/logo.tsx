import Image from "next/image";

// Logo Bloko blanc sur transparent — a besoin d'un fond sombre pour être
// visible, d'où le badge noir (la sidebar admin est en fond clair par
// défaut, contrairement au header/footer plateforme déjà noirs).
export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-dark dark:bg-black">
        <Image src="/brand/bloko-icon.png" alt="" width={16} height={18} />
      </span>
      <span className="text-heading-6 font-black uppercase tracking-tight text-dark dark:text-white">
        Bloko
      </span>
    </span>
  );
}

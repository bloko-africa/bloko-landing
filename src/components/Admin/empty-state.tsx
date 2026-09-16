import type { ReactNode } from "react";

// Un seul vocabulaire d'état vide pour toutes les listes admin — chaque
// liste réinventait sa propre phrase ("Aucun X pour le moment") sans
// expliquer le mécanisme qui la remplit. `hint` porte cette explication
// (ex: "apparaît automatiquement dès qu'une commande est payée"),
// `action` un CTA optionnel quand l'utilisatrice peut agir directement.
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-5.5 py-10 text-center">
      <p className="text-body-sm font-medium text-dark dark:text-white">{title}</p>
      {hint && <p className="mt-1 text-body-xs text-dark-5 dark:text-dark-6">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

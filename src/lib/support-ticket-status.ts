// Libellés/couleurs de SupportTicketStatus partagés entre l'admin (liste et
// détail ticket) et les pages acheteuse — une seule source pour ne pas
// désynchroniser les libellés entre les deux publics.
export const SUPPORT_TICKET_STATUS_LABEL: Record<string, string> = {
  OUVERT: "Ouvert",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
  FERME: "Fermé",
};

export const SUPPORT_TICKET_STATUS_STYLE: Record<string, string> = {
  OUVERT: "bg-yellow-light-4 text-yellow-dark-2",
  EN_COURS: "bg-blue-light-5 text-blue-dark",
  RESOLU: "bg-green-light-6 text-green-dark",
  FERME: "bg-gray-2 text-dark-5 dark:bg-dark-2 dark:text-dark-6",
};

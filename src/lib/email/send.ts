import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

export type EmailCategory = "commande" | "livraison" | "support" | "compte";

/**
 * Un transporteur PAR boîte réelle — pas un simple "From" différent sur la
 * même connexion. OVH n'accepte pas forcément qu'on envoie "de la part de"
 * une adresse qui n'est pas celle authentifiée : plutôt que de parier
 * là-dessus, chaque boîte réellement créée s'authentifie avec ses propres
 * identifiants. "commande"/"livraison" partagent noreply@bloko.me (aucune
 * réponse attendue) ; "support" a sa propre boîte (support@bloko.me),
 * la seule où quelqu'un peut légitimement répondre.
 */
function buildTransporter(user?: string, pass?: string): Transporter | null {
  if (!process.env.SMTP_HOST || !user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    // OVH : 465 = SSL direct, 587 = STARTTLS. On déduit du port plutôt que
    // d'exiger une variable en plus.
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: { user, pass },
  });
}

const noreplyTransporter = buildTransporter(process.env.SMTP_USER, process.env.SMTP_PASSWORD);
const supportTransporter = buildTransporter(
  process.env.SMTP_SUPPORT_USER,
  process.env.SMTP_SUPPORT_PASSWORD,
);

const CONFIG_BY_CATEGORY: Record<
  EmailCategory,
  { transporter: Transporter | null; from: string }
> = {
  commande: { transporter: noreplyTransporter, from: `Bloko <${process.env.SMTP_USER}>` },
  livraison: {
    transporter: noreplyTransporter,
    from: `Bloko Livraison <${process.env.SMTP_USER}>`,
  },
  // Connexion (lien magique, code), récupération de mot de passe — aucune
  // réponse attendue, même boîte que commande/livraison.
  compte: { transporter: noreplyTransporter, from: `Bloko <${process.env.SMTP_USER}>` },
  support: {
    transporter: supportTransporter,
    from: `Bloko SAV <${process.env.SMTP_SUPPORT_USER}>`,
  },
};

/**
 * Best-effort, comme les notifs push : un échec d'envoi email ne doit
 * jamais bloquer le flux (commande, webhook paiement, mise à jour
 * livraison) qui l'a déclenché. Si la boîte correspondante n'est pas
 * configurée (variables vides), ne fait simplement rien.
 */
export async function sendEmail({
  to,
  subject,
  html,
  category,
}: {
  to: string;
  subject: string;
  html: string;
  category: EmailCategory;
}): Promise<void> {
  const { transporter, from } = CONFIG_BY_CATEGORY[category];
  if (!transporter) return;

  try {
    await transporter.sendMail({ from, to, subject, html });
  } catch (error) {
    console.error("Échec envoi email:", error);
  }
}

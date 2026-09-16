import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

export function SupportReplyEmail({
  subject,
  reference,
  ticketUrl,
}: {
  subject: string;
  reference: string;
  ticketUrl: string;
}) {
  return (
    <EmailLayout preview={`Réponse à ton ticket — ${subject}`}>
      <Heading style={{ fontSize: "20px", color: "#141414" }}>
        Nouvelle réponse à ton ticket SAV
      </Heading>
      <Text style={{ fontSize: "14px", color: "#3d3d3d" }}>
        Commande <strong>{reference}</strong> — {subject}
      </Text>
      <Button
        href={ticketUrl}
        style={{
          backgroundColor: "#141414",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Voir la conversation
      </Button>
    </EmailLayout>
  );
}

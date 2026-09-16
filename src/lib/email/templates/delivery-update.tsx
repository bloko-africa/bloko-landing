import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

const MESSAGE_BY_STATUS: Record<string, string> = {
  EN_ROUTE: "Ta commande est en route.",
  LIVREE: "Ta commande a été livrée.",
  ECHEC: "La livraison de ta commande a rencontré un problème — la boutique va te recontacter.",
};

export function DeliveryUpdateEmail({
  reference,
  status,
  orderUrl,
}: {
  reference: string;
  status: string;
  orderUrl: string;
}) {
  return (
    <EmailLayout preview={`Commande ${reference} — mise à jour livraison`}>
      <Heading style={{ fontSize: "20px", color: "#141414" }}>
        {MESSAGE_BY_STATUS[status] ?? "Mise à jour de ta livraison"}
      </Heading>
      <Text style={{ fontSize: "14px", color: "#3d3d3d" }}>
        Commande <strong>{reference}</strong>.
      </Text>
      <Button
        href={orderUrl}
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
        Voir le suivi complet
      </Button>
    </EmailLayout>
  );
}

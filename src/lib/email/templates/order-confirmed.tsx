import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

export function OrderConfirmedEmail({
  customerName,
  reference,
  amount,
  orderUrl,
}: {
  customerName: string;
  reference: string;
  amount: string;
  orderUrl: string;
}) {
  return (
    <EmailLayout preview={`Paiement confirmé — commande ${reference}`}>
      <Heading style={{ fontSize: "20px", color: "#141414" }}>
        Paiement confirmé
      </Heading>
      <Text style={{ fontSize: "14px", color: "#3d3d3d" }}>
        Bonjour {customerName},
      </Text>
      <Text style={{ fontSize: "14px", color: "#3d3d3d" }}>
        Ton paiement de <strong>{amount}</strong> pour la commande{" "}
        <strong>{reference}</strong> est confirmé. La vendeuse prépare ta
        commande pour l&apos;expédier.
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
        Suivre ma commande
      </Button>
    </EmailLayout>
  );
}

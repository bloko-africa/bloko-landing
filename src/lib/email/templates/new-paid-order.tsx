import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

export function NewPaidOrderEmail({
  boutiqueName,
  reference,
  amount,
  orderUrl,
}: {
  boutiqueName: string;
  reference: string;
  amount: string;
  orderUrl: string;
}) {
  return (
    <EmailLayout preview={`Commande payée — ${reference}`}>
      <Heading style={{ fontSize: "20px", color: "#141414" }}>
        Commande payée
      </Heading>
      <Text style={{ fontSize: "14px", color: "#3d3d3d" }}>
        {boutiqueName}, une commande vient d&apos;être payée : <strong>{reference}</strong> —{" "}
        <strong>{amount}</strong>.
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
        Voir la commande
      </Button>
    </EmailLayout>
  );
}

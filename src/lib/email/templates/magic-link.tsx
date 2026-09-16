import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

export function MagicLinkEmail({ url }: { url: string }) {
  return (
    <EmailLayout preview="Ton lien de connexion Bloko">
      <Heading style={{ fontSize: "20px", color: "#141414" }}>
        Ton lien de connexion
      </Heading>
      <Text style={{ fontSize: "14px", color: "#3d3d3d" }}>
        Clique sur le bouton ci-dessous pour te connecter à Bloko. Ce lien
        expire dans 5 minutes et ne peut servir qu&apos;une seule fois.
      </Text>
      <Button
        href={url}
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
        Me connecter
      </Button>
      <Text style={{ fontSize: "12px", color: "#737373", marginTop: "24px" }}>
        Si tu n&apos;es pas à l&apos;origine de cette demande, ignore cet
        email — aucun compte ne sera créé ni modifié.
      </Text>
    </EmailLayout>
  );
}

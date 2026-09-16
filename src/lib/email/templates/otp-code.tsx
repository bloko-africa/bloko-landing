import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

const TITLE_BY_TYPE: Record<string, string> = {
  "sign-in": "Ton code de connexion",
  "forget-password": "Ton code de réinitialisation",
};

const INTRO_BY_TYPE: Record<string, string> = {
  "sign-in": "Saisis ce code pour te connecter à Bloko.",
  "forget-password": "Saisis ce code pour choisir un nouveau mot de passe.",
};

export function OtpCodeEmail({
  otp,
  type,
}: {
  otp: string;
  type: "sign-in" | "forget-password" | "email-verification" | "change-email";
}) {
  const title = TITLE_BY_TYPE[type] ?? "Ton code Bloko";
  const intro = INTRO_BY_TYPE[type] ?? "Saisis ce code pour continuer.";

  return (
    <EmailLayout preview={`${title} : ${otp}`}>
      <Heading style={{ fontSize: "20px", color: "#141414" }}>{title}</Heading>
      <Text style={{ fontSize: "14px", color: "#3d3d3d" }}>{intro}</Text>
      <Text
        style={{
          fontSize: "32px",
          fontWeight: 700,
          letterSpacing: "8px",
          color: "#141414",
          textAlign: "center" as const,
          margin: "24px 0",
        }}
      >
        {otp}
      </Text>
      <Text style={{ fontSize: "12px", color: "#737373" }}>
        Ce code expire dans 5 minutes. Si tu n&apos;es pas à l&apos;origine de
        cette demande, ignore cet email.
      </Text>
    </EmailLayout>
  );
}

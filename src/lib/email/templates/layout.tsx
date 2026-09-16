import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { PropsWithChildren } from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bloko.me";

/**
 * Habillage commun à tous les emails transactionnels : bandeau noir + logo
 * (même traitement que le header/footer du site — le logo est blanc, donc
 * toujours sur fond noir), corps blanc, Poppins comme sur le site.
 */
export function EmailLayout({
  preview,
  children,
}: PropsWithChildren<{ preview: string }>) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f4f2ef", margin: 0, fontFamily: "Poppins, sans-serif" }}>
        <Section style={{ backgroundColor: "#141414", padding: "20px 0", textAlign: "center" as const }}>
          <Img src={`${APP_URL}/brand/bloko-logo.png`} alt="Bloko" height={22} style={{ margin: "0 auto" }} />
        </Section>

        <Container style={{ backgroundColor: "#ffffff", padding: "32px", maxWidth: "480px" }}>
          {children}
        </Container>

        <Container style={{ maxWidth: "480px", padding: "0 32px 32px" }}>
          <Hr style={{ borderColor: "#e8e5e0" }} />
          <Text style={{ fontSize: "12px", color: "#737373", textAlign: "center" as const }}>
            Bloko — le marché des boutiques TikTok.{" "}
            <Link href={`${APP_URL}/mentions-legales`} style={{ color: "#737373" }}>
              Mentions légales
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

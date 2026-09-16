import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

export function BroadcastEmail({
  boutiqueName,
  subject,
  message,
}: {
  boutiqueName: string;
  subject: string;
  message: string;
}) {
  return (
    <EmailLayout preview={subject}>
      <Heading style={{ fontSize: "20px", color: "#141414" }}>{subject}</Heading>
      {message.split("\n").map((line, i) => (
        <Text key={i} style={{ fontSize: "14px", color: "#3d3d3d" }}>
          {line || " "}
        </Text>
      ))}
      <Text style={{ fontSize: "12px", color: "#8a8076", marginTop: "24px" }}>
        Message envoyé par {boutiqueName} via Bloko.
      </Text>
    </EmailLayout>
  );
}

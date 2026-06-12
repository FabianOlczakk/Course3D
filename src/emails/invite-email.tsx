import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface InviteEmailProps {
  inviteUrl: string;
}

export function InviteEmail({ inviteUrl }: InviteEmailProps) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>Zostałeś zaproszony do platformy Course3D</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Witaj w Course3D!</Heading>
          <Text style={paragraph}>
            Otrzymujesz tę wiadomość, ponieważ utworzono dla Ciebie konto na
            platformie kursu druku 3D <strong>Course3D</strong>.
          </Text>
          <Text style={paragraph}>
            Aby dokończyć rejestrację, ustaw swoją nazwę użytkownika oraz hasło,
            klikając w poniższy przycisk:
          </Text>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button style={button} href={inviteUrl}>
              Ustaw hasło i aktywuj konto
            </Button>
          </Section>
          <Text style={paragraph}>
            Jeśli przycisk nie działa, skopiuj poniższy link do przeglądarki:
          </Text>
          <Text style={link}>{inviteUrl}</Text>
          <Text style={footer}>
            Link jest ważny przez 7 dni. Jeśli nie spodziewałeś się tej
            wiadomości, zignoruj ją.
          </Text>
          <Text style={footer}>— Zespół Course3D</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InviteEmail;

const main: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0f172a",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#334155",
};

const button: React.CSSProperties = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "12px 24px",
  borderRadius: "6px",
};

const link: React.CSSProperties = {
  fontSize: "13px",
  color: "#2563eb",
  wordBreak: "break-all",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "16px",
};

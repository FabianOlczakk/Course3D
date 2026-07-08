import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  "https://kurs.magbase.pl";

interface InviteEmailProps {
  inviteUrl: string;
}

export function InviteEmail({ inviteUrl }: InviteEmailProps) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>Zostałeś zaproszony do Interaktywnego Kursu Druku 3D</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <Img
              src={`${APP_URL}/logo.png`}
              alt="Interaktywny Kurs Druku 3D"
              width="48"
              height="48"
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
            <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "10px", fontSize: "18px", fontWeight: 600, color: "#0f172a" }}>
              Interaktywny kurs 3D
            </span>
          </Section>
          <Text style={heading}>Witaj w kursie!</Text>
          <Text style={paragraph}>
            Otrzymujesz tę wiadomość, ponieważ utworzono dla Ciebie konto na
            platformie <strong>Interaktywnego Kursu Druku 3D</strong>.
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
          <Text style={footer}>— Interaktywny Kurs Druku 3D</Text>
          <Text style={unsubscribe}>
            <a href={`${APP_URL}/profile`} style={{ color: "#94a3b8" }}>Wypisz się z newslettera</a> · <a href={APP_URL} style={{ color: "#94a3b8" }}>kurs.magbase.pl</a>
          </Text>
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
  padding: "0 16px",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#0f172a",
  marginTop: 0,
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

const unsubscribe: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  marginTop: "8px",
  textAlign: "center",
};

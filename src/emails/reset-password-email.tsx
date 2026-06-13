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

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>Resetowanie hasła w platformie Course3D</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset hasła</Heading>
          <Text style={paragraph}>
            Otrzymujesz tę wiadomość, ponieważ poproszono o zresetowanie hasła do
            Twojego konta na platformie <strong>Course3D</strong>.
          </Text>
          <Text style={paragraph}>
            Aby ustawić nowe hasło, kliknij w poniższy przycisk:
          </Text>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button style={button} href={resetUrl}>
              Ustaw nowe hasło
            </Button>
          </Section>
          <Text style={paragraph}>
            Jeśli przycisk nie działa, skopiuj poniższy link do przeglądarki:
          </Text>
          <Text style={link}>{resetUrl}</Text>
          <Text style={footer}>
            Link jest ważny przez 1 godzinę. Jeśli nie prosiłeś o reset hasła,
            zignoruj tę wiadomość — Twoje hasło pozostanie bez zmian.
          </Text>
          <Text style={footer}>— Zespół Course3D</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ResetPasswordEmail;

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
  backgroundColor: "#7c3aed",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "12px 24px",
  borderRadius: "6px",
};

const link: React.CSSProperties = {
  fontSize: "13px",
  color: "#7c3aed",
  wordBreak: "break-all",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "16px",
};

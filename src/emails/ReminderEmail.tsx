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

export interface ReminderEmailProps {
  userName: string;
  checkInUrl: string;
  lastCheckIn: string;
}

/**
 * Email template for check-in reminders.
 *
 * Sent to users who are overdue for their scheduled check-in.
 * Clean, professional design with a clear call-to-action.
 */
export function ReminderEmail({
  userName,
  checkInUrl,
  lastCheckIn,
}: ReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Time for your ALVIN check-in</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>ALVIN Check-In Reminder</Heading>

          <Text style={paragraphStyle}>Hello {userName},</Text>

          <Text style={paragraphStyle}>
            This is a friendly reminder that you are due for a check-in. Your
            last check-in was {lastCheckIn}.
          </Text>

          <Text style={paragraphStyle}>
            Taking a moment to check in helps ensure your contacts know you are
            doing well.
          </Text>

          <Section style={buttonContainerStyle}>
            <Button style={buttonStyle} href={checkInUrl}>
              Check In Now
            </Button>
          </Section>

          <Text style={footerTextStyle}>
            You are receiving this email because you have an active ALVIN
            account with check-in reminders enabled. If you did not sign up for
            ALVIN, please disregard this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Inline styles for email client compatibility
const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "40px 0",
  margin: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "40px",
};

const headingStyle: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const paragraphStyle: React.CSSProperties = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const buttonContainerStyle: React.CSSProperties = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1",
  padding: "14px 32px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const footerTextStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "32px 0 0 0",
  textAlign: "center" as const,
};

export default ReminderEmail;

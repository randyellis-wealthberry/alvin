import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export interface ContactAlertEmailProps {
  contactName: string;
  userName: string;
  alertLevel: "L3" | "L4";
  lastCheckIn: string;
}

/**
 * Email template for alert notifications sent to family contacts.
 *
 * L3 (LEVEL_3): Concerned tone - sent to primary contact only
 * L4 (LEVEL_4): Urgent tone - sent to all contacts
 *
 * This is an informational email - no button/CTA needed because
 * contacts cannot take action in the app. The email prompts them
 * to reach out via phone/text.
 */
export function ContactAlertEmail({
  contactName,
  userName,
  alertLevel,
  lastCheckIn,
}: ContactAlertEmailProps) {
  const isUrgent = alertLevel === "L4";

  return (
    <Html>
      <Head />
      <Preview>
        {isUrgent
          ? `Urgent: Please contact ${userName}`
          : `We haven't heard from ${userName}`}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>
            {isUrgent ? "Urgent Alert" : "Wellness Check Request"}
          </Heading>

          <Text style={paragraphStyle}>Hello {contactName},</Text>

          <Text style={paragraphStyle}>
            {isUrgent
              ? `We haven't been able to reach ${userName} for an extended period. Their last check-in was ${lastCheckIn}.`
              : `We haven't heard from ${userName} in a while. Their last check-in was ${lastCheckIn}.`}
          </Text>

          <Text style={paragraphStyle}>
            {isUrgent
              ? "Please attempt to contact them as soon as possible to ensure they are okay."
              : "If you have a chance, please check in with them to make sure everything is alright."}
          </Text>

          <Text style={footerTextStyle}>
            ALVIN is a wellness monitoring service that helps family stay
            connected. You are receiving this email because you were designated
            as a trusted contact.
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

const footerTextStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "32px 0 0 0",
  textAlign: "center" as const,
};

export default ContactAlertEmail;

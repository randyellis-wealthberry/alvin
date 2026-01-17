/**
 * Detects if user messages indicate they are okay and can be checked in.
 *
 * Start simple with explicit phrases. Can add LLM-based detection later.
 * Per 05-RESEARCH.md open questions: "Start simple - explicit phrases trigger check-in"
 */

// Phrases that indicate user is okay (case-insensitive)
const CHECK_IN_PHRASES = [
  "i'm okay",
  "im okay",
  "i'm fine",
  "im fine",
  "i'm good",
  "im good",
  "i'm doing well",
  "im doing well",
  "doing great",
  "doing good",
  "all good",
  "all is well",
  "everything is fine",
  "everything's fine",
  "just checking in",
  "checking in",
  "i'm alright",
  "im alright",
  "feeling good",
  "feeling great",
  "feeling fine",
];

// Phrases that negate wellness (should NOT trigger check-in)
const NEGATION_PHRASES = [
  "not okay",
  "not fine",
  "not good",
  "not doing well",
  "not great",
  "not alright",
  "could be better",
  "been better",
  "struggling",
  "having a hard time",
  "stressed",
  "worried",
  "anxious",
  "depressed",
  "sad",
  "upset",
];

export interface CheckInDetectionResult {
  shouldCheckIn: boolean;
  confidence: "high" | "medium" | "low";
  matchedPhrase?: string;
}

export function detectCheckIn(userMessage: string): CheckInDetectionResult {
  const normalized = userMessage.toLowerCase().trim();

  // Check for negation first
  for (const phrase of NEGATION_PHRASES) {
    if (normalized.includes(phrase)) {
      return { shouldCheckIn: false, confidence: "high" };
    }
  }

  // Check for positive phrases
  for (const phrase of CHECK_IN_PHRASES) {
    if (normalized.includes(phrase)) {
      return {
        shouldCheckIn: true,
        confidence: "high",
        matchedPhrase: phrase,
      };
    }
  }

  return { shouldCheckIn: false, confidence: "low" };
}

/**
 * Analyzes a conversation to see if a check-in should be recorded.
 * Looks at the most recent user messages.
 */
export function analyzeConversationForCheckIn(
  messages: Array<{ role: string; content: string }>,
): CheckInDetectionResult {
  // Get last 3 user messages (most relevant for check-in context)
  const recentUserMessages = messages
    .filter((m) => m.role === "user")
    .slice(-3);

  for (const msg of recentUserMessages) {
    const result = detectCheckIn(msg.content);
    if (result.shouldCheckIn) {
      return result;
    }
  }

  return { shouldCheckIn: false, confidence: "low" };
}

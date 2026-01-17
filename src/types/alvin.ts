/**
 * Type-safe string enums for ALVIN's Prisma schema.
 * SQLite doesn't support native enums, so we use String fields
 * with TypeScript const objects for type safety.
 */

// Alert escalation levels
export const AlertLevel = {
  LEVEL_1: "LEVEL_1",
  LEVEL_2: "LEVEL_2",
  LEVEL_3: "LEVEL_3",
  LEVEL_4: "LEVEL_4",
  CANCELLED: "CANCELLED",
  RESOLVED: "RESOLVED",
} as const;
export type AlertLevel = (typeof AlertLevel)[keyof typeof AlertLevel];

// Check-in methods (already in use, now type-safe)
export const CheckInMethod = {
  MANUAL: "MANUAL",
  BIOMETRIC: "BIOMETRIC",
  CONVERSATION: "CONVERSATION",
} as const;
export type CheckInMethod = (typeof CheckInMethod)[keyof typeof CheckInMethod];

// Contact relationship types
export const ContactRelationship = {
  SPOUSE: "spouse",
  CHILD: "child",
  SIBLING: "sibling",
  FRIEND: "friend",
  OTHER: "other",
} as const;
export type ContactRelationship =
  (typeof ContactRelationship)[keyof typeof ContactRelationship];

// Message roles (already in use, now type-safe)
export const MessageRole = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

import { db } from "~/server/db";
import { calculateNextCheckInDue } from "~/lib/reminders/eligibility";

/**
 * Alert escalation levels
 */
export const ALERT_LEVELS = {
  LEVEL_1: "LEVEL_1",
  LEVEL_2: "LEVEL_2",
  LEVEL_3: "LEVEL_3",
  LEVEL_4: "LEVEL_4",
  CANCELLED: "CANCELLED",
  RESOLVED: "RESOLVED",
} as const;

export type AlertLevel = (typeof ALERT_LEVELS)[keyof typeof ALERT_LEVELS];

/**
 * Escalation thresholds in hours
 * - LEVEL_1: 24 hours after missed check-in
 * - LEVEL_2: 24 hours after LEVEL_1
 * - LEVEL_3: 24 hours after LEVEL_2
 * - LEVEL_4: 24 hours after LEVEL_3
 */
export const ESCALATION_THRESHOLDS: Record<string, number> = {
  LEVEL_1: 24,
  LEVEL_2: 24,
  LEVEL_3: 24,
  LEVEL_4: 24,
};

/**
 * Active alert levels (not terminal states)
 */
export const ACTIVE_LEVELS: string[] = [
  ALERT_LEVELS.LEVEL_1,
  ALERT_LEVELS.LEVEL_2,
  ALERT_LEVELS.LEVEL_3,
  ALERT_LEVELS.LEVEL_4,
];

/**
 * Get the next escalation level for a given level.
 *
 * @param currentLevel - Current alert level
 * @returns Next level, or null if at terminal state
 */
export function getNextLevel(currentLevel: string): string | null {
  switch (currentLevel) {
    case ALERT_LEVELS.LEVEL_1:
      return ALERT_LEVELS.LEVEL_2;
    case ALERT_LEVELS.LEVEL_2:
      return ALERT_LEVELS.LEVEL_3;
    case ALERT_LEVELS.LEVEL_3:
      return ALERT_LEVELS.LEVEL_4;
    case ALERT_LEVELS.LEVEL_4:
      return null; // Terminal state
    case ALERT_LEVELS.CANCELLED:
    case ALERT_LEVELS.RESOLVED:
      return null; // Terminal states
    default:
      return null;
  }
}

/**
 * Check if a user profile should have an alert created.
 *
 * Returns true if:
 * - Profile is overdue (next check-in is in the past)
 * - No active alert exists (level not in CANCELLED/RESOLVED)
 *
 * @param profile - User profile with check-in settings
 * @param existingAlerts - Array of existing alerts for the profile
 * @returns true if an alert should be created
 */
export function shouldCreateAlert(
  profile: {
    lastCheckInAt: Date | null;
    checkInFrequencyHours: number;
    preferredCheckInTime: string | null;
    timezone: string;
  },
  existingAlerts: Array<{ level: string }>
): boolean {
  // Calculate when the next check-in is due
  const nextDue = calculateNextCheckInDue(profile);
  const now = new Date();

  // Not overdue yet
  if (nextDue > now) {
    return false;
  }

  // Check if there's already an active alert
  const hasActiveAlert = existingAlerts.some((alert) =>
    ACTIVE_LEVELS.includes(alert.level)
  );

  return !hasActiveAlert;
}

/**
 * Check if an alert should be escalated to the next level.
 *
 * Returns true if:
 * - Time since lastEscalatedAt (or triggeredAt) exceeds threshold for current level
 * - Level is not LEVEL_4, CANCELLED, or RESOLVED
 *
 * @param alert - Alert to check
 * @param now - Current time (for testability)
 * @returns true if the alert should be escalated
 */
export function shouldEscalate(
  alert: {
    level: string;
    triggeredAt: Date;
    lastEscalatedAt: Date | null;
  },
  now: Date = new Date()
): boolean {
  // Terminal states cannot be escalated
  if (
    alert.level === ALERT_LEVELS.LEVEL_4 ||
    alert.level === ALERT_LEVELS.CANCELLED ||
    alert.level === ALERT_LEVELS.RESOLVED
  ) {
    return false;
  }

  const thresholdHours = ESCALATION_THRESHOLDS[alert.level];
  if (!thresholdHours) {
    return false;
  }

  // Use lastEscalatedAt if available, otherwise triggeredAt
  const lastTransition = alert.lastEscalatedAt ?? alert.triggeredAt;
  const thresholdMs = thresholdHours * 60 * 60 * 1000;
  const timeSinceTransition = now.getTime() - lastTransition.getTime();

  return timeSinceTransition >= thresholdMs;
}

export interface UserNeedingAlert {
  userId: string;
  email: string | null;
  name: string | null;
  profileId: string;
  lastCheckInAt: Date | null;
  nextCheckInDue: Date;
  checkInFrequencyHours: number;
}

/**
 * Find all users who need an alert created.
 *
 * A user needs an alert if:
 * - Their profile is active
 * - They are overdue for a check-in
 * - They don't have an active alert
 *
 * @returns Array of users needing alerts
 */
export async function findUsersNeedingAlerts(): Promise<UserNeedingAlert[]> {
  const now = new Date();

  // Get all active profiles with their alerts and user data
  const profiles = await db.userProfile.findMany({
    where: {
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      alerts: {
        where: {
          level: {
            in: ACTIVE_LEVELS,
          },
        },
        select: {
          level: true,
        },
      },
    },
  });

  const usersNeedingAlerts: UserNeedingAlert[] = [];

  for (const profile of profiles) {
    const nextDue = calculateNextCheckInDue(profile);

    // Check if overdue and no active alert
    if (nextDue <= now && profile.alerts.length === 0) {
      usersNeedingAlerts.push({
        userId: profile.user.id,
        email: profile.user.email,
        name: profile.user.name,
        profileId: profile.id,
        lastCheckInAt: profile.lastCheckInAt,
        nextCheckInDue: nextDue,
        checkInFrequencyHours: profile.checkInFrequencyHours,
      });
    }
  }

  return usersNeedingAlerts;
}

/**
 * Find all alerts that need to be escalated to the next level.
 *
 * An alert needs escalation if:
 * - Level is LEVEL_1, LEVEL_2, or LEVEL_3
 * - Time since last transition exceeds threshold
 *
 * @returns Array of alerts needing escalation
 */
export async function findAlertsNeedingEscalation(): Promise<
  Array<{
    id: string;
    level: string;
    triggeredAt: Date;
    lastEscalatedAt: Date | null;
    userProfileId: string | null;
  }>
> {
  const now = new Date();

  // Get alerts that could potentially need escalation
  const alerts = await db.alert.findMany({
    where: {
      level: {
        in: [ALERT_LEVELS.LEVEL_1, ALERT_LEVELS.LEVEL_2, ALERT_LEVELS.LEVEL_3],
      },
    },
    select: {
      id: true,
      level: true,
      triggeredAt: true,
      lastEscalatedAt: true,
      userProfileId: true,
    },
  });

  // Filter to those that actually need escalation
  return alerts.filter((alert) => shouldEscalate(alert, now));
}

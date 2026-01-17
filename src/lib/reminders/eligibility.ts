import { db } from "~/server/db";

export interface UserNeedingReminder {
  userId: string;
  email: string | null;
  name: string | null;
  profileId: string;
  lastCheckInAt: Date | null;
  nextCheckInDue: Date | null;
  checkInFrequencyHours: number;
  preferredCheckInTime: string | null;
  timezone: string;
}

/**
 * Calculate when the next check-in is due based on profile settings.
 *
 * If preferredCheckInTime is set, the next due time will be at that time
 * in the user's timezone, after the calculated base time.
 *
 * @param profile - User profile with check-in settings
 * @returns Date when next check-in is due
 */
export function calculateNextCheckInDue(profile: {
  lastCheckInAt: Date | null;
  checkInFrequencyHours: number;
  preferredCheckInTime: string | null;
  timezone: string;
}): Date {
  const now = new Date();
  const baseTime = profile.lastCheckInAt ?? now;

  // Calculate base due time (last check-in + frequency hours)
  const baseDue = new Date(
    baseTime.getTime() + profile.checkInFrequencyHours * 60 * 60 * 1000
  );

  // If no preferred time set, return the base due time
  if (!profile.preferredCheckInTime) {
    return baseDue;
  }

  // Parse preferred time (HH:MM format)
  const [hoursStr, minutesStr] = profile.preferredCheckInTime.split(":");
  const preferredHours = parseInt(hoursStr ?? "0", 10);
  const preferredMinutes = parseInt(minutesStr ?? "0", 10);

  // Get the date in user's timezone and set preferred time
  // We need to find the next occurrence of preferredCheckInTime that is >= baseDue

  // Create a date formatter to get date parts in user's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: profile.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Get baseDue date parts in user's timezone
  const parts = formatter.formatToParts(baseDue);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";

  const baseDueYear = parseInt(getPart("year"), 10);
  const baseDueMonth = parseInt(getPart("month"), 10) - 1; // 0-indexed
  const baseDueDay = parseInt(getPart("day"), 10);
  const baseDueHour = parseInt(getPart("hour"), 10);
  const baseDueMinute = parseInt(getPart("minute"), 10);

  // Calculate the preferred time on the same day as baseDue (in user's timezone)
  // Then convert back to UTC

  // Get timezone offset for the target date
  const getTimezoneOffset = (date: Date, tz: string): number => {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
    return (utcDate.getTime() - tzDate.getTime()) / 60000; // in minutes
  };

  // Create candidate date at preferred time on baseDue's date
  let candidateLocal = new Date(
    baseDueYear,
    baseDueMonth,
    baseDueDay,
    preferredHours,
    preferredMinutes,
    0,
    0
  );

  // Adjust for timezone offset to get UTC time
  const offset = getTimezoneOffset(candidateLocal, profile.timezone);
  let candidate = new Date(candidateLocal.getTime() + offset * 60000);

  // If the current hour:minute on baseDue day in user's TZ is already past preferred time,
  // move to next day
  const baseDueTimeMinutes = baseDueHour * 60 + baseDueMinute;
  const preferredTimeMinutes = preferredHours * 60 + preferredMinutes;

  if (baseDueTimeMinutes > preferredTimeMinutes) {
    // Add one day
    candidate = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
  }

  return candidate;
}

/**
 * Find all users who need check-in reminders.
 *
 * A user needs a reminder if:
 * - Their profile is active (isActive = true)
 * - They are overdue for a check-in (lastCheckInAt + checkInFrequencyHours < now)
 *   OR nextCheckInDue < now
 *
 * @returns Array of users needing reminders with their profile data
 */
export async function findUsersNeedingReminders(): Promise<
  UserNeedingReminder[]
> {
  const now = new Date();

  // Get all active profiles with their user data
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
    },
  });

  const usersNeedingReminders: UserNeedingReminder[] = [];

  for (const profile of profiles) {
    const nextDue = calculateNextCheckInDue(profile);

    // User needs reminder if nextDue is in the past (they're overdue)
    if (nextDue <= now) {
      usersNeedingReminders.push({
        userId: profile.user.id,
        email: profile.user.email,
        name: profile.user.name,
        profileId: profile.id,
        lastCheckInAt: profile.lastCheckInAt,
        nextCheckInDue: nextDue,
        checkInFrequencyHours: profile.checkInFrequencyHours,
        preferredCheckInTime: profile.preferredCheckInTime,
        timezone: profile.timezone,
      });
    }
  }

  return usersNeedingReminders;
}

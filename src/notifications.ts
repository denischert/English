import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const WEEKDAYS = [2, 4, 6]; // expo-notifications: 1=Sunday ... 7=Saturday -> Mon, Wed, Fri

export async function scheduleWeeklyReminders(hour = 18, minute = 0): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const weekday of WEEKDAYS) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "10-minute English practice",
        body: "Time for your business English pronunciation session.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
  }
  return true;
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: Platform.OS !== "web",
      shouldSetBadge: false,
    }),
  });
}

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export async function ensureNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) {
    return true;
  }
  const request = await Notifications.requestPermissionsAsync();
  return request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleTaskReminder(taskId: string, date: Date, title: string) {
  const permitted = await ensureNotificationPermission();
  if (!permitted) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task reminder',
      body: title,
      data: { taskId }
    },
    trigger: date
  });
}

export async function cancelTaskReminder(notificationId: string | null | undefined) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function isBeforeQuietHours(date: Date) {
  if (Platform.OS === 'android') {
    return false;
  }
  const hour = date.getHours();
  return hour < 9;
}

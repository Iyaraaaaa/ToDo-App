import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '@/types/Task';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Skip permissions on web
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  async scheduleTaskNotification(task: Task, userName: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null; // Skip notifications on web
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Parse the date and time
      const taskDateTime = new Date(`${task.date}T${task.time}`);
      const now = new Date();

      // Only schedule if the task is in the future
      if (taskDateTime <= now) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Task Reminder for ${userName}`,
          body: `Don't forget: ${task.title}`,
          data: { taskId: task.id },
        },
        trigger: {
          date: taskDateTime,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  async cancelTaskNotification(notificationId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return; // Skip on web
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      return; // Skip on web
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }
};
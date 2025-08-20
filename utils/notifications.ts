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

    try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

      // For iOS, we also need to request permissions for alerts, sounds, and badges
      if (Platform.OS === 'ios' && finalStatus === 'granted') {
        await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: false,
          },
        });
      }

    return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async scheduleTaskNotification(task: Task, userName: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null; // Skip notifications on web
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return null;
      }

      // Parse the date and time
      const taskDateTime = new Date(`${task.date}T${task.time}`);
      const now = new Date();

      // Only schedule if the task is in the future
      if (taskDateTime <= now) {
        console.log('Task is in the past, not scheduling notification');
        return null;
      }

      // Cancel any existing notification for this task
      await this.cancelTaskNotifications(task.id);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Task Reminder for ${userName}`,
          body: `Don't forget: ${task.title}`,
          data: { taskId: task.id },
          sound: true,
        },
        trigger: {
          date: taskDateTime,
        },
      });

      console.log(`Notification scheduled for task ${task.id} at ${taskDateTime.toISOString()}`);
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

  async cancelTaskNotifications(taskId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return; // Skip on web
    }

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const taskNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.taskId === taskId
      );

      for (const notification of taskNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling task notifications:', error);
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
  },

  async initializeNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      return; // Skip on web
    }

    try {
      // Request permissions on app start
      await this.requestPermissions();
      
      // Set up notification response listener
      Notifications.addNotificationResponseReceivedListener(response => {
        const taskId = response.notification.request.content.data?.taskId;
        if (taskId) {
          console.log('Notification tapped for task:', taskId);
          // You can add navigation logic here if needed
        }
      });
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  },
};
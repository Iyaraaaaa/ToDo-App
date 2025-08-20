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
        try {
          await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowAnnouncements: false,
            },
          });
        } catch (iosError) {
          console.warn('iOS notification permissions error:', iosError);
          // Continue anyway as basic permissions might still work
        }
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async scheduleTaskNotification(task: Task, userName: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web platform');
      return null; // Skip notifications on web
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return null;
      }

      // Validate task data
      if (!task.date || !task.time || !task.title) {
        console.error('Invalid task data for notification:', task);
        return null;
      }

      // Parse the date and time with better error handling
      let taskDateTime: Date;
      try {
        taskDateTime = new Date(`${task.date}T${task.time}`);
        
        // Check if the date is valid
        if (isNaN(taskDateTime.getTime())) {
          console.error('Invalid date/time format:', task.date, task.time);
          return null;
        }
      } catch (dateError) {
        console.error('Error parsing task date/time:', dateError);
        return null;
      }

      const now = new Date();

      // Only schedule if the task is in the future (with 1 minute buffer)
      if (taskDateTime <= new Date(now.getTime() + 60000)) {
        console.log('Task is in the past or too soon, not scheduling notification');
        return null;
      }

      // Cancel any existing notification for this task
      await this.cancelTaskNotifications(task.id);

      // Ensure userName is valid
      const displayName = userName && userName.trim() ? userName.trim() : 'User';

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Task Reminder for ${displayName}`,
          body: `Don't forget: ${task.title}`,
          data: { 
            taskId: task.id,
            taskTitle: task.title 
          },
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
      if (notificationId && notificationId.trim()) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`Cancelled notification: ${notificationId}`);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  async cancelTaskNotifications(taskId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return; // Skip on web
    }

    try {
      if (!taskId || !taskId.trim()) {
        console.warn('Invalid taskId for canceling notifications');
        return;
      }

      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const taskNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.taskId === taskId
      );

      for (const notification of taskNotifications) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`Cancelled notification for task ${taskId}: ${notification.identifier}`);
        } catch (cancelError) {
          console.error(`Error canceling individual notification ${notification.identifier}:`, cancelError);
        }
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
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  async initializeNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Notifications not available on web platform');
      return; // Skip on web
    }

    try {
      // Request permissions on app start
      const hasPermission = await this.requestPermissions();
      if (hasPermission) {
        console.log('Notifications initialized successfully');
      } else {
        console.log('Notifications not available - permissions denied');
      }
      
      // Set up notification response listener
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        try {
          const taskId = response.notification.request.content.data?.taskId;
          const taskTitle = response.notification.request.content.data?.taskTitle;
          
          if (taskId) {
            console.log('Notification tapped for task:', taskId, taskTitle);
            // You can add navigation logic here if needed
          }
        } catch (error) {
          console.error('Error handling notification response:', error);
        }
      });

      // Return cleanup function if needed
      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  },

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },
};
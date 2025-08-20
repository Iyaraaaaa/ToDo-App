import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { NotificationService } from '@/utils/notifications';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize notifications when the app starts
    const initNotifications = async () => {
      try {
        await NotificationService.initializeNotifications();
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };
    
    initNotifications();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="edit-task/[taskId]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

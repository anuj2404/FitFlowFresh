import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// How notifications behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    requestPermissions();

    // Listen for notifications received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user tapping a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      setPermissionGranted(true);
    }

    // Android channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('fitflow-reminders', {
        name: 'FitFlow Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00E5A0',
      });
    }

    return finalStatus === 'granted';
  };

  // Schedule daily reminder at a specific hour and minute
  const scheduleDailyReminder = async (hour = 20, minute = 0) => {
    // Cancel existing reminders first
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔥 Don't break your streak!",
        body: "Log today's habits to keep your streak alive.",
        sound: true,
        data: { screen: 'Log' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return true;
  };

  // Send an immediate test notification
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💪 FitFlow',
        body: 'Notifications are working! Stay on track today.',
        sound: true,
      },
      trigger: null, // immediate
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    permissionGranted,
    scheduleDailyReminder,
    sendTestNotification,
    cancelAllNotifications,
    requestPermissions,
  };
}

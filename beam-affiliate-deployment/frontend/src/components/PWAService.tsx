import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAService: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useRealtime();
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    registerServiceWorker();
    setupInstallPrompt();
    setupNotificationPermission();
    checkInstallationStatus();
  }, []);

  useEffect(() => {
    if (user && notificationPermission === 'granted') {
      subscribeToPushNotifications();
    }
  }, [user, notificationPermission]);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available
                showUpdateNotification();
              }
            });
          }
        });

        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('Message from Service Worker:', event.data);
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const setupInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      setDeferredPrompt(event as unknown as PWAInstallPrompt);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA installed successfully');
    });
  };

  const setupNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);

      // Request permission if not granted
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  };

  const checkInstallationStatus = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await sendSubscriptionToServer(subscription);

      console.log('Subscribed to push notifications:', subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  };

  const installPWA = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const showUpdateNotification = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('Update Available', {
          body: 'A new version is available. Click to update.',
          icon: '/logo192.png',
          requireInteraction: true
        });
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        await subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const sendTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      await requestNotificationPermission();
      return;
    }

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user?.id,
          title: 'Test Notification',
          body: 'This is a test notification from Beam Affiliate!'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      console.log('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Expose functions to window for debugging
  useEffect(() => {
    (window as any).beamPWA = {
      install: installPWA,
      requestNotificationPermission,
      sendTestNotification,
      isInstallable,
      isInstalled,
      notificationPermission
    };
  }, [isInstallable, isInstalled, notificationPermission]);

  return null; // This component doesn't render anything
};

export default PWAService; 
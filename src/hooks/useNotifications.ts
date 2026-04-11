import { useEffect, useRef, useCallback } from 'react';
import { ScheduledTask } from '@/lib/types';

export function useNotifications(scheduledTasks: ScheduledTask[], enabled: boolean = true) {
  const permissionRef = useRef<NotificationPermission>('default');
  const notifiedRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, body: string, tag: string) => {
    if (permissionRef.current !== 'granted') return;
    if (notifiedRef.current.has(tag)) return;
    notifiedRef.current.add(tag);
    new Notification(title, { body, icon: '📚', tag, badge: '📚' });
  }, []);

  // Check every 30 seconds for upcoming tasks
  useEffect(() => {
    if (!enabled || !('Notification' in window)) return;
    requestPermission();

    const checkTasks = () => {
      if (permissionRef.current !== 'granted') return;
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      for (const task of scheduledTasks) {
        if (task.date !== today || task.status !== 'scheduled') continue;

        const [h, m] = task.start_time.split(':').map(Number);
        const taskTime = new Date();
        taskTime.setHours(h, m, 0, 0);
        const diffMin = (taskTime.getTime() - now.getTime()) / 60000;

        // 10 minutes before
        if (diffMin > 0 && diffMin <= 10) {
          sendNotification(
            '📖 Study session starting soon!',
            `Your study session starts in ${Math.ceil(diffMin)} minutes (${task.start_time})`,
            `pre-${task.id}`
          );
        }

        // At task time
        if (diffMin > -1 && diffMin <= 0) {
          sendNotification(
            '🚀 Time to study!',
            `Your study session is starting now!`,
            `start-${task.id}`
          );
        }
      }

      // General reminder: if no tasks completed today by 2pm
      const hour = now.getHours();
      if (hour >= 14 && hour < 15) {
        const todayTasks = scheduledTasks.filter(t => t.date === today);
        const completed = todayTasks.filter(t => t.status === 'completed').length;
        if (todayTasks.length > 0 && completed === 0) {
          sendNotification(
            '⏰ Study reminder',
            `You have ${todayTasks.length} study sessions today. Let's get started!`,
            `reminder-${today}`
          );
        }
      }

      // Evening summary at 8pm
      if (hour >= 20 && hour < 21) {
        const todayTasks = scheduledTasks.filter(t => t.date === today);
        const pending = todayTasks.filter(t => t.status === 'scheduled').length;
        if (pending > 0) {
          sendNotification(
            '🌙 Evening check-in',
            `You still have ${pending} pending sessions. You can do it!`,
            `evening-${today}`
          );
        }
      }
    };

    checkTasks();
    const interval = setInterval(checkTasks, 30000);
    return () => clearInterval(interval);
  }, [enabled, scheduledTasks, requestPermission, sendNotification]);

  return { requestPermission };
}

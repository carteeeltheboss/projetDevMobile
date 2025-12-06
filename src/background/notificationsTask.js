import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSchedule, fetchAlerts } from '../services/googleSheetsService';
import { getCurrentSession, getTodaySchedule } from '../utils/time';
import { LAST_ALERT_ID_KEY, LAST_SESSION_KEY } from '../storage/storageKeys';

export const TASK_NAME = 'background-sheet-poll';

const notify = async (title, body) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // immediate
  });
};

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const [{ data: schedule }, { data: alerts }] = await Promise.all([
      fetchSchedule(),
      fetchAlerts(),
    ]);

    // Current session change
    const today = getTodaySchedule(schedule || []);
    const current = getCurrentSession(today);
    const lastSession = await AsyncStorage.getItem(LAST_SESSION_KEY);
    const currentKey = current ? `${current.Module}-${current.StartTime}` : 'none';
    if (currentKey !== lastSession) {
      await AsyncStorage.setItem(LAST_SESSION_KEY, currentKey);
      if (current) {
        await notify('Current class', `${current.Module} · ${current.StartTime} - ${current.EndTime}`);
      }
    }

    // New alert (highest Id wins)
    const lastAlertId = await AsyncStorage.getItem(LAST_ALERT_ID_KEY);
    const latest = (alerts || []).map((a) => a.Id || a.id).filter(Boolean).sort().pop();
    if (latest && latest !== lastAlertId) {
      await AsyncStorage.setItem(LAST_ALERT_ID_KEY, latest);
      const latestAlert = (alerts || []).find((a) => (a.Id || a.id) === latest);
      if (latestAlert) {
        await notify(latestAlert.Title || 'New alert', latestAlert.Message || '');
      }
    }

    return BackgroundFetch.Result.NewData;
  } catch (e) {
    console.warn('Background task failed', e);
    return BackgroundFetch.Result.Failed;
  }
});

export async function registerBackgroundTask() {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.Status.Restricted || status === BackgroundFetch.Status.Denied) {
    console.warn('Background fetch not available');
    return;
  }

  const existing = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (existing) return;

  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 180, // seconds (~3 minutes, best effort)
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

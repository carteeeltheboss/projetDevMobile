import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERTS_KEY, SCHEDULE_KEY, SHARED_TODO_KEY } from '../storage/storageKeys';

// YOUR GOOGLE SHEET ID (shared across Schedule, Alerts, and Shared Todo)
const SHEET_ID = '1DWzYbI3X_P0jazkrj180TlM-oUhh7EAIoWt2WekQpEw';
const BASE_URL = `https://opensheet.elk.sh/${SHEET_ID}`;

const tabUrl = (tabName) => `${BASE_URL}/${tabName}`;

async function fetchAndCache(tabName, storageKey) {
  try {
    console.log(`Fetching from: ${tabUrl(tabName)}`);
    const response = await fetch(tabUrl(tabName));
    if (!response.ok) {
      throw new Error(`Network error (${response.status})`);
    }
    const data = await response.json();
    
    // Check if data is empty or an error object from OpenSheet
    if (data.error) {
       throw new Error(`Sheet Error: ${data.error}`);
    }

    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    return { data, source: 'network' };
  } catch (error) {
    console.warn(`Failed to fetch ${tabName}, loading from cache.`, error);
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      return { data: JSON.parse(cached), source: 'cache', error };
    }
    throw error;
  }
}

export async function fetchSchedule() {
  return fetchAndCache('SCHEDULE', SCHEDULE_KEY);
}

export async function fetchAlerts() {
  return fetchAndCache('ALERTS', ALERTS_KEY);
}

export async function fetchSharedTodos() {
  return fetchAndCache('TODO', SHARED_TODO_KEY);
}

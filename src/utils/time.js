const parseToMinutes = (timeString = '') => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const normalizedDay = (value = '') => value.trim().slice(0, 3).toLowerCase();
const todayShort = normalizedDay(
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date())
);

export function getCurrentSession(schedule = [], now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    schedule.find((item) => {
      const start = parseToMinutes(item.StartTime);
      const end = parseToMinutes(item.EndTime);
      return currentMinutes >= start && currentMinutes <= end;
    }) || null
  );
}

export function getTodaySchedule(schedule = [], now = new Date()) {
  const today = normalizedDay(
    new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(now)
  );
  return schedule.filter((item) => normalizedDay(item.Day || '') === today);
}

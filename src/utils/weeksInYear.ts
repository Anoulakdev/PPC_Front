export function getWeeksInYear(year: number): number {
  // Use Dec 28 which is always in the last ISO week of the year
  const d = new Date(Date.UTC(year, 11, 28)); // Dec 28
  return getISOWeekNumber(d);
}

function getISOWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getUTCDay() + 6) % 7; // Convert Sunday to 6, Monday to 0, etc.
  target.setUTCDate(target.getUTCDate() - dayNumber + 3); // Nearest Thursday
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);
  const weekNumber =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
  return weekNumber;
}

export const getCurrentWeek = () => {
  return getISOWeekNumber(new Date()).toString().padStart(2, "0");
};

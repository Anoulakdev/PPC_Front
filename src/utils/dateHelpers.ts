// utils/dateHelpers.ts
export const getMonthDaysWithWeekday = (year: number, month: number) => {
  // month เป็น index ของ Date (0 = Jan, 10 = Nov)
  const date = new Date(year, month, 1);
  const days: string[] = [];

  const options: Intl.DateTimeFormatOptions = { weekday: "short" }; // MON, TUE, ...
  const formatter = new Intl.DateTimeFormat("en-US", options);

  while (date.getMonth() === month) {
    const weekday = formatter.format(date).toUpperCase(); // "THU"
    const day = date.getDate(); // 1, 2, 3...
    days.push(`${weekday} (${day})`);
    date.setDate(date.getDate() + 1);
  }

  return days;
};

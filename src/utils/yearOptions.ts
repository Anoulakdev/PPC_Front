export type SelectOption = {
  value: string;
  label: string;
};

export const getYearOptions = (
  range: number = 10,
  offset: number = 8,
): SelectOption[] => {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: range }, (_, i) => {
    const year = currentYear - offset + i;
    return {
      value: year.toString(),
      label: year.toString(),
    };
  });
};

export const isSwalNumberValid = (value: string, min = 0, max = 100): boolean => {
  const parsedValue = Number(value);

  const isInvalid = isNaN(parsedValue) || parsedValue < min || parsedValue > max || value === '';

  return !isInvalid;
};

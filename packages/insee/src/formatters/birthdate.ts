//

const INSEE_BIRTHDATE_REGEX = /^(?<year>\d+)(?<month>\d{2})(?<day>\d{2})$/;

/**
 * Format an INSEE birthdate to a native JS date
 * @param value - the date in the INSEE format "YYYYMMDD"
 * @returns the date in native JS format
 */
export function formatBirthdate(value: string) {
  const match = String(value).match(INSEE_BIRTHDATE_REGEX);

  if (!match || !match.groups) {
    throw new Error(`Invalid date format. Expected YYYYMMDD. Actual: ${value}`);
  }

  const { year, month, day } = match.groups;
  // Use Date.UTC to ensure timezone-independent date creation
  // Month is 0-indexed in Date.UTC
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format. ${year}-${month}-${day}`);
  }

  return date;
}

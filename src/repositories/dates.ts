//

const TIMESTAMP_KEY = /(^|_)at$/;

type DateValue<Value> = Value extends string
  ? Date
  : Value extends null
    ? null
    : Value;

export type WithDates<Row> = {
  [Key in keyof Row]: Key extends `${string}_at` | "birthdate"
    ? DateValue<Row[Key]>
    : Row[Key];
};

export function with_dates<Row extends object>(row: Row): WithDates<Row> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      (TIMESTAMP_KEY.test(key) || key === "birthdate") &&
      typeof value === "string"
        ? new Date(value)
        : value,
    ]),
  ) as WithDates<Row>;
}

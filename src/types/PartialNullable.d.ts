type PartialNullable<T> = {
  [K in keyof T as T[K] extends null | undefined | "" ? never : K]: T[K];
} & {
  [K in keyof T as T[K] extends null | undefined | ""
    ? K
    : never]?: NonNullable<T[K]>;
};

/// Package base error
export class CVSError extends Error {}

/// Quality enumerator
export enum Quality {
  Lowest = -2,
  Low = -1,
  Medium = 0,
  High = 1,
  Highest = 2,
}

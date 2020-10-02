/// Package base error
export class CVSError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/// Quality enumerator
export enum Quality {
  Lowest = -2,
  Low = -1,
  Medium = 0,
  High = 1,
  Highest = 2,
}

/// Returns random string
export function randomString(size: number, base: number = 0): string {
  var s = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array(size)
    .join()
    .split(',')
    .map(function () {
      return s.charAt(Math.floor(Math.random() * (base > 0 ? base : s.length)));
    })
    .join('');
}

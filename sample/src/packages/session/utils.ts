/// Returns random string
export function randomString(size: number): string {
  var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array(size)
    .join()
    .split(',')
    .map(function () {
      return s.charAt(Math.floor(Math.random() * s.length));
    })
    .join('');
}

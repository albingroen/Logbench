export function isObjectLike(value: unknown): boolean {
  return Object.prototype.toString.call(value) === '[object Object]'
}

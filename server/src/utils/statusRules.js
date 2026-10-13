// utils/statusRules.js

export const STATUS_ORDER = ['applied', 'interview', 'offer']

export function isValidStatusTransition(current, next) {
  if (!current) return true // new job creation
  const currentIndex = STATUS_ORDER.indexOf(current)
  const nextIndex = STATUS_ORDER.indexOf(next)

  if (currentIndex === -1 || nextIndex === -1) return false
  return nextIndex === currentIndex || nextIndex === currentIndex + 1
}

// Deterministic thread id for a pair of users, independent of who opens it first.
export function dmIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join('_')
}

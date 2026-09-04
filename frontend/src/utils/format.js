/** Shared presentation helpers (no API calls here). */

const AVATAR_GRADIENTS = [
  ['#6a3df4', '#9b3df5'],
  ['#f53d9b', '#ff7a59'],
  ['#0ea5a4', '#22c55e'],
  ['#f59e0b', '#ef4444'],
  ['#3b82f6', '#8b5cf6'],
  ['#ec4899', '#8b5cf6'],
  ['#14b8a6', '#3b82f6'],
  ['#f43f5e', '#f59e0b'],
];

/** Deterministic gradient pair per username so avatars feel personal. */
export function avatarGradient(username = '?') {
  let hash = 0;
  for (let i = 0; i < username.length; i += 1) {
    hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
  }
  const [from, to] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

export function initials(username = '?') {
  const clean = username.trim();
  if (!clean) return '?';
  return clean.slice(0, 2).toUpperCase();
}

/** "5m", "3h", "2d" style relative timestamps, like modern social apps. */
export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Friendly greeting for the feed header. */
export function greeting(username) {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return username ? `${part}, ${username}` : `${part} — welcome to Orbit`;
}

/** "1.2k" style compact counts. */
export function compactCount(n) {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

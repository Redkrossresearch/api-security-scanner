// Utility to format a timestamp into human‑readable date categories
// Returns one of: "Pinned", "Today", "Yesterday", "Last Week", "Older"
export default function formatDateCategory(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Last Week";
  return "Older";
}

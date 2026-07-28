// Preset "pick an animal" avatars — same idea as the icon-avatar pickers
// on modern apps (Slack, Discord, Duolingo), themed to a vet clinic
// instead of generic faces. Real photos, not icons — same Unsplash URLs
// already used for the category thumbnails in Shop.jsx's sidebar, reused
// here so there's one already-verified image source instead of a second,
// untested one.
// Stored as the string "preset:<id>" in users.avatar — cheap, no image
// bytes at all, and instantly recognizable as distinct from an uploaded
// photo (which is stored as a data: URL) wherever avatar is rendered.
export const AVATAR_PRESET_PREFIX = 'preset:';

export const AVATAR_PRESETS = [
  { id: 'dog',    label: 'Dog',    img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop' },
  { id: 'cat',    label: 'Cat',    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop' },
  { id: 'bird',   label: 'Bird',   img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=100&h=100&fit=crop' },
  { id: 'rabbit', label: 'Rabbit', img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=100&h=100&fit=crop' },
  { id: 'fish',   label: 'Fish',   img: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=100&h=100&fit=crop' },
  { id: 'cow',    label: 'Cow',    img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=100&h=100&fit=crop' },
  { id: 'goat',   label: 'Goat',   img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100&h=100&fit=crop' },
];

export function getAvatarPreset(avatar) {
  if (!avatar || !avatar.startsWith(AVATAR_PRESET_PREFIX)) return null;
  const id = avatar.slice(AVATAR_PRESET_PREFIX.length);
  return AVATAR_PRESETS.find((p) => p.id === id) || null;
}

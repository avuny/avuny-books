/**
 * Theme constants for the mobile app.
 * These were previously imported from a legacy shared package.
 */

// ─── Font families ───────────────────────────────────────────────────────────

export const Fonts = {
  sans: 'System',
  mono: 'Courier',
} as const;

// ─── Spacing scale (multiples of 4 px) ───────────────────────────────────────

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  ten: 40,
  twelve: 48,
} as const;

// ─── Max content width (web) ──────────────────────────────────────────────────

export const MaxContentWidth = 1280;

// ─── Theme color keys ─────────────────────────────────────────────────────────

export type ThemeColor =
  | 'background'
  | 'backgroundElement'
  | 'backgroundSelected'
  | 'text'
  | 'textSecondary'
  | 'textDisabled'
  | 'primary'
  | 'primaryForeground'
  | 'border'
  | 'destructive'
  | 'muted'
  | 'card';

// ─── Light / dark color tokens ────────────────────────────────────────────────

const light: Record<ThemeColor, string> = {
  background: '#ffffff',
  backgroundElement: '#f4f4f5',
  backgroundSelected: '#e4e4e7',
  text: '#09090b',
  textSecondary: '#71717a',
  textDisabled: '#a1a1aa',
  primary: '#18181b',
  primaryForeground: '#fafafa',
  border: '#e4e4e7',
  destructive: '#dc2626',
  muted: '#f4f4f5',
  card: '#ffffff',
};

const dark: Record<ThemeColor, string> = {
  background: '#09090b',
  backgroundElement: '#27272a',
  backgroundSelected: '#3f3f46',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  textDisabled: '#52525b',
  primary: '#fafafa',
  primaryForeground: '#18181b',
  border: '#27272a',
  destructive: '#ef4444',
  muted: '#27272a',
  card: '#09090b',
};

export const Colors = { light, dark } as const;

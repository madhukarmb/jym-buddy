export const colors = {
  bg: "#0E1015",
  surface: "#181B22",
  surfaceElevated: "#22262F",
  border: "#2A2E37",

  text: "#FFFFFF",
  textMuted: "#A5ADBA",
  textDim: "#6C7280",

  // Primary mint accent
  mint: "#7FE5C6",
  mintDeep: "#5BC9A4",
  mintSoft: "#1F3A33",

  // Secondary lavender accent
  lavender: "#C9C5FB",
  lavenderDeep: "#9F99F0",
  lavenderSoft: "#2D2A4A",

  danger: "#FF6B6B",
  dangerSoft: "#3A1F22",
  success: "#65E0BE",
  warn: "#FFB66B",

  // Aliases — primary surfaces use mint
  primary: "#7FE5C6",
  primaryDark: "#5BC9A4",
  primarySoft: "#1F3A33",
  accent: "#C9C5FB",
  accentSoft: "#2D2A4A",
} as const;

// Mint-to-lavender diagonal gradient, matching the reference card art.
export const gradients = {
  primary: ["#9FF2DD", "#C9C5FB"] as const,
  primaryReverse: ["#C9C5FB", "#9FF2DD"] as const,
  mintFade: ["#9FF2DD", "#5BC9A4"] as const,
  lavenderFade: ["#D7D3FF", "#9F99F0"] as const,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

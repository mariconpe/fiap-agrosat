// Design tokens do AgroSat — escala iOS (SF via fonte de sistema)

export const colors = {
  // superfícies
  background: "#F2F2F7",
  surface: "#FFFFFF",
  surfaceMuted: "#E5E5EA",

  // texto
  ink: "#111114",
  inkSecondary: "#5B5B63",
  inkTertiary: "#6E6E76",

  // marca (verde agro profundo)
  brand: "#166534",
  brandTint: "#E7F2EA",

  // estados
  success: "#166534",
  successTint: "#E7F2EA",
  warning: "#B45309",
  warningTint: "#FCF0E1",
  critical: "#BB271A",
  criticalTint: "#FBEBE9",

  // neutros de apoio
  iconMuted: "#8E8E93",
  trackMuted: "#E5E5EA",
  separator: "#ECECF0",
} as const;

export const radius = {
  card: 16,
  control: 12,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const font = {
  largeTitle: { fontSize: 30, fontWeight: "700", letterSpacing: 0.2 },
  title: { fontSize: 20, fontWeight: "700" },
  headline: { fontSize: 16, fontWeight: "600" },
  body: { fontSize: 15, fontWeight: "400", lineHeight: 21 },
  subhead: { fontSize: 14, fontWeight: "400", lineHeight: 19 },
  footnote: { fontSize: 13, fontWeight: "400" },
  caption: { fontSize: 11, fontWeight: "600" },
} as const;

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
} as const;

/** Espaço extra no fim do scroll para o conteúdo não ficar sob a tab bar flutuante. */
export const TAB_BAR_CLEARANCE = 104;

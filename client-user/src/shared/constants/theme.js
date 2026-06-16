// client-user/src/shared/constants/theme.js
// Tema La 33 — dark premium (alineado con cliente-labrasa33/src/styles/index.css).
// Ningún color debe hardcodearse fuera de este archivo.

export const COLORS = {
  // Fondos
  background: '#0D0D0D',
  surface: '#1A1A1A',
  card: '#222222',
  input: '#333333',
  hover: '#2A2A2A',

  // Texto
  text: '#F2F2F2',
  secondary: '#A6A6A6',
  textLight: '#6B6B6B',

  // Botón principal (auth / acciones primarias — gris claro como la web)
  primary: '#A6A6A6',
  primaryText: '#0D0D0D',

  // Acento naranja La 33 (tabs activas, links, badges)
  accent: '#E17522',
  accentHover: '#D06B1D',

  // Estados
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',

  // Bordes
  border: '#333333',
  borderLight: '#3A3A3A',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

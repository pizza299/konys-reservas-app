// Paleta de Konys Pizza (sección 11.4 del documento del proyecto).
// Primario: azul petróleo del logo. Acento: naranja del logo.

export const colores = {
  primario: '#0F2B3D',
  primarioSuave: '#1D4258',
  acento: '#F28C28',
  acentoSuave: '#FDEEDD',
  acentoTexto: '#9A4F06',

  fondo: '#F5F6F8',
  superficie: '#FFFFFF',
  superficieTenue: '#EEF1F4',
  borde: '#E2E6EA',
  bordeFuerte: '#C8D0D7',

  texto: '#13212C',
  textoSuave: '#5B6873',
  textoTenue: '#97A3AC',
  blanco: '#FFFFFF',

  libre: '#1D7A4C',
  libreFondo: '#E5F3EB',
  error: '#B83227',
  errorFondo: '#FCEBE9',
};

export const radios = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pildora: 999,
};

// Sombra suave reutilizable (boxShadow funciona en Android, iOS y web).
export const sombra = {
  boxShadow: '0px 4px 14px rgba(15, 43, 61, 0.10)',
};

export const sombraFuerte = {
  boxShadow: '0px 10px 30px rgba(15, 43, 61, 0.18)',
};

// Tamaño mínimo táctil recomendado (44 x 44 puntos).
export const TACTIL_MIN = 44;

// Ancho máximo del contenido para que la app se vea bien en tablets.
export const ANCHO_MAX = 720;

// Configuración general y catálogos de la app.

// PIN del panel de administración. Se puede cambiar con la variable
// EXPO_PUBLIC_ADMIN_PIN en el archivo .env (por defecto: 1234).
export const PIN_ADMIN = process.env.EXPO_PUBLIC_ADMIN_PIN || '1234';

// Horas que dura la sesión del administrador guardada en el celular.
export const HORAS_SESION_ADMIN = 12;

// Intentos de PIN fallidos antes de bloquear el teclado unos segundos.
export const MAX_INTENTOS_PIN = 5;
export const SEGUNDOS_BLOQUEO_PIN = 30;

// Hasta cuántos días en el futuro se puede reservar.
export const DIAS_MAX_ANTICIPACION = 60;

// Claves de los días tal como se guardan en Supabase.
// El índice coincide con Date.getDay() (0 = domingo).
export const DIAS_SEMANA = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

// Orden de los días para mostrarlos en el panel (lunes primero).
export const DIAS_ORDEN = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

export const ETIQUETA_DIA = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export const JORNADAS = [
  { valor: 'almuerzo', etiqueta: 'Almuerzo', icono: 'sunny-outline' },
  { valor: 'noche', etiqueta: 'Noche', icono: 'moon-outline' },
];

export const ZONAS = [
  { valor: 'terraza', etiqueta: 'Terraza' },
  { valor: 'salon', etiqueta: 'Salón' },
];

export const ETIQUETA_ZONA = {
  terraza: 'Terraza',
  salon: 'Salón',
};

// Categorías de la carta real de Konys (pizzas en cono, combos, fries, granizadas y bebidas).
export const CATEGORIAS = [
  { valor: 'pizzas', etiqueta: 'Pizzas', icono: 'pizza-outline' },
  { valor: 'combos', etiqueta: 'Combos', icono: 'fast-food-outline' },
  { valor: 'fries', etiqueta: 'Fries', icono: 'star-outline' },
  { valor: 'granizadas', etiqueta: 'Granizadas', icono: 'snow-outline' },
  { valor: 'bebidas', etiqueta: 'Bebidas', icono: 'water-outline' },
];

// Dirección del restaurante (se muestra en Inicio).
export const DIRECCION = 'Cra. 36 #38-64, Bucaramanga, Santander';

export const ESTADOS_RESERVA = {
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const DURACIONES_SLOT = [30, 45, 60, 90, 120];

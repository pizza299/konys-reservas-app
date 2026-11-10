// Datos de ejemplo para el "modo demo" (cuando aún no se configura Supabase).
// Son los mismos datos que inserta supabase/schema.sql: la carta real de Konys,
// sus horarios de atención y algunas reservas de prueba para hoy y mañana.
import { DIAS_ORDEN } from '../constants/config';
import { hoyISO, mananaISO } from '../utils/fechas';
import { slotsDeFecha } from '../utils/slots';

// Fotos de las mesas: Unsplash (uso libre). Se pueden cambiar desde el panel.
const unsplash = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=70&fm=jpg&fit=crop`;

export const MESAS_DEMO = [
  { nombre: 'Mesa 1', zona: 'terraza', capacidad: 2, foto_url: unsplash('1559339352-11d035aa65de') },
  { nombre: 'Mesa 2', zona: 'terraza', capacidad: 4, foto_url: unsplash('1600093463592-8e36ae95ef56') },
  { nombre: 'Mesa 3', zona: 'salon', capacidad: 4, foto_url: unsplash('1517248135467-4c7edcad34c4') },
  { nombre: 'Mesa 4', zona: 'salon', capacidad: 6, foto_url: unsplash('1555396273-367ea4eb4db5') },
  { nombre: 'Mesa 5', zona: 'salon', capacidad: 2, foto_url: unsplash('1544148103-0773bf10d330') },
  { nombre: 'Mesa 6', zona: 'terraza', capacidad: 8, foto_url: unsplash('1537047902294-62a40c20a6ae') },
];

const CONO = 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.';

// Carta de Konys Pizza (Bucaramanga). Las fotos están dentro de la app (assets/platos).
// precio_anterior: precio antes del descuento (solo si el plato está en promoción).
export const PLATOS_DEMO = [
  { nombre: 'Combo lasaña personal', categoria: 'combos', precio: 31900, precio_anterior: 39900, descripcion: 'Lasaña artesanal con capas de carne molida jugosa y queso.', foto_url: 'local:combo-lasana' },

  { nombre: 'Pizza ikónica', categoria: 'pizzas', precio: 30900, descripcion: CONO, foto_url: 'local:pizza-ikonica' },
  { nombre: 'Konys bucara', categoria: 'pizzas', precio: 30900, descripcion: CONO, foto_url: 'local:konys-bucara' },
  { nombre: 'Pizza marinera', categoria: 'pizzas', precio: 32900, descripcion: CONO, foto_url: 'local:pizza-marinera' },
  { nombre: 'Pizza mar y tierra', categoria: 'pizzas', precio: 31900, descripcion: CONO, foto_url: 'local:pizza-mar-y-tierra' },
  { nombre: 'Konys bondiola', categoria: 'pizzas', precio: 31900, descripcion: CONO, foto_url: 'local:konys-bondiola' },
  { nombre: 'Pizza italianísima', categoria: 'pizzas', precio: 31900, descripcion: 'Pizza en cono con masa de finas hierbas, jamón serrano y tomates.', foto_url: 'local:pizza-italianisima' },
  { nombre: 'Pizza colombianita', categoria: 'pizzas', precio: 30900, descripcion: CONO, foto_url: 'local:pizza-colombianita' },
  { nombre: 'Pizza especial', categoria: 'pizzas', precio: 30900, descripcion: CONO, foto_url: 'local:pizza-especial' },
  { nombre: 'Pizza carnes', categoria: 'pizzas', precio: 30900, descripcion: CONO, foto_url: 'local:pizza-carnes' },
  { nombre: 'Pizza lasagna', categoria: 'pizzas', precio: 29900, descripcion: CONO, foto_url: 'local:pizza-lasagna' },
  { nombre: 'Pizza chicken', categoria: 'pizzas', precio: 29900, descripcion: CONO, foto_url: 'local:pizza-chicken' },
  { nombre: 'Pizza BBQ', categoria: 'pizzas', precio: 29900, descripcion: CONO, foto_url: 'local:pizza-bbq' },
  { nombre: 'Pizza teriyork', categoria: 'pizzas', precio: 29900, descripcion: CONO, foto_url: 'local:pizza-teriyork' },
  { nombre: 'Pizza carbonara', categoria: 'pizzas', precio: 29900, descripcion: CONO, foto_url: 'local:pizza-carbonara' },
  { nombre: 'Pizza hawaiana', categoria: 'pizzas', precio: 28900, descripcion: CONO, foto_url: 'local:pizza-hawaiana' },
  { nombre: 'Pizza mexicana', categoria: 'pizzas', precio: 28900, descripcion: CONO, foto_url: 'local:pizza-mexicana' },
  { nombre: 'Pizza vegetariana', categoria: 'pizzas', precio: 28900, descripcion: CONO, foto_url: 'local:pizza-vegetariana' },

  { nombre: 'Fries ikónicas', categoria: 'fries', precio: 38000, descripcion: 'Papas locas al estilo Konys, con nuestras papas exclusivas.', foto_url: 'local:fries-ikonicas' },

  { nombre: 'Granizada de limón', categoria: 'granizadas', precio: 9900, descripcion: 'Limón y azúcar.', foto_url: 'local:granizada-limon' },
  { nombre: 'Granizada de yerbabuena', categoria: 'granizadas', precio: 9900, descripcion: 'Azúcar, yerbabuena y limón.', foto_url: 'local:granizada-yerbabuena' },
  { nombre: 'Granizada de mandarina', categoria: 'granizadas', precio: 9900, descripcion: 'Pulpa de mandarina y azúcar.', foto_url: 'local:granizada-mandarina' },
  { nombre: 'Granizada de naranja', categoria: 'granizadas', precio: 9900, descripcion: 'Naranja y azúcar.', foto_url: 'local:granizada-naranja' },
  { nombre: 'Granizada maracumango', categoria: 'granizadas', precio: 10900, descripcion: 'Azúcar y maracumango.', foto_url: 'local:granizada-maracumango' },
  { nombre: 'Granizada limonada de coco', categoria: 'granizadas', precio: 11000, descripcion: 'Azúcar, coco y limón.', foto_url: 'local:granizada-limonada-coco' },
  { nombre: 'Granizada cerezada', categoria: 'granizadas', precio: 11000, descripcion: 'Cerezas, azúcar, agua y limón.', foto_url: 'local:granizada-cerezada' },
  { nombre: 'Granizada piña colada', categoria: 'granizadas', precio: 11000, descripcion: 'Piña, coco, leche condensada y azúcar.', foto_url: 'local:granizada-pina-colada' },

  { nombre: 'Coca-Cola Original 400 ml', categoria: 'bebidas', precio: 6000, descripcion: 'Gaseosa.', foto_url: 'local:coca-cola-400' },
  { nombre: 'Cristal con gas 600 ml', categoria: 'bebidas', precio: 6000, descripcion: 'Agua con gas.', foto_url: 'local:cristal-con-gas' },
  { nombre: 'Cristal sin gas 600 ml', categoria: 'bebidas', precio: 6000, descripcion: 'Agua sin gas.', foto_url: 'local:cristal-sin-gas' },
];

// Horario de atención de Konys:
// lunes a sábado 11:30 a. m. – 2:00 p. m. (almuerzo) y 4:30 – 11:00 p. m. (noche);
// domingo solo 4:30 – 11:00 p. m. (el almuerzo del domingo queda cerrado).
export const HORARIO_ALMUERZO = { hora_inicio: '11:30', hora_fin: '14:00' };
export const HORARIO_NOCHE = { hora_inicio: '16:30', hora_fin: '23:00' };

// Versión de los datos demo. Si los datos guardados son de una versión anterior,
// se reemplazan por los nuevos (carta, horarios y reservas de ejemplo).
export const VERSION_DEMO = 4;

/** Construye la base de datos local inicial. */
export function crearDatosDemo() {
  const ahora = new Date().toISOString();

  const mesas = MESAS_DEMO.map((m, i) => ({ id: i + 1, activa: true, creado_en: ahora, ...m }));

  const horarios = [];
  DIAS_ORDEN.forEach((dia) => {
    const domingo = dia === 'domingo';
    horarios.push({ id: horarios.length + 1, dia_semana: dia, jornada: 'almuerzo', ...HORARIO_ALMUERZO, duracion_slot: 60, activo: !domingo });
    horarios.push({ id: horarios.length + 1, dia_semana: dia, jornada: 'noche', ...HORARIO_NOCHE, duracion_slot: 60, activo: true });
  });

  const platos = PLATOS_DEMO.map((p, i) => ({
    id: i + 1,
    disponible: true,
    precio_anterior: null,
    creado_en: ahora,
    ...p,
  }));

  // Reservas de ejemplo en los primeros turnos del día (según el horario de ese día).
  const hoy = hoyISO();
  const manana = mananaISO();
  const ejemplos = [
    [hoy, 1, 'Sofía Ruiz', '3001234567', 2, 0, 'completada'],
    [hoy, 3, 'Camila Torres', null, 3, 0, 'confirmada'],
    [hoy, 3, 'Diego Herrera', '3012223344', 2, 1, 'confirmada'],
    [hoy, 3, 'Juan Pérez', '3109876543', 4, 2, 'confirmada'],
    [hoy, 1, 'María Gómez', null, 2, 2, 'confirmada'],
    [hoy, 2, 'Laura Díaz', '3155550101', 2, 3, 'cancelada'],
    [hoy, 5, 'Andrés Rojas', '3204445566', 2, 3, 'confirmada'],
    [manana, 4, 'Carlos Méndez', '3187778899', 5, 1, 'confirmada'],
    [manana, 6, 'Valentina Cruz', '3016667788', 7, 2, 'confirmada'],
  ];
  const reservas = [];
  ejemplos.forEach(([fecha, mesa_id, cliente_nombre, cliente_contacto, num_personas, turno, estado]) => {
    const slot = slotsDeFecha(horarios, fecha)[turno];
    if (!slot) return;
    reservas.push({
      id: 168 + reservas.length,
      mesa_id,
      cliente_nombre,
      cliente_contacto,
      num_personas,
      fecha,
      hora_inicio: slot.inicio,
      hora_fin: slot.fin,
      estado,
      creado_en: ahora,
    });
  });

  return { version: VERSION_DEMO, mesas, horarios, platos, reservas };
}

/** true si los datos guardados son de una versión anterior y hay que renovarlos. */
export function datosDemoDesactualizados(db) {
  return (db?.version || 1) < VERSION_DEMO;
}

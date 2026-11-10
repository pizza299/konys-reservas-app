// Fotos de la carta incluidas dentro de la app (carpeta assets/platos).
// En la base de datos se guardan como "local:<nombre>"; también se aceptan
// enlaces https:// que el administrador pegue en el campo "Foto".
//
// Los platos sin foto propia usan la foto general de Konys (assets/platos/konys-menu.jpg).
// - Para cambiar una foto por otra de mejor calidad, reemplaza su archivo (mismo nombre).
// - Para darle foto propia a un plato que usa FOTO_MENU, agrega el archivo en
//   assets/platos y cambia su línea, por ejemplo:
//   'pizza-bbq': require('../assets/platos/pizza-bbq.jpg'),

const FOTO_MENU = require('../assets/platos/konys-menu.jpg');

export const FOTOS_LOCALES = {
  'konys-menu': FOTO_MENU,

  // Con foto propia
  'pizza-ikonica': require('../assets/platos/pizza-ikonica.jpg'),
  'konys-bucara': require('../assets/platos/konys-bucara.jpg'),
  'konys-bondiola': require('../assets/platos/konys-bondiola.jpg'),
  'pizza-italianisima': require('../assets/platos/pizza-italianisima.jpg'),
  'pizza-especial': require('../assets/platos/pizza-especial.jpg'),
  'pizza-carnes': require('../assets/platos/pizza-carnes.jpg'),
  'pizza-carbonara': require('../assets/platos/pizza-carbonara.jpg'),
  'pizza-hawaiana': require('../assets/platos/pizza-hawaiana.jpg'),
  'pizza-mexicana': require('../assets/platos/pizza-mexicana.jpg'),
  'fries-ikonicas': require('../assets/platos/fries-ikonicas.jpg'),
  'granizada-yerbabuena': require('../assets/platos/granizada-yerbabuena.jpg'),
  'granizada-pina-colada': require('../assets/platos/granizada-pina-colada.jpg'),
  'granizada-limonada-coco': require('../assets/platos/granizada-limonada-coco.jpg'),
  'granizada-maracumango': require('../assets/platos/granizada-maracumango.jpg'),
  'granizada-mandarina': require('../assets/platos/granizada-mandarina.jpg'),
  'granizada-cerezada': require('../assets/platos/granizada-cerezada.jpg'),
  'coca-cola-400': require('../assets/platos/coca-cola-400.jpg'),

  // Todavía con la foto general
  'combo-lasana': FOTO_MENU,
  'pizza-marinera': FOTO_MENU,
  'pizza-mar-y-tierra': FOTO_MENU,
  'pizza-colombianita': FOTO_MENU,
  'pizza-lasagna': FOTO_MENU,
  'pizza-chicken': FOTO_MENU,
  'pizza-bbq': FOTO_MENU,
  'pizza-teriyork': FOTO_MENU,
  'pizza-vegetariana': FOTO_MENU,
  'granizada-limon': FOTO_MENU,
  'granizada-naranja': FOTO_MENU,
  'cristal-con-gas': FOTO_MENU,
  'cristal-sin-gas': FOTO_MENU,
};

const PREFIJO = 'local:';

/** Convierte el valor de foto_url en una fuente para <Image>, o null si no hay foto. */
export function fuenteDeFoto(valor) {
  if (!valor) return null;
  if (valor.startsWith(PREFIJO)) return FOTOS_LOCALES[valor.slice(PREFIJO.length)] ?? null;
  return { uri: valor };
}

/** true si el valor es un enlace http(s) o una foto incluida en la app. */
export function esFotoValida(valor) {
  const limpio = String(valor || '').trim();
  if (limpio.startsWith(PREFIJO)) return Boolean(FOTOS_LOCALES[limpio.slice(PREFIJO.length)]);
  return /^https?:\/\//i.test(limpio);
}

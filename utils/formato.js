// Formatos de texto reutilizables.

/** 38000 -> '$ 38.000' (pesos colombianos, sin decimales). */
export function formatearPrecio(valor) {
  const entero = Math.round(Number(valor) || 0);
  const conPuntos = String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${conPuntos}`;
}

/**
 * Porcentaje de descuento de un plato (0 si no está en promoción).
 * Ej.: precio 31.900 y precio_anterior 39.900 → 20.
 */
export function porcentajeDescuento(plato) {
  const antes = Number(plato?.precio_anterior);
  const ahora = Number(plato?.precio);
  if (!antes || !ahora || antes <= ahora) return 0;
  return Math.round((1 - ahora / antes) * 100);
}

/** Código visible de la reserva a partir de su id: 172 -> 'KP-0172'. */
export function codigoReserva(id) {
  return `KP-${String(id).padStart(4, '0')}`;
}

/** 'Juan Pérez' -> 'Juan' */
export function primerNombre(nombre) {
  return String(nombre || '').trim().split(/\s+/)[0] || '';
}

/** Deja solo los dígitos de un texto. */
export function soloDigitos(texto) {
  return String(texto || '').replace(/\D/g, '');
}

export function pluralizar(cantidad, singular, plural) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

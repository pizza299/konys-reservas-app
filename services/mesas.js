// Servicio de mesas (colección "mesas").
import { db } from './db';
import { ErrorApp } from './errores';
import { ETIQUETA_ZONA } from '../constants/config';
import { esFotoValida } from '../constants/fotosLocales';

export const CAPACIDAD_MAXIMA = 20;

export async function obtenerMesas({ soloActivas = false } = {}) {
  const filtros = soloActivas ? [['eq', 'activa', true]] : [];
  return db.seleccionar('mesas', { filtros, orden: [{ campo: 'id' }] });
}

export async function obtenerMesa(id) {
  const filas = await db.seleccionar('mesas', { filtros: [['eq', 'id', Number(id)]] });
  return filas[0] || null;
}

/** Devuelve un mensaje de error o null si los datos son válidos. */
export function validarMesa({ nombre, zona, capacidad, foto_url }) {
  if (!nombre || !nombre.trim()) return 'Escribe el nombre o número de la mesa.';
  if (nombre.trim().length > 40) return 'El nombre puede tener máximo 40 caracteres.';
  if (!ETIQUETA_ZONA[zona]) return 'Elige la zona de la mesa.';
  const cap = Number(capacidad);
  if (!Number.isInteger(cap) || cap < 1 || cap > CAPACIDAD_MAXIMA) {
    return `La capacidad debe estar entre 1 y ${CAPACIDAD_MAXIMA} personas.`;
  }
  if (foto_url && foto_url.trim() && !esFotoValida(foto_url)) {
    return 'La foto debe ser un enlace que empiece por http:// o https://';
  }
  return null;
}

function limpiar({ nombre, zona, capacidad, foto_url }) {
  return {
    nombre: nombre.trim(),
    zona,
    capacidad: Number(capacidad),
    foto_url: foto_url?.trim() ? foto_url.trim() : null,
  };
}

export async function crearMesa(datos) {
  const error = validarMesa(datos);
  if (error) throw new ErrorApp(error, { codigo: 'VALIDACION' });
  return db.insertar('mesas', { ...limpiar(datos), activa: true });
}

export async function actualizarMesa(id, datos) {
  const error = validarMesa(datos);
  if (error) throw new ErrorApp(error, { codigo: 'VALIDACION' });
  return db.actualizar('mesas', id, limpiar(datos));
}

/** RF-13: marcar una mesa como activa o inactiva. */
export async function cambiarEstadoMesa(id, activa) {
  return db.actualizar('mesas', id, { activa });
}

/** Borra la mesa (y sus reservas, por la regla "on delete cascade"). */
export async function eliminarMesa(id) {
  return db.eliminar('mesas', id);
}

// Servicio de la carta digital (colección "platos").
import { db } from './db';
import { ErrorApp } from './errores';
import { CATEGORIAS } from '../constants/config';
import { esFotoValida } from '../constants/fotosLocales';

export async function obtenerPlatos({ soloDisponibles = false } = {}) {
  // RF-07: los platos marcados como no disponibles no se muestran al cliente.
  const filtros = soloDisponibles ? [['eq', 'disponible', true]] : [];
  return db.seleccionar('platos', { filtros, orden: [{ campo: 'id' }] });
}

export function validarPlato({ nombre, categoria, precio, precio_anterior, foto_url }) {
  if (!nombre || !nombre.trim()) return 'Escribe el nombre del plato.';
  if (nombre.trim().length > 60) return 'El nombre puede tener máximo 60 caracteres.';
  if (!CATEGORIAS.some((c) => c.valor === categoria)) return 'Elige una categoría.';
  const valor = Number(precio);
  if (!Number.isInteger(valor) || valor <= 0) return 'Escribe un precio válido en pesos.';
  if (valor > 10000000) return 'El precio es demasiado alto.';
  if (precio_anterior !== null && precio_anterior !== undefined && String(precio_anterior) !== '') {
    const antes = Number(precio_anterior);
    if (!Number.isInteger(antes) || antes <= valor) {
      return 'El precio antes del descuento debe ser mayor que el precio actual.';
    }
  }
  if (foto_url && foto_url.trim() && !esFotoValida(foto_url)) {
    return 'La foto debe ser un enlace que empiece por http:// o https://';
  }
  return null;
}

function limpiar({ nombre, categoria, descripcion, precio, precio_anterior, disponible, foto_url }) {
  return {
    nombre: nombre.trim(),
    categoria,
    descripcion: descripcion?.trim() || null,
    precio: Number(precio),
    precio_anterior:
      precio_anterior !== null && precio_anterior !== undefined && String(precio_anterior) !== ''
        ? Number(precio_anterior)
        : null,
    disponible: Boolean(disponible),
    foto_url: foto_url?.trim() ? foto_url.trim() : null,
  };
}

export async function crearPlato(datos) {
  const error = validarPlato(datos);
  if (error) throw new ErrorApp(error, { codigo: 'VALIDACION' });
  return db.insertar('platos', limpiar(datos));
}

export async function actualizarPlato(id, datos) {
  const error = validarPlato(datos);
  if (error) throw new ErrorApp(error, { codigo: 'VALIDACION' });
  return db.actualizar('platos', id, limpiar(datos));
}

/** Mostrar u ocultar el plato en la carta. */
export async function cambiarDisponibilidad(id, disponible) {
  return db.actualizar('platos', id, { disponible });
}

export async function eliminarPlato(id) {
  return db.eliminar('platos', id);
}

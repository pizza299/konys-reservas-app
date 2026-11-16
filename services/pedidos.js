// Pedidos a cocina (colección "pedidos").
// El cliente arma su pedido desde la carta y lo envía; la cocina lo ve en el
// panel de administración y lo avanza: pendiente → preparando → listo → entregado.
import { db } from './db';
import { ErrorApp } from './errores';
import { obtenerMesa } from './mesas';
import {
  ESTADOS_PEDIDO,
  MAX_CANTIDAD_PLATO,
  MAX_LINEAS_PEDIDO,
  MAX_NOTA_PLATO,
} from '../constants/config';

export function validarNombreCliente(nombre) {
  const limpio = String(nombre || '').trim();
  if (limpio.length < 3 || !/[a-záéíóúñ]/i.test(limpio)) return 'Escribe tu nombre.';
  if (limpio.length > 80) return 'El nombre puede tener máximo 80 caracteres.';
  return null;
}

/** Devuelve un mensaje de error o null si el pedido se puede enviar. */
export function validarPedido({ items, mesaId, nombre }) {
  if (!items || items.length === 0) return 'Tu pedido está vacío. Agrega algo de la carta.';
  if (items.length > MAX_LINEAS_PEDIDO) return `Un pedido puede tener máximo ${MAX_LINEAS_PEDIDO} platos distintos.`;
  const cantidadInvalida = items.some(
    (i) => !Number.isInteger(i.cantidad) || i.cantidad < 1 || i.cantidad > MAX_CANTIDAD_PLATO,
  );
  if (cantidadInvalida) return `Cada plato puede pedirse de 1 a ${MAX_CANTIDAD_PLATO} unidades.`;
  if (!mesaId) return 'Elige la mesa en la que estás.';
  return validarNombreCliente(nombre);
}

/**
 * Envía el pedido a la cocina.
 * Los precios se toman de la carta guardada (no del celular) y se revisa que
 * cada plato siga disponible y que la mesa esté activa.
 */
export async function crearPedido({ items, mesaId, nombre }) {
  const error = validarPedido({ items, mesaId, nombre });
  if (error) throw new ErrorApp(error, { codigo: 'VALIDACION' });

  const [mesa, platos] = await Promise.all([
    obtenerMesa(mesaId),
    db.seleccionar('platos', { filtros: [['in', 'id', items.map((i) => i.platoId)]] }),
  ]);
  if (!mesa || !mesa.activa) {
    throw new ErrorApp('Esa mesa no está disponible. Elige otra, por favor.', { codigo: 'MESA_INACTIVA' });
  }

  const platosPorId = {};
  platos.forEach((p) => {
    platosPorId[p.id] = p;
  });
  const lineas = items.map((i) => {
    const plato = platosPorId[i.platoId];
    if (!plato || !plato.disponible) {
      throw new ErrorApp(`"${i.nombre}" ya no está disponible. Quítalo de tu pedido.`, {
        codigo: 'PLATO_NO_DISPONIBLE',
      });
    }
    const nota = String(i.nota || '').trim().slice(0, MAX_NOTA_PLATO);
    return {
      plato_id: plato.id,
      nombre: plato.nombre,
      precio: plato.precio,
      cantidad: i.cantidad,
      nota: nota || null,
    };
  });
  const total = lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);

  const pedido = await db.insertar('pedidos', {
    mesa_id: mesa.id,
    cliente_nombre: nombre.trim(),
    items: lineas,
    total,
    estado: 'pendiente',
  });
  return { pedido, mesa };
}

/** Pedidos con alguno de los estados dados (todos si no se indica). */
export async function obtenerPedidos({ estados } = {}) {
  const filtros = estados ? [['in', 'estado', estados]] : [];
  return db.seleccionar('pedidos', { filtros, orden: [{ campo: 'creado_en' }] });
}

export async function cambiarEstadoPedido(id, estado) {
  if (!ESTADOS_PEDIDO[estado]) throw new ErrorApp('Estado de pedido no válido.', { codigo: 'VALIDACION' });
  return db.actualizar('pedidos', id, { estado });
}

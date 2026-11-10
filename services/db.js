// Capa de acceso a datos.
// Todas las pantallas leen y escriben a través de este archivo, que decide
// si usar Supabase (cuando hay credenciales en .env) o la base local de demo.
//
// Los filtros se escriben como [operador, campo, valor], por ejemplo:
//   [['eq', 'mesa_id', 3], ['neq', 'estado', 'cancelada']]
import { supabase, supabaseConfigurado } from './supabase';
import { localDb } from './localDb';
import { ErrorApp, MENSAJE_SIN_CONEXION, normalizarError } from './errores';

export const modoDemo = !supabaseConfigurado;

const TIEMPO_MAXIMO_MS = 12000;

function aplicarFiltros(consulta, filtros) {
  let q = consulta;
  for (const [operador, campo, valor] of filtros) {
    q = q[operador](campo, valor);
  }
  return q;
}

function revisar({ data, error }) {
  if (error) throw error;
  return data;
}

const supabaseDb = {
  async seleccionar(tabla, { filtros = [], orden = [] } = {}) {
    let q = aplicarFiltros(supabase.from(tabla).select('*'), filtros);
    for (const { campo, asc = true } of orden) {
      q = q.order(campo, { ascending: asc });
    }
    return revisar(await q);
  },
  async insertar(tabla, fila) {
    return revisar(await supabase.from(tabla).insert(fila).select().single());
  },
  async actualizar(tabla, id, cambios) {
    return revisar(await supabase.from(tabla).update(cambios).eq('id', id).select().single());
  },
  async actualizarDonde(tabla, filtros, cambios) {
    revisar(await aplicarFiltros(supabase.from(tabla).update(cambios), filtros));
  },
  async eliminar(tabla, id) {
    revisar(await supabase.from(tabla).delete().eq('id', id));
  },
};

const backend = modoDemo ? localDb : supabaseDb;

// Ejecuta la operación con un tiempo máximo y traduce los errores.
async function ejecutar(operacion) {
  let temporizador;
  const limite = new Promise((_, rechazar) => {
    temporizador = setTimeout(
      () => rechazar(new ErrorApp(MENSAJE_SIN_CONEXION, { codigo: 'SIN_CONEXION' })),
      TIEMPO_MAXIMO_MS,
    );
  });
  try {
    return await Promise.race([operacion(), limite]);
  } catch (error) {
    throw normalizarError(error);
  } finally {
    clearTimeout(temporizador);
  }
}

export const db = {
  seleccionar: (tabla, opciones) => ejecutar(() => backend.seleccionar(tabla, opciones)),
  insertar: (tabla, fila) => ejecutar(() => backend.insertar(tabla, fila)),
  actualizar: (tabla, id, cambios) => ejecutar(() => backend.actualizar(tabla, id, cambios)),
  actualizarDonde: (tabla, filtros, cambios) =>
    ejecutar(() => backend.actualizarDonde(tabla, filtros, cambios)),
  eliminar: (tabla, id) => ejecutar(() => backend.eliminar(tabla, id)),
};

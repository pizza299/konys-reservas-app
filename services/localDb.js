// Base de datos local para el "modo demo".
// Imita las operaciones que la app hace en Supabase y guarda todo en
// AsyncStorage, para poder probar la app antes de configurar Supabase.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crearDatosDemo, datosDemoDesactualizados } from './seed';

const CLAVE = 'konys-demo-db-v1';
let cache = null;

async function cargar() {
  if (cache) return cache;
  try {
    const texto = await AsyncStorage.getItem(CLAVE);
    cache = texto ? JSON.parse(texto) : crearDatosDemo();
    // Datos guardados por una versión anterior de la app: se renuevan
    // (nueva carta, horarios y reservas de ejemplo).
    if (datosDemoDesactualizados(cache)) {
      cache = crearDatosDemo();
      await guardar();
    }
  } catch {
    cache = crearDatosDemo();
  }
  return cache;
}

async function guardar() {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(cache));
  } catch {
    // Si el almacenamiento falla, los datos siguen en memoria.
  }
}

function cumple(fila, [operador, campo, valor]) {
  switch (operador) {
    case 'eq':
      return fila[campo] === valor;
    case 'neq':
      return fila[campo] !== valor;
    case 'gte':
      return fila[campo] >= valor;
    case 'lte':
      return fila[campo] <= valor;
    case 'in':
      return valor.includes(fila[campo]);
    default:
      throw new Error(`Operador no soportado: ${operador}`);
  }
}

function ordenar(filas, orden) {
  return [...filas].sort((a, b) => {
    for (const { campo, asc = true } of orden) {
      if (a[campo] < b[campo]) return asc ? -1 : 1;
      if (a[campo] > b[campo]) return asc ? 1 : -1;
    }
    return 0;
  });
}

// Imita el índice único de Supabase que impide la doble reserva.
function validarDobleReserva(reservas, fila, idIgnorado) {
  if (fila.estado === 'cancelada') return;
  const choca = reservas.some(
    (r) =>
      r.id !== idIgnorado &&
      r.estado !== 'cancelada' &&
      r.mesa_id === fila.mesa_id &&
      r.fecha === fila.fecha &&
      r.hora_inicio === fila.hora_inicio,
  );
  if (choca) {
    const error = new Error('duplicate key value violates unique constraint');
    error.code = '23505';
    throw error;
  }
}

export const localDb = {
  async seleccionar(tabla, { filtros = [], orden = [] } = {}) {
    const db = await cargar();
    const filas = db[tabla].filter((fila) => filtros.every((f) => cumple(fila, f)));
    return ordenar(filas, orden).map((fila) => ({ ...fila }));
  },

  async insertar(tabla, fila) {
    const db = await cargar();
    if (tabla === 'reservas') validarDobleReserva(db.reservas, fila);
    const id = db[tabla].reduce((max, f) => Math.max(max, f.id), 0) + 1;
    const nueva = { id, creado_en: new Date().toISOString(), ...fila };
    db[tabla].push(nueva);
    await guardar();
    return { ...nueva };
  },

  async actualizar(tabla, id, cambios) {
    const db = await cargar();
    const indice = db[tabla].findIndex((f) => f.id === id);
    if (indice === -1) {
      const error = new Error('No rows found');
      error.code = 'PGRST116';
      throw error;
    }
    const actualizada = { ...db[tabla][indice], ...cambios };
    if (tabla === 'reservas') validarDobleReserva(db.reservas, actualizada, id);
    db[tabla][indice] = actualizada;
    await guardar();
    return { ...actualizada };
  },

  async actualizarDonde(tabla, filtros, cambios) {
    const db = await cargar();
    db[tabla] = db[tabla].map((fila) =>
      filtros.every((f) => cumple(fila, f)) ? { ...fila, ...cambios } : fila,
    );
    await guardar();
  },

  async eliminar(tabla, id) {
    const db = await cargar();
    db[tabla] = db[tabla].filter((f) => f.id !== id);
    // Igual que "on delete cascade" en Supabase.
    if (tabla === 'mesas') {
      db.reservas = db.reservas.filter((r) => r.mesa_id !== id);
    }
    await guardar();
  },
};

// Lógica de reservas y slots (colección "reservas").
//
// Un "slot" es un bloque de tiempo reservable. Se generan a partir de los
// horarios: por ejemplo, la jornada de noche 16:30–23:00 con reservas de
// 60 minutos produce los slots 16:30, 17:30, 18:30, 19:30, 20:30 y 21:30.
import { db } from './db';
import { ErrorApp } from './errores';
import { obtenerMesa } from './mesas';
import { DIAS_MAX_ANTICIPACION } from '../constants/config';
import { aISO, aMinutos, hoyISO, minutosAhora, normalizarHora, sumarDias } from '../utils/fechas';
import { soloDigitos } from '../utils/formato';
import { generarSlots, slotsDeFecha } from '../utils/slots';

// ---------- Slots ----------

// La generación de slots vive en utils/slots.js (también la usan los datos demo).
export { generarSlots, slotsDeFecha };

const seCruzan = (aIni, aFin, bIni, bFin) => aIni < bFin && bIni < aFin;

/**
 * Marca cada slot como 'libre', 'ocupado' o 'pasado' (si ya pasó la hora hoy).
 */
export function marcarDisponibilidad(slots, reservasDelDia, fechaISO) {
  const esHoy = fechaISO === hoyISO();
  const ahora = minutosAhora();
  return slots.map((slot) => {
    const ini = aMinutos(slot.inicio);
    const fin = aMinutos(slot.fin);
    const pasado = esHoy && ini <= ahora;
    const ocupado = reservasDelDia.some(
      (r) =>
        r.estado !== 'cancelada' &&
        seCruzan(ini, fin, aMinutos(r.hora_inicio), aMinutos(r.hora_fin)),
    );
    return { ...slot, estado: pasado ? 'pasado' : ocupado ? 'ocupado' : 'libre' };
  });
}

/** El día se puede elegir si el restaurante abre y aún queda algún slot por delante. */
export function fechaHabilitada(horarios, fechaISO) {
  const hoy = hoyISO();
  if (fechaISO < hoy) return false;
  if (fechaISO > aISO(sumarDias(new Date(), DIAS_MAX_ANTICIPACION))) return false;
  const slots = slotsDeFecha(horarios, fechaISO);
  if (fechaISO === hoy) {
    const ahora = minutosAhora();
    return slots.some((s) => aMinutos(s.inicio) > ahora);
  }
  return slots.length > 0;
}

export function primeraFechaHabilitada(horarios) {
  for (let i = 0; i <= DIAS_MAX_ANTICIPACION; i += 1) {
    const iso = aISO(sumarDias(new Date(), i));
    if (fechaHabilitada(horarios, iso)) return iso;
  }
  return null;
}

// ---------- Consultas ----------

function normalizarReserva(r) {
  return { ...r, hora_inicio: normalizarHora(r.hora_inicio), hora_fin: normalizarHora(r.hora_fin) };
}

export async function obtenerReservas({ fecha, mesaId, incluirCanceladas = true } = {}) {
  const filtros = [];
  if (fecha) filtros.push(['eq', 'fecha', fecha]);
  if (mesaId) filtros.push(['eq', 'mesa_id', Number(mesaId)]);
  if (!incluirCanceladas) filtros.push(['neq', 'estado', 'cancelada']);
  const filas = await db.seleccionar('reservas', {
    filtros,
    orden: [{ campo: 'fecha' }, { campo: 'hora_inicio' }],
  });
  return filas.map(normalizarReserva);
}

/**
 * Estado de cada mesa para hoy (tarjetas de Inicio):
 * 'libre' (quedan horarios), 'llena' (todo reservado) o 'sin_turnos'.
 */
export async function estadoMesasHoy(mesas, horarios) {
  const hoy = hoyISO();
  const reservas = await obtenerReservas({ fecha: hoy, incluirCanceladas: false });
  const slots = slotsDeFecha(horarios, hoy);
  const estados = {};
  mesas.forEach((mesa) => {
    const pendientes = marcarDisponibilidad(
      slots,
      reservas.filter((r) => r.mesa_id === mesa.id),
      hoy,
    ).filter((s) => s.estado !== 'pasado');
    const libres = pendientes.filter((s) => s.estado === 'libre').length;
    if (pendientes.length === 0) estados[mesa.id] = 'sin_turnos';
    else estados[mesa.id] = libres > 0 ? 'libre' : 'llena';
  });
  return estados;
}

// ---------- Crear y actualizar ----------

export function validarDatosCliente({ nombre, telefono, personas, capacidad }) {
  const limpio = String(nombre || '').trim();
  if (limpio.length < 3 || !/[a-záéíóúñ]/i.test(limpio)) {
    return 'Escribe tu nombre completo.';
  }
  if (telefono && telefono.trim()) {
    const digitos = soloDigitos(telefono);
    if (digitos.length < 7 || digitos.length > 15) {
      return 'El teléfono debe tener entre 7 y 15 dígitos.';
    }
  }
  if (!personas || personas < 1) return 'Elige el número de personas.';
  if (personas > capacidad) return `Esta mesa admite máximo ${capacidad} personas.`;
  return null;
}

/**
 * RF-05: registra la reserva.
 * Antes de guardar vuelve a consultar Supabase (doble verificación) para
 * evitar la condición de carrera de dos clientes reservando el mismo slot.
 */
export async function crearReserva({ mesaId, fecha, slot, nombre, telefono, personas }) {
  const mesa = await obtenerMesa(mesaId);
  if (!mesa || !mesa.activa) {
    throw new ErrorApp('Esta mesa ya no está disponible para reservas.', { codigo: 'MESA_INACTIVA' });
  }

  const error = validarDatosCliente({ nombre, telefono, personas, capacidad: mesa.capacidad });
  if (error) throw new ErrorApp(error, { codigo: 'VALIDACION' });

  if (fecha === hoyISO() && aMinutos(slot.inicio) <= minutosAhora()) {
    throw new ErrorApp('Ese horario ya pasó. Elige otro, por favor.', { codigo: 'PASADO' });
  }

  const existentes = await obtenerReservas({ fecha, mesaId, incluirCanceladas: false });
  const ocupado = existentes.some((r) =>
    seCruzan(aMinutos(slot.inicio), aMinutos(slot.fin), aMinutos(r.hora_inicio), aMinutos(r.hora_fin)),
  );
  if (ocupado) {
    throw new ErrorApp(
      'Ese horario acaba de ser reservado por otra persona. Elige otro, por favor.',
      { codigo: 'DUPLICADO' },
    );
  }

  const fila = await db.insertar('reservas', {
    mesa_id: mesa.id,
    cliente_nombre: nombre.trim(),
    cliente_contacto: telefono && telefono.trim() ? telefono.trim() : null,
    num_personas: personas,
    fecha,
    hora_inicio: slot.inicio,
    hora_fin: slot.fin,
    estado: 'confirmada',
  });
  return { reserva: normalizarReserva(fila), mesa };
}

export async function cambiarEstadoReserva(id, estado) {
  return normalizarReserva(await db.actualizar('reservas', id, { estado }));
}

// Servicio de horarios de atención (colección "horarios").
import { db } from './db';
import { ErrorApp } from './errores';
import { DIAS_ORDEN } from '../constants/config';
import { aMinutos, normalizarHora, rango12 } from '../utils/fechas';

function normalizar(h) {
  return {
    ...h,
    hora_inicio: normalizarHora(h.hora_inicio),
    hora_fin: normalizarHora(h.hora_fin),
  };
}

export async function obtenerHorarios() {
  const filas = await db.seleccionar('horarios', { orden: [{ campo: 'id' }] });
  return filas.map(normalizar);
}

export function validarHorario({ hora_inicio, hora_fin, duracion_slot }) {
  const inicio = aMinutos(hora_inicio);
  const fin = aMinutos(hora_fin);
  if (inicio >= fin) return 'La hora de cierre debe ser posterior a la de apertura.';
  if (fin - inicio < duracion_slot) {
    return `La jornada debe durar al menos ${duracion_slot} minutos (una reserva).`;
  }
  return null;
}

/** Actualiza una jornada; si todavía no existe en la base de datos, la crea. */
export async function guardarHorario(horario) {
  const error = validarHorario(horario);
  if (error) throw new ErrorApp(error, { codigo: 'VALIDACION' });
  const datos = {
    dia_semana: horario.dia_semana,
    jornada: horario.jornada,
    hora_inicio: horario.hora_inicio,
    hora_fin: horario.hora_fin,
    duracion_slot: horario.duracion_slot,
    activo: horario.activo,
  };
  if (horario.id) return normalizar(await db.actualizar('horarios', horario.id, datos));
  return normalizar(await db.insertar('horarios', datos));
}

export async function cambiarEstadoHorario(id, activo) {
  return db.actualizar('horarios', id, { activo });
}

/** Cambia la duración de cada reserva en todos los horarios. */
export async function actualizarDuracion(minutos) {
  return db.actualizarDonde('horarios', [['neq', 'duracion_slot', minutos]], {
    duracion_slot: minutos,
  });
}

/** Duración vigente (la más usada entre los horarios). */
export function duracionActual(horarios) {
  const conteo = {};
  horarios.forEach((h) => {
    conteo[h.duracion_slot] = (conteo[h.duracion_slot] || 0) + 1;
  });
  const [masUsada] = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0] || [60];
  return Number(masUsada);
}

const DIA_CORTO = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
  domingo: 'Dom',
};

/** ['lunes', …, 'sabado'] → 'Lun a Sáb'; ['domingo'] → 'Dom'; días sueltos separados por coma. */
function etiquetaDias(dias) {
  const indices = dias.map((d) => DIAS_ORDEN.indexOf(d)).sort((a, b) => a - b);
  const tramos = [];
  indices.forEach((i) => {
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && i === ultimo[1] + 1) ultimo[1] = i;
    else tramos.push([i, i]);
  });
  return tramos
    .map(([a, b]) => {
      const desde = DIA_CORTO[DIAS_ORDEN[a]];
      const hasta = DIA_CORTO[DIAS_ORDEN[b]];
      if (a === b) return desde;
      return b === a + 1 ? `${desde} y ${hasta}` : `${desde} a ${hasta}`;
    })
    .join(', ');
}

/**
 * Texto de los horarios de atención para el encabezado de Inicio.
 * - Si todos los días tienen el mismo horario: un chip por jornada ("Almuerzo 12:30 – 2:30 p. m.").
 * - Si cambian según el día: agrupa los días iguales ("Lun a Sáb 11:30 a. m. – 4:00 p. m.").
 */
export function resumenHorarios(horarios) {
  const porDia = DIAS_ORDEN.map((dia) => {
    const abiertas = horarios
      .filter((h) => h.dia_semana === dia && h.activo)
      .sort((a, b) => aMinutos(a.hora_inicio) - aMinutos(b.hora_inicio));
    const firma = abiertas.map((h) => `${h.jornada}|${h.hora_inicio}|${h.hora_fin}`).join(';');
    return { dia, abiertas, firma };
  }).filter((d) => d.firma);

  if (!porDia.length) return [];

  if (porDia.length === 7 && porDia.every((d) => d.firma === porDia[0].firma)) {
    return porDia[0].abiertas.map((h) => ({
      clave: h.jornada,
      texto: `${h.jornada === 'almuerzo' ? 'Almuerzo' : 'Noche'} ${rango12(h.hora_inicio, h.hora_fin)}`,
    }));
  }

  const grupos = [];
  porDia.forEach((d) => {
    const grupo = grupos.find((g) => g.firma === d.firma);
    if (grupo) grupo.dias.push(d.dia);
    else grupos.push({ firma: d.firma, dias: [d.dia], abiertas: d.abiertas });
  });
  return grupos.map((g) => ({
    clave: g.firma,
    texto: `${etiquetaDias(g.dias)} ${g.abiertas.map((h) => rango12(h.hora_inicio, h.hora_fin)).join(' y ')}`,
  }));
}

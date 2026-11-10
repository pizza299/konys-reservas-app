// Generación de slots (bloques reservables) a partir de los horarios.
// Ej.: almuerzo 11:30–14:00 con reservas de 60 min → 11:30 y 12:30
// (la de 13:30 terminaría a las 14:30, después del cierre).
import { aMinutos, claveDia, deMinutos } from './fechas';

export function generarSlots(horario) {
  const inicio = aMinutos(horario.hora_inicio);
  const fin = aMinutos(horario.hora_fin);
  const duracion = Number(horario.duracion_slot) || 60;
  const slots = [];
  for (let t = inicio; t + duracion <= fin; t += duracion) {
    slots.push({ inicio: deMinutos(t), fin: deMinutos(t + duracion), jornada: horario.jornada });
  }
  return slots;
}

/** Todos los slots del día según los horarios activos de ese día de la semana. */
export function slotsDeFecha(horarios, fechaISO) {
  const dia = claveDia(fechaISO);
  return horarios
    .filter((h) => h.activo && h.dia_semana === dia)
    .sort((a, b) => aMinutos(a.hora_inicio) - aMinutos(b.hora_inicio))
    .flatMap(generarSlots);
}

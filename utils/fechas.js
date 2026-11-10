// Utilidades de fechas y horas.
// Las fechas se manejan como texto 'AAAA-MM-DD' en hora local
// y las horas como texto 'HH:MM' (24 horas).

import { DIAS_SEMANA } from '../constants/config';

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const INICIALES_LUNES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const dosDigitos = (n) => String(n).padStart(2, '0');

/** Date -> 'AAAA-MM-DD' (hora local). */
export function aISO(fecha) {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

/** 'AAAA-MM-DD' -> Date a las 00:00 locales. */
export function desdeISO(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function hoyISO() {
  return aISO(new Date());
}

export function mananaISO() {
  return aISO(sumarDias(new Date(), 1));
}

export function sumarDias(fecha, dias) {
  const copia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  copia.setDate(copia.getDate() + dias);
  return copia;
}

/** Lunes de la semana a la que pertenece la fecha. */
export function inicioDeSemana(fecha) {
  const desdeLunes = (fecha.getDay() + 6) % 7;
  return sumarDias(fecha, -desdeLunes);
}

/** Clave del día de la semana: 'lunes', 'martes', ... */
export function claveDia(fechaISO) {
  return DIAS_SEMANA[desdeISO(fechaISO).getDay()];
}

/** 'AAAA-MM-DD' -> 'Sáb 31 oct' */
export function fechaCorta(iso) {
  const f = desdeISO(iso);
  return `${DIAS_CORTOS[f.getDay()]} ${f.getDate()} ${MESES_CORTOS[f.getMonth()]}`;
}

/** Date -> 'Octubre 2026' */
export function mesYAnio(fecha) {
  const mes = MESES[fecha.getMonth()];
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${fecha.getFullYear()}`;
}

/** Normaliza '19:00:00' (formato de Postgres) a '19:00'. */
export function normalizarHora(hora) {
  return String(hora || '').slice(0, 5);
}

/** '19:30' -> 1170 minutos desde la medianoche. */
export function aMinutos(hora) {
  const [h, m] = normalizarHora(hora).split(':').map(Number);
  return h * 60 + (m || 0);
}

/** 1170 -> '19:30' */
export function deMinutos(minutos) {
  return `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`;
}

export function minutosAhora() {
  const ahora = new Date();
  return ahora.getHours() * 60 + ahora.getMinutes();
}

function partes12(hora) {
  const total = aMinutos(hora);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const periodo = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { texto: `${h12}:${dosDigitos(m)}`, periodo };
}

/** '17:00' -> '5:00 p. m.' */
export function hora12(hora) {
  const { texto, periodo } = partes12(hora);
  return `${texto} ${periodo}`;
}

/** ('12:30', '14:30') -> '12:30 – 2:30 p. m.' */
export function rango12(inicio, fin) {
  const a = partes12(inicio);
  const b = partes12(fin);
  if (a.periodo === b.periodo) {
    return `${a.texto} – ${b.texto} ${b.periodo}`;
  }
  return `${a.texto} ${a.periodo} – ${b.texto} ${b.periodo}`;
}

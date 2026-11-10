-- =====================================================================
-- Konys Pizza · Esquema de base de datos para Supabase
-- Cómo usarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- Se puede ejecutar varias veces sin duplicar datos.
-- =====================================================================

-- ---------- 10.1 Mesas ----------
create table if not exists public.mesas (
  id         bigint generated always as identity primary key,
  nombre     text not null check (char_length(nombre) between 1 and 40),
  zona       text not null check (zona in ('terraza', 'salon')),
  capacidad  int  not null check (capacidad between 1 and 20),
  activa     boolean not null default true,
  foto_url   text,
  creado_en  timestamptz not null default now()
);

-- ---------- 10.2 Horarios ----------
create table if not exists public.horarios (
  id             bigint generated always as identity primary key,
  dia_semana     text not null check (dia_semana in ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
  jornada        text not null check (jornada in ('almuerzo', 'noche')),
  hora_inicio    time not null,
  hora_fin       time not null,
  duracion_slot  int  not null default 60 check (duracion_slot between 15 and 240),
  activo         boolean not null default true,
  unique (dia_semana, jornada),
  check (hora_inicio < hora_fin)
);

-- ---------- 10.3 Reservas ----------
create table if not exists public.reservas (
  id                bigint generated always as identity primary key,
  mesa_id           bigint not null references public.mesas (id) on delete cascade,
  cliente_nombre    text not null check (char_length(cliente_nombre) between 2 and 80),
  cliente_contacto  text,
  num_personas      int  not null check (num_personas > 0),
  fecha             date not null,
  hora_inicio       time not null,
  hora_fin          time not null,
  estado            text not null default 'confirmada' check (estado in ('confirmada', 'cancelada', 'completada')),
  creado_en         timestamptz not null default now(),
  check (hora_inicio < hora_fin)
);

-- Evita la DOBLE RESERVA: una mesa no puede tener dos reservas activas
-- que empiecen a la misma hora el mismo día (las canceladas no cuentan).
create unique index if not exists reservas_sin_doble_reserva
  on public.reservas (mesa_id, fecha, hora_inicio)
  where estado <> 'cancelada';

create index if not exists reservas_fecha_idx on public.reservas (fecha);

-- ---------- 10.4 Platos ----------
-- Categorías de la carta real de Konys: pizzas (en cono), combos, fries, granizadas y bebidas.
-- precio_anterior: precio antes del descuento (vacío si el plato no está en promoción).
-- foto_url: enlace https://… o "local:<nombre>" para las fotos incluidas en la app.
create table if not exists public.platos (
  id               bigint generated always as identity primary key,
  nombre           text not null check (char_length(nombre) between 1 and 60),
  categoria        text not null check (categoria in ('pizzas', 'combos', 'fries', 'granizadas', 'bebidas')),
  descripcion      text,
  precio           int  not null check (precio > 0),
  precio_anterior  int,
  disponible       boolean not null default true,
  foto_url         text,
  creado_en        timestamptz not null default now(),
  check (precio_anterior is null or precio_anterior > precio)
);

-- ---------- Validación de reservas en el servidor ----------
-- Revisa que la mesa exista, esté activa y que no se supere su capacidad.
create or replace function public.validar_reserva()
returns trigger
language plpgsql
as $$
declare
  m public.mesas;
begin
  select * into m from public.mesas where id = new.mesa_id;
  if not found then
    raise exception 'La mesa no existe.' using errcode = 'P0001';
  end if;
  if tg_op = 'INSERT' and not m.activa then
    raise exception 'Esta mesa no está disponible para reservas.' using errcode = 'P0001';
  end if;
  if new.num_personas > m.capacidad then
    raise exception 'Esta mesa admite máximo % personas.', m.capacidad using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reservas_validar on public.reservas;
create trigger reservas_validar
  before insert or update on public.reservas
  for each row execute function public.validar_reserva();

-- ---------- Permisos y Row Level Security (RLS) ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.mesas, public.horarios, public.reservas, public.platos to anon, authenticated;

alter table public.mesas    enable row level security;
alter table public.horarios enable row level security;
alter table public.reservas enable row level security;
alter table public.platos   enable row level security;

-- Lectura pública: el cliente ve mesas, horarios, disponibilidad y la carta.
drop policy if exists "lectura publica" on public.mesas;
create policy "lectura publica" on public.mesas for select to anon, authenticated using (true);
drop policy if exists "lectura publica" on public.horarios;
create policy "lectura publica" on public.horarios for select to anon, authenticated using (true);
drop policy if exists "lectura publica" on public.reservas;
create policy "lectura publica" on public.reservas for select to anon, authenticated using (true);
drop policy if exists "lectura publica" on public.platos;
create policy "lectura publica" on public.platos for select to anon, authenticated using (true);

-- El cliente puede crear reservas (siempre en estado 'confirmada').
drop policy if exists "crear reservas" on public.reservas;
create policy "crear reservas" on public.reservas for insert to anon, authenticated
  with check (estado = 'confirmada');

-- Escritura del panel de administración.
-- El panel está protegido con un PIN dentro de la app (alcance del proyecto).
-- ⚠ En producción se debe usar Supabase Auth y cambiar "anon, authenticated"
--   por "authenticated" para que solo el administrador pueda modificar datos.
drop policy if exists "admin modifica" on public.mesas;
create policy "admin modifica" on public.mesas for all to anon, authenticated using (true) with check (true);
drop policy if exists "admin modifica" on public.horarios;
create policy "admin modifica" on public.horarios for all to anon, authenticated using (true) with check (true);
drop policy if exists "admin modifica" on public.platos;
create policy "admin modifica" on public.platos for all to anon, authenticated using (true) with check (true);
drop policy if exists "admin actualiza reservas" on public.reservas;
create policy "admin actualiza reservas" on public.reservas for update to anon, authenticated using (true) with check (true);

-- =====================================================================
-- Datos iniciales (solo se insertan si las tablas están vacías)
-- =====================================================================

insert into public.mesas (nombre, zona, capacidad)
select * from (values
  ('Mesa 1', 'terraza', 2),
  ('Mesa 2', 'terraza', 4),
  ('Mesa 3', 'salon',   4),
  ('Mesa 4', 'salon',   6),
  ('Mesa 5', 'salon',   2),
  ('Mesa 6', 'terraza', 8)
) as v(nombre, zona, capacidad)
where not exists (select 1 from public.mesas);

-- Horario de Konys: lunes a sábado 11:30 a. m. – 2:00 p. m. (almuerzo) y
-- 4:30 – 11:00 p. m. (noche); domingo solo 4:30 – 11:00 p. m.
-- Reservas de 60 minutos.
insert into public.horarios (dia_semana, jornada, hora_inicio, hora_fin, duracion_slot, activo)
select d.dia, j.jornada, j.inicio, j.fin, 60,
       not (d.dia = 'domingo' and j.jornada = 'almuerzo')
from (values ('lunes'),('martes'),('miercoles'),('jueves'),('viernes'),('sabado'),('domingo')) as d(dia)
cross join (values ('almuerzo', time '11:30', time '14:00'), ('noche', time '16:30', time '23:00')) as j(jornada, inicio, fin)
on conflict (dia_semana, jornada) do nothing;

-- Carta de Konys Pizza (Bucaramanga). Las fotos "local:…" vienen dentro de la app.
insert into public.platos (nombre, categoria, precio, precio_anterior, descripcion, foto_url)
select * from (values
  ('Combo lasaña personal',      'combos',     31900, 39900, 'Lasaña artesanal con capas de carne molida jugosa y queso.', 'local:combo-lasana'),
  ('Pizza ikónica',              'pizzas',     30900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-ikonica'),
  ('Konys bucara',               'pizzas',     30900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:konys-bucara'),
  ('Pizza marinera',             'pizzas',     32900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-marinera'),
  ('Pizza mar y tierra',         'pizzas',     31900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-mar-y-tierra'),
  ('Konys bondiola',             'pizzas',     31900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:konys-bondiola'),
  ('Pizza italianísima',         'pizzas',     31900, null, 'Pizza en cono con masa de finas hierbas, jamón serrano y tomates.', 'local:pizza-italianisima'),
  ('Pizza colombianita',         'pizzas',     30900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-colombianita'),
  ('Pizza especial',             'pizzas',     30900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-especial'),
  ('Pizza carnes',               'pizzas',     30900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-carnes'),
  ('Pizza lasagna',              'pizzas',     29900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-lasagna'),
  ('Pizza chicken',              'pizzas',     29900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-chicken'),
  ('Pizza BBQ',                  'pizzas',     29900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-bbq'),
  ('Pizza teriyork',             'pizzas',     29900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-teriyork'),
  ('Pizza carbonara',            'pizzas',     29900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-carbonara'),
  ('Pizza hawaiana',             'pizzas',     28900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-hawaiana'),
  ('Pizza mexicana',             'pizzas',     28900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-mexicana'),
  ('Pizza vegetariana',          'pizzas',     28900, null, 'Pizza en cono de 18 cm y 300 g de relleno, elaborada en masa de finas hierbas.', 'local:pizza-vegetariana'),
  ('Fries ikónicas',             'fries',      38000, null, 'Papas locas al estilo Konys, con nuestras papas exclusivas.', 'local:fries-ikonicas'),
  ('Granizada de limón',         'granizadas',  9900, null, 'Limón y azúcar.', 'local:granizada-limon'),
  ('Granizada de yerbabuena',    'granizadas',  9900, null, 'Azúcar, yerbabuena y limón.', 'local:granizada-yerbabuena'),
  ('Granizada de mandarina',     'granizadas',  9900, null, 'Pulpa de mandarina y azúcar.', 'local:granizada-mandarina'),
  ('Granizada de naranja',       'granizadas',  9900, null, 'Naranja y azúcar.', 'local:granizada-naranja'),
  ('Granizada maracumango',      'granizadas', 10900, null, 'Azúcar y maracumango.', 'local:granizada-maracumango'),
  ('Granizada limonada de coco', 'granizadas', 11000, null, 'Azúcar, coco y limón.', 'local:granizada-limonada-coco'),
  ('Granizada cerezada',         'granizadas', 11000, null, 'Cerezas, azúcar, agua y limón.', 'local:granizada-cerezada'),
  ('Granizada piña colada',      'granizadas', 11000, null, 'Piña, coco, leche condensada y azúcar.', 'local:granizada-pina-colada'),
  ('Coca-Cola Original 400 ml',  'bebidas',     6000, null, 'Gaseosa.', 'local:coca-cola-400'),
  ('Cristal con gas 600 ml',     'bebidas',     6000, null, 'Agua con gas.', 'local:cristal-con-gas'),
  ('Cristal sin gas 600 ml',     'bebidas',     6000, null, 'Agua sin gas.', 'local:cristal-sin-gas')
) as v(nombre, categoria, precio, precio_anterior, descripcion, foto_url)
where not exists (select 1 from public.platos);

-- Fotos de prueba de las mesas (Unsplash, uso libre). Solo se completan las que no
-- tienen foto, así que también sirve si ya habías ejecutado este archivo antes.
update public.mesas m
set foto_url = 'https://images.unsplash.com/photo-' || v.foto || '?w=800&q=70&fm=jpg&fit=crop'
from (values
  ('Mesa 1', '1559339352-11d035aa65de'),
  ('Mesa 2', '1600093463592-8e36ae95ef56'),
  ('Mesa 3', '1517248135467-4c7edcad34c4'),
  ('Mesa 4', '1555396273-367ea4eb4db5'),
  ('Mesa 5', '1544148103-0773bf10d330'),
  ('Mesa 6', '1537047902294-62a40c20a6ae')
) as v(nombre, foto)
where m.nombre = v.nombre and m.foto_url is null;

-- Reservas de ejemplo para hoy y mañana (para el video de demostración).
-- "turno" es el número de bloque del día contando todas sus jornadas (0 = el primero),
-- así las reservas siempre caen en horarios válidos sin importar el día.
with ejemplos(mesa, nombre, contacto, personas, dias, turno, estado) as (
  values
    ('Mesa 1', 'Sofía Ruiz',     '3001234567', 2, 0, 0, 'completada'),
    ('Mesa 3', 'Camila Torres',  null,         3, 0, 0, 'confirmada'),
    ('Mesa 3', 'Diego Herrera',  '3012223344', 2, 0, 1, 'confirmada'),
    ('Mesa 3', 'Juan Pérez',     '3109876543', 4, 0, 2, 'confirmada'),
    ('Mesa 1', 'María Gómez',    null,         2, 0, 2, 'confirmada'),
    ('Mesa 2', 'Laura Díaz',     '3155550101', 2, 0, 3, 'cancelada'),
    ('Mesa 5', 'Andrés Rojas',   '3204445566', 2, 0, 3, 'confirmada'),
    ('Mesa 4', 'Carlos Méndez',  '3187778899', 5, 1, 1, 'confirmada'),
    ('Mesa 6', 'Valentina Cruz', '3016667788', 7, 1, 2, 'confirmada')
),
dias_semana(numero, nombre) as (
  values (1, 'lunes'), (2, 'martes'), (3, 'miercoles'), (4, 'jueves'), (5, 'viernes'), (6, 'sabado'), (7, 'domingo')
),
-- Fecha de hoy en Colombia.
fechas as (
  select distinct e.dias, (now() at time zone 'America/Bogota')::date + e.dias as fecha
  from ejemplos e
),
-- Todos los bloques reservables de cada fecha (todas sus jornadas abiertas), numerados.
bloques as (
  select f.dias, f.fecha,
         (row_number() over (partition by f.dias order by h.hora_inicio + make_interval(mins => n.i * h.duracion_slot)) - 1)::int as turno,
         h.hora_inicio + make_interval(mins => n.i * h.duracion_slot) as inicio,
         h.hora_inicio + make_interval(mins => (n.i + 1) * h.duracion_slot) as fin
  from fechas f
  join dias_semana d on d.numero = extract(isodow from f.fecha)::int
  join public.horarios h on h.dia_semana = d.nombre and h.activo
  cross join lateral generate_series(
    0, ((extract(epoch from (h.hora_fin - h.hora_inicio)) / 60)::int / h.duracion_slot) - 1
  ) as n(i)
)
insert into public.reservas (mesa_id, cliente_nombre, cliente_contacto, num_personas, fecha, hora_inicio, hora_fin, estado)
select (select id from public.mesas where nombre = e.mesa), e.nombre, e.contacto, e.personas,
       b.fecha, b.inicio, b.fin, e.estado
from ejemplos e
join bloques b on b.dias = e.dias and b.turno = e.turno
where not exists (select 1 from public.reservas);

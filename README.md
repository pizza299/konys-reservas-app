# Konys Pizza · App de reservas

Aplicación móvil multiplataforma (Android e iOS) para que los clientes de **Konys Pizza** reserven mesa sin llamar ni escribir por WhatsApp, y para que el administrador gestione mesas, horarios, reservas y la carta digital.

Hecha con **React Native + Expo (SDK 58)**, **Expo Router** y **Supabase**.

> 📄 El documento del proyecto, los mockups de baja fidelidad y el mapa de navegación están en la carpeta [`docs/`](docs/).

---

## Funcionalidades

**Cliente (sin registro)**
- **Inicio:** portada de Konys, horarios de atención (lunes a sábado 11:30 a. m. – 2:00 p. m. y 4:30 – 11:00 p. m.; domingo 4:30 – 11:00 p. m.), dirección, botón *Reservar mesa* y tarjetas de mesas (nombre, zona, capacidad y estado de hoy). Filtro *Todas · Terraza · Salón*.
- **Reservar mesa:** selector de fecha por semanas (solo días con atención), horarios divididos en *Almuerzo* y *Noche* (libres en blanco, ocupados en gris, elegido en oscuro), número de personas limitado por la capacidad de la mesa, nombre y teléfono opcional.
- **Confirmación:** comprobante con fecha, hora, mesa, personas y código (`KP-0172`).
- **Carta:** la carta real de Konys por categoría (Pizzas en cono, Combos, Fries, Granizadas y Bebidas) con foto y precio en COP. Los platos en descuento muestran el porcentaje y el precio anterior tachado, y se agrupan en *Promos*. Los platos ocultos no se muestran.

**Administrador (protegido con PIN)**
- **Acceso con PIN** de 4 dígitos; si es incorrecto muestra un aviso y tras 5 intentos bloquea 30 s. La sesión se recuerda 12 horas (AsyncStorage).
- **Reservas** (abre por defecto): filtros *Hoy · Mañana · Todas* y por mesa; se pueden marcar como completadas o canceladas.
- **Mesas:** listado con interruptor *Activa / Inactiva*, editar, borrar y botón **+** para crear.
- **Horarios:** los 7 días con sus jornadas de almuerzo y noche (editables o cerradas) y la duración de cada reserva.
- **Carta (admin):** agregar, editar, ocultar o borrar platos (botón *Carta* del panel). Para poner un plato en promoción se escribe el *precio antes del descuento*.

**Reglas importantes**
- No se puede reservar un horario ocupado ni superar la capacidad de la mesa.
- **Doble verificación:** antes de guardar, la app vuelve a consultar Supabase; además, la base de datos tiene un índice único que impide dos reservas activas en la misma mesa, fecha y hora (evita la *condición de carrera*).
- Si no hay internet o falla Supabase, se muestra un mensaje claro con botón *Reintentar*.

---

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| React Native 0.88 + Expo SDK 58 | Interfaz móvil para Android e iOS |
| Expo Router | Pestañas (Inicio, Carta, Admin) y navegación en pila |
| Supabase (`@supabase/supabase-js`) | Base de datos (mesas, horarios, reservas, platos) |
| AsyncStorage | Sesión del administrador y modo demo |
| @expo/vector-icons (Ionicons) | Íconos |
| EAS Build | Generación del APK |

---

## Cómo ejecutarlo

Requisitos: Node.js LTS, la app **Expo Go** en el celular y el celular en la misma red Wi‑Fi que el computador.

```bash
npm install
npx expo start
```

Escanea el código QR con Expo Go (Android) o con la cámara (iPhone).

### Modo demo (sin Supabase)

Si todavía no hay archivo `.env`, la app arranca en **modo demo** con datos de ejemplo guardados en el celular (aparece un aviso naranja en Inicio). Sirve para probar todo el flujo antes de configurar la base de datos.

### Conectar con Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. Abre **SQL Editor → New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**. Crea las 4 tablas, las reglas de seguridad (RLS), las validaciones y los datos de ejemplo.
3. Copia `.env.example` como `.env` y completa la URL y la clave pública (*anon* o *publishable*) de **Project Settings → API**:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica
   EXPO_PUBLIC_ADMIN_PIN=1234
   ```

4. Reinicia el servidor: `npx expo start --clear`.

> ⚠️ Usa solo la clave pública, **nunca** la `service_role`. El archivo `.env` está en `.gitignore` y no se sube a GitHub.

**PIN del administrador:** `1234` (o el valor de `EXPO_PUBLIC_ADMIN_PIN`).

**Fotos:** las fotos de los platos vienen dentro de la app (`assets/platos`); en la base de datos se guardan como `local:<nombre>`. Los platos que aún no tienen foto propia usan la foto general de Konys (`konys-menu.jpg`). Para cambiar o agregar fotos, sigue las instrucciones de `constants/fotosLocales.js`. Las mesas usan fotos de prueba de [Unsplash](https://unsplash.com) (uso libre) que se cargan desde internet. Para cambiar cualquier foto, edita la mesa o el plato en el panel y pega un enlace `https://…` en el campo *Foto*.

> Si ya habías ejecutado una versión anterior de `schema.sql`, borra las tablas (o crea un proyecto nuevo) y vuelve a ejecutarlo para cargar la carta, las categorías y los horarios nuevos.

---

## Generar el APK (EAS Build)

El proyecto ya está vinculado a EAS (`@pizza299/konys-reservas-app`, ver `extra.eas.projectId` en `app.json`) y las variables ya están cargadas en el entorno *preview*. Para generar un APK nuevo basta con:

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

Al terminar, EAS entrega un enlace para descargar e instalar el APK (también aparece en expo.dev → proyecto → Builds).

Si se cambian las credenciales de Supabase, hay que actualizarlas en EAS, porque el archivo `.env` no se sube a los servidores de Expo:

```bash
npx eas-cli@latest env:set preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxx.supabase.co" --visibility plaintext
npx eas-cli@latest env:set preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "tu-clave-publica" --visibility plaintext
npx eas-cli@latest env:set preview --name EXPO_PUBLIC_ADMIN_PIN --value "1234" --visibility sensitive
```

---

## Pruebas realizadas

Pruebas del 16 de noviembre de 2026 con la app conectada a Supabase (navegador, pantallas de 360 px, 375 px y tablet):

| Caso | Resultado |
| --- | --- |
| Reserva completa (mesa → fecha → horario → datos → confirmación con código) | ✅ Se guarda en Supabase (`KP-0010`) |
| Elegir un horario ocupado | ✅ El horario aparece en gris y avisa "ya está reservado" |
| Más personas que la capacidad de la mesa | ✅ Avisa el máximo permitido |
| Nombre vacío o muy corto / teléfono inválido | ✅ Muestra el error y no guarda |
| Dos clientes reservan el mismo horario a la vez | ✅ Supabase lo rechaza (índice único `reservas_sin_doble_reserva`) |
| Reserva con más personas enviada directo a la base | ✅ Rechazada por el trigger de capacidad |
| Cliente intentando crear una reserva "completada" | ✅ Rechazada por RLS |
| Acceso admin con PIN incorrecto / correcto | ✅ Avisa / abre el panel |
| Cancelar una reserva desde el panel | ✅ Cambia a "cancelada" en Supabase y el horario queda libre |
| Desactivar una mesa | ✅ Desaparece para los clientes; al activarla vuelve |
| Sin conexión con Supabase | ✅ Mensaje "Sin conexión" con botón *Reintentar* |
| Pantallas de 360 px, 375 px y tablet | ✅ Sin desbordes; en tablet la cuadrícula pasa a 3 columnas |

Pendiente: repetir el flujo en un celular real con Expo Go y con el APK instalado.

---

## Estructura del proyecto

```
konys-reservas-app/
├── app/                      # Pantallas (Expo Router)
│   ├── _layout.js            # Navegación en pila + sesión admin
│   ├── (tabs)/
│   │   ├── _layout.js        # Barra inferior: Inicio · Carta · Admin
│   │   ├── index.js          # Inicio (mesas)
│   │   ├── carta.js          # Carta digital
│   │   └── admin.js          # PIN o panel de administración
│   ├── reservar/[mesaId].js  # Reservar mesa
│   ├── confirmacion.js       # Comprobante de la reserva
│   └── admin-carta.js        # Gestión de la carta (admin)
├── components/               # MesaCard, SlotButton, PlatoItem, SelectorFecha…
│   ├── admin/                # Panel, PIN, mesas, horarios, reservas y formularios
│   └── ui/                   # Botón, chip, insignia, campo, hoja modal…
├── services/                 # Acceso a datos y lógica de negocio
│   ├── supabase.js           # Cliente de Supabase
│   ├── db.js                 # Elige Supabase o modo demo; tiempo máximo y errores
│   ├── reservas.js           # Slots, disponibilidad y creación de reservas
│   ├── mesas.js · horarios.js · platos.js
│   └── localDb.js · seed.js  # Modo demo
├── context/AdminAuth.js      # Sesión del administrador (PIN)
├── hooks/useDatos.js         # Carga de datos con recarga al volver a la pantalla
├── constants/                # Colores y configuración
├── utils/                    # Fechas, formatos y diálogos
├── supabase/schema.sql       # Tablas, RLS, validaciones y datos de ejemplo
├── docs/                     # Documento, mockups y mapa de navegación
├── .env.example
├── app.json · eas.json
└── README.md
```

---

## Modelo de datos (Supabase)

| Tabla | Campos |
| --- | --- |
| `mesas` | id, nombre, zona (`terraza`/`salon`), capacidad, activa, foto_url, creado_en |
| `horarios` | id, dia_semana, jornada (`almuerzo`/`noche`), hora_inicio, hora_fin, duracion_slot, activo |
| `reservas` | id, mesa_id, cliente_nombre, cliente_contacto, num_personas, fecha, hora_inicio, hora_fin, estado (`confirmada`/`cancelada`/`completada`), creado_en |
| `platos` | id, nombre, categoria (`pizzas`/`combos`/`fries`/`granizadas`/`bebidas`), descripcion, precio (COP), precio_anterior (si tiene descuento), disponible, foto_url, creado_en |

> Seguridad: el panel se protege con un PIN dentro de la app (alcance del proyecto), por eso las políticas RLS permiten escribir con la clave pública. En producción se recomienda usar Supabase Auth y limitar la escritura a usuarios autenticados.

---

## Entregables

- **Video explicativo:** _pendiente (agregar enlace)_
- **APK / enlace de Expo:** _pendiente (agregar enlace)_
- **Integrantes:** _pendiente_

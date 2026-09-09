@AGENTS.md

# Start development server (http://localhost:3000)

pnpm dev

- This is an events tickets managment system used by a lot of clients at the same time.

- We use pnpm
- Don't use npx use pnpm

- Dashboard components go inside dashboard/components folder.

- Stack: Nextjs, tailwind, prisma with postgressql, pnpm, typescript
- Business must be written in english. UI in spanish.

- **NEVER** Use :any to type
- **NEVER** Use npm
- **NEVER** create or reintroduce `middleware.ts`. Usamos `proxy.ts` en la raíz — `middleware.ts` quedó deprecado y removido a propósito. Si en una inspección/refactor parece que falta o que "debería" ser `middleware.ts`, es un falso positivo: no lo recrees ni sugieras migrar de vuelta.
- **NEVER** persist form/wizard state to `localStorage`/`sessionStorage` keyed by a fixed string (e.g. not scoped per-user/session). El sistema es usado por muchos clientes en la misma compu/navegador (kiosco, mostrador); una key fija filtra datos de un usuario a otro cuando el primero no termina el flujo. Si hace falta recuperar borradores, escalar la solución con el usuario antes de implementarla (guardado server-side asociado al usuario, por ejemplo).

## Wizard de creación de eventos

- `app/(dashboard)/dashboard/components/create-event-wizard/create-event-wizard.tsx` maneja todo el estado del wizard (6 pasos: Datos, Tipo, Fechas, Lugar, Imagen, Pagos) en memoria (`useState`), **sin persistencia** entre reloads/tabs. Antes usaba `sessionStorage` con una key fija (`ey_wizard_state`) — se quitó porque otro usuario logueado en el mismo navegador heredaba el borrador incompleto del anterior. Ver regla arriba.
- Al cerrar/recargar la pestaña con datos cargados (`wizardState.step1 !== null`) se muestra el warning nativo `beforeunload` como única protección contra pérdida de datos.
- El paso de "Pagos" (`step-7-payment-methods.tsx`, último paso, botón "Crear evento") ya no manda a `/dashboard/configuracion/metodos-de-pago` en una pestaña nueva cuando no hay métodos configurados — eso perdía el borrador del wizard al volver. En su lugar usa `AddPaymentMethodDialog` (`components/dashboard/add-payment-method-dialog.tsx`) embebido como modal: crea el método y lo selecciona automáticamente sin salir del wizard, tanto si no hay ninguno configurado como para agregar uno adicional.
- `AddPaymentMethodDialog` recibe `producerId`/`creatorId` explícitos (no una `Session` completa) más `trigger` y `onCreated` opcionales, justamente para poder reutilizarlo embebido en el wizard además de en `/dashboard/configuracion/metodos-de-pago`.
- Ya **no existe** un paso de "tipos de entrada" dentro del wizard (se quitó `step-7-ticket-type.tsx`). Al crear el evento aparece un dialog (¡Evento creado!) con dos acciones: "Crear tipo de entrada" (navega a `/dashboard/evento/[id]/ticket-types/new`) o "Ir al evento" — es una sugerencia opcional, no un paso forzado.

## Wizard de edición de evento

- `app/(dashboard)/dashboard/components/edit-event-wizard/edit-event-wizard.tsx` (usado en `/dashboard/evento/[id]/editar`) tiene **solo 3 pasos**: Datos, Fechas y Lugar. Guarda cada paso independiente contra el servidor (`updateEvent`) al tocar "Guardar cambios", no hay estado global que persistir.
- **A propósito** no incluye pasos de Tipo de evento (público/privado), Imagen, Estado ni Métodos de pago:
  - Categoría, restricciones, texto legal, sitio web y estado del evento se editan desde la pestaña "Detalles" del evento (`components/dashboard/edit-event-form.tsx`, usado en `components/dashboard/event-details/details-tab.tsx`).
  - La imagen se edita desde `components/dashboard/event-details/event-image-section.tsx`.
  - Los métodos de pago asignados se gestionan desde la pestaña "Métodos de pago" del evento (`components/dashboard/event-details/payment-methods-tab.tsx` + `assign-payment-method-dialog.tsx`) — deliberadamente no se agregó ahí un modal de creación inline; queda fuera del wizard de edición.
  - El tipo de evento (público/privado) **no tiene UI de edición post-creación**: se saca a propósito porque cambiarlo genera conflictos con los tipos de entrada ya existentes, sobre todo si el evento ya tiene entradas emitidas.

## Stock de tickets (TicketType)

El manejo de stock de tickets funciona con un modelo **delta-based** (control de inventario tradicional):

- La cantidad inicial de un `TicketType` se define al crearlo ("Cantidad inicial").
- Luego, el stock se ajusta sumando o restando unidades (nunca se sobreescribe el valor absoluto directamente desde el formulario de edición).
- Cada ajuste queda registrado en la tabla `ticket_stock_movements`.

### Registro de movimientos (`TicketStockMovement`)

Cada movimiento almacena:

- `ticketTypeId`, `eventId`, `producerId` — contexto del ticket
- `performedById` — usuario que realizó el movimiento (FK a `User`)
- `type: StockMovementType` — `INCREASE` o `DECREASE`
- `delta` — cantidad ajustada (positivo o negativo)
- `previousQuantity` / `newQuantity` — estado antes y después
- `reason` — motivo opcional
- `createdAt` — timestamp

### Archivos clave

| Archivo                                                                                | Rol                                                                                                                |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `prisma/schema.prisma`                                                                 | Modelos `TicketStockMovement` y enum `StockMovementType`                                                           |
| `types/ticket-stock.ts`                                                                | Tipos TypeScript `TicketStockMovement`, `StockMovementType`                                                        |
| `lib/api/ticket-types.ts`                                                              | `adjustTicketTypeStock()` (transacción atómica: valida + actualiza + registra) y `getStockMovementsByTicketType()` |
| `lib/actions.ts`                                                                       | `adjustTicketStock()` (server action con auth) y `getTicketStockMovements()`                                       |
| `app/(dashboard)/dashboard/components/edit-ticket-type-form/edit-ticket-type-form.tsx` | Panel de control de stock con botones rápidos ±10/±20/±100 e input personalizado                                   |
| `app/(dashboard)/dashboard/components/stock-movement-log/stock-movement-log.tsx`       | Tabla de historial de movimientos (read-only)                                                                      |
| `app/(dashboard)/dashboard/evento/[id]/ticket-types/[ticketTypeId]/edit/page.tsx`      | Página de edición: carga historial y lo muestra bajo el formulario                                                 |
| `hooks/use-producer-stock-summary.ts`                                                  | Hook SWR (`useProducerStockSummary`) que alimenta el widget "Disponibles" del sidebar + `refreshProducerStockSummary()` |

### Validaciones (en la transacción `adjustTicketTypeStock`)

- No se puede reducir el stock por debajo de los tickets vendidos (`PAID`, no invitaciones).
- No se puede agregar stock que supere el pool disponible de la productora.
- El stock no puede ser negativo.
- `cancelTicketPackage` (`lib/api/superadmin/tickets.ts`) también valida contra el stock comprometido antes de cancelar un paquete — ver skill `ticket-stock-flow` para el detalle completo de validaciones, los gaps de autorización ya corregidos, y el diseño pendiente para cerrar condiciones de carrera entre mutaciones concurrentes del pool.

### Frescura del widget "Disponibles" (sidebar)

- `components/dashboard/producer-stock-widget.tsx` lee de `hooks/use-producer-stock-summary.ts` (SWR), no de un store de Zustand — ver skill `client-state-management` para la convención completa.
- Todo componente cliente que dispare una mutación que cambie el pool (`TicketPackage`), `TicketType.quantity` (crear, editar, ajustar stock, pausar/eliminar) o `MemberTicketAllocation` debe llamar `refreshProducerStockSummary()` después de la mutación exitosa, para que el widget se actualice al instante. Esto es solo para feedback rápido: el hook igual se revalida solo cada 30s y al volver el foco a la pestaña (`revalidateOnFocus`), así que un sitio que se olvide de llamarlo no deja el widget desactualizado para siempre — ver skill `ticket-stock-flow` para la lista completa de puntos de mutación y por qué esa red de seguridad es necesaria (hay mutaciones, como el webhook de MercadoPago y el panel superadmin, que no tienen ningún cliente al que avisarle).
- `generateSeatsForEventVenue` (`lib/api/seats.ts`) ya no escribe `TicketType.quantity` directo: calcula el delta contra la cantidad de asientos generados y llama a `adjustTicketTypeStock()`, así que generar/regenerar asientos valida contra el pool disponible y queda registrado en `TicketStockMovement` igual que cualquier otro ajuste.

## Mapas de venues y asientos (Venue / Seat maps)

Feature en desarrollo (branch `feat/venue-maps`) que permite crear un mapa de sala reutilizable (venue), asignar sus sectores a `TicketType` de un evento, y vender por asiento en vez de por cantidad genérica.

### Modelo de datos

- `Venue` — sala reutilizable de una productora (`widthCells`/`heightCells` = grilla del canvas).
- `VenueSector` — sector lógico (nombre + color), sin posición propia en el canvas.
- `VenueElement` — elemento visual del canvas (`ROW`, `STAGE`, `TABLE`, `TEXT`, `ENTRANCE`, `EXIT`). Un `ROW` guarda su config de butacas inline (`rowLabel`, `startNumber`, `seatCount`, `seatPattern`, `orderDirection`, `seatSpacing`); un `TABLE` guarda `tableCapacity`. Un elemento se asigna a un sector vía `sectorId`.
- `EventVenue` — asigna un `Venue` a un `Event` puntual (1:1 por evento).
- `EventSectorMapping` — mapea `VenueSector` → `TicketType` para ese `EventVenue` (define precio/tipo por sector).
- `Seat` — asiento generado a partir de un `VenueElement` tipo `ROW`/`TABLE` para un `EventVenue` concreto. Estados: `AVAILABLE`, `HELD`, `SOLD`, `BLOCKED`.

Los asientos **no existen hasta generarlos**: se crean a partir del mapa del venue + los mappings sector→ticketType de ese evento (`generateSeatsForEventVenue`). Regenerar requiere borrar los existentes primero, y no se pueden borrar asientos `SOLD`.

### Archivos clave

| Archivo                                                                  | Rol                                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                                                   | Modelos `Venue`, `VenueSector`, `VenueElement`, `EventVenue`, `EventSectorMapping`, `Seat`     |
| `types/venue.ts`                                                         | Tipos de venue/sector/elemento (incluye `EditorSector`/`EditorElement` con `localId` para el editor) |
| `types/seat.ts`                                                          | Tipos de asiento y resultados de hold/venta                                                   |
| `lib/api/venues.ts`                                                      | CRUD de venues, `saveVenueMap()` (reemplaza sectors+elements atómicamente), mapping sector↔ticket |
| `lib/api/seats.ts`                                                       | `generateSeatsForEventVenue()`, `holdSeat()`/`releaseSeat()`/`sellSeat()` (updates atómicos condicionales para evitar TOCTOU), `releaseExpiredHolds()` |
| `app/(dashboard)/dashboard/venues/`                                      | Listado, alta y edición de venues (dashboard)                                                 |
| `app/(dashboard)/dashboard/components/venue-map-editor/`                 | Editor visual del mapa (canvas por celdas, toolbar, sidebar, store `use-venue-editor-store.ts`) |
| `components/seat-map/`                                                   | Render del mapa para selección de asientos (compra) — SVG + selección                         |

### Notas

- `holdSeat`/`sellSeat` usan `updateMany` con condición de estado en el `where` (no `findUnique` + `update`) para evitar condiciones de carrera cuando dos compradores intentan el mismo asiento a la vez.
- `TicketType.quantity` se sincroniza automáticamente a la cantidad de asientos generados por sector — pero **ya no** escribiendo `quantity` directo: `generateSeatsForEventVenue()` calcula el delta y llama a `adjustTicketTypeStock()` (ver sección "Stock de tickets"), así que generar/regenerar asientos valida contra el pool disponible de la productora y queda registrado en `TicketStockMovement` como cualquier otro ajuste.

## Manejo de estado cliente (Zustand vs SWR)

Regla general para elegir entre Zustand y SWR al agregar estado nuevo en el dashboard:

- **Zustand** — solo para estado de UI puramente local/efímero, sin una fuente de verdad en el servidor que otros usuarios puedan cambiar mientras el actual tiene la pantalla abierta. Ejemplo: `app/(dashboard)/dashboard/components/venue-map-editor/use-venue-editor-store.ts`, que es un buffer de edición del canvas del mapa de venue, sembrado desde props que ya vinieron del servidor (`loadFromSaved`) — no hace fetch propio.
- **SWR** — para cualquier resumen/dato server-derived que deba mantenerse fresco ante mutaciones que pueden venir de **múltiples orígenes** (otros componentes, otras pestañas, webhooks, el panel superadmin). Ejemplo de referencia: `hooks/use-producer-stock-summary.ts`.

Convención para un hook SWR nuevo (`hooks/use-<recurso>.ts`):

- El fetcher es un server action ya existente (no un `fetch` a una API route nueva) — el action ya resuelve `producerId`/scoping desde la sesión server-side, así que la key de cache puede ser un string fijo simple (nunca aceptar un `producerId`/`userId` del cliente para armar la key).
- Exportar la key de cache (`export const X_KEY = "..."`) y un helper `refresh<Recurso>()` que envuelva `mutate(X_KEY)` de `swr`, para que los sitios de mutación no necesiten importar `swr` directamente.
- Configurar `refreshInterval` + `revalidateOnFocus`/`revalidateOnReconnect` cuando el dato puede cambiar desde fuera de la sesión del cliente (webhooks, rutas de superadmin) — esto es una red de seguridad ante sitios de mutación que se olviden de llamar al `refresh`, no un reemplazo de esa llamada (la llamada explícita sigue siendo la que da feedback instantáneo).
- El cache de SWR vive en memoria del tab del browser, no se persiste a disco — no es el mismo riesgo que la regla de arriba sobre no usar `localStorage`/`sessionStorage` con key fija (esa regla es sobre persistir borradores de usuario entre sesiones/reloads en una compu compartida; esto es cache de datos del servidor que se descarta al cerrar la pestaña).

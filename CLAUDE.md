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
- **NEVER** persist form/wizard state to `localStorage`/`sessionStorage` keyed by a fixed string (e.g. not scoped per-user/session). El sistema es usado por muchos clientes en la misma compu/navegador (kiosco, mostrador); una key fija filtra datos de un usuario a otro cuando el primero no termina el flujo. Si hace falta recuperar borradores, escalar la solución con el usuario antes de implementarla (guardado server-side asociado al usuario, por ejemplo).

## Wizard de creación de eventos

- `app/(dashboard)/dashboard/components/create-event-wizard/create-event-wizard.tsx` maneja todo el estado del wizard (7 pasos) en memoria (`useState`), **sin persistencia** entre reloads/tabs. Antes usaba `sessionStorage` con una key fija (`ey_wizard_state`) — se quitó porque otro usuario logueado en el mismo navegador heredaba el borrador incompleto del anterior. Ver regla arriba.
- Al cerrar/recargar la pestaña con datos cargados (`wizardState.step1 !== null`) se muestra el warning nativo `beforeunload` como única protección contra pérdida de datos.

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

### Validaciones (en la transacción `adjustTicketTypeStock`)

- No se puede reducir el stock por debajo de los tickets vendidos (`PAID`, no invitaciones).
- No se puede agregar stock que supere el pool disponible de la productora.
- El stock no puede ser negativo.

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
- `TicketType.quantity` se sincroniza automáticamente al cantidad de asientos generados por sector.

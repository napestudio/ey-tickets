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

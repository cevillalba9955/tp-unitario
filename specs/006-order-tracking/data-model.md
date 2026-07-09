# Data Model: Contratación y Seguimiento de Pedidos

Fecha: 2026-07-08 · Feature: `006-order-tracking`

Persistencia in-memory: se agrega `store.orders = new Map()` (clave = `id` del pedido).

## Entidad: Pedido (`Order`)

| Campo | Tipo | Descripción | Reglas |
|-------|------|-------------|--------|
| `id` | string (uuid) | Identificador del pedido | Generado al crear |
| `buyerId` | string | Usuario comprador que contrató | Igual al `userId` del token al crear; rol `buyer` |
| `freelancerId` | string | Dueño del servicio contratado | Derivado de `service.freelancerId` |
| `serviceId` | string | Servicio contratado | Debe existir y estar `PUBLISHED` al contratar |
| `packageId` | string | Paquete contratado | Debe pertenecer a `serviceId` |
| `packageSnapshot` | objeto | Copia inmutable al contratar (FR-005) | Ver sub-tabla |
| `stage` | enum | Etapa actual del ciclo de vida | Uno de los valores de "Etapa" |
| `history` | Transición[] | Historial ordenado de transiciones | Append-only; incluye la creación |
| `createdAt` | string (ISO) | Fecha de creación | |
| `updatedAt` | string (ISO) | Fecha de última transición | |

### `packageSnapshot` (inmutable, FR-005)

| Campo | Tipo | Origen |
|-------|------|--------|
| `serviceTitle` | string | `service.title` al contratar |
| `packageName` | string | `package.name` al contratar |
| `price` | number | `package.price` al contratar |
| `deliveryDays` | number | `package.deliveryDays` al contratar |

## Enum: Etapa (`stage`)

Valores almacenados (estables) → etiqueta visible (spec):

| Valor almacenado | Etiqueta | Final |
|------------------|----------|-------|
| `PENDIENTE` | Pendiente | no |
| `CONFIRMADO` | Confirmado | no |
| `EN_REVISION` | EnRevisión | no |
| `ENTREGADO` | Entregado | **sí** |
| `CANCELADO` | Cancelado | **sí** |

- Etapa inicial de todo pedido: `PENDIENTE` (FR-006).
- Etapas finales (`ENTREGADO`, `CANCELADO`) no admiten transiciones (FR-013).

## Entidad: Transición (`history[]`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `from` | enum\|null | Etapa origen (`null` en el registro de creación) |
| `to` | enum | Etapa destino |
| `action` | string | Acción aplicada (`create`, `accept`, `reject`, `deliver`, `accept_delivery`, `request_changes`, `cancel`) |
| `actorRole` | string | Rol que ejecutó (`buyer` \| `freelancer` \| `system`) |
| `actorId` | string | Usuario que ejecutó |
| `at` | string (ISO) | Fecha/hora |

## Máquina de estados (transiciones válidas)

Referencia normativa: [research.md](./research.md) D1. Cualquier tupla
`(stage, action, actorRole)` fuera de esta tabla es inválida → **409 CONFLICT** (SC-003).

```text
PENDIENTE   --accept(freelancer)-->          CONFIRMADO
PENDIENTE   --reject(freelancer)-->           CANCELADO
PENDIENTE   --cancel(buyer)-->                CANCELADO
CONFIRMADO  --deliver(freelancer)-->          EN_REVISION
CONFIRMADO  --cancel(buyer)-->                CANCELADO
EN_REVISION --accept_delivery(buyer)-->       ENTREGADO
EN_REVISION --request_changes(buyer)-->       CONFIRMADO   (loop sin límite)
EN_REVISION --cancel(buyer)-->                CANCELADO
```

Notas:
- El freelancer sólo rechaza en `PENDIENTE`; no puede cancelar en etapas posteriores
  (asimetría intencional, clarificación 2026-07-08).
- El comprador puede cancelar en toda etapa no final salvo `ENTREGADO`.
- `request_changes` habilita nuevamente `deliver`; el loop no tiene límite de iteraciones.

## Relaciones

- `Order.buyerId` → `User` (rol `buyer`).
- `Order.freelancerId` → `User` (rol `freelancer`), derivado de `Service.freelancerId`.
- `Order.serviceId` → `Service` (referencia; los datos mostrados provienen de `packageSnapshot`, no del servicio en vivo).
- `Order.packageId` → `Package` (referencia; snapshot capturado al contratar).

## Reglas de validación (derivadas de FR)

- **FR-001/FR-004**: crear pedido sólo si el servicio existe y está `PUBLISHED`; el paquete debe pertenecer al servicio.
- **FR-003**: `buyerId !== service.freelancerId` (un freelancer no contrata lo propio) → si coincide, rechazar.
- **FR-005**: `packageSnapshot` se fija al crear y nunca se recalcula.
- **FR-006**: `stage = PENDIENTE` al crear; primer registro de `history` = `{from:null,to:PENDIENTE,action:'create',actorRole:'buyer'}`.
- **FR-008/FR-013**: transiciones sólo según la tabla; etapas finales inmutables.
- **FR-014**: cada transición aplicada agrega un registro a `history`.
- **FR-015/FR-016**: sólo `buyerId` o `freelancerId` del pedido pueden leerlo/actuar; el listado filtra por rol del token.

# Contrato: API de Pedidos y Pantallas

Fecha: 2026-07-08 · Feature: `006-order-tracking` · Base: `/api/v1/orders`

Todos los endpoints requieren autenticación (header `Authorization: Bearer <token>`).
Códigos de error alineados con [research.md](../research.md) D4 y la Constitución.

## Modelo de respuesta `Order`

```json
{
  "id": "uuid",
  "buyerId": "user-...",
  "freelancerId": "user-demo-001",
  "serviceId": "svc-demo-001",
  "packageId": "pkg-demo-001a",
  "packageSnapshot": {
    "serviceTitle": "Diseño de logo profesional",
    "packageName": "Básico",
    "price": 5000,
    "deliveryDays": 3
  },
  "stage": "PENDIENTE",
  "history": [
    { "from": null, "to": "PENDIENTE", "action": "create", "actorRole": "buyer", "actorId": "user-...", "at": "2026-07-08T12:00:00.000Z" }
  ],
  "createdAt": "2026-07-08T12:00:00.000Z",
  "updatedAt": "2026-07-08T12:00:00.000Z"
}
```

Nota: `stage` viaja como valor estable (`PENDIENTE`, `CONFIRMADO`, `EN_REVISION`,
`ENTREGADO`, `CANCELADO`); la etiqueta visible la resuelve el frontend.

## POST /api/v1/orders — Contratar (US1)

Crea un pedido a partir de un servicio publicado y un paquete.

- **Auth**: requerida (rol `buyer`).
- **Body**: `{ "serviceId": "string", "packageId": "string" }`
- **201**: devuelve el `Order` creado en etapa `PENDIENTE`.
- **400** `VALIDATION_ERROR`: falta `serviceId` o `packageId`, o el paquete no pertenece al servicio.
- **401** `UNAUTHORIZED`: sin token.
- **403** `FORBIDDEN`: el solicitante es el freelancer dueño del servicio (FR-003).
- **404** `NOT_FOUND`: el servicio o el paquete no existen.
- **409** `CONFLICT`: el servicio no está en estado `PUBLISHED` (FR-004).

## GET /api/v1/orders — Mis pedidos (US2, US3)

Lista los pedidos del usuario según el rol de su token.

- **Auth**: requerida.
- **Comportamiento**: `role=buyer` → pedidos con `buyerId === userId`; `role=freelancer` →
  pedidos con `freelancerId === userId` (rol tomado del token, ver research D5).
- **200**: `{ "data": Order[] }` (cada ítem incluye al menos `packageSnapshot.serviceTitle`,
  `packageSnapshot.packageName` y `stage`, FR-017).

## GET /api/v1/orders/:id — Detalle de pedido (US2, US3)

- **Auth**: requerida.
- **200**: devuelve el `Order` con su `history` completo.
- **401** `UNAUTHORIZED`: sin token.
- **403** `FORBIDDEN`: el usuario no es el `buyerId` ni el `freelancerId` del pedido (FR-015).
- **404** `NOT_FOUND`: el pedido no existe.

## POST /api/v1/orders/:id/transition — Avanzar/actuar sobre el pedido (US2, US3)

Aplica una acción del ciclo de vida gobernada por la máquina de estados server-side.

- **Auth**: requerida.
- **Body**: `{ "action": "accept" | "reject" | "deliver" | "accept_delivery" | "request_changes" | "cancel" }`
- **200**: devuelve el `Order` con la nueva `stage` y el registro agregado en `history`.
- **400** `VALIDATION_ERROR`: `action` ausente o desconocida.
- **401** `UNAUTHORIZED`: sin token.
- **403** `FORBIDDEN`: el usuario no es participante del pedido, o la acción no corresponde a su rol.
- **404** `NOT_FOUND`: el pedido no existe.
- **409** `CONFLICT`: la acción no es válida para la etapa actual (transición no contemplada).

### Acciones por rol y etapa

| `action` | Rol requerido | Etapa origen → destino |
|----------|---------------|------------------------|
| `accept` | freelancer (dueño) | PENDIENTE → CONFIRMADO |
| `reject` | freelancer (dueño) | PENDIENTE → CANCELADO |
| `deliver` | freelancer (dueño) | CONFIRMADO → EN_REVISION |
| `accept_delivery` | buyer (dueño) | EN_REVISION → ENTREGADO |
| `request_changes` | buyer (dueño) | EN_REVISION → CONFIRMADO |
| `cancel` | buyer (dueño) | PENDIENTE \| CONFIRMADO \| EN_REVISION → CANCELADO |

## Contrato de pantallas (frontend)

### Botón "Contratar" en `ServiceDetailScreen` (comprador) — US1
- Cada paquete muestra un botón "Contratar".
- Al pulsar: si no hay token → dirigir a `BuyerLogin`; con token → `createOrder(serviceId, packageId)`.
- Éxito → confirmación + navegación al detalle del pedido (o a "Mis pedidos").
- El botón se deshabilita mientras la petición está en curso (mitiga doble toque, edge case).

### `BuyerOrdersScreen` (comprador) — US3
- Lista de pedidos del comprador vía `getOrders('buyer')`.
- Cada ítem: título del servicio, nombre del paquete, etiqueta de la etapa actual.
- Estados: cargando (spinner), vacío ("Aún no tenés pedidos."), error + "Reintentar" (FR-020).
- Toque en ítem → `BuyerOrderDetailScreen`.

### `BuyerOrderDetailScreen` (comprador) — US3
- Muestra `packageSnapshot`, etapa actual y línea de tiempo (`OrderTimeline`) con el historial.
- Acciones según etapa: en `EN_REVISION` → "Aceptar entrega" y "Solicitar cambios"; en
  `PENDIENTE`/`CONFIRMADO`/`EN_REVISION` → "Cancelar pedido". Sólo se muestran las aplicables (FR-019).

### `FreelancerOrdersScreen` (freelancer) — US2
- Lista de pedidos entrantes vía `getOrders('freelancer')`; mismos estados vacío/error.
- Toque en ítem → `FreelancerOrderDetailScreen`.

### `FreelancerOrderDetailScreen` (freelancer) — US2
- Muestra datos del pedido y la línea de tiempo.
- Acciones según etapa: en `PENDIENTE` → "Aceptar" y "Rechazar"; en `CONFIRMADO` → "Entregar
  trabajo". Sólo las aplicables al rol/etapa (FR-019).

### `ordersApi.js` (cliente)
- `createOrder(serviceId, packageId)` → `POST /orders`
- `getOrders(role)` → `GET /orders` (el rol viaja en el token; el parámetro guía la vista)
- `getOrder(id)` → `GET /orders/:id`
- `transitionOrder(id, action)` → `POST /orders/:id/transition`

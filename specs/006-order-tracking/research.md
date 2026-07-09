# Research: Contratación y Seguimiento de Pedidos

Fecha: 2026-07-08 · Feature: `006-order-tracking`

El spec fue completamente clarificado (Session 2026-07-08): no quedan marcadores
`NEEDS CLARIFICATION`. Este documento registra las decisiones de diseño técnicas derivadas
del spec y de la Constitución.

## D1 — Modelado de la máquina de estados

- **Decisión**: Representar el ciclo de vida como una tabla declarativa de transiciones en
  `backend/src/domain/orderStateMachine.js`, con la forma `(etapaActual, acción, rol) → etapaNueva`.
  El router consulta la tabla; si la tupla no existe, la transición es inválida.
- **Transiciones válidas**:

  | Acción | Rol | Etapa origen | Etapa destino |
  |--------|-----|--------------|---------------|
  | `accept` | freelancer | Pendiente | Confirmado |
  | `reject` | freelancer | Pendiente | Cancelado |
  | `deliver` | freelancer | Confirmado | EnRevision |
  | `accept_delivery` | buyer | EnRevision | Entregado |
  | `request_changes` | buyer | EnRevision | Confirmado |
  | `cancel` | buyer | Pendiente | Cancelado |
  | `cancel` | buyer | Confirmado | Cancelado |
  | `cancel` | buyer | EnRevision | Cancelado |

- **Rationale**: Una tabla declarativa centraliza toda la validación de FR-007..FR-013 en un
  único lugar testeable, evita condicionales dispersos y hace trivial rechazar transiciones
  no contempladas (SC-003). Reencapsula el loop de revisión (`request_changes`) y la política
  de cancelación amplia del comprador sin ramificar el código del router.
- **Alternativas consideradas**: (a) `if/switch` por acción dentro del router — descartado por
  dispersión y dificultad de test; (b) endpoints REST nombrados por acción (estilo
  `/publish`/`/unpublish` de services.js) — válido, pero multiplica endpoints (6) y duplica la
  verificación de estado; se prefiere un único `POST /:id/transition` respaldado por la tabla.

## D2 — Nombres de etapa (canónicos vs. almacenados)

- **Decisión**: Almacenar las etapas como identificadores estables sin acentos/espacios:
  `PENDIENTE`, `CONFIRMADO`, `EN_REVISION`, `ENTREGADO`, `CANCELADO`. La capa de presentación
  mapea a las etiquetas visibles del spec ("Pendiente", "Confirmado", "EnRevisión",
  "Entregado", "Cancelado").
- **Rationale**: Coherente con el patrón existente del proyecto (`PUBLISHED`/`DRAFT` en
  `services.js`). Evita problemas de comparación por acentos y mantiene el contrato de API
  estable.
- **Alternativas**: usar las etiquetas con acento directamente — descartado por fragilidad.

## D3 — Endpoint de transición: uno vs. varios

- **Decisión**: Un único `POST /api/v1/orders/:id/transition` con cuerpo `{ "action": "<acción>" }`.
- **Rationale**: Con la tabla de D1, un endpoint concentra autorización + validación + registro
  de historial. Simplifica el cliente (`transitionOrder(id, action)`) y el testeo.
- **Alternativas**: endpoints nombrados por acción — más "REST" pero redundantes para este scope.

## D4 — Autorización y códigos HTTP

- **Decisión**:
  - Sin token en cualquier operación de pedido → **401**.
  - Crear pedido siendo el freelancer dueño del servicio → **403** (FR-003).
  - Contratar un servicio no PUBLISHED o paquete inexistente → **409** (estado no contratable) / **404** (no existe).
  - Acción/lectura de un pedido por un usuario que no es su comprador ni su freelancer → **403** (FR-015, Principio IV: datos de otro usuario → 403).
  - Transición no permitida para la etapa/rol actuales → **409 CONFLICT**.
  - Pedido inexistente → **404**.
- **Rationale**: Alinea con el Principio IV ("datos de otro usuario → 403, nunca 404, salvo
  ocultación por diseño"). A diferencia del detalle de servicio (feature 005, donde ocultar la
  existencia de borradores era correcto), aquí ambas partes conocen el pedido, por lo que 403
  es el código semántico correcto para terceros. Coincide con la Constitución (códigos HTTP
  semánticos) y con SC-005.
- **Alternativas**: 404 para terceros (ocultación) — descartado; no hay requisito de ocultar la
  existencia de pedidos y el spec habla de "error de autorización".

## D5 — Identificación del rol del solicitante

- **Decisión**: Extender `middleware/auth.js` para exponer `req.user.role` (además de
  `userId`), leyéndolo del payload JWT (el token ya incluye `role`, ver `routes/auth.js`).
  `GET /api/v1/orders` devuelve los pedidos según el rol del token: `buyer` → pedidos donde
  `buyerId === userId`; `freelancer` → pedidos donde `freelancerId === userId`.
- **Rationale**: El token ya transporta el rol; exponerlo evita un query param redundante y
  mantiene una única fuente de verdad. El cambio es aditivo y no afecta rutas existentes (que
  sólo usan `req.user.userId`).
- **Alternativas**: query param `?role=` — descartado por poder falsearse y duplicar la
  intención del token.

## D6 — Snapshot inmutable del paquete (FR-005)

- **Decisión**: Al crear el pedido, copiar en `packageSnapshot` los campos `serviceTitle`,
  `packageName`, `price`, `deliveryDays` tomados del servicio/paquete en ese instante. El
  pedido no vuelve a leer el paquete para estos datos.
- **Rationale**: Cumple FR-005 y el Principio III (integridad): cambios o borrados posteriores
  del servicio/paquete no alteran pedidos ya contratados. Evita mostrar precios inconsistentes.
- **Alternativas**: referenciar el paquete por id y leerlo en vivo — descartado: rompe FR-005 y
  falla si el paquete se elimina.

## D7 — Idempotencia de la contratación (doble toque)

- **Decisión**: Sin dedupe automático server-side. El cliente deshabilita el botón "Contratar"
  mientras la petición está en curso; el spec permite explícitamente múltiples pedidos del
  mismo paquete (cada contratación es independiente).
- **Rationale**: Simplicidad; el edge case de doble toque se mitiga en UI. Un dedupe por
  ventana temporal sería complejidad injustificada para el TP.
- **Alternativas**: token de idempotencia — sobredimensionado para el scope.

## D8 — Navegación y acceso a las pantallas de pedidos

- **Decisión**: Registrar en `App.js` cuatro pantallas nuevas. El comprador accede a
  "Mis pedidos" desde el catálogo (header) y al detalle desde la lista o tras contratar. El
  freelancer accede a sus pedidos entrantes desde su área (p. ej. `MyServicesScreen`).
- **Rationale**: Reutiliza el stack de React Navigation ya presente; respeta la separación de
  entradas por rol (Principio I).
- **Alternativas**: tabs — innecesario para el scope; se mantiene el stack existente.

## Resumen

Todas las decisiones respetan la Constitución (stack fijo, in-memory, RBAC server-side,
separación de roles, integridad por snapshot). No hay incógnitas abiertas; el diseño está
listo para Phase 1 (data-model, contratos, quickstart).

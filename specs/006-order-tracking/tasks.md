# Tasks: Contratación y Seguimiento de Pedidos

**Input**: Design documents from `/specs/006-order-tracking/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Tests**: No solicitados. Validación manual vía `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario para entrega incremental independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2, US3)
- Se incluyen rutas de archivo exactas en cada descripción

---

## Phase 1: Setup (Infraestructura compartida)

**Purpose**: Verificar que el entorno base esté listo; no hay dependencias de librerías nuevas.

- [x] T001 Verificar que el backend corre en Docker (`docker run -p 3000:3000 freelancehub-backend`) y responde en `http://localhost:3000`
- [x] T002 Verificar que Expo compila (`npx expo start` en `frontend/`) sin errores

**Checkpoint**: Backend y frontend funcionales antes de cualquier cambio de código.

---

## Phase 2: Fundacional (Prerequisitos bloqueantes)

**Purpose**: Núcleo de pedidos que DEBE existir antes de implementar cualquier historia. Incluye el store, la máquina de estados, el router con lectura/transición, el cliente de API y el componente de línea de tiempo.

**⚠️ CRÍTICO**: Ninguna historia puede comenzar hasta completar esta fase.

- [x] T003 [P] Agregar `store.orders = new Map()` en `backend/src/store/index.js` (sin seed; los pedidos se crean en runtime)
- [x] T004 [P] Extender `backend/src/middleware/auth.js` para exponer `req.user.role` (leído del payload JWT, además de `userId`), tanto en `auth` como en `optionalAuth`; no romper el contrato existente (`req.user.userId`)
- [x] T005 [P] Crear `backend/src/domain/orderStateMachine.js` con la tabla declarativa de transiciones `(stage, action, actorRole) → nextStage` según `data-model.md`, y un helper `applyTransition(order, action, actorRole)` que devuelva la etapa nueva o un error de transición inválida
- [x] T006 Crear `backend/src/routes/orders.js` con `GET /` (lista por rol del token: buyer→`buyerId`, freelancer→`freelancerId`, FR-016), `GET /:id` (detalle con `history`; 403 si el usuario no es `buyerId` ni `freelancerId`, FR-015; 404 si no existe) y `POST /:id/transition` (aplica `orderStateMachine`; 400 acción desconocida, 403 rol/participante inválido, 409 transición inválida, FR-008/FR-013); montar el router en `backend/src/app.js` como `/api/v1/orders` (depende de T003, T004, T005)
- [x] T007 [P] Crear `frontend/src/api/ordersApi.js` con `createOrder(serviceId, packageId)`, `getOrders(role)`, `getOrder(id)` y `transitionOrder(id, action)` usando el cliente axios existente (token vía interceptor)
- [x] T008 [P] Crear `frontend/src/components/OrderTimeline.js`: componente presentacional que recibe `history` y `stage` y renderiza la secuencia de etapas con etiqueta visible (mapea `PENDIENTE`→"Pendiente", `EN_REVISION`→"EnRevisión", etc.) y fecha de cada transición; sin lógica de rol ni de negocio

**Checkpoint**: El store, la máquina de estados y los endpoints de lectura/transición están disponibles; el cliente puede listar, ver y transicionar pedidos.

---

## Phase 3: User Story 1 — Contratar un servicio (Priority: P1) 🎯 MVP

**Goal**: El comprador contrata un paquete desde el detalle del servicio y el pedido queda creado en "Pendiente", visible en su lista de pedidos.

**Independent Test**: Como comprador autenticado, abrir el detalle de un servicio publicado, pulsar "Contratar" en un paquete y verificar que se crea un pedido en "Pendiente" visible en "Mis pedidos"; sin sesión, "Contratar" pide iniciar sesión; el freelancer dueño no puede contratar su propio servicio.

### Implementation

- [x] T009 [US1] Agregar `POST /` (crear pedido) en `backend/src/routes/orders.js` (auth requerida): validar `serviceId`/`packageId` (400), servicio existente (404), servicio `PUBLISHED` (409, FR-004), paquete perteneciente al servicio (400), y que el solicitante NO sea el freelancer dueño (403, FR-003); construir `packageSnapshot` inmutable (título del servicio, nombre del paquete, precio, plazo — FR-005); iniciar `stage=PENDIENTE` con primer registro de `history` `{from:null,to:PENDIENTE,action:'create',actorRole:'buyer'}` (FR-006); responder 201 con el pedido
- [x] T010 [US1] Agregar botón "Contratar" por paquete en `frontend/src/screens/buyer/ServiceDetailScreen.js`: si no hay token, dirigir a `BuyerLogin`; con token, llamar `createOrder(serviceId, packageId)`; deshabilitar el botón mientras la petición está en curso (mitiga doble toque); al 201, confirmar y navegar a "Mis pedidos" (o al detalle del pedido)
- [x] T011 [P] [US1] Crear `frontend/src/screens/buyer/BuyerOrdersScreen.js`: cargar `getOrders('buyer')` al montar; `FlatList` con título del servicio, nombre del paquete y etiqueta de la etapa (FR-017); `ActivityIndicator` durante carga; mensaje "Aún no tenés pedidos." si vacío; error + "Reintentar" si falla (FR-020); cada ítem navega a `BuyerOrderDetail`
- [x] T012 [US1] Registrar `BuyerOrders` en el stack de `frontend/App.js` (header morado `#7b1fa2`) y agregar un acceso "Mis pedidos" desde `BuyerCatalogScreen` (p. ej. en el header)

**Checkpoint**: US1 funcional — el comprador contrata y ve el pedido en "Pendiente" en su lista.

---

## Phase 4: User Story 2 — Avanzar el pedido por sus etapas (Priority: P2)

**Goal**: El freelancer ve sus pedidos entrantes y avanza el trabajo: acepta o rechaza un pedido en "Pendiente" y entrega un pedido en "Confirmado" (pasa a "EnRevisión").

**Independent Test**: Con un pedido en "Pendiente", como freelancer dueño, aceptarlo (→ "Confirmado") y luego entregar el trabajo (→ "EnRevisión"), verificando el historial; intentar avanzar un pedido de un servicio ajeno → rechazado (403).

### Implementation

- [x] T013 [P] [US2] Crear `frontend/src/screens/freelancer/FreelancerOrdersScreen.js`: cargar `getOrders('freelancer')`; lista con título del servicio, paquete y etapa; estados cargando/vacío ("Aún no tenés pedidos entrantes.")/error+Reintentar (FR-020); cada ítem navega a `FreelancerOrderDetail`
- [x] T014 [P] [US2] Crear `frontend/src/screens/freelancer/FreelancerOrderDetailScreen.js`: cargar `getOrder(id)`; mostrar `packageSnapshot`, etapa actual y `OrderTimeline`; acciones según etapa (FR-019): en "Pendiente" botones "Aceptar" (`transitionOrder(id,'accept')`) y "Rechazar" (`'reject'`), en "Confirmado" botón "Entregar trabajo" (`'deliver'`); recargar el pedido tras cada acción; ocultar acciones en etapas finales
- [x] T015 [US2] Registrar `FreelancerOrders` y `FreelancerOrderDetail` en `frontend/App.js` (header acorde al área freelancer) y agregar acceso "Pedidos" desde `frontend/src/screens/freelancer/MyServicesScreen.js`

**Checkpoint**: US2 funcional — el freelancer lleva el pedido de "Pendiente" a "Confirmado" y a "EnRevisión".

---

## Phase 5: User Story 3 — Seguimiento y confirmación del comprador (Priority: P3)

**Goal**: El comprador consulta estado e historial de sus pedidos, acepta la entrega (→ "Entregado"), solicita cambios (→ vuelve a "Confirmado") o cancela (en cualquier etapa salvo "Entregado").

**Independent Test**: Como comprador con un pedido en "EnRevisión", ver estado/historial, "Solicitar cambios" (→ "Confirmado") y luego "Aceptar entrega" (→ "Entregado"); con un pedido en "Pendiente"/"Confirmado"/"EnRevisión", "Cancelar" (→ "Cancelado"); sobre "Entregado" no se ofrece cancelar.

### Implementation

- [x] T016 [US3] Crear `frontend/src/screens/buyer/BuyerOrderDetailScreen.js`: cargar `getOrder(id)`; mostrar `packageSnapshot`, etapa actual y `OrderTimeline`; acciones según etapa (FR-019): en "EnRevisión" botones "Aceptar entrega" (`transitionOrder(id,'accept_delivery')`) y "Solicitar cambios" (`'request_changes'`); en "Pendiente"/"Confirmado"/"EnRevisión" botón "Cancelar pedido" (`'cancel'`); recargar tras cada acción; sin acciones en "Entregado"/"Cancelado"
- [x] T017 [US3] Registrar `BuyerOrderDetail` en `frontend/App.js` (header morado) y verificar la navegación desde `BuyerOrdersScreen` (T011) hacia el detalle

**Checkpoint**: US3 funcional — el comprador cierra el ciclo (aceptar/solicitar cambios/cancelar) con historial visible.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Mejoras que afectan múltiples historias o la experiencia global.

- [x] T018 [P] Verificar coherencia visual de las pantallas de pedidos con las existentes: tema morado (`#7b1fa2`) en pantallas de comprador, estilo de headers/botones consistente; etiquetas de etapa uniformes vía `OrderTimeline`
- [ ] T019 Ejecutar los Escenarios 1–7 de `quickstart.md` en Expo Go con Docker corriendo y corregir desvíos; medir SC-001 (contratar en < 60 s)
- [x] T020 [P] Verificar en `backend/src/routes/orders.js` el orden de rutas (`/`, `/:id`, `/:id/transition`) y que el cambio de `auth.js` (T004) no rompa endpoints existentes de `services.js`/`images.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede iniciar de inmediato
- **Fundacional (Phase 2)**: Depende de Phase 1 — **bloquea todas las historias**
- **US1 (Phase 3)**: Depende de Phase 2 (store, `orders.js`, `ordersApi.js`)
- **US2 (Phase 4)**: Depende de Phase 2 (endpoint de transición + `ordersApi`); independiente de US1
- **US3 (Phase 5)**: Depende de Phase 2 (transición); reutiliza la lista `BuyerOrdersScreen` de US1 como punto de entrada al detalle
- **Polish (Phase 6)**: Depende de US1 + US2 + US3

### User Story Dependencies

| Historia | Depende de | Nota |
|----------|-----------|------|
| US1 | Phase 2 | Agrega `POST /orders` + flujo de contratación del comprador |
| US2 | Phase 2 | Usa el endpoint de transición ya presente; pantallas del freelancer independientes de US1 |
| US3 | Phase 2 (+ `BuyerOrdersScreen` de US1 como entrada) | El detalle del comprador es testeable navegando desde la lista de US1 |

### Within Each User Story

- Backend antes que frontend (el contrato del endpoint debe existir antes de consumirlo)
- Registro en `App.js` después de crear la pantalla correspondiente
- En US2/US3, las pantallas de lista y detalle pueden ir en paralelo ([P]) por ser archivos distintos

---

## Parallel Opportunities

```text
# Phase 2 (Fundacional): archivos distintos e independientes
Task T003: backend/src/store/index.js         (store.orders)
Task T004: backend/src/middleware/auth.js      (req.user.role)
Task T005: backend/src/domain/orderStateMachine.js
Task T007: frontend/src/api/ordersApi.js
Task T008: frontend/src/components/OrderTimeline.js
# (T006 orders.js depende de T003+T004+T005)

# Phase 4 (US2): lista y detalle son archivos distintos
Task T013: frontend/src/screens/freelancer/FreelancerOrdersScreen.js
Task T014: frontend/src/screens/freelancer/FreelancerOrderDetailScreen.js
```

---

## Implementation Strategy

### MVP First (US1 únicamente)

1. Completar Phase 1: Setup
2. Completar Phase 2: Fundacional (store + máquina de estados + router + api)
3. Completar Phase 3: US1 (contratar + ver en lista)
4. **DETENER y VALIDAR**: Escenarios 1–2 del `quickstart.md`
5. Demostrar: el comprador contrata un servicio y ve el pedido en "Pendiente"

### Incremental Delivery

1. Phase 1 + Phase 2 → Infraestructura de pedidos lista
2. Phase 3 (US1) → Contratación (MVP demostrable)
3. Phase 4 (US2) → El freelancer avanza el pedido
4. Phase 5 (US3) → Seguimiento, confirmación y cancelación del comprador
5. Phase 6 → Polish y validación final

---

## Notes

- `[P]` = archivos distintos, sin dependencias bloqueantes entre esas tareas
- No hay seed de pedidos; se crean en runtime (persistencia in-memory, se pierden al reiniciar el contenedor)
- La máquina de estados (`orderStateMachine.js`) es la única fuente de verdad de las transiciones; los endpoints no deben duplicar reglas de etapa/rol
- Las etapas se almacenan como valores estables (`PENDIENTE`, `CONFIRMADO`, `EN_REVISION`, `ENTREGADO`, `CANCELADO`) y se muestran con etiqueta visible en el frontend
- Las pantallas se mantienen separadas por rol (Principio I): `buyer/` y `freelancer/`; sólo se comparte `OrderTimeline` (presentacional)
- Validar siempre con el backend Docker corriendo

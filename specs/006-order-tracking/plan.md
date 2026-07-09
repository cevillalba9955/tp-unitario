# Implementation Plan: Contratación y Seguimiento de Pedidos

**Branch**: `006-order-tracking` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-order-tracking/spec.md`

## Summary

Se introduce una nueva entidad **Pedido** que representa la contratación de un paquete por
parte de un comprador y su seguimiento a través de un ciclo de vida de etapas. El backend
agrega un store `orders` en memoria y un router `orders.js` (montado en `/api/v1/orders`) con
un endpoint de creación, listado, detalle y un endpoint de transición gobernado por una
máquina de estados server-side. El frontend agrega pantallas de "Mis pedidos" para comprador
y freelancer, un detalle de pedido con línea de tiempo e historial, y un botón "Contratar"
por paquete en el detalle de servicio existente. No se incorporan dependencias nuevas ni
persistencia externa.

## Technical Context

**Language/Version**: Node.js + Express (backend) · React Native con Expo SDK 54 (frontend)

**Primary Dependencies**: Sin dependencias nuevas; `jsonwebtoken` (ya presente) para auth/rol, axios vía un nuevo `ordersApi.js`, React Navigation ya configurado

**Storage**: In-memory (`store` existente); se agrega `store.orders = new Map()`. Sin persistencia entre reinicios (Constitución)

**Testing**: No solicitado. Validación manual vía `quickstart.md`

**Target Platform**: React Native (iOS/Android vía Expo Go) + backend en contenedor Docker

**Project Type**: Mobile app + REST API (cambios en ambas capas)

**Performance Goals**: Contratación end-to-end < 60 s (SC-001); operaciones sobre pedidos son O(n) sobre un Map pequeño (TP)

**Constraints**:
- Sólo servicios en estado "Publicado" son contratables (FR-004, Principio III)
- Toda acción sobre pedidos requiere autenticación (Principio IV); autorización verificada server-side
- Máquina de estados centralizada: sólo transiciones válidas por etapa y rol
- El pedido conserva una copia inmutable de los datos del paquete al contratar (FR-005)
- Sin pagos, sin notificaciones push, sin vista administrativa global (Assumptions del spec)

**Scale/Scope**: TP universitario — 1 router nuevo (~5 endpoints) + 1 store Map + máquina de estados; 4 pantallas nuevas (2 listas, 1 detalle por rol) + botón "Contratar" en `ServiceDetailScreen` + 1 archivo `ordersApi.js`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-diseño

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Separación de Roles | ✅ PASS | Pantallas de pedidos separadas: comprador en `screens/buyer/`, freelancer en `screens/freelancer/`. El recurso Pedido es compartido por ambas partes por naturaleza; cada acción se autoriza por rol en el servidor (justificación explícita, ver nota) |
| II. Catálogo como Núcleo | ✅ PASS | La contratación es la conversión del catálogo (descubrimiento → contratación) que exige el Principio II |
| III. Integridad de Servicios | ✅ PASS | Sólo servicios PUBLISHED son contratables (FR-004); el pedido snapshotea precio/plazo (FR-005), evitando ambigüedad posterior |
| IV. Seguridad y RBAC | ✅ PASS | Auth obligatoria para toda escritura de pedido; freelancer no contrata lo propio (FR-003); acciones sobre pedidos ajenos → 403 (FR-015); validación server-side de estado y rol |
| V. Entrega Incremental | ✅ PASS | US1 (contratar) demostrable sin US2 (freelancer avanza) ni US3 (seguimiento/confirmación del comprador) |
| Stack — Docker backend | ✅ PASS | Sólo se agrega un router; el backend sigue en Docker |
| Stack — In-memory only | ✅ PASS | Se agrega `store.orders` (Map); sin base de datos ni ORM |

**Nota (Principio I)**: Un Pedido vincula inevitablemente a comprador y freelancer. El router
`orders.js` es un recurso compartido, pero **no** mezcla capacidades en una misma vista ni
concede permisos cruzados: cada endpoint de transición valida que el actor tenga el rol y sea
la parte correcta (comprador dueño o freelancer dueño). Las vistas del cliente permanecen
separadas por rol. Esto satisface el Principio I con justificación explícita.

### Post-diseño (re-evaluación tras Phase 1)

| Principio | Estado | Verificación |
|-----------|--------|-------------|
| I. Separación de Roles | ✅ PASS | Listas y detalles separados por rol; máquina de estados asigna cada acción a un único rol |
| III. Integridad — snapshot inmutable | ✅ PASS | `data-model.md` define `packageSnapshot` copiado al crear el pedido |
| IV. RBAC — autorización server-side | ✅ PASS | Contrato define 401 sin token, 403 para no-participantes, 409 para transición inválida |

**Resultado**: Sin violaciones. Complexity Tracking omitido.

## Project Structure

### Documentation (this feature)

```text
specs/006-order-tracking/
├── plan.md                         # Este archivo
├── research.md                     # Decisiones técnicas (máquina de estados, autorización, endpoints)
├── data-model.md                   # Entidad Pedido, etapas, transiciones, snapshot
├── quickstart.md                   # Guía de validación manual (US1–US3)
├── contracts/
│   └── orders-contract.md          # Contrato de los endpoints /api/v1/orders y pantallas
├── checklists/
│   └── requirements.md             # Checklist de calidad del spec (ya existente)
└── tasks.md                        # Generado por /speckit-tasks
```

### Source Code (repository root)

```text
backend/
└── src/
    ├── store/
    │   └── index.js                # MODIFICAR: agregar store.orders = new Map()
    ├── routes/
    │   └── orders.js               # NUEVO: POST /, GET /, GET /:id, POST /:id/transition
    ├── middleware/
    │   └── auth.js                 # MODIFICAR: exponer req.user.role (además de userId)
    ├── domain/
    │   └── orderStateMachine.js    # NUEVO: tabla de transiciones (etapa × acción × rol) → etapa
    └── app.js                      # MODIFICAR: montar ordersRouter en /api/v1/orders

frontend/
├── src/
│   ├── api/
│   │   └── ordersApi.js            # NUEVO: createOrder, getOrders(role), getOrder(id), transitionOrder(id, action)
│   ├── components/
│   │   └── OrderTimeline.js        # NUEVO: línea de tiempo/historial de etapas (presentacional, sin lógica de rol)
│   └── screens/
│       ├── buyer/
│       │   ├── ServiceDetailScreen.js   # MODIFICAR: botón "Contratar" por paquete → createOrder
│       │   ├── BuyerOrdersScreen.js     # NUEVO: lista de pedidos del comprador
│       │   └── BuyerOrderDetailScreen.js# NUEVO: detalle + acciones del comprador (aceptar entrega, solicitar cambios, cancelar)
│       └── freelancer/
│           ├── FreelancerOrdersScreen.js    # NUEVO: lista de pedidos entrantes del freelancer
│           └── FreelancerOrderDetailScreen.js # NUEVO: detalle + acciones del freelancer (aceptar, rechazar, entregar)
└── App.js                          # MODIFICAR: registrar las 4 pantallas nuevas en el stack
```

**Structure Decision**: El backend concentra la lógica del ciclo de vida en un módulo
`orderStateMachine.js` (tabla declarativa etapa × acción × rol → etapa nueva) para que el
router `orders.js` sólo orqueste autorización + aplicación de la transición + registro en el
historial. En el frontend, las pantallas se separan por rol conforme al Principio I
(`buyer/` y `freelancer/`), compartiendo únicamente un componente presentacional de línea de
tiempo (`OrderTimeline.js`) sin lógica de negocio ni permisos.

## Complexity Tracking

> Sin violaciones de la Constitución. Sección no aplica.

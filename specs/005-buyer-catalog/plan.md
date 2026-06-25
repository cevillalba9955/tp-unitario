# Implementation Plan: Catálogo de Comprador

**Branch**: `005-buyer-catalog` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-buyer-catalog/spec.md`

## Summary

El backend actual no expone un endpoint de catálogo público — solo existe
`GET /api/v1/services/my` que filtra por `freelancerId`. Esta feature agrega
`GET /api/v1/services` (con filtros opcionales por `status` y `categoryId`) y
reemplaza el placeholder `BuyerCatalogScreen` con una pantalla funcional de lista
con filtro por categoría, más una nueva `ServiceDetailScreen` para el Comprador.

## Technical Context

**Language/Version**: Node.js + Express (backend) · React Native con Expo SDK 51 (frontend)

**Primary Dependencies**: Sin dependencias nuevas; axios vía `servicesApi.js` y hooks de React ya existentes

**Storage**: In-memory (store ya existente); sin cambios de esquema

**Testing**: No solicitado. Validación manual via `quickstart.md`.

**Target Platform**: React Native (iOS/Android via Expo Go) + backend Docker

**Project Type**: Mobile app + REST API (cambios en ambas capas)

**Performance Goals**: Catálogo carga en menos de 3 segundos (SC-001)

**Constraints**:
- Sin cambios en el modelo de datos existente
- Sin paginación en este scope (lista completa con scroll)
- Sin búsqueda por texto libre
- El catálogo es público (sin auth); autenticación requerida solo para acciones de escritura (contratar)
- `GET /api/v1/services/my` no se toca; el nuevo endpoint es `GET /api/v1/services`

**Scale/Scope**: TP universitario — 1 ruta nueva en backend + 2 pantallas nuevas + 1 archivo de API actualizado

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-diseño

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Separación de Roles | ✅ PASS | Pantallas del Comprador en `screens/buyer/`; Freelancer intacto |
| II. Catálogo como Núcleo | ✅ PASS | Esta feature implementa directamente el catálogo navegable y filtrable por categorías |
| III. Integridad de Servicios | ✅ PASS | Solo servicios PUBLISHED visibles (FR-003); borradores excluidos server-side |
| IV. Seguridad y RBAC | ✅ PASS | Catálogo público sin auth (lectura, Principio II). Auth requerida solo para escritura (contratar). Borradores excluidos server-side. |
| V. Entrega Incremental | ✅ PASS | US1 (listar) demostrable sin US2 (filtrar) ni US3 (detalle) |
| Stack — Docker backend | ✅ PASS | El backend sigue corriendo en Docker; solo se agrega una ruta |
| Stack — In-memory only | ✅ PASS | Sin nueva persistencia; el store existente es suficiente |

### Post-diseño (re-evaluación tras Phase 1)

| Principio | Estado | Verificación |
|-----------|--------|-------------|
| II. Catálogo — navegable y filtrable sin auth | ✅ PASS | `GET /api/v1/services` es público (sin `auth` middleware); `?categoryId=X` filtra server-side |
| III. Integridad — solo PUBLISHED visible | ✅ PASS | Filtro `status=PUBLISHED` forzado en el endpoint |
| IV. RBAC — borradores protegidos sin exponer auth | ✅ PASS | Endpoint excluye DRAFT server-side; sin lógica client-only |

**Resultado**: Sin violaciones. Complexity Tracking omitido.

## Project Structure

### Documentation (this feature)

```text
specs/005-buyer-catalog/
├── plan.md                         # Este archivo
├── research.md                     # Decisiones técnicas
├── data-model.md                   # Entidades y contratos de datos
├── quickstart.md                   # Guía de validación manual
├── contracts/
│   └── catalog-contract.md        # Contrato del endpoint y pantallas
└── tasks.md                        # Generado por /speckit-tasks
```

### Source Code (repository root)

```text
backend/
└── src/
    └── routes/
        └── services.js             # MODIFICAR: agregar GET / (catálogo público, sin auth)

frontend/
├── src/
│   ├── api/
│   │   └── servicesApi.js         # MODIFICAR: agregar getCatalog(categoryId?)
│   └── screens/
│       └── buyer/
│           ├── BuyerCatalogScreen.js  # REEMPLAZAR: lista funcional + filtro por categoría
│           └── ServiceDetailScreen.js # NUEVO: detalle de servicio para comprador
└── App.js                          # MODIFICAR: agregar ruta ServiceDetail
```

**Structure Decision**: Endpoint de catálogo en el mismo router `services.js` como
nueva ruta `GET /` (antes de `/my` para evitar conflicto de rutas). Pantallas del
Comprador en `screens/buyer/` conforme al Principio I.

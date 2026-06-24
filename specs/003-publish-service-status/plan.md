# Implementation Plan: Publicación de Servicio con Gestión de Estado

**Branch**: `003-publish-service-status` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-publish-service-status/spec.md`

## Summary

El backend ya implementa completamente el ciclo de vida DRAFT → PUBLISHED, incluyendo
validación, cambio de estado y manejo de 422 con lista de campos faltantes. Esta
feature es una mejora de UX en el frontend: (1) al crear un servicio y publicar con
fallo, informar al usuario que su trabajo fue guardado como borrador y navegar a la
lista; (2) al reabrir un borrador desde la lista, la misma pantalla unificada muestra
la status row y reemplaza el `Alert.alert` por un mensaje de error inline persistente.
No hay cambios en backend, API ni entidades.

## Technical Context

**Language/Version**: React Native con Expo SDK 51 (frontend únicamente)

**Primary Dependencies**: Sin dependencias nuevas; se usan hooks y estados de React ya presentes

**Storage**: N/A — solo cambios de UX; el estado persiste en el backend in-memory ya existente

**Testing**: No solicitado. Validación manual via `quickstart.md`.

**Target Platform**: React Native (iOS/Android via Expo Go)

**Project Type**: Mobile app (solo cambios de frontend)

**Performance Goals**: Sin metas específicas; los cambios son puramente de UI

**Constraints**:
- Sin dependencias de UI externas nuevas
- Sin cambios en backend ni API
- Mantener comportamiento existente de `ServiceCard.handlePublish` (Alert está bien en ese contexto)

**Scale/Scope**: TP universitario — 2 archivos modificados, cambios mínimos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-diseño

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Separación de Roles | ✅ PASS | Solo actor Freelancer; ninguna vista mezcla capacidades de Comprador |
| II. Catálogo como Núcleo | ✅ PASS | Solo servicios PUBLISHED son visibles en catálogo; la feature refuerza este invariante comunicándolo al usuario |
| III. Integridad de Servicios | ✅ PASS | La validación server-side en `validatePublish` permanece inalterada; el frontend no bypasea ninguna regla |
| IV. Seguridad y RBAC | ✅ PASS | Sin cambios en endpoints ni auth; permisos existentes no se tocan |
| V. Entrega Incremental | ✅ PASS | US1 (publicar exitoso) demostrable sin US2/US3; cada historia es verificable de forma independiente |
| Stack — Docker backend | ✅ PASS | No hay cambios en backend |
| Stack — In-memory only | ✅ PASS | No se introduce persistencia nueva |

### Post-diseño (re-evaluación tras Phase 1)

| Principio | Estado | Verificación |
|-----------|--------|-------------|
| III. Integridad — validación server es fuente de verdad | ✅ PASS | Solo se mejora el mensaje de error; la lógica de validación sigue 100% en el servidor |
| II. Catálogo — solo publicados visibles | ✅ PASS | El cambio de estado a PUBLISHED ocurre únicamente tras respuesta 200 del servidor (sin optimistic updates) |

**Resultado**: Sin violaciones. Complexity Tracking omitido.

## Project Structure

### Documentation (this feature)

```text
specs/003-publish-service-status/
├── plan.md                              # Este archivo
├── research.md                          # Análisis del estado actual y decisiones
├── data-model.md                        # Modelo de estado del servicio y transiciones
├── quickstart.md                        # Guía de validación manual
├── contracts/
│   └── publish-flow-contract.md         # Contrato UX de los flujos de publicación
├── checklists/
│   └── requirements.md                  # Checklist de calidad de spec
└── tasks.md                             # Generado por /speckit-tasks
```

### Source Code (repository root)

```text
frontend/
└── src/
    └── screens/
        └── freelancer/
            └── CreateServiceScreen.js   # MODIFICAR: unificar creación y edición con status row
```

**Structure Decision**: Solo cambios de frontend; la edición se consolida en `CreateServiceScreen.js`.
No se crean archivos nuevos. Backend y API layer sin cambios.

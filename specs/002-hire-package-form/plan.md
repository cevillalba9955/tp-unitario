# Implementation Plan: Carga de Datos de Paquete de Contratación (Modal)

**Branch**: `002-hire-package-form` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-hire-package-form/spec.md`

## Summary

Convertir el formulario de paquete de contratación actual (inline en
`CreateServiceScreen`) en un modal con validación cliente-side previa al cierre.
El nuevo componente `PackageFormModal` presenta los campos en un `Modal` nativo de
React Native, valida nombre, alcance, precio y plazo de entrega antes de invocar el
callback `onConfirm`, y muestra mensajes de error inline por campo si la validación
falla. El modal también soporta modo edición (datos precargados). No requiere cambios
en el backend; las reglas de validación del cliente son un espejo de las ya existentes
en `serviceValidator.js`.

## Technical Context

**Language/Version**: React Native con Expo SDK 51 (frontend únicamente)

**Primary Dependencies**: React Native core `Modal` (sin dependencias nuevas)

**Storage**: N/A — estado en memoria del componente durante la sesión de UI

**Testing**: No solicitado. Validación manual via `quickstart.md`.

**Target Platform**: React Native (iOS/Android via Expo Go)

**Project Type**: Mobile app (solo cambios de frontend)

**Performance Goals**: Modal abre/cierra en < 300ms (animación nativa)

**Constraints**:
- Sin dependencias de UI externas nuevas (usar `Modal` de React Native core)
- Validación cliente complementaria a la server-side ya existente (no reemplaza)
- Máximo 3 paquetes por servicio (regla existente en `CreateServiceScreen`)

**Scale/Scope**: TP universitario — 1 componente nuevo, 1 pantalla modificada

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-diseño

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Separación de Roles | ✅ PASS | Solo actor Freelancer; el modal es parte del flujo de gestión de servicios del freelancer |
| II. Catálogo como Núcleo | ✅ PASS | La validación del paquete asegura que el catálogo tenga datos completos y correctos |
| III. Integridad de Servicios | ✅ PASS | FR-003–FR-008: validación previa al cierre para todos los campos; reglas consistentes con servidor |
| IV. Seguridad y RBAC | ✅ PASS | Sin cambios en backend ni endpoints; autenticación JWT ya verificada por pantallas padre |
| V. Entrega Incremental | ✅ PASS | US1 (agregar) demostrable sin US3 (editar); cada historia es independiente |
| Stack — Docker backend | ✅ PASS | No hay cambios en backend; Docker sigue siendo el runtime del servidor |
| Stack — In-memory only | ✅ PASS | El modal gestiona estado transitorio en memoria del componente; no introduce persistencia extra |

### Post-diseño (re-evaluación tras Phase 1)

| Principio | Estado | Verificación |
|-----------|--------|-------------|
| III. Integridad — validación consistente con server | ✅ PASS | `research.md` tabla de reglas espeja `serviceValidator.js`; servidor sigue siendo fuente de verdad |
| IV. RBAC — sin endpoints nuevos vulnerables | ✅ PASS | Feature es puramente frontend; no introduce endpoints ni bypasses de auth |

**Resultado**: Sin violaciones. Complexity Tracking omitido.

## Project Structure

### Documentation (this feature)

```text
specs/002-hire-package-form/
├── plan.md                         # Este archivo
├── research.md                     # Decisiones de modal y validación
├── data-model.md                   # Entidad Package y estado del modal
├── quickstart.md                   # Guía de validación manual
├── contracts/
│   └── package-modal-contract.md  # Contrato del componente PackageFormModal
├── checklists/
│   └── requirements.md            # Checklist de calidad de spec
└── tasks.md                        # Generado por /speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── services/
│   │       ├── PackageFormModal.js    # NUEVO: modal con validación
│   │       └── PackageForm.js         # EXISTENTE: puede reutilizarse internamente
│   └── screens/
│       └── freelancer/
│           └── CreateServiceScreen.js  # MODIFICAR: reemplazar inline PackageForm por modal
```

**Structure Decision**: Solo cambios en `frontend/`. No hay cambios en `backend/`.
El nuevo componente vive junto a los componentes de servicios existentes en
`frontend/src/components/services/`.

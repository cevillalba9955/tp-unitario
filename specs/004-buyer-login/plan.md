# Implementation Plan: Login de Comprador

**Branch**: `004-buyer-login` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-buyer-login/spec.md`

## Summary

El backend ya expone el endpoint `POST /api/v1/auth/login` que valida email/contraseña
y devuelve un JWT. Esta feature agrega la pantalla de login del Comprador en el
frontend React Native, independiente de la pantalla de login del Freelancer ya
existente, conforme al Principio I. El Comprador, tras autenticarse, es redirigido
a una pantalla de catálogo de servicios publicados (pantalla mínima de destino, a
completarse en la feature de catálogo). La validación de campos vacíos y formato de
email se realiza localmente antes de llamar al servidor.

## Technical Context

**Language/Version**: React Native con Expo SDK 51 (frontend únicamente)

**Primary Dependencies**: Sin dependencias nuevas; hooks y estados de React ya presentes, `axios` vía `servicesApi.js`/`config.js` ya existentes

**Storage**: Token JWT en memoria (`config.js` — `setToken`/`getToken`); consistente con el stack in-memory del proyecto

**Testing**: No solicitado. Validación manual via `quickstart.md`.

**Target Platform**: React Native (iOS/Android via Expo Go)

**Project Type**: Mobile app (solo cambios de frontend)

**Performance Goals**: Login completado en menos de 30 segundos (SC-001); catálogo visible en menos de 3 segundos tras login exitoso (SC-004)

**Constraints**:
- Sin dependencias de UI externas nuevas
- Sin cambios en backend ni API
- La pantalla de login del Comprador DEBE ser independiente de la del Freelancer (`LoginScreen.js`)
- No se implementa registro, recuperación de contraseña ni "recordarme"
- El destino post-login es una pantalla mínima `BuyerCatalogScreen` a expandir en feature futura

**Scale/Scope**: TP universitario — 2 archivos nuevos + 1 archivo modificado

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-diseño

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Separación de Roles | ✅ PASS | `BuyerLoginScreen` independiente de `LoginScreen` (freelancer); directorio `screens/buyer/` separado |
| II. Catálogo como Núcleo | ✅ PASS | El Comprador accede al catálogo tras login; la feature habilita el acceso al catálogo como destino principal |
| III. Integridad de Servicios | ✅ PASS | Sin cambios en servicios ni en su validación |
| IV. Seguridad y RBAC | ✅ PASS | Autenticación obligatoria; token JWT gestionado server-side; mensaje de error no revela cuál campo falló (FR-004) |
| V. Entrega Incremental | ✅ PASS | US1 (login exitoso) demostrable sin US2/US3; cada historia verificable de forma independiente |
| Stack — Docker backend | ✅ PASS | No hay cambios en backend |
| Stack — In-memory only | ✅ PASS | Token en memoria via `config.js`; no se introduce persistencia nueva |

### Post-diseño (re-evaluación tras Phase 1)

| Principio | Estado | Verificación |
|-----------|--------|-------------|
| I. Separación de Roles | ✅ PASS | `BuyerLoginScreen` y `BuyerCatalogScreen` en `screens/buyer/`; `LoginScreen` en `screens/freelancer/` intacto |
| IV. Seguridad — error genérico | ✅ PASS | FR-004: mensaje de error genérico sin indicar cuál campo falló (previene user enumeration) |

**Resultado**: Sin violaciones. Complexity Tracking omitido.

## Project Structure

### Documentation (this feature)

```text
specs/004-buyer-login/
├── plan.md                         # Este archivo
├── research.md                     # Decisiones técnicas
├── data-model.md                   # Modelo de sesión del comprador
├── quickstart.md                   # Guía de validación manual
├── contracts/
│   └── buyer-auth-contract.md      # Contrato UX del flujo de login
└── tasks.md                        # Generado por /speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── App.js                          # MODIFICAR: agregar rutas BuyerLogin y BuyerCatalog
└── src/
    └── screens/
        ├── freelancer/
        │   └── LoginScreen.js      # SIN CAMBIOS (login del freelancer intacto)
        └── buyer/                  # NUEVO directorio
            ├── BuyerLoginScreen.js # NUEVO: pantalla de login del comprador
            └── BuyerCatalogScreen.js # NUEVO: pantalla de destino mínima post-login
```

**Structure Decision**: Nuevo directorio `screens/buyer/` conforme al Principio I
(separación de roles). La API de login ya existe en `servicesApi.js`; no se crea
un archivo de API separado para el Comprador en esta feature.

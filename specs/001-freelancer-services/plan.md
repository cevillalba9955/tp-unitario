# Implementation Plan: Gestión de Servicios del Freelancer

**Branch**: `001-freelancer-services` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-freelancer-services/spec.md`

## Summary

El freelancer autenticado puede crear, editar, publicar y eliminar servicios en la
plataforma freelance. Cada servicio tiene un nombre, descripción, categoría,
entre 1 y 3 paquetes de contratación (con alcance, precio y plazo), y hasta 5
imágenes. La validación de requisitos mínimos se ejecuta en el servidor Node.js
antes de publicar. Las imágenes se almacenan como buffers en memoria y se sirven
por el propio backend. El store es 100% in-memory (sin persistencia entre reinicios).

## Technical Context

**Language/Version**: Node.js 20 LTS (backend) + React Native con Expo SDK 51 (frontend)

**Primary Dependencies**:
- Backend: Express 4.x, `multer` (upload), `uuid` (IDs), `jsonwebtoken` (auth middleware)
- Frontend: `expo-image-picker`, `axios`, React Navigation

**Storage**: In-memory (`Map` de JavaScript) — sin base de datos externa ni filesystem.
Imágenes almacenadas como `Buffer` Node.js en el store. Ver `data-model.md`.

**Testing**: No solicitado explícitamente. Validación manual via `quickstart.md`.

**Target Platform**: Backend — Linux container (Docker); Frontend — React Native (iOS/Android via Expo Go)

**Project Type**: Mobile app + REST API (cliente-servidor local)

**Performance Goals**: Creación y publicación en < 5 min (SC-001); cambios visibles en < 10 s (SC-003)

**Constraints**:
- Sin base de datos externa ni filesystem dedicado (mandato constitución v1.1.1)
- Sin servicios de cloud (Cloudinary, S3, etc.)
- Backend DEBE ejecutarse en Docker; React Native conecta vía IP del host
- Imágenes max 5 MB c/u, formatos JPG/PNG/WebP

**Scale/Scope**: TP universitario — volumen bajo; paginación por si acaso (page/limit)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-diseño

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Separación de Roles | ✅ PASS | Solo actor Freelancer en esta feature; ningún endpoint mezcla capacidades de Comprador |
| II. Catálogo como Núcleo | ✅ PASS | La publicación de un servicio alimenta directamente el catálogo público |
| III. Integridad de Servicios | ✅ PASS | FR-003: validación server-side de campos obligatorios antes de publicar |
| IV. Seguridad y RBAC | ✅ PASS | Middleware JWT en todos los endpoints de escritura; HTTP 403 para acceso ajeno |
| V. Entrega Incremental | ✅ PASS | US1 (crear/publicar) demostrable sin US2/US3; US3 completamente aditiva |
| Stack — Docker backend | ✅ PASS | Plan incluye Dockerfile para backend Node.js |
| Stack — In-memory only | ✅ PASS | Imágenes como Buffer; datos en Map; sin ORM, DB o filesystem externo |

### Post-diseño (re-evaluación tras Phase 1)

| Principio | Estado | Verificación |
|-----------|--------|-------------|
| III. Integridad — validación server-side | ✅ PASS | `POST /publish` devuelve 422 con campos faltantes; ver `contracts/services-api.md` |
| IV. RBAC — HTTP 403 vs 404 | ✅ PASS | Servicios ajenos retornan 403, no 404 (contratos verificados) |
| Stack — sin servicio externo para imágenes | ✅ PASS | `GET /api/v1/images/:id` sirve desde Buffer in-memory |

**Resultado**: Sin violaciones. Complexity Tracking vacío.

## Project Structure

### Documentation (this feature)

```text
specs/001-freelancer-services/
├── plan.md              # Este archivo
├── research.md          # Decisiones de stack y patrones
├── data-model.md        # Entidades y store in-memory
├── quickstart.md        # Guía de validación end-to-end
├── contracts/
│   └── services-api.md  # Contratos REST (request/response)
└── tasks.md             # Generado por /speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── store/
│   │   └── index.js           # Store in-memory (Maps + seed de categorías)
│   ├── middleware/
│   │   └── auth.js            # Verificación JWT + extracción freelancerId
│   ├── validators/
│   │   └── serviceValidator.js # Reglas de publicación y validación de campos
│   ├── routes/
│   │   ├── categories.js      # GET /api/v1/categories
│   │   ├── services.js        # CRUD + publish/unpublish
│   │   └── images.js          # Upload, delete y serve de imágenes
│   └── app.js                 # Express setup, middlewares, routes
├── Dockerfile
└── package.json

frontend/
├── src/
│   ├── api/
│   │   └── servicesApi.js     # Funciones axios para cada endpoint
│   ├── screens/
│   │   └── freelancer/
│   │       ├── MyServicesScreen.js    # Lista con pestañas Publicados/Borradores
│   │       ├── CreateServiceScreen.js # Formulario de creación
│   │       └── EditServiceScreen.js   # Formulario de edición + multimedia
│   └── components/
│       └── services/
│           ├── ServiceCard.js         # Ítem de lista con acciones
│           ├── PackageForm.js         # Formulario de paquete
│           └── ImageGallery.js        # Galería con upload y delete
└── app.json                   # Expo config (incluye IP del host Docker)
```

**Structure Decision**: Opción Mobile + API. `backend/` contiene el servidor Node.js
en Docker; `frontend/` contiene la app React Native con Expo. La separación refleja
el mandato de arquitectura cliente-servidor de la constitución.

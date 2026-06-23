---

description: "Task list — Gestión de Servicios del Freelancer"
---

# Tasks: Gestión de Servicios del Freelancer

**Input**: Design documents from `/specs/001-freelancer-services/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | data-model.md ✅ | contracts/services-api.md ✅ | research.md ✅

**Tests**: No solicitados explícitamente. Validación manual via `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario para implementación y testing independiente.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias incompletas)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3)
- Rutas de archivos incluidas en cada descripción

## Path Conventions

- Backend: `backend/src/`
- Frontend: `frontend/src/`
- Config backend: `backend/`
- Config frontend: `frontend/`

---

## Phase 1: Setup (Infraestructura Compartida)

**Purpose**: Inicialización del proyecto y estructura base

- [x] T001 Crear estructura de directorios del proyecto: `backend/src/{store,middleware,validators,routes}` y `frontend/src/{api,screens/freelancer,components/services}`
- [x] T002 Inicializar proyecto Node.js en `backend/` con `npm init` e instalar dependencias: `express`, `multer`, `uuid`, `jsonwebtoken`
- [x] T003 [P] Crear `backend/Dockerfile` con Node 20 Alpine, `COPY package*.json`, `RUN npm ci`, `EXPOSE 3000`, `CMD ["node", "src/app.js"]`
- [x] T004 [P] Inicializar proyecto Expo en `frontend/` con `npx create-expo-app` e instalar: `axios`, `expo-image-picker`, `@react-navigation/native`, `@react-navigation/stack`

---

## Phase 2: Foundational (Prerequisitos Bloqueantes)

**Purpose**: Infraestructura compartida que DEBE completarse antes de cualquier historia de usuario

**⚠️ CRÍTICO**: Ninguna historia de usuario puede comenzar hasta completar esta fase

- [x] T005 Crear store in-memory en `backend/src/store/index.js` con cuatro `Map` (`categories`, `services`, `packages`, `images`) y seed inicial de 8 categorías (slugs: `development`, `design`, `writing`, `marketing`, `video`, `music`, `programming`, `business`)
- [x] T006 [P] Implementar middleware JWT en `backend/src/middleware/auth.js`: verificar `Authorization: Bearer <token>`, decodificar `freelancerId` del payload, adjuntar al `req.user`; retornar HTTP 401 si ausente o inválido
- [x] T007 [P] Implementar validador de servicios en `backend/src/validators/serviceValidator.js` con: `validatePublish(service, packages)` → retorna `{ valid, missing[] }` verificando título, descripción, categoryId y al menos 1 paquete con nombre, scope, price > 0 y deliveryDays > 0; `validateFields(body)` → verifica longitudes máximas (title ≤ 80, description ≤ 1200, package.name ≤ 50, package.scope ≤ 500) y tipos
- [x] T008 Configurar aplicación Express en `backend/src/app.js`: `express.json()`, `cors`, montar rutas `/api/v1/categories`, `/api/v1/services`, `/api/v1/images`; middleware global de error con body `{ error, message }` y código HTTP correcto
- [x] T009 Configurar URL base del backend en `frontend/src/api/config.js` con constante `API_BASE_URL` (e.g. `http://192.168.x.x:3000`) leída de `app.json` extra o variable de entorno Expo

**Checkpoint**: Fundación lista — las historias de usuario pueden comenzar

---

## Phase 3: User Story 1 — Crear y Publicar Servicio (Priority: P1) 🎯 MVP

**Goal**: El freelancer puede crear un servicio con campos básicos y un paquete, y publicarlo en el catálogo

**Independent Test**: Seguir pasos "User Story 1" en `quickstart.md` → el servicio aparece en `GET /api/v1/services/my?status=PUBLISHED`

### Implementación US1 — Backend

- [x] T010 [P] [US1] Implementar `GET /api/v1/categories` en `backend/src/routes/categories.js`: retornar array de categorías del store; HTTP 200
- [x] T011 [P] [US1] Implementar `POST /api/v1/services` en `backend/src/routes/services.js`: requerir auth middleware; crear servicio con UUID, `freelancerId` del JWT, `status: 'DRAFT'`, `createdAt`/`updatedAt`; validar campos con `validateFields`; retornar HTTP 201 con objeto completo (packages: [], images: [])
- [x] T012 [US1] Implementar `GET /api/v1/services/my` en `backend/src/routes/services.js`: filtrar store por `freelancerId`; aceptar query param `status` (`DRAFT`/`PUBLISHED`); paginar con `page` (base 0) y `limit` (default 20, max 50); retornar `{ data[], pagination: { page, limit, total } }`
- [x] T013 [US1] Implementar `GET /api/v1/services/:id` en `backend/src/routes/services.js`: retornar servicio con packages e images (solo URLs, no buffers); HTTP 403 si no es propietario y está en DRAFT; HTTP 404 si no existe
- [x] T014 [US1] Implementar `POST /api/v1/services/:id/publish` en `backend/src/routes/services.js`: verificar ownership (HTTP 403); ejecutar `validatePublish` con packages del store; HTTP 422 con `{ error: 'PUBLISH_VALIDATION_FAILED', missing[] }` si falla; cambiar status a `PUBLISHED` y retornar objeto actualizado

### Implementación US1 — Frontend

- [x] T015 [P] [US1] Crear funciones en `frontend/src/api/servicesApi.js`: `getCategories()`, `createService(data)`, `getMyServices(params)`, `getService(id)`, `publishService(id)`; todas usando `axios` con `API_BASE_URL` y header `Authorization: Bearer <token>`
- [x] T016 [P] [US1] Crear `frontend/src/components/services/PackageForm.js`: formulario con campos name (max 50), scope (max 500), price (numérico > 0), deliveryDays (entero > 0); props `value`, `onChange`, `onRemove`; validación visual en tiempo real
- [x] T017 [US1] Crear `frontend/src/screens/freelancer/CreateServiceScreen.js`: formulario con title (max 80), description (max 1200), selector de categoría (dropdown con `getCategories()`), sección de paquetes (usando `PackageForm`, 1–3 paquetes); botones "Guardar borrador" (→ `createService`) y "Guardar y publicar" (→ `createService` + `publishService`); mostrar errores de validación del servidor
- [x] T018 [US1] Crear `frontend/src/components/services/ServiceCard.js`: muestra title, status badge (PUBLISHED/DRAFT), packageCount, imageCount, updatedAt; botón "Editar" (→ EditServiceScreen); acciones condicionales por status (publicar si DRAFT, despublicar si PUBLISHED)
- [x] T019 [US1] Crear `frontend/src/screens/freelancer/MyServicesScreen.js`: dos pestañas ("Publicados" / "Borradores") usando `getMyServices({ status })`; lista de `ServiceCard`; botón FAB "Nuevo servicio" → `CreateServiceScreen`; paginación con scroll infinito o botón "Ver más"
- [x] T020 [US1] Configurar navegación en `frontend/src/App.js` o archivo de navegación: `Stack.Navigator` con `MyServicesScreen` como pantalla inicial, `CreateServiceScreen` y `EditServiceScreen` como pantallas secundarias

**Checkpoint**: User Story 1 completamente funcional y testeable de forma independiente

---

## Phase 4: User Story 2 — Editar Servicio Existente (Priority: P2)

**Goal**: El freelancer puede modificar cualquier campo, despublicar y eliminar borradores

**Independent Test**: Seguir pasos "User Story 2" en `quickstart.md` → edición refleja cambios; servicio se despublica automáticamente al eliminar último paquete; DELETE 204; PUT de otro usuario retorna 403

### Implementación US2 — Backend

- [x] T021 [US2] Implementar `PUT /api/v1/services/:id` en `backend/src/routes/services.js`: verificar ownership (HTTP 403); validar campos con `validateFields`; reemplazar packages completos (eliminar anteriores del store, insertar nuevos con UUIDs); actualizar `updatedAt`; si servicio era PUBLISHED y ya no cumple `validatePublish`, cambiar a DRAFT y agregar header `X-Auto-Unpublished: true`; retornar objeto completo HTTP 200
- [x] T022 [US2] Implementar `DELETE /api/v1/services/:id` en `backend/src/routes/services.js`: verificar ownership (HTTP 403); HTTP 409 si status es PUBLISHED; eliminar servicio, sus packages e imágenes del store (cascada manual); retornar HTTP 204
- [x] T023 [US2] Implementar `POST /api/v1/services/:id/unpublish` en `backend/src/routes/services.js`: verificar ownership (HTTP 403); cambiar status a DRAFT; actualizar `updatedAt`; retornar objeto actualizado HTTP 200

### Implementación US2 — Frontend

- [x] T024 [US2] Crear `frontend/src/screens/freelancer/EditServiceScreen.js`: precarga datos del servicio con `getService(id)`; mismos campos que CreateServiceScreen (title, description, categoría, paquetes); botón "Guardar cambios" (→ `updateService(id, data)`); mostrar banner si respuesta incluye header `X-Auto-Unpublished: true`
- [x] T025 [US2] Agregar funciones a `frontend/src/api/servicesApi.js`: `updateService(id, data)`, `deleteService(id)`, `unpublishService(id)`
- [x] T026 [US2] Actualizar `frontend/src/components/services/ServiceCard.js`: agregar confirmación antes de eliminar (alert nativo); llamar `deleteService` y refrescar lista; llamar `unpublishService` desde acción en PUBLISHED; navegar a `EditServiceScreen` desde "Editar"

**Checkpoint**: User Stories 1 Y 2 funcionan independientemente

---

## Phase 5: User Story 3 — Gestionar Multimedia (Priority: P3)

**Goal**: El freelancer puede subir hasta 5 imágenes por servicio; imágenes servidas por el backend

**Independent Test**: Seguir pasos "User Story 3" en `quickstart.md` → imagen subida accesible via `GET /api/v1/images/:id`; 6ta imagen retorna 409; PDF retorna 400

### Implementación US3 — Backend

- [x] T027 [P] [US3] Crear `backend/src/routes/images.js` con `multer` configurado: `storage: memoryStorage()`, `limits: { fileSize: 5 * 1024 * 1024 }`, `fileFilter` que acepta solo `image/jpeg`, `image/png`, `image/webp`; retornar HTTP 400 con mensaje descriptivo si falla
- [x] T028 [P] [US3] Implementar `POST /api/v1/services/:id/images` en `backend/src/routes/images.js`: verificar ownership; verificar que el servicio tenga < 5 imágenes (HTTP 409 si llega al límite); guardar `{ id: uuid, serviceId, imageBuffer: req.file.buffer, mimeType: req.file.mimetype, displayOrder, uploadedAt }` en `store.images`; retornar `{ id, serviceId, imageUrl: '/api/v1/images/<id>', displayOrder, uploadedAt }` HTTP 201
- [x] T029 [US3] Implementar `DELETE /api/v1/services/:id/images/:imageId` en `backend/src/routes/images.js`: verificar ownership del servicio; eliminar imagen del store; HTTP 204
- [x] T030 [US3] Implementar `GET /api/v1/images/:imageId` en `backend/src/routes/images.js` (público, sin auth): buscar en `store.images`; `res.setHeader('Content-Type', image.mimeType)`; `res.send(image.imageBuffer)`; HTTP 404 si no existe

### Implementación US3 — Frontend

- [x] T031 [P] [US3] Agregar funciones a `frontend/src/api/servicesApi.js`: `uploadImage(serviceId, imageUri)` usando `FormData` + `expo-image-picker` resultado; `deleteImage(serviceId, imageId)`
- [x] T032 [US3] Crear `frontend/src/components/services/ImageGallery.js`: mostrar grid de imágenes actuales (usando `<Image source={{ uri: API_BASE_URL + image.imageUrl }} />`); botón "+" para agregar imagen con `expo-image-picker`; botón "×" por imagen para eliminarla; deshabilitar "+" si hay 5 imágenes; mostrar error si subida falla (fallo aislado, no bloquea el resto del formulario)
- [x] T033 [US3] Integrar `ImageGallery` en `frontend/src/screens/freelancer/EditServiceScreen.js`: sección "Multimedia" con el componente; actualizar estado local al subir/eliminar imágenes

**Checkpoint**: Las tres historias de usuario funcionan de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan múltiples historias

- [x] T034 [P] Agregar validación de payload vacío y tipos incorrectos a todos los route handlers en `backend/src/routes/services.js` (e.g. price no numérico → HTTP 400)
- [x] T035 [P] Agregar middleware de logging de requests en `backend/src/app.js` (método, path, status, ms) para facilitar debugging durante el TP
- [x] T036 Ejecutar todos los escenarios del `quickstart.md` manualmente y corregir comportamientos que no coincidan con los contratos de `contracts/services-api.md`
- [x] T037 [P] Crear `backend/README.md` con instrucciones: `docker build`, `docker run -p 3000:3000`, nota sobre IP del host para React Native

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede comenzar inmediatamente
- **Foundational (Phase 2)**: Depende de Phase 1 completa — BLOQUEA todas las historias
- **US1 (Phase 3)**: Depende de Phase 2 — es el MVP; sin dependencias en US2 o US3
- **US2 (Phase 4)**: Depende de Phase 2; puede integrarse con US1 pero es independientemente testeable
- **US3 (Phase 5)**: Depende de Phase 2; completamente aditiva, no bloquea US1 ni US2
- **Polish (Phase 6)**: Depende de que las historias deseadas estén completas

### User Story Dependencies

- **US1 (P1)**: Sin dependencias en otras historias. Testeable sola.
- **US2 (P2)**: Reutiliza rutas de US1 pero puede demostrarse sin US3.
- **US3 (P3)**: Completamente independiente de US2 en la interfaz; solo requiere un servicio existente (US1).

### Within Each User Story

- Backend antes de Frontend (los endpoints deben existir para probar la UI)
- Store/Middleware (Phase 2) antes de cualquier ruta
- Validador antes de los endpoints de publicación y edición
- Backend route antes del componente frontend que la consume

### Parallel Opportunities

- T003 y T004 (Dockerfile y Expo init) en paralelo durante Setup
- T006 y T007 (auth middleware y validador) en paralelo durante Foundational
- T010 y T011 (categories route y services POST) en paralelo dentro de US1
- T015 y T016 (servicesApi.js y PackageForm) en paralelo dentro de US1
- T027 y T028 (multer config y upload endpoint) en paralelo dentro de US3
- T031 y T032 (uploadImage API y ImageGallery component) en paralelo dentro de US3

---

## Parallel Example: User Story 1

```bash
# Backend (en paralelo):
T010: GET /api/v1/categories → backend/src/routes/categories.js
T011: POST /api/v1/services → backend/src/routes/services.js (creación)

# Frontend (en paralelo, una vez que T011 esté completo):
T015: servicesApi.js (funciones axios)
T016: PackageForm.js (componente)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea todo)
3. Completar Phase 3: User Story 1
4. **DETENER Y VALIDAR**: Ejecutar escenarios US1 de `quickstart.md`
5. El catálogo público puede consumir servicios publicados con esta base

### Incremental Delivery

1. Setup + Foundational → Base lista
2. US1 completa → Freelancer puede crear y publicar (MVP demostrable)
3. US2 completa → Freelancer puede editar, despublicar y eliminar
4. US3 completa → Multimedia disponible
5. Cada historia agrega valor sin romper las anteriores

### Parallel Team Strategy

Con múltiples desarrolladores (una vez finalizada la Phase 2):
- Dev A: US1 backend (T010–T014)
- Dev B: US1 frontend (T015–T020)
- Dev C: US2 backend (T021–T023) en paralelo con US1 frontend

---

## Notes

- `[P]` = archivos distintos, sin dependencias en tareas incompletas del mismo ciclo
- `[USn]` mapea la tarea a la historia de usuario para trazabilidad
- Cada historia es completable y testeable de forma independiente
- Verificar que los endpoints retornan los códigos HTTP exactos del contrato antes de avanzar
- Los datos no persisten entre reinicios del contenedor Docker — es el comportamiento esperado
- Para conectar React Native al backend: usar la IP del host (no `localhost`) en `API_BASE_URL`

# Tasks: Catálogo de Comprador

**Input**: Design documents from `/specs/005-buyer-catalog/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Tests**: No solicitados. Validación manual via `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario para entrega incremental independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2, US3)
- Se incluyen rutas de archivo exactas en cada descripción

---

## Phase 1: Setup (Infraestructura compartida)

**Purpose**: Verificar que el entorno base esté listo para la feature; no hay dependencias de librerías nuevas.

- [x] T001 Verificar que el backend corre en Docker (`docker compose up` en `backend/`) y responde en `http://localhost:3000`
- [x] T002 Verificar que Expo corre (`npx expo start` en `frontend/`) y la app compila sin errores

**Checkpoint**: Entorno listo — backend y frontend funcionales antes de cualquier cambio de código.

---

## Phase 2: Fundacional (Prerequisitos bloqueantes)

**Purpose**: Cambios que deben estar completos antes de poder implementar cualquier historia de usuario.

**⚠️ CRÍTICO**: Ninguna historia puede comenzar hasta completar esta fase.

- [x] T003 Agregar endpoint `GET /api/v1/services` (catálogo) en `backend/src/routes/services.js` — registrar la ruta ANTES de `GET /my`; filtrar `status=PUBLISHED`; calcular `minPrice` y `categoryName` server-side; soportar query param opcional `?categoryId=X`
- [x] T004 Agregar función `getCatalog(categoryId?)` en `frontend/src/api/servicesApi.js` — llama a `GET /api/v1/services` sin requerir token (endpoint público); envía token solo si está disponible; acepta `categoryId` opcional

**Checkpoint**: El endpoint devuelve servicios publicados con `minPrice` y `categoryName`. `getCatalog()` disponible en el cliente. Nota: `getService(id)` ya existía en `servicesApi.js` desde feature 003; T011 depende de ella sin necesidad de crearla.

---

## Phase 3: User Story 1 — Explorar el catálogo de servicios publicados (Priority: P1) 🎯 MVP

**Goal**: El comprador autenticado ve la lista completa de servicios publicados con título, categoría y precio mínimo. Sin filtro, sin detalle — solo la lista.

**Independent Test**: Iniciar sesión como `buyer@demo.com`, navegar al catálogo y verificar lista de servicios publicados con título, categoría y precio mínimo; confirmar que servicios DRAFT no aparecen; verificar mensaje de lista vacía si no hay publicados.

### Implementation

- [x] T005 [US1] Reemplazar `BuyerCatalogScreen` placeholder con pantalla funcional en `frontend/src/screens/buyer/BuyerCatalogScreen.js` — cargar servicios con `getCatalog()` al montar; mostrar `ActivityIndicator` durante carga; mostrar `FlatList` con ítems (título, categoría, precio mínimo); mostrar mensaje "Aún no hay servicios disponibles." cuando lista vacía; mostrar mensaje de error con botón "Reintentar" si falla la llamada (FR-011)
- [x] T006 [US1] Verificar en `frontend/App.js` que `BuyerCatalog` sigue registrado con header morado y que el logout desde el catálogo redirige a `BuyerLogin` con `navigation.replace`
- [x] T007 [US1] Validar acceso público (FR-010): verificar que `BuyerCatalogScreen` NO redirige si `getToken()` es null — el catálogo carga normalmente sin token; el header muestra "Iniciar sesión" en lugar de "Cerrar sesión"

**Checkpoint**: US1 funcional y testeable de forma independiente — el comprador puede ver el catálogo.

---

## Phase 4: User Story 2 — Filtrar servicios por categoría (Priority: P2)

**Goal**: El comprador puede seleccionar una categoría para ver solo sus servicios publicados; puede volver a "Todas" para ver el catálogo completo.

**Independent Test**: En el catálogo cargado, tocar una categoría → verificar que solo aparecen servicios de esa categoría. Tocar "Todas" → volver a ver todos. Tocar una categoría sin servicios → ver mensaje de vacío con filtro activo.

### Implementation

- [x] T008 [US2] Agregar carga de categorías con `getCategories()` en `BuyerCatalogScreen` (`frontend/src/screens/buyer/BuyerCatalogScreen.js`) — cargar en paralelo con `getCatalog()`; guardar en estado `categories`
- [x] T009 [US2] Agregar fila de filtro horizontal en `BuyerCatalogScreen` (`frontend/src/screens/buyer/BuyerCatalogScreen.js`) — `ScrollView` horizontal con chip "Todas" + uno por categoría; chip activo resaltado en morado; al tocar chip, actualizar `selectedCategory` y recargar catálogo con `getCatalog(selectedCategory)`
- [x] T010 [US2] Ajustar mensaje de vacío en `BuyerCatalogScreen` para distinguir entre sin servicios en plataforma ("Aún no hay servicios disponibles.") y sin servicios en la categoría filtrada ("No hay servicios en esta categoría.")

**Checkpoint**: US2 funcional — el filtro por categoría funciona de forma independiente sobre la lista de US1.

---

## Phase 5: User Story 3 — Ver detalle de un servicio (Priority: P3)

**Goal**: El comprador puede tocar un servicio del catálogo para ver su descripción completa, paquetes e imágenes. Al volver, el filtro activo se preserva.

**Independent Test**: Tocar un servicio → pantalla de detalle con título, descripción, categoría, lista de paquetes (nombre, alcance, precio, plazo) e imágenes si las hay. Presionar "Volver" → regresa al catálogo con el filtro activo intacto.

### Implementation

- [x] T011 [US3] Crear `ServiceDetailScreen` en `frontend/src/screens/buyer/ServiceDetailScreen.js` — recibe `route.params.serviceId`; carga detalle con `getService(serviceId)` al montar; muestra `ActivityIndicator` durante carga; muestra título, descripción, nombre de categoría; lista de paquetes con nombre, alcance, precio y plazo; galería horizontal desplazable (`FlatList` horizontal con paginación) si `images.length > 0`; mensaje de error si falla la carga; tema morado (#7b1fa2) coherente con las demás pantallas del comprador
- [x] T012 [US3] Registrar `ServiceDetail` en el stack de `frontend/App.js` con el componente `ServiceDetailScreen`; header: `title: 'Detalle del Servicio'`, `headerStyle backgroundColor '#7b1fa2'`, `headerTintColor '#fff'`
- [x] T013 [US3] Hacer que cada ítem del catálogo en `BuyerCatalogScreen` sea toqueable y navegue a `ServiceDetail` con `navigation.navigate('ServiceDetail', { serviceId: item.id })` (`frontend/src/screens/buyer/BuyerCatalogScreen.js`)
- [x] T014 [US3] Verificar preservación de filtro: como el estado local de `BuyerCatalogScreen` se mantiene al hacer `navigate` (push) + `goBack()`, confirmar que el `selectedCategory` no se resetea al volver del detalle

**Checkpoint**: US3 funcional — el flujo catálogo → detalle → catálogo funciona con filtro preservado.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Mejoras que afectan múltiples historias o la experiencia global.

- [x] T015 [P] Verificar coherencia visual entre `BuyerLoginScreen`, `BuyerCatalogScreen` y `ServiceDetailScreen`: mismo color primario (#7b1fa2), mismo estilo de headers y botones
- [ ] T016 Ejecutar todos los escenarios de `quickstart.md` (Escenarios 0–5) en Expo Go y corregir cualquier desviación; para SC-001 medir manualmente el tiempo de carga del catálogo en el Escenario 1 y confirmar que es menor a 3 segundos con Docker corriendo
- [x] T017 [P] Verificar en `backend/src/routes/services.js` que la nueva ruta `GET /` no interfiere con rutas existentes (`/my`, `/:id`, `/:id/publish`, `/:id/unpublish`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede iniciar inmediatamente
- **Fundacional (Phase 2)**: Depende de Phase 1 — **bloquea todas las historias**
- **US1 (Phase 3)**: Depende de Phase 2 (requiere `getCatalog()` y el endpoint)
- **US2 (Phase 4)**: Depende de Phase 3 (amplía `BuyerCatalogScreen` con filtro)
- **US3 (Phase 5)**: Depende de Phase 2 (requiere `getService()`); puede iniciarse en paralelo con US2
- **Polish (Phase 6)**: Depende de US1 + US2 + US3

### User Story Dependencies

| Historia | Depende de | Nota |
|----------|-----------|------|
| US1 | Phase 2 (endpoint + getCatalog) | Independiente de otras historias |
| US2 | US1 (extiende BuyerCatalogScreen) | No puede testarse sin la lista de US1 |
| US3 | Phase 2 (getService existente) | La navegación desde el catálogo requiere US1 |

### Within Each User Story

- Backend antes que frontend (el contrato del endpoint debe existir antes de usarlo en el cliente)
- `getCatalog()` en `servicesApi.js` antes que `BuyerCatalogScreen`
- `ServiceDetailScreen` antes que registrar la ruta en `App.js`
- Registro en `App.js` antes de agregar `navigation.navigate` en el catálogo

---

## Parallel Opportunities

```text
# Phase 2: T003 y T004 tocan archivos distintos — pueden ejecutarse en paralelo
Task T003: backend/src/routes/services.js  (nuevo endpoint)
Task T004: frontend/src/api/servicesApi.js (nueva función)

# Phase 5 (US3): T011 y T012 son independientes
Task T011: frontend/src/screens/buyer/ServiceDetailScreen.js (nuevo)
Task T012: frontend/App.js                                   (registro)

# Phase 6: T015 y T017 no dependen entre sí
Task T015: revisión visual (frontend)
Task T017: verificación de rutas (backend)
```

---

## Implementation Strategy

### MVP First (US1 únicamente)

1. Completar Phase 1: Setup
2. Completar Phase 2: Fundacional (`GET /api/v1/services` + `getCatalog()`)
3. Completar Phase 3: US1 (`BuyerCatalogScreen` funcional)
4. **DETENER y VALIDAR**: Escenario 1 del `quickstart.md`
5. Demostrar: comprador ve el catálogo de servicios publicados

### Incremental Delivery

1. Phase 1 + Phase 2 → Infraestructura lista
2. Phase 3 (US1) → Lista del catálogo funcional (MVP demostrable)
3. Phase 4 (US2) → Filtro por categoría
4. Phase 5 (US3) → Detalle del servicio
5. Phase 6 → Polish y validación final

---

## Notes

- `[P]` = archivos distintos, sin dependencias bloqueantes entre esas tareas
- La nueva ruta `GET /api/v1/services` en el backend DEBE registrarse antes de `GET /my` en `services.js` (orden de rutas en Express)
- `BuyerCatalogScreen` se reescribe completo (el archivo actual es un placeholder); no es una modificación incremental
- `ServiceDetailScreen` es un archivo nuevo; `App.js` necesita el import correspondiente
- El estado local de `BuyerCatalogScreen` persiste entre `navigate` + `goBack()` sin gestión global de estado — este es el comportamiento estándar de React Navigation stack
- Validar siempre con el backend Docker corriendo; los errores de red son esperados si Docker está detenido (Escenario 4 del quickstart)

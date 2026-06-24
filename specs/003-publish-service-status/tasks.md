# Tasks: Publicación de Servicio con Gestión de Estado

**Input**: Design documents from `/specs/003-publish-service-status/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: No solicitados. Validación manual via `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario. La edición se consolida en `CreateServiceScreen.js`; el backend no cambia.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias incompletas)
- **[Story]**: Historia de usuario a la que pertenece la tarea

---

## Phase 1: Setup

**Purpose**: Verificación del estado actual de los archivos a modificar.

- [x] T001 Verificar el flujo `handleSaveAndPublish` en `frontend/src/screens/freelancer/CreateServiceScreen.js` y confirmar que `createService` se llama antes que `publishService`
- [x] T002 Verificar el flujo `handlePublish` en `frontend/src/screens/freelancer/CreateServiceScreen.js` en modo edición y confirmar que usa `Alert.alert` solo para errores no relacionados con publicación

**Checkpoint**: Comportamiento actual confirmado — implementación puede comenzar.

---

## Phase 2: Foundational

No hay prerequisitos bloqueantes: las dos historias afectan archivos distintos y pueden implementarse en paralelo tras el setup.

---

## Phase 3: User Story 1 — Publicar un servicio nuevo exitosamente (Priority: P1) 🎯 MVP

**Goal**: Al publicar exitosamente un servicio nuevo, el usuario es redirigido a la lista de servicios donde puede ver el servicio con estado "Publicado".

**Independent Test**: Crear un servicio completo con todos los campos, pulsar "Guardar y publicar". Verificar que la app navega a la lista y el servicio aparece en la pestaña "Publicados" con badge verde. (`quickstart.md` Escenario 1)

### Implementación US1

- [x] T003 [US1] Verificar en `frontend/src/screens/freelancer/CreateServiceScreen.js` que al publicar exitosamente, `navigation.goBack()` se llama tras la respuesta del servidor — documentar si ya está implementado o ajustar si falta

**Nota**: Revisando el código actual, `handleSaveAndPublish` ya llama `navigation.goBack()` tanto en el flujo exitoso como implícitamente por el try/catch. Si ya está correcto, esta tarea es de verificación. Si no, ajustar para que `navigation.goBack()` se llame explícitamente tras el éxito de `publishService`.

**Checkpoint**: US1 verificada — publicación exitosa navega a la lista. Probar con `quickstart.md` Escenario 1.

---

## Phase 4: User Story 2 — Publicación fallida: guardar como borrador + mostrar error (Priority: P2)

**Goal**: Cuando la publicación falla, el usuario ve un mensaje que indica que el servicio fue guardado como borrador y lista los campos faltantes. Luego la app navega a la lista donde el borrador es visible.

**Independent Test**: Crear un servicio sin categoría ni paquetes, pulsar "Guardar y publicar". Verificar mensaje de error con campos faltantes + navegación a lista + borrador visible en pestaña "Borradores". (`quickstart.md` Escenarios 2 y 3)

### Implementación US2

- [x] T004 [US2] En `frontend/src/screens/freelancer/CreateServiceScreen.js`, modificar el bloque `catch` de `handleSaveAndPublish` para que cuando `publishService` falle (422 u otro error tras `createService` exitoso), muestre el mensaje: "Tu servicio fue guardado como borrador. Revisá los campos faltantes: {missing.join(', ')}" usando el campo `e.response?.data?.missing` del error 422, luego llame `navigation.goBack()`
- [x] T005 [US2] En `frontend/src/screens/freelancer/CreateServiceScreen.js`, manejar el caso donde `publishService` falla con un error que no tiene `missing` (error de red u otro): mostrar mensaje genérico "Tu servicio fue guardado como borrador. Ocurrió un error al publicarlo." y llamar `navigation.goBack()`

**Checkpoint**: US2 verificada — fallo de publicación muestra mensaje descriptivo y navega al listado. Probar con `quickstart.md` Escenarios 2 y 3.

---

## Phase 5: User Story 3 — Publicar borrador existente desde CreateServiceScreen (Priority: P3)

**Goal**: Al publicar desde la pantalla unificada de edición de un borrador, los errores de publicación se muestran como texto inline (no Alert emergente) indicando que el servicio permanece como borrador y cuáles campos faltan.

**Independent Test**: Abrir un borrador incompleto en CreateServiceScreen con `serviceId`, pulsar "Publicar". Verificar que aparece texto de error inline (no Alert) con los campos faltantes y el badge de estado sigue mostrando "Borrador". (`quickstart.md` Escenarios 4 y 5)

### Implementación US3

- [x] T006 [P] [US3] En `frontend/src/screens/freelancer/CreateServiceScreen.js`, agregar estado `publishError` (string | null) inicializado en `null`
- [x] T007 [US3] En `frontend/src/screens/freelancer/CreateServiceScreen.js`, modificar `handlePublish` para: limpiar `publishError` al inicio; en caso de fallo (422) setear `publishError` con "El servicio permanece como borrador. Campos faltantes: {missing.join(', ')}."; en caso de otro error setear `publishError` con el mensaje genérico del servidor o "Error al intentar publicar el servicio."
- [x] T008 [US3] En `frontend/src/screens/freelancer/CreateServiceScreen.js`, agregar renderizado del `publishError` como texto inline (estilo rojo) debajo del bloque de estado (`statusRow`), visible solo cuando `publishError` no es null — eliminar el `Alert.alert` del `catch` de `handlePublish`
- [x] T009 [US3] En `frontend/src/screens/freelancer/CreateServiceScreen.js`, limpiar `publishError` cuando `handlePublish` tiene éxito (setear `publishError(null)`) y también al inicio de cada intento de publicación

**Checkpoint**: US3 verificada — error de publicación desde edición muestra texto inline sin Alert. Probar con `quickstart.md` Escenarios 4 y 5.

---

## Phase 6: Polish & Validaciones cruzadas

- [x] T010 [P] Ejecutar `quickstart.md` Escenario 6 (error de red): verificar que ningún flujo cambia el estado del servicio sin respuesta 200 del servidor
- [x] T011 [P] Verificar que el error `publishError` en `CreateServiceScreen.js` se limpia al navegar fuera y volver a la pantalla (la carga inicial recarga el servicio)
- [x] T012 Ejecutar todos los escenarios de `quickstart.md` (1–6) y registrar resultados; corregir cualquier desviación encontrada

---

## Dependencies & Execution Order

### Dependencias de fase

- **Phase 1 (Setup)**: Sin dependencias — comenzar inmediatamente
- **Phase 2 (Foundational)**: N/A para esta feature
- **Phase 3 (US1)**: Puede comenzar tras Phase 1; no depende de US2/US3
- **Phase 4 (US2)**: Puede comenzar tras Phase 1 en paralelo con US1 (archivo distinto: mismo archivo pero tareas secuenciales dentro)
- **Phase 5 (US3)**: Puede comenzar tras Phase 1 en paralelo con US1 y US2 (archivo distinto)
- **Phase 6 (Polish)**: Depende de US1 + US2 + US3 completas

### Paralelismo disponible

- T001 y T002 pueden ejecutarse en paralelo (archivos distintos)
- US1 (T003) y US3 (T006–T009) pueden trabajarse en paralelo (archivos distintos)
- T010 y T011 pueden ejecutarse en paralelo (Phase 6)

---

## Parallel Example

```text
# Tras Phase 1 (T001 + T002 en paralelo):
Developer A: US2 en CreateServiceScreen.js (T004, T005)
Developer B: US3 en CreateServiceScreen.js (T006, T007, T008, T009)
```

---

## Implementation Strategy

### MVP First (US1 + US2 — flujo de creación completo)

1. Completar Phase 1: Setup (T001, T002)
2. Completar Phase 3: US1 verificación (T003)
3. Completar Phase 4: US2 mensaje + navegación (T004, T005)
4. **PARAR y VALIDAR**: Escenarios 1, 2 y 3 de `quickstart.md`
5. Demo: flujo de creación completo con manejo de fallo y borrador visible

### Incremental Delivery

1. Phase 1 → contexto claro
2. Phase 3 + Phase 4 → flujo de creación correcto (MVP)
3. Phase 5 → flujo de edición mejorado (US3)
4. Phase 6 → polish y validación completa

---

## Notes

- La edición se resuelve dentro de `CreateServiceScreen.js`
- El backend no cambia; `ServiceCard.handlePublish` tampoco cambia
- [P] en T001/T002 y T006 indica paralelismo real por archivo distinto
- Validación manual con `quickstart.md` es suficiente (no hay tests automatizados solicitados)

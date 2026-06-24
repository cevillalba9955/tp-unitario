# Research: Publicación de Servicio con Gestión de Estado

## Estado actual del codebase

### Backend — 100% implementado
| Endpoint | Comportamiento | HTTP |
|----------|---------------|------|
| `POST /api/v1/services` | Crea servicio con `status: 'DRAFT'` | 201 |
| `POST /api/v1/services/:id/publish` | Valida con `validatePublish`; si falla → 422 con `{ missing: [...] }` | 422 / 200 |
| `POST /api/v1/services/:id/unpublish` | Setea `status: 'DRAFT'` | 200 |

El campo `status` (`DRAFT` / `PUBLISHED`) existe en el store y es retornado por todas las respuestas de servicio.

### Frontend — estado parcial

**`CreateServiceScreen.js`** (flujo "Guardar y publicar"):
1. Llama `createService(payload)` → servicio queda en DRAFT en el servidor ✅
2. Llama `publishService(service.id)` → si falla, atrapa el error y muestra texto de error en pantalla
3. **Gap**: el mensaje de error no informa al usuario que el borrador YA fue guardado
4. **Gap**: el usuario permanece en la pantalla de creación sin feedback de que hay un borrador en la lista

**`CreateServiceScreen.js`** (flujo unificado de creación y edición):
1. En modo creación, llama `createService(payload)` y luego `publishService(service.id)`
2. Si la publicación falla, muestra un mensaje inline/alert según el contexto y navega a la lista para que el borrador quede visible
3. En modo edición (`route.params.serviceId`), precarga el servicio, muestra la status row y permite publicar/despublicar sin salir de la pantalla
4. **Gap resuelto**: ya no existe una pantalla separada de edición; la misma vista maneja `statusRow`, errores inline y multimedia en modo edición

**`ServiceCard.js`** — ya implementado:
- Badge "Borrador" (naranja) / "Publicado" (verde) ✅
- Botón "Publicar" para borradores, llama `publishService` con Alert en caso de error
- Botón "Despublicar" para publicados ✅

**`MyServicesScreen.js`** — ya implementado:
- Pestañas PUBLISHED / DRAFT ✅
- Recarga automática al enfocar pantalla ✅

---

## Decision 1: Qué cambiar en `CreateServiceScreen`

**Decision**: Cuando `publishService` falla en `handleSaveAndPublish`:
- Actualizar el mensaje de error para incluir: "Tu servicio fue guardado como borrador. Revisá los campos faltantes: {lista}."
- Navegar de vuelta a la lista (`navigation.goBack()`) para que el freelancer vea el borrador creado.

**Rationale**: El borrador YA está en el servidor tras `createService`. Lo correcto es llevarlo a la lista para que vea que su trabajo está guardado, y corrija desde ahí (editando el borrador). Quedarse en la pantalla de creación con un servicio ya creado genera confusión.

**Alternatives considered**:
- Permanecer en la pantalla con mensaje inline: descartado porque el servicio ya fue creado; la pantalla de creación es para crear nuevos, no para editar el que ya existe.
- Navegar a `EditService` directamente con el `serviceId`: más complejo; preferible simplificar a `goBack()` + mensaje previo.

---

## Decision 2: Qué cambiar en la pantalla unificada

**Decision**: Cuando `publishService` falla en `handlePublish`:
- Reemplazar `Alert.alert` por texto de error inline (debajo del botón de estado) indicando "El servicio permanece como borrador. Campos faltantes: {lista}."
- El error inline es persistente y visible sin requerir interacción del usuario.

**Rationale**: Consistencia con el patrón de errores inline usado en el resto de las pantallas (FR-006: datos intactos y visible). Un `Alert.alert` desaparece tras ser cerrado y no permite al usuario ver simultáneamente el error y los campos a corregir.

**Alternatives considered**:
- Mantener Alert: descartado por inconsistencia de UX y poca visibilidad
- Toast: sin librería instalada; el texto inline es más simple y consistente

---

## Decision 3: `ServiceCard.handlePublish` — sin cambios de lógica

**Decision**: `ServiceCard.handlePublish` ya llama `publishService` y muestra `Alert.alert` con los campos faltantes. No se cambia la lógica; es un caso de publicación desde lista donde el usuario ya ve el badge de estado y el Alert es aceptable.

**Rationale**: El contexto de la card de lista no tiene espacio inline para mensajes de error expandidos. El Alert es suficiente para comunicar el rechazo sin cambios de estado (el servicio sigue en DRAFT). El botón "Editar" lleva al usuario a `CreateServiceScreen` en modo edición, donde puede ver y corregir.

---

## Resumen de cambios necesarios

| Archivo | Cambio |
|---------|--------|
| `frontend/src/screens/freelancer/CreateServiceScreen.js` | Mejorar mensaje de error en `handleSaveAndPublish`: indicar que el borrador fue guardado + `navigation.goBack()` |
| `frontend/src/screens/freelancer/CreateServiceScreen.js` | Unificar el flujo de edición, agregar `statusRow` y mostrar `publishError` inline en modo edición |
| Resto del código | Sin cambios |

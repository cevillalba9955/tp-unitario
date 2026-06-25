# Research: Catálogo de Comprador

**Feature**: `005-buyer-catalog`
**Date**: 2026-06-24

## Decisiones Técnicas

### 1. Endpoint de catálogo: nueva ruta vs. reutilización de `/my`

**Decision**: Agregar `GET /api/v1/services` como nueva ruta en `services.js`,
antes de la ruta `/my`, con filtro forzado a `status=PUBLISHED` y filtro opcional
por `categoryId`.

**Rationale**: `GET /api/v1/services/my` filtra por `freelancerId` y es solo para
Freelancers. Reutilizarla para compradores requeriría lógica condicional basada en
el rol del token, que viola el principio de responsabilidad única. Una ruta nueva
es más limpia y no rompe contratos existentes.

**Alternatives considered**:
- Reutilizar `/my` con param `?role=buyer`: rechazado por mezclar semántica de
  endpoints de roles distintos.
- Crear un router separado `buyer-services.js`: rechazado por complejidad innecesaria
  para una sola ruta.

---

### 2. Posición de la nueva ruta en `services.js`

**Decision**: Registrar `GET /` **antes** de `GET /my` en el router.

**Rationale**: Express evalúa rutas en orden de registro. `GET /my` y `GET /` son
rutas distintas; no hay conflicto real, pero el orden explícito documenta la
intención y evita futuros errores si se añaden rutas con prefijo.

---

### 3. Filtrado: server-side vs. client-side

**Decision**: El filtro por `categoryId` se aplica en el servidor (`?categoryId=X`).

**Rationale**: Principio III y IV: la exclusión de borradores y el filtrado por
categoría deben ocurrir en el servidor para no depender de lógica client-only que
puede ser eludida. La spec no requiere paginación, pero el filtrado server-side es
más eficiente incluso con la lista completa.

---

### 4. Precio mínimo en el ítem del catálogo

**Decision**: El campo `minPrice` se calcula en el endpoint backend como el menor
`price` entre los paquetes del servicio. No se calcula en el frontend.

**Rationale**: Mantener la lógica de datos en el servidor. El frontend solo muestra
lo que recibe; no realiza cálculos derivados sobre los datos.

---

### 5. Pantalla de detalle: reutilizar backend existente

**Decision**: `ServiceDetailScreen` usa `GET /api/v1/services/:id` ya existente
(con auth). No se crea un endpoint de detalle separado para compradores.

**Rationale**: El endpoint ya devuelve paquetes e imágenes, y ya protege borradores
de terceros (403 si DRAFT y no es el dueño). Un Comprador con token válido puede
acceder al detalle de cualquier servicio PUBLISHED.

---

### 6. Preservación del filtro al volver del detalle

**Decision**: El filtro de categoría se pasa como parámetro de navegación
(`route.params.selectedCategory`) al detalles, y `BuyerCatalogScreen` lo lee
del estado local (no de route.params al retornar). El filtro persiste en el estado
del componente mientras la pantalla no se desmonte.

**Rationale**: React Navigation preserva el estado del componente cuando se hace
`navigate` (push) y se vuelve con `goBack()`. No se requiere gestión de estado global.

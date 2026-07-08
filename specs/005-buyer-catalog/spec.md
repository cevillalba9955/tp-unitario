# Feature Specification: Catálogo de Comprador

**Feature Branch**: `005-buyer-catalog`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "catálogo de comprador"

## Clarifications

### Session 2026-07-08

- Q: ¿El endpoint de detalle de servicio (`GET /api/v1/services/:id`) debe ser público para servicios publicados? → A: Sí. El detalle de un servicio publicado es accesible sin autenticación, igual que la lista, en cumplimiento del Principio II y de US3. Se añade FR-012 y una tarea de verificación.
- Q: ¿Qué responde `GET /api/v1/services/:id` para un servicio en "Borrador" o inexistente? → A: 404 Not Found para el comprador (autenticado o anónimo) y para cualquier solicitante que no sea el dueño; se oculta la existencia de servicios no publicados (ocultación por diseño, Principio IV). El dueño conserva acceso a su propio borrador. El frontend del comprador muestra "servicio no disponible". Se añade FR-013. Nota: hoy el backend devuelve 403 a no-dueños (services.js:133-135); FR-013 requiere cambiarlo a 404.

### Session 2026-06-24

- Q: ¿El catálogo requiere autenticación para ser accedido? → A: No. El catálogo es público (Principio II: "navegable y filtrable sin autenticación previa"). FR-010 actualizado: la autenticación solo se exige para acciones de escritura (contratar). El redirect guard basado en token fue eliminado del frontend y el middleware `auth` fue retirado del endpoint `GET /api/v1/services`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar el catálogo de servicios publicados (Priority: P1)

El comprador (autenticado o no) accede a la pantalla de catálogo y ve una lista de todos
los servicios en estado "Publicado". Puede desplazarse por el listado y ver la
información básica de cada servicio (título, categoría, precio mínimo).

**Why this priority**: Sin un catálogo navegable, el comprador no puede descubrir
servicios. Es el núcleo del valor de la plataforma para el Comprador (Principio II:
catálogo como núcleo del sistema).

**Independent Test**: Como comprador (autenticado o no), navegar al catálogo y verificar
que se muestran los servicios publicados con título, categoría y precio mínimo.
Verificar que servicios en estado "Borrador" no aparecen.

**Acceptance Scenarios**:

1. **Given** el comprador accede al catálogo (autenticado o no), **When** abre la pantalla, **Then** ve una lista de servicios publicados con título, nombre de categoría y precio del paquete más económico.
2. **Given** existen servicios en estado "Borrador", **When** el comprador ve el catálogo, **Then** esos servicios NO aparecen en la lista.
3. **Given** no hay servicios publicados en la plataforma, **When** el comprador accede al catálogo, **Then** ve un mensaje indicando que aún no hay servicios disponibles.

---

### User Story 2 - Filtrar servicios por categoría (Priority: P2)

El comprador puede filtrar el catálogo por categoría para encontrar servicios
relevantes a sus necesidades, sin necesidad de desplazarse por toda la lista.

**Why this priority**: El filtrado por categoría es la capacidad de descubrimiento
de primer nivel según el Principio II. Reduce la fricción en la búsqueda y aumenta
la probabilidad de contratación.

**Independent Test**: Seleccionar una categoría en el filtro. Verificar que solo
aparecen servicios publicados de esa categoría. Al quitar el filtro, volver a ver
todos los servicios.

**Acceptance Scenarios**:

1. **Given** el comprador está en el catálogo, **When** selecciona una categoría del filtro, **Then** la lista muestra únicamente servicios de esa categoría.
2. **Given** el comprador aplicó un filtro de categoría, **When** lo elimina o selecciona "Todas", **Then** vuelve a ver todos los servicios publicados.
3. **Given** no hay servicios publicados para la categoría seleccionada, **When** el comprador aplica ese filtro, **Then** ve un mensaje indicando que no hay servicios en esa categoría.

---

### User Story 3 - Ver el detalle de un servicio (Priority: P3)

El comprador puede tocar un servicio del catálogo para ver su descripción completa,
los paquetes de contratación disponibles con precios y plazos, y las imágenes
asociadas.

**Why this priority**: El detalle del servicio es el paso previo a la contratación.
Permite al comprador tomar una decisión informada antes de contratar.

**Independent Test**: Tocar un servicio en el catálogo. Verificar que se muestra
la descripción completa, los paquetes con precio y plazo de entrega, y las imágenes
si las hay.

**Acceptance Scenarios**:

1. **Given** el comprador está en el catálogo, **When** toca un servicio, **Then** ve la pantalla de detalle con: título, descripción completa, categoría, lista de paquetes (nombre, alcance, precio, plazo) e imágenes.
2. **Given** el comprador está en el detalle de un servicio, **When** presiona "Volver", **Then** regresa al catálogo con el filtro anterior intacto.
3. **Given** el servicio tiene imágenes, **When** el comprador las ve en el detalle, **Then** se muestran en una galería desplazable.

---

### Edge Cases

- ¿Qué ocurre si el catálogo tiene muchos servicios? La lista debe ser desplazable (scroll) sin degradar la experiencia.
- ¿Qué ocurre si el servidor no responde al cargar el catálogo? Se muestra un mensaje de error con opción de reintentar.
- ¿Qué pasa si un servicio se despublica mientras el comprador está en su detalle? Al volver al catálogo, ese servicio ya no aparece en la lista. Si el comprador recarga el detalle de un servicio ya despublicado (o inexistente), `GET /api/v1/services/:id` responde 404 y el frontend muestra "servicio no disponible" (ver FR-013).
- ¿Qué ocurre si el usuario no está autenticado y accede al catálogo? El catálogo es público y se muestra normalmente; la autenticación solo es requerida al intentar contratar un servicio (fuera del scope de esta feature).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar a cualquier usuario (autenticado o no) una lista de todos los servicios en estado "Publicado" (ver FR-010).
- **FR-002**: Cada ítem de la lista DEBE mostrar: título del servicio, nombre de la categoría y precio del paquete más económico.
- **FR-003**: Los servicios en estado "Borrador" NO DEBEN ser visibles en el catálogo del Comprador.
- **FR-004**: El sistema DEBE permitir al comprador filtrar el catálogo por categoría.
- **FR-005**: Al aplicar un filtro de categoría, solo DEBEN mostrarse servicios publicados de esa categoría.
- **FR-006**: El sistema DEBE permitir al comprador eliminar el filtro de categoría para volver a ver todos los servicios.
- **FR-007**: El sistema DEBE mostrar un mensaje informativo cuando no haya servicios disponibles (sin filtro o con filtro aplicado).
- **FR-008**: El comprador DEBE poder acceder al detalle de un servicio tocando su ítem en la lista.
- **FR-009**: La pantalla de detalle DEBE mostrar: título, descripción completa, categoría, paquetes de contratación (nombre, alcance, precio y plazo) e imágenes del servicio.
- **FR-010**: El catálogo de servicios es accesible sin autenticación previa, en cumplimiento del Principio II de la Constitución. La autenticación solo es requerida para acciones de escritura (contratación, favoritos).
- **FR-011**: Si el servidor no responde al cargar el catálogo, el sistema DEBE mostrar un mensaje de error con opción de reintentar.
- **FR-012**: El detalle de un servicio en estado "Publicado" DEBE ser accesible sin autenticación previa a través de `GET /api/v1/services/:id` (sin middleware `auth`), en cumplimiento del Principio II y de FR-010. La autenticación solo se exige para acciones de escritura (contratación).
- **FR-013**: `GET /api/v1/services/:id` DEBE responder **404 Not Found** cuando el servicio no exista, o cuando esté en estado "Borrador" y el solicitante NO sea su dueño (comprador autenticado o anónimo), ocultando la existencia de servicios no publicados (ocultación por diseño, Principio IV). El dueño (freelancer) DEBE poder seguir accediendo a su propio borrador por este endpoint (gestión de servicios). El frontend del comprador DEBE mostrar un mensaje "servicio no disponible" ante un 404.

### Key Entities

- **Servicio publicado**: Servicio en estado "Publicado" visible para compradores. Tiene título, descripción, categoría, paquetes e imágenes.
- **Categoría**: Clasificación de los servicios. Usada para filtrar el catálogo. Tiene nombre y slug.
- **Paquete de contratación**: Opción de contratación de un servicio. Tiene nombre, alcance, precio y plazo de entrega. Un servicio puede tener entre 1 y 3 paquetes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El catálogo carga y muestra los servicios publicados en menos de 3 segundos desde que se abre la pantalla.
- **SC-002**: El 100% de los servicios en estado "Borrador" son excluidos del catálogo visible para el Comprador.
- **SC-003**: Al aplicar un filtro de categoría, el 100% de los servicios mostrados pertenecen a esa categoría.
- **SC-004**: El comprador puede navegar desde el catálogo al detalle de un servicio y volver, conservando el filtro aplicado.

## Assumptions

- El backend no expone aún un endpoint de catálogo público; debe crearse `GET /api/v1/services` como parte de esta feature (sin middleware de autenticación). El endpoint de detalle `GET /api/v1/services/:id` también DEBE ser público para servicios publicados (ver FR-012).
- El backend ya cuenta con `GET /api/v1/categories` utilizable para construir el filtro.
- El catálogo solo muestra servicios propios de la plataforma; no se integran fuentes externas.
- La paginación no es requerida en este scope: se muestran todos los servicios publicados en una lista con scroll.
- No se requiere búsqueda por texto libre en este scope; solo filtrado por categoría.
- El catálogo es accesible sin autenticación (Principio II). El login del Comprador es necesario para contratar, no para navegar.
- Las imágenes del servicio se muestran en el detalle si existen; la clave `images` siempre es un array (posiblemente vacío) en la respuesta de la API.

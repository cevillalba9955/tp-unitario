# Feature Specification: Gestión de Servicios del Freelancer

**Feature Branch**: `001-freelancer-services`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Gestión de servicios del freelancer: crear, editar y publicar servicios, con nombre, descripción, categoría, paquetes de contratación, multimedia"

## Clarifications

### Session 2026-06-23

- Q: ¿Puede un freelancer eliminar permanentemente un servicio? → A: Solo los servicios en estado **borrador** pueden eliminarse permanentemente; los servicios publicados únicamente pueden despublicarse (volver a borrador).
- Q: ¿Se requiere moderación del contenido de las imágenes subidas? → A: No; el freelancer es responsable del contenido que sube. Las imágenes se publican de inmediato sin revisión previa. La gestión de reportes de contenido inapropiado queda fuera del alcance de esta feature.
- Q: ¿Qué ocurre cuando el servicio externo de almacenamiento no está disponible durante una subida? → A: La subida de la imagen falla con un mensaje de error claro; el freelancer puede guardar el resto del servicio sin esa imagen y reintentar la subida más tarde de forma independiente.
- Q: ¿Cómo se organiza la pantalla "Mis Servicios" entre borradores y publicados? → A: Dos secciones o pestañas separadas: una para servicios publicados y otra para borradores. Ambas muestran estado e indicadores de acción disponibles para cada servicio.
- Q: ¿Existe un límite en la cantidad de servicios que un freelancer puede tener? → A: No existe límite en este alcance. La lista de servicios propios DEBE soportar paginación para gestionar volúmenes elevados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un Servicio y Publicarlo (Priority: P1)

Un freelancer autenticado crea un nuevo servicio desde cero: ingresa un nombre,
una descripción, selecciona una categoría, define al menos un paquete de
contratación con alcance, precio y plazo de entrega, sube al menos una imagen y
lo publica. El sistema valida que todos los campos obligatorios estén completos
antes de permitir la publicación.

**Why this priority**: Sin la capacidad de crear y publicar servicios, la
plataforma no tiene catálogo ni propuesta de valor para compradores ni
freelancers. Es el flujo más crítico del sistema.

**Independent Test**: Se puede testear creando un servicio completo como
freelancer autenticado y verificando que aparece visible en el catálogo público
inmediatamente después de publicarlo.

**Acceptance Scenarios**:

1. **Given** un freelancer autenticado en la pantalla de "Mis Servicios",
   **When** completa nombre (≤ 80 caracteres), descripción (≤ 1200 caracteres),
   categoría, un paquete con nombre, alcance, precio > 0 y plazo > 0 días, y al
   menos una imagen, y hace clic en "Publicar",
   **Then** el servicio queda en estado **publicado** y es visible en el catálogo
   público.

2. **Given** un freelancer autenticado con un formulario de servicio incompleto
   (sin paquete de contratación),
   **When** hace clic en "Publicar",
   **Then** el sistema muestra un mensaje de error indicando los campos
   obligatorios faltantes y NO publica el servicio.

3. **Given** un freelancer autenticado,
   **When** guarda el servicio sin completar todos los campos obligatorios,
   **Then** el servicio se guarda como **borrador** (no visible en el catálogo
   público) y puede retomarlo más tarde.

---

### User Story 2 - Editar un Servicio Existente (Priority: P2)

Un freelancer autenticado accede a uno de sus servicios (en borrador o publicado)
y modifica cualquier campo: nombre, descripción, categoría, paquetes de
contratación o imágenes. Los cambios se guardan y, si el servicio está publicado,
el catálogo refleja la versión actualizada.

**Why this priority**: Los freelancers necesitan mantener sus servicios actualizados
(precios, alcance, disponibilidad). Sin edición, el catálogo se vuelve obsoleto
rápidamente.

**Independent Test**: Se puede testear modificando el nombre de un servicio
existente y verificando que el cambio se refleja en la vista de detalle del
catálogo.

**Acceptance Scenarios**:

1. **Given** un freelancer autenticado viendo su servicio publicado,
   **When** modifica el precio de uno de sus paquetes y guarda,
   **Then** el precio actualizado se muestra en el catálogo público de inmediato.

2. **Given** un freelancer autenticado,
   **When** intenta acceder a la pantalla de edición de un servicio que no le
   pertenece (via URL directa),
   **Then** el sistema rechaza la solicitud y muestra un error de acceso
   denegado.

3. **Given** un freelancer autenticado editando un servicio publicado,
   **When** elimina el único paquete de contratación y guarda,
   **Then** el servicio pasa automáticamente a estado **borrador** (se despublica)
   ya que ya no cumple los requisitos mínimos de publicación.

---

### User Story 3 - Gestionar Multimedia del Servicio (Priority: P3)

Un freelancer autenticado agrega, reordena y elimina imágenes en un servicio
propio. El sistema limita la cantidad de imágenes por servicio y valida el
formato y tamaño de los archivos antes de aceptarlos.

**Why this priority**: La multimedia mejora la conversión de compradores, pero la
plataforma entrega valor básico sin ella. Es una mejora sobre el MVP mínimo.

**Independent Test**: Se puede testear subiendo 3 imágenes a un servicio existente
y verificando que aparecen en la galería de la vista de detalle del catálogo.

**Acceptance Scenarios**:

1. **Given** un freelancer autenticado en la sección de multimedia de su servicio,
   **When** sube una imagen en formato JPG, PNG o WebP de menos de 5 MB,
   **Then** la imagen se agrega a la galería del servicio y es visible en el
   detalle del catálogo.

2. **Given** un freelancer autenticado con 5 imágenes ya cargadas en su servicio,
   **When** intenta subir una sexta imagen,
   **Then** el sistema rechaza la subida e informa que se alcanzó el límite
   máximo de imágenes por servicio.

3. **Given** un freelancer autenticado,
   **When** sube un archivo que no es imagen (por ejemplo, un PDF),
   **Then** el sistema rechaza el archivo e informa el formato permitido.

---

### Edge Cases

- ¿Qué ocurre si un freelancer publica un servicio y luego su cuenta es
  suspendida? El servicio debe ocultarse del catálogo automáticamente.
- ¿Qué ocurre si se sube una imagen y el servicio de almacenamiento no está
  disponible? El sistema muestra un error claro en la sección de imágenes; el
  resto del servicio (campos de texto, paquetes) se puede guardar normalmente.
  El freelancer puede reintentar la subida de forma independiente, sin riesgo de
  duplicar la imagen.
- ¿Qué pasa si dos sesiones del mismo freelancer editan el mismo servicio
  simultáneamente? La última escritura persiste (last-write-wins); no se requiere
  edición colaborativa en tiempo real para este alcance.
- ¿Puede un freelancer tener más de un servicio? Sí, sin límite en este alcance.
  La pantalla "Mis Servicios" DEBE soportar paginación para volúmenes elevados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir a un freelancer autenticado crear un nuevo
  servicio ingresando nombre (max 80 caracteres), descripción (max 1200 caracteres)
  y seleccionando una categoría de una lista predefinida.
- **FR-002**: El sistema DEBE permitir guardar un servicio incompleto como borrador
  sin requerir todos los campos obligatorios.
- **FR-003**: Un servicio solo DEBE poder publicarse cuando tiene: nombre,
  descripción, categoría y al menos un paquete de contratación con nombre, alcance,
  precio mayor a cero y plazo de entrega mayor a cero días.
- **FR-004**: El sistema DEBE permitir al freelancer definir entre 1 y 3 paquetes
  de contratación por servicio, cada uno con: nombre del paquete (max 50 caracteres),
  alcance/descripción (max 500 caracteres), precio (número positivo) y plazo de
  entrega en días (número entero positivo).
- **FR-005**: El sistema DEBE permitir al freelancer subir hasta 5 imágenes por
  servicio en formatos JPG, PNG o WebP, con un tamaño máximo de 5 MB por imagen.
- **FR-006**: El sistema DEBE permitir al freelancer editar cualquier campo de un
  servicio propio en cualquier momento, independientemente de su estado.
- **FR-007**: El sistema DEBE permitir al freelancer despublicar un servicio
  publicado, volviendo su estado a borrador.
- **FR-008**: El sistema DEBE rechazar cualquier intento de editar, publicar o
  despublicar un servicio que no pertenezca al freelancer autenticado, respondiendo
  con acceso denegado.
- **FR-009**: El sistema DEBE mostrar al freelancer sus servicios organizados en
  dos secciones separadas: **Publicados** (servicios visibles en el catálogo) y
  **Borradores** (servicios incompletos o despublicados). Cada ítem DEBE mostrar
  el nombre del servicio y las acciones disponibles según su estado (editar,
  publicar, despublicar, eliminar).
- **FR-010**: Cuando un servicio publicado es modificado de tal forma que ya no
  cumple los requisitos mínimos (por ejemplo, se elimina el último paquete), el
  sistema DEBE despublicarlo automáticamente y notificar al freelancer.
- **FR-011**: El sistema DEBE permitir al freelancer eliminar permanentemente un
  servicio propio que esté en estado **borrador**. El sistema DEBE rechazar
  cualquier intento de eliminar un servicio en estado **publicado**; para ello,
  el freelancer primero debe despublicarlo.

### Key Entities *(include if feature involves data)*

- **Servicio**: representa la oferta de trabajo del freelancer. Atributos clave:
  nombre, descripción, categoría, estado (borrador / publicado), propietario
  (freelancer). Es la entidad central de esta feature. Los servicios en estado
  borrador pueden ser eliminados permanentemente; los publicados solo pueden
  despublicarse.
- **Paquete de Contratación**: opción de compra asociada a un servicio. Atributos:
  nombre, alcance, precio, plazo de entrega en días. Un servicio tiene entre 1 y 3
  paquetes. Un paquete no existe sin su servicio.
- **Imagen del Servicio**: archivo multimedia asociado a un servicio. Atributos:
  URL de almacenamiento, orden de aparición. Un servicio tiene hasta 5 imágenes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un freelancer puede completar el flujo de creación y publicación de
  un servicio en menos de 5 minutos desde que inicia el formulario.
- **SC-002**: El 95% de los intentos de subida de imágenes válidas (formato y
  tamaño correctos) se completa de forma exitosa sin errores inesperados.
- **SC-003**: Los cambios realizados a un servicio publicado son visibles en el
  catálogo en menos de 10 segundos luego de guardar.
- **SC-004**: El 100% de los intentos de acceder o modificar servicios ajenos es
  rechazado por el sistema sin filtración de información del servicio protegido.
- **SC-005**: Los mensajes de validación permiten al freelancer identificar y
  corregir campos inválidos sin asistencia externa, medido por tasa de éxito en
  segunda intención ≥ 90%.

## Assumptions

- Los freelancers ya están autenticados y tienen el rol "freelancer" asignado al
  usar esta feature; el flujo de registro y autenticación es una feature separada.
- La lista de categorías disponibles es predefinida y gestionada por el
  administrador de la plataforma; no forma parte del alcance de esta feature.
- El almacenamiento de imágenes se delega a un servicio externo; la plataforma
  solo guarda la URL resultante (según Principio de Stack de la constitución).
  Si el servicio externo no está disponible, la subida de imagen falla de forma
  aislada sin bloquear el guardado del resto del servicio.
- Videos no están incluidos en este alcance; "multimedia" se interpreta como
  imágenes únicamente para el MVP.
- No se requiere previsualización en tiempo real del servicio mientras se edita;
  es suficiente con una vista de detalle luego de guardar.
- Los precios se expresan en una única moneda (definida globalmente en la
  plataforma); el manejo de múltiples monedas o conversiones está fuera de scope.
- La edición de un servicio publicado no requiere un flujo de aprobación;
  los cambios se aplican de inmediato.
- No se aplica moderación de contenido a las imágenes; el sistema solo valida
  formato y tamaño. El freelancer es responsable del contenido subido. Los
  mecanismos de reporte de contenido inapropiado son una feature separada y
  fuera del alcance del MVP.

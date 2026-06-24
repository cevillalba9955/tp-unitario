# Feature Specification: Carga de Datos de Paquete de Contratación

**Feature Branch**: `002-hire-package-form`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "carga de datos de paquete de contratacion. hacer con modal y validar campos antes de cerrar y guardar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agregar paquete a un servicio (Priority: P1)

El freelancer, mientras crea o edita un servicio, desea agregar un paquete de contratación.
Pulsa el botón "Agregar paquete", se abre un modal con un formulario vacío.
Completa todos los campos requeridos y confirma. El paquete queda registrado en el servicio.

**Why this priority**: Sin al menos un paquete el servicio no puede publicarse (Principio III de la Constitución). Es la funcionalidad central de esta feature.

**Independent Test**: Puede probarse de forma aislada abriendo el modal de creación de paquete, llenando los campos válidos y verificando que el paquete aparece listado en el servicio.

**Acceptance Scenarios**:

1. **Given** el freelancer está en la pantalla de creación/edición de servicio, **When** pulsa "Agregar paquete", **Then** se abre un modal con el formulario de paquete vacío.
2. **Given** el modal está abierto con todos los campos válidos, **When** el freelancer pulsa "Guardar", **Then** el modal se cierra y el paquete aparece en la lista del servicio.
3. **Given** el modal está abierto con campos incompletos o inválidos, **When** el freelancer pulsa "Guardar", **Then** el modal NO se cierra y se muestran mensajes de error junto a cada campo inválido.

---

### User Story 2 - Cancelar sin guardar (Priority: P2)

El freelancer abre el modal de paquete, comienza a completar datos y decide no continuar.
Pulsa "Cancelar" o el botón de cierre del modal. El modal se cierra sin guardar cambios.

**Why this priority**: Brindar control al usuario para descartar cambios es esencial para la experiencia de formularios modales.

**Independent Test**: Abrir el modal, ingresar datos en algún campo, pulsar "Cancelar" y verificar que no se agrega ningún paquete a la lista del servicio.

**Acceptance Scenarios**:

1. **Given** el modal tiene datos ingresados a medias, **When** el freelancer pulsa "Cancelar", **Then** el modal se cierra y la lista de paquetes no cambia.
2. **Given** el modal está vacío, **When** el freelancer pulsa "Cancelar", **Then** el modal se cierra sin efecto.

---

### User Story 3 - Editar paquete existente (Priority: P3)

El freelancer desea modificar los datos de un paquete ya creado.
Pulsa el ícono de edición del paquete. Se abre el mismo modal con los datos precargados.
Modifica los valores, valida y guarda. El paquete actualizado reemplaza al anterior.

**Why this priority**: Aumenta la utilidad del formulario pero no bloquea el MVP; el freelancer puede borrar y volver a crear como alternativa.

**Independent Test**: Con al menos un paquete existente, abrir el modal en modo edición, cambiar un campo y guardar; verificar que el paquete muestra los nuevos valores.

**Acceptance Scenarios**:

1. **Given** el servicio tiene un paquete existente, **When** el freelancer pulsa editar sobre ese paquete, **Then** el modal se abre con los datos del paquete precargados.
2. **Given** el modal de edición tiene campos válidos modificados, **When** el freelancer pulsa "Guardar", **Then** el paquete existente se actualiza con los nuevos valores.
3. **Given** el modal de edición tiene un campo inválido, **When** el freelancer pulsa "Guardar", **Then** el modal no se cierra y se indica el error.

---

### Edge Cases

- ¿Qué ocurre si el freelancer intenta guardar con el campo de precio igual a 0 o negativo?
- ¿Qué sucede si el plazo de entrega se ingresa como 0 días?
- ¿Cómo reacciona el modal ante múltiples pulsaciones rápidas del botón "Guardar"?
- ¿Puede el freelancer agregar más paquetes de los que razonablemente tendría un servicio (p. ej., más de 10)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un modal al pulsar "Agregar paquete" o "Editar paquete" desde la pantalla de servicio del freelancer.
- **FR-002**: El modal DEBE contener campos para: nombre del paquete, descripción, precio y plazo de entrega.
- **FR-003**: El sistema DEBE validar todos los campos del modal antes de permitir el cierre exitoso ("Guardar").
- **FR-004**: El nombre del paquete es obligatorio y no puede estar vacío ni contener solo espacios.
- **FR-005**: La descripción del paquete es obligatoria y no puede estar vacía.
- **FR-006**: El precio del paquete es obligatorio, debe ser un valor numérico mayor a cero.
- **FR-007**: El plazo de entrega es obligatorio, debe ser un número entero positivo (días).
- **FR-008**: Si algún campo es inválido al intentar guardar, el sistema DEBE mostrar un mensaje de error descriptivo junto al campo correspondiente y NO cerrar el modal.
- **FR-009**: Al guardar exitosamente, el modal se cierra y el paquete se agrega (o actualiza) en la lista de paquetes del servicio.
- **FR-010**: Al pulsar "Cancelar" (o el botón de cierre), el modal se cierra sin persistir cambios, independientemente del estado de los campos.
- **FR-011**: En modo edición, el modal DEBE cargar los datos actuales del paquete en los campos correspondientes.
- **FR-012**: La validación del cliente DEBE ser consistente con las reglas de negocio del servidor (precio > 0, plazo > 0, campos no vacíos).

### Key Entities

- **Paquete de contratación**: Opción que el comprador puede contratar dentro de un servicio. Atributos: nombre, descripción, precio (numérico, > 0), plazo de entrega en días (entero, > 0).
- **Servicio**: Entidad que contiene uno o más paquetes. Un servicio sin paquetes no es publicable.
- **Modal de paquete**: Interfaz de entrada de datos que bloquea la pantalla subyacente hasta su cierre, con validación previa al guardado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El freelancer puede agregar un paquete válido en menos de 60 segundos desde que abre el modal.
- **SC-002**: El 100% de los intentos de guardar con datos inválidos resultan en mensajes de error visibles sin cerrar el modal.
- **SC-003**: El 100% de los intentos de guardar con datos válidos resultan en el cierre del modal y el paquete visible en la lista del servicio.
- **SC-004**: Al cancelar, el estado de la lista de paquetes es idéntico al estado anterior a abrir el modal en el 100% de los casos.
- **SC-005**: En modo edición, el 100% de los campos del modal reflejan los valores actuales del paquete al abrirse.

## Assumptions

- El modal de paquete se usa dentro del flujo de creación/edición de servicios del freelancer (feature 001-freelancer-services).
- La validación del cliente es complementaria; la validación definitiva ocurre en el servidor (Principio III).
- El precio se expresa como número entero o decimal sin símbolo de moneda; la moneda es fija para el proyecto.
- El plazo de entrega se expresa siempre en días naturales.
- Un servicio puede tener múltiples paquetes; no hay un máximo impuesto por esta feature.
- No se requiere confirmación adicional al cancelar (no se muestra un segundo diálogo "¿Seguro que deseas cancelar?").
- El modal no requiere soporte para imágenes ni archivos adjuntos en esta versión.

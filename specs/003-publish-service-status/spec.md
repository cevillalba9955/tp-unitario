# Feature Specification: Publicación de Servicio con Gestión de Estado

**Feature Branch**: `003-publish-service-status`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "al intentar publicar un servicio nuevo. si falla muestra el error y lo guarda como borrador. deberia cambiar el estado del servicio"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar un servicio exitosamente (Priority: P1)

El freelancer completa la creación de un servicio con todos los campos requeridos y
pulsa "Guardar y publicar". El sistema valida los datos, publica el servicio y cambia
su estado a **Publicado**. El freelancer regresa a su lista de servicios y ve el
servicio con el nuevo estado.

**Why this priority**: Es el camino feliz principal: sin publicación exitosa el
catálogo no tiene contenido y la plataforma no aporta valor (Principio II).

**Independent Test**: Crear un servicio con título, descripción, categoría y al menos
un paquete válido. Pulsar "Guardar y publicar". Verificar que el servicio aparece en
la lista del freelancer con estado "Publicado" y que es visible en el catálogo público.

**Acceptance Scenarios**:

1. **Given** el freelancer tiene un servicio con todos los campos requeridos, **When** pulsa "Guardar y publicar", **Then** el servicio se guarda, su estado cambia a "Publicado" y el freelancer es redirigido a su lista de servicios.
2. **Given** el servicio fue publicado exitosamente, **When** el freelancer ve su lista de servicios, **Then** el servicio figura con estado "Publicado" (diferenciado visualmente del estado "Borrador").

---

### User Story 2 - Publicación fallida: guardar como borrador y mostrar error (Priority: P2)

El freelancer intenta publicar un servicio que no cumple con los requisitos mínimos
(por ejemplo, le falta categoría o no tiene paquetes). El sistema rechaza la
publicación, muestra un mensaje de error descriptivo indicando qué campos faltan,
y guarda el servicio como **Borrador** para que el freelancer pueda corregirlo.

**Why this priority**: Sin este flujo, un error de publicación pierde el trabajo del
usuario. El guardado automático como borrador es la salvaguarda crítica (Principio III
exige datos completos antes de publicar; el borrador protege el trabajo parcial).

**Independent Test**: Intentar publicar un servicio sin categoría o sin paquetes.
Verificar que el sistema muestra un mensaje indicando los campos faltantes, el
servicio queda guardado con estado "Borrador", y el freelancer permanece en la
pantalla de edición con los datos intactos.

**Acceptance Scenarios**:

1. **Given** el freelancer intenta publicar un servicio sin los campos mínimos, **When** el servidor rechaza la publicación, **Then** se muestra un mensaje de error que lista los campos faltantes y el servicio se guarda automáticamente como borrador.
2. **Given** la publicación falló y el servicio fue guardado como borrador, **When** el freelancer ve su lista de servicios, **Then** el servicio figura con estado "Borrador".
3. **Given** la publicación falló, **When** el freelancer completa los campos faltantes y vuelve a intentar publicar, **Then** la publicación se completa exitosamente y el estado cambia a "Publicado".

---

### User Story 3 - Publicar un servicio en estado Borrador existente (Priority: P3)

El freelancer tiene un servicio guardado previamente como borrador. Desde su lista de
servicios o desde la pantalla de edición, acciona para publicarlo. El flujo de
validación y cambio de estado aplica igual que en US1 y US2.

**Why this priority**: Complementa el ciclo de vida del servicio. Un borrador sin
opción de publicar directo queda atrapado; esta historia cierra el flujo (Principio V:
incremento aditivo sobre US1/US2).

**Independent Test**: Con un servicio existente en estado "Borrador" con datos
completos, pulsar "Publicar" desde la lista o pantalla de edición. Verificar que el
estado cambia a "Publicado".

**Acceptance Scenarios**:

1. **Given** el freelancer tiene un servicio en estado "Borrador" con datos completos, **When** acciona "Publicar", **Then** el estado del servicio cambia a "Publicado" y el servicio es visible en el catálogo.
2. **Given** el freelancer intenta publicar un borrador con datos incompletos, **When** el servidor rechaza la publicación, **Then** el servicio permanece en "Borrador" y se muestra el error descriptivo.

---

### Edge Cases

- ¿Qué ocurre si la conexión se pierde durante el intento de publicación antes de recibir respuesta? El servicio debe quedar en el estado previo (borrador o sin guardar), sin quedar en un estado indefinido.
- ¿Qué pasa si el servicio ya está publicado y se vuelve a intentar publicar? No debe duplicar ni romper el estado actual.
- ¿Qué ocurre si el guardado automático como borrador también falla? Se debe mostrar un mensaje de error diferenciado para que el usuario sepa que su trabajo no fue guardado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir al freelancer intentar publicar un servicio desde la pantalla de creación o edición, mediante una acción explícita ("Guardar y publicar" o "Publicar").
- **FR-002**: Al publicar exitosamente, el sistema DEBE cambiar el estado del servicio de "Borrador" a "Publicado".
- **FR-003**: Un servicio en estado "Publicado" DEBE ser visible en el catálogo público.
- **FR-004**: Si la publicación es rechazada por datos incompletos o inválidos, el sistema DEBE guardar el servicio en estado "Borrador" automáticamente antes de mostrar el error.
- **FR-005**: El mensaje de error de publicación fallida DEBE indicar específicamente cuáles campos están incompletos o son inválidos, para que el freelancer sepa qué corregir.
- **FR-006**: Tras una publicación fallida, el freelancer DEBE permanecer en la pantalla actual con sus datos intactos (sin pérdida de información ingresada).
- **FR-007**: El estado del servicio ("Borrador" o "Publicado") DEBE ser visible de forma diferenciada en la lista de servicios del freelancer.
- **FR-008**: El sistema DEBE validar los requisitos mínimos de publicación en el servidor (título, descripción, categoría y al menos un paquete con precio y plazo válidos) antes de cambiar el estado.
- **FR-009**: Si el guardado automático como borrador también falla, el sistema DEBE mostrar un mensaje de error diferenciado indicando que el servicio no pudo guardarse.
- **FR-010**: Un servicio previamente guardado como borrador DEBE poder publicarse desde la lista de servicios o desde la pantalla de edición, sin necesidad de recrearlo.

### Key Entities

- **Servicio**: Tiene un estado (`borrador` / `publicado`) que cambia según el resultado del intento de publicación. Un servicio en borrador no es visible en el catálogo público.
- **Estado del servicio**: Valor discreto con dos estados posibles: `borrador` (invisible en catálogo) y `publicado` (visible en catálogo). El estado solo cambia hacia "publicado" si el servidor aprueba la publicación.
- **Error de publicación**: Resultado del servidor al rechazar la publicación; contiene la lista de campos faltantes o inválidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los intentos de publicación exitosos resultan en el estado del servicio cambiando a "Publicado" y el servicio visible en el catálogo.
- **SC-002**: El 100% de los intentos de publicación fallidos resultan en el servicio guardado como "Borrador" y el mensaje de error visible al freelancer con los campos faltantes identificados.
- **SC-003**: Tras una publicación fallida, el 100% de los datos ingresados por el freelancer permanecen disponibles en la pantalla sin necesidad de reingresarlos.
- **SC-004**: El freelancer puede identificar el estado de cada servicio en su lista en menos de 3 segundos (diferenciación visual clara entre "Borrador" y "Publicado").
- **SC-005**: El freelancer puede pasar de un error de publicación a una publicación exitosa corrigiendo solo los campos indicados en el mensaje de error, sin pasos adicionales.

## Assumptions

- El flujo aplica a servicios nuevos (creados en el momento) y a servicios existentes en estado borrador.
- Los requisitos mínimos de publicación son los ya definidos en la plataforma: título, descripción, categoría y al menos un paquete con precio > 0 y plazo > 0 días.
- El guardado automático como borrador en caso de fallo utiliza el mismo mecanismo de guardado de borradores ya existente en la plataforma.
- No se requiere confirmación adicional del usuario para el guardado automático como borrador en caso de fallo; ocurre de forma transparente.
- El catálogo público solo muestra servicios en estado "Publicado"; los borradores son privados al freelancer propietario.
- No se contempla un tercer estado (ej. "en revisión" o "suspendido") en el alcance de esta feature.

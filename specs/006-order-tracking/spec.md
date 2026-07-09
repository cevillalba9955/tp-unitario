# Feature Specification: Contratación y Seguimiento de Pedidos

**Feature Branch**: `006-order-tracking`

**Created**: 2026-07-08

**Input**: User description: "cliente contrata servicio. Una vez contratado un servicio, el sistema permitirá realizar un seguimiento del trabajo a lo largo de su progreso. Los pedidos atravesarán distintas etapas que reflejan el avance del servicio, permitiendo tanto al comprador como al freelancer conocer el estado actual del trabajo y realizar las acciones correspondientes en cada momento."

**Status**: Draft

## Clarifications

### Session 2026-07-08

- Q: ¿Cuál es el ciclo de vida canónico del pedido y quién dispara cada transición? → A: Etapas **Pendiente → Confirmado → EnRevisión → Entregado**, con **Cancelado** como etapa final alternativa. Transiciones: el freelancer acepta (Pendiente→Confirmado); el freelancer entrega el trabajo para revisión (Confirmado→EnRevisión); el comprador acepta la entrega (EnRevisión→Entregado, estado final exitoso).
- Q: En "EnRevisión", ¿el comprador puede rechazar la entrega o sólo aceptarla? → A: Puede aceptar (→ "Entregado") o rechazar/solicitar cambios (→ vuelve a "Confirmado"); el freelancer re-entrega. Loop de revisión sin límite de iteraciones.
- Q: ¿Cuál es la política de cancelación (quién y desde qué etapas)? → A: El comprador (cliente) puede cancelar el pedido en cualquier etapa no final —"Pendiente", "Confirmado" o "EnRevisión"— excepto "Entregado". El freelancer sólo puede rechazar un pedido en "Pendiente".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Contratar un servicio (Priority: P1)

El comprador, desde el detalle de un servicio publicado, elige uno de los paquetes de
contratación y confirma la contratación. El sistema registra un **pedido** asociado a ese
comprador, ese freelancer y ese paquete, en su etapa inicial. A partir de ese momento el
pedido existe y es visible tanto para el comprador como para el freelancer.

**Why this priority**: Es la conversión del catálogo (Principio II) en un compromiso real
de trabajo. Sin la creación del pedido no hay nada que seguir; es la base de toda la feature
y el primer punto donde el valor de la plataforma se materializa.

**Independent Test**: Como comprador autenticado, abrir el detalle de un servicio publicado,
seleccionar un paquete, confirmar la contratación y verificar que se crea un pedido en la
etapa inicial ("Pendiente"), visible en la lista de pedidos del comprador.

**Acceptance Scenarios**:

1. **Given** el comprador autenticado está en el detalle de un servicio publicado con al menos un paquete, **When** selecciona un paquete y confirma la contratación, **Then** el sistema crea un pedido en etapa "Pendiente" con los datos del paquete (nombre, precio, plazo) y lo muestra en la lista de pedidos del comprador.
2. **Given** un usuario no autenticado en el detalle de un servicio, **When** intenta contratar un paquete, **Then** el sistema le exige iniciar sesión antes de completar la contratación.
3. **Given** el freelancer dueño del servicio, **When** intenta contratar un paquete de su propio servicio, **Then** el sistema rechaza la operación e informa que no puede contratar sus propios servicios.
4. **Given** un servicio que fue despublicado, **When** el comprador intenta contratar uno de sus paquetes, **Then** el sistema rechaza la contratación e informa que el servicio ya no está disponible.

---

### User Story 2 - Avanzar el pedido por sus etapas (Priority: P2)

El freelancer ve los pedidos entrantes de sus servicios y, según la etapa actual del pedido,
ejecuta la acción correspondiente: aceptar o rechazar un pedido pendiente, y entregar el
trabajo de un pedido confirmado para que quede a revisión del comprador. Cada acción hace
avanzar el pedido a la siguiente etapa y queda registrada en su historial.

**Why this priority**: El seguimiento sólo tiene sentido si las etapas avanzan. Este es el
motor del ciclo de vida del pedido y habilita al freelancer a gestionar su trabajo, pero
depende de que primero exista un pedido (US1).

**Independent Test**: Con un pedido en etapa "Pendiente", iniciar sesión como el freelancer
dueño del servicio, aceptarlo y verificar que pasa a "Confirmado"; luego entregar el trabajo
y verificar que pasa a "EnRevisión", con cada transición reflejada en el historial.

**Acceptance Scenarios**:

1. **Given** un pedido en etapa "Pendiente", **When** el freelancer dueño lo acepta, **Then** el pedido pasa a "Confirmado" y se registra la transición con fecha y actor.
2. **Given** un pedido en etapa "Pendiente", **When** el freelancer dueño lo rechaza, **Then** el pedido pasa a "Cancelado" y no admite más transiciones.
3. **Given** un pedido en etapa "Confirmado", **When** el freelancer dueño entrega el trabajo, **Then** el pedido pasa a "EnRevisión" (a revisión del comprador).
4. **Given** un pedido de un servicio ajeno, **When** un freelancer que no es su dueño intenta avanzarlo, **Then** el sistema rechaza la acción con un error de autorización.
5. **Given** un pedido en etapa "Entregado" o "Cancelado", **When** cualquier actor intenta avanzarlo, **Then** el sistema rechaza la acción por tratarse de una etapa final.

---

### User Story 3 - Seguimiento y confirmación por parte del comprador (Priority: P3)

El comprador consulta el estado actual de cada uno de sus pedidos y su historial de etapas.
Cuando el freelancer entrega el trabajo y el pedido queda "EnRevisión", el comprador revisa
y, o bien acepta la entrega para dar el pedido por entregado (estado final), o bien la rechaza
/ solicita cambios y el pedido vuelve a "Confirmado" para que el freelancer re-entregue.
Mientras el pedido está "Pendiente", "Confirmado" o "EnRevisión" —es decir, en cualquier etapa salvo "Entregado"—,
el comprador puede cancelarlo.

**Why this priority**: Cierra el ciclo del pedido desde la perspectiva del comprador y le da
visibilidad y control, pero no bloquea la operación básica de contratar (US1) ni la gestión
del freelancer (US2).

**Independent Test**: Como comprador con un pedido en etapa "EnRevisión", ver el estado y el
historial del pedido, aceptar la entrega y verificar que pasa a "Entregado"; con otro pedido
en "Pendiente", cancelarlo y verificar que pasa a "Cancelado".

**Acceptance Scenarios**:

1. **Given** el comprador tiene pedidos en distintas etapas, **When** abre su lista de pedidos, **Then** ve para cada uno el servicio, el paquete contratado y la etapa actual.
2. **Given** el comprador abre el detalle de un pedido, **When** consulta su historial, **Then** ve la secuencia de etapas por las que pasó con fecha de cada transición.
3. **Given** un pedido en etapa "EnRevisión", **When** el comprador acepta la entrega, **Then** el pedido pasa a "Entregado" y no admite más transiciones.
4. **Given** un pedido en etapa "Pendiente", "Confirmado" o "EnRevisión", **When** el comprador lo cancela, **Then** el pedido pasa a "Cancelado".
5. **Given** un pedido en etapa "Entregado", **When** el comprador intenta cancelarlo, **Then** el sistema rechaza la acción por tratarse de una etapa final.
6. **Given** un pedido en etapa "EnRevisión", **When** el comprador rechaza la entrega o solicita cambios, **Then** el pedido vuelve a "Confirmado" y el freelancer puede volver a entregar.

---

### Edge Cases

- ¿Qué ocurre si el comprador confirma una contratación dos veces (doble toque)? El sistema debe crear un único pedido, no duplicados.
- ¿Qué pasa si el freelancer intenta aceptar un pedido que el comprador acaba de cancelar? La acción se rechaza porque el pedido ya está en una etapa final.
- ¿Qué sucede si un paquete o servicio se modifica o elimina después de contratado? El pedido conserva los datos del paquete tal como estaban al momento de contratar (título del servicio, nombre del paquete, precio y plazo).
- ¿Cómo se comporta la lista de pedidos cuando el comprador o el freelancer aún no tiene ninguno? Se muestra un mensaje informativo de lista vacía.
- ¿Qué se muestra si falla la carga de la lista o del detalle de pedidos? Un mensaje de error con opción de reintentar.
- ¿Puede un comprador contratar el mismo paquete del mismo servicio más de una vez? Sí; cada contratación genera un pedido independiente.
- ¿Cuántas veces puede un pedido ir de "EnRevisión" a "Confirmado" y volver? Sin límite: el comprador puede solicitar cambios tantas veces como necesite hasta aceptar la entrega o cancelar el pedido (el comprador puede cancelar en cualquier etapa salvo "Entregado").

## Requirements *(mandatory)*

### Functional Requirements

#### Contratación (US1)

- **FR-001**: El sistema DEBE permitir a un comprador autenticado contratar un paquete de un servicio publicado, creando un pedido asociado al comprador, al freelancer dueño del servicio y al paquete elegido.
- **FR-002**: La contratación DEBE requerir autenticación (acción de escritura, Principio IV); un usuario no autenticado DEBE ser dirigido a iniciar sesión antes de completar la contratación.
- **FR-003**: El sistema DEBE impedir que un freelancer contrate un paquete de un servicio del que él mismo es dueño, rechazando la operación con un error de autorización.
- **FR-004**: El sistema DEBE impedir la contratación de un paquete perteneciente a un servicio que no está en estado "Publicado".
- **FR-005**: Al crear el pedido, el sistema DEBE capturar una copia de los datos del paquete al momento de contratar (título del servicio, nombre del paquete, precio y plazo de entrega), de modo que cambios posteriores en el servicio o el paquete no alteren el pedido.
- **FR-006**: Todo pedido recién creado DEBE iniciar en la etapa "Pendiente".

#### Ciclo de vida y etapas (US2, US3)

- **FR-007**: El sistema DEBE modelar el avance del pedido a través de un conjunto ordenado de etapas: **Pendiente → Confirmado → EnRevisión → Entregado**, con **Cancelado** como etapa final alternativa. Desde "EnRevisión" el pedido puede volver a "Confirmado" si el comprador rechaza la entrega (loop de revisión), sin límite de iteraciones.
- **FR-008**: El sistema DEBE permitir únicamente las transiciones de etapa válidas y rechazar cualquier transición no contemplada por el ciclo de vida.
- **FR-009**: El freelancer dueño del servicio DEBE poder, sobre un pedido en "Pendiente", aceptarlo (pasa a "Confirmado") o rechazarlo (pasa a "Cancelado").
- **FR-010**: El freelancer dueño del servicio DEBE poder entregar el trabajo de un pedido en "Confirmado", que pasa a "EnRevisión" (queda a revisión del comprador).
- **FR-011**: El comprador dueño del pedido DEBE poder, sobre un pedido en "EnRevisión": (a) aceptar la entrega (pasa a "Entregado", estado final exitoso), o (b) rechazar la entrega / solicitar cambios (vuelve a "Confirmado"), habilitando al freelancer a entregar nuevamente. El loop de revisión no tiene límite de iteraciones.
- **FR-012**: El comprador dueño del pedido DEBE poder cancelar el pedido (pasa a "Cancelado") en cualquier etapa no final —es decir, en "Pendiente", "Confirmado" o "EnRevisión"—; NO DEBE poder cancelar un pedido que ya esté en "Entregado" (ni en "Cancelado").
- **FR-013**: Las etapas "Entregado" y "Cancelado" son finales; el sistema NO DEBE permitir ninguna transición a partir de ellas.
- **FR-014**: El sistema DEBE registrar el historial de transiciones de cada pedido, incluyendo la etapa origen, la etapa destino, el actor que la realizó y la fecha/hora.

#### Autorización y visibilidad (transversal)

- **FR-015**: El sistema DEBE verificar en el servidor que sólo el comprador dueño del pedido o el freelancer dueño del servicio asociado puedan ejecutar acciones sobre el pedido; cualquier otro usuario DEBE ser rechazado con un error de autorización.
- **FR-016**: El sistema DEBE permitir a cada actor listar únicamente sus propios pedidos: el comprador ve los pedidos que contrató; el freelancer ve los pedidos de sus servicios.
- **FR-017**: Cada ítem de la lista de pedidos DEBE mostrar, como mínimo: el título del servicio, el nombre del paquete contratado y la etapa actual del pedido.
- **FR-018**: El comprador y el freelancer DEBEN ver siempre la misma etapa actual y el mismo historial para un pedido dado.
- **FR-019**: El sistema DEBE mostrar las acciones disponibles sobre un pedido en función de la etapa actual y del rol del usuario; una acción no aplicable a la etapa/rol NO DEBE ofrecerse.
- **FR-020**: El sistema DEBE mostrar un mensaje informativo cuando un actor no tenga pedidos, y un mensaje de error con opción de reintentar si falla la carga de pedidos.

### Key Entities

- **Pedido**: Representa la contratación de un paquete por parte de un comprador. Atributos: identificador, comprador, freelancer, referencia al servicio y al paquete, copia de los datos del paquete al contratar (título del servicio, nombre del paquete, precio, plazo), etapa actual, fecha de creación y de última actualización.
- **Etapa del pedido**: Valor del ciclo de vida que refleja el avance del trabajo (Pendiente, Confirmado, EnRevisión, Entregado, Cancelado). Determina qué acciones están disponibles y para qué rol.
- **Transición**: Registro histórico de un cambio de etapa. Atributos: etapa origen, etapa destino, actor que la ejecutó (rol e identidad), fecha/hora.
- **Servicio / Paquete**: Entidades preexistentes (features 001–005). El pedido las referencia y conserva una copia inmutable de los datos del paquete al momento de contratar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un comprador puede contratar un servicio (desde el detalle hasta el pedido creado) en menos de 60 segundos.
- **SC-002**: El 100% de los pedidos recién creados inician en la etapa "Pendiente".
- **SC-003**: El 100% de los intentos de ejecutar una transición no válida (para la etapa o el rol actual) son rechazados.
- **SC-004**: El 100% de los intentos de un freelancer de contratar su propio servicio son rechazados.
- **SC-005**: El 100% de los intentos de acción sobre un pedido por parte de un usuario que no es su comprador ni el freelancer dueño son rechazados con error de autorización.
- **SC-006**: Para todo pedido, el comprador y el freelancer ven la misma etapa actual en el 100% de los casos.
- **SC-007**: El 100% de las transiciones de etapa quedan reflejadas en el historial del pedido con actor y fecha.

## Assumptions

- Esta feature depende del catálogo y del detalle de servicios (features 003–005) y de la existencia de paquetes con precio y plazo (features 001–002).
- La contratación **no** incluye procesamiento de pagos ni cobros; es un compromiso de trabajo registrado en el sistema. La integración de pagos está fuera de alcance en esta versión.
- No se envían notificaciones push ni correos; los actores ven los cambios de etapa al abrir o refrescar su lista/detalle de pedidos.
- La persistencia es en memoria (Constitución): los pedidos no sobreviven al reinicio del contenedor.
- La autenticación y los roles (Comprador/Freelancer) ya existen (feature 004 y anteriores); un usuario con ambos roles opera cada rol por separado según el Principio I.
- El comprador puede contratar el mismo paquete varias veces; cada contratación es un pedido independiente.
- Sólo los pedidos propios son visibles para cada actor; no existe una vista administrativa global en esta versión.

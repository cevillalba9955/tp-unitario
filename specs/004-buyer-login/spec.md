# Feature Specification: Login de Comprador

**Feature Branch**: `004-buyer-login`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "login de cliente"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Iniciar sesión exitosamente (Priority: P1)

El comprador ingresa sus credenciales (email y contraseña) en la pantalla de login y
accede a la plataforma. Una vez autenticado, puede navegar el catálogo de servicios,
ver el detalle de cada servicio y realizar contrataciones.

**Why this priority**: Sin autenticación, el comprador no puede contratar ni guardar
favoritos. El login es la puerta de entrada a todas las funcionalidades del rol
Comprador; sin él la plataforma no aporta valor para este actor.

**Independent Test**: Ingresar email y contraseña válidos en la pantalla de login.
Verificar que el sistema redirige al catálogo de servicios y la sesión del comprador
queda activa.

**Acceptance Scenarios**:

1. **Given** el comprador tiene una cuenta registrada, **When** ingresa email y contraseña correctos y pulsa "Iniciar sesión", **Then** el sistema autentica al usuario y lo redirige al catálogo de servicios.
2. **Given** el comprador inició sesión, **When** navega a cualquier pantalla de la app, **Then** permanece autenticado sin necesidad de volver a ingresar credenciales.

---

### User Story 2 - Credenciales incorrectas (Priority: P2)

El comprador ingresa un email o contraseña incorrectos. El sistema le informa del
error de forma clara sin revelar cuál de los dos datos es incorrecto, y le permite
volver a intentarlo.

**Why this priority**: El manejo correcto de credenciales inválidas es crítico para
la seguridad y la experiencia del usuario. Sin este flujo, el comprador queda
bloqueado sin retroalimentación útil.

**Independent Test**: Ingresar un email o contraseña incorrectos. Verificar que el
sistema muestra un mensaje de error genérico y permanece en la pantalla de login con
los campos listos para reintentar.

**Acceptance Scenarios**:

1. **Given** el comprador ingresa credenciales incorrectas, **When** pulsa "Iniciar sesión", **Then** el sistema muestra un mensaje de error genérico (sin indicar si el email o la contraseña es lo incorrecto) y permanece en la pantalla de login.
2. **Given** el mensaje de error es visible, **When** el comprador corrige sus credenciales y vuelve a intentarlo, **Then** puede intentar el login nuevamente sin restricciones.

---

### User Story 3 - Campos vacíos o formato inválido (Priority: P3)

El comprador intenta iniciar sesión dejando campos vacíos o ingresando un email con
formato inválido. El sistema valida los campos antes de enviar la solicitud y muestra
mensajes de error específicos para cada campo.

**Why this priority**: La validación de campos mejora la experiencia y reduce
llamadas innecesarias al servidor. Complementa US1 y US2 como mejora de UX.

**Independent Test**: Pulsar "Iniciar sesión" con el campo de email vacío o con
formato inválido. Verificar que aparece un mensaje de validación específico sin
realizar una llamada al servidor.

**Acceptance Scenarios**:

1. **Given** el comprador no ingresó ningún dato, **When** pulsa "Iniciar sesión", **Then** el sistema muestra mensajes de validación indicando que email y contraseña son obligatorios.
2. **Given** el comprador ingresó un email con formato inválido (sin @), **When** pulsa "Iniciar sesión", **Then** el sistema muestra un mensaje indicando que el email no tiene formato válido.
3. **Given** el comprador ingresó email válido pero dejó la contraseña vacía, **When** pulsa "Iniciar sesión", **Then** el sistema indica que la contraseña es obligatoria.

---

### Edge Cases

- ¿Qué ocurre si el servidor no responde durante el intento de login? El sistema debe mostrar un mensaje de error de conexión y permitir reintentar sin perder los datos ingresados.
- ¿Qué pasa si el comprador ya está autenticado y navega a la pantalla de login? Debe ser redirigido automáticamente al catálogo sin mostrar el formulario.
- ¿Qué ocurre con espacios en blanco al inicio/fin del email ingresado? El sistema debe normalizar (trim) el valor antes de validar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir al comprador ingresar email y contraseña para iniciar sesión.
- **FR-002**: El sistema DEBE autenticar las credenciales contra el servidor y, si son correctas, establecer una sesión activa para el comprador.
- **FR-003**: Tras una autenticación exitosa, el sistema DEBE redirigir al comprador al catálogo de servicios.
- **FR-004**: Si las credenciales son incorrectas, el sistema DEBE mostrar un mensaje de error genérico sin indicar cuál campo es incorrecto (email o contraseña).
- **FR-005**: El sistema DEBE validar que el email y la contraseña no estén vacíos antes de enviar la solicitud al servidor.
- **FR-006**: El sistema DEBE validar que el email tenga formato válido (contenga "@") antes de enviar la solicitud al servidor.
- **FR-007**: Tras un fallo de login, el comprador DEBE permanecer en la pantalla de login con los campos listos para reintentar.
- **FR-008**: Si el servidor no responde, el sistema DEBE mostrar un mensaje de error de conexión y permitir reintentar.
- **FR-009**: El sistema DEBE normalizar (eliminar espacios al inicio y fin) el valor del campo email antes de enviarlo al servidor.
- **FR-010**: Si el Comprador ya tiene una sesión activa y navega a la pantalla de login, el sistema DEBE redirigirlo automáticamente al catálogo sin mostrar el formulario.

### Key Entities

- **Comprador**: Actor que accede a la plataforma para contratar servicios. Se identifica con email y contraseña. Una vez autenticado, puede navegar el catálogo y contratar.
- **Sesión de comprador**: Estado de autenticación activo que persiste mientras el comprador usa la app. Permite acceso a funcionalidades restringidas (contratar, favoritos).
- **Credenciales**: Par email + contraseña que el comprador ingresa para autenticarse. El email es normalizado antes de ser validado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La llamada de autenticación al servidor DEBE completarse en menos de 3 segundos. *(Nota UX: el flujo completo de login, incluyendo tiempo de tipeo del usuario, debería tomar menos de 30 segundos en condiciones normales; esto es una guía de experiencia, no un SLO medible.)*
- **SC-002**: El 100% de los intentos con credenciales incorrectas muestran un mensaje de error sin revelar cuál campo falló.
- **SC-003**: El 100% de los intentos con campos vacíos o email inválido son detectados localmente sin llamada al servidor.
- **SC-004**: Tras un login exitoso, el comprador ve el catálogo de servicios en menos de 3 segundos.

## Clarifications

### Session 2026-06-24

- Q: SC-001 mezcla tiempo del usuario con tiempo del sistema — ¿cómo reformular? → A: Separar en umbral medible (llamada al servidor < 3 s, alineado con SC-004) y nota UX narrativa para los 30 s. SC-001 actualizado.
- Q: El edge case "ya autenticado → redirigir al catálogo" está en la spec sin tarea ni código — ¿implementar redirect guard en BuyerLoginScreen? → A: Sí, implementar con useEffect al montar: si hay token activo, llamar navigation.replace('BuyerCatalog'). FR-010 agregado.

## Assumptions

- El backend ya cuenta con un endpoint de autenticación para compradores que valida email/contraseña y devuelve un token o establece una sesión.
- La pantalla de login del comprador es independiente de la del freelancer (pantallas separadas, conforme al Principio I de la constitución).
- No se requiere registro de nuevas cuentas en esta feature — solo el login de cuentas ya existentes.
- No se implementa "recordarme" ni recuperación de contraseña en este alcance.
- La sesión del comprador se mantiene en memoria durante la vida de la app (consistente con el stack in-memory del proyecto).
- La validación de formato de email es básica (presencia de "@"); no se requiere validación RFC completa.

# Research: Login de Comprador

**Feature**: `004-buyer-login`
**Date**: 2026-06-24

## Decisiones Técnicas

### 1. Reutilización del endpoint de autenticación existente

**Decision**: Reusar `POST /api/v1/auth/login` ya expuesto por el backend y la
función `login()` ya existente en `frontend/src/api/servicesApi.js`.

**Rationale**: El endpoint ya funciona para el Freelancer. La autenticación del
Comprador usa el mismo mecanismo (email + contraseña → JWT). Crear un endpoint
separado para el Comprador violaría el principio de no duplicar lógica de negocio
y requeriría cambios en el backend (fuera de scope).

**Alternatives considered**:
- Endpoint dedicado `POST /api/v1/auth/buyer/login`: rechazado por requerir cambios en backend.
- Archivo `buyerApi.js` separado: rechazado por innecesario; la función `login()` ya en `servicesApi.js` es suficiente.

---

### 2. Pantalla de login del Comprador independiente

**Decision**: Crear `BuyerLoginScreen.js` en `frontend/src/screens/buyer/` como
pantalla completamente nueva, sin reusar ni modificar `LoginScreen.js` del Freelancer.

**Rationale**: Principio I de la constitución exige separación de roles en vistas
distintas. Reusar `LoginScreen.js` con props condicionales mezclaría responsabilidades
y complicaría futuras divergencias entre los flujos de los dos roles.

**Alternatives considered**:
- Reusar `LoginScreen.js` con prop `role`: rechazado por violación del Principio I.
- Pantalla única con selector de rol: rechazado por experiencia de usuario ambigua y mezcla de flujos.

---

### 3. Validación de email local

**Decision**: Validar presencia y formato básico de email (presencia de "@") en el
cliente antes de llamar al servidor. No se usa librería de validación externa.

**Rationale**: La spec requiere validación local (FR-005, FR-006) para evitar
llamadas innecesarias al servidor. La validación básica con `includes('@')` es
suficiente para el scope del TP; la validación completa permanece en el servidor.

**Alternatives considered**:
- Librería `validator.js`: rechazada por agregar dependencia innecesaria para validación básica.
- Expresión regular RFC 5322 completa: rechazada por complejidad excesiva para el scope.

---

### 4. Pantalla de destino post-login (BuyerCatalogScreen)

**Decision**: Crear `BuyerCatalogScreen.js` como pantalla mínima (placeholder) que
muestra el catálogo de servicios publicados usando el endpoint público `GET /api/v1/services`
(si existe) o un mensaje de bienvenida como placeholder.

**Rationale**: La spec requiere redirigir al catálogo tras login exitoso (FR-003,
US1). El catálogo del Comprador es una feature futura separada. Esta pantalla actúa
como punto de destino funcional sin bloquear el flujo de autenticación.

**Alternatives considered**:
- Navegar a `MyServices` del Freelancer: rechazado por violación del Principio I.
- No tener pantalla de destino y solo confirmar login: rechazado por no satisfacer US1.

---

### 5. Gestión del estado de sesión

**Decision**: Almacenar el JWT del Comprador en la misma variable en memoria
(`_token` en `config.js`) que usa el Freelancer, vía `setToken()`.

**Rationale**: El stack del proyecto es in-memory; no hay persistencia entre sesiones.
La app tiene un único usuario activo a la vez (no multiusuario simultáneo), por lo
que compartir el slot de token es seguro en este contexto de TP.

**Alternatives considered**:
- Token separado `_buyerToken`: rechazado por añadir complejidad innecesaria en un contexto de usuario único.
- AsyncStorage para persistencia: rechazado por restricción del stack (solo in-memory).

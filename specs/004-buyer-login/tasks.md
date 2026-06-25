# Tasks: Login de Comprador

**Input**: Design documents from `/specs/004-buyer-login/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: No solicitados. Validación manual via `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario. Se crean 2 archivos nuevos en `screens/buyer/` y se modifica `App.js`. Sin cambios en backend ni API.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias incompletas)
- **[Story]**: Historia de usuario a la que pertenece la tarea

---

## Phase 1: Setup

**Purpose**: Verificación del estado actual y creación del directorio de pantallas del Comprador.

- [x] T001 Verificar que `frontend/src/api/servicesApi.js` exporta la función `login(email, password)` y que llama a `POST /api/v1/auth/login`
- [x] T002 Verificar que `frontend/App.js` usa `createStackNavigator` y tiene las rutas de Freelancer (`Login`, `MyServices`, `CreateService`) — confirmar punto de extensión para agregar rutas del Comprador
- [x] T003 Crear el directorio `frontend/src/screens/buyer/` (puede quedar vacío hasta la implementación)

**Checkpoint**: Entorno verificado — implementación puede comenzar.

---

## Phase 2: Foundational

Las tres historias de usuario comparten el mismo mecanismo de autenticación
(`login()` de `servicesApi.js` y `setToken()` de `config.js`). No hay prerrequisitos
bloqueantes adicionales: las pantallas son archivos independientes.

---

## Phase 3: User Story 1 — Login exitoso del Comprador (Priority: P1) 🎯 MVP

**Goal**: El Comprador ingresa credenciales válidas y es redirigido al catálogo de servicios. No puede volver al login con el botón atrás.

**Independent Test**: Ingresar email y contraseña válidos en `BuyerLoginScreen`. Verificar que la app navega a `BuyerCatalogScreen` y no permite volver al login. (`quickstart.md` Escenario 1)

### Implementación US1

- [x] T004 [P] [US1] Crear `frontend/src/screens/buyer/BuyerCatalogScreen.js` con pantalla mínima: encabezado "Catálogo de Servicios" y texto placeholder "Próximamente: aquí verás los servicios disponibles."
- [x] T005 [P] [US1] Crear `frontend/src/screens/buyer/BuyerLoginScreen.js` con: campos `email` (autoCapitalize="none", keyboardType="email-address") y `password` (secureTextEntry), botón "Iniciar sesión", estado `loading` y `error`, llamada a `login(email.trim(), password)` de `servicesApi.js`, y en éxito: `setToken(token)` + `navigation.replace('BuyerCatalog')`
- [x] T006 [US1] Modificar `frontend/App.js` para importar `BuyerLoginScreen` y `BuyerCatalogScreen` y agregar las rutas `BuyerLogin` (headerShown: false) y `BuyerCatalog` (title: 'Catálogo') al Stack.Navigator

**Nota**: En esta feature la ruta inicial del Stack sigue siendo `Login` (Freelancer). La navegación a `BuyerLogin` puede probarse agregando temporalmente `initialRouteName="BuyerLogin"` durante el desarrollo o navegando directamente desde un punto de entrada separado.

**Checkpoint**: US1 verificada — login exitoso navega a catálogo sin posibilidad de volver. Probar con `quickstart.md` Escenario 1.

---

## Phase 4: User Story 2 — Credenciales incorrectas o error de conexión (Priority: P2)

**Goal**: Cuando las credenciales son incorrectas o el servidor no responde, el Comprador ve un mensaje de error genérico y permanece en la pantalla de login.

**Independent Test**: Ingresar contraseña incorrecta en `BuyerLoginScreen`. Verificar mensaje de error genérico (sin indicar cuál campo falló) y que la pantalla permanece activa. (`quickstart.md` Escenarios 2 y 3)

### Implementación US2

- [x] T007 [US2] En `frontend/src/screens/buyer/BuyerLoginScreen.js`, asegurar que el bloque `catch` de `handleLogin` muestra un mensaje genérico: usar `e.response?.data?.message || 'Email o contraseña incorrectos.'` para error 401/400, y `'Error al iniciar sesión. Verificá tu conexión.'` cuando no hay respuesta (`!e.response`)
- [x] T008 [US2] En `frontend/src/screens/buyer/BuyerLoginScreen.js`, verificar que `setError(null)` se llama al inicio de cada intento de login (antes de la validación local y del llamado al servidor), para limpiar errores previos

**Checkpoint**: US2 verificada — error de credenciales muestra mensaje genérico; error de conexión muestra mensaje de red. Probar con `quickstart.md` Escenarios 2 y 3.

---

## Phase 5: User Story 3 — Validación local de campos (Priority: P3)

**Goal**: Campos vacíos o email sin "@" son detectados localmente antes de llamar al servidor, mostrando mensajes específicos por caso.

**Independent Test**: Pulsar "Iniciar sesión" con campos vacíos o email sin "@". Verificar que aparece mensaje de validación específico sin spinner ni llamada al servidor. (`quickstart.md` Escenarios 4, 5 y 6)

### Implementación US3

- [x] T009 [US3] En `frontend/src/screens/buyer/BuyerLoginScreen.js`, agregar validación local en `handleLogin` antes de llamar al servidor: (a) si ambos campos vacíos → `'Ingresá tu email y contraseña.'`; (b) si email vacío → `'El email es obligatorio.'`; (c) si email no contiene "@" (tras trim) → `'Ingresá un email válido.'`; (d) si contraseña vacía → `'La contraseña es obligatoria.'`; en todos los casos retornar sin llamar al servidor
- [x] T010 [US3] En `frontend/src/screens/buyer/BuyerLoginScreen.js`, verificar que el email se envía con `.trim()` aplicado en todos los casos (validación local y llamada al servidor), conforme a FR-009

**Checkpoint**: US3 verificada — validación local completa sin llamadas al servidor para campos inválidos. Probar con `quickstart.md` Escenarios 4, 5 y 6.

---

## Phase 6: Polish & Validaciones cruzadas

- [x] T011 [P] Ejecutar `quickstart.md` Escenario 3 (error de conexión): verificar que el estado del formulario permanece intacto y no hay crash
- [x] T012 Ejecutar todos los escenarios de `quickstart.md` (1–6) y registrar resultados; corregir cualquier desviación encontrada

---

## Dependencies & Execution Order

### Dependencias de fase

- **Phase 1 (Setup)**: Sin dependencias — comenzar inmediatamente
- **Phase 2 (Foundational)**: N/A para esta feature
- **Phase 3 (US1)**: Puede comenzar tras Phase 1; T004 y T005 en paralelo (archivos distintos); T006 depende de T004 y T005
- **Phase 4 (US2)**: Depende de T005 (modifica el mismo archivo `BuyerLoginScreen.js`)
- **Phase 5 (US3)**: Depende de T005 y T007 (mismo archivo `BuyerLoginScreen.js`)
- **Phase 6 (Polish)**: Depende de US1 + US2 + US3 completas

### Paralelismo disponible

- T001, T002 y T003 pueden ejecutarse en paralelo (Phase 1)
- T004 y T005 pueden ejecutarse en paralelo (archivos distintos: `BuyerCatalogScreen.js` vs `BuyerLoginScreen.js`)
- T011 puede ejecutarse en paralelo con T012 (Phase 6)

---

## Parallel Example

```text
# Tras Phase 1 (T001 + T002 + T003 en paralelo):
Developer A: T004 — BuyerCatalogScreen.js (pantalla de destino)
Developer B: T005 — BuyerLoginScreen.js (pantalla de login)
# Tras T004 + T005:
Developer A o B: T006 — App.js (registro de rutas)
# Luego secuencialmente:
T007 → T008 (US2, mismo archivo)
T009 → T010 (US3, mismo archivo)
```

---

## Implementation Strategy

### MVP First (US1 — flujo de login exitoso completo)

1. Completar Phase 1: Setup (T001, T002, T003)
2. Completar Phase 3: US1 — pantalla de login + catálogo + rutas (T004, T005, T006)
3. **PARAR y VALIDAR**: Escenario 1 de `quickstart.md`
4. Demo: login exitoso del Comprador con navegación al catálogo

### Incremental Delivery

1. Phase 1 → contexto claro
2. Phase 3 (US1) → flujo feliz completo (MVP)
3. Phase 4 (US2) → manejo de errores de servidor
4. Phase 5 (US3) → validación local de campos
5. Phase 6 → polish y validación completa

---

## Notes

- `BuyerLoginScreen.js` y `BuyerCatalogScreen.js` son archivos nuevos en `screens/buyer/`
- `App.js` es el único archivo existente que se modifica
- `LoginScreen.js` del Freelancer NO se toca en ninguna tarea
- `servicesApi.js` y `config.js` NO se modifican — se usan como están
- [P] en T004/T005 indica paralelismo real por archivos distintos
- Validación manual con `quickstart.md` es suficiente (no hay tests automatizados solicitados)

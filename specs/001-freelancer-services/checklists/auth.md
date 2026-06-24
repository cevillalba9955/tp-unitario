# Auth Requirements Checklist: Login Freelancer

**Purpose**: Validar la calidad, completitud y brechas de los requisitos del login del freelancer. Enfoque en separación de roles (Constitución §I) y gaps de documentación.
**Created**: 2026-06-23
**Reviewed**: 2026-06-23 — Análisis contra código: `backend/src/routes/auth.js`, `backend/src/middleware/auth.js`, `backend/src/store/index.js`, `backend/src/app.js`
**Feature**: Login de freelancer — implementado como infraestructura de soporte (sin spec.md formal)
**Focus**: Q1=Gaps documentales · Q2=Separación de roles (Constitución §I y §IV)

---

## Completitud de Requisitos — Brechas Documentales

- [ ] CHK001 ¿Existe un `spec.md` formal para la feature de login, o está documentada únicamente como infraestructura de soporte sin requisitos funcionales explícitos? [Gap]
  > **Gap confirmado**: No existe `spec.md` para login. Implementado en `backend/src/routes/auth.js` como infraestructura de soporte. Aceptado para el alcance del TP.

- [ ] CHK002 ¿Están documentados los actores que pueden iniciar sesión? ¿Se especifica explícitamente que el login del Freelancer es distinto del login del Comprador, o se asume un único flujo compartido? [Gap, Constitución §I]
  > **Gap confirmado**: El endpoint `POST /api/v1/auth/login` acepta cualquier usuario de `store.users` sin restricción de rol. El seed solo tiene `freelancer@demo.com`, pero el código no valida el rol en el login. No hay separación documentada.

- [ ] CHK003 ¿Están definidos los requisitos de formato de credenciales? (longitud mínima de contraseña, formato de email, caracteres permitidos) [Gap]
  > **Gap confirmado**: `auth.js` solo valida presencia (`!email || !password`). No hay validación de formato de email ni longitud mínima de contraseña. Gap conocido y aceptado para el TP.

- [ ] CHK004 ¿Está documentado el comportamiento post-login? ¿Se especifica a qué pantalla/flujo navega cada rol tras autenticarse? [Gap]
  > **Gap confirmado**: El backend retorna `{ token, freelancerId, expiresIn: '7d' }` (HTTP 200). La navegación post-login es responsabilidad del frontend; no está documentada como requisito.

- [ ] CHK005 ¿Está el logout explícitamente declarado fuera de alcance, o es una omisión no documentada? [Gap, Alcance]
  > **Gap confirmado**: No existe endpoint de logout ni está declarado fuera de alcance. JWT stateless implica que el cliente simplemente descarta el token, pero esto no está documentado.

- [ ] CHK006 ¿Están documentados los requisitos de renovación/refresco de token (refresh token, re-login obligatorio al expirar)? [Gap]
  > **Gap confirmado**: No hay endpoint de refresh token. JWT expira en 7d (`expiresIn: '7d'`). No documentado qué debe hacer el cliente cuando el token expira.

- [ ] CHK007 ¿Se especifica la política de persistencia de sesión entre reinicios de la app? (token in-memory vs. almacenamiento persistente) [Gap]
  > **Gap confirmado**: No documentada. El frontend decide cómo almacenar el token (AsyncStorage, memoria, etc.).

- [ ] CHK008 ¿Está el registro de nuevos usuarios (signup) explícitamente declarado fuera del alcance de esta feature? [Gap, Alcance]
  > **Gap confirmado**: No hay endpoint de signup. No declarado fuera de alcance explícitamente. El seed en `store/index.js` tiene un usuario hardcoded (`freelancer@demo.com`) como workaround.

---

## Separación de Roles — Constitución §I y §IV

- [ ] CHK009 ¿Están los requisitos de login definidos exclusivamente para el rol Freelancer, o el mismo flujo podría usarse para Compradores sin distinción? [Separación de Roles, Constitución §I]
  > **Gap confirmado**: El endpoint `POST /api/v1/auth/login` no filtra por rol. Si se agregara un Comprador al `store.users`, podría autenticarse con el mismo endpoint y obtener un JWT válido que incluye `role: 'buyer'`. No hay separación explícita del flujo de login por rol.

- [ ] CHK010 ¿Está documentado que un usuario autenticado como Freelancer no puede acceder a flujos de Comprador sin autenticación separada? [Separación de Roles, Constitución §I]
  > **Gap confirmado**: No documentado. La separación actual se da solo porque el seed tiene un único usuario freelancer y no hay flujos de Comprador implementados.

- [x] CHK011 ¿Incluye el payload JWT el campo `role` para que los endpoints puedan verificar el tipo de actor? ¿Está esto especificado como requisito? [Constitución §IV, Gap]
  > **Implementado**: `jwt.sign({ freelancerId: user.id, sub: user.id, role: user.role }, ...)` en `auth.js:22-26`. El campo `role` está presente en el JWT. **Nota**: El `middleware/auth.js` NO extrae ni valida `role`; solo extrae `freelancerId`. El campo está disponible pero sin uso en endpoints actuales.

- [ ] CHK012 ¿Están definidos los requisitos de autorización server-side para rechazar requests de un rol incorrecto (ej: Comprador intentando crear un servicio con token de Freelancer)? [Constitución §IV]
  > **Brecha de implementación**: `middleware/auth.js` solo extrae `freelancerId`; no valida `role`. Un token con `role: 'buyer'` podría crear servicios si el usuario existiera en el store. Requiere agregar validación de rol en el middleware o en los route handlers.

- [ ] CHK013 ¿Está documentado el comportamiento esperado si un token de Comprador intenta acceder a endpoints de Freelancer? ¿HTTP 403 o HTTP 401? [Claridad, Constitución §IV]
  > **Gap confirmado**: No documentado. La implementación actual retornaría HTTP 200 (permitiría la operación) si el token es válido, independientemente del rol.

- [ ] CHK014 ¿El usuario de demo (`freelancer@demo.com`) tiene su rol explícitamente documentado como `freelancer`? ¿Está claro que no debe tener capacidades de Comprador? [Constitución §I, Gap]
  > **Parcialmente implementado**: `store/index.js:31` define `role: 'freelancer'` explícitamente en código. No está documentado en ningún spec formal, pero el rol está configurado correctamente en el seed.

---

## Calidad de Requisitos de Seguridad

- [ ] CHK015 ¿Está especificado el algoritmo de hashing de contraseñas? La constitución prohíbe almacenamiento en plaintext; ¿está este requisito documentado explícitamente? [Seguridad, Gap]
  > **Implementado sin documentar**: `auth.js:8` y `store/index.js:4` usan SHA-256 (`crypto.createHash('sha256')`). Las contraseñas NO se almacenan en plaintext. **Nota de seguridad**: SHA-256 no es recomendado para passwords (preferible bcrypt/argon2), pero es aceptable para un TP. Gap documental confirmado.

- [ ] CHK016 ¿Están definidos los requisitos de gestión del `JWT_SECRET`? (rotación, longitud mínima, no hardcodear en código) [Seguridad, Gap]
  > **Implementado con limitación**: `auth.js:7` y `middleware/auth.js:3` usan `process.env.JWT_SECRET || 'freelancehub-dev-secret'`. El fallback hardcoded `'freelancehub-dev-secret'` es un riesgo de seguridad si se deployara a producción. Para el TP es aceptable. Gap documental confirmado.

- [x] CHK017 ¿Están los mensajes de error de login especificados para evitar enumeración de credenciales? (ej: "Email o contraseña incorrectos" vs. mensajes que indiquen cuál dato falló) [Seguridad, Claridad]
  > **Implementado correctamente**: `auth.js:19` retorna `'Email o contraseña incorrectos.'` para email inexistente Y contraseña incorrecta. Mismo mensaje genérico en ambos casos — evita enumeración de usuarios.

- [ ] CHK018 ¿Están definidos los requisitos de límite de intentos de login fallidos (rate limiting, bloqueo temporal)? [Seguridad, Gap]
  > **Gap confirmado**: No hay rate limiting implementado. Cualquier cliente puede hacer intentos ilimitados de login. Gap conocido y aceptado para el TP.

- [ ] CHK019 ¿Está documentada la política de expiración del token JWT (`expiresIn`)? ¿7d está justificado como requisito o es un valor arbitrario de implementación? [Seguridad, Claridad]
  > **Gap confirmado**: `expiresIn: '7d'` hardcoded en `auth.js:25`. No documentado como requisito. Valor arbitrario de implementación.

- [ ] CHK020 ¿Están los requisitos de almacenamiento del token en el cliente definidos? (memoria de módulo vs. AsyncStorage; implicaciones de seguridad documentadas) [Seguridad, Gap]
  > **Gap confirmado**: No documentado. El frontend (`LoginScreen.js`) decide el mecanismo de almacenamiento.

---

## Cobertura de Escenarios

- [ ] CHK021 ¿Están definidos los requisitos para el flujo nominal (credenciales correctas → JWT → navegación)? [Cobertura, Gap]
  > **Implementado sin documentar**: `POST /api/v1/auth/login` con credenciales válidas → HTTP 200 `{ token, freelancerId, expiresIn: '7d' }`. Funciona correctamente. Gap documental confirmado.

- [ ] CHK022 ¿Están definidos los requisitos para credenciales inválidas (email inexistente, contraseña incorrecta)? ¿Se diferencia el tratamiento de ambos casos? [Cobertura, Seguridad]
  > **Implementado sin documentar**: Email inexistente Y contraseña incorrecta → ambos retornan HTTP 401 `INVALID_CREDENTIALS` con el mismo mensaje. Campos faltantes → HTTP 400 `BAD_REQUEST`. El tratamiento unificado de ambos casos de error es correcto por seguridad. Gap documental confirmado.

- [ ] CHK023 ¿Están definidos los requisitos de comportamiento cuando el token expira durante la sesión? (re-login automático, redirección a Login, mensaje al usuario) [Cobertura, Edge Case, Gap]
  > **Parcialmente implementado**: `middleware/auth.js:13-17` captura el error de `jwt.verify` (que incluye expiración) y retorna HTTP 401 `UNAUTHORIZED`. El comportamiento del frontend ante este 401 no está documentado ni especificado.

- [ ] CHK024 ¿Están definidos los requisitos de comportamiento cuando el backend no está disponible durante el login? [Cobertura, Edge Case, Gap]
  > **Gap confirmado**: No documentado. Depende del cliente mostrar un mensaje de error de red.

- [ ] CHK025 ¿Están definidos los requisitos para el estado de carga durante la autenticación? (feedback visual mientras se espera respuesta del backend) [UX, Claridad]
  > **Gap confirmado**: No documentado como requisito. Responsabilidad del frontend.

---

## Criterios de Aceptación y Medibilidad

- [ ] CHK026 ¿Tienen los requisitos de login criterios de aceptación medibles y verificables (no solo descripciones de comportamiento)? [Medibilidad, Gap]
  > **Gap confirmado**: No hay criterios de aceptación medibles para la feature de login (tiempo de respuesta, tasa de éxito, etc.).

- [ ] CHK027 ¿Está cuantificado el tiempo máximo aceptable para completar el proceso de login (latencia de red local incluida)? [Medibilidad, Gap]
  > **Gap confirmado**: No hay objetivo de performance documentado para login.

- [ ] CHK028 ¿Están los requisitos de validación del formulario (client-side) claramente distinguidos de los requisitos de validación del servidor? [Claridad, Constitución §III]
  > **Gap confirmado**: No documentado. Server-side: presencia de campos (`auth.js:13`). Client-side: no especificado.

---

## Alineación con la Constitución

- [x] CHK029 ¿El endpoint de login devuelve códigos HTTP semánticamente correctos para todos los casos (200, 400, 401)? ¿Está esto documentado como requisito? [Constitución Stack, Claridad]
  > **Implementado correctamente**: `auth.js` retorna HTTP 200 (éxito), HTTP 400 (campos faltantes), HTTP 401 (credenciales inválidas). Cumple la restricción de la constitución de códigos HTTP semánticos.

- [ ] CHK030 ¿La feature de login tiene un Constitution Check documentado que valide los Principios I–V antes de considerarse completa? [Constitución §Governance, Gap]
  > **Gap confirmado**: No existe plan.md para la feature de login, por lo tanto no hay Constitution Check documentado.

- [x] CHK031 ¿Está documentado que el endpoint `/api/v1/auth/login` es público (sin auth middleware), alineado con el requisito de que la autenticación es obligatoria para escrituras pero no para login? [Constitución §IV, Claridad]
  > **Implementado correctamente**: En `app.js:33` el router de auth se monta sin el middleware `auth`: `app.use('/api/v1/auth', authRouter)`. Los endpoints de servicios e imágenes sí usan el middleware auth. Comportamiento correcto.

---

## Notas

- Marcar ítems completados con `[x]`
- Los ítems `[Gap]` indican ausencia de documentación, no fallas de implementación
- **Revisión 2026-06-23**: 4 ítems marcados [x] basados en análisis del código implementado (CHK011, CHK017, CHK029, CHK031)
- **Brecha de implementación identificada**: CHK012 — `middleware/auth.js` no valida el campo `role` del JWT. Si se incorporaran Compradores, podrían acceder a endpoints de Freelancer.
- **Gaps aceptados para el TP**: CHK001–CHK010, CHK013, CHK015–CHK016, CHK018–CHK028, CHK030 — brechas documentales de una feature de soporte sin spec.md formal.
- Prioridad recomendada: CHK012 (brecha de implementación real) → CHK009 (separación de roles) → resto como mejoras futuras.

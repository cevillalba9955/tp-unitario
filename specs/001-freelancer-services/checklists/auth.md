# Auth Requirements Checklist: Login Freelancer

**Purpose**: Validar la calidad, completitud y brechas de los requisitos del login del freelancer. Enfoque en separación de roles (Constitución §I) y gaps de documentación.
**Created**: 2026-06-23
**Feature**: Login de freelancer — implementado como infraestructura de soporte (sin spec.md formal)
**Focus**: Q1=Gaps documentales · Q2=Separación de roles (Constitución §I y §IV)

---

## Completitud de Requisitos — Brechas Documentales

- [ ] CHK001 ¿Existe un `spec.md` formal para la feature de login, o está documentada únicamente como infraestructura de soporte sin requisitos funcionales explícitos? [Gap]
- [ ] CHK002 ¿Están documentados los actores que pueden iniciar sesión? ¿Se especifica explícitamente que el login del Freelancer es distinto del login del Comprador, o se asume un único flujo compartido? [Gap, Constitución §I]
- [ ] CHK003 ¿Están definidos los requisitos de formato de credenciales? (longitud mínima de contraseña, formato de email, caracteres permitidos) [Gap]
- [ ] CHK004 ¿Está documentado el comportamiento post-login? ¿Se especifica a qué pantalla/flujo navega cada rol tras autenticarse? [Gap]
- [ ] CHK005 ¿Está el logout explícitamente declarado como fuera de alcance, o es una omisión no documentada? [Gap, Alcance]
- [ ] CHK006 ¿Están documentados los requisitos de renovación/refresco de token (refresh token, re-login obligatorio al expirar)? [Gap]
- [ ] CHK007 ¿Se especifica la política de persistencia de sesión entre reinicios de la app? (token in-memory vs. almacenamiento persistente) [Gap]
- [ ] CHK008 ¿Está el registro de nuevos usuarios (signup) explícitamente declarado fuera del alcance de esta feature? [Gap, Alcance]

---

## Separación de Roles — Constitución §I y §IV

- [ ] CHK009 ¿Están los requisitos de login definidos exclusivamente para el rol Freelancer, o el mismo flujo podría usarse para Compradores sin distinción? [Separación de Roles, Constitución §I]
- [ ] CHK010 ¿Está documentado que un usuario autenticado como Freelancer no puede acceder a flujos de Comprador sin autenticación separada? [Separación de Roles, Constitución §I]
- [ ] CHK011 ¿Incluye el payload JWT el campo `role` para que los endpoints puedan verificar el tipo de actor? ¿Está esto especificado como requisito? [Constitución §IV, Gap]
- [ ] CHK012 ¿Están definidos los requisitos de autorización server-side para rechazar requests de un rol incorrecto (ej: Comprador intentando crear un servicio con token de Freelancer)? [Constitución §IV]
- [ ] CHK013 ¿Está documentado el comportamiento esperado si un token de Comprador intenta acceder a endpoints de Freelancer? ¿HTTP 403 o HTTP 401? [Claridad, Constitución §IV]
- [ ] CHK014 ¿El usuario de demo (`freelancer@demo.com`) tiene su rol explícitamente documentado como `freelancer`? ¿Está claro que no debe tener capacidades de Comprador? [Constitución §I, Gap]

---

## Calidad de Requisitos de Seguridad

- [ ] CHK015 ¿Está especificado el algoritmo de hashing de contraseñas? La constitución prohíbe almacenamiento en plaintext; ¿está este requisito documentado explícitamente? [Seguridad, Gap]
- [ ] CHK016 ¿Están definidos los requisitos de gestión del `JWT_SECRET`? (rotación, longitud mínima, no hardcodear en código) [Seguridad, Gap]
- [ ] CHK017 ¿Están los mensajes de error de login especificados para evitar enumeración de credenciales? (ej: "Email o contraseña incorrectos" vs. mensajes que indiquen cuál dato falló) [Seguridad, Claridad]
- [ ] CHK018 ¿Están definidos los requisitos de límite de intentos de login fallidos (rate limiting, bloqueo temporal)? [Seguridad, Gap]
- [ ] CHK019 ¿Está documentada la política de expiración del token JWT (`expiresIn`)? ¿7d está justificado como requisito o es un valor arbitrario de implementación? [Seguridad, Claridad]
- [ ] CHK020 ¿Están los requisitos de almacenamiento del token en el cliente definidos? (memoria de módulo vs. AsyncStorage; implicaciones de seguridad documentadas) [Seguridad, Gap]

---

## Cobertura de Escenarios

- [ ] CHK021 ¿Están definidos los requisitos para el flujo nominal (credenciales correctas → JWT → navegación)? [Cobertura, Gap]
- [ ] CHK022 ¿Están definidos los requisitos para credenciales inválidas (email inexistente, contraseña incorrecta)? ¿Se diferencia el tratamiento de ambos casos? [Cobertura, Seguridad]
- [ ] CHK023 ¿Están definidos los requisitos de comportamiento cuando el token expira durante la sesión? (re-login automático, redirección a Login, mensaje al usuario) [Cobertura, Edge Case, Gap]
- [ ] CHK024 ¿Están definidos los requisitos de comportamiento cuando el backend no está disponible durante el login? [Cobertura, Edge Case, Gap]
- [ ] CHK025 ¿Están definidos los requisitos para el estado de carga durante la autenticación? (feedback visual mientras se espera respuesta del backend) [UX, Claridad]

---

## Criterios de Aceptación y Medibilidad

- [ ] CHK026 ¿Tienen los requisitos de login criterios de aceptación medibles y verificables (no solo descripciones de comportamiento)? [Medibilidad, Gap]
- [ ] CHK027 ¿Está cuantificado el tiempo máximo aceptable para completar el proceso de login (latencia de red local incluida)? [Medibilidad, Gap]
- [ ] CHK028 ¿Están los requisitos de validación del formulario (client-side) claramente distinguidos de los requisitos de validación del servidor? [Claridad, Constitución §III]

---

## Alineación con la Constitución

- [ ] CHK029 ¿El endpoint de login devuelve códigos HTTP semánticamente correctos para todos los casos (200, 400, 401)? ¿Está esto documentado como requisito? [Constitución Stack, Claridad]
- [ ] CHK030 ¿La feature de login tiene un Constitution Check documentado que valide los Principios I–V antes de considerarse completa? [Constitución §Governance, Gap]
- [ ] CHK031 ¿Está documentado que el endpoint `/api/v1/auth/login` es público (sin auth middleware), alineado con el requisito de que la autenticación es obligatoria para escrituras pero no para login? [Constitución §IV, Claridad]

---

## Notas

- Marcar ítems completados con `[x]`
- Agregar hallazgos inline junto al ítem correspondiente
- Los ítems `[Gap]` indican ausencia de documentación, no fallas de implementación
- Prioridad recomendada: CHK009–CHK014 (separación de roles) → CHK015–CHK020 (seguridad) → resto

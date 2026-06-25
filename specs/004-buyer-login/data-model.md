# Data Model: Login de Comprador

**Feature**: `004-buyer-login`
**Date**: 2026-06-24

## Entidades

### Sesión de Comprador

Representa el estado de autenticación activo del Comprador en la app. Se mantiene
en memoria durante la vida de la sesión; no persiste entre reinicios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `token` | `string` | JWT devuelto por el servidor tras autenticación exitosa. Almacenado vía `setToken()` en `config.js`. |

**Lifecycle**:
- **Creada**: tras respuesta exitosa de `POST /api/v1/auth/login` (`login(email, password)`)
- **Activa**: mientras el token esté en memoria y la app esté corriendo
- **Destruida**: al reiniciar la app (in-memory: no hay logout explícito en scope)

**Validation rules**:
- `email`: no vacío, contiene "@", espacios extremos ignorados (trim)
- `password`: no vacía
- Ambos campos son obligatorios antes de enviar al servidor

---

### Credenciales de Comprador (estado local de formulario)

Estado efímero manejado por React useState en `BuyerLoginScreen`. No se persiste.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `email` | `string` | Obligatorio, debe contener "@". Normalizado con `.trim()` antes de enviar. |
| `password` | `string` | Obligatorio. No se normaliza (sensible a espacios). |
| `loading` | `boolean` | `true` durante la llamada al servidor. |
| `error` | `string \| null` | Mensaje de error visible al usuario. `null` cuando no hay error. |

---

## Transiciones de estado del formulario

```text
[Vacío] ──pulsa login──► [Validando localmente]
    │
    ├── campos vacíos o email inválido ──► [Error local] ──► [Vacío / corregir]
    │
    └── validación OK ──► [Llamando servidor] (loading=true)
            │
            ├── éxito (200 + token) ──► [Autenticado] → navegar a BuyerCatalog
            │
            ├── credenciales incorrectas (401) ──► [Error genérico] ──► [Vacío / reintentar]
            │
            └── sin respuesta / error de red ──► [Error conexión] ──► [Vacío / reintentar]
```

---

## Relación con entidades existentes

- **Token en `config.js`**: `BuyerLoginScreen` llama a `setToken(token)` tras login exitoso, igual que `LoginScreen` del Freelancer. La variable `_token` es compartida (un usuario activo a la vez).
- **`servicesApi.login()`**: función existente, sin cambios. `BuyerLoginScreen` la importa directamente.

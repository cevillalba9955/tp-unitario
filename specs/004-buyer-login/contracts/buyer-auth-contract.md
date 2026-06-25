# Contrato UX: Flujo de Login del Comprador

**Feature**: `004-buyer-login`
**Date**: 2026-06-24

## Pantalla: BuyerLoginScreen

### Elementos de UI

| Elemento | Tipo | Comportamiento |
|----------|------|----------------|
| Campo Email | TextInput | `autoCapitalize="none"`, `keyboardType="email-address"`, `autoCorrect={false}` |
| Campo Contraseña | TextInput | `secureTextEntry=true` |
| Botón "Iniciar sesión" | TouchableOpacity | Deshabilitado mientras `loading=true`; muestra `ActivityIndicator` durante la llamada |
| Mensaje de error | Text | Visible solo cuando `error !== null`; estilo rojo; texto inline (no Alert) |

### Flujos

#### Flujo 1: Login exitoso (US1)

```
Usuario ingresa email válido + contraseña
  → pulsa "Iniciar sesión"
  → [loading=true, error=null]
  → llamada a POST /api/v1/auth/login
  → respuesta 200 { token }
  → setToken(token)
  → navigation.replace("BuyerCatalog")
```

**Post-condición**: El usuario está en `BuyerCatalogScreen`. No puede volver a `BuyerLoginScreen` con el botón atrás (replace, no push).

#### Flujo 2: Credenciales incorrectas (US2)

```
Usuario ingresa credenciales inválidas
  → pulsa "Iniciar sesión"
  → [loading=true, error=null]
  → llamada a POST /api/v1/auth/login
  → respuesta 401 o 400
  → [loading=false, error="Email o contraseña incorrectos."]
  → permanece en BuyerLoginScreen con campos listos para reintentar
```

**Mensaje de error**: Genérico — no indica cuál campo es incorrecto (FR-004, seguridad).

#### Flujo 3: Error de conexión (US2 — sin respuesta del servidor)

```
Sin respuesta del servidor
  → [loading=false, error="Error al iniciar sesión. Verificá tu conexión."]
  → permanece en BuyerLoginScreen
```

#### Flujo 4: Validación local — campos vacíos o email inválido (US3)

```
Usuario deja campos vacíos o email sin "@"
  → pulsa "Iniciar sesión"
  → validación local (sin llamada al servidor)
  → [error="Ingresá un email válido y tu contraseña."]  // email inválido
  → [error="Ingresá tu email y contraseña."]            // campos vacíos
  → permanece en BuyerLoginScreen
```

### API utilizada

| Método | Endpoint | Cuerpo | Respuesta exitosa |
|--------|----------|--------|-------------------|
| POST | `/api/v1/auth/login` | `{ email: string, password: string }` | `200 { token: string }` |

**Notas**:
- El email se envía con `.trim()` aplicado.
- En caso de error, el campo `e.response?.data?.message` del servidor puede usarse para el mensaje genérico, pero nunca debe revelar cuál campo falló.

## Pantalla: BuyerCatalogScreen (mínima)

### Propósito

Pantalla de destino tras login exitoso del Comprador. En esta feature actúa como
placeholder; será expandida en la feature de catálogo del Comprador.

### Elementos de UI (mínimos)

| Elemento | Tipo | Contenido |
|----------|------|-----------|
| Encabezado | Text | "Catálogo de Servicios" |
| Cuerpo | Text | "Próximamente: aquí verás los servicios disponibles." |

### Navegación

- Accesible solo tras login exitoso del Comprador (no navegable directamente).
- No tiene botón "Volver" al login (la navegación usa `replace`, no `push`).

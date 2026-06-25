# Quickstart: Validación del Login de Comprador

## Prerequisitos

- Backend corriendo en Docker: `docker compose up` desde la raíz del proyecto
- App React Native iniciada: `cd frontend && npx expo start`
- Cuenta de comprador existente en el sistema (ver credenciales de demo)

**Credenciales de demo**:
- Email: `buyer@demo.com` / Contraseña: `demo1234`

---

## Escenario 1: Login exitoso del Comprador (US1)

1. Abrir la app y navegar a la pantalla de login del Comprador (`BuyerLoginScreen`)
2. Ingresar email y contraseña válidos
3. Pulsar **"Iniciar sesión"**
4. **Resultado esperado**:
   - El botón muestra un spinner durante la llamada
   - La app navega a `BuyerCatalogScreen` (catálogo)
   - No es posible volver al login con el botón atrás

---

## Escenario 2: Credenciales incorrectas (US2)

1. En `BuyerLoginScreen`, ingresar email correcto pero contraseña incorrecta
2. Pulsar **"Iniciar sesión"**
3. **Resultado esperado**:
   - Aparece mensaje de error genérico (ej. "Email o contraseña incorrectos.")
   - El mensaje NO indica cuál campo está mal
   - La pantalla permanece activa con los campos listos para reintentar

---

## Escenario 3: Error de conexión (US2 — sin backend)

1. Detener el backend Docker
2. En `BuyerLoginScreen`, ingresar credenciales válidas y pulsar **"Iniciar sesión"**
3. **Resultado esperado**:
   - Aparece mensaje de error de conexión
   - La pantalla permanece activa; los datos ingresados están intactos

---

## Escenario 4: Campos vacíos (US3)

1. En `BuyerLoginScreen`, dejar ambos campos vacíos
2. Pulsar **"Iniciar sesión"**
3. **Resultado esperado**:
   - Aparece mensaje de validación indicando que ambos campos son obligatorios
   - No se realiza ninguna llamada al servidor

---

## Escenario 5: Email con formato inválido (US3)

1. En `BuyerLoginScreen`, ingresar "usuariosinarroba" (sin "@") en el campo email
2. Ingresar cualquier contraseña
3. Pulsar **"Iniciar sesión"**
4. **Resultado esperado**:
   - Aparece mensaje indicando que el email no tiene formato válido
   - No se realiza ninguna llamada al servidor

---

## Escenario 6: Contraseña vacía con email válido (US3)

1. En `BuyerLoginScreen`, ingresar email válido y dejar la contraseña vacía
2. Pulsar **"Iniciar sesión"**
3. **Resultado esperado**:
   - Aparece mensaje indicando que la contraseña es obligatoria
   - No se realiza ninguna llamada al servidor

---

## Verificación de autenticación en backend (opcional)

```
POST /api/v1/auth/login
Body: { "email": "buyer@demo.com", "password": "demo1234" }
Expected: 200 { token: "..." }

POST /api/v1/auth/login
Body: { "email": "buyer@demo.com", "password": "wrong" }
Expected: 401 { message: "..." }
```

# Quickstart — Catálogo de Comprador

**Feature**: `005-buyer-catalog`
**Ref**: [contracts/catalog-contract.md](./contracts/catalog-contract.md) · [data-model.md](./data-model.md)

---

## Prerequisitos

1. Docker en ejecución:
   ```sh
   cd backend && docker compose up
   ```
2. App Expo corriendo:
   ```sh
   cd frontend && npx expo start
   ```
3. Usuario seed disponible: `buyer@demo.com` / `demo1234`
4. Al menos un servicio publicado (ver Escenario 0).

---

## Escenario 0 — Preparar datos de prueba

> Verifica que exista al menos un servicio publicado en el sistema.

1. Iniciar sesión en la app como **freelancer** (`freelancer@demo.com` / `demo1234`).
2. Crear un servicio con título, descripción y al menos un paquete.
3. Publicar el servicio.
4. Verificar en la lista del freelancer que el estado muestra "PUBLISHED".
5. Cerrar sesión.

---

## Escenario 1 — US1: Explorar el catálogo de servicios publicados

> Verifica FR-001, FR-002, FR-003, FR-007, SC-001.

1. Iniciar sesión como **comprador** (`buyer@demo.com` / `demo1234`).
2. La app navega automáticamente a la pantalla de Catálogo de Servicios.
3. **Resultado esperado**: La lista muestra el servicio publicado con:
   - Título del servicio.
   - Nombre de la categoría (o "Sin categoría" si no tiene).
   - Precio mínimo (precio del paquete más barato).
4. Crear un servicio en estado DRAFT (sin publicar) como freelancer y volver al catálogo.
   - **Resultado esperado**: El servicio DRAFT **NO** aparece en la lista del comprador.
5. Si no hay servicios publicados, el catálogo muestra un mensaje como
   "Aún no hay servicios disponibles."

---

## Escenario 2 — US2: Filtrar servicios por categoría

> Verifica FR-004, FR-005, FR-006, FR-007, SC-002, SC-003.

1. Iniciar sesión como comprador.
2. En el catálogo, verificar que se muestra una fila de filtros de categoría
   (chips horizontales): "Todas" + una por cada categoría con servicios publicados.
3. Tocar una categoría que tenga servicios.
   - **Resultado esperado**: Solo se muestran servicios de esa categoría.
4. Tocar "Todas".
   - **Resultado esperado**: Se muestran nuevamente todos los servicios publicados.
5. Tocar una categoría sin servicios publicados.
   - **Resultado esperado**: Aparece un mensaje como
     "No hay servicios en esta categoría."

---

## Escenario 3 — US3: Ver detalle de un servicio

> Verifica FR-008, FR-009, SC-004.

1. Iniciar sesión como comprador.
2. Tocar un servicio en la lista del catálogo.
3. **Resultado esperado**: Pantalla de detalle muestra:
   - Título del servicio.
   - Descripción completa.
   - Lista de paquetes con nombre, alcance, precio y plazo de entrega.
   - Imágenes del servicio (si las hay).
4. Presionar el botón "Volver" (flecha en el header).
   - **Resultado esperado**: Regresa al catálogo con el mismo filtro de categoría activo.

---

## Escenario 4 — Edge case: error de red

> Verifica FR-011.

1. Detener el backend Docker.
2. Iniciar sesión como comprador y navegar al catálogo (o recargar la app en el catálogo).
3. **Resultado esperado**: Se muestra un mensaje de error y un botón "Reintentar".
4. Volver a levantar el backend y tocar "Reintentar".
5. **Resultado esperado**: El catálogo carga correctamente.

---

## Escenario 5 — Edge case: redirección sin autenticación

> Verifica FR-010.

1. Cerrar sesión (logout desde el catálogo).
2. Intentar navegar directamente a la pantalla de catálogo (deep link o reload).
3. **Resultado esperado**: La app muestra la pantalla de login del Comprador.

---

## Validación rápida del endpoint (REST)

```sh
# 1. Obtener token de comprador
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@demo.com","password":"demo1234","role":"buyer"}' \
  | jq -r '.token')

# 2. Listar catálogo completo
curl -s http://localhost:3000/api/v1/services \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Filtrar por categoría (reemplazar UUID)
curl -s "http://localhost:3000/api/v1/services?categoryId=<UUID>" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Resultado esperado del endpoint**:
```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "categoryId": "...",
      "categoryName": "...",
      "minPrice": 150,
      "packageCount": 2
    }
  ]
}
```

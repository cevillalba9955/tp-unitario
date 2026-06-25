# Interface Contracts: Catálogo de Comprador

**Feature**: `005-buyer-catalog`
**Date**: 2026-06-24

Ref: [data-model.md](../data-model.md) · [research.md](../research.md)

---

## Backend: Endpoint de Catálogo

### `GET /api/v1/services`

Devuelve la lista de servicios publicados. Requiere autenticación.

**Authorization**: `Bearer <token>` (cualquier rol autenticado)

**Query Parameters**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `categoryId` | `string` (UUID) | No | Filtra por categoría. Omitir = todos. |

**Respuesta exitosa** `200 OK`:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "categoryId": "uuid",
      "categoryName": "string",
      "minPrice": 150,
      "packageCount": 2
    }
  ]
}
```

- `status=PUBLISHED` se fuerza siempre en el servidor (sin `?status=` externo)
- `minPrice` = `Math.min(...packages.map(p => p.price))` calculado en backend
- Si no hay servicios publicados: `{ "data": [] }` (no error)
- Si `categoryId` no existe en el store: `{ "data": [] }` (lista vacía, no 404)

**Respuesta de error** `401 Unauthorized`:

```json
{ "error": "UNAUTHORIZED", "message": "Token de autenticación requerido." }
```

---

## Backend: Endpoint de Detalle (existente)

### `GET /api/v1/services/:id`

**Sin cambios** al contrato existente. Solo se documenta el subset relevante para el Comprador.

**Authorization**: `Bearer <token>`

**Restricción**: Si el servicio es `DRAFT` y el token no corresponde al dueño → `403 FORBIDDEN`
**Implicación para el Comprador**: Solo puede acceder a servicios `PUBLISHED`.

**Respuesta exitosa** `200 OK`:

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "categoryId": "uuid",
  "status": "PUBLISHED",
  "packages": [
    {
      "id": "uuid",
      "name": "string",
      "scope": "string",
      "price": 150,
      "deliveryDays": 5,
      "displayOrder": 1
    }
  ],
  "images": [
    {
      "id": "uuid",
      "imageUrl": "/api/v1/images/{id}",
      "displayOrder": 1
    }
  ]
}
```

---

## Frontend: `servicesApi.js`

### `getCatalog(categoryId?)`

```text
getCatalog(categoryId?: string): Promise<Service[]>
  - GET /api/v1/services?categoryId={categoryId}  (si categoryId provisto)
  - GET /api/v1/services                          (sin filtro)
  - Devuelve array de ítems de catálogo
  - Lanza error (con e.response) si falla la red o el servidor
```

---

## Frontend: Navegación

### Rutas de Stack Navigator

| Ruta | Componente | Parámetros de entrada |
|------|------------|-----------------------|
| `BuyerLogin` | `BuyerLoginScreen` | — |
| `BuyerCatalog` | `BuyerCatalogScreen` | — |
| `ServiceDetail` | `ServiceDetailScreen` | `{ serviceId: string }` |

### Transiciones

```text
BuyerLogin   → BuyerCatalog    (replace, post-login)
BuyerCatalog → ServiceDetail   (navigate/push)
ServiceDetail → BuyerCatalog   (goBack)
BuyerCatalog → BuyerLogin      (replace, logout)
```

---

## Frontend: UI Contract por pantalla

### `BuyerCatalogScreen`

| Elemento | Cuándo visible | Behavior |
|----------|----------------|----------|
| `ActivityIndicator` | `loading=true` | Carga inicial del catálogo |
| Lista de servicios (`FlatList`) | servicios cargados, lista no vacía | Cada ítem muestra título, categoría y precio mínimo |
| Fila de filtro por categoría (`ScrollView` horizontal) | categorías cargadas | Chips: "Todas" + una por categoría; activo = resaltado |
| Mensaje vacío | lista filtrada = `[]` | Texto según si hay filtro activo o no |
| Mensaje de error + botón "Reintentar" | `error != null` | Permite recargar el catálogo |

### `ServiceDetailScreen`

| Elemento | Cuándo visible | Behavior |
|----------|----------------|----------|
| `ActivityIndicator` | `loading=true` | Carga del detalle |
| Título, descripción, categoría | servicio cargado | Siempre visibles |
| Lista de paquetes | `packages.length > 0` | Nombre, alcance, precio, plazo |
| Galería de imágenes (`ScrollView` horizontal) | `images.length > 0` | Imágenes desplazables |
| Mensaje de error | `error != null` | Si no se pudo cargar el detalle |

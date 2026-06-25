# Data Model: Catálogo de Comprador

**Feature**: `005-buyer-catalog`
**Date**: 2026-06-24

## Entidades

### Servicio Publicado (vista del Comprador)

Proyección del servicio devuelta por `GET /api/v1/services` para el catálogo.
Solo servicios con `status = PUBLISHED`.

**Ítem de lista** (respuesta del endpoint de catálogo):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (UUID) | Identificador único del servicio |
| `title` | `string` | Título del servicio |
| `categoryId` | `string` (UUID) | ID de la categoría |
| `categoryName` | `string` | Nombre de la categoría (resuelto en el backend) |
| `minPrice` | `number` | Precio del paquete más económico |
| `packageCount` | `number` | Cantidad de paquetes disponibles |

**Detalle completo** (respuesta de `GET /api/v1/services/:id`):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Identificador único |
| `title` | `string` | Título del servicio |
| `description` | `string` | Descripción completa |
| `categoryId` | `string` | ID de la categoría |
| `status` | `'PUBLISHED'` | Solo publicados accesibles al Comprador |
| `packages` | `Package[]` | Lista de paquetes de contratación |
| `images` | `Image[]` | Lista de imágenes con `imageUrl` |

---

### Paquete de Contratación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Identificador único |
| `name` | `string` | Nombre del paquete (ej. "Básico") |
| `scope` | `string` | Descripción del alcance |
| `price` | `number` | Precio en unidad monetaria |
| `deliveryDays` | `number` | Días de entrega |
| `displayOrder` | `number` | Orden de presentación |

---

### Categoría

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Identificador único |
| `name` | `string` | Nombre visible (ej. "Desarrollo") |
| `slug` | `string` | Identificador legible (ej. "development") |

---

## Estado local de las pantallas

### BuyerCatalogScreen

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `services` | `Service[]` | Lista de servicios publicados cargados |
| `categories` | `Category[]` | Lista de categorías para el filtro |
| `selectedCategory` | `string \| null` | ID de la categoría seleccionada; `null` = "Todas" |
| `loading` | `boolean` | `true` durante la carga inicial |
| `error` | `string \| null` | Mensaje de error si falla la carga |

### ServiceDetailScreen

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `service` | `Service \| null` | Datos completos del servicio |
| `loading` | `boolean` | `true` durante la carga |
| `error` | `string \| null` | Mensaje de error si falla la carga |

---

## Flujo de datos

```text
BuyerCatalogScreen monta
  → getCatalog(categoryId?)       → GET /api/v1/services?status=PUBLISHED[&categoryId=X]
  → getCategories()               → GET /api/v1/categories
  → renderiza lista filtrada

Usuario toca un servicio
  → navigation.navigate('ServiceDetail', { serviceId })

ServiceDetailScreen monta
  → getService(serviceId)         → GET /api/v1/services/:id
  → renderiza detalle completo

Usuario pulsa "Volver"
  → navigation.goBack()
  → BuyerCatalogScreen preserva selectedCategory en estado local
```

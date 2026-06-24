# Data Model: Publicación de Servicio con Gestión de Estado

## Entidad: Servicio (`Service`) — existente, sin cambios de esquema

| Campo        | Tipo    | Valores posibles          | Descripción                             |
|--------------|---------|---------------------------|-----------------------------------------|
| `id`         | string  | UUID                      | Identificador único                     |
| `title`      | string  | max 80 chars              | Título del servicio                     |
| `description`| string  | max 1200 chars            | Descripción detallada                   |
| `categoryId` | string  | UUID de categoría válida  | Categoría a la que pertenece            |
| `status`     | string  | `'DRAFT'` \| `'PUBLISHED'`| Estado actual del servicio              |
| `freelancerId` | string | UUID del usuario          | Propietario del servicio                |
| `createdAt`  | string  | ISO 8601                  | Fecha de creación                       |
| `updatedAt`  | string  | ISO 8601                  | Fecha de última modificación            |

> No se agrega ningún campo nuevo. El `status` ya existe en el store in-memory.

## Transición de estados del servicio

```
[nuevo servicio]
      │
      ▼
   DRAFT  ──── "Guardar y publicar" (éxito) ────►  PUBLISHED
      ▲                                                 │
      │                                                 │
      │◄── publicación fallida (permanece en DRAFT)     │
      │◄── "Despublicar" ───────────────────────────────┘
      │◄── edición que invalida requisitos (X-Auto-Unpublished: true)
```

## Requisitos mínimos para publicar (ya existentes en `validatePublish`)

- `title`: no vacío
- `description`: no vacío
- `categoryId`: presente y válido
- Al menos 1 paquete con `name`, `scope`, `price > 0` y `deliveryDays > 0` (entero)

## Estado del error de publicación (UI)

No es una entidad persistida. Es estado local de pantalla:

| Campo           | Tipo           | Descripción                                              |
|-----------------|----------------|----------------------------------------------------------|
| `publishError`  | string \| null | Mensaje de error inline tras publicación fallida         |
| `missingFields` | string[]       | Lista de campos faltantes retornada por el servidor (422) |

El `publishError` se limpia al intentar publicar nuevamente o al navegar fuera de la pantalla.

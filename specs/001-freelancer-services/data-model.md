# Data Model: Gestión de Servicios del Freelancer

> Implementado como store in-memory (JavaScript `Map`) en Node.js.
> Sin base de datos externa. Los datos no persisten entre reinicios del contenedor.

## Entidades

### Category (Categoría)

Predefinida al inicializar el servidor. Solo lectura para freelancers.

| Campo | Tipo     | Restricciones          |
|-------|----------|------------------------|
| id    | string   | UUID v4, PK            |
| name  | string   | Not null, max 60 chars |
| slug  | string   | Único, URL-friendly    |

**Seed inicial** (cargado al arrancar el contenedor):
`development`, `design`, `writing`, `marketing`, `video`, `music`, `programming`, `business`

---

### Service (Servicio)

Entidad central. Pertenece a un freelancer. Contiene referencias a sus paquetes
e imágenes (almacenados en sus propios stores).

| Campo        | Tipo                   | Restricciones                        |
|--------------|------------------------|--------------------------------------|
| id           | string                 | UUID v4, PK                          |
| title        | string                 | Not null, 1–80 chars                 |
| description  | string                 | Nullable, max 1200 chars             |
| categoryId   | string                 | FK → Category.id, nullable           |
| status       | `'DRAFT'│'PUBLISHED'`  | Default `'DRAFT'`                    |
| freelancerId | string                 | Not null, del JWT (no modificable)   |
| createdAt    | string (ISO 8601)      | Set al crear, inmutable              |
| updatedAt    | string (ISO 8601)      | Actualizado en cada PUT              |

**Regla de publicación** (evaluada server-side antes de cambiar a PUBLISHED):
- `title` not null y not empty
- `description` not null y not empty
- `categoryId` referencia una categoría existente
- Al menos 1 `Package` asociado válido (nombre, alcance, precio > 0, deliveryDays > 0)

**Regla de despublicación automática** (evaluada al guardar cambios):
Si el servicio estaba PUBLISHED y tras la edición ya no cumple los requisitos
mínimos, su estado pasa automáticamente a DRAFT.

**Eliminación**: Solo posible en estado DRAFT. En estado PUBLISHED retorna HTTP 409.

---

### Package (Paquete de Contratación)

Asociado a un Service. Un servicio tiene entre 1 y 3 paquetes.

| Campo        | Tipo              | Restricciones                              |
|--------------|-------------------|--------------------------------------------|
| id           | string            | UUID v4, PK                                |
| serviceId    | string            | FK → Service.id, not null                  |
| name         | string            | Not null, 1–50 chars                       |
| scope        | string            | Not null, 1–500 chars                      |
| price        | number            | Decimal > 0 (dos decimales en respuesta)   |
| deliveryDays | number            | Entero positivo ≥ 1                        |
| displayOrder | number            | 1, 2 o 3; único por servicio               |

**Cardinalidad**: 1 Service → 1..3 Packages (validado al publicar y al guardar).

**Cascada**: Al eliminar un Service (DRAFT), se eliminan todos sus Packages del store.

---

### ServiceImage (Imagen del Servicio)

Almacena el buffer binario de la imagen en memoria. El store devuelve solo
metadatos; el buffer se sirve por un endpoint separado.

| Campo        | Tipo              | Restricciones                             |
|--------------|-------------------|-------------------------------------------|
| id           | string            | UUID v4, PK                               |
| serviceId    | string            | FK → Service.id, not null                 |
| imageBuffer  | Buffer            | Contenido binario en memoria, max ~5 MB   |
| mimeType     | string            | `'image/jpeg'│'image/png'│'image/webp'`   |
| displayOrder | number            | 1–5; único por servicio                   |
| uploadedAt   | string (ISO 8601) | Set al subir                              |

**URL de acceso**: `/api/v1/images/:id` — el backend sirve el buffer con el
`Content-Type` apropiado.

**Cardinalidad**: 1 Service → 0..5 ServiceImages.

**Cascada**: Al eliminar un Service (DRAFT), se eliminan todas sus imágenes del store.

---

## Diagrama de Relaciones

```
Category  1 ──────── * Service
                         |
                    1    |    1
                   ┌─────┴─────┐
                   │           │
                 1..3         0..5
                Package   ServiceImage
```

---

## Store In-Memory (estructura Node.js)

```js
// Inicializado al arrancar el servidor
const store = {
  categories: new Map(),   // Map<id, Category>
  services:   new Map(),   // Map<id, Service>
  packages:   new Map(),   // Map<id, Package>
  images:     new Map(),   // Map<id, ServiceImage>
};
```

Los servicios se consultan filtrando el store por `freelancerId` y `status`.
La paginación se implementa con `Array.from(store.services.values()).slice(offset, offset + limit)`.

---

## Transiciones de Estado del Servicio

```
[Nuevo]
   │
   ▼
DRAFT ──── publish() ──▶ PUBLISHED
  │            ▲              │
  │            └── unpublish() ──┘
  │            └── auto-unpublish (falta requisito mínimo)
  │
delete() ──▶ [Eliminado del store]
```

- `publish()`: valida requisitos; ERROR 422 si falla validación.
- `unpublish()`: siempre válido desde PUBLISHED.
- `auto-unpublish`: ocurre al guardar cambios (PUT) si el servicio queda inválido.
- `delete()`: solo desde DRAFT; ERROR 409 si está PUBLISHED.

# API Contract: Gestión de Servicios del Freelancer

**Base URL**: `http://<DOCKER_HOST>:3000`
**Versión**: v1
**Autenticación**: Bearer JWT en header `Authorization: Bearer <token>` (requerido en todos los endpoints excepto `GET /api/v1/categories`)

---

## Categorías

### GET /api/v1/categories

Lista todas las categorías disponibles. Público (no requiere auth).

**Response 200**
```json
[
  { "id": "uuid", "name": "Programación", "slug": "programming" },
  { "id": "uuid", "name": "Diseño",       "slug": "design" }
]
```

---

## Servicios propios del Freelancer

### GET /api/v1/services/my

Lista los servicios del freelancer autenticado, separados por estado.
Soporta paginación y filtro por estado.

**Query params**

| Param  | Tipo   | Default | Descripción                           |
|--------|--------|---------|---------------------------------------|
| status | string | (todos) | `DRAFT` o `PUBLISHED`                 |
| page   | int    | 0       | Número de página (base 0)             |
| limit  | int    | 20      | Cantidad de ítems por página (max 50) |

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Desarrollo de sitio web",
      "status": "PUBLISHED",
      "categoryId": "uuid",
      "packageCount": 2,
      "imageCount": 3,
      "updatedAt": "2026-06-23T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 20,
    "total": 5
  }
}
```

**Response 401** — Token ausente o inválido.

---

### POST /api/v1/services

Crea un nuevo servicio en estado `DRAFT`.

**Request body**
```json
{
  "title": "Desarrollo de sitio web",
  "description": "Creo sitios web modernos...",
  "categoryId": "uuid"
}
```

| Campo       | Requerido | Restricciones             |
|-------------|-----------|---------------------------|
| title       | No        | max 80 chars              |
| description | No        | max 1200 chars            |
| categoryId  | No        | UUID de categoría válida  |

*Todos los campos son opcionales al crear (el servicio nace como DRAFT).*

**Response 201**
```json
{
  "id": "uuid",
  "title": "Desarrollo de sitio web",
  "description": "Creo sitios web modernos...",
  "categoryId": "uuid",
  "status": "DRAFT",
  "freelancerId": "uuid",
  "packages": [],
  "images": [],
  "createdAt": "2026-06-23T10:00:00Z",
  "updatedAt": "2026-06-23T10:00:00Z"
}
```

**Response 400** — Campos con formato inválido (e.g. title supera 80 chars).
**Response 401** — Token ausente o inválido.

---

### GET /api/v1/services/:id

Obtiene el detalle completo de un servicio. Solo el propietario puede ver servicios en estado DRAFT.

**Response 200**
```json
{
  "id": "uuid",
  "title": "Desarrollo de sitio web",
  "description": "Creo sitios web modernos...",
  "categoryId": "uuid",
  "status": "DRAFT",
  "freelancerId": "uuid",
  "packages": [
    {
      "id": "uuid",
      "name": "Básico",
      "scope": "Landing page de 1 página",
      "price": 150.00,
      "deliveryDays": 3,
      "displayOrder": 1
    }
  ],
  "images": [
    {
      "id": "uuid",
      "imageUrl": "/api/v1/images/uuid",
      "displayOrder": 1,
      "uploadedAt": "2026-06-23T10:00:00Z"
    }
  ],
  "createdAt": "2026-06-23T10:00:00Z",
  "updatedAt": "2026-06-23T10:00:00Z"
}
```

**Response 401** — No autenticado.
**Response 403** — El servicio existe pero no pertenece al freelancer autenticado.
**Response 404** — Servicio no encontrado.

---

### PUT /api/v1/services/:id

Actualiza campos del servicio. Si tras la actualización el servicio PUBLISHED deja
de cumplir los requisitos mínimos, pasa automáticamente a DRAFT.

**Request body** (todos los campos opcionales — se actualizan solo los enviados)
```json
{
  "title": "Desarrollo web profesional",
  "description": "Descripción actualizada...",
  "categoryId": "uuid",
  "packages": [
    {
      "id": "uuid",
      "name": "Básico",
      "scope": "Landing page de 1 página",
      "price": 180.00,
      "deliveryDays": 3,
      "displayOrder": 1
    },
    {
      "name": "Estándar",
      "scope": "Sitio de hasta 5 páginas",
      "price": 350.00,
      "deliveryDays": 7,
      "displayOrder": 2
    }
  ]
}
```

*El array `packages` es un reemplazo completo: los paquetes no incluidos se eliminan.*
*Máximo 3 paquetes por servicio.*

**Response 200** — Objeto Service completo (igual que GET).
**Response 400** — Validación fallida (e.g. más de 3 paquetes, precio ≤ 0).
**Response 401** — No autenticado.
**Response 403** — No es el propietario del servicio.
**Response 404** — Servicio no encontrado.

**Nota**: Si el servicio pasa automáticamente a DRAFT, la respuesta incluye
`"status": "DRAFT"` y el header `X-Auto-Unpublished: true`.

---

### DELETE /api/v1/services/:id

Elimina permanentemente un servicio. Solo posible en estado DRAFT.

**Response 204** — Eliminado correctamente (sin body).
**Response 401** — No autenticado.
**Response 403** — No es el propietario.
**Response 404** — Servicio no encontrado.
**Response 409** — El servicio está PUBLISHED; debe despublicarse primero.

---

### POST /api/v1/services/:id/publish

Publica el servicio. Valida requisitos mínimos antes de cambiar el estado.

**Request body**: vacío `{}`

**Response 200** — Objeto Service con `"status": "PUBLISHED"`.
**Response 401** — No autenticado.
**Response 403** — No es el propietario.
**Response 404** — Servicio no encontrado.
**Response 422** — Validación fallida. Body incluye los campos faltantes o inválidos:
```json
{
  "error": "PUBLISH_VALIDATION_FAILED",
  "missing": ["packages"],
  "message": "El servicio debe tener al menos un paquete de contratación válido para publicarse."
}
```

---

### POST /api/v1/services/:id/unpublish

Despublica el servicio (PUBLISHED → DRAFT).

**Request body**: vacío `{}`

**Response 200** — Objeto Service con `"status": "DRAFT"`.
**Response 401** — No autenticado.
**Response 403** — No es el propietario.
**Response 404** — Servicio no encontrado.

---

## Imágenes del Servicio

### POST /api/v1/services/:id/images

Sube una imagen al servicio. Máximo 5 imágenes por servicio.

**Request**: `multipart/form-data`

| Campo | Tipo | Descripción                          |
|-------|------|--------------------------------------|
| image | file | Archivo JPG, PNG o WebP, max 5 MB    |
| displayOrder | int | Posición (1–5); opcional, se asigna automáticamente si se omite |

**Response 201**
```json
{
  "id": "uuid",
  "serviceId": "uuid",
  "imageUrl": "/api/v1/images/uuid",
  "displayOrder": 1,
  "uploadedAt": "2026-06-23T10:00:00Z"
}
```

**Response 400** — Formato inválido, tamaño excede 5 MB, o tipo de archivo no permitido.
**Response 401** — No autenticado.
**Response 403** — No es el propietario.
**Response 404** — Servicio no encontrado.
**Response 409** — El servicio ya tiene 5 imágenes.

---

### DELETE /api/v1/services/:id/images/:imageId

Elimina una imagen del servicio.

**Response 204** — Eliminada correctamente.
**Response 401** — No autenticado.
**Response 403** — No es el propietario del servicio.
**Response 404** — Servicio o imagen no encontrada.

---

## Imágenes (Servicio de Archivos)

### GET /api/v1/images/:imageId

Sirve el contenido binario de la imagen almacenada en memoria.

**Response 200** — Binary body con `Content-Type: image/jpeg | image/png | image/webp`.
**Response 404** — Imagen no encontrada.

*Este endpoint es público (sin auth) para permitir que React Native cargue imágenes
sin complicar las peticiones del componente `<Image />`.*

---

## Códigos de Error Estándar

| HTTP | Código de error           | Descripción                                      |
|------|---------------------------|--------------------------------------------------|
| 400  | VALIDATION_ERROR          | Campos con formato inválido                      |
| 401  | UNAUTHORIZED              | Token JWT ausente, expirado o inválido           |
| 403  | FORBIDDEN                 | Autenticado pero sin permiso sobre este recurso  |
| 404  | NOT_FOUND                 | Recurso no existe                                |
| 409  | CONFLICT                  | Operación inválida en el estado actual           |
| 422  | UNPROCESSABLE_ENTITY      | Entidad inválida para la acción solicitada       |
| 500  | INTERNAL_ERROR            | Error inesperado del servidor                    |

**Body de error estándar**:
```json
{
  "error": "CODIGO_ERROR",
  "message": "Descripción legible del error"
}
```

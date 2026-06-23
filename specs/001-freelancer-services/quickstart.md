# Quickstart: Validación de Gestión de Servicios del Freelancer

Guía para verificar end-to-end que la feature funciona correctamente.

## Prerequisitos

- Docker Desktop instalado y corriendo.
- `curl` o un cliente HTTP (Postman, Bruno, Insomnia).
- Un token JWT válido de un usuario con rol `freelancer` (emitido por la feature de autenticación, o generado manualmente para pruebas).

Sustituir en los comandos:
- `<TOKEN>` → JWT del freelancer autenticado
- `<HOST>` → IP del host Docker (e.g. `localhost` o `192.168.1.x` desde el dispositivo)
- `<ID>` → UUID del recurso creado en el paso anterior

---

## Levantar el backend

```bash
docker build -t freelancehub-backend ./backend
docker run -p 3000:3000 --name freelancehub freelancehub-backend
```

Verificar que el servidor responde:
```bash
curl http://<HOST>:3000/api/v1/categories
# Esperado: array de categorías JSON
```

---

## User Story 1 — Crear y Publicar un Servicio (P1)

### Paso 1: Crear servicio como borrador

```bash
curl -X POST http://<HOST>:3000/api/v1/services \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Diseño de logo profesional",
    "description": "Diseño logos únicos y memorables para tu marca...",
    "categoryId": "<ID_CATEGORIA_DESIGN>"
  }'
```

**Esperado**: HTTP 201 con `"status": "DRAFT"` y `"packages": []`.
Guardar el `id` del servicio creado como `<SERVICE_ID>`.

### Paso 2: Intentar publicar sin paquetes (debe fallar)

```bash
curl -X POST http://<HOST>:3000/api/v1/services/<SERVICE_ID>/publish \
  -H "Authorization: Bearer <TOKEN>"
```

**Esperado**: HTTP 422 con `"error": "PUBLISH_VALIDATION_FAILED"` y `"missing": ["packages"]`.

### Paso 3: Agregar un paquete de contratación

```bash
curl -X PUT http://<HOST>:3000/api/v1/services/<SERVICE_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "packages": [
      {
        "name": "Básico",
        "scope": "1 concepto, 2 revisiones, archivos PNG",
        "price": 50.00,
        "deliveryDays": 3,
        "displayOrder": 1
      }
    ]
  }'
```

**Esperado**: HTTP 200, `"packages"` contiene el paquete agregado.

### Paso 4: Publicar el servicio

```bash
curl -X POST http://<HOST>:3000/api/v1/services/<SERVICE_ID>/publish \
  -H "Authorization: Bearer <TOKEN>"
```

**Esperado**: HTTP 200 con `"status": "PUBLISHED"`.

### Verificar en lista de servicios propios

```bash
curl http://<HOST>:3000/api/v1/services/my?status=PUBLISHED \
  -H "Authorization: Bearer <TOKEN>"
```

**Esperado**: El servicio aparece en `data[]` con `"status": "PUBLISHED"`.

---

## User Story 2 — Editar un Servicio (P2)

### Editar el precio de un paquete

```bash
curl -X PUT http://<HOST>:3000/api/v1/services/<SERVICE_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "packages": [
      {
        "id": "<PACKAGE_ID>",
        "name": "Básico",
        "scope": "1 concepto, 2 revisiones, archivos PNG",
        "price": 75.00,
        "deliveryDays": 3,
        "displayOrder": 1
      }
    ]
  }'
```

**Esperado**: HTTP 200, el paquete refleja `"price": 75.00`. El servicio sigue PUBLISHED.

### Verificar despublicación automática al eliminar último paquete

```bash
curl -X PUT http://<HOST>:3000/api/v1/services/<SERVICE_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "packages": [] }'
```

**Esperado**: HTTP 200 con `"status": "DRAFT"` y header `X-Auto-Unpublished: true`.

### Verificar bloqueo de acceso ajeno

```bash
curl -X PUT http://<HOST>:3000/api/v1/services/<SERVICE_ID> \
  -H "Authorization: Bearer <TOKEN_OTRO_FREELANCER>"
```

**Esperado**: HTTP 403.

### Eliminar un borrador

```bash
curl -X DELETE http://<HOST>:3000/api/v1/services/<SERVICE_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

**Esperado**: HTTP 204 (sin body). El servicio ya no aparece en `GET /api/v1/services/my`.

---

## User Story 3 — Gestionar Multimedia (P3)

*Prerequisito: Tener un servicio existente (DRAFT o PUBLISHED) con `<SERVICE_ID>`.*

### Subir una imagen

```bash
curl -X POST http://<HOST>:3000/api/v1/services/<SERVICE_ID>/images \
  -H "Authorization: Bearer <TOKEN>" \
  -F "image=@/ruta/a/imagen.jpg" \
  -F "displayOrder=1"
```

**Esperado**: HTTP 201 con `"imageUrl": "/api/v1/images/<IMAGE_ID>"`.

### Verificar que la imagen es accesible

```bash
curl http://<HOST>:3000/api/v1/images/<IMAGE_ID> --output imagen_descargada.jpg
```

**Esperado**: Archivo de imagen descargado correctamente.

### Verificar límite de 5 imágenes

Subir 4 imágenes más. Al intentar subir la sexta:

```bash
curl -X POST http://<HOST>:3000/api/v1/services/<SERVICE_ID>/images \
  -H "Authorization: Bearer <TOKEN>" \
  -F "image=@/ruta/a/imagen6.jpg"
```

**Esperado**: HTTP 409 con `"error": "CONFLICT"`.

### Verificar rechazo de formato inválido

```bash
curl -X POST http://<HOST>:3000/api/v1/services/<SERVICE_ID>/images \
  -H "Authorization: Bearer <TOKEN>" \
  -F "image=@/ruta/a/documento.pdf"
```

**Esperado**: HTTP 400 con mención del formato permitido.

### Eliminar una imagen

```bash
curl -X DELETE http://<HOST>:3000/api/v1/services/<SERVICE_ID>/images/<IMAGE_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

**Esperado**: HTTP 204.

---

## Criterios de éxito (referencia a spec)

Ver [`spec.md`](./spec.md) sección *Success Criteria* para los criterios completos.
Ver [`contracts/services-api.md`](./contracts/services-api.md) para los códigos HTTP esperados.
Ver [`data-model.md`](./data-model.md) para las reglas de validación de entidades.

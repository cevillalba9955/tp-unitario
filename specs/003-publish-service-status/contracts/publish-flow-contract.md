# Contrato: Flujo de Publicación y Gestión de Estado

## Backend (existente, sin cambios)

### POST /api/v1/services/:id/publish

**Éxito** (`200 OK`):
```json
{
  "id": "uuid",
  "status": "PUBLISHED",
  "title": "...",
  ...
}
```

**Fallo por datos incompletos** (`422 Unprocessable Entity`):
```json
{
  "error": "PUBLISH_VALIDATION_FAILED",
  "missing": ["title", "categoryId", "packages"],
  "message": "El servicio no cumple los requisitos mínimos para publicarse."
}
```

Los valores posibles en `missing`:
- `"title"` — título vacío
- `"description"` — descripción vacía
- `"categoryId"` — sin categoría
- `"packages"` — sin paquetes válidos (precio > 0, plazo > 0)

---

## Frontend: Contrato de UX por pantalla

### CreateServiceScreen — handleSaveAndPublish

| Paso | Acción | Resultado esperado en UI |
|------|--------|--------------------------|
| 1 | `createService(payload)` falla | Mostrar error genérico; NO navegar |
| 2 | `createService` ok, `publishService` ok | Navegar a lista (`navigation.goBack()`) |
| 3 | `createService` ok, `publishService` falla (422) | Mostrar mensaje: "Tu servicio fue guardado como borrador. Revisá los campos faltantes: {missing.join(', ')}." + `navigation.goBack()` |
| 4 | `createService` ok, `publishService` falla (otro error) | Mostrar error genérico + `navigation.goBack()` |

> En el paso 3 y 4, el borrador YA está en el servidor. Navegar a la lista permite al usuario verlo y editarlo.

### EditServiceScreen — handlePublish

| Acción | Resultado esperado en UI |
|--------|--------------------------|
| `publishService` ok | `service.status` → `'PUBLISHED'`; estado visible actualizado; `publishError` → null |
| `publishService` falla (422) | `publishError` = "El servicio permanece como borrador. Campos faltantes: {missing.join(', ')}." (texto inline, no Alert) |
| `publishService` falla (otro) | `publishError` = mensaje genérico de error (texto inline) |
| Usuario intenta publicar de nuevo | `publishError` limpiado antes del intento |

### ServiceCard — handlePublish (sin cambios de comportamiento)

| Acción | Resultado esperado |
|--------|--------------------|
| `publishService` ok | `onRefresh()` recarga la lista; badge cambia a "Publicado" |
| `publishService` falla | `Alert.alert` con campos faltantes (comportamiento actual conservado) |

# Data Model: Carga de Datos de Paquete de Contratación

## Entidad: Paquete (`Package`)

Representa una opción de contratación dentro de un servicio.

| Campo          | Tipo    | Restricciones                          | Descripción                         |
|----------------|---------|----------------------------------------|-------------------------------------|
| `name`         | string  | Requerido, no vacío, max 50 chars      | Nombre del paquete (ej. "Básico")   |
| `scope`        | string  | Requerido, no vacío, max 500 chars     | Alcance / descripción del paquete   |
| `price`        | number  | Requerido, > 0, decimal permitido      | Precio en la moneda del proyecto    |
| `deliveryDays` | integer | Requerido, > 0, entero                 | Plazo de entrega en días naturales  |
| `displayOrder` | integer | Asignado por la pantalla padre (1-based) | Orden de presentación en el servicio |

> `displayOrder` no es editado por el usuario en el modal; lo asigna `CreateServiceScreen`/`EditServiceScreen` al armar el payload final.

## Estado del Modal

El componente `PackageFormModal` mantiene estado local durante la sesión de edición:

| Campo           | Tipo    | Descripción                                        |
|-----------------|---------|----------------------------------------------------|
| `draft`         | object  | Copia de trabajo de los campos del paquete         |
| `errors`        | object  | Mapa `{ name?, scope?, price?, deliveryDays? }` con mensajes de error |

## Flujo de estado

```
[padre abre modal]
    ↓
initialData → draft (copia; null = campos vacíos)
errors = {}
    ↓
[usuario edita campos]
    ↓
[usuario pulsa Guardar]
    ↓
validate(draft)
    ├── errores → errors = {...}; modal no se cierra
    └── sin errores → onConfirm(draft); padre cierra modal
    ↓
[usuario pulsa Cancelar]
    ↓
onCancel(); padre cierra modal
```

## Relación con el backend

Las reglas de validación del modal son un subconjunto de las validadas por
`backend/src/validators/serviceValidator.js`. El servidor sigue siendo la
fuente de verdad para la integridad del dato.

# Research: Carga de Datos de Paquete de Contratación (Modal)

## Contexto del estado actual

El `PackageForm.js` existente es un formulario **inline** renderizado directamente
dentro de `CreateServiceScreen.js` y `EditServiceScreen.js`. No tiene:
- Presentación como modal
- Validación cliente-side antes de guardar
- Mensajes de error por campo

El `serviceValidator.js` del backend ya define las reglas:
- `name`: texto, no vacío, max 50 chars
- `scope`: texto, no vacío, max 500 chars
- `price`: número positivo (> 0)
- `deliveryDays`: entero positivo (> 0)

---

## Decision 1: Estrategia de Modal en React Native

**Decision**: Usar el componente `Modal` nativo de React Native (no librería externa).

**Rationale**: El proyecto no usa librerías de UI externas para modales (no hay
`react-native-modal`, `@gorhom/bottom-sheet`, etc. en las dependencias). El `Modal`
de React Native core es suficiente para la UI solicitada, evita dependencias nuevas
y es compatible con Expo Go sin configuración adicional.

**Alternatives considered**:
- `react-native-modal`: más animaciones, pero dependencia extra innecesaria
- Bottom sheet: patrón diferente al pedido (modal)
- Mantenerse inline: descartado, contradice el requerimiento de modal

---

## Decision 2: Dónde vive la validación cliente

**Decision**: La validación se ejecuta en el hook `onSave` del `PackageFormModal`,
antes de cerrar el modal. Los errores se almacenan en estado local del modal
(`errors: { name, scope, price, deliveryDays }`). El modal NO se cierra si hay errores.

**Rationale**: La validación es responsabilidad del componente modal mismo, no del
padre, para mantener la lógica encapsulada y reutilizable (FR-003, FR-008).
El padre solo recibe el paquete válido via callback `onConfirm(pkg)`.

**Alternatives considered**:
- Validar en el padre antes de llamar al modal: descartado, rompe encapsulamiento
- Validar solo en servidor: permitido como regla de negocio pero el cliente debe dar
  feedback inmediato (FR-003, FR-008)

---

## Decision 3: API del componente modal

**Decision**: El componente `PackageFormModal` expone esta interfaz:

```
props:
  visible: boolean          — controla visibilidad del modal
  initialData: object|null  — null = modo "Agregar", objeto = modo "Editar"
  onConfirm(pkg): void      — callback con datos válidos; el padre cierra el modal
  onCancel(): void          — callback de cancelar; el padre cierra el modal
```

El modal no maneja su propia visibilidad; el padre decide cuándo mostrarlo
(patrón controlled component). El modal llama `onConfirm` solo cuando pasa validación.

**Rationale**: Controla el padre la visibilidad para poder manejar listas de paquetes
(índice editado, agregar vs. editar). Esto mantiene el modal stateless en cuanto
a apertura/cierre, solo stateful para los campos y errores internos.

---

## Decision 4: Refactorización de pantallas existentes

**Decision**: `CreateServiceScreen.js` reemplaza el uso inline de `PackageForm` por
`PackageFormModal`. El `PackageForm.js` existente puede eliminarse o mantenerse
como componente base interno de `PackageFormModal` (sin cambio de API pública).

**Rationale**: Reutilizar el layout de `PackageForm` dentro del modal evita duplicar
código de campos. El modal agrega la capa de visibilidad y validación encima.

**Alternatives considered**:
- Reescribir todo de cero: innecesario, los campos ya funcionan bien
- Mantener ambos en paralelo: innecesario para el scope del TP

---

## Reglas de validación cliente (consistentes con backend)

| Campo          | Regla                                          | Mensaje de error sugerido                      |
|----------------|------------------------------------------------|------------------------------------------------|
| `name`         | No vacío, no solo espacios, max 50 chars       | "El nombre es obligatorio"                     |
| `scope`        | No vacío, no solo espacios, max 500 chars      | "El alcance/descripción es obligatorio"        |
| `price`        | Número > 0                                     | "El precio debe ser un número mayor a cero"    |
| `deliveryDays` | Entero > 0                                     | "El plazo debe ser un número entero positivo"  |

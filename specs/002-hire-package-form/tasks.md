# Tasks: Carga de Datos de Paquete de Contratación (Modal)

**Input**: Design documents from `/specs/002-hire-package-form/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: No solicitados. Validación manual via `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario para implementación y prueba independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias incompletas)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2, US3)

---

## Phase 1: Setup (Infraestructura compartida)

**Purpose**: Verificación del entorno y estructura previa a la implementación.
Solo frontend; no hay cambios de backend ni dependencias nuevas.

- [x] T001 Verificar que `frontend/src/components/services/PackageForm.js` existe y revisar su API actual
- [x] T002 Verificar que `frontend/src/screens/freelancer/CreateServiceScreen.js` renderiza `PackageForm` inline con props `value`, `onChange`, `onRemove`, `index`

**Checkpoint**: Estructura existente comprendida — implementación puede comenzar.

---

## Phase 2: Foundational (Prerequisitos bloqueantes)

**Purpose**: Lógica de validación reutilizable que necesitan todas las historias.

**⚠️ CRITICAL**: US1, US2 y US3 dependen de este módulo de validación.

- [x] T003 Crear función `validatePackage(draft)` en `frontend/src/components/services/PackageFormModal.js` que retorna `{ valid: boolean, errors: { name?, scope?, price?, deliveryDays? } }` según las reglas de `research.md` (nombre no vacío, alcance no vacío, precio > 0, plazo entero > 0)

**Checkpoint**: Lógica de validación lista — US1, US2 y US3 pueden comenzar.

---

## Phase 3: User Story 1 — Agregar paquete a un servicio (Priority: P1) 🎯 MVP

**Goal**: El freelancer puede abrir un modal desde la pantalla de creación de servicio,
completar los campos de un paquete, validarlos y guardar. El modal no se cierra si
hay errores; se cierra con éxito y el paquete aparece en la lista.

**Independent Test**: Abrir el modal con el botón "+ Agregar paquete" en
`CreateServiceScreen`, completar campos válidos, verificar que el modal se cierra y
el paquete aparece en la lista. Luego abrir de nuevo con campos vacíos y verificar
que el modal no se cierra y muestra errores por campo.

### Implementación US1

- [x] T004 [US1] Crear el componente `PackageFormModal` con estado local `draft` y `errors` en `frontend/src/components/services/PackageFormModal.js`, props: `visible`, `initialData`, `onConfirm`, `onCancel`
- [x] T005 [US1] Implementar el layout del modal en `PackageFormModal.js`: usar `<Modal>` nativo de React Native con overlay semitransparente, título "Agregar paquete", campos nombre, alcance, precio y plazo, botones "Cancelar" y "Guardar"
- [x] T006 [US1] Conectar `validatePackage` (T003) al botón "Guardar" en `PackageFormModal.js`: si hay errores setear `errors` y no invocar `onConfirm`; si es válido invocar `onConfirm(draft)` y limpiar errores
- [x] T007 [US1] Mostrar mensajes de error inline bajo cada campo inválido en `PackageFormModal.js` (usar texto rojo bajo el `TextInput` correspondiente según tabla de mensajes en `contracts/package-modal-contract.md`)
- [x] T008 [US1] Conectar el botón "Cancelar" en `PackageFormModal.js` para invocar `onCancel()` sin ejecutar validación
- [x] T009 [US1] Modificar `frontend/src/screens/freelancer/CreateServiceScreen.js`: agregar estados `modalVisible` y `editingIndex`, reemplazar el render inline de `PackageForm` por `PackageFormModal` con props `visible`, `initialData`, `onConfirm` y `onCancel`, actualizar el botón "+ Agregar paquete" para abrir el modal
- [x] T010 [US1] Actualizar `addPackage` y `updatePackage` en `CreateServiceScreen.js` para recibir el objeto paquete desde `onConfirm(pkg)` del modal (en lugar de crear un paquete vacío inline)

**Checkpoint**: US1 completamente funcional — modal abre, valida, guarda y no cierra con errores. Probar con `quickstart.md` Escenarios 1 y 2.

---

## Phase 4: User Story 2 — Cancelar sin guardar (Priority: P2)

**Goal**: El freelancer puede cerrar el modal en cualquier momento sin guardar cambios.
El estado de la lista de paquetes permanece idéntico al de antes de abrir el modal.

**Independent Test**: Abrir el modal, ingresar texto en "Nombre", pulsar Cancelar.
Verificar que la lista de paquetes en `CreateServiceScreen` no cambia.

### Implementación US2

- [x] T011 [US2] Verificar que el botón "Cancelar" implementado en T008 llama `onCancel()` sin modificar `draft` ni `errors` — no requiere código nuevo si T008 está correcto; documentar resultado
- [x] T012 [US2] Verificar en `CreateServiceScreen.js` que el handler `onCancel` setea `modalVisible(false)` sin modificar el array `packages` — ajustar si T009 no lo contempló

**Checkpoint**: US2 verificada — cancelar desde cualquier estado del modal no altera la lista. Probar con `quickstart.md` Escenario 3.

---

## Phase 5: User Story 3 — Editar paquete existente (Priority: P3)

**Goal**: El freelancer puede editar un paquete ya creado. El modal se abre con los
datos del paquete precargados, permite modificarlos, los valida y guarda. El paquete
actualizado reemplaza al anterior en la lista.

**Independent Test**: Crear un paquete válido (US1), pulsar editar sobre ese paquete,
verificar que el modal abre con los datos precargados, cambiar el precio, guardar y
verificar que la lista muestra el precio actualizado.

### Implementación US3

- [x] T013 [P] [US3] En `PackageFormModal.js`, usar `useEffect` para sincronizar `draft` con `initialData` cuando el modal se abre (cuando `visible` cambia a `true`): si `initialData` no es null, cargar sus valores en `draft`; si es null, inicializar campos vacíos y limpiar `errors`
- [x] T014 [US3] Mostrar título dinámico en el modal: "Agregar paquete" cuando `initialData === null`, "Editar paquete" cuando `initialData` tiene datos — modificar el texto en `PackageFormModal.js`
- [x] T015 [US3] En `CreateServiceScreen.js`, agregar botón de edición por cada paquete en la lista (ícono o texto "Editar") que setee `editingIndex` al índice del paquete y abra el modal (`setModalVisible(true)`)
- [x] T016 [US3] Verificar que `onConfirm` en `CreateServiceScreen.js` distingue modo agregar (`editingIndex === null` → push al array) de modo editar (`editingIndex !== null` → reemplazar el elemento en el índice)

**Checkpoint**: US3 verificada — edición precarga datos, valida y actualiza el paquete existente. Probar con `quickstart.md` Escenario 4.

---

## Phase 6: Polish & Validaciones cruzadas

**Purpose**: Ajustes de UX y consistencia entre historias.

- [x] T017 [P] Verificar y ajustar estilos del modal en `PackageFormModal.js`: overlay oscuro semitransparente, card centrada con `borderRadius`, scroll interno si el contenido supera la pantalla en dispositivos pequeños
- [x] T018 [P] Verificar que `price` se inicializa como string vacío `''` en `draft` y se convierte a `parseFloat` solo al invocar `onConfirm`, para evitar que el campo muestre `NaN` mientras el usuario escribe
- [x] T019 Ejecutar todos los escenarios de `quickstart.md` (1–5) y registrar resultados; corregir cualquier desviación encontrada
- [x] T020 [P] Eliminar o mantener `frontend/src/components/services/PackageForm.js` según si fue reutilizado internamente: si no se usa más, remover el import en `CreateServiceScreen.js`

---

## Dependencies & Execution Order

### Dependencias de fase

- **Phase 1 (Setup)**: Sin dependencias — comenzar inmediatamente
- **Phase 2 (Foundational)**: Depende de Phase 1 — bloquea US1, US2 y US3
- **Phase 3 (US1)**: Depende de Phase 2 — MVP completo al terminar
- **Phase 4 (US2)**: Depende de T008 y T009 (US1) — puede verificarse tras Phase 3
- **Phase 5 (US3)**: Depende de T009 (US1) — puede comenzar en paralelo con US2 tras Phase 3
- **Phase 6 (Polish)**: Depende de todas las historias completadas

### Dependencias dentro de US1

```
T003 (validación)
  └── T004 (componente base)
        ├── T005 (layout modal)
        │     ├── T006 (conectar validación)
        │     ├── T007 (mensajes de error)
        │     └── T008 (cancelar)
        └── T009 (integrar en CreateServiceScreen)
              └── T010 (actualizar addPackage/updatePackage)
```

### Oportunidades de paralelismo

- T001 y T002 pueden ejecutarse en paralelo (archivos distintos)
- T005, T006, T007, T008 pueden comenzar en paralelo una vez T004 esté listo
- T013 y T014 pueden ejecutarse en paralelo (Phase 5)
- T017, T018 y T020 pueden ejecutarse en paralelo (Phase 6)

---

## Parallel Example: US1

```text
# Tras T004 (componente base), lanzar en paralelo:
Task T005: layout del modal (estructura visual)
Task T006: lógica de validación al guardar
Task T007: mensajes de error inline
Task T008: comportamiento de cancelar
```

---

## Implementation Strategy

### MVP First (US1 — Agregar paquete)

1. Completar Phase 1: Setup
2. Completar Phase 2: T003 (validación)
3. Completar Phase 3: T004–T010 (modal + integración)
4. **PARAR y VALIDAR**: Escenarios 1 y 2 de `quickstart.md`
5. Demo del MVP: modal funcional para agregar paquetes con validación

### Incremental Delivery

1. Phase 1 + Phase 2 → validación lista
2. Phase 3 → US1 (agregar paquete con validación) → Demo MVP
3. Phase 4 → US2 (cancelar sin guardar) — mínimo esfuerzo si US1 está bien implementado
4. Phase 5 → US3 (editar paquete existente)
5. Phase 6 → Polish y quickstart completo

---

## Notes

- [P] = archivos distintos, sin dependencias incompletas
- [Story] mapea cada tarea a su historia para trazabilidad
- No se incluyen tests automatizados (no solicitados); usar `quickstart.md` para validación manual
- El backend no cambia; toda la implementación es frontend
- Validación cliente en `PackageFormModal.js` es complementaria a la server-side existente en `backend/src/validators/serviceValidator.js`
- Máximo 3 paquetes por servicio es una regla ya presente en `CreateServiceScreen.js` — no modificar ese límite

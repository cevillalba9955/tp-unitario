# Contrato: PackageFormModal

## Componente React Native

**Ruta**: `frontend/src/components/services/PackageFormModal.js`

### Props

```js
PackageFormModal({
  visible: boolean,           // Controla si el modal está visible
  initialData: Package|null,  // null = modo Agregar; objeto = modo Editar
  onConfirm: (pkg: Package) => void,  // Llamado solo si validación pasa
  onCancel: () => void,       // Llamado al cancelar; sin datos
})
```

### Tipo Package (entrada/salida)

```js
{
  name: string,         // Requerido
  scope: string,        // Requerido
  price: number,        // > 0
  deliveryDays: number, // entero > 0
}
```

### Comportamiento observable

| Acción del usuario                       | Resultado esperado                                                      |
|------------------------------------------|-------------------------------------------------------------------------|
| Pulsar "Guardar" con campos válidos      | `onConfirm(pkg)` se invoca; modal sigue abierto hasta que padre cierre  |
| Pulsar "Guardar" con campos inválidos    | `onConfirm` NO se invoca; mensajes de error visibles por campo          |
| Pulsar "Cancelar"                        | `onCancel()` se invoca; no importa el estado de los campos              |
| Abrir con `initialData` no nulo          | Campos precargados con los valores de `initialData`                     |
| Abrir con `initialData = null`           | Campos vacíos; errores limpios                                          |

### Mensajes de error por campo

| Campo          | Condición de error                | Mensaje                                         |
|----------------|-----------------------------------|-------------------------------------------------|
| `name`         | Vacío o solo espacios             | "El nombre es obligatorio"                      |
| `scope`        | Vacío o solo espacios             | "El alcance es obligatorio"                     |
| `price`        | No es número o ≤ 0               | "El precio debe ser mayor a cero"               |
| `deliveryDays` | No es entero o ≤ 0               | "El plazo debe ser un número entero positivo"   |

### Integración con pantallas existentes

`CreateServiceScreen.js` reemplaza el uso inline de `PackageForm` por este modal:

```js
// Estado en CreateServiceScreen
const [modalVisible, setModalVisible] = useState(false);
const [editingIndex, setEditingIndex] = useState(null);

// Abrir para agregar
<TouchableOpacity onPress={() => { setEditingIndex(null); setModalVisible(true); }}>

// Abrir para editar paquete[i]
<TouchableOpacity onPress={() => { setEditingIndex(i); setModalVisible(true); }}>

// Modal
<PackageFormModal
  visible={modalVisible}
  initialData={editingIndex !== null ? packages[editingIndex] : null}
  onConfirm={(pkg) => {
    if (editingIndex !== null) updatePackage(editingIndex, pkg);
    else addPackage(pkg);
    setModalVisible(false);
  }}
  onCancel={() => setModalVisible(false)}
/>
```

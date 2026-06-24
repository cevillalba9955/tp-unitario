# Quickstart: Validación del Flujo de Publicación con Gestión de Estado

## Prerequisitos

- Backend corriendo en Docker: `docker compose up` desde la raíz del proyecto
- App React Native iniciada: `cd frontend && npx expo start`
- Sesión de freelancer activa

---

## Escenario 1: Publicar un servicio nuevo exitosamente (US1)

1. Navegar a "Crear servicio"
2. Completar: título, descripción, categoría, agregar al menos un paquete válido (via modal)
3. Pulsar **"Guardar y publicar"**
4. **Resultado esperado**:
   - La app navega de vuelta a la lista de servicios
   - En la pestaña "Publicados" aparece el nuevo servicio con badge verde "Publicado"

---

## Escenario 2: Publicar fallido → borrador guardado + mensaje de error (US2)

1. Navegar a "Crear servicio"
2. Ingresar solo el título, sin categoría ni paquetes
3. Pulsar **"Guardar y publicar"**
4. **Resultado esperado**:
   - Aparece mensaje informando que el servicio fue guardado como borrador y listando los campos faltantes (ej. "categoryId, packages")
   - La app navega a la lista de servicios
   - En la pestaña "Borradores" aparece el servicio con badge naranja "Borrador"

---

## Escenario 3: Corregir y republicar tras fallo (US2 continuación)

1. Desde "Borradores", pulsar "Editar" en el servicio del escenario anterior
2. Seleccionar una categoría y agregar un paquete válido
3. Pulsar **"Publicar"** (botón de estado en la pantalla unificada de edición)
4. **Resultado esperado**:
   - El estado del servicio cambia a "Publicado"
   - Badge actualizado a verde en pantalla de edición

---

## Escenario 4: Publicar borrador existente desde lista (US3)

1. Asegurarse de tener un borrador con todos los datos completos (creado por cualquier vía)
2. En la pestaña "Borradores", pulsar **"Publicar"** en el ServiceCard del borrador
3. **Resultado esperado**:
   - La lista se recarga
   - El servicio desaparece de "Borradores" y aparece en "Publicados"

---

## Escenario 5: Publicar borrador incompleto desde CreateServiceScreen (US3 — fallo)

1. Abrir un borrador sin categoría o sin paquetes desde "Editar"
2. Pulsar **"Publicar"** (botón de estado en la pantalla unificada de edición)
3. **Resultado esperado**:
   - Aparece texto de error **inline** (no un Alert emergente) indicando que el servicio permanece como borrador y los campos faltantes
   - El badge de estado sigue mostrando "Borrador"
   - Los datos del formulario permanecen intactos

---

## Escenario 6: Error de conexión durante publicación

1. Detener el backend Docker mientras la app está activa
2. Intentar publicar cualquier servicio
3. **Resultado esperado**:
   - Aparece mensaje de error genérico
   - El estado del servicio no cambia (permanece como DRAFT)
   - No se pierde ningún dato del formulario

---

## Verificación de estados en backend (opcional)

Usar la API directamente para verificar el campo `status`:

```
GET /api/v1/services/my?status=DRAFT    → lista borradores
GET /api/v1/services/my?status=PUBLISHED → lista publicados
GET /api/v1/services/:id                → status del servicio individual
```

# Quickstart: Validación del Modal de Paquete

## Prerequisitos

- Backend corriendo en Docker: `docker compose up` desde la raíz del proyecto
- App React Native iniciada: `cd frontend && npx expo start`
- Sesión de freelancer activa (haber completado el login)

## Escenario 1: Agregar paquete válido

1. Navegar a "Crear servicio"
2. En la sección "Paquetes de contratación", pulsar **"+ Agregar paquete"**
3. Verificar que se abre un modal con campos vacíos
4. Completar:
   - Nombre: `Básico`
   - Alcance: `Un logo en formato PNG y AI`
   - Precio: `150`
   - Plazo (días): `5`
5. Pulsar **Guardar**
6. **Resultado esperado**: modal se cierra; aparece un ítem "Básico" en la lista de paquetes de la pantalla de creación

## Escenario 2: Intento de guardar con campos inválidos

1. Abrir el modal ("+ Agregar paquete")
2. Dejar todos los campos vacíos
3. Pulsar **Guardar**
4. **Resultado esperado**: modal NO se cierra; se muestran mensajes de error bajo cada campo
5. Completar solo "Nombre" y volver a pulsar Guardar
6. **Resultado esperado**: error solo en los campos aún vacíos/inválidos

## Escenario 3: Cancelar sin guardar

1. Abrir el modal
2. Escribir cualquier dato en "Nombre"
3. Pulsar **Cancelar**
4. **Resultado esperado**: modal se cierra; la lista de paquetes no cambió

## Escenario 4: Editar paquete existente

1. Agregar un paquete válido (ver Escenario 1)
2. Pulsar el ícono de edición del paquete creado
3. **Resultado esperado**: modal se abre con los datos del paquete precargados
4. Cambiar el precio a `200`
5. Pulsar **Guardar**
6. **Resultado esperado**: modal se cierra; el paquete muestra el precio actualizado

## Escenario 5: Precio = 0 o negativo

1. Abrir el modal
2. Completar nombre y alcance; ingresar precio `0`
3. Pulsar **Guardar**
4. **Resultado esperado**: error en campo "Precio" — modal no se cierra

## Verificación server-side

Tras guardar el servicio completo (borrador o publicar), verificar con el backend
que los paquetes en la respuesta tienen `price > 0` y `deliveryDays > 0` correctos.

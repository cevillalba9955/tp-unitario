# Research: Gestión de Servicios del Freelancer

## Decisiones de Stack

### Backend

**Decision**: Node.js 20 LTS + Express 4.x ejecutado en contenedor Docker.

**Rationale**: Mandato de la constitución (v1.1.1). Express es el framework REST más
liviano disponible para Node.js, sin opinión sobre estructura de datos, lo que
facilita el store in-memory sin acoplamiento a ORM.

**Alternatives considered**: Fastify (más performante pero innecesario para TP),
NestJS (demasiado opinionated para scope universitario).

---

### Frontend

**Decision**: React Native (Expo managed workflow).

**Rationale**: Mandato de la constitución. Expo simplifica la configuración de
entorno para un TP sin necesidad de Android Studio / Xcode completos. El metro
bundler puede apuntar a la IP del host Docker directamente.

**Alternatives considered**: React Native CLI bare workflow (mayor control pero
mayor overhead de setup).

---

### Persistencia

**Decision**: Almacenamiento en memoria usando `Map` de JavaScript dentro del
proceso Node.js. Los datos NO persisten entre reinicios del contenedor.

**Rationale**: Mandato explícito de la constitución. Para el alcance del TP, la
pérdida de datos al reiniciar es aceptable.

**Alternatives considered**: SQLite in-memory (prohibido por constitución — es
una base de datos externa), LowDB/JSON file (prohibido — filesystem externo).

---

### Almacenamiento de Imágenes

**Decision**: Los archivos de imagen se almacenan como `Buffer` de Node.js en el
store in-memory. El backend los sirve en un endpoint dedicado
(`GET /api/v1/images/:id`). Las referencias en los servicios guardan la ruta
relativa `/api/v1/images/:id`, no un URL externo.

**Rationale**: Cumple la restricción de "sin servicio externo ni filesystem".
Para el TP, el volumen de imágenes es bajo y cabe en memoria sin problema.
React Native puede consumir imágenes via URL HTTP normal apuntando al host Docker.

**Alternatives considered**:
- Base64 en el JSON de respuesta del servicio: descartado porque infla los
  payloads de lista innecesariamente.
- Cloudinary / S3: prohibido por la constitución (servicio externo de
  infraestructura en la nube).

---

### Autenticación

**Decision**: JWT (JSON Web Token). El middleware Express verifica el token en
cada request a endpoints protegidos y extrae el `freelancerId` del payload.

**Rationale**: La spec asume autenticación existente como feature separada.
JWT es stateless, compatible con Docker y con React Native sin cookies.

**Alternatives considered**: Session + Cookie (requiere persistencia de sesiones,
incompatible con el store in-memory puro).

---

### Estructura del Proyecto

**Decision**: Opción Mobile + API (constitución indica frontend React Native +
backend Docker):

```
backend/   → Node.js + Express en Docker
frontend/  → React Native (Expo)
```

**Rationale**: Separación clara entre API y cliente mobile, alineada con la
arquitectura cliente-servidor de la constitución.

---

### Paginación

**Decision**: Paginación offset-based con parámetros `page` (base 0) y `limit`
(default 20) en query string. Implementada filtrando el array in-memory.

**Rationale**: Simple de implementar sin base de datos. Suficiente para el TP.

**Alternatives considered**: Cursor-based pagination (más eficiente pero
innecesaria para volúmenes universitarios).

# FreelanceHub Backend

Node.js 20 + Express — almacenamiento in-memory — contenedor Docker.

## Levantar el servidor

```bash
# Build
docker build -t freelancehub-backend .

# Run (puerto 3000)
docker run -p 3000:3000 --name freelancehub freelancehub-backend

# Verificar
curl http://localhost:3000/api/v1/categories
```

## Variables de entorno

| Variable     | Default                    | Descripción                      |
|--------------|----------------------------|----------------------------------|
| PORT         | 3000                       | Puerto del servidor              |
| JWT_SECRET   | freelancehub-dev-secret    | Clave de firma JWT               |

## Conexión desde React Native

Usá la IP del host Docker (no `localhost`) en `frontend/app.json > extra > apiBaseUrl`.

```
# Ejemplo en Mac/Linux
ipconfig getifaddr en0   → 192.168.1.x

# Ejemplo en Windows
ipconfig | findstr IPv4
```

## Generar un token JWT de prueba

```bash
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { freelancerId: 'user-001', sub: 'user-001' },
  'freelancehub-dev-secret',
  { expiresIn: '7d' }
);
console.log(token);
"
```

## Importante

Los datos NO persisten entre reinicios del contenedor. Es el comportamiento esperado según la constitución del proyecto.

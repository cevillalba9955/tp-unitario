# Quickstart / Validación manual: Contratación y Seguimiento de Pedidos

Feature: `006-order-tracking`. Guía de validación end-to-end de US1–US3.
Referencias: [contracts/orders-contract.md](./contracts/orders-contract.md),
[data-model.md](./data-model.md).

## Prerrequisitos

- Backend corriendo en Docker (`docker run -p 3000:3000 --name freelancehub freelancehub-backend`) tras reconstruir la imagen con los cambios de esta feature.
- Frontend en Expo (`npx expo start` en `frontend/`) con `app.json > extra > apiBaseUrl` apuntando a la IP del host.
- Usuarios seed: comprador `buyer@demo.com` / `demo1234`; freelancer `freelancer@demo.com` / `demo1234`.
- Servicios seed publicados (svc-demo-001..004) del freelancer demo.

> La persistencia es in-memory: reiniciar el contenedor borra los pedidos y re-siembra los servicios.

## Escenario 1 — Contratar un servicio (US1)

1. Iniciar sesión como comprador y abrir el detalle de un servicio publicado.
2. Pulsar "Contratar" en un paquete.
3. **Esperado**: se crea un pedido en etapa "Pendiente" y aparece en "Mis pedidos" del comprador (SC-002).
4. **Negativo (auth)**: sin sesión, pulsar "Contratar" → se solicita iniciar sesión (FR-002).

Verificación por API (opcional):
```bash
# TOKEN_BUYER = login de buyer@demo.com
curl -s -X POST $BASE/api/v1/orders -H "Authorization: Bearer $TOKEN_BUYER" \
  -H 'Content-Type: application/json' -d '{"serviceId":"svc-demo-001","packageId":"pkg-demo-001a"}'
# Esperado: 201, stage=PENDIENTE
```

## Escenario 2 — Freelancer no puede contratar lo propio (US1 / SC-004)

1. Login como `freelancer@demo.com` (dueño de los servicios seed).
2. Intentar `POST /api/v1/orders` sobre uno de sus servicios.
3. **Esperado**: **403 FORBIDDEN** (FR-003). El 100% de estos intentos se rechazan.

## Escenario 3 — El freelancer avanza el pedido (US2)

Con un pedido en "Pendiente":
1. Login como el freelancer dueño; abrir "Pedidos entrantes" → detalle del pedido.
2. Pulsar "Aceptar" → **Esperado**: etapa pasa a "Confirmado"; el historial registra la transición (FR-014).
3. Pulsar "Entregar trabajo" → **Esperado**: etapa pasa a "EnRevisión".
4. **Negativo (rol)**: intentar avanzar un pedido de un servicio ajeno → 403 (FR-015).

## Escenario 4 — Revisión: aceptar o solicitar cambios (US3, loop)

Con un pedido en "EnRevisión":
1. Login como el comprador dueño; abrir el detalle del pedido.
2. Pulsar "Solicitar cambios" → **Esperado**: vuelve a "Confirmado" (el freelancer puede re-entregar). Repetible sin límite.
3. Tras una nueva entrega, pulsar "Aceptar entrega" → **Esperado**: pasa a "Entregado" (etapa final); ya no se ofrecen acciones (FR-013/FR-019).

## Escenario 5 — Cancelación por el comprador (US3)

1. Como comprador, sobre un pedido en "Pendiente", "Confirmado" o "EnRevisión", pulsar "Cancelar pedido".
2. **Esperado**: pasa a "Cancelado" (etapa final).
3. **Negativo**: sobre un pedido "Entregado", no se ofrece cancelar; una llamada directa `cancel` → **409 CONFLICT**.

## Escenario 6 — Transición inválida y autorización (SC-003, SC-005)

1. Sobre un pedido "Pendiente", intentar `accept_delivery` (acción de comprador en etapa incorrecta) → **409 CONFLICT**.
2. Como un tercero autenticado (ni comprador ni freelancer del pedido), `GET /orders/:id` o `transition` → **403 FORBIDDEN**.

## Escenario 7 — Visibilidad y consistencia (SC-006)

1. Abrir el mismo pedido como comprador y como freelancer.
2. **Esperado**: ambos ven la misma etapa actual y el mismo historial (FR-018).
3. Listas vacías muestran mensaje informativo; error de red muestra "Reintentar" (FR-020).

## Checklist de éxito

- [ ] SC-001: contratar en < 60 s.
- [ ] SC-002: 100% de pedidos nuevos inician en "Pendiente".
- [ ] SC-003: 100% de transiciones inválidas rechazadas (409).
- [ ] SC-004: 100% de intentos de freelancer de contratar lo propio rechazados (403).
- [ ] SC-005: 100% de acciones de terceros rechazadas (403).
- [ ] SC-006: comprador y freelancer ven la misma etapa.
- [ ] SC-007: 100% de transiciones quedan en el historial.

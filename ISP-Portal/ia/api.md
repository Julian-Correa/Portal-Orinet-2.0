## Endpoints propios

### `GET /customer-summary`

#### Query params

- `dni`: obligatorio, 7 u 8 digitos, se sanitiza removiendo caracteres no numericos.

#### Respuesta exitosa `200`

{
  "customer": {
    "id": 123,
    "code": "CLI-001",
    "name": "Nombre Apellido",
    "doc_number": "12345678",
    "address": "...",
    "debt": "0",
    "duedebt": "0",
    "status": "active",
    "city": { "name": "...", "province": "..." },
    "phones": [{ "number": "..." }],
    "customer_cbu": [{ "cbu": "...", "number": "..." }],
    "contact_emails": [{ "id": 1, "email": "...", "principal": 1 }]
  },
  "invoiceUrl": "https://...pdf",
  "planInfo": {
    "plan": "Plan 100 MB",
    "price": "$ 0,00"
  },
  "recargoReconexion": 2000,
  "recargoSegundoVencimiento": 2000,
  "cutDay": 26,
  "generatedAt": "2026-07-21T00:00:00.000Z"
}

#### Errores esperados

- `400`: `dni invalido` o equivalente
- `404`: `cliente no encontrado`
- `429`: demasiadas solicitudes
- `500`: configuracion incompleta o error interno serverless
- `502`: fallo consultando ISP en backend Express

#### Headers utiles

- `x-cache: HIT|MISS`

### `PUT /customers/:dni/email`

#### Body

{
  "email": "cliente@dominio.com"
}

#### Reglas

- El email se normaliza con `trim().toLowerCase()`.
- Si el proveedor acepta el cambio, se invalida la cache de resumen por DNI.
- Se valida `Origin` contra `CORS_ORIGIN`.

#### Respuesta exitosa `200`

{
  "customer": {
    "id": 123,
    "contact_emails": [{ "id": 1, "email": "cliente@dominio.com", "principal": 1 }]
  }
}

#### Errores esperados

- `400`: DNI o email invalidos
- `404`: cliente no encontrado
- `500`: configuracion incompleta / error interno
- `502`: error actualizando en el proveedor (ruta Express)

### `GET /health`

#### Respuesta

{
  "ok": true,
  "redis": false
}

## Notificaciones push

Todas las rutas `admin/*` requieren el header `X-Admin-Code` (si no coincide se responde `401`).

### `POST /push/subscribe`

#### Body

{
  "dni": "20123456",
  "subscription": { "endpoint": "https://...", "keys": { "p256dh": "...", "auth": "..." } }
}

#### Reglas

- Requiere `Origin` valido contra `CORS_ORIGIN`.
- Se guarda en `push:subscriptions` (Redis, o Netlify Blobs / memoria como fallback).

#### Respuesta exitosa `200`

{ "ok": true }

### `GET /admin/push/avisos`

Devuelve los textos por defecto de cada aviso (para usarlos como placeholder) y los textos guardados desde el panel. Un campo vacio significa "usar el texto por defecto".

#### Respuesta exitosa `200`

{
  "defaults": {
    "1": { "title": "...", "body": "..." },
    "9": { "title": "...", "body": "..." },
    "24": { "title": "...", "body": "..." }
  },
  "avisos": {
    "1": { "title": "", "body": "" },
    "9": { "title": "Titulo editado", "body": "" },
    "24": { "title": "", "body": "" }
  }
}

### `PUT /admin/push/avisos`

#### Body

Parcial: solo los dias que se quieran actualizar. Titulo max 60 caracteres, mensaje max 300.

{
  "9": { "title": "Titulo editado", "body": "Mensaje editado" }
}

#### Respuesta exitosa `200`

{ "avisos": { "1": {...}, "9": {...}, "24": {...} } }

Los textos guardados se usan en los crons automaticos de los dias 1, 9 y 24.

### `POST /admin/push/trigger`

Ejecucion manual de un aviso (simula el cron del dia pedido, con el mismo filtro de envio).

#### Body

{
  "dia": 9,
  "title": "Titulo opcional",
  "body": "Mensaje opcional"
}

#### Reglas

- `dia` obligatorio y valido: `1`, `9` o `24` (sino `400`).
- Si `title` / `body` no vienen, se usan los textos guardados. Si vienen vacios, el texto por defecto.
- Filtro: solo clientes habilitados (`active` / `activo` / `enabled`). En los dias 9 y 24 solo clientes con deuda (`debt > 0` o `duedebt > 0`).

#### Respuesta exitosa `200`

{ "ok": true, "dia": 9, "enviados": 12, "encontrados": 40 }

- `enviados`: push efectivamente enviados
- `encontrados`: suscripciones totales recorridas

#### Errores esperados

- `400`: `dia invalido` o `json invalido`
- `401`: `no autorizado`

### `POST /admin/push/broadcast`

Aviso general a todas las suscripciones, sin filtro de cliente.

#### Body

{ "title": "OriNet", "message": "Mensaje del aviso" }

#### Respuesta exitosa `200`

{ "ok": true, "subscribers": 40, "sent": 38, "failed": 2 }

### `GET /admin/push/subscriptions/count`

Devuelve la cantidad de usuarios que tienen notificaciones push activas en el momento de la consulta.

#### Reglas

- Requiere header `X-Admin-Code`.
- Cuenta todas las suscripciones almacenadas en `push:subscriptions` (Redis o Blobs). No valida si siguen activas en el navegador.

#### Respuesta exitosa `200`

{ "count": 42 }

#### Errores esperados

- `401`: `no autorizado`

## Endpoints externos usados (ISPCube)

- `POST /sanctum/token`
- `GET /customer?doc_number={dni}&deleted=false&temporary=false`
- `GET /bills/last_bill_api?customer_id={id}&monthly_bill=true&canceled=false`
- `GET /connection?...`
- `GET /plans/plans_list`
- `PUT /customers/{id}`

## Observaciones

- El frontend depende de que el backend siempre responda JSON.
- `invoiceUrl` es opcional.
- `planInfo` puede devolverse como `No informado` si la integracion no encuentra datos.
- Los errores del proveedor se loguean internamente y no se exponen al cliente.

## Frontend

El frontend esta parcialmente modularizado. `src/App.jsx` sigue siendo el archivo central, pero ya existen componentes extraidos:

### Componentes existentes

- `ErrorBoundary`: fallback si la UI crashea.
- `MainLayout`: Wrapper global con fondo, layout y rutas.
- `Navbar`: Barra de navegación con logo y enlaces contextuales (cliente o admin).
- `PopupImage`: popup opcional de comunicacion visual.
- `LoginScreen`: ingreso por DNI y primer fetch al backend.
- `AdminDashboard`: Panel administrativo con configuración de costos, métricas, planes, aviso general, avisos push programados (texto editable + ejecución manual de los días 1/x, 9/x y 24/x) y card de notificaciones activas (usuarios suscriptos a push en tiempo real).
- `ProfileScreen`: dashboard principal del cliente.
- `PlanesScreen`, `ServiciosScreen`, `FacturacionScreen`, `NosotrosScreen`: Vistas secundarias modulares.
- `EmailCard`: alta/edicion del email de facturacion.
- `PushNotificationBanner`: pide permiso de notificaciones y registra la suscripcion push.
- `Switch` (dentro de AdminDashboard): toggle accesible para configuraciones.
- `OriNetLogo`: logo presentacional.
- `DownloadIcon`, `LogoutIcon`, `WhatsAppIcon`: iconos presentacionales.

### Librerias frontend

- `src/lib/api/portalApi.js`: cliente HTTP para la API del portal.
- `src/lib/api/adminApi.js`: cliente HTTP del panel admin (config, metricas, planes, avisos, push y count de suscriptores).
- `src/lib/config/portalConfig.js`: configuracion del portal.
- `src/lib/utils/customer.js`: utilidades de cliente, incluye `isServiceEnabled` (status habilitado usado por los avisos push).
- `src/lib/utils/format.js`: utilidades de formato.

### Estado actual

- `App.jsx` todavia concentra estado global, logica de sesion y coordinacion entre pantallas.
- Los componentes extraidos son funcionales pero aun dependen de props pasadas desde App.

### Direccion 2.0

- Extraer hooks para logica de estado y networking (ej: `useCustomerSession`, `useCustomerSummary`).
- Centralizar manejo de estado global (Context o store liviano).
- Evaluar router si se agregan nuevas pantallas.
- Mejorar separacion de concerns: cada componente con su logica encapsulada.

## Backend

### Entrada y composicion

- `server/index.js`: compone el backend local.
- `netlify/functions/api.js`: entrada serverless.
- `netlify/functions/cron-facturacion.js`: cron del dia 1 (aviso de facturacion disponible).
- `netlify/functions/cron-notificaciones.js`: cron de los dias 9 y 24 (avisos de vencimiento).

### HTTP

- `server/http/apiHandler.js`: handler HTTP canonico compartido entre Express y Netlify. Concentra routing, CORS, rate limit, validaciones y errores.

### Runtime

- `server/app/runtime.js`: inicializacion lazy de dependencias compartidas.

### Config

- `server/config/env.js`: parsing y validacion de variables de entorno.

### Controllers

- `customerController`: traduce HTTP a llamadas del service.
- `healthController`: expone estado basico del proceso/cache.

### Services

- `CustomerSummaryService`: reglas de validacion, cache, payload final y coordinacion con el repository.

### Repository

- `IspRepository`: encapsula todas las llamadas HTTP al proveedor externo.

### Librerias tecnicas

- `CacheClient`: abstraccion minima entre Redis y cache en memoria.
- `notificaciones.js`: `AVISOS` (dias 1, 9 y 24 con textos por defecto) y `armarPayloadAviso` (regla de deuda + texto editado o default).
- `pushNotifications.js`: `enviarPushAClientes` recorre suscripciones, filtra por status habilitado y envia con `web-push`.

### Persistencia de configuracion

- `configRepository`: costos, popup, planes y textos de los avisos push (`config:avisosPush` en Netlify Blobs).

## Acoplamientos importantes

- La UI conoce solo el contrato agregado del backend, no el de ISPCube.
- El backend local y el serverless comparten logica de servicio y repository via el handler canonico.
- `src/App.jsx` concentra estado, render y coordinacion; es el mayor punto de acoplamiento del frontend.

## Puntos de extension naturales

- Extraer el frontend en componentes y hooks reales.
- Centralizar cliente HTTP del frontend.
- Agregar nuevas rutas al handler canonico para funcionalidades 2.0.

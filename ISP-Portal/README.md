# Portal de Clientes - OriNet 2.0

Segunda version del portal web de OriNet. Repositorio dedicado para la evolucion del producto con mejoras de arquitectura, UX y funcionalidad.

Repo anterior (v1): desarrollo original donde se construyo el portal desde cero.
Repo actual (v2): https://github.com/Julian-Correa/Portal-Orinet-2.0

## Stack

- React 19 + Vite 8
- Express local + Netlify Functions en produccion
- Handler HTTP canonico compartido entre Express y Netlify
- Redis opcional, con fallback en memoria
- Integracion con ISPCube

## Funcionalidades actuales (heredadas de v1)

- Consulta por DNI de 7 u 8 digitos
- Resumen agregado con cliente, ultima factura y plan
- Reglas de negocio servidas desde backend: `recargoReconexion`, `recargoSegundoVencimiento`, `cutDay`
- Actualizacion de email de facturacion
- Contacto directo por WhatsApp
- UI responsive para login y perfil

## Roadmap 2.0

El roadmap detallado esta en `todo.md`. Las lineas principales son:

1. **Refactor del frontend** - Extraer `App.jsx` en componentes y hooks modulares
2. **Mejora de UX** - Nuevo diseno visual, mejor feedback de estados y errores
3. **Nuevas funcionalidades** - Features adicionales segun necesidad del negocio
4. **Observabilidad** - Mejor logging y monitoreo de errores del proveedor
5. **Infraestructura** - Evaluar rate limit distribuido y optimizaciones de cache

## Scripts

    npm run dev       # frontend Vite
    npm run server    # backend Express local
    npm run lint      # linting ESLint
    npm test          # tests con Vitest
    npm run build     # build de produccion

## Desarrollo local

1. Instalar dependencias: `npm install`
2. Copiar `.env.example` a `.env`
3. Completar credenciales `ISP_*`
4. Levantar backend: `npm run server`
5. Levantar frontend: `npm run dev`

`CORS_ORIGIN` es obligatorio. Si falta, el servidor no inicia.

## Variables de entorno

Variables principales del backend:

    PORT=8787
    CORS_ORIGIN=http://localhost:5173
    REDIS_URL=redis://localhost:6379
    CACHE_TTL_SECONDS=120
    TOKEN_TTL_SECONDS=600
    REQUEST_TIMEOUT_MS=12000
    BODY_LIMIT=25kb
    RATE_LIMIT_WINDOW_MS=60000
    RATE_LIMIT_MAX=30
    RECARGO_RECONEXION=2000
    RECARGO_SEGUNDO_VENCIMIENTO=2000
    CUT_DAY=26
    ISP_API_BASE=https://online25.ispcube.com/api
    ISP_API_KEY=
    ISP_CLIENT_ID=302
    ISP_API_USER=
    ISP_API_PASS=

`VITE_PORTAL_API_BASE` se usa solo en frontend. En Netlify queda seteada como `/api` desde `netlify.toml`.

## API agregada

Endpoints principales:

- `GET /api/customer-summary?dni=12345678`
- `PUT /api/customers/:dni/email`
- `GET /api/health`

El payload de `customer-summary` incluye datos del cliente, URL de factura, plan y reglas de negocio consumidas por el frontend.

El PUT de email valida `Origin` contra `CORS_ORIGIN`. Los errores del proveedor se loguean internamente y responden de forma generica, sin exponer detalles internos.

## Arquitectura

    src/
      components/
      lib/
    server/
      app/          # composicion compartida de runtime
      config/       # entorno y validaciones
      http/         # handler HTTP canonico
      lib/          # cache Redis/memoria
      repositories/ # acceso a ISPCube
      services/     # reglas de negocio
    netlify/functions/
      api.js        # entrypoint serverless fino
    ia/             # documentacion tecnica para continuidad

Flujo actual:

1. Express o Netlify reciben la request.
2. Ambos delegan al mismo `server/http/apiHandler.js`.
3. El handler usa `CustomerSummaryService`.
4. El service consulta cache y `IspRepository`.
5. La respuesta vuelve con headers y errores consistentes en ambos runtimes.

## Calidad

- Tests unitarios para `customerSummaryService` e `ispRepository`
- Tests de endpoints sobre Express adapter y handler canonico
- CI en GitHub Actions con `lint`, `test` y `build`

## Deploy en Netlify

El repo tiene un `netlify.toml` en la raiz que configura:

- `base`: `ISP-Portal`
- build: `npm run build`
- publish: `dist`
- functions: `netlify/functions`
- redirect: `/api/*` -> `/.netlify/functions/api/:splat`

En Netlify no subas `.env`. Carga las variables en la configuracion del sitio.

## Documentacion tecnica

La carpeta `ia/` contiene documentacion detallada del proyecto para continuidad:

- `projectmemory.md` - memoria operativa del proyecto
- `architecture.md` - arquitectura del sistema
- `api.md` - contratos de API
- `components.md` - componentes frontend y backend
- `business-rules.md` - reglas de negocio
- `data-model.md` - modelo de datos
- `infrastructure.md` - stack e infra
- `user-flows.md` - flujos de usuario
- `decision.md` - decisiones tecnicas vigentes
- `changelog.md` - historial de cambios

## Notas

- `.env` no debe versionarse.
- El CBU se toma de `customer_cbu[0]`; si no existe, se muestra solo el alias fijo.
- El acceso por DNI sin OTP es una decision de negocio vigente para este proyecto.

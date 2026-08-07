## Estado base del proyecto

- Proyecto: Portal de Clientes OriNet 2.0
- Repositorio: https://github.com/Julian-Correa/Portal-Orinet-2.0
- Origen: fork evolutivo del portal v1, migrado a repo dedicado para desarrollo de la version 2.0.
- Objetivo actual: permitir consulta por DNI, deuda, factura, plan, datos de pago y actualizacion de email.
- Objetivo 2.0: evolucionar el portal con mejor arquitectura frontend, UX mejorada y nuevas funcionalidades.
- Frontend: SPA React con login y perfil separados, consumiendo reglas de negocio desde backend.
- Backend: proxy a ISPCube con runtime compartido (`app -> http -> service -> repository -> cache`).
- Deploy: Netlify con function agregada en `/api`. El repo tiene `netlify.toml` en la raiz con `base = "ISP-Portal"`.

## Contexto de la version 2.0

- El portal v1 fue construido y estabilizado con todas las mejoras de seguridad, calidad y arquitectura completadas (ver `changelog.md`).
- La v2 parte de esa base estable. No hay deuda tecnica critica pendiente de v1.
- El foco de la v2 es evolucion, no reparacion.

## Convenciones importantes

- La UI no debe hablar directo con ISPCube.
- Las credenciales viven en backend/env, nunca en el bundle.
- El contrato fuente para la UI es el payload agregado de `/customer-summary`.
- El fallback por defecto ante ausencia de Redis es memoria local.
- El repo usa Netlify Blobs para persistencia de configuración y métricas (con un adapter local para desarrollo vía `npm run dev`); no hay ORM ni base de datos relacional tradicional.
- La sesión (tanto de cliente como de administrador) se persiste en `sessionStorage` para sobrevivir a recargas de página.
- La documentacion tecnica vive en `ia/` y debe mantenerse actualizada con cada cambio relevante.

## Hotspots tecnicos

- `src/App.jsx`: archivo grande, mezcla logica, estilos, networking y vistas. Principal candidato a refactor en 2.0.
- `server/http/apiHandler.js`: concentra routing manual, CORS, rate limit y errores compartidos.
- Integracion ISPCube: proveedor externo con respuestas potencialmente inestables.

## Riesgos persistentes

- Seguridad debil por acceso basado solo en DNI (decision de negocio vigente).
- Rate limit por instancia y no distribuido.
- Dependencia fuerte de un proveedor externo con latencia y formatos no siempre consistentes.

## Riesgos resueltos (v1)

- `.env` ya no forma parte del flujo versionado del proyecto.
- `CORS_ORIGIN` es obligatorio y no existe fallback a `*`.
- El PUT de email valida `Origin` explicitamente.
- Express y Netlify usan el mismo handler HTTP.
- Hay tests automatizados para service, repository y endpoints.

## Prioridades 2.0 (Basadas en prompt-maestro-v2.md)

1. Implementar Netlify Blobs para configuración dinámica y métricas (incluyendo adapter local).
2. Incorporar React Router y refactorizar `App.jsx` para soportar navegación múltiple.
3. Crear Panel de Administración y Login unificado por DNI/Código.
4. Implementar vistas simples: Nosotros, Facturación, Mis servicios.
5. Desarrollar vistas complejas: Perfil (edición email, no teléfono) y Planes.
6. Lógica de Negocio de Compromisos de Pago con restricciones de fechas (fechas pasadas bloqueadas).

## Como seguir trabajando

1. Antes de tocar logica de negocio, revisar `business-rules.md` y `api.md`.
2. Antes de tocar deploy o entornos, revisar `infrastructure.md`.
3. Si un cambio altera una decision estable, actualizar `decision.md`.
4. Si un cambio ya fue implementado, registrarlo en `changelog.md`.
5. Consultar `todo.md` para ver el roadmap y prioridades activas.

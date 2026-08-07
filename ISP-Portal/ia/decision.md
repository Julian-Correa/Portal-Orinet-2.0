## Decisiones vigentes

### D-001 - Usar backend intermedio para ISPCube

- Estado: vigente
- Motivo: evitar exponer credenciales y reducir complejidad en el frontend.
- Consecuencia: cualquier evolucion funcional relevante pasa por el backend agregado.

### D-002 - Cachear token y resumen de cliente

- Estado: vigente
- Motivo: bajar cantidad de requests al proveedor y mejorar tiempos de respuesta.
- Consecuencia: hay que invalidar cache al actualizar email y considerar TTLs al depurar problemas.

### D-003 - Redis opcional con fallback en memoria

- Estado: vigente
- Motivo: permitir desarrollo simple y deploy sin dependencia obligatoria.
- Consecuencia: el comportamiento no es identico entre entornos con y sin Redis.

### D-004 - Mantener una SPA sin router

- Estado: reemplazada por D-013
- Motivo: el producto actual tiene un flujo unico y acotado.
- Consecuencia: `src/App.jsx` quedo muy concentrado y es el principal candidato a refactor futuro.
- Nota 2.0: reemplazada por D-013 debido a la incorporación de múltiples pantallas.

### D-005 - Reusar service/repository entre Express y Netlify

- Estado: vigente
- Motivo: reducir logica duplicada del dominio.
- Consecuencia: el runtime compartido vive en `server/app/` y la capa HTTP canonica vive en `server/http/apiHandler.js`.

### D-006 - Acceso por DNI sin autenticacion fuerte

- Estado: vigente pero sensible
- Motivo: simplicidad del portal y bajo costo operativo.
- Consecuencia: es el riesgo funcional y de privacidad mas importante del sistema actual.

### D-007 - No agregar OTP ni mitigaciones de enumeracion en esta etapa

- Estado: vigente
- Motivo: el acceso por DNI sin OTP es una decision de negocio explicita para el portal actual.
- Consecuencia: no se deben proponer OTP por WhatsApp/email ni cambios de enmascaramiento como mejora por defecto para este proyecto.

### D-008 - Netlify handler como fuente canonica de HTTP

- Estado: vigente
- Motivo: eliminar drift entre runtime local Express y runtime serverless sin sumar dependencias nuevas.
- Consecuencia: CORS, rate limit, validaciones y manejo de errores viven en un unico handler compartido.

### D-009 - Reglas de cobro configuradas desde backend

- Estado: vigente
- Motivo: permitir cambiar recargos y dia de corte sin redeploy del frontend.
- Consecuencia: `customer-summary` ahora expone `recargoReconexion`, `recargoSegundoVencimiento` y `cutDay`.

### D-010 - Repo dedicado para Portal 2.0

- Estado: vigente
- Fecha: 2026-08-05
- Motivo: separar la evolucion del portal 2.0 del repositorio original para tener un historial limpio y facilitar el desarrollo iterativo sin afectar la version en produccion estable.
- Consecuencia: el repo v1 queda como referencia historica. Todo el desarrollo nuevo ocurre en https://github.com/Julian-Correa/Portal-Orinet-2.0.

### D-011 - Deploy con base directory en Netlify

- Estado: vigente
- Fecha: 2026-08-05
- Motivo: el proyecto vive dentro de `ISP-Portal/` en el repo, no en la raiz. Netlify necesita un `netlify.toml` en la raiz con `base = "ISP-Portal"` para encontrar el codigo.
- Consecuencia: los paths de `publish` y `functions` en `netlify.toml` son relativos a la base, no a la raiz del repo.

### D-012 - Netlify Blobs para persistencia de configuracion y metricas

- Estado: vigente
- Fecha: 2026-08-07
- Motivo: la config dinámica (costos, planes) y métricas deben sobrevivir cold starts. Como en desarrollo se usa `npm run dev` y no `netlify dev`, se necesita un adapter local (JSON file).
- Consecuencia: el proyecto pasa a tener capa de persistencia real administrable.

### D-013 - Enrutador frontend (React Router)

- Estado: vigente
- Fecha: 2026-08-07
- Motivo: la v2.0 necesita navegación por secciones (perfil, planes, compromisos).
- Consecuencia: reemplaza a D-004. Requiere reestructuración de `App.jsx`.

### D-014 - Acceso de administrador por codigo en entorno

- Estado: vigente
- Fecha: 2026-08-07
- Motivo: simplicidad operativa, un único administrador, sin gestión de usuarios ni tokens.
- Consecuencia: código en variable de entorno.

### D-015 - Persistencia de sesion (SessionStorage)

- Estado: vigente
- Fecha: 2026-08-07
- Motivo: evitar que el cliente o admin pierda la sesión (vuelva al login) si recarga la página por error, dada la nueva estructura de navegación múltiple.
- Consecuencia: uso de `sessionStorage` para guardar estado del login temporalmente.

### D-016 - Restricciones de ventana de compromisos de pago

- Estado: vigente
- Fecha: 2026-08-07
- Motivo: estricto control comercial sobre cuándo se pueden pedir compromisos.
- Consecuencia: fechas pasadas inhabilitadas. Mensaje fijo de WhatsApp de soporte para suspendidos.

## Regla de actualizacion

Agregar una nueva decision cuando cambie alguna de estas dimensiones:

- Arquitectura general
- Contrato de datos relevante
- Integracion externa
- Seguridad o autenticacion
- Infraestructura base

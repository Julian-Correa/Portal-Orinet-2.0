## Objetivo

Esta carpeta documenta el estado tecnico actual del Portal OriNet 2.0 para que cualquier IA o desarrollador pueda continuar el proyecto con contexto operativo y arquitectonico.

## Contexto del proyecto

- Portal OriNet 2.0 - segunda version del portal de clientes.
- Repo: https://github.com/Julian-Correa/Portal-Orinet-2.0
- El proyecto vive dentro de `ISP-Portal/` en el repo.
- La v1 fue estabilizada con todas las mejoras de seguridad y calidad completadas.
- La v2 parte de esa base estable para evolucionar el producto.

## Como usar esta carpeta

1. Leer primero `projectmemory.md`.
2. Revisar `architecture.md` para entender el sistema completo.
3. Consultar los documentos especificos segun la tarea: `api.md`, `components.md`, `business-rules.md`, `data-model.md`, `infrastructure.md`, `user-flows.md`.
4. Antes de cambiar comportamiento, revisar `decision.md`.
5. Al terminar un cambio relevante, actualizar `changelog.md` y, si hubo una decision de arquitectura, tambien `decision.md` y `projectmemory.md`.

## Reglas de mantenimiento

- `projectmemory.md`: memoria viva y estable del proyecto.
- `decision.md`: decisiones tecnicas y de producto con impacto persistente.
- `changelog.md`: cambios concretos realizados sobre el repo.
- No documentar supuestos como si fueran hechos.
- Si una parte del sistema no existe, dejarlo explicitado en vez de inventarlo.

## Fuentes de verdad actuales

- Frontend: `src/App.jsx`, `src/main.jsx`, `src/components/`
- Backend local: `server/index.js`
- Backend serverless: `netlify/functions/api.js`
- Capas backend: `server/http`, `server/app`, `server/services`, `server/repositories`, `server/lib`, `server/config`
- Configuracion: `package.json`, `netlify.toml` (raiz y dentro de ISP-Portal), `.env.example`
- Contexto funcional: `README.md`
- Roadmap: `todo.md`

## Limites conocidos

- No hay base de datos propia en el repo.
- La integracion principal depende de ISPCube como proveedor externo.
- El frontend esta parcialmente modularizado pero `App.jsx` sigue siendo el archivo central.
- El acceso es por DNI sin autenticacion fuerte (decision de negocio vigente).

## Archivos incluidos

- `architecture.md`
- `api.md`
- `business-rules.md`
- `components.md`
- `data-model.md`
- `infrastructure.md`
- `user-flows.md`
- `decision.md`
- `projectmemory.md`
- `changelog.md`

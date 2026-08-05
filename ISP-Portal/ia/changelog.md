## 2026-07-21

### Documentacion IA inicial

- Se creo la carpeta `ia/` como fuente de continuidad para futuras IAs y desarrolladores.
- Se documento la arquitectura actual del portal, basada en React + backend proxy a ISPCube.
- Se relevaron contratos API, componentes, reglas de negocio, modelo de datos, infraestructura y flujos de usuario.
- Se establecio un esquema de memoria operativa con `projectmemory.md`, `decision.md` y `changelog.md`.

## 2026-08-02

### Seguridad, arquitectura y calidad

- Se exigio `CORS_ORIGIN` como variable obligatoria y se elimino cualquier fallback a `*`.
- Se centralizo la capa HTTP en `server/http/apiHandler.js`, usada por Netlify y por el adaptador Express.
- El PUT `customers/:dni/email` ahora valida `Origin` y los errores del proveedor responden sin filtrar detalles internos.
- `customer-summary` ahora expone `recargoReconexion`, `recargoSegundoVencimiento` y `cutDay` desde backend.
- El frontend consume esas reglas para calcular fecha de corte y recargos sin depender de constantes hardcodeadas.
- Se agregaron tests con Vitest y Supertest, script `npm test` y workflow de CI en GitHub Actions.
- Se actualizo Vite a la version estable 8.x y se eliminaron los `overrides` previos.
- Se limpiaron duplicados y codigo muerto del frontend, incluido `react.svg` sin uso.

## 2026-08-05

### Kickoff Portal OriNet 2.0

- Se creo repositorio dedicado: https://github.com/Julian-Correa/Portal-Orinet-2.0
- Se migro el proyecto completo desde el repo v1 al nuevo repo 2.0.
- Se elimino el `.git` embebido dentro de `ISP-Portal/` para evitar problemas de submodule.
- Se configuro `netlify.toml` en la raiz del repo con `base = "ISP-Portal"` para deploy correcto en Netlify.
- Se actualizaron paths de `publish` y `functions` relativos a la base.
- Se actualizo toda la documentacion (`README.md`, `ia/`, `todo.md`) para reflejar el contexto 2.0.
- Deploy funcional en Netlify desde el nuevo repositorio.

## Regla de uso

Registrar aqui cambios reales del repo, no ideas ni planes.

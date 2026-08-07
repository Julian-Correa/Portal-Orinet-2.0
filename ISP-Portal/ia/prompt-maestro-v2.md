# OriNet Portal v2.0 — Prompt Maestro de Desarrollo

> Este documento es la especificación funcional y técnica completa de la v2.0 del portal de clientes de OriNet. Está pensado para ser usado como input directo de desarrollo (manual o con un asistente de IA tipo Claude Code). Complementa, no reemplaza, a `README.md`, `architecture.md`, `business-rules.md`, `decision.md` y `projectmemory.md` ya existentes en `ia/`.

## 0. Objetivo de la v2.0

Evolucionar el portal de una consulta simple por DNI (deuda, factura, plan) a un portal con navegación por secciones, gestión de compromisos de pago con reglas de fecha estrictas, catálogo de planes, y un panel de administración con configuración dinámica y métricas de uso.

## 1. Alcance

**Se mantiene sin cambios:**
- Login por DNI existente (validación de 7-8 dígitos, limpieza de caracteres no numéricos).
- Arquitectura backend compartida (`server/app` → `server/http/apiHandler.js` → Express local / Netlify function).
- Integración con ISPCube vía `IspRepository`.
- Cache Redis con fallback en memoria (D-003).
- Reglas de estado de cuenta ya definidas en `business-rules.md` (colores, recargo de reconexión, `cutDay`).

**Se agrega:**
- React Router para navegación por secciones.
- Acceso de administrador desde el mismo input de login.
- Netlify Blobs como nueva capa de persistencia (configuración + métricas).
- Navbar con 6 secciones: Nosotros, Perfil, Compromisos de pago, Planes, Facturación, Mis servicios.
- Lógica de ventana de fechas para compromisos de pago, con caso especial para clientes bloqueados.
- Panel de administración con configuración dinámica y métricas de uso.

## 2. Nueva capa de persistencia: Netlify Blobs

Hasta ahora el proyecto explícitamente no tenía base de datos propia (`projectmemory.md`: *"El repo no tiene DB propia; no asumir migraciones, ORM ni persistencia interna"*). La v2.0 rompe esa convención de forma consciente: se necesita guardar configuración editable y métricas que sobrevivan a los cold starts de Netlify Functions.

**Store propuesto:** `orinet-config` (Netlify Blobs)

**Keys sugeridas:**
| Key | Contenido |
|---|---|
| `config:popup` | `{ enabled, imageUrl, ... }` |
| `config:costos` | `{ recargoReconexion, costoCompromiso, umbralDeudaVencida, diasCompromisoBloqueado: [26,27] }` |
| `metrics:visits` | contador de ingresos a la app (total y/o por día) |
| `metrics:comprobante-clicks` | contador de clicks en "enviar comprobante" |

**Nuevo repository:** `server/repositories/configRepository.js` y `server/repositories/metricsRepository.js`, siguiendo el mismo patrón que `ispRepository.js` (mismo repo, consumido tanto por Express local como por la function de Netlify, vía `server/app`).

**Importante:** `recargoReconexion`, que hoy ya se expone desde `customer-summary` como constante de negocio (D-009), pasa a leerse desde `config:costos` en Blobs en vez de estar fijo en código — coherente con D-009, que ya establece que estas reglas deben ser configurables sin redeploy.

## 3. Login: cliente + administrador

- Se mantiene el mismo input de DNI.
- Si el valor ingresado coincide con `ADMIN_ACCESS_CODE` (variable de entorno, hoy `123321`), en vez de consultar ISPCube se redirige a `/admin`.
- **Supuesto adoptado:** el acceso admin sigue el mismo modelo liviano "sin auth fuerte" que ya usa el portal (D-006/D-007) — no hay token ni expiración de sesión; alcanza con el código correcto. Si necesitás algo más robusto (ej. expiración, bloqueo tras intentos fallidos), avisame y lo sumamos como requerimiento aparte.
- Un solo administrador (no hay gestión de usuarios).

## 4. Sesión y protección de rutas

- Las rutas de cliente (`/perfil`, `/compromisos`, `/planes`, `/facturacion`, `/servicios`) y la ruta `/admin` requieren sesión activa.
- **Supuesto adoptado:** la "sesión" es el mismo mecanismo liviano que ya existe hoy (los datos del cliente/admin viven en estado de React durante la visita, no hay persistencia entre recargas de página). Si el usuario refresca el navegador, vuelve al login. Si preferís que sobreviva a un refresh (ej. guardado en `sessionStorage`), es un cambio menor pero lo dejo marcado como pendiente de confirmar.
- Sin sesión válida → redirect a login (`/`).

## 5. Navbar y routing

Rutas nuevas (React Router):

| Ruta | Sección |
|---|---|
| `/nosotros` | Nosotros |
| `/perfil` | Perfil |
| `/compromisos` | Compromisos de pago |
| `/planes` | Planes |
| `/facturacion` | Facturación |
| `/servicios` | Mis servicios |
| `/admin` | Panel de administración |

Nota: esto reemplaza la decisión D-004 ("Mantener una SPA sin router"), que queda superada — hay que marcarla como tal en `decision.md` (ver sección 8).

## 6. Secciones funcionales

### 6.1 Nosotros
- Contenido: descripción breve de la empresa, área de cobertura, datos de contacto y ubicación.
- Área de cobertura: **una sola imagen hardcodeada** en esta versión (no interactiva). Un mapa interactivo queda anotado como mejora futura, fuera de alcance de v2.0.
- Imagen institucional de la empresa también hardcodeada (no editable desde admin en esta etapa).

### 6.2 Perfil
- Misma información que hoy se muestra en el card de perfil, pero reestructurada.
- Se agregan acciones de editar/eliminar email y editar/eliminar número de teléfono.
- El flujo de edición de email reutiliza la lógica ya existente (`PUT /customers/:dni/email`, invalidación de cache — ver `architecture.md`).
- **Pendiente de definir:** ¿ISPCube expone un endpoint para actualizar/eliminar teléfono, análogo al de email? Si no existe, hay que confirmarlo antes de implementar esa parte — no asumir que existe.

### 6.3 Compromisos de pago (sección más compleja)

**Paso 1 — Chequear estado del servicio** (usando los estados ya definidos en `business-rules.md`):

- **Si el cliente está bloqueado** (`blocked`, `bloqueado`, `block`, `suspended`, `suspendido`, `disabled`):
  - Si hoy es uno de los días configurados en `diasCompromisoBloqueado` (hoy: `[26, 27]`, configurable, pensado para crecer a un día más):
    - Se habilita el flujo especial (ver más abajo). No se usa calendario: la fecha del mensaje es la fecha de hoy (el día en que se solicita).
  - Si no:
    - Se muestra un cartel indicando que solo puede solicitar compromiso en esos días. *(Falta definir el texto exacto del cartel — dejarlo como placeholder editable.)*

- **Si el cliente NO está bloqueado:**
  - Se valida `duedebt <= umbralDeudaVencida` (configurable, valor actual 10.000, comparación inclusive `<=`).
  - Si la deuda vencida supera el umbral: se muestra un cartel indicando que no puede generar más compromisos hasta pagar la deuda vencida.
  - Si pasa la validación: se muestra el calendario restringido a la ventana calculada (ver Paso 2).

**Paso 2 — Cálculo de la ventana de fechas** (solo para clientes no bloqueados):

```
dia = dia_del_mes(hoy)

si dia >= 26:
    inicio = 26 de este mes
    fin    = 10 del mes siguiente
si dia <= 10:
    inicio = 26 del mes anterior
    fin    = 10 de este mes
si 11 <= dia <= 25:
    inicio = 26 de este mes       // ventana próxima, todavía no arrancó
    fin    = 10 del mes siguiente
```

El datepicker debe restringir selección estrictamente a `[max(hoy, inicio), fin]` — no debe permitir elegir ningún otro rango. *(El `max(hoy, inicio)` es un supuesto: evita que se pueda comprometer a una fecha ya pasada dentro de la ventana. Confirmar.)*

Ejemplos de validación:
- Hoy 27/7 → ventana `[27/7 → máx: hoy o inicio, 10/8]` → puede elegir hasta el 10/8. ✔️
- Hoy 11/8 → ventana `[26/8, 10/9]`. ✔️
- Hoy 5/8 → ventana `[26/7, 10/8]`, mínimo seleccionable = 5/8 (hoy, porque ya pasó el inicio real de la ventana).

**Paso 3 — Generar mensaje de WhatsApp**

*Cliente no bloqueado (flujo normal):*
```
El cliente {dni} - {nombre} - {calle} desea solicitar un compromiso
para el día {fecha_elegida} con un costo de ${costoCompromiso}.
```

*Cliente bloqueado (flujo especial, día 26/27):*
```
El cliente {dni} - {nombre} - {calle} - BLOQUEADO solicita un
compromiso para el día {fecha_hoy} con un costo de reconexión de
${recargoReconexion} y el costo de compromiso de ${costoCompromiso}.
```

Ambos costos (`costoCompromiso`, `recargoReconexion`) salen de `config:costos` en Blobs — nunca hardcodeados en el frontend.

### 6.4 Planes
- Una card por plan: nombre, velocidad, precio, descripción breve. **Sin imagen.**
- Listado de planes obtenido dinámicamente desde ISPCube (`GET /api/planes`).
- Botón "Solicitar" en cada card → redirige a WhatsApp con un mensaje armado con los datos del cliente + el plan solicitado (mismo patrón que el flujo de compromisos: mensaje generado en frontend con datos ya disponibles del cliente logueado).

### 6.5 Facturación
- Sección dedicada, separada del resto de la info de cuenta.
- Único contenido: botón para descargar la última factura disponible.
- Ya existe el endpoint de ISPCube para esto (confirmado) — se reutiliza tal cual, solo cambia la ubicación en la UI (pasa a tener su propia sección en vez de estar mezclado con el resto).

### 6.6 Mis servicios
- Muestra el plan actualmente contratado.
- Muestra los extras (`extra1`, `extra2`, `extra3` si existen) tal como vienen del GET de cliente de ISPCube.
- Si no hay ningún extra cargado: mostrar "No hay extras registrados".
- **Pendiente / fuera de alcance inmediato:** hoy no hay ejemplos reales de qué contienen `extra1/2/3` (podrían incluir TV, streaming, o equipos facturados en cuotas). Se va a definir un patrón de texto (ej. `"APP 2 PANTALLAS"`) para poder diferenciar tipos de extra más adelante, pero **en v2.0 se muestran tal cual vienen, sin parsear ni categorizar** — parsearlos sin un patrón definido y sin datos reales sería inventar comportamiento.

## 7. Panel de administración

Accesible en `/admin` con el código de acceso.

**Configuración editable:**
- Popup comercial: habilitado/deshabilitado, imagen (hoy `POPUP_CONFIG.enabled = false` en código — pasa a ser editable desde acá).
- Costo de reconexión (`recargoReconexion`).
- Costo de compromiso (`costoCompromiso`).
- Umbral de deuda vencida para permitir compromisos (`umbralDeudaVencida`, hoy 10.000).
- Días habilitados para compromiso de clientes bloqueados (`diasCompromisoBloqueado`, hoy `[26, 27]`).

**Métricas (solo lectura):**
- Conteo de ingresos a la app.
- Conteo de clicks en el botón "enviar comprobante".

Todo esto lee/escribe contra `config:*` y `metrics:*` en Netlify Blobs (sección 2).

## 8. Actualizaciones a `decision.md`

Agregar estas entradas nuevas, y marcar D-004 como reemplazada:

- **D-004** → actualizar estado a `reemplazada por D-011`.
- **D-010** — *Netlify Blobs como persistencia de configuración y métricas*. Motivo: la config dinámica (popup, costos, planes) y las métricas de uso necesitan sobrevivir a cold starts; no alcanza con memoria ni con cache Redis (que es descartable). Consecuencia: el proyecto pasa a depender de una capa de persistencia real, lo cual actualiza la convención de `projectmemory.md` que decía "no hay DB propia" — hay que actualizar ese documento también (ver sección 9).
- **D-011** — *Router en el frontend (React Router)*. Motivo: la v2.0 necesita navegación real entre secciones (navbar). Consecuencia: reemplaza a D-004; hay que decidir cómo se estructura `src/App.jsx` (candidato fuerte a partirse en componentes por ruta, algo que ya estaba anotado como refactor pendiente en `projectmemory.md`).
- **D-012** — *Acceso admin por código simple compartido, sin autenticación por usuario*. Motivo: un solo administrador, simplicidad operativa, coherente con la filosofía ya establecida en D-006/D-007. Consecuencia: el código vive en `.env`, no hay expiración ni gestión de intentos fallidos en esta etapa.
- **D-013** — *Reglas de compromisos de pago (ventana de fechas + excepción para clientes bloqueados)*. Motivo: evitar compromisos fuera del ciclo de facturación real, y dar una vía a clientes bloqueados sin romper la regla general. Consecuencia: lógica de fechas no trivial (ver sección 6.3), documentada acá y a trasladar también a `business-rules.md`.

## 9. Actualizaciones a `projectmemory.md` y `business-rules.md`

- `projectmemory.md` → la convención "El repo no tiene DB propia; no asumir migraciones, ORM ni persistencia interna" queda desactualizada. Reemplazar por algo como: "El repo usa Netlify Blobs para configuración y métricas; no hay ORM ni base de datos relacional/documental tradicional."
- `business-rules.md` → agregar sección nueva "Compromisos de pago" con la ventana de fechas, el umbral de deuda vencida configurable, y el caso especial de clientes bloqueados (contenido de la sección 6.3 de este documento).
- `README.md` → en "Límites conocidos", sacar "No hay base de datos propia en el repo" (ya no es cierto) y anotar Netlify Blobs como fuente de verdad de configuración.

## 10. Supuestos tomados y decisiones confirmadas

1. **Sesión:** La sesión de cliente/admin se persiste en `sessionStorage` para sobrevivir a refrescos de página durante la misma visita.
2. **Acceso admin:** Sin token/expiración, código fijo por variable de entorno.
3. **Compromisos de pago:** La fecha mínima seleccionable es `max(hoy, inicio_de_ventana)`. **Confirmado: nunca se permiten fechas pasadas.**
4. **Mensaje cliente bloqueado:** Texto final confirmado: *"Las solicitudes de compromiso de pago mediante el portal para cuentas suspendidas solo están habilitadas los días 26 y 27 de cada mes.Para solicitar compromiso de pago escribanos al whatsapp de administracion"*.
5. **Teléfono:** La edición/eliminación de teléfono en Perfil **queda descartada** en esta versión (endpoint no disponible/confirmado). El endpoint de email sí existe y se mantiene.
6. **Extras (`extra1/2/3`):** Se muestran sin parsear.
7. **Mapa interactivo:** Fuera de alcance (solo imagen estática).
8. **Desarrollo Local (Blobs):** Se usará un adaptador JSON local para Netlify Blobs ya que se corre con `npm run dev`.

## 11. Orden sugerido de implementación

1. Netlify Blobs: repositories de config y métricas + endpoints admin básicos (CRUD de config).
2. React Router + reestructuración de `src/App.jsx` en componentes por ruta, con protección de rutas.
3. Login admin (detección de código + redirect).
4. Panel admin (formularios de configuración + vista de métricas).
5. Secciones simples primero: Nosotros, Facturación, Mis servicios (bajo riesgo, poca lógica nueva).
6. Perfil con edición/eliminación de email/teléfono (bloqueado hasta confirmar endpoint de teléfono).
7. Planes (cards + CRUD admin + WhatsApp).
8. Compromisos de pago al final: es la lógica más sensible, conviene tener todo lo demás estable antes de tocarla, y conviene escribir tests (ya hay Vitest/Supertest en el proyecto) para la función de cálculo de ventana de fechas antes de integrarla a la UI.

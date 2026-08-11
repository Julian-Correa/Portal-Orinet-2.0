## 2026-08-11

### Ajustes en Reglas de Negocio de Compromisos y Recargos

- **Compromisos de pago en "D�as cerrados":**
  - Los clientes *habilitados* (no suspendidos) ahora pueden solicitar un compromiso de pago incluso si se encuentran entre los d�as 11 y 25 del mes.
  - El sistema detecta su estado y les abre la ventana autom�ticamente proyect�ndola al ciclo de facturaci�n siguiente (del 26 del mes en curso al 10 del mes pr�ximo).
- **Avisos Informativos UX:**
  - Se a�adi� una tarjeta amarilla obligatoria en la pantalla de Compromisos de Pago advirtiendo expl�citamente: *"Importante: El compromiso tiene un costo de $2000 y en caso de que no se abone en la fecha indicada se abonar� + de reconexi�n"*.
- **Prevenci�n de Doble Cobro en 2do Vencimiento:**
  - Se modific� la arquitectura de extracci�n de facturas (IspRepository.findBillingExtras) para escanear de forma inteligente si ISPCube **ya emiti�** un comprobante de "Recargo por Vencimiento".
  - Si a�n **no lo emiti�** (y estamos entre el 11 y el 25), el portal suma matem�ticamente el costo de 2do vencimiento a la deuda para que el cliente pague el total correcto.
  - Si ISPCube **ya lo emiti�** (por lo que el importe ya viene dentro de la deuda principal), el portal deja de sumarlo por su cuenta. En su lugar, muta la alerta amarilla en el estado de cuenta aclarando: *"Aviso: Su total ya incluye un recargo por 2do vencimiento de .000"*.

## 2026-08-10

### Funcionalidades PWA, UX Avanzada y Reglas de Negocio (Fases Finales)

- **Instalación PWA:** Integración de `vite-plugin-pwa`. La aplicación ahora soporta manifiesto y service workers, siendo instalable como App Nativa en iOS/Android y Escritorio.
- **Redirección SPA y 404:** Se agregó la regla `/* /index.html 200` en `netlify.toml` para solucionar errores 404 al recargar pantallas. Se creó una página visual `NotFoundScreen` para rutas inexistentes con botón de redirección al inicio.
- **Servicios Adicionales (APP TV):**
  - La API ahora lee los ítems extra facturados directamente consultando `/bills/bills_list` (ISPCube ignora el `customer_id` en el querystring, por lo que el filtrado se hace en el backend).
  - Solo se extraen extras del "mes actual" (fecha máxima de facturación de los últimos 15 días) y se filtra por palabras clave como `"app tv"`, `"router"` o `"conector"`.
  - Se agregaron los planes "APP TV 2 Pantallas ($9000)" y "APP TV 3 Pantallas ($11000)" al catálogo por defecto.
- **Rediseño de Catálogo de Planes:** Las tarjetas (cards) ahora le dan protagonismo en tamaño `text-5xl` a la velocidad o característica principal (ej. "2 PANTALLAS"). Los mensajes de WhatsApp ahora incluyen dinámicamente la descripción del plan.
- **UX UI Skeletons & Transitions:**
  - Se añadió `framer-motion` y un wrapper `<PageTransition />` para brindar transiciones fluidas entre pantallas de la SPA.
  - Reemplazo de spinners redondos por "Skeleton Loaders" animados en `AdminDashboard` y `PlanesScreen`.
  - Fix CSS (Tailwind) en el datepicker de `CompromisosScreen` usando `min-w-0` y `appearance-none` para evitar desbordamientos nativos en navegadores móviles.
- **Deudores Antiguos (Compromisos):**
  - Se extrae el `block_date` del backend. Si el cliente está bloqueado y el mes/año de bloqueo es **anterior al mes actual**, no se le permite solicitar compromiso de pago los días 26/27. 
  - Se despliega un botón especial hacia WhatsApp con el mensaje: "Hola OriNet soy... y quiero restablecer mi servicio con DEUDA."

## 2026-08-08

### Mejoras de Arquitectura, UI Administrador y Secciones (Fase 8)

- Se reparó el adaptador de configuración local (`blobAdapter.js`) para que funcionase en AWS Lambda (Netlify Functions) cuando faltaba la variable `import.meta.url` de ES Modules y las variables de Netlify Blobs no existían en entorno de ejecución.
- Se implementó un *fallback* (plan B) hacia el sistema de archivos temporal `/tmp/` si la API de Blobs no estaba autorizada.
- Se configuró la compatibilidad para `siteID` y `token` explícitos de Netlify Blobs por medio de `process.env.NETLIFY_SITE_ID` y `process.env.NETLIFY_API_TOKEN` logrando persistencia total de la aplicación.
- Se mejoró la UI de validación en `AdminDashboard.jsx`: 
  - Errores críticos ahora se muestran en un modal superpuesto (Popup central) con opacidad.
  - El mensaje de éxito ("Se guardó correctamente") se insertó al lado de cada botón y campo que se edita en vez de un bloque verde intrusivo en la parte superior.
  - Se removieron dependencias muertas como `setMessage` que causaban bloqueos silenciosos ("trabado") al intentar guardar configuraciones en el frontend.
- Backend: Se inyectaron Planes por defecto ("100 MB", "200 MB", "300 MB") en `configRepository.js` cuando el almacén de Blobs de Netlify se inicializa vacío, evitando tarjetas de planes rotas o ineditables en el administrador.
- Frontend: Se reemplazó el "placeholder" del mapa de área de cobertura en `NosotrosScreen.jsx` por un mapa iframe interactivo de Google Maps de la ubicación de OriNet, con estilos 100% responsivos.

### Panel Administrador y Responsive UI (Fase 8)

- Se diseñó e implementó visualmente el `AdminDashboard.jsx` siguiendo el lenguaje visual de OriNet (fondo oscuro, acentos en rojo y verde, estilo Mobile-First).
- Se habilitó la edición *inline* real-time de Costos Generales (recargo, compromiso, 2do vencimiento) y Catálogo de Planes.
- Se implementó un componente de Switch accesible para activar/desactivar el popup informativo.
- Se corrigió un bug grave de diseño global causado por el reseteo CSS `* { margin: 0; padding: 0 }` que rompía utilidades de Tailwind v4 (`mx-auto`, `padding`). Se reubicó en `@layer base` respetando las reglas de especificidad de CSS nativo.
- Se hicieron ajustes responsive avanzados (botones w-full, targets de 44px) para dispositivos de 320px-375px.

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

## 2026-08-07

### Fases 1 a 7 y Base de Fase 8 (Portal v2.0)

- Se solucionó la compatibilidad con Tailwind CSS v4 instalando `@tailwindcss/postcss` y ajustando `postcss.config.js` y `index.css`.
- Se introdujo `react-router-dom` y se refactorizó `App.jsx` para soportar múltiples vistas con un `MainLayout` y `Navbar`.
- Se implementó la lógica matemática de fechas en `src/lib/utils/compromisos.js` (Fase 8) asegurando mediante pruebas unitarias en Vitest que la ventana de compromisos cumpla las reglas estrictas de negocio (no fechas pasadas, excepciones días 26/27 para suspendidos).
- Se extrajo el estado global y de sesión en el custom hook `useCustomerSession` persistiendo en `sessionStorage`.
- Se integró una capa de persistencia mediante `@netlify/blobs` (y un fallback local por archivos) para guardar la configuración (Costos, Popup) y métricas de uso.
- Se agregaron endpoints administrativos a la capa HTTP en `/admin/*` autorizados a través del código `ADMIN_ACCESS_CODE`.
- Se construyó el `AdminDashboard.jsx`, permitiendo a los administradores iniciar sesión con un código y ver un panel de control con formulario de popup, tabla de costos, CRUD de planes y tarjetas de métricas.
- Se implementaron las vistas de cliente: `/perfil` (limpia y reestructurada), `/servicios`, `/facturacion`, `/nosotros` y `/planes`.
- El catálogo de planes ahora lee datos desde la base administrada en los Blobs en vez de consultar ISPCube, permitiendo edición comercial.
- Se incluyó `prompt-maestro-v2.md` a la documentación oficial como guía del desarrollo.

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

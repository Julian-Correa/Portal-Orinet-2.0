# TODO — Portal OriNet 2.0

Estados: `[ ]` (Pendiente) · `[~]` (En proceso) · `[x]` (Hecho)

---

## Completado en v1 (Base estable)
- [x] Sacar `.env` del control de versiones
- [x] CORS estricto y errores sin fugas
- [x] Tests con Vitest y Supertest
- [x] Unificar capa HTTP Express / Netlify Function
- [x] Reglas de negocio servidas desde backend

---

## 1. Capa de Datos y Admin (Netlify Blobs)
- [x] 1.1 Instalar dependencia `@netlify/blobs`.
- [x] 1.2 Crear `server/repositories/blobAdapter.js` (Lógica para archivo JSON en local / Blobs en prod).
- [x] 1.3 Crear `configRepository.js` (costos, planes, popup).
- [x] 1.4 Crear `metricsRepository.js` (visitas, clicks).
- [x] 1.5 Crear endpoints internos en `apiHandler.js` para CRUD de configuración.
- [x] 1.6 Migrar `recargoReconexion` desde .env/memoria a leer desde `configRepository`.

## 2. Router y Refactor Base (Frontend)
- [x] 2.1 Instalar `react-router-dom`.
- [x] 2.2 Configurar esquema de rutas en `main.jsx` / `App.jsx`.
- [x] 2.3 Extraer lógica de `App.jsx` a custom hooks (ej. `useCustomerSession`).
- [x] 2.4 Migrar estado de sesión a `sessionStorage` para persistencia.
- [x] 2.5 Crear componente `Navbar` base y layout principal.

## 3. Autenticación Administrador
- [x] 3.1 Agregar lógica en backend para validar `ADMIN_ACCESS_CODE`.
- [x] 3.2 Modificar el form de login para redirigir a `/admin` si detecta el código.

## 4. Panel de Administración (Frontend)
- [x] 4.1 Crear vista principal `/admin` protegida.
- [x] 4.2 Crear formulario para Costos y configuración del Popup.
- [x] 4.3 Crear CRUD visual para Catálogo de Planes.
- [x] 4.4 Mostrar dashboard básico con métricas (visitas, clicks).

## 5. Vistas Simples (Cliente)
- [x] 5.1 Crear vista `/nosotros` (estática, con imagen hardcodeada).
- [x] 5.2 Crear vista `/facturacion` (mover botón actual de descarga).
- [x] 5.3 Crear vista `/servicios` (mostrar plan actual y `extra1/2/3` crudos).

## 6. Vista Perfil
- [x] 6.1 Mover card de perfil actual a ruta `/perfil`.
- [x] 6.2 Integrar funcionalidad existente de edición de email en esta nueva vista.

## 7. Catálogo de Planes
- [x] 7.1 Crear vista `/planes`.
- [x] 7.2 Integrar GET a la API de Blobs para listar los planes.
- [x] 7.3 Armar Cards de visualización sin imagen.
- [x] 7.4 Botón "Solicitar" con generación dinámica de mensaje de WhatsApp.

## 8. Compromisos de Pago
- [x] 8.1 Crear función utilitaria para cálculo de ventana de fechas (con Unit Tests en Vitest).
- [x] 8.2 Crear vista `/compromisos`.
- [x] 8.3 Implementar lógica para cuentas bloqueadas (Días 26/27, mensajes especiales).
- [x] 8.4 Integrar Datepicker limitando fechas pasadas (`max(hoy, inicio_ventana)`).
- [x] 8.5 Generar mensajes de WhatsApp dinámicos según estado de cuenta.
- [x] 8.6 QA Mobile: Validación estricta JS en el datepicker (por bypass nativo en iOS/Android), fix redirect de `WHATSAPP_URL` y testing UI responsive con Playwright.

## Handoff / Notas para la próxima sesión
- **ISSUE Pendiente:** El cliente informa que se agregó un "extra" a la cuenta DNI 44129435 en ISPCube, pero no se refleja en el portal.
- **Investigación:**
  - Se probó mapear los campos `extra1`, `extra2`, `extra3` del modelo cliente de ISPCube, pero la API oficial los devuelve como `null`.
  - Se probó mapear la llave `extraplans` de la conexión del cliente, pero la API la devuelve como un array vacío `[]`.
  - Se probó mapear `extra_pack_name` de la conexión, que también devolvió `null`.
  - El código que se intentó usar para mostrarlos fue revertido a su estado original (commit `0f9a8a5`).
- **Próximos pasos a seguir:** Preguntar al usuario en qué pantalla/módulo exacto de ISPCube se dio de alta el extra (Facturación como "artículo extra", como "Plan Extra" desde conexión, etc.) para identificar a qué endpoint de ISPCube hay que apuntar para conseguir esa información, ya que los endpoints `/customer` y `/connection` estándar no lo están incluyendo.
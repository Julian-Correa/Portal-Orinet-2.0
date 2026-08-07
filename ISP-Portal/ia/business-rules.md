## Reglas visibles del negocio

### Acceso al portal

- El cliente ingresa con DNI.
- El DNI valido tiene 7 u 8 digitos.
- Se eliminan puntos, espacios y cualquier caracter no numerico.
- No hay autenticacion fuerte (decision de negocio vigente, ver D-006 y D-007 en `decision.md`).

### Estado de cuenta

- `debt` representa deuda total base.
- `duedebt` representa deuda vencida.
- Si el servicio esta suspendido, se suma un recargo fijo de reconexion (configurable desde backend, default `2000`).
- Si la deuda total queda en `0`, el estado visual es verde.
- Si la deuda total es mayor a `5000`, el estado visual es rojo.
- En cualquier otro caso con deuda, el estado visual es amarillo.

### Estado del servicio

- Estados considerados activos: `active`, `activo`, `enabled`.
- Estados considerados suspendidos: `blocked`, `bloqueado`, `block`, `suspended`, `suspendido`, `disabled`.
- Estado especial: `no_service`.

### Fecha de corte

- La fecha de corte se calcula con dia fijo configurable desde backend (env `CUT_DAY`, default `26`).
- Si la fecha actual ya paso ese dia del mes, se muestra el corte del mes siguiente.
- No se muestra el bloque de fecha de corte si el saldo es $0.

### Facturacion y pagos

- El alias de pago es fijo: `orinet.isp.internet`.
- Si la API devuelve CBU en `customer.customer_cbu[0]`, tambien se muestra y se puede copiar.
- Si no hay factura disponible, la UI muestra un mensaje y no rompe el flujo.

### Recargo de segundo vencimiento

- Se suma al total a pagar y se muestra como desglose.
- Solo se muestra si la consulta ocurre entre los dias 11 y 25 del mes y hay saldo pendiente.
- Configurable desde backend (env `RECARGO_SEGUNDO_VENCIMIENTO`, default `2000`).

### Contacto

- Existe un WhatsApp para administracion y otro para soporte tecnico.
- Cuando hay deuda, se enfatiza el flujo de enviar comprobante de pago.

### Email de facturacion

- Si el cliente ya tiene email, la UI entra en modo edicion.
- Si no tiene email, la UI entra en modo alta.
- El backend invalida la cache del resumen luego de guardar el email.

### Popup comercial

- Existe soporte para popup de imagen, pero hoy esta desactivado con `POPUP_CONFIG.enabled = false`.

### Compromisos de pago (v2)

- **Cliente NO bloqueado:**
  - Debe tener deuda vencida (`duedebt`) <= umbral configurable (default: 10.000). Si la supera, se le indica que debe pagar.
  - La ventana de fechas de compromiso depende del ciclo de facturación (26 al 10 del mes siguiente).
  - Nunca puede elegirse una fecha pasada. El selector restringe entre `max(hoy, inicio_de_ventana)` y el fin de ventana.
- **Cliente bloqueado / suspendido:**
  - Solo pueden solicitar compromisos a través del portal los días definidos (ej. 26 y 27 de cada mes).
  - La fecha del compromiso para ellos se asigna al día actual, y se les cobra recargo por reconexión + compromiso.
  - Si intentan solicitarlo fuera de los días permitidos, se muestra el mensaje: *"Las solicitudes de compromiso de pago mediante el portal para cuentas suspendidas solo están habilitadas los días 26 y 27 de cada mes. Para solicitar compromiso de pago escribanos al whatsapp de administracion."*

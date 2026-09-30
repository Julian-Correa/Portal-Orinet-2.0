export const DIAS_AVISO = [1, 9, 24];

export const AVISOS = {
  1: {
    nombre: "Facturacion disponible",
    title: "Facturacion disponible",
    body: "Ya esta disponible tu factura del mes. Ingresa al portal para consultarla y abonarla.",
    requiereDeuda: false,
  },
  9: {
    nombre: "1er vencimiento",
    title: "Aviso de Vencimiento",
    body: "Te recordamos que el 1er vencimiento de tu factura esta proximo.",
    requiereDeuda: true,
  },
  24: {
    nombre: "2do vencimiento y corte",
    title: "Aviso Importante",
    body: "Aviso de 2do vencimiento y fecha limite de corte.",
    requiereDeuda: true,
  },
};

export function textosPorDefecto() {
  return Object.fromEntries(
    DIAS_AVISO.map((dia) => [dia, { title: AVISOS[dia].title, body: AVISOS[dia].body }])
  );
}

function textoPlano(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

export function armarPayloadAviso({ dia, customer, texto }) {
  const aviso = AVISOS[dia];
  if (!aviso) return null;

  if (aviso.requiereDeuda) {
    const debt = parseFloat(customer?.debt || "0");
    const duedebt = parseFloat(customer?.duedebt || "0");

    if (!(debt > 0 || duedebt > 0)) {
      return null;
    }
  }

  return {
    title: textoPlano(texto?.title) || aviso.title,
    body: textoPlano(texto?.body) || aviso.body,
    url: "/facturacion",
  };
}

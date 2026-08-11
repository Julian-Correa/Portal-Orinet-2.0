import { useState } from "react";
import PageTransition from "../layout/PageTransition.jsx";

import WhatsAppIcon from "../icons/WhatsAppIcon.jsx";
import EmailCard from "../profile/EmailCard.jsx";
import {
  WHATSAPP_URL,
} from "../../lib/config/portalConfig.js";
import { getCutoffDate, getServiceStatus } from "../../lib/utils/customer.js";
import { formatMoney, formatName } from "../../lib/utils/format.js";

export default function ProfileScreen({
  customer,
  recargoReconexion = 2000,
  recargoSegundoVencimiento = 2000,
  cutDay = 26,
  hasBilledSurcharge = false,
  onUpdateCustomer,
}) {
  const [copied, setCopied] = useState(null);

  const debt = parseFloat(customer.debt) || 0;
  const dueDebt = parseFloat(customer.duedebt) || 0;
  const serviceStatus = getServiceStatus(customer.status);
  const currentDay = new Date().getDate();
  const recargo = serviceStatus.suspended ? recargoReconexion : 0;
  const isSecondDueDateWindow = debt > 0 && currentDay >= 11 && currentDay <= 25;
  const shouldAddSurcharge = isSecondDueDateWindow && !hasBilledSurcharge;
  
  const totalDebt = debt + recargo + (shouldAddSurcharge ? recargoSegundoVencimiento : 0);
  const hasDebt = totalDebt > 0;

  const hasSurchargeBreakdown = recargo > 0 || shouldAddSurcharge;

  const debtColor = !hasDebt ? "#10b981" : totalDebt > 5000 ? "#ef4444" : "#f59e0b";
  const debtBg = !hasDebt ? "rgba(16,185,129,0.12)" : totalDebt > 5000 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)";

  const wpPaymentMsg = `Hola OriNet! Soy ${formatName(customer.name)}, DNI ${customer.doc_number}, código de cliente ${customer.code}. Estado del servicio: *${serviceStatus.suspended ? "Bloqueado" : "Habilitado"}*. Les envío el comprobante de pago.`;
  const wpHelpMsg = `Hola OriNet! Soy ${formatName(customer.name)}, DNI ${customer.doc_number}. Necesito ayuda con mi cuenta.`;

  const cbuList = customer.customer_cbu || [];
  const cbu = cbuList[0]?.cbu || cbuList[0]?.number || null;
  const alias = "orinet.isp.internet";
  const cutoffDate = hasDebt ? getCutoffDate(cutDay) : null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <PageTransition>
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div className="profile-content" style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px 60px" }}>
        <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
          <p style={{ margin: "0 0 2px", color: "#cbd5e1", fontSize: 14 }}>Bienvenido/a,</p>
          <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>
            {formatName(customer.name)}
          </h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
            DNI {customer.doc_number} · {customer.city?.name}, {customer.city?.province}
          </p>
        </div>

        <div className="profile-grid">
          <div className="profile-col">
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${debtColor}40`,
                borderRadius: 24,
                padding: "36px 28px",
                marginBottom: 14,
                textAlign: "center",
                boxShadow: `0 0 60px ${debtColor}15`,
                animation: "fadeUp 0.5s ease 0.1s both",
              }}
            >
              <p style={{ margin: "0 0 10px", color: "#cbd5e1", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" }}>
                Saldo a abonar
              </p>
              <div
                className="debt-amount"
                style={{
                  fontSize: 68,
                  fontWeight: 800,
                  color: debtColor,
                  letterSpacing: "-3px",
                  lineHeight: 1,
                  textShadow: `0 0 40px ${debtColor}40`,
                }}
              >
                {formatMoney(totalDebt)}
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 14,
                  background: debtBg,
                  color: debtColor,
                  borderRadius: 99,
                  padding: "6px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {!hasDebt ? "✓ ¡Estás al día! Sin deuda pendiente." : "⚠ Tenés un saldo pendiente de pago."}
              </div>

              {hasSurchargeBreakdown && (
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 18,
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 280 }}>
                    <span style={{ color: "#cbd5e1", fontSize: 13 }}>Deuda</span>
                    <span style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600 }}>{formatMoney(debt)}</span>
                  </div>

                  {recargo > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 280 }}>
                      <span style={{ color: "#f87171", fontSize: 13 }}>Recargo por reconexión</span>
                      <span style={{ color: "#f87171", fontSize: 13, fontWeight: 600 }}>+ {formatMoney(recargo)}</span>
                    </div>
                  )}

                  {shouldAddSurcharge && (
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 280 }}>
                      <span style={{ color: "#f59e0b", fontSize: 13 }}>Recargo de 2do vencimiento</span>
                      <span style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600 }}>
                        + {formatMoney(recargoSegundoVencimiento)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Leyenda si el recargo de 2do vencimiento ya est facturado y estamos en fecha */}
              {isSecondDueDateWindow && hasBilledSurcharge && (
                <div style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: 280, marginTop: 12, padding: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "6px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <span style={{ color: "#fcd34d", fontSize: 12, textAlign: "center" }}>
                    <strong>Aviso:</strong> Su total ya incluye un recargo por 2do vencimiento de <strong>{formatMoney(recargoSegundoVencimiento)}</strong>.
                  </span>
                </div>
              )}

              {dueDebt > 0 && (
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 18,
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#cbd5e1", fontSize: 14 }}>Del cual, deuda vencida:</span>
                  <span style={{ color: "#f87171", fontWeight: 800, fontSize: 16 }}>{formatMoney(dueDebt)}</span>
                </div>
              )}
            </div>

            {hasDebt && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))",
                  border: "1.5px solid rgba(16,185,129,0.3)",
                  borderRadius: 20,
                  padding: "22px",
                  marginBottom: 14,
                  animation: "fadeUp 0.5s ease 0.15s both",
                }}
              >
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      flexShrink: 0,
                      background: "rgba(16,185,129,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10b981",
                    }}
                  >
                    <WhatsAppIcon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 5px", color: "#10b981", fontWeight: 800, fontSize: 15 }}>
                      ⚠️ Una vez pagado, enviá el comprobante
                    </p>
                    <p style={{ margin: "0 0 14px", color: "#6ee7b7", fontSize: 13, lineHeight: 1.6 }}>
                      Después de realizar el pago, <strong>enviá el comprobante a administración por WhatsApp</strong> para que podamos acreditarlo a la brevedad.
                    </p>
                    <a
                      href={WHATSAPP_URL(wpPaymentMsg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 9,
                        background: "linear-gradient(135deg, #25d366, #128c7e)",
                        color: "#fff",
                        borderRadius: 11,
                        padding: "11px 20px",
                        fontWeight: 700,
                        fontSize: 14,
                        textDecoration: "none",
                        fontFamily: "inherit",
                        boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.opacity = "0.88";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.opacity = "1";
                      }}
                    >
                      <WhatsAppIcon size={18} /> Enviar comprobante de pago
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div
              className="status-card"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${serviceStatus.color}30`,
                borderRadius: 20,
                padding: "20px 24px",
                marginBottom: 14,
                animation: "fadeUp 0.5s ease 0.18s both",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <div>
                <p style={{ margin: "0 0 4px", color: "#cbd5e1", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Estado del servicio
                </p>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: serviceStatus.bg,
                    color: serviceStatus.color,
                    borderRadius: 99,
                    padding: "5px 14px",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ fontSize: 10 }}>●</span> {serviceStatus.label}
                </span>
              </div>
              {cutoffDate && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px", color: "#cbd5e1", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                    Próxima fecha de corte
                  </p>
                  <p style={{ margin: 0, color: "#cbd5e1", fontSize: 14, fontWeight: 600 }}>
                    📅 {cutoffDate}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="profile-col">
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "20px 24px",
                marginBottom: 14,
                animation: "fadeUp 0.5s ease 0.22s both",
              }}
            >
              <p style={{ margin: "0 0 14px", color: "#f8fafc", fontWeight: 700, fontSize: 15 }}>
                💳 Datos para el pago
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cbu && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>CBU</span>
                      <p style={{ margin: "2px 0 0", color: "#cbd5e1", fontSize: 13, fontFamily: "monospace", letterSpacing: "1px" }}>{cbu}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(cbu, "cbu")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        flexShrink: 0,
                        background: copied === "cbu" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)",
                        border: `1px solid ${copied === "cbu" ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.12)"}`,
                        color: copied === "cbu" ? "#10b981" : "#94a3b8",
                        borderRadius: 9,
                        padding: "8px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                    >
                      {copied === "cbu" ? "✓ Copiado" : "📋 Copiar CBU"}
                    </button>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    paddingTop: cbu ? "10px" : 0,
                    borderTop: cbu ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  <div>
                    <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Alias</span>
                    <p style={{ margin: "2px 0 0", color: "#cbd5e1", fontSize: 13, fontFamily: "monospace", letterSpacing: "1px" }}>{alias}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(alias, "alias")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      flexShrink: 0,
                      background: copied === "alias" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)",
                      border: `1px solid ${copied === "alias" ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.12)"}`,
                      color: copied === "alias" ? "#10b981" : "#94a3b8",
                      borderRadius: 9,
                      padding: "8px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                  >
                    {copied === "alias" ? "✓ Copiado" : "📋 Copiar alias"}
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "18px 22px",
                marginBottom: 14,
                animation: "fadeUp 0.5s ease 0.3s both",
              }}
            >
              <p style={{ margin: "0 0 12px", color: "#cbd5e1", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Datos de la cuenta
              </p>
              {[
                { label: "Domicilio", value: customer.address },
                { label: "Localidad", value: `${customer.city?.name}, ${customer.city?.province}` },
                customer.phones?.[0] && { label: "Teléfono", value: customer.phones[0].number },
                { label: "Código de cliente", value: customer.code, highlight: true },
              ].filter(Boolean).map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ color: "#cbd5e1", fontSize: 14 }}>{row.label}</span>
                  <span style={{ color: row.highlight ? "#10b981" : "#94a3b8", fontSize: 14, fontWeight: row.highlight ? 700 : 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            <EmailCard customer={customer} onUpdateCustomer={onUpdateCustomer} />

            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "18px 22px",
                animation: "fadeUp 0.5s ease 0.35s both",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <div>
                <p style={{ margin: "0 0 2px", color: "#cbd5e1", fontWeight: 600, fontSize: 14 }}>¿Necesitás ayuda?</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>Contactá a administración OriNet</p>
              </div>
              <a
                href={WHATSAPP_URL(wpHelpMsg)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(37,211,102,0.09)",
                  border: "1px solid rgba(37,211,102,0.22)",
                  color: "#4ade80",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "rgba(37,211,102,0.16)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "rgba(37,211,102,0.09)";
                }}
              >
                <WhatsAppIcon size={17} /> Escribir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          align-items: start;
        }
        .profile-col {
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 700px) {
          .profile-grid { grid-template-columns: 1fr; }
          .profile-content { padding: 20px 14px 40px !important; }
          .debt-amount { font-size: 44px !important; letter-spacing: -1px !important; }
          .status-card { flex-direction: column !important; align-items: flex-start !important; }
          .status-card > div:last-child { text-align: left !important; }
        }
      `}</style>
      </div>
    </PageTransition>
  );
}

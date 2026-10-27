// otp-whatsapp · código de un solo uso por WhatsApp Cloud API (Meta), con una plantilla de autenticación aprobada.
// Más barato que el SMS en América Latina y llega donde el SMS no. Sin dependencias (fetch nativo, Node 18+).
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/** Crea un emisor. `phoneNumberId` y `token` son los de su app de WhatsApp Cloud; `plantilla` es el nombre de una
 *  plantilla de categoría AUTHENTICATION ya aprobada (con botón «copiar código»); `secreto` firma los códigos para no
 *  tener que guardarlos en base de datos. */
export function crearOtp({ phoneNumberId, token, plantilla, idioma = "es", secreto, digitos = 6, minutos = 10, version = "v21.0" }) {
  if (!phoneNumberId || !token || !plantilla || !secreto) throw new Error("Faltan phoneNumberId, token, plantilla o secreto");
  const firmar = (telefono, codigo, vence) => createHmac("sha256", secreto).update(`${telefono}|${codigo}|${vence}`).digest("hex");

  return {
    /** Genera un código, lo manda por WhatsApp y devuelve el «ticket» que luego se verifica. El código no se devuelve. */
    async enviar(telefono) {
      const tel = String(telefono).replace(/\D/g, "");
      const codigo = String(randomInt(0, 10 ** digitos)).padStart(digitos, "0");
      const vence = Date.now() + minutos * 60_000;
      const r = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: tel, type: "template", template: { name: plantilla, language: { code: idioma }, components: [
          { type: "body", parameters: [{ type: "text", text: codigo }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: codigo }] } ] } }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(`WhatsApp: ${JSON.stringify(j.error ?? j).slice(0, 200)}`);
      return { telefono: tel, vence, firma: firmar(tel, codigo, vence), mensajeId: j.messages?.[0]?.id ?? null };
    },
    /** Comprueba el código que escribió el usuario contra el ticket. Devuelve true o false; nunca lanza. */
    verificar(ticket, codigoEscrito) {
      try {
        if (!ticket || Date.now() > ticket.vence) return false;
        const esperado = Buffer.from(ticket.firma, "hex"); const dado = Buffer.from(firmar(ticket.telefono, String(codigoEscrito).trim(), ticket.vence), "hex");
        return esperado.length === dado.length && timingSafeEqual(esperado, dado);
      } catch { return false; }
    },
  };
}

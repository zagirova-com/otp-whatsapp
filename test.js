import assert from "node:assert/strict";
import { crearOtp } from "./index.js";
// Sin tocar la API: se simula fetch para probar el flujo y la verificación.
let enviado = null;
globalThis.fetch = async (url, init) => { enviado = JSON.parse(init.body); return { ok: true, json: async () => ({ messages: [{ id: "wamid.PRUEBA" }] }) }; };
const otp = crearOtp({ phoneNumberId: "123", token: "t", plantilla: "codigo_acceso", secreto: "s3cr3t0", minutos: 1 });
const ticket = await otp.enviar("+1 (809) 555-0100");
const codigo = enviado.template.components[0].parameters[0].text;
assert.equal(ticket.telefono, "18095550100"); assert.equal(ticket.mensajeId, "wamid.PRUEBA"); assert.equal(codigo.length, 6);
assert.equal(otp.verificar(ticket, codigo), true);
assert.equal(otp.verificar(ticket, "000000"), codigo === "000000");
assert.equal(otp.verificar({ ...ticket, vence: Date.now() - 1 }, codigo), false);
assert.equal(otp.verificar(null, codigo), false);
console.log("otp-whatsapp: pruebas ok");

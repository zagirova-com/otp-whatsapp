# otp-whatsapp

Código de un solo uso **por WhatsApp** con la Cloud API de Meta, para iniciar sesión o confirmar un pedido. En América Latina sale más barato que el SMS y llega a teléfonos donde el SMS no entra. Sin dependencias: `fetch` y `crypto` de Node 18+.

El código **no se guarda**: se firma con HMAC junto al teléfono y la hora de vencimiento, y lo que usted guarda en sesión es ese «ticket». Verificar es comparar firmas en tiempo constante.

Lo mantiene [Zagirova](https://zagirova.com). Lo usamos en sistemas donde el cliente confirma un pedido o entra a su cuenta por WhatsApp.

## Requisitos

1. Una app de WhatsApp Cloud API con número verificado.
2. Una plantilla de categoría **Authentication** aprobada por Meta, con el botón «Copiar código» (Meta la genera en el administrador de WhatsApp; el nombre que le ponga es `plantilla`).

## Uso

```js
import { crearOtp } from "otp-whatsapp";

const otp = crearOtp({ phoneNumberId: process.env.WA_PHONE_ID, token: process.env.WA_TOKEN, plantilla: "codigo_acceso", idioma: "es", secreto: process.env.OTP_SECRETO });

// 1) al pedir el código
const ticket = await otp.enviar("+1 809 555 0100");   // manda el WhatsApp; guarde `ticket` en la sesión (no contiene el código)

// 2) al recibir lo que escribió el usuario
otp.verificar(ticket, "483920");                      // true o false; vence a los 10 minutos por defecto
```

## Pruebas

```
node test.js
```

MIT · [Zagirova](https://zagirova.com) · hola@zagirova.com

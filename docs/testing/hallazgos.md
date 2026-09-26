# Hallazgos para las demostraciones de testing

> ¿Qué? Defectos reales de este proyecto que se dejan **sin corregir a propósito**.
> ¿Para qué? Demostrar en clase cómo cada tipo de prueba encuentra lo que las otras no ven, en
> una app real y no en un ejemplo de juguete. Se usan en el
> [Bootcamp Testing ADSO](https://github.com/ergrato-dev/bc-testing-adso).
> ¿Impacto? Si corriges uno, actualiza esta tabla: la demostración de esa semana cambia.

Todos se reprodujeron el 26 de septiembre de 2026 con la BD de pruebas (`db-test`) y Mailpit.

| # | Hallazgo | Quién lo encuentra | Semana |
|:-:|---|---|:-:|
| 1 | JSON mal formado responde 500 en vez de 400 | API (supertest) | 4 |
| 2 | Si el SMTP falla, el registro responde 500 pero el usuario queda guardado | Dobles de prueba | 5 |
| 3 | El frontend muestra el mensaje crudo de axios, no el del API | Componentes con MSW / E2E | 4 y 5 |
| 4 | Tras un registro exitoso aparece "Request failed with status code 403" | E2E (Playwright) | 7 |
| 5 | La verificación se llama dos veces y la página dice "Enlace inválido" | E2E (Playwright) | 7 |
| 6 | El token de verificación se puede usar dos veces con peticiones simultáneas | Integración / API concurrente | 6 y 7 |

---

## 1. JSON mal formado → 500

**Qué pasa.** `express.json()` lanza un error de parseo que `error.middleware.ts` no reconoce, así que termina como `500 INTERNAL_ERROR`. Un cuerpo inválido es un error del cliente (400).

```bash
curl -s -H 'content-type: application/json' -d '{"email":' http://localhost:3000/api/v1/auth/login
# → {"success":false,"error":{"code":"INTERNAL_ERROR",...}} 500
```

**Por qué los tests no lo ven.** Ningún test de `auth.test.ts` envía un cuerpo mal formado.

## 2. SMTP caído: 500 y cuenta bloqueada

**Qué pasa.** `auth.service.ts` guarda el usuario y después hace `await sendVerificationEmail(...)` sin manejar el error. Si el servidor de correo no responde, el registro devuelve **500**, pero el usuario **ya quedó guardado**: al reintentar, la persona recibe `409 "El email ya está registrado."` y nunca le llega el correo.

```bash
# Backend con MAIL_PORT apuntando a un puerto sin servidor
curl … /auth/register   # → 500
curl … /auth/register   # → 409, mismo email
```

**Por qué los tests no lo ven.** `setup.ts` reemplaza el módulo de email con `vi.mock` y las funciones nunca fallan. Es el caso central de la semana 5: un stub que **falla** (`mockRejectedValue`) demuestra que la app no resiste. La versión FastAPI del mismo proyecto sí resiste: compáralas.

## 3. Los mensajes de error del API no llegan a la persona

**Qué pasa.** El API responde `{"success":false,"error":{"code":"UNAUTHORIZED","message":"Credenciales inválidas."}}`, pero la página muestra `Request failed with status code 401`: el frontend usa el mensaje de axios en vez de `error.message`.

**Cómo verlo.** Inicia sesión con una contraseña incorrecta. Con MSW (semana 5), un handler que responda ese mismo JSON hace fallar un test que espere "Credenciales inválidas.".

## 4. Registro exitoso que muestra un error

**Qué pasa.** Después de `POST /auth/register` (201), el frontend intenta iniciar sesión solo; el API responde 403 (*"Debes verificar tu email…"*) y la página muestra `Request failed with status code 403` debajo del título "Crear cuenta". La cuenta sí se creó y el correo sí llegó.

**Cómo verlo.** `e2e/`: registra una cuenta y mira la alerta, o escucha las respuestas de red con `page.on('response')`.

## 5. Verificación duplicada: "Enlace inválido"

**Qué pasa.** Al abrir el enlace del correo, la página llama dos veces a `POST /auth/verify-email` (en desarrollo, `StrictMode` ejecuta dos veces el efecto). La primera responde 200 y verifica la cuenta; la segunda responde 400 y la página muestra **"Enlace inválido"**. La persona cree que falló, pero su cuenta ya está verificada.

**Cómo verlo.** El E2E de `e2e/tests/auth.spec.js` espera la respuesta 200 del API en lugar del texto de la página justamente por esto (ver el comentario del test).

## 6. Token de verificación reutilizable bajo concurrencia

**Qué pasa.** Dos `POST /auth/verify-email` simultáneos con el mismo token leen "no usado" antes de que alguno lo marque: ambos pueden responder 200 (4 de 5 intentos). En serie, el segundo sí responde 400.

**Pista.** Marcar el token con una condición (`updateMany({ where: { token, used: false }, data: { used: true } })`) y revisar cuántas filas cambió: si fue 0, otra petición ya lo usó.

---

## Ya corregido en este repo (no son demostraciones)

- Los tests leían `DATABASE_URL` del `.env` de desarrollo y vaciaban sus tablas. Ahora usan `be/.env.test` (servicio `db-test`) y se detienen si la BD no termina en `_test`.
- Los tests ya no envían correos ni necesitan Mailpit (`vi.mock` en `setup.ts`).
- Los archivos de tests corren en serie: en paralelo, uno vaciaba la BD que otro estaba usando.
- El CI exige cobertura y corre los E2E con PostgreSQL y Mailpit como servicios.

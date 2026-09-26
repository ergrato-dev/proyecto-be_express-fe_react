<div align="center">
  <img src="assets/banner.svg" alt="NN Auth System — Express Edition" width="100%">
</div>

<!--
  ¿Qué? Documentación principal del proyecto NN Auth System (Express Edition).
  ¿Para qué? Guiar a cualquier aprendiz para entender, configurar y ejecutar el proyecto.
  ¿Impacto? Sin este README, los nuevos colaboradores no sabrían cómo levantar el proyecto
  ni entenderían su propósito, arquitectura o convenciones.
-->

> **Proyecto educativo** — SENA | Abril 2026

Sistema de autenticación completo para una empresa genérica **"NN"**, reimplementado con
**Express.js + TypeScript** como contraparte del proyecto original (FastAPI + Python).
Incluye landing page pública, registro, login, cambio y recuperación de contraseña por email.

---

## 📝 Antes de empezar

Este repo **no es solo para clonar y cambiar el look**. Antes de presentarlo como evidencia de
aprendizaje, completa la [**Bitácora obligatoria**](BITACORA.md) — es un checklist secuencial
que verifica, con commits de tu propio repo, que entendiste el flujo real (arquitectura, auth,
base de datos) y no solo la apariencia.

---

## 📋 Tabla de Contenidos

- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [✅ Prerrequisitos](#-prerrequisitos)
- [🚀 Instalación y Setup](#-instalación-y-setup)
- [▶️ Ejecución](#️-ejecución)
- [🧪 Testing](#-testing)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [📏 Convenciones](#-convenciones)
- [📚 Documentación Adicional](#-documentación-adicional)
- [🎓 Propósito Educativo](#-propósito-educativo)
- [⚠️ Exención de Responsabilidades](#️-exención-de-responsabilidades)
- [📄 Licencia](#-licencia)

---

## 🛠️ Stack Tecnológico

### Backend (`be/`)

| Tecnología           | Versión  | Rol                                    |
| -------------------- | -------- | -------------------------------------- |
| **Node.js**          | 20 LTS+  | Runtime principal del backend          |
| **Express.js**       | 5.2.1    | Framework web HTTP                     |
| **TypeScript**       | 5.9.3    | Tipado estático — obligatorio          |
| **PostgreSQL**       | 17+      | Base de datos relacional               |
| **Prisma ORM**       | 7.9.1    | ORM type-safe con migraciones declarativas |
| **jsonwebtoken**     | 9.0.3    | Creación y verificación de tokens JWT  |
| **bcryptjs**         | 2.4.3    | Hashing seguro de contraseñas          |
| **zod**              | 3.25.76  | Validación de schemas y request body   |
| **nodemailer**       | 8.0.4    | Envío de emails (recuperación de pwd)  |
| **helmet**           | 8.1.0    | Headers de seguridad HTTP              |
| **cors**             | 2.8.6    | Middleware CORS                        |
| **express-rate-limit** | 7.5.1  | Rate limiting en endpoints de auth     |
| **vitest**           | 4.1.2    | Framework de testing                   |
| **supertest**        | 7.1.0    | Tests HTTP de integración              |

### Frontend (`fe/`)

| Tecnología              | Versión | Rol                                          |
| ----------------------- | ------- | -------------------------------------------- |
| **React**               | 19.2.4  | Biblioteca para interfaces de usuario        |
| **Vite**                | 8.0.3   | Bundler y dev server ultrarrápido            |
| **TypeScript**          | 5.9.3   | Superset tipado — obligatorio                |
| **TailwindCSS**         | 4.2.2   | Framework CSS utility-first                  |
| **React Router**        | 7.14.0  | Enrutamiento del lado del cliente            |
| **Axios**               | 1.14.0  | Cliente HTTP para comunicación con la API    |
| **lucide-react**        | 1.7.0   | Iconos SVG como componentes React            |
| **Vitest**              | 4.1.2   | Test runner compatible con Vite              |
| **@testing-library/react** | 16.3.2 | Utilities para tests de componentes        |

### Infraestructura de desarrollo

| Herramienta       | Rol                                                   |
| ----------------- | ----------------------------------------------------- |
| **Docker Compose**| PostgreSQL 17 + Mailpit en contenedores locales       |
| **Mailpit**       | Captura SMTP local — UI en `http://localhost:8025`    |

---

## ✅ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

| Herramienta        | Versión mínima | Verificar con            |
| ------------------ | -------------- | ------------------------ |
| **Node.js**        | 20 LTS+        | `node --version`         |
| **pnpm**           | 9+             | `pnpm --version`         |
| **Docker**         | 24+            | `docker --version`       |
| **Docker Compose** | 2.20+          | `docker compose version` |
| **Git**            | 2.40+          | `git --version`          |

> ⚠️ **Importante**: Usar **pnpm** como gestor de paquetes de Node.js.
> **Nunca usar npm ni yarn** en este proyecto.

> 🖥️ **Usuarios de Windows**
> Todos los comandos usan sintaxis Bash. Usa **Git Bash** — viene incluido con
> [Git para Windows](https://git-scm.com/download/win).
> **No uses CMD ni PowerShell.**

### Instalar pnpm (si no lo tienes)

```bash
# Única excepción permitida para usar npm — solo para instalar pnpm
npm install -g pnpm

# Verificar
pnpm --version
```

---

## 🚀 Instalación y Setup

### 1. Clonar el repositorio

```bash
git clone https://github.com/ergrato-dev/proyecto-beex-fe.git
cd proyecto-beex-fe
```

### 2. Levantar la base de datos y el email

```bash
# Inicia PostgreSQL 17 + Mailpit en contenedores Docker
docker compose up -d db mailpit

# Verificar que están corriendo
docker compose ps
# Deberías ver nn_auth_db (healthy) y nn_auth_mailpit (running)
```

> 🐳 **¿Preferís levantar todo en Docker** (`be` y `fe` incluidos, sin instalar Node.js en tu
> máquina)? Corré `./scripts/start.sh` en vez de seguir los pasos 3 y 4 manualmente — ver
> [`docs/setup/con-docker.md`](docs/setup/con-docker.md).

### 3. Configurar el Backend

```bash
cd be

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env si necesitas cambiar algún valor (los defaults funcionan con Docker)
```

Verificar el contenido de `be/.env`:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://nn_user:nn_password@localhost:5432/nn_auth_db
JWT_ACCESS_SECRET=dev-access-secret-change-in-production-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@nn-company.com
FRONTEND_URL=http://localhost:5173
```

Generar el cliente de Prisma y aplicar las migraciones a la base de datos:

```bash
# Generar el cliente de Prisma (tipos TypeScript desde prisma/schema.prisma)
pnpm db:generate

# Aplicar las migraciones existentes a la BD
pnpm db:migrate

# Al modificar prisma/schema.prisma, generar + aplicar una migración nueva:
pnpm db:migrate:dev
```

### 4. Configurar el Frontend

```bash
cd ../fe

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env
```

Verificar `fe/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## ▶️ Ejecución

```bash
# Terminal 1 — Base de datos y email (si no están corriendo)
docker compose up -d

# Terminal 2 — Backend (Express.js)
cd be && pnpm dev
# → API disponible en http://localhost:3000
# → Health check en http://localhost:3000/health

# Terminal 3 — Frontend (React + Vite)
cd fe && pnpm dev
# → App disponible en http://localhost:5173
```

> 📧 **Mailpit** — bandeja de entrada de emails de desarrollo: `http://localhost:8025`
> Aquí se capturan los emails de recuperación de contraseña.

---

## 🧪 Testing

> 🔎 Este proyecto tiene defectos reales documentados para practicar testing en clase:
> [`docs/testing/hallazgos.md`](docs/testing/hallazgos.md).

### Backend

Los tests usan una **BD exclusiva** (`db-test`, puerto 5433), nunca la de desarrollo: borran
todas las tablas antes de cada caso. Si `DATABASE_URL` no apunta a una BD `*_test`, se detienen.
El envío de emails está simulado: no hace falta Mailpit para correrlos.

```bash
# BD de pruebas desechable (una vez por sesión de trabajo)
docker compose up -d --wait db-test

cd be
cp .env.test.example .env.test   # solo la primera vez

# Ejecutar todos los tests
pnpm test

# Ejecutar con cobertura
pnpm test:coverage

# Ejecutar un test específico
pnpm test src/tests/auth.test.ts
```

### Frontend

```bash
cd fe

# Ejecutar todos los tests
pnpm test

# Ejecutar en modo watch (interactivo)
pnpm test:watch

# Ejecutar con cobertura
pnpm test:coverage
```

### E2E (Playwright)

Prueban los flujos críticos en un navegador real: registro, verificación del correo (leído
desde Mailpit), inicio de sesión y dashboard. Playwright levanta el backend (con migraciones)
y el frontend por su cuenta; antes hay que levantar la BD de pruebas y Mailpit.

```bash
docker compose up -d --wait db-test mailpit

cd e2e
pnpm install
pnpm exec playwright install chromium   # solo la primera vez

pnpm test          # todos los E2E
pnpm test:ui       # modo interactivo, paso a paso
pnpm report        # reporte HTML de la última corrida
```

> Si los puertos 3000 o 5173 están ocupados: `API_PORT=3100 FRONT_PORT=5180 pnpm test`.

### Linting

```bash
# Backend
cd be && pnpm lint && pnpm format:check

# Frontend
cd fe && pnpm lint && pnpm format:check
```

### Verificación TypeScript

```bash
# Backend
cd be && node_modules/.bin/tsc --noEmit

# Frontend
cd fe && node_modules/.bin/tsc -b --noEmit
```

---

## 📁 Estructura del Proyecto

```
proyecto-beex-fe/
├── .github/
│   ├── copilot-instructions.md   # Reglas y convenciones del proyecto
│   ├── instructions/             # Instrucciones auto-attach para Copilot
│   └── prompts/                  # Prompts reutilizables
├── .coderabbit.yaml              # Configuración de CodeRabbit (PR reviews)
├── .gitignore                    # Archivos ignorados por git
├── docker-compose.yml            # PostgreSQL 17 + Mailpit + be + fe (stack completo)
├── scripts/
│   ├── start.sh                  # Levanta todo el stack con Docker y espera healthchecks
│   └── stop.sh                   # Detiene el stack
├── README.md                     # ← Este archivo
│
├── docs/                        # Documentación técnica
│   ├── referencia-tecnica/
│   │   ├── architecture.md       # Arquitectura general y diagramas
│   │   ├── api-endpoints.md      # Todos los endpoints con ejemplos
│   │   └── database-schema.md    # Esquema ER, tablas y migraciones
│   ├── conceptos/
│   │   ├── owasp-top-10.md       # Implementación OWASP Top 10 2021
│   │   ├── accesibilidad-aria-wcag.md
│   │   └── patrones-arquitectonicos.md
│   └── requisitos/
│       ├── HUs/                  # Historias de Usuario
│       ├── RFs/                  # Requisitos Funcionales
│       ├── RNFs/                 # Requisitos No Funcionales
│       └── restricciones.md
│
├── be/                           # Backend — Express.js + TypeScript
│   ├── .env.example              # Plantilla de variables de entorno
│   ├── Dockerfile                # Build multi-stage — imagen de producción
│   ├── docker-entrypoint.sh      # Aplica migraciones y arranca el servidor
│   ├── package.json              # Dependencias (pnpm, versiones exactas)
│   ├── tsconfig.json             # Configuración TypeScript
│   ├── prisma.config.ts          # Configuración del Prisma CLI (generate/migrate)
│   ├── prisma/
│   │   ├── schema.prisma         # Definición de tablas (Prisma)
│   │   └── migrations/           # Historial de migraciones SQL generadas por Prisma
│   └── src/
│       ├── index.ts              # Punto de entrada — arranca el servidor
│       ├── app.ts                # Configura Express, middlewares y rutas
│       ├── config.ts             # Configuración con validación zod
│       ├── db/
│       │   └── index.ts          # Instancia de Prisma Client (driver adapter sobre pg)
│       ├── middlewares/
│       │   ├── auth.middleware.ts    # Verificación de JWT
│       │   ├── validate.middleware.ts # Validación con zod
│       │   └── error.middleware.ts   # Manejador global de errores
│       ├── modules/
│       │   ├── auth/             # Router, Controller, Service, Schema
│       │   └── users/            # Router, Controller, Service
│       ├── utils/
│       │   ├── security.ts       # bcrypt + JWT
│       │   └── email.ts          # nodemailer
│       └── tests/
│           ├── setup.ts          # Setup global de Vitest
│           ├── helpers.ts        # Helpers compartidos
│           ├── auth.test.ts      # 37 tests de API con supertest
│           └── security.test.ts  # 5 tests unitarios de hashing y JWT
│
└── fe/                           # Frontend — React + Vite + TypeScript
    ├── .env.example              # Plantilla de variables de entorno
    ├── Dockerfile                # Build multi-stage — sirve el build con nginx
    ├── nginx.conf                # Config de nginx (SPA fallback, cache, gzip)
    ├── package.json              # Dependencias (pnpm, versiones exactas)
    ├── vite.config.ts            # Vite + plugins + Vitest
    ├── tsconfig.app.json         # TypeScript strict para la app
    └── src/
        ├── main.tsx              # Punto de entrada — monta React en el DOM
        ├── App.tsx               # Componente raíz — rutas + providers
        ├── index.css             # TailwindCSS v4 + tema dark/light
        ├── types/auth.ts         # Tipos del dominio de autenticación
        ├── api/
        │   ├── axios.ts          # Instancia Axios + interceptor JWT
        │   └── auth.ts           # Funciones por endpoint de auth
        ├── context/
        │   └── AuthContext.tsx   # Estado global de autenticación
        ├── hooks/
        │   ├── useAuth.ts        # Acceso al AuthContext
        │   └── useTheme.ts       # Tema dark/light con localStorage
        ├── components/
        │   ├── ui/               # Button, InputField, Alert, ThemeToggle, ProtectedRoute
        │   └── layout/           # Layout, Navbar, Footer
        ├── pages/                # 11 páginas (Landing, Login, Register, Dashboard…)
        └── __tests__/            # 67 tests (componentes, hooks, contexto, páginas)
```

---

## 📏 Convenciones

| Aspecto                | Regla                                                          |
| ---------------------- | -------------------------------------------------------------- |
| Nomenclatura técnica   | Inglés (variables, funciones, clases, endpoints, columnas BD)  |
| Comentarios/docs       | Español (con ¿Qué? ¿Para qué? ¿Impacto?)                      |
| Commits                | Conventional Commits en inglés + For/Impact                    |
| TypeScript             | `strict: true` + ESLint + Prettier en BE y FE                  |
| Gestor de paquetes     | `pnpm` exclusivamente — `npm` y `yarn` prohibidos              |
| Versiones              | Exactas en `package.json` — sin `^` ni `~`                     |
| Testing                | Código generado = código probado                               |
| Auditoría de paquetes  | Verificar CVEs en `security.snyk.io` antes de instalar (nuevo paquete) o `pnpm audit` (árbol completo, ver [`AUDITORIA.md`](AUDITORIA.md)) |

Para las reglas completas, ver [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

---

## 📚 Documentación Adicional

| Documento                                                                                        | Descripción                                               |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| [`BITACORA.md`](BITACORA.md)                                                                    | Checklist obligatorio de aprendizaje, fase por fase        |
| [`AUDITORIA.md`](AUDITORIA.md)                                                                  | Auditoría de pertinencia/relevancia/completitud/actualidad/seguridad |
| [`docs/setup/con-docker.md`](docs/setup/con-docker.md)                                         | Setup con Docker — stack completo (`./scripts/start.sh`) o solo infraestructura |
| [`docs/setup/sin-docker.md`](docs/setup/sin-docker.md)                                         | Setup alternativo: PostgreSQL y Node.js 100% nativos      |
| [`docs/referencia-tecnica/architecture.md`](docs/referencia-tecnica/architecture.md)           | Arquitectura general, flujos y decisiones técnicas        |
| [`docs/referencia-tecnica/api-endpoints.md`](docs/referencia-tecnica/api-endpoints.md)         | Todos los endpoints con parámetros, respuestas y errores  |
| [`docs/referencia-tecnica/database-schema.md`](docs/referencia-tecnica/database-schema.md)     | Esquema ER, tablas, columnas y migraciones                |
| [`docs/conceptos/owasp-top-10.md`](docs/conceptos/owasp-top-10.md)                             | Implementación del OWASP Top 10 2021                      |
| [`docs/conceptos/accesibilidad-aria-wcag.md`](docs/conceptos/accesibilidad-aria-wcag.md)       | Estándares ARIA/WCAG 2.1 AA aplicados                     |
| [`docs/conceptos/patrones-arquitectonicos.md`](docs/conceptos/patrones-arquitectonicos.md)     | Patrones de diseño aplicados (MVC, Repository, etc.)      |
| [`be/README.md`](be/README.md)                                                                   | Guía pedagógica completa del backend Express.js           |
| [`fe/README.md`](fe/README.md)                                                                   | Guía pedagógica completa del frontend React               |
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md)                             | Reglas y convenciones del proyecto                        |

---

## 🎓 Propósito Educativo

Este proyecto está diseñado para **aprender haciendo**. Cada archivo, función y componente
incluye comentarios pedagógicos que explican:

- **¿Qué?** — Qué hace este código
- **¿Para qué?** — Por qué existe y cuál es su propósito
- **¿Impacto?** — Qué pasa si no existiera o si se implementa mal

Es la versión **Express.js** del mismo dominio funcional implementado con **FastAPI + Python**
en [`ergrato-dev/proyecto-be_fastapi-fe_react`](https://github.com/ergrato-dev/proyecto-be_fastapi-fe_react).
La comparación entre ambos stacks es parte del proceso de aprendizaje.

> _"La calidad no es una opción, es una obligación."_

---

## ⚠️ Exención de Responsabilidades

Este proyecto es de naturaleza **exclusivamente educativa**, desarrollado como
ejercicio formativo en el marco del SENA.

- **No apto para producción** — El sistema no ha sido auditado para entornos productivos.
  No debe usarse para proteger datos reales sin una revisión de seguridad profesional previa.
- **Credenciales de ejemplo** — Las contraseñas y secretos en `.env.example` son ilustrativos.
  **Nunca usarlos en producción.**
- **Sin garantía de disponibilidad** — El proyecto puede contener bugs propios de un entorno
  de aprendizaje.
- **Responsabilidad del aprendiz** — Cada aprendiz es responsable de comprender el código
  que ejecuta y de no reutilizarlo sin entenderlo completamente.

> Este material se provee **"tal cual"**, sin garantías explícitas ni implícitas.

---

## 📄 Licencia

[![CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

Este proyecto está publicado bajo la licencia **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.

- ✅ Puedes **compartir** y **adaptar** el material (incluyendo forks educativos).
- ❌ **No** puedes usarlo con fines comerciales.
- 🔁 Si adaptas o distribuyes el material, debes hacerlo bajo la **misma licencia**.
- 📌 Siempre debes dar **crédito al autor original** (ergrato-dev).

Ver [`LICENSE`](LICENSE) para el texto completo o visita [creativecommons.org/licenses/by-nc-sa/4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

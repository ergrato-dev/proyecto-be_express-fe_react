/**
 * Archivo: e2e/playwright.config.js
 * Descripción: Configuración de Playwright para los tests E2E del sistema completo.
 * ¿Para qué? Levantar backend y frontend, y correr los flujos críticos en un navegador real.
 * ¿Impacto? Con un solo `pnpm test` se prueba la app de punta a punta. Antes hay que levantar
 *   la BD de pruebas y Mailpit: docker compose up -d --wait db-test mailpit
 */

import { defineConfig, devices } from '@playwright/test';

// ¿Qué? Puertos del frontend y del backend. Cámbialos si ya están ocupados en tu equipo.
const frontPort = Number(process.env.FRONT_PORT ?? 5173);
const apiPort = Number(process.env.API_PORT ?? 3000);
const frontUrl = `http://localhost:${frontPort}`;
const apiUrl = `http://localhost:${apiPort}`;

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: frontUrl,
    // ¿Qué? La app detecta el idioma del navegador; los tests esperan los textos en español.
    locale: 'es-CO',
    // ¿Qué? Guarda la traza cuando un test falla y se reintenta: se abre con `pnpm report`.
    trace: 'on-first-retry',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 1 : 0,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // ¿Qué? Playwright levanta backend y frontend antes de los tests y los apaga al terminar.
  // ¿Impacto? En tu equipo reutiliza los que ya estén corriendo (reuseExistingServer).
  webServer: [
    {
      // ¿Qué? Aplica las migraciones a la BD de pruebas y arranca Express con tsx.
      //   `exec` deja al servidor como proceso principal, así Playwright lo detiene al terminar.
      command: 'sh -c "./node_modules/.bin/prisma migrate deploy && exec ./node_modules/.bin/tsx src/index.ts"',
      cwd: '../be',
      url: `${apiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      env: {
        // ¿Qué? Entorno de pruebas: desactiva el rate limit (los tests registran e inician
        //   sesión muchas veces desde la misma IP).
        NODE_ENV: 'test',
        PORT: String(apiPort),
        // BD de pruebas desechable (servicio db-test), nunca la de desarrollo.
        DATABASE_URL:
          process.env.E2E_DATABASE_URL ?? 'postgresql://nn_user:nn_password@localhost:5433/nn_auth_test',
        // Valores de prueba, nunca los de producción (mínimo 32 caracteres).
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'e2e-access-secret-not-for-production-32',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'e2e-refresh-secret-not-for-production-32',
        // Los correos van a Mailpit; los tests leen el enlace de verificación desde su API.
        MAIL_HOST: 'localhost',
        MAIL_PORT: '1025',
        FRONTEND_URL: frontUrl,
      },
    },
    {
      // Se lanza vite con node, sin pnpm de por medio, para que Playwright pueda detenerlo.
      command: `node node_modules/vite/bin/vite.js --port ${frontPort} --strictPort`,
      cwd: '../fe',
      url: frontUrl,
      reuseExistingServer: !process.env.CI,
      env: { VITE_API_BASE_URL: `${apiUrl}/api/v1` },
    },
  ],
});

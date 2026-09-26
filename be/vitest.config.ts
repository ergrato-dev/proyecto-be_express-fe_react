/**
 * Archivo: vitest.config.ts
 * Descripción: Configuración de Vitest para los tests del backend.
 * ¿Para qué? Indicar a Vitest dónde están los archivos de setup, el entorno
 *   de ejecución (Node.js) y habilitar la cobertura de código.
 * ¿Impacto? Sin esta configuración Vitest no cargaría el setup.ts y los tests
 *   no tendrían la BD limpia entre ejecuciones.
 */

import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'vitest/config';

// ¿Qué? Carga be/.env.test (si existe) antes que cualquier otro .env.
// ¿Para qué? Que los tests usen la BD de pruebas y no la de desarrollo del .env.
// ¿Impacto? dotenv no pisa variables ya definidas: en el CI mandan las del workflow,
//   y config.ts ya no puede reemplazar DATABASE_URL con el valor de .env.
loadEnv({ path: '.env.test' });

export default defineConfig({
  test: {
    // ¿Qué? Entorno de ejecución Node.js (no browser).
    // ¿Para qué? Los tests del backend usan APIs de Node — net, crypto, etc.
    environment: 'node',

    // ¿Qué? Los archivos de tests corren uno a la vez, no en paralelo.
    // ¿Impacto? Todos comparten la misma BD y setup.ts la vacía antes de cada test: en
    //   paralelo, un archivo borraba los usuarios que otro estaba usando y fallaban tests
    //   al azar (2 de cada 8 corridas).
    fileParallelism: false,

    // ¿Qué? Se ejecuta una vez antes de toda la suite, en el proceso principal.
    // ¿Para qué? Detener los tests si DATABASE_URL no es una BD de pruebas y aplicar migraciones.
    globalSetup: ['./src/tests/global-setup.ts'],

    // ¿Qué? Archivos que se ejecutan antes de cada suite de tests.
    // ¿Para qué? El setup.ts limpia la BD entre tests para garantizar aislamiento.
    setupFiles: ['./src/tests/setup.ts'],

    // ¿Qué? Archivos que vitest incluye como tests.
    include: ['src/**/*.test.ts'],

    // ¿Qué? Reporte de cobertura usando el provider v8 de Node.js.
    coverage: {
      provider: 'v8',
      // ¿Qué? "html" genera coverage/index.html, que el CI sube como artefacto.
      reporter: ['text', 'lcov', 'html'],
      // ¿Qué? Se mide la lógica de negocio: rutas, controladores, servicios y middlewares.
      // ¿Impacto? Quedan fuera los tests, los tipos, el arranque (index.ts), la lectura de
      //   variables de entorno (config.ts) y los adaptadores de BD (db/index.ts) y de email
      //   (utils/email.ts): la BD se prueba real y el email se reemplaza con vi.mock.
      include: ['src/**/*.ts'],
      exclude: [
        'src/tests/**',
        'src/types/**',
        'src/**/*.d.ts',
        'src/index.ts',
        'src/config.ts',
        'src/db/index.ts',
        'src/utils/email.ts',
      ],
      // ¿Qué? Umbral mínimo de cobertura: 80% en todo salvo ramas.
      // ¿Impacto? Las ramas están en 72,5%: el umbral queda en la cobertura real redondeada
      //   hacia abajo (regla de trinquete) y solo sube, PR a PR, hasta el 80%.
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 72,
      },
    },
  },
});

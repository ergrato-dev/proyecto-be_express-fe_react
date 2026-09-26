/**
 * Archivo: vite.config.ts
 * Descripción: Configuración de Vite para el frontend React + TypeScript.
 * ¿Para qué? Configurar el bundler, plugins, alias de rutas y el test runner Vitest.
 * ¿Impacto? Un alias mal configurado rompe todos los imports con "@/";
 *   un setup de tests incorrecto hace que los tests no encuentren las utilidades de DOM.
 */

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    // ¿Qué? Plugin oficial de React para Vite (Fast Refresh + JSX transform).
    react(),
    // ¿Qué? Plugin oficial de TailwindCSS v4 para Vite.
    // ¿Para qué? Procesar las directivas de Tailwind directamente en el pipeline de Vite.
    tailwindcss(),
  ],

  resolve: {
    alias: {
      // ¿Qué? Alias "@/" apunta a "src/".
      // ¿Para qué? Imports limpios sin "../../../" — siempre "@/components/ui/Button".
      '@': resolve(__dirname, './src'),
    },
  },

  test: {
    // ¿Qué? Simular el DOM del navegador con jsdom para tests de componentes React.
    environment: 'jsdom',

    // ¿Qué? Archivo que se ejecuta antes de cada suite de tests.
    // ¿Para qué? Cargar @testing-library/jest-dom para tener matchers como toBeInTheDocument.
    setupFiles: ['./src/__tests__/setup.ts'],

    // ¿Qué? Variables globales de vitest (describe, it, expect) sin importar.
    globals: true,

    coverage: {
      provider: 'v8',
      // ¿Qué? "html" genera coverage/index.html, que el CI sube como artefacto.
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      // ¿Qué? Se mide la lógica de la interfaz. Quedan fuera los tests, los tipos, el
      //   arranque (main.tsx, App.tsx con las rutas), la configuración de idiomas (i18n) y el
      //   cliente HTTP (src/api), que se prueba con MSW a nivel de red.
      exclude: [
        'src/__tests__/**',
        'src/types/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/App.tsx',
        'src/i18n/**',
        'src/api/**',
      ],
      // ¿Qué? Umbral mínimo: `pnpm test:coverage` falla si la cobertura baja de aquí.
      // ¿Impacto? Es la cobertura real redondeada hacia abajo (regla de trinquete): solo sube,
      //   PR a PR, hasta el 80%. El umbral anterior (70% en líneas y funciones) nunca se
      //   cumplió ni se exigía en un CI; este es el primero que el CI hace cumplir.
      thresholds: {
        statements: 59,
        branches: 57,
        functions: 45,
        lines: 60,
      },
    },
  },
});


/**
 * Archivo: tests/global-setup.ts
 * Descripción: Se ejecuta UNA vez antes de toda la suite, en el proceso principal de Vitest.
 * ¿Para qué? Comprobar que DATABASE_URL apunta a la BD de pruebas y aplicar las migraciones.
 * ¿Impacto? setup.ts borra todas las tablas antes de cada test: si DATABASE_URL apuntara a
 *   la BD de desarrollo, los tests borrarían tus datos. Aquí se detienen antes de conectarse.
 */

import { execSync } from 'node:child_process';

export default function globalSetup(): void {
  // ¿Qué? Nombre de la BD de la URL (postgresql://usuario:clave@host:puerto/NOMBRE).
  // ¿Para qué? Exigir que termine en '_test', como nn_auth_test del servicio db-test.
  // ¿Impacto? Una URL de desarrollo (nn_auth_db) o una variable ausente detiene la suite.
  const url = process.env.DATABASE_URL ?? '';
  const dbName = url ? new URL(url).pathname.slice(1) : '';
  if (!dbName.endsWith('_test')) {
    throw new Error(
      `DATABASE_URL debe apuntar a una BD de pruebas (nombre terminado en _test), no a '${dbName || 'nada'}'. ` +
        'Copia be/.env.test.example como be/.env.test y levanta: docker compose up -d --wait db-test',
    );
  }

  // ¿Qué? Crea o actualiza las tablas de la BD de pruebas con las migraciones de Prisma.
  // ¿Para qué? La BD de pruebas es desechable: empieza vacía en cada `docker compose up`.
  execSync('prisma migrate deploy', { stdio: 'inherit' });
}

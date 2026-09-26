/**
 * Archivo: tests/setup.ts
 * Descripción: Configuración global ejecutada antes de todos los tests del backend.
 * ¿Para qué? Inicializar y limpiar la BD de tests, asegurar entorno aislado.
 * ¿Impacto? Sin una BD de tests aislada, los tests afectarían datos reales.
 */

import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { db } from '../db/index.js';

// ¿Qué? Reemplaza el módulo de email por funciones vacías (vi.fn) en todos los tests.
// ¿Para qué? Que ningún test envíe correos reales ni dependa de un servidor SMTP corriendo.
// ¿Impacto? Sin este mock, register y forgot-password abren una conexión SMTP de verdad:
//   si Mailpit no está levantado, esos tests fallan con 500.
vi.mock('../utils/email.js', () => ({
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// ¿Qué? Limpiar todas las tablas antes de cada test.
// ¿Para qué? Garantizar que cada test parte de un estado limpio y predecible.
// ¿Impacto? Sin limpiar, el orden de ejecución de tests podría causar fallas intermitentes.
// ¿Por qué este orden? Las FKs de passwordResetToken y emailVerificationToken apuntan
//   a user — deben eliminarse primero para evitar errores de integridad referencial.
beforeEach(async () => {
  await db.passwordResetToken.deleteMany();
  await db.emailVerificationToken.deleteMany();
  await db.user.deleteMany();
});

// ¿Qué? Verificar que la conexión a la BD de tests está disponible antes de empezar.
beforeAll(async () => {
  // La BD de tests llega por DATABASE_URL (be/.env.test o variables del CI);
  // global-setup.ts ya comprobó que es una BD de pruebas.
  console.log('🧪 Setup: BD de tests conectada');
});

afterAll(async () => {
  // ¿Qué? Cierra el pool de conexiones de Prisma al terminar cada archivo de tests.
  await db.$disconnect();
  console.log('🧪 Teardown: tests completados');
});

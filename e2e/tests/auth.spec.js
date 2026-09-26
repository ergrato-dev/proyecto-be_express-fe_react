/**
 * Archivo: e2e/tests/auth.spec.js
 * Descripción: Flujos críticos de autenticación en un navegador real, con backend, BD y Mailpit.
 */

import { expect, test } from '@playwright/test';
import { AuthPages } from './support/auth-pages.js';
import { apiUrl } from './support/env.js';
import { findLinkInEmail } from './support/mailpit.js';

const password = 'Segura1234';

// ¿Qué? Correo único por test: los tests corren en paralelo sobre la misma BD.
function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@nn-company.com`;
}

test('should register, verify the email from Mailpit and reach the dashboard', async ({
  page,
  request,
}) => {
  // Arrange
  const auth = new AuthPages(page);
  const email = uniqueEmail();

  // Act: registro por la UI y apertura del enlace que llegó a Mailpit
  await auth.register({ fullName: 'Ana Prueba', email, password });
  const link = await findLinkInEmail(request, email, '/verify-email');

  // ¿Qué? Se espera la respuesta 200 del API de verificación antes de seguir.
  // ¿Impacto? Sin esta espera, el test navega al login y corta la verificación a mitad de
  //   camino (falla al azar). No se espera el texto de la página: en desarrollo la
  //   verificación se llama dos veces y la segunda muestra "Enlace inválido" (hallazgo
  //   documentado en docs/testing/hallazgos.md).
  const verified = page.waitForResponse(
    (response) => response.url().endsWith('/auth/verify-email') && response.ok(),
  );
  await page.goto(link);
  await verified;

  // Act: inicia sesión con la cuenta ya verificada
  await auth.login(email, password);

  // Assert: llega al dashboard con su nombre en la barra de navegación
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('link', { name: 'Ana Prueba' })).toBeVisible();
});

test('should show an error and stay on login when the password is wrong', async ({
  page,
  request,
}) => {
  // Arrange: la cuenta se crea por API; el test prueba solo el login
  const email = uniqueEmail();
  const response = await request.post(`${apiUrl}/api/v1/auth/register`, {
    data: { email, fullName: 'Ana Prueba', password },
  });
  expect(response.ok()).toBe(true);
  const auth = new AuthPages(page);

  // Act
  await auth.login(email, 'Incorrecta123');

  // Assert
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('should redirect to login when opening the dashboard without a session', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login$/);
});

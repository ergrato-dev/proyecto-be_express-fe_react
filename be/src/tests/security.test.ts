/**
 * Archivo: tests/security.test.ts
 * Descripción: Tests unitarios de las funciones puras de utils/security.ts.
 * ¿Para qué? Probar el hashing de contraseñas y los tokens JWT de forma aislada: sin HTTP
 *   ni endpoints. Cada test sigue el patrón AAA (Arrange, Act, Assert).
 * ¿Impacto? Son los tests más rápidos de la suite y señalan el error exacto: si falla
 *   verifyRefreshToken, el problema está en el JWT y no en un endpoint.
 */

import { describe, it, expect } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from '../utils/security.js';

describe('password hashing', () => {
  it('should not store the plain password when hashing it', async () => {
    // Arrange
    const password = 'Segura1234';

    // Act
    const hashed = await hashPassword(password);

    // Assert
    expect(hashed).not.toBe(password);
    expect(await verifyPassword(password, hashed)).toBe(true);
  });

  it('should return false when the password is wrong', async () => {
    const hashed = await hashPassword('Segura1234');

    expect(await verifyPassword('Incorrecta1234', hashed)).toBe(false);
  });
});

describe('verifyRefreshToken', () => {
  it('should return the user id and email when the refresh token is valid', () => {
    // Arrange
    const token = generateRefreshToken('user-1', 'ana@nn-company.com');

    // Act
    const payload = verifyRefreshToken(token);

    // Assert
    expect(payload).toEqual({ sub: 'user-1', email: 'ana@nn-company.com' });
  });

  it('should throw when given an access token instead of a refresh token', () => {
    const accessToken = generateAccessToken('user-1', 'ana@nn-company.com');

    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });

  it('should throw when the token was modified after being signed', () => {
    // Arrange: se altera el contenido (payload) sin volver a firmarlo.
    // ¿Por qué no el último carácter de la firma? En base64url ese carácter tiene bits de
    //   relleno: cambiar "A" por "B" puede dejar la firma idéntica y el test fallaría al azar.
    const token = generateRefreshToken('user-1', 'ana@nn-company.com');
    const [header, payload, signature] = token.split('.');
    const tamperedPayload = (payload.startsWith('f') ? 'e' : 'f') + payload.slice(1);
    const tampered = `${header}.${tamperedPayload}.${signature}`;

    // Act / Assert
    expect(() => verifyRefreshToken(tampered)).toThrow();
  });
});

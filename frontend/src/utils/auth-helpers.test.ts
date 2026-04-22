import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authStorage, validateEmail, validatePassword, validateName } from './auth-helpers';
import { User } from '@/types/auth';
import { createLocalStorageMock, setupLocalStorageMock, createJWTToken, createMockUser } from '@/__tests__/helpers';

// ============================================================================
// Test Configuration
// ============================================================================

describe('authStorage', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  // ==========================================================================
  // Setup & Teardown
  // ==========================================================================

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    setupLocalStorageMock(localStorageMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  
  describe('getToken', () => {
    describe('success cases', () => {
      it('should return token when it exists', () => {
        const token = 'test-token-123';
        localStorageMock.setItem('authToken', token);

        expect(authStorage.getToken()).toBe(token);
        expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
      });
    });

    describe('error cases', () => {
      it('should return null when token does not exist', () => {
        expect(authStorage.getToken()).toBeNull();
        expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
      });

      it('should handle localStorage errors gracefully', () => {
        const originalGetItem = localStorageMock.getItem;
        localStorageMock.getItem = vi.fn(() => {
          throw new Error('Storage error');
        });

        expect(authStorage.getToken()).toBeNull();

        localStorageMock.getItem = originalGetItem;
      });
    });
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      const token = 'new-token-456';
      authStorage.setToken(token);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', token);
      expect(localStorageMock.getItem('authToken')).toBe(token);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      authStorage.setToken('test-token');

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('getUser', () => {
    it('should return null when user does not exist', () => {
      expect(authStorage.getUser()).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('should return parsed user when it exists', () => {
      const user = createMockUser();
      localStorageMock.setItem('user', JSON.stringify(user));

      const result = authStorage.getUser();

      expect(result).toEqual(user);
      expect(result?._id).toBe('123');
      expect(result?.name).toBe('Test User');
      expect(result?.email).toBe('test@example.com');
      expect(result?.role).toBe('user');
    });

    it('should return user with optional fields', () => {
      const user: User = {
        _id: '456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        isVerified: true,
        loginCount: 5,
        lastLogin: '2024-01-01T00:00:00.000Z',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      localStorageMock.setItem('user', JSON.stringify(user));

      const result = authStorage.getUser();

      expect(result).toEqual(user);
      expect(result?.isVerified).toBe(true);
      expect(result?.loginCount).toBe(5);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.setItem('user', 'invalid-json{');

      expect(authStorage.getUser()).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(authStorage.getUser()).toBeNull();

      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('setUser', () => {
    it('should store user in localStorage', () => {
      const user = createMockUser();
      authStorage.setUser(user);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
      const stored = localStorageMock.getItem('user');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(user);
    });

    it('should store userId separately when _id exists', () => {
      const user = createMockUser({ _id: '123' });
      authStorage.setUser(user);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', '123');
      expect(localStorageMock.getItem('userId')).toBe('123');
    });

    it('should not store userId when _id is empty', () => {
      const user = createMockUser({ _id: '' });
      authStorage.setUser(user);

      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('userId', expect.anything());
      expect(localStorageMock.getItem('userId')).toBeNull();
    });

    it('should handle user without _id field', () => {
      const user = { name: 'Test User', email: 'test@example.com' } as User;
      authStorage.setUser(user);

      const stored = localStorageMock.getItem('user');
      expect(stored).toBeTruthy();
      expect(localStorageMock.getItem('userId')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const user = createMockUser();
      authStorage.setUser(user);

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('clear', () => {
    it('should remove all auth-related items from localStorage', () => {
      localStorageMock.setItem('authToken', 'token');
      localStorageMock.setItem('user', '{"_id":"123"}');
      localStorageMock.setItem('userId', '123');
      localStorageMock.setItem('otherData', 'should remain');

      authStorage.clear();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userId');
      expect(localStorageMock.getItem('authToken')).toBeNull();
      expect(localStorageMock.getItem('user')).toBeNull();
      expect(localStorageMock.getItem('userId')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const originalRemoveItem = localStorageMock.removeItem;
      localStorageMock.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      authStorage.clear();

      localStorageMock.removeItem = originalRemoveItem;
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when token does not exist', () => {
      expect(authStorage.isAuthenticated()).toBe(false);
    });

    it('should return true when valid non-JWT token exists', () => {
      localStorageMock.setItem('authToken', 'simple-token');

      expect(authStorage.isAuthenticated()).toBe(true);
    });

    it('should return true when valid JWT token exists (not expired)', () => {
      const token = createJWTToken({ sub: '123', name: 'Test User' });
      localStorageMock.setItem('authToken', token);

      expect(authStorage.isAuthenticated()).toBe(true);
    });

    it('should return false and clear storage when token is expired', () => {
      const token = createJWTToken({ sub: '123' }, true);
      localStorageMock.setItem('authToken', token);
      localStorageMock.setItem('user', '{"_id":"123"}');

      expect(authStorage.isAuthenticated()).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('should handle malformed JWT token gracefully (not 3 parts)', () => {
      localStorageMock.setItem('authToken', 'invalid.jwt');

      expect(authStorage.isAuthenticated()).toBe(true);
    });

    it('should handle invalid base64 in JWT payload gracefully', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const token = `${header}.invalid-base64!!!.signature`;
      localStorageMock.setItem('authToken', token);

      expect(authStorage.isAuthenticated()).toBe(true);
    });

    it('should handle invalid JSON in JWT payload gracefully', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa('invalid-json{');
      const token = `${header}.${payload}.signature`;
      localStorageMock.setItem('authToken', token);

      expect(authStorage.isAuthenticated()).toBe(true);
    });

    it('should handle JWT token without exp field', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ sub: '123', name: 'Test User' }));
      const token = `${header}.${payload}.signature`;
      localStorageMock.setItem('authToken', token);

      expect(authStorage.isAuthenticated()).toBe(true);
    });
  });
});

describe('validateEmail', () => {
  describe('valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.com',
      'user_name@example.com',
      'user123@example.com',
      'a@b.co',
      'test@test.test',
      'a.b@c.d',
      'user@subdomain.example.com',
    ];

    it.each(validEmails)('should return true for "%s"', (email) => {
      expect(validateEmail(email)).toBe(true);
    });
  });

  describe('invalid emails', () => {
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'user@',
      'user@domain',
      '',
      'user name@example.com',
      'user@example',
      'user@@example.com',
    ];

    it.each(invalidEmails)('should return false for "%s"', (email) => {
      expect(validateEmail(email)).toBe(false);
    });
  });
});

describe('validatePassword', () => {
  describe('valid passwords', () => {
    const validPasswords = [
      { password: '123456', description: '6 digits' },
      { password: 'password123', description: 'alphanumeric' },
      { password: 'verylongpassword', description: 'long password' },
      { password: 'P@ssw0rd!', description: 'with special chars' },
      { password: '      ', description: '6 spaces' },
      { password: '12345 ', description: '6 chars with space' },
      { password: '!@#$%^', description: '6 special chars' },
    ];

    it.each(validPasswords)('should return true for $description', ({ password }) => {
      expect(validatePassword(password)).toBe(true);
    });
  });

  describe('invalid passwords', () => {
    const invalidPasswords = [
      { password: '12345', description: '5 digits' },
      { password: 'pass', description: '4 chars' },
      { password: '', description: 'empty' },
      { password: '123', description: '3 chars' },
      { password: 'abc', description: '3 letters' },
      { password: '     ', description: '5 spaces' },
    ];

    it.each(invalidPasswords)('should return false for $description', ({ password }) => {
      expect(validatePassword(password)).toBe(false);
    });
  });
});

describe('validateName', () => {
  describe('valid names', () => {
    const validNames = [
      { name: 'John', description: 'simple name' },
      { name: 'John Doe', description: 'full name' },
      { name: '  Valid Name  ', description: 'with spaces' },
      { name: 'AB', description: '2 chars' },
      { name: '  AB  ', description: '2 chars with spaces' },
      { name: 'Mohammed Ali', description: 'arabic name' },
      { name: '  John  ', description: 'trimmed name' },
      { name: 'A B', description: 'name with space' },
    ];

    it.each(validNames)('should return true for $description', ({ name }) => {
      expect(validateName(name)).toBe(true);
    });
  });

  describe('invalid names', () => {
    const invalidNames = [
      { name: 'A', description: 'single char' },
      { name: '', description: 'empty' },
      { name: '   ', description: 'only spaces' },
      { name: '  A  ', description: 'single char with spaces' },
      { name: ' ', description: 'single space' },
    ];

    it.each(invalidNames)('should return false for $description', ({ name }) => {
      expect(validateName(name)).toBe(false);
    });
  });
});

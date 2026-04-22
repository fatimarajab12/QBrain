# 🧪 Frontend Unit Testing Guide

## 📊 Overview

| Metric | Value |
|--------|-------|
| Test Files | 5 |
| Total Tests | 150+ |
| Framework | Vitest + React Testing Library |
| Coverage | Growing |
| Test Strategy | Unit Tests (Current) → Integration Tests (Future) |

This guide provides comprehensive documentation for writing and maintaining unit tests in the QBrain frontend codebase.

## 📁 Test Structure

### **Organization Strategy: Co-location Pattern**

Tests are placed next to their source files for easy discovery and maintenance. This pattern improves code navigation and keeps related files together.

```
src/
├── hooks/
│   ├── use-auth.ts
│   ├── use-auth.test.tsx          ✅ Comprehensive (30+ tests)
│   ├── useFeatures.ts
│   └── useFeatures.test.tsx       ✅ Comprehensive (30+ tests)
│
├── services/
│   ├── auth.service.ts
│   ├── auth.service.test.ts       ✅ Comprehensive
│   ├── api.ts
│   └── api.test.ts                ✅ Comprehensive
│
└── utils/
    ├── auth-helpers.ts
    └── auth-helpers.test.ts       ✅ Comprehensive (68+ tests)
```

### **Shared Test Infrastructure**

```
src/__tests__/
├── helpers/                       # Reusable test helpers
│   ├── api.helper.ts             # API mocking utilities
│   ├── auth-test.helpers.ts      # Auth test helpers
│   ├── feature.helper.ts         # Feature mock helpers
│   ├── project.helper.ts         # Project mock helpers
│   ├── test-case.helper.ts       # Test case mock helpers
│   ├── jwt.helper.ts             # JWT token utilities
│   ├── localStorage.mock.ts      # Storage mocking
│   ├── user.helper.ts            # User mock helpers
│   └── index.ts                  # Re-exports
│
├── mocks/                         # Shared mocks
│   └── router.mock.ts            # React Router mocks
│
├── setup/                         # Test setup
│   └── test-utils.tsx            # Test utilities
│
├── README.md                      # This file
└── STRUCTURE.md                   # Structure documentation
```

## 📋 Current Test Coverage

| Module | Category | File | Tests | Coverage | Status |
|--------|----------|------|-------|----------|--------|
| **use-auth** | Hooks | `hooks/use-auth.ts` | 30+ | ✅ | ✅ Complete |
| **useFeatures** | Hooks | `hooks/useFeatures.ts` | 30+ | ✅ | ✅ Complete |
| **auth.service** | Services | `services/auth.service.ts` | 20+ | ✅ | ✅ Complete |
| **api** | Services | `services/api.ts` | 22+ | ✅ | ✅ Complete |
| **auth-helpers** | Utils | `utils/auth-helpers.ts` | 68+ | ✅ | ✅ Complete |
| **Total** | - | 5 files | 150+ | - | ✅ |

### Test Categories Covered

- ✅ **Authentication Flow**: Login, signup, logout, password reset
- ✅ **Data Fetching**: React Query hooks, optimistic updates
- ✅ **API Layer**: Request/response handling, error management
- ✅ **Utilities**: Validation, formatting, helper functions

## 🚀 Quick Start

### Installation

Tests use Vitest and React Testing Library, already configured in the project:

```bash
# Install dependencies (if not already installed)
npm install
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run specific test file
npm test -- use-auth
npm test -- useFeatures
npm test -- auth.service
npm test -- api
npm test -- auth-helpers

# Run tests by category
npm test -- hooks          # All hook tests
npm test -- services       # All service tests
npm test -- utils          # All utility tests

# Run with coverage report
npm test -- --coverage

# Run with UI mode (interactive)
npm test -- --ui

# Run in verbose mode
npm test -- --reporter=verbose
```

### Test Commands Summary

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Watch mode (reruns on file changes) |
| `npm test -- <pattern>` | Run tests matching pattern |
| `npm test -- --coverage` | Generate coverage report |
| `npm test -- --ui` | Open interactive UI |
| `npm test -- --reporter=verbose` | Detailed output |

## 🛠️ Test Helpers

The test helpers provide reusable utilities for creating mocks and setting up test environments. All helpers are exported from `@/__tests__/helpers`.

### Import All Helpers

```typescript
import {
  // User helpers
  createMockUser,
  createMockAdminUser,
  
  // Feature helpers
  createMockFeature,
  createMockFeatures,
  createMockAIFeature,
  
  // Project helpers
  createMockProject,
  createMockProjects,
  
  // Test case helpers
  createMockTestCase,
  createMockTestCases,
  
  // Auth helpers
  setupAuthMocks,
  waitForInitialization,
  performLogin,
  
  // API helpers
  createMockResponse,
  createMockErrorResponse,
  mockFetch,
  
  // Storage helpers
  createLocalStorageMock,
  setupLocalStorageMock,
  
  // JWT helpers
  createJWTToken,
} from '@/__tests__/helpers';
```

### Helper Categories

#### 👤 User Helpers (`user.helper.ts`)
Creates mock user objects with customizable properties.

#### 🎯 Feature Helpers (`feature.helper.ts`)
Creates mock feature objects, including AI-generated features.

#### 📦 Project Helpers (`project.helper.ts`)
Creates mock project objects with realistic data.

#### ✅ Test Case Helpers (`test-case.helper.ts`)
Creates mock test case objects with various statuses and priorities.

#### 🔐 Auth Helpers (`auth-test.helpers.ts`)
Utilities for testing authentication flows and user sessions.

#### 🌐 API Helpers (`api.helper.ts`)
Mocks for fetch API and HTTP responses.

#### 💾 Storage Helpers (`localStorage.mock.ts`)
Mock implementations for localStorage operations.

#### 🔑 JWT Helpers (`jwt.helper.ts`)
Utilities for creating and validating JWT tokens.

### Usage Examples

#### User Mocks

```typescript
const user = createMockUser();
const admin = createMockAdminUser();
const customUser = createMockUser({ name: 'Custom', email: 'custom@example.com' });
```

#### Feature Mocks

```typescript
const feature = createMockFeature();
const aiFeature = createMockAIFeature();
const features = createMockFeatures(5);
const featuresWithStatuses = createMockFeaturesWithStatuses();
```

#### Project Mocks

```typescript
const project = createMockProject();
const projects = createMockProjects(3);
```

#### Test Case Mocks

```typescript
const testCase = createMockTestCase();
const testCases = createMockTestCases(10);
const testCasesWithStatuses = createMockTestCasesWithStatuses();
```

#### API Mocks

```typescript
// Mock success response
mockFetch(createMockSuccessResponse({ data: 'test' }));

// Mock error response
mockFetch(createMockErrorResponse('Error message', 404));
```

#### localStorage Mock

```typescript
const localStorageMock = createLocalStorageMock();
setupLocalStorageMock(localStorageMock);
```

## 📝 Test Structure Template

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { functionToTest } from './file-to-test';
import { createMockUser } from '@/__tests__/helpers';

describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('functionName', () => {
    it('should do something when condition is met', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## ✅ Best Practices

### Writing Tests

1. **Co-location**: Keep tests next to source files (`.test.ts` or `.test.tsx`)
2. **Naming Convention**: Use descriptive names with "should" format
   ```typescript
   it('should return user data when login succeeds', () => { ... })
   ```
3. **Arrange-Act-Assert**: Structure tests in three clear phases
   ```typescript
   it('should handle error', () => {
     // Arrange
     const error = new Error('Failed');
     
     // Act
     const result = handleError(error);
     
     // Assert
     expect(result).toBe(expected);
   });
   ```
4. **Use Helpers**: Always use shared helpers from `__tests__/helpers/`
5. **Test Independence**: Each test should be standalone and not depend on others
6. **Clean Up**: Always restore mocks in `afterEach` or `afterAll`
   ```typescript
   afterEach(() => {
     vi.restoreAllMocks();
     vi.clearAllMocks();
   });
   ```
7. **Mock External Dependencies**: Mock API calls, localStorage, and external services
8. **Test Edge Cases**: Include tests for error conditions and boundary cases
9. **Async Testing**: Use `waitFor` and `act` appropriately for async operations
10. **Descriptive Assertions**: Use meaningful assertion messages

### Testing Hooks

```typescript
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Wrap hooks that use React Query
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const { result } = renderHook(() => useFeatures('project-id'), { wrapper });
```

### Testing Services

```typescript
import { vi } from 'vitest';
import { mockFetch } from '@/__tests__/helpers';

beforeEach(() => {
  global.fetch = vi.fn();
});

it('should handle API errors', async () => {
  mockFetch(createMockErrorResponse('Not Found', 404));
  
  await expect(service.getData()).rejects.toThrow();
});
```

## 🎯 Test Categories

### **Unit Tests** (Current Focus ✅)

These tests verify individual units of code in isolation:

- ✅ **Hooks** (`use-auth`, `useFeatures`)
  - State management
  - Side effects
  - Error handling
  - Optimistic updates
  
- ✅ **Services** (`auth.service`, `api`)
  - API calls
  - Data transformation
  - Error handling
  - Request/response handling
  
- ✅ **Utils** (`auth-helpers`)
  - Pure functions
  - Validation logic
  - Data formatting
  - Helper utilities

### **Integration Tests** (Future 📝)

Planned test coverage for user-facing features:

- 📝 **Components**
  - Component rendering
  - User interactions
  - Props handling
  - Event handling
  
- 📝 **Pages**
  - Page navigation
  - Data loading
  - Form submissions
  - Error states
  
- 📝 **User Flows**
  - Complete workflows
  - Multi-step processes
  - Cross-component interactions

## 🔍 Finding Tests

### By Source File
Look for `.test.ts` or `.test.tsx` next to the source file:
```
src/hooks/use-auth.ts → src/hooks/use-auth.test.tsx
src/services/api.ts → src/services/api.test.ts
```

### By Category
- **Hooks**: `src/hooks/**/*.test.tsx`
- **Services**: `src/services/**/*.test.ts`
- **Utils**: `src/utils/**/*.test.ts`

### By Pattern Matching
```bash
# Find all test files
find src -name "*.test.ts*"

# Find tests for specific module
npm test -- use-auth
npm test -- auth
```

## 📚 Resources

### Official Documentation
- [Vitest Documentation](https://vitest.dev/) - Main testing framework
- [React Testing Library](https://testing-library.com/react) - React component testing
- [React Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing) - Testing React Query hooks

### Best Practices & Guides
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - Kent C. Dodds
- [Testing JavaScript](https://testingjavascript.com/) - Comprehensive testing course
- [React Testing Best Practices](https://kentcdodds.com/blog/how-to-test-custom-react-hooks)

### Project-Specific
- Check existing test files for examples and patterns
- Review `__tests__/helpers/` for available utilities
- See `vitest.config.ts` for configuration

## 🐛 Debugging Tests

### Common Issues

1. **Tests timing out**: Increase timeout or check async operations
   ```typescript
   it('should handle async', async () => {
     await waitFor(() => expect(result.current.data).toBeDefined(), { timeout: 5000 });
   });
   ```

2. **Mock not working**: Ensure mocks are reset between tests
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

3. **React Query cache**: Create new QueryClient for each test
   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: { queries: { retry: false, cacheTime: 0 } }
   });
   ```

### Debug Mode

```bash
# Run with Node.js debugger
node --inspect-brk node_modules/.bin/vitest

# Or use VS Code debugger with launch.json configuration
```

## 📈 Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Hooks | 80%+ | ✅ Growing |
| Services | 80%+ | ✅ Growing |
| Utils | 90%+ | ✅ Excellent |
| Components | 70%+ | 📝 Planned |
| Overall | 75%+ | 📈 In Progress |

---

**Last Updated**: January 2025  


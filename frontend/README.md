# QBrain Frontend

A modern, type-safe React frontend application for QBrain - an AI-powered SRS analysis and test case generation platform. Built with React 18, TypeScript, Vite, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Key Features](#-key-features)
- [State Management](#-state-management)
- [Performance Optimizations](#-performance-optimizations)
- [Development Guidelines](#-development-guidelines)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Browser Support](#-browser-support)

---

## 🎯 Overview

QBrain Frontend provides a comprehensive, user-friendly interface for managing software testing projects, including:

- **Project Management**: Create, organize, and manage multiple testing projects
- **Feature Tracking**: Track features extracted from SRS documents with metadata and scores
- **Test Case Management**: Generate, organize, and manage test cases with Gherkin format support
- **Bug Tracking**: Comprehensive bug reporting and tracking system with file attachments
- **AI Integration**: Seamless integration with AI-powered feature extraction and test case generation
- **Real-time Collaboration**: Share projects with team members and collaborate in real-time
- **Analytics Dashboard**: Project statistics, coverage analysis, and performance metrics

---

## 🛠️ Tech Stack

### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 18.3.1 |
| **TypeScript** | Type safety | 5.8.3 |
| **Vite** | Build tool & dev server | 5.4.19 |
| **React Router** | Client-side routing | 6.30.1 |
| **TanStack Query** | Data fetching & caching | 5.83.0 |

### UI & Styling

| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | High-quality UI component library |
| **Radix UI** | Unstyled, accessible component primitives |
| **Lucide React** | Icon library |
| **next-themes** | Dark mode support |

### Form Management & Validation

| Technology | Purpose |
|------------|---------|
| **React Hook Form** | Performant form state management |
| **Zod** | Schema validation |
| **@hookform/resolvers** | Zod integration for React Hook Form |

### Additional Libraries

- **date-fns**: Date manipulation and formatting
- **sonner**: Toast notifications
- **recharts**: Data visualization and charts
- **clsx** & **tailwind-merge**: Conditional CSS classes

---

## 🏗️ Architecture

### Application Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Pages, Components, UI Components)     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         State Management                │
│  (React Query, React Hook Form, State)  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Service Layer                   │
│  (API Services, Data Transformation)    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         API Layer                       │
│  (HTTP Client, Interceptors, Auth)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Backend API                     │
│  (REST API Endpoints)                   │
└─────────────────────────────────────────┘
```

### Key Architectural Patterns

1. **Component-Based Architecture**: Modular, reusable React components
2. **Container/Presentational Pattern**: Separation of logic and presentation
3. **Custom Hooks**: Encapsulated business logic and state management
4. **Service Layer**: Centralized API communication and data transformation
5. **Type Safety**: Full TypeScript coverage for type-safe development

---

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
│   └── *.png                  # Images and icons
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── loading-button.tsx
│   │   │   ├── page-loading.tsx
│   │   │   └── ... (50+ components)
│   │   ├── custom/            # Custom components
│   │   │   ├── DotGrid.tsx
│   │   │   └── Orb.tsx
│   │   ├── ProjectChatBot/    # Chatbot component
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.tsx
│   │   ├── shared/            # Shared components
│   │   │   ├── PrefetchLink.tsx
│   │   │   └── SuspenseFallback.tsx
│   │   ├── AdminRoute.tsx     # Route protection
│   │   ├── AppSidebar.tsx     # Main navigation
│   │   ├── ErrorBoundary.tsx  # Error handling
│   │   └── Logo.tsx
│   │
│   ├── pages/                 # Page components (routes)
│   │   ├── auth/              # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── ProjectCard.tsx
│   │   │   └── CreateProjectDialog.tsx
│   │   ├── project-details/   # Project management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── BugTab.tsx
│   │   │   ├── CreateFeatureDialog.tsx
│   │   │   ├── CreateBugDialog.tsx
│   │   │   ├── TestCasesPage.tsx
│   │   │   └── ...
│   │   ├── feature-details/   # Feature management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── CreateTestCaseDialog.tsx
│   │   │   ├── EditTestCaseDialog.tsx
│   │   │   └── ...
│   │   ├── bug-details/       # Bug details page
│   │   │   └── components/
│   │   ├── admin-dashboard/   # Admin panel
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── Dashboard.tsx
│   │   ├── ProjectDetails.tsx
│   │   ├── FeatureDetails.tsx
│   │   ├── BugDetails.tsx
│   │   └── Profile.tsx
│   │
│   ├── services/              # API service layer
│   │   ├── api.ts             # Base API configuration
│   │   ├── auth.service.ts    # Authentication API
│   │   ├── project.service.ts # Project API
│   │   ├── feature.service.ts # Feature API
│   │   ├── test-case.service.ts # Test case API
│   │   ├── bug.service.ts     # Bug API
│   │   ├── user.service.ts    # User API
│   │   └── admin.service.ts   # Admin API
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-auth.ts        # Authentication hook
│   │   ├── useProjects.ts     # Projects management
│   │   ├── useFeatures.ts     # Features management
│   │   ├── useTestCases.ts    # Test cases management
│   │   ├── useProjectTestCases.ts # Project-level test cases
│   │   ├── useBugs.ts         # Bugs management
│   │   ├── useUserProfile.ts  # User profile
│   │   └── use-mobile.tsx     # Responsive detection
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.ts            # Authentication types
│   │   ├── project.ts         # Project types
│   │   ├── feature.ts         # Feature types
│   │   ├── test-case.ts       # Test case types
│   │   ├── bug.ts             # Bug types
│   │   └── user.ts            # User types
│   │
│   ├── utils/                 # Utility functions
│   │   ├── auth-helpers.ts    # Auth utilities
│   │   ├── auth-helpers.test.ts # Auth utilities tests
│   │   ├── feature-helpers.ts # Feature utilities
│   │   ├── bug-helpers.tsx    # Bug utilities
│   │   ├── test-case-helpers.ts # Test case utilities
│   │   ├── array-helpers.ts   # Array utilities
│   │   ├── navigation.ts      # Navigation helpers
│   │   └── logger.ts          # Logging utilities
│   │
│   ├── __tests__/             # Shared test utilities
│   │   └── helpers/           # Test helper functions
│   │       ├── index.ts       # Main export
│   │       ├── localStorage.mock.ts  # localStorage mocking
│   │       ├── jwt.helper.ts  # JWT token helpers
│   │       └── user.helper.ts # User mock helpers
│   │
│   ├── config/                # Configuration files
│   │   └── routes.tsx         # Route definitions
│   │
│   ├── layouts/               # Layout components
│   │   └── AppLayout.tsx      # Main application layout
│   │
│   ├── lib/                   # Library utilities
│   │   └── utils.ts           # General utilities (cn, etc.)
│   │
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles
│   └── vite-env.d.ts          # Vite type definitions
│
├── .env.local                 # Environment variables (gitignored)
├── vite.config.ts             # Vite configuration
├── vitest.config.ts           # Vitest test configuration
├── vitest.setup.ts            # Test setup file
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── components.json            # shadcn/ui configuration
└── package.json               # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 (or yarn/pnpm)
- **Backend Server**: QBrain backend should be running (see backend README)

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env.local file
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080` (default Vite port)

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview production build:**
   ```bash
   npm run preview
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run build:dev        # Build in development mode
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint

# Testing
npm run test             # Run all tests once
npm run test:watch       # Run tests in watch mode
npm test -- <pattern>     # Run specific test files (e.g., auth-helpers)
```

---

## ✨ Key Features

### 🔐 Authentication System

- **User Registration**: Email-based signup with validation
- **Login/Logout**: JWT-based authentication
- **Password Reset**: Secure password reset flow with email verification
- **Protected Routes**: Role-based access control (User, Admin)
- **Session Management**: Automatic token refresh and persistence

### 📊 Dashboard

- **Project Overview**: Visual cards showing project status and statistics
- **Quick Actions**: Create new projects, access recent projects
- **Search & Filter**: Find projects quickly
- **Project Statistics**: Overview of features, test cases, and bugs

### 🎯 Project Management

- **Create Projects**: Initialize new testing projects with SRS upload
- **Project Details**: Comprehensive project information and settings
- **SRS Processing**: Upload and process SRS documents (PDF/TXT)
- **AI Feature Extraction**: Generate features from SRS using AI
- **Project Sharing**: Share projects with team members
- **Project Analytics**: Coverage analysis, statistics, and metrics

### 🔧 Feature Management

- **Feature List**: View all features with filtering and search
- **Feature Details**: Detailed feature information with metadata
- **Feature Types**: FUNCTIONAL, DATA, INTERFACE, QUALITY, etc.
- **Priority Management**: Set and update feature priorities
- **Section Matching**: Link features to SRS sections
- **Coverage Analysis**: Track SRS section coverage

### 🧪 Test Case Management

- **Test Case List**: View test cases with advanced filtering
- **Create Test Cases**: Manual or AI-powered test case generation
- **Edit Test Cases**: Update test case details, steps, and expected results
- **Gherkin Format**: Automatic Gherkin conversion for BDD
- **Test Case Status**: Track test execution status (Pending, Passed, Failed)
- **Priority Management**: Set test case priorities (P0, P1, P2, P3)
- **Bulk Operations**: Bulk status updates and deletions

### 🐛 Bug Tracking

- **Bug List**: Comprehensive bug table with filtering
- **Bug Details**: Detailed bug information with timeline
- **File Attachments**: Upload images and files with bug reports
- **Bug Status**: Track bug lifecycle (Open, In Progress, Resolved, Closed)
- **Severity & Priority**: Classify bugs by severity and priority
- **Environment Info**: Capture OS, browser, and app version
- **Steps to Reproduce**: Detailed reproduction steps
- **Bug Assignment**: Assign bugs to team members
- **Resolution Tracking**: Track bug resolution and resolution details

### 🤖 AI Integration

- **AI Feature Extraction**: Extract features from SRS documents
- **AI Test Case Generation**: Generate comprehensive test cases
- **AI Chatbot**: Ask questions about SRS documents and get AI-powered answers
- **Context-Aware Responses**: Answers based on project-specific SRS content

### 👥 User Management

- **User Profile**: Update personal information and avatar
- **Admin Dashboard**: User management for administrators
- **Activity Tracking**: Track user activity and system usage

---

## 🔄 State Management

### Server State (TanStack Query)

**What it manages:**
- API data (projects, features, test cases, bugs, users)
- Caching and background refetching
- Optimistic updates
- Error handling and retry logic

**Key Hooks:**
- `useProjects`: Project data management
- `useFeatures`: Feature data management
- `useTestCases`: Test case data management
- `useProjectTestCases`: Project-level test cases
- `useBugs`: Bug data management
- `useUserProfile`: User profile management

**Example:**
```typescript
// Optimistic update example
const updateTestCaseMutation = useMutation({
  mutationFn: updateTestCase,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['testCases'] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['testCases']);
    
    // Optimistically update
    queryClient.setQueryData(['testCases'], (old) => 
      old.map((tc) => tc.id === newData.id ? { ...tc, ...newData } : tc)
    );
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['testCases'], context.previous);
  },
});
```

### Local State

**React Hook Form:**
- Form state management
- Validation with Zod schemas
- Error handling

**React State (useState):**
- UI state (modals, loading states, filters)
- Component-specific state
- User preferences

**Context API:**
- Theme management (dark/light mode)
- Global UI state

---

## ⚡ Performance Optimizations

### Code Splitting

- **Route-based splitting**: Each route is lazy-loaded
- **Component-based splitting**: Heavy components loaded on demand
- **Dynamic imports**: Reduce initial bundle size

```typescript
// Route-based code splitting
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const FeatureDetails = lazy(() => import('./pages/FeatureDetails'));
```

### React Optimizations

- **React.memo**: Memoize expensive components
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize event handlers
- **Virtual scrolling**: For large lists (future implementation)

### Build Optimizations

- **Tree shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Asset optimization**: Optimize images and fonts
- **Vite's fast HMR**: Instant hot module replacement

### Network Optimizations

- **Request deduplication**: TanStack Query prevents duplicate requests
- **Automatic caching**: Cache API responses
- **Background refetching**: Keep data fresh automatically
- **Optimistic updates**: Update UI before server confirmation

---

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Code quality and consistency
- **Naming Conventions**:
  - PascalCase for components and types
  - camelCase for variables and functions
  - kebab-case for file names
  - UPPER_CASE for constants

### Component Structure

```typescript
// Component example
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface ComponentProps {
  id: string;
  onAction?: () => void;
}

export const MyComponent = ({ id, onAction }: ComponentProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResource(id),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
};
```

### File Organization

- **One component per file**: Each component in its own file
- **Co-location**: Keep related files together (components, hooks, types)
- **Barrel exports**: Use index files for clean imports when needed

### Import Order

1. React and React-related imports
2. Third-party libraries
3. Internal components
4. Types
5. Utilities
6. Styles

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Optional: Environment
VITE_NODE_ENV=development
```

### Vite Configuration

Key configurations in `vite.config.ts`:

- **Port**: 8080 (default)
- **Path Aliases**: `@` maps to `src/`
- **Plugins**: React SWC for fast compilation
- **Build**: Optimized production builds

### TypeScript Configuration

- **Strict mode**: Enabled for type safety
- **Path mapping**: `@/*` for clean imports
- **Module resolution**: Node module resolution

### Tailwind Configuration

- Custom theme extensions
- shadcn/ui color palette integration
- Custom animations and utilities

---

## 🧪 Testing

### Test Setup

The project uses **Vitest** as the test runner, configured with jsdom for DOM simulation.

```bash
# Run all tests
npm run test

# Watch mode (auto-rerun on file changes)
npm run test:watch

# Run specific test file
npm test -- auth-helpers

# Run with coverage (if configured)
npm test -- --coverage
```

### Testing Tools

- **Vitest**: Fast unit test runner (Jest-compatible API)
- **jsdom**: DOM simulation for browser environment
- **@testing-library/react**: Component testing utilities (when needed)

### Test Structure

```
src/
├── __tests__/                    # Shared test utilities
│   └── helpers/
│       ├── index.ts             # Main export file
│       ├── localStorage.mock.ts  # localStorage mocking utilities
│       ├── jwt.helper.ts         # JWT token creation helpers
│       └── user.helper.ts        # User mock data helpers
│
├── utils/
│   ├── auth-helpers.ts
│   └── auth-helpers.test.ts      # Unit tests (co-located with source)
│
├── components/
│   └── *.test.tsx                # Component tests
│
└── hooks/
    └── *.test.ts                 # Hook tests
```

### Test Helpers

The project includes reusable test helpers located in `src/__tests__/helpers/`:

#### localStorage Mock

```typescript
import { createLocalStorageMock, setupLocalStorageMock } from '@/__tests__/helpers';

describe('MyComponent', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    setupLocalStorageMock(localStorageMock);
  });

  it('should use localStorage', () => {
    localStorageMock.setItem('key', 'value');
    expect(localStorageMock.getItem('key')).toBe('value');
  });
});
```

#### JWT Token Helpers

```typescript
import { createJWTToken, createExpiredJWTToken } from '@/__tests__/helpers';

// Create a valid token
const token = createJWTToken({ sub: '123', name: 'User' });

// Create an expired token
const expiredToken = createExpiredJWTToken({ sub: '123' });
```

#### User Mock Helpers

```typescript
import { createMockUser, createMockAdminUser } from '@/__tests__/helpers';

// Create a regular user
const user = createMockUser();

// Create a user with custom properties
const customUser = createMockUser({ 
  name: 'Custom Name',
  email: 'custom@example.com' 
});

// Create an admin user
const admin = createMockAdminUser();
```

### Example Tests

#### Utility Function Test

```typescript
import { describe, it, expect } from 'vitest';
import { validateEmail } from './auth-helpers';

describe('validateEmail', () => {
  describe('valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.com',
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
    ];

    it.each(invalidEmails)('should return false for "%s"', (email) => {
      expect(validateEmail(email)).toBe(false);
    });
  });
});
```

#### Storage Function Test

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authStorage } from './auth-helpers';
import { createLocalStorageMock, setupLocalStorageMock } from '@/__tests__/helpers';

describe('authStorage', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    setupLocalStorageMock(localStorageMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should store and retrieve token', () => {
    const token = 'test-token-123';
    authStorage.setToken(token);
    expect(authStorage.getToken()).toBe(token);
  });
});
```

### Test Configuration

The test configuration is in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    environment: "jsdom",        // Browser-like environment
    globals: true,                // Global test functions (describe, it, expect)
    setupFiles: ["./vitest.setup.ts"],  // Setup file
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Path aliases
    },
  },
});
```

### Testing Best Practices

1. **Co-location**: Place test files next to source files (e.g., `auth-helpers.test.ts` next to `auth-helpers.ts`)

2. **Use Test Helpers**: Always use shared helpers from `@/__tests__/helpers` instead of creating mocks inline

3. **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested

4. **Arrange-Act-Assert**: Structure tests with clear sections:
   ```typescript
   it('should do something', () => {
     // Arrange - Set up test data
     const input = 'test';
     
     // Act - Execute the function
     const result = myFunction(input);
     
     // Assert - Verify the result
     expect(result).toBe('expected');
   });
   ```

5. **Test Edge Cases**: Test both happy paths and error cases

6. **Use `it.each`**: For testing multiple similar cases:
   ```typescript
   it.each([
     { input: 'value1', expected: true },
     { input: 'value2', expected: false },
   ])('should handle $input', ({ input, expected }) => {
     expect(myFunction(input)).toBe(expected);
   });
   ```

7. **Clean Up**: Always clean up mocks and state in `afterEach` hooks

### Current Test Coverage

- ✅ **Utility Functions**: `auth-helpers.ts` (68 tests)
  - `authStorage` methods (getToken, setToken, getUser, setUser, clear, isAuthenticated)
  - `validateEmail`, `validatePassword`, `validateName`

### Running Tests in CI/CD

```bash
# Run tests once (for CI)
npm test

# Run with coverage report
npm test -- --coverage
```

### Future Test Additions

Planned test coverage for:
- Component tests (React Testing Library)
- Hook tests (custom hooks)
- Service tests (API mocking)
- Integration tests (user flows)

---

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

Modern browsers with ES2020 support.

---

## 📚 Key Concepts

### SPA (Single Page Application)

The application uses React Router for client-side routing, providing:
- Fast navigation without page reloads
- Optimistic UI updates
- Smooth transitions between pages
- Preserved state across navigation

### Optimistic Updates

Updates the UI immediately before server confirmation, then rolls back on error:
- Better user experience
- Perceived performance improvement
- Automatic error handling

### Type Safety

Full TypeScript coverage ensures:
- Compile-time error detection
- Better IDE support
- Self-documenting code
- Refactoring safety

---

## 🔗 Related Documentation

- [Main README](../README.md) - Overall project documentation
- [Backend README](../backend/README.md) - Backend API documentation
- [shadcn/ui Documentation](https://ui.shadcn.com/) - UI components
- [TanStack Query Docs](https://tanstack.com/query/latest) - Data fetching
- [React Router Docs](https://reactrouter.com/) - Routing

---

## 📄 License

MIT License - See main project LICENSE file for details.

---

## 👥 Contributing

See main project CONTRIBUTING.md for guidelines.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Vite](https://vitejs.dev/) - Next-generation frontend tooling

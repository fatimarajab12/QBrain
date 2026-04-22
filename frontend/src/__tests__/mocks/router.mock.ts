import { vi } from 'vitest';

/**
 * Mocks React Router's useNavigate hook
 */
export const mockUseNavigate = () => {
  const navigate = vi.fn();
  return {
    navigate,
    useNavigate: () => navigate,
  };
};

/**
 * Mocks React Router's useLocation hook
 */
export const mockUseLocation = (location: Partial<Location> = {}) => {
  return {
    useLocation: () => ({
      pathname: location.pathname || '/',
      search: location.search || '',
      hash: location.hash || '',
      state: location.state || null,
      key: location.key || 'default',
    }),
  };
};


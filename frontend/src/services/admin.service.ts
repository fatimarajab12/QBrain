import { authStorage } from '@/utils/auth-helpers';
import { User as AuthUser } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface AdminSystemStats {
  totalUsers: number;
  totalProjects: number;
  activeAPIUsage: string;
  serverStatus: string;
  totalLogins?: number;
  apiRequestsAllTime?: number;
  apiRequestsLast7Days?: number;
  activeUsersLast7Days?: number;
  adminRequestsLast7Days?: number;
  newUsersLast7Days?: number;
  newProjectsLast7Days?: number;
  avgLatencyMsLast7Days?: number;
  okRequestsLast7Days?: number;
  clientErrorRequestsLast7Days?: number;
  serverErrorRequestsLast7Days?: number;
  uptimeSeconds?: number;
}

export type AdminUser = AuthUser & {
  isVerified?: boolean;
  role?: 'user' | 'admin';
  createdAt?: string;
};

const normalizeAdminUser = (raw: any): AdminUser => {
  const _id = raw?._id || raw?.id;
  if (!_id) {
    throw new Error('Invalid user object from server (missing _id)');
  }
  return {
    _id: String(_id),
    name: raw?.name,
    email: raw?.email,
    isVerified: raw?.isVerified,
    role: raw?.role,
    loginCount: raw?.loginCount,
    lastLogin: raw?.lastLogin,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
};

const buildAuthHeaders = (extra?: HeadersInit): HeadersInit => {
  const token = authStorage.getToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...extra,
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const hasJson = contentType?.includes('application/json');
  const payload = hasJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = (payload as any)?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if ((payload as any)?.success === false) {
    throw new Error((payload as any)?.message || 'Request failed');
  }

  if ((payload as any)?.data !== undefined) {
    return (payload as any).data as T;
  }

  return (payload ?? {}) as T;
};

export const adminService = {
  async fetchSystemStats(): Promise<AdminSystemStats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });

    return handleResponse<AdminSystemStats>(response);
  },

  async fetchUsers(): Promise<AdminUser[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });

    const users = await handleResponse<any[]>(response);
    return (users || []).map(normalizeAdminUser);
  },

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    });

    await handleResponse(response);
  },

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ _id: string; role: 'user' | 'admin' }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    const result = await handleResponse<{ _id?: string; id?: string; role: 'user' | 'admin' }>(response);
    return { _id: String(result._id || result.id), role: result.role };
  },
};


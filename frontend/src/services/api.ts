const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getToken(): string | null {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");

  // No Content
  if (response.status === 204) return null;

  if (hasJson) {
    return await response.json().catch(() => null);
  }

  // Best effort: allow text payloads (useful for debugging)
  return await response.text().catch(() => null);
}

async function request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const payload = await parseResponse(response);

  if (!response.ok) {
    // Handle 401 Unauthorized - dispatch event for React Router navigation
    if (response.status === 401) {
      try {
        if (typeof window !== 'undefined') {
          // Clear auth storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          
          // Dispatch custom event for SPA navigation (avoid full page reload)
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      } catch (e) {
        console.error('Error clearing auth:', e);
      }
    }
    
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: string }).message)
        : null) || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success?: boolean }).success === false
  ) {
    throw new Error(String((payload as { message?: string }).message) || "Request failed");
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export const apiClient = {
  request,

  get<T = unknown>(endpoint: string): Promise<T> {
    return request<T>(endpoint);
  },

  post<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete<T = unknown>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  }
};

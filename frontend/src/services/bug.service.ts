// services/bug.service.ts
import { Bug } from '@/types/bug';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to transform backend bug to frontend format
function transformBug(backendBug: any): Bug {
  return {
    id: backendBug._id || backendBug.id,
    _id: backendBug._id,
    title: backendBug.title,
    description: backendBug.description || '',
    featureId: typeof backendBug.featureId === 'object' 
      ? backendBug.featureId._id || backendBug.featureId 
      : backendBug.featureId,
    feature_id: typeof backendBug.featureId === 'object' 
      ? backendBug.featureId._id || backendBug.featureId 
      : backendBug.featureId,
    projectId: typeof backendBug.projectId === 'object' 
      ? backendBug.projectId._id || backendBug.projectId 
      : backendBug.projectId,
    project_id: typeof backendBug.projectId === 'object' 
      ? backendBug.projectId._id || backendBug.projectId 
      : backendBug.projectId,
    severity: backendBug.severity || 'Medium',
    status: backendBug.status || 'Open',
    reportedBy: typeof backendBug.reportedBy === 'object' 
      ? backendBug.reportedBy._id || backendBug.reportedBy 
      : backendBug.reportedBy,
    assignedTo: backendBug.assignedTo 
      ? (typeof backendBug.assignedTo === 'object' 
          ? backendBug.assignedTo._id || backendBug.assignedTo 
          : backendBug.assignedTo)
      : null,
    stepsToReproduce: backendBug.stepsToReproduce || [],
    expectedBehavior: backendBug.expectedBehavior || '',
    actualBehavior: backendBug.actualBehavior || '',
    environment: backendBug.environment || '',
    attachments: backendBug.attachments || [],
    resolution: backendBug.resolution || '',
    resolvedAt: backendBug.resolvedAt,
    closedAt: backendBug.closedAt,
    createdAt: backendBug.createdAt,
    created_at: backendBug.createdAt || backendBug.created_at,
    updatedAt: backendBug.updatedAt,
    updated_at: backendBug.updatedAt || backendBug.updated_at,
    // Populated fields
    feature: backendBug.featureId && typeof backendBug.featureId === 'object' 
      ? {
          _id: backendBug.featureId._id,
          name: backendBug.featureId.name,
          description: backendBug.featureId.description,
        }
      : undefined,
    project: backendBug.projectId && typeof backendBug.projectId === 'object' 
      ? {
          _id: backendBug.projectId._id,
          name: backendBug.projectId.name,
        }
      : undefined,
    reportedByUser: backendBug.reportedBy && typeof backendBug.reportedBy === 'object' 
      ? {
          _id: backendBug.reportedBy._id,
          name: backendBug.reportedBy.name,
          email: backendBug.reportedBy.email,
        }
      : undefined,
    assignedToUser: backendBug.assignedTo && typeof backendBug.assignedTo === 'object' 
      ? {
          _id: backendBug.assignedTo._id,
          name: backendBug.assignedTo.name,
          email: backendBug.assignedTo.email,
        }
      : null,
  };
}

export const bugService = {
  async getBug(bugId: string): Promise<Bug> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get bug');
    }

    const result = await response.json();
    return transformBug(result.data);
  },

  async getProjectBugs(projectId: string, filters?: {
    status?: string;
    severity?: string;
    featureId?: string;
    assignedTo?: string;
  }): Promise<Bug[]> {
    const token = localStorage.getItem('authToken');
    
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.severity) queryParams.append('severity', filters.severity);
    if (filters?.featureId) queryParams.append('featureId', filters.featureId);
    if (filters?.assignedTo) queryParams.append('assignedTo', filters.assignedTo);

    const url = `${API_BASE_URL}/bugs/projects/${projectId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get bugs');
    }

    const result = await response.json();
    return result.data.map(transformBug);
  },

  async getFeatureBugs(featureId: string): Promise<Bug[]> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/bugs/features/${featureId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get bugs');
    }

    const result = await response.json();
    return result.data.map(transformBug);
  },

  async createBug(bugData: {
    title: string;
    description?: string;
    featureId: string;
    projectId?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    status?: "Open" | "In Progress" | "Resolved" | "Closed";
    stepsToReproduce?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
    environment?: string;
  }): Promise<Bug> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/bugs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(bugData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create bug');
    }

    const result = await response.json();
    return transformBug(result.data);
  },

  async createBugForFeature(featureId: string, projectId: string, bugData: {
    title: string;
    description?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    status?: "Open" | "In Progress" | "Resolved" | "Closed";
    stepsToReproduce?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
    environment?: string;
  }): Promise<Bug> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/bugs/projects/${projectId}/features/${featureId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(bugData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create bug');
    }

    const result = await response.json();
    return transformBug(result.data);
  },

  async updateBug(bugId: string, updateData: Partial<Bug>): Promise<Bug> {
    const token = localStorage.getItem('authToken');
    
    // Remove fields that shouldn't be sent
    const { id, _id, createdAt, created_at, updatedAt, updated_at, feature, project, reportedByUser, assignedToUser, ...dataToUpdate } = updateData;

    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(dataToUpdate),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update bug');
    }

    const result = await response.json();
    return transformBug(result.data);
  },

  async updateBugStatus(bugId: string, status: Bug['status']): Promise<Bug> {
    return this.updateBug(bugId, { status });
  },

  async deleteBug(bugId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete bug');
    }
  },

  async getBugStats(projectId: string): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/bugs/projects/${projectId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get bug stats');
    }

    const result = await response.json();
    return result.data;
  },
};


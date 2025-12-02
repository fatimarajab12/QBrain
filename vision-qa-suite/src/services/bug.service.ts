// services/bug.service.ts
import { Bug } from '@/types/bug';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const bugService = {
  async updateBugStatus(bugId: number, status: Bug['status']): Promise<Bug> {
    try {
      const response = await fetch(`${API_BASE_URL}/bugs/${bugId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update bug status');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating bug status:', error);
      // For now, return a mock updated bug (will be replaced with actual API)
      throw error;
    }
  },

  async updateBug(bugId: number, updateData: Partial<Bug>): Promise<Bug> {
    try {
      const response = await fetch(`${API_BASE_URL}/bugs/${bugId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update bug');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating bug:', error);
      throw error;
    }
  },
};


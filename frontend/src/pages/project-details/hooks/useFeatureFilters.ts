import { useMemo } from "react";
import { Feature } from "@/types/feature";

interface UseFeatureFiltersProps {
  features: Feature[];
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const useFeatureFilters = ({
  features,
  searchQuery,
  statusFilter,
  priorityFilter,
  sortBy,
  sortOrder,
}: UseFeatureFiltersProps) => {
  const filteredAndSortedFeatures = useMemo(() => {
    let filtered = [...features];
    
    const trimmedQuery = searchQuery.trim().toLowerCase();
    
    if (trimmedQuery) {
      // Split query into words for multi-word search
      const queryWords = trimmedQuery.split(/\s+/).filter(word => word.length > 0);
      
      filtered = filtered.filter((feature) => {
        const name = feature.name.toLowerCase();
        const description = feature.description?.toLowerCase() || "";
        const acceptanceCriteria = feature.acceptanceCriteria?.map(c => c.toLowerCase()) || [];
        
        // Check if all query words match in any field
        return queryWords.every(word => 
          name.includes(word) ||
          description.includes(word) ||
          acceptanceCriteria.some(c => c.includes(word))
        );
      });
    }
    
    if (statusFilter !== "all") {
      const statusMap: Record<string, string> = {
        "in_progress": "in-progress",
        "pending": "pending",
        "completed": "completed",
        "blocked": "blocked"
      };
      filtered = filtered.filter(feature => feature.status === statusMap[statusFilter]);
    }
    
    if (priorityFilter !== "all") {
      filtered = filtered.filter(feature => feature.priority === priorityFilter);
    }
    
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "status":
          const statusOrder = { completed: 4, "in-progress": 3, pending: 2, blocked: 1 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case "testCasesCount":
          aValue = a.testCasesCount || 0;
          bValue = b.testCasesCount || 0;
          break;
        case "relevanceScore":
          aValue = a.relevanceScore || 0;
          bValue = b.relevanceScore || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [features, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  return { filteredAndSortedFeatures };
};


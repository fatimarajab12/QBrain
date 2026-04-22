import { useMemo } from "react";
import { TestCase } from "@/types/test-case";

interface UseTestCaseFiltersProps {
  testCases: TestCase[];
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
}

export const useTestCaseFilters = ({
  testCases,
  searchQuery,
  statusFilter,
  priorityFilter,
}: UseTestCaseFiltersProps) => {
  const filteredTestCases = useMemo(() => {
    let filtered = [...testCases];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tc => 
        tc.title.toLowerCase().includes(query) ||
        tc.description?.toLowerCase().includes(query) ||
        tc.expectedResult.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(tc => tc.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(tc => tc.priority === priorityFilter);
    }

    return filtered;
  }, [testCases, searchQuery, statusFilter, priorityFilter]);

  const hasActiveFilters = searchQuery.trim() || statusFilter !== "all" || priorityFilter !== "all";

  return {
    filteredTestCases,
    hasActiveFilters,
  };
};


import { useState, useCallback } from "react";

export const useFeatureDetailsState = () => {
  const [activeTab, setActiveTab] = useState<"test-cases" | "bugs">("test-cases");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState(false);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  }, []);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    isDeleting,
    setIsDeleting,
    clearFilters,
  };
};


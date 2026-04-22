import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { startTransition } from "react";

export const useFeatureFiltersState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQueryState] = useState(() => searchParams.get('search') || "");
  const [statusFilter, setStatusFilterState] = useState(() => searchParams.get('status') || "all");
  const [priorityFilter, setPriorityFilterState] = useState(() => searchParams.get('priority') || "all");
  const [sortBy, setSortByState] = useState(() => searchParams.get('sortBy') || "name");
  const [sortOrder, setSortOrderState] = useState<"asc" | "desc">(() => (searchParams.get('sortOrder') as "asc" | "desc") || "asc");
  const [viewMode, setViewModeState] = useState<"table" | "cards">(() => (searchParams.get('view') as "table" | "cards") || "table");

  const updateSearchParams = useCallback((updates: {
    search?: string;
    status?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    view?: "table" | "cards";
  }) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams);
      
      if (updates.search !== undefined) {
        if (updates.search) {
          newParams.set('search', updates.search);
        } else {
          newParams.delete('search');
        }
      }
      
      if (updates.status !== undefined) {
        if (updates.status !== 'all') {
          newParams.set('status', updates.status);
        } else {
          newParams.delete('status');
        }
      }
      
      if (updates.priority !== undefined) {
        if (updates.priority !== 'all') {
          newParams.set('priority', updates.priority);
        } else {
          newParams.delete('priority');
        }
      }
      
      if (updates.sortBy !== undefined) {
        newParams.set('sortBy', updates.sortBy);
      }
      
      if (updates.sortOrder !== undefined) {
        newParams.set('sortOrder', updates.sortOrder);
      }
      
      if (updates.view !== undefined) {
        newParams.set('view', updates.view);
      }
      
      setSearchParams(newParams, { replace: true });
    });
  }, [searchParams, setSearchParams]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    updateSearchParams({ search: query });
  }, [updateSearchParams]);

  const setStatusFilter = useCallback((status: string) => {
    setStatusFilterState(status);
    updateSearchParams({ status });
  }, [updateSearchParams]);

  const setPriorityFilter = useCallback((priority: string) => {
    setPriorityFilterState(priority);
    updateSearchParams({ priority });
  }, [updateSearchParams]);

  const setSortBy = useCallback((sortBy: string) => {
    setSortByState(sortBy);
    updateSearchParams({ sortBy });
  }, [updateSearchParams]);

  const setSortOrder = useCallback((order: "asc" | "desc") => {
    setSortOrderState(order);
    updateSearchParams({ sortOrder: order });
  }, [updateSearchParams]);

  const setViewMode = useCallback((mode: "table" | "cards") => {
    setViewModeState(mode);
    updateSearchParams({ view: mode });
  }, [updateSearchParams]);

  useEffect(() => {
    const search = searchParams.get('search') || "";
    const status = searchParams.get('status') || "all";
    const priority = searchParams.get('priority') || "all";
    const sortByParam = searchParams.get('sortBy') || "name";
    const sortOrderParam = (searchParams.get('sortOrder') as "asc" | "desc") || "asc";
    const viewParam = (searchParams.get('view') as "table" | "cards") || "table";

    if (search !== searchQuery) setSearchQueryState(search);
    if (status !== statusFilter) setStatusFilterState(status);
    if (priority !== priorityFilter) setPriorityFilterState(priority);
    if (sortByParam !== sortBy) setSortByState(sortByParam);
    if (sortOrderParam !== sortOrder) setSortOrderState(sortOrderParam);
    if (viewParam !== viewMode) setViewModeState(viewParam);
  }, [searchParams]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
  };
};


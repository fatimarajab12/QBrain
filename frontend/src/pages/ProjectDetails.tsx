import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import { useFeatures } from "@/hooks/useFeatures";

import { Feature } from "@/types/feature";

import ProjectHeader from "./project-details/components/ProjectHeader";
import ProjectTabs from "./project-details/components/ProjectTabs";
import FeaturesToolbar from "./project-details/components/FeaturesToolbar";
import FeaturesContent from "./project-details/components/FeaturesContent";
import LoadingState from "./project-details/components/LoadingState";
import BugsTab from "./project-details/BugTab";

import { useProjectData } from "./project-details/hooks/useProjectData";
import { useBugHandlers } from "./project-details/hooks/useBugHandlers";
import { useFeatureFilters } from "./project-details/hooks/useFeatureFilters";
import { useFeatureFiltersState } from "./project-details/hooks/useFeatureFiltersState";

const ProjectDetails = () => {
  const { projectId } = useParams();
  
  const {
    features,
    isLoading,
    isCreating,
    isGeneratingAI,
    createFeature,
    updateFeatureStatus,
    updateFeature,
    deleteFeature,
    approveFeatures,
  } = useFeatures(projectId);

  const {
    activeTab,
    setActiveTab,
    project,
    bugs = [],
  } = useProjectData(projectId);

  const {
    handleAddBug,
    handleUpdateBugStatus,
    handleDeleteBug,
  } = useBugHandlers({ projectId });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
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
  } = useFeatureFiltersState();

  const { filteredAndSortedFeatures } = useFeatureFilters({
    features,
    searchQuery,
    statusFilter,
    priorityFilter,
    sortBy,
    sortOrder,
  });

  const handleCreateFeature = useCallback(async (featureData: { 
    name: string; 
    description: string; 
    priority?: "High" | "Medium" | "Low";
    featureType?: "FUNCTIONAL" | "DATA" | "DATA_MODEL" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION";
    acceptanceCriteria?: string[];
    matchedSections?: string[];
    reasoning?: string;
  }) => {
    if (!projectId) return;
    await createFeature(featureData);
  }, [projectId, createFeature]);

  const handleUpdateFeature = useCallback(async (featureId: string, featureData: { name: string; description: string }) => {
    setIsUpdating(true);
    try {
      await updateFeature(featureId, featureData);
    } finally {
      setIsUpdating(false);
    }
  }, [updateFeature]);

  const handleDeleteFeature = useCallback(async (featureId: string) => {
    setIsDeleting(true);
    try {
      await deleteFeature(featureId);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteFeature]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="p-8">
      <ProjectHeader project={project} projectId={projectId} />

      <ProjectTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        featuresCount={features.length}
        bugsCount={bugs.length}
      />

      {activeTab === "features" ? (
        <>
          <FeaturesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderToggle={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateFeature={handleCreateFeature}
            onApproveFeatures={async (features) => {
              await approveFeatures(features);
            }}
            projectId={projectId}
            isCreating={isCreating}
            isGeneratingAI={isGeneratingAI}
          />
          
          <FeaturesContent
            features={features}
            filteredFeatures={filteredAndSortedFeatures}
            viewMode={viewMode}
            projectId={projectId!}
            onStatusChange={updateFeatureStatus}
            onUpdate={handleUpdateFeature}
            onDelete={handleDeleteFeature}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        </>
      ) : (
        <BugsTab
          bugs={bugs}
          features={features}
          projectId={projectId}
          onAddBug={async (bugData) => {
            await handleAddBug(bugData);
          }}
          onUpdateBugStatus={handleUpdateBugStatus}
          onDeleteBug={async (bugId) => {
            await handleDeleteBug(bugId);
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetails;

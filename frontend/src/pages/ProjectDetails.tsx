// pages/ProjectDetails.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Search, X, Filter, ArrowUpDown, Table as TableIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useFeatures } from "../hooks/useFeatures";
import FeatureCard from "./project-details/FeatureCard";
import FeaturesTable from "./project-details/FeaturesTable";
import CreateFeatureDialog from "./project-details/CreateFeatureDialog";
import AIGenerationDialog from "./project-details/AIGenerationDialog";
import EmptyState from "./project-details/EmptyState";
import BugsTab from "./project-details/BugTab";
import { Bug } from "@/types/bug";
import GooeyTabs from "@/components/ui/gooey-tabs";
import { bugService } from "@/services/bug.service";
import { useToast } from "@/hooks/use-toast";
import { projectService } from "@/services/project.service";
import { Project } from "@/types/project";
import { Feature } from "@/types/feature";

// Bugs will be fetched from API

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
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
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"features" | "bugs">("features");
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoadingBugs, setIsLoadingBugs] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const projectData = await projectService.fetchProjectById(projectId);
          setProject(projectData);
        } catch (error) {
          console.error("Error fetching project:", error);
        }
      }
    };
    fetchProject();
  }, [projectId]);

  // Fetch bugs from API - fetch immediately on page load to show count in tab
  useEffect(() => {
    const fetchBugs = async () => {
      if (!projectId) return;
      
      setIsLoadingBugs(true);
      try {
        const bugsData = await bugService.getProjectBugs(projectId);
        setBugs(bugsData);
      } catch (error: any) {
        console.error("Error fetching bugs:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load bugs",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBugs(false);
      }
    };
    
    // Fetch bugs immediately when projectId is available, not just when bugs tab is active
    fetchBugs();
  }, [projectId, toast]);

  const handleCreateFeature = async (featureData: { 
    name: string; 
    description: string; 
    priority?: "High" | "Medium" | "Low";
    featureType?: "FUNCTIONAL" | "DATA" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION";
    acceptanceCriteria?: string[];
    matchedSections?: string[];
    reasoning?: string;
  }) => {
    if (!projectId) return;
    await createFeature(featureData);
  };

  const handleUpdateFeature = async (featureId: number, featureData: { name: string; description: string }) => {
    setIsUpdating(true);
    try {
      await updateFeature(featureId, featureData);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFeature = async (featureId: number) => {
    setIsDeleting(true);
    try {
      await deleteFeature(featureId);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleAddBug = async (bugData: {
    title: string;
    description?: string;
    featureId: string;
    projectId?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    status?: "Open" | "In Progress" | "Resolved" | "Closed";
  }) => {
    try {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      const newBug = await bugService.createBug({
        ...bugData,
        projectId: bugData.projectId || projectId,
      });

      setBugs(prev => [newBug, ...prev]);
      
      toast({
        title: "Success",
        description: "Bug created successfully",
      });
    } catch (error: any) {
      console.error("Error adding bug:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create bug",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateBugStatus = async (bugId: number, status: Bug['status']) => {
    try {
      // Update via API
      await bugService.updateBugStatus(bugId, status);
      
      // Update local state
      setBugs(prev => prev.map(bug => 
        bug.id === bugId 
          ? { ...bug, status, updated_at: new Date().toISOString() }
          : bug
      ));

      toast({
        title: "Success",
        description: `Bug status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating bug status:', error);
      // Fallback: update local state anyway
      setBugs(prev => prev.map(bug => 
        bug.id === bugId 
          ? { ...bug, status, updated_at: new Date().toISOString() }
          : bug
      ));
      
      toast({
        title: "Status Updated",
        description: `Bug status updated to ${status} (local update)`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Project Features</h1>
              <p className="text-muted-foreground">Manage features and generate test cases</p>
            </div>
            <Button disabled className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 opacity-50">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Features</h1>
          <p className="text-muted-foreground">Manage features and generate test cases</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("features")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "features"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              Features ({features.length})
            </button>
            <button
              onClick={() => setActiveTab("bugs")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "bugs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              Bugs ({bugs.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "features" ? (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2 items-center w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="testCasesCount">Test Cases</SelectItem>
                  <SelectItem value="relevanceScore">Relevance</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>
          
          {/* Filter Summary */}
          {(searchQuery || statusFilter !== "all" || priorityFilter !== "all") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setStatusFilter("all")}
                  />
                </Badge>
              )}
              {priorityFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Priority: {priorityFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setPriorityFilter("all")}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
          
          {/* Action Buttons and View Toggle */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-l-none border-l"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Cards
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <AIGenerationDialog
                projectId={projectId!}
                onApprove={async (approvedFeatures) => {
                  try {
                    await approveFeatures(approvedFeatures);
                  } catch (error) {
                    console.error("Error approving features:", error);
                  }
                }}
                isGenerating={isGeneratingAI}
              />
              <CreateFeatureDialog 
                isCreating={isCreating}
                onCreate={handleCreateFeature}
              />
            </div>
          </div>
          
          {/* Features List */}
          {features.length === 0 ? (
            <EmptyState 
              onCreateFeature={() => document.querySelector<HTMLButtonElement>('[data-testid="create-feature-trigger"]')?.click()}
            />
          ) : (
            (() => {
              // Filter features
              let filteredFeatures = features.filter((feature) => {
              // Search filter
              if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = 
                  feature.name.toLowerCase().includes(query) ||
                  feature.description?.toLowerCase().includes(query) ||
                  feature.matchedSections?.some(s => s.toLowerCase().includes(query)) ||
                  feature.acceptanceCriteria?.some(c => c.toLowerCase().includes(query));
                if (!matchesSearch) return false;
              }
              
              // Status filter
              if (statusFilter !== "all") {
                const statusMap: Record<string, string> = {
                  "in_progress": "in-progress",
                  "pending": "pending",
                  "completed": "completed",
                  "blocked": "blocked"
                };
                if (feature.status !== statusMap[statusFilter]) return false;
              }
              
              // Priority filter
              if (priorityFilter !== "all" && feature.priority !== priorityFilter) {
                return false;
              }
              
              return true;
            });
            
            // Sort features
            filteredFeatures.sort((a, b) => {
              let aValue: any;
              let bValue: any;
              
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
            
            return filteredFeatures.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-2">No features found</p>
                <p className="text-sm">Try adjusting your filters or create a new feature</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Showing {filteredFeatures.length} of {features.length} features
                </div>
                {viewMode === "table" ? (
                  <FeaturesTable
                    features={filteredFeatures}
                    projectId={projectId!}
                    onStatusChange={updateFeatureStatus}
                    onUpdate={handleUpdateFeature}
                    onDelete={handleDeleteFeature}
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                    {filteredFeatures.map((feature) => (
                      <FeatureCard
                        key={feature._id || feature.id || `feature-${feature.name}-${feature.id}`}
                        feature={feature}
                        projectId={projectId!}
                        onStatusChange={updateFeatureStatus}
                        onUpdate={handleUpdateFeature}
                        onDelete={handleDeleteFeature}
                        isUpdating={isUpdating}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </div>
                )}
              </>
            );
            })()
          )}
        </div>
      ) : (
        <BugsTab 
          bugs={bugs} 
          features={features}
          projectId={projectId}
          onAddBug={handleAddBug}
          onUpdateBugStatus={handleUpdateBugStatus}
        />
      )}
    </div>
  );
};

export default ProjectDetails; 
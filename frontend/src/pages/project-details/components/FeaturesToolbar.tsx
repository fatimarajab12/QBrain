import { Search, X, Filter, ArrowUpDown, Table as TableIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Feature } from "@/types/feature";
import CreateFeatureDialog from "../CreateFeatureDialog";
import AIGenerationDialog from "../AIGenerationDialog";

interface FeaturesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;
  viewMode: "table" | "cards";
  onViewModeChange: (mode: "table" | "cards") => void;
  onCreateFeature: (featureData: {
    name: string;
    description: string;
    priority?: "High" | "Medium" | "Low";
    featureType?: "FUNCTIONAL" | "DATA" | "DATA_MODEL" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION";
    acceptanceCriteria?: string[];
    matchedSections?: string[];
    reasoning?: string;
  }) => Promise<void>;
  onApproveFeatures: (features: Feature[]) => Promise<void>;
  projectId: string | undefined;
  isCreating: boolean;
  isGeneratingAI: boolean;
}

const FeaturesToolbar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  viewMode,
  onViewModeChange,
  onCreateFeature,
  onApproveFeatures,
  projectId,
  isCreating,
  isGeneratingAI,
}: FeaturesToolbarProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-2 items-center flex-1">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Input
            placeholder="Search features by name, description, or acceptance criteria..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent/50"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
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

        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
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

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
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
          size="sm"
          onClick={onSortOrderToggle}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </Button>

        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("table")}
            className="h-8"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("cards")}
            className="h-8"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {projectId && (
          <CreateFeatureDialog
            onCreate={onCreateFeature}
            isCreating={isCreating}
          />
        )}
        {projectId && (
          <AIGenerationDialog
            projectId={projectId}
            onApprove={onApproveFeatures}
            isGenerating={isGeneratingAI}
          />
        )}
      </div>
    </div>
  );
};

export default FeaturesToolbar;


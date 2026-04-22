import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateTestCaseDialog from "../CreateTestCaseDialog";
import AITestCaseGenerationDialog from "../AITestCaseGenerationDialog";
import { Feature } from "@/types/feature";
import { TestCase } from "@/types/test-case";

interface TestCasesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateTestCase: (testCase: Partial<TestCase>) => Promise<void>;
  onApproveTestCases: (testCases: TestCase[]) => Promise<void>;
  featureId: string | undefined;
  feature: Feature | null;
  isCreating: boolean;
  isGenerating: boolean;
}

const TestCasesToolbar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  hasActiveFilters,
  onClearFilters,
  onCreateTestCase,
  onApproveTestCases,
  featureId,
  feature,
  isCreating,
  isGenerating,
}: TestCasesToolbarProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Cases & Bugs Management</h2>
          <p className="text-muted-foreground">Execute and track test cases for this feature</p>
        </div>
        <div className="flex gap-2">
          {featureId && (
            <AITestCaseGenerationDialog
              featureId={featureId}
              featureName={feature?.name}
              featureType={feature?.featureType}
              matchedSections={feature?.matchedSections}
              onApprove={onApproveTestCases}
              isGenerating={isGenerating}
            />
          )}
          <CreateTestCaseDialog
            isCreating={isCreating}
            onCreate={onCreateTestCase}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search test cases..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-10 w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="h-10 w-full sm:w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                High
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Medium
              </div>
            </SelectItem>
            <SelectItem value="low">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Low
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClearFilters}
            className="w-full sm:w-auto"
            title="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TestCasesToolbar;


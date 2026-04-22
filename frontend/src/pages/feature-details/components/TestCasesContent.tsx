import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestCase } from "@/types/test-case";
import TestCaseCard from "../TestCaseCard";
import StatsGrid from "../StatsGrid";
import CreateTestCaseDialog from "../CreateTestCaseDialog";

interface TestCasesContentProps {
  testCases: TestCase[];
  filteredTestCases: TestCase[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateTestCase: (testCase: Partial<TestCase>) => Promise<void>;
  onEdit: (testCase: TestCase | null) => void;
  onDelete: (testCaseId: string) => Promise<void>;
  onStatusUpdate: (testCaseId: string, status: TestCase["status"]) => Promise<void>;
  onPriorityUpdate: (testCaseId: string, priority: TestCase["priority"]) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
}

const TestCasesContent = ({
  testCases,
  filteredTestCases,
  hasActiveFilters,
  onClearFilters,
  onCreateTestCase,
  onEdit,
  onDelete,
  onStatusUpdate,
  onPriorityUpdate,
  isCreating,
  isDeleting,
}: TestCasesContentProps) => {
  return (
    <div className="space-y-4">
      {testCases.length > 0 && <StatsGrid testCases={testCases} />}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Test Cases ({filteredTestCases.length}{hasActiveFilters ? ` of ${testCases.length}` : ''})
          </h2>
        </div>

        {testCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No test cases found. Create your first test case to get started.
            </div>
            <div className="flex gap-2 justify-center">
              <CreateTestCaseDialog
                isCreating={isCreating}
                onCreate={onCreateTestCase}
              />
            </div>
          </div>
        ) : filteredTestCases.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">
              No test cases match your filters.
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTestCases.map((testCase) => (
              <TestCaseCard
                key={testCase._id}
                testCase={testCase}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusUpdate={onStatusUpdate}
                onPriorityUpdate={onPriorityUpdate}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCasesContent;


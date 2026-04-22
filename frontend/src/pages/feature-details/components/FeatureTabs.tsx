import { startTransition } from "react";
import { cn } from "@/lib/utils";

interface FeatureTabsProps {
  activeTab: "test-cases" | "bugs";
  onTabChange: (tab: "test-cases" | "bugs") => void;
  testCasesCount: number;
  bugsCount: number;
}

const FeatureTabs = ({ activeTab, onTabChange, testCasesCount, bugsCount }: FeatureTabsProps) => {
  const handleTabChange = (tab: "test-cases" | "bugs") => {
    startTransition(() => {
      onTabChange(tab);
    });
  };

  return (
    <div className="mb-6">
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("test-cases")}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "test-cases"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Test Cases ({testCasesCount})
          </button>
          <button
            onClick={() => handleTabChange("bugs")}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "bugs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Bugs ({bugsCount})
          </button>
        </nav>
      </div>
    </div>
  );
};

export default FeatureTabs;


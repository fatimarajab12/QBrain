import { startTransition } from "react";
import { cn } from "@/lib/utils";

interface ProjectTabsProps {
  activeTab: "features" | "bugs";
  onTabChange: (tab: "features" | "bugs") => void;
  featuresCount: number;
  bugsCount: number;
}

const ProjectTabs = ({ activeTab, onTabChange, featuresCount, bugsCount }: ProjectTabsProps) => {
  const handleTabChange = (tab: "features" | "bugs") => {
    startTransition(() => {
      onTabChange(tab);
    });
  };

  return (
    <div className="mb-6">
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("features")}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "features"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Features ({featuresCount})
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

export default ProjectTabs;


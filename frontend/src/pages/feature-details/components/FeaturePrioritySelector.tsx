import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Feature } from "@/types/feature";

interface FeaturePrioritySelectorProps {
  priority: Feature['priority'];
  onPriorityChange: (priority: "High" | "Medium" | "Low") => Promise<void>;
  isUpdating: boolean;
}

export const FeaturePrioritySelector = ({ priority, onPriorityChange, isUpdating }: FeaturePrioritySelectorProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">Priority</label>
      <Select
        value={priority || "Medium"}
        onValueChange={(value: "High" | "Medium" | "Low") => onPriorityChange(value)}
        disabled={isUpdating}
      >
        <SelectTrigger 
          className={`h-10 w-[120px] ${
            priority === "High" 
              ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
              : priority === "Medium"
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400"
              : "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
          }`}
        >
          {isUpdating ? (
            <LoadingSpinner size="sm" />
          ) : (
            <SelectValue />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="High" className="text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              High
            </div>
          </SelectItem>
          <SelectItem value="Medium" className="text-yellow-700 dark:text-yellow-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              Medium
            </div>
          </SelectItem>
          <SelectItem value="Low" className="text-green-700 dark:text-green-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Low
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};


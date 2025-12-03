// pages/project-details/StatusDropdown.tsx
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Feature } from "@/types/feature";
import { getStatusColor, getStatusLabel } from "@/utils/feature-helpers";

interface StatusDropdownProps {
  feature: Feature;
  onStatusChange: (featureId: number, newStatus: Feature["status"]) => void;
}

const StatusDropdown = ({ feature, onStatusChange }: StatusDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 gap-0.5 px-1 text-xs hover:bg-blue-50 hover:border-blue-100 transition-colors">
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(feature.status)} pointer-events-none border text-[10px] font-medium py-0 px-1 leading-tight`}
          >
            {getStatusLabel(feature.status)}
          </Badge>
          <ChevronDown className="h-2 w-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => onStatusChange(feature.id, "pending")}
          className="flex items-center gap-3 cursor-pointer py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
          <span className="font-medium">Pending</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onStatusChange(feature.id, "in-progress")}
          className="flex items-center gap-3 cursor-pointer py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="font-medium">In Progress</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onStatusChange(feature.id, "completed")}
          className="flex items-center gap-3 cursor-pointer py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="font-medium">Completed</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
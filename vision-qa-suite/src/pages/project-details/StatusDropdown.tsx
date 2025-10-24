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
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2">
          <Badge className={`${getStatusColor(feature.status)} pointer-events-none border`}>
            {getStatusLabel(feature.status)}
          </Badge>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => onStatusChange(feature.id, "pending")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-2 h-2 rounded-full bg-muted" />
          <span>Pending</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onStatusChange(feature.id, "in-progress")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>In Progress</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onStatusChange(feature.id, "completed")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Completed</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
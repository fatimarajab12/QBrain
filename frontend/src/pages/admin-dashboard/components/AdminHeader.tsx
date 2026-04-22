import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
}

export const AdminHeader = ({ onRefresh, onExport }: AdminHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">System Overview & Management</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};


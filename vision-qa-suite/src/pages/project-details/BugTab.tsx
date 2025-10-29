// pages/project-details/BugsTab.tsx
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bug } from "@/types/bug";
import { Feature } from "@/types/feature";
import CreateBugDialog from "./CreateBugDialog";

interface BugsTabProps {
  bugs: Bug[];
  features: Feature[];
  onAddBug: (bugData: Omit<Bug, 'id' | 'created_at' | 'updated_at'>) => void;
}

const BugsTab = ({ bugs, features, onAddBug }: BugsTabProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-destructive text-destructive-foreground';
      case 'in progress': return 'bg-accent text-accent-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getFeatureName = (featureId: number) => {
    const feature = features.find(f => f.id === featureId);
    return feature?.name || 'Unknown Feature';
  };

  const handleCreateBug = async (bugData: Omit<Bug, 'id' | 'created_at' | 'updated_at'>) => {
    setIsCreating(true);
    try {
      await onAddBug(bugData);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Bugs</h2>
        <CreateBugDialog 
          features={features}
          onCreate={handleCreateBug}
          isCreating={isCreating}
        />
      </div>

      {bugs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="text-muted-foreground mb-4">No bugs found for this project</div>
          <CreateBugDialog 
            features={features}
            onCreate={handleCreateBug}
            isCreating={isCreating}
          />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bugs.map((bug) => (
                <TableRow key={bug.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">BUG-{bug.id}</TableCell>
                  <TableCell className="font-medium">{bug.title}</TableCell>
                  <TableCell>{getFeatureName(bug.feature_id)}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(bug.severity)}>
                      {bug.severity}
                    </Badge>
                  </TableCell>
                 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default BugsTab;
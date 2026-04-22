import { useState, useMemo } from "react";
import { PrefetchLink } from "@/components/shared/PrefetchLink";
import { ArrowUpDown, ArrowUp, ArrowDown, FileText, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Feature } from "@/types/feature";
import StatusDropdown from "./StatusDropdown";
import EditFeatureDialog from "./EditFeatureDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FeaturesTableProps {
  features: Feature[];
  projectId: string;
  onStatusChange: (featureId: string, newStatus: Feature["status"]) => void;
  onUpdate?: (featureId: string, featureData: { name: string; description: string }) => Promise<void>;
  onDelete?: (featureId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

type SortField = 'name' | 'priority' | 'status' | 'testCasesCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const FeaturesTable = ({
  features,
  projectId,
  onStatusChange,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: FeaturesTableProps) => {
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400';
      case 'Medium':
        return 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400';
      case 'Low':
        return 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400';
      default:
        return 'border-muted text-muted-foreground';
    }
  };

  const getPriorityOrder = (priority: string): number => {
    switch (priority) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  };

  const getStatusOrder = (status: string): number => {
    switch (status) {
      case 'completed': return 4;
      case 'in-progress': return 3;
      case 'pending': return 2;
      case 'blocked': return 1;
      default: return 0;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          aValue = getPriorityOrder(a.priority || 'Medium');
          bValue = getPriorityOrder(b.priority || 'Medium');
          break;
        case 'status':
          aValue = getStatusOrder(a.status);
          bValue = getStatusOrder(b.status);
          break;
        case 'testCasesCount':
          aValue = a.testCasesCount || 0;
          bValue = b.testCasesCount || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [features, sortField, sortDirection]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 lg:px-3 hover:bg-muted/50 -ml-2"
        onClick={() => handleSort(field)}
      >
        <span className="mr-1">{children}</span>
        {isActive ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </Button>
    );
  };

  if (features.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <div className="text-muted-foreground mb-4">No features found</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[300px]">
              <SortButton field="name">Feature Name</SortButton>
            </TableHead>
            <TableHead className="w-[120px]">
              <SortButton field="priority">Priority</SortButton>
            </TableHead>
            <TableHead className="w-[140px]">
              <SortButton field="status">Status</SortButton>
            </TableHead>
            <TableHead className="w-[100px]">
              <SortButton field="testCasesCount">Test Cases</SortButton>
            </TableHead>
            <TableHead className="w-[100px]">Bugs</TableHead>
            <TableHead className="w-[120px]">
              <SortButton field="createdAt">Created</SortButton>
            </TableHead>
            <TableHead className="w-[150px]">Type</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFeatures.map((feature) => (
            <TableRow
              key={feature._id}
              className="hover:bg-[hsl(var(--muted-hover))] transition-all duration-200 hover:shadow-sm"
            >
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{feature.name}</div>
                  {feature.description && (
                    <div className="text-base text-muted-foreground line-clamp-1">
                      {feature.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {feature.priority && (
                  <Badge
                    variant="outline"
                    className={`text-sm font-medium ${getPriorityColor(feature.priority)}`}
                  >
                    {feature.priority}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <StatusDropdown
                  feature={feature}
                  onStatusChange={onStatusChange}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{feature.testCasesCount || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-destructive">{feature.bugsCount || 0}</span>
              </TableCell>
              <TableCell>
                <div className="text-base text-muted-foreground">
                  {formatDate(feature.createdAt)}
                </div>
              </TableCell>
              <TableCell>
                {feature.featureType && (
                  <Badge variant="outline" className="text-sm">
                    {feature.featureType}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {onUpdate && (
                    <EditFeatureDialog
                      feature={feature}
                      isUpdating={isUpdating}
                      onUpdate={onUpdate}
                    />
                  )}
                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{feature.name}"? This action cannot be undone and will permanently delete all associated test cases and bugs.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(feature._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <PrefetchLink to={`/projects/${projectId}/features/${feature._id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="View Details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </PrefetchLink>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FeaturesTable;


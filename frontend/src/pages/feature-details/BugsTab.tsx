import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateBugDialog from "../project-details/CreateBugDialog";
import { Bug } from "@/types/bug";

interface BugsTabProps {
  bugs: Bug[];
  featureId?: string;
  projectId?: string;
  onAddBug: (bugData: {
    title: string;
    description?: string;
    featureId: string;
    projectId?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    status?: "Open" | "In Progress" | "Resolved" | "Closed";
  }) => Promise<void>;
  onUpdateBugStatus?: (bugId: string, status: Bug['status']) => void;
}

type SortField = 'severity' | 'status' | 'created_at' | 'title';
type SortDirection = 'asc' | 'desc';

const BugsTab = ({ bugs, featureId, projectId, onAddBug, onUpdateBugStatus }: BugsTabProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white border-red-700';
      case 'high': return 'bg-orange-500 text-white border-orange-600';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-600';
      case 'low': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityOrder = (severity: string): number => {
    switch (severity.toLowerCase()) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-500 text-white border-red-600';
      case 'in progress': return 'bg-cyan-500 text-white border-cyan-600';
      case 'resolved': return 'bg-green-500 text-white border-green-600';
      case 'closed': return 'bg-gray-500 text-white border-gray-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusOrder = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'open': return 1;
      case 'in progress': return 2;
      case 'resolved': return 3;
      case 'closed': return 4;
      default: return 0;
    }
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
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

  const sortedBugs = useMemo(() => {
    return [...bugs].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'severity':
          aValue = getSeverityOrder(a.severity);
          bValue = getSeverityOrder(b.severity);
          break;
        case 'status':
          aValue = getStatusOrder(a.status);
          bValue = getStatusOrder(b.status);
          break;
        case 'created_at':
          aValue = new Date(a.createdAt || a.created_at || 0).getTime();
          bValue = new Date(b.createdAt || b.created_at || 0).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bugs, sortField, sortDirection]);

  const handleCreateBug = async (bugData: {
    title: string;
    description?: string;
    featureId: string;
    projectId?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    status?: "Open" | "In Progress" | "Resolved" | "Closed";
  }) => {
    setIsCreating(true);
    try {
      await onAddBug(bugData);
    } finally {
      setIsCreating(false);
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 lg:px-3 hover:bg-muted/50"
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Feature Bugs</h2>
        <CreateBugDialog 
          features={[]}
          featureId={featureId}
          projectId={projectId}
          onCreate={handleCreateBug}
          isCreating={isCreating}
        />
      </div>

      {bugs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="text-muted-foreground mb-4">No bugs found for this feature</div>
          <CreateBugDialog 
            features={[]}
            featureId={featureId}
            projectId={projectId}
            onCreate={handleCreateBug}
            isCreating={isCreating}
          />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>
                  <SortButton field="title">Title</SortButton>
                </TableHead>
                <TableHead className="w-[140px]">
                  <SortButton field="severity">Severity</SortButton>
                </TableHead>
                <TableHead className="w-[140px]">
                  <SortButton field="status">Status</SortButton>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">
                  <SortButton field="created_at">Date</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBugs.map((bug) => (
                <TableRow 
                  key={bug._id} 
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-muted-foreground">
                    BUG-{bug._id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={bug.title}>
                      {bug.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getSeverityColor(bug.severity)} border font-semibold`}
                    >
                      {bug.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {onUpdateBugStatus ? (
                      <Select
                        value={bug.status}
                        onValueChange={(value) => onUpdateBugStatus(bug._id, value as Bug['status'])}
                      >
                        <SelectTrigger className="w-[140px] h-auto border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0 [&>span]:flex [&>span]:items-center">
                          <SelectValue>
                            <Badge 
                              className={`${getStatusColor(bug.status)} border font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
                            >
                              {bug.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">
                            <Badge className="bg-red-500 text-white border-red-600">Open</Badge>
                          </SelectItem>
                          <SelectItem value="In Progress">
                            <Badge className="bg-cyan-500 text-white border-cyan-600">In Progress</Badge>
                          </SelectItem>
                          <SelectItem value="Resolved">
                            <Badge className="bg-green-500 text-white border-green-600">Resolved</Badge>
                          </SelectItem>
                          <SelectItem value="Closed">
                            <Badge className="bg-gray-500 text-white border-gray-600">Closed</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge 
                        className={`${getStatusColor(bug.status)} border font-semibold`}
                      >
                        {bug.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate text-sm text-muted-foreground" title={bug.description}>
                      {bug.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(bug.createdAt || bug.created_at)}
                    </div>
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

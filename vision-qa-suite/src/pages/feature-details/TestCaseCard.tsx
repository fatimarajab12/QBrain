// pages/feature-details/components/TestCaseCard.tsx
import { useState } from "react";
import { Play, AlertCircle, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestCase } from "@/types/test-case";
import { getPriorityColor, getStatusColor } from "@/utils/test-case-helpers";

interface TestCaseCardProps {
  testCase: TestCase;
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCaseId: number) => void;
  onStatusUpdate: (testCaseId: number, status: "passed" | "failed") => void;
  onPriorityUpdate?: (testCaseId: number, priority: "high" | "medium" | "low") => void;
  isDeleting?: boolean;
}

const TestCaseCard = ({ testCase, onEdit, onDelete, onStatusUpdate, onPriorityUpdate, isDeleting = false }: TestCaseCardProps) => {
  const [activeTab, setActiveTab] = useState("details");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle2 className="h-4 w-4" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      case "pending": return <Play className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="shadow-soft border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-lg">{testCase.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(testCase)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Test Case</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{testCase.title}"? This action cannot be undone and will permanently delete all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(testCase.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {onPriorityUpdate ? (
                <Select
                  value={testCase.priority}
                  onValueChange={(value: "high" | "medium" | "low") => onPriorityUpdate(testCase.id, value)}
                >
                  <SelectTrigger className={`h-10 w-[120px] ${getPriorityColor(testCase.priority)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Low
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getPriorityColor(testCase.priority)}>
                  {testCase.priority}
                </Badge>
              )}
              <Badge className={getStatusColor(testCase.status)}>
                <span className="mr-1">{getStatusIcon(testCase.status)}</span>
                {testCase.status}
              </Badge>
              {testCase.bugReports.length > 0 && (
                <Badge variant="destructive">
                  {testCase.bugReports.length} Bug{testCase.bugReports.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Preconditions</h4>
              <p className="text-sm text-muted-foreground">{testCase.preconditions || "No preconditions specified"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Steps</h4>
              <ol className="list-decimal list-inside space-y-1">
                {testCase.steps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Expected Result</h4>
              <p className="text-sm text-muted-foreground">{testCase.expectedResult}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 mt-4">
            {testCase.actualResult && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Actual Result</h4>
                <p className="text-sm text-muted-foreground">{testCase.actualResult}</p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusUpdate(testCase.id, "passed")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Passed
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onStatusUpdate(testCase.id, "failed")}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Mark Failed
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestCaseCard;
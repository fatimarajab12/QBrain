// pages/feature-details/components/TestCaseCard.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, FileText, AlertCircle, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestCase } from "@/types/test-case";
import { getPriorityColor, getStatusColor } from "@/utils/test-case-helpers";

interface TestCaseCardProps {
  testCase: TestCase;
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCaseId: number) => void;
  onStatusUpdate: (testCaseId: number, status: "passed" | "failed") => void;
}

const TestCaseCard = ({ testCase, onEdit, onDelete, onStatusUpdate }: TestCaseCardProps) => {
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(testCase.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className={getPriorityColor(testCase.priority)}>
                {testCase.priority}
              </Badge>
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
              {testCase.status === "failed" && (
                <Link to={`/bug-analyzer?testCaseId=${testCase.id}`}>
                
                </Link>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestCaseCard;
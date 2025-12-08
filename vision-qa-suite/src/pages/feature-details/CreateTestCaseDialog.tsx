// pages/feature-details/components/CreateTestCaseDialog.tsx
import { useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestCase } from "@/types/test-case";
import { newTestCaseTemplate } from "@/utils/test-case-helpers";

interface CreateTestCaseDialogProps {
  isCreating: boolean;
  onCreate: (testCase: Omit<TestCase, 'id'>) => void;
}

const CreateTestCaseDialog = ({ isCreating, onCreate }: CreateTestCaseDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTestCase, setNewTestCase] = useState<Omit<TestCase, 'id'>>(newTestCaseTemplate);
  const [newStep, setNewStep] = useState("");
  const [newPrecondition, setNewPrecondition] = useState("");

  const handleAddStep = (step: string) => {
    if (!step.trim()) return;
    setNewTestCase(prev => ({
      ...prev,
      steps: [...prev.steps, step]
    }));
    setNewStep("");
  };

  const handleRemoveStep = (stepIndex: number) => {
    setNewTestCase(prev => ({
      ...prev,
      steps: prev.steps.filter((_, index) => index !== stepIndex)
    }));
  };

  const handleAddPrecondition = (precondition: string) => {
    if (!precondition.trim()) return;
    setNewTestCase(prev => ({
      ...prev,
      preconditions: [...prev.preconditions, precondition]
    }));
    setNewPrecondition("");
  };

  const handleRemovePrecondition = (preconditionIndex: number) => {
    setNewTestCase(prev => ({
      ...prev,
      preconditions: prev.preconditions.filter((_, index) => index !== preconditionIndex)
    }));
  };

  const handleCreate = async () => {
    if (!newTestCase.title.trim()) return;

    await onCreate(newTestCase);
    setNewTestCase(newTestCaseTemplate);
    setNewStep("");
    setNewPrecondition("");
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewTestCase(newTestCaseTemplate);
      setNewStep("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25">
          <Plus className="mr-2 h-4 w-4" />
          Add Test Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Test Case</DialogTitle>
          <DialogDescription>
            Create a new test case for this feature
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter test case title"
              value={newTestCase.title}
              onChange={(e) => setNewTestCase(prev => ({ ...prev, title: e.target.value }))}
              disabled={isCreating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTestCase.priority}
                onValueChange={(value: "high" | "medium" | "low") => 
                  setNewTestCase(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="h-10">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newTestCase.status}
                onValueChange={(value: "passed" | "failed" | "pending") => 
                  setNewTestCase(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preconditions</Label>
            <div className="space-y-2">
              {newTestCase.preconditions.map((precondition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input value={precondition} readOnly className="flex-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePrecondition(index)}
                    disabled={isCreating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a precondition"
                  value={newPrecondition}
                  onChange={(e) => setNewPrecondition(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPrecondition(newPrecondition);
                    }
                  }}
                  disabled={isCreating}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPrecondition(newPrecondition)}
                  disabled={isCreating || !newPrecondition.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Steps</Label>
            <div className="space-y-2">
              {newTestCase.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input value={step} readOnly className="flex-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(index)}
                    disabled={isCreating}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a new step"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddStep(newStep);
                    }
                  }}
                  disabled={isCreating}
                />
                <Button
                  type="button"
                  onClick={() => handleAddStep(newStep)}
                  disabled={isCreating || !newStep.trim()}
                >
                  Add Step
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedResult">Expected Result</Label>
            <Textarea
              id="expectedResult"
              placeholder="Enter the expected result"
              value={newTestCase.expectedResult}
              onChange={(e) => setNewTestCase(prev => ({ ...prev, expectedResult: e.target.value }))}
              rows={3}
              disabled={isCreating}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
              disabled={isCreating || !newTestCase.title.trim()}
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isCreating ? "Creating..." : "Add Test Case"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTestCaseDialog;
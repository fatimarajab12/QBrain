// pages/feature-details/components/EditTestCaseDialog.tsx
import { useState } from "react";
import { Save, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestCase } from "@/types/test-case";

interface EditTestCaseDialogProps {
  testCase: TestCase | null;
  isUpdating: boolean;
  onUpdate: (testCase: TestCase) => void;
  onClose: () => void;
}

const EditTestCaseDialog = ({ testCase, isUpdating, onUpdate, onClose }: EditTestCaseDialogProps) => {
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(testCase);
  const [newStep, setNewStep] = useState("");

  const handleAddStep = (step: string) => {
    if (!step.trim() || !editingTestCase) return;
    
    setEditingTestCase(prev => prev ? {
      ...prev,
      steps: [...prev.steps, step]
    } : null);
    setNewStep("");
  };

  const handleRemoveStep = (stepIndex: number) => {
    if (!editingTestCase) return;
    
    setEditingTestCase(prev => prev ? {
      ...prev,
      steps: prev.steps.filter((_, index) => index !== stepIndex)
    } : null);
  };

  const handleUpdate = async () => {
    if (!editingTestCase?.title.trim()) return;
    await onUpdate(editingTestCase);
  };

  if (!editingTestCase) return null;

  return (
    <Dialog open={!!testCase} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Case</DialogTitle>
          <DialogDescription>
            Modify the test case details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={editingTestCase.title}
              onChange={(e) => setEditingTestCase(prev => prev ? { ...prev, title: e.target.value } : null)}
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={editingTestCase.priority}
                onValueChange={(value: "high" | "medium" | "low") => 
                  setEditingTestCase(prev => prev ? { ...prev, priority: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editingTestCase.status}
                onValueChange={(value: "passed" | "failed" | "pending") => 
                  setEditingTestCase(prev => prev ? { ...prev, status: value } : null)
                }
              >
                <SelectTrigger>
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
            <Label htmlFor="edit-preconditions">Preconditions</Label>
            <Textarea
              id="edit-preconditions"
              value={editingTestCase.preconditions}
              onChange={(e) => setEditingTestCase(prev => prev ? { ...prev, preconditions: e.target.value } : null)}
              rows={2}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label>Steps</Label>
            <div className="space-y-2">
              {editingTestCase.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input 
                    value={step} 
                    onChange={(e) => {
                      const newSteps = [...editingTestCase.steps];
                      newSteps[index] = e.target.value;
                      setEditingTestCase(prev => prev ? { ...prev, steps: newSteps } : null);
                    }}
                    className="flex-1"
                    disabled={isUpdating}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(index)}
                    disabled={isUpdating}
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
                  disabled={isUpdating}
                />
                <Button
                  type="button"
                  onClick={() => handleAddStep(newStep)}
                  disabled={isUpdating || !newStep.trim()}
                >
                  Add Step
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expectedResult">Expected Result</Label>
            <Textarea
              id="edit-expectedResult"
              value={editingTestCase.expectedResult}
              onChange={(e) => setEditingTestCase(prev => prev ? { ...prev, expectedResult: e.target.value } : null)}
              rows={3}
              disabled={isUpdating}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleUpdate}
              className="flex-1 gradient-primary"
              disabled={isUpdating || !editingTestCase.title.trim()}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isUpdating ? "Updating..." : "Update Test Case"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTestCaseDialog;
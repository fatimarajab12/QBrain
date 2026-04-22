import { useState, useEffect } from "react";
import { Save, X, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
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
  const [newPrecondition, setNewPrecondition] = useState("");

  // Update editingTestCase when testCase prop changes
  useEffect(() => {
    setEditingTestCase(testCase);
  }, [testCase]);

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
    try {
      await onUpdate(editingTestCase);
      // onUpdate will handle closing the dialog on success
    } catch (error) {
      // Error is already handled in the mutation
      console.error('Error updating test case:', error);
    }
  };

  if (!editingTestCase) return null;

  return (
    <Dialog open={!!testCase} onOpenChange={(open) => !open && !isUpdating && onClose()}>
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
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editingTestCase.status}
                onValueChange={(value: "passed" | "failed" | "pending") => 
                  setEditingTestCase(prev => prev ? { ...prev, status: value } : null)
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
              {editingTestCase.preconditions.map((precondition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input 
                    value={precondition} 
                    onChange={(e) => {
                      const newPreconditions = [...editingTestCase.preconditions];
                      newPreconditions[index] = e.target.value;
                      setEditingTestCase(prev => prev ? { ...prev, preconditions: newPreconditions } : null);
                    }}
                    className="flex-1" 
                    disabled={isUpdating}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTestCase(prev => prev ? {
                      ...prev,
                      preconditions: prev.preconditions.filter((_, i) => i !== index)
                    } : null)}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
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
                      if (newPrecondition.trim()) {
                        setEditingTestCase(prev => prev ? {
                          ...prev,
                          preconditions: [...prev.preconditions, newPrecondition]
                        } : null);
                        setNewPrecondition("");
                      }
                    }
                  }}
                  disabled={isUpdating}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newPrecondition.trim()) {
                      setEditingTestCase(prev => prev ? {
                        ...prev,
                        preconditions: [...prev.preconditions, newPrecondition]
                      } : null);
                      setNewPrecondition("");
                    }
                  }}
                  disabled={isUpdating || !newPrecondition.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editingTestCase.description || ""}
              onChange={(e) => setEditingTestCase(prev => prev ? { ...prev, description: e.target.value } : null)}
              rows={2}
              disabled={isUpdating}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expectedResult">Expected Result *</Label>
            <Textarea
              id="edit-expectedResult"
              value={editingTestCase.expectedResult}
              onChange={(e) => setEditingTestCase(prev => prev ? { ...prev, expectedResult: e.target.value } : null)}
              rows={3}
              disabled={isUpdating}
            />
          </div>

          {editingTestCase.actualResult !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="edit-actualResult">Actual Result</Label>
              <Textarea
                id="edit-actualResult"
                value={editingTestCase.actualResult || ""}
                onChange={(e) => setEditingTestCase(prev => prev ? { ...prev, actualResult: e.target.value } : null)}
                rows={3}
                disabled={isUpdating}
                placeholder="Enter actual result after execution"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <LoadingButton
              onClick={handleUpdate}
              isLoading={isUpdating}
              loadingText="Updating..."
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
              disabled={!editingTestCase.title.trim()}
            >
              Update Test Case
            </LoadingButton>
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

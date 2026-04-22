import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Save } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Feature } from "@/types/feature";
import { Bug } from "@/types/bug";
import { useToast } from "@/hooks/use-toast";
import { bugService } from "@/services/bug.service";
import { logger } from "@/utils/logger";

interface EditBugDialogProps {
  bug: Bug | null;
  features: Feature[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedBug: Bug) => void;
  isUpdating?: boolean;
}

const EditBugDialog = ({ bug, features, isOpen, onClose, onUpdate, isUpdating = false }: EditBugDialogProps) => {
  const { toast } = useToast();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [stepsInput, setStepsInput] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "Medium" as "Low" | "Medium" | "High" | "Critical",
    priority: "P2" as "P0" | "P1" | "P2" | "P3",
    status: "Open" as "Open" | "In Progress" | "Resolved" | "Closed",
    stepsToReproduce: [] as string[],
    expectedBehavior: "",
    actualBehavior: "",
    reproducibility: "Sometimes" as "Always" | "Often" | "Sometimes" | "Rare" | "Unable",
    environment: {
      os: "",
      browser: "",
      browserVersion: "",
      appType: "Web" as "Web" | "Mobile" | "API",
      appVersion: "",
      build: "",
    },
    component: "",
    labels: [] as string[],
    affectedUrl: "",
    firstOccurrenceDate: "",
    lastOccurrenceDate: "",
    attachments: [] as string[],
    featureId: "",
  });

  useEffect(() => {
    if (bug && isOpen) {
      setFormData({
        title: bug.title,
        description: bug.description || "",
        severity: bug.severity,
        priority: bug.priority,
        status: bug.status,
        stepsToReproduce: bug.stepsToReproduce || [],
        expectedBehavior: bug.expectedBehavior || "",
        actualBehavior: bug.actualBehavior || "",
        reproducibility: bug.reproducibility,
        environment: {
          os: bug.environment?.os || "",
          browser: bug.environment?.browser || "",
          browserVersion: bug.environment?.browserVersion || "",
          appType: bug.environment?.appType || "Web",
          appVersion: bug.environment?.appVersion || "",
          build: bug.environment?.build || "",
        },
        component: bug.component || "",
        labels: bug.labels || [],
        affectedUrl: bug.affectedUrl || "",
        firstOccurrenceDate: bug.firstOccurrenceDate ? new Date(bug.firstOccurrenceDate).toISOString().split('T')[0] : "",
        lastOccurrenceDate: bug.lastOccurrenceDate ? new Date(bug.lastOccurrenceDate).toISOString().split('T')[0] : "",
        attachments: bug.attachments || [],
        featureId: bug.featureId,
      });

      setStepsInput((bug.stepsToReproduce || []).join('\n'));
      setLabelsInput((bug.labels || []).join(', '));
    }
  }, [bug, isOpen]);

  const handleSave = async () => {
    if (!bug) return;

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Bug title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.featureId) {
      toast({
        title: "Validation Error",
        description: "Feature is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const stepsToReproduce = stepsInput
        .split('\n')
        .map(step => step.trim())
        .filter(step => step.length > 0);

      const labels = labelsInput
        .split(',')
        .map(label => label.trim())
        .filter(label => label.length > 0);

      const updateData = {
        title: formData.title,
        description: formData.description || undefined,
        severity: formData.severity,
        priority: formData.priority,
        status: formData.status,
        stepsToReproduce: stepsToReproduce.length > 0 ? stepsToReproduce : undefined,
        expectedBehavior: formData.expectedBehavior || undefined,
        actualBehavior: formData.actualBehavior || undefined,
        reproducibility: formData.reproducibility,
        environment: {
          os: formData.environment.os || "",
          browser: formData.environment.browser || "",
          browserVersion: formData.environment.browserVersion || "",
          appType: formData.environment.appType,
          appVersion: formData.environment.appVersion || "",
          build: formData.environment.build || "",
        },
        component: formData.component || undefined,
        labels: labels.length > 0 ? labels : undefined,
        affectedUrl: formData.affectedUrl || undefined,
        firstOccurrenceDate: formData.firstOccurrenceDate || undefined,
        lastOccurrenceDate: formData.lastOccurrenceDate || undefined,
        featureId: formData.featureId,
      };

      const updatedBug = await bugService.updateBug(bug._id, updateData);

      toast({
        title: "Success",
        description: "Bug updated successfully",
      });

      onUpdate(updatedBug);
      onClose();
    } catch (error) {
      logger.error('Error updating bug', error);
      toast({
        title: "Error",
        description: "Failed to update bug",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!bug) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bug</DialogTitle>
          <DialogDescription>
            Modify the bug details and save your changes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="edit-bug-title">Title *</Label>
              <Input
                id="edit-bug-title"
                placeholder="Enter bug title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bug-description">Description</Label>
              <Textarea
                id="edit-bug-description"
                placeholder="Describe the bug in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={saving}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bug-severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: "Low" | "Medium" | "High" | "Critical") =>
                    setFormData({ ...formData, severity: value })
                  }
                  disabled={saving}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bug-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "P0" | "P1" | "P2" | "P3") =>
                    setFormData({ ...formData, priority: value })
                  }
                  disabled={saving}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 - Critical</SelectItem>
                    <SelectItem value="P1">P1 - High</SelectItem>
                    <SelectItem value="P2">P2 - Medium</SelectItem>
                    <SelectItem value="P3">P3 - Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bug-reproducibility">Reproducibility</Label>
                <Select
                  value={formData.reproducibility}
                  onValueChange={(value: "Always" | "Often" | "Sometimes" | "Rare" | "Unable") =>
                    setFormData({ ...formData, reproducibility: value })
                  }
                  disabled={saving}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Always">Always</SelectItem>
                    <SelectItem value="Often">Often</SelectItem>
                    <SelectItem value="Sometimes">Sometimes</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Unable">Unable to reproduce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bug-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Open" | "In Progress" | "Resolved" | "Closed") =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={saving}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bug-feature">Feature *</Label>
              <Select
                value={formData.featureId}
                onValueChange={(value) => setFormData({ ...formData, featureId: value })}
                disabled={saving}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  {features.map((feature) => (
                    <SelectItem key={feature._id} value={feature._id}>
                      {feature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reproduction Steps</h3>

            <div className="space-y-2">
              <Label htmlFor="edit-bug-steps">Steps to Reproduce</Label>
              <Textarea
                id="edit-bug-steps"
                placeholder="Enter each step on a new line..."
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                disabled={saving}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bug-expected">Expected Result</Label>
                <Textarea
                  id="edit-bug-expected"
                  placeholder="What should happen..."
                  value={formData.expectedBehavior}
                  onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                  disabled={saving}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bug-actual">Actual Result</Label>
                <Textarea
                  id="edit-bug-actual"
                  placeholder="What actually happens..."
                  value={formData.actualBehavior}
                  onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                  disabled={saving}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Advanced Options
                {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Environment</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-os">Operating System</Label>
                    <Input
                      id="edit-bug-os"
                      placeholder="e.g., Windows 11, macOS 13.0"
                      value={formData.environment.os}
                      onChange={(e) => setFormData({
                        ...formData,
                        environment: { ...formData.environment, os: e.target.value }
                      })}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-app-type">Application Type</Label>
                    <Select
                      value={formData.environment.appType}
                      onValueChange={(value: "Web" | "Mobile" | "API") =>
                        setFormData({
                          ...formData,
                          environment: { ...formData.environment, appType: value }
                        })
                      }
                      disabled={saving}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web">Web</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                        <SelectItem value="API">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-browser">Browser</Label>
                    <Input
                      id="edit-bug-browser"
                      placeholder="e.g., Chrome, Firefox"
                      value={formData.environment.browser}
                      onChange={(e) => setFormData({
                        ...formData,
                        environment: { ...formData.environment, browser: e.target.value }
                      })}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-browser-version">Browser Version</Label>
                    <Input
                      id="edit-bug-browser-version"
                      placeholder="e.g., 120.0.0"
                      value={formData.environment.browserVersion}
                      onChange={(e) => setFormData({
                        ...formData,
                        environment: { ...formData.environment, browserVersion: e.target.value }
                      })}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-app-version">App Version</Label>
                    <Input
                      id="edit-bug-app-version"
                      placeholder="e.g., 1.2.3"
                      value={formData.environment.appVersion}
                      onChange={(e) => setFormData({
                        ...formData,
                        environment: { ...formData.environment, appVersion: e.target.value }
                      })}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-bug-build">Build</Label>
                  <Input
                    id="edit-bug-build"
                    placeholder="e.g., build-20240101"
                    value={formData.environment.build}
                    onChange={(e) => setFormData({
                      ...formData,
                      environment: { ...formData.environment, build: e.target.value }
                    })}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-semibold">Classification</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-component">Component/Module</Label>
                    <Input
                      id="edit-bug-component"
                      placeholder="e.g., Authentication, Dashboard"
                      value={formData.component}
                      onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-affected-url">Affected URL/Page</Label>
                    <Input
                      id="edit-bug-affected-url"
                      placeholder="e.g., /dashboard, /login"
                      value={formData.affectedUrl}
                      onChange={(e) => setFormData({ ...formData, affectedUrl: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-bug-labels">Labels/Tags</Label>
                  <Input
                    id="edit-bug-labels"
                    placeholder="e.g., ui, backend, payment, regression (comma-separated)"
                    value={labelsInput}
                    onChange={(e) => setLabelsInput(e.target.value)}
                    disabled={saving}
                  />
                  {labelsInput && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {labelsInput.split(',').map((label, index) => {
                        const trimmedLabel = label.trim();
                        return trimmedLabel ? (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trimmedLabel}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-semibold">Occurrence Information</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-first-occurrence">First Occurrence Date</Label>
                    <Input
                      id="edit-bug-first-occurrence"
                      type="date"
                      value={formData.firstOccurrenceDate}
                      onChange={(e) => setFormData({ ...formData, firstOccurrenceDate: e.target.value })}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-bug-last-occurrence">Last Occurrence Date</Label>
                    <Input
                      id="edit-bug-last-occurrence"
                      type="date"
                      value={formData.lastOccurrenceDate}
                      onChange={(e) => setFormData({ ...formData, lastOccurrenceDate: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBugDialog;

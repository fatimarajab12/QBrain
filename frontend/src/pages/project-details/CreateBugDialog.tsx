import { useState, useRef } from "react";
import { Plus, ChevronDown, ChevronUp, Upload, X, File, Image as ImageIcon } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Feature } from "@/types/feature";
import { Bug } from "@/types/bug";

interface CreateBugDialogProps {
  features: Feature[];
  projectId?: string;
  featureId?: string; // If provided, this bug is for a specific feature
  onCreate: (bugData: {
    title: string;
    description?: string;
    featureId: string;
    projectId?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    priority?: "P0" | "P1" | "P2" | "P3";
    status?: "Open" | "In Progress" | "Resolved" | "Closed";
    stepsToReproduce?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
    reproducibility?: "Always" | "Often" | "Sometimes" | "Rare" | "Unable";
    environment?: {
      os?: string;
      browser?: string;
      browserVersion?: string;
      appType?: "Web" | "Mobile" | "API";
      appVersion?: string;
      build?: string;
    };
    component?: string;
    labels?: string[];
    affectedUrl?: string;
    firstOccurrenceDate?: string;
    lastOccurrenceDate?: string;
    attachments?: string[];
  }, files?: File[]) => Promise<void>;
  isCreating: boolean;
}

const CreateBugDialog = ({ features, projectId, featureId, onCreate, isCreating }: CreateBugDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [newBug, setNewBug] = useState({
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
    featureId: featureId || "",
  });
  const [stepsInput, setStepsInput] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const handleCreate = async () => {
    if (!newBug.title.trim() || !newBug.featureId) return;

    // Process steps to reproduce from textarea input
    const stepsToReproduce = stepsInput
      .split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0);

    // Process labels from comma-separated input
    const labels = labelsInput
      .split(',')
      .map(label => label.trim())
      .filter(label => label.length > 0);

    await onCreate({
      title: newBug.title,
      description: newBug.description,
      featureId: newBug.featureId,
      projectId: projectId,
      severity: newBug.severity,
      priority: newBug.priority,
      status: newBug.status,
      stepsToReproduce: stepsToReproduce.length > 0 ? stepsToReproduce : undefined,
      expectedBehavior: newBug.expectedBehavior || undefined,
      actualBehavior: newBug.actualBehavior || undefined,
      reproducibility: newBug.reproducibility,
      environment: {
        os: newBug.environment.os || undefined,
        browser: newBug.environment.browser || undefined,
        browserVersion: newBug.environment.browserVersion || undefined,
        appType: newBug.environment.appType,
        appVersion: newBug.environment.appVersion || undefined,
        build: newBug.environment.build || undefined,
      },
      component: newBug.component || undefined,
      labels: labels.length > 0 ? labels : undefined,
      affectedUrl: newBug.affectedUrl || undefined,
      firstOccurrenceDate: newBug.firstOccurrenceDate || undefined,
      lastOccurrenceDate: newBug.lastOccurrenceDate || undefined,
      attachments: newBug.attachments.length > 0 ? newBug.attachments : undefined,
    }, selectedFiles);
    setNewBug({
      title: "",
      description: "",
      severity: "Medium",
      priority: "P2",
      status: "Open",
      stepsToReproduce: [],
      expectedBehavior: "",
      actualBehavior: "",
      reproducibility: "Sometimes",
      environment: {
        os: "",
        browser: "",
        browserVersion: "",
        appType: "Web",
        appVersion: "",
        build: "",
      },
      component: "",
      labels: [],
      affectedUrl: "",
      firstOccurrenceDate: "",
      lastOccurrenceDate: "",
      attachments: [],
      featureId: featureId || "",
    });
    setStepsInput("");
    setLabelsInput("");
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewBug({
        title: "",
        description: "",
        severity: "Medium",
        priority: "P2",
        status: "Open",
        stepsToReproduce: [],
        expectedBehavior: "",
        actualBehavior: "",
        reproducibility: "Sometimes",
        environment: {
          os: "",
          browser: "",
          browserVersion: "",
          appType: "Web",
          appVersion: "",
          build: "",
        },
        component: "",
        labels: [],
        affectedUrl: "",
        firstOccurrenceDate: "",
        lastOccurrenceDate: "",
        attachments: [],
        featureId: featureId || "",
      });
      setStepsInput("");
      setLabelsInput("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsAdvancedOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25">
          <Plus className="mr-2 h-4 w-4" />
          Add Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report New Bug</DialogTitle>
          <DialogDescription>Create a comprehensive bug report for this project</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="bug-title">Title *</Label>
              <Input
                id="bug-title"
                placeholder="Enter bug title"
                value={newBug.title}
                onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-description">Description</Label>
              <Textarea
                id="bug-description"
                placeholder="Describe the bug in detail..."
                value={newBug.description}
                onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                disabled={isCreating}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bug-severity">Severity</Label>
                <Select
                  value={newBug.severity}
                  onValueChange={(value: "Low" | "Medium" | "High" | "Critical") =>
                    setNewBug({ ...newBug, severity: value })
                  }
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
                <Label htmlFor="bug-priority">Priority</Label>
                <Select
                  value={newBug.priority}
                  onValueChange={(value: "P0" | "P1" | "P2" | "P3") =>
                    setNewBug({ ...newBug, priority: value })
                  }
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
                <Label htmlFor="bug-reproducibility">Reproducibility</Label>
                <Select
                  value={newBug.reproducibility}
                  onValueChange={(value: "Always" | "Often" | "Sometimes" | "Rare" | "Unable") =>
                    setNewBug({ ...newBug, reproducibility: value })
                  }
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
                <Label htmlFor="bug-status">Status</Label>
                <Select
                  value={newBug.status}
                  onValueChange={(value: "Open" | "In Progress" | "Resolved" | "Closed") =>
                    setNewBug({ ...newBug, status: value })
                  }
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

            {!featureId && (
              <div className="space-y-2">
                <Label htmlFor="bug-feature">Feature *</Label>
                <Select
                  value={newBug.featureId}
                  onValueChange={(value) => setNewBug({ ...newBug, featureId: value })}
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
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Attachments</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isCreating}
                  className="hidden"
                  id="bug-attachments"
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.zip,.rar,.7z,.mp4,.avi,.mov,.webm"
                />
                <Label
                  htmlFor="bug-attachments"
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-dashed rounded-md hover:bg-accent transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Images or Files</span>
                </Label>
                <span className="text-sm text-muted-foreground">
                  (Images, PDFs, Documents, Videos - Max 50MB per file)
                </span>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Files ({selectedFiles.length}):</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getFileIcon(file)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isCreating}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Steps to Reproduce */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reproduction Steps</h3>

            <div className="space-y-2">
              <Label htmlFor="bug-steps">Steps to Reproduce</Label>
              <Textarea
                id="bug-steps"
                placeholder="Enter each step on a new line..."
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                disabled={isCreating}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bug-expected">Expected Result</Label>
                <Textarea
                  id="bug-expected"
                  placeholder="What should happen..."
                  value={newBug.expectedBehavior}
                  onChange={(e) => setNewBug({ ...newBug, expectedBehavior: e.target.value })}
                  disabled={isCreating}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bug-actual">Actual Result</Label>
                <Textarea
                  id="bug-actual"
                  placeholder="What actually happens..."
                  value={newBug.actualBehavior}
                  onChange={(e) => setNewBug({ ...newBug, actualBehavior: e.target.value })}
                  disabled={isCreating}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Advanced Options
                {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Environment */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Environment</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bug-os">Operating System</Label>
                    <Input
                      id="bug-os"
                      placeholder="e.g., Windows 11, macOS 13.0"
                      value={newBug.environment.os}
                      onChange={(e) => setNewBug({
                        ...newBug,
                        environment: { ...newBug.environment, os: e.target.value }
                      })}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bug-app-type">Application Type</Label>
                    <Select
                      value={newBug.environment.appType}
                      onValueChange={(value: "Web" | "Mobile" | "API") =>
                        setNewBug({
                          ...newBug,
                          environment: { ...newBug.environment, appType: value }
                        })
                      }
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
                    <Label htmlFor="bug-browser">Browser</Label>
                    <Input
                      id="bug-browser"
                      placeholder="e.g., Chrome, Firefox"
                      value={newBug.environment.browser}
                      onChange={(e) => setNewBug({
                        ...newBug,
                        environment: { ...newBug.environment, browser: e.target.value }
                      })}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bug-browser-version">Browser Version</Label>
                    <Input
                      id="bug-browser-version"
                      placeholder="e.g., 120.0.0"
                      value={newBug.environment.browserVersion}
                      onChange={(e) => setNewBug({
                        ...newBug,
                        environment: { ...newBug.environment, browserVersion: e.target.value }
                      })}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bug-app-version">App Version</Label>
                    <Input
                      id="bug-app-version"
                      placeholder="e.g., 1.2.3"
                      value={newBug.environment.appVersion}
                      onChange={(e) => setNewBug({
                        ...newBug,
                        environment: { ...newBug.environment, appVersion: e.target.value }
                      })}
                      disabled={isCreating}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bug-build">Build</Label>
                  <Input
                    id="bug-build"
                    placeholder="e.g., build-20240101"
                    value={newBug.environment.build}
                    onChange={(e) => setNewBug({
                      ...newBug,
                      environment: { ...newBug.environment, build: e.target.value }
                    })}
                    disabled={isCreating}
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Classification</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bug-component">Component/Module</Label>
                    <Input
                      id="bug-component"
                      placeholder="e.g., Authentication, Dashboard"
                      value={newBug.component}
                      onChange={(e) => setNewBug({ ...newBug, component: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bug-affected-url">Affected URL/Page</Label>
                    <Input
                      id="bug-affected-url"
                      placeholder="e.g., /dashboard, /login"
                      value={newBug.affectedUrl}
                      onChange={(e) => setNewBug({ ...newBug, affectedUrl: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bug-labels">Labels/Tags</Label>
                  <Input
                    id="bug-labels"
                    placeholder="e.g., ui, backend, payment, regression (comma-separated)"
                    value={labelsInput}
                    onChange={(e) => setLabelsInput(e.target.value)}
                    disabled={isCreating}
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

              {/* Occurrence Dates */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Occurrence Information</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bug-first-occurrence">First Occurrence Date</Label>
                    <Input
                      id="bug-first-occurrence"
                      type="date"
                      value={newBug.firstOccurrenceDate}
                      onChange={(e) => setNewBug({ ...newBug, firstOccurrenceDate: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bug-last-occurrence">Last Occurrence Date</Label>
                    <Input
                      id="bug-last-occurrence"
                      type="date"
                      value={newBug.lastOccurrenceDate}
                      onChange={(e) => setNewBug({ ...newBug, lastOccurrenceDate: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <LoadingButton
            onClick={handleCreate}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
            disabled={!newBug.title.trim() || !newBug.featureId}
            isLoading={isCreating}
            loadingText="Creating..."
          >
            Create Bug
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBugDialog;

import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { useNavigation } from "@/hooks/useNavigation";
import ShareProjectDialog from "../ShareProjectDialog";
import { testCaseService } from "@/services/test-case.service";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProjectHeaderProps {
  project: Project | null;
  projectId: string | undefined;
}

const ProjectHeader = ({ project, projectId }: ProjectHeaderProps) => {
  const { navigateTo } = useNavigation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required for export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await testCaseService.exportToExcel(projectId);
      toast({
        title: "Success",
        description: "Features and test cases exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export features and test cases",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        onClick={() => navigateTo("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              {project?.name || "Project Features"}
            </h1>
            {projectId && project && (
              <ShareProjectDialog 
                projectId={projectId} 
                projectName={project.name || "Project"}
                project={project}
              />
            )}
            {projectId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Excel"}
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            {project?.description || "Manage features and generate test cases"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;


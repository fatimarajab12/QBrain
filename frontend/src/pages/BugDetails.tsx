import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditBugDialog from "./project-details/EditBugDialog";
import { useToast } from "@/hooks/use-toast";
import { useFeatures } from "@/hooks/useFeatures";
import { useBug } from "@/hooks/useBug";
import { Bug } from "@/types/bug";

import { BugHeader } from "./bug-details/components/BugHeader";
import { BugBadges } from "./bug-details/components/BugBadges";
import { BugBasicInfo } from "./bug-details/components/BugBasicInfo";
import { BugStepsToReproduce } from "./bug-details/components/BugStepsToReproduce";
import { BugExpectedActual } from "./bug-details/components/BugExpectedActual";
import { BugLabels } from "./bug-details/components/BugLabels";
import { BugAttachments } from "./bug-details/components/BugAttachments";
import { BugResolution } from "./bug-details/components/BugResolution";
import { BugEnvironment } from "./bug-details/components/BugEnvironment";
import { BugPeople } from "./bug-details/components/BugPeople";
import { BugTimeline } from "./bug-details/components/BugTimeline";
import { BugDeleteDialog } from "./bug-details/components/BugDeleteDialog";
import { LoadingState } from "./bug-details/components/LoadingState";
import { ErrorState } from "./bug-details/components/ErrorState";

const BugDetails = () => {
  const { projectId, bugId } = useParams<{ projectId: string; bugId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { features } = useFeatures(projectId);
  const {
    bug,
    isLoading: loading,
    error: bugError,
    isDeleting: deleting,
    updateBug,
    deleteBug,
  } = useBug(bugId, projectId);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (bugError) {
      toast({
        title: "Error",
        description: "Failed to load bug details",
        variant: "destructive",
      });
    }
  }, [bugError, toast]);

  const handleBack = () => {
    navigate(`/projects/${projectId}?tab=bugs`);
  };

  const handleDeleteBug = async () => {
    if (!bug) return;
    await deleteBug();
    setIsDeleteDialogOpen(false);
  };

  const handleBugUpdate = async (updatedBug: Bug) => {
    await updateBug(updatedBug);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (bugError || (!loading && !bug)) {
    return <ErrorState error={bugError} projectId={projectId} onBack={handleBack} />;
  }

  if (!bug) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <BugHeader
          bug={bug}
          projectId={projectId}
          onBack={handleBack}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => setIsDeleteDialogOpen(true)}
          isDeleting={deleting}
        />

        <BugBadges bug={bug} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BugBasicInfo bug={bug} projectId={projectId} />
            <BugStepsToReproduce steps={bug.stepsToReproduce || []} />
            <BugExpectedActual
              expectedBehavior={bug.expectedBehavior}
              actualBehavior={bug.actualBehavior}
            />
            <BugLabels labels={bug.labels || []} />
            <BugAttachments 
              attachments={bug.attachments || []} 
              attachmentDetails={bug.attachmentDetails}
            />
            <BugResolution resolution={bug.resolution} />
          </div>

          <div className="space-y-6">
            <BugEnvironment environment={bug.environment} />
            <BugPeople bug={bug} />
            <BugTimeline bug={bug} />
          </div>
        </div>
      </div>

      <EditBugDialog
        bug={bug}
        features={features}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleBugUpdate}
      />

      <BugDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteBug}
        isDeleting={deleting}
      />
    </div>
  );
};

export default BugDetails;

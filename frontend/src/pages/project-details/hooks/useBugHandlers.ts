import { useBugs } from "@/hooks/useBugs";

interface UseBugHandlersProps {
  projectId: string | undefined;
}

export const useBugHandlers = ({ projectId }: UseBugHandlersProps) => {
  const {
    createBug: handleAddBug,
    updateBugStatus: handleUpdateBugStatus,
    deleteBug: handleDeleteBug,
  } = useBugs(projectId);

  return {
    handleAddBug,
    handleUpdateBugStatus,
    handleDeleteBug,
  };
};


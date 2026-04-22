import { PrefetchLink } from "@/components/shared/PrefetchLink";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { PageLoading } from "@/components/ui/page-loading";

const LoadingState = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <PrefetchLink to="/dashboard" prefetchOnHover={false}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </PrefetchLink>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Features</h1>
            <p className="text-muted-foreground">Manage features and generate test cases</p>
          </div>
          <LoadingButton 
            isLoading={true}
            loadingText="Loading..."
            disabled
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 opacity-50"
          >
            Add Feature
          </LoadingButton>
        </div>
      </div>
      <PageLoading />
    </div>
  );
};

export default LoadingState;



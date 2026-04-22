import { useState, useMemo } from "react";
import { Search, Filter, SortAsc, SortDesc, ArrowUpDown, X } from "lucide-react";
import { PageLoading } from "@/components/ui/page-loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./dashboard/ProjectCard";
import CreateProjectDialog from "./dashboard/CreateProjectDialog";
import EmptyState from "./dashboard/EmptyState";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { projects, isLoading, isCreating, createProject, deleteProject } = useProjects();
  const { toast } = useToast();
  const [deletingProjectId, setDeletingProjectId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    
    if (!trimmedQuery) {
      // If no search query, return all projects sorted
      const sorted = [...projects];
      sorted.sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case "oldest":
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
      return sorted;
    }

    // Filter projects by search query
    let filtered = projects.filter(project => {
      const nameMatch = project.name.toLowerCase().includes(trimmedQuery);
      const descriptionMatch = project.description?.toLowerCase().includes(trimmedQuery);
      
      // Search in multiple words (split query and check each word)
      const queryWords = trimmedQuery.split(/\s+/).filter(word => word.length > 0);
      const allWordsMatch = queryWords.every(word => 
        project.name.toLowerCase().includes(word) ||
        project.description?.toLowerCase().includes(word)
      );
      
      return nameMatch || descriptionMatch || allWordsMatch;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, sortBy]);

  const handleCreateProject = async (projectData: { name: string; description: string }) => {
    try {
      const createdProject = await createProject(projectData);
      // Note: Success toast is shown in CreateProjectDialog to avoid duplicate messages
      return createdProject ? { _id: createdProject._id } : undefined;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string | number) => {
    const idToDelete = projectId.toString();
    setDeletingProjectId(idToDelete);
    try {
      await deleteProject(idToDelete);
      toast({
        title: "Project Deleted",
        description: "Project and all associated data have been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading projects..." />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage all your testing projects</p>
        </div>
        <CreateProjectDialog 
          isCreating={isCreating}
          onCreateProject={handleCreateProject}
        />
      </div>

      {/* Statistics */}

      {/* Search and Filter Controls */}
      {projects.length > 0 && (
        <Card className="bg-card/70 backdrop-blur border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                  <Input
                    placeholder="Search projects by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent/50"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={(value: "newest" | "oldest" | "name") => setSortBy(value)}>
                    <SelectTrigger className="w-52 h-10 text-sm border-border/60 bg-background/50 hover:bg-accent/50 hover:border-border transition-all duration-200 shadow-sm [&>span]:flex [&>span]:items-center [&>span]:gap-2">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      <SelectValue className="flex-1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">
                        <div className="flex items-center gap-2">
                          <SortDesc className="h-4 w-4" />
                          Newest First
                        </div>
                      </SelectItem>
                      <SelectItem value="oldest">
                        <div className="flex items-center gap-2">
                          <SortAsc className="h-4 w-4" />
                          Oldest First
                        </div>
                      </SelectItem>
                      <SelectItem value="name">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          By Name
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  {filteredAndSortedProjects.length} of {projects.length} projects
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Projects</h2>
          {projects.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''} shown
            </span>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState onCreateProject={() => document.querySelector<HTMLButtonElement>('[data-testid="create-project-trigger"]')?.click()} />
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
                isDeleting={deletingProjectId === project._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

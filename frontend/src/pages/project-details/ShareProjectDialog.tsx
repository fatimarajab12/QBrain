import { useState, useEffect } from "react";
import { Share2, UserPlus, X, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authStorage } from "@/utils/auth-helpers";
import { Project } from "@/types/project";
import { projectService } from "@/services/project.service";

interface ShareProjectDialogProps {
  projectId: string;
  projectName: string;
  project?: Project | null;
}

interface Collaborator {
  id: string;
  email: string;
  name?: string;
  role?: "owner" | "collaborator";
}

const ShareProjectDialog = ({ projectId, projectName, project }: ShareProjectDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const currentUser = authStorage.getUser();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadCollaborators();
    } else {
      setNewUserEmail("");
    }
  };

  const loadCollaborators = () => {
    const collaboratorsList: Collaborator[] = [];

    const ownerId = project?.userId;
    const ownerInfo = project?.user;
    const currentUserId = currentUser?._id;

    const isOwner = currentUser && ownerId && currentUserId === ownerId;

    if (ownerInfo) {
      const owner: Collaborator = {
        id: ownerInfo.id || ownerInfo._id || ownerId || '',
        email: ownerInfo.email || '',
        name: ownerInfo.name,
        role: "owner",
      };
      collaboratorsList.push(owner);
    } else if (isOwner && currentUser) {
      const owner: Collaborator = {
        id: currentUser._id,
        email: currentUser.email,
        name: currentUser.name,
        role: "owner",
      };
      collaboratorsList.push(owner);
    } else if (ownerId && currentUser && currentUserId !== ownerId) {
      const owner: Collaborator = {
        id: ownerId,
        email: "Owner",
        name: "Project Owner",
        role: "owner",
      };
      collaboratorsList.push(owner);
    }

    if (currentUser && !isOwner) {
      const currentUserCollaborator: Collaborator = {
        id: currentUser._id,
        email: currentUser.email,
        name: currentUser.name,
        role: "collaborator",
      };
      collaboratorsList.push(currentUserCollaborator);
    }

    setCollaborators(collaboratorsList);

  };

  const handleAddCollaborator = async () => {
    if (!newUserEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail.trim())) {
      return;
    }

    if (collaborators.some(c => c.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      return;
    }

    setIsAdding(true);
    try {
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        email: newUserEmail.trim(),
        role: "collaborator",
      };
      
      setCollaborators(prev => [...prev, newCollaborator]);
      setNewUserEmail("");
    } catch (error) {
      console.error("Error adding collaborator:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    if (collaborator?.role === "owner") {
      return;
    }

    try {
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    } catch (error) {
      console.error("Error removing collaborator:", error);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 font-semibold group"
        >
          <Share2 className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Project
          </DialogTitle>
          <DialogDescription>
            Share "{projectName}" with team members. Collaborators can view and edit project features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-email">Add Collaborator</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user-email"
                  type="email"
                  placeholder="Enter email address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCollaborator();
                    }
                  }}
                  className="pl-9"
                  disabled={isAdding}
                />
              </div>
              <Button
                onClick={handleAddCollaborator}
                disabled={isAdding || !newUserEmail.trim()}
                className="gap-2 shadow-md hover:shadow-lg"
              >
                <UserPlus className="h-4 w-4" />
                {isAdding ? "Adding..." : "Add"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the email address of the user you want to share this project with.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-semibold">
                Collaborators ({collaborators.length})
              </Label>
            </div>
            
            {collaborators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No collaborators yet. Add team members to share this project.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(collaborator.name, collaborator.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {collaborator.name || collaborator.email}
                          </p>
                          {collaborator.role === "owner" && (
                            <Badge variant="default" className="text-xs">
                              Owner
                            </Badge>
                          )}
                          {collaborator.role === "collaborator" && (
                            <Badge variant="secondary" className="text-xs">
                              Collaborator
                            </Badge>
                          )}
                        </div>
                        {collaborator.name && (
                          <p className="text-sm text-muted-foreground truncate">
                            {collaborator.email}
                          </p>
                        )}
                      </div>
                    </div>
                    {collaborator.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Remove collaborator"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">Note:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Collaborators can view and edit all project features</li>
              <li>Only the project owner can remove collaborators</li>
              <li>Users must have an account to be added as collaborators</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProjectDialog;

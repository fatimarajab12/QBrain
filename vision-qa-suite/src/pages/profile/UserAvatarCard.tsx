// pages/profile/components/UserAvatarCard.tsx
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types/user";
import { getInitials } from "@/utils/user-helpers";
import { userService } from "@/services/user.service";
import { useToast } from "@/hooks/use-toast";

interface UserAvatarCardProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const UserAvatarCard = ({ user, onUserUpdate }: UserAvatarCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const avatarUrl = await userService.uploadAvatar(file);
      onUserUpdate({ ...user, avatar: avatarUrl });
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <Card className="shadow-soft border-border">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-2 border-border">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback className="text-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                {getInitials(user)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-bold text-lg">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          
          <Badge className="bg-accent/10 text-accent border-accent/20">
            {user.role}
          </Badge>

          <div className="w-full space-y-2">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isUploading}
            />
            <label htmlFor="avatar-upload">
              <Button 
                variant="outline" 
                className="w-full cursor-pointer" 
                disabled={isUploading}
                asChild
              >
                <span>
                  {isUploading ? "Uploading..." : "Change Avatar"}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAvatarCard;
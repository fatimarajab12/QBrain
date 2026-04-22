import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";
import { validateEmail } from "@/utils/user-helpers";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfoTabProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onSave: (userData: Partial<User>) => void;
}

const PersonalInfoTab = ({ user, onUserUpdate, onSave }: PersonalInfoTabProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    // Validation
    if (!user.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(user.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: user.name,
        email: user.email,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof User, value: string) => {
    onUserUpdate({ ...user, [field]: value });
  };

  return (
    <Card className="shadow-soft border-border">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={user.name}
            onChange={e => updateField('name', e.target.value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            onChange={e => updateField('email', e.target.value)}
            disabled={isSaving}
          />
          {user.email !== user.email && (
            <p className="text-xs text-muted-foreground">
              Changing your email will require verification
            </p>
          )}
        </div>
        
        <Button 
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoTab;

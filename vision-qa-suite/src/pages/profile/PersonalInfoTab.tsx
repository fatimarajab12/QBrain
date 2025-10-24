// pages/profile/components/PersonalInfoTab.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";
import { validateEmail, validatePhone } from "@/utils/user-helpers";
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
    if (!user.firstName.trim() || !user.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
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

    if (user.phone && !validatePhone(user.phone)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
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
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={user.firstName}
              onChange={e => updateField('firstName', e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={user.lastName}
              onChange={e => updateField('lastName', e.target.value)}
              disabled={isSaving}
            />
          </div>
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
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={user.phone || ''}
            onChange={e => updateField('phone', e.target.value)}
            disabled={isSaving}
          />
        </div>
        
        <Button 
          className="gradient-primary" 
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
// pages/Profile.tsx
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useUserProfile } from "../hooks/useUserProfile";
import UserAvatarCard from "./profile/UserAvatarCard";
import AccountInfoCard from "./profile/AccountInfoCard";
import PersonalInfoTab from "./profile/PersonalInfoTab";


const Profile = () => {
  const {
    user,
    isLoading,
    isSaving,
    updateUser,
    saveUserProfile,
    updatePassword,
  } = useUserProfile();

  if (isLoading || !user) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          <div className="flex items-center justify-center min-h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Avatar Card */}
          <UserAvatarCard 
            user={user} 
            onUserUpdate={updateUser}
          />

          {/* Account Info */}
          <div className="md:col-span-2">
            <AccountInfoCard user={user} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <PersonalInfoTab 
              user={user}
              onUserUpdate={updateUser}
              onSave={saveUserProfile}
            />
          </TabsContent>

        
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
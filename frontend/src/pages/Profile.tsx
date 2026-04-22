import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoading } from "@/components/ui/page-loading";
import { useUserProfile } from "../hooks/useUserProfile";
import UserAvatarCard from "./profile/UserAvatarCard";
import AccountInfoCard from "./profile/AccountInfoCard";
import PersonalInfoTab from "./profile/PersonalInfoTab";
import PasswordChangeTab from "./profile/PasswordChangeTab";


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
    return <PageLoading message="Loading profile..." />;
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
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <PersonalInfoTab 
              user={user}
              onUserUpdate={updateUser}
              onSave={saveUserProfile}
            />
          </TabsContent>

          {/* Password Change Tab */}
          <TabsContent value="password">
            <PasswordChangeTab 
              onPasswordUpdate={updatePassword}
              isSaving={isSaving}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

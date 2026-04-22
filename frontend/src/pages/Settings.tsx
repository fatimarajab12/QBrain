import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Monitor, Bell, Shield, Trash2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import PasswordChangeTab from "./profile/PasswordChangeTab";

const Settings = () => {
  const { user, updatePassword, isSaving } = useUserProfile();
  const { toast } = useToast();
  
  // Appearance settings
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [testCaseAlerts, setTestCaseAlerts] = useState(true);
  const [bugReports, setBugReports] = useState(true);
  
  
  // Privacy settings
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    
    // Remove existing dark class first
    document.documentElement.classList.remove("dark");
    
    // Apply theme
    if (newTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    } else {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
    
    // Save to localStorage
    localStorage.setItem("theme", newTheme);
    
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}`,
    });
  };

  const handleSaveNotifications = () => {
    // Save notification preferences to backend/localStorage
    localStorage.setItem("notifications", JSON.stringify({
      email: emailNotifications,
      projectUpdates,
      testCaseAlerts,
      bugReports,
    }));
    
    toast({
      title: "Settings Saved",
      description: "Notification preferences updated successfully",
    });
  };


  const handleSavePrivacy = () => {
    localStorage.setItem("privacy", JSON.stringify({
      shareAnalytics,
      publicProfile,
    }));
    
    toast({
      title: "Settings Saved",
      description: "Privacy settings updated successfully",
    });
  };


  const handleDeleteAccount = () => {
    // This should show a confirmation dialog
    toast({
      title: "Delete Account",
      description: "Account deletion feature coming soon",
      variant: "destructive",
    });
  };

  // Load saved settings on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      // Theme is already applied in main.tsx, but we ensure it's correct here
      if (savedTheme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", prefersDark);
      } else {
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      }
    } else {
      // If no theme is saved, default to system
      setTheme("system");
    }
    
    // Listen for system theme changes when theme is set to "system"
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
      if (currentTheme === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
    
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      const notif = JSON.parse(savedNotifications);
      setEmailNotifications(notif.email ?? true);
      setProjectUpdates(notif.projectUpdates ?? true);
      setTestCaseAlerts(notif.testCaseAlerts ?? true);
      setBugReports(notif.bugReports ?? true);
    }
    
    const savedPrivacy = localStorage.getItem("privacy");
    if (savedPrivacy) {
      const privacy = JSON.parse(savedPrivacy);
      setShareAnalytics(privacy.shareAnalytics ?? false);
      setPublicProfile(privacy.publicProfile ?? false);
    }
    
    // Cleanup listener on unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => handleThemeChange("light")}
                      className="flex-1"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => handleThemeChange("dark")}
                      className="flex-1"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => handleThemeChange("system")}
                      className="flex-1"
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about important updates
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when projects are updated
                    </p>
                  </div>
                  <Switch
                    checked={projectUpdates}
                    onCheckedChange={setProjectUpdates}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Case Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for test case status changes
                    </p>
                  </div>
                  <Switch
                    checked={testCaseAlerts}
                    onCheckedChange={setTestCaseAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bug Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new bug reports
                    </p>
                  </div>
                  <Switch
                    checked={bugReports}
                    onCheckedChange={setBugReports}
                  />
                </div>

                <Button onClick={handleSaveNotifications} className="w-full">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <PasswordChangeTab 
                onPasswordUpdate={updatePassword}
                isSaving={isSaving}
              />
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the platform by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={shareAnalytics}
                    onCheckedChange={setShareAnalytics}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to view your public profile
                    </p>
                  </div>
                  <Switch
                    checked={publicProfile}
                    onCheckedChange={setPublicProfile}
                  />
                </div>

                <Button onClick={handleSavePrivacy} className="w-full">
                  Save Privacy Settings
                </Button>

                <div className="pt-6 border-t">
                  <div className="space-y-2">
                    <Label className="text-destructive">Danger Zone</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                    <Button 
                      onClick={handleDeleteAccount} 
                      variant="destructive" 
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;


"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  User, Bell, Palette, Shield, Database, LogOut, Save, Upload, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { withAuthRequired } from "@/components/common/withAuth";
import { auth, storage } from "@/lib/firebase";
import { updateProfile as firebaseUpdateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
];

const refreshIntervals = [
  { value: 5, label: "5 seconds" },
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
];

function SettingsPageClientComponent() {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const { setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
  });

  const [preferences, setPreferences] = useState({
    theme: (user?.preferences?.theme || "system") as "light" | "dark" | "system",
    currency: user?.preferences?.currency || "USD",
    language: user?.preferences?.language || "en",
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
      priceAlerts: user?.preferences?.notifications?.priceAlerts ?? true,
      portfolioUpdates: user?.preferences?.notifications?.portfolioUpdates ?? true,
      newsUpdates: user?.preferences?.notifications?.newsUpdates ?? false,
      marketUpdates: user?.preferences?.notifications?.marketUpdates ?? true,
    },
    privacy: {
      showPortfolio: user?.preferences?.privacy?.showPortfolio ?? false,
      showHoldings: user?.preferences?.privacy?.showHoldings ?? false,
      analyticsOptIn: user?.preferences?.privacy?.analyticsOptIn ?? true,
    },
    display: {
      showTestnetData: user?.preferences?.display?.showTestnetData ?? false,
      compactMode: user?.preferences?.display?.compactMode ?? false,
      autoRefresh: user?.preferences?.display?.autoRefresh ?? true,
      refreshInterval: user?.preferences?.display?.refreshInterval ?? 30,
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      let photoURL = user?.photoURL || "";

      // Upload avatar if changed
      if (avatarFile && auth.currentUser) {
        const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, avatarFile);
        photoURL = await getDownloadURL(storageRef);
        await firebaseUpdateProfile(auth.currentUser, { photoURL });
      }

      // Update display name in Firebase Auth
      if (auth.currentUser && profileForm.displayName !== user?.displayName) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: profileForm.displayName,
        });
      }

      // Save preferences to your app's user store
      await updateProfile({
        displayName: profileForm.displayName,
        preferences,
      });

      setAvatarFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setPreferences((prev) => ({
      ...prev,
      theme: newTheme as "light" | "dark" | "system",
    }));
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user?.email) return;
    setIsDeleting(true);
    try {
      // Re-authenticate before deleting
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await deleteUser(auth.currentUser);
      toast.success("Account deleted");
      await logout();
    } catch (error: any) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        toast.error("Incorrect password");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
      console.error("Delete account error:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletePassword("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="simplified" isMobileMenuOpen={sidebarOpen} setIsMobileMenuOpen={setSidebarOpen} />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="simplified" isMobileMenuOpen={sidebarOpen} setIsMobileMenuOpen={setSidebarOpen} />
      <div className="container mx-auto px-4">
        <div className="w-full max-w-[1536px] mx-auto flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-5 space-y-6 overflow-x-hidden max-w-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
              </div>
              <Button onClick={handleProfileUpdate} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Advanced</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information and profile photo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={avatarPreview || user?.photoURL || ""}
                          alt={user?.displayName || ""}
                        />
                        <AvatarFallback className="text-xl">
                          {user?.displayName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                          <Upload className="h-4 w-4 mr-2" />
                          Change Avatar
                        </Button>
                        <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                        {avatarFile && (
                          <p className="text-xs text-green-600 mt-1">✓ {avatarFile.name} selected — click Save Changes to apply</p>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profileForm.displayName}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profileForm.email} disabled />
                        <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Choose your preferred color theme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {["light", "dark", "system"].map((theme) => (
                        <div
                          key={theme}
                          className={cn(
                            "cursor-pointer rounded-lg border-2 p-4 text-center transition-colors",
                            preferences.theme === theme
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          )}
                          onClick={() => handleThemeChange(theme)}
                        >
                          <div className="text-2xl mb-1">
                            {theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻"}
                          </div>
                          <div className="text-sm font-medium capitalize">{theme}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>Customize how information is displayed</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base Currency</Label>
                        <Select
                          value={preferences.currency}
                          onValueChange={(value) =>
                            setPreferences((prev) => ({ ...prev, currency: value }))
                          }
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {currencies.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select
                          value={preferences.language}
                          onValueChange={(value) =>
                            setPreferences((prev) => ({ ...prev, language: value }))
                          }
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {languages.map((l) => (
                              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Control how and when you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: "priceAlerts", label: "Price Alerts", desc: "Get notified when price targets are reached" },
                      { key: "portfolioUpdates", label: "Portfolio Updates", desc: "Daily summary of your portfolio performance" },
                      { key: "marketUpdates", label: "Market Updates", desc: "Major market movements and news" },
                      { key: "newsUpdates", label: "News Updates", desc: "Latest crypto news and announcements" },
                      { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                      { key: "push", label: "Push Notifications", desc: "Receive push notifications in your browser" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label>{label}</Label>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                          checked={preferences.notifications[key as keyof typeof preferences.notifications]}
                          onCheckedChange={(checked) =>
                            setPreferences((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, [key]: checked },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your privacy and data sharing preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: "showPortfolio", label: "Show Portfolio", desc: "Make your portfolio visible to others" },
                      { key: "showHoldings", label: "Show Holdings", desc: "Show individual coin holdings publicly" },
                      { key: "analyticsOptIn", label: "Analytics Opt-in", desc: "Help improve the service by sharing usage data" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label>{label}</Label>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                          checked={preferences.privacy[key as keyof typeof preferences.privacy]}
                          onCheckedChange={(checked) =>
                            setPreferences((prev) => ({
                              ...prev,
                              privacy: { ...prev.privacy, [key]: checked },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data & Refresh</CardTitle>
                    <CardDescription>Advanced configuration options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Refresh</Label>
                        <p className="text-sm text-muted-foreground">Automatically refresh market data</p>
                      </div>
                      <Switch
                        checked={preferences.display.autoRefresh}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            display: { ...prev.display, autoRefresh: checked },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Refresh Interval</Label>
                      <Select
                        value={preferences.display.refreshInterval.toString()}
                        onValueChange={(value) =>
                          setPreferences((prev) => ({
                            ...prev,
                            display: { ...prev.display, refreshInterval: parseInt(value) },
                          }))
                        }
                        disabled={!preferences.display.autoRefresh}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {refreshIntervals.map((i) => (
                            <SelectItem key={i.value} value={i.value.toString()}>{i.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>These actions are permanent and cannot be undone</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Permanently deletes your account, portfolio, watchlists, and all data.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enter your password to confirm</Label>
              <Input
                type="password"
                placeholder="Your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={!deletePassword || isDeleting}
                className="flex-1"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowDeleteDialog(false); setDeletePassword(""); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const SettingsPageClient = withAuthRequired(SettingsPageClientComponent);
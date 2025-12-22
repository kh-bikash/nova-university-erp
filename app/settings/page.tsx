"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

export default function SettingsPage() {
    const { user } = useAuth()

    return (
        <ProtectedRoute>
            <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account and system preferences</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                        {user?.role === "admin" && <TabsTrigger value="system">System Settings</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="profile">
                        <ProfileSettings />
                    </TabsContent>

                    <TabsContent value="appearance">
                        <AppearanceSettings />
                    </TabsContent>

                    {user?.role === "admin" && (
                        <TabsContent value="system">
                            <SystemSettings />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </ProtectedRoute>
    )
}

function ProfileSettings() {
    const { user, refreshUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<any>({})
    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/settings/profile")
            if (res.ok) {
                const json = await res.json()
                if (json.success) setProfile(json.data)
            }
        } catch (error) {
            console.error("Failed to fetch profile")
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0])
            // Preview
            const reader = new FileReader()
            reader.onload = (ev) => {
                setProfile((prev: any) => ({ ...prev, avatar_url: ev.target?.result }))
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            let avatarUrl = profile.avatar_url

            // 1. Upload Avatar if changed
            if (avatarFile) {
                const formData = new FormData()
                formData.append('file', avatarFile)
                const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
                const upJson = await upRes.json()
                if (upJson.success) {
                    avatarUrl = upJson.url
                } else {
                    toast.error("Failed to upload image")
                    setSaving(false)
                    return
                }
            }

            // 2. Update Profile
            const res = await fetch("/api/settings/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: profile.full_name,
                    email: profile.email,
                    phone_number: profile.phone_number,
                    address: profile.address,
                    avatar_url: avatarUrl
                }),
            })

            if (res.ok) {
                toast.success("Profile updated successfully")
                await refreshUser()
                await fetchProfile() // Refresh data from server
                // Force reload/re-auth might be needed to update context if avatar is in session?
                // For now, local state update is enough visual feedback.
            } else {
                toast.error("Failed to update profile")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and photo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border bg-muted">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                                {profile.full_name?.[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                                Change Photo
                            </div>
                            <Input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input
                            value={profile.full_name || ''}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                            value={profile.email || ''}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone Number</Label>
                        <Input
                            value={profile.phone_number || ''}
                            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                            placeholder="+1 234 567 890"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Address</Label>
                        <Input
                            value={profile.address || ''}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            placeholder="Current Address"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    )
}

import { useTheme } from "next-themes"

function AppearanceSettings() {
    const { setTheme, theme } = useTheme()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <div className="text-sm text-muted-foreground">Enable dark mode for the interface</div>
                    </div>
                    <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        aria-label="Dark mode toggle"
                    />
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="space-y-0.5">
                        <Label>System Theme</Label>
                        <div className="text-sm text-muted-foreground">Use system preference</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setTheme('system')}>
                        Reset to System
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function SystemSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        current_academic_year: "",
        current_semester: "",
        registration_open: "false",
        university_name: "",
        contact_email: ""
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings/system")
            if (res.ok) {
                const data = await res.json()
                if (data.success && data.data) {
                    setSettings(prev => ({ ...prev, ...data.data }))
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error)
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/settings/system", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings }),
            })

            if (res.ok) {
                toast.success("System settings updated")
            } else {
                throw new Error("Failed to update")
            }
        } catch (error) {
            console.error("Failed to save settings:", error)
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage global system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="academic_year">Academic Year</Label>
                        <Input
                            id="academic_year"
                            value={settings.current_academic_year}
                            onChange={(e) => setSettings({ ...settings, current_academic_year: e.target.value })}
                            placeholder="e.g. 2023-2024"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="semester">Current Semester</Label>
                        <Select
                            value={settings.current_semester}
                            onValueChange={(val) => setSettings({ ...settings, current_semester: val })}
                        >
                            <SelectTrigger id="semester">
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="university_name">University Name</Label>
                        <Input
                            id="university_name"
                            value={settings.university_name}
                            onChange={(e) => setSettings({ ...settings, university_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact_email">Contact Email</Label>
                        <Input
                            id="contact_email"
                            value={settings.contact_email}
                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="reg_open">Course Registration</Label>
                        <div className="text-sm text-muted-foreground">
                            Enable or disable student course registration
                        </div>
                    </div>
                    <Switch
                        id="reg_open"
                        checked={settings.registration_open === "true"}
                        onCheckedChange={(checked) => setSettings({ ...settings, registration_open: String(checked) })}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border pt-6">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    )
}

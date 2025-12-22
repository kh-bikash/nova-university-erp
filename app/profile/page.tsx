"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, FileText, Upload, Shield, Mail, Phone, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function ProfilePage() {
    const { user } = useAuth()

    if (!user) return null

    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    )
}

function ProfileContent() {
    const { user } = useAuth()
    const toast = useToast()
    const [documents, setDocuments] = useState<any[]>([])
    const [loadingDocs, setLoadingDocs] = useState(true)
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [uploadForm, setUploadForm] = useState({
        title: "",
        type: "resume",
        file: null as File | null
    })

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents')
            if (res.ok) {
                setDocuments(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch documents", error)
        } finally {
            setLoadingDocs(false)
        }
    }

    const handleUpload = async () => {
        if (!uploadForm.file || !uploadForm.title) {
            toast.toast({ title: "Error", description: "Please select a file and enter a title", variant: "destructive" })
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', uploadForm.file)
            formData.append('title', uploadForm.title)
            formData.append('type', uploadForm.type)

            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                toast.toast({ title: "Success", description: "Document uploaded successfully" })
                setIsUploadOpen(false)
                setUploadForm({ title: "", type: "resume", file: null })
                fetchDocuments()
            } else {
                toast.toast({ title: "Error", description: "Failed to upload document", variant: "destructive" })
            }
        } catch (error) {
            console.error("Upload error", error)
            toast.toast({ title: "Error", description: "Failed to upload document", variant: "destructive" })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your account and documents</p>
            </div>

            <Tabs defaultValue="info" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="info">Personal Info</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                    <Card className="p-8 border border-border/50 max-w-3xl">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-background shadow-xl">
                                <User size={64} />
                            </div>
                            <div className="flex-1 space-y-6 w-full">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-muted-foreground">Full Name</Label>
                                        <div className="font-medium text-lg">{user?.full_name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Email</Label>
                                        <div className="font-medium text-lg flex items-center gap-2">
                                            <Mail size={16} className="text-muted-foreground" /> {user?.email}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Role</Label>
                                        <div className="font-medium text-lg capitalize flex items-center gap-2">
                                            <Shield size={16} className="text-muted-foreground" /> {user?.role}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Status</Label>
                                        <div className="font-medium text-lg text-green-600 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-600 rounded-full" /> Active
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <h3 className="font-bold mb-4">Contact Information</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-muted-foreground">Phone</Label>
                                            <div className="font-medium flex items-center gap-2">
                                                <Phone size={16} className="text-muted-foreground" /> +91 98765 43210
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Address</Label>
                                            <div className="font-medium flex items-center gap-2">
                                                <MapPin size={16} className="text-muted-foreground" /> Mumbai, India
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">My Documents</h2>
                        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Upload size={16} /> Upload Document
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload Document</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label>Document Title</Label>
                                        <Input
                                            value={uploadForm.title}
                                            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                            placeholder="e.g. Semester 1 Marksheet"
                                        />
                                    </div>
                                    <div>
                                        <Label>Document Type</Label>
                                        <Select
                                            value={uploadForm.type}
                                            onValueChange={(val) => setUploadForm({ ...uploadForm, type: val })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="resume">Resume/CV</SelectItem>
                                                <SelectItem value="transcript">Transcript/Marksheet</SelectItem>
                                                <SelectItem value="id_proof">ID Proof</SelectItem>
                                                <SelectItem value="certificate">Certificate</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>File</Label>
                                        <Input
                                            type="file"
                                            onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                                        <Button onClick={handleUpload} disabled={uploading}>
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.length === 0 && !loadingDocs ? (
                            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                No documents uploaded yet.
                            </div>
                        ) : (
                            documents.map(doc => (
                                <Card key={doc.id} className="p-6 border border-border/50 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded text-primary">
                                            <FileText size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-foreground truncate">{doc.title}</h3>
                                            <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                Uploaded: {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                                            </div>
                                            <div className="mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                        doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

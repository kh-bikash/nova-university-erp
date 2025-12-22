"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function StudentServicesPage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <StudentServicesContent />
        </ProtectedRoute>
    )
}

function StudentServicesContent() {
    const toast = useToast()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [reqForm, setReqForm] = useState({ service_type: "bonafide", description: "" })
    const [isReqDialogOpen, setIsReqDialogOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const res = await fetch('/api/services/requests')
            if (res.ok) setRequests(await res.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateRequest = async () => {
        try {
            const res = await fetch('/api/services/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqForm)
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Request submitted" })
                setIsReqDialogOpen(false)
                setReqForm({ service_type: "bonafide", description: "" })
                fetchData()
            } else {
                const data = await res.json()
                toast.toast({ title: "Error", description: data.error, variant: "destructive" })
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to submit", variant: "destructive" })
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Student Services</h1>
                    <p className="text-muted-foreground mt-1">Request certificates and ID cards</p>
                </div>
                <Dialog open={isReqDialogOpen} onOpenChange={setIsReqDialogOpen}>
                    <DialogTrigger asChild><Button><FileText size={16} className="mr-2" /> New Request</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>New Service Request</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Service Type</Label>
                                <Select value={reqForm.service_type} onValueChange={v => setReqForm({ ...reqForm, service_type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                                        <SelectItem value="transfer_certificate">Transfer Certificate</SelectItem>
                                        <SelectItem value="id_card">ID Card Replacement</SelectItem>
                                        <SelectItem value="transcript">Transcript</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Description / Reason</Label>
                                <Textarea
                                    value={reqForm.description}
                                    onChange={e => setReqForm({ ...reqForm, description: e.target.value })}
                                    placeholder="e.g., Applying for passport, Lost ID card..."
                                />
                            </div>
                            <Button onClick={handleCreateRequest}>Submit Request</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No active requests. Click "New Request" to start.
                    </Card>
                ) : (
                    requests.map(req => (
                        <Card key={req.id} className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg capitalize flex items-center gap-2">
                                        <FileText size={20} className="text-primary" /> {req.service_type.replace('_', ' ')}
                                    </h3>
                                    <p className="text-muted-foreground mt-1">{req.description}</p>
                                    {req.admin_remarks && (
                                        <p className="text-sm mt-2 text-orange-600 bg-orange-50 p-2 rounded">
                                            <strong>Admin Remarks:</strong> {req.admin_remarks}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {req.status.toUpperCase()}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {format(new Date(req.request_date), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

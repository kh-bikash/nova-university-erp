"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function AdminServicesPage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminServicesContent />
        </ProtectedRoute>
    )
}

function AdminServicesContent() {
    const toast = useToast()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [updateForm, setUpdateForm] = useState({ id: "", status: "", admin_remarks: "" })
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

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

    const handleUpdateStatus = async () => {
        try {
            const res = await fetch('/api/services/requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateForm)
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Request updated" })
                setIsUpdateDialogOpen(false)
                fetchData()
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to update", variant: "destructive" })
        }
    }

    const openUpdateDialog = (req: any) => {
        setUpdateForm({ id: req.id, status: req.status, admin_remarks: req.admin_remarks || "" })
        setIsUpdateDialogOpen(true)
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Student Services</h1>
                    <p className="text-muted-foreground mt-1">Manage certificate and ID card requests</p>
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Service Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="font-medium">{req.student_name}</div>
                                    <div className="text-xs text-muted-foreground">{req.enrollment_number}</div>
                                </TableCell>
                                <TableCell className="capitalize">{req.service_type.replace('_', ' ')}</TableCell>
                                <TableCell className="max-w-xs truncate">{req.description}</TableCell>
                                <TableCell>{format(new Date(req.request_date), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {req.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Button size="sm" variant="outline" onClick={() => openUpdateDialog(req)}>
                                        Update
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Update Request Status</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Status</Label>
                            <Select value={updateForm.status} onValueChange={v => setUpdateForm({ ...updateForm, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Remarks</Label>
                            <Input value={updateForm.admin_remarks} onChange={e => setUpdateForm({ ...updateForm, admin_remarks: e.target.value })} />
                        </div>
                        <Button onClick={handleUpdateStatus}>Update</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

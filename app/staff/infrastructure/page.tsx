"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function InfrastructurePage() {
    return <ProtectedRoute><InfraContent /></ProtectedRoute>
}

function InfraContent() {
    const [requests, setRequests] = useState<any[]>([])
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const res = await fetch('/api/staff/infrastructure')
        if (res.ok) setRequests(await res.json())
    }

    async function updateStatus(id: string, status: string) {
        const res = await fetch('/api/staff/infrastructure', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        })
        if (res.ok) {
            toast({ title: "Status Updated" })
            loadData()
        }
    }

    const getPriorityColor = (p: string) => {
        if (p === 'urgent') return "destructive"
        if (p === 'high') return "orange" // standard badges don't have orange, use outline or custom class
        return "secondary"
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Infrastructure Management</h1>
                <p className="text-muted-foreground">Manage maintenance and service requests.</p>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Requester</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">No requests found</TableCell></TableRow> :
                            requests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium">{req.title}</div>
                                        <div className="text-xs text-muted-foreground">{req.description}</div>
                                    </TableCell>
                                    <TableCell>{req.location}</TableCell>
                                    <TableCell><Badge variant={req.priority === 'urgent' ? 'destructive' : 'outline'}>{req.priority}</Badge></TableCell>
                                    <TableCell>
                                        <Select defaultValue={req.status} onValueChange={(v) => updateStatus(req.id, v)}>
                                            <SelectTrigger className="w-[130px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>{req.requester_name || 'Unknown'}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

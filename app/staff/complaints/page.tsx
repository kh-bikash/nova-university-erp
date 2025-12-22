"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ComplaintsPage() {
    return <ProtectedRoute><ComplaintsContent /></ProtectedRoute>
}

function ComplaintsContent() {
    const [complaints, setComplaints] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const res = await fetch('/api/staff/complaints')
        if (res.ok) setComplaints(await res.json())
    }

    async function updateStatus(id: string, status: string) {
        await fetch('/api/staff/complaints', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        })
        loadData()
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">University Complaints</h1>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Start Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {complaints.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>{c.category}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{c.subject}</div>
                                    <div className="text-xs text-muted-foreground">{c.description}</div>
                                </TableCell>
                                <TableCell>
                                    <Select defaultValue={c.status} onValueChange={(v) => updateStatus(c.id, v)}>
                                        <SelectTrigger className="w-[120px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="resolving">Resolving</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function TransportPage() {
    return <ProtectedRoute><TransportContent /></ProtectedRoute>
}

function TransportContent() {
    const [vehicles, setVehicles] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/staff/transport').then(res => res.json()).then(setVehicles)
    }, [])

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Transport Fleet Management</h1>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle No</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center">No vehicles found</TableCell></TableRow> :
                            vehicles.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-bold">{v.vehicle_number}</TableCell>
                                    <TableCell>{v.type}</TableCell>
                                    <TableCell>{v.driver_name}</TableCell>
                                    <TableCell>{v.driver_contact}</TableCell>
                                    <TableCell>{v.route_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={v.status === 'active' ? 'default' : 'destructive'}>
                                            {v.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

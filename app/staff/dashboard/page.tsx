"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, Wrench, Package, ListTodo } from "lucide-react"

export default function StaffDashboard() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    )
}

function DashboardContent() {
    const { user } = useAuth()
    const [stats, setStats] = useState<any>({
        openComplaints: 0,
        openInfra: 0,
        lowStock: 0,
        myTasks: 0
    })

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/api/staff/dashboard')
                if (res.ok) setStats(await res.json())
            } catch (e) {
                console.error(e)
            }
        }
        loadData()
    }, [])

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
                <p className="text-muted-foreground mt-2">Welcome back, {user?.full_name}. Here is your operations overview.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Open Complaints</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={24} />
                            <span className="text-3xl font-bold">{stats.openComplaints}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Infra Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Wrench className="text-blue-500" size={24} />
                            <span className="text-3xl font-bold">{stats.openInfra}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Pending maintenance</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Package className="text-orange-500" size={24} />
                            <span className="text-3xl font-bold">{stats.lowStock}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Inventory alert</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">My Active Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <ListTodo className="text-green-500" size={24} />
                            <span className="text-3xl font-bold">{stats.myTasks}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

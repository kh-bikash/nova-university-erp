"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  entity: string
  entity_id: string
  changes: string
  ip_address: string
  status: "success" | "failure"
}

const mockLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-11-20 14:30:22",
    user: "admin@novauniversity.edu",
    action: "CREATE",
    entity: "Department",
    entity_id: "CS-001",
    changes: "New department created",
    ip_address: "192.168.1.100",
    status: "success",
  },
  {
    id: "2",
    timestamp: "2024-11-20 14:25:15",
    user: "rajesh.kumar@novauniversity.edu",
    action: "UPDATE",
    entity: "Student",
    entity_id: "STU-2024-0001",
    changes: "Grade updated for CSE201",
    ip_address: "192.168.1.105",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2024-11-20 14:10:00",
    user: "priya.sharma@novauniversity.edu",
    action: "DELETE",
    entity: "Course",
    entity_id: "CSE-401",
    changes: "Course deleted",
    ip_address: "192.168.1.108",
    status: "success",
  },
  {
    id: "4",
    timestamp: "2024-11-20 13:45:30",
    user: "student123@novauniversity.edu",
    action: "LOGIN_FAILED",
    entity: "User",
    entity_id: "STU-123",
    changes: "Invalid password attempt",
    ip_address: "192.168.1.110",
    status: "failure",
  },
]

export default function AuditLogsPage() {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <ProtectedRoute>
      <AuditLogsContent />
    </ProtectedRoute>
  )
}

function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredLogs = logs.filter(
    (log) =>
      (searchTerm === "" ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterAction === "all" || log.action === filterAction) &&
      (filterStatus === "all" || log.status === filterStatus),
  )

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-600"
      case "UPDATE":
        return "bg-blue-600"
      case "DELETE":
        return "bg-red-600"
      case "LOGIN_FAILED":
        return "bg-orange-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">System activity and user action logs</p>
      </div>

      {/* Search and Filters */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 p-4 border border-border/50">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-muted-foreground" />
            <Input
              placeholder="Search by user or entity ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0"
            />
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <label className="text-sm font-medium text-foreground block mb-2">Action Type</label>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
            </SelectContent>
          </Select>
        </Card>
        <Card className="p-4 border border-border/50">
          <label className="text-sm font-medium text-foreground block mb-2">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Changes</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">{log.timestamp}</TableCell>
                <TableCell className="text-sm">{log.user}</TableCell>
                <TableCell>
                  <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                </TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell className="font-mono text-sm">{log.entity_id}</TableCell>
                <TableCell className="text-sm">{log.changes}</TableCell>
                <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                <TableCell>
                  <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Logs</p>
          <p className="text-3xl font-bold text-primary mt-2">{logs.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Successful Actions</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{logs.filter((l) => l.status === "success").length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Failed Actions</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{logs.filter((l) => l.status === "failure").length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Unique Users</p>
          <p className="text-3xl font-bold text-accent mt-2">{new Set(logs.map((l) => l.user)).size}</p>
        </Card>
      </div>
    </div>
  )
}

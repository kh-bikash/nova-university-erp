"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Clock, AlertCircle, CheckCircle } from "lucide-react"

const leaveRequests = [
  {
    id: "1",
    type: "Sick Leave",
    fromDate: "2024-09-20",
    toDate: "2024-09-21",
    reason: "Medical checkup",
    status: "approved",
    daysRequested: 2,
    approvedBy: "Dr. Rajesh Kumar",
  },
  {
    id: "2",
    type: "Casual Leave",
    fromDate: "2024-09-25",
    toDate: "2024-09-25",
    reason: "Family event",
    status: "pending",
    daysRequested: 1,
    approvedBy: null,
  },
  {
    id: "3",
    type: "Sick Leave",
    fromDate: "2024-09-10",
    toDate: "2024-09-10",
    reason: "Fever",
    status: "approved",
    daysRequested: 1,
    approvedBy: "Prof. Ananya Sharma",
  },
]

export default function LeaveManagementPage() {
  const { user } = useAuth()

  if (!user || !['student', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <LeaveManagementContent />
    </ProtectedRoute>
  )
}

function LeaveManagementContent() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: "casual",
    fromDate: "",
    toDate: "",
    reason: "",
  })

  const leaveBalance = {
    sick: 5,
    casual: 8,
    earned: 10,
  }

  const usedLeave = {
    sick: 3,
    casual: 2,
    earned: 0,
  }

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-50 text-green-700 border-green-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-yellow-50 text-yellow-700 border-yellow-200"
  }

  const getStatusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle size={16} />
    if (status === "rejected") return <AlertCircle size={16} />
    return <Clock size={16} />
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-2">Request and track leave applications</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus size={18} />
          New Leave Request
        </Button>
      </div>

      {/* Leave Balance */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { type: "Sick Leave", available: leaveBalance.sick, used: usedLeave.sick },
          { type: "Casual Leave", available: leaveBalance.casual, used: usedLeave.casual },
          { type: "Earned Leave", available: leaveBalance.earned, used: usedLeave.earned },
        ].map((leave, idx) => (
          <Card key={idx} className="p-6 border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">{leave.type}</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold text-foreground">{leave.available - leave.used}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <p className="text-sm text-muted-foreground">{leave.used} used</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Leave Request Form */}
      {showForm && (
        <Card className="p-6 border border-border/50 bg-card">
          <h3 className="font-semibold text-foreground mb-4">Apply for Leave</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Leave Type</label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(val) => setFormData({ ...formData, leaveType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="earned">Earned Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">From Date</label>
                <Input
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">To Date</label>
                <Input
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
              <Input
                placeholder="Enter reason for leave"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90">Submit Request</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Leave Requests History */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Leave Requests</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>From Date</TableHead>
                <TableHead>To Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.type}</TableCell>
                  <TableCell>{new Date(request.fromDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.toDate).toLocaleDateString()}</TableCell>
                  <TableCell>{request.daysRequested}</TableCell>
                  <TableCell className="text-muted-foreground">{request.reason}</TableCell>
                  <TableCell>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(request.status)} text-xs font-medium`}
                    >
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

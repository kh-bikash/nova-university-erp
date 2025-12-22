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
import { Plus, DollarSign, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function AdminFeesPage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminFeesContent />
        </ProtectedRoute>
    )
}

function AdminFeesContent() {
    const toast = useToast()
    const [fees, setFees] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        student_id: "",
        academic_year: "2024-2025",
        tuition_fee: "0",
        hostel_fee: "0",
        lab_fee: "0",
        exam_fee: "0",
        other_fee: "0",
        due_date: ""
    })

    useEffect(() => {
        async function fetchData() {
            try {
                const [fRes, sRes] = await Promise.all([
                    fetch('/api/fees'),
                    fetch('/api/students')
                ])

                if (fRes.ok) setFees(await fRes.json())
                if (sRes.ok) setStudents(await sRes.json())
            } catch (error) {
                console.error("Failed to fetch data", error)
                toast.toast({ title: "Error", description: "Failed to load fee data", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleAssign = async () => {
        if (!formData.student_id || !formData.due_date) {
            toast.toast({ title: "Error", description: "Please select student and due date", variant: "destructive" })
            return
        }

        try {
            const res = await fetch('/api/fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                toast.toast({ title: "Success", description: "Fee assigned successfully" })
                setFees([data, ...fees]) // Note: data won't have student_name join immediately without refetch or complex logic, but simple append works for ID
                // Ideally we refetch or manually enrich
                const student = students.find(s => s.id === formData.student_id)
                const enrichedData = { ...data, student_name: student?.full_name || 'Unknown', enrollment_number: student?.enrollment_number }
                setFees([enrichedData, ...fees])

                setIsDialogOpen(false)
                setFormData({
                    student_id: "",
                    academic_year: "2024-2025",
                    tuition_fee: "0",
                    hostel_fee: "0",
                    lab_fee: "0",
                    exam_fee: "0",
                    other_fee: "0",
                    due_date: ""
                })
            } else {
                toast.toast({ title: "Error", description: data.error || "Failed to assign fee", variant: "destructive" })
            }
        } catch (error) {
            console.error("Error assigning fee", error)
            toast.toast({ title: "Error", description: "Failed to assign fee", variant: "destructive" })
        }
    }

    const totalCollected = fees.reduce((acc, curr) => acc + Number(curr.paid_amount || 0), 0)
    const totalPending = fees.reduce((acc, curr) => acc + Number(curr.balance || 0), 0)

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Fee Management</h1>
                    <p className="text-muted-foreground mt-1">Track payments and assign fees</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={20} /> Assign Fee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Assign Fee to Student</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Student</Label>
                                    <Select
                                        value={formData.student_id}
                                        onValueChange={(val) => setFormData({ ...formData, student_id: val })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.enrollment_number} - {s.full_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Academic Year</Label>
                                    <Select
                                        value={formData.academic_year}
                                        onValueChange={(val) => setFormData({ ...formData, academic_year: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                                            <SelectItem value="2025-2026">2025-2026</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Tuition Fee</Label>
                                    <Input
                                        type="number"
                                        value={formData.tuition_fee}
                                        onChange={(e) => setFormData({ ...formData, tuition_fee: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Hostel Fee</Label>
                                    <Input
                                        type="number"
                                        value={formData.hostel_fee}
                                        onChange={(e) => setFormData({ ...formData, hostel_fee: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Lab/Exam Fee</Label>
                                    <Input
                                        type="number"
                                        value={formData.lab_fee}
                                        onChange={(e) => setFormData({ ...formData, lab_fee: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAssign}>Assign</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-green-50 border-green-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-700">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-green-700 font-medium">Total Collected</p>
                            <h2 className="text-2xl font-bold text-green-900">₹{totalCollected.toLocaleString()}</h2>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 bg-red-50 border-red-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full text-red-700">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-red-700 font-medium">Total Pending</p>
                            <h2 className="text-2xl font-bold text-red-900">₹{totalPending.toLocaleString()}</h2>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="border border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Total Fee</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No fee records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            fees.map((fee) => (
                                <TableRow key={fee.id}>
                                    <TableCell>
                                        <div className="font-medium">{fee.student_name}</div>
                                        <div className="text-xs text-muted-foreground">{fee.enrollment_number}</div>
                                    </TableCell>
                                    <TableCell>{fee.academic_year}</TableCell>
                                    <TableCell>₹{Number(fee.total_fee).toLocaleString()}</TableCell>
                                    <TableCell className="text-green-600">₹{Number(fee.paid_amount).toLocaleString()}</TableCell>
                                    <TableCell className="text-red-600 font-medium">₹{Number(fee.balance).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                fee.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell>{format(new Date(fee.due_date), 'MMM d, yyyy')}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, GraduationCap } from "lucide-react"

interface Student {
    id: string
    full_name: string
    email: string
    enrollment_number: string
    department_name: string
    semester: number
    phone_number: string
    address: string
}

function StudentManagementContent() {
    const [students, setStudents] = useState<Student[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        enrollment_number: "",
        department_id: "",
        semester: "1",
        phone_number: "",
        address: "",
        father_name: "",
        father_contact: "",
    })

    useEffect(() => {
        fetchStudents()
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments')
            if (res.ok) {
                setDepartments(await res.json())
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error)
        }
    }

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students')
            if (res.ok) {
                const data = await res.json()
                setStudents(data)
            }
        } catch (error) {
            console.error('Failed to fetch students:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredStudents = students.filter(
        (s) =>
            s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAdd = async () => {
        if (formData.full_name && formData.email && formData.enrollment_number) {
            try {
                const res = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        password: 'password123', // Default password
                        semester: parseInt(formData.semester),
                    }),
                })

                if (res.ok) {
                    fetchStudents()
                    resetForm()
                    setIsOpen(false)
                }
            } catch (error) {
                console.error('Failed to create student:', error)
            }
        }
    }

    const handleEdit = (id: string) => {
        const s = students.find((x) => x.id === id)
        if (s) {
            // Find department ID from name if needed, but API returns department_name.
            // Ideally API should return department_id too.
            // Assuming we can find it or just use empty if not found.
            const dept = departments.find(d => d.name === s.department_name)

            setFormData({
                full_name: s.full_name,
                email: s.email,
                enrollment_number: s.enrollment_number,
                department_id: dept ? dept.id : "",
                semester: s.semester.toString(),
                phone_number: s.phone_number || "",
                address: s.address || "",
                father_name: "", // Not fetched in list view
                father_contact: "",
            })
            setEditingId(id)
            setIsOpen(true)
        }
    }

    const handleUpdate = async () => {
        if (editingId && formData.full_name && formData.email) {
            try {
                const res = await fetch('/api/students', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingId,
                        full_name: formData.full_name,
                        email: formData.email,
                        department_id: formData.department_id,
                        semester: parseInt(formData.semester),
                        address: formData.address,
                    }),
                })

                if (res.ok) {
                    fetchStudents()
                    resetForm()
                    setIsOpen(false)
                }
            } catch (error) {
                console.error('Failed to update student:', error)
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                const res = await fetch(`/api/students?id=${id}`, {
                    method: 'DELETE',
                })

                if (res.ok) {
                    fetchStudents()
                }
            } catch (error) {
                console.error('Failed to delete student:', error)
            }
        }
    }

    const resetForm = () => {
        setFormData({
            full_name: "",
            email: "",
            enrollment_number: "",
            department_id: "",
            semester: "1",
            phone_number: "",
            address: "",
            father_name: "",
            father_contact: "",
        })
        setEditingId(null)
    }

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading students...</div>
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
                    <p className="text-muted-foreground mt-1">Manage student records and enrollments</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => resetForm()} className="gap-2">
                            <Plus size={20} />
                            Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <GraduationCap size={20} />
                                {editingId ? "Edit Student" : "Add New Student"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Student Name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="student@novauniversity.edu"
                                        type="email"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="enrollment">Enrollment No. *</Label>
                                    <Input
                                        value={formData.enrollment_number}
                                        onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
                                        placeholder="210003xxxx"
                                        disabled={!!editingId}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dept">Department</Label>
                                    <Select
                                        value={formData.department_id}
                                        onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(d => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="semester">Semester</Label>
                                    <Select
                                        value={formData.semester}
                                        onValueChange={(value) => setFormData({ ...formData, semester: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        placeholder="+91-XXXXXXXXXX"
                                    />
                                </div>
                            </div>

                            {!editingId && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="father">Father's Name</Label>
                                        <Input
                                            value={formData.father_name}
                                            onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="fcontact">Father's Contact</Label>
                                        <Input
                                            value={formData.father_contact}
                                            onChange={(e) => setFormData({ ...formData, father_contact: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Full Address"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <Button variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={editingId ? handleUpdate : handleAdd}>{editingId ? "Update" : "Add"}</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="p-4 border border-border/50">
                <div className="flex items-center gap-2">
                    <Search size={20} className="text-muted-foreground" />
                    <Input
                        placeholder="Search students by name, enrollment no, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0"
                    />
                </div>
            </Card>

            {/* Students Table */}
            <Card className="border border-border/50 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Enrollment No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-center">Semester</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell className="font-mono font-medium">{s.enrollment_number}</TableCell>
                                <TableCell className="font-medium">{s.full_name}</TableCell>
                                <TableCell className="text-sm">{s.email}</TableCell>
                                <TableCell>{s.department_name}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline">{s.semester}</Badge>
                                </TableCell>
                                <TableCell className="text-sm">{s.phone_number}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(s.id)}>
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                                            <Trash2 size={16} className="text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

export default function AdminStudentsPage() {
    return (
        <ProtectedRoute>
            <StudentManagementContent />
        </ProtectedRoute>
    )
}

"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit2, Trash2, Search, Download, Mail, FileText } from "lucide-react"

interface Batch {
  id: string
  batch_name: string
  year_admitted: number
  department: string
  total_students: number
  active_students: number
  graduated_students: number
  status: "ongoing" | "completed"
  semester: number
}

const mockBatches: Batch[] = [
  {
    id: "1",
    batch_name: "CSE-2020",
    year_admitted: 2020,
    department: "Computer Science",
    total_students: 650,
    active_students: 600,
    graduated_students: 50,
    status: "ongoing",
    semester: 7,
  },
  {
    id: "2",
    batch_name: "CSE-2021",
    year_admitted: 2021,
    department: "Computer Science",
    total_students: 680,
    active_students: 670,
    graduated_students: 0,
    status: "ongoing",
    semester: 5,
  },
  {
    id: "3",
    batch_name: "CSE-2019",
    year_admitted: 2019,
    department: "Computer Science",
    total_students: 620,
    active_students: 0,
    graduated_students: 620,
    status: "completed",
    semester: 8,
  },
]

export default function BatchManagementPage() {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <ProtectedRoute>
      <BatchManagementContent />
    </ProtectedRoute>
  )
}

function BatchManagementContent() {
  const [batches, setBatches] = useState<Batch[]>(mockBatches)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    batch_name: "",
    year_admitted: "",
    department: "",
    total_students: "",
  })

  const filteredBatches = batches.filter(
    (batch) =>
      batch.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    if (formData.batch_name && formData.year_admitted) {
      const newBatch: Batch = {
        id: Date.now().toString(),
        batch_name: formData.batch_name,
        year_admitted: Number.parseInt(formData.year_admitted),
        department: formData.department,
        total_students: Number.parseInt(formData.total_students) || 0,
        active_students: Number.parseInt(formData.total_students) || 0,
        graduated_students: 0,
        status: "ongoing",
        semester: 1,
      }
      setBatches([...batches, newBatch])
      resetForm()
      setIsOpen(false)
    }
  }

  const handleEdit = (id: string) => {
    const batch = batches.find((b) => b.id === id)
    if (batch) {
      setFormData({
        batch_name: batch.batch_name,
        year_admitted: batch.year_admitted.toString(),
        department: batch.department,
        total_students: batch.total_students.toString(),
      })
      setEditingId(id)
      setIsOpen(true)
    }
  }

  const handleUpdate = () => {
    if (editingId && formData.batch_name) {
      setBatches(
        batches.map((batch) =>
          batch.id === editingId
            ? {
                ...batch,
                batch_name: formData.batch_name,
                year_admitted: Number.parseInt(formData.year_admitted),
                department: formData.department,
                total_students: Number.parseInt(formData.total_students) || 0,
              }
            : batch,
        ),
      )
      resetForm()
      setIsOpen(false)
    }
  }

  const handleDelete = (id: string) => {
    setBatches(batches.filter((batch) => batch.id !== id))
  }

  const toggleBatchSelection = (id: string) => {
    setSelectedBatches((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const resetForm = () => {
    setFormData({ batch_name: "", year_admitted: "", department: "", total_students: "" })
    setEditingId(null)
  }

  const handleBulkEmailStudents = () => {
    console.log("Sending emails to students in batches:", selectedBatches)
  }

  const handleBulkGenerateID = () => {
    console.log("Generating IDs for batches:", selectedBatches)
  }

  const handleExportBatch = () => {
    console.log("Exporting batch data:", selectedBatches)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Batch Management</h1>
          <p className="text-muted-foreground mt-1">Manage student batches and bulk operations</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus size={20} />
              Add Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Batch" : "Create New Batch"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchname">Batch Name</Label>
                  <Input
                    id="batchname"
                    value={formData.batch_name}
                    onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                    placeholder="e.g., CSE-2022"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year Admitted</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year_admitted}
                    onChange={(e) => setFormData({ ...formData, year_admitted: e.target.value })}
                    placeholder="2022"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dept">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger id="dept">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Civil">Civil Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="students">Total Students</Label>
                  <Input
                    id="students"
                    type="number"
                    value={formData.total_students}
                    onChange={(e) => setFormData({ ...formData, total_students: e.target.value })}
                    placeholder="Number of students"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingId ? handleUpdate : handleAdd}>{editingId ? "Update" : "Create"}</Button>
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
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0"
          />
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedBatches.length > 0 && (
        <Card className="p-4 border border-primary/50 bg-primary/5">
          <div className="flex justify-between items-center">
            <p className="font-medium text-foreground">{selectedBatches.length} batch(es) selected</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={handleBulkEmailStudents}>
                <Mail size={16} />
                Email Students
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={handleBulkGenerateID}>
                <FileText size={16} />
                Generate IDs
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={handleExportBatch}>
                <Download size={16} />
                Export Data
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedBatches([])}>
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Batches Table */}
      <Card className="border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedBatches.length === filteredBatches.length && filteredBatches.length > 0}
                  onCheckedChange={(checked) => setSelectedBatches(checked ? filteredBatches.map((b) => b.id) : [])}
                />
              </TableHead>
              <TableHead>Batch Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Year Admitted</TableHead>
              <TableHead className="text-right">Total Students</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead className="text-right">Graduated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedBatches.includes(batch.id)}
                    onCheckedChange={() => toggleBatchSelection(batch.id)}
                  />
                </TableCell>
                <TableCell className="font-bold">{batch.batch_name}</TableCell>
                <TableCell>{batch.department}</TableCell>
                <TableCell className="text-center">{batch.year_admitted}</TableCell>
                <TableCell className="text-right font-semibold">{batch.total_students}</TableCell>
                <TableCell className="text-right text-green-600">{batch.active_students}</TableCell>
                <TableCell className="text-right text-blue-600">{batch.graduated_students}</TableCell>
                <TableCell>
                  <Badge variant={batch.status === "ongoing" ? "default" : "secondary"}>{batch.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(batch.id)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(batch.id)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Statistics */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Batches</p>
          <p className="text-3xl font-bold text-primary mt-2">{batches.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Ongoing Batches</p>
          <p className="text-3xl font-bold text-accent mt-2">{batches.filter((b) => b.status === "ongoing").length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Enrolled</p>
          <p className="text-3xl font-bold text-secondary mt-2">
            {batches.reduce((sum, b) => sum + b.total_students, 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Currently Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {batches.reduce((sum, b) => sum + b.active_students, 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Graduated</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {batches.reduce((sum, b) => sum + b.graduated_students, 0).toLocaleString()}
          </p>
        </Card>
      </div>
    </div>
  )
}

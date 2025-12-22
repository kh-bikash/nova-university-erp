"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, Plus, CheckCircle, Clock } from "lucide-react"

interface Document {
  id: string
  name: string
  type: "bonafide" | "transcript" | "certificate" | "marksheet" | "other"
  status: "ready" | "processing" | "requested"
  requested_date: string
  issued_date?: string
  download_url?: string
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Bonafide Certificate",
    type: "bonafide",
    status: "ready",
    requested_date: "2024-11-15",
    issued_date: "2024-11-16",
    download_url: "#",
  },
  {
    id: "2",
    name: "Academic Transcript",
    type: "transcript",
    status: "processing",
    requested_date: "2024-11-18",
  },
  {
    id: "3",
    name: "Completion Certificate",
    type: "certificate",
    status: "ready",
    requested_date: "2024-11-10",
    issued_date: "2024-11-11",
    download_url: "#",
  },
  {
    id: "4",
    name: "Marksheet",
    type: "marksheet",
    status: "ready",
    requested_date: "2024-11-05",
    issued_date: "2024-11-06",
    download_url: "#",
  },
]

export default function DocumentsPage() {
  const { user } = useAuth()

  if (!user || !['student', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  )
}

function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")

  const handleRequestDocument = () => {
    if (selectedType) {
      const typeLabels: Record<string, string> = {
        bonafide: "Bonafide Certificate",
        transcript: "Academic Transcript",
        certificate: "Completion Certificate",
        marksheet: "Marksheet",
      }

      const newDoc: Document = {
        id: Date.now().toString(),
        name: typeLabels[selectedType] || selectedType,
        type: selectedType as any,
        status: "requested",
        requested_date: new Date().toISOString().split("T")[0],
      }
      setDocuments([...documents, newDoc])
      setSelectedType("")
      setIsOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <Badge className="bg-green-600 gap-1">
            <CheckCircle size={14} /> Ready
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-yellow-600 gap-1">
            <Clock size={14} /> Processing
          </Badge>
        )
      case "requested":
        return <Badge className="bg-blue-600">Requested</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      bonafide: "📋",
      transcript: "📊",
      certificate: "🏆",
      marksheet: "📝",
      other: "📄",
    }
    return icons[type] || "📄"
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents & Transcripts</h1>
          <p className="text-muted-foreground mt-1">Request and manage your academic documents</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Request Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Academic Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="doctype">Document Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="doctype">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                    <SelectItem value="transcript">Academic Transcript</SelectItem>
                    <SelectItem value="certificate">Completion Certificate</SelectItem>
                    <SelectItem value="marksheet">Marksheet</SelectItem>
                    <SelectItem value="other">Other Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purpose">Purpose of Request</Label>
                <Input id="purpose" placeholder="e.g., Higher Studies, Employment" />
              </div>
              <div className="pt-2 space-y-2 text-sm text-muted-foreground">
                <p>Processing time: 2-3 business days</p>
                <p>You will receive a notification when document is ready</p>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRequestDocument}>Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Requests</p>
          <p className="text-3xl font-bold text-primary mt-2">{documents.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Ready to Download</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {documents.filter((d) => d.status === "ready").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Processing</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {documents.filter((d) => d.status === "processing").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {documents.filter((d) => d.status === "requested").length}
          </p>
        </Card>
      </div>

      {/* Documents Table */}
      <Card className="border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <span className="text-2xl">{getDocumentIcon(doc.type)}</span>
                </TableCell>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell className="text-sm">{doc.requested_date}</TableCell>
                <TableCell className="text-sm">{doc.issued_date || "-"}</TableCell>
                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye size={16} />
                    </Button>
                    {doc.status === "ready" && (
                      <Button variant="ghost" size="sm">
                        <Download size={16} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Document Info */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Available Documents</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="border-b pb-3 border-border/50">
              <h4 className="font-medium text-foreground mb-1">Bonafide Certificate</h4>
              <p className="text-sm text-muted-foreground">Official certificate confirming your status as a student</p>
            </div>
            <div className="border-b pb-3 border-border/50">
              <h4 className="font-medium text-foreground mb-1">Academic Transcript</h4>
              <p className="text-sm text-muted-foreground">Complete record of your courses, grades, and GPA</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="border-b pb-3 border-border/50">
              <h4 className="font-medium text-foreground mb-1">Completion Certificate</h4>
              <p className="text-sm text-muted-foreground">Certificate issued upon successful course completion</p>
            </div>
            <div className="border-b pb-3 border-border/50">
              <h4 className="font-medium text-foreground mb-1">Marksheet</h4>
              <p className="text-sm text-muted-foreground">Detailed breakdown of marks for all subjects</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

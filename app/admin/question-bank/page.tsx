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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Search } from "lucide-react"

interface Question {
  id: string
  course_code: string
  question_text: string
  question_type: "mcq" | "short" | "long" | "numerical"
  difficulty: "easy" | "medium" | "hard"
  marks: number
  topic: string
  created_by: string
  created_date: string
}

const mockQuestions: Question[] = [
  {
    id: "1",
    course_code: "CS401",
    question_text: "What is the time complexity of merge sort?",
    question_type: "mcq",
    difficulty: "easy",
    marks: 1,
    topic: "Sorting Algorithms",
    created_by: "Dr. Rajesh Kumar",
    created_date: "2024-10-15",
  },
  {
    id: "2",
    course_code: "CS401",
    question_text: "Explain the concept of dynamic programming with examples.",
    question_type: "long",
    difficulty: "hard",
    marks: 5,
    topic: "Dynamic Programming",
    created_by: "Dr. Rajesh Kumar",
    created_date: "2024-10-20",
  },
]

export default function QuestionBankPage() {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <ProtectedRoute>
      <QuestionBankContent />
    </ProtectedRoute>
  )
}

function QuestionBankContent() {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    course_code: string
    question_text: string
    question_type: "mcq" | "short" | "long" | "numerical"
    difficulty: "easy" | "medium" | "hard"
    marks: string
    topic: string
  }>({
    course_code: "",
    question_text: "",
    question_type: "mcq",
    difficulty: "medium",
    marks: "",
    topic: "",
  })

  const filteredQuestions = questions.filter(
    (q) =>
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    if (formData.question_text && formData.course_code) {
      const newQuestion: Question = {
        id: Date.now().toString(),
        course_code: formData.course_code,
        question_text: formData.question_text,
        question_type: formData.question_type,
        difficulty: formData.difficulty,
        marks: Number.parseInt(formData.marks) || 1,
        topic: formData.topic,
        created_by: "Dr. Rajesh Kumar",
        created_date: new Date().toISOString().split("T")[0],
      }
      setQuestions([...questions, newQuestion])
      resetForm()
      setIsOpen(false)
    }
  }

  const handleEdit = (id: string) => {
    const q = questions.find((x) => x.id === id)
    if (q) {
      setFormData({
        course_code: q.course_code,
        question_text: q.question_text,
        question_type: q.question_type,
        difficulty: q.difficulty,
        marks: q.marks.toString(),
        topic: q.topic,
      })
      setEditingId(id)
      setIsOpen(true)
    }
  }

  const handleUpdate = () => {
    if (editingId && formData.question_text) {
      setQuestions(
        questions.map((q) =>
          q.id === editingId
            ? {
              ...q,
              course_code: formData.course_code,
              question_text: formData.question_text,
              question_type: formData.question_type,
              difficulty: formData.difficulty,
              marks: Number.parseInt(formData.marks) || 1,
              topic: formData.topic,
            }
            : q,
        ),
      )
      resetForm()
      setIsOpen(false)
    }
  }

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const resetForm = () => {
    setFormData({
      course_code: "",
      question_text: "",
      question_type: "mcq",
      difficulty: "medium",
      marks: "",
      topic: "",
    })
    setEditingId(null)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-600"
      case "medium":
        return "bg-yellow-600"
      case "hard":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
          <p className="text-muted-foreground mt-1">Manage examination questions and topics</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus size={20} />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Question" : "Add New Question"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course">Course Code</Label>
                  <Input
                    id="course"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    placeholder="e.g., CS401"
                  />
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Sorting Algorithms"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  placeholder="Enter the question"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value: any) => setFormData({ ...formData, question_type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ</SelectItem>
                      <SelectItem value="short">Short Answer</SelectItem>
                      <SelectItem value="long">Long Answer</SelectItem>
                      <SelectItem value="numerical">Numerical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                    placeholder="Marks"
                  />
                </div>
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
            placeholder="Search questions by text, course, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0"
          />
        </div>
      </Card>

      {/* Questions Table */}
      <Card className="border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-24">Type</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="w-16 text-center">Marks</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-mono font-bold">{q.course_code}</TableCell>
                <TableCell className="max-w-md truncate">{q.question_text}</TableCell>
                <TableCell>
                  <Badge variant="outline">{q.question_type.toUpperCase()}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                </TableCell>
                <TableCell className="text-center font-semibold">{q.marks}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{q.topic}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(q.id)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
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
          <p className="text-sm text-muted-foreground">Total Questions</p>
          <p className="text-3xl font-bold text-primary mt-2">{questions.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Easy</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {questions.filter((q) => q.difficulty === "easy").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Medium</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {questions.filter((q) => q.difficulty === "medium").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Hard</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {questions.filter((q) => q.difficulty === "hard").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Marks</p>
          <p className="text-3xl font-bold text-accent mt-2">{questions.reduce((sum, q) => sum + q.marks, 0)}</p>
        </Card>
      </div>
    </div>
  )
}

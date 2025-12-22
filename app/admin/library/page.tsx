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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, BookOpen, Search, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function AdminLibraryPage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminLibraryContent />
        </ProtectedRoute>
    )
}

function AdminLibraryContent() {
    const toast = useToast()
    const [books, setBooks] = useState<any[]>([])
    const [transactions, setTransactions] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Dialogs
    const [isBookDialogOpen, setIsBookDialogOpen] = useState(false)
    const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)

    // Forms
    const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "General", total_copies: "1", location: "" })
    const [issueForm, setIssueForm] = useState({ student_id: "", book_id: "" })
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [bRes, tRes, sRes] = await Promise.all([
                fetch('/api/library/books'),
                fetch('/api/library/transactions'),
                fetch('/api/students')
            ])

            if (bRes.ok) setBooks(await bRes.json())
            if (tRes.ok) setTransactions(await tRes.json())
            if (sRes.ok) setStudents(await sRes.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddBook = async () => {
        try {
            const res = await fetch('/api/library/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookForm)
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Book added" })
                setIsBookDialogOpen(false)
                fetchData()
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to add book", variant: "destructive" })
        }
    }

    const handleIssueBook = async () => {
        try {
            const res = await fetch('/api/library/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'issue', ...issueForm })
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Book issued" })
                setIsIssueDialogOpen(false)
                fetchData()
            } else {
                const data = await res.json()
                toast.toast({ title: "Error", description: data.error, variant: "destructive" })
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to issue book", variant: "destructive" })
        }
    }

    const handleReturnBook = async (txId: string) => {
        try {
            const res = await fetch('/api/library/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'return', transaction_id: txId })
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Book returned" })
                fetchData()
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to return book", variant: "destructive" })
        }
    }

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Library Management</h1>
                    <p className="text-muted-foreground mt-1">Manage catalog and circulation</p>
                </div>
            </div>

            <Tabs defaultValue="books" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="books">Books Catalog</TabsTrigger>
                    <TabsTrigger value="circulation">Circulation (Issue/Return)</TabsTrigger>
                </TabsList>

                <TabsContent value="books" className="space-y-4">
                    <div className="flex justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search books..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
                            <DialogTrigger asChild><Button><Plus size={16} className="mr-2" /> Add Book</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add New Book</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div><Label>Title</Label><Input value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} /></div>
                                    <div><Label>Author</Label><Input value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>ISBN</Label><Input value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} /></div>
                                        <div><Label>Category</Label><Input value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>Total Copies</Label><Input type="number" value={bookForm.total_copies} onChange={e => setBookForm({ ...bookForm, total_copies: e.target.value })} /></div>
                                        <div><Label>Location</Label><Input value={bookForm.location} onChange={e => setBookForm({ ...bookForm, location: e.target.value })} /></div>
                                    </div>
                                    <Button onClick={handleAddBook}>Add Book</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Availability</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBooks.map(b => (
                                    <TableRow key={b.id}>
                                        <TableCell className="font-medium">{b.title}</TableCell>
                                        <TableCell>{b.author}</TableCell>
                                        <TableCell>{b.category}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {b.available_copies} / {b.total_copies}
                                            </span>
                                        </TableCell>
                                        <TableCell>{b.location}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="circulation" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
                            <DialogTrigger asChild><Button><BookOpen size={16} className="mr-2" /> Issue Book</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Issue Book</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div><Label>Student</Label>
                                        <Select value={issueForm.student_id} onValueChange={v => setIssueForm({ ...issueForm, student_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                                            <SelectContent>
                                                {students.map(s => <SelectItem key={s.id} value={s.id}>{s.enrollment_number} - {s.full_name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div><Label>Book</Label>
                                        <Select value={issueForm.book_id} onValueChange={v => setIssueForm({ ...issueForm, book_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Book" /></SelectTrigger>
                                            <SelectContent>
                                                {books.filter(b => b.available_copies > 0).map(b => (
                                                    <SelectItem key={b.id} value={b.id}>{b.title} (by {b.author})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleIssueBook}>Issue</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Book</TableHead>
                                    <TableHead>Issue Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <div className="font-medium">{t.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{t.enrollment_number}</div>
                                        </TableCell>
                                        <TableCell>{t.title}</TableCell>
                                        <TableCell>{format(new Date(t.issue_date), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>{format(new Date(t.due_date), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'returned' ? 'bg-green-100 text-green-700' :
                                                    new Date(t.due_date) < new Date() ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {t.status === 'issued' && new Date(t.due_date) < new Date() ? 'Overdue' : t.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {t.status === 'issued' && (
                                                <Button size="sm" variant="outline" onClick={() => handleReturnBook(t.id)}>
                                                    <RefreshCw size={14} className="mr-1" /> Return
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

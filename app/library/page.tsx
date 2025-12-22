"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Search, Clock } from "lucide-react"
import { format } from "date-fns"

export default function LibraryPage() {
    const { user } = useAuth()

    if (!user || (user.role !== "student" && user.role !== "faculty")) {
        return null
    }

    return (
        <ProtectedRoute>
            <LibraryContent />
        </ProtectedRoute>
    )
}

function LibraryContent() {
    const [books, setBooks] = useState<any[]>([])
    const [myBooks, setMyBooks] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [bRes, mRes] = await Promise.all([
                    fetch('/api/library/books'),
                    fetch('/api/library/transactions')
                ])

                if (bRes.ok) setBooks(await bRes.json())
                if (mRes.ok) setMyBooks(await mRes.json())
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Library</h1>
                <p className="text-muted-foreground mt-1">Search catalog and view your books</p>
            </div>

            <Tabs defaultValue="search" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="search">Search Catalog</TabsTrigger>
                    <TabsTrigger value="my-books">My Books</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or author..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks.map(b => (
                            <Card key={b.id} className="p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{b.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">by {b.author}</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Category:</span>
                                            <span>{b.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Location:</span>
                                            <span>{b.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {b.available_copies > 0 ? 'Available' : 'Out of Stock'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{b.available_copies} copies</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="my-books">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Book Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Issue Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myBooks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            You haven't borrowed any books.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    myBooks.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.title}</TableCell>
                                            <TableCell>{t.author}</TableCell>
                                            <TableCell>{format(new Date(t.issue_date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {format(new Date(t.due_date), 'MMM d, yyyy')}
                                                    {new Date(t.due_date) < new Date() && t.status === 'issued' && (
                                                        <Clock size={14} className="text-red-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'returned' ? 'bg-green-100 text-green-700' :
                                                    new Date(t.due_date) < new Date() ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {t.status === 'issued' && new Date(t.due_date) < new Date() ? 'Overdue' : t.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

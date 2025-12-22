"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InventoryPage() {
    return <ProtectedRoute><InventoryContent /></ProtectedRoute>
}

function InventoryContent() {
    const [items, setItems] = useState<any[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { toast } = useToast()

    useEffect(() => { loadData() }, [])

    async function loadData() {
        const res = await fetch('/api/staff/inventory')
        if (res.ok) setItems(await res.json())
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        const res = await fetch('/api/staff/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (res.ok) {
            toast({ title: "Item Added" })
            setIsDialogOpen(false)
            loadData()
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Inventory Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus size={16} className="mr-2" />Add Item</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Item Name</Label>
                                    <Input name="item_name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input name="category" placeholder="e.g. Stationery" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input name="quantity" type="number" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Input name="unit" placeholder="pcs, box" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Threshold</Label>
                                    <Input name="min_threshold" type="number" defaultValue="10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input name="location" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Save Item</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>
                                    {item.quantity} {item.unit}
                                </TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell>
                                    {item.quantity <= item.min_threshold ?
                                        <span className="text-red-500 font-bold">Low Stock</span> :
                                        <span className="text-green-600">In Stock</span>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

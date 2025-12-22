"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, CreditCard, History, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function StudentFeesPage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <StudentFeesContent />
        </ProtectedRoute>
    )
}

function StudentFeesContent() {
    const { toast } = useToast()
    const [fees, setFees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [paymentOpen, setPaymentOpen] = useState(false)
    const [selectedFee, setSelectedFee] = useState<any>(null)
    const [paymentAmount, setPaymentAmount] = useState("")

    useEffect(() => {
        fetchFees()
    }, [])

    const fetchFees = async () => {
        try {
            const res = await fetch('/api/fees')
            if (res.ok) {
                setFees(await res.json())
            }
        } catch (error) {
            console.error("Failed to fetch fees", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async () => {
        if (!selectedFee || !paymentAmount) return

        try {
            const res = await fetch('/api/fees', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fee_id: selectedFee.id,
                    amount: paymentAmount,
                    payment_method: 'online'
                })
            })

            if (res.ok) {
                toast({ title: "Success", description: "Payment recorded successfully" })
                setPaymentOpen(false)
                fetchFees()
                setPaymentAmount("")
                setSelectedFee(null)
            } else {
                const err = await res.json()
                toast({ title: "Error", description: err.error || "Payment failed", variant: "destructive" })
            }
        } catch (error) {
            console.error("Payment error", error)
            toast({ title: "Error", description: "Payment failed", variant: "destructive" })
        }
    }

    const openPaymentDialog = (fee: any) => {
        setSelectedFee(fee)
        setPaymentAmount(fee.balance) // Default to full balance
        setPaymentOpen(true)
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading fee details...</div>
    }

    const totalDue = fees.reduce((acc, curr) => acc + Number(curr.balance || 0), 0)

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Fees</h1>
                    <p className="text-muted-foreground mt-1">View fee structure and make payments</p>
                </div>
                <Card className="px-6 py-3 bg-primary/10 border-primary/20">
                    <p className="text-sm text-primary font-medium">Total Due</p>
                    <p className="text-2xl font-bold text-primary">₹{totalDue.toLocaleString()}</p>
                </Card>
            </div>

            {/* Fee Breakdown Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {fees.map((fee) => (
                    <Card key={fee.id} className="p-6 border border-border/50">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Academic Year {fee.academic_year}</h3>
                                <p className="text-sm text-muted-foreground">Due: {format(new Date(fee.due_date), 'MMM d, yyyy')}</p>
                            </div>
                            <Badge className={`${fee.status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                    fee.status === 'partial' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                        'bg-red-100 text-red-700 hover:bg-red-100'
                                }`}>
                                {fee.status.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tuition Fee</span>
                                <span>₹{Number(fee.tuition_fee).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Hostel Fee</span>
                                <span>₹{Number(fee.hostel_fee).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Other Fees</span>
                                <span>₹{(Number(fee.lab_fee) + Number(fee.exam_fee) + Number(fee.other_fee)).toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-medium">
                                <span>Total Amount</span>
                                <span>₹{Number(fee.total_fee).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Paid Amount</span>
                                <span>- ₹{Number(fee.paid_amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-primary border-t pt-2">
                                <span>Balance to Pay</span>
                                <span>₹{Number(fee.balance).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {Number(fee.balance) > 0 && (
                                <Button className="flex-1 gap-2" onClick={() => openPaymentDialog(fee)}>
                                    <CreditCard size={16} /> Pay Now
                                </Button>
                            )}
                            <Button variant="outline" className="flex-1 gap-2">
                                <Download size={16} /> Receipt
                            </Button>
                        </div>
                    </Card>
                ))}

                {fees.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        No fee records found for your account.
                    </div>
                )}
            </div>

            {/* Payment History Placeholder */}
            <Card className="p-6 border border-border/50">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <History size={20} /> Payment History
                </h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                No recent transactions
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>

            {/* Payment Dialog */}
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Make Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Amount to Pay (₹)</Label>
                            <Input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                max={selectedFee?.balance}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Max payable: ₹{Number(selectedFee?.balance).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                            Note: This is a demo payment. No actual money will be deducted.
                        </div>
                        <Button className="w-full" onClick={handlePayment}>
                            Confirm Payment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

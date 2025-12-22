"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const toast = useToast()
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  useEffect(() => {
    async function fetchFees() {
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
    fetchFees()
  }, [])

  const handlePayment = async () => {
    if (!selectedFeeId || !paymentAmount) return

    try {
      const res = await fetch('/api/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee_id: selectedFeeId,
          amount: paymentAmount,
          payment_method: 'online'
        })
      })

      if (res.ok) {
        toast.toast({ title: "Success", description: "Payment successful!" })
        // Update local state
        const updatedFee = await res.json()
        setFees(fees.map(f => f.id === selectedFeeId ? { ...f, ...updatedFee } : f))
        setIsPaymentOpen(false)
        setPaymentAmount("")
      } else {
        toast.toast({ title: "Error", description: "Payment failed", variant: "destructive" })
      }
    } catch (error) {
      console.error("Payment error", error)
      toast.toast({ title: "Error", description: "Payment processing failed", variant: "destructive" })
    }
  }

  const openPaymentModal = (fee: any) => {
    setSelectedFeeId(fee.id)
    setPaymentAmount(fee.balance) // Default to full balance
    setIsPaymentOpen(true)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Fees</h1>
        <p className="text-muted-foreground mt-1">View dues and payment history</p>
      </div>

      <div className="grid gap-6">
        {fees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
            No fee records found.
          </div>
        ) : (
          fees.map(fee => (
            <Card key={fee.id} className="p-6 border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl">Academic Year {fee.academic_year}</h3>
                      <p className="text-sm text-muted-foreground">Due Date: {format(new Date(fee.due_date), 'MMM d, yyyy')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                        fee.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {fee.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">Tuition Fee</p>
                      <p className="font-semibold">₹{Number(fee.tuition_fee).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">Hostel Fee</p>
                      <p className="font-semibold">₹{Number(fee.hostel_fee).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">Other Fees</p>
                      <p className="font-semibold">₹{(Number(fee.lab_fee) + Number(fee.exam_fee) + Number(fee.other_fee)).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-primary font-medium">Total Fee</p>
                      <p className="font-bold text-primary">₹{Number(fee.total_fee).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-end gap-2 min-w-[200px]">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Paid Amount</p>
                    <p className="text-lg font-semibold text-green-600">₹{Number(fee.paid_amount).toLocaleString()}</p>
                  </div>
                  <div className="text-right mb-2">
                    <p className="text-sm text-muted-foreground">Balance Due</p>
                    <p className="text-2xl font-bold text-red-600">₹{Number(fee.balance).toLocaleString()}</p>
                  </div>

                  {fee.status !== 'paid' && (
                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2" onClick={() => openPaymentModal(fee)}>
                          <CreditCard size={18} /> Pay Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make Payment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="p-4 bg-muted/30 rounded-lg mb-4">
                            <p className="text-sm text-muted-foreground">Balance Due</p>
                            <p className="text-2xl font-bold text-foreground">₹{Number(fee.balance).toLocaleString()}</p>
                          </div>
                          <div>
                            <Label>Amount to Pay</Label>
                            <div className="relative mt-1">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                className="pl-9"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                              />
                            </div>
                          </div>
                          <Button className="w-full mt-4" onClick={handlePayment}>
                            Confirm Payment
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

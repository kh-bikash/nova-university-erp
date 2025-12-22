"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, CheckCircle } from "lucide-react"

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: "💳" },
  { id: "bank", name: "Bank Transfer", icon: "🏦" },
  { id: "upi", name: "UPI", icon: "📱" },
  { id: "wallet", name: "Digital Wallet", icon: "👛" },
]

const paymentHistory = [
  {
    id: "1",
    date: "2024-09-01",
    amount: 100000,
    method: "Credit Card",
    transactionId: "TXN2024090001",
    status: "completed",
  },
  { id: "2", date: "2024-08-15", amount: 50000, method: "UPI", transactionId: "TXN2024081502", status: "completed" },
  {
    id: "3",
    date: "2024-08-01",
    amount: 45000,
    method: "Bank Transfer",
    transactionId: "TXN2024080103",
    status: "completed",
  },
]

export default function PaymentsPage() {
  const { user } = useAuth()

  if (!user || !['student', 'parent', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <PaymentsContent />
    </ProtectedRoute>
  )
}

function PaymentsContent() {
  const [paymentMode, setPaymentMode] = useState("card")
  const [amount, setAmount] = useState("")
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payment Gateway</h1>
        <p className="text-muted-foreground mt-2">Make online fee payments securely</p>
      </div>

      {/* Payment Options */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            onClick={() => setPaymentMode(method.id)}
            className={`p-4 border-2 cursor-pointer transition-all ${
              paymentMode === method.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
            }`}
          >
            <div className="text-3xl mb-2">{method.icon}</div>
            <p className="font-medium text-foreground text-sm">{method.name}</p>
          </Card>
        ))}
      </div>

      {/* Payment Form */}
      {!showPaymentForm ? (
        <Card className="p-8 border border-border/50">
          <h3 className="text-xl font-semibold text-foreground mb-6">Enter Payment Amount</h3>
          <div className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount to Pay (₹)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground mt-2">Outstanding balance: ₹85,000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Payment Purpose</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">Tuition Fees</SelectItem>
                  <SelectItem value="hostel">Hostel Fees</SelectItem>
                  <SelectItem value="lab">Lab Fees</SelectItem>
                  <SelectItem value="exam">Exam Fees</SelectItem>
                  <SelectItem value="other">Other Fees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setShowPaymentForm(true)}
              disabled={!amount}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12"
            >
              <CreditCard size={20} className="mr-2" />
              Proceed to Payment
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 border border-border/50">
          <h3 className="text-xl font-semibold text-foreground mb-6">Payment Details</h3>
          <div className="space-y-4 max-w-md mb-6">
            <div className="p-4 bg-card rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground">Payment Amount</p>
              <p className="text-3xl font-bold text-primary mt-1">₹{amount}</p>
            </div>

            {paymentMode === "card" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </>
            )}

            {paymentMode === "upi" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">UPI ID</label>
                <Input placeholder="yourname@upi" />
              </div>
            )}

            {paymentMode === "bank" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Bank</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sbi">State Bank of India</SelectItem>
                    <SelectItem value="hdfc">HDFC Bank</SelectItem>
                    <SelectItem value="icici">ICICI Bank</SelectItem>
                    <SelectItem value="axis">Axis Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90">Pay Now</Button>
          </div>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold text-foreground">
                    ₹{(payment.amount / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-green-700 font-medium">
                      <CheckCircle size={16} />
                      Completed
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

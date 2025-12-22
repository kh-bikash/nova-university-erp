"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function FeedbackPage() {
    return (
        <div className="p-6 lg:p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-foreground mb-6">Feedback</h1>
            <Card className="p-6">
                <div className="space-y-4">
                    <div>
                        <Label>Your Feedback</Label>
                        <Textarea placeholder="Share your thoughts..." className="min-h-[150px]" />
                    </div>
                    <Button>Submit Feedback</Button>
                </div>
            </Card>
        </div>
    )
}

"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default function CounsellingPage() {
    return (
        <div className="p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Counselling Diary</h1>
            <Card className="p-12 text-center border-dashed">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Student Counselling</h3>
                <p className="text-muted-foreground">Book appointments with student counsellors.</p>
            </Card>
        </div>
    )
}

"use client"

import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function ClubsPage() {
    return (
        <div className="p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Clubs & Activities</h1>
            <Card className="p-12 text-center border-dashed">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Coming Soon</h3>
                <p className="text-muted-foreground">Join student clubs and participate in campus activities.</p>
            </Card>
        </div>
    )
}

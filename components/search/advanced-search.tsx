"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface SearchResult {
  id: string
  type: "student" | "course" | "faculty" | "document"
  title: string
  description: string
  icon: string
}

const mockResults: SearchResult[] = [
  { id: "1", type: "student", title: "John Doe", description: "CS2024001", icon: "👤" },
  { id: "2", type: "course", title: "Data Structures", description: "CS101", icon: "📚" },
  { id: "3", type: "faculty", title: "Dr. Smith", description: "Computer Science", icon: "👨‍🏫" },
]

export function AdvancedSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.length > 0) {
      setResults(mockResults.filter((r) => r.title.toLowerCase().includes(value.toLowerCase())))
      setOpen(true)
    } else {
      setResults([])
      setOpen(false)
    }
  }

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search students, courses, faculty..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-8"
          aria-label="Search"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1"
            onClick={() => {
              setQuery("")
              setResults([])
              setOpen(false)
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {open && results.length > 0 && (
        <Card className="absolute top-12 left-0 right-0 shadow-lg z-50">
          <div className="divide-y max-h-80 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                className="w-full text-left p-3 hover:bg-accent/50 transition-colors flex gap-3"
                onClick={() => {
                  setQuery("")
                  setResults([])
                  setOpen(false)
                }}
              >
                <span className="text-lg">{result.icon}</span>
                <div>
                  <p className="font-medium text-sm">{result.title}</p>
                  <p className="text-xs text-muted-foreground">{result.description}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

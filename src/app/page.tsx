'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Tree Panel */}
        <div className="w-80 border-r border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <h1 className="text-lg font-semibold">Vault</h1>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Create your first folder to get started.
            </p>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm text-muted-foreground">
              Welcome to Vault
            </h2>
          </div>
          <div className="flex-1 p-4">
            <div className="prose max-w-none">
              <h1>Welcome to Vault</h1>
              <p>
                Your personal knowledge base for capturing and organizing developer knowledge.
                Start by creating folders and documents in the left panel.
              </p>
              <h2>Features</h2>
              <ul>
                <li>Rich text editor with formatting</li>
                <li>Drag and drop organization</li>
                <li>PDF import and export</li>
                <li>Voice-to-text dictation</li>
                <li>Auto-save functionality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
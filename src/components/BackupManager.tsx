import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface BackupEntry {
  id: string
  timestamp: string
  description: string
  changes: string[]
  files: string[]
}

interface BackupHistory {
  entries: BackupEntry[]
}

export default function BackupManager() {
  const [backups, setBackups] = useState<BackupHistory>({
    entries: [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        description: 'Initial project setup',
        changes: [
          'Created project structure',
          'Added basic components',
          'Setup Tailwind CSS'
        ],
        files: [
          'src/pages/index.tsx',
          'src/components/',
          'src/lib/',
          'package.json',
          'tailwind.config.js'
        ]
      }
    ]
  })

  const [newDescription, setNewDescription] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const createBackup = () => {
    if (!newDescription.trim()) {
      alert('Please enter a description for this backup')
      return
    }

    const newEntry: BackupEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      description: newDescription,
      changes: ['Manual backup'],
      files: selectedFiles.length > 0 ? selectedFiles : ['All files']
    }

    setBackups(prev => ({
      entries: [newEntry, ...prev.entries]
    }))
    setNewDescription('')
    setSelectedFiles([])
    
    // Save to localStorage
    const updatedHistory = {
      entries: [newEntry, ...backups.entries]
    }
    localStorage.setItem('nexagent-backup-history', JSON.stringify(updatedHistory))
    
    alert('Backup created successfully!')
  }

  const exportBackup = (backupId: string) => {
    const backup = backups.entries.find(b => b.id === backupId)
    if (!backup) return

    const exportData = {
      backupId: backup.id,
      timestamp: backup.timestamp,
      description: backup.description,
      exportDate: new Date().toISOString(),
      exportedBy: 'NexAgent Backup Manager'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexagent-backup-${backup.id}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const restoreBackup = (backupId: string) => {
    const backup = backups.entries.find(b => b.id === backupId)
    if (!backup) return

    if (confirm(`Are you sure you want to restore backup from ${new Date(backup.timestamp).toLocaleDateString()}?\n\nDescription: ${backup.description}\n\nThis will overwrite current files. Consider creating a backup first.`)) {
      alert('Restore functionality would be implemented in the actual app.\n\nThis is a demo of the backup system.')
    }
  }

  const deleteBackup = (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      setBackups(prev => ({
        entries: prev.entries.filter(b => b.id !== backupId)
      }))
      
      // Update localStorage
      const updatedHistory = {
        entries: backups.entries.filter(b => b.id !== backupId)
      }
      localStorage.setItem('nexagent-backup-history', JSON.stringify(updatedHistory))
      
      alert('Backup deleted successfully!')
    }
  }

  const toggleFile = (filename: string) => {
    setSelectedFiles(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🗂️ NexAgent Backup Manager
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Backup */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Create New Backup
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe what changes you've made..."
                  className="w-full"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Files to Include
                </label>
                <div className="space-y-2">
                  {['src/pages/index.tsx', 'src/components/', 'src/lib/', 'package.json', 'tailwind.config.js', 'globals.css'].map(file => (
                    <label key={file} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file)}
                        onChange={() => toggleFile(file)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{file}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={createBackup}
                className="w-full"
                disabled={!newDescription.trim() && selectedFiles.length === 0}
              >
                🗂️ Create Backup
              </Button>
            </div>
          </div>

          {/* Backup History */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📋 Backup History
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {backups.entries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No backups yet. Create your first backup!
                </p>
              ) : (
                backups.entries.map((backup) => (
                  <div
                    key={backup.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {backup.description}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(backup.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportBackup(backup.id)}
                        >
                          📤 Export
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBackup(backup.id)}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Changes:</strong>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {backup.changes.map((change, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Files:</strong>
                    </div>
                    <div className="text-sm text-gray-500">
                      {backup.files.join(', ')}
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => restoreBackup(backup.id)}
                        className="flex-1"
                      >
                        🔄 Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportBackup(backup.id)}
                      >
                        📤 Export
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📖 Instructions
            </h2>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>🗂️ Creating Backups:</strong>
                <p>Describe your changes and select files to include. Backups are stored in browser localStorage and can be exported as JSON.</p>
              </div>
              
              <div>
                <strong>📤 Exporting Backups:</strong>
                <p>Download backup data as JSON files for external storage or sharing.</p>
              </div>
              
              <div>
                <strong>🔄 Restoring Backups:</strong>
                <p>In a real implementation, this would restore files to their previous state. Always create a backup before restoring.</p>
              </div>
              
              <div>
                <strong>💡 Pro Tips:</strong>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Create backups before major changes</li>
                  <li>Export backups regularly to external storage</li>
                  <li>Use descriptive names for easy identification</li>
                  <li>Include all modified files in backups</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

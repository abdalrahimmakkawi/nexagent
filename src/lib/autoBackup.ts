import { promises as fs } from 'fs'
import path from 'path'

interface BackupConfig {
  projectPath: string
  backupDir: string
  maxBackups: number
}

interface BackupMetadata {
  id: string
  timestamp: string
  description: string
  files: string[]
  operation: string
}

class AutoBackup {
  private config: BackupConfig

  constructor(config: BackupConfig) {
    this.config = config
  }

  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.mkdir(this.config.backupDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }
  }

  private async createBackup(description: string, files: string[]): Promise<string> {
    await this.ensureBackupDir()
    
    const backupId = Date.now().toString()
    const timestamp = new Date().toISOString()
    
    const metadata: BackupMetadata = {
      id: backupId,
      timestamp,
      description,
      files,
      operation: 'auto-backup'
    }

    // Save metadata
    const metadataPath = path.join(this.config.backupDir, `${backupId}-metadata.json`)
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    // Create backup directory
    const backupDir = path.join(this.config.backupDir, backupId)
    await fs.mkdir(backupDir, { recursive: true })

    // Copy files
    const results = await Promise.allSettled(
      files.map(async (file) => {
        try {
          const srcPath = path.join(this.config.projectPath, file)
          const destPath = path.join(backupDir, file)
          
          // Ensure destination directory exists
          const destDir = path.dirname(destPath)
          await fs.mkdir(destDir, { recursive: true })
          
          await fs.copyFile(srcPath, destPath)
          return { success: true, file, error: null }
        } catch (error) {
          return { success: false, file, error: error instanceof Error ? error.message : String(error) }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success)
    const failed = results.filter(r => r.status === 'fulfilled' && !r.value.success)

    console.log(`✅ Backup created: ${backupId}`)
    console.log(`📁 Description: ${description}`)
    console.log(`✅ Files backed up: ${successful.length}`)
    
    if (failed.length > 0) {
      console.log(`❌ Failed to backup: ${failed.length} files`)
      failed.forEach(f => {
        if (f.status === 'fulfilled') {
          console.log(`   - ${f.value.file}: ${f.value.error}`)
        }
      })
    }

    // Clean up old backups (keep only last 10)
    await this.cleanupOldBackups()

    return backupId
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const entries = await fs.readdir(this.config.backupDir)
      const backupDirs = entries
        .filter(entry => {
          const entryPath = path.join(this.config.backupDir, entry)
          return fs.stat(entryPath).then(stat => stat.isDirectory())
        })
        .map(entry => path.join(this.config.backupDir, entry))

      // Get backup metadata
      const metadataFiles = backupDirs.map(dir => 
        path.join(dir, `${path.basename(dir)}-metadata.json`)
      )

      const metadatas = await Promise.allSettled(
        metadataFiles.map(async (file) => {
          try {
            const content = await fs.readFile(file, 'utf-8')
            return { success: true, metadata: JSON.parse(content) }
          } catch {
            return { success: false, metadata: null }
          }
        })
      )

      const validMetadatas = metadatas
        .filter(m => m.status === 'fulfilled' && m.value.metadata)
        .map(m => m.status === 'fulfilled' ? m.value.metadata : null)
        .filter((metadata): metadata is BackupMetadata => metadata !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Keep only the most recent backups
      if (validMetadatas.length > this.config.maxBackups) {
        const toDelete = validMetadatas.slice(this.config.maxBackups)
        const dirsToDelete = toDelete.map(metadata => 
          backupDirs.find(dir => dir && path.basename(dir) === metadata.id)
        ).filter(Boolean) as string[]

        await Promise.allSettled(
          dirsToDelete.map(async (dir) => {
            try {
              await fs.rm(dir, { recursive: true, force: true })
              console.log(`🗑️ Deleted old backup: ${path.basename(dir)}`)
              return { success: true }
            } catch (error) {
              console.log(`❌ Failed to delete ${path.basename(dir)}: ${error}`)
              return { success: false }
            }
          })
        )
      }
    } catch (error) {
      console.log('Cleanup failed:', error)
    }
  }

  async createManualBackup(description: string): Promise<string> {
    const commonFiles = [
      'src/pages/index.tsx',
      'src/components/',
      'src/lib/',
      'src/styles/',
      'package.json',
      'tailwind.config.js',
      'tsconfig.json'
    ]

    return this.createBackup(description, commonFiles)
  }

  async createPreDeploymentBackup(): Promise<string> {
    const deploymentFiles = [
      'src/pages/',
      'src/components/',
      'src/lib/',
      'src/styles/',
      'package.json',
      'tailwind.config.js',
      'tsconfig.json',
      '.env.local',
      'public/'
    ]

    return this.createBackup('Pre-deployment backup', deploymentFiles)
  }

  async listBackups(): Promise<BackupMetadata[]> {
    try {
      await this.ensureBackupDir()
      const entries = await fs.readdir(this.config.backupDir)
      
      const backupDirs = entries.filter(entry => {
        const entryPath = path.join(this.config.backupDir, entry)
        return fs.stat(entryPath).then(stat => stat.isDirectory())
      })

      const metadatas = await Promise.allSettled(
        backupDirs.map(async (dir) => {
          try {
            const metadataFile = path.join(this.config.backupDir, dir, `${dir}-metadata.json`)
            const content = await fs.readFile(metadataFile, 'utf-8')
            return { success: true, metadata: JSON.parse(content) }
          } catch {
            return { success: false, metadata: null }
          }
        })
      )

      return metadatas
        .filter(m => m.status === 'fulfilled')
        .map(m => m.status === 'fulfilled' ? m.value.metadata : null)
        .filter((metadata): metadata is BackupMetadata => metadata !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    } catch (error) {
      console.error('Failed to list backups:', error)
      return []
    }
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const metadataPath = path.join(this.config.backupDir, `${backupId}-metadata.json`)
      const metadataContent = await fs.readFile(metadataPath, 'utf-8')
      const metadata: BackupMetadata = JSON.parse(metadataContent)

      const backupDir = path.join(this.config.backupDir, backupId)
      
      // Restore files
      for (const file of metadata.files) {
        const srcPath = path.join(backupDir, file)
        const destPath = path.join(this.config.projectPath, file)
        
        // Ensure destination directory exists
        const destDir = path.dirname(destPath)
        await fs.mkdir(destDir, { recursive: true })
        
        await fs.copyFile(srcPath, destPath)
        console.log(`🔄 Restored: ${file}`)
      }

      console.log(`✅ Backup restored: ${backupId} (${metadata.description})`)
      return true
    } catch (error) {
      console.error('Failed to restore backup:', error)
      return false
    }
  }
}

export default AutoBackup

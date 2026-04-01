#!/bin/bash

# NexAgent Project Backup Script
# Creates timestamped backup of the entire project

echo "🔄 Creating NexAgent Project Backup..."

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="nexagent-backup-$TIMESTAMP"
BACKUP_DIR="C:\Users\asus\Documents\AI agent\backups"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup folder
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_PATH"

echo "📁 Backup location: $BACKUP_PATH"

# Copy project files (excluding node_modules, .git, and build artifacts)
echo "📋 Copying project files..."
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.env.local' \
  --exclude='*.log' \
  "C:\Users\asus\Documents\AI agent\nexagent-project\nexagent/" \
  "$BACKUP_PATH/"

# Create backup info file
echo "📄 Creating backup info..."
cat > "$BACKUP_PATH/backup-info.txt" << EOF
NexAgent Project Backup
====================
Backup Date: $(date)
Backup Name: $BACKUP_NAME
Git Commit: $(git -C "C:\Users\asus\Documents\AI agent\nexagent-project\nexagent" rev-parse HEAD 2>/dev/null || echo "Unknown")
Git Branch: $(git -C "C:\Users\asus\Documents\AI agent\nexagent-project\nexagent" branch --show-current 2>/dev/null || echo "Unknown")
Node Version: $(node -v 2>/dev/null || echo "Unknown")
Environment: Production

Features Included:
✅ NVIDIA API Integration (Primary)
✅ Admin Dashboard with Agent Building Status
✅ AI Response Filtering (No Thinking Content)
✅ Data Explorer Authentication Fix
✅ Multi-Agent System
✅ Admin Assistant API
✅ Widget Chat System
✅ Agent Generator

Files Backed Up:
$(find "$BACKUP_PATH" -type f | wc -l | awk '{print $1 " files"}')
EOF

# Compress the backup
echo "🗜️ Compressing backup..."
cd "$BACKUP_DIR"
zip -r "$BACKUP_NAME.zip" "$BACKUP_NAME"

# Clean up uncompressed folder
rm -rf "$BACKUP_PATH"

echo "✅ Backup completed successfully!"
echo "📍 Backup file: $BACKUP_DIR/$BACKUP_NAME.zip"
echo "💾 Size: $(du -h "$BACKUP_DIR/$BACKUP_NAME.zip" | cut -f1)"

# Keep only last 5 backups
echo "🧹 Cleaning up old backups (keeping last 5)..."
cd "$BACKUP_DIR"
ls -t *.zip | tail -n +6 | xargs -r rm -f

echo "🎉 Backup process completed!"
echo "📊 Current backups:"
ls -la "$BACKUP_DIR"/*.zip 2>/dev/null || echo "No backups found"

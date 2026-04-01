@echo off
setlocal enabledelayedexpansion

REM NexAgent Project Backup Script (Windows)
REM Creates timestamped backup of the entire project

echo 🔄 Creating NexAgent Project Backup...

REM Get current timestamp
for /f "tokens=1-3 delims=/ " %%a in ('%date%') do set "TIMESTAMP=%%a"
set "BACKUP_NAME=nexagent-backup-%TIMESTAMP%"
set "BACKUP_DIR=C:\Users\asus\Documents\AI agent\backups"
set "PROJECT_DIR=C:\Users\asus\Documents\AI agent\nexagent-project\nexagent"

REM Create backups directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Create backup folder
set "BACKUP_PATH=%BACKUP_DIR%\%BACKUP_NAME%"
if not exist "%BACKUP_PATH%" mkdir "%BACKUP_PATH%"

echo 📁 Backup location: %BACKUP_PATH%

REM Copy project files (excluding node_modules, .git, and build artifacts)
echo 📋 Copying project files...
xcopy "%PROJECT_DIR%" "%BACKUP_PATH%" /E /I /EXCLUDE:node_modules\.git\.next.dist.env.local*.log /Q

REM Create backup info file
echo 📄 Creating backup info...
(
echo NexAgent Project Backup
echo ====================
echo Backup Date: %date%
echo Backup Name: %BACKUP_NAME%
echo Git Commit: 
for /f "delims=" %%a in ('git -C "%PROJECT_DIR%" rev-parse HEAD 2^>nul') do set "GIT_COMMIT=%%a"
if not defined GIT_COMMIT set GIT_COMMIT=Unknown
echo %GIT_COMMIT%
echo Git Branch:
for /f "delims=" %%a in ('git -C "%PROJECT_DIR%" branch --show-current 2^>nul') do set "GIT_BRANCH=%%a"
if not defined GIT_BRANCH set GIT_BRANCH=Unknown
echo %GIT_BRANCH%
echo Node Version:
for /f "tokens=1" %%a in ('node -v 2^>nul') do set "NODE_VERSION=%%a"
if not defined NODE_VERSION set NODE_VERSION=Unknown
echo %NODE_VERSION%
echo Environment: Production
echo.
echo Features Included:
echo ✅ NVIDIA API Integration ^(Primary^)
echo ✅ Admin Dashboard with Agent Building Status
echo ✅ AI Response Filtering ^(No Thinking Content^)
echo ✅ Data Explorer Authentication Fix
echo ✅ Multi-Agent System
echo ✅ Admin Assistant API
echo ✅ Widget Chat System
echo ✅ Agent Generator
echo.
echo Files Backed Up:
dir "%BACKUP_PATH%" /b /a-d | find /c "" 2^>nul | find /v "" /c "" | find "files" > temp_count.txt
set /p count=<temp_count.txt
echo %count% files
del temp_count.txt
) > "%BACKUP_PATH%\backup-info.txt"

REM Compress the backup
echo 🗜️ Compressing backup...
cd /d "%BACKUP_DIR%"
powershell -command "Compress-Archive -Path '%BACKUP_NAME%' -DestinationPath '%BACKUP_NAME%.zip' -Force"

REM Clean up uncompressed folder
rmdir /s /q "%BACKUP_PATH%"

echo ✅ Backup completed successfully!
echo 📍 Backup file: %BACKUP_DIR%\%BACKUP_NAME%.zip

REM Get backup size
for /f "delims=" %%a in ('powershell -command "(Get-Item '%BACKUP_DIR%\%BACKUP_NAME%.zip').Length"') do set "BACKUP_SIZE=%%a"

echo 💾 Size: %BACKUP_SIZE%

REM Keep only last 5 backups
echo 🧹 Cleaning up old backups ^(keeping last 5^)...
cd /d "%BACKUP_DIR%"
for /f "skip=5 delims=" %%a in ('dir /b *.zip /o-d') do (
    if !skip! equ 0 (
        set "OLD_BACKUP=%%a"
        del "%%a"
    )
    set /a skip-=1
)

echo 🎉 Backup process completed!
echo 📊 Current backups:
dir "%BACKUP_DIR%\*.zip" /b 2^>nul || echo No backups found

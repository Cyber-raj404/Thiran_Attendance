$source = "C:\Users\Rajkumar\.gemini\antigravity\scratch\hackathon-organizer"
$tempDir = "$env:TEMP\hackathon_backup_stage"
$dest = "$env:USERPROFILE\Downloads\hackathon-organizer-backup.zip"

Write-Host "Starting Backup..."
Write-Host "Source: $source"
Write-Host "Destination: $dest"

# 1. Clean up potential leftovers
if (Test-Path $tempDir) { 
    Write-Host "Cleaning temp dir..."
    Remove-Item $tempDir -Recurse -Force 
}
if (Test-Path $dest) { 
    Write-Host "Removing old backup..."
    Remove-Item $dest -Force 
}

# 2. Copy files to staging area (Excluding node_modules)
# /E = Recursive including empty dirs
# /XD = Exclude Directories
# /R:0 /W:0 = No retries on locked files (fail fast)
# /NFL /NDL = No file logging (quieter output)
Write-Host "Copying files (excluding node_modules)..."
robocopy $source $tempDir /E /XD node_modules /R:0 /W:0 /NFL /NDL

# Robocopy exit codes: 0=No Change, 1=Copy Successful, 3=Copy Successful(extra). >=8 is error.
if ($LASTEXITCODE -ge 8) {
    Write-Host "Robocopy reported potential errors. Continuing..."
}

# 3. Compress
Write-Host "Zipping..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $dest

# 4. Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "SUCCESS: Backup saved to $dest"

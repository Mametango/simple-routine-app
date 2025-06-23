# GitHub Repository Rename-Update Script

Write-Host "Starting GitHub repository rename-update for script.js..." -ForegroundColor Green

# Configuration
$token = "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"
$owner = "Mametango"
$repoName = "my-routine-app"
$originalPath = "script.js"
$tempPath = "script_temp.js"
$commitMessage = "feat: Implement SMS authentication logic (rename update)"

function Rename-Update-GitHubFile {
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }

    # 1. Upload local script.js as script_temp.js
    Write-Host "Step 1: Uploading as $tempPath..."
    try {
        $fileContent = Get-Content -Path $originalPath -Raw -Encoding UTF8
        $base64Content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($fileContent))
        $apiUrl = "https://api.github.com/repos/$owner/$repoName/contents/$tempPath"
        
        # Check if temp file exists to get its SHA
        $sha_temp = $null
        try {
            $existing_temp = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
            $sha_temp = $existing_temp.sha
        } catch {}

        $body = @{
            message = "chore: Upload to temporary file"
            content = $base64Content
        }
        if($sha_temp) { $body.sha = $sha_temp }
        
        Invoke-RestMethod -Uri $apiUrl -Method Put -Headers $headers -Body ($body | ConvertTo-Json) -ContentType "application/json"
        Write-Host "SUCCESS: Uploaded to $tempPath." -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to upload to $tempPath. Details: $($_.Exception.Message)" -ForegroundColor Red
        return
    }

    # 2. Delete the original script.js
    Write-Host "Step 2: Deleting $originalPath..."
    try {
        $apiUrl = "https://api.github.com/repos/$owner/$repoName/contents/$originalPath"
        $currentFile = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        $sha = $currentFile.sha

        $body = @{
            message = "chore: Delete original script to rename"
            sha = $sha
        } | ConvertTo-Json

        Invoke-RestMethod -Uri $apiUrl -Method Delete -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "SUCCESS: Deleted $originalPath." -ForegroundColor Green
    }
    catch {
        Write-Host "WARNING: Could not delete $originalPath. Maybe it doesn't exist? Details: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # 3. Rename script_temp.js back to script.js (This requires Git database API)
    # This is complex with PowerShell's Invoke-RestMethod.
    # A simpler approach is to now upload the content again to the final destination.
    Write-Host "Step 3: Uploading content to final destination $originalPath..."
     try {
        $fileContent = Get-Content -Path $originalPath -Raw -Encoding UTF8
        $base64Content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($fileContent))
        $apiUrl = "https://api.github.com/repos/$owner/$repoName/contents/$originalPath"

        $body = @{
            message = $commitMessage
            content = $base64Content
        }
        
        Invoke-RestMethod -Uri $apiUrl -Method Put -Headers $headers -Body ($body | ConvertTo-Json) -ContentType "application/json"
        Write-Host "SUCCESS: Content uploaded to $originalPath." -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to upload to $originalPath. Details: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    
     # 4. Clean up temp file
    Write-Host "Step 4: Deleting temp file $tempPath..."
    try {
        $apiUrl = "https://api.github.com/repos/$owner/$repoName/contents/$tempPath"
        $tempFile = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        $sha_temp_del = $tempFile.sha

         $body = @{
            message = "chore: Clean up temporary file"
            sha = $sha_temp_del
        } | ConvertTo-Json

        Invoke-RestMethod -Uri $apiUrl -Method Delete -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "SUCCESS: Deleted $tempPath." -ForegroundColor Green
    }
    catch {
        Write-Host "WARNING: Could not delete $tempPath. Details: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Rename-Update-GitHubFile
Write-Host "Rename-update process for script.js is complete." -ForegroundColor Cyan 
# GitHub Repository Update Script for Firebase Auto-Creation
# Add Firebase auto-creation functionality for users who don't know Firebase setup

Write-Host "Starting GitHub repository update for Firebase auto-creation..." -ForegroundColor Green

# Configuration
$username = "Mametango"
$repoName = "my-routine-app"
$token = "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"

Write-Host "Username: $username" -ForegroundColor Cyan
Write-Host "Repository: $repoName" -ForegroundColor Cyan

# Function to get file SHA
function Get-FileSHA {
    param($filename)
    try {
        $headers = @{
            "Authorization" = "token $token"
            "Accept" = "application/vnd.github.v3+json"
            "User-Agent" = "My-Routine-App-Updater"
        }
        
        $url = "https://api.github.com/repos/$username/$repoName/contents/$filename"
        $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
        return $response.sha
    }
    catch {
        Write-Host "WARNING: Could not get SHA for $filename - file may not exist" -ForegroundColor Yellow
        return $null
    }
}

# Function to update file
function Update-File {
    param($filename, $message)
    
    if (-not (Test-Path $filename)) {
        Write-Host "ERROR: $filename not found" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Processing $filename..." -ForegroundColor Yellow
    
    try {
        $content = Get-Content $filename -Raw -Encoding UTF8
        $base64Content = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
        
        # Get SHA for existing file
        $sha = Get-FileSHA $filename
        
        $body = @{
            message = $message
            content = $base64Content
        }
        
        # Add SHA if file exists
        if ($sha) {
            $body.sha = $sha
            Write-Host "Using SHA: $sha" -ForegroundColor Gray
        }
        
        $bodyJson = $body | ConvertTo-Json
        
        $headers = @{
            "Authorization" = "token $token"
            "Accept" = "application/vnd.github.v3+json"
            "User-Agent" = "My-Routine-App-Updater"
        }
        
        $url = "https://api.github.com/repos/$username/$repoName/contents/$filename"
        
        Write-Host "Sending request to: $url" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $url -Method Put -Body $bodyJson -Headers $headers -ContentType "application/json"
        Write-Host "SUCCESS: $filename updated successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "ERROR: Failed to update $filename" -ForegroundColor Red
        Write-Host "Error message: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Error details: $errorContent" -ForegroundColor Red
        }
        return $false
    }
}

# Update files
$success = $true

$success = $success -and (Update-File "index.html" "Add Firebase auto-creation button to auth form")
$success = $success -and (Update-File "styles.css" "Add Firebase auto-creation modal and button styles")
$success = $success -and (Update-File "auto-create-firebase.js" "Add Firebase auto-creation functionality")
$success = $success -and (Update-File "FIREBASE_SETUP_GUIDE.md" "Update Firebase setup guide with comprehensive instructions")

if ($success) {
    Write-Host "All files updated successfully!" -ForegroundColor Green
    Write-Host "GitHub Pages URL: https://$username.github.io/$repoName" -ForegroundColor Cyan
    Write-Host "Firebase auto-creation has been added!" -ForegroundColor Green
    Write-Host "Click the 'Firebase自動作成' button for guided setup" -ForegroundColor Yellow
} else {
    Write-Host "Some files failed to update. Please check the errors above." -ForegroundColor Red
} 
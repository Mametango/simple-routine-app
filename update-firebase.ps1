# GitHub Repository Update Script for Firebase Integration
# Add Firebase Firestore and Authentication

Write-Host "Starting GitHub repository update for Firebase integration..." -ForegroundColor Green

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

$success = $success -and (Update-File "index.html" "Add Firebase SDK and update HTML structure")
$success = $success -and (Update-File "script.js" "Replace localStorage with Firebase Firestore and Auth")
$success = $success -and (Update-File "firebase-config.js" "Add Firebase configuration template")
$success = $success -and (Update-File "FIREBASE_SETUP.md" "Add Firebase setup guide")

if ($success) {
    Write-Host "All files updated successfully!" -ForegroundColor Green
    Write-Host "GitHub Pages URL: https://$username.github.io/$repoName" -ForegroundColor Cyan
    Write-Host "Firebase integration has been added!" -ForegroundColor Green
    Write-Host "Please follow FIREBASE_SETUP.md to configure Firebase" -ForegroundColor Yellow
    Write-Host "After Firebase setup, update firebase-config.js with your project settings" -ForegroundColor Yellow
} else {
    Write-Host "Some files failed to update. Please check the errors above." -ForegroundColor Red
} 
# GitHub Repository Auto Update Script
# Update files with authentication features

Write-Host "Starting GitHub repository update..." -ForegroundColor Green

# Configuration
$username = Read-Host "Enter your GitHub username"
$repoName = "my-routine-app"
$token = Read-Host "Enter your GitHub Personal Access Token"

# Check required files
$files = @("index.html", "styles.css", "script.js", "README-standalone.md")
foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "ERROR: $file not found" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK: $file found" -ForegroundColor Green
}

# Update files
foreach ($file in $files) {
    Write-Host "Uploading $file..." -ForegroundColor Yellow
    
    try {
        $content = Get-Content $file -Raw -Encoding UTF8
        $base64Content = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
        
        $body = @{
            message = "Update $file with authentication features"
            content = $base64Content
        } | ConvertTo-Json
        
        $headers = @{
            "Authorization" = "token $token"
            "Accept" = "application/vnd.github.v3+json"
            "User-Agent" = "My-Routine-App-Updater"
        }
        
        $url = "https://api.github.com/repos/$username/$repoName/contents/$file"
        
        $response = Invoke-RestMethod -Uri $url -Method Put -Body $body -Headers $headers -ContentType "application/json"
        Write-Host "SUCCESS: $file updated successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to update $file - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Error details: $errorContent" -ForegroundColor Red
        }
    }
}

Write-Host "Update completed!" -ForegroundColor Green
Write-Host "GitHub Pages URL: https://$username.github.io/$repoName" -ForegroundColor Cyan
Write-Host "Authentication-enabled app is now available!" -ForegroundColor Green 
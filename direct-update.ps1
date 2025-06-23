# Direct GitHub Repository Update Script
# Update files with authentication features using provided credentials

Write-Host "Starting direct GitHub repository update..." -ForegroundColor Green

# Configuration
$username = "Mametango"
$repoName = "my-routine-app"
$token = "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"

Write-Host "Username: $username" -ForegroundColor Cyan
Write-Host "Repository: $repoName" -ForegroundColor Cyan

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
        
        Write-Host "Sending request to: $url" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $url -Method Put -Body $body -Headers $headers -ContentType "application/json"
        Write-Host "SUCCESS: $file updated successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to update $file" -ForegroundColor Red
        Write-Host "Error message: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Error details: $errorContent" -ForegroundColor Red
        }
    }
}

Write-Host "Update process completed!" -ForegroundColor Green
Write-Host "GitHub Pages URL: https://$username.github.io/$repoName" -ForegroundColor Cyan
Write-Host "Authentication-enabled app should be available shortly!" -ForegroundColor Green 
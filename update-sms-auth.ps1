# GitHub Repository Update Script for SMS Auth Feature

Write-Host "Starting GitHub repository update for SMS Auth feature..." -ForegroundColor Green

# Configuration
$token = "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"
$owner = "Mametango"
$repoName = "my-routine-app"

function Update-GitHubFile {
    param(
        [string]$filePath,
        [string]$commitMessage
    )

    Write-Host "Processing $filePath..." -ForegroundColor Yellow
    
    $fileContent = Get-Content -Path $filePath -Raw -Encoding UTF8
    $base64Content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($fileContent))
    
    $apiUrl = "https://api.github.com/repos/$owner/$repoName/contents/$filePath"
    
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }

    try {
        # Get current file SHA
        $currentFile = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        $sha = $currentFile.sha

        $body = @{
            message = $commitMessage
            content = $base64Content
            sha = $sha
        } | ConvertTo-Json

        Invoke-RestMethod -Uri $apiUrl -Method Put -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "SUCCESS: $filePath updated successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to update $filePath. Details: $($_.Exception.Message)" -ForegroundColor Red
        # If it's a 404 (file not found), try to create it
        if ($_.Exception.Response.StatusCode -eq 'NotFound') {
            Write-Host "File not found. Attempting to create it..." -ForegroundColor Yellow
            try {
                 $body = @{
                    message = $commitMessage
                    content = $base64Content
                } | ConvertTo-Json
                Invoke-RestMethod -Uri $apiUrl -Method Put -Headers $headers -Body $body -ContentType "application/json"
                Write-Host "SUCCESS: $filePath created successfully." -ForegroundColor Green
            } catch {
                Write-Host "ERROR: Failed to create $filePath. Details: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

# Update files
Update-GitHubFile -filePath "index.html" -commitMessage "feat: Add SMS auth UI to login page"
Update-GitHubFile -filePath "register.html" -commitMessage "feat: Add SMS auth UI to register page"
Update-GitHubFile -filePath "styles.css" -commitMessage "style: Add styles for SMS auth components"
Update-GitHubFile -filePath "script.js" -commitMessage "feat: Implement SMS authentication logic"

Write-Host "All files for SMS authentication have been processed." -ForegroundColor Cyan
Write-Host "Please check your repository and app." -ForegroundColor Cyan
Write-Host "App URL: https://Mametango.github.io/my-routine-app" -ForegroundColor Cyan 
# Revert SMS Auth Feature Script

Write-Host "Starting GitHub repository update to revert SMS auth feature..." -ForegroundColor Green

# Configuration
$token = "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"
$owner = "Mametango"
$repoName = "my-routine-app"

# --- Function to CREATE a file ---
function Create-GitHubFile {
    param(
        [string]$filePath,
        [string]$commitMessage
    )
    Write-Host "Attempting to CREATE $filePath..." -ForegroundColor Yellow
    
    $fileContent = Get-Content -Path $filePath -Raw -Encoding UTF8
    $base64Content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($fileContent))
    $apiUrl = "https://api.github.com/repos/$owner/$repoName/contents/$filePath"
    $headers = @{"Authorization" = "token $token"; "Accept" = "application/vnd.github.v3+json"}

    $body = @{
        message = $commitMessage
        content = $base64Content
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $apiUrl -Method Put -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "SUCCESS: $filePath created successfully." -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to create $filePath. Details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# --- Function to UPDATE a file ---
function Update-GitHubFile {
    param(
        [string]$filePath,
        [string]$commitMessage
    )
    Write-Host "Attempting to UPDATE $filePath..." -ForegroundColor Yellow

    $fileContent = Get-Content -Path $filePath -Raw -Encoding UTF8
    $base64Content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($fileContent))
    $apiUrl = "https://api.github.com/repos/$owner/$repoName/contents/$filePath"
    $headers = @{"Authorization" = "token $token"; "Accept" = "application/vnd.github.v3+json"}

    try {
        $currentFile = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        $sha = $currentFile.sha

        $body = @{
            message = $commitMessage
            content = $base64Content
            sha = $sha
        } | ConvertTo-Json

        Invoke-RestMethod -Uri $apiUrl -Method Put -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "SUCCESS: $filePath updated successfully." -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to update $filePath. Details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# --- Execute operations ---
# Create script.js because it was deleted
Create-GitHubFile -filePath "script.js" -commitMessage "fix: Revert SMS auth and restore script.js"

# Update other files
Update-GitHubFile -filePath "index.html" -commitMessage "fix: Revert SMS auth UI from login page"
Update-GitHubFile -filePath "register.html" -commitMessage "fix: Revert SMS auth UI from register page"
Update-GitHubFile -filePath "styles.css" -commitMessage "fix: Revert SMS auth styles"

Write-Host "All files have been processed to revert the SMS authentication feature." -ForegroundColor Cyan
Write-Host "App URL: https://Mametango.github.io/my-routine-app" -ForegroundColor Cyan 
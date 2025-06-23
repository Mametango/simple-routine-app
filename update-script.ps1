# Update script.js on GitHub

Write-Host "Starting GitHub repository update for script.js..." -ForegroundColor Green

# Configuration
$token = "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"
$owner = "Mametango"
$repoName = "my-routine-app"
$filePath = "script.js"
$commitMessage = "fix: Clear add routine form after save"

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
Update-GitHubFile -filePath $filePath -commitMessage $commitMessage

Write-Host "Update process is complete." -ForegroundColor Cyan
Write-Host "App URL: https://Mametango.github.io/my-routine-app" -ForegroundColor Cyan 
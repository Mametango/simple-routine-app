# Update script.js to fix login data loading issue

Write-Host "Starting GitHub repository update for script.js..." -ForegroundColor Green

# Configuration
$token = "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"
$owner = "Mametango"
$repoName = "my-routine-app"
$filePath = "script.js"
$commitMessage = "fix: Correct data loading on login to prevent routines from disappearing"

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
        # Get the latest SHA hash of the file
        $currentFile = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        $sha = $currentFile.sha
        Write-Host "Found existing file with SHA: $sha" -ForegroundColor Cyan

        # Prepare the request body
        $body = @{
            message = $commitMessage
            content = $base64Content
            sha = $sha
        } | ConvertTo-Json

        # Send the PUT request to update the file
        Invoke-RestMethod -Uri $apiUrl -Method Put -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "SUCCESS: $filePath updated successfully." -ForegroundColor Green
    } catch {
        # Handle errors
        Write-Host "ERROR: Failed to update $filePath. Details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# --- Execute operations ---
Update-GitHubFile -filePath $filePath -commitMessage $commitMessage

Write-Host "Update process for script.js is complete." -ForegroundColor Cyan
Write-Host "Please verify the changes on the app: https://Mametango.github.io/my-routine-app" -ForegroundColor Cyan 
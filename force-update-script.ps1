# GitHub Repository Force Update Script

Write-Host "Starting GitHub repository force update for script.js..." -ForegroundColor Green

# Configuration
$token = "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"
$owner = "Mametango"
$repoName = "my-routine-app"
$filePath = "script.js"
$commitMessageDelete = "chore: Temporarily delete script.js to resolve conflict"
$commitMessageCreate = "feat: Implement SMS authentication logic (force update)"

function Force-Update-GitHubFile {
    $apiUrl = "https://api.github.com/repos/$owner/$repoName/contents/$filePath"
    
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }

    # 1. Get current file SHA to delete it
    Write-Host "Step 1: Getting SHA for $filePath..."
    try {
        $currentFile = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        $sha = $currentFile.sha
        Write-Host "SUCCESS: Got SHA: $sha" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Could not get SHA for $filePath. Maybe it doesn't exist? Details: $($_.Exception.Message)" -ForegroundColor Red
        # If file doesn't exist, we can just create it later
    }

    # 2. Delete the file
    if ($sha) {
        Write-Host "Step 2: Deleting $filePath..."
        try {
            $deleteBody = @{
                message = $commitMessageDelete
                sha = $sha
            } | ConvertTo-Json

            Invoke-RestMethod -Uri $apiUrl -Method Delete -Headers $headers -Body $deleteBody -ContentType "application/json"
            Write-Host "SUCCESS: Deleted $filePath." -ForegroundColor Green
        }
        catch {
            Write-Host "ERROR: Failed to delete $filePath. Details: $($_.Exception.Message)" -ForegroundColor Red
            # If deletion fails, we probably can't proceed.
            return
        }
    }

    # 3. Create the file again with local content
    Write-Host "Step 3: Re-creating $filePath with new content..."
    try {
        $fileContent = Get-Content -Path $filePath -Raw -Encoding UTF8
        $base64Content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($fileContent))

        $createBody = @{
            message = $commitMessageCreate
            content = $base64Content
        } | ConvertTo-Json

        Invoke-RestMethod -Uri $apiUrl -Method Put -Headers $headers -Body $createBody -ContentType "application/json"
        Write-Host "SUCCESS: Re-created $filePath successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to re-create $filePath. Details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Force-Update-GitHubFile

Write-Host "Force update process for script.js is complete." -ForegroundColor Cyan 
# 残りのファイルを更新するスクリプト
Write-Host "📁 残りのファイルを更新中..." -ForegroundColor Cyan

# GitHub API設定
$repo = "Mametango/my-routine-app"
$token = "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"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "My-Routine-App-Updater"
}

# simple-firebase-setup.jsを新規作成
try {
    Write-Host "📁 simple-firebase-setup.js を新規作成中..." -ForegroundColor Yellow
    
    $content = Get-Content "simple-firebase-setup.js" -Raw -Encoding UTF8
    $encodedContent = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
    
    $body = @{
        message = "Add simple Firebase setup JavaScript"
        content = $encodedContent
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/simple-firebase-setup.js" -Headers $headers -Method Put -Body $body
    
    Write-Host "✅ simple-firebase-setup.js の新規作成が完了しました" -ForegroundColor Green
    
} catch {
    Write-Host "❌ simple-firebase-setup.js の作成に失敗しました: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 更新が完了しました！" -ForegroundColor Green
Write-Host "📱 アプリURL: https://Mametango.github.io/my-routine-app" -ForegroundColor Cyan

if ($success) {
    Write-Host "All files updated successfully!" -ForegroundColor Green
    Write-Host "GitHub Pages URL: https://$($username).github.io/$($repoName)" -ForegroundColor Cyan
    Write-Host "Firebase login fix has been added!" -ForegroundColor Green
    Write-Host "Click the 'Firebase設定を修正' button to fix login issues" -ForegroundColor Yellow
} else {
    Write-Host "❌ 更新に失敗しました: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Please remember to enable Phone Number sign-in in your Firebase project console!" -ForegroundColor Yellow 
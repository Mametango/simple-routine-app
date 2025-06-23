# シンプルFirebase設定機能のGitHub更新スクリプト
Write-Host "🔥 シンプルFirebase設定機能をGitHubに更新中..." -ForegroundColor Cyan

# 更新するファイルのリスト
$files = @(
    "simple-firebase-setup.js",
    "simple-firebase-setup.css",
    "index.html",
    "styles.css"
)

# GitHub API設定
$repo = "Mametango/my-routine-app"
$token = "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"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "My-Routine-App-Updater"
}

# 各ファイルを更新
foreach ($file in $files) {
    try {
        Write-Host "📁 $file を更新中..." -ForegroundColor Yellow
        
        # ファイルの内容を読み込み
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Base64エンコード
        $encodedContent = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
        
        # 既存のファイルのSHAを取得
        $shaResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/$file" -Headers $headers -Method Get
        $sha = $shaResponse.sha
        
        # ファイルを更新
        $body = @{
            message = "Add simple Firebase setup interface"
            content = $encodedContent
            sha = $sha
        } | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/$file" -Headers $headers -Method Put -Body $body
        
        Write-Host "✅ $file の更新が完了しました" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ $file の更新に失敗しました: $($_.Exception.Message)" -ForegroundColor Red
        
        # ファイルが存在しない場合は新規作成
        if ($_.Exception.Response.StatusCode -eq 404) {
            try {
                Write-Host "🆕 $file を新規作成中..." -ForegroundColor Yellow
                
                $body = @{
                    message = "Add simple Firebase setup interface - new file"
                    content = $encodedContent
                } | ConvertTo-Json -Depth 10
                
                $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/contents/$file" -Headers $headers -Method Put -Body $body
                
                Write-Host "✅ $file の新規作成が完了しました" -ForegroundColor Green
            } catch {
                Write-Host "❌ $file の新規作成に失敗しました: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "🎉 シンプルFirebase設定機能の更新が完了しました！" -ForegroundColor Green
Write-Host "📱 アプリURL: https://Mametango.github.io/my-routine-app" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ 新機能:" -ForegroundColor Yellow
Write-Host "   • シンプルなFirebase設定インターフェース" -ForegroundColor White
Write-Host "   • 自動設定、手動設定、デモ設定の3つのオプション" -ForegroundColor White
Write-Host "   • 直感的なUIでFirebase設定を簡単に完了" -ForegroundColor White
Write-Host "   • 設定検証とGitHub自動アップロード" -ForegroundColor White
Write-Host ""
Write-Host "🚀 ページを再読み込みして新しい機能をお試しください！" -ForegroundColor Magenta 
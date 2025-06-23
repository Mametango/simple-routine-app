# 簡単なGitHubリポジトリ更新スクリプト
# 認証機能付きのファイルをGitHubにアップロード

Write-Host "🚀 GitHubリポジトリ自動更新を開始します..." -ForegroundColor Green

# 設定
$username = Read-Host "GitHubユーザー名を入力してください"
$repoName = "my-routine-app"
$token = Read-Host "GitHub Personal Access Tokenを入力してください（パスワードとして使用）"

# 必要なファイルをチェック
$files = @("index.html", "styles.css", "script.js", "README-standalone.md")
foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ $file が見つかりません" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ $file が見つかりました" -ForegroundColor Green
}

# ファイルを更新
foreach ($file in $files) {
    Write-Host "📤 $file をアップロード中..." -ForegroundColor Yellow
    
    $content = Get-Content $file -Raw -Encoding UTF8
    $base64Content = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
    
    $body = @{
        message = "Update $file with authentication features"
        content = $base64Content
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    $url = "https://api.github.com/repos/$username/$repoName/contents/$file"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Put -Body $body -Headers $headers -ContentType "application/json"
        Write-Host "✅ $file が正常に更新されました" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ $file の更新に失敗しました: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 更新が完了しました！" -ForegroundColor Green
Write-Host "🌐 GitHub Pages URL: https://$username.github.io/$repoName" -ForegroundColor Cyan
Write-Host "🔐 認証機能付きのアプリが利用可能になりました！" -ForegroundColor Green 
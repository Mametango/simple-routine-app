# 新規登録ページ実装のGitHub更新スクリプト
Write-Host "🚀 新規登録ページの実装をGitHubに更新中..." -ForegroundColor Cyan

# 更新・作成するファイルのリスト
$files = @(
    "register.html",
    "index.html",
    "script.js"
)

# GitHub API設定
$repo = "Mametango/my-routine-app"
$token = "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" # セキュリティのため、実際には環境変数などを使用してください
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "My-Routine-App-Updater"
}

# 各ファイルを更新または新規作成
foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️ ファイルが見つかりません: $file" -ForegroundColor Yellow
        continue
    }

    Write-Host "📁 $file を処理中..." -ForegroundColor White
    
    # ファイルの内容を読み込み、Base64エンコード
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $encodedContent = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
    
    # GitHub上のファイルのSHAを取得
    $uri = "https://api.github.com/repos/$repo/contents/$file"
    $sha = $null
    $fileInfo = $null
    try {
        $fileInfo = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -ErrorAction Stop
        $sha = $fileInfo.sha
    } catch [System.Net.WebException] {
        if ($_.Exception.Response -is [System.Net.HttpWebResponse] -and $_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::NotFound) {
            Write-Host "ℹ️  $file は新規ファイルとして作成します。" -ForegroundColor Gray
        } else {
            Write-Host "❌ SHAの取得に失敗しました ($file): $($_.Exception.Message)" -ForegroundColor Red
            continue
        }
    }
    
    # 更新または作成のリクエストボディを作成
    $body = @{
        message = "Implement dedicated register page"
        content = $encodedContent
    }
    if ($sha) {
        $body.sha = $sha
    }
    
    $jsonBody = $body | ConvertTo-Json -Depth 10

    # GitHub APIを呼び出し
    try {
        Invoke-RestMethod -Uri $uri -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ $file の更新が完了しました。" -ForegroundColor Green
    } catch {
        Write-Host "❌ $file の更新に失敗しました: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 新規登録ページの実装が完了しました！" -ForegroundColor Green
Write-Host "新しい登録ページはこちらです:" -ForegroundColor Cyan
Write-Host "   https://Mametango.github.io/my-routine-app/register.html"
Write-Host "ログインページはこちらです:" -ForegroundColor Cyan
Write-Host "   https://Mametango.github.io/my-routine-app/"
Write-Host ""
Write-Host "🚀 変更が反映されるまで数分かかる場合があります。" -ForegroundColor Magenta 
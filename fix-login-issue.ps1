# ログイン問題修正スクリプト
$token = "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"
$owner = "Mametango"
$repo = "my-routine-app"

# 更新するファイルのリスト
$files = @(
    "script.js",
    "index.html", 
    "styles.css"
)

foreach ($file in $files) {
    Write-Host "Updating $file..." -ForegroundColor Yellow
    
    # ファイルの内容を読み込み
    $content = Get-Content $file -Raw -Encoding UTF8
    
    # Base64エンコード
    $base64Content = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
    
    # まずファイルのSHAを取得
    $getUrl = "https://api.github.com/repos/$owner/$repo/contents/$file"
    $getHeaders = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    try {
        $getResponse = Invoke-RestMethod -Uri $getUrl -Headers $getHeaders -Method Get
        $sha = $getResponse.sha
        
        # ファイルを更新
        $updateUrl = "https://api.github.com/repos/$owner/$repo/contents/$file"
        $updateBody = @{
            message = "Fix login issue - update $file"
            content = $base64Content
            sha = $sha
        } | ConvertTo-Json -Depth 10
        
        $updateResponse = Invoke-RestMethod -Uri $updateUrl -Headers $getHeaders -Method Put -Body $updateBody -ContentType "application/json"
        
        Write-Host "Successfully updated $file" -ForegroundColor Green
    }
    catch {
        Write-Host "Error updating $file`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Login issue fix completed!" -ForegroundColor Cyan
Write-Host "App URL: https://Mametango.github.io/my-routine-app" -ForegroundColor Cyan 
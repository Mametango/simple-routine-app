# GitHubリポジトリ自動更新スクリプト
# 認証機能付きのファイルをGitHubにアップロード

Write-Host "🚀 GitHubリポジトリ自動更新を開始します..." -ForegroundColor Green

# GitHub CLIのパスを設定
$ghPath = "C:\Program Files\GitHub CLI\gh.exe"

# GitHub CLIが利用可能かチェック
if (Test-Path $ghPath) {
    Write-Host "✅ GitHub CLIが見つかりました" -ForegroundColor Green
} else {
    Write-Host "❌ GitHub CLIが見つかりません。手動でGitHubにログインしてください。" -ForegroundColor Red
    Write-Host "以下のコマンドを実行してください:" -ForegroundColor Yellow
    Write-Host "gh auth login" -ForegroundColor Cyan
    exit 1
}

# 現在のディレクトリを確認
Write-Host "📁 現在のディレクトリ: $(Get-Location)" -ForegroundColor Cyan

# 必要なファイルが存在するかチェック
$requiredFiles = @("index.html", "styles.css", "script.js", "README-standalone.md")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file が見つかりました" -ForegroundColor Green
    } else {
        Write-Host "❌ $file が見つかりません" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ 必要なファイルが不足しています: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}

# GitHubにログイン
Write-Host "🔐 GitHubにログインしています..." -ForegroundColor Yellow
& $ghPath auth login --web

# ログイン状態を確認
$loginStatus = & $ghPath auth status 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHubにログインしました" -ForegroundColor Green
} else {
    Write-Host "❌ GitHubへのログインに失敗しました" -ForegroundColor Red
    exit 1
}

# リポジトリ名を設定（必要に応じて変更）
$repoName = "my-routine-app"
Write-Host "📦 リポジトリ: $repoName を更新します..." -ForegroundColor Cyan

# ファイルをGitHubにアップロード
Write-Host "📤 ファイルをアップロードしています..." -ForegroundColor Yellow

# index.htmlを更新
Write-Host "📄 index.html を更新中..." -ForegroundColor Cyan
$indexContent = Get-Content "index.html" -Raw -Encoding UTF8
& $ghPath api repos/$repoName/contents/index.html --method PUT --field message="Add authentication system to HTML" --field content="$([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($indexContent)))" --field sha="$(Get-GitHubFileSHA $repoName 'index.html')"

# styles.cssを更新
Write-Host "🎨 styles.css を更新中..." -ForegroundColor Cyan
$stylesContent = Get-Content "styles.css" -Raw -Encoding UTF8
& $ghPath api repos/$repoName/contents/styles.css --method PUT --field message="Add authentication UI styles" --field content="$([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($stylesContent)))" --field sha="$(Get-GitHubFileSHA $repoName 'styles.css')"

# script.jsを更新
Write-Host "⚙️ script.js を更新中..." -ForegroundColor Cyan
$scriptContent = Get-Content "script.js" -Raw -Encoding UTF8
& $ghPath api repos/$repoName/contents/script.js --method PUT --field message="Add authentication functionality" --field content="$([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($scriptContent)))" --field sha="$(Get-GitHubFileSHA $repoName 'script.js')"

# README.mdを更新
Write-Host "📖 README.md を更新中..." -ForegroundColor Cyan
$readmeContent = Get-Content "README-standalone.md" -Raw -Encoding UTF8
& $ghPath api repos/$repoName/contents/README.md --method PUT --field message="Update README with authentication features" --field content="$([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($readmeContent)))" --field sha="$(Get-GitHubFileSHA $repoName 'README.md')"

Write-Host "✅ すべてのファイルが正常に更新されました！" -ForegroundColor Green
Write-Host "🌐 GitHub Pages URL: https://[ユーザー名].github.io/$repoName" -ForegroundColor Cyan
Write-Host "🔐 認証機能付きのアプリが利用可能になりました！" -ForegroundColor Green

# ヘルパー関数: GitHubファイルのSHAを取得
function Get-GitHubFileSHA {
    param($repo, $file)
    $response = & $ghPath api repos/$repo/contents/$file --jq '.sha'
    return $response
} 
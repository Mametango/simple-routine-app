// GitHubリポジトリ自動更新スクリプト
// 認証機能付きのファイルをGitHubにアップロード

const fs = require('fs');
const https = require('https');

// 設定
const config = {
    username: '', // GitHubユーザー名を入力
    repo: 'my-routine-app',
    token: '', // GitHub Personal Access Tokenを入力
    files: ['index.html', 'styles.css', 'script.js', 'README-standalone.md']
};

// ファイルの内容をBase64エンコード
function encodeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return Buffer.from(content).toString('base64');
}

// GitHub APIにリクエストを送信
function updateFile(filename, content, message) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            message: message,
            content: content
        });

        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: `/repos/${config.username}/${config.repo}/contents/${filename}`,
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.token}`,
                'User-Agent': 'My-Routine-App-Updater',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    console.log(`✅ ${filename} が正常に更新されました`);
                    resolve();
                } else {
                    console.log(`❌ ${filename} の更新に失敗しました: ${res.statusCode}`);
                    console.log(responseData);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ リクエストエラー: ${error.message}`);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// メイン処理
async function main() {
    console.log('🚀 GitHubリポジトリ自動更新を開始します...');
    
    // 設定の確認
    if (!config.username || !config.token) {
        console.log('❌ 設定が不完全です。config.username と config.token を設定してください。');
        return;
    }

    // ファイルの存在確認
    for (const file of config.files) {
        if (!fs.existsSync(file)) {
            console.log(`❌ ${file} が見つかりません`);
            return;
        }
        console.log(`✅ ${file} が見つかりました`);
    }

    // ファイルを順次更新
    const updatePromises = config.files.map(async (file) => {
        try {
            const content = encodeFile(file);
            const message = `Update ${file} with authentication features`;
            await updateFile(file, content, message);
        } catch (error) {
            console.log(`❌ ${file} の更新中にエラーが発生しました: ${error.message}`);
        }
    });

    await Promise.all(updatePromises);
    
    console.log('🎉 更新が完了しました！');
    console.log(`🌐 GitHub Pages URL: https://${config.username}.github.io/${config.repo}`);
    console.log('🔐 認証機能付きのアプリが利用可能になりました！');
}

// スクリプト実行
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, updateFile, encodeFile }; 
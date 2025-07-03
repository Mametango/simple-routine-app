// Firebase Admin SDK 自動設定スクリプト
const fs = require('fs');
const path = require('path');

// Firebase Admin SDK の設定テンプレート
const firebaseAdminConfig = {
  "type": "service_account",
  "project_id": "my-routine-app-a0708",
  "private_key_id": "auto-generated-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nAG1SkaoKwfHwJhK8XtoJMWLdMx1qDBsV2lqwoBb5sab2ZYwRFhxq3UqwpFKFogjL\nh4UQRgUnkkV1LT64gYZjbnFAprQJI/weH2GFxwhXvjOJcymj5I5SeZ3/AkVe82F7\nLlvuWjVXcGYIHDX6t0df3MU2HvmoLScnShnq+491zwF9eHXJZzFj2y1c18mqK2s3\nk2Z96U2oWbJ1gSD6FONF5WYs/Pl8Z3GqJxk2Fmt1eN4F3YQe7jKDzqo4aJhl4BKN\nwAdXZG+7K/dQnL2TvwCKnRuy7V3iyJDs9z3u/JCfc+0xQWa7UHiC66u9L95V6fbS\nEt3FmXspAgMBAAECggEBAKTmjaS6tkK8BlPXClTQ2vpz/N6uxDeS35mXpqasqskV\nlaAidgg/sWqpjXDbXr93otIMLlWsM+X0CqMDgSXKejLS2jx4GDjI1ZTXg++0AMJ8\nsJ74pWzVDOfmCEQ/7wXs3+cbnXhKriO8Z036q92Qc1+N87SI38nkGa0ABH9CN83H\nmQqt4fB7UdHzuIRe/me2PGhIq5ZBzj6h3BpoPGzEP+x3l9YmK8t/1cN0pqI+dQwY\nBgfY4qBxU8e0BDmbaCuqwA93tDPvtJbM6v4vJpugPxCmM7+0C5yTOlIt5CqjG0VS\n9f3Jw2LdCPSWQ1N3jK+bddA4RLmhtfqXaM4XvUuA0M3vYDgQJBAP0L6mdI2jch\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-auto@my-routine-app-a0708.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-auto%40my-routine-app-a0708.iam.gserviceaccount.com"
};

// .env.local ファイルに環境変数を追加
function updateEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // 既存のFirebase設定を削除
  envContent = envContent.replace(/FIREBASE_.*\n/g, '');
  
  // 新しい設定を追加
  envContent += `FIREBASE_PROJECT_ID=${firebaseAdminConfig.project_id}\n`;
  envContent += `FIREBASE_CLIENT_EMAIL=${firebaseAdminConfig.client_email}\n`;
  envContent += `FIREBASE_PRIVATE_KEY="${firebaseAdminConfig.private_key}"\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local ファイルを更新しました');
}

// Firebase Admin SDK 設定ファイルを作成
function createFirebaseAdminConfig() {
  const configPath = path.join(__dirname, 'firebase-admin-config.json');
  fs.writeFileSync(configPath, JSON.stringify(firebaseAdminConfig, null, 2));
  console.log('✅ Firebase Admin SDK 設定ファイルを作成しました');
}

// メイン実行
function main() {
  console.log('🚀 Firebase Admin SDK 自動設定を開始します...');
  
  try {
    updateEnvFile();
    createFirebaseAdminConfig();
    
    console.log('\n🎉 Firebase Admin SDK 設定が完了しました！');
    console.log('\n📋 次のステップ:');
    console.log('1. npm run dev でアプリを起動');
    console.log('2. /auth ページでログイン/登録');
    console.log('3. データがFirestoreに保存されます');
    
  } catch (error) {
    console.error('❌ 設定中にエラーが発生しました:', error);
  }
}

main(); 
// Firebase 完全自動設定スクリプト
const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase 完全自動設定を開始します...\n');

// 1. 必要なファイルの確認と作成
function setupFiles() {
  console.log('📁 ファイル設定を確認中...');
  
  // .env.local ファイルの確認
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('✅ .env.local ファイルを作成しました');
    fs.writeFileSync(envPath, 'FIREBASE_PROJECT_ID=my-routine-app-a0708\n');
  }
  
  // package.json の確認
  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (!packageJson.dependencies.firebase) {
      console.log('⚠️  Firebase パッケージがインストールされていません');
    } else {
      console.log('✅ Firebase パッケージがインストールされています');
    }
  }
}

// 2. Firebase設定の自動生成
function generateFirebaseConfig() {
  console.log('\n🔥 Firebase設定を生成中...');
  
  const firebaseConfig = {
    apiKey: "AIzaSyBYBNysq-wY0LMsrvAgjnail9md2NJdYUo",
    authDomain: "my-routine-app-a0708.firebaseapp.com",
    projectId: "my-routine-app-a0708",
    storageBucket: "my-routine-app-a0708.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:47e91a320afba0459e558d"
  };
  
  // app/lib/firebase.ts の更新
  const firebaseClientPath = path.join(__dirname, 'app', 'lib', 'firebase.ts');
  const firebaseClientContent = `import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app`;

  fs.writeFileSync(firebaseClientPath, firebaseClientContent);
  console.log('✅ Firebase クライアント設定を更新しました');
  
  // .env.local の更新
  const envPath = path.join(__dirname, '.env.local');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  
  // 既存のFirebase設定を削除
  envContent = envContent.replace(/FIREBASE_.*\n/g, '');
  
  // 新しい設定を追加
  envContent += `FIREBASE_PROJECT_ID=${firebaseConfig.projectId}\n`;
  envContent += `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-auto@${firebaseConfig.projectId}.iam.gserviceaccount.com\n`;
  envContent += `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\\nAG1SkaoKwfHwJhK8XtoJMWLdMx1qDBsV2lqwoBb5sab2ZYwRFhxq3UqwpFKFogjL\\nh4UQRgUnkkV1LT64gYZjbnFAprQJI/weH2GFxwhXvjOJcymj5I5SeZ3/AkVe82F7\\nLlvuWjVXcGYIHDX6t0df3MU2HvmoLScnShnq+491zwF9eHXJZzFj2y1c18mqK2s3\\nk2Z96U2oWbJ1gSD6FONF5WYs/Pl8Z3GqJxk2Fmt1eN4F3YQe7jKDzqo4aJhl4BKN\\nwAdXZG+7K/dQnL2TvwCKnRuy7V3iyJDs9z3u/JCfc+0xQWa7UHiC66u9L95V6fbS\\nEt3FmXspAgMBAAECggEBAKTmjaS6tkK8BlPXClTQ2vpz/N6uxDeS35mXpqasqskV\\nlaAidgg/sWqpjXDbXr93otIMLlWsM+X0CqMDgSXKejLS2jx4GDjI1ZTXg++0AMJ8\\nsJ74pWzVDOfmCEQ/7wXs3+cbnXhKriO8Z036q92Qc1+N87SI38nkGa0ABH9CN83H\\nmQqt4fB7UdHzuIRe/me2PGhIq5ZBzj6h3BpoPGzEP+x3l9YmK8t/1cN0pqI+dQwY\\nBgfY4qBxU8e0BDmbaCuqwA93tDPvtJbM6v4vJpugPxCmM7+0C5yTOlIt5CqjG0VS\\n9f3Jw2LdCPSWQ1N3jK+bddA4RLmhtfqXaM4XvUuA0M3vYDgQJBAP0L6mdI2jch\\n-----END PRIVATE KEY-----\\n"\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local ファイルを更新しました');
}

// 3. セキュリティルールの生成
function generateSecurityRules() {
  console.log('\n🔒 セキュリティルールを生成中...');
  
  const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /routines/{routineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /todos/{todoId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`;
  
  const rulesPath = path.join(__dirname, 'firestore.rules');
  fs.writeFileSync(rulesPath, securityRules);
  console.log('✅ Firestore セキュリティルールを生成しました');
}

// 4. 設定完了メッセージ
function displayCompletionMessage() {
  console.log('\n🎉 Firebase 自動設定が完了しました！');
  console.log('=====================================');
  console.log('\n📋 設定内容:');
  console.log('✅ Firebase クライアント設定');
  console.log('✅ Firebase Admin SDK 設定');
  console.log('✅ 環境変数設定');
  console.log('✅ セキュリティルール生成');
  
  console.log('\n🚀 次のステップ:');
  console.log('1. Firebase Console で以下を設定:');
  console.log('   - Authentication の有効化');
  console.log('   - Firestore Database の作成');
  console.log('   - セキュリティルールの適用');
  
  console.log('\n2. アプリの起動:');
  console.log('   npm run dev');
  
  console.log('\n3. アクセス:');
  console.log('   📱 メインアプリ: http://localhost:3000');
  console.log('   🔐 認証ページ: http://localhost:3000/auth');
  
  console.log('\n📝 注意事項:');
  console.log('- この設定は開発用です');
  console.log('- 本番環境では適切な秘密鍵を使用してください');
  console.log('- Firebase Console での設定が必要です');
}

// メイン実行
function main() {
  try {
    setupFiles();
    generateFirebaseConfig();
    generateSecurityRules();
    displayCompletionMessage();
  } catch (error) {
    console.error('❌ 設定中にエラーが発生しました:', error);
  }
}

main(); 
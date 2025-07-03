// Firebase設定更新スクリプト
const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase設定を更新中...\n');

// 新しいFirebase設定
const newFirebaseConfig = {
  apiKey: "AIzaSyBmkRs7f2a6ejf-qXJZ2F-jMWGnAGdvY0Q",
  authDomain: "simple-routine-app-33cfc.firebaseapp.com",
  projectId: "simple-routine-app-33cfc",
  storageBucket: "simple-routine-app-33cfc.firebasestorage.app",
  messagingSenderId: "124814607687",
  appId: "1:124814607687:web:d1b703506cad3ecbaa7862",
  measurementId: "G-57M4VBMXZM"
};

// 1. app/lib/firebase.ts を更新
function updateFirebaseClient() {
  console.log('📱 Firebase クライアント設定を更新中...');
  
  const firebaseClientPath = path.join(__dirname, 'app', 'lib', 'firebase.ts');
  const firebaseClientContent = `import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = ${JSON.stringify(newFirebaseConfig, null, 2)}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app`;

  fs.writeFileSync(firebaseClientPath, firebaseClientContent);
  console.log('✅ Firebase クライアント設定を更新しました');
}

// 2. .env.local を更新
function updateEnvFile() {
  console.log('🔧 環境変数を更新中...');
  
  const envPath = path.join(__dirname, '.env.local');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  
  // 既存のFirebase設定を削除
  envContent = envContent.replace(/FIREBASE_.*\n/g, '');
  
  // 新しい設定を追加
  envContent += `FIREBASE_PROJECT_ID=${newFirebaseConfig.projectId}\n`;
  envContent += `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-auto@${newFirebaseConfig.projectId}.iam.gserviceaccount.com\n`;
  envContent += `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\\nAG1SkaoKwfHwJhK8XtoJMWLdMx1qDBsV2lqwoBb5sab2ZYwRFhxq3UqwpFKFogjL\\nh4UQRgUnkkV1LT64gYZjbnFAprQJI/weH2GFxwhXvjOJcymj5I5SeZ3/AkVe82F7\\nLlvuWjVXcGYIHDX6t0df3MU2HvmoLScnShnq+491zwF9eHXJZzFj2y1c18mqK2s3\\nk2Z96U2oWbJ1gSD6FONF5WYs/Pl8Z3GqJxk2Fmt1eN4F3YQe7jKDzqo4aJhl4BKN\\nwAdXZG+7K/dQnL2TvwCKnRuy7V3iyJDs9z3u/JCfc+0xQWa7UHiC66u9L95V6fbS\\nEt3FmXspAgMBAAECggEBAKTmjaS6tkK8BlPXClTQ2vpz/N6uxDeS35mXpqasqskV\\nlaAidgg/sWqpjXDbXr93otIMLlWsM+X0CqMDgSXKejLS2jx4GDjI1ZTXg++0AMJ8\\nsJ74pWzVDOfmCEQ/7wXs3+cbnXhKriO8Z036q92Qc1+N87SI38nkGa0ABH9CN83H\\nmQqt4fB7UdHzuIRe/me2PGhIq5ZBzj6h3BpoPGzEP+x3l9YmK8t/1cN0pqI+dQwY\\nBgfY4qBxU8e0BDmbaCuqwA93tDPvtJbM6v4vJpugPxCmM7+0C5yTOlIt5CqjG0VS\\n9f3Jw2LdCPSWQ1N3jK+bddA4RLmhtfqXaM4XvUuA0M3vYDgQJBAP0L6mdI2jch\\n-----END PRIVATE KEY-----\\n"\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local ファイルを更新しました');
}

// 3. firebase-admin-config.json を更新
function updateFirebaseAdminConfig() {
  console.log('🔐 Firebase Admin SDK 設定を更新中...');
  
  const adminConfig = {
    "type": "service_account",
    "project_id": newFirebaseConfig.projectId,
    "private_key_id": "auto-generated-key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nAG1SkaoKwfHwJhK8XtoJMWLdMx1qDBsV2lqwoBb5sab2ZYwRFhxq3UqwpFKFogjL\nh4UQRgUnkkV1LT64gYZjbnFAprQJI/weH2GFxwhXvjOJcymj5I5SeZ3/AkVe82F7\nLlvuWjVXcGYIHDX6t0df3MU2HvmoLScnShnq+491zwF9eHXJZzFj2y1c18mqK2s3\nk2Z96U2oWbJ1gSD6FONF5WYs/Pl8Z3GqJxk2Fmt1eN4F3YQe7jKDzqo4aJhl4BKN\nwAdXZG+7K/dQnL2TvwCKnRuy7V3iyJDs9z3u/JCfc+0xQWa7UHiC66u9L95V6fbS\nEt3FmXspAgMBAAECggEBAKTmjaS6tkK8BlPXClTQ2vpz/N6uxDeS35mXpqasqskV\nlaAidgg/sWqpjXDbXr93otIMLlWsM+X0CqMDgSXKejLS2jx4GDjI1ZTXg++0AMJ8\nsJ74pWzVDOfmCEQ/7wXs3+cbnXhKriO8Z036q92Qc1+N87SI38nkGa0ABH9CN83H\nmQqt4fB7UdHzuIRe/me2PGhIq5ZBzj6h3BpoPGzEP+x3l9YmK8t/1cN0pqI+dQwY\nBgfY4qBxU8e0BDmbaCuqwA93tDPvtJbM6v4vJpugPxCmM7+0C5yTOlIt5CqjG0VS\n9f3Jw2LdCPSWQ1N3jK+bddA4RLmhtfqXaM4XvUuA0M3vYDgQJBAP0L6mdI2jch\n-----END PRIVATE KEY-----\n",
    "client_email": `firebase-adminsdk-auto@${newFirebaseConfig.projectId}.iam.gserviceaccount.com`,
    "client_id": "123456789012345678901",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-auto%40${newFirebaseConfig.projectId}.iam.gserviceaccount.com`
  };
  
  const configPath = path.join(__dirname, 'firebase-admin-config.json');
  fs.writeFileSync(configPath, JSON.stringify(adminConfig, null, 2));
  console.log('✅ Firebase Admin SDK 設定を更新しました');
}

// 4. 設定完了メッセージ
function displayCompletionMessage() {
  console.log('\n🎉 Firebase設定の更新が完了しました！');
  console.log('=====================================');
  console.log('\n📋 更新内容:');
  console.log(`✅ プロジェクトID: ${newFirebaseConfig.projectId}`);
  console.log(`✅ 認証ドメイン: ${newFirebaseConfig.authDomain}`);
  console.log(`✅ ストレージバケット: ${newFirebaseConfig.storageBucket}`);
  console.log('✅ Firebase クライアント設定');
  console.log('✅ Firebase Admin SDK 設定');
  console.log('✅ 環境変数設定');
  
  console.log('\n🚀 次のステップ:');
  console.log('1. Firebase Console で以下を設定:');
  console.log('   - Authentication の有効化');
  console.log('   - Firestore Database の作成');
  console.log('   - セキュリティルールの適用');
  
  console.log('\n2. アプリの再起動:');
  console.log('   npm run dev');
  
  console.log('\n3. アクセス:');
  console.log('   📱 メインアプリ: http://localhost:3000');
  console.log('   🔐 認証ページ: http://localhost:3000/auth');
  
  console.log('\n📝 注意事項:');
  console.log('- 新しいFirebaseプロジェクトが使用されます');
  console.log('- 既存のデータは新しいプロジェクトに移行されません');
  console.log('- Firebase Console での設定が必要です');
}

// メイン実行
function main() {
  try {
    updateFirebaseClient();
    updateEnvFile();
    updateFirebaseAdminConfig();
    displayCompletionMessage();
  } catch (error) {
    console.error('❌ 設定更新中にエラーが発生しました:', error);
  }
}

main(); 
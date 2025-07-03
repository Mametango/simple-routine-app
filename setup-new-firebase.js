// 新しいFirebaseプロジェクト設定ガイド
const fs = require('fs');
const path = require('path');

console.log('🔥 新しいFirebaseプロジェクト設定ガイド');
console.log('==========================================\n');

// 新しいプロジェクト情報
const projectInfo = {
  projectId: 'simple-routine-app-33cfc',
  authDomain: 'simple-routine-app-33cfc.firebaseapp.com',
  storageBucket: 'simple-routine-app-33cfc.firebasestorage.app'
};

// 設定手順
const setupSteps = [
  {
    step: 1,
    title: "Firebase Console にアクセス",
    description: "新しいプロジェクトにアクセスします",
    url: "https://console.firebase.google.com/",
    actions: [
      "https://console.firebase.google.com/ にアクセス",
      "Googleアカウントでログイン",
      `プロジェクト '${projectInfo.projectId}' を選択`
    ]
  },
  {
    step: 2,
    title: "Authentication の設定",
    description: "メール/パスワード認証とGoogle認証を有効化します",
    actions: [
      "左メニューから「Authentication」を選択",
      "「始める」をクリック",
      "「メール/パスワード」の「編集」をクリック",
      "「有効にする」にチェック",
      "「保存」をクリック",
      "「Google」プロバイダーを選択",
      "「有効にする」にチェック",
      "「保存」をクリック"
    ]
  },
  {
    step: 3,
    title: "Firestore Database の設定",
    description: "データベースを作成してセキュリティルールを設定します",
    actions: [
      "左メニューから「Firestore Database」を選択",
      "「データベースを作成」をクリック",
      "「本番環境で開始」を選択",
      "リージョン: asia-northeast1 (Tokyo)",
      "「完了」をクリック",
      "「ルール」タブをクリック",
      "以下のルールを入力:",
      "",
      "rules_version = '2';",
      "service cloud.firestore {",
      "  match /databases/{database}/documents {",
      "    match /users/{userId} {",
      "      allow read, write: if request.auth != null && request.auth.uid == userId;",
      "      ",
      "      match /routines/{routineId} {",
      "        allow read, write: if request.auth != null && request.auth.uid == userId;",
      "      }",
      "      ",
      "      match /todos/{todoId} {",
      "        allow read, write: if request.auth != null && request.auth.uid == userId;",
      "      }",
      "    }",
      "  }",
      "}",
      "",
      "「公開」をクリック"
    ]
  },
  {
    step: 4,
    title: "サービスアカウントキーの生成",
    description: "Firebase Admin SDK用の秘密鍵を生成します",
    actions: [
      "プロジェクトの設定（⚙️）をクリック",
      "「サービスアカウント」タブを選択",
      "「新しい秘密鍵を生成」をクリック",
      "JSONファイルをダウンロード",
      "ダウンロードしたファイルの内容を確認",
      "project_id, client_email, private_key の値をメモ"
    ]
  }
];

// 設定手順を表示
function displaySetupSteps() {
  setupSteps.forEach(step => {
    console.log(`📋 ステップ ${step.step}: ${step.title}`);
    console.log(`📝 ${step.description}\n`);
    
    if (step.url) {
      console.log(`🔗 URL: ${step.url}\n`);
    }
    
    console.log('📋 実行手順:');
    step.actions.forEach((action, index) => {
      if (action.startsWith('rules_version') || action.startsWith('service') || 
          action.startsWith('  match') || action.startsWith('      allow') || 
          action.startsWith('}') || action === '') {
        console.log(`   ${action}`);
      } else {
        console.log(`   ${index + 1}. ${action}`);
      }
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
  });
}

// 自動設定スクリプトを実行
function runAutoSetup() {
  console.log('🚀 新しいFirebaseプロジェクト設定を開始します...\n');
  
  // プロジェクト情報を表示
  console.log('📊 プロジェクト情報:');
  console.log(`   🔥 プロジェクトID: ${projectInfo.projectId}`);
  console.log(`   🌐 認証ドメイン: ${projectInfo.authDomain}`);
  console.log(`   📦 ストレージバケット: ${projectInfo.storageBucket}\n`);
  
  // ブラウザでFirebase Consoleを開く
  const { exec } = require('child_process');
  exec('start https://console.firebase.google.com/', (error) => {
    if (error) {
      console.log('⚠️  ブラウザを手動で開いてください: https://console.firebase.google.com/');
    } else {
      console.log('✅ Firebase Consoleをブラウザで開きました');
    }
  });
  
  // 設定手順を表示
  displaySetupSteps();
  
  // 完了メッセージ
  console.log('🎉 設定が完了したら、以下のコマンドでアプリを起動してください:');
  console.log('   npm run dev');
  console.log('\n📱 アプリにアクセス: http://localhost:3000');
  console.log('🔐 認証ページ: http://localhost:3000/auth');
  
  console.log('\n📝 重要:');
  console.log('- 新しいプロジェクトなので、データは空の状態です');
  console.log('- 初回ログイン時にアカウントが作成されます');
  console.log('- ルーティンとTodoは新しいプロジェクトに保存されます');
}

// メイン実行
function main() {
  runAutoSetup();
}

main(); 
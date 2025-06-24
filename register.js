// 登録ページ用の認証処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('登録ページが読み込まれました');
    
    // モバイルデバイスかどうかをチェック
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('モバイルデバイス:', isMobile);
    
    // モバイル用の設定
    if (isMobile) {
        document.body.classList.add('mobile-device');
        
        // モバイルでの入力フィールドの改善
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
        inputs.forEach(input => {
            input.setAttribute('autocomplete', 'on');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');
        });
    }
    
    // Lucideアイコンを初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // シンプル認証を初期化
    if (typeof SimpleAuth !== 'undefined') {
        window.simpleAuth = new SimpleAuth();
        simpleAuth.init();
    }
    
    // パスワード表示切り替え
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                passwordInput.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        });
    }
    
    // 確認パスワード表示切り替え
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            if (confirmPasswordInput.type === 'password') {
                confirmPasswordInput.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                confirmPasswordInput.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        });
    }
    
    // 登録フォーム送信
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const authButton = document.getElementById('authButton');
            
            // バリデーション
            if (!username || !email || !password || !confirmPassword) {
                showError('全ての項目を入力してください');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('パスワードが一致しません');
                return;
            }
            
            if (password.length < 6) {
                showError('パスワードは6文字以上で入力してください');
                return;
            }
            
            // ボタンを無効化
            authButton.disabled = true;
            authButton.textContent = '登録中...';
            hideError();
            
            try {
                // Firebase認証を試行
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    // ユーザー名を設定
                    await userCredential.user.updateProfile({
                        displayName: username
                    });
                    // 登録成功後、メインページにリダイレクト
                    window.location.href = 'index.html';
                } else {
                    // シンプル認証を使用
                    if (typeof simpleAuth !== 'undefined') {
                        await simpleAuth.signUp(email, password);
                        // ユーザー名を更新
                        simpleAuth.updateUserData(simpleAuth.getCurrentUser().uid, {
                            displayName: username
                        });
                        // 登録成功後、メインページにリダイレクト
                        window.location.href = 'index.html';
                    } else {
                        throw new Error('認証システムが利用できません');
                    }
                }
            } catch (error) {
                console.error('登録エラー:', error);
                let errorMessage = '登録に失敗しました';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'このメールアドレスは既に使用されています';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'パスワードが弱すぎます';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'メールアドレスの形式が正しくありません';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showError(errorMessage);
            } finally {
                // ボタンを元に戻す
                authButton.disabled = false;
                authButton.textContent = '登録する';
            }
        });
    }
    
    // エラー表示関数
    function showError(message) {
        const authError = document.getElementById('authError');
        if (authError) {
            authError.textContent = message;
            authError.style.display = 'block';
        }
    }
    
    // エラー非表示関数
    function hideError() {
        const authError = document.getElementById('authError');
        if (authError) {
            authError.style.display = 'none';
        }
    }
}); 
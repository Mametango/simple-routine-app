// 豢礼ｷｴ縺輔ｌ縺溘Ο繧ｰ繧､繝ｳ逕ｻ髱｢逕ｨ縺ｮJavaScript

// 繝・ヰ繝・げ諠・ｱ
console.log('=== script-new.js 隱ｭ縺ｿ霎ｼ縺ｿ髢句ｧ・===');
console.log('繝舌・繧ｸ繝ｧ繝ｳ: 1.0.3');
console.log('隱ｭ縺ｿ霎ｼ縺ｿ譎ょ綾:', new Date().toISOString());

// 繧ｰ繝ｭ繝ｼ繝舌Ν螟画焚縺ｮ螳夂ｾｩ
let currentUserInfo = null;
let currentStorage = 'local';
let routines = [];
let completions = [];
let isGoogleLoginInProgress = false; // 繝ｭ繧ｰ繧､繝ｳ蜃ｦ逅・ｸｭ縺ｮ繝輔Λ繧ｰ

// 繧ｰ繝ｭ繝ｼ繝舌Ν繝輔Λ繧ｰ繧定ｨｭ螳夲ｼ・irebase險ｭ螳壹°繧峨い繧ｯ繧ｻ繧ｹ蜿ｯ閭ｽ縺ｫ縺吶ｋ・・
window.isGoogleLoginInProgress = false;

// 繝壹・繧ｸ隱ｭ縺ｿ霎ｼ縺ｿ譎ゅ・蛻晄悄蛹・
document.addEventListener('DOMContentLoaded', function() {
    console.log('繝壹・繧ｸ隱ｭ縺ｿ霎ｼ縺ｿ螳御ｺ・);
    
    try {
        // 繝・・繧ｿ縺ｮ蛻晄悄蛹・
        initializeData();
        
        // 繧､繝吶Φ繝医Μ繧ｹ繝翫・縺ｮ險ｭ螳・
        setupEventListeners();
        
        // 隱崎ｨｼ迥ｶ諷九・遒ｺ隱・
        const isAuthenticated = checkAuthState();
        
        if (!isAuthenticated) {
            console.log('譛ｪ隱崎ｨｼ - 隱崎ｨｼ逕ｻ髱｢繧定｡ｨ遉ｺ');
            showAuthScreen();
        } else {
            console.log('隱崎ｨｼ貂医∩ - 繝｡繧､繝ｳ繧｢繝励Μ繧定｡ｨ遉ｺ');
            // 隱崎ｨｼ迥ｶ諷句､画峩繝上Φ繝峨Λ繝ｼ縺ｧ蜃ｦ逅・＆繧後ｋ
        }
        
        // Lucide繧｢繧､繧ｳ繝ｳ縺ｮ蛻晄悄蛹・
        if (window.lucide) {
            lucide.createIcons();
        }
        
        console.log('蛻晄悄蛹門ｮ御ｺ・);
        
    } catch (error) {
        console.error('蛻晄悄蛹悶お繝ｩ繝ｼ:', error);
        showNotification('繧｢繝励Μ縺ｮ蛻晄悄蛹紋ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆', 'error');
    }
});

// 繝・・繧ｿ縺ｮ蛻晄悄蛹・
function initializeData() {
    console.log('繝・・繧ｿ蛻晄悄蛹夜幕蟋・);
    
    try {
        // 繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝励・隱ｭ縺ｿ霎ｼ縺ｿ
        const storageType = localStorage.getItem('storageType');
        if (storageType) {
            currentStorage = storageType;
            console.log('initializeData - 菫晏ｭ倥＆繧後◆繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝励ｒ險ｭ螳・', currentStorage);
        } else {
            console.log('initializeData - 菫晏ｭ倥＆繧後◆繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝励↑縺励√ョ繝輔か繝ｫ繝亥､繧剃ｽｿ逕ｨ:', currentStorage);
        }
        
        // Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺碁∈謚槭＆繧後※縺・ｋ蝣ｴ蜷医・縲：irebase縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
        if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
            console.log('Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺碁∈謚槭＆繧後※縺・ｋ縺溘ａ縲：irebase縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ縺ｾ縺・);
            loadDataFromFirebase();
        } else {
            // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
            loadDataFromLocalStorage();
        }
        
        console.log('繝・・繧ｿ蛻晄悄蛹門ｮ御ｺ・- routines:', routines.length, '莉ｶ');
    } catch (error) {
        console.error('繝・・繧ｿ蛻晄悄蛹悶お繝ｩ繝ｼ:', error);
        // 繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺溷ｴ蜷医・繝・ヵ繧ｩ繝ｫ繝亥､繧剃ｽｿ逕ｨ
        routines = [];
        completions = [];
        currentStorage = 'local';
    }
}

// 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
function loadDataFromLocalStorage() {
    console.log('繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺九ｉ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ髢句ｧ・);
    
    // appData縺九ｉ繝ｫ繝ｼ繝・ぅ繝ｳ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
    const savedAppData = localStorage.getItem('appData');
    if (savedAppData) {
        const appData = JSON.parse(savedAppData);
        routines = appData.routines || [];
        completions = appData.completions || [];
        console.log('appData縺九ｉ繝ｫ繝ｼ繝・ぅ繝ｳ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ螳御ｺ・', routines.length);
        console.log('appData縺九ｉ螳御ｺ・ョ繝ｼ繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ螳御ｺ・', completions.length);
    } else {
        // 譌ｧ蠖｢蠑上・繝・・繧ｿ繧ら｢ｺ隱・
        const savedRoutines = localStorage.getItem('routines');
        if (savedRoutines) {
            routines = JSON.parse(savedRoutines);
            console.log('譌ｧ蠖｢蠑上°繧峨Ν繝ｼ繝・ぅ繝ｳ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ螳御ｺ・', routines.length);
        }
        
        const savedCompletions = localStorage.getItem('completions');
        if (savedCompletions) {
            completions = JSON.parse(savedCompletions);
            console.log('譌ｧ蠖｢蠑上°繧牙ｮ御ｺ・ョ繝ｼ繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ螳御ｺ・', completions.length);
        }
    }
}

// Firebase縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
async function loadDataFromFirebase() {
    console.log('Firebase縺九ｉ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ髢句ｧ・);
    
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.error('Firebase縺悟茜逕ｨ縺ｧ縺阪∪縺帙ｓ');
        loadDataFromLocalStorage();
        return;
    }
    
    if (!currentUserInfo || !currentUserInfo.id) {
        console.error('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺御ｸ崎ｶｳ縺励※縺・∪縺・);
        loadDataFromLocalStorage();
        return;
    }
    
    try {
        const db = firebase.firestore();
        const userId = currentUserInfo.id;
        
        console.log('Firebase縺九ｉ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ - 繝ｦ繝ｼ繧ｶ繝ｼID:', userId);
        console.log('Firebase縺九ｉ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ - 迴ｾ蝨ｨ縺ｮ繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        const docRef = db.collection('users').doc(userId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const firebaseData = doc.data();
            console.log('Firebase縺九ｉ隱ｭ縺ｿ霎ｼ縺ｿ:', firebaseData);
            
            if (firebaseData.data) {
                const firebaseRoutines = firebaseData.data.routines || [];
                const firebaseCompletions = firebaseData.data.completions || [];
                
                console.log('Firebase繝・・繧ｿ隧ｳ邏ｰ:', {
                    routinesCount: firebaseRoutines.length,
                    completionsCount: firebaseCompletions.length,
                    lastUpdated: firebaseData.data.lastUpdated
                });
                
                // 繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ縺ｨ豈碑ｼ・
                const localLastUpdated = localStorage.getItem('lastUpdated');
                if (localLastUpdated && firebaseData.data.lastUpdated) {
                    const firebaseLastUpdated = new Date(firebaseData.data.lastUpdated);
                    const localLastUpdatedDate = new Date(localLastUpdated);
                    
                    console.log('繝・・繧ｿ豈碑ｼ・', {
                        firebase: firebaseLastUpdated.toISOString(),
                        local: localLastUpdatedDate.toISOString(),
                        firebaseIsNewer: firebaseLastUpdated > localLastUpdatedDate
                    });
                    
                    if (firebaseLastUpdated > localLastUpdatedDate) {
                        console.log('Firebase縺ｮ繝・・繧ｿ縺梧眠縺励＞縺溘ａ縲√Ο繝ｼ繧ｫ繝ｫ繝・・繧ｿ繧呈峩譁ｰ');
                        routines = firebaseRoutines;
                        completions = firebaseCompletions;
                    } else {
                        console.log('繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ縺梧眠縺励＞縺句酔縺倥◆繧√：irebase繝・・繧ｿ繧剃ｽｿ逕ｨ縺励↑縺・);
                        // 繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ繧堤ｶｭ謖・
                    }
                } else {
                    console.log('譌･莉俶ュ蝣ｱ縺後↑縺・◆繧√：irebase繝・・繧ｿ繧剃ｽｿ逕ｨ');
                    routines = firebaseRoutines;
                    completions = firebaseCompletions;
                }
                
                // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｫ繧ゆｿ晏ｭ假ｼ医ヰ繝・け繧｢繝・・・・
                localStorage.setItem('appData', JSON.stringify({
                    routines: routines,
                    completions: completions,
                    lastUpdated: firebaseData.data.lastUpdated
                }));
                localStorage.setItem('lastUpdated', firebaseData.data.lastUpdated);
                
                console.log('Firebase縺九ｉ繝ｫ繝ｼ繝・ぅ繝ｳ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ螳御ｺ・', routines.length);
                console.log('Firebase縺九ｉ螳御ｺ・ョ繝ｼ繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ螳御ｺ・', completions.length);
                
                // UI繧呈峩譁ｰ
                displayTodayRoutines();
                displayAllRoutines();
                
                showNotification('Firebase縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ縺ｾ縺励◆', 'success');
            } else {
                console.log('Firebase縺ｫ繝・・繧ｿ縺後≠繧翫∪縺帙ｓ');
                loadDataFromLocalStorage();
            }
        } else {
            console.log('Firebase縺ｫ繝峨く繝･繝｡繝ｳ繝医′蟄伜惠縺励∪縺帙ｓ');
            loadDataFromLocalStorage();
        }
    } catch (error) {
        console.error('Firebase縺九ｉ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ繧ｨ繝ｩ繝ｼ:', error);
        showNotification('Firebase縺九ｉ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ゅΟ繝ｼ繧ｫ繝ｫ繝・・繧ｿ繧剃ｽｿ逕ｨ縺励∪縺吶・, 'warning');
        loadDataFromLocalStorage();
    }
}

// 繧､繝吶Φ繝医Μ繧ｹ繝翫・縺ｮ險ｭ螳・
function setupEventListeners() {
    console.log('繧､繝吶Φ繝医Μ繧ｹ繝翫・險ｭ螳夐幕蟋・);
    
    // 隱崎ｨｼ繝輔か繝ｼ繝
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }
    
    // Google繝ｭ繧ｰ繧､繝ｳ繝懊ち繝ｳ
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // 繝代せ繝ｯ繝ｼ繝芽｡ｨ遉ｺ蛻・ｊ譖ｿ縺・
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // 繝ｭ繧ｰ繧､繝ｳ迥ｶ諷倶ｿ晄戟繝√ぉ繝・け繝懊ャ繧ｯ繧ｹ
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        rememberMe.addEventListener('change', handlePersistenceChange);
    }
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ霑ｽ蜉繝輔か繝ｼ繝
    const routineForm = document.getElementById('routineForm');
    if (routineForm) {
        routineForm.addEventListener('submit', handleRoutineFormSubmit);
    }
    
    // 鬆ｻ蠎ｦ繝懊ち繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('frequency-btn')) {
            handleFrequencyButtonClick(event);
        }
    });
    
    // 繧ｿ繝悶・繧ｿ繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('tab-button')) {
            handleTabButtonClick(event);
        }
    });
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ螳御ｺ・・繧ｿ繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.completion-btn')) {
            const routineId = event.target.closest('.routine-item').dataset.routineId;
            toggleRoutineCompletion(routineId);
        }
    });
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ邱ｨ髮・・繧ｿ繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.edit-btn')) {
            const routineId = event.target.closest('.routine-item').dataset.routineId;
            editRoutine(routineId);
        }
    });
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ蜑企勁繝懊ち繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.delete-btn')) {
            const routineId = event.target.closest('.routine-item').dataset.routineId;
            deleteRoutine(routineId);
        }
    });
    
    // 蜷梧悄繝懊ち繝ｳ
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.addEventListener('click', manualSync);
    }
    
    // 騾夂衍繝懊ち繝ｳ
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', requestNotificationPermission);
    }
    
    // 險ｭ螳壹・繧ｿ繝ｳ
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showStorageModal);
    }
    
    // 邂｡逅・・・繧ｿ繝ｳ
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', showAdminDashboard);
    }
    
    // 繝ｭ繧ｰ繧｢繧ｦ繝医・繧ｿ繝ｳ
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ霑ｽ蜉繝懊ち繝ｳ
    const addRoutineBtn = document.getElementById('addRoutineBtn');
    if (addRoutineBtn) {
        addRoutineBtn.addEventListener('click', showAddRoutineScreen);
    }
    
    // 謌ｻ繧九・繧ｿ繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.back-btn')) {
            showMainScreen();
        }
    });
    
    // 繧ｭ繝｣繝ｳ繧ｻ繝ｫ繝懊ち繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.cancel-button')) {
            showMainScreen();
        }
    });
    
    // 繧ｹ繝医Ξ繝ｼ繧ｸ驕ｸ謚橸ｼ医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.storage-option')) {
            const storageType = event.target.closest('.storage-option').dataset.storageType;
            if (storageType) {
                selectStorage(storageType);
            }
        }
    });
    
    // 繧ｹ繝医Ξ繝ｼ繧ｸ遒ｺ隱阪・繧ｿ繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.modal-btn.primary')) {
            confirmStorageSelection();
        }
    });
    
    // 繝｢繝ｼ繝繝ｫ髢峨§繧九・繧ｿ繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.modal-close') || event.target.closest('.close')) {
            hideStorageModal();
        }
    });
    
    // 繝倥Ν繝励・繧ｿ繝ｳ
    const firebaseDebugBtn = document.getElementById('firebaseDebugBtn');
    if (firebaseDebugBtn) {
        firebaseDebugBtn.addEventListener('click', checkFirebaseStatus);
    }
    
    const fixFirebaseConfigBtn = document.getElementById('fixFirebaseConfigBtn');
    if (fixFirebaseConfigBtn) {
        fixFirebaseConfigBtn.addEventListener('click', function(event) {
            event.preventDefault();
            fixFirebaseConfig();
        });
    }
    
    // 邂｡逅・・ム繝・す繝･繝懊・繝蛾未騾｣
    const adminBackBtn = document.getElementById('adminBackBtn');
    if (adminBackBtn) {
        adminBackBtn.addEventListener('click', hideAdminDashboard);
    }
    
    // 邂｡逅・・ち繝悶・繧ｿ繝ｳ・医う繝吶Φ繝亥ｧ碑ｭｲ・・
    document.addEventListener('click', function(event) {
        if (event.target.closest('.admin-tab-btn')) {
            const tabName = event.target.closest('.admin-tab-btn').dataset.tab;
            if (tabName) {
                showAdminTab(tabName);
            }
        }
    });
    
    // 蜿矩＃霑ｽ蜉繝懊ち繝ｳ
    const addFriendBtn = document.getElementById('addFriendBtn');
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', showAddFriendModal);
    }
    
    // 蜿矩＃霑ｽ蜉繝｢繝ｼ繝繝ｫ髢｢騾｣
    const closeAddFriendModal = document.getElementById('closeAddFriendModal');
    if (closeAddFriendModal) {
        closeAddFriendModal.addEventListener('click', hideAddFriendModal);
    }
    
    const cancelAddFriend = document.getElementById('cancelAddFriend');
    if (cancelAddFriend) {
        cancelAddFriend.addEventListener('click', hideAddFriendModal);
    }
    
    const confirmAddFriend = document.getElementById('confirmAddFriend');
    if (confirmAddFriend) {
        confirmAddFriend.addEventListener('click', addFriend);
    }
    
    // 繝ｦ繝ｼ繧ｶ繝ｼ讀懃ｴ｢
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function(event) {
            const searchTerm = event.target.value.toLowerCase();
            filterUsers(searchTerm);
        });
    }
    
    console.log('繧､繝吶Φ繝医Μ繧ｹ繝翫・險ｭ螳壼ｮ御ｺ・);
}

// 隱崎ｨｼ迥ｶ諷九・遒ｺ隱・
function checkAuthState() {
    console.log('隱崎ｨｼ迥ｶ諷狗｢ｺ隱埼幕蟋・);
    
    // 繝ｭ繝ｼ繧ｫ繝ｫ隱崎ｨｼ繧堤｢ｺ隱・
    const isLoggedIn = checkLocalAuth();
    
    if (isLoggedIn) {
        console.log('繝ｭ繝ｼ繧ｫ繝ｫ隱崎ｨｼ貂医∩');
        return true;
    }
    
    // Firebase隱崎ｨｼ繧堤｢ｺ隱搾ｼ・oogle繝ｭ繧ｰ繧､繝ｳ縺ｮ縺ｿ・・
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            console.log('Firebase隱崎ｨｼ貂医∩:', currentUser.email);
            // Firebase隱崎ｨｼ迥ｶ諷句､画峩繝上Φ繝峨Λ繝ｼ縺ｧ蜃ｦ逅・＆繧後ｋ
            return true;
        }
    }
    
    console.log('譛ｪ隱崎ｨｼ');
    return false;
}

// 繝ｭ繝ｼ繧ｫ繝ｫ隱崎ｨｼ縺ｮ遒ｺ隱・
function checkLocalAuth() {
    console.log('繝ｭ繝ｼ繧ｫ繝ｫ隱崎ｨｼ遒ｺ隱・);
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    
    if (isLoggedIn && userInfo) {
        console.log('繝ｭ繝ｼ繧ｫ繝ｫ繝ｦ繝ｼ繧ｶ繝ｼ逋ｺ隕・', userInfo.email);
        currentUserInfo = userInfo;
        
        // Google繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ蝣ｴ蜷医・Firebase繧ｹ繝医Ξ繝ｼ繧ｸ繧貞ｼｷ蛻ｶ險ｭ螳・
        if (userInfo.isGoogleUser || userInfo.uid) {
            console.log('checkLocalAuth - Google繝ｦ繝ｼ繧ｶ繝ｼ讀懷・縲：irebase繧ｹ繝医Ξ繝ｼ繧ｸ繧定ｨｭ螳・);
            currentStorage = 'firebase';
            localStorage.setItem('storageType', 'firebase');
        } else {
            console.log('checkLocalAuth - 騾壼ｸｸ繝ｦ繝ｼ繧ｶ繝ｼ縲∽ｿ晏ｭ倥＆繧後◆繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝励ｒ菴ｿ逕ｨ');
            currentStorage = localStorage.getItem('storageType') || 'local';
        }
        
        console.log('checkLocalAuth - 譛邨ら噪縺ｪcurrentStorage:', currentStorage);
        
        // 隱崎ｨｼ迥ｶ諷句､画峩蜃ｦ逅・ｒ螳溯｡・
        handleAuthStateChange(userInfo);
        return true;
    }
    
    console.log('繝ｭ繝ｼ繧ｫ繝ｫ隱崎ｨｼ縺ｪ縺・);
    return false;
}

// 隱崎ｨｼ迥ｶ諷句､画峩縺ｮ蜃ｦ逅・
function handleAuthStateChange(user) {
    console.log('隱崎ｨｼ迥ｶ諷句､画峩蜃ｦ逅・幕蟋・', user ? user.email : '縺ｪ縺・);
    console.log('handleAuthStateChange - user object:', user);
    
    if (user) {
        // Google繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ蝣ｴ蜷医・Firebase繧ｹ繝医Ξ繝ｼ繧ｸ繧貞ｼｷ蛻ｶ險ｭ螳・
        const isGoogleUser = user.isGoogleUser || user.uid || (user.providerData && user.providerData.length > 0 && user.providerData[0].providerId === 'google.com');
        console.log('handleAuthStateChange - isGoogleUser check:', {
            userIsGoogleUser: user.isGoogleUser,
            userUid: user.uid,
            providerData: user.providerData,
            isGoogleUser: isGoogleUser
        });
        
        if (isGoogleUser) {
            console.log('Google繝ｦ繝ｼ繧ｶ繝ｼ讀懷・縲：irebase繧ｹ繝医Ξ繝ｼ繧ｸ繧定ｨｭ螳・);
            currentStorage = 'firebase';
            localStorage.setItem('storageType', 'firebase');
        } else {
            console.log('騾壼ｸｸ繝ｦ繝ｼ繧ｶ繝ｼ縲∫樟蝨ｨ縺ｮ繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝励ｒ邯ｭ謖・', currentStorage);
        }
        
        // 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺ｮ險ｭ螳・
        setUserInfo(user);
        
        // 繝｡繧､繝ｳ繧｢繝励Μ縺ｮ陦ｨ遉ｺ
        showMainApp();
        
        // 繧｢繝励Μ縺ｮ蛻晄悄蛹・
        initializeApp();
        
        // 繧ｵ繝ｼ繝舌・謗･邯壽凾縺ｫ繧ｪ繝ｳ繝ｩ繧､繝ｳ蜷梧悄繧貞ｮ溯｡・
        if (currentStorage === 'firebase') {
            console.log('Firebase蜷梧悄繧帝幕蟋・);
            setTimeout(() => {
                performActualSync();
            }, 1000);
        }
        
        // 繝ｭ繧ｰ繧､繝ｳ謌仙粥騾夂衍
        showNotification('繝ｭ繧ｰ繧､繝ｳ縺ｫ謌仙粥縺励∪縺励◆', 'success');
    } else {
        // 繝ｭ繧ｰ繧｢繧ｦ繝育憾諷・
        clearUserInfo();
        showAuthScreen();
    }
}

// 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧定ｨｭ螳・
function setUserInfo(user) {
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ險ｭ螳・', user.email);
    console.log('setUserInfo - user object:', user);
    
    // Google繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ蝣ｴ蜷医・uid繧剃ｽｿ逕ｨ縲√◎縺・〒縺ｪ縺代ｌ縺ｰid縺ｾ縺溘・uid繧剃ｽｿ逕ｨ
    const isGoogleUser = user.isGoogleUser || user.uid || (user.providerData && user.providerData.length > 0 && user.providerData[0].providerId === 'google.com');
    const userId = isGoogleUser ? user.uid : (user.id || user.uid || Date.now().toString());
    
    currentUserInfo = {
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        id: userId,
        uid: user.uid,
        isGoogleUser: isGoogleUser
    };
    
    console.log('setUserInfo - 險ｭ螳壹＆繧後◆繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ:', currentUserInfo);
    
    // 繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝励ｒ險ｭ螳・
    setUserType(user);
    
    // 繝ｭ繧ｰ繧､繝ｳ迥ｶ諷九ｒ菫晏ｭ・
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
    
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ險ｭ螳壼ｮ御ｺ・);
}

// 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧偵け繝ｪ繧｢
function clearUserInfo() {
    currentUserInfo = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧ｯ繝ｪ繧｢螳御ｺ・);
}

// 繝｡繧､繝ｳ繧｢繝励Μ繧定｡ｨ遉ｺ縺吶ｋ髢｢謨ｰ
function showMainApp() {
    console.log('showMainApp called');
    
    // 隱崎ｨｼ逕ｻ髱｢繧帝撼陦ｨ遉ｺ
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.style.display = 'none';
        console.log('Auth container hidden');
    } else {
        console.error('Auth container not found');
    }
    
    // 繝｡繧､繝ｳ繧｢繝励Μ繧定｡ｨ遉ｺ
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'block';
        app.classList.add('app-active');
        console.log('Main app displayed');
        
        // 閭梧勹濶ｲ繧貞ｼｷ蛻ｶ險ｭ螳・
        document.body.style.background = '#f8fafc';
        app.style.background = '#f8fafc';
        
        // 繝壹・繧ｸ繧ｿ繧､繝医Ν繧呈峩譁ｰ
        document.title = 'My Routine - 繝ｫ繝ｼ繝・ぅ繝ｳ邂｡逅・;
    } else {
        console.error('App element not found');
        return;
    }
    
    // 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧呈峩譁ｰ
    updateUserInfo();
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｪｭ縺ｿ霎ｼ縺ｿ
    loadRoutines();
    
    // 蜷梧悄迥ｶ諷九ｒ譖ｴ譁ｰ
    console.log('showMainApp - updateSyncStatus蜑阪・currentStorage:', currentStorage);
    updateSyncStatus();
    
    // 蠎・相繧定｡ｨ遉ｺ・井ｸ闊ｬ繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ縺ｿ・・
    showAdsIfNeeded();
    
    // 謌仙粥騾夂衍繧定｡ｨ遉ｺ
    if (currentUserInfo) {
        const userTypeText = currentUserInfo.email === 'yasnaries@gmail.com' ? '・育ｮ｡逅・・ｼ・ : '';
        const storageText = currentStorage === 'firebase' ? '繧ｵ繝ｼ繝舌・蜷梧悄' : '繝ｭ繝ｼ繧ｫ繝ｫ菫晏ｭ・;
        console.log('showMainApp - 騾夂衍逕ｨstorageText:', storageText, 'currentStorage:', currentStorage);
        showNotification(`繝ｭ繧ｰ繧､繝ｳ縺ｫ謌仙粥縺励∪縺励◆・・{userTypeText}・・{storageText}繝｢繝ｼ繝会ｼ荏, 'success');
    }
    
    console.log('showMainApp completed');
}

// 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧呈峩譁ｰ
function updateUserInfo() {
    const currentUser = document.getElementById('currentUser');
    const userTypeDisplay = document.getElementById('userTypeDisplay');
    const adminBtn = document.getElementById('adminBtn');
    
    if (currentUser && currentUserInfo) {
        currentUser.textContent = currentUserInfo.email || currentUserInfo.displayName || '繝ｦ繝ｼ繧ｶ繝ｼ';
    }
    
    if (userTypeDisplay) {
        const userType = getUserType();
        userTypeDisplay.textContent = userType;
        userTypeDisplay.className = `user-type-display user-type-${userType}`;
    }
    
    // 邂｡逅・・・繧ｿ繝ｳ縺ｮ陦ｨ遉ｺ/髱櫁｡ｨ遉ｺ
    if (adminBtn) {
        if (isAdmin()) {
            adminBtn.style.display = 'block';
        } else {
            adminBtn.style.display = 'none';
        }
    }
}

// 繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｪｭ縺ｿ霎ｼ縺ｿ
function loadRoutines() {
    console.log('loadRoutines called');
    console.log('loadRoutines - 迴ｾ蝨ｨ縺ｮroutines驟榊・:', routines);
    console.log('loadRoutines - routines驟榊・縺ｮ髟ｷ縺・', routines.length);
    console.log('loadRoutines - currentStorage:', currentStorage);
    
    // Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺碁∈謚槭＆繧後※縺・ｋ蝣ｴ蜷医・縲：irebase縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
    if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
        console.log('Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺碁∈謚槭＆繧後※縺・ｋ縺溘ａ縲：irebase縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ縺ｾ縺・);
        loadDataFromFirebase().then(() => {
            // 繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ蠕後↓UI繧呈峩譁ｰ
            displayTodayRoutines();
            displayAllRoutines();
        }).catch(error => {
            console.error('Firebase縺九ｉ繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ繧ｨ繝ｩ繝ｼ:', error);
            // 繧ｨ繝ｩ繝ｼ縺ｮ蝣ｴ蜷医・繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ繧剃ｽｿ逕ｨ
            displayTodayRoutines();
            displayAllRoutines();
        });
    } else {
        // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｮ繝・・繧ｿ繧剃ｽｿ逕ｨ
        console.log('繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｮ繝・・繧ｿ繧剃ｽｿ逕ｨ');
        displayTodayRoutines();
        displayAllRoutines();
    }
    
    console.log('loadRoutines completed');
}

// 莉頑律縺ｮ繝ｫ繝ｼ繝・ぅ繝ｳ繧定｡ｨ遉ｺ
function displayTodayRoutines() {
    const todayRoutinesList = document.getElementById('todayRoutinesList');
    if (!todayRoutinesList) {
        console.error('Today routines list element not found');
        return;
    }
    
    const today = new Date();
    const todayRoutines = routines.filter(routine => {
        if (routine.frequency === 'daily') return true;
        if (routine.frequency === 'weekly') {
            return routine.weeklyDays && routine.weeklyDays.includes(today.getDay());
        }
        if (routine.frequency === 'monthly') {
            return routine.monthlyDate === today.getDate();
        }
        return false;
    });
    
    if (todayRoutines.length === 0) {
        todayRoutinesList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calendar" class="empty-icon"></i>
                <h3>莉頑律縺ｮ繝ｫ繝ｼ繝・ぅ繝ｳ縺ｯ縺ゅｊ縺ｾ縺帙ｓ</h3>
                <p>譁ｰ縺励＞繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｿｽ蜉縺励※縲∽ｻ頑律縺ｮ鄙呈・繧貞ｧ九ａ縺ｾ縺励ｇ縺・ｼ・/p>
                <button class="add-first-routine-btn" onclick="showAddRoutineScreen()">
                    <i data-lucide="plus" class="button-icon"></i>
                    繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｿｽ蜉
                </button>
            </div>
        `;
    } else {
        todayRoutinesList.innerHTML = todayRoutines.map(routine => createRoutineHTML(routine)).join('');
    }
    
    // Lucide繧｢繧､繧ｳ繝ｳ繧貞・譛溷喧
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 蜈ｨ繝ｫ繝ｼ繝・ぅ繝ｳ繧定｡ｨ遉ｺ
function displayAllRoutines() {
    console.log('displayAllRoutines called');
    console.log('迴ｾ蝨ｨ縺ｮroutines驟榊・:', routines);
    console.log('routines驟榊・縺ｮ髟ｷ縺・', routines.length);
    
    const allRoutinesList = document.getElementById('allRoutinesList');
    if (!allRoutinesList) {
        console.error('All routines list element not found');
        return;
    }
    
    if (routines.length === 0) {
        console.log('繝ｫ繝ｼ繝・ぅ繝ｳ縺・莉ｶ縺ｮ縺溘ａ縲∫ｩｺ縺ｮ迥ｶ諷九ｒ陦ｨ遉ｺ');
        allRoutinesList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="list" class="empty-icon"></i>
                <h3>縺ｾ縺繝ｫ繝ｼ繝・ぅ繝ｳ縺後≠繧翫∪縺帙ｓ</h3>
                <p>譁ｰ縺励＞繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｿｽ蜉縺励※縲∵ｯ取律縺ｮ鄙呈・繧貞ｧ九ａ縺ｾ縺励ｇ縺・ｼ・/p>
                <button class="add-first-routine-btn" onclick="showAddRoutineScreen()">
                    <i data-lucide="plus" class="button-icon"></i>
                    繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｿｽ蜉
                </button>
            </div>
        `;
    } else {
        console.log('繝ｫ繝ｼ繝・ぅ繝ｳ繧定｡ｨ遉ｺ:', routines.length, '莉ｶ');
        allRoutinesList.innerHTML = routines.map(routine => createRoutineHTML(routine)).join('');
    }
    
    // Lucide繧｢繧､繧ｳ繝ｳ繧貞・譛溷喧
    if (window.lucide) {
        lucide.createIcons();
    }
    
    console.log('displayAllRoutines completed');
}

// 繝ｫ繝ｼ繝・ぅ繝ｳ縺ｮHTML繧堤函謌・
function createRoutineHTML(routine) {
    const isCompleted = isRoutineCompletedToday(routine.id);
    const completionClass = isCompleted ? 'completed' : '';
    
    return `
        <div class="routine-item ${completionClass}" data-routine-id="${routine.id}">
            <div class="routine-content">
                <div class="routine-header">
                    <h3 class="routine-title">${routine.title}</h3>
                    <div class="routine-actions">
                        <button class="action-btn edit-btn" onclick="editRoutine('${routine.id}')" title="邱ｨ髮・>
                            <i data-lucide="edit" class="action-icon"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteRoutine('${routine.id}')" title="蜑企勁">
                            <i data-lucide="trash" class="action-icon"></i>
                        </button>
                    </div>
                </div>
                ${routine.description ? `<p class="routine-description">${routine.description}</p>` : ''}
                <div class="routine-meta">
                    <span class="routine-frequency">
                        <i data-lucide="repeat" class="meta-icon"></i>
                        ${getFrequencyText(routine.frequency)}
                    </span>
                    ${routine.time ? `
                        <span class="routine-time">
                            <i data-lucide="clock" class="meta-icon"></i>
                            ${routine.time}
                        </span>
                    ` : ''}
                </div>
            </div>
            <button class="completion-btn ${completionClass}" onclick="toggleRoutineCompletion('${routine.id}')">
                <i data-lucide="${isCompleted ? 'check-circle' : 'circle'}" class="completion-icon"></i>
                ${isCompleted ? '螳御ｺ・ｸ医∩' : '螳御ｺ・↓縺吶ｋ'}
            </button>
        </div>
    `;
}

// 鬆ｻ蠎ｦ繝・く繧ｹ繝医ｒ蜿門ｾ・
function getFrequencyText(frequency) {
    switch (frequency) {
        case 'daily': return '豈取律';
        case 'weekly': return '豈朱ｱ';
        case 'monthly': return '豈取怦';
        default: return frequency;
    }
}

// 莉頑律繝ｫ繝ｼ繝・ぅ繝ｳ縺悟ｮ御ｺ・＠縺ｦ縺・ｋ縺九メ繧ｧ繝・け
function isRoutineCompletedToday(routineId) {
    const today = new Date().toISOString().split('T')[0];
    
    // completions驟榊・縺九ｉ螳御ｺ・ョ繝ｼ繧ｿ繧呈､懃ｴ｢
    const completion = completions.find(c => 
        c.routineId === routineId && c.date === today
    );
    
    return completion !== undefined;
}

// 繝ｫ繝ｼ繝・ぅ繝ｳ螳御ｺ・ｒ蛻・ｊ譖ｿ縺・
async function toggleRoutineCompletion(routineId) {
    console.log('繝ｫ繝ｼ繝・ぅ繝ｳ螳御ｺ・・繧頑崛縺・', routineId);
    
    const today = new Date().toISOString().split('T')[0];
    
    // completions驟榊・縺九ｉ螳御ｺ・ョ繝ｼ繧ｿ繧呈､懃ｴ｢
    const completionIndex = completions.findIndex(c => 
        c.routineId === routineId && c.date === today
    );
    
    if (completionIndex !== -1) {
        // 螳御ｺ・ョ繝ｼ繧ｿ繧貞炎髯､
        completions.splice(completionIndex, 1);
        console.log('繝ｫ繝ｼ繝・ぅ繝ｳ螳御ｺ・ｒ隗｣髯､:', routineId);
    } else {
        // 螳御ｺ・ョ繝ｼ繧ｿ繧定ｿｽ蜉
        completions.push({
            routineId: routineId,
            date: today,
            completedAt: new Date().toISOString()
        });
        console.log('繝ｫ繝ｼ繝・ぅ繝ｳ螳御ｺ・ｒ險ｭ螳・', routineId);
    }
    
    // 陦ｨ遉ｺ繧呈峩譁ｰ
    displayTodayRoutines();
    displayAllRoutines();
    
    // 繝・・繧ｿ繧剃ｿ晏ｭ假ｼ亥ｮ御ｺ・ｒ蠕・▽・・
    await saveData();
    
    // Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺碁∈謚槭＆繧後※縺・ｋ蝣ｴ蜷医・縲：irebase縺ｫ蜷梧悄
    if (currentStorage === 'firebase' && currentUserInfo && currentUserInfo.id) {
        console.log('Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺碁∈謚槭＆繧後※縺・ｋ縺溘ａ縲：irebase縺ｫ蜷梧悄縺励∪縺・);
        try {
            await performActualSync();
            console.log('Firebase蜷梧悄螳御ｺ・);
        } catch (error) {
            console.error('Firebase蜷梧悄繧ｨ繝ｩ繝ｼ:', error);
            showNotification('Firebase蜷梧悄縺ｫ螟ｱ謨励＠縺ｾ縺励◆', 'error');
        }
    }
}

// 繝ｫ繝ｼ繝・ぅ繝ｳ霑ｽ蜉逕ｻ髱｢繧定｡ｨ遉ｺ
function showAddRoutineScreen() {
    console.log('繝ｫ繝ｼ繝・ぅ繝ｳ霑ｽ蜉逕ｻ髱｢陦ｨ遉ｺ');
    
    const mainScreen = document.getElementById('mainScreen');
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    
    if (mainScreen) mainScreen.style.display = 'none';
    if (addRoutineScreen) addRoutineScreen.style.display = 'block';
}

// 繝｡繧､繝ｳ逕ｻ髱｢縺ｫ謌ｻ繧・
function showMainScreen() {
    console.log('繝｡繧､繝ｳ逕ｻ髱｢陦ｨ遉ｺ');
    
    const mainScreen = document.getElementById('mainScreen');
    const addRoutineScreen = document.getElementById('addRoutineScreen');
    
    if (mainScreen) mainScreen.style.display = 'block';
    if (addRoutineScreen) addRoutineScreen.style.display = 'none';
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ縺ｮ陦ｨ遉ｺ繧呈峩譁ｰ・医ョ繝ｼ繧ｿ蜀崎ｪｭ縺ｿ霎ｼ縺ｿ縺ｪ縺暦ｼ・
    console.log('showMainScreen - 陦ｨ遉ｺ譖ｴ譁ｰ蜑阪・routines驟榊・:', routines);
    displayTodayRoutines();
    displayAllRoutines();
    console.log('showMainScreen - 陦ｨ遉ｺ譖ｴ譁ｰ蠕後・routines驟榊・:', routines);
}

// 蜷梧悄迥ｶ諷九ｒ譖ｴ譁ｰ
function updateSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    if (!syncStatus) {
        console.error('syncStatus隕∫ｴ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ');
        return;
    }
    
    console.log('updateSyncStatus called - currentStorage:', currentStorage);
    
    switch (currentStorage) {
        case 'firebase':
            console.log('Firebase蜷梧悄迥ｶ諷九↓險ｭ螳・);
            syncStatus.textContent = '泙 繧ｪ繝ｳ繝ｩ繧､繝ｳ蜷梧悄';
            syncStatus.className = 'sync-status synced';
            syncStatus.title = 'Firebase繧ｵ繝ｼ繝舌・縺ｨ蜷梧悄荳ｭ';
            break;
        case 'google-drive':
            console.log('Google Drive蜷梧悄迥ｶ諷九↓險ｭ螳・);
            syncStatus.textContent = '泙 Google Drive蜷梧悄';
            syncStatus.className = 'sync-status synced';
            syncStatus.title = 'Google Drive縺ｨ蜷梧悄荳ｭ';
            break;
        default:
            console.log('繝ｭ繝ｼ繧ｫ繝ｫ菫晏ｭ倡憾諷九↓險ｭ螳・(currentStorage:', currentStorage, ')');
            syncStatus.textContent = '泯 繝ｭ繝ｼ繧ｫ繝ｫ菫晏ｭ・;
            syncStatus.className = 'sync-status local';
            syncStatus.title = '繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｫ菫晏ｭ倅ｸｭ';
            break;
    }
}

// 蠎・相繧定｡ｨ遉ｺ・井ｸ闊ｬ繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ縺ｿ・・
function showAdsIfNeeded() {
    const userType = getUserType();
    const adContainer = document.getElementById('adContainer');
    
    if (adContainer) {
        if (userType === 'general') {
            adContainer.style.display = 'block';
        } else {
            adContainer.style.display = 'none';
        }
    }
}

// 隱崎ｨｼ逕ｻ髱｢縺ｮ陦ｨ遉ｺ
function showAuthScreen() {
    console.log('隱崎ｨｼ逕ｻ髱｢陦ｨ遉ｺ');
    
    const authContainer = document.getElementById('authContainer');
    const app = document.getElementById('app');
    
    if (authContainer) {
        authContainer.style.display = 'flex';
        console.log('Auth container displayed');
    } else {
        console.error('Auth container not found');
    }
    
    if (app) {
        app.style.display = 'none';
        app.classList.remove('app-active');
        console.log('Main app hidden');
    } else {
        console.error('App element not found');
    }
    
    // 繝壹・繧ｸ繧ｿ繧､繝医Ν繧呈峩譁ｰ
    document.title = 'My Routine - 繝ｭ繧ｰ繧､繝ｳ';
}

// Google繝ｭ繧ｰ繧､繝ｳ蜃ｦ逅・
async function handleGoogleLogin() {
    console.log('Google繝ｭ繧ｰ繧､繝ｳ髢句ｧ・);
    
    // 譌｢縺ｫ繝ｭ繧ｰ繧､繝ｳ蜃ｦ逅・ｸｭ縺ｮ蝣ｴ蜷医・菴輔ｂ縺励↑縺・
    if (isGoogleLoginInProgress) {
        console.log('Google繝ｭ繧ｰ繧､繝ｳ蜃ｦ逅・ｸｭ縺ｧ縺吶ゅ＠縺ｰ繧峨￥蠕・▲縺ｦ縺九ｉ蜀崎ｩｦ陦後＠縺ｦ縺上□縺輔＞縲・);
        showNotification('繝ｭ繧ｰ繧､繝ｳ蜃ｦ逅・ｸｭ縺ｧ縺吶ゅ＠縺ｰ繧峨￥蠕・▲縺ｦ縺九ｉ蜀崎ｩｦ陦後＠縺ｦ縺上□縺輔＞縲・, 'info');
        return;
    }
    
    if (typeof firebase === 'undefined') {
        showNotification('Firebase縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ', 'error');
        return;
    }
    
    isGoogleLoginInProgress = true;
    window.isGoogleLoginInProgress = true; // 繧ｰ繝ｭ繝ｼ繝舌Ν繝輔Λ繧ｰ繧よ峩譁ｰ
    
    try {
        // 繝昴ャ繝励い繝・・繝悶Ο繝・け繝√ぉ繝・け
        const popupBlocked = await checkPopupBlocked();
        if (popupBlocked) {
            // 繝昴ャ繝励い繝・・縺後ヶ繝ｭ繝・け縺輔ｌ縺ｦ縺・ｋ蝣ｴ蜷医・莉｣譖ｿ謇区ｮｵ繧呈署譯・
            showPopupBlockedDialog();
            return;
        }
        
        const auth = firebase.auth();
        
        // 譌｢蟄倥・繝昴ャ繝励い繝・・繧偵け繝ｪ繝ｼ繝ｳ繧｢繝・・
        await cleanupExistingPopups();
        
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // 繧ｹ繧ｳ繝ｼ繝励ｒ險ｭ螳・
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        
        // 繧ｫ繧ｹ繧ｿ繝繝代Λ繝｡繝ｼ繧ｿ
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        
        console.log('Google隱崎ｨｼ繝励Ο繝舌う繝繝ｼ險ｭ螳壼ｮ御ｺ・);
        
        // 繝昴ャ繝励い繝・・隱崎ｨｼ繧定ｩｦ陦鯉ｼ医ち繧､繝繧｢繧ｦ繝井ｻ倥″・・
        const result = await Promise.race([
            auth.signInWithPopup(googleProvider),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('隱崎ｨｼ繧ｿ繧､繝繧｢繧ｦ繝・)), 30000)
            )
        ]);
        
        console.log('Google繝ｭ繧ｰ繧､繝ｳ謌仙粥:', result.user.email);
        
        // 隱崎ｨｼ迥ｶ諷句､画峩繝上Φ繝峨Λ繝ｼ繧貞他縺ｳ蜃ｺ縺励※繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧定ｨｭ螳・
        console.log('handleGoogleLogin - handleAuthStateChange繧貞他縺ｳ蜃ｺ縺・);
        handleAuthStateChange(result.user);
        
        console.log('Google繝ｭ繧ｰ繧､繝ｳ螳御ｺ・', {
            email: result.user.email,
            displayName: result.user.displayName,
            userType: result.user.email === 'yasnaries@gmail.com' ? 'admin' : 'user',
            storage: 'firebase',
            isGoogleUser: true
        });
        
    } catch (error) {
        console.error('Google繝ｭ繧ｰ繧､繝ｳ繧ｨ繝ｩ繝ｼ:', error);
        
        let errorMessage = 'Google繝ｭ繧ｰ繧､繝ｳ縺ｫ螟ｱ謨励＠縺ｾ縺励◆';
        
        switch (error.code) {
            case 'auth/popup-blocked':
                errorMessage = '繝昴ャ繝励い繝・・縺後ヶ繝ｭ繝・け縺輔ｌ縺ｦ縺・∪縺吶ゅヶ繝ｩ繧ｦ繧ｶ縺ｮ險ｭ螳壹〒繝昴ャ繝励い繝・・繧定ｨｱ蜿ｯ縺励※縺上□縺輔＞縲・;
                showPopupBlockedDialog();
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = '繝ｭ繧ｰ繧､繝ｳ縺後く繝｣繝ｳ繧ｻ繝ｫ縺輔ｌ縺ｾ縺励◆';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = '繝ｭ繧ｰ繧､繝ｳ蜃ｦ逅・′驥崎､・＠縺ｦ縺・∪縺吶ゅ＠縺ｰ繧峨￥蠕・▲縺ｦ縺九ｉ蜀崎ｩｦ陦後＠縺ｦ縺上□縺輔＞縲・;
                break;
            case 'auth/unauthorized-domain':
                errorMessage = '縺薙・繝峨Γ繧､繝ｳ縺ｯ隱崎ｨｼ縺瑚ｨｱ蜿ｯ縺輔ｌ縺ｦ縺・∪縺帙ｓ縲らｮ｡逅・・↓騾｣邨｡縺励※縺上□縺輔＞縲・;
                break;
            default:
                if (error.message.includes('繧ｿ繧､繝繧｢繧ｦ繝・)) {
                    errorMessage = '隱崎ｨｼ縺後ち繧､繝繧｢繧ｦ繝医＠縺ｾ縺励◆縲ょ・隧ｦ陦後＠縺ｦ縺上□縺輔＞縲・;
                } else {
                    errorMessage = `繝ｭ繧ｰ繧､繝ｳ繧ｨ繝ｩ繝ｼ: ${error.message}`;
                }
        }
        
        showNotification(errorMessage, 'error');
        
        // 繧ｨ繝ｩ繝ｼ蠕後↓蟆代＠蠕・▲縺ｦ縺九ｉ繝輔Λ繧ｰ繧偵Μ繧ｻ繝・ヨ
        setTimeout(() => {
            isGoogleLoginInProgress = false;
            window.isGoogleLoginInProgress = false;
        }, 2000);
        
    } finally {
        // 謌仙粥譎ゅ・蜊ｳ蠎ｧ縺ｫ繝輔Λ繧ｰ繧偵Μ繧ｻ繝・ヨ
        if (!isGoogleLoginInProgress) {
            isGoogleLoginInProgress = false;
            window.isGoogleLoginInProgress = false;
        }
    }
}

// 隱崎ｨｼ繝輔か繝ｼ繝騾∽ｿ｡蜃ｦ逅・
function handleAuthSubmit(event) {
    event.preventDefault();
    console.log('隱崎ｨｼ繝輔か繝ｼ繝騾∽ｿ｡');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｨ繝代せ繝ｯ繝ｼ繝峨ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞', 'error');
        return;
    }
    
    // 騾壼ｸｸ繝ｭ繧ｰ繧､繝ｳ蜃ｦ逅・ｒ螳溯｡・
    handleRegularLogin(email, password);
}

// 繝昴ャ繝励い繝・・繝悶Ο繝・け譎ゅ・繝繧､繧｢繝ｭ繧ｰ陦ｨ遉ｺ
function showPopupBlockedDialog() {
    const dialogHTML = `
        <div class="popup-blocked-dialog" id="popupBlockedDialog">
            <div class="dialog-content">
                <h3>繝昴ャ繝励い繝・・縺後ヶ繝ｭ繝・け縺輔ｌ縺ｦ縺・∪縺・/h3>
                <p>Google繝ｭ繧ｰ繧､繝ｳ縺ｫ縺ｯ繝昴ャ繝励い繝・・縺ｮ險ｱ蜿ｯ縺悟ｿ・ｦ√〒縺吶・/p>
                <div class="dialog-options">
                    <button onclick="tryGoogleLoginAgain()" class="btn-primary">蜀崎ｩｦ陦・/button>
                    <button onclick="useRegularLogin()" class="btn-secondary">騾壼ｸｸ繝ｭ繧ｰ繧､繝ｳ繧剃ｽｿ逕ｨ</button>
                    <button onclick="closePopupBlockedDialog()" class="btn-cancel">繧ｭ繝｣繝ｳ繧ｻ繝ｫ</button>
                </div>
                <div class="popup-instructions">
                    <h4>繝昴ャ繝励い繝・・繧定ｨｱ蜿ｯ縺吶ｋ譁ｹ豕包ｼ・/h4>
                    <ul>
                        <li>繝悶Λ繧ｦ繧ｶ縺ｮ繧｢繝峨Ξ繧ｹ繝舌・讓ｪ縺ｮ繧｢繧､繧ｳ繝ｳ繧偵け繝ｪ繝・け</li>
                        <li>縲後・繝・・繧｢繝・・繧定ｨｱ蜿ｯ縲阪ｒ驕ｸ謚・/li>
                        <li>繝壹・繧ｸ繧貞・隱ｭ縺ｿ霎ｼ縺ｿ縺励※縺九ｉ蜀崎ｩｦ陦・/li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // 譌｢蟄倥・繝繧､繧｢繝ｭ繧ｰ繧貞炎髯､
    const existingDialog = document.getElementById('popupBlockedDialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    // 譁ｰ縺励＞繝繧､繧｢繝ｭ繧ｰ繧定ｿｽ蜉
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    // 繝輔Λ繧ｰ繧偵Μ繧ｻ繝・ヨ
    isGoogleLoginInProgress = false;
    window.isGoogleLoginInProgress = false;
}

// 繝昴ャ繝励い繝・・繝悶Ο繝・け繝繧､繧｢繝ｭ繧ｰ繧帝哩縺倥ｋ
function closePopupBlockedDialog() {
    const dialog = document.getElementById('popupBlockedDialog');
    if (dialog) {
        dialog.remove();
    }
}

// Google繝ｭ繧ｰ繧､繝ｳ繧貞・隧ｦ陦・
function tryGoogleLoginAgain() {
    closePopupBlockedDialog();
    setTimeout(() => {
        handleGoogleLogin();
    }, 500);
}

// 騾壼ｸｸ繝ｭ繧ｰ繧､繝ｳ縺ｫ蛻・ｊ譖ｿ縺・
function useRegularLogin() {
    closePopupBlockedDialog();
    showNotification('騾壼ｸｸ繝ｭ繧ｰ繧､繝ｳ繝輔か繝ｼ繝縺ｫ蛻・ｊ譖ｿ縺医∪縺励◆', 'info');
    
    // 繝ｭ繧ｰ繧､繝ｳ繝輔か繝ｼ繝縺ｫ繝輔か繝ｼ繧ｫ繧ｹ
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
}

// 譌｢蟄倥・繝昴ャ繝励い繝・・繧偵け繝ｪ繝ｼ繝ｳ繧｢繝・・
async function cleanupExistingPopups() {
    try {
        // 譌｢蟄倥・Firebase隱崎ｨｼ繝昴ャ繝励い繝・・繧偵く繝｣繝ｳ繧ｻ繝ｫ
        const auth = firebase.auth();
        if (auth.currentUser) {
            // 迴ｾ蝨ｨ縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ縺後＞繧句ｴ蜷医・荳譌ｦ繧ｵ繧､繝ｳ繧｢繧ｦ繝・
            await auth.signOut();
        }
        
        // 蟆代＠蠕・ｩ溘＠縺ｦ縺九ｉ谺｡縺ｮ蜃ｦ逅・∈
        await new Promise(resolve => setTimeout(resolve, 1000));
        
    } catch (error) {
        console.log('繝昴ャ繝励い繝・・繧ｯ繝ｪ繝ｼ繝ｳ繧｢繝・・繧ｨ繝ｩ繝ｼ・育┌隕厄ｼ・', error);
    }
}

// 繝昴ャ繝励い繝・・繝悶Ο繝・け繝√ぉ繝・け・域隼蝟・沿・・
function checkPopupBlocked() {
    return new Promise((resolve) => {
        try {
            const popup = window.open('', '_blank', 'width=1,height=1,scrollbars=no,resizable=no');
            
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                resolve(true); // 繝昴ャ繝励い繝・・縺後ヶ繝ｭ繝・け縺輔ｌ縺ｦ縺・ｋ
            } else {
                // 繝昴ャ繝励い繝・・縺碁幕縺・◆蝣ｴ蜷医∝ｰ代＠蠕・▲縺ｦ縺九ｉ髢峨§繧・
                setTimeout(() => {
                    try {
                        popup.close();
                    } catch (e) {
                        console.log('繝昴ャ繝励い繝・・繧ｯ繝ｭ繝ｼ繧ｺ繧ｨ繝ｩ繝ｼ・育┌隕厄ｼ・', e);
                    }
                }, 100);
                resolve(false); // 繝昴ャ繝励い繝・・縺瑚ｨｱ蜿ｯ縺輔ｌ縺ｦ縺・ｋ
            }
        } catch (error) {
            console.log('繝昴ャ繝励い繝・・繝√ぉ繝・け繧ｨ繝ｩ繝ｼ:', error);
            resolve(true); // 繧ｨ繝ｩ繝ｼ縺ｮ蝣ｴ蜷医・繝悶Ο繝・け縺輔ｌ縺ｦ縺・ｋ縺ｨ縺ｿ縺ｪ縺・
        }
    });
}

// 繝ｭ繝ｼ繧ｫ繝ｫ繧｢繧ｫ繧ｦ繝ｳ繝医→縺ｮ繝ｪ繝ｳ繧ｯ
async function linkWithLocalAccount(googleUser) {
    console.log('繝ｭ繝ｼ繧ｫ繝ｫ繧｢繧ｫ繧ｦ繝ｳ繝医→縺ｮ繝ｪ繝ｳ繧ｯ髢句ｧ・', googleUser.email);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === googleUser.email);
    
    if (existingUser) {
        // 譌｢蟄倥・繝ｭ繝ｼ繧ｫ繝ｫ繧｢繧ｫ繧ｦ繝ｳ繝医→繝ｪ繝ｳ繧ｯ
        existingUser.isGoogleLinked = true;
        existingUser.googleUid = googleUser.uid;
        existingUser.displayName = googleUser.displayName || existingUser.displayName;
        
        const updatedUsers = users.map(u => 
            u.email === googleUser.email ? existingUser : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        console.log('譌｢蟄倥い繧ｫ繧ｦ繝ｳ繝医→繝ｪ繝ｳ繧ｯ螳御ｺ・);
    } else {
        // 譁ｰ縺励＞Google繝ｦ繝ｼ繧ｶ繝ｼ逕ｨ縺ｮ繝ｭ繝ｼ繧ｫ繝ｫ繧｢繧ｫ繧ｦ繝ｳ繝医ｒ菴懈・
        const newUser = {
            id: googleUser.uid,
            email: googleUser.email,
            displayName: googleUser.displayName || googleUser.email.split('@')[0],
            password: '', // Google繝ｦ繝ｼ繧ｶ繝ｼ縺ｯ繝代せ繝ｯ繝ｼ繝我ｸ崎ｦ・
            createdAt: new Date().toISOString(),
            isGoogleLinked: true,
            googleUid: googleUser.uid
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('譁ｰ隕秀oogle繝ｦ繝ｼ繧ｶ繝ｼ繧｢繧ｫ繧ｦ繝ｳ繝井ｽ懈・螳御ｺ・);
    }
}

// 繝代せ繝ｯ繝ｼ繝芽｡ｨ遉ｺ蛻・ｊ譖ｿ縺・
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
    }
    
    // Lucide繧｢繧､繧ｳ繝ｳ繧貞・蛻晄悄蛹・
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// 繝ｭ繧ｰ繧､繝ｳ豌ｸ邯壼喧縺ｮ螟画峩
function handlePersistenceChange(event) {
    const isChecked = event.target.checked;
    localStorage.setItem('rememberMe', isChecked);
    console.log('繝ｭ繧ｰ繧､繝ｳ豌ｸ邯壼喧險ｭ螳・', isChecked);
}

// 豌ｸ邯壼喧迥ｶ諷九・蠕ｩ蜈・
function restorePersistenceState() {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const checkbox = document.getElementById('rememberMe');
    if (checkbox) {
        checkbox.checked = rememberMe;
    }
}

// 騾壼ｸｸ繝ｭ繧ｰ繧､繝ｳ蜃ｦ逅・ｼ・oogle繧｢繧ｫ繧ｦ繝ｳ繝亥ｯｾ蠢懶ｼ・
async function handleRegularLogin(email, password) {
    console.log('騾壼ｸｸ繝ｭ繧ｰ繧､繝ｳ髢句ｧ・', email);
    
    try {
        // 繝ｭ繝ｼ繧ｫ繝ｫ繝ｦ繝ｼ繧ｶ繝ｼ繧偵メ繧ｧ繝・け
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            // 繝ｦ繝ｼ繧ｶ繝ｼ縺瑚ｦ九▽縺九ｉ縺ｪ縺・ｴ蜷医∵眠隕上Θ繝ｼ繧ｶ繝ｼ縺ｨ縺励※菴懈・
            console.log('譁ｰ隕上Θ繝ｼ繧ｶ繝ｼ縺ｨ縺励※菴懈・:', email);
            
            const newUser = {
                id: Date.now().toString(),
                email: email,
                displayName: email.split('@')[0], // 繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｮ@蜑阪ｒ陦ｨ遉ｺ蜷阪→縺励※菴ｿ逕ｨ
                password: password,
                createdAt: new Date().toISOString(),
                isGoogleLinked: false
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧定ｨｭ螳・
            currentUserInfo = {
                email: newUser.email,
                displayName: newUser.displayName,
                id: newUser.id,
                isGoogleUser: false
            };
            
            // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ繧剃ｽｿ逕ｨ
            currentStorage = 'local';
            localStorage.setItem('storageType', 'local');
            
            // 繝ｭ繧ｰ繧､繝ｳ迥ｶ諷九ｒ菫晏ｭ・
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
            
            // 繝｡繧､繝ｳ繧｢繝励Μ繧定｡ｨ遉ｺ
            showMainApp();
            
            showNotification('譁ｰ隕上Θ繝ｼ繧ｶ繝ｼ縺ｨ縺励※逋ｻ骭ｲ縺輔ｌ縺ｾ縺励◆', 'success');
            return;
        }
        
        // 繝代せ繝ｯ繝ｼ繝峨メ繧ｧ繝・け
        if (user.password !== password) {
            // 邂｡逅・・い繧ｫ繧ｦ繝ｳ繝医・迚ｹ蛻･蜃ｦ逅・
            if (email === 'yasnaries@gmail.com') {
                // 邂｡逅・・い繧ｫ繧ｦ繝ｳ繝医・蝣ｴ蜷医・縲√ヱ繧ｹ繝ｯ繝ｼ繝峨′遨ｺ縺ｾ縺溘・譛ｪ險ｭ螳壹・蝣ｴ蜷医↓閾ｪ蜍戊ｨｭ螳・
                if (!user.password || user.password === '') {
                    user.password = password;
                    const updatedUsers = users.map(u => 
                        u.email === email ? user : u
                    );
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    console.log('邂｡逅・・い繧ｫ繧ｦ繝ｳ繝医・繝代せ繝ｯ繝ｼ繝峨ｒ險ｭ螳壹＠縺ｾ縺励◆');
                } else {
                    throw new Error('邂｡逅・・ヱ繧ｹ繝ｯ繝ｼ繝峨′豁｣縺励￥縺ゅｊ縺ｾ縺帙ｓ縲よｭ｣縺励＞繝代せ繝ｯ繝ｼ繝峨ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
                }
            } else {
                throw new Error('繝代せ繝ｯ繝ｼ繝峨′豁｣縺励￥縺ゅｊ縺ｾ縺帙ｓ');
            }
        }
        
        // 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧定ｨｭ螳・
        currentUserInfo = {
            email: user.email,
            displayName: user.displayName,
            id: user.id,
            isGoogleUser: user.isGoogleLinked || false
        };
        
        // Google繧｢繧ｫ繧ｦ繝ｳ繝医→繝ｪ繝ｳ繧ｯ縺輔ｌ縺ｦ縺・ｋ蝣ｴ蜷医・蜃ｦ逅・
        if (user.isGoogleLinked && user.googleUid) {
            try {
                // Firebase隱崎ｨｼ迥ｶ諷九ｒ繝√ぉ繝・け・・oogle繝ｭ繧ｰ繧､繝ｳ縺ｮ縺ｿ・・
                const firebaseUser = firebase.auth().currentUser;
                if (firebaseUser && firebaseUser.uid === user.googleUid) {
                    // 譌｢縺ｫGoogle縺ｧ繝ｭ繧ｰ繧､繝ｳ貂医∩
                    currentStorage = 'firebase';
                    localStorage.setItem('storageType', 'firebase');
                    console.log('Google隱崎ｨｼ貂医∩ - 繧ｵ繝ｼ繝舌・蜷梧悄繝｢繝ｼ繝・);
                } else {
                    // Google隱崎ｨｼ縺悟ｿ・ｦ√□縺後・壼ｸｸ繝ｭ繧ｰ繧､繝ｳ縺ｧ縺ｯFirebase隱崎ｨｼ繧定ｩｦ陦後＠縺ｪ縺・
                    console.log('Google繧｢繧ｫ繧ｦ繝ｳ繝医→縺ｮ蜀崎ｪ崎ｨｼ縺悟ｿ・ｦ√〒縺・- 繝ｭ繝ｼ繧ｫ繝ｫ繝｢繝ｼ繝峨〒邯夊｡・);
                    currentStorage = 'local';
                    localStorage.setItem('storageType', 'local');
                    showNotification('Google繧｢繧ｫ繧ｦ繝ｳ繝医→縺ｮ蜀崎ｪ崎ｨｼ縺悟ｿ・ｦ√〒縺吶・oogle繝ｭ繧ｰ繧､繝ｳ繧剃ｽｿ逕ｨ縺吶ｋ縺ｨ繧ｵ繝ｼ繝舌・蜷梧悄縺悟庄閭ｽ縺ｧ縺吶・, 'info');
                }
            } catch (firebaseError) {
                console.log('Firebase隱崎ｨｼ繧ｨ繝ｩ繝ｼ - 繝ｭ繝ｼ繧ｫ繝ｫ繝｢繝ｼ繝峨〒邯夊｡・', firebaseError);
                currentStorage = 'local';
                localStorage.setItem('storageType', 'local');
            }
        } else {
            // 騾壼ｸｸ縺ｮ繝ｭ繝ｼ繧ｫ繝ｫ繧｢繧ｫ繧ｦ繝ｳ繝・
            currentStorage = 'local';
            localStorage.setItem('storageType', 'local');
        }
        
        // 繝ｭ繧ｰ繧､繝ｳ迥ｶ諷九ｒ菫晏ｭ・
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
        
        // 繝｡繧､繝ｳ繧｢繝励Μ繧定｡ｨ遉ｺ
        showMainApp();
        
        // 謌仙粥騾夂衍
        const storageText = currentStorage === 'firebase' ? '繧ｵ繝ｼ繝舌・蜷梧悄' : '繝ｭ繝ｼ繧ｫ繝ｫ菫晏ｭ・;
        const userTypeText = email === 'yasnaries@gmail.com' ? '・育ｮ｡逅・・ｼ・ : '';
        showNotification(`繝ｭ繧ｰ繧､繝ｳ縺ｫ謌仙粥縺励∪縺励◆・・{userTypeText}・・{storageText}繝｢繝ｼ繝会ｼ荏, 'success');
        
    } catch (error) {
        console.error('騾壼ｸｸ繝ｭ繧ｰ繧､繝ｳ繧ｨ繝ｩ繝ｼ:', error);
        showNotification('繝ｭ繧ｰ繧､繝ｳ縺ｫ螟ｱ謨励＠縺ｾ縺励◆: ' + error.message, 'error');
    }
}

// 繝ｭ繧ｰ繧､繝ｳ迥ｶ諷九メ繧ｧ繝・け・・oogle繧｢繧ｫ繧ｦ繝ｳ繝亥ｯｾ蠢懶ｼ・
function checkLoginStatus() {
    console.log('繝ｭ繧ｰ繧､繝ｳ迥ｶ諷九メ繧ｧ繝・け髢句ｧ・);
    
    try {
        // 繝ｭ繝ｼ繧ｫ繝ｫ繝ｭ繧ｰ繧､繝ｳ迥ｶ諷九ｒ繝√ぉ繝・け
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        
        if (isLoggedIn && userInfo) {
            console.log('繝ｭ繝ｼ繧ｫ繝ｫ繝ｭ繧ｰ繧､繝ｳ迥ｶ諷九ｒ讀懷・:', userInfo.email);
            currentUserInfo = userInfo;
            
            // 繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝励ｒ蜿門ｾ・
            currentStorage = localStorage.getItem('storageType') || 'local';
            
            // Google繧｢繧ｫ繧ｦ繝ｳ繝医・蝣ｴ蜷医・Firebase隱崎ｨｼ迥ｶ諷九ｂ繝√ぉ繝・け
            if (userInfo.isGoogleUser) {
                const firebaseUser = firebase.auth().currentUser;
                if (firebaseUser && firebaseUser.uid === userInfo.uid) {
                    console.log('Firebase隱崎ｨｼ迥ｶ諷九ｂ遒ｺ隱肴ｸ医∩');
                    currentStorage = 'firebase';
                    localStorage.setItem('storageType', 'firebase');
                } else {
                    console.log('Firebase隱崎ｨｼ迥ｶ諷九′荳堺ｸ閾ｴ - 繝ｭ繝ｼ繧ｫ繝ｫ繝｢繝ｼ繝峨〒邯夊｡・);
                    currentStorage = 'local';
                    localStorage.setItem('storageType', 'local');
                }
            }
            
            // 繝｡繧､繝ｳ繧｢繝励Μ繧定｡ｨ遉ｺ
            showMainApp();
            return true;
        }
        
        // Firebase隱崎ｨｼ迥ｶ諷九ｒ繝√ぉ繝・け
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('Firebase隱崎ｨｼ迥ｶ諷九ｒ讀懷・:', user.email);
                
                // 繝ｭ繝ｼ繧ｫ繝ｫ繧｢繧ｫ繧ｦ繝ｳ繝医ｒ繝√ぉ繝・け
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const localUser = users.find(u => u.email === user.email);
                
                if (localUser) {
                    currentUserInfo = {
                        email: user.email,
                        displayName: user.displayName || localUser.displayName,
                        uid: user.uid,
                        id: localUser.id,
                        isGoogleUser: true
                    };
                    
                    currentStorage = 'firebase';
                    localStorage.setItem('storageType', 'firebase');
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
                    
                    showMainApp();
                    return true;
                }
            }
        });
        
        return false;
        
    } catch (error) {
        console.error('繝ｭ繧ｰ繧､繝ｳ迥ｶ諷九メ繧ｧ繝・け繧ｨ繝ｩ繝ｼ:', error);
        return false;
    }
}

// 謇句虚蜷梧悄讖溯・
function manualSync() {
    console.log('謇句虚蜷梧悄髢句ｧ・);
    console.log('謇句虚蜷梧悄 - 迴ｾ蝨ｨ縺ｮ繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝・', currentStorage);
    console.log('謇句虚蜷梧悄 - 迴ｾ蝨ｨ縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ:', currentUserInfo);
    console.log('謇句虚蜷梧悄 - 繝ｦ繝ｼ繧ｶ繝ｼID隧ｳ邏ｰ:', {
        email: currentUserInfo?.email,
        displayName: currentUserInfo?.displayName,
        id: currentUserInfo?.id,
        uid: currentUserInfo?.uid,
        isGoogleUser: currentUserInfo?.isGoogleUser
    });
    console.log('謇句虚蜷梧悄 - 迴ｾ蝨ｨ縺ｮ繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ:', {
        routinesCount: routines.length,
        completionsCount: completions.length,
        lastUpdated: localStorage.getItem('lastUpdated')
    });
    
    // 蜷梧悄蜑阪・迥ｶ諷九メ繧ｧ繝・け
    if (!currentUserInfo) {
        console.error('謇句虚蜷梧悄繧ｨ繝ｩ繝ｼ: 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺後≠繧翫∪縺帙ｓ');
        showNotification('繝ｭ繧ｰ繧､繝ｳ縺悟ｿ・ｦ√〒縺・, 'error');
        return;
    }
    
    if (!currentStorage) {
        console.error('謇句虚蜷梧悄繧ｨ繝ｩ繝ｼ: 繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝励′險ｭ螳壹＆繧後※縺・∪縺帙ｓ');
        showNotification('繧ｹ繝医Ξ繝ｼ繧ｸ險ｭ螳壹′蠢・ｦ√〒縺・, 'error');
        return;
    }
    
    // Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺ｮ蝣ｴ蜷医∝・譛溷喧迥ｶ諷九ｒ繝√ぉ繝・け
    if (currentStorage === 'firebase') {
        const firebaseStatus = checkFirebaseInitialization();
        if (!firebaseStatus.initialized) {
            console.error('謇句虚蜷梧悄繧ｨ繝ｩ繝ｼ: Firebase蛻晄悄蛹悶お繝ｩ繝ｼ:', firebaseStatus.error);
            showNotification(`Firebase蛻晄悄蛹悶お繝ｩ繝ｼ: ${firebaseStatus.error}`, 'error');
            return;
        }
    }
    
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.classList.add('syncing');
        syncBtn.disabled = true; // 繝懊ち繝ｳ繧堤┌蜉ｹ蛹・
        console.log('蜷梧悄繝懊ち繝ｳ繧堤┌蜉ｹ蛹・);
    }
    
    // 螳滄圀縺ｮ蜷梧悄蜃ｦ逅・
    const syncPromise = performActualSync();
    
    syncPromise.then(() => {
        console.log('謇句虚蜷梧悄螳御ｺ・);
        console.log('謇句虚蜷梧悄螳御ｺ・ｾ後・繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        if (syncBtn) {
            syncBtn.classList.remove('syncing');
            syncBtn.disabled = false; // 繝懊ち繝ｳ繧貞・譛牙柑蛹・
            console.log('蜷梧悄繝懊ち繝ｳ繧貞・譛牙柑蛹・);
        }
        
        showNotification('蜷梧悄縺悟ｮ御ｺ・＠縺ｾ縺励◆', 'success');
        updateSyncStatus();
    }).catch((error) => {
        console.error('蜷梧悄繧ｨ繝ｩ繝ｼ隧ｳ邏ｰ:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            currentStorage: currentStorage,
            userInfo: currentUserInfo
        });
        
        if (syncBtn) {
            syncBtn.classList.remove('syncing');
            syncBtn.disabled = false; // 繝懊ち繝ｳ繧貞・譛牙柑蛹・
            console.log('蜷梧悄繝懊ち繝ｳ繧貞・譛牙柑蛹厄ｼ医お繝ｩ繝ｼ譎ゑｼ・);
        }
        
        // 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ繧定ｩｳ邏ｰ蛹・
        let errorMessage = '蜷梧悄繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆';
        if (error.message.includes('Firebase縺悟茜逕ｨ縺ｧ縺阪∪縺帙ｓ')) {
            errorMessage = 'Firebase縺悟茜逕ｨ縺ｧ縺阪∪縺帙ｓ縲りｨｭ螳壹ｒ遒ｺ隱阪＠縺ｦ縺上□縺輔＞縲・;
        } else if (error.message.includes('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺御ｸ崎ｶｳ')) {
            errorMessage = '繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺御ｸ崎ｶｳ縺励※縺・∪縺吶ょ・繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・;
        } else if (error.message.includes('permission-denied')) {
            errorMessage = 'Firebase縺ｮ讓ｩ髯舌′荳崎ｶｳ縺励※縺・∪縺吶・;
        } else if (error.message.includes('unavailable')) {
            errorMessage = 'Firebase繧ｵ繝ｼ繝舌・縺ｫ謗･邯壹〒縺阪∪縺帙ｓ縲・;
        } else if (error.message.includes('network')) {
            errorMessage = '繝阪ャ繝医Ρ繝ｼ繧ｯ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・;
        }
        
        showNotification(errorMessage, 'error');
        updateSyncStatus();
    });
}

// 螳滄圀縺ｮ蜷梧悄蜃ｦ逅・
async function performActualSync() {
    console.log('螳滄圀縺ｮ蜷梧悄蜃ｦ逅・幕蟋・);
    console.log('performActualSync - 迴ｾ蝨ｨ縺ｮ繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝・', currentStorage);
    console.log('performActualSync - 迴ｾ蝨ｨ縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ:', currentUserInfo);
    
    try {
        switch (currentStorage) {
            case 'firebase':
                console.log('Firebase蜷梧悄繧貞ｮ溯｡・);
                await syncWithFirebase();
                break;
            case 'google-drive':
                console.log('Google Drive蜷梧悄繧貞ｮ溯｡・);
                await syncWithGoogleDrive();
                break;
            default:
                console.log('繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ蜷梧悄繧貞ｮ溯｡・);
                await syncWithLocalStorage();
                break;
        }
        
        console.log('蜷梧悄蜃ｦ逅・ｮ御ｺ・);
        return Promise.resolve();
    } catch (error) {
        console.error('蜷梧悄蜃ｦ逅・お繝ｩ繝ｼ隧ｳ邏ｰ:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            currentStorage: currentStorage
        });
        return Promise.reject(error);
    }
}

// Firebase縺ｨ縺ｮ蜷梧悄
async function syncWithFirebase() {
    console.log('Firebase蜷梧悄髢句ｧ・);
    
    // Firebase縺ｮ蛻ｩ逕ｨ蜿ｯ閭ｽ諤ｧ繝√ぉ繝・け
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase縺悟茜逕ｨ縺ｧ縺阪∪縺帙ｓ・・irebase譛ｪ螳夂ｾｩ・・);
    }
    
    if (!firebase.firestore) {
        throw new Error('Firebase縺悟茜逕ｨ縺ｧ縺阪∪縺帙ｓ・・irestore譛ｪ螳夂ｾｩ・・);
    }
    
    if (!currentUserInfo) {
        throw new Error('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺御ｸ崎ｶｳ縺励※縺・∪縺呻ｼ・urrentUserInfo譛ｪ螳夂ｾｩ・・);
    }
    
    if (!currentUserInfo.id) {
        throw new Error('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺御ｸ崎ｶｳ縺励※縺・∪縺呻ｼ医Θ繝ｼ繧ｶ繝ｼID譛ｪ螳夂ｾｩ・・);
    }
    
    const db = firebase.firestore();
    const userId = currentUserInfo.id;
    
    console.log('Firebase蜷梧悄 - 繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ隧ｳ邏ｰ:', {
        email: currentUserInfo.email,
        displayName: currentUserInfo.displayName,
        id: currentUserInfo.id,
        uid: currentUserInfo.uid,
        isGoogleUser: currentUserInfo.isGoogleUser
    });
    console.log('Firebase蜷梧悄 - 繝ｦ繝ｼ繧ｶ繝ｼID:', userId);
    console.log('Firebase蜷梧悄 - 迴ｾ蝨ｨ縺ｮ繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ:', {
        routinesCount: routines.length,
        completionsCount: completions.length,
        lastUpdated: localStorage.getItem('lastUpdated')
    });
    
    try {
        // 蜷梧悄迥ｶ諷九ｒ縲悟酔譛滉ｸｭ縲阪↓譖ｴ譁ｰ
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            syncStatus.textContent = '売 蜷梧悄荳ｭ...';
            syncStatus.className = 'sync-status syncing';
            syncStatus.title = 'Firebase繧ｵ繝ｼ繝舌・縺ｨ蜷梧悄荳ｭ...';
        }
        
        // Firebase縺九ｉ繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
        const docRef = db.collection('users').doc(userId);
        console.log('Firebase蜷梧悄 - 繝峨く繝･繝｡繝ｳ繝亥盾辣ｧ:', docRef.path);
        
        const doc = await docRef.get();
        
        let firebaseData = null;
        let shouldUpdateLocal = false;
        let shouldUpdateFirebase = true;
        
        if (doc.exists) {
            firebaseData = doc.data();
            console.log('Firebase縺九ｉ隱ｭ縺ｿ霎ｼ縺ｿ:', firebaseData);
            
            if (firebaseData.data && firebaseData.data.lastUpdated) {
                const firebaseLastUpdated = new Date(firebaseData.data.lastUpdated);
                const localLastUpdated = localStorage.getItem('lastUpdated') ? 
                    new Date(localStorage.getItem('lastUpdated')) : new Date(0);
                
                console.log('譌･莉俶ｯ碑ｼ・', {
                    firebase: firebaseLastUpdated.toISOString(),
                    local: localLastUpdated.toISOString(),
                    firebaseIsNewer: firebaseLastUpdated > localLastUpdated
                });
                
                if (firebaseLastUpdated > localLastUpdated) {
                    console.log('Firebase縺ｮ繝・・繧ｿ縺梧眠縺励＞縺溘ａ縲√Ο繝ｼ繧ｫ繝ｫ繝・・繧ｿ繧呈峩譁ｰ');
                    shouldUpdateLocal = true;
                    shouldUpdateFirebase = false; // 譌｢縺ｫ譛譁ｰ縺ｪ縺ｮ縺ｧ譖ｴ譁ｰ荳崎ｦ・
                } else if (firebaseLastUpdated.getTime() === localLastUpdated.getTime()) {
                    console.log('繝・・繧ｿ縺悟酔縺俶律譎ゅ↑縺ｮ縺ｧ縲：irebase譖ｴ譁ｰ繧偵せ繧ｭ繝・・');
                    shouldUpdateFirebase = false;
                }
            }
        } else {
            console.log('Firebase縺ｫ繝峨く繝･繝｡繝ｳ繝医′蟄伜惠縺励↑縺・◆繧√∵眠隕丈ｽ懈・');
        }
        
        // 繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ繧呈峩譁ｰ・亥ｿ・ｦ√↑蝣ｴ蜷茨ｼ・
        if (shouldUpdateLocal && firebaseData && firebaseData.data) {
            routines = firebaseData.data.routines || [];
            completions = firebaseData.data.completions || [];
            localStorage.setItem('appData', JSON.stringify({
                routines: routines,
                completions: completions,
                lastUpdated: firebaseData.data.lastUpdated
            }));
            localStorage.setItem('lastUpdated', firebaseData.data.lastUpdated);
            
            console.log('繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ譖ｴ譁ｰ螳御ｺ・', {
                routinesCount: routines.length,
                completionsCount: completions.length
            });
            
            // UI繧呈峩譁ｰ
            displayTodayRoutines();
            displayAllRoutines();
            showNotification('Firebase縺九ｉ譛譁ｰ繝・・繧ｿ繧貞叙蠕励＠縺ｾ縺励◆', 'success');
        }
        
        // Firebase縺ｫ繝・・繧ｿ繧剃ｿ晏ｭ假ｼ亥ｿ・ｦ√↑蝣ｴ蜷茨ｼ・
        if (shouldUpdateFirebase) {
            const data = {
                routines: routines || [],
                completions: completions || [],
                lastUpdated: new Date().toISOString(),
                userInfo: {
                    email: currentUserInfo.email,
                    displayName: currentUserInfo.displayName,
                    isGoogleUser: currentUserInfo.isGoogleUser || false
                }
            };
            
            console.log('Firebase蜷梧悄 - 菫晏ｭ倥ョ繝ｼ繧ｿ:', data);
            
            await docRef.set({
                data: data,
                updatedAt: new Date(),
                userEmail: currentUserInfo.email
            });
            
            // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｮlastUpdated繧よ峩譁ｰ
            localStorage.setItem('lastUpdated', data.lastUpdated);
            
            console.log('Firebase菫晏ｭ伜ｮ御ｺ・);
            showNotification('Firebase蜷梧悄縺悟ｮ御ｺ・＠縺ｾ縺励◆', 'success');
        } else {
            console.log('Firebase譖ｴ譁ｰ繧偵せ繧ｭ繝・・');
        }
        
        // 蜷梧悄迥ｶ諷九ｒ縲後が繝ｳ繝ｩ繧､繝ｳ蜷梧悄縲阪↓譖ｴ譁ｰ
        updateSyncStatus();
        
    } catch (error) {
        console.error('Firebase蜷梧悄繧ｨ繝ｩ繝ｼ隧ｳ邏ｰ:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            name: error.name
        });
        
        // 蜷梧悄迥ｶ諷九ｒ縲後Ο繝ｼ繧ｫ繝ｫ菫晏ｭ倥阪↓謌ｻ縺・
        currentStorage = 'local';
        localStorage.setItem('storageType', 'local');
        updateSyncStatus();
        
        // 繧ｨ繝ｩ繝ｼ騾夂衍
        showNotification(`Firebase蜷梧悄繧ｨ繝ｩ繝ｼ: ${error.message}`, 'error');
        
        throw error;
    }
}

// Google Drive縺ｨ縺ｮ蜷梧悄
async function syncWithGoogleDrive() {
    console.log('Google Drive蜷梧悄髢句ｧ・);
    
    // Google Drive蜷梧悄縺ｯ譛ｪ螳溯｣・・縺溘ａ縲√Ο繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｫ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ
    await syncWithLocalStorage();
    console.log('Google Drive蜷梧悄螳御ｺ・ｼ医Ο繝ｼ繧ｫ繝ｫ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ・・);
}

// 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｨ縺ｮ蜷梧悄
async function syncWithLocalStorage() {
    console.log('繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ蜷梧悄髢句ｧ・);
    
    // 迴ｾ蝨ｨ縺ｮ繝・・繧ｿ繧偵Ο繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｫ菫晏ｭ・
    const data = {
        routines: routines,
        completions: completions,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('appData', JSON.stringify(data));
    
    // 蟆代＠蠕・ｩ溘＠縺ｦ蜷梧悄諢溘ｒ貍泌・
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ蜷梧悄螳御ｺ・);
}

// 騾夂衍陦ｨ遉ｺ讖溯・
function showNotification(message, type = 'info') {
    console.log('騾夂衍陦ｨ遉ｺ:', message, type);
    
    // 譌｢蟄倥・騾夂衍繧貞炎髯､
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // 騾夂衍隕∫ｴ繧剃ｽ懈・
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // 繧｢繧､繧ｳ繝ｳ繧定ｨｭ螳・
    let icon = 'info';
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'alert-circle';
            break;
        case 'warning':
            icon = 'alert-triangle';
            break;
        default:
            icon = 'info';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${icon}" class="notification-icon"></i>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i data-lucide="x"></i>
        </button>
    `;
    
    // 騾夂衍繧定｡ｨ遉ｺ
    document.body.appendChild(notification);
    
    // Lucide繧｢繧､繧ｳ繝ｳ繧貞・譛溷喧
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // 繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ蜉ｹ譫・
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 閾ｪ蜍輔〒髱櫁｡ｨ遉ｺ・域・蜉溘→繧ｨ繝ｩ繝ｼ縺ｯ5遘偵√◎縺ｮ莉悶・3遘抵ｼ・
    const autoHideTime = (type === 'success' || type === 'error') ? 5000 : 3000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, autoHideTime);
}

// 繧ｹ繝医Ξ繝ｼ繧ｸ繝｢繝ｼ繝繝ｫ髢｢騾｣
function showStorageModal() {
    const storageModal = document.getElementById('storageModal');
    if (storageModal) {
        storageModal.style.display = 'block';
    }
}

function hideStorageModal() {
    const storageModal = document.getElementById('storageModal');
    if (storageModal) {
        storageModal.style.display = 'none';
    }
}

function selectStorage(storageType) {
    console.log('繧ｹ繝医Ξ繝ｼ繧ｸ驕ｸ謚・', storageType);
    
    // 驕ｸ謚樒憾諷九ｒ譖ｴ譁ｰ
    const storageOptions = document.querySelectorAll('.storage-option');
    storageOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[onclick="selectStorage('${storageType}')"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // 驕ｸ謚槭＆繧後◆繧ｹ繝医Ξ繝ｼ繧ｸ繧ｿ繧､繝励ｒ菫晏ｭ・
    localStorage.setItem('selectedStorage', storageType);
}

function confirmStorageSelection() {
    const selectedStorage = localStorage.getItem('selectedStorage') || 'local';
    console.log('繧ｹ繝医Ξ繝ｼ繧ｸ驕ｸ謚樒｢ｺ隱・', selectedStorage);
    
    currentStorage = selectedStorage;
    localStorage.setItem('storageType', selectedStorage);
    
    hideStorageModal();
    updateSyncStatus();
    
    showNotification(`${getStorageDisplayName(selectedStorage)}縺碁∈謚槭＆繧後∪縺励◆`, 'success');
}

function getStorageDisplayName(storageType) {
    switch (storageType) {
        case 'local': return '繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ';
        case 'firebase': return 'Firebase';
        case 'google-drive': return 'Google Drive';
        default: return '繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ';
    }
}

// 邂｡逅・・ム繝・す繝･繝懊・繝芽｡ｨ遉ｺ
function showAdminDashboard() {
    console.log('邂｡逅・・ム繝・す繝･繝懊・繝芽｡ｨ遉ｺ');
    
    // 繝｡繧､繝ｳ繧｢繝励Μ繧帝撼陦ｨ遉ｺ
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'none';
    }
    
    // 邂｡逅・・ム繝・す繝･繝懊・繝峨ｒ陦ｨ遉ｺ
    const adminDashboard = document.getElementById('adminDashboardScreen');
    if (adminDashboard) {
        adminDashboard.style.display = 'block';
        
        // 譛蛻昴・繧ｿ繝悶ｒ陦ｨ遉ｺ
        showAdminTab('users');
        
        // 繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
        loadAdminData();
        
        // Lucide繧｢繧､繧ｳ繝ｳ繧貞・譛溷喧
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// 邂｡逅・・ム繝・す繝･繝懊・繝蛾撼陦ｨ遉ｺ
function hideAdminDashboard() {
    console.log('邂｡逅・・ム繝・す繝･繝懊・繝蛾撼陦ｨ遉ｺ');
    
    const adminDashboard = document.getElementById('adminDashboardScreen');
    if (adminDashboard) {
        adminDashboard.style.display = 'none';
    }
    
    // 繝｡繧､繝ｳ繧｢繝励Μ繧定｡ｨ遉ｺ
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'block';
    }
}

// 邂｡逅・・ち繝冶｡ｨ遉ｺ
function showAdminTab(tabName) {
    console.log('邂｡逅・・ち繝冶｡ｨ遉ｺ:', tabName);
    
    // 繧ｿ繝悶・繧ｿ繝ｳ縺ｮ繧｢繧ｯ繝・ぅ繝也憾諷九ｒ譖ｴ譁ｰ
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTabBtn) {
        activeTabBtn.classList.add('active');
    }
    
    // 繧ｿ繝悶ヱ繝阪Ν縺ｮ陦ｨ遉ｺ繧呈峩譁ｰ
    const tabPanels = document.querySelectorAll('.admin-tab-panel');
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
    const activePanel = document.getElementById(`${tabName}Tab`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    
    // 繧ｿ繝悶↓蠢懊§縺溘ョ繝ｼ繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
    switch (tabName) {
        case 'users':
            loadUsersList();
            break;
        case 'friends':
            loadFriendsList();
            break;
        case 'stats':
            loadAdminStats();
            break;
    }
}

// 邂｡逅・・ョ繝ｼ繧ｿ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ
function loadAdminData() {
    console.log('邂｡逅・・ョ繝ｼ繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ髢句ｧ・);
    
    // 繝ｦ繝ｼ繧ｶ繝ｼ繝ｪ繧ｹ繝医ｒ隱ｭ縺ｿ霎ｼ縺ｿ
    loadUsersList();
    
    // 蜿矩＃繝ｪ繧ｹ繝医ｒ隱ｭ縺ｿ霎ｼ縺ｿ
    loadFriendsList();
    
    // 邨ｱ險医ｒ隱ｭ縺ｿ霎ｼ縺ｿ
    loadAdminStats();
}

// 繝ｦ繝ｼ繧ｶ繝ｼ繝ｪ繧ｹ繝医・隱ｭ縺ｿ霎ｼ縺ｿ
function loadUsersList() {
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ繝ｪ繧ｹ繝郁ｪｭ縺ｿ霎ｼ縺ｿ');
    
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺九ｉ繝ｦ繝ｼ繧ｶ繝ｼ繝・・繧ｿ繧貞叙蠕・
    const users = getAllUsers();
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="users" class="empty-icon"></i>
                <h3>繝ｦ繝ｼ繧ｶ繝ｼ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ</h3>
                <p>縺ｾ縺繝ｦ繝ｼ繧ｶ繝ｼ縺檎匳骭ｲ縺輔ｌ縺ｦ縺・∪縺帙ｓ</p>
            </div>
        `;
    } else {
        usersList.innerHTML = users.map(user => createUserItemHTML(user)).join('');
    }
    
    // Lucide繧｢繧､繧ｳ繝ｳ繧貞・譛溷喧
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 縺吶∋縺ｦ縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ繧貞叙蠕・
function getAllUsers() {
    const users = [];
    
    // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺九ｉ繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ繧貞叙蠕・
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (userInfo) {
        users.push({
            email: userInfo.email,
            displayName: userInfo.displayName,
            userType: getUserType(),
            isCurrentUser: true
        });
    }
    
    // 蜿矩＃繝ｪ繧ｹ繝医ｒ蜿門ｾ・
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    friendsList.forEach(email => {
        if (!users.find(u => u.email === email)) {
            users.push({
                email: email,
                displayName: email.split('@')[0],
                userType: 'friend',
                isCurrentUser: false
            });
        }
    });
    
    return users;
}

// 繝ｦ繝ｼ繧ｶ繝ｼ繧｢繧､繝・Β縺ｮHTML逕滓・
function createUserItemHTML(user) {
    const userTypeText = getUserTypeText(user.userType);
    const userTypeClass = user.userType;
    const isFriend = user.userType === 'friend';
    
    return `
        <div class="user-item" data-email="${user.email}">
            <div class="user-info">
                <div class="user-avatar">
                    ${user.displayName.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                    <div class="user-name">${user.displayName}</div>
                    <div class="user-email">${user.email}</div>
                    <span class="user-type ${userTypeClass}">
                        <i data-lucide="${getUserTypeIcon(user.userType)}"></i>
                        ${userTypeText}
                    </span>
                </div>
            </div>
            <div class="user-actions">
                ${!isFriend ? `
                    <button class="action-btn primary" onclick="markAsFriend('${user.email}')">
                        <i data-lucide="heart"></i>
                        蜿矩＃縺ｫ縺吶ｋ
                    </button>
                ` : `
                    <button class="action-btn secondary" onclick="removeFriend('${user.email}')">
                        <i data-lucide="user-minus"></i>
                        蜿矩＃隗｣髯､
                    </button>
                `}
                ${user.isCurrentUser ? `
                    <span class="action-btn secondary">迴ｾ蝨ｨ縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ</span>
                ` : `
                    <button class="action-btn danger" onclick="removeUser('${user.email}')">
                        <i data-lucide="trash"></i>
                        蜑企勁
                    </button>
                `}
            </div>
        </div>
    `;
}

// 繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝励・繝・く繧ｹ繝亥叙蠕・
function getUserTypeText(userType) {
    switch (userType) {
        case 'admin': return '邂｡逅・・;
        case 'friend': return '蜿矩＃';
        case 'general': return '荳闊ｬ繝ｦ繝ｼ繧ｶ繝ｼ';
        default: return '荳闊ｬ繝ｦ繝ｼ繧ｶ繝ｼ';
    }
}

// 繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝励・繧｢繧､繧ｳ繝ｳ蜿門ｾ・
function getUserTypeIcon(userType) {
    switch (userType) {
        case 'admin': return 'shield';
        case 'friend': return 'heart';
        case 'general': return 'user';
        default: return 'user';
    }
}

// 蜿矩＃縺ｨ縺励※繝槭・繧ｯ
function markAsFriend(email) {
    console.log('蜿矩＃縺ｨ縺励※繝槭・繧ｯ:', email);
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    if (!friendsList.includes(email)) {
        friendsList.push(email);
        localStorage.setItem('friendsList', JSON.stringify(friendsList));
        
        showNotification(`${email}繧貞暑驕斐↓霑ｽ蜉縺励∪縺励◆`, 'success');
        loadUsersList(); // 繝ｪ繧ｹ繝医ｒ譖ｴ譁ｰ
    }
}

// 蜿矩＃隗｣髯､
function removeFriend(email) {
    console.log('蜿矩＃隗｣髯､:', email);
    
    if (confirm(`${email}繧貞暑驕斐Μ繧ｹ繝医°繧牙炎髯､縺励∪縺吶°・歔)) {
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        const updatedList = friendsList.filter(friend => friend !== email);
        localStorage.setItem('friendsList', JSON.stringify(updatedList));
        
        showNotification(`${email}繧貞暑驕斐Μ繧ｹ繝医°繧牙炎髯､縺励∪縺励◆`, 'info');
        loadUsersList(); // 繝ｪ繧ｹ繝医ｒ譖ｴ譁ｰ
        loadFriendsList(); // 蜿矩＃繝ｪ繧ｹ繝医ｂ譖ｴ譁ｰ
    }
}

// 繝ｦ繝ｼ繧ｶ繝ｼ蜑企勁
function removeUser(email) {
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ蜑企勁:', email);
    
    if (confirm(`${email}繧貞炎髯､縺励∪縺吶°・溘％縺ｮ謫堺ｽ懊・蜿悶ｊ豸医○縺ｾ縺帙ｓ縲Ａ)) {
        // 蜿矩＃繝ｪ繧ｹ繝医°繧峨ｂ蜑企勁
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        const updatedList = friendsList.filter(friend => friend !== email);
        localStorage.setItem('friendsList', JSON.stringify(updatedList));
        
        showNotification(`${email}繧貞炎髯､縺励∪縺励◆`, 'success');
        loadUsersList(); // 繝ｪ繧ｹ繝医ｒ譖ｴ譁ｰ
    }
}

// 蜿矩＃繝ｪ繧ｹ繝医・隱ｭ縺ｿ霎ｼ縺ｿ
function loadFriendsList() {
    console.log('蜿矩＃繝ｪ繧ｹ繝郁ｪｭ縺ｿ霎ｼ縺ｿ');
    
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) return;
    
    const friends = JSON.parse(localStorage.getItem('friendsList') || '[]');
    
    if (friends.length === 0) {
        friendsList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="heart" class="empty-icon"></i>
                <h3>蜿矩＃縺後＞縺ｾ縺帙ｓ</h3>
                <p>蜿矩＃繧定ｿｽ蜉縺励※縲∽ｸ邱偵↓繝ｫ繝ｼ繝・ぅ繝ｳ繧堤ｮ｡逅・＠縺ｾ縺励ｇ縺・ｼ・/p>
            </div>
        `;
    } else {
        friendsList.innerHTML = friends.map(email => createFriendItemHTML(email)).join('');
    }
    
    // Lucide繧｢繧､繧ｳ繝ｳ繧貞・譛溷喧
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 蜿矩＃繧｢繧､繝・Β縺ｮHTML逕滓・
function createFriendItemHTML(email) {
    const displayName = email.split('@')[0];
    
    return `
        <div class="friend-item" data-email="${email}">
            <div class="user-info">
                <div class="user-avatar">
                    ${displayName.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                    <div class="user-name">${displayName}</div>
                    <div class="user-email">${email}</div>
                    <span class="user-type friend">
                        <i data-lucide="heart"></i>
                        蜿矩＃
                    </span>
                </div>
            </div>
            <div class="user-actions">
                <button class="action-btn secondary" onclick="removeFriend('${email}')">
                    <i data-lucide="user-minus"></i>
                    蜿矩＃隗｣髯､
                </button>
            </div>
        </div>
    `;
}

// 邂｡逅・・ｵｱ險医・隱ｭ縺ｿ霎ｼ縺ｿ
function loadAdminStats() {
    console.log('邂｡逅・・ｵｱ險郁ｪｭ縺ｿ霎ｼ縺ｿ');
    
    // 繝ｦ繝ｼ繧ｶ繝ｼ謨ｰ
    const users = getAllUsers();
    const totalUsersCount = document.getElementById('totalUsersCount');
    if (totalUsersCount) {
        totalUsersCount.textContent = users.length;
    }
    
    // 蜿矩＃謨ｰ
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    const friendsCount = document.getElementById('friendsCount');
    if (friendsCount) {
        friendsCount.textContent = friendsList.length;
    }
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ謨ｰ
    const totalRoutinesCount = document.getElementById('totalRoutinesCount');
    if (totalRoutinesCount) {
        totalRoutinesCount.textContent = routines.length;
    }
    
    // 螳御ｺ・紫
    const completionRate = document.getElementById('completionRate');
    if (completionRate) {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = routines.filter(routine => {
            const completionKey = `completion_${routine.id}_${today}`;
            return localStorage.getItem(completionKey) === 'true';
        }).length;
        
        const rate = routines.length > 0 ? Math.round((completedToday / routines.length) * 100) : 0;
        completionRate.textContent = `${rate}%`;
    }
}

// 蜿矩＃霑ｽ蜉繝｢繝ｼ繝繝ｫ陦ｨ遉ｺ
function showAddFriendModal() {
    console.log('蜿矩＃霑ｽ蜉繝｢繝ｼ繝繝ｫ陦ｨ遉ｺ');
    
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'block';
        
        // 繝輔か繝ｼ繝繧偵Μ繧ｻ繝・ヨ
        document.getElementById('friendEmail').value = '';
        document.getElementById('friendName').value = '';
    }
}

// 蜿矩＃霑ｽ蜉繝｢繝ｼ繝繝ｫ髱櫁｡ｨ遉ｺ
function hideAddFriendModal() {
    console.log('蜿矩＃霑ｽ蜉繝｢繝ｼ繝繝ｫ髱櫁｡ｨ遉ｺ');
    
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 蜿矩＃霑ｽ蜉蜃ｦ逅・
function addFriend() {
    console.log('蜿矩＃霑ｽ蜉蜃ｦ逅・);
    
    const email = document.getElementById('friendEmail').value.trim();
    const name = document.getElementById('friendName').value.trim();
    
    if (!email) {
        showNotification('繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ繧貞・蜉帙＠縺ｦ縺上□縺輔＞', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('譛牙柑縺ｪ繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ繧貞・蜉帙＠縺ｦ縺上□縺輔＞', 'error');
        return;
    }
    
    const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
    if (friendsList.includes(email)) {
        showNotification('縺薙・繝ｦ繝ｼ繧ｶ繝ｼ縺ｯ譌｢縺ｫ蜿矩＃繝ｪ繧ｹ繝医↓蜷ｫ縺ｾ繧後※縺・∪縺・, 'warning');
        return;
    }
    
    // 蜿矩＃繝ｪ繧ｹ繝医↓霑ｽ蜉
    friendsList.push(email);
    localStorage.setItem('friendsList', JSON.stringify(friendsList));
    
    // 陦ｨ遉ｺ蜷阪ｂ菫晏ｭ假ｼ井ｻｻ諢擾ｼ・
    if (name) {
        const friendNames = JSON.parse(localStorage.getItem('friendNames') || '{}');
        friendNames[email] = name;
        localStorage.setItem('friendNames', JSON.stringify(friendNames));
    }
    
    hideAddFriendModal();
    showNotification(`${email}繧貞暑驕斐↓霑ｽ蜉縺励∪縺励◆`, 'success');
    
    // 繝ｪ繧ｹ繝医ｒ譖ｴ譁ｰ
    loadUsersList();
    loadFriendsList();
}

// 繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ縺ｮ螯･蠖捺ｧ繝√ぉ繝・け
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 繝ｫ繝ｼ繝・ぅ繝ｳ縺ｮ邱ｨ髮・
function editRoutine(routineId) {
    console.log('繝ｫ繝ｼ繝・ぅ繝ｳ邱ｨ髮・', routineId);
    
    const routine = routines.find(r => r.id === routineId);
    if (!routine) {
        console.error('繝ｫ繝ｼ繝・ぅ繝ｳ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ:', routineId);
        return;
    }
    
    showEditForm(routine);
}

// 繝ｫ繝ｼ繝・ぅ繝ｳ縺ｮ蜑企勁
function deleteRoutine(routineId) {
    console.log('繝ｫ繝ｼ繝・ぅ繝ｳ蜑企勁:', routineId);
    
    if (confirm('縺薙・繝ｫ繝ｼ繝・ぅ繝ｳ繧貞炎髯､縺励∪縺吶°・・)) {
        routines = routines.filter(r => r.id !== routineId);
        saveData();
        
        // 陦ｨ遉ｺ繧呈峩譁ｰ
        displayTodayRoutines();
        displayAllRoutines();
        
        showNotification('繝ｫ繝ｼ繝・ぅ繝ｳ繧貞炎髯､縺励∪縺励◆', 'success');
    }
}

// 邱ｨ髮・ヵ繧ｩ繝ｼ繝縺ｮ陦ｨ遉ｺ
function showEditForm(routine) {
    const editForm = document.getElementById('editRoutineForm');
    if (!editForm) return;
    
    // 繝輔か繝ｼ繝縺ｫ蛟､繧定ｨｭ螳・
    document.getElementById('editRoutineId').value = routine.id;
    document.getElementById('editRoutineTitle').value = routine.title;
    document.getElementById('editRoutineDescription').value = routine.description || '';
    document.getElementById('editRoutineTime').value = routine.time || '';
    
    // 鬆ｻ蠎ｦ繧定ｨｭ螳・
    const frequencySelect = document.getElementById('editRoutineFrequency');
    if (frequencySelect) {
        frequencySelect.value = routine.frequency;
    }
    
    // 邱ｨ髮・ヵ繧ｩ繝ｼ繝繧定｡ｨ遉ｺ
    editForm.style.display = 'block';
}

// 邱ｨ髮・＆繧後◆繝ｫ繝ｼ繝・ぅ繝ｳ繧剃ｿ晏ｭ・
async function saveEditedRoutine(routineId) {
    const title = document.getElementById('editRoutineTitle').value.trim();
    const description = document.getElementById('editRoutineDescription').value.trim();
    const time = document.getElementById('editRoutineTime').value;
    const frequency = document.getElementById('editRoutineFrequency').value;
    
    if (!title) {
        showNotification('繧ｿ繧､繝医Ν繧貞・蜉帙＠縺ｦ縺上□縺輔＞', 'error');
        return;
    }
    
    const routineIndex = routines.findIndex(r => r.id === routineId);
    if (routineIndex === -1) {
        console.error('繝ｫ繝ｼ繝・ぅ繝ｳ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ:', routineId);
        return;
    }
    
    // 繝ｫ繝ｼ繝・ぅ繝ｳ繧呈峩譁ｰ
    routines[routineIndex] = {
        ...routines[routineIndex],
        title,
        description,
        time,
        frequency,
        updatedAt: new Date().toISOString()
    };
    
    await saveData();
    hideEditForm();
    
    // 陦ｨ遉ｺ繧呈峩譁ｰ
    displayTodayRoutines();
    displayAllRoutines();
    
    showNotification('繝ｫ繝ｼ繝・ぅ繝ｳ繧呈峩譁ｰ縺励∪縺励◆', 'success');
}

// 邱ｨ髮・ヵ繧ｩ繝ｼ繝繧帝撼陦ｨ遉ｺ
function hideEditForm() {
    const editForm = document.getElementById('editRoutineForm');
    if (editForm) {
        editForm.style.display = 'none';
    }
}

// 鬆ｻ蠎ｦ繧ｪ繝励す繝ｧ繝ｳ縺ｮ陦ｨ遉ｺ
function showFrequencyOptions(formType, selectedFrequency) {
    const optionsContainer = document.getElementById(`${formType}FrequencyOptions`);
    if (!optionsContainer) return;
    
    const frequencies = [
        { value: 'daily', label: '豈取律' },
        { value: 'weekly', label: '豈朱ｱ' },
        { value: 'monthly', label: '豈取怦' }
    ];
    
    optionsContainer.innerHTML = frequencies.map(freq => `
        <button type="button" 
                class="frequency-btn ${freq.value === selectedFrequency ? 'selected' : ''}"
                onclick="selectFrequency('${formType}', '${freq.value}')">
            ${freq.label}
        </button>
    `).join('');
    
    optionsContainer.style.display = 'block';
}

// 鬆ｻ蠎ｦ縺ｮ驕ｸ謚・
function selectFrequency(formType, frequency) {
    console.log('鬆ｻ蠎ｦ驕ｸ謚・', formType, frequency);
    
    // 髫縺励ヵ繧｣繝ｼ繝ｫ繝峨↓鬆ｻ蠎ｦ繧定ｨｭ螳・
    const frequencyInput = document.getElementById(`${formType}RoutineFrequency`);
    if (frequencyInput) {
        frequencyInput.value = frequency;
        console.log('鬆ｻ蠎ｦ繧定ｨｭ螳・', frequency);
    } else {
        console.warn('鬆ｻ蠎ｦ蜈･蜉帙ヵ繧｣繝ｼ繝ｫ繝峨′隕九▽縺九ｊ縺ｾ縺帙ｓ:', `${formType}RoutineFrequency`);
    }
    
    // 鬆ｻ蠎ｦ繧ｪ繝励す繝ｧ繝ｳ繧帝撼陦ｨ遉ｺ
    const optionsContainer = document.getElementById(`${formType}FrequencyOptions`);
    if (optionsContainer) {
        optionsContainer.style.display = 'none';
    }
    
    // 驕ｸ謚樒憾諷九ｒ譖ｴ譁ｰ
    const buttons = document.querySelectorAll('.frequency-btn');
    buttons?.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.frequency === frequency) {
            btn.classList.add('selected');
        }
    });
    
    // 鬆ｻ蠎ｦ縺ｫ蠢懊§縺ｦ霑ｽ蜉繝輔ぅ繝ｼ繝ｫ繝峨ｒ陦ｨ遉ｺ/髱櫁｡ｨ遉ｺ
    if (formType === 'add') {
        // 豈朱ｱ縺ｮ譖懈律驕ｸ謚・
        const weeklyDaysRow = document.getElementById('addWeeklyDaysRow');
        if (weeklyDaysRow) {
            weeklyDaysRow.style.display = frequency === 'weekly' ? 'block' : 'none';
            console.log('豈朱ｱ縺ｮ譖懈律驕ｸ謚槭ヵ繧｣繝ｼ繝ｫ繝・', frequency === 'weekly' ? '陦ｨ遉ｺ' : '髱櫁｡ｨ遉ｺ');
        }
        
        // 豈取怦縺ｮ譌･莉倬∈謚・
        const monthlyDateRow = document.getElementById('addMonthlyDateRow');
        if (monthlyDateRow) {
            monthlyDateRow.style.display = frequency === 'monthly' ? 'block' : 'none';
            console.log('豈取怦縺ｮ譌･莉倬∈謚槭ヵ繧｣繝ｼ繝ｫ繝・', frequency === 'monthly' ? '陦ｨ遉ｺ' : '髱櫁｡ｨ遉ｺ');
        } else {
            console.error('addMonthlyDateRow隕∫ｴ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ');
        }
    } else if (formType === 'edit') {
        // 邱ｨ髮・ヵ繧ｩ繝ｼ繝縺ｮ蝣ｴ蜷・
        const editWeeklyDaysRow = document.getElementById('editWeeklyDaysRow');
        if (editWeeklyDaysRow) {
            editWeeklyDaysRow.style.display = frequency === 'weekly' ? 'block' : 'none';
        }
        
        const editMonthlyDateRow = document.getElementById('editMonthlyDateRow');
        if (editMonthlyDateRow) {
            editMonthlyDateRow.style.display = frequency === 'monthly' ? 'block' : 'none';
        }
    }
}

// 繝ｫ繝ｼ繝・ぅ繝ｳ繝輔か繝ｼ繝縺ｮ騾∽ｿ｡蜃ｦ逅・
async function handleRoutineFormSubmit(event) {
    event.preventDefault();
    console.log('繝ｫ繝ｼ繝・ぅ繝ｳ繝輔か繝ｼ繝騾∽ｿ｡');
    
    const formType = event.target.id === 'routineForm' ? 'add' : 'edit';
    const title = document.getElementById('routineName').value.trim();
    const description = document.getElementById('routineDescription').value.trim();
    const frequency = document.getElementById('addRoutineFrequency').value;
    
    console.log('繝輔か繝ｼ繝繝・・繧ｿ:', { title, description, frequency });
    
    if (!title) {
        showNotification('繧ｿ繧､繝医Ν繧貞・蜉帙＠縺ｦ縺上□縺輔＞', 'error');
        return;
    }
    
    if (!frequency) {
        showNotification('鬆ｻ蠎ｦ繧帝∈謚槭＠縺ｦ縺上□縺輔＞', 'error');
        return;
    }
    
    // 鬆ｻ蠎ｦ縺ｫ蠢懊§縺溯ｿｽ蜉繝・・繧ｿ繧貞叙蠕・
    let additionalData = {};
    
    if (frequency === 'weekly') {
        const selectedWeekdays = Array.from(document.querySelectorAll('.add-weekday-input:checked'))
            .map(checkbox => parseInt(checkbox.value));
        if (selectedWeekdays.length === 0) {
            showNotification('譖懈律繧帝∈謚槭＠縺ｦ縺上□縺輔＞', 'error');
            return;
        }
        additionalData.weeklyDays = selectedWeekdays;
    }
    
    if (frequency === 'monthly') {
        const monthlyDate = document.getElementById('addMonthlyDateInput').value;
        console.log('豈取怦縺ｮ譌･莉伜・蜉帛､:', monthlyDate);
        if (!monthlyDate || monthlyDate < 1 || monthlyDate > 31) {
            showNotification('1縺九ｉ31縺ｮ髢薙・譌･莉倥ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞', 'error');
            return;
        }
        additionalData.monthlyDate = parseInt(monthlyDate);
        console.log('豈取怦縺ｮ譌･莉倥ョ繝ｼ繧ｿ險ｭ螳・', additionalData.monthlyDate);
    }
    
    if (formType === 'add') {
        // 譁ｰ縺励＞繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｿｽ蜉
        const newRoutine = {
            id: Date.now().toString(),
            title,
            description,
            frequency,
            ...additionalData,
            createdAt: new Date().toISOString(),
            userId: currentUserInfo?.id || 'unknown'
        };
        
        console.log('譁ｰ縺励＞繝ｫ繝ｼ繝・ぅ繝ｳ:', newRoutine);
        console.log('繝ｫ繝ｼ繝・ぅ繝ｳ霑ｽ蜉蜑阪・繝・・繧ｿ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated'),
            currentStorage: currentStorage,
            currentUserInfo: currentUserInfo
        });
        
        routines.push(newRoutine);
        console.log('routines驟榊・縺ｫ霑ｽ蜉蠕後・髟ｷ縺・', routines.length);
        console.log('routines驟榊・縺ｮ蜀・ｮｹ:', routines);
        
        // 繝・・繧ｿ繧剃ｿ晏ｭ假ｼ亥ｮ御ｺ・ｒ蠕・▽・・
        console.log('繝・・繧ｿ菫晏ｭ倬幕蟋・);
        await saveData();
        console.log('繝・・繧ｿ菫晏ｭ伜ｮ御ｺ・);
        console.log('繝ｫ繝ｼ繝・ぅ繝ｳ霑ｽ蜉蠕後・繝・・繧ｿ:', {
            routinesCount: routines.length,
            completionsCount: completions.length,
            lastUpdated: localStorage.getItem('lastUpdated')
        });
        
        // 繝輔か繝ｼ繝繧偵Μ繧ｻ繝・ヨ
        event.target.reset();
        document.getElementById('addRoutineFrequency').value = '';
        
        // 鬆ｻ蠎ｦ繝懊ち繝ｳ縺ｮ驕ｸ謚樒憾諷九ｒ繝ｪ繧ｻ繝・ヨ
        const frequencyButtons = document.querySelectorAll('.frequency-btn');
        frequencyButtons.forEach(btn => btn.classList.remove('active'));
        
        // 霑ｽ蜉繝輔ぅ繝ｼ繝ｫ繝峨ｒ髱櫁｡ｨ遉ｺ
        const weeklyDaysRow = document.getElementById('addWeeklyDaysRow');
        const monthlyDateRow = document.getElementById('addMonthlyDateRow');
        if (weeklyDaysRow) weeklyDaysRow.style.display = 'none';
        if (monthlyDateRow) monthlyDateRow.style.display = 'none';
        
        // 繝｡繧､繝ｳ逕ｻ髱｢縺ｫ謌ｻ繧具ｼ・howMainScreen蜀・〒陦ｨ遉ｺ譖ｴ譁ｰ縺輔ｌ繧具ｼ・
        console.log('繝｡繧､繝ｳ逕ｻ髱｢縺ｫ謌ｻ繧句燕縺ｮroutines驟榊・:', routines);
        showMainScreen();
        
        showNotification('繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｿｽ蜉縺励∪縺励◆', 'success');
    } else {
        // 譌｢蟄倥・繝ｫ繝ｼ繝・ぅ繝ｳ繧呈峩譁ｰ
        const routineId = document.getElementById('editRoutineId').value;
        saveEditedRoutine(routineId);
    }
}

// 鬆ｻ蠎ｦ繝懊ち繝ｳ縺ｮ繧ｯ繝ｪ繝・け蜃ｦ逅・
function handleFrequencyButtonClick(event) {
    console.log('鬆ｻ蠎ｦ繝懊ち繝ｳ繧ｯ繝ｪ繝・け:', event.target);
    console.log('鬆ｻ蠎ｦ繝懊ち繝ｳ縺ｮdata-frequency:', event.target.dataset.frequency);
    
    // 繧ｯ繝ｪ繝・け縺輔ｌ縺溘・繧ｿ繝ｳ縺ｮ鬆ｻ蠎ｦ繧貞叙蠕・
    const frequency = event.target.dataset.frequency;
    if (!frequency) {
        console.error('鬆ｻ蠎ｦ縺瑚ｨｭ螳壹＆繧後※縺・∪縺帙ｓ');
        return;
    }
    
    console.log('驕ｸ謚槭＆繧後◆鬆ｻ蠎ｦ:', frequency);
    
    // 繝輔か繝ｼ繝繧ｿ繧､繝励ｒ蛻､螳・
    const form = event.target.closest('form');
    const formType = form ? (form.id === 'routineForm' ? 'add' : 'edit') : 'add';
    console.log('繝輔か繝ｼ繝繧ｿ繧､繝・', formType);
    
    // 鬆ｻ蠎ｦ繧定ｨｭ螳・
    selectFrequency(formType, frequency);
    
    // 驕ｸ謚樒憾諷九ｒ譖ｴ譁ｰ
    const frequencyButtons = form.querySelectorAll('.frequency-btn');
    frequencyButtons.forEach(btn => {
        btn.classList.remove('active', 'selected');
        if (btn.dataset.frequency === frequency) {
            btn.classList.add('active', 'selected');
        }
    });
}

// 繧ｿ繝悶・繧ｿ繝ｳ縺ｮ繧ｯ繝ｪ繝・け蜃ｦ逅・
function handleTabButtonClick(event) {
    const frequency = event.target.dataset.frequency;
    if (frequency) {
        filterRoutinesByFrequency(frequency);
    }
}

// 鬆ｻ蠎ｦ蛻･縺ｫ繝ｫ繝ｼ繝・ぅ繝ｳ繧偵ヵ繧｣繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ
function filterRoutinesByFrequency(frequency) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    const filteredRoutines = routines.filter(routine => routine.frequency === frequency);
    
    const allRoutinesList = document.getElementById('allRoutinesList');
    if (allRoutinesList) {
        if (filteredRoutines.length === 0) {
            allRoutinesList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list" class="empty-icon"></i>
                    <h3>${getFrequencyText(frequency)}縺ｮ繝ｫ繝ｼ繝・ぅ繝ｳ縺ｯ縺ゅｊ縺ｾ縺帙ｓ</h3>
                    <p>譁ｰ縺励＞繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｿｽ蜉縺励∪縺励ｇ縺・ｼ・/p>
                </div>
            `;
        } else {
            allRoutinesList.innerHTML = filteredRoutines.map(routine => createRoutineHTML(routine)).join('');
        }
        
        // Lucide繧｢繧､繧ｳ繝ｳ繧貞・譛溷喧
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// 繝・・繧ｿ縺ｮ菫晏ｭ・
async function saveData() {
    console.log('繝・・繧ｿ菫晏ｭ倬幕蟋・);
    console.log('saveData - currentStorage:', currentStorage);
    
    try {
        const data = {
            routines: routines,
            completions: completions,
            lastUpdated: new Date().toISOString()
        };
        
        switch (currentStorage) {
            case 'firebase':
                // Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺碁∈謚槭＆繧後※縺・ｋ蝣ｴ蜷医・縲｝erformActualSync繧剃ｽｿ逕ｨ
                if (currentUserInfo && currentUserInfo.id) {
                    console.log('Firebase繧ｹ繝医Ξ繝ｼ繧ｸ縺碁∈謚槭＆繧後※縺・ｋ縺溘ａ縲｝erformActualSync繧剃ｽｿ逕ｨ');
                    // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｫ繧ゆｿ晏ｭ假ｼ医ヰ繝・け繧｢繝・・・・
                    localStorage.setItem('appData', JSON.stringify(data));
                    localStorage.setItem('lastUpdated', data.lastUpdated);
                    
                    // Firebase縺ｫ蜷梧悄・亥ｮ御ｺ・ｒ蠕・▽・・
                    try {
                        await performActualSync();
                        console.log('Firebase蜷梧悄螳御ｺ・);
                    } catch (error) {
                        console.error('Firebase蜷梧悄繧ｨ繝ｩ繝ｼ:', error);
                        showNotification('Firebase蜷梧悄縺ｫ螟ｱ謨励＠縺ｾ縺励◆', 'error');
                    }
                } else {
                    console.log('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺御ｸ崎ｶｳ縺励※縺・ｋ縺溘ａ縲√Ο繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｫ菫晏ｭ・);
                    localStorage.setItem('appData', JSON.stringify(data));
                }
                break;
            case 'google-drive':
                // Google Drive縺ｫ菫晏ｭ假ｼ亥ｮ溯｣・ｺ亥ｮ夲ｼ・
                console.log('Google Drive菫晏ｭ假ｼ域悴螳溯｣・ｼ・);
                localStorage.setItem('appData', JSON.stringify(data));
                break;
            default:
                // 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｫ菫晏ｭ・
                localStorage.setItem('appData', JSON.stringify(data));
                console.log('繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｫ菫晏ｭ伜ｮ御ｺ・);
                break;
        }
    } catch (error) {
        console.error('繝・・繧ｿ菫晏ｭ倥お繝ｩ繝ｼ:', error);
    }
}

// 繝ｫ繝ｼ繝・ぅ繝ｳ縺ｮ霑ｽ蜉
async function addRoutine(routineData) {
    console.log('繝ｫ繝ｼ繝・ぅ繝ｳ霑ｽ蜉:', routineData);
    
    const newRoutine = {
        id: Date.now().toString(),
        ...routineData,
        createdAt: new Date().toISOString(),
        userId: currentUserInfo?.id || 'unknown'
    };
    
    routines.push(newRoutine);
    await saveData();
    
    // 陦ｨ遉ｺ繧呈峩譁ｰ
    displayTodayRoutines();
    displayAllRoutines();
    
    showNotification('繝ｫ繝ｼ繝・ぅ繝ｳ繧定ｿｽ蜉縺励∪縺励◆', 'success');
}

// 繧｢繝励Μ縺ｮ蛻晄悄蛹・
function initializeApp() {
    console.log('繧｢繝励Μ蛻晄悄蛹夜幕蟋・);
    
    // 繧ｹ繝医Ξ繝ｼ繧ｸ縺ｮ蛻晄悄蛹・
    initializeStorage();
    
    // 繝・・繧ｿ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ
    loadRoutines();
    
    // 蜷梧悄迥ｶ諷九・譖ｴ譁ｰ
    updateSyncStatus();
    
    // 蠎・相縺ｮ陦ｨ遉ｺ
    showAdsIfNeeded();
    
    console.log('繧｢繝励Μ蛻晄悄蛹門ｮ御ｺ・);
}

// 繧ｹ繝医Ξ繝ｼ繧ｸ縺ｮ蛻晄悄蛹・
function initializeStorage() {
    console.log('繧ｹ繝医Ξ繝ｼ繧ｸ蛻晄悄蛹・);
    
    // 菫晏ｭ倥＆繧後◆繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ
    try {
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            const data = JSON.parse(savedData);
            routines = data.routines || [];
            completions = data.completions || [];
            console.log('菫晏ｭ倥＆繧後◆繝・・繧ｿ繧定ｪｭ縺ｿ霎ｼ縺ｿ縺ｾ縺励◆');
        }
    } catch (error) {
        console.error('繝・・繧ｿ隱ｭ縺ｿ霎ｼ縺ｿ繧ｨ繝ｩ繝ｼ:', error);
        routines = [];
        completions = [];
    }
}

// 繝ｭ繧ｰ繧｢繧ｦ繝亥・逅・
async function logout() {
    console.log('繝ｭ繧ｰ繧｢繧ｦ繝磯幕蟋・);
    
    try {
        // Firebase隱崎ｨｼ縺九ｉ繝ｭ繧ｰ繧｢繧ｦ繝・
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
        }
        
        // 繝ｭ繝ｼ繧ｫ繝ｫ繝・・繧ｿ繧偵け繝ｪ繧｢
        clearUserInfo();
        
        // 逕ｻ髱｢繧定ｪ崎ｨｼ逕ｻ髱｢縺ｫ謌ｻ縺・
        showAuthScreen();
        
        showNotification('繝ｭ繧ｰ繧｢繧ｦ繝医＠縺ｾ縺励◆', 'info');
        
    } catch (error) {
        console.error('繝ｭ繧ｰ繧｢繧ｦ繝医お繝ｩ繝ｼ:', error);
        showNotification('繝ｭ繧ｰ繧｢繧ｦ繝医お繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆', 'error');
    }
}

// 繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝励・險ｭ螳・
function setUserType(user) {
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝苓ｨｭ螳夐幕蟋・', user.email);
    
    let userType = 'general'; // 繝・ヵ繧ｩ繝ｫ繝医・荳闊ｬ繝ｦ繝ｼ繧ｶ繝ｼ
    
    // 邂｡逅・・メ繧ｧ繝・け
    if (user.email === 'yasnaries@gmail.com') {
        userType = 'admin';
        console.log('邂｡逅・・→縺励※險ｭ螳・', user.email);
    } else {
        // 蜿矩＃繝ｪ繧ｹ繝医ｒ繝√ぉ繝・け
        const friendsList = JSON.parse(localStorage.getItem('friendsList') || '[]');
        if (friendsList.includes(user.email)) {
            userType = 'friend';
            console.log('蜿矩＃縺ｨ縺励※險ｭ螳・', user.email);
        }
    }
    
    // 繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝励ｒ菫晏ｭ・
    localStorage.setItem('userType', userType);
    
    // currentUserInfo縺ｫ繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝励ｒ霑ｽ蜉
    if (currentUserInfo) {
        currentUserInfo.userType = userType;
        localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));
    }
    
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝苓ｨｭ螳壼ｮ御ｺ・', userType);
}

// 繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝励・蜿門ｾ・
function getUserType() {
    if (!currentUserInfo) {
        console.log('繝ｦ繝ｼ繧ｶ繝ｼ諠・ｱ縺後≠繧翫∪縺帙ｓ');
        return 'general';
    }
    
    const userType = localStorage.getItem('userType') || 'general';
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝怜叙蠕・', userType);
    return userType;
}

// 邂｡逅・・°縺ｩ縺・°繝√ぉ繝・け
function isAdmin() {
    return getUserType() === 'admin';
}

// 蜿矩＃縺九←縺・°繝√ぉ繝・け
function isFriend() {
    return getUserType() === 'friend';
}

// 荳闊ｬ繝ｦ繝ｼ繧ｶ繝ｼ縺九←縺・°繝√ぉ繝・け
function isGeneralUser() {
    return getUserType() === 'general';
}

// 騾夂衍險ｱ蜿ｯ隕∵ｱ・
function requestNotificationPermission() {
    console.log('騾夂衍險ｱ蜿ｯ隕∵ｱ・);
    
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('騾夂衍縺梧怏蜉ｹ縺ｫ縺ｪ繧翫∪縺励◆', 'success');
            } else {
                showNotification('騾夂衍縺梧拠蜷ｦ縺輔ｌ縺ｾ縺励◆', 'info');
            }
        });
    } else {
        showNotification('縺薙・繝悶Λ繧ｦ繧ｶ縺ｯ騾夂衍繧偵し繝昴・繝医＠縺ｦ縺・∪縺帙ｓ', 'warning');
    }
}

// Firebase險ｭ螳夂｢ｺ隱・
function checkFirebaseStatus() {
    console.log('Firebase險ｭ螳夂｢ｺ隱埼幕蟋・);
    
    let status = 'Firebase險ｭ螳夂｢ｺ隱・\n\n';
    
    // Firebase SDK縺ｮ遒ｺ隱・
    if (typeof firebase === 'undefined') {
        status += '笶・Firebase SDK縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺帙ｓ\n';
    } else {
        status += '笨・Firebase SDK縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後※縺・∪縺兔n';
        
        // 隱崎ｨｼ縺ｮ遒ｺ隱・
        if (firebase.auth) {
            status += '笨・Firebase Auth縺悟茜逕ｨ蜿ｯ閭ｽ縺ｧ縺兔n';
        } else {
            status += '笶・Firebase Auth縺悟茜逕ｨ縺ｧ縺阪∪縺帙ｓ\n';
        }
        
        // Firestore縺ｮ遒ｺ隱・
        if (firebase.firestore) {
            status += '笨・Firestore縺悟茜逕ｨ蜿ｯ閭ｽ縺ｧ縺兔n';
        } else {
            status += '笶・Firestore縺悟茜逕ｨ縺ｧ縺阪∪縺帙ｓ\n';
        }
    }
    
    // 險ｭ螳壹・遒ｺ隱・
    const config = window.firebaseConfig;
    if (config) {
        status += '\n險ｭ螳壽ュ蝣ｱ:\n';
        status += `API Key: ${config.apiKey ? '笨・險ｭ螳壽ｸ医∩' : '笶・譛ｪ險ｭ螳・}\n`;
        status += `Auth Domain: ${config.authDomain ? '笨・險ｭ螳壽ｸ医∩' : '笶・譛ｪ險ｭ螳・}\n`;
        status += `Project ID: ${config.projectId ? '笨・險ｭ螳壽ｸ医∩' : '笶・譛ｪ險ｭ螳・}\n`;
    } else {
        status += '\n笶・Firebase險ｭ螳壹′隕九▽縺九ｊ縺ｾ縺帙ｓ\n';
    }
    
    alert(status);
}

// Firebase險ｭ螳壻ｿｮ豁｣
function fixFirebaseConfig() {
    console.log('Firebase險ｭ螳壻ｿｮ豁｣髢句ｧ・);
    
    // 險ｭ螳壻ｿｮ豁｣繝｢繝ｼ繝繝ｫ繧定｡ｨ遉ｺ
    const modal = document.getElementById('firebaseConfigModal');
    if (modal) {
        modal.style.display = 'block';
        
        // 迴ｾ蝨ｨ縺ｮ險ｭ螳壹ｒ陦ｨ遉ｺ
        const currentConfig = document.getElementById('currentConfig');
        if (currentConfig) {
            const config = window.firebaseConfig;
            if (config) {
                currentConfig.innerHTML = `
                    <p><strong>API Key:</strong> ${config.apiKey || '譛ｪ險ｭ螳・}</p>
                    <p><strong>Auth Domain:</strong> ${config.authDomain || '譛ｪ險ｭ螳・}</p>
                    <p><strong>Project ID:</strong> ${config.projectId || '譛ｪ險ｭ螳・}</p>
                    <p><strong>Storage Bucket:</strong> ${config.storageBucket || '譛ｪ險ｭ螳・}</p>
                    <p><strong>Messaging Sender ID:</strong> ${config.messagingSenderId || '譛ｪ險ｭ螳・}</p>
                    <p><strong>App ID:</strong> ${config.appId || '譛ｪ險ｭ螳・}</p>
                `;
            } else {
                currentConfig.innerHTML = '<p>險ｭ螳壹′隕九▽縺九ｊ縺ｾ縺帙ｓ</p>';
            }
        }
    }
}

// 繝ｦ繝ｼ繧ｶ繝ｼ讀懃ｴ｢讖溯・
function filterUsers(searchTerm) {
    console.log('繝ｦ繝ｼ繧ｶ繝ｼ讀懃ｴ｢:', searchTerm);
    
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    const users = getAllUsers();
    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        user.displayName.toLowerCase().includes(searchTerm)
    );
    
    if (filteredUsers.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="search" class="empty-icon"></i>
                <h3>讀懃ｴ｢邨先棡縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ</h3>
                <p>"${searchTerm}"縺ｫ荳閾ｴ縺吶ｋ繝ｦ繝ｼ繧ｶ繝ｼ縺ｯ縺・∪縺帙ｓ</p>
            </div>
        `;
    } else {
        usersList.innerHTML = filteredUsers.map(user => createUserItemHTML(user)).join('');
    }
    
    // Lucide繧｢繧､繧ｳ繝ｳ繧貞・譛溷喧
    if (window.lucide) {
        lucide.createIcons();
    }
}

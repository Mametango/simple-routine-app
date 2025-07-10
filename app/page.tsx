'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Edit, Calendar, Clock, Target, Sun, CalendarDays, List, LogOut, User, Dumbbell } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import './page.css'

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface Routine {
  id: string;
  title: string;
  description: string;
  frequency: string;
  time: string;
  weekdays?: string[];
  completed: boolean;
  createdAt: string;
  userId: string;
  checklist?: ChecklistItem[];
  monthlyDate?: string;
}

interface NewRoutine {
  title: string;
  description: string;
  frequency: string;
  time: string;
  weekdays: string[];
  monthlyDate?: string;
  checklist: ChecklistItem[];
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  completed: boolean;
}

interface Training {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  exercises: Exercise[];
  completed: boolean;
  createdAt: string;
  userId: string;
}

interface NewTraining {
  title: string;
  description: string;
  date: string;
  duration: string;
  exercises: Exercise[];
}

export default function Home() {
  const { user, token, logout } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [newRoutine, setNewRoutine] = useState<NewRoutine>({
    title: '',
    description: '',
    frequency: 'daily',
    time: '',
    weekdays: [],
    monthlyDate: '',
    checklist: [{ text: '', checked: false }],
  })

  // デバッグ用：頻度変更時のログ
  useEffect(() => {
    console.log('Frequency changed to:', newRoutine.frequency);
    console.log('Monthly date field should be visible:', newRoutine.frequency === 'monthly');
  }, [newRoutine.frequency])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loadingRoutines, setLoadingRoutines] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all')

  // トレーニング記録関連の状態
  const [trainings, setTrainings] = useState<Training[]>([])
  const [newTraining, setNewTraining] = useState<NewTraining>({
    title: '',
    description: '',
    date: '',
    duration: '',
    exercises: [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }],
  })
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null)
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [loadingTrainings, setLoadingTrainings] = useState(true)
  const [currentTrainingFilter, setCurrentTrainingFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'routines' | 'trainings'>('routines')

  // API呼び出し用の関数
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 認証トークンがある場合は追加
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }
    
    return response.json()
  }

  // サーバーからルーティンを読み込み
  useEffect(() => {
    const loadRoutines = async () => {
      try {
        if (token) {
          // 認証されている場合はサーバーから読み込み
          console.log('Loading routines from server with token:', token.substring(0, 20) + '...')
          const data = await apiCall('/api/routines')
          console.log('Routines loaded from server:', data)
          setRoutines(data)
        } else {
          // 認証されていない場合はローカルストレージから読み込み
          console.log('No token, loading from localStorage')
          const savedRoutines = localStorage.getItem('routines')
          if (savedRoutines) {
            const parsedRoutines = JSON.parse(savedRoutines)
            console.log('Loaded routines from localStorage:', parsedRoutines)
            setRoutines(parsedRoutines)
          } else {
            console.log('No routines found in localStorage')
          }
        }
      } catch (error) {
        console.error('Failed to load routines:', error)
        // エラー時はローカルストレージから読み込み
        const savedRoutines = localStorage.getItem('routines')
        if (savedRoutines) {
          const parsedRoutines = JSON.parse(savedRoutines)
          console.log('Loaded routines from localStorage as fallback:', parsedRoutines)
          setRoutines(parsedRoutines)
        } else {
          console.log('No routines found in localStorage')
        }
      } finally {
        setLoadingRoutines(false)
      }
    }
    
    loadRoutines()
  }, [token])

  // サーバーからトレーニング記録を読み込み
  useEffect(() => {
    const loadTrainings = async () => {
      try {
        if (token) {
          // 認証されている場合はサーバーから読み込み
          console.log('Loading trainings from server with token:', token.substring(0, 20) + '...')
          console.log('API call to /api/trainings')
          const data = await apiCall('/api/trainings')
          console.log('Trainings loaded from server:', data)
          console.log('Trainings count:', data.length)
          setTrainings(data)
        } else {
          // 認証されていない場合はローカルストレージから読み込み
          console.log('No token, loading trainings from localStorage')
          const savedTrainings = localStorage.getItem('trainings')
          if (savedTrainings) {
            const parsedTrainings = JSON.parse(savedTrainings)
            console.log('Loaded trainings from localStorage:', parsedTrainings)
            console.log('Trainings count:', parsedTrainings.length)
            setTrainings(parsedTrainings)
          } else {
            console.log('No trainings found in localStorage')
          }
        }
      } catch (error) {
        console.error('Failed to load trainings:', error)
        console.error('Error details:', error instanceof Error ? error.message : String(error))
        // エラー時はローカルストレージから読み込み
        const savedTrainings = localStorage.getItem('trainings')
        if (savedTrainings) {
          const parsedTrainings = JSON.parse(savedTrainings)
          console.log('Loaded trainings from localStorage as fallback:', parsedTrainings)
          console.log('Trainings count:', parsedTrainings.length)
          setTrainings(parsedTrainings)
        } else {
          console.log('No trainings found in localStorage')
        }
      } finally {
        setLoadingTrainings(false)
      }
    }
    
    loadTrainings()
  }, [token])

  // ルーティンをローカルストレージに保存（認証されていない場合のみ使用）
  const saveRoutines = async (newRoutines: Routine[]) => {
    console.log('Saving routines to localStorage:', newRoutines.length, 'items');
    setRoutines(newRoutines)
    localStorage.setItem('routines', JSON.stringify(newRoutines))
    console.log('Saved to localStorage');
  }

  // トレーニング記録をローカルストレージに保存（認証されていない場合のみ使用）
  const saveTrainings = async (newTrainings: Training[]) => {
    console.log('Saving trainings to localStorage:', newTrainings.length, 'items');
    setTrainings(newTrainings)
    localStorage.setItem('trainings', JSON.stringify(newTrainings))
    console.log('Saved to localStorage');
  }

  const addRoutine = async () => {
    if (!newRoutine.title.trim()) return

    const routine: Routine = {
      id: Date.now().toString(),
      title: newRoutine.title,
      description: newRoutine.description,
      frequency: newRoutine.frequency,
      time: newRoutine.time,
      completed: false,
      createdAt: new Date().toISOString(),
      userId: token ? 'server' : 'local',
      checklist: newRoutine.checklist.filter(item => item.text.trim()),
      ...(newRoutine.frequency === 'monthly' ? { monthlyDate: newRoutine.monthlyDate } : {})
    }

    console.log('Adding routine:', routine);

    if (token) {
      try {
        const routineData = {
          title: newRoutine.title,
          description: newRoutine.description,
          frequency: newRoutine.frequency,
          time: newRoutine.time,
          checklist: newRoutine.checklist.filter(item => item.text.trim()),
          ...(newRoutine.frequency === 'monthly' ? { monthlyDate: newRoutine.monthlyDate } : {})
        }

        console.log('Sending routine data to server:', routineData);

        const newRoutineData = await apiCall('/api/routines', {
          method: 'POST',
          body: JSON.stringify(routineData)
        })

        console.log('Server response:', newRoutineData);

        // サーバーから返されたroutineを直接stateに追加
        setRoutines(prevRoutines => [...prevRoutines, newRoutineData])
      } catch (error) {
        console.error('Failed to add routine:', error)
        // エラー時はローカルストレージに保存
        const updatedRoutines = [...routines, routine]
        saveRoutines(updatedRoutines)
      }
    } else {
      // 認証されていない場合はローカルストレージに保存
      const updatedRoutines = [...routines, routine]
      saveRoutines(updatedRoutines)
    }

    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', weekdays: [], monthlyDate: '', checklist: [{ text: '', checked: false }] })
    setShowForm(false)
  }

  const toggleRoutine = async (id: string) => {
    const routine = routines.find(r => r.id === id)
    if (!routine) return

    const updatedRoutines = routines.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    )

    if (token) {
      try {
        const updatedRoutine = await apiCall(`/api/routines/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...routine,
            completed: !routine.completed
          })
        })

        // サーバーから返された更新されたroutineでstateを更新
        setRoutines(prevRoutines => prevRoutines.map(r =>
          r.id === id ? updatedRoutine : r
        ))
      } catch (error) {
        console.error('Failed to toggle routine:', error)
        // エラー時はローカルで更新
        saveRoutines(updatedRoutines)
      }
    } else {
      // 認証されていない場合はローカルで更新
      saveRoutines(updatedRoutines)
    }
  }

  const deleteRoutine = async (id: string) => {
    const updatedRoutines = routines.filter(routine => routine.id !== id)

    if (token) {
      try {
        await apiCall(`/api/routines/${id}`, {
          method: 'DELETE'
        })

        // サーバーで削除が成功したら、ローカルのstateからも削除
        setRoutines(prevRoutines => prevRoutines.filter(routine => routine.id !== id))
      } catch (error) {
        console.error('Failed to delete routine:', error)
        // エラー時はローカルで削除
        saveRoutines(updatedRoutines)
      }
    } else {
      // 認証されていない場合はローカルで削除
      saveRoutines(updatedRoutines)
    }
  }

  const startEditing = (routine: Routine) => {
    setEditingId(routine.id)
    setNewRoutine({ 
      title: routine.title, 
      description: routine.description, 
      frequency: routine.frequency,
      time: routine.time,
      weekdays: routine.weekdays || [],
      monthlyDate: routine.monthlyDate || '',
      checklist: routine.checklist || [{ text: '', checked: false }]
    })
  }

  const saveEdit = async () => {
    if (!editingId || !newRoutine.title.trim()) return

    const updatedRoutines = routines.map(routine =>
      routine.id === editingId
        ? { ...routine, title: newRoutine.title, description: newRoutine.description, frequency: newRoutine.frequency, time: newRoutine.time, checklist: newRoutine.checklist, ...(newRoutine.frequency === 'monthly' ? { monthlyDate: newRoutine.monthlyDate } : {}) }
        : routine
    )

    if (token) {
      try {
        const routine = routines.find(r => r.id === editingId)
        if (!routine) return

        const updatedRoutine = await apiCall(`/api/routines/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...routine,
            title: newRoutine.title,
            description: newRoutine.description,
            frequency: newRoutine.frequency,
            time: newRoutine.time,
            checklist: newRoutine.checklist,
            ...(newRoutine.frequency === 'monthly' ? { monthlyDate: newRoutine.monthlyDate } : {})
          })
        })

        // サーバーから返された更新されたroutineでstateを更新
        setRoutines(prevRoutines => prevRoutines.map(r =>
          r.id === editingId ? updatedRoutine : r
        ))
      } catch (error) {
        console.error('Failed to save edit:', error)
        // エラー時はローカルで更新
        saveRoutines(updatedRoutines)
      }
    } else {
      // 認証されていない場合はローカルで更新
      saveRoutines(updatedRoutines)
    }

    setEditingId(null)
    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', weekdays: [], monthlyDate: '', checklist: [{ text: '', checked: false }] })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', weekdays: [], monthlyDate: '', checklist: [{ text: '', checked: false }] })
  }

  const getFilteredRoutines = () => {
    if (currentFilter === 'all') {
      return routines
    }
    return routines.filter(routine => routine.frequency === currentFilter)
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      'daily': '毎日',
      'weekly': '毎週',
      'monthly': '毎月'
    }
    return labels[frequency] || frequency
  }

  const getFrequencyIcon = (frequency: string) => {
    const icons: { [key: string]: any } = {
      'daily': Sun,
      'weekly': CalendarDays,
      'monthly': Calendar
    }
    return icons[frequency] || Clock
  }

  const addChecklistItem = () => setNewRoutine((r: NewRoutine) => ({ ...r, checklist: [...r.checklist, { text: '', checked: false }] }))
  const removeChecklistItem = (idx: number) => setNewRoutine((r: NewRoutine) => ({ ...r, checklist: r.checklist.filter((_, i) => i !== idx) }))
  const updateChecklistText = (idx: number, value: string) => setNewRoutine((r: NewRoutine) => ({ ...r, checklist: r.checklist.map((item, i) => i === idx ? { ...item, text: value } : item) }))
  const updateChecklistChecked = (idx: number, checked: boolean) => setNewRoutine((r: NewRoutine) => ({ ...r, checklist: r.checklist.map((item, i) => i === idx ? { ...item, checked } : item) }))

  // トレーニング記録関連の関数
  const addTraining = async () => {
    if (!newTraining.title.trim() || !newTraining.date) return

    const training: Training = {
      id: Date.now().toString(),
      title: newTraining.title,
      description: newTraining.description,
      date: newTraining.date,
      duration: newTraining.duration,
      exercises: newTraining.exercises.filter(exercise => exercise.name.trim()),
      completed: false,
      createdAt: new Date().toISOString(),
      userId: token ? 'server' : 'local'
    }

    console.log('Adding training:', training);

    if (token) {
      try {
        const trainingData = {
          title: newTraining.title,
          description: newTraining.description,
          date: newTraining.date,
          duration: newTraining.duration,
          exercises: newTraining.exercises.filter(exercise => exercise.name.trim())
        }

        console.log('Sending training data to server:', trainingData);
        console.log('API call to /api/trainings with POST method');

        const newTrainingData = await apiCall('/api/trainings', {
          method: 'POST',
          body: JSON.stringify(trainingData)
        })

        console.log('Server response:', newTrainingData);
        console.log('New training ID:', newTrainingData.id);

        // サーバーから返されたtrainingを直接stateに追加
        setTrainings(prevTrainings => [...prevTrainings, newTrainingData])
      } catch (error) {
        console.error('Failed to add training:', error)
        console.error('Error details:', error instanceof Error ? error.message : String(error))
        // エラー時はローカルストレージに保存
        const updatedTrainings = [...trainings, training]
        saveTrainings(updatedTrainings)
      }
    } else {
      // 認証されていない場合はローカルストレージに保存
      console.log('User not authenticated, saving training to localStorage');
      const updatedTrainings = [...trainings, training]
      saveTrainings(updatedTrainings)
    }

    setNewTraining({ 
      title: '', 
      description: '', 
      date: '', 
      duration: '', 
      exercises: [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }] 
    })
    setShowTrainingForm(false)
  }

  const toggleTraining = async (id: string) => {
    const training = trainings.find(t => t.id === id)
    if (!training) return

    const updatedTrainings = trainings.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    )

    if (token) {
      try {
        const updatedTraining = await apiCall(`/api/trainings/${id}/toggle`, {
          method: 'PATCH'
        })

        // サーバーから返された更新されたtrainingでstateを更新
        setTrainings(prevTrainings => prevTrainings.map(t =>
          t.id === id ? updatedTraining : t
        ))
      } catch (error) {
        console.error('Failed to toggle training:', error)
        // エラー時はローカルで更新
        saveTrainings(updatedTrainings)
      }
    } else {
      // 認証されていない場合はローカルで更新
      saveTrainings(updatedTrainings)
    }
  }

  const deleteTraining = async (id: string) => {
    const updatedTrainings = trainings.filter(training => training.id !== id)

    if (token) {
      try {
        await apiCall(`/api/trainings/${id}`, {
          method: 'DELETE'
        })

        // サーバーで削除が成功したら、ローカルのstateからも削除
        setTrainings(prevTrainings => prevTrainings.filter(training => training.id !== id))
      } catch (error) {
        console.error('Failed to delete training:', error)
        // エラー時はローカルで削除
        saveTrainings(updatedTrainings)
      }
    } else {
      // 認証されていない場合はローカルで削除
      saveTrainings(updatedTrainings)
    }
  }

  const startEditingTraining = (training: Training) => {
    setEditingTrainingId(training.id)
    setNewTraining({ 
      title: training.title, 
      description: training.description, 
      date: training.date,
      duration: training.duration,
      exercises: training.exercises.length > 0 ? training.exercises : [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }]
    })
  }

  const saveTrainingEdit = async () => {
    if (!editingTrainingId || !newTraining.title.trim() || !newTraining.date) return

    const updatedTrainings = trainings.map(training =>
      training.id === editingTrainingId
        ? { ...training, title: newTraining.title, description: newTraining.description, date: newTraining.date, duration: newTraining.duration, exercises: newTraining.exercises.filter(exercise => exercise.name.trim()) }
        : training
    )

    if (token) {
      try {
        const training = trainings.find(t => t.id === editingTrainingId)
        if (!training) return

        const updatedTraining = await apiCall(`/api/trainings/${editingTrainingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: newTraining.title,
            description: newTraining.description,
            date: newTraining.date,
            duration: newTraining.duration,
            exercises: newTraining.exercises.filter(exercise => exercise.name.trim())
          })
        })

        // サーバーから返された更新されたtrainingでstateを更新
        setTrainings(prevTrainings => prevTrainings.map(t =>
          t.id === editingTrainingId ? updatedTraining : t
        ))
      } catch (error) {
        console.error('Failed to save training edit:', error)
        // エラー時はローカルで更新
        saveTrainings(updatedTrainings)
      }
    } else {
      // 認証されていない場合はローカルで更新
      saveTrainings(updatedTrainings)
    }

    setEditingTrainingId(null)
    setNewTraining({ 
      title: '', 
      description: '', 
      date: '', 
      duration: '', 
      exercises: [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }] 
    })
  }

  const cancelTrainingEdit = () => {
    setEditingTrainingId(null)
    setNewTraining({ 
      title: '', 
      description: '', 
      date: '', 
      duration: '', 
      exercises: [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }] 
    })
  }

  const getFilteredTrainings = () => {
    if (currentTrainingFilter === 'all') {
      return trainings
    } else if (currentTrainingFilter === 'pending') {
      return trainings.filter(training => !training.completed)
    } else if (currentTrainingFilter === 'completed') {
      return trainings.filter(training => training.completed)
    }
    return trainings
  }

  // エクササイズ関連の関数
  const addExercise = () => setNewTraining((t: NewTraining) => ({ 
    ...t, 
    exercises: [...t.exercises, { name: '', sets: 3, reps: 10, weight: 0, completed: false }] 
  }))
  
  const removeExercise = (idx: number) => setNewTraining((t: NewTraining) => ({ 
    ...t, 
    exercises: t.exercises.filter((_, i) => i !== idx) 
  }))
  
  const updateExercise = (idx: number, field: keyof Exercise, value: string | number) => setNewTraining((t: NewTraining) => ({ 
    ...t, 
    exercises: t.exercises.map((exercise, i) => i === idx ? { ...exercise, [field]: value } : exercise) 
  }))

  // 統計情報の計算
  const filteredRoutines = getFilteredRoutines()
  const filteredTrainings = getFilteredTrainings()
  const completedRoutinesCount = filteredRoutines.filter(routine => routine.completed).length
  const completedTrainingsCount = filteredTrainings.filter(training => training.completed).length
  const totalRoutinesCount = filteredRoutines.length
  const totalTrainingsCount = filteredTrainings.length

  // ログアウト処理
  const handleLogout = async () => {
    try {
      const result = await logout()
      if (!result.success) {
        console.error('Logout failed:', result.error)
        alert('ログアウトに失敗しました: ' + result.error)
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('ログアウト中にエラーが発生しました')
    }
  }

  if (loadingRoutines) {
    return (
      <div className="app">
        <div className="loading">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            <Target className="title-icon" />
            My Routine
          </h1>
          <p className="subtitle">毎日の習慣を管理して、より良い生活を</p>
        </div>
                          <div className="user-section">
          <div className="user-info">
            <User size={16} />
            <span>{user?.username || 'ゲスト'}</span>
          </div>
          {user ? (
            <button onClick={handleLogout} className="logout-button">
              <LogOut size={16} />
              ログアウト
            </button>
          ) : (
            <a href="/auth" className="login-button">
              <User size={16} />
              ログイン
            </a>
          )}
        </div>
      </header>

      {!user && (
        <div className="auth-notice">
          <div className="auth-notice-content">
            <h3>ログインしてデータを同期</h3>
            <p>ログインすると、データがサーバーに保存され、複数のデバイス間で同期されます。</p>
            <a href="/auth" className="auth-notice-button">
              <User size={16} />
              ログイン / 会員登録
            </a>
          </div>
        </div>
      )}

      <div className="stats">
        <div className="stat-card">
          <Calendar className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{totalRoutinesCount}</span>
            <span className="stat-label">総ルーティン</span>
          </div>
        </div>
        <div className="stat-card">
          <Check className="stat-icon completed" />
          <div className="stat-info">
            <span className="stat-number">{completedRoutinesCount}</span>
            <span className="stat-label">完了済み</span>
          </div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">
              {totalRoutinesCount > 0 ? Math.round((completedRoutinesCount / totalRoutinesCount) * 100) : 0}%
            </span>
            <span className="stat-label">達成率</span>
          </div>
        </div>
        <div className="stat-card">
          <Dumbbell className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{totalTrainingsCount}</span>
            <span className="stat-label">トレーニング</span>
          </div>
        </div>
      </div>

      {/* メインタブ */}
      <div className="main-tabs">
        <button 
          className={`main-tab-button ${activeTab === 'routines' ? 'active' : ''}`}
          onClick={() => setActiveTab('routines')}
        >
          <Target className="main-tab-icon" />
          ルーティーン
        </button>
        <button 
          className={`main-tab-button ${activeTab === 'trainings' ? 'active' : ''}`}
          onClick={() => setActiveTab('trainings')}
        >
          <Dumbbell className="main-tab-icon" />
          トレーニング
        </button>
      </div>

      {/* ルーティーンタブコンテンツ */}
      {activeTab === 'routines' && (
        <>
          <div className="frequency-tabs">
            <button 
              className={`tab-button ${currentFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('all')}
            >
              <List className="tab-icon" />
              全て
            </button>
            <button 
              className={`tab-button ${currentFilter === 'daily' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('daily')}
            >
              <Sun className="tab-icon" />
              毎日
            </button>
            <button 
              className={`tab-button ${currentFilter === 'weekly' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('weekly')}
            >
              <CalendarDays className="tab-icon" />
              毎週
            </button>
            <button 
              className={`tab-button ${currentFilter === 'monthly' ? 'active' : ''}`}
              onClick={() => setCurrentFilter('monthly')}
            >
              <Calendar className="tab-icon" />
              毎月
            </button>
          </div>

          <div className="actions">
            <button
              className="add-button"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="button-icon" />
              {showForm ? 'キャンセル' : '新しいルーティンを追加'}
            </button>
          </div>
        </>
      )}

      {/* トレーニングタブコンテンツ */}
      {activeTab === 'trainings' && (
        <>
          <div className="training-filters">
            <button 
              className={`training-filter-button ${currentTrainingFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCurrentTrainingFilter('all')}
            >
              <List className="tab-icon" />
              全て
            </button>
            <button 
              className={`training-filter-button ${currentTrainingFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setCurrentTrainingFilter('pending')}
            >
              <Clock className="tab-icon" />
              未完了
            </button>
            <button 
              className={`training-filter-button ${currentTrainingFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setCurrentTrainingFilter('completed')}
            >
              <Check className="tab-icon" />
              完了済み
            </button>
          </div>

          <div className="actions">
            <button
              className="add-button"
              onClick={() => setShowTrainingForm(!showTrainingForm)}
            >
              <Plus className="button-icon" />
              {showTrainingForm ? 'キャンセル' : '新しいトレーニングを追加'}
            </button>
          </div>
        </>
      )}

      {showForm && (
        <div className="form-container">
          <div className="form">
            <input
              type="text"
              placeholder="ルーティンのタイトル"
              value={newRoutine.title}
              onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="説明（オプション）"
              value={newRoutine.description}
              onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
              className="form-textarea"
            />
            <div className="form-checklist">
              <label className="form-label">メニュー（チェックリスト）</label>
              {newRoutine.checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={e => updateChecklistChecked(idx, e.target.checked)}
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={e => updateChecklistText(idx, e.target.value)}
                    placeholder="メニュー名（例：ベンチプレス）"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => removeChecklistItem(idx)} style={{ marginLeft: 4 }}>削除</button>
                </div>
              ))}
              <button type="button" onClick={addChecklistItem} style={{ marginTop: 4 }}>項目を追加</button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">頻度</label>
                <select
                  value={newRoutine.frequency}
                  onChange={(e) => setNewRoutine({ ...newRoutine, frequency: e.target.value })}
                  className="form-select"
                >
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">時間</label>
                <input
                  type="time"
                  value={newRoutine.time}
                  onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            {newRoutine.frequency === 'monthly' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">日付</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1-31"
                    value={newRoutine.monthlyDate || ''}
                    onChange={(e) => setNewRoutine({ ...newRoutine, monthlyDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            )}
            <div className="form-buttons">
              <button onClick={addRoutine} className="save-button">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrainingForm && (
        <div className="form-container">
          <div className="form">
            <input
              type="text"
              placeholder="トレーニングのタイトル"
              value={newTraining.title}
              onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="説明（オプション）"
              value={newTraining.description}
              onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
              className="form-textarea"
            />
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">日付</label>
                <input
                  type="date"
                  value={newTraining.date}
                  onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">時間</label>
                <input
                  type="text"
                  placeholder="例：60分"
                  value={newTraining.duration}
                  onChange={(e) => setNewTraining({ ...newTraining, duration: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-exercises">
              <label className="form-label">エクササイズ</label>
              {newTraining.exercises.map((exercise, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={e => updateExercise(idx, 'name', e.target.value)}
                    placeholder="エクササイズ名（例：ベンチプレス）"
                    style={{ flex: 2 }}
                    className="form-input"
                  />
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={e => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                    placeholder="セット数"
                    style={{ width: 80 }}
                    className="form-input"
                  />
                  <input
                    type="number"
                    value={exercise.reps}
                    onChange={e => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                    placeholder="回数"
                    style={{ width: 80 }}
                    className="form-input"
                  />
                  <input
                    type="number"
                    value={exercise.weight}
                    onChange={e => updateExercise(idx, 'weight', parseInt(e.target.value) || 0)}
                    placeholder="重量(kg)"
                    style={{ width: 100 }}
                    className="form-input"
                  />
                  <button type="button" onClick={() => removeExercise(idx)} style={{ marginLeft: 4 }}>削除</button>
                </div>
              ))}
              <button type="button" onClick={addExercise} style={{ marginTop: 8 }}>エクササイズを追加</button>
            </div>
            <div className="form-buttons">
              <button onClick={addTraining} className="save-button">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ルーティーン表示 */}
      {activeTab === 'routines' && (
        <div className="routines-container">
          {loadingRoutines ? (
            <div className="loading">ルーティンを読み込み中...</div>
          ) : filteredRoutines.length === 0 ? (
            <div className="empty-state">
              <Target className="empty-icon" />
              <h3>
                {currentFilter === 'all' 
                  ? 'まだルーティンがありません'
                  : `${getFrequencyLabel(currentFilter)}のルーティンがありません`
                }
              </h3>
              <p>
                {currentFilter === 'all'
                  ? '新しいルーティンを追加して、毎日の習慣を始めましょう！'
                  : `${getFrequencyLabel(currentFilter)}のルーティンを追加してみましょう！`
                }
              </p>
            </div>
          ) : (
            <div className="routines-list">
              {filteredRoutines.map((routine: Routine) => {
                const FrequencyIcon = getFrequencyIcon(routine.frequency)
                return (
                  <div key={routine.id} className={`routine-card ${routine.completed ? 'completed' : ''}`}>
                    <div className="routine-content">
                      <div className="routine-header">
                        <h3 className="routine-title">{routine.title}</h3>
                        <div className="routine-actions">
                          <button
                            onClick={() => startEditing(routine)}
                            className="action-button edit"
                            title="編集"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteRoutine(routine.id)}
                            className="action-button delete"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {routine.description && (
                        <p className="routine-description">{routine.description}</p>
                      )}
                      
                      <div className="routine-meta">
                        <div className="routine-frequency">
                          <FrequencyIcon size={14} />
                          <span>{getFrequencyLabel(routine.frequency)}</span>
                        </div>
                        {routine.time && (
                          <div className="routine-time">
                            <Clock size={14} />
                            <span>{routine.time}</span>
                          </div>
                        )}
                        {routine.frequency === 'weekly' && routine.weekdays && routine.weekdays.length > 0 && (
                          <div className="routine-weekdays">
                            <CalendarDays size={14} />
                            <span>{routine.weekdays.map(day => {
                              const labels: { [key: string]: string } = {
                                'monday': '月', 'tuesday': '火', 'wednesday': '水',
                                'thursday': '木', 'friday': '金', 'saturday': '土', 'sunday': '日'
                              };
                              return labels[day] || day;
                            }).join('・')}</span>
                          </div>
                        )}
                        {routine.frequency === 'monthly' && routine.monthlyDate && (
                          <div className="routine-monthly-date">
                            <Calendar size={14} />
                            <span>{routine.monthlyDate}日</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="routine-date">
                        作成日: {new Date(routine.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleRoutine(routine.id)}
                      className={`complete-button ${routine.completed ? 'completed' : ''}`}
                    >
                      <Check size={20} />
                      {routine.completed ? '完了済み' : '完了にする'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* トレーニング記録表示 */}
      {activeTab === 'trainings' && (
        <div className="trainings-container">
          {loadingTrainings ? (
            <div className="loading">トレーニング記録を読み込み中...</div>
          ) : getFilteredTrainings().length === 0 ? (
            <div className="empty-state">
              <Dumbbell className="empty-icon" />
              <h3>
                {currentTrainingFilter === 'all' 
                  ? 'まだトレーニング記録がありません'
                  : `${currentTrainingFilter === 'pending' ? '未完了' : '完了済み'}のトレーニング記録がありません`
                }
              </h3>
              <p>
                {currentTrainingFilter === 'all'
                  ? '新しいトレーニング記録を追加して、ワークアウトを管理しましょう！'
                  : `${currentTrainingFilter === 'pending' ? '未完了' : '完了済み'}のトレーニング記録を追加してみましょう！`
                }
              </p>
            </div>
          ) : (
            <div className="trainings-list">
              {getFilteredTrainings().map((training: Training) => (
                <div key={training.id} className={`training-card ${training.completed ? 'completed' : ''}`}>
                  <div className="training-content">
                    <div className="training-header">
                      <h3 className="training-title">{training.title}</h3>
                      <div className="training-actions">
                        <button
                          onClick={() => startEditingTraining(training)}
                          className="action-button edit"
                          title="編集"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteTraining(training.id)}
                          className="action-button delete"
                          title="削除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {training.description && (
                      <p className="training-description">{training.description}</p>
                    )}
                    
                    <div className="training-meta">
                      <div className="training-date">
                        <Calendar size={14} />
                        <span>{new Date(training.date).toLocaleDateString('ja-JP')}</span>
                      </div>
                      {training.duration && (
                        <div className="training-duration">
                          <Clock size={14} />
                          <span>{training.duration}</span>
                        </div>
                      )}
                    </div>
                    
                    {training.exercises.length > 0 && (
                      <div className="training-exercises">
                        <h4>エクササイズ</h4>
                        <div className="exercises-list">
                          {training.exercises.map((exercise, idx) => (
                            <div key={idx} className="exercise-item">
                              <span className="exercise-name">{exercise.name}</span>
                              <span className="exercise-details">
                                {exercise.sets}セット × {exercise.reps}回
                                {exercise.weight && exercise.weight > 0 && ` (${exercise.weight}kg)`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="training-date">
                      作成日: {new Date(training.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleTraining(training.id)}
                    className={`training-complete-button ${training.completed ? 'completed' : ''}`}
                  >
                    <Check size={20} />
                    {training.completed ? '完了済み' : '完了にする'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>ルーティンを編集</h3>
            <input
              type="text"
              placeholder="ルーティンのタイトル"
              value={newRoutine.title}
              onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="説明（オプション）"
              value={newRoutine.description}
              onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
              className="form-textarea"
            />
            <div className="form-checklist">
              <label className="form-label">メニュー（チェックリスト）</label>
              {newRoutine.checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={e => updateChecklistChecked(idx, e.target.checked)}
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={e => updateChecklistText(idx, e.target.value)}
                    placeholder="メニュー名（例：ベンチプレス）"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => removeChecklistItem(idx)} style={{ marginLeft: 4 }}>削除</button>
                </div>
              ))}
              <button type="button" onClick={addChecklistItem} style={{ marginTop: 4 }}>項目を追加</button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">頻度</label>
                <select
                  value={newRoutine.frequency}
                  onChange={(e) => setNewRoutine({ ...newRoutine, frequency: e.target.value })}
                  className="form-select"
                >
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">時間</label>
                <input
                  type="time"
                  value={newRoutine.time}
                  onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            {newRoutine.frequency === 'monthly' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">日付</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1-31"
                    value={newRoutine.monthlyDate || ''}
                    onChange={(e) => setNewRoutine({ ...newRoutine, monthlyDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            )}
            <div className="modal-buttons">
              <button onClick={saveEdit} className="save-button">
                保存
              </button>
              <button onClick={cancelEdit} className="cancel-button">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* トレーニング編集モーダル */}
      {editingTrainingId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>トレーニングを編集</h3>
            <input
              type="text"
              placeholder="トレーニングのタイトル"
              value={newTraining.title}
              onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="説明（オプション）"
              value={newTraining.description}
              onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
              className="form-textarea"
            />
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">日付</label>
                <input
                  type="date"
                  value={newTraining.date}
                  onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">時間</label>
                <input
                  type="text"
                  placeholder="例：60分"
                  value={newTraining.duration}
                  onChange={(e) => setNewTraining({ ...newTraining, duration: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-exercises">
              <label className="form-label">エクササイズ</label>
              {newTraining.exercises.map((exercise, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={e => updateExercise(idx, 'name', e.target.value)}
                    placeholder="エクササイズ名（例：ベンチプレス）"
                    style={{ flex: 2 }}
                    className="form-input"
                  />
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={e => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                    placeholder="セット数"
                    style={{ width: 80 }}
                    className="form-input"
                  />
                  <input
                    type="number"
                    value={exercise.reps}
                    onChange={e => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                    placeholder="回数"
                    style={{ width: 80 }}
                    className="form-input"
                  />
                  <input
                    type="number"
                    value={exercise.weight}
                    onChange={e => updateExercise(idx, 'weight', parseInt(e.target.value) || 0)}
                    placeholder="重量(kg)"
                    style={{ width: 100 }}
                    className="form-input"
                  />
                  <button type="button" onClick={() => removeExercise(idx)} style={{ marginLeft: 4 }}>削除</button>
                </div>
              ))}
              <button type="button" onClick={addExercise} style={{ marginTop: 8 }}>エクササイズを追加</button>
            </div>
            <div className="modal-buttons">
              <button onClick={saveTrainingEdit} className="save-button">
                保存
              </button>
              <button onClick={cancelTrainingEdit} className="cancel-button">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
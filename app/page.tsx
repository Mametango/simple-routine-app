'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Edit, Calendar, Clock, Target, Sun, CalendarDays, List, LogOut, User } from 'lucide-react'
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
}

interface NewRoutine {
  title: string;
  description: string;
  frequency: string;
  time: string;
  weekdays: string[];
  checklist: ChecklistItem[];
}

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  userId: string;
}

interface NewTodo {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
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
    checklist: [{ text: '', checked: false }],
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loadingRoutines, setLoadingRoutines] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all')

  // Todo関連の状態
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState<NewTodo>({
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
  })
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [loadingTodos, setLoadingTodos] = useState(true)
  const [currentTodoFilter, setCurrentTodoFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'routines' | 'todos'>('routines')

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
            setRoutines(JSON.parse(savedRoutines))
          }
        }
      } catch (error) {
        console.error('Failed to load routines:', error)
        // エラー時はローカルストレージから読み込み
        const savedRoutines = localStorage.getItem('routines')
        if (savedRoutines) {
          setRoutines(JSON.parse(savedRoutines))
        }
      } finally {
        setLoadingRoutines(false)
      }
    }
    
    loadRoutines()
  }, [token])

  // サーバーからTodoを読み込み
  useEffect(() => {
    const loadTodos = async () => {
      try {
        if (token) {
          // 認証されている場合はサーバーから読み込み
          console.log('Loading todos from server with token:', token.substring(0, 20) + '...')
          const data = await apiCall('/api/todos')
          console.log('Todos loaded from server:', data)
          setTodos(data)
        } else {
          // 認証されていない場合はローカルストレージから読み込み
          console.log('No token, loading todos from localStorage')
          const savedTodos = localStorage.getItem('todos')
          if (savedTodos) {
            setTodos(JSON.parse(savedTodos))
          }
        }
      } catch (error) {
        console.error('Failed to load todos:', error)
        // エラー時はローカルストレージから読み込み
        const savedTodos = localStorage.getItem('todos')
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos))
        }
      } finally {
        setLoadingTodos(false)
      }
    }
    
    loadTodos()
  }, [token])

  // ルーティンをサーバーに保存
  const saveRoutines = async (newRoutines: Routine[]) => {
    setRoutines(newRoutines)
    // 認証されていない場合はローカルストレージに保存
    if (!token) {
      localStorage.setItem('routines', JSON.stringify(newRoutines))
    }
  }

  // Todoをサーバーに保存
  const saveTodos = async (newTodos: Todo[]) => {
    setTodos(newTodos)
    // 認証されていない場合はローカルストレージに保存
    if (!token) {
      localStorage.setItem('todos', JSON.stringify(newTodos))
    }
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
      checklist: newRoutine.checklist.filter(item => item.text.trim())
    }

    if (token) {
      try {
        const routineData = {
          title: newRoutine.title,
          description: newRoutine.description,
          frequency: newRoutine.frequency,
          time: newRoutine.time,
          checklist: newRoutine.checklist.filter(item => item.text.trim())
        }

        const newRoutineData = await apiCall('/api/routines', {
          method: 'POST',
          body: JSON.stringify(routineData)
        })

        const updatedRoutines = [...routines, newRoutineData]
        await saveRoutines(updatedRoutines)
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

    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', weekdays: [], checklist: [{ text: '', checked: false }] })
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

        const serverUpdatedRoutines = routines.map(r =>
          r.id === id ? updatedRoutine : r
        )
        await saveRoutines(serverUpdatedRoutines)
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

        await saveRoutines(updatedRoutines)
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
      checklist: routine.checklist || [{ text: '', checked: false }]
    })
  }

  const saveEdit = async () => {
    if (!editingId || !newRoutine.title.trim()) return

    const updatedRoutines = routines.map(routine =>
      routine.id === editingId
        ? { ...routine, title: newRoutine.title, description: newRoutine.description, frequency: newRoutine.frequency, time: newRoutine.time, checklist: newRoutine.checklist }
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
            checklist: newRoutine.checklist
          })
        })

        const serverUpdatedRoutines = routines.map(r =>
          r.id === editingId ? updatedRoutine : r
        )
        await saveRoutines(serverUpdatedRoutines)
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
    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', weekdays: [], checklist: [{ text: '', checked: false }] })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', weekdays: [], checklist: [{ text: '', checked: false }] })
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

  const filteredRoutines = getFilteredRoutines()
  const completedCount = filteredRoutines.filter(routine => routine.completed).length
  const totalCount = filteredRoutines.length

  const addChecklistItem = () => setNewRoutine((r: NewRoutine) => ({ ...r, checklist: [...r.checklist, { text: '', checked: false }] }))
  const removeChecklistItem = (idx: number) => setNewRoutine((r: NewRoutine) => ({ ...r, checklist: r.checklist.filter((_, i) => i !== idx) }))
  const updateChecklistText = (idx: number, value: string) => setNewRoutine((r: NewRoutine) => ({ ...r, checklist: r.checklist.map((item, i) => i === idx ? { ...item, text: value } : item) }))
  const updateChecklistChecked = (idx: number, checked: boolean) => setNewRoutine((r: NewRoutine) => ({ ...r, checklist: r.checklist.map((item, i) => i === idx ? { ...item, checked } : item) }))

  // Todo関連の関数
  const addTodo = async () => {
    if (!newTodo.title.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      userId: token ? 'server' : 'local'
    }

    if (token) {
      try {
        const todoData = {
          title: newTodo.title,
          description: newTodo.description,
          priority: newTodo.priority,
          dueDate: newTodo.dueDate || null
        }

        const newTodoData = await apiCall('/api/todos', {
          method: 'POST',
          body: JSON.stringify(todoData)
        })

        const updatedTodos = [...todos, newTodoData]
        await saveTodos(updatedTodos)
      } catch (error) {
        console.error('Failed to add todo:', error)
        // エラー時はローカルストレージに保存
        const updatedTodos = [...todos, todo]
        saveTodos(updatedTodos)
      }
    } else {
      // 認証されていない場合はローカルストレージに保存
      const updatedTodos = [...todos, todo]
      saveTodos(updatedTodos)
    }

    setNewTodo({ title: '', description: '', priority: 'low', dueDate: '' })
    setShowTodoForm(false)
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    const updatedTodos = todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    )

    if (token) {
      try {
        const updatedTodo = await apiCall(`/api/todos/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...todo,
            completed: !todo.completed
          })
        })

        const serverUpdatedTodos = todos.map(t =>
          t.id === id ? updatedTodo : t
        )
        await saveTodos(serverUpdatedTodos)
      } catch (error) {
        console.error('Failed to toggle todo:', error)
        // エラー時はローカルで更新
        saveTodos(updatedTodos)
      }
    } else {
      // 認証されていない場合はローカルで更新
      saveTodos(updatedTodos)
    }
  }

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id)

    if (token) {
      try {
        await apiCall(`/api/todos/${id}`, {
          method: 'DELETE'
        })

        await saveTodos(updatedTodos)
      } catch (error) {
        console.error('Failed to delete todo:', error)
        // エラー時はローカルで削除
        saveTodos(updatedTodos)
      }
    } else {
      // 認証されていない場合はローカルで削除
      saveTodos(updatedTodos)
    }
  }

  const startEditingTodo = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setNewTodo({ 
      title: todo.title, 
      description: todo.description, 
      priority: todo.priority,
      dueDate: todo.dueDate || ''
    })
  }

  const saveTodoEdit = async () => {
    if (!editingTodoId || !newTodo.title.trim()) return

    const updatedTodos = todos.map(todo =>
      todo.id === editingTodoId
        ? { ...todo, title: newTodo.title, description: newTodo.description, priority: newTodo.priority, dueDate: newTodo.dueDate || null }
        : todo
    )

    if (token) {
      try {
        const todo = todos.find(t => t.id === editingTodoId)
        if (!todo) return

        const updatedTodo = await apiCall(`/api/todos/${editingTodoId}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...todo,
            title: newTodo.title,
            description: newTodo.description,
            priority: newTodo.priority,
            dueDate: newTodo.dueDate || null
          })
        })

        const serverUpdatedTodos = todos.map(t =>
          t.id === editingTodoId ? updatedTodo : t
        )
        await saveTodos(serverUpdatedTodos)
      } catch (error) {
        console.error('Failed to save todo edit:', error)
        // エラー時はローカルで更新
        saveTodos(updatedTodos)
      }
    } else {
      // 認証されていない場合はローカルで更新
      saveTodos(updatedTodos)
    }

    setEditingTodoId(null)
    setNewTodo({ title: '', description: '', priority: 'low', dueDate: '' })
  }

  const cancelTodoEdit = () => {
    setEditingTodoId(null)
    setNewTodo({ title: '', description: '', priority: 'low', dueDate: '' })
  }

  const getFilteredTodos = () => {
    if (currentTodoFilter === 'all') {
      return todos
    } else if (currentTodoFilter === 'pending') {
      return todos.filter(todo => !todo.completed)
    } else if (currentTodoFilter === 'completed') {
      return todos.filter(todo => todo.completed)
    }
    return todos
  }

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      'high': '高',
      'medium': '中',
      'low': '低'
    }
    return labels[priority] || priority
  }

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'high': 'text-red-600 bg-red-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'low': 'text-blue-600 bg-blue-100'
    }
    return colors[priority] || colors.low
  }

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
            <span className="stat-number">{totalCount}</span>
            <span className="stat-label">総ルーティン</span>
          </div>
        </div>
        <div className="stat-card">
          <Check className="stat-icon completed" />
          <div className="stat-info">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">完了済み</span>
          </div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </span>
            <span className="stat-label">達成率</span>
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
          className={`main-tab-button ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          <Check className="main-tab-icon" />
          Todo
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

      {/* Todoタブコンテンツ */}
      {activeTab === 'todos' && (
        <>
          <div className="todo-filters">
            <button 
              className={`todo-filter-button ${currentTodoFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCurrentTodoFilter('all')}
            >
              <List className="tab-icon" />
              全て
            </button>
            <button 
              className={`todo-filter-button ${currentTodoFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setCurrentTodoFilter('pending')}
            >
              <Clock className="tab-icon" />
              未完了
            </button>
            <button 
              className={`todo-filter-button ${currentTodoFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setCurrentTodoFilter('completed')}
            >
              <Check className="tab-icon" />
              完了済み
            </button>
          </div>

          <div className="actions">
            <button
              className="add-button"
              onClick={() => setShowTodoForm(!showTodoForm)}
            >
              <Plus className="button-icon" />
              {showTodoForm ? 'キャンセル' : '新しいTodoを追加'}
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
            <div className="form-buttons">
              <button onClick={addRoutine} className="save-button">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showTodoForm && (
        <div className="form-container">
          <div className="form">
            <input
              type="text"
              placeholder="Todoのタイトル"
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="説明（オプション）"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="form-textarea"
            />
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">優先度</label>
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                  className="form-select"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">期限</label>
                <input
                  type="date"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-buttons">
              <button onClick={addTodo} className="save-button">
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

      {/* Todo表示 */}
      {activeTab === 'todos' && (
        <div className="todos-container">
          {loadingTodos ? (
            <div className="loading">Todoを読み込み中...</div>
          ) : getFilteredTodos().length === 0 ? (
            <div className="empty-state">
              <Check className="empty-icon" />
              <h3>
                {currentTodoFilter === 'all' 
                  ? 'まだTodoがありません'
                  : `${currentTodoFilter === 'pending' ? '未完了' : '完了済み'}のTodoがありません`
                }
              </h3>
              <p>
                {currentTodoFilter === 'all'
                  ? '新しいTodoを追加して、タスクを管理しましょう！'
                  : `${currentTodoFilter === 'pending' ? '未完了' : '完了済み'}のTodoを追加してみましょう！`
                }
              </p>
            </div>
          ) : (
            <div className="todos-list">
              {getFilteredTodos().map((todo: Todo) => (
                <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''} ${todo.priority}-priority`}>
                  <div className="todo-content">
                    <div className="todo-header">
                      <h3 className="todo-title">{todo.title}</h3>
                      <div className="todo-actions">
                        <button
                          onClick={() => startEditingTodo(todo)}
                          className="action-button edit"
                          title="編集"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="action-button delete"
                          title="削除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {todo.description && (
                      <p className="todo-description">{todo.description}</p>
                    )}
                    
                    <div className="todo-meta">
                      <div className="todo-priority">
                        <span className={`priority-badge ${getPriorityColor(todo.priority)}`}>
                          {getPriorityLabel(todo.priority)}
                        </span>
                      </div>
                      {todo.dueDate && (
                        <div className="todo-due-date">
                          <Calendar size={14} />
                          <span>期限: {new Date(todo.dueDate).toLocaleDateString('ja-JP')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="todo-date">
                      作成日: {new Date(todo.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`todo-complete-button ${todo.completed ? 'completed' : ''}`}
                  >
                    <Check size={20} />
                    {todo.completed ? '完了済み' : '完了にする'}
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

      {/* Todo編集モーダル */}
      {editingTodoId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Todoを編集</h3>
            <input
              type="text"
              placeholder="Todoのタイトル"
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="説明（オプション）"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="form-textarea"
            />
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">優先度</label>
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                  className="form-select"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">期限</label>
                <input
                  type="date"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={saveTodoEdit} className="save-button">
                保存
              </button>
              <button onClick={cancelTodoEdit} className="cancel-button">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
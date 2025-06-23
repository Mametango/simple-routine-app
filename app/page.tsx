'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Plus, Check, Trash2, Edit, Calendar, Clock, Target, Sun, CalendarDays, List, LogOut, User } from 'lucide-react'
import './page.css'

interface Routine {
  id: string
  title: string
  description: string
  frequency: string
  time: string
  completed: boolean
  createdAt: string
  userId: string
}

export default function Home() {
  const { user, token, logout, loading } = useAuth()
  const router = useRouter()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [newRoutine, setNewRoutine] = useState({ title: '', description: '', frequency: 'daily', time: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loadingRoutines, setLoadingRoutines] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all')

  // 認証チェック
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // ルーティンを読み込み
  useEffect(() => {
    if (user && token) {
      fetchRoutines()
    }
  }, [user, token])

  const fetchRoutines = async () => {
    try {
      const response = await fetch('/api/routines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRoutines(data)
      }
    } catch (error) {
      console.error('Failed to fetch routines:', error)
    } finally {
      setLoadingRoutines(false)
    }
  }

  const addRoutine = async () => {
    if (!newRoutine.title.trim()) return

    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoutine),
      })

      if (response.ok) {
        const routine = await response.json()
        setRoutines([...routines, routine])
        setNewRoutine({ title: '', description: '', frequency: 'daily', time: '' })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Failed to add routine:', error)
    }
  }

  const toggleRoutine = async (id: string) => {
    try {
      const response = await fetch(`/api/routines/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setRoutines(routines.map(routine =>
          routine.id === id ? { ...routine, completed: !routine.completed } : routine
        ))
      }
    } catch (error) {
      console.error('Failed to toggle routine:', error)
    }
  }

  const deleteRoutine = async (id: string) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setRoutines(routines.filter(routine => routine.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete routine:', error)
    }
  }

  const startEditing = (routine: Routine) => {
    setEditingId(routine.id)
    setNewRoutine({ 
      title: routine.title, 
      description: routine.description, 
      frequency: routine.frequency,
      time: routine.time 
    })
  }

  const saveEdit = async () => {
    if (!editingId || !newRoutine.title.trim()) return

    try {
      const response = await fetch(`/api/routines/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoutine),
      })

      if (response.ok) {
        setRoutines(routines.map(routine =>
          routine.id === editingId
            ? { ...routine, title: newRoutine.title, description: newRoutine.description, frequency: newRoutine.frequency, time: newRoutine.time }
            : routine
        ))
        setEditingId(null)
        setNewRoutine({ title: '', description: '', frequency: 'daily', time: '' })
      }
    } catch (error) {
      console.error('Failed to update routine:', error)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '' })
  }

  const handleLogout = () => {
    logout()
    router.push('/auth')
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

  if (loading || !user) {
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
            <span>{user.username}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      </header>

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
            {filteredRoutines.map(routine => {
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
    </div>
  )
} 
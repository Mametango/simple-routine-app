'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Edit, Calendar, Clock, Target, Sun, CalendarDays, List, LogOut, User } from 'lucide-react'
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
  checklist: ChecklistItem[];
}

export default function Home() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [newRoutine, setNewRoutine] = useState<NewRoutine>({
    title: '',
    description: '',
    frequency: 'daily',
    time: '',
    checklist: [{ text: '', checked: false }],
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loadingRoutines, setLoadingRoutines] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [user, setUser] = useState({ username: 'ユーザー' })

  // ローカルストレージからルーティンを読み込み
  useEffect(() => {
    const savedRoutines = localStorage.getItem('routines')
    if (savedRoutines) {
      setRoutines(JSON.parse(savedRoutines))
    }
    setLoadingRoutines(false)
  }, [])

  // ルーティンをローカルストレージに保存
  const saveRoutines = (newRoutines: Routine[]) => {
    setRoutines(newRoutines)
    localStorage.setItem('routines', JSON.stringify(newRoutines))
  }

  const addRoutine = () => {
    if (!newRoutine.title.trim()) return

    const routine: Routine = {
      id: Date.now().toString(),
      title: newRoutine.title,
      description: newRoutine.description,
      frequency: newRoutine.frequency,
      time: newRoutine.time,
      completed: false,
      createdAt: new Date().toISOString(),
      userId: 'local',
      checklist: newRoutine.checklist.filter(item => item.text.trim())
    }

    const updatedRoutines = [...routines, routine]
    saveRoutines(updatedRoutines)
    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', checklist: [{ text: '', checked: false }] })
    setShowForm(false)
  }

  const toggleRoutine = (id: string) => {
    const updatedRoutines = routines.map(routine =>
      routine.id === id ? { ...routine, completed: !routine.completed } : routine
    )
    saveRoutines(updatedRoutines)
  }

  const deleteRoutine = (id: string) => {
    const updatedRoutines = routines.filter(routine => routine.id !== id)
    saveRoutines(updatedRoutines)
  }

  const startEditing = (routine: Routine) => {
    setEditingId(routine.id)
    setNewRoutine({ 
      title: routine.title, 
      description: routine.description, 
      frequency: routine.frequency,
      time: routine.time,
      checklist: routine.checklist || [{ text: '', checked: false }]
    })
  }

  const saveEdit = () => {
    if (!editingId || !newRoutine.title.trim()) return

    const updatedRoutines = routines.map(routine =>
      routine.id === editingId
        ? { ...routine, title: newRoutine.title, description: newRoutine.description, frequency: newRoutine.frequency, time: newRoutine.time, checklist: newRoutine.checklist }
        : routine
    )
    saveRoutines(updatedRoutines)
    setEditingId(null)
    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', checklist: [{ text: '', checked: false }] })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewRoutine({ title: '', description: '', frequency: 'daily', time: '', checklist: [{ text: '', checked: false }] })
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
            <span>{user.username}</span>
          </div>
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
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Edit, Calendar, Clock, Dumbbell, List, LogOut, User } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import './page.css'

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

  // API呼び出し用の関数
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
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

  // サーバーからトレーニング記録を読み込み
  useEffect(() => {
    const loadTrainings = async () => {
      try {
        if (token) {
          const data = await apiCall('/api/trainings')
          setTrainings(data)
        } else {
          const savedTrainings = localStorage.getItem('trainings')
          if (savedTrainings) {
            setTrainings(JSON.parse(savedTrainings))
          }
        }
      } catch (error) {
        const savedTrainings = localStorage.getItem('trainings')
        if (savedTrainings) {
          setTrainings(JSON.parse(savedTrainings))
        }
      } finally {
        setLoadingTrainings(false)
      }
    }
    loadTrainings()
  }, [token])

  // トレーニング記録をローカルストレージに保存
  const saveTrainings = async (newTrainings: Training[]) => {
    setTrainings(newTrainings)
    localStorage.setItem('trainings', JSON.stringify(newTrainings))
  }

  // トレーニング記録の追加
  const addTraining = async () => {
    if (!newTraining.title.trim()) return
    const training: Training = {
      id: Date.now().toString(),
      title: newTraining.title,
      description: newTraining.description,
      date: newTraining.date,
      duration: newTraining.duration,
      exercises: newTraining.exercises,
      completed: false,
      createdAt: new Date().toISOString(),
      userId: user?.id || 'anonymous',
    }
    const updatedTrainings = [...trainings, training]
    setTrainings(updatedTrainings)
    await saveTrainings(updatedTrainings)
    setNewTraining({ title: '', description: '', date: '', duration: '', exercises: [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }] })
    setShowTrainingForm(false)
  }

  // トレーニング記録の完了切り替え
  const toggleTraining = async (id: string) => {
    const updatedTrainings = trainings.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    setTrainings(updatedTrainings)
    await saveTrainings(updatedTrainings)
  }

  // トレーニング記録の削除
  const deleteTraining = async (id: string) => {
    const updatedTrainings = trainings.filter(t => t.id !== id)
    setTrainings(updatedTrainings)
    await saveTrainings(updatedTrainings)
  }

  // 編集開始
  const startEditingTraining = (training: Training) => {
    setEditingTrainingId(training.id)
    setNewTraining({
      title: training.title,
      description: training.description,
      date: training.date,
      duration: training.duration,
      exercises: training.exercises,
    })
    setShowTrainingForm(true)
  }

  // 編集保存
  const saveTrainingEdit = async () => {
    if (!editingTrainingId || !newTraining.title.trim()) return
    const updatedTrainings = trainings.map(t =>
      t.id === editingTrainingId
        ? { ...t, ...newTraining }
        : t
    )
    setTrainings(updatedTrainings)
    await saveTrainings(updatedTrainings)
    setEditingTrainingId(null)
    setNewTraining({ title: '', description: '', date: '', duration: '', exercises: [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }] })
    setShowTrainingForm(false)
  }

  // 編集キャンセル
  const cancelTrainingEdit = () => {
    setEditingTrainingId(null)
    setNewTraining({ title: '', description: '', date: '', duration: '', exercises: [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }] })
    setShowTrainingForm(false)
  }

  // フィルタリング
  const getFilteredTrainings = () => {
    if (currentTrainingFilter === 'all') return trainings
    if (currentTrainingFilter === 'completed') return trainings.filter(t => t.completed)
    return trainings.filter(t => !t.completed)
  }

  // エクササイズ追加・削除・更新
  const addExercise = () => setNewTraining((t: NewTraining) => ({ ...t, exercises: [...t.exercises, { name: '', sets: 3, reps: 10, weight: 0, completed: false }] }))
  const removeExercise = (idx: number) => setNewTraining((t: NewTraining) => ({ ...t, exercises: t.exercises.filter((_, i) => i !== idx) }))
  const updateExercise = (idx: number, field: keyof Exercise, value: string | number) => setNewTraining((t: NewTraining) => ({ ...t, exercises: t.exercises.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex) }))

  // ログアウト
  const handleLogout = async () => {
    await logout()
  }

  // UI
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Dumbbell />トレーニング記録</h1>
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"><LogOut className="w-4 h-4" />ログアウト</button>
      </div>
      <div className="mb-4 flex gap-2">
        <button className={`px-3 py-1 rounded ${currentTrainingFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setCurrentTrainingFilter('all')}>すべて</button>
        <button className={`px-3 py-1 rounded ${currentTrainingFilter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => setCurrentTrainingFilter('completed')}>完了</button>
        <button className={`px-3 py-1 rounded ${currentTrainingFilter === 'incomplete' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`} onClick={() => setCurrentTrainingFilter('incomplete')}>未完了</button>
      </div>
      <div className="mb-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-1" onClick={() => { setShowTrainingForm(true); setEditingTrainingId(null); setNewTraining({ title: '', description: '', date: '', duration: '', exercises: [{ name: '', sets: 3, reps: 10, weight: 0, completed: false }] }) }}><Plus className="w-4 h-4" />新規トレーニング記録</button>
      </div>
      {showTrainingForm && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="mb-2">
            <label className="block text-sm font-medium">タイトル</label>
            <input className="w-full border rounded px-2 py-1" value={newTraining.title} onChange={e => setNewTraining(t => ({ ...t, title: e.target.value }))} />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">説明</label>
            <textarea className="w-full border rounded px-2 py-1" value={newTraining.description} onChange={e => setNewTraining(t => ({ ...t, description: e.target.value }))} />
          </div>
          <div className="mb-2 flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium">日付</label>
              <input type="date" className="w-full border rounded px-2 py-1" value={newTraining.date} onChange={e => setNewTraining(t => ({ ...t, date: e.target.value }))} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">所要時間</label>
              <input className="w-full border rounded px-2 py-1" value={newTraining.duration} onChange={e => setNewTraining(t => ({ ...t, duration: e.target.value }))} placeholder="例: 60分" />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">エクササイズ</label>
            {newTraining.exercises.map((ex, idx) => (
              <div key={idx} className="flex gap-2 mb-1 items-center">
                <input className="border rounded px-2 py-1 flex-1" placeholder="種目名" value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} />
                <input className="border rounded px-2 py-1 w-16" type="number" min={1} placeholder="セット" value={ex.sets} onChange={e => updateExercise(idx, 'sets', Number(e.target.value))} />
                <input className="border rounded px-2 py-1 w-16" type="number" min={1} placeholder="回数" value={ex.reps} onChange={e => updateExercise(idx, 'reps', Number(e.target.value))} />
                <input className="border rounded px-2 py-1 w-20" type="number" min={0} placeholder="重量(kg)" value={ex.weight || ''} onChange={e => updateExercise(idx, 'weight', Number(e.target.value))} />
                <button className="text-red-500" onClick={() => removeExercise(idx)}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button className="text-blue-500 text-sm mt-1" onClick={addExercise}><Plus className="w-4 h-4 inline" />エクササイズ追加</button>
          </div>
          <div className="flex gap-2 mt-4">
            {editingTrainingId ? (
              <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={saveTrainingEdit}><Check className="w-4 h-4" />保存</button>
            ) : (
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={addTraining}><Plus className="w-4 h-4" />追加</button>
            )}
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={cancelTrainingEdit}>キャンセル</button>
          </div>
        </div>
      )}
      <div>
        {loadingTrainings ? (
          <div>読み込み中...</div>
        ) : getFilteredTrainings().length === 0 ? (
          <div>トレーニング記録がありません。</div>
        ) : (
          <ul className="space-y-4">
            {getFilteredTrainings().map(training => (
              <li key={training.id} className={`p-4 rounded shadow flex flex-col gap-2 ${training.completed ? 'bg-green-50' : 'bg-white'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                    <span className="text-lg font-semibold">{training.title}</span>
                    {training.completed && <span className="text-green-500 text-xs ml-2">完了</span>}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-green-500" onClick={() => toggleTraining(training.id)}><Check className="w-4 h-4" /></button>
                    <button className="text-blue-500" onClick={() => startEditingTraining(training)}><Edit className="w-4 h-4" /></button>
                    <button className="text-red-500" onClick={() => deleteTraining(training.id)}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="text-gray-600 text-sm">{training.description}</div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span><Calendar className="inline w-4 h-4 mr-1" />{training.date}</span>
                  <span><Clock className="inline w-4 h-4 mr-1" />{training.duration}</span>
                </div>
                <div>
                  <div className="font-medium text-sm mb-1">エクササイズ</div>
                  <ul className="pl-4 list-disc">
                    {training.exercises.map((ex, idx) => (
                      <li key={idx} className="text-sm">
                        {ex.name}：{ex.sets}セット × {ex.reps}回{ex.weight ? `（${ex.weight}kg）` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
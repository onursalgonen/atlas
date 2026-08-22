import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, createProject } from './db.js'
import Board from './Board.jsx'
import SyncPanel from './SyncPanel.jsx'

export default function Dashboard() {
  const projects = useLiveQuery(() => db.projects.toArray(), [])
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!draft.trim()) return
    const id = await createProject(draft.trim())
    setDraft('')
    setActiveId(id)
  }

  if (!projects) return null

  const active = projects.find((p) => p.id === activeId)

  if (active) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <button className="btn ghost" onClick={() => setActiveId(null)}>← Projeler</button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{active.name}</h2>
          <span />
        </div>
        <Board projectId={active.id} />
        <SyncPanel projectId={active.id} />
      </div>
    )
  }

  return (
    <div>
      <form className="add-row" style={{ padding: 0, marginBottom: 18, maxWidth: 420 }} onSubmit={handleCreate}>
        <input
          placeholder="Yeni proje adı…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn" type="submit">Proje Oluştur</button>
      </form>

      <div className="project-grid">
        {projects.length === 0 && (
          <p style={{ color: 'var(--paper-dim)' }}>
            Henüz proje yok. Yukarıdan ilk projeni oluştur — çevrimdışıyken
            de oluşturabilirsin, bağlantı gelince paylaşabilirsin.
          </p>
        )}
        {projects.map((p) => (
          <button key={p.id} className="project-card" onClick={() => setActiveId(p.id)}>
            <div className="name">{p.name}</div>
            <div className="meta">Güncellendi: {new Date(p.updatedAt).toLocaleDateString('tr-TR')}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

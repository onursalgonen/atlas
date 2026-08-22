import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, addTask, moveTask } from './db.js'

export default function Board({ projectId }) {
  const columns = useLiveQuery(
    () => db.columns.where({ projectId }).sortBy('order'),
    [projectId]
  )
  const tasks = useLiveQuery(
    () => db.tasks.where({ projectId }).toArray(),
    [projectId]
  )

  if (!columns || !tasks) return null

  return (
    <div className="board">
      {columns.map((col) => (
        <ColumnView
          key={col.id}
          column={col}
          tasks={tasks.filter((t) => t.columnId === col.id).sort((a, b) => a.order - b.order)}
          projectId={projectId}
        />
      ))}
    </div>
  )
}

function ColumnView({ column, tasks, projectId }) {
  const [draft, setDraft] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!draft.trim()) return
    await addTask(projectId, column.id, draft.trim())
    setDraft('')
  }

  function onDrop(e) {
    e.preventDefault()
    const taskId = Number(e.dataTransfer.getData('text/task-id'))
    if (taskId) moveTask(taskId, column.id, tasks.length)
  }

  return (
    <div className="column" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <div className="column-head">
        <span>{column.name}</span>
        <span>{tasks.length}</span>
      </div>
      <div className="column-body">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="task-card"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/task-id', String(t.id))}
          >
            {t.title}
          </div>
        ))}
      </div>
      <form className="add-row" onSubmit={submit}>
        <input
          placeholder="Görev ekle…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn" type="submit">Ekle</button>
      </form>
    </div>
  )
}

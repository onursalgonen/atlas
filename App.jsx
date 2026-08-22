import { useState } from 'react'
import StatusStrip from './StatusStrip.jsx'
import Dashboard from './Dashboard.jsx'
import Finance from './Finance.jsx'

export default function App() {
  const [tab, setTab] = useState('projeler')

  return (
    <div className="app-shell">
      <StatusStrip />
      <header className="app-header">
        <h1 className="app-title">Atlas<span className="mark">.</span></h1>
      </header>
      <nav className="tabbar">
        <button className={`tab ${tab === 'projeler' ? 'active' : ''}`} onClick={() => setTab('projeler')}>
          Projeler
        </button>
        <button className={`tab ${tab === 'finans' ? 'active' : ''}`} onClick={() => setTab('finans')}>
          Finans
        </button>
      </nav>
      <main className="content">
        {tab === 'projeler' ? <Dashboard /> : <Finance />}
      </main>
    </div>
  )
}

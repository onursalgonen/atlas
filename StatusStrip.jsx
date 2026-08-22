import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db.js'
import { useConnection } from './useConnection.js'

export default function StatusStrip() {
  const online = useConnection()
  const lastSync = useLiveQuery(
    () => db.syncLog.orderBy('createdAt').last(),
    []
  )

  const lastSyncText = lastSync
    ? new Date(lastSync.createdAt).toLocaleString('tr-TR')
    : 'henüz yok'

  return (
    <div className="status-strip">
      <span className={`status-dot ${online ? 'on' : 'off'}`} />
      <span>{online ? 'Wi-Fi / İnternet bağlı' : 'Bağlantı yok — bellekten çalışılıyor'}</span>
      <span className="divider" />
      <span>Son senkron: {lastSyncText}</span>
    </div>
  )
}

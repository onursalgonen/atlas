import { useState } from 'react'
import { exportProjectBundle, importProjectBundle } from './db.js'

// Not: WhatsApp'ın gerçek zamanlı bir veritabanı senkronizasyon API'si
// yoktur. Burada yapılan şey: değişiklikleri sıkıştırılmış bir metin
// paketi haline getirip WhatsApp'ın "wa.me" paylaşım linkiyle göndermek,
// karşı tarafın da bu paketi yapıştırıp içe aktarmasıdır. Çakışmalar
// updatedAt alanına göre çözülür (db.js -> importProjectBundle).
export default function SyncPanel({ projectId }) {
  const [bundleText, setBundleText] = useState('')
  const [importText, setImportText] = useState('')
  const [status, setStatus] = useState('')

  async function handleExport() {
    const bundle = await exportProjectBundle(projectId)
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(bundle))))
    setBundleText(encoded)
    setStatus('Paket hazır. Aşağıdan WhatsApp\'ta paylaşabilir veya kopyalayabilirsin.')
  }

  function shareOnWhatsApp() {
    if (!bundleText) return
    const message = `Atlas senkron paketi:\n\n${bundleText}\n\n(Bu metni Atlas > İçe Aktar alanına yapıştır)`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  async function handleImport() {
    try {
      const clean = importText.trim().replace(/^Atlas senkron paketi:\s*/i, '')
      const json = decodeURIComponent(escape(atob(clean)))
      const bundle = JSON.parse(json)
      await importProjectBundle(bundle)
      setStatus('İçe aktarma tamamlandı — proje güncellendi.')
      setImportText('')
    } catch (err) {
      setStatus('Paket okunamadı. Metnin tam ve bozulmamış olduğundan emin ol.')
    }
  }

  return (
    <div className="sync-panel">
      <h3>Bağlantı yokken paylaşım (WhatsApp)</h3>
      <p style={{ fontSize: 13, color: 'var(--paper-dim)', margin: 0 }}>
        İnternet olmadığında bu projeyi bir metin paketi olarak dışa aktar,
        WhatsApp'tan gönder. Arkadaşın aynı paketi "İçe Aktar" kutusuna
        yapıştırır. Bağlantı geri geldiğinde normal senkron akışına geçilir.
      </p>
      <div className="sync-actions">
        <button className="btn" onClick={handleExport}>Dışa Aktar</button>
        {bundleText && (
          <button className="btn teal" onClick={shareOnWhatsApp}>WhatsApp'ta Paylaş</button>
        )}
      </div>
      {bundleText && <textarea className="sync-box" readOnly value={bundleText} />}

      <h3 style={{ marginTop: 10 }}>İçe Aktar</h3>
      <textarea
        className="sync-box"
        placeholder="Buraya WhatsApp'tan gelen paketi yapıştır…"
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
      />
      <div className="sync-actions">
        <button className="btn ghost" onClick={handleImport}>Projeye Uygula</button>
      </div>
      {status && <p style={{ fontSize: 12, color: 'var(--signal-teal)' }}>{status}</p>}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useConnection } from './useConnection.js'

const SNAPSHOT_KEY = 'atlas-finance-snapshot'

// TradingView canlı veri çeken bir servistir; gerçek offline grafik
// yayını yapamaz. Burada yapılabilecek en dürüst şey: online iken
// widget'ı göstermek ve widget'tan gelen son fiyat/sembol bilgisini
// yerelde "anlık görüntü" olarak saklamak; offline'da bu görüntüyü
// -canlı değil, en son bilinen durum olarak- göstermek.
export default function Finance() {
  const online = useConnection()
  const containerRef = useRef(null)
  const [symbol, setSymbol] = useState('BIST:XU100')
  const [snapshot, setSnapshot] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || 'null')
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!online || !containerRef.current) return
    containerRef.current.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [[symbol]],
      chartOnly: false,
      width: '100%',
      height: 460,
      locale: 'tr',
      colorTheme: 'dark',
      autosize: true
    })
    containerRef.current.appendChild(script)

    // Widget'ın kendi içeriğini okuyamayız (iframe izolasyonu), bu yüzden
    // anlık görüntüyü "son görüntülenen sembol + zaman damgası" olarak
    // tutuyoruz. Gerçek fiyat verisi saklamak için TradingView'ın REST/
    // websocket verisine ayrı, yetkili bir entegrasyon gerekir.
    const record = { symbol, viewedAt: Date.now() }
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(record))
    setSnapshot(record)
  }, [online, symbol])

  return (
    <div className="finance-page">
      <div className="add-row" style={{ padding: 0, maxWidth: 320 }}>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Örn: BIST:XU100, NASDAQ:AAPL"
        />
      </div>

      {online ? (
        <div className="finance-widget-frame" ref={containerRef} />
      ) : (
        <div className="offline-snapshot">
          <strong>Bağlantı yok — canlı grafik gösterilemiyor.</strong>
          <br />
          TradingView verisi gerçek zamanlı bir servistir, offline
          çalışmaz. {snapshot ? (
            <>
              En son <strong>{snapshot.symbol}</strong> sembolüne{' '}
              {new Date(snapshot.viewedAt).toLocaleString('tr-TR')} tarihinde
              bakılmış. Bağlantı gelince otomatik güncellenecek.
            </>
          ) : (
            'Henüz kayıtlı bir görüntüleme yok.'
          )}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'

// Basit online/offline takibi. İleride "gerçek internet var mı" testi
// için bir ping isteği eklenebilir; navigator.onLine bazı durumlarda
// (ör. Wi-Fi'ye bağlı ama internet yok) yanıltıcı olabilir.
export function useConnection() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}

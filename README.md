# Atlas — Offline-First Proje Yöneticisi (PWA)

Bu, konuştuğumuz özellikler için çalışan bir **başlangıç iskeleti**.
Tam ürün değil — üzerine inşa edebileceğin sağlam bir temel.

## Neyi çözer, neyi çözmez

| İstek | Bu iskelette karşılığı |
|---|---|
| PWA + Wi-Fi'de bellekten çalışma | ✅ Vite PWA plugin + Service Worker (uygulama kabuğunu cache'ler) + Dexie/IndexedDB (tüm veri yerelde) |
| Proje/görev yönetimi arayüzü | ✅ Kanban tarzı pano (Yapılacak / Devam Ediyor / Bitti), sürükle-bırak |
| WhatsApp üzerinden veri paylaşımı | ⚠️ **Gerçek zamanlı senkron değil.** WhatsApp'ın veritabanı senkron API'si yok. Bunun yerine: proje verisini bir metin paketine (base64 JSON) çeviren "Dışa Aktar", `wa.me` linkiyle paylaşma, ve karşı tarafın yapıştırıp uyguladığı "İçe Aktar" akışı var. Çakışma çözümü `updatedAt` alanına göre "son yazan kazanır" mantığıyla. |
| TradingView ile offline finans | ⚠️ **TradingView canlı bir servistir, offline grafik veremez.** Online iken gerçek TradingView widget'ı gösteriliyor; offline'da en son bakılan sembol/zaman bilgisiyle bir "son durum" notu gösteriliyor. Gerçek offline fiyat verisi istiyorsan ayrı bir borsa API'sinden (ör. bir REST endpoint) periyodik veri çekip yerelde saklamak gerekir — bu, ayrı bir iş. |
| Piyasadaki araçların arayüzünü birebir kopyalama | ❌ Yapılmadı (telif riski). Bunun yerine Trello/Notion tarzı etkileşim kalıplarından (kanban, sürükle-bırak, kart) ilham alan özgün bir "mühendislik defteri" görsel dili kuruldu. |

## Kurulum

```bash
npm install
npm run dev       # geliştirme sunucusu
npm run build     # production build (PWA/service worker burada aktifleşir)
npm run preview   # build'i yerel sunucuda dene
```

`npm run dev` sırasında service worker genelde devre dışıdır — offline
davranışını test etmek için `npm run build && npm run preview` kullan,
sonra tarayıcı DevTools > Network > Offline ile dene.

## Dosyalar (klasörsüz, tek dizin)

Tüm kaynak dosyalar bilinçli olarak alt klasörsüz, tek dizinde:

```
index.html, package.json, vite.config.js
main.jsx, App.jsx, styles.css
db.js                  Dexie şeması + dışa/içe aktarma mantığı
useConnection.js       Online/offline durumu hook'u
StatusStrip.jsx, Board.jsx, SyncPanel.jsx, Dashboard.jsx, Finance.jsx
icon-192.png, icon-512.png
```

Not: `vite.config.js` içinde `publicDir: '.'` ayarlandı, yani proje
kökü aynı zamanda statik dosya klasörü olarak kullanılıyor (ikonların
build çıktısına kopyalanması için). Proje büyüdükçe normalde
`src/` ve `public/` ayrımına dönmek isteyebilirsin — o zaman bu
ayarı kaldırıp dosyaları ilgili klasörlere taşımak yeterli.

## Önerilen sıradaki adımlar

1. **Gerçek çoklu kullanıcı senkronu**: WhatsApp export/import bir
   köprü olarak iş görür ama gerçek zamanlı değildir. Ekip büyüdükçe
   Supabase/Firebase gibi bir backend + "bağlantı gelince otomatik
   senkron" katmanı eklemek isteyeceksin. `db.js`'teki
   `exportProjectBundle`/`importProjectBundle` mantığı o geçişte
   doğrudan yeniden kullanılabilir.
2. **Finans verisi**: Offline gerçek fiyat göstermek istiyorsan bir
   borsa/kripto REST API'sinden (ör. her 15 dakikada bir) veri çekip
   Dexie'de ayrı bir `quotes` tablosunda saklamak gerekir.
3. **Kimlik doğrulama ve ekip yönetimi**: Şu an tek kullanıcılık.
   Çok kişi aynı projede çalışacaksa kullanıcı/rol modeli eklenmeli.
4. **İkonlar**: `public/icons/` altındakiler yer tutucu — gerçek marka
   ikonlarınla değiştir.

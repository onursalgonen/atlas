import Dexie from 'dexie'

// Tüm veri tarayıcı içinde IndexedDB'de tutulur. İnternet olsun olmasın
// uygulama her zaman bu veritabanından okur/yazar — "online" durumu
// sadece dışarıyla senkronizasyonu (ileride bir backend, şimdilik
// WhatsApp üzerinden paylaşılan senkron paketleri) etkiler.
export const db = new Dexie('atlas-db')

db.version(1).stores({
  projects: '++id, name, createdAt, updatedAt',
  tasks: '++id, projectId, columnId, title, order, updatedAt',
  columns: '++id, projectId, name, order',
  syncLog: '++id, direction, projectId, createdAt' // 'export' | 'import' kayıtları
})

// --- Yardımcı fonksiyonlar ---------------------------------------------

export async function createProject(name) {
  const now = Date.now()
  const id = await db.projects.add({ name, createdAt: now, updatedAt: now })
  const defaultColumns = ['Yapılacak', 'Devam Ediyor', 'Bitti']
  for (let i = 0; i < defaultColumns.length; i++) {
    await db.columns.add({ projectId: id, name: defaultColumns[i], order: i })
  }
  return id
}

export async function addTask(projectId, columnId, title) {
  const count = await db.tasks.where({ projectId, columnId }).count()
  return db.tasks.add({
    projectId,
    columnId,
    title,
    order: count,
    updatedAt: Date.now()
  })
}

export async function moveTask(taskId, columnId, order) {
  return db.tasks.update(taskId, { columnId, order, updatedAt: Date.now() })
}

// --- Senkronizasyon paketi (WhatsApp ile paylaşılacak) ------------------
// Bağlantı olmadığında değişiklikler bir JSON "senkron paketi" haline
// getirilir. Bu paket WhatsApp'tan dosya/metin olarak gönderilir; karşı
// taraf uygulamaya "İçe Aktar" ile yükler. Çakışmalar updatedAt alanına
// göre "son yazan kazanır" mantığıyla çözülür (basit ama öngörülebilir).
export async function exportProjectBundle(projectId) {
  const project = await db.projects.get(projectId)
  const columns = await db.columns.where({ projectId }).toArray()
  const tasks = await db.tasks.where({ projectId }).toArray()
  const bundle = {
    kind: 'atlas-sync-bundle',
    version: 1,
    exportedAt: Date.now(),
    project,
    columns,
    tasks
  }
  await db.syncLog.add({ direction: 'export', projectId, createdAt: Date.now() })
  return bundle
}

export async function importProjectBundle(bundle) {
  if (!bundle || bundle.kind !== 'atlas-sync-bundle') {
    throw new Error('Geçersiz senkron paketi')
  }
  await db.transaction('rw', db.projects, db.columns, db.tasks, db.syncLog, async () => {
    const existing = await db.projects.get(bundle.project.id)
    if (!existing || bundle.project.updatedAt >= existing.updatedAt) {
      await db.projects.put(bundle.project)
    }
    for (const col of bundle.columns) {
      await db.columns.put(col)
    }
    for (const task of bundle.tasks) {
      const localTask = await db.tasks.get(task.id)
      if (!localTask || task.updatedAt >= localTask.updatedAt) {
        await db.tasks.put(task)
      }
    }
    await db.syncLog.add({ direction: 'import', projectId: bundle.project.id, createdAt: Date.now() })
  })
}

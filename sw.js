// ═══════════════════════════════════════════════════════
// SERVICE WORKER — Segura Contable PWA
// Estrategia: Cache First para assets, Network First para datos
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'segura-contable-v2'
const CACHE_STATIC = 'segura-static-v2'
const CACHE_DYNAMIC = 'segura-dynamic-v2'

// Archivos que se cachean inmediatamente al instalar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/portal.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // CDN fonts y librerías
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
]

// ── INSTALL: pre-cachear assets estáticos ──
self.addEventListener('install', event => {
  console.log('[SW] Instalando...')
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      console.log('[SW] Pre-cacheando archivos estáticos')
      // Cachear de a uno para no fallar si algún CDN falla
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] No se pudo cachear:', url, err))
        )
      )
    }).then(() => self.skipWaiting())
  )
})

// ── ACTIVATE: limpiar cachés viejos ──
self.addEventListener('activate', event => {
  console.log('[SW] Activando...')
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
          .map(key => {
            console.log('[SW] Eliminando caché viejo:', key)
            return caches.delete(key)
          })
      )
    }).then(() => self.clients.claim())
  )
})

// ── FETCH: estrategia por tipo de recurso ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Ignorar peticiones a Supabase (datos en tiempo real, siempre de red)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(event.request))
    return
  }

  // Ignorar peticiones no GET
  if (event.request.method !== 'GET') return

  // HTML pages: Network First (siempre intenta tener la versión más reciente)
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(event.request))
    return
  }

  // Assets estáticos (JS, CSS, fonts, imágenes): Cache First
  event.respondWith(cacheFirst(event.request))
})

// Cache First: sirve desde caché, si no hay va a red y guarda
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC)
      cache.put(request, response.clone())
    }
    return response
  } catch(err) {
    // Offline y no está en caché
    return new Response('Recurso no disponible offline', { status: 503 })
  }
}

// Network First: intenta red, si falla sirve desde caché
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC)
      cache.put(request, response.clone())
    }
    return response
  } catch(err) {
    const cached = await caches.match(request)
    if (cached) return cached

    // Si es una página HTML y no hay caché, mostrar página offline
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index.html')
    }
    return new Response('Sin conexión', { status: 503 })
  }
}

// ── SYNC: sincronizar datos pendientes cuando vuelve la conexión ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending') {
    event.waitUntil(syncPendingData())
  }
})

async function syncPendingData() {
  // Placeholder para futura sincronización de datos offline
  console.log('[SW] Sincronizando datos pendientes...')
}

// ── PUSH: notificaciones (preparado para futuro) ──
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'Segura Contable', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' }
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  )
})

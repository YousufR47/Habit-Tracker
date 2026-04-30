// sw.js — Habits PWA Service Worker
// Handles notification scheduling via alarms polled on a regular interval.

const CACHE_NAME = 'habits-v1';
const CHECK_INTERVAL_MS = 60 * 1000; // check every 60s while SW is alive

let notifSettings = null;
let checkTimer = null;

// ─── INSTALL / ACTIVATE ──────────────────────────────────────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ─── MESSAGE FROM PAGE ───────────────────────────────────────
self.addEventListener('message', e => {
  const { type, settings } = e.data || {};

  if (type === 'SCHEDULE_NOTIFICATIONS') {
    notifSettings = settings;
    persistSettings(settings);
    scheduleLoop();
  }

  if (type === 'CANCEL_NOTIFICATIONS') {
    notifSettings = null;
    persistSettings(null);
    if (checkTimer) { clearTimeout(checkTimer); checkTimer = null; }
  }
});

// ─── PERSIST SETTINGS VIA CACHE (survives SW restart) ────────
async function persistSettings(settings) {
  try {
    const cache = await caches.open(CACHE_NAME);
    if (settings) {
      const res = new Response(JSON.stringify(settings), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put('/_notif_settings', res);
    } else {
      await cache.delete('/_notif_settings');
    }
  } catch (_) {}
}

async function loadPersistedSettings() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match('/_notif_settings');
    if (res) return await res.json();
  } catch (_) {}
  return null;
}

// ─── SCHEDULING LOOP ─────────────────────────────────────────
// Called whenever the SW receives settings or wakes up.
// Calculates ms until next reminder time and fires a notification.

function scheduleLoop() {
  if (checkTimer) clearTimeout(checkTimer);
  checkTimer = setTimeout(tick, CHECK_INTERVAL_MS);
}

async function tick() {
  // Reload settings in case SW restarted
  if (!notifSettings) notifSettings = await loadPersistedSettings();

  if (notifSettings && notifSettings.enabled) {
    await maybeFireNotification(notifSettings);
    scheduleLoop(); // keep the loop going
  }
}

// Track last fired date so we only fire once per day
let lastFiredDate = '';
let lastStreakFiredDate = '';

async function maybeFireNotification(settings) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const [hh, mm] = settings.reminderTime.split(':').map(Number);

  const targetToday = new Date(now);
  targetToday.setHours(hh, mm, 0, 0);

  const diffMs = now - targetToday;

  // Fire if we're within a 90-second window past the target time
  if (diffMs >= 0 && diffMs < 90_000 && lastFiredDate !== todayStr) {
    lastFiredDate = todayStr;
    await fireNotification(
      '🌿 Habit reminder',
      settings.reminderMsg || 'Time to log your habits!',
      'reminder'
    );

    // Streak alert fires 1hr later
    if (settings.streakAlert) {
      setTimeout(async () => {
        const streakToday = new Date().toISOString().slice(0, 10);
        if (lastStreakFiredDate !== streakToday) {
          lastStreakFiredDate = streakToday;
          // Only fire streak alert if the app is not in the foreground
          const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
          const appVisible = clients.some(c => c.visibilityState === 'visible');
          if (!appVisible) {
            await fireNotification(
              '🔥 Streak at risk!',
              "Don't forget to log your habits before midnight!",
              'streak'
            );
          }
        }
      }, 60 * 60 * 1000); // 1 hour
    }
  }
}

async function fireNotification(title, body, tag) {
  if (Notification.permission !== 'granted') return;
  try {
    await self.registration.showNotification(title, {
      body,
      tag,               // deduplicates so you don't get spammed
      renotify: false,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: '/' }
    });
  } catch (err) {
    console.warn('[SW] showNotification failed:', err);
  }
}

// ─── NOTIFICATION CLICK ──────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// ─── BACKGROUND SYNC / PERIODIC SYNC (when available) ────────
// This lets the OS wake the SW periodically even when the app is closed.
self.addEventListener('periodicsync', e => {
  if (e.tag === 'habit-notif-check') {
    e.waitUntil(tick());
  }
});

// ─── FETCH (basic cache-first for offline shell) ─────────────
self.addEventListener('fetch', e => {
  // Skip non-GET and cross-origin
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// ─── STARTUP: restore settings if SW was killed and restarted ─
(async () => {
  notifSettings = await loadPersistedSettings();
  if (notifSettings && notifSettings.enabled) {
    scheduleLoop();
  }
})();

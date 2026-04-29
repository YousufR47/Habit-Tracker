const CACHE = 'habits-v4b';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// ─── NOTIFICATIONS ────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
      if(list.length) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleNotifications(e.data.settings);
  }
  if(e.data && e.data.type === 'CANCEL_NOTIFICATIONS') {
    clearScheduledNotifications();
  }
});

// Store timeout IDs so we can cancel them
let scheduledTimers = [];

function clearScheduledNotifications() {
  scheduledTimers.forEach(id => clearTimeout(id));
  scheduledTimers = [];
}

function scheduleNotifications(settings) {
  clearScheduledNotifications();
  if(!settings || !settings.enabled) return;

  scheduleDailyReminder(settings);
  if(settings.streakAlert) scheduleStreakCheck(settings);
}

function scheduleDailyReminder(settings) {
  const now = new Date();
  const [hours, minutes] = settings.reminderTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if(target <= now) target.setDate(target.getDate() + 1);
  const delay = target - now;

  const id = setTimeout(() => {
    self.registration.showNotification('🌿 Habits', {
      body: settings.reminderMsg || "Time to log your habits!",
      icon: './icon.svg',
      badge: './icon.svg',
      tag: 'daily-reminder',
      renotify: true,
    });
    // Reschedule for next day
    scheduleDailyReminder(settings);
  }, delay);
  scheduledTimers.push(id);
}

function scheduleStreakCheck(settings) {
  // Fire streak check 1 hour after the reminder
  const now = new Date();
  const [hours, minutes] = settings.reminderTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours + 1, minutes, 0, 0);
  if(target <= now) target.setDate(target.getDate() + 1);
  const delay = target - now;

  const id = setTimeout(async () => {
    // Ask the app for streak info
    const allClients = await clients.matchAll({includeUncontrolled:true});
    if(allClients.length > 0) {
      // App is open — it will handle its own streak checks
    } else {
      // App is closed — show a generic streak protection nudge
      self.registration.showNotification('🔥 Streak at risk!', {
        body: "Don't forget to log your habits today before midnight!",
        icon: './icon.svg',
        badge: './icon.svg',
        tag: 'streak-alert',
        renotify: true,
      });
    }
    scheduleStreakCheck(settings);
  }, delay);
  scheduledTimers.push(id);
}
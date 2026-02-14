# MoniChat — Your Financial Memory

A conversational personal finance app that tracks spending through natural language chat. Built as a PWA for instant deployment.

## 🚀 Quick Deploy

### Option A: Vercel (recommended, 30 seconds)
```bash
npx vercel --prod
```
That's it. Vercel auto-detects the static site.

### Option B: Netlify
```bash
npx netlify deploy --prod --dir=.
```

### Option C: Cloudflare Pages
1. Push to GitHub
2. Connect repo in Cloudflare Pages dashboard
3. Build command: (none) | Output directory: `/`

### Option D: Any static host
Upload the entire folder. It's just HTML + JS + JSON.

---

## 📁 Project Structure
```
monichat-pwa/
├── index.html        ← Full app (single file, self-contained)
├── manifest.json     ← PWA manifest (name, icons, theme)
├── sw.js             ← Service worker (offline, push notifications)
├── icons/            ← App icons (you need to add these)
│   ├── icon-192.png  ← 192x192 app icon
│   ├── icon-512.png  ← 512x512 app icon
│   └── icon-maskable.png ← Maskable icon for Android
└── README.md
```

## 🔧 Configuration

Open `index.html` and edit the `CONFIG` object at the top of the script:

```javascript
const CONFIG = {
  API_ENDPOINT: "https://api.anthropic.com/v1/messages",  // Or your proxy
  API_KEY: "",           // DO NOT put keys in frontend code in production
  MODEL: "claude-sonnet-4-20250514",
  ADMIN_PASS: "monichat2026",  // Change this!
  APP_NAME: "MoniChat",
  APP_URL: "https://monichat.xyz",
};
```

### ⚠️ API Key Security

**Never expose your Anthropic API key in frontend code.** For production:

1. Create a backend proxy (Node/Express, Cloudflare Worker, Vercel Edge Function)
2. The proxy receives chat requests, adds your API key, forwards to Anthropic
3. Point `CONFIG.API_ENDPOINT` to your proxy URL

Example Vercel Edge Function (`/api/chat.js`):
```javascript
export default async function handler(req) {
  const body = await req.json();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  return new Response(res.body, { headers: { "Content-Type": "application/json" } });
}
```

---

## 📱 PWA Features

| Feature | Status |
|---------|--------|
| Installable (Add to Home Screen) | ✅ |
| Offline support (cached assets) | ✅ |
| Browser push notifications (nudges) | ✅ |
| Safe area support (iPhone notch) | ✅ |
| Standalone mode (no browser chrome) | ✅ |
| Pull-to-refresh disabled | ✅ |

### Icons

Generate your icons using [Maskable.app](https://maskable.app/editor) or [RealFaviconGenerator](https://realfavicongenerator.net/):

- `icon-192.png` — 192×192, standard icon
- `icon-512.png` — 512×512, splash screen
- `icon-maskable.png` — 512×512, maskable (safe zone for Android adaptive icons)

---

## 🗄️ Storage Architecture

### Current (Beta): localStorage
- All data stored on-device in the browser
- Zero server dependency
- Data persists across sessions
- Leaderboard is per-device (not shared)

### Production Upgrade: Supabase or Firebase
For multi-user leaderboard, admin dashboard, and cross-device sync:

```
Client → API Proxy → Anthropic (chat)
Client → Supabase (data storage)
  ├── users table
  ├── expenses table
  ├── income table
  ├── streaks table (shared, for leaderboard)
  └── admin_profiles table (shared, for admin)
```

Key changes needed:
1. Replace `sGet()`/`sSet()` with Supabase client calls
2. Add auth (Supabase Auth or custom)
3. Shared tables for leaderboard and admin become real database queries
4. Row-level security ensures users only see their own data

---

## 🔔 Notifications

The app uses the **Web Notifications API** for real push notifications:

1. During onboarding, the app requests notification permission
2. At scheduled nudge times, if the app is open, it sends both:
   - An in-chat bot message
   - A browser notification (works even if tab is in background)
3. The service worker handles notifications when the app is closed

For true background push (app completely closed), you need:
- A push notification service (Firebase Cloud Messaging, OneSignal, or Web Push)
- A backend that sends push messages at scheduled times
- VAPID keys for Web Push protocol

---

## 🔐 Admin Dashboard

Access: **Double-click the 💸 logo** → enter passcode (`monichat2026` by default).

The admin sees:
- Total users, active users, retention metrics
- Streak distribution and feature adoption
- Sortable user cards with anonymized data
- Global spending category breakdown

---

## 📋 Feature Checklist

- [x] Expense tracking via natural language
- [x] Income tracking (8 source types)
- [x] Budget setting and monitoring
- [x] Reminder system
- [x] Streak tracking with 9 milestone tiers
- [x] Twice-daily nudge system
- [x] End-of-day expense recap confirmation
- [x] Quick-log category buttons
- [x] Weekly financial summary (Sundays)
- [x] Community streak leaderboard
- [x] Accountability partner sharing (clipboard + Web Share API)
- [x] Admin dashboard with engagement analytics
- [x] PWA installable
- [x] Offline support
- [x] Browser push notifications
- [x] Safe area support (notched phones)
- [x] Mobile-optimized (no zoom on input focus)

---

## 🛣️ Roadmap

### Phase 2: Backend + Auth
- Supabase integration for persistent multi-user data
- Email/phone auth
- Real cross-device sync
- Server-side scheduled push notifications

### Phase 3: WhatsApp Channel
- WhatsApp Business API integration
- Same AI + financial memory, delivered via WhatsApp
- Template messages for proactive nudges
- Users can log expenses via WhatsApp, view dashboard on web

### Phase 4: Native Apps
- Expo React Native port
- Native push notifications
- App Store + Play Store submission

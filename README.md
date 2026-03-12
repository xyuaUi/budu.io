# Budu.io — PWA Setup Guide

## 📁 File Structure
```
budu.io/
├── index.html          ← Main entry point
├── style.css           ← Fullscreen landscape styles
├── main.js             ← PWA logic + game controller
├── manifest.json       ← WebAPK manifest
├── service-worker.js   ← Offline caching
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── screenshots/
    └── landscape.png   ← 2400x1080
```

## 🚀 Deployment ke GitHub Pages

1. Upload **semua file** ke repository `xyuaui/budu.io`
2. Pastikan branch `main` atau `gh-pages` aktif di Settings → Pages
3. Akses via: `https://xyuaui.github.io/budu.io/`

## ✅ PWA Checklist

| Feature | Status |
|---------|--------|
| HTTPS (GitHub Pages) | ✅ Auto |
| manifest.json | ✅ |
| Service Worker | ✅ |
| Fullscreen mode | ✅ |
| Landscape lock | ✅ |
| Notch/punch-hole | ✅ viewport-fit=cover |
| Offline support | ✅ |
| Install prompt | ✅ |
| Icon 192x192 | ✅ |
| Icon 512x512 | ✅ |

## 📱 Cara Install di Android (Redmi 10)

1. Buka Chrome → `https://xyuaui.github.io/budu.io/`
2. Tunggu banner "Install Budu.io" muncul
3. Tap **Install**
4. App akan muncul di home screen seperti APK native

Atau manual:
- Chrome ⋮ menu → **Add to Home screen** / **Install app**

## 🎮 Menambahkan Game Logic

Edit `main.js` di bagian:
```javascript
function startGame() {
  // === YOUR GAME LOGIC GOES HERE ===
}
```

Ganti placeholder dengan game engine kamu (Phaser, PixiJS, Three.js, dll):
```javascript
// Contoh dengan Phaser 3:
// Tambahkan di index.html:
// <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>

function startGame() {
  const config = {
    type: Phaser.AUTO,
    canvas: document.getElementById('gameCanvas'),
    width: window.innerWidth,
    height: window.innerHeight,
    // ... your Phaser config
  };
  new Phaser.Game(config);
}
```

## 🔧 Konfigurasi Penting

### manifest.json
```json
{
  "display": "fullscreen",      ← Wajib untuk WebAPK
  "orientation": "landscape",   ← Lock landscape
  "start_url": "/budu.io/",    ← Sesuaikan dengan repo name
  "scope": "/budu.io/"         ← Sesuaikan dengan repo name
}
```

### Jika repo name berbeda
Ganti semua `/budu.io/` dengan nama repo kamu di:
- `manifest.json` → `start_url`, `scope`
- `service-worker.js` → `STATIC_FILES` array
- `service-worker.js` → `navigator.serviceWorker.register()`

## 🐛 Troubleshooting

**Install button tidak muncul?**
- Pastikan HTTPS aktif
- Pastikan manifest.json ter-link dengan benar
- Cek di Chrome DevTools → Application → Manifest

**Fullscreen tidak berfungsi?**
- Fullscreen butuh gesture user (tap/click) — sudah di-handle otomatis
- Pastikan `display: "fullscreen"` di manifest.json

**Orientation tidak terkunci?**
- `screen.orientation.lock()` hanya bisa dipanggil saat fullscreen aktif
- Sudah di-chain otomatis di `initImmersiveMode()`

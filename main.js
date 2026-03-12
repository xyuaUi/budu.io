// ========================================
// BUDU.IO — main.js
// PWA Controller: Fullscreen, Orientation,
// Service Worker, Install Prompt
// Target: Redmi 10 (2400x1080) Landscape
// ========================================

'use strict';

// ==============================
// SERVICE WORKER REGISTRATION
// ==============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/budu.io/service-worker.js', {
        scope: '/budu.io/'
      });
      console.log('[PWA] Service Worker registered:', reg.scope);

      // Check for updates every 30 minutes
      setInterval(() => reg.update(), 30 * 60 * 1000);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New update available. Refreshing...');
            newWorker.postMessage({ action: 'SKIP_WAITING' });
            window.location.reload();
          }
        });
      });
    } catch (err) {
      console.warn('[PWA] Service Worker registration failed:', err);
    }
  });
}

// ==============================
// LOADING SCREEN
// ==============================
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.querySelector('.loading-bar');
const loadingText = document.querySelector('.loading-text');

function simulateLoading() {
  let progress = 0;
  const steps = [
    { pct: 30, label: 'Loading assets...' },
    { pct: 60, label: 'Initializing game...' },
    { pct: 90, label: 'Almost ready...' },
    { pct: 100, label: 'Starting!' }
  ];

  const interval = setInterval(() => {
    const step = steps.find(s => s.pct > progress);
    if (!step) {
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          showStartScreen();
        }, 500);
      }, 300);
      return;
    }
    progress = Math.min(progress + Math.random() * 15 + 5, step.pct);
    if (loadingBar) loadingBar.style.width = progress + '%';
    if (loadingText) loadingText.textContent = step.label;
  }, 200);
}

// ==============================
// FULLSCREEN API
// ==============================
const FullscreenManager = {
  isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  },

  async request(element = document.documentElement) {
    if (this.isFullscreen()) return;
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen({ navigationUI: 'hide' });
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      console.log('[Fullscreen] Entered fullscreen mode');
    } catch (err) {
      console.warn('[Fullscreen] Could not enter fullscreen:', err);
    }
  },

  async exit() {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    } catch (err) {
      console.warn('[Fullscreen] Exit failed:', err);
    }
  },

  onChange(callback) {
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach(event => {
      document.addEventListener(event, callback);
    });
  }
};

// ==============================
// ORIENTATION LOCK
// ==============================
const OrientationManager = {
  async lockLandscape() {
    try {
      // Modern API
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
        console.log('[Orientation] Locked to landscape');
        return true;
      }
      // Legacy webkit
      if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
        return true;
      }
      if (screen.mozLockOrientation) {
        screen.mozLockOrientation('landscape');
        return true;
      }
      console.warn('[Orientation] Lock not supported — using CSS fallback');
      return false;
    } catch (err) {
      console.warn('[Orientation] Lock failed:', err.message);
      return false;
    }
  },

  isLandscape() {
    return window.innerWidth > window.innerHeight;
  }
};

// ==============================
// IMMERSIVE / FULLSCREEN INIT
// ==============================
async function initImmersiveMode() {
  // 1. Request fullscreen
  await FullscreenManager.request();

  // 2. Lock orientation (requires fullscreen on most Android)
  await OrientationManager.lockLandscape();

  // 3. Listen for fullscreen changes
  FullscreenManager.onChange(() => {
    if (!FullscreenManager.isFullscreen()) {
      console.log('[Fullscreen] Exited — re-requesting on next interaction');
    }
  });

  // 4. On Android Chrome: use screen.orientation.lock after fullscreen
  document.addEventListener('fullscreenchange', async () => {
    if (FullscreenManager.isFullscreen()) {
      await OrientationManager.lockLandscape();
    }
  });
}

// ==============================
// TOUCH TO FULLSCREEN
// ==============================
// Android requires user gesture to enter fullscreen
let fullscreenRequested = false;
document.addEventListener('touchstart', async () => {
  if (!fullscreenRequested && !FullscreenManager.isFullscreen()) {
    fullscreenRequested = true;
    await initImmersiveMode();
  }
}, { once: false });

document.addEventListener('click', async () => {
  if (!FullscreenManager.isFullscreen()) {
    await initImmersiveMode();
  }
}, { once: false });

// ==============================
// CANVAS RESIZE / RESPONSIVE
// ==============================
const canvas = document.getElementById('gameCanvas');
const TARGET_W = 2400;
const TARGET_H = 1080;

function resizeCanvas() {
  if (!canvas) return;

  const winW = window.innerWidth;
  const winH = window.innerHeight;

  canvas.width = winW;
  canvas.height = winH;

  // Optionally scale to fit target resolution
  const scaleX = winW / TARGET_W;
  const scaleY = winH / TARGET_H;
  const scale = Math.min(scaleX, scaleY);

  // Store scale for game to use
  window.gameScale = scale;
  window.gameOffsetX = (winW - TARGET_W * scale) / 2;
  window.gameOffsetY = (winH - TARGET_H * scale) / 2;

  // Notify game engine
  if (window.Game && typeof window.Game.onResize === 'function') {
    window.Game.onResize(winW, winH, scale);
  }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
  setTimeout(resizeCanvas, 300);
});

// ==============================
// PWA INSTALL PROMPT
// ==============================
let deferredPrompt = null;
const installBanner = document.getElementById('install-prompt');
const btnInstall = document.querySelector('.btn-install');
const btnDismiss = document.querySelector('.btn-dismiss');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[PWA] Install prompt captured');

  // Show banner after 3 seconds
  setTimeout(() => {
    if (installBanner) {
      installBanner.classList.add('show');
    }
  }, 3000);
});

if (btnInstall) {
  btnInstall.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    installBanner.classList.remove('show');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice:', outcome);
    deferredPrompt = null;
  });
}

if (btnDismiss) {
  btnDismiss.addEventListener('click', () => {
    installBanner.classList.remove('show');
  });
}

// Detect already installed
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed!');
  installBanner.classList.remove('show');
  deferredPrompt = null;
});

// ==============================
// DETECT PWA MODE (standalone)
// ==============================
function isRunningAsPWA() {
  return (
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// ==============================
// START SCREEN
// ==============================
function showStartScreen() {
  const startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.classList.remove('hidden');
}

const btnPlay = document.querySelector('.btn-play');
if (btnPlay) {
  btnPlay.addEventListener('click', async () => {
    await initImmersiveMode();
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.add('hidden');
    startGame();
  });
}

// ==============================
// GAME INIT PLACEHOLDER
// (Replace with your actual game logic)
// ==============================
function startGame() {
  console.log('[Game] Starting game...');
  resizeCanvas();

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // === YOUR GAME LOGIC GOES HERE ===
  // This is a placeholder animation loop
  let frame = 0;
  let playerX = canvas.width / 2;
  let playerY = canvas.height / 2;
  let hue = 0;

  function gameLoop() {
    frame++;
    hue = (hue + 0.5) % 360;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = `hsla(${hue}, 100%, 30%, 0.15)`;
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw player placeholder
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
    ctx.shadowBlur = 20;
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Move player in circle (demo)
    playerX = canvas.width / 2 + Math.sin(frame * 0.01) * 200;
    playerY = canvas.height / 2 + Math.cos(frame * 0.015) * 100;

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

// ==============================
// PREVENT CONTEXT MENU / GESTURES
// ==============================
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

// Prevent scroll on touchmove
document.addEventListener('touchmove', e => {
  if (e.target === document.body || e.target === canvas) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent double-tap zoom
let lastTap = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTap < 300) {
    e.preventDefault();
  }
  lastTap = now;
}, { passive: false });

// ==============================
// VISIBILITY API — Pause on hide
// ==============================
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('[Game] Tab hidden — pausing');
    if (window.Game && window.Game.pause) window.Game.pause();
  } else {
    console.log('[Game] Tab visible — resuming');
    if (window.Game && window.Game.resume) window.Game.resume();
    // Re-enter fullscreen if lost
    setTimeout(async () => {
      if (!FullscreenManager.isFullscreen() && isRunningAsPWA()) {
        await initImmersiveMode();
      }
    }, 500);
  }
});

// ==============================
// DOM READY — BOOT
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Budu.io] DOM ready');
  console.log('[PWA] Running as PWA:', isRunningAsPWA());
  console.log('[PWA] Landscape:', OrientationManager.isLandscape());

  resizeCanvas();
  simulateLoading();

  // If already in PWA/standalone mode, auto-fullscreen
  if (isRunningAsPWA()) {
    setTimeout(initImmersiveMode, 1000);
  }
});

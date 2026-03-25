import { auth , db} from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import "./subscription.js";
import SwayamSubscription from "./subscription.js";

SwayamSubscription.init();
/* ================================================
   SWAYAM — App Orchestration
   Splash → Auth → Dashboard Lifecycle
   Centralized Dynamic User Data
   ================================================ */

(function () {
  'use strict';

  // ── Centralized User Data ──
  const USER_KEY = 'swayam_user';

  function getUserData() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveUserData(data) {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }

  function clearAllData() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('swayam_resume_data');
    localStorage.removeItem('swayam_subscription');
    localStorage.removeItem('swayam_resume_count');
    localStorage.removeItem('swayam_resume_month');
    // Keep theme preference
  }

  function getInitials(name, email) {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  function getDisplayName(user) {
    if (user.displayName) return user.displayName;
    if (user.email) {
      const local = user.email.split('@')[0];
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return 'User';
  }

  // ── Populate All Dynamic Elements ──

  function populateUserEverywhere(userData) {
    if (!userData) return;

    const name = userData.name || 'User';
    const email = userData.email || '';
    const initials = getInitials(userData.name, userData.email);

    // 1. Dashboard greeting
    const greetingEl = document.getElementById('dashboard-greeting');
    if (greetingEl) {
      const firstName = name.split(' ')[0];
      greetingEl.textContent = `Welcome back, ${firstName} 👋`;
    }

    // 2. Topbar avatar initials
    const topbarAvatar = document.getElementById('topbar-avatar-initials');
    if (topbarAvatar) topbarAvatar.textContent = initials;

    // 3. All .avatar-initials and .avatar-initials-lg
    document.querySelectorAll('.avatar-initials, .avatar-initials-lg').forEach(el => {
      el.textContent = initials;
    });

    // 4. Profile dropdown
    const profileDropdownName = document.getElementById('profile-dropdown-name');
    const profileDropdownEmail = document.getElementById('profile-dropdown-email');
    const profileDropdownAvatar = document.getElementById('profile-dropdown-avatar');
    if (profileDropdownName) profileDropdownName.textContent = name;
    if (profileDropdownEmail) profileDropdownEmail.textContent = email;
    if (profileDropdownAvatar) profileDropdownAvatar.textContent = initials;

    // 5. Settings profile section
    const settingsAvatar = document.getElementById('settings-profile-avatar');
    const settingsName = document.getElementById('settings-profile-name');
    const settingsEmail = document.getElementById('settings-profile-email');
    const settingsInputName = document.getElementById('settings-input-name');
    const settingsInputEmail = document.getElementById('settings-input-email');
    if (settingsAvatar) settingsAvatar.textContent = initials;
    if (settingsName) settingsName.textContent = name;
    if (settingsEmail) settingsEmail.textContent = email;
    if (settingsInputName) settingsInputName.value = name;
    if (settingsInputEmail) settingsInputEmail.value = email;

    // 6. Leaderboard "You" row
    const lbYouAvatar = document.getElementById('lb-you-avatar');
    const lbYouName = document.getElementById('lb-you-name');
    if (lbYouAvatar) lbYouAvatar.textContent = initials;
    if (lbYouName) lbYouName.textContent = name.split(' ')[0];

    // 7. Profile name large (settings profile)
    const profileNameLg = document.getElementById('profile-name-lg');
    const profileEmailLg = document.getElementById('profile-email-lg');
    if (profileNameLg) profileNameLg.textContent = name;
    if (profileEmailLg) profileEmailLg.textContent = email;
  }

  // ── Splash Screen ──

  function runSplash(callback) {
    const splash = document.getElementById('cinematic-splash');
    const logo = document.getElementById('cs-logo');
    const sidebarLogo = document.getElementById('sidebar-logo');

    if (!splash) { callback(); return; }

    setTimeout(() => splash.classList.add('reveal-logo'), 300);
    setTimeout(() => splash.classList.add('reveal-text'), 1000);

    setTimeout(() => {
      splash.classList.add('fade-out');

      if (logo && sidebarLogo) {
        const srcRect = logo.getBoundingClientRect();
        const clone = logo.cloneNode(true);
        clone.className = 'cs-travelling-logo';
        clone.style.cssText = `
          top: ${srcRect.top}px; left: ${srcRect.left}px;
          width: ${srcRect.width}px; height: ${srcRect.height}px;
          border-radius: 24px;
        `;
        document.body.appendChild(clone);

        requestAnimationFrame(() => {
          const destRect = sidebarLogo.getBoundingClientRect();
          clone.style.top = destRect.top + 'px';
          clone.style.left = destRect.left + 'px';
          clone.style.width = destRect.width + 'px';
          clone.style.height = destRect.height + 'px';
          clone.style.borderRadius = '8px';
        });

        setTimeout(() => { clone.style.opacity = '0'; }, 900);
        setTimeout(() => { clone.remove(); }, 1200);
      }

      document.body.classList.remove('splash-active');

      setTimeout(() => {
        splash.style.display = 'none';
        callback();
      }, 1300);
    }, 2500);
  }

  // ── Dashboard Initialisation ──

  function initDashboard() {
    initSidebar();
    initThemeToggle();
    initStatCounters();
    initXPRing();
    initGoals();
    initChart();
    initBadges();
    initSlidePanel();
    initTrackProgressBars();
    initIntersectionAnimations();
    initNotificationDropdown();
    initProfileDropdown();
    initSettingsNav();
    initSettingsLogout();
    initSettingsSave();

    // Init Resume Builder if available
    if (typeof ResumeBuilder !== 'undefined') {
      ResumeBuilder.init();
    }

    // Init Subscription if available
    
  }
  window.addEventListener("DOMContentLoaded", () => {
  if (typeof SwayamSubscription !== 'undefined') {
    SwayamSubscription.init();
    console.log("Subscription system initialized ✅");
  } else {
    console.error("SwayamSubscription not loaded ❌");
  }
});
  // ── Sidebar Navigation ──

  function initSidebar() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const close = document.getElementById('sidebar-close');
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    const pages = document.querySelectorAll('.page');

    function toggleMobileSidebar(show) {
      sidebar?.classList.toggle('open', show);
      overlay?.classList.toggle('active', show);
    }

    hamburger?.addEventListener('click', () => toggleMobileSidebar(true));
    overlay?.addEventListener('click', () => toggleMobileSidebar(false));
    close?.addEventListener('click', () => toggleMobileSidebar(false));

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.page;

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        pages.forEach(p => {
          p.classList.remove('page-active');
          if (p.id === 'page-' + target) p.classList.add('page-active');
        });

        toggleMobileSidebar(false);
      });
    });
  }

  // ── Theme Toggle ──

  function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');

    const saved = localStorage.getItem('swayam_theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (icon) icon.textContent = 'light_mode';
    }

    btn?.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        if (icon) icon.textContent = 'dark_mode';
        localStorage.setItem('swayam_theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (icon) icon.textContent = 'light_mode';
        localStorage.setItem('swayam_theme', 'dark');
      }
    });
  }

  // ── Stat Counter Animations ──

  function initStatCounters() {
    const counters = document.querySelectorAll('.stat-value[data-count]');
    counters.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      animateCounter(el, target, 1200);
    });
  }

  function animateCounter(el, target, duration) {
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── XP Ring Animation ──

  function initXPRing() {
    const ring = document.getElementById('xp-ring-fill');
    const number = document.getElementById('xp-ring-number');
    if (!ring || !number) return;

    const currentXP = 2450;
    const maxXP = 3000;
    const pct = currentXP / maxXP;
    const circumference = 2 * Math.PI * 70;
    const offset = circumference * (1 - pct);

    setTimeout(() => {
      ring.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
      ring.style.strokeDashoffset = offset;
      animateCounter(number, currentXP, 1500);
    }, 400);
  }

  // ── Goals Progress ──

  function initGoals() {
    const fill = document.getElementById('goals-progress-fill');
    const goalChecks = document.querySelectorAll('.goal-check');
    if (!fill) return;

    function updateProgress() {
      const total = document.querySelectorAll('.goal-item').length;
      const done = document.querySelectorAll('.goal-item.completed').length;
      fill.style.width = ((done / total) * 100) + '%';

      const countEl = document.getElementById('goals-done-count');
      if (countEl) countEl.textContent = done;
    }

    updateProgress();

    goalChecks.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.goal-item');
        if (!item) return;
        const isCompleted = item.classList.toggle('completed');
        btn.classList.toggle('checked', isCompleted);

        const icon = btn.querySelector('.material-icons-round');
        if (icon) icon.textContent = isCompleted ? 'check_circle' : 'radio_button_unchecked';

        updateProgress();
      });
    });
  }

  // ── Learning Progress Chart ──

  function initChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 260);
    grad.addColorStop(0, 'rgba(59,130,246,0.25)');
    grad.addColorStop(1, 'rgba(59,130,246,0.01)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'XP Earned',
          data: [120, 200, 150, 300, 180, 250, 320],
          borderColor: '#3b82f6',
          backgroundColor: grad,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 12, family: 'Inter' } }
          },
          y: {
            grid: { color: 'rgba(148,163,184,0.1)' },
            ticks: { color: '#94a3b8', font: { size: 12, family: 'Inter' } }
          }
        },
        interaction: { mode: 'index', intersect: false },
      }
    });
  }

  // ── Badges Modal ──

  function initBadges() {
    const badges = document.querySelectorAll('.badge-item.unlocked');
    const modal = document.getElementById('achievement-modal');
    const closeBtn = document.getElementById('modal-close');

    const badgeData = {
      'quick-learner': { icon: 'speed', gradient: 'linear-gradient(135deg, #38bdf8, #2563eb)', title: 'Quick Learner', desc: 'Completed 5 quizzes in under 24 hours.', date: 'Earned Mar 15, 2026', xp: '+200 XP rewarded', rarity: 'Rare — Only 12% of users have this' },
      'code-ninja': { icon: 'code', gradient: 'linear-gradient(135deg, #a855f7, #ec4899)', title: 'Code Ninja', desc: 'Solved 50 coding challenges.', date: 'Earned Mar 12, 2026', xp: '+300 XP rewarded', rarity: 'Epic — Only 5% of users have this' },
      'team-player': { icon: 'groups', gradient: 'linear-gradient(135deg, #22c55e, #10b981)', title: 'Team Player', desc: 'Collaborated on 3 hackathons.', date: 'Earned Mar 8, 2026', xp: '+150 XP rewarded', rarity: 'Common — 35% of users have this' },
      'streak-master': { icon: 'local_fire_department', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', title: 'Streak Master', desc: 'Maintained a 7-day streak.', date: 'Earned Mar 5, 2026', xp: '+100 XP rewarded', rarity: 'Uncommon — 20% of users have this' },
      'first-hack': { icon: 'emoji_events', gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)', title: 'First Hack', desc: 'Participated in your first hackathon.', date: 'Earned Feb 28, 2026', xp: '+250 XP rewarded', rarity: 'Common — 40% of users have this' },
    };

    badges.forEach(badge => {
      badge.addEventListener('click', () => {
        const key = badge.dataset.badge;
        const data = badgeData[key];
        if (!data || !modal) return;

        const iconEl = document.getElementById('modal-badge-icon');
        if (iconEl) iconEl.innerHTML = `<div class="badge-icon" style="background:${data.gradient}; width:64px; height:64px; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto;"><span class="material-icons-round" style="font-size:32px; color:#fff;">${data.icon}</span></div>`;

        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.textContent = data.title;

        const descEl = document.getElementById('modal-description');
        if (descEl) descEl.textContent = data.desc;

        const dateEl = document.getElementById('modal-date');
        if (dateEl) dateEl.textContent = data.date;

        const xpEl = document.getElementById('modal-xp');
        if (xpEl) xpEl.textContent = data.xp;

        const rarityEl = document.getElementById('modal-rarity');
        if (rarityEl) rarityEl.innerHTML = `<span class="rarity-dot"></span> ${data.rarity}`;

        modal.classList.add('active');
      });
    });

    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
  }

  // ── Slide Panel ──

  function initSlidePanel() {
    const detailBtns = document.querySelectorAll('.card-detail-btn[data-panel]');
    const closeBtns = document.querySelectorAll('.slide-panel-close[data-close]');
    const overlay = document.getElementById('slide-panel-overlay');

    detailBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const panelId = btn.dataset.panel;
        const panel = document.getElementById(panelId);
        panel?.classList.add('active');
        overlay?.classList.add('active');
      });
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const panelId = btn.dataset.close;
        document.getElementById(panelId)?.classList.remove('active');
        overlay?.classList.remove('active');
      });
    });

    overlay?.addEventListener('click', () => {
      document.querySelectorAll('.slide-panel.active').forEach(p => p.classList.remove('active'));
      overlay.classList.remove('active');
    });
  }

  // ── Track Progress Bars ──

  function initTrackProgressBars() {
    const fills = document.querySelectorAll('.lt-progress-fill[data-width]');
    fills.forEach(fill => {
      const target = fill.dataset.width + '%';
      setTimeout(() => { fill.style.width = target; }, 600);
    });
  }

  // ── Intersection Observer Animations ──

  function initIntersectionAnimations() {
    const items = document.querySelectorAll('.slide-in-item');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), idx * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach(item => observer.observe(item));
  }

  // ── Notification Dropdown ──

  function initNotificationDropdown() {
    const btn = document.getElementById('notification-btn');
    const dropdown = document.getElementById('notif-dropdown');
    const wrapper = document.getElementById('notif-wrapper');
    const badge = document.getElementById('notif-badge');
    const markReadBtn = document.getElementById('notif-mark-read');

    if (!btn || !dropdown) return;

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('active');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('active');
      }
    });

    // Mark all read
    markReadBtn?.addEventListener('click', () => {
      const items = dropdown.querySelectorAll('.notif-item.unread');
      items.forEach(item => item.classList.remove('unread'));
      updateNotifBadge();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (wrapper && !wrapper.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    // Initial badge state
    updateNotifBadge();
  }

  function updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    const unreadCount = document.querySelectorAll('#notif-dropdown-body .notif-item.unread').length;
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // ── Profile Dropdown ──

  function initProfileDropdown() {
    const avatar = document.getElementById('user-avatar');
    const dropdown = document.getElementById('profile-dropdown');
    const wrapper = document.getElementById('avatar-wrapper');

    if (!avatar || !dropdown) return;

    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('active');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('active');
      }
    });

    // Handle menu items
    dropdown.querySelectorAll('.profile-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const action = item.dataset.action;
        dropdown.classList.remove('active');

        if (action === 'view-profile' || action === 'account-settings') {
          // Navigate to settings page
          navigateToPage('settings');
        } else if (action === 'logout') {
          performLogout();
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (wrapper && !wrapper.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  function closeAllDropdowns() {
    document.getElementById('notif-dropdown')?.classList.remove('active');
    document.getElementById('profile-dropdown')?.classList.remove('active');
  }

  function navigateToPage(pageName) {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(l => l.classList.remove('active'));
    const targetLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (targetLink) targetLink.classList.add('active');

    pages.forEach(p => {
      p.classList.remove('page-active');
      if (p.id === 'page-' + pageName) p.classList.add('page-active');
    });
  }

  // ── Settings Navigation ──

  function initSettingsNav() {
    const navItems = document.querySelectorAll('.s-nav-item[data-target]');
    const sections = document.querySelectorAll('.s-section');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const targetId = item.dataset.target;
        sections.forEach(sec => {
          sec.classList.remove('active');
          if (sec.id === targetId) sec.classList.add('active');
        });
      });
    });
  }

  // ── Settings Save ──

  function initSettingsSave() {
    const saveBtn = document.querySelector('.s-save-btn');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('settings-input-name');
      const phoneInput = document.getElementById('settings-input-phone');

      const userData = getUserData();
      if (userData && nameInput) {
        userData.name = nameInput.value.trim();
        if (phoneInput) userData.phone = phoneInput.value.trim();
        saveUserData(userData);
        populateUserEverywhere(userData);

        // Show success feedback
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #22c55e, #10b981)';
        setTimeout(() => {
          saveBtn.textContent = originalText;
          saveBtn.style.background = '';
        }, 2000);
      }
    });
  }

  // ── Logout System ──

  async function performLogout() {
    // Dispatch logout event for other modules
    window.dispatchEvent(new CustomEvent('swayam:logout'));

    // Clear all data
    clearAllData();

    // Sign out from Firebase
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }

    // Show auth screen
    document.body.classList.add('auth-active');
  }

  // ── Settings Page Logout Modal ──

  function initSettingsLogout() {
    const logoutModal = document.getElementById('s-logout-modal');
    const cancelBtns = document.querySelectorAll('.s-cancel-logout');
    const confirmBtns = document.querySelectorAll('.s-confirm-logout');
    const logoutTriggers = document.querySelectorAll('.s-logout-btn');

    // Show modal on logout button click
    logoutTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        logoutModal?.classList.add('active');
      });
    });

    cancelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        logoutModal?.classList.remove('active');
      });
    });

    confirmBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        logoutModal?.classList.remove('active');
        performLogout();
      });
    });

    // Sidebar logout button
    const sidebarLogout = document.getElementById('sidebar-logout-btn');
    if (sidebarLogout) {
      sidebarLogout.addEventListener('click', (e) => {
        e.preventDefault();
        performLogout();
      });
    }
  }

  // ── Boot Sequence ──

  document.addEventListener('DOMContentLoaded', () => {
    // Run splash
    runSplash(() => {
      console.log("Splash done");
    });
 async function loadPaymentHistory() {
  const user = auth.currentUser;
  if (!user) return;

  const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");

  const q = query(
    collection(db, "payments"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  const container = document.getElementById("payment-history");
  if (!container) return;

  container.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.innerHTML = `
      <div style="padding:10px; border-bottom:1px solid #eee;">
        <strong>${data.planName}</strong> - ₹${data.amount}
        <br/>
        Status: ${data.status}
      </div>
    `;

    container.appendChild(div);
  });
}
    // Firebase auth check
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user.email);

        // Build user data object
        const displayName = getDisplayName(user);
        const userData = {
          name: displayName,
          email: user.email || '',
          uid: user.uid,
          photo: user.photoURL || null
        };

        // Merge with any previously saved data (preserve phone etc.)
        const existing = getUserData();
        if (existing) {
          userData.name = existing.name || userData.name;
          userData.phone = existing.phone || '';
        }

        // Save to localStorage
        saveUserData(userData);

        // Remove auth screen
        document.body.classList.remove('auth-active');

        // Populate user data everywhere
        populateUserEverywhere(userData);

        // Init dashboard
        initDashboard();
        loadPaymentHistory();
      } else {
        document.body.classList.add('auth-active');
      }
    });
  });

})()

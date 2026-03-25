import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase instances
import { auth, db } from "./firebase.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// ── Helper: Save user to localStorage ──
function saveUserToLocal(user) {
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const userData = {
    name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    email: user.email || '',
    uid: user.uid,
    photo: user.photoURL || null
  };
  localStorage.setItem('swayam_user', JSON.stringify(userData));
  return userData;
}

// ── Helper: Show auth message ──
function showAuthMessage(elementId, message, isError = true) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.className = `auth-message ${isError ? 'auth-error' : 'auth-success'}`;
    el.style.display = 'block';
    // Shake on error
    if (isError) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'authMsgShake 0.4s ease';
    }
    // Auto-hide after 5s
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }
}

// ================= SIGN UP =================
document.getElementById("auth-signup-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (!email || !password || !confirm) {
    showAuthMessage('signup-message', 'Please fill all fields');
    return;
  }

  if (password !== confirm) {
    showAuthMessage('signup-message', 'Passwords do not match');
    return;
  }

  if (password.length < 6) {
    showAuthMessage('signup-message', 'Password must be at least 6 characters');
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Save user in Firestore
   await setDoc(doc(db, "users", userCred.user.uid), {
  email: userCred.user.email,
  name: userCred.user.email.split('@')[0],
  photo: null,
  skills: [],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

    // Save to localStorage
    saveUserToLocal(userCred.user);

    showAuthMessage('signup-message', 'Account created successfully! ✅', false);
  } catch (error) {
    let msg = error.message;
    if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered. Try logging in.';
    else if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
    else if (error.code === 'auth/weak-password') msg = 'Password is too weak.';
    showAuthMessage('signup-message', msg);
  }
});

// ================= LOGIN =================
document.getElementById("auth-login-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showAuthMessage('login-message', 'Please fill all fields');
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    saveUserToLocal(userCred.user);
    showAuthMessage('login-message', 'Login successful! ✅', false);
  } catch (error) {
    let msg = error.message;
    if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
    else if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
    else if (error.code === 'auth/invalid-credential') msg = 'Invalid credentials. Please check your email and password.';
    showAuthMessage('login-message', msg);
  }
});

// ================= GOOGLE AUTH =================
document.getElementById("google-signup-btn")?.addEventListener("click", googleAuth);
document.getElementById("google-login-btn")?.addEventListener("click", googleAuth);

async function googleAuth() {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    await setDoc(doc(db, "users", result.user.uid), {
      email: result.user.email,
      name: result.user.displayName,
      photo: result.user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    saveUserToLocal(result.user);
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      showAuthMessage('signup-message', error.message);
    }
  }
}

// ================= GITHUB AUTH =================
document.getElementById("github-signup-btn")?.addEventListener("click", githubAuth);
document.getElementById("github-login-btn")?.addEventListener("click", githubAuth);

async function githubAuth() {
  try {
    const result = await signInWithPopup(auth, githubProvider);

    await setDoc(doc(db, "users", result.user.uid), {
      email: result.user.email,
      name: result.user.displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    saveUserToLocal(result.user);
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      showAuthMessage('signup-message', error.message);
    }
  }
}

// ================= AUTH FORM SWITCHES =================
document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  const card = document.getElementById('auth-card');
  if (card) card.dataset.mode = 'login';
});

document.getElementById('switch-to-signup')?.addEventListener('click', (e) => {
  e.preventDefault();
  const card = document.getElementById('auth-card');
  if (card) card.dataset.mode = 'signup';
});
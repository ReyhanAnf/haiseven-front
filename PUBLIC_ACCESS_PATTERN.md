# 🌐 Public-View, Login-to-Save Pattern

## Overview
Strategi akses baru untuk HaiSeven: **"Try for Free, Login to Save"**

Semua tools sekarang **PUBLIK** dan bisa dicoba tanpa registrasi. User hanya diminta login ketika ingin **menyimpan progress**.

---

## 🎯 User Story

> "Sebagai pengunjung baru, saya ingin bisa mencoba semua tools (seperti Daily Focus, Pattern Play, Thought Canvas) tanpa harus mendaftar. Saya hanya akan diminta login/register jika saya ingin menyimpan progres atau hasil pekerjaan saya."

---

## 🏗️ Architecture

### 1. Global Auth Store (`app/store/auth.ts`)

```typescript
type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoginModalOpen: boolean;
  loginModalMessage: string | null;
  showLoginModal: (message?: string) => void;
  hideLoginModal: () => void;
  // ... other auth methods
}
```

**Key Features:**
- `isLoginModalOpen`: Controls global login modal visibility
- `loginModalMessage`: Custom message shown in modal
- `showLoginModal(message?)`: Trigger modal from anywhere
- `hideLoginModal()`: Close modal

---

### 2. Global Login Modal (`app/components/auth/LoginModal.tsx`)

**Features:**
- ✅ Appears globally (added to root layout)
- ✅ Tab switching: Login ↔ Register
- ✅ Custom message support
- ✅ Framer Motion animations
- ✅ Web3 Gradient Minimalism theme
- ✅ Auto-close on successful auth

**Usage:**
```tsx
import { useAuthStore } from "@/app/store/auth";

const { showLoginModal } = useAuthStore();

showLoginModal("Login untuk menyimpan Daily Focus Anda!");
```

---

## 🔧 Implementation Pattern

### Standard "Login to Save" Pattern

Apply this pattern to **ALL save buttons** across the app:

```tsx
"use client";

import { useAuthStore } from "../store/auth";
import { useAuth } from "../hooks/useAuth";

export default function FeaturePage() {
  const { token } = useAuth();
  const { user, showLoginModal } = useAuthStore();
  const [data, setData] = useState([]);

  // ✅ Load user's saved data if logged in
  useEffect(() => {
    if (!user || !token) return; // Skip if not logged in

    // Load saved data from API
    fetchSavedData();
  }, [user, token]);

  const handleSave = async () => {
    // 🔑 LOGIN TO SAVE PATTERN
    if (!user || !token) {
      showLoginModal("Login untuk menyimpan progress Anda!");
      return; // Stop here, don't call API
    }

    // User is logged in, proceed with save
    try {
      await fetch(`${API_BASE}/api/feature`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {/* Tools UI - Always visible, even without login */}
      <button onClick={handleSave}>
        Simpan {/* Will trigger login modal if not logged in */}
      </button>
    </div>
  );
}
```

---

## 📝 Checklist: Converting a Page to Public Access

### 1. **Remove Route Protection**
```diff
- useEffect(() => {
-   if (!token) {
-     router.replace("/login");
-     return;
-   }
- }, [token]);
```

### 2. **Import Auth Store**
```diff
+ import { useAuthStore } from "../store/auth";

  export default function FeaturePage() {
    const { token } = useAuth();
+   const { user, showLoginModal } = useAuthStore();
```

### 3. **Make Data Loading Conditional**
```diff
  useEffect(() => {
+   if (!user || !token) return; // Only load if logged in
+
    // Load saved data
    fetchSavedData();
- }, [token]);
+ }, [user, token]);
```

### 4. **Add Login Check to Save Button**
```diff
  const handleSave = async () => {
+   // 🔑 LOGIN TO SAVE PATTERN
+   if (!user || !token) {
+     showLoginModal("Login untuk menyimpan progress Anda!");
+     return;
+   }
+
    // Proceed with save...
  };
```

### 5. **Remove "return null" Guards**
```diff
- if (!token) return null;
-
  return (
    <div>
      {/* Page content */}
    </div>
  );
```

---

## 🎨 Features to Apply This Pattern

### ✅ Already Implemented:
- [x] Daily Focus (`/app/focus/page.tsx`)

### 🔄 To Be Implemented:
- [ ] Gratitude Jar (`/app/gratitude/page.tsx`)
- [ ] Morning Page (`/app/morning-page/page.tsx`)
- [ ] Decision Maker (`/app/decision/page.tsx`)
- [ ] Affirmation (`/app/affirmation/page.tsx`)
- [ ] Thought Canvas (`/app/canvas/[mapId]/page.tsx`)
- [ ] Brain Warmup / Pattern Play (if exists)

### 🔒 Keep Protected:
- Dashboard (`/app/dashboard`) - Personal summary page
- Profile (`/app/profile`) - Account settings
- History pages (Optional: Could be public but show empty state)

---

## 🛡️ Backend Security

**IMPORTANT:** Backend remains unchanged!

All save endpoints **MUST** stay protected with `auth:sanctum` middleware:

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/focus', [FocusController::class, 'store']);
    Route::post('/gratitude', [GratitudeController::class, 'store']);
    Route::post('/morning-page', [MorningPageController::class, 'store']);
    // ... all other save endpoints
});
```

This is our **safety net**. Frontend checks are UX optimization, but backend auth is the real protection.

---

## 🎯 Benefits

1. **Lower Barrier to Entry**: Users can try before committing
2. **Better Conversion**: Experience the value before signing up
3. **Cleaner UX**: No forced redirects to login
4. **Trust Building**: Transparency about what requires account
5. **SEO Friendly**: Public pages can be indexed

---

## 🚨 Important Notes

1. **Always check `user` AND `token`**: Both must be present
2. **Use custom messages**: Make login prompts contextual
3. **Don't call API without auth**: Frontend should block, backend will reject
4. **Show value first**: Let users interact before asking to save
5. **Graceful degradation**: Features work without login, just can't persist

---

## 📱 Example Messages for Different Features

```typescript
// Daily Focus
showLoginModal("Login untuk menyimpan Daily Focus Anda dan lacak progress Anda!");

// Gratitude Jar
showLoginModal("Login untuk menyimpan momen syukur Anda ke Toples Syukur!");

// Morning Page
showLoginModal("Login untuk menyimpan Morning Page Anda dan buat kebiasaan menulis!");

// Decision Maker
showLoginModal("Login untuk menyimpan keputusan Anda dan lihat riwayat analisis!");

// Thought Canvas
showLoginModal("Login untuk menyimpan Thought Map Anda dan akses dari mana saja!");
```

---

## 🔄 Migration Status

| Feature | Status | Notes |
|---------|--------|-------|
| Focus | ✅ Done | Reference implementation - 3 priorities/day |
| Gratitude | ✅ Done | Login to save gratitude entries |
| Morning Page | ✅ Done | Timer works for all, login to save |
| Decision | ✅ Done | Create/Edit/Delete with login-to-save |
| Affirmation | ✅ Done | Public (read-only, no save needed) |
| Brain Warmup | ✅ Done | Play as guest, login to save scores |
| Canvas | ✅ Done | Login to create/save thought maps |
| Mental Unload | 🚫 Not Created | TBD - Will need pattern when built |
| Morning Muse | 🚫 Not Created | TBD - Will need pattern when built |
| Dashboard | 🔒 Keep Protected | Personal summary page |
| Profile | 🔒 Keep Protected | Account settings |
| History Pages | 🔒 Keep Protected | User-specific data |

---

**Last Updated:** 2025-01-XX
**Pattern Version:** 1.0.0
**Completion:** 7/9 feature pages migrated (78% complete)

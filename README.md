# 🥗 Nutri-Lens

> AI-powered nutrition companion — snap a photo and instantly know what's on your plate.

---

## ✨ Features

- 🔐 **Google OAuth** sign-in (no passwords)
- 👤 **Netflix-style profile selector** — up to 5 nutrition profiles per account
- 📸 **Food scanning** — upload or capture a meal photo for instant analysis
- 📊 **Macro tracking** — calories, protein, carbs, fat
- 📋 **History** — review past scans and trends
- 💾 **Persistent profiles** — stored in `localStorage` per Google account

---

## 🚀 Quick Start

### 1. Clone and set up

```bash
git clone <your-repo-url>
cd Nutri-Lens
bash setup.sh
```

`setup.sh` will:
- ✅ Check your Node.js version (18+ required)
- 📦 Run `npm install`
- ⚠️ Warn you if `.env.local` is missing or unconfigured

### 2. Configure Google OAuth

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create a **Web application** OAuth 2.0 Client ID
3. Add `http://localhost:5173` as an **Authorised JavaScript Origin**
4. Copy the Client ID and open `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Start the dev server

```bash
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 🗂 Project Structure

```
src/
├── context/
│   ├── authContext.ts      # Types, AuthContext object
│   ├── AuthContext.tsx     # AuthProvider component
│   └── useAuth.ts          # useAuth hook
├── components/
│   ├── ProtectedRoute.tsx  # Redirects to /login if unauthenticated
│   └── ProfileGuard.tsx    # Redirects to /profile-select if no active profile
├── layouts/
│   └── RootLayout.tsx      # Navbar + page outlet
├── pages/
│   ├── Login.tsx           # Google sign-in page
│   ├── ProfileSelector.tsx # Netflix-style profile picker
│   ├── UserProfile.tsx     # Create new nutrition profile (form)
│   ├── Home.tsx
│   ├── Scan.tsx
│   ├── History.tsx
│   └── Profile.tsx
└── index.css
```

---

## 🔀 Navigation Flow

```
/login  →  /profile-select  →  /home
                ↑
        (Switch Profile)
```

- `/login` — public, Google OAuth
- `/profile-select` — protected, Netflix-style profile picker
- `/create-profile` — protected, new profile form
- `/home`, `/scan`, `/history`, `/profile` — protected + requires active profile

---

## 🛠 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at http://localhost:5173 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `bash setup.sh` | First-time setup helper |

---

## ⚙️ Environment Variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |

Copy `.env.example` → `.env.local` and fill in your value.

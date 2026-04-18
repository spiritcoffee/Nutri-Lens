import { GoogleOAuthProvider } from '@react-oauth/google';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileGuard from './components/ProfileGuard';
import RootLayout from './layouts/RootLayout';
import Login from './pages/Login';
import ProfileSelector from './pages/ProfileSelector';
import UserProfile from './pages/UserProfile';
import Home from './pages/Home';
import Scan from './pages/Scan';
import History from './pages/History';
import Profile from './pages/Profile';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

/* ── Missing env guard — shown instead of a white crash screen ──────── */
if (!CLIENT_ID) {
  document.body.innerHTML = `
    <div style="
      min-height:100vh; background:#070a0e; color:#f1f5f9;
      font-family:system-ui,sans-serif; display:flex; align-items:center;
      justify-content:center; padding:2rem;
    ">
      <div style="max-width:480px; width:100%;">
        <div style="font-size:3rem; margin-bottom:1.5rem;">⚙️</div>
        <h1 style="font-size:1.5rem; font-weight:900; color:#fff; margin:0 0 0.5rem">
          Setup required
        </h1>
        <p style="color:#6b7280; font-size:0.9rem; margin:0 0 1.5rem; line-height:1.6">
          <code style="color:#10b981">VITE_GOOGLE_CLIENT_ID</code> is not set.<br/>
          Create a <code style="color:#10b981">.env.local</code> file in the project root:
        </p>
        <pre style="
          background:#111820; border:1px solid #1f2937; border-radius:12px;
          padding:1rem 1.25rem; font-size:0.82rem; color:#34d399;
          margin:0 0 1.5rem; overflow-x:auto;
        ">VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</pre>
        <p style="color:#6b7280; font-size:0.82rem; margin:0 0 1rem">
          👉 Get a Client ID from
          <a href="https://console.cloud.google.com/apis/credentials"
            target="_blank" rel="noreferrer"
            style="color:#10b981; text-decoration:none; margin-left:4px">
            Google Cloud Console → Credentials
          </a>
        </p>
        <p style="color:#374151; font-size:0.78rem">
          Then restart the dev server: <code style="color:#6b7280">npm run dev</code>
        </p>
      </div>
    </div>
  `;
  // Stop React from mounting — throw stops execution of this module
  throw new Error('[Nutri-Lens] VITE_GOOGLE_CLIENT_ID is not set in .env.local');
}

/* ── Router ─────────────────────────────────────────────────────────── */
const router = createBrowserRouter([
  /* Public */
  { path: '/login', element: <Login /> },

  /* Protected — must be authenticated */
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/profile-select', element: <ProfileSelector /> },
      { path: '/create-profile', element: <UserProfile /> },

      /* Main app — also requires an active profile */
      {
        element: <ProfileGuard />,
        children: [
          {
            path: '/',
            element: <RootLayout />,
            children: [
              { index: true, element: <Navigate to="/home" replace /> },
              { path: 'home',    element: <Home />    },
              { path: 'scan',    element: <Scan />    },
              { path: 'history', element: <History /> },
              { path: 'profile', element: <Profile /> },
            ],
          },
        ],
      },
    ],
  },
]);

const App = () => (
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default App;

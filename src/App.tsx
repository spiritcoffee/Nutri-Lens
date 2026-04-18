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

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

const router = createBrowserRouter([
  /* ── Public ─────────────────────────────────────────────────────── */
  { path: '/login', element: <Login /> },

  /* ── Protected (must be logged in) ─────────────────────────────── */
  {
    element: <ProtectedRoute />,
    children: [
      /* Profile selector — no navbar, full-screen */
      { path: '/profile-select', element: <ProfileSelector /> },

      /* Create profile form — no navbar */
      { path: '/create-profile', element: <UserProfile /> },

      /* Main app — requires an active profile selected */
      {
        element: <ProfileGuard />,
        children: [
          {
            path: '/',
            element: <RootLayout />,
            children: [
              { index: true, element: <Navigate to="/home" replace /> },
              { path: 'home',    element: <Home /> },
              { path: 'scan',    element: <Scan /> },
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

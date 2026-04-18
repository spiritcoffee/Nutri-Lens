import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/useAuth';
import type { GoogleUser } from '../context/authContext';

/* Google brand colours */
const GOOGLE_BLUE = '#4285F4';

/* ── Decorative background blob ─────────────────────────────────────── */
const Blob = ({
  className,
}: {
  className: string;
}) => (
  <div
    className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
  />
);

/* ── Feature pill ───────────────────────────────────────────────────── */
const Pill = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center gap-2 rounded-full border border-green-800/60 bg-green-950/40 px-4 py-2 text-sm text-green-300">
    <span>{icon}</span>
    <span>{text}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /* If already logged in, go to profile selector */
  useEffect(() => {
    if (isAuthenticated) navigate('/profile-select', { replace: true });
  }, [isAuthenticated, navigate]);

  /* Fetch the user's profile info using the access token */
  const fetchUserInfo = async (accessToken: string): Promise<GoogleUser> => {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user info');
    return res.json() as Promise<GoogleUser>;
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetchUserInfo(tokenResponse.access_token);
        login(userInfo);
        navigate('/profile-select', { replace: true });
      } catch (err) {
        console.error('Login failed:', err);
      }
    },
    onError: (err) => console.error('Google OAuth error:', err),
  });

  return (
    <div className="relative min-h-screen bg-gray-950 flex items-center justify-center overflow-hidden px-4">
      {/* ── Ambient blobs ──────────────────────────────────────────── */}
      <Blob className="w-96 h-96 bg-green-600 -top-24 -left-24" />
      <Blob className="w-80 h-80 bg-emerald-500 bottom-0 right-0" />
      <Blob className="w-64 h-64 bg-teal-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* ── Card ───────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm rounded-3xl border border-gray-800 bg-gray-900/70 backdrop-blur-xl p-10 shadow-2xl shadow-black/60 flex flex-col items-center gap-7">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/30 shadow-lg shadow-green-900/30">
            <span className="text-5xl">🥗</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Nutri-Lens
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Your AI nutrition companion
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <Pill icon="📸" text="Snap & Analyse" />
          <Pill icon="📊" text="Track Macros" />
          <Pill icon="🎯" text="Hit Your Goals" />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-white font-semibold text-lg">Get started for free</p>
          <p className="text-gray-500 text-xs">
            Sign in with your Google account. No password needed.
          </p>
        </div>

        {/* Google Sign-In button */}
        <button
          id="btn-google-login"
          onClick={() => googleLogin()}
          className="group flex items-center justify-center gap-3 w-full rounded-xl border border-gray-700 bg-white hover:bg-gray-50 active:scale-[0.98] px-5 py-3.5 text-gray-800 font-semibold text-sm transition-all duration-200 shadow-lg shadow-black/20 cursor-pointer"
        >
          {/* Google SVG logo */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          <span style={{ color: GOOGLE_BLUE }}>Continue with Google</span>
        </button>

        {/* Footer note */}
        <p className="text-gray-600 text-xs text-center leading-relaxed">
          By continuing, you agree to our{' '}
          <span className="text-green-600 cursor-pointer hover:underline">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-green-600 cursor-pointer hover:underline">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;

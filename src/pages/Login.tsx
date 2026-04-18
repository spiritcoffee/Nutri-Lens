import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/useAuth';
import type { GoogleUser } from '../context/authContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/profile-select', { replace: true });
  }, [isAuthenticated, navigate]);

  const fetchUserInfo = async (token: string): Promise<GoogleUser> => {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Failed to fetch user info');
    return r.json() as Promise<GoogleUser>;
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try { const u = await fetchUserInfo(access_token); login(u); navigate('/profile-select', { replace: true }); }
      catch (e) { console.error(e); }
    },
    onError: console.error,
  });

  const features = [
    { icon: '🧠', title: 'AI Ingredient Detection', desc: 'Upload a food photo — MobileNet identifies ingredients instantly' },
    { icon: '👥', title: 'Multi-Profile Tracking',  desc: 'Track nutrition for the whole family simultaneously'            },
    { icon: '🌶️', title: 'Built for Indian Cuisine', desc: '16 masalas, pantry staples, regional recipes'                  },
    { icon: '📊', title: 'Personalised Insights',   desc: 'BMI, TDEE, macro targets tailored to each person'              },
  ];

  return (
    <div className="min-h-screen bg-[#070a0e] flex overflow-hidden">

      {/* ══ LEFT PANEL — Hero image ══════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col overflow-hidden">
        <img src="/hero-food.png" alt="Indian food spread"
          className="absolute inset-0 w-full h-full object-cover object-center" />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-[#070a0e]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a0e] via-transparent to-black/20" />

        {/* Brand over image */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Nutri-Lens Logo" className="w-10 h-10 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl" />
            <span className="text-2xl font-black text-white tracking-tight">Nutri-Lens</span>
          </div>
        </div>

        {/* Feature cards at bottom */}
        <div className="relative z-10 mt-auto p-10 space-y-3">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] mb-4">
            Everything you need
          </p>
          {features.map(({ icon, title, desc }) => (
            <div key={title}
              className="flex items-start gap-4 glass rounded-2xl px-5 py-3.5 max-w-sm">
              <span className="text-2xl mt-0.5">{icon}</span>
              <div>
                <p className="text-white text-sm font-bold">{title}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL — Sign in form ═══════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 relative">

        {/* Mobile bg */}
        <div className="lg:hidden absolute inset-0">
          <img src="/hero-food.png" alt="" className="w-full h-full object-cover opacity-[0.07]" />
        </div>

        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-600/8 blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-[400px]">

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 rounded-[26px] mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center bg-black/20 backdrop-blur-sm border border-emerald-500/25 p-2 pulse-green glow-green">
              <img src="/logo.png" alt="Nutri-Lens Logo" className="w-full h-full object-cover rounded-[18px]" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-2 text-center">
              AI-powered nutrition for Indian cuisine
            </p>
          </div>

          {/* Card */}
          <div className="glass rounded-3xl p-8 space-y-6">
            <div>
              <p className="text-white font-bold text-lg">Get started free</p>
              <p className="text-gray-600 text-sm mt-1">No password needed — sign in with Google</p>
            </div>

            {/* Google Btn */}
            <button id="btn-google-login" onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white
                hover:bg-gray-50 active:scale-[0.98] px-5 py-3.5 text-gray-800
                font-semibold text-sm transition-all duration-200 shadow-xl shadow-black/40 cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-gray-700 text-xs">or</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            {/* Feature chips — mobile */}
            <div className="flex flex-wrap gap-2">
              {['📸 Snap & Analyse','📊 Track Macros','🎯 Goal Setting'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-medium
                  bg-emerald-900/30 border border-emerald-700/30 text-emerald-400">
                  {t}
                </span>
              ))}
            </div>

            <p className="text-gray-700 text-xs text-center">
              By continuing you agree to our{' '}
              <span className="text-emerald-600 hover:underline cursor-pointer">Terms</span>{' '}
              &amp;{' '}
              <span className="text-emerald-600 hover:underline cursor-pointer">Privacy</span>
            </p>
          </div>

          {/* Spices teaser bottom */}
          <div className="mt-6 rounded-2xl overflow-hidden relative h-28">
            <img src="/spices-bg.png" alt="spices" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070a0e]/80 to-transparent flex items-center px-5">
              <p className="text-white text-sm font-bold leading-snug">
                16 masalas & pantry staples<br/>
                <span className="text-emerald-400 font-normal text-xs">Built for Indian kitchens</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

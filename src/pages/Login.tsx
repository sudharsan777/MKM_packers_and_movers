import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getAuthErrorMessage } from '../store/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Truck,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  HelpCircle,
  X,
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, resetPassword, loading, isAuthEnabled } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // If user is already authenticated, redirect to /dashboard or previous page
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || '';
      const friendlyMsg = code ? getAuthErrorMessage(code) : err?.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);

    if (!resetEmail.trim()) {
      setResetStatus('error');
      setResetMessage('Please provide your registered email address.');
      return;
    }

    setResetStatus('submitting');
    try {
      await resetPassword(resetEmail);
      setResetStatus('success');
      setResetMessage(`Password reset link has been sent to ${resetEmail.trim()}. Please check your inbox and spam folder.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      const code = err?.code || '';
      const friendlyMsg = code ? getAuthErrorMessage(code) : err?.message || 'Failed to send password reset email. Please verify the email address.';
      setResetStatus('error');
      setResetMessage(friendlyMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Header */}
      <header className="px-6 py-5 flex items-center justify-between z-10 border-b border-slate-800/40 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="MKM Packers & Movers Logo"
            className="w-9 h-9 rounded-full object-cover shadow-md ring-2 ring-amber-400/90 bg-white shrink-0"
          />
          <div>
            <span className="text-xs font-black tracking-widest text-white uppercase block">
              MKM PACKERS & MOVERS
            </span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              Enterprise Operations
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>Support: <strong className="text-slate-200">09840546766</strong></span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-[#0D1322]/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
            {/* Top Gold Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-amber-400" />

            {/* Header / Brand Title */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner mb-1">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Operations Sign In
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Secure access for MKM Packers & Movers dispatch, billing, quotes, and logistics.
              </p>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Registered Email Address <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@mkmpackers.com"
                    autoComplete="email"
                    required
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 font-medium focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Password <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetStatus('idle');
                      setResetMessage(null);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    autoComplete="current-password"
                    required
                    className="w-full h-11 pl-10 pr-11 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 font-medium focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted Firebase Authentication</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800/40 bg-slate-950/40">
        <p>© {new Date().getFullYear()} MKM Packers & Movers. Enterprise Logistics System. All rights reserved.</p>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-white">Reset Password</h2>
              <p className="text-xs text-slate-400">
                Enter your account email to receive a password reset link from Firebase.
              </p>
            </div>

            {resetStatus === 'success' ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{resetMessage}</span>
                </div>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full h-9.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                {resetStatus === 'error' && resetMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{resetMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@mkmpackers.com"
                    required
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 h-9 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetStatus === 'submitting'}
                    className="px-4 h-9 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl cursor-pointer disabled:opacity-60"
                  >
                    {resetStatus === 'submitting' ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

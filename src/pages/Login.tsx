import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getAuthErrorMessage } from '../store/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  HelpCircle,
  X,
  Truck,
  Building2,
  FileCheck2,
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, resetPassword, loading } = useAuth();

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

  // If user is already authenticated, redirect to /invoices
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || '/invoices';
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
      const from = (location.state as any)?.from?.pathname || '/invoices';
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row selection:bg-slate-900 selection:text-white">
      {/* Left Column: Luxury Enterprise Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B0F19] text-white p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Subtle Ambient Lighting */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Info */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="MKM Packers and Movers"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400/90 bg-white shadow-md"
          />
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white uppercase">
              MKM PACKERS & MOVERS
            </h1>
            <p className="text-[11px] text-amber-400 font-semibold tracking-wider uppercase">
              Enterprise Logistics Platform
            </p>
          </div>
        </div>

        {/* Central Editorial Content */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Operations Access</span>
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Precision Logistics & Financial Operations
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Manage nationwide relocations, client contracts, GST invoices, and fleet assignments with end-to-end cloud precision.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Move Orders</span>
              </div>
              <p className="text-xs text-slate-400 font-normal">Real-time crew & vehicle dispatch tracking.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>GST Invoicing</span>
              </div>
              <p className="text-xs text-slate-400 font-normal">Instant compliant PDF generation & ledger reconciliation.</p>
            </div>
          </div>
        </div>

        {/* Bottom Support Info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          <span>Enterprise Support: 09840546766</span>
          <span>© {new Date().getFullYear()} MKM Packers & Movers</span>
        </div>
      </div>

      {/* Right Column: Sign In Form (Responsive on all screens) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Mobile Brand Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="MKM Packers and Movers"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-500 bg-white"
            />
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-900 uppercase block">
                MKM PACKERS & MOVERS
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase block">
                Enterprise Logistics
              </span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Sign in to Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your authorized email and password to access the dispatch portal.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4.5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mkmpackers.com"
                  autoComplete="email"
                  required
                  className="w-full h-10.5 pl-10 pr-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all shadow-subtle"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetStatus('idle');
                    setResetMessage(null);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  required
                  className="w-full h-10.5 pl-10 pr-11 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all shadow-subtle"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs rounded-xl shadow-subtle transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Cloud Session via Firebase Auth</span>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden text-center text-xs text-slate-400 pt-6">
          <span>© {new Date().getFullYear()} MKM Packers & Movers</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-modal p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1.5 mb-5">
              <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your registered operational email address to receive password reset instructions.
              </p>
            </div>

            {resetStatus === 'success' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{resetMessage}</span>
                </div>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full h-9.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {resetStatus === 'error' && resetMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{resetMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@mkmpackers.com"
                    required
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 h-9 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetStatus === 'submitting'}
                    className="px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-50"
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

import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles, Scissors, AlertCircle } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google authentication encountered an issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegister) {
        await registerWithEmail(email, password, name || 'CustomFit Client');
      } else {
        await loginWithEmail(email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#141215] border border-[#352e39] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#29222c] flex items-center justify-between bg-[#171419]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7a152d] to-[#c9365e] flex items-center justify-center text-[#fbf9f6] shadow-sm">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-fashion text-xl font-bold text-[#fbf9f6] tracking-wide">
                CustomFit Atelier Portal
              </h3>
              <p className="text-[11px] text-[#8c8588]">
                Access your bespoke designs, measurement profiles & orders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c8588] hover:text-[#fbf9f6] hover:bg-[#231e26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#29222c] bg-[#110f13]">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(null); }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              !isRegister
                ? 'border-[#c9365e] text-[#fbf9f6] bg-[#1a171d]'
                : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(null); }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              isRegister
                ? 'border-[#c9365e] text-[#fbf9f6] bg-[#1a171d]'
                : 'border-transparent text-[#8c8588] hover:text-[#dfd8cb]'
            }`}
          >
            Create Atelier Account
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1e1b21] hover:bg-[#28242c] text-[#fbf9f6] border border-[#38303d] text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-[#29222c]" />
            <span className="px-3 text-[11px] text-[#8c8588] uppercase tracking-wider">or with credentials</span>
            <div className="flex-1 border-t border-[#29222c]" />
          </div>

          {/* Email / Pass Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs text-[#8c8588] block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8c8588] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Eleanor Vance"
                    className="w-full bg-[#171518] border border-[#2d2630] rounded-xl pl-9 pr-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-[#8c8588] block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8c8588] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@couture.com"
                  className="w-full bg-[#171518] border border-[#2d2630] rounded-xl pl-9 pr-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#8c8588] block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8c8588] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#171518] border border-[#2d2630] rounded-xl pl-9 pr-3 py-2 text-xs text-[#fbf9f6] focus:outline-none focus:border-[#c9365e]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7a152d] to-[#9e1d3d] hover:from-[#8d1834] hover:to-[#b32145] text-[#fbf9f6] text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : (isRegister ? 'Register Atelier Account' : 'Sign In')}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

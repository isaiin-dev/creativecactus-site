import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, Loader2, AlertCircle, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { login, resetPassword } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const [form, setForm] = React.useState<LoginForm>({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginAttempts, setLoginAttempts] = React.useState(0);
  const [isLocked, setIsLocked] = React.useState(false);
  const [lockTimer, setLockTimer] = React.useState(0);
  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCK_DURATION = 300; // 5 minutes in seconds

  React.useEffect(() => {
    let interval: number;
    if (isLocked && lockTimer > 0) {
      interval = window.setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!form.email) {
      newErrors.email = t('admin.login.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('admin.login.errors.emailInvalid');
    }

    if (!form.password) {
      newErrors.password = t('admin.login.errors.passwordRequired');
    } else if (form.password.length < 8) {
      newErrors.password = t('admin.login.errors.passwordLength');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = t('admin.login.errors.passwordComplexity');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const handleResetPassword = async () => {
    if (!form.email) {
      setErrors(prev => ({
        ...prev,
        email: t('admin.login.errors.emailRequired')
      }));
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(form.email);
      // Show success message
      alert(t('admin.login.resetPasswordSuccess'));
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.message
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked || !validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(form.email, form.password);

      // Reset attempts on successful login
      setLoginAttempts(0);
      
      // Store session if remember me is checked
      if (form.remember) {
        localStorage.setItem('rememberMe', 'true');
      }

      navigate(from);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle failed attempt
      if (error.code === 'auth/invalid-credential') {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setIsLocked(true);
          setLockTimer(LOCK_DURATION);
          console.warn('Account locked due to multiple failed attempts');
        }

        setErrors({
          general: t('admin.login.errors.invalidCredentials')
        });
      } else {
        setErrors({
          general: error.message
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatLockTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4">
      <div className="w-full max-w-md">
        {/* Logo and Home Link */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Creative Cactus"
            className="h-12 w-auto"
          />
          <Link
            to="/"
            className="mt-4 text-sm text-gray-500 hover:text-[#96C881] transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio principal
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 shadow-xl border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#96C881]" />
            {t('admin.login.title')}
          </h1>

          {isLocked && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p>{t('admin.login.accountLocked')}</p>
              </div>
              <p className="mt-2 text-red-400/80 text-sm">
                {t('admin.login.tryAgainIn')} {formatLockTimer(lockTimer)}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {t('admin.login.email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={isLocked || isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    ${form.email && !errors.email ? 'border-[#96C881]' : ''}
                    text-white placeholder-gray-500
                  `}
                  placeholder={t('admin.login.emailPlaceholder')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {form.email && !errors.email && (
                  <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-[#96C881]" />
                )}
              </div>
              {errors.email && (
                <p 
                  id="email-error" 
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {t('admin.login.password')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  disabled={isLocked || isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    ${form.password && !errors.password ? 'border-[#96C881]' : ''}
                    text-white placeholder-gray-500
                  `}
                  placeholder={t('admin.login.passwordPlaceholder')}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {form.password && !errors.password && (
                  <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-[#96C881]" />
                )}
              </div>
              {errors.password && (
                <p 
                  id="password-error" 
                  className="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleInputChange}
                  disabled={isLocked || isLoading}
                  className="
                    w-4 h-4 bg-[#242424] border-gray-700 rounded
                    focus:ring-[#96C881] focus:ring-offset-0
                    checked:bg-[#96C881] checked:border-[#96C881]
                    disabled:opacity-50
                  "
                />
                <span className="ml-2 text-sm text-gray-300">
                  {t('admin.login.rememberMe')}
                </span>
              </label>
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleResetPassword();
                }}
                className="text-sm text-[#96C881] hover:text-[#86b873] transition-colors"
              >
                {t('admin.login.forgotPassword')}
              </a>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || isLoading}
              className="
                w-full px-4 py-2 bg-[#96C881] text-white rounded-lg
                hover:bg-[#86b873] focus:outline-none focus:ring-2
                focus:ring-[#96C881] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center
              "
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                t('admin.login.signIn')
              )}
            </button>

            {/* Create Account Link */}
            <div className="mt-4 text-center">
              <Link
                to="/admin/register"
                className="text-[#96C881] hover:text-[#86b873] transition-colors"
              >
                {t('admin.login.createAccount')}
              </Link>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {t('admin.login.secureConnection')}
        </p>
      </div>
    </div>
  );
}
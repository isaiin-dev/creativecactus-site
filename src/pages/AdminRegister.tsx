import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { registerUser, UserRole } from '../lib/firebase';
import ReCAPTCHA from 'react-google-recaptcha';

interface RegistrationForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  department: string;
  phone: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  department?: string;
  phone?: string;
  captcha?: string;
  general?: string;
}

const INITIAL_FORM: RegistrationForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'viewer',
  department: '',
  phone: '',
};

const departments = [
  'marketing',
  'design',
  'development',
  'sales',
  'operations',
  'management',
] as const;

const roles: UserRole[] = ['viewer', 'editor', 'admin'];

export default function AdminRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = React.useState<RegistrationForm>(INITIAL_FORM);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = React.useState<number>(0);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return t('admin.login.register.passwordStrength.weak');
      case 2:
      case 3:
        return t('admin.login.register.passwordStrength.medium');
      case 4:
        return t('admin.login.register.passwordStrength.strong');
      case 5:
        return t('admin.login.register.passwordStrength.veryStrong');
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      case 5:
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.fullName) {
      newErrors.fullName = t('admin.login.register.errors.fullNameRequired');
    } else if (form.fullName.length < 2) {
      newErrors.fullName = t('admin.login.register.errors.fullNameLength');
    }

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

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = t('admin.login.register.errors.passwordMismatch');
    }

    if (!form.role) {
      newErrors.role = t('admin.login.register.errors.roleRequired');
    }

    if (!form.department) {
      newErrors.department = t('admin.login.register.errors.departmentRequired');
    }

    if (form.phone && !/^\+?[\d\s-]{10,}$/.test(form.phone)) {
      newErrors.phone = t('admin.login.register.errors.invalidPhone');
    }

    if (!captchaToken) {
      newErrors.captcha = t('admin.login.register.errors.captchaRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await registerUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department,
        phone: form.phone,
      });

      setIsSuccess(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setErrors({
          email: t('admin.login.register.errors.emailExists')
        });
      } else if (error.code === 'auth/too-many-requests') {
        setErrors({
          general: t('admin.login.register.errors.tooManyRequests')
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 shadow-xl border border-gray-800">
            <div className="mb-6">
              <CheckCircle2 className="h-16 w-16 text-[#96C881] mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {t('admin.login.register.success.title')}
            </h2>
            <p className="text-gray-300 mb-8">
              {t('admin.login.register.success.message')}
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="w-full px-4 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
            >
              {t('admin.login.register.success.returnToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="Creative Cactus"
            className="h-12 w-auto"
          />
        </div>

        {/* Registration Form */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 shadow-xl border border-gray-800">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back to login"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#96C881]" />
              {t('admin.login.register.title')}
            </h1>
          </div>

          <p className="text-gray-400 mb-8">
            {t('admin.login.register.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name Field */}
              <div>
                <label 
                  htmlFor="fullName" 
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  {t('admin.login.register.fullName')}
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.fullName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    text-white placeholder-gray-500
                  `}
                  placeholder={t('admin.login.register.fullNamePlaceholder')}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  {t('admin.login.register.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    text-white placeholder-gray-500
                  `}
                  placeholder={t('admin.login.register.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
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
                  {t('admin.login.register.password')}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    text-white placeholder-gray-500
                  `}
                  placeholder={t('admin.login.register.passwordPlaceholder')}
                />
                {form.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">
                        {getPasswordStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getPasswordStrengthColor(
                          passwordStrength
                        )}`}
                        style={{
                          width: `${(passwordStrength / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  {t('admin.login.register.confirmPassword')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    text-white placeholder-gray-500
                  `}
                  placeholder={t('admin.login.register.confirmPasswordPlaceholder')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label 
                  htmlFor="role" 
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  {t('admin.login.register.role')}
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.role 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    text-white
                  `}
                >
                  <option value="" disabled>
                    {t('admin.login.register.departmentPlaceholder')}
                  </option>
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {t(`admin.login.register.roles.${role}`)}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Department Selection */}
              <div>
                <label 
                  htmlFor="department" 
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  {t('admin.login.register.department')}
                </label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.department 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    text-white
                  `}
                >
                  <option value="" disabled>
                    {t('admin.login.register.departmentPlaceholder')}
                  </option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {t(`admin.login.register.departments.${dept}`)}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="md:col-span-2">
                <label 
                  htmlFor="phone" 
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  {t('admin.login.register.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2 bg-[#242424] border rounded-lg
                    focus:ring-2 focus:outline-none transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.phone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-[#96C881] focus:ring-[#96C881]/20'}
                    text-white placeholder-gray-500
                  `}
                  placeholder={t('admin.login.register.phonePlaceholder')}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={recaptchaSiteKey}
                theme="dark"
                onChange={(token) => {
                  setCaptchaToken(token);
                  if (errors.captcha) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.captcha;
                      return newErrors;
                    });
                  }
                }}
              />
            </div>
            {errors.captcha && (
              <p className="text-sm text-red-500 flex items-center gap-1 justify-center">
                <AlertCircle className="h-4 w-4" />
                {errors.captcha}
              </p>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                <p className="text-sm text-red-500 flex items-center gap- 1 justify-center">
                  <AlertCircle className="h-4 w-4" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
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
                t('admin.login.register.submit')
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <p className="mt-8 text-center text-sm text-gray-500">
          {t('admin.login.secureConnection')}
        </p>
      </div>
    </div>
  );
}
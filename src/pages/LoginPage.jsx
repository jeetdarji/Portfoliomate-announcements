import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .optional()
    .default(''),
})

const loginSchemaWithPassword = loginSchema.extend({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const navigate = useNavigate()
  const { signInWithEmail, signInWithGoogle, resetPassword } = useAuth()
  const session = useAuthStore((s) => s.session)

  // ALL hooks must be called before any early return
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues, trigger } = useForm({
    resolver: zodResolver(loginSchemaWithPassword),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  // Redirect if already logged in (AFTER all hooks)
  if (session) return <Navigate to="/app/announcements" replace />

  const onSubmit = async (data) => {
    try {
      await signInWithEmail(data.email, data.password)
      navigate('/app/announcements', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Sign in failed. Check your credentials.')
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    const isEmailValid = await trigger('email')
    if (!isEmailValid) return
    const email = getValues('email')
    setIsResetting(true)
    try {
      await resetPassword(email)
      setResetEmailSent(true)
      toast.success('Password reset email sent. Check your inbox.')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div className="hidden lg:flex w-[40%] min-h-screen bg-[#171727] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative shapes — absolutely positioned */}
        <div 
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"
          style={{ background: 'rgba(79,57,245,0.15)' }} 
        />
        <div 
          className="absolute bottom-24 right-16 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(49,46,129,0.25)' }} 
        />
        <div 
          className="absolute bottom-8 right-32 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.04)' }} 
        />

        {/* Top content */}
        <div className="flex flex-col gap-12 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E0E7FF] flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-[18px] text-[#312E81]">P</span>
            </div>
            <span className="font-display font-semibold text-[20px] text-white">Portfoliomate</span>
          </div>

          {/* Hero text */}
          <div>
            <h1 className="font-display font-bold text-[32px] leading-[40px] text-white max-w-[300px]">
              The operating system for modern private equity firms.
            </h1>
            <p className="font-display font-normal text-[14px] leading-[22px] text-white/60 max-w-[320px] mt-4">
              Trusted by leading VC firms and PE funds to manage deals, 
              stakeholders, and portfolio performance — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-4 mt-8">
            {[
              'Real-time announcements and deal flow across your organization',
              'LP and stakeholder relationship tracking in one place',
              'Portfolio performance dashboards with live data',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F39F5] mt-2 flex-shrink-0" />
                <span className="font-display font-medium text-[14px] leading-[22px] text-white/80">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <p className="font-sans font-normal text-[12px] text-white/30 relative z-10">
          © 2026 Portfoliomate. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#F9FAFB] min-h-screen px-6 py-12">
        {/* Form card with Framer Motion entry */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-[440px] bg-white rounded-[14px] p-10"
          style={{
            boxShadow: '0px 4px 24px rgba(0,0,0,0.08), 0px 1px 4px rgba(0,0,0,0.04)'
          }}
        >
          {/* Card header */}
          <div className="mb-8">
            {/* Mini logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-[8px] bg-[#E0E7FF] flex items-center justify-center">
                <span className="font-display font-bold text-[12px] text-[#312E81]">P</span>
              </div>
              <span className="font-display font-semibold text-[14px] text-[#312E81]">Portfoliomate</span>
            </div>

            <h2 className="font-display font-bold text-[28px] leading-[36px] text-[#171727] mt-6">
              {forgotPasswordMode ? 'Reset Password' : 'Welcome back'}
            </h2>
            <p className="font-display font-normal text-[14px] text-[#696975] mt-1">
              {forgotPasswordMode
                ? 'Enter your email and we\'ll send you a reset link'
                : 'Sign in to your Portfoliomate account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={forgotPasswordMode ? handleForgotSubmit : handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-5">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block font-display font-semibold text-[13px] text-[#62748E] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#90A1B9] pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@firm.com"
                    {...register('email')}
                    className={
                      'w-full h-[48px] pl-10 pr-4 bg-[#F8FAFB] border rounded-[10px] font-sans text-[14px] text-[#171727] placeholder:text-[#90A1B9] outline-none transition-all duration-150 ' +
                      (errors.email 
                        ? 'border-[#EF4444] focus:ring-[3px] focus:ring-[#EF4444]/10 '
                        : 'border-[#EBEAF2] focus:border-[#4F39F5] focus:ring-[3px] focus:ring-[#4F39F5]/10 ')
                    }
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mt-1 font-sans text-[12px] text-[#EF4444]"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password field — hidden in forgot password mode */}
              {!forgotPasswordMode && (
                <div>
                  <label htmlFor="password" className="block font-display font-semibold text-[13px] text-[#62748E] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#90A1B9] pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...register('password')}
                      className={
                        'w-full h-[48px] pl-10 pr-10 bg-[#F8FAFB] border rounded-[10px] font-sans text-[14px] text-[#171727] placeholder:text-[#90A1B9] outline-none transition-all duration-150 ' +
                        (errors.password 
                          ? 'border-[#EF4444] focus:ring-[3px] focus:ring-[#EF4444]/10 '
                          : 'border-[#EBEAF2] focus:border-[#4F39F5] focus:ring-[3px] focus:ring-[#4F39F5]/10 ')
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#90A1B9] hover:text-[#62748E] bg-transparent border-none cursor-pointer transition-colors p-0"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-1 font-sans text-[12px] text-[#EF4444]"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Forgot password / Back to sign in toggle */}
              <div className="flex justify-end -mt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setForgotPasswordMode(!forgotPasswordMode)
                    setResetEmailSent(false)
                  }}
                  className="font-sans font-medium text-[13px] text-[#4F39F5] hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  {forgotPasswordMode ? '← Back to Sign In' : 'Forgot password?'}
                </button>
              </div>

              {/* Reset email sent confirmation */}
              {resetEmailSent && forgotPasswordMode && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[10px] bg-green-50 border border-green-200 p-3 text-center"
                >
                  <p className="font-sans text-[13px] text-green-700">
                    Check your email for a password reset link.
                  </p>
                </motion.div>
              )}

              {/* Sign In / Send Reset button */}
              <button
                type="submit"
                disabled={isSubmitting || isResetting}
                className="w-full h-[48px] mt-2 bg-[#33337B] hover:bg-[#2D2D6B] disabled:opacity-60 disabled:cursor-not-allowed rounded-[10px] border-none cursor-pointer font-sans font-semibold text-[15px] text-white flex items-center justify-center transition-colors duration-150"
                style={{ boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}
              >
                {(isSubmitting || isResetting) ? <Spinner size="sm" color="white" /> : (forgotPasswordMode ? 'Send Reset Link' : 'Sign In')}
              </button>
            </div>
          </form>

          {/* Divider + Google — hidden in forgot password mode */}
          {!forgotPasswordMode && (
            <>
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-[#EBEAF2]" />
            <span className="font-sans font-normal text-[13px] text-[#90A1B9] flex-shrink-0">or</span>
            <div className="flex-1 h-px bg-[#EBEAF2]" />
          </div>

          {/* Google button */}
          <button
            type="button"
            aria-label="Continue with Google"
            className="w-full h-[48px] mt-4 bg-white border-[1.5px] border-[#E2E8F0] rounded-[10px] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] cursor-pointer transition-all duration-150 flex items-center justify-center gap-3"
            onClick={signInWithGoogle}
          >
            {/* Google SVG icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.63 4.63 0 01-2 3.04v2.52h3.22c1.88-1.73 2.98-4.28 2.98-7.35z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.22-2.52c-.9.6-2.04.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.07v2.6A9.99 9.99 0 0010 20z" fill="#34A853"/>
              <path d="M4.4 11.9A6.02 6.02 0 014.1 10c0-.66.11-1.3.3-1.9V5.5H1.07A9.99 9.99 0 000 10c0 1.61.38 3.13 1.07 4.5l3.33-2.6z" fill="#FBBC04"/>
              <path d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.86C14.96.9 12.7 0 10 0A9.99 9.99 0 001.07 5.5L4.4 8.1C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
            </svg>
            <span className="font-sans font-medium text-[14px] text-[#374151]">
              Continue with Google
            </span>
          </button>
            </>
          )}

          {/* Bottom text */}
          <p className="font-sans font-normal text-[13px] text-[#90A1B9] text-center mt-8">
            Don't have an account?{' '}
            <button 
              type="button"
              className="font-sans font-medium text-[13px] text-[#4F39F5] hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              Contact your admin
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
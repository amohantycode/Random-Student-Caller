'use client';

import { useState } from 'react';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/lib/auth';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) await signUpWithEmail(email, password);
      else await signInWithEmail(email, password);
    } catch (caught: unknown) {
      const firebaseError = caught as { code?: string; message?: string };
      const code = firebaseError.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') setError('That email and password do not match.');
      else if (code === 'auth/email-already-in-use') setError('An account already uses this email. Try signing in.');
      else if (code === 'auth/weak-password') setError('Use a password with at least 6 characters.');
      else if (code === 'auth/invalid-email') setError('Enter a valid email address.');
      else setError(firebaseError.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (caught: unknown) {
      const firebaseError = caught as { code?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        // Closing the sign-in window does not need an error message.
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        setError('Google sign-in is not available here. Use your email and password instead.');
      } else {
        setError('Google sign-in did not work. Try your email and password instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative flex min-h-[18rem] flex-col justify-between overflow-hidden bg-[var(--ink)] px-7 py-7 text-white sm:px-12 sm:py-10 lg:min-h-screen lg:px-[10vw] lg:py-12">
        <div className="relative z-10 text-lg font-semibold tracking-tight">Student Picker</div>

        <div className="relative z-10 max-w-md py-10 lg:py-0">
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl">Pick a student<br />at random.</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/68 sm:text-base sm:leading-7">
            Save your classes and student lists.
          </p>
        </div>

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full border-[72px] border-[#2f67d8]/45" aria-hidden="true" />
      </section>

      <section className="flex items-center justify-center px-7 py-12 sm:px-12 lg:py-16">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[var(--ink)]">{isSignUp ? 'Create account' : 'Sign in'}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Your classes are saved to your account.</p>

          {error && (
            <div role="alert" className="mt-6 border-l-2 border-[var(--red)] bg-[#fff7f5] px-4 py-3 text-sm text-[#9e3d3d]">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--ink)]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@school.org"
                className="w-full rounded-xl border border-[var(--line)] bg-[#fafaf8] px-4 py-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[#a4a7af] focus:border-[var(--blue)] focus:bg-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--ink)]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-[var(--line)] bg-[#fafaf8] px-4 py-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[#a4a7af] focus:border-[var(--blue)] focus:bg-white"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-full bg-[var(--blue)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--blue-dark)] disabled:cursor-not-allowed disabled:opacity-55">
              {loading ? 'One moment…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            {isSignUp ? 'Already have an account?' : 'New to Student Picker?'}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="font-semibold text-[var(--blue)] hover:underline">
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </p>

          <div className="my-7 flex items-center gap-3 text-xs text-[#9b9da4]">
            <span className="h-px flex-1 bg-[var(--line)]" />
            or
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <button onClick={handleGoogleSignIn} disabled={loading} className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[var(--line)] bg-white py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#fafaf8] disabled:cursor-not-allowed disabled:opacity-55">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>
      </section>
    </main>
  );
}

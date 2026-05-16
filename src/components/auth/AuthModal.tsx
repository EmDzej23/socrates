"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

type AuthMode = "signin" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const result = await signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (result.error) {
          setError(result.error.message || "Failed to sign up");
          return;
        }
      } else {
        const result = await signIn.email({
          email,
          password,
        });
        if (result.error) {
          setError(result.error.message || "Failed to sign in");
          return;
        }
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.href,
      });
    } catch (err) {
      setError("Failed to sign in with Google");
      console.error(err);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--ink)]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--parchment)] border-2 border-[var(--gold)] shadow-2xl">
        {/* Decorative header */}
        <div className="bg-[var(--parchment-dark)] px-6 py-4 border-b border-[var(--gold)]/30">
          <h2 className="text-2xl font-serif text-[var(--ink)] text-center">
            {mode === "signin" ? "Welcome, Seeker of Wisdom" : "Join Tarkos Agora"}
          </h2>
          <p className="text-sm text-[var(--ink-light)] text-center mt-1">
            {mode === "signin"
              ? "Return to continue your philosophical journey"
              : "Begin your dialogue with the ancient minds"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-[var(--terracotta)]/10 border border-[var(--terracotta)]/30 text-[var(--terracotta)] text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[var(--ink-light)]/30 hover:border-[var(--gold)] hover:bg-[var(--parchment-dark)] transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-serif text-[var(--ink)]">
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--ink-light)]/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--parchment)] text-[var(--ink-light)] font-serif">
                or with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-serif text-[var(--ink-light)] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="As you wish to be known"
                  className="w-full px-4 py-2 bg-[var(--parchment-dark)] border-2 border-[var(--ink-light)]/30 focus:border-[var(--gold)] outline-none transition-colors font-serif text-[var(--ink)]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-serif text-[var(--ink-light)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-[var(--parchment-dark)] border-2 border-[var(--ink-light)]/30 focus:border-[var(--gold)] outline-none transition-colors font-serif text-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-sm font-serif text-[var(--ink-light)] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-[var(--parchment-dark)] border-2 border-[var(--ink-light)]/30 focus:border-[var(--gold)] outline-none transition-colors font-serif text-[var(--ink)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[var(--olive)] hover:bg-[var(--olive)]/90 text-[var(--parchment)] font-serif text-lg transition-colors disabled:opacity-50"
            >
              {isLoading
                ? "Please wait..."
                : mode === "signin"
                  ? "Enter the Agora"
                  : "Begin Your Journey"}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center text-sm">
            {mode === "signin" ? (
              <p className="text-[var(--ink-light)]">
                New to Tarkos Agora?{" "}
                <button
                  onClick={() => switchMode("signup")}
                  className="text-[var(--terracotta)] hover:underline font-medium"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-[var(--ink-light)]">
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("signin")}
                  className="text-[var(--terracotta)] hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

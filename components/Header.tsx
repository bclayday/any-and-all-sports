'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { isGoogleAuthConfigured } from '@/lib/auth-config';

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">📺</span>
            <div>
              <span className="text-lg font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                Any & All Sports
              </span>
              <span className="hidden sm:block text-[10px] text-zinc-500 font-medium uppercase tracking-widest -mt-0.5">
                Daily TV & Streaming Schedule
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              Schedule
            </Link>
            <Link
              href="/preferences"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 transition-all"
            >
              My Sports
            </Link>
            <Link
              href="/parties"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-950/50 transition-all"
            >
              Parties
            </Link>
            <Link
              href="/archive"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              Archive
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              About
            </Link>

            {/* Auth Section */}
            <div className="ml-2 pl-2 border-l border-zinc-800">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
              ) : session?.user ? (
                <div className="flex items-center gap-2">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={`${session.user.name || 'User'} profile picture`}
                      className="w-8 h-8 rounded-full border border-zinc-700"
                      width={32}
                      height={32}
                    />
                  )}
                  <span className="hidden sm:block text-sm text-zinc-300 max-w-[100px] truncate">
                    {session.user.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                  >
                    Sign out
                  </button>
                </div>
              ) : isGoogleAuthConfigured() ? (
                <button
                  onClick={() => signIn('google')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in
                </button>
              ) : (
                <span className="px-3 py-1.5 text-sm text-zinc-500">
                  Sign-in coming soon
                </span>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

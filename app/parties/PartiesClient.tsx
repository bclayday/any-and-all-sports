'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { PartyWithCount } from '@/lib/parties';
import PartyCard from '@/components/parties/PartyCard';
import { isGoogleAuthConfigured } from '@/lib/auth-config';

interface PartiesResponse {
  parties: PartyWithCount[];
  date: string;
}

export default function PartiesClient({ initialDate }: { initialDate: string }) {
  const { data: session } = useSession();
  const [date, setDate] = useState(initialDate);
  const [parties, setParties] = useState<PartyWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parties?date=${date}`);
      const data: PartiesResponse = await res.json();
      setParties(data.parties);
    } catch (err) {
      console.error('Failed to load parties:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  const prevDate = () => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const nextDate = () => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const isToday = d.toDateString() === today.toDateString();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (isToday) return `Today, ${monthDay}`;
    if (isTomorrow) return `Tomorrow, ${monthDay}`;
    return `${dayName}, ${monthDay}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Viewing Parties</h1>
          <p className="text-zinc-500 text-sm">Watch the game with fellow fans</p>
        </div>
        {session && (
          <Link
            href="/parties/new"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all"
          >
            Host a Party
          </Link>
        )}
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={prevDate}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-semibold min-w-[200px] text-center">
          {formatDate(date)}
        </span>
        <button
          onClick={nextDate}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Parties grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
              <div className="h-5 bg-zinc-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-1/2 mb-4" />
              <div className="h-8 bg-zinc-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : parties.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parties.map(party => (
            <PartyCard key={party.id} party={party} onRsvpChange={fetchParties} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-xl font-bold text-white mb-2">No watch parties yet for {formatDate(date)}</h2>
          <p className="text-zinc-500 mb-6">Host the first one!</p>
          {session ? (
            <Link
              href="/parties/new"
              className="inline-block px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all"
            >
              Host the First One
            </Link>
          ) : isGoogleAuthConfigured() ? (
            <p className="text-zinc-600 text-sm">Sign in to create a party</p>
          ) : (
            <p className="text-zinc-600 text-sm">Check back soon for watch parties!</p>
          )}
        </div>
      )}
    </div>
  );
}

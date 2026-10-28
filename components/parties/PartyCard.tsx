'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import type { PartyWithCount } from '@/lib/parties';
import { SPORT_CONFIG } from '@/lib/sports-config';
import { isGoogleAuthConfigured } from '@/lib/auth-config';

interface PartyCardProps {
  party: PartyWithCount;
  onRsvpChange?: () => void;
}

export default function PartyCard({ party, onRsvpChange }: PartyCardProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [rsvped, setRsvped] = useState(false);

  const config = SPORT_CONFIG[party.sport] || { color: '#22c55e', bgColor: '#14532d', textColor: '#bbf7d0' };

  const handleRsvp = async () => {
    if (!session) {
      if (isGoogleAuthConfigured()) {
        signIn('google');
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/parties/${party.id}/rsvp`, { method: 'POST' });
      const data = await res.json();
      setRsvped(data.rsvped);
      onRsvpChange?.();
    } catch (err) {
      console.error('RSVP failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-all duration-200 hover:bg-zinc-800/80"
      style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
    >
      {/* Sponsor badge */}
      {party.sponsorName && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-orange-600/20 text-orange-400 border border-orange-600/30">
            {party.sponsorLogo && <span>{party.sponsorLogo}</span>}
            Hosted by {party.sponsorName}
          </span>
        </div>
      )}

      {/* League chip */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ backgroundColor: config.bgColor, color: config.textColor }}
        >
          {party.league}
        </span>
        {party.verified && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-600/20 text-blue-400 border border-blue-600/30">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
        <span className="text-[10px] text-zinc-500 font-medium">
          {party.gameTimeET}
        </span>
      </div>

      {/* Matchup */}
      <div className="mb-3">
        <p className="font-bold text-white text-sm leading-tight">
          {party.awayTeam} @ {party.homeTeam}
        </p>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-1 mb-2 text-zinc-400 text-xs">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{party.venueName}, {party.venueCity}</span>
      </div>

      {/* Host and description */}
      <p className="text-[11px] text-zinc-500 mb-1">
        Hosted by {party.hostName}
      </p>
      {party.description && (
        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
          {party.description}
        </p>
      )}

      {/* Footer: Attendees + RSVP */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
        <div className="flex items-center gap-1 text-zinc-400 text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>
            {party.attendeeCount} going
            {party.maxAttendees && ` / ${party.maxAttendees} max`}
          </span>
        </div>

        {session ? (
          <button
            onClick={handleRsvp}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rsvped
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            } disabled:opacity-50`}
          >
            {loading ? '...' : rsvped ? "You're going" : 'RSVP'}
          </button>
        ) : isGoogleAuthConfigured() ? (
          <button
            onClick={() => signIn('google')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all"
          >
            Sign in to RSVP
          </button>
        ) : (
          <span className="px-3 py-1.5 text-xs text-zinc-500">
            Sign-in coming soon
          </span>
        )}
      </div>
    </div>
  );
}

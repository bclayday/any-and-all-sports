import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPartyStore, getTodayET } from '@/lib/parties';

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getTodayET();

  const store = getPartyStore();
  const parties = await store.getPartiesByDate(date);

  const sortedParties = parties
    .filter(p => !p.demo)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return NextResponse.json({ parties: sortedParties, date });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email || !session?.user?.name) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  let body: {
    gameDate?: string;
    gameTimeET?: string;
    homeTeam?: string;
    awayTeam?: string;
    league?: string;
    sport?: string;
    venueName?: string;
    venueCity?: string;
    startTime?: string;
    description?: string;
    maxAttendees?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { gameDate, gameTimeET, homeTeam, awayTeam, league, sport, venueName, venueCity, startTime, description, maxAttendees } = body;

  if (!gameDate || !gameTimeET || !homeTeam || !awayTeam || !league || !sport || !venueName || !venueCity || !startTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const store = getPartyStore();
  const party = await store.createParty({
    gameDate: stripHtml(gameDate),
    gameTimeET: stripHtml(gameTimeET),
    homeTeam: stripHtml(homeTeam),
    awayTeam: stripHtml(awayTeam),
    league: stripHtml(league),
    sport: sport as import('@/lib/types').SportCategory,
    venueName: stripHtml(venueName),
    venueCity: stripHtml(venueCity),
    hostName: session.user.name,
    hostEmail: session.user.email,
    hostUserId: session.user.id,
    startTime,
    description: description ? stripHtml(description) : undefined,
    maxAttendees: maxAttendees ? Math.min(Math.max(1, maxAttendees), 500) : undefined,
  });

  return NextResponse.json({ party }, { status: 201 });
}

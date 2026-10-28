#!/usr/bin/env node
/**
 * scripts/fetch-parties.mjs
 * Fetches real Atlanta-area sports watch parties from Eventbrite and Meetup APIs,
 * normalizes them to the Party type, and writes to data/parties.json.
 *
 * Usage:
 *   node scripts/fetch-parties.mjs
 *   npm run fetch:parties
 *
 * Environment variables:
 *   EVENTBRITE_API_KEY - Eventbrite private token (optional, skips if missing)
 *   MEETUP_API_KEY - Meetup API key (optional, skips if missing)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PARTIES_FILE = join(ROOT, 'data', 'parties.json');

const ATLANTA_LAT = 33.7490;
const ATLANTA_LNG = -84.3880;
const RADIUS_MI = 25;

function log(msg) {
  console.log(`[fetch-parties] ${msg}`);
}

function warn(msg) {
  console.warn(`[fetch-parties] WARN: ${msg}`);
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getTodayET() {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

function formatTimeET(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  }) + ' ET';
}

function inferSportFromTitle(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('nfl') || text.includes('football') || text.includes('super bowl')) return { sport: 'NFL', league: 'NFL' };
  if (text.includes('nba') || text.includes('basketball') || text.includes('hawks')) return { sport: 'NBA', league: 'NBA' };
  if (text.includes('mlb') || text.includes('baseball') || text.includes('braves')) return { sport: 'MLB', league: 'MLB' };
  if (text.includes('nhl') || text.includes('hockey')) return { sport: 'NHL', league: 'NHL' };
  if (text.includes('soccer') || text.includes('futbol') || text.includes('premier league') || text.includes('mls') || text.includes('world cup') || text.includes('atlanta united')) return { sport: 'Soccer', league: 'Soccer' };
  if (text.includes('ufc') || text.includes('mma') || text.includes('fight')) return { sport: 'MMA/UFC', league: 'UFC' };
  if (text.includes('f1') || text.includes('formula') || text.includes('nascar') || text.includes('racing')) return { sport: 'F1', league: 'F1' };
  if (text.includes('golf') || text.includes('masters') || text.includes('pga')) return { sport: 'Golf', league: 'PGA' };
  return { sport: 'Sports', league: 'Sports' };
}

async function fetchEventbrite() {
  const apiKey = process.env.EVENTBRITE_API_KEY;
  if (!apiKey) {
    warn('EVENTBRITE_API_KEY not set, skipping Eventbrite');
    return [];
  }

  const parties = [];
  const today = getTodayET();

  try {
    const searchQueries = ['watch party', 'sports watch party', 'game day'];

    for (const query of searchQueries) {
      const url = new URL('https://www.eventbriteapi.com/v3/events/search/');
      url.searchParams.set('q', query);
      url.searchParams.set('location.latitude', ATLANTA_LAT.toString());
      url.searchParams.set('location.longitude', ATLANTA_LNG.toString());
      url.searchParams.set('location.within', `${RADIUS_MI}mi`);
      url.searchParams.set('categories', '103'); // Sports & Fitness category
      url.searchParams.set('start_date.keyword', 'this_week');
      url.searchParams.set('expand', 'venue,organizer');

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!res.ok) {
        warn(`Eventbrite API error: ${res.status} ${res.statusText}`);
        continue;
      }

      const data = await res.json();
      const events = data.events || [];

      for (const event of events) {
        if (!event.start?.utc || !event.venue) continue;

        const startDate = new Date(event.start.utc);
        const gameDate = startDate.toISOString().split('T')[0];

        if (gameDate < today) continue;

        const { sport, league } = inferSportFromTitle(event.name?.text || '', event.description?.text || '');

        parties.push({
          id: generateId(),
          gameDate,
          gameTimeET: formatTimeET(event.start.utc),
          homeTeam: 'TBD',
          awayTeam: 'TBD',
          league,
          sport,
          venueName: event.venue?.name || 'Unknown Venue',
          venueCity: event.venue?.address?.city || 'Atlanta',
          hostName: event.organizer?.name || 'Event Organizer',
          hostEmail: '',
          hostUserId: `eventbrite-${event.organizer?.id || 'unknown'}`,
          startTime: event.start.utc,
          description: (event.name?.text || '').slice(0, 200),
          maxAttendees: event.capacity || undefined,
          createdAt: new Date().toISOString(),
          source: 'eventbrite',
          verified: true,
          externalId: event.id,
          externalUrl: event.url,
        });
      }
    }

    log(`Fetched ${parties.length} events from Eventbrite`);
  } catch (err) {
    warn(`Eventbrite fetch failed: ${err.message}`);
  }

  return parties;
}

async function fetchMeetup() {
  const apiKey = process.env.MEETUP_API_KEY;
  if (!apiKey) {
    warn('MEETUP_API_KEY not set, skipping Meetup');
    return [];
  }

  const parties = [];
  const today = getTodayET();

  try {
    const searchQueries = ['watch party', 'watch party sports', 'game watch', 'sports bar'];

    for (const query of searchQueries) {
      const url = new URL('https://api.meetup.com/find/upcoming_events');
      url.searchParams.set('text', query);
      url.searchParams.set('lat', ATLANTA_LAT.toString());
      url.searchParams.set('lon', ATLANTA_LNG.toString());
      url.searchParams.set('radius', RADIUS_MI.toString());
      url.searchParams.set('fields', 'group_photo,event_hosts');

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!res.ok) {
        warn(`Meetup API error: ${res.status} ${res.statusText}`);
        continue;
      }

      const data = await res.json();
      const events = data.events || [];

      for (const event of events) {
        if (!event.time || !event.venue) continue;

        const startDate = new Date(event.time);
        const gameDate = startDate.toISOString().split('T')[0];

        if (gameDate < today) continue;

        const { sport, league } = inferSportFromTitle(event.name || '', event.description || '');

        parties.push({
          id: generateId(),
          gameDate,
          gameTimeET: formatTimeET(startDate.toISOString()),
          homeTeam: 'TBD',
          awayTeam: 'TBD',
          league,
          sport,
          venueName: event.venue?.name || 'Unknown Venue',
          venueCity: event.venue?.city || 'Atlanta',
          hostName: event.group?.name || 'Meetup Group',
          hostEmail: '',
          hostUserId: `meetup-${event.group?.id || 'unknown'}`,
          startTime: startDate.toISOString(),
          description: (event.name || '').slice(0, 200),
          maxAttendees: event.rsvp_limit || undefined,
          createdAt: new Date().toISOString(),
          source: 'meetup',
          verified: true,
          externalId: event.id,
          externalUrl: event.link,
        });
      }
    }

    log(`Fetched ${parties.length} events from Meetup`);
  } catch (err) {
    warn(`Meetup fetch failed: ${err.message}`);
  }

  return parties;
}

function readExistingParties() {
  try {
    if (!existsSync(PARTIES_FILE)) return [];
    const raw = readFileSync(PARTIES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return data.parties || [];
  } catch {
    return [];
  }
}

function mergeParties(existing, scraped) {
  const userParties = existing.filter(p => p.source === 'user' || (!p.source && !p.demo));

  const seenExternal = new Set();
  const dedupedScraped = scraped.filter(p => {
    const key = `${p.source}-${p.externalId}`;
    if (seenExternal.has(key)) return false;
    seenExternal.add(key);
    return true;
  });

  return [...userParties, ...dedupedScraped];
}

async function main() {
  log('Starting party fetch...');

  const [eventbriteParties, meetupParties] = await Promise.all([
    fetchEventbrite(),
    fetchMeetup(),
  ]);

  const allScraped = [...eventbriteParties, ...meetupParties];
  log(`Total scraped: ${allScraped.length} events`);

  const existing = readExistingParties();
  log(`Existing parties: ${existing.length}`);

  const merged = mergeParties(existing, allScraped);
  log(`After merge: ${merged.length} parties`);

  writeFileSync(PARTIES_FILE, JSON.stringify({ parties: merged }, null, 2));
  log(`Wrote ${merged.length} parties to ${PARTIES_FILE}`);

  log('Done!');
}

main().catch(err => {
  console.error('[fetch-parties] Fatal error:', err);
  process.exit(1);
});

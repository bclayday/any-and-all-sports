import type { SportCategory } from '../types';

export interface Party {
  id: string;
  gameDate: string; // YYYY-MM-DD
  gameTimeET: string; // e.g. "7:30 PM ET"
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: SportCategory;
  venueName: string;
  venueCity: string;
  hostName: string;
  hostEmail: string;
  hostUserId: string;
  startTime: string; // ISO 8601
  description?: string;
  sponsorName?: string;
  sponsorLogo?: string;
  maxAttendees?: number;
  createdAt: string; // ISO 8601
  demo?: boolean;
  source?: 'eventbrite' | 'meetup' | 'user';
  verified?: boolean;
  externalId?: string;
  externalUrl?: string;
}

export interface PartyWithCount extends Party {
  attendeeCount: number;
}

export interface Rsvp {
  id: string;
  partyId: string;
  userId: string;
  name: string;
  createdAt: string; // ISO 8601
}

export interface SponsorLead {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  sports: string[];
  budget: string;
  message?: string;
  createdAt: string;
}

export interface PartyStore {
  getPartiesByDate(date: string): Promise<PartyWithCount[]>;
  createParty(party: Omit<Party, 'id' | 'createdAt'>): Promise<Party>;
  getRsvps(partyId: string): Promise<Rsvp[]>;
  getUserRsvp(partyId: string, userId: string): Promise<Rsvp | null>;
  createRsvp(partyId: string, userId: string, name: string): Promise<Rsvp>;
  deleteRsvp(partyId: string, userId: string): Promise<void>;
  createSponsorLead(lead: Omit<SponsorLead, 'id' | 'createdAt'>): Promise<SponsorLead>;
}

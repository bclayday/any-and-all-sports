import fs from 'fs';
import path from 'path';
import { Party, PartyWithCount, Rsvp, SponsorLead, PartyStore } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PARTIES_FILE = path.join(DATA_DIR, 'parties.json');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');
const SPONSOR_LEADS_FILE = path.join(DATA_DIR, 'sponsor_leads.json');

interface PartiesData {
  parties: Party[];
}

interface RsvpsData {
  rsvps: Rsvp[];
}

interface SponsorLeadsData {
  leads: SponsorLead[];
}

function readParties(): Party[] {
  try {
    if (!fs.existsSync(PARTIES_FILE)) return [];
    const raw = fs.readFileSync(PARTIES_FILE, 'utf-8');
    const data: PartiesData = JSON.parse(raw);
    return data.parties || [];
  } catch {
    return [];
  }
}

function writeParties(parties: Party[]): void {
  const data: PartiesData = { parties };
  fs.writeFileSync(PARTIES_FILE, JSON.stringify(data, null, 2));
}

function readRsvps(): Rsvp[] {
  try {
    if (!fs.existsSync(RSVPS_FILE)) return [];
    const raw = fs.readFileSync(RSVPS_FILE, 'utf-8');
    const data: RsvpsData = JSON.parse(raw);
    return data.rsvps || [];
  } catch {
    return [];
  }
}

function writeRsvps(rsvps: Rsvp[]): void {
  const data: RsvpsData = { rsvps };
  fs.writeFileSync(RSVPS_FILE, JSON.stringify(data, null, 2));
}

function readSponsorLeads(): SponsorLead[] {
  try {
    if (!fs.existsSync(SPONSOR_LEADS_FILE)) return [];
    const raw = fs.readFileSync(SPONSOR_LEADS_FILE, 'utf-8');
    const data: SponsorLeadsData = JSON.parse(raw);
    return data.leads || [];
  } catch {
    return [];
  }
}

function writeSponsorLeads(leads: SponsorLead[]): void {
  const data: SponsorLeadsData = { leads };
  fs.writeFileSync(SPONSOR_LEADS_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class LocalJsonStore implements PartyStore {
  async getPartiesByDate(date: string): Promise<PartyWithCount[]> {
    const parties = readParties();
    const rsvps = readRsvps();

    return parties
      .filter(p => p.gameDate === date)
      .map(party => ({
        ...party,
        attendeeCount: rsvps.filter(r => r.partyId === party.id).length,
      }));
  }

  async createParty(partyData: Omit<Party, 'id' | 'createdAt'>): Promise<Party> {
    const parties = readParties();
    const party: Party = {
      ...partyData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      source: partyData.source || 'user',
    };
    parties.push(party);
    writeParties(parties);
    return party;
  }

  async getRsvps(partyId: string): Promise<Rsvp[]> {
    const rsvps = readRsvps();
    return rsvps.filter(r => r.partyId === partyId);
  }

  async getUserRsvp(partyId: string, userId: string): Promise<Rsvp | null> {
    const rsvps = readRsvps();
    return rsvps.find(r => r.partyId === partyId && r.userId === userId) || null;
  }

  async createRsvp(partyId: string, userId: string, name: string): Promise<Rsvp> {
    const rsvps = readRsvps();
    const rsvp: Rsvp = {
      id: generateId(),
      partyId,
      userId,
      name,
      createdAt: new Date().toISOString(),
    };
    rsvps.push(rsvp);
    writeRsvps(rsvps);
    return rsvp;
  }

  async deleteRsvp(partyId: string, userId: string): Promise<void> {
    const rsvps = readRsvps();
    const filtered = rsvps.filter(r => !(r.partyId === partyId && r.userId === userId));
    writeRsvps(filtered);
  }

  async createSponsorLead(leadData: Omit<SponsorLead, 'id' | 'createdAt'>): Promise<SponsorLead> {
    const leads = readSponsorLeads();
    const lead: SponsorLead = {
      ...leadData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    leads.push(lead);
    writeSponsorLeads(leads);
    return lead;
  }
}

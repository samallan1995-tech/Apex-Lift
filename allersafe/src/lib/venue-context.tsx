'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Venue } from '@/types';

interface VenueContextValue {
  activeVenueId: string | null;
  venues: Venue[];
  setActiveVenueId: (id: string) => void;
  addVenue: (v: Venue) => void;
}

const VenueContext = createContext<VenueContextValue | null>(null);

const VENUE_KEY = 'allersafe_venue';

export function VenueProvider({
  children,
  initialVenues,
}: {
  children: ReactNode;
  initialVenues: Venue[];
}) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [activeVenueId, setActiveVenueIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(VENUE_KEY);
    if (stored && initialVenues.some(v => v.id === stored)) {
      setActiveVenueIdState(stored);
    } else if (initialVenues.length > 0) {
      setActiveVenueIdState(initialVenues[0].id);
    }
  }, [initialVenues]);

  function setActiveVenueId(id: string) {
    setActiveVenueIdState(id);
    localStorage.setItem(VENUE_KEY, id);
  }

  function addVenue(venue: Venue) {
    setVenues(prev => [...prev, venue]);
    setActiveVenueId(venue.id);
  }

  return (
    <VenueContext.Provider value={{ activeVenueId, venues, setActiveVenueId, addVenue }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  const ctx = useContext(VenueContext);
  if (!ctx) throw new Error('useVenue must be used inside VenueProvider');
  return ctx;
}

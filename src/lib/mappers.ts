import { Event } from '../types';

export function eventMapper(
  potentialEvent: unknown,
): Event | null {
  const event = potentialEvent as Partial<Event> | null;

  if (!event || !event.id || !event.title || !event.slug || !event.creatorid) {
    return null;
  }

  const mapped: Event = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description ?? undefined,
    creatorid: event.creatorid,
  };

  return mapped;
}


import { z } from 'zod';

export const eventTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(), // in minutes
  color: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export type EventTemplate = z.infer<typeof eventTemplateSchema>;

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'roman-reher',
    title: 'Roman Reher',
    duration: 25,
    color: 'bg-amber-50',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'jack-mallers',
    title: 'Jack Mallers',
    duration: 25,
    color: 'bg-amber-100',
    description: 'Speaker session',
    icon: 'users'
  },
  {
    id: 'lecture',
    title: 'Lecture',
    duration: 25,
    color: 'bg-blue-100',
    description: 'Standard lecture session',
    icon: 'book-open'
  },
  {
    id: 'workshop',
    title: 'Workshop',
    duration: 25,
    color: 'bg-green-100',
    description: 'Interactive workshop session',
    icon: 'wrench'
  },
  {
    id: 'break',
    title: 'Break',
    duration: 25,
    color: 'bg-orange-100',
    description: 'Break or rest period',
    icon: 'coffee'
  },
  {
    id: 'meeting',
    title: 'Meeting',
    duration: 25,
    color: 'bg-purple-100',
    description: 'Team meeting or discussion',
    icon: 'users'
  }
];

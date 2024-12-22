
import { z } from 'zod';

export const eventTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),
  color: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export type EventTemplate = z.infer<typeof eventTemplateSchema>;

// Load templates from localStorage or use defaults
const storedTemplates = localStorage.getItem('eventTemplates');
const defaultTemplates = [
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
    id: 'speaker',
    title: 'Speaker',
    duration: 25,
    color: 'bg-yellow-100',
    description: 'Guest speaker session',
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

export let EVENT_TEMPLATES: EventTemplate[] = storedTemplates ? JSON.parse(storedTemplates) : defaultTemplates;

// Function to save templates
export const saveEventTemplates = () => {
  localStorage.setItem('eventTemplates', JSON.stringify(EVENT_TEMPLATES));
};

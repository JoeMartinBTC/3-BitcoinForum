
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

const defaultTemplates = [
  {
    id: '1',
    title: 'Meeting',
    duration: 25,
    color: 'bg-blue-100',
    description: 'Standard meeting',
    icon: 'users'
  },
  {
    id: '2',
    title: 'Break',
    duration: 15,
    color: 'bg-gray-100',
    description: 'Short break',
    icon: 'coffee'
  },
  {
    id: '3',
    title: 'Workshop',
    duration: 45,
    color: 'bg-green-100',
    description: 'Interactive workshop',
    icon: 'wrench'
  },
  {
    id: '4',
    title: 'Presentation',
    duration: 30,
    color: 'bg-yellow-100',
    description: 'Presentation session',
    icon: 'book-open'
  }
];

// Load templates from localStorage or use defaults
const storedTemplates = localStorage.getItem('eventTemplates');
export const EVENT_TEMPLATES: EventTemplate[] = storedTemplates 
  ? JSON.parse(storedTemplates) 
  : defaultTemplates;

// Save default templates if none exist
if (!storedTemplates) {
  localStorage.setItem('eventTemplates', JSON.stringify(defaultTemplates));
}

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
    id: 'green',
    title: 'Green',
    duration: 25,
    color: 'bg-green-100',
    description: 'Green session',
    icon: 'users'
  },
  {
    id: 'yellow',
    title: 'Yellow',
    duration: 25,
    color: 'bg-yellow-100',
    description: 'Yellow session',
    icon: 'users'
  },
  {
    id: 'break',
    title: 'Break',
    duration: 25,
    color: 'bg-orange-100',
    description: 'Break or rest period',
    icon: 'coffee'
  }
];

export let EVENT_TEMPLATES: EventTemplate[] = storedTemplates ? JSON.parse(storedTemplates) : defaultTemplates;

// Function to save templates
export const saveEventTemplates = () => {
  localStorage.setItem('eventTemplates', JSON.stringify(EVENT_TEMPLATES));
  if (EVENT_TEMPLATES.length === 0) {
    EVENT_TEMPLATES = defaultTemplates;
    localStorage.setItem('eventTemplates', JSON.stringify(defaultTemplates));
  }
};
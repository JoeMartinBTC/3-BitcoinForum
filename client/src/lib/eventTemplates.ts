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

export const exportEventTemplates = () => {
  const templates = localStorage.getItem('eventTemplates') || JSON.stringify(defaultTemplates);
  const blob = new Blob([templates], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'event-templates.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importEventTemplates = async (file: File) => {
  try {
    const text = await file.text();
    const templates = JSON.parse(text);
    
    // Validate the imported data structure
    if (!Array.isArray(templates)) {
      throw new Error('Invalid template format: must be an array');
    }
    
    for (const template of templates) {
      if (!eventTemplateSchema.safeParse(template).success) {
        throw new Error('Invalid template data structure');
      }
    }
    
    EVENT_TEMPLATES = templates;
    localStorage.setItem('eventTemplates', JSON.stringify(templates));
    return true;
  } catch (error) {
    console.error('Failed to import templates:', error);
    return false;
  }
};